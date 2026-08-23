from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import io
import base64
import logging
import secrets
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal, Annotated

import bcrypt
import jwt
import qrcode
import re
import ipaddress
import httpx
import secrets as pysecrets
from html import escape
from html.parser import HTMLParser
from urllib.parse import urlparse
from bson import ObjectId
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, Header
from fastapi.responses import StreamingResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, BeforeValidator, EmailStr, ConfigDict
from reportlab.lib.pagesizes import A5
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.units import mm

# =========================================================
# Setup
# =========================================================
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_ALGORITHM = "HS256"
JWT_SECRET = os.environ["JWT_SECRET"]

# Email (Emergent-managed Resend)
EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMAIL_KEY = os.environ.get("EMERGENT_EMAIL_KEY", "")
EMAIL_FROM_NAME = os.environ.get("EMAIL_FROM_NAME", "Dukaan")
OWNER_NOTIFY_EMAIL = os.environ.get("OWNER_NOTIFY_EMAIL", "").strip()
FRONTEND_URL_ENV = os.environ.get("FRONTEND_URL", "").rstrip("/")
origins = os.environ.get("CORS_ORIGINS", "*").split(",")

app = FastAPI(title="Dukaan API")
api = APIRouter(prefix="/api")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("dukaan")


# =========================================================
# Helpers
# =========================================================
def _oid(v):
    if isinstance(v, ObjectId):
        return str(v)
    if isinstance(v, str) and ObjectId.is_valid(v):
        return v
    raise ValueError("Invalid ObjectId")

PyObjectId = Annotated[str, BeforeValidator(_oid)]


def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def _set_cookie(resp: Response, token: str):
    resp.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7 * 24 * 3600,
        path="/",
    )


async def get_admin_user(request: Request) -> dict:
    user = await _get_current_user(request)
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin only")
    return user


async def _get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["id"] = str(user.pop("_id"))
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_current_user(request: Request) -> dict:
    return await _get_current_user(request)


PLAN_TIER = {"starter": 1, "business": 2, "premium": 3}


async def _active_sub(user_id: str) -> Optional[dict]:
    now_iso_str = datetime.now(timezone.utc).isoformat()
    return await db.subscriptions.find_one({
        "user_id": user_id,
        "status": "active",
        "$or": [{"expires_at": None}, {"expires_at": {"$gt": now_iso_str}}],
    }, sort=[("activated_at", -1)])


async def require_active_subscription(user: dict = Depends(get_current_user)) -> dict:
    if user.get("is_admin"):
        return user
    sub = await _active_sub(user["id"])
    if not sub:
        raise HTTPException(status_code=402, detail="Subscription required")
    return {**user, "subscription": clean(sub) if sub else None}


def require_plan(min_plan: str):
    """Dependency factory: user must have active subscription with tier >= min_plan."""
    async def _dep(user: dict = Depends(require_active_subscription)) -> dict:
        if user.get("is_admin"):
            return user
        current = user.get("subscription", {}).get("plan", "")
        if PLAN_TIER.get(current, 0) < PLAN_TIER.get(min_plan, 0):
            raise HTTPException(status_code=402, detail=f"Upgrade required: {min_plan}")
        return user
    return _dep


async def get_shop(
    request: Request,
    user: dict = Depends(get_current_user),
    x_shop_id: Optional[str] = Header(None, alias="X-Shop-Id"),
) -> dict:
    shop_id = x_shop_id or request.query_params.get("shop_id")
    if not shop_id or not ObjectId.is_valid(shop_id):
        raise HTTPException(status_code=400, detail="Shop id required")
    shop = await db.shops.find_one({"_id": ObjectId(shop_id), "owner_id": user["id"]})
    if not shop:
        raise HTTPException(status_code=403, detail="Shop not found or not owned")
    shop["id"] = str(shop.pop("_id"))
    return shop


async def get_shop_paid(
    request: Request,
    user: dict = Depends(get_current_user),
    x_shop_id: Optional[str] = Header(None, alias="X-Shop-Id"),
) -> dict:
    """Same as get_shop, but also requires an active subscription (or admin)."""
    shop_id = x_shop_id or request.query_params.get("shop_id")
    if not shop_id or not ObjectId.is_valid(shop_id):
        raise HTTPException(status_code=400, detail="Shop id required")
    shop = await db.shops.find_one({"_id": ObjectId(shop_id), "owner_id": user["id"]})
    if not shop:
        raise HTTPException(status_code=403, detail="Shop not found or not owned")
    if not user.get("is_admin"):
        sub = await _active_sub(user["id"])
        if not sub:
            raise HTTPException(status_code=402, detail="Subscription required")
    shop["id"] = str(shop.pop("_id"))
    return shop


def get_shop_plan(min_plan: str):
    async def _dep(
        request: Request,
        user: dict = Depends(get_current_user),
        x_shop_id: Optional[str] = Header(None, alias="X-Shop-Id"),
    ) -> dict:
        shop_id = x_shop_id or request.query_params.get("shop_id")
        if not shop_id or not ObjectId.is_valid(shop_id):
            raise HTTPException(status_code=400, detail="Shop id required")
        shop = await db.shops.find_one({"_id": ObjectId(shop_id), "owner_id": user["id"]})
        if not shop:
            raise HTTPException(status_code=403, detail="Shop not found or not owned")
        if not user.get("is_admin"):
            sub = await _active_sub(user["id"])
            if not sub:
                raise HTTPException(status_code=402, detail="Subscription required")
            if PLAN_TIER.get(sub.get("plan",""), 0) < PLAN_TIER.get(min_plan, 0):
                raise HTTPException(status_code=402, detail=f"Upgrade to {min_plan} required")
        shop["id"] = str(shop.pop("_id"))
        return shop
    return _dep


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def clean(doc: dict) -> dict:
    if not doc:
        return doc
    if "_id" in doc:
        doc["id"] = str(doc.pop("_id"))
    return doc


