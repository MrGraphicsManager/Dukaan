from pathlib import Path

ROOT = Path('.')
server = ROOT/'backend/server.py'
s = server.read_text()
MARK = '# === DUKAAN_RAZORPAY_RENEWAL_V1 ==='
if MARK not in s:
    s = s.replace('import secrets as pysecrets\n','import secrets as pysecrets\nimport hashlib\nimport hmac\n')
    s = s.replace('FRONTEND_URL_ENV = os.environ.get("FRONTEND_URL", "").rstrip("/")\n','FRONTEND_URL_ENV = os.environ.get("FRONTEND_URL", "").rstrip("/")\nRAZORPAY_KEY_ID = os.environ.get("RAZORPAY_KEY_ID", "").strip()\nRAZORPAY_KEY_SECRET = os.environ.get("RAZORPAY_KEY_SECRET", "").strip()\nRAZORPAY_WEBHOOK_SECRET = os.environ.get("RAZORPAY_WEBHOOK_SECRET", "").strip()\nSUBSCRIPTION_CRON_SECRET = os.environ.get("SUBSCRIPTION_CRON_SECRET", "").strip()\n')
    insert_at = s.index('\n\nPLANS = {')
    s = s[:insert_at] + '''\n\nclass RazorpayOrderIn(BaseModel):\n    plan: Literal["starter","business","premium"]\n    renew: bool = False\n\nclass RazorpayVerifyIn(BaseModel):\n    razorpay_order_id: str\n    razorpay_payment_id: str\n    razorpay_signature: str\n''' + s[insert_at:]
    block = r'''# === DUKAAN_RAZORPAY_RENEWAL_V1 ===
async def _rzp_call(method, url, **kwargs):
    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        raise HTTPException(503, "Razorpay is not configured yet")
    async with httpx.AsyncClient(timeout=20) as c:
        r = await c.request(method, url, auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET), **kwargs)
    try: payload = r.json()
    except Exception: payload = {"raw": r.text}
    if r.status_code >= 400: raise HTTPException(502, "Razorpay request failed")
    return payload

def _iso_dt(v):
    if not v: return None
    try:
        d = datetime.fromisoformat(str(v).replace('Z','+00:00'))
        return d if d.tzinfo else d.replace(tzinfo=timezone.utc)
    except Exception: return None

@api.post("/subscriptions/razorpay/order")
async def razorpay_order(body:RazorpayOrderIn,user:dict=Depends(get_current_user)):
    active = await _active_sub(user['id']); now = datetime.now(timezone.utc)
    if body.renew and active:
        existing = await db.subscriptions.find_one({"user_id":user['id'],"status":"scheduled","starts_at":{"$gt":now.isoformat()}})
        if existing: raise HTTPException(400,"A renewal is already scheduled")
        starts = (_iso_dt(active.get('expires_at')) or now) + timedelta(seconds=1)
    else: starts = now
    plan = PLANS[body.plan]
    order = await _rzp_call('POST','https://api.razorpay.com/v1/orders',json={"amount":int(plan['monthly']*100),"currency":"INR","receipt":f"dukaan-{user['id'][-8:]}-{int(now.timestamp())}"[:40]})
    await db.subscriptions.insert_one({"user_id":user['id'],"user_email":user['email'],"plan":body.plan,"plan_name":plan['name'],"amount":plan['monthly'],"status":"pending","payment_method":"razorpay","renewal":bool(body.renew and active),"razorpay_order_id":order['id'],"razorpay_payment_id":None,"activated_at":None,"starts_at":starts.isoformat(),"expires_at":(starts+timedelta(days=30)).isoformat(),"created_at":now_iso()})
    return {"key_id":RAZORPAY_KEY_ID,"order_id":order['id'],"amount":order['amount'],"currency":"INR","plan":body.plan,"renew":bool(body.renew and active)}

@api.post("/subscriptions/razorpay/verify")
async def razorpay_verify(body:RazorpayVerifyIn,user:dict=Depends(get_current_user)):
    sub = await db.subscriptions.find_one({"user_id":user['id'],"razorpay_order_id":body.razorpay_order_id,"status":"pending","payment_method":"razorpay"})
    if not sub: raise HTTPException(404,"Payment order not found or already processed")
    expected = hmac.new(RAZORPAY_KEY_SECRET.encode(),f"{body.razorpay_order_id}|{body.razorpay_payment_id}".encode(),hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected,body.razorpay_signature): raise HTTPException(400,"Payment signature verification failed")
    payment = await _rzp_call('GET',f"https://api.razorpay.com/v1/payments/{body.razorpay_payment_id}")
    if payment.get('order_id')!=sub['razorpay_order_id'] or int(payment.get('amount',0))!=int(sub['amount']*100) or payment.get('currency')!='INR': raise HTTPException(400,'Payment mismatch')
    if payment.get('status') not in ('captured','authorized'): raise HTTPException(400,f"Payment status is {payment.get('status','unknown')}")
    now = datetime.now(timezone.utc); starts = _iso_dt(sub.get('starts_at')) or now; scheduled = starts > now + timedelta(seconds=1)
    if not scheduled:
        await db.subscriptions.update_many({"user_id":user['id'],"status":"active"},{"$set":{"status":"superseded","superseded_at":now.isoformat()}}); starts = now
    status='scheduled' if scheduled else 'active'; expires=starts+timedelta(days=30)
    await db.subscriptions.update_one({"_id":sub['_id']},{"$set":{"status":status,"activated_at":None if scheduled else now.isoformat(),"starts_at":starts.isoformat(),"expires_at":expires.isoformat(),"razorpay_payment_id":body.razorpay_payment_id,"verified_at":now.isoformat()}})
    return {"ok":True,"status":status,"starts_at":starts.isoformat(),"expires_at":expires.isoformat()}

@api.post("/internal/subscription-maintenance")
async def subscription_maintenance(request:Request):
    if not SUBSCRIPTION_CRON_SECRET or request.headers.get('X-Cron-Secret')!=SUBSCRIPTION_CRON_SECRET: raise HTTPException(403,'Forbidden')
    now=datetime.now(timezone.utc); activated=0; reminded=0
    queued=await db.subscriptions.find({"status":"scheduled","starts_at":{"$lte":now.isoformat()}}).to_list(200)
    for sub in queued:
        await db.subscriptions.update_many({"user_id":sub['user_id'],"status":"active"},{"$set":{"status":"expired","expired_at":now.isoformat()}})
        await db.subscriptions.update_one({"_id":sub['_id'],"status":"scheduled"},{"$set":{"status":"active","activated_at":now.isoformat()}}); activated+=1
    cutoff=(now+timedelta(days=5)).isoformat()
    due=await db.subscriptions.find({"status":"active","expires_at":{"$gt":now.isoformat(),"$lte":cutoff},"renewal_reminder_5_sent":{"$ne":True}}).to_list(500)
    for sub in due:
        if sub.get('user_email'):
            link=f"{FRONTEND_URL_ENV or 'https://officialdukaan.in'}/subscribe?plan={sub.get('plan','business')}&renew=1"
            await send_email(to=sub['user_email'],subject='Dukaan: subscription expires in 5 days',html=f'<p>Your <b>{escape(sub.get("plan_name","Dukaan"))}</b> subscription expires in 5 days.</p><p><a href="{escape(link)}">Renew Subscription</a></p>')
        await db.subscriptions.update_one({"_id":sub['_id']},{"$set":{"renewal_reminder_5_sent":True,"renewal_reminder_sent_at":now.isoformat()}}); reminded+=1
    return {"ok":True,"renewals_activated":activated,"reminders_sent":reminded}

@api.post("/webhooks/razorpay")
async def razorpay_webhook(request:Request):
    if not RAZORPAY_WEBHOOK_SECRET: raise HTTPException(503,'Webhook secret not configured')
    raw=await request.body(); sig=request.headers.get('X-Razorpay-Signature',''); expected=hmac.new(RAZORPAY_WEBHOOK_SECRET.encode(),raw,hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected,sig): raise HTTPException(400,'Invalid webhook signature')
    return {"ok":True}

'''
    anchor = '# =========================================================\n# SHOPS'
    if anchor not in s: raise SystemExit('SHOPS anchor not found')
    s = s.replace(anchor, block + anchor, 1)
    server.write_text(s)

