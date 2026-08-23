import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { api, money, API_BASE } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Check, QrCode, Copy, Upload } from "lucide-react";

async function fileToDataUrl(file) {
  return new Promise((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.readAsDataURL(file);
  });
}

export default function Subscribe() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [plans, setPlans] = useState({});
  const [upiId, setUpiId] = useState("");
  const [upiName, setUpiName] = useState("");
  const [selected, setSelected] = useState(params.get("plan") || "business");
  const [form, setForm] = useState({ upi_ref: "", payer_name: "", screenshot_data_url: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  useEffect(() => {
    api.get("/plans").then(r => {
      setPlans(r.data.plans);
      setUpiId(r.data.upi_id);
      setUpiName(r.data.upi_name);
    });
  }, []);

  const plan = plans[selected];
  const upiLink = plan ? `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName || "Dukaan")}&am=${plan.monthly}.00&cu=INR&tn=Dukaan-${selected}` : "";
  const qrUrl = plan ? `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(upiLink)}&size=280x280&bgcolor=FBF8F1&color=1F1A5D&margin=8` : "";

  const submit = async () => {
    if (!user) { nav("/login"); return; }
    if (!form.upi_ref || form.upi_ref.length < 3) return toast.error("Enter your UPI reference / transaction ID");
    setBusy(true);
    try {
      const { data } = await api.post("/subscriptions/submit", { plan: selected, ...form });
      setDone(data);
      toast.success("Submitted! We'll activate within a few hours.");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed");
    } finally { setBusy(false); }
  };

  const upload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const url = await fileToDataUrl(file);
    setForm({ ...form, screenshot_data_url: url });
  };

  if (done) {
    return (
      <div className="min-h-screen bg-brand-sand grid place-items-center px-4">
        <div className="max-w-md w-full rounded-2xl border border-brand-mitti bg-white p-8 shadow-lift text-center">
          <div className="w-14 h-14 rounded-full bg-brand-leaf/10 text-brand-leaf grid place-items-center mx-auto">
            <Check className="w-7 h-7" />
          </div>
          <h1 className="mt-4 font-heading text-2xl font-bold">Payment submitted!</h1>
          <p className="mt-2 text-brand-indigo/70">Your <b>{done.plan_name}</b> subscription (₹{done.amount}/mo) is <b>pending</b> verification. We'll activate within a few hours and notify you by email.</p>
          <div className="mt-6 text-sm rounded-lg bg-brand-mitti/40 p-3">
            <div><b>Reference:</b> {done.upi_ref}</div>
            <div><b>Status:</b> Pending</div>
          </div>
          <Button onClick={()=>nav("/app")} className="mt-6 w-full bg-brand-terracotta hover:bg-brand-terracotta/90 text-white">Go to dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-sand">
      <header className="sticky top-0 z-30 bg-brand-sand/90 backdrop-blur border-b border-brand-mitti">
        <div className="mx-auto max-w-5xl px-5 h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-2xl text-brand-indigo">दुकान · Dukaan</Link>
          <Button variant="ghost" onClick={()=>nav("/app")}>Back to app</Button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-10">
        <h1 className="font-display text-4xl md:text-5xl">Subscribe to Dukaan</h1>
        <p className="mt-3 text-brand-indigo/70 max-w-2xl">Choose a plan, pay via UPI on your phone, submit the reference. We manually verify (usually within a few hours) and activate.</p>

        {/* Plans */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          {Object.entries(plans).map(([key, p]) => (
            <button
              key={key}
              onClick={()=>setSelected(key)}
              data-testid={`sub-plan-${key}`}
              className={`text-left rounded-xl p-5 border-2 shadow-card transition-colors ${selected===key ? "border-brand-terracotta bg-white" : "border-brand-mitti bg-white hover:border-brand-terracotta/40"}`}
            >
              <div className="text-xs uppercase tracking-widest text-brand-terracotta font-semibold">{p.name}</div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-display text-4xl">₹{p.monthly}</span>
                <span className="text-sm text-brand-indigo/60">/month</span>
              </div>
              <div className="text-xs text-brand-indigo/60">+ ₹{p.setup} one-time setup</div>
              {selected===key && <div className="mt-3 text-xs font-semibold text-brand-leaf inline-flex items-center gap-1"><Check className="w-3.5 h-3.5"/> Selected</div>}
            </button>
          ))}
        </div>

        {/* Payment area */}
        <div className="mt-10 grid md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-brand-mitti bg-white p-6 shadow-card">
            <div className="text-xs uppercase tracking-widest text-brand-terracotta font-semibold">Step 1 · Pay via UPI</div>
            <div className="mt-2 font-heading text-2xl font-bold">Amount: {plan && money(plan.monthly)}</div>
            <div className="mt-6 grid place-items-center">
              {qrUrl && <img src={qrUrl} alt="UPI QR" className="w-64 h-64 rounded-lg border border-brand-mitti" data-testid="sub-qr" />}
            </div>
            <div className="mt-4 rounded-lg bg-brand-mitti/40 p-3 flex items-center justify-between">
              <div>
                <div className="text-xs text-brand-indigo/60 uppercase tracking-widest">UPI ID</div>
                <div className="font-heading font-bold" data-testid="sub-upi-id">{upiId}</div>
              </div>
              <Button variant="ghost" onClick={()=>{navigator.clipboard.writeText(upiId); toast.success("Copied");}}>
                <Copy className="w-4 h-4"/>
              </Button>
            </div>
            <a href={upiLink} className="mt-3 block text-center text-sm font-semibold text-brand-terracotta hover:underline">Or tap here to open in UPI app →</a>
          </div>

          <div className="rounded-xl border border-brand-mitti bg-white p-6 shadow-card">
            <div className="text-xs uppercase tracking-widest text-brand-terracotta font-semibold">Step 2 · Confirm payment</div>
            <div className="mt-4 space-y-4">
              <div>
                <Label>UPI reference / transaction ID *</Label>
                <Input data-testid="sub-upi-ref" placeholder="e.g. 4XXXXXXXX987" value={form.upi_ref} onChange={(e)=>setForm({...form, upi_ref:e.target.value})}/>
                <div className="text-xs text-brand-indigo/60 mt-1">You'll see this in your UPI app after payment.</div>
              </div>
              <div>
                <Label>Your name on UPI</Label>
                <Input data-testid="sub-payer-name" value={form.payer_name} onChange={(e)=>setForm({...form, payer_name:e.target.value})}/>
              </div>
              <div>
                <Label>Payment screenshot (optional but helpful)</Label>
                <label className="mt-1 flex items-center gap-2 px-3 py-2.5 rounded-md border border-dashed border-brand-mitti cursor-pointer hover:bg-brand-mitti/30">
                  <Upload className="w-4 h-4"/>
                  <span className="text-sm">{form.screenshot_data_url ? "Change screenshot" : "Upload screenshot"}</span>
                  <input type="file" accept="image/*" onChange={upload} className="hidden" data-testid="sub-screenshot" />
                </label>
                {form.screenshot_data_url && <img src={form.screenshot_data_url} alt="" className="mt-2 w-24 h-24 object-cover rounded border border-brand-mitti"/>}
              </div>
              <Button
                disabled={busy}
                onClick={submit}
                data-testid="sub-submit"
                className="w-full h-12 bg-brand-terracotta hover:bg-brand-terracotta/90 text-white active:scale-95 transition-transform"
              >
                {busy ? "Submitting…" : "Submit for verification"}
              </Button>
              {!user && <div className="text-sm text-brand-terracotta">You'll need to <Link to="/login" className="font-semibold underline">log in</Link> first.</div>}
            </div>
          </div>
        </div>

        <div className="mt-8 text-sm text-brand-indigo/60 max-w-3xl">
          <b>Note:</b> Payments go directly to the shopkeeper's UPI account. No middle-man, no auto-charging. We verify manually and activate — usually within a few hours.
        </div>
      </div>
    </div>
  );
}