# =========================================================
# Schemas
# =========================================================
class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6)

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class ShopIn(BaseModel):
    name: str
    owner_name: Optional[str] = ""
    phone: Optional[str] = ""
    address: Optional[str] = ""
    upi_id: Optional[str] = ""
    upi_qr_data_url: Optional[str] = ""
    logo_data_url: Optional[str] = ""
    invoice_footer: Optional[str] = "Thank you for shopping with us!"
    min_stock_default: int = 5

class ProductIn(BaseModel):
    name: str
    category: Optional[str] = "General"
    selling_price: float
    purchase_price: Optional[float] = 0
    stock: int = 0
    min_stock: int = 5
    unlimited_stock: bool = False
    image_data_url: Optional[str] = ""

class CustomerIn(BaseModel):
    name: str
    phone: Optional[str] = ""
    notes: Optional[str] = ""

class OrderItemIn(BaseModel):
    product_id: str
    name: str
    price: float
    qty: int

class OrderIn(BaseModel):
    items: List[OrderItemIn]
    discount: float = 0
    customer_id: Optional[str] = None
    payment_method: Literal["cash", "upi", "udhaar"]
    amount_received: Optional[float] = None  # for cash
    note: Optional[str] = ""

class StockAdjustIn(BaseModel):
    qty: int  # positive = restock, negative = adjust
    reason: str = "restock"

class UdhaarPaymentIn(BaseModel):
    customer_id: str
    amount: float
    note: Optional[str] = ""


class SubscriptionSubmitIn(BaseModel):
    plan: Literal["starter", "business", "premium"]
    upi_ref: str = Field(min_length=3)
    payer_name: Optional[str] = ""
    screenshot_data_url: Optional[str] = ""


PLANS = {
    "starter":  {"name": "Starter",  "setup": 299, "monthly": 99},
    "business": {"name": "Business", "setup": 499, "monthly": 149},
    "premium":  {"name": "Premium",  "setup": 999, "monthly": 299},
}


# =========================================================
# EMAIL (Emergent-managed Resend) with G1-G5 guardrails
# =========================================================
_SHORTENERS = ("bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "goo.gl", "rebrand.ly")
_CRED_ASK = ("reply with your password", "reply with the code", "send your password", "cvv",
             "send us your password", "enter your password below", "confirm your card number",
             "your full card number", "seed phrase", "recovery phrase", "verify your card",
             "social security number", "confirm your bank details")
_HOSTISH = re.compile(r"\b(?:https?://)?((?:[a-z0-9-]+\.)+[a-z]{2,})", re.I)


def _host_ok(host: str) -> bool:
    if not host or "xn--" in host:
        return False
    try:
        ipaddress.ip_address(host)
        return False
    except ValueError:
        pass
    return not any(host == s or host.endswith("." + s) for s in _SHORTENERS)


def _same_site(shown: str, real: str) -> bool:
    return shown == real or real.endswith("." + shown) or shown.endswith("." + real)


class _EmailScan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags, self.urls, self.anchors = set(), [], []
        self._href, self._text = None, []
    def handle_starttag(self, tag, attrs):
        self.tags.add(tag.lower())
        self.urls += [v for k, v in attrs if k.lower() in ("href", "src") and v]
        if tag.lower() == "a":
            self._href = dict((k.lower(), v) for k, v in attrs).get("href")
            self._text = []
    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)
    def handle_endtag(self, tag):
        if tag.lower() == "a" and self._href is not None:
            self.anchors.append((self._href, "".join(self._text)))
            self._href, self._text = None, []


def _assert_safe_email(subject: str, html: str) -> None:
    scan = _EmailScan(); scan.feed(html)
    if scan.tags & {"form", "input", "textarea", "select"}:
        raise ValueError("No forms in email (G2)")
    body = f"{subject}\n{html}".lower()
    for p in _CRED_ASK:
        if p in body:
            raise ValueError(f"Email asks for credentials: {p!r} (G2)")
    for url in scan.urls:
        low = url.strip().lower()
        if low.startswith(("mailto:", "tel:", "cid:", "#")):
            continue
        if not low.startswith("https://"):
            raise ValueError(f"Email links must be https: {url!r} (G3)")
        host = urlparse(low).hostname or ""
        if not _host_ok(host) or urlparse(low).username is not None:
            raise ValueError(f"Unsafe URL: {url!r} (G3)")
    for href, text in scan.anchors:
        real = urlparse(href.strip().lower()).hostname or ""
        if not real:
            continue
        for m in _HOSTISH.finditer(text):
            if not _same_site(m.group(1).lower(), real):
                raise ValueError(f"Anchor text {m.group(1)!r} ≠ real host {real!r} (G3)")


async def send_email(*, to: str, subject: str, html: str) -> Optional[str]:
    if not EMAIL_KEY:
        logger.warning(f"[email skipped — no key] to={to} subject={subject}")
        return None
    _assert_safe_email(subject, html)
    payload = {"to": [to], "subject": subject, "html": html, "from_name": EMAIL_FROM_NAME}
    try:
        async with httpx.AsyncClient(timeout=15) as c:
            r = await c.post(f"{EMAIL_BASE_URL}/api/v1/email/send",
                             headers={"X-Email-Key": EMAIL_KEY}, json=payload)
        r.raise_for_status()
        return r.json().get("id")
    except Exception as e:
        logger.error(f"Email send failed to={to}: {e}")
        return None


