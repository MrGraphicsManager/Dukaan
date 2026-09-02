"""Shared fixtures & helpers for Dukaan backend tests."""
import os
import uuid
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://shopbill-16.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"
ADMIN_EMAIL = "admin@dukaan.app"
ADMIN_PASSWORD = "admin12345"


def _mk_email(prefix="user"):
    return f"test_{prefix}_{uuid.uuid4().hex[:8]}@dukaan.example.com"


@pytest.fixture(scope="session")
def admin_session():
    s = requests.Session()
    s.headers["Content-Type"] = "application/json"
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Admin login failed: {r.text}"
    return s


def activate_sub_for(session: requests.Session, admin_session: requests.Session, plan: str = "business"):
    """Submit a sub for the given user session and admin-activate it."""
    r = session.post(f"{API}/subscriptions/submit", json={
        "plan": plan, "upi_ref": f"TEST{uuid.uuid4().hex[:6].upper()}", "payer_name": "Test"
    })
    assert r.status_code == 200, r.text
    sid = r.json()["id"]
    r = admin_session.post(f"{API}/admin/subscriptions/{sid}/activate")
    assert r.status_code == 200, r.text
    assert r.json()["status"] == "active"
    return sid
