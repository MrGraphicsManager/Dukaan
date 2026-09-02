"""
Subscription + Admin + PWA tests for the new iteration.
"""
import os
import uuid
import requests
import pytest
from conftest import BASE_URL, API, ADMIN_EMAIL, ADMIN_PASSWORD

EXPECTED_UPI = "priyennaik@okhdfcbank"


def _mk_email():
    return f"test_sub_{uuid.uuid4().hex[:8]}@dukaan.example.com"


# ---- Plans (public) ----
def test_plans_public():
    r = requests.get(f"{API}/plans")
    assert r.status_code == 200, r.text
    data = r.json()
    assert "plans" in data
    assert set(data["plans"].keys()) == {"starter", "business", "premium"}
    assert data.get("upi_id") == EXPECTED_UPI


# ---- Admin login (admin_session fixture provided by conftest.py) ----


def test_admin_me_is_admin(admin_session):
    r = admin_session.get(f"{API}/auth/me")
    assert r.status_code == 200
    assert r.json().get("is_admin") is True


# ---- User + submit sub ----
@pytest.fixture(scope="module")
def user_session():
    s = requests.Session()
    s.headers["Content-Type"] = "application/json"
    email = _mk_email()
    r = s.post(f"{API}/auth/register", json={"name": "SubTester", "email": email, "password": "sub12345"})
    assert r.status_code == 200, r.text
    s.email = email
    return s


def test_submit_subscription_pending(user_session):
    r = user_session.post(f"{API}/subscriptions/submit", json={
        "plan": "business", "upi_ref": "4TEST123", "payer_name": "SubTester"
    })
    assert r.status_code == 200, r.text
    doc = r.json()
    assert doc["status"] == "pending"
    assert doc["plan"] == "business"
    assert doc["upi_ref"] == "4TEST123"
    user_session.sub_id = doc["id"]


def test_my_subscriptions_lists_pending(user_session):
    r = user_session.get(f"{API}/subscriptions/mine")
    assert r.status_code == 200
    arr = r.json()
    assert any(s["id"] == user_session.sub_id and s["status"] == "pending" for s in arr)


# ---- Non-admin forbidden ----
def test_non_admin_forbidden_subs(user_session):
    r = user_session.get(f"{API}/admin/subscriptions")
    assert r.status_code == 403


def test_non_admin_forbidden_stats(user_session):
    r = user_session.get(f"{API}/admin/stats")
    assert r.status_code == 403


# ---- Admin lists pending ----
def test_admin_list_pending(admin_session, user_session):
    r = admin_session.get(f"{API}/admin/subscriptions", params={"status": "pending"})
    assert r.status_code == 200
    arr = r.json()
    assert any(s["id"] == user_session.sub_id for s in arr)


# ---- Admin activate ----
def test_admin_activate(admin_session, user_session):
    sid = user_session.sub_id
    r = admin_session.post(f"{API}/admin/subscriptions/{sid}/activate")
    assert r.status_code == 200, r.text
    doc = r.json()
    assert doc["status"] == "active"
    assert doc["activated_at"] is not None
    assert doc["expires_at"] is not None


def test_user_me_shows_active_sub(user_session):
    r = user_session.get(f"{API}/auth/me")
    assert r.status_code == 200
    sub = r.json().get("subscription")
    assert sub is not None
    assert sub["status"] == "active"


# ---- Reject flow (fresh sub) ----
def test_admin_reject(admin_session):
    # create a fresh user/sub to reject
    s = requests.Session()
    s.headers["Content-Type"] = "application/json"
    email = _mk_email()
    r = s.post(f"{API}/auth/register", json={"name": "RejTester", "email": email, "password": "rej12345"})
    assert r.status_code == 200
    r = s.post(f"{API}/subscriptions/submit", json={"plan": "starter", "upi_ref": "REJ123"})
    assert r.status_code == 200
    sid = r.json()["id"]
    r = admin_session.post(f"{API}/admin/subscriptions/{sid}/reject", params={"note": "invalid ref"})
    assert r.status_code == 200, r.text
    doc = r.json()
    assert doc["status"] == "rejected"
    assert doc.get("review_note") == "invalid ref"


# ---- Admin stats ----
def test_admin_stats(admin_session):
    r = admin_session.get(f"{API}/admin/stats")
    assert r.status_code == 200
    d = r.json()
    for k in ("users", "shops", "active_subscriptions", "pending_subscriptions"):
        assert k in d
        assert isinstance(d[k], int)


# ---- PWA basics ----
def test_manifest_json():
    r = requests.get(f"{BASE_URL}/manifest.json")
    assert r.status_code == 200, r.text
    j = r.json()
    assert j.get("name") == "Dukaan · Shop Assistant"
    assert j.get("start_url") == "/app"
    assert j.get("theme_color") == "#C36A4A"
    assert isinstance(j.get("icons"), list) and len(j["icons"]) >= 1


def test_service_worker():
    r = requests.get(f"{BASE_URL}/sw.js")
    assert r.status_code == 200
    ct = r.headers.get("content-type", "")
    assert "javascript" in ct or "application/javascript" in ct or ct.startswith("text/")
    assert len(r.text) > 50


def test_index_has_manifest_link():
    r = requests.get(f"{BASE_URL}/")
    assert r.status_code == 200
    html = r.text.lower()
    assert 'rel="manifest"' in html or "rel='manifest'" in html
    assert "apple-touch-icon" in html