# =========================================================
# AUTH
# =========================================================
@api.post("/auth/register")
async def register(body: RegisterIn, response: Response):
    email = body.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    doc = {
        "email": email,
        "name": body.name,
        "password_hash": hash_password(body.password),
        "created_at": now_iso(),
    }
    res = await db.users.insert_one(doc)
    uid = str(res.inserted_id)
    # Auto-create first shop for convenience
    shop_id = (await db.shops.insert_one({
        "owner_id": uid,
        "name": f"{body.name}'s Shop",
        "owner_name": body.name,
        "phone": "",
        "address": "",
        "upi_id": "",
        "upi_qr_data_url": "",
        "logo_data_url": "",
        "invoice_footer": "Thank you for shopping with us!",
        "min_stock_default": 5,
        "created_at": now_iso(),
    })).inserted_id
    token = create_access_token(uid, email)
    _set_cookie(response, token)
    return {"id": uid, "email": email, "name": body.name, "default_shop_id": str(shop_id)}


@api.post("/auth/login")
async def login(body: LoginIn, response: Response):
    email = body.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    uid = str(user["_id"])
    token = create_access_token(uid, email)
    _set_cookie(response, token)
    # get default shop
    shop = await db.shops.find_one({"owner_id": uid})
    return {
        "id": uid,
        "email": email,
        "name": user.get("name", ""),
        "default_shop_id": str(shop["_id"]) if shop else None,
    }


@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


class ForgotIn(BaseModel):
    email: EmailStr


class ResetIn(BaseModel):
    token: str
    new_password: str = Field(min_length=6)


@api.post("/auth/forgot-password")
async def forgot_password(body: ForgotIn):
    email = body.email.lower()
    user = await db.users.find_one({"email": email})
    # Always return generic OK to avoid email enumeration
    if not user:
        return {"ok": True}
    token = pysecrets.token_urlsafe(32)
    expires = datetime.now(timezone.utc) + timedelta(hours=1)
    await db.password_reset_tokens.insert_one({
        "email": email,
        "token": token,
        "expires_at": expires,
        "used": False,
        "created_at": now_iso(),
    })
    base = FRONTEND_URL_ENV or ""
    link = f"{base}/reset-password?token={token}"
    html = (
        '<table role="presentation" width="100%"><tr><td style="padding:24px;'
        'font-family:Arial,sans-serif;color:#1F1A5D;background:#FBF8F1">'
        f'<h2 style="font-family:Georgia,serif;color:#1F1A5D">Reset your Dukaan password</h2>'
        f'<p>Hi {escape(user.get("name",""))},</p>'
        '<p>We received a request to reset the password for your Dukaan account. '
        'Click the button below to choose a new one. The link is valid for 1 hour.</p>'
        f'<p><a href="{escape(link)}" style="display:inline-block;background:#C36A4A;'
        'color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">'
        'Reset password</a></p>'
        '<p style="font-size:12px;color:#7B766D">If you did not request this, you can ignore this email.</p>'
        f'<p style="font-size:12px;color:#7B766D">Sent by {escape(EMAIL_FROM_NAME)}. '
        'We never ask for your password or OTP by email.</p></td></tr></table>'
    )
    await send_email(to=email, subject="Reset your Dukaan password", html=html)
    return {"ok": True}


@api.post("/auth/reset-password")
async def reset_password(body: ResetIn):
    doc = await db.password_reset_tokens.find_one({"token": body.token, "used": False})
    if not doc:
        raise HTTPException(400, "Invalid or expired token")
    exp = doc["expires_at"]
    if isinstance(exp, str):
        try: exp = datetime.fromisoformat(exp)
        except Exception: exp = datetime.now(timezone.utc) - timedelta(hours=1)
    if exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)
    if exp < datetime.now(timezone.utc):
        raise HTTPException(400, "Token expired")
    await db.users.update_one({"email": doc["email"]}, {"$set": {"password_hash": hash_password(body.new_password)}})
    await db.password_reset_tokens.update_one({"_id": doc["_id"]}, {"$set": {"used": True}})
    return {"ok": True}


@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    shop = await db.shops.find_one({"owner_id": user["id"]})
    # active subscription check
    sub = await db.subscriptions.find_one({"user_id": user["id"], "status": "active"}, sort=[("created_at", -1)])
    return {
        **user,
        "default_shop_id": str(shop["_id"]) if shop else None,
        "subscription": clean(sub) if sub else None,
    }


# =========================================================
# SUBSCRIPTIONS (Manual UPI verification)
# =========================================================
@api.get("/plans")
async def public_plans():
    return {
        "plans": PLANS,
        "upi_id": os.environ.get("SUBSCRIPTION_UPI_ID", ""),
        "upi_name": os.environ.get("SUBSCRIPTION_UPI_NAME", ""),
    }