rz=ROOT/'frontend/src/lib/razorpay.js';rz.parent.mkdir(parents=True,exist_ok=True);rz.write_text('''let p=null;export function loadRazorpay(){if(window.Razorpay)return Promise.resolve(true);if(p)return p;p=new Promise((resolve,reject)=>{const src="https://checkout.razorpay.com/v1/checkout.js";const e=document.querySelector(`script[src="${src}"]`);if(e){e.onload=()=>resolve(true);e.onerror=()=>reject(new Error("Razorpay checkout failed"));return;}const s=document.createElement("script");s.src=src;s.async=true;s.onload=()=>resolve(true);s.onerror=()=>reject(new Error("Unable to load Razorpay"));document.body.appendChild(s)});return p}\n''')

banner=ROOT/'frontend/src/components/RenewalBanner.jsx';banner.write_text('''import{useEffect,useState}from"react";import{Link}from"react-router-dom";import{api}from"@/lib/api";export default function RenewalBanner(){const[s,setS]=useState(null);useEffect(()=>{api.get("/auth/me").then(r=>setS(r.data.subscription||null)).catch(()=>{})},[]);if(!s?.expires_at)return null;const d=Math.ceil((new Date(s.expires_at)-Date.now())/86400000);if(d<0||d>5)return null;return <div className="mb-5 rounded-xl border border-brand-terracotta/30 bg-brand-terracotta/10 px-4 py-3 flex flex-wrap items-center justify-between gap-3"><div><b>Your {s.plan_name||s.plan} plan expires in {Math.max(0,d)} days.</b><div className="text-xs opacity-70">Renew early and the new plan starts after the current one ends.</div></div><Link to={`/subscribe?plan=${s.plan}&renew=1`} className="rounded-lg bg-brand-terracotta px-4 py-2 text-sm font-semibold text-white">Renew Subscription →</Link></div>}\n''')

