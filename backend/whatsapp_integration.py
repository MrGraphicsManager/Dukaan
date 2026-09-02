import asyncio
import logging
import os
import re
from datetime import datetime, timedelta, timezone

import httpx

logger = logging.getLogger("dukaan.whatsapp")
AUTHKEY_API_KEY = os.getenv("AUTHKEY_API_KEY", "").strip()
AUTHKEY_WID = os.getenv("AUTHKEY_WHATSAPP_WID", "47016").strip()
AUTHKEY_URL = "https://console.authkey.io/restapi/requestjson.php"


def _phone_parts(phone: str):
    digits = re.sub(r"\D", "", str(phone or ""))
    if digits.startswith("91") and len(digits) >= 12:
        return "91", digits[2:]
    if len(digits) == 10:
        return "91", digits
    return "91", digits[-10:] if len(digits) > 10 else digits


async def send_udhaar_whatsapp(*, customer_name: str, shop_name: str, pending_amount: float, phone: str):
    if not AUTHKEY_API_KEY:
        return {"ok": False, "status": "not_configured", "detail": "AUTHKEY_API_KEY is not configured"}
    country_code, mobile = _phone_parts(phone)
    if len(mobile) != 10:
        return {"ok": False, "status": "invalid_phone", "detail": "Customer phone must contain a valid 10-digit Indian number"}

    # Authkey's approved WhatsApp template uses three dynamic values.
    payload = {
        "country_code": country_code,
        "mobile": mobile,
        "wid": AUTHKEY_WID,
        "type": "text",
        "bodyValues": {
            "var1": customer_name,
            "var2": shop_name,
            "var3": f"{pending_amount:.2f}",
        },
    }
    headers = {
        "Authorization": f"Basic {AUTHKEY_API_KEY}",
        "Content-Type": "application/json",
    }
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post(AUTHKEY_URL, json=payload, headers=headers)
        try:
            data = response.json()
        except Exception:
            data = {"raw": response.text[:1000]}
        ok = 200 <= response.status_code < 300
        return {"ok": ok, "status": "sent" if ok else "failed", "http_status": response.status_code, "response": data}
    except Exception as exc:
        logger.exception("Authkey WhatsApp request failed")
        return {"ok": False, "status": "failed", "detail": str(exc)}


async def process_due_udhaar_reminders(db):
    """Send one reminder for pending udhaar orders that are at least 48h old.

    A reminder is recorded on the order so the same order is never sent twice.
    Only Premium shops are processed.
    """
    if not AUTHKEY_API_KEY:
        return {"ok": False, "sent": 0, "skipped": 0, "reason": "AUTHKEY_API_KEY not configured"}

    cutoff = (datetime.now(timezone.utc) - timedelta(days=2)).isoformat()
    sent = skipped = 0
    cursor = db.orders.find({
        "payment_method": "udhaar",
        "pending_amount": {"$gt": 0},
        "created_at": {"$lte": cutoff},
        "whatsapp_udhaar_reminder_sent_at": {"$exists": False},
    }).sort("created_at", 1).limit(200)

    async for order in cursor:
        shop = await db.shops.find_one({"_id": order.get("shop_id")})
        if not shop:
            skipped += 1
            continue
        sub = await db.subscriptions.find_one({
            "user_id": shop.get("owner_id"),
            "plan": "premium",
            "status": "active",
            "$or": [{"expires_at": None}, {"expires_at": {"$gt": datetime.now(timezone.utc).isoformat()}}],
        }, sort=[("activated_at", -1)])
        if not sub or not order.get("customer_id"):
            skipped += 1
            continue
        customer = await db.customers.find_one({"_id": order.get("customer_id")})
        if not customer or not customer.get("phone"):
            skipped += 1
            continue

        result = await send_udhaar_whatsapp(
            customer_name=customer.get("name", "Customer"),
            shop_name=shop.get("name", "Dukaan"),
            pending_amount=float(order.get("pending_amount", 0)),
            phone=customer.get("phone", ""),
        )
        if result.get("ok"):
            await db.orders.update_one({"_id": order["_id"]}, {"$set": {
                "whatsapp_udhaar_reminder_sent_at": datetime.now(timezone.utc).isoformat(),
                "whatsapp_udhaar_reminder_status": "sent",
            }})
            sent += 1
        else:
            await db.orders.update_one({"_id": order["_id"]}, {"$set": {
                "whatsapp_udhaar_reminder_status": result.get("status", "failed"),
                "whatsapp_udhaar_reminder_error": str(result.get("detail", result.get("response", "")))[:500],
            }})
            skipped += 1
    return {"ok": True, "sent": sent, "skipped": skipped}


async def reminder_loop(db):
    """Background loop; checks hourly so the 48h reminder is automatic."""
    while True:
        try:
            result = await process_due_udhaar_reminders(db)
            if result.get("sent"):
                logger.info("WhatsApp udhaar reminders sent: %s", result)
        except asyncio.CancelledError:
            raise
        except Exception:
            logger.exception("WhatsApp reminder loop failed")
        await asyncio.sleep(3600)