@api.post("/subscriptions/submit")
async def submit_subscription(body: SubscriptionSubmitIn, user: dict = Depends(get_current_user)):
    if body.plan not in PLANS:
        raise HTTPException(400, "Invalid plan")
    plan = PLANS[body.plan]
    doc = {
        "user_id": user["id"],
        "user_email": user["email"],
        "plan": body.plan,
        "plan_name": plan["name"],
        "amount": plan["monthly"],
        "upi_ref": body.upi_ref.strip(),
        "payer_name": body.payer_name or user.get("name", ""),
        "screenshot_data_url": body.screenshot_data_url or "",
        "status": "pending",
        "created_at": now_iso(),
        "activated_at": None,
        "expires_at": None,
        "reviewed_by": None,
        "review_note": "",
    }
    res = await db.subscriptions.insert_one(doc)
    doc["id"] = str(res.inserted_id)
    doc.pop("_id", None)

    # Notify owner (async best-effort)
    if OWNER_NOTIFY_EMAIL:
        base = FRONTEND_URL_ENV or ""
        admin_url = f"{base}/app/admin"
        html = (
            '<table role="presentation" width="100%"><tr><td style="padding:24px;'
            'font-family:Arial,sans-serif;color:#1F1A5D;background:#FBF8F1">'
            f'<h2 style="font-family:Georgia,serif">New Dukaan subscription pending</h2>'
            f'<p><b>Plan:</b> {escape(plan["name"])} · ₹{plan["monthly"]}/mo</p>'
            f'<p><b>User:</b> {escape(user.get("email",""))}</p>'
            f'<p><b>UPI Reference:</b> {escape(body.upi_ref)}</p>'
            f'<p><b>Payer name:</b> {escape(body.payer_name or "-")}</p>'
            f'<p><a href="{escape(admin_url)}" style="display:inline-block;background:#C36A4A;'
            'color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:600">'
            'Review in admin panel</a></p>'
            '<p style="font-size:12px;color:#7B766D">Verify the reference against your bank / UPI app, '
            'then Activate or Reject in the admin panel.</p>'
            f'<p style="font-size:12px;color:#7B766D">Sent by {escape(EMAIL_FROM_NAME)}.</p>'
            '</td></tr></table>'
        )
        try:
            await send_email(to=OWNER_NOTIFY_EMAIL, subject=f"New subscription: {plan['name']} · ₹{plan['monthly']}", html=html)
        except Exception as e:
            logger.error(f"admin notify failed: {e}")

    return doc


@api.get("/subscriptions/mine")
async def my_subscriptions(user: dict = Depends(get_current_user)):
    cur = db.subscriptions.find({"user_id": user["id"]}).sort("created_at", -1)
    return [clean(s) for s in await cur.to_list(50)]


@api.get("/admin/subscriptions")
async def admin_list_subs(admin: dict = Depends(get_admin_user), status: Optional[str] = None):
    q = {}
    if status and status != "all":
        q["status"] = status
    cur = db.subscriptions.find(q).sort("created_at", -1)
    return [clean(s) for s in await cur.to_list(500)]


@api.post("/admin/subscriptions/{sid}/activate")
async def admin_activate(sid: str, admin: dict = Depends(get_admin_user)):
    if not ObjectId.is_valid(sid):
        raise HTTPException(400, "bad id")
    sub = await db.subscriptions.find_one({"_id": ObjectId(sid)})
    if not sub:
        raise HTTPException(404, "not found")
    now = datetime.now(timezone.utc)
    expires = now + timedelta(days=30)
    await db.subscriptions.update_one({"_id": ObjectId(sid)}, {"$set": {
        "status": "active",
        "activated_at": now.isoformat(),
        "expires_at": expires.isoformat(),
        "reviewed_by": admin["email"],
    }})
    doc = await db.subscriptions.find_one({"_id": ObjectId(sid)})
    # Notify user
    if sub.get("user_email"):
        html = (
            '<table role="presentation" width="100%"><tr><td style="padding:24px;'
            'font-family:Arial,sans-serif;color:#1F1A5D;background:#FBF8F1">'
            f'<h2 style="font-family:Georgia,serif">Your Dukaan subscription is active</h2>'
            f'<p>Your <b>{escape(sub.get("plan_name",""))}</b> plan is now active until '
            f'<b>{escape(expires.isoformat()[:10])}</b>.</p>'
            f'<p><a href="{escape((FRONTEND_URL_ENV or "") + "/app")}" '
            'style="display:inline-block;background:#C36A4A;color:#fff;padding:12px 20px;'
            'border-radius:8px;text-decoration:none;font-weight:600">Open dashboard</a></p>'
            f'<p style="font-size:12px;color:#7B766D">Sent by {escape(EMAIL_FROM_NAME)}.</p>'
            '</td></tr></table>'
        )
        try:
            await send_email(to=sub["user_email"], subject="Your Dukaan subscription is active", html=html)
        except Exception: pass
    return clean(doc)


@api.post("/admin/subscriptions/{sid}/reject")
async def admin_reject(sid: str, admin: dict = Depends(get_admin_user), note: str = ""):
    if not ObjectId.is_valid(sid):
        raise HTTPException(400, "bad id")
    res = await db.subscriptions.update_one(
        {"_id": ObjectId(sid)},
        {"$set": {"status": "rejected", "reviewed_by": admin["email"], "review_note": note}}
    )
    if res.matched_count == 0:
        raise HTTPException(404, "not found")
    doc = await db.subscriptions.find_one({"_id": ObjectId(sid)})
    return clean(doc)


@api.get("/admin/stats")
async def admin_stats(admin: dict = Depends(get_admin_user)):
    users_count = await db.users.count_documents({})
    shops_count = await db.shops.count_documents({})
    active_subs = await db.subscriptions.count_documents({"status": "active"})
    pending_subs = await db.subscriptions.count_documents({"status": "pending"})
    return {
        "users": users_count,
        "shops": shops_count,
        "active_subscriptions": active_subs,
        "pending_subscriptions": pending_subs,
    }


# =========================================================
# SHOPS
# =========================================================
@api.get("/shops")
async def list_shops(user: dict = Depends(get_current_user)):
    cur = db.shops.find({"owner_id": user["id"]}).sort("created_at", 1)
    return [clean(s) for s in await cur.to_list(100)]