a=ROOT/'frontend/src/pages/Dashboard.jsx';x=a.read_text();
if 'RenewalBanner' not in x:
    x=x.replace('import { Button } from "@/components/ui/button";','import { Button } from "@/components/ui/button";\nimport RenewalBanner from "@/components/RenewalBanner";').replace('<div className="space-y-8 animate-fade-up" data-testid="dashboard">','<div className="space-y-8 animate-fade-up" data-testid="dashboard">\n      <RenewalBanner />',1);a.write_text(x)

a=ROOT/'frontend/src/lib/AuthContext.jsx';x=a.read_text();x=x.replace('      setUser(data);\n      await loadShops(data.default_shop_id);\n      return { ok: true };','      await refresh();\n      return { ok: true };',2);a.write_text(x)

# Minimal Razorpay-first subscribe page. Existing monthly prices remain unchanged; setup assistance is optional and excluded from payment.
sub=ROOT/'frontend/src/pages/Subscribe.jsx';sub.write_text('''import{useEffect,useState}from"react";import{useNavigate,useSearchParams,Link}from"react-router-dom";import{api,money}from"@/lib/api";import{useAuth}from"@/lib/AuthContext";import{loadRazorpay}from"@/lib/razorpay";import{Button}from"@/components/ui/button";import{toast}from"sonner";import{Check,ShieldCheck}from"lucide-react";export default function Subscribe(){const[p]=useSearchParams(),nav=useNavigate(),{user}=useAuth();const[plans,setPlans]=useState({}),[selected,setSelected]=useState(p.get("plan")||"business"),[busy,setBusy]=useState(false),[done,setDone]=useState(null),renew=p.get("renew")==="1";useEffect(()=>{api.get("/plans").then(r=>setPlans(r.data.plans||{})).catch(()=>toast.error("Could not load plans"))},[]);const plan=plans[selected];const pay=async()=>{if(!user){nav("/login");return}setBusy(true);try{await loadRazorpay();const{data}=await api.post("/subscriptions/razorpay/order",{plan:selected,renew});const r=new window.Razorpay({key:data.key_id,amount:data.amount,currency:data.currency,name:"Dukaan",description:`${data.plan} subscription${data.renew?" renewal":""}`,order_id:data.order_id,prefill:{name:user.name||"",email:user.email||""},theme:{color:"#1F1A5D"},handler:async v=>{try{setDone((await api.post("/subscriptions/razorpay/verify",{razorpay_order_id:v.razorpay_order_id,razorpay_payment_id:v.razorpay_payment_id,razorpay_signature:v.razorpay_signature})).data)}catch(e){toast.error(e.response?.data?.detail||"Payment verification failed")}}});r.open()}catch(e){toast.error(e.response?.data?.detail||e.message||"Unable to start Razorpay")}finally{setBusy(false)}};if(done)return <div className="min-h-screen bg-brand-sand grid place-items-center px-4"><div className="max-w-md w-full rounded-2xl border border-brand-mitti bg-white p-8 text-center"><div className="w-14 h-14 rounded-full bg-brand-leaf/10 text-brand-leaf grid place-items-center mx-auto"><Check/></div><h1 className="mt-4 font-heading text-2xl font-bold">{done.status==="scheduled"?"Renewal scheduled!":"Payment successful!"}</h1><p className="mt-2 text-brand-indigo/70">{done.status==="scheduled"?"Your current plan stays active until expiry; the renewal starts automatically afterwards.":`Your ${plan?.name||selected} plan is active.`}</p><Button onClick={()=>nav("/app")} className="mt-6 w-full bg-brand-terracotta text-white">Go to dashboard</Button></div></div>;return <div className="min-h-screen bg-brand-sand"><header className="sticky top-0 z-30 bg-brand-sand/90 backdrop-blur border-b border-brand-mitti"><div className="mx-auto max-w-5xl px-5 h-16 flex items-center justify-between"><Link to="/" className="font-display text-2xl text-brand-indigo">दुकान · Dukaan</Link><Button variant="ghost" onClick={()=>nav("/app")}>Back to app</Button></div></header><div className="mx-auto max-w-5xl px-5 py-10"><h1 className="font-display text-4xl md:text-5xl">{renew?"Renew your Dukaan plan":"Subscribe to Dukaan"}</h1><p className="mt-3 text-brand-indigo/70">{renew?"Pay early; your renewal starts after the current subscription ends.":"Choose a plan and pay securely with Razorpay."}</p><div className="mt-8 grid md:grid-cols-3 gap-4">{Object.entries(plans).map(([k,v])=><button key={k} onClick={()=>setSelected(k)} className={`text-left rounded-xl p-5 border-2 shadow-card ${selected===k?"border-brand-terracotta bg-white":"border-brand-mitti bg-white"}`}><div className="text-xs uppercase tracking-widest text-brand-terracotta font-semibold">{v.name}</div><div className="mt-2 font-display text-4xl">₹{v.monthly}<span className="text-sm">/month</span></div><div className="text-xs text-brand-indigo/60">+ ₹{v.setup} optional one-time setup</div>{selected===k&&<div className="mt-3 text-xs text-brand-leaf">Selected ✓</div>}</button>)}</div><div className="mt-10 max-w-xl mx-auto rounded-2xl border border-brand-mitti bg-white p-7 text-center"><ShieldCheck className="w-10 h-10 mx-auto text-brand-leaf"/><h2 className="mt-4 font-heading text-2xl font-bold">Secure Razorpay checkout</h2><p className="mt-2 text-sm text-brand-indigo/70">UPI, cards and net banking. The Key Secret stays on the server.</p><div className="mt-5 rounded-lg bg-brand-mitti/40 p-4 text-left text-sm"><div className="flex justify-between"><span>Plan</span><b>{plan?.name||"—"}</b></div><div className="flex justify-between mt-2"><span>Monthly</span><b>{plan?money(plan.monthly):"—"}</b></div></div><Button disabled={busy||!plan} onClick={pay} className="mt-6 w-full h-12 bg-brand-terracotta text-white">{busy?"Opening Razorpay…":renew?"Renew securely with Razorpay":"Pay securely with Razorpay"}</Button><p className="mt-4 text-xs text-brand-indigo/50">Setup assistance is optional and not included in the monthly payment.</p></div></div></div>}\n''')

wf=ROOT/'.github/workflows/subscription-maintenance.yml';wf.parent.mkdir(parents=True,exist_ok=True);wf.write_text('''name: Dukaan subscription maintenance\non:\n  schedule:\n    - cron: '30 18 * * *'\n  workflow_dispatch:\njobs:\n  maintain:\n    runs-on: ubuntu-latest\n    steps:\n      - name: Run maintenance\n        env:\n          CRON_SECRET: ${{ secrets.SUBSCRIPTION_CRON_SECRET }}\n        run: |\n          test -n "$CRON_SECRET"\n          curl -fsS -X POST https://officialdukaan.in/api/internal/subscription-maintenance -H "X-Cron-Secret: $CRON_SECRET"\n''')
