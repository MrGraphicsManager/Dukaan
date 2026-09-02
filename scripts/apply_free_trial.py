from pathlib import Path
import re

p = Path('backend/server.py')
s = p.read_text()

# Make subscription checks understand trial subscriptions through the existing
# active-subscription path. Trial records use the same active status and carry
# trial=True, so all paid features remain available during the trial.
# Add a small helper for consistent trial expiry metadata.
marker = 'def now_iso() -> str:\n    return datetime.now(timezone.utc).isoformat()\n'
insert = '''def now_iso() -> str:\n    return datetime.now(timezone.utc).isoformat()\n\n\ndef make_trial_subscription(user: dict) -> dict:\n    now = datetime.now(timezone.utc)\n    expires = now + timedelta(days=30)\n    return {\n        "user_id": user["id"],\n        "user_email": user.get("email", ""),\n        "plan": "business",\n        "plan_name": "Business Trial",\n        "amount": 0,\n        "payment_method": "trial",\n        "status": "active",\n        "trial": True,\n        "trial_days": 30,\n        "activated_at": now.isoformat(),\n        "starts_at": now.isoformat(),\n        "expires_at": expires.isoformat(),\n        "created_at": now.isoformat(),\n    }\n'''
if marker in s and 'def make_trial_subscription' not in s:
    s = s.replace(marker, insert, 1)

# Locate the registration endpoint without depending on its exact formatting.
pat = re.compile(r'(?P<decorator>@api\.post\(["\']/(?:auth/)?register["\']\).*?)(?=\n@api\.|\n# ={5,})', re.S)
m = pat.search(s)
if not m:
    # Try common alternate registration route names.
    pat = re.compile(r'(?P<decorator>@api\.post\(["\']/(?:register|signup)["\']\).*?)(?=\n@api\.|\n# ={5,})', re.S)
    m = pat.search(s)

if not m:
    raise SystemExit('Registration endpoint not found; no changes made')

block = m.group('decorator')
if 'make_trial_subscription' not in block:
    # Insert trial creation immediately before the endpoint's return statement.
    # Prefer a return containing the access token; otherwise append before block end.
    token_return = re.search(r'(?m)^([ \t]*)return\s+.*(?:token|access_token).*$', block)
    trial_code = '''\n\n    # Every newly registered account gets one 30-day Business trial.\n    # Existing users and paid subscriptions are never modified here.\n    trial_sub = make_trial_subscription({"id": str(user_id), "email": body.email})\n    await db.subscriptions.insert_one(trial_sub)\n'''
    if token_return:
        pos = token_return.start()
        block = block[:pos] + trial_code + '\n' + block[pos:]
    else:
        block = block.rstrip() + trial_code + '\n'
    s = s[:m.start('decorator')] + block + s[m.end('decorator'):]

# Add a safe trial-status endpoint for the frontend/admin UI.
if '@api.get("/subscriptions/trial")' not in s:
    marker2 = '# =========================================================\n# SHOPS\n# =========================================================\n'
    routes = '''# =========================================================\n# FREE TRIAL\n# =========================================================\n@api.get("/subscriptions/trial")\nasync def trial_status(user: dict = Depends(get_current_user)):\n    sub = await db.subscriptions.find_one(\n        {"user_id": user["id"], "trial": True, "status": "active"},\n        sort=[("activated_at", -1)],\n    )\n    if not sub:\n        return {"active": False, "days_left": 0, "expires_at": None}\n    expiry = datetime.fromisoformat(sub["expires_at"])\n    seconds = max(0, int((expiry - datetime.now(timezone.utc)).total_seconds()))\n    return {\n        "active": seconds > 0,\n        "days_left": (seconds + 86399) // 86400,\n        "expires_at": sub["expires_at"],\n        "plan": sub.get("plan", "business"),\n    }\n\n\n'''
    if marker2 in s:
        s = s.replace(marker2, routes + marker2, 1)

p.write_text(s)
print('Free trial backend patch applied')