@api.post("/shops")
async def create_shop(body: ShopIn, user: dict = Depends(get_current_user)):
    doc = body.model_dump()
    doc["owner_id"] = user["id"]
    doc["created_at"] = now_iso()
    res = await db.shops.insert_one(doc)
    doc["id"] = str(res.inserted_id)
    doc.pop("_id", None)
    return doc


@api.put("/shops/{shop_id}")
async def update_shop(shop_id: str, body: ShopIn, user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(shop_id):
        raise HTTPException(400, "bad id")
    res = await db.shops.update_one(
        {"_id": ObjectId(shop_id), "owner_id": user["id"]},
        {"$set": body.model_dump()},
    )
    if res.matched_count == 0:
        raise HTTPException(404, "not found")
    doc = await db.shops.find_one({"_id": ObjectId(shop_id)})
    return clean(doc)


# =========================================================
# PRODUCTS
# =========================================================
@api.get("/products")
async def list_products(shop: dict = Depends(get_shop), q: Optional[str] = None, category: Optional[str] = None):
    query = {"shop_id": shop["id"]}
    if q:
        query["name"] = {"$regex": q, "$options": "i"}
    if category and category != "all":
        query["category"] = category
    cur = db.products.find(query).sort("name", 1)
    return [clean(p) for p in await cur.to_list(1000)]


@api.post("/products")
async def create_product(body: ProductIn, shop: dict = Depends(get_shop_paid)):
    doc = body.model_dump()
    doc["shop_id"] = shop["id"]
    doc["created_at"] = now_iso()
    res = await db.products.insert_one(doc)
    doc["id"] = str(res.inserted_id)
    doc.pop("_id", None)
    return doc


@api.put("/products/{pid}")
async def update_product(pid: str, body: ProductIn, shop: dict = Depends(get_shop)):
    if not ObjectId.is_valid(pid):
        raise HTTPException(400, "bad id")
    res = await db.products.update_one(
        {"_id": ObjectId(pid), "shop_id": shop["id"]},
        {"$set": body.model_dump()},
    )
    if res.matched_count == 0:
        raise HTTPException(404, "not found")
    doc = await db.products.find_one({"_id": ObjectId(pid)})
    return clean(doc)


@api.delete("/products/{pid}")
async def delete_product(pid: str, shop: dict = Depends(get_shop)):
    if not ObjectId.is_valid(pid):
        raise HTTPException(400, "bad id")
    await db.products.delete_one({"_id": ObjectId(pid), "shop_id": shop["id"]})
    return {"ok": True}


@api.post("/products/{pid}/stock")
async def adjust_stock(pid: str, body: StockAdjustIn, shop: dict = Depends(get_shop)):
    if not ObjectId.is_valid(pid):
        raise HTTPException(400, "bad id")
    prod = await db.products.find_one({"_id": ObjectId(pid), "shop_id": shop["id"]})
    if not prod:
        raise HTTPException(404, "not found")
    new_stock = max(0, int(prod.get("stock", 0)) + body.qty)
    await db.products.update_one({"_id": ObjectId(pid)}, {"$set": {"stock": new_stock}})
    await db.stock_movements.insert_one({
        "shop_id": shop["id"],
        "product_id": pid,
        "qty": body.qty,
        "reason": body.reason,
        "created_at": now_iso(),
    })
    doc = await db.products.find_one({"_id": ObjectId(pid)})
    return clean(doc)


# =========================================================
# CUSTOMERS
# =========================================================
@api.get("/customers")
async def list_customers(shop: dict = Depends(get_shop_plan("business")), q: Optional[str] = None):
    query = {"shop_id": shop["id"]}
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"phone": {"$regex": q, "$options": "i"}},
        ]
    cur = db.customers.find(query).sort("name", 1)
    customers = [clean(c) for c in await cur.to_list(1000)]
    # attach totals
    for c in customers:
        agg = await db.orders.aggregate([
            {"$match": {"shop_id": shop["id"], "customer_id": c["id"]}},
            {"$group": {
                "_id": None,
                "purchases": {"$sum": "$total"},
                "paid": {"$sum": "$paid_amount"},
                "pending": {"$sum": "$pending_amount"},
            }},
        ]).to_list(1)
        if agg:
            c["total_purchases"] = agg[0]["purchases"]
            c["total_paid"] = agg[0]["paid"]
            c["total_pending"] = agg[0]["pending"]
        else:
            c["total_purchases"] = c["total_paid"] = c["total_pending"] = 0
    return customers


@api.post("/customers")
async def create_customer(body: CustomerIn, shop: dict = Depends(get_shop_plan("business"))):
    doc = body.model_dump()
    doc["shop_id"] = shop["id"]
    doc["created_at"] = now_iso()
    res = await db.customers.insert_one(doc)
    doc["id"] = str(res.inserted_id)
    doc.pop("_id", None)
    return doc


@api.get("/customers/{cid}")
async def get_customer(cid: str, shop: dict = Depends(get_shop)):
    if not ObjectId.is_valid(cid):
        raise HTTPException(400, "bad id")
    c = await db.customers.find_one({"_id": ObjectId(cid), "shop_id": shop["id"]})
    if not c:
        raise HTTPException(404, "not found")
    c = clean(c)
    orders_cur = db.orders.find({"shop_id": shop["id"], "customer_id": cid}).sort("created_at", -1)
    c["orders"] = [clean(o) for o in await orders_cur.to_list(500)]
    pay_cur = db.udhaar_payments.find({"shop_id": shop["id"], "customer_id": cid}).sort("created_at", -1)
    c["payments"] = [clean(p) for p in await pay_cur.to_list(500)]
    return c


@api.put("/customers/{cid}")
async def update_customer(cid: str, body: CustomerIn, shop: dict = Depends(get_shop)):
    if not ObjectId.is_valid(cid):
        raise HTTPException(400, "bad id")
    await db.customers.update_one(
        {"_id": ObjectId(cid), "shop_id": shop["id"]}, {"$set": body.model_dump()}
    )
    doc = await db.customers.find_one({"_id": ObjectId(cid)})
    return clean(doc)


@api.delete("/customers/{cid}")
async def delete_customer(cid: str, shop: dict = Depends(get_shop)):
    if not ObjectId.is_valid(cid):
        raise HTTPException(400, "bad id")
    await db.customers.delete_one({"_id": ObjectId(cid), "shop_id": shop["id"]})
    return {"ok": True}


# =========================================================
# ORDERS
# =========================================================
async def _next_order_no(shop_id: str) -> int:
    res = await db.orders.find({"shop_id": shop_id}).sort("order_no", -1).limit(1).to_list(1)
    return (res[0].get("order_no", 0) if res else 0) + 1


@api.post("/orders")
async def create_order(body: OrderIn, shop: dict = Depends(get_shop_paid)):
    if not body.items:
        raise HTTPException(400, "Empty order")
    subtotal = sum(i.price * i.qty for i in body.items)
    total = max(0.0, subtotal - float(body.discount or 0))
    method = body.payment_method
    paid = 0.0
    pending = 0.0
    status = "pending"
    if method == "cash" or method == "upi":
        paid = total
        status = "paid"
    else:
        pending = total
        status = "udhaar"
        if not body.customer_id:
            raise HTTPException(400, "Customer required for udhaar")

    order_no = await _next_order_no(shop["id"])
    doc = {
        "shop_id": shop["id"],
        "order_no": order_no,
        "items": [i.model_dump() for i in body.items],
        "subtotal": subtotal,
        "discount": float(body.discount or 0),
        "total": total,
        "payment_method": method,
        "paid_amount": paid,
        "pending_amount": pending,
        "status": status,
        "customer_id": body.customer_id,
        "amount_received": body.amount_received,
        "note": body.note or "",
        "created_at": now_iso(),
    }
    res = await db.orders.insert_one(doc)
    order_id = str(res.inserted_id)

    # Decrement product stock (skip unlimited-stock products)
    for item in body.items:
        if ObjectId.is_valid(item.product_id):
            prod = await db.products.find_one({"_id": ObjectId(item.product_id), "shop_id": shop["id"]})
            if prod and prod.get("unlimited_stock"):
                continue
            await db.products.update_one(
                {"_id": ObjectId(item.product_id), "shop_id": shop["id"]},
                {"$inc": {"stock": -item.qty}},
            )
            await db.stock_movements.insert_one({
                "shop_id": shop["id"],
                "product_id": item.product_id,
                "qty": -item.qty,
                "reason": f"sale#{order_no}",
                "created_at": now_iso(),
            })

    doc["id"] = order_id
    doc.pop("_id", None)
    return doc


@api.get("/orders")
async def list_orders(
    shop: dict = Depends(get_shop),
    status: Optional[str] = None,
    payment_method: Optional[str] = None,
    q: Optional[str] = None,
    limit: int = 200,
):
    query = {"shop_id": shop["id"]}
    if status and status != "all":
        query["status"] = status
    if payment_method and payment_method != "all":
        query["payment_method"] = payment_method
    cur = db.orders.find(query).sort("created_at", -1).limit(limit)
    orders = [clean(o) for o in await cur.to_list(limit)]
    # attach customer name
    cust_ids = list({o.get("customer_id") for o in orders if o.get("customer_id")})
    cust_map = {}
    if cust_ids:
        valid_ids = [ObjectId(c) for c in cust_ids if ObjectId.is_valid(c)]
        async for c in db.customers.find({"_id": {"$in": valid_ids}}):
            cust_map[str(c["_id"])] = c.get("name", "")
    for o in orders:
        o["customer_name"] = cust_map.get(o.get("customer_id") or "", "")
    if q:
        ql = q.lower()
        orders = [o for o in orders if ql in str(o.get("order_no", "")).lower() or ql in (o.get("customer_name") or "").lower()]
    return orders


@api.get("/orders/{oid}")
async def get_order(oid: str, shop: dict = Depends(get_shop)):
    if not ObjectId.is_valid(oid):
        raise HTTPException(400, "bad id")
    o = await db.orders.find_one({"_id": ObjectId(oid), "shop_id": shop["id"]})
    if not o:
        raise HTTPException(404, "not found")
    o = clean(o)
    if o.get("customer_id") and ObjectId.is_valid(o["customer_id"]):
        c = await db.customers.find_one({"_id": ObjectId(o["customer_id"])})
        if c:
            o["customer_name"] = c.get("name", "")
            o["customer_phone"] = c.get("phone", "")
    return o


# =========================================================
# UDHAAR
# =========================================================
@api.get("/udhaar")
async def list_udhaar(shop: dict = Depends(get_shop_plan("business"))):
    """Aggregate udhaar per customer."""
    pipeline = [
        {"$match": {"shop_id": shop["id"], "pending_amount": {"$gt": 0}}},
        {"$group": {
            "_id": "$customer_id",
            "pending": {"$sum": "$pending_amount"},
            "last_order_at": {"$max": "$created_at"},
            "count": {"$sum": 1},
        }},
    ]
    rows = await db.orders.aggregate(pipeline).to_list(1000)
    result = []
    for r in rows:
        cid = r["_id"]
        if not cid or not ObjectId.is_valid(cid):
            continue
        c = await db.customers.find_one({"_id": ObjectId(cid)})
        if not c:
            continue
        result.append({
            "customer_id": cid,
            "customer_name": c.get("name", ""),
            "customer_phone": c.get("phone", ""),
            "pending": r["pending"],
            "count": r["count"],
            "last_order_at": r["last_order_at"],
        })
    result.sort(key=lambda x: x["pending"], reverse=True)
    return result


@api.post("/udhaar/pay")
async def udhaar_pay(body: UdhaarPaymentIn, shop: dict = Depends(get_shop_plan("business"))):
    if not ObjectId.is_valid(body.customer_id):
        raise HTTPException(400, "bad customer id")
    remaining = float(body.amount)
    if remaining <= 0:
        raise HTTPException(400, "invalid amount")
    # Apply oldest-first
    cur = db.orders.find({
        "shop_id": shop["id"],
        "customer_id": body.customer_id,
        "pending_amount": {"$gt": 0},
    }).sort("created_at", 1)
    async for o in cur:
        if remaining <= 0:
            break
        pay = min(remaining, float(o["pending_amount"]))
        new_pending = float(o["pending_amount"]) - pay
        new_paid = float(o.get("paid_amount", 0)) + pay
        new_status = "paid" if new_pending == 0 else "udhaar"
        await db.orders.update_one({"_id": o["_id"]}, {"$set": {
            "pending_amount": new_pending,
            "paid_amount": new_paid,
            "status": new_status,
        }})
        remaining -= pay
    await db.udhaar_payments.insert_one({
        "shop_id": shop["id"],
        "customer_id": body.customer_id,
        "amount": float(body.amount),
        "note": body.note or "",
        "created_at": now_iso(),
    })
    return {"ok": True, "unallocated": remaining}


# =========================================================
# DASHBOARD & REPORTS
# =========================================================
def _today_bounds():
    now = datetime.now(timezone.utc)
    start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    return start.isoformat(), now.isoformat()


@api.get("/dashboard")
async def dashboard(shop: dict = Depends(get_shop)):
    start, end = _today_bounds()
    match_today = {"shop_id": shop["id"], "created_at": {"$gte": start, "$lte": end}}
    agg = await db.orders.aggregate([
        {"$match": match_today},
        {"$group": {
            "_id": "$payment_method",
            "total": {"$sum": "$total"},
            "count": {"$sum": 1},
        }},
    ]).to_list(10)
    by_method = {r["_id"]: {"total": r["total"], "count": r["count"]} for r in agg}
    todays_total = sum(v["total"] for v in by_method.values())
    todays_orders = sum(v["count"] for v in by_method.values())
    pending_agg = await db.orders.aggregate([
        {"$match": {"shop_id": shop["id"], "pending_amount": {"$gt": 0}}},
        {"$group": {"_id": None, "pending": {"$sum": "$pending_amount"}}},
    ]).to_list(1)
    total_pending = pending_agg[0]["pending"] if pending_agg else 0
    low_stock = await db.products.find({
        "shop_id": shop["id"],
        "unlimited_stock": {"$ne": True},
        "$expr": {"$lte": ["$stock", "$min_stock"]},
    }).limit(50).to_list(50)
    low_stock = [clean(p) for p in low_stock]
    recent = await db.orders.find({"shop_id": shop["id"]}).sort("created_at", -1).limit(5).to_list(5)
    recent = [clean(o) for o in recent]
    return {
        "today": {
            "sales": todays_total,
            "orders": todays_orders,
            "cash": by_method.get("cash", {}).get("total", 0),
            "upi": by_method.get("upi", {}).get("total", 0),
            "udhaar": by_method.get("udhaar", {}).get("total", 0),
        },
        "total_pending": total_pending,
        "low_stock": low_stock,
        "recent_orders": recent,
    }


@api.get("/reports")
async def reports(shop: dict = Depends(get_shop_plan("business")), period: str = "week"):
    now = datetime.now(timezone.utc)
    if period == "today":
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == "month":
        start = now - timedelta(days=30)
    else:
        start = now - timedelta(days=7)

    match = {"shop_id": shop["id"], "created_at": {"$gte": start.isoformat()}}
    method_agg = await db.orders.aggregate([
        {"$match": match},
        {"$group": {"_id": "$payment_method", "total": {"$sum": "$total"}, "count": {"$sum": 1}}},
    ]).to_list(10)
    by_method = {r["_id"]: r for r in method_agg}

    # Daily series
    orders = await db.orders.find(match).to_list(2000)
    daily = {}
    for o in orders:
        d = (o.get("created_at") or "")[:10]
        daily.setdefault(d, 0)
        daily[d] += o.get("total", 0)
    series = [{"date": k, "total": v} for k, v in sorted(daily.items())]

    # Top products
    prod_totals = {}
    prod_names = {}
    for o in orders:
        for it in o.get("items", []):
            key = it.get("product_id") or it.get("name")
            prod_totals[key] = prod_totals.get(key, 0) + it.get("qty", 0) * it.get("price", 0)
            prod_names[key] = it.get("name")
    top = sorted(
        [{"id": k, "name": prod_names[k], "revenue": v} for k, v in prod_totals.items()],
        key=lambda x: x["revenue"], reverse=True,
    )[:8]

    return {
        "period": period,
        "totals": {
            "sales": sum(r["total"] for r in method_agg),
            "orders": sum(r["count"] for r in method_agg),
            "cash": by_method.get("cash", {}).get("total", 0),
            "upi": by_method.get("upi", {}).get("total", 0),
            "udhaar": by_method.get("udhaar", {}).get("total", 0),
        },
        "series": series,
        "top_products": top,
    }


# =========================================================
# INVOICE PDF
# =========================================================
@api.get("/orders/{oid}/invoice.pdf")
async def invoice_pdf(oid: str, shop: dict = Depends(get_shop)):
    if not ObjectId.is_valid(oid):
        raise HTTPException(400, "bad id")
    o = await db.orders.find_one({"_id": ObjectId(oid), "shop_id": shop["id"]})
    if not o:
        raise HTTPException(404, "not found")
    o = clean(o)
    cust = None
    if o.get("customer_id") and ObjectId.is_valid(o["customer_id"]):
        cust = await db.customers.find_one({"_id": ObjectId(o["customer_id"])})

    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A5, leftMargin=12*mm, rightMargin=12*mm,
                            topMargin=12*mm, bottomMargin=12*mm)
    styles = getSampleStyleSheet()
    h = ParagraphStyle('h', parent=styles['Heading1'], fontSize=16, textColor=colors.HexColor("#1F1A5D"))
    sm = ParagraphStyle('sm', parent=styles['Normal'], fontSize=8, textColor=colors.HexColor("#7B766D"))
    bd = ParagraphStyle('bd', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor("#1F1A5D"))

    story = []
    story.append(Paragraph(shop.get("name", "Shop"), h))
    story.append(Paragraph(f"{shop.get('address','')}", sm))
    story.append(Paragraph(f"{shop.get('phone','')} · UPI: {shop.get('upi_id','')}", sm))
    story.append(Spacer(1, 6))
    story.append(Paragraph(f"<b>Invoice #{o.get('order_no','')}</b>  ·  {o.get('created_at','')[:19].replace('T',' ')}", bd))
    if cust:
        story.append(Paragraph(f"Customer: {cust.get('name','')}  {cust.get('phone','')}", bd))
    story.append(Spacer(1, 8))

    data = [["Item", "Qty", "Price", "Amount"]]
    for it in o.get("items", []):
        data.append([it["name"], str(it["qty"]), f"₹{it['price']:.2f}", f"₹{it['qty']*it['price']:.2f}"])
    tbl = Table(data, colWidths=[70*mm, 15*mm, 25*mm, 25*mm])
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#1F1A5D")),
        ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("FONTSIZE", (0,0), (-1,-1), 9),
        ("BOTTOMPADDING", (0,0), (-1,0), 6),
        ("GRID", (0,0), (-1,-1), 0.25, colors.HexColor("#E1D9CC")),
        ("ALIGN", (1,0), (-1,-1), "RIGHT"),
    ]))
    story.append(tbl)
    story.append(Spacer(1, 8))
    totals = [
        ["Subtotal", f"₹{o.get('subtotal',0):.2f}"],
        ["Discount", f"-₹{o.get('discount',0):.2f}"],
        ["Total", f"₹{o.get('total',0):.2f}"],
        ["Payment", o.get("payment_method","").upper()],
        ["Status", o.get("status","").upper()],
    ]
    t2 = Table(totals, colWidths=[80*mm, 50*mm])
    t2.setStyle(TableStyle([
        ("FONTSIZE", (0,0), (-1,-1), 10),
        ("ALIGN", (1,0), (1,-1), "RIGHT"),
        ("LINEABOVE", (0,2), (-1,2), 0.5, colors.HexColor("#1F1A5D")),
        ("TEXTCOLOR", (0,2), (-1,2), colors.HexColor("#C36A4A")),
    ]))
    story.append(t2)
    story.append(Spacer(1, 10))
    story.append(Paragraph(shop.get("invoice_footer") or "Thank you!", sm))

    doc.build(story)
    buf.seek(0)
    return StreamingResponse(buf, media_type="application/pdf",
                             headers={"Content-Disposition": f'inline; filename="invoice-{o.get("order_no")}.pdf"'})


# =========================================================
# UPI QR helper
# =========================================================
@api.get("/upi/qr")
async def upi_qr(shop: dict = Depends(get_shop), amount: Optional[float] = None):
    """Generate a UPI payment QR (upi://pay?...) if user hasn't uploaded a custom QR."""
    upi_id = shop.get("upi_id")
    if not upi_id:
        raise HTTPException(400, "UPI ID not configured")
    name = shop.get("name", "Shop").replace(" ", "%20")
    url = f"upi://pay?pa={upi_id}&pn={name}&cu=INR"
    if amount:
        url += f"&am={amount:.2f}"
    img = qrcode.make(url)
    b = io.BytesIO()
    img.save(b, format="PNG")
    b.seek(0)
    return StreamingResponse(b, media_type="image/png")


# =========================================================
# Startup
# =========================================================
@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.products.create_index([("shop_id", 1), ("name", 1)])
    await db.customers.create_index([("shop_id", 1), ("name", 1)])
    await db.orders.create_index([("shop_id", 1), ("created_at", -1)])
    await db.orders.create_index([("shop_id", 1), ("order_no", -1)])
    await db.subscriptions.create_index([("user_id", 1), ("created_at", -1)])
    # Seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@dukaan.app").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin12345")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "email": admin_email,
            "name": "Admin",
            "password_hash": hash_password(admin_password),
            "is_admin": True,
            "created_at": now_iso(),
        })
        logger.info(f"Seeded admin: {admin_email}")
    elif not existing.get("is_admin"):
        await db.users.update_one({"_id": existing["_id"]}, {"$set": {"is_admin": True}})
    logger.info("Dukaan API started")


@app.on_event("shutdown")
async def shutdown():
    client.close()


app.include_router(api)


