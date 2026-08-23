"""
Dukaan backend API tests.
Covers: auth (register/login/me/logout), shops, products, stock, customers,
orders (cash/upi/udhaar), invoice PDF, udhaar payment, dashboard, reports,
multi-tenant isolation.
"""
import os
import time
import uuid
import requests
import pytest
from conftest import API, activate_sub_for


def _mk_email(prefix="owner"):
    return f"test_{prefix}_{uuid.uuid4().hex[:8]}@dukaan.example.com"


@pytest.fixture(scope="module")
def _seed_a(session_a):
    """Create a baseline product + customer for use in Orders/Dashboard tests
    (needed because pytest-xdist loadscope runs classes on separate workers so
    attribute state set in TestProducts is not visible to TestOrders)."""
    r = session_a.post(f"{API}/products", json={
        "name": "TEST_Seed Rice", "category": "Grocery",
        "selling_price": 65, "purchase_price": 50, "stock": 100, "min_stock": 3
    })
    assert r.status_code == 200
    pid = r.json()["id"]
    r = session_a.post(f"{API}/customers", json={"name": "TEST_SeedCust", "phone": "9000000000"})
    assert r.status_code == 200
    cid = r.json()["id"]
    return {"pid": pid, "cid": cid}


@pytest.fixture(scope="module")
def session_a(admin_session):
    s = requests.Session()
    s.headers["Content-Type"] = "application/json"
    email = _mk_email("a")
    r = s.post(f"{API}/auth/register", json={"name": "Owner A", "email": email, "password": "owner12345"})
    assert r.status_code == 200, r.text
    data = r.json()
    s.headers["X-Shop-Id"] = data["default_shop_id"]
    s.email = email
    s.shop_id = data["default_shop_id"]
    s.user_id = data["id"]
    # Activate Business subscription so products/orders/customers all work.
    activate_sub_for(s, admin_session, plan="business")
    return s


@pytest.fixture(scope="module")
def session_b(admin_session):
    s = requests.Session()
    s.headers["Content-Type"] = "application/json"
    email = _mk_email("b")
    r = s.post(f"{API}/auth/register", json={"name": "Owner B", "email": email, "password": "ownerB12345"})
    assert r.status_code == 200
    data = r.json()
    s.headers["X-Shop-Id"] = data["default_shop_id"]
    s.email = email
    s.shop_id = data["default_shop_id"]
    activate_sub_for(s, admin_session, plan="business")
    return s


# -------------------- AUTH --------------------
class TestAuth:
    def test_register_duplicate(self, session_a):
        r = requests.post(f"{API}/auth/register",
                          json={"name": "Dup", "email": session_a.email, "password": "abcdef1"})
        assert r.status_code == 400

    def test_login_success_and_me(self, session_a):
        s2 = requests.Session()
        r = s2.post(f"{API}/auth/login", json={"email": session_a.email, "password": "owner12345"})
        assert r.status_code == 200
        data = r.json()
        assert data["default_shop_id"] == session_a.shop_id
        # /me works
        me = s2.get(f"{API}/auth/me")
        assert me.status_code == 200
        assert me.json()["email"] == session_a.email

    def test_login_invalid(self):
        r = requests.post(f"{API}/auth/login", json={"email": "nobody@x.com", "password": "wrong123"})
        assert r.status_code == 401

    def test_me_requires_auth(self):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_logout(self, session_a):
        s2 = requests.Session()
        s2.post(f"{API}/auth/login", json={"email": session_a.email, "password": "owner12345"})
        r = s2.post(f"{API}/auth/logout")
        assert r.status_code == 200
        assert s2.get(f"{API}/auth/me").status_code == 401


# -------------------- SHOPS --------------------
class TestShops:
    def test_list_shops(self, session_a):
        r = session_a.get(f"{API}/shops")
        assert r.status_code == 200
        assert len(r.json()) >= 1

    def test_create_additional_shop(self, session_a):
        r = session_a.post(f"{API}/shops", json={"name": "TEST_Shop2", "min_stock_default": 3})
        assert r.status_code == 200
        assert r.json()["name"] == "TEST_Shop2"

    def test_shop_required_header(self, session_a):
        s = requests.Session()
        s.post(f"{API}/auth/login", json={"email": session_a.email, "password": "owner12345"})
        # no X-Shop-Id
        r = s.get(f"{API}/products")
        assert r.status_code == 400


# -------------------- PRODUCTS + STOCK --------------------
class TestProducts:
    def test_crud_and_stock(self, session_a):
        # Create
        r = session_a.post(f"{API}/products", json={
            "name": "TEST_Rice 1kg", "category": "Grocery",
            "selling_price": 60, "purchase_price": 50, "stock": 10, "min_stock": 3
        })
        assert r.status_code == 200
        pid = r.json()["id"]
        session_a.pid = pid

        # List + search
        r = session_a.get(f"{API}/products", params={"q": "TEST_Rice"})
        assert r.status_code == 200
        assert any(p["id"] == pid for p in r.json())

        # Update
        r = session_a.put(f"{API}/products/{pid}", json={
            "name": "TEST_Rice 1kg", "category": "Grocery",
            "selling_price": 65, "purchase_price": 50, "stock": 10, "min_stock": 3
        })
        assert r.status_code == 200
        assert r.json()["selling_price"] == 65

        # Adjust stock (+5)
        r = session_a.post(f"{API}/products/{pid}/stock", json={"qty": 5, "reason": "restock"})
        assert r.status_code == 200
        assert r.json()["stock"] == 15


# -------------------- CUSTOMERS --------------------
class TestCustomers:
    def test_create_and_get(self, session_a):
        r = session_a.post(f"{API}/customers", json={"name": "TEST_Ravi", "phone": "9999911111"})
        assert r.status_code == 200
        cid = r.json()["id"]
        session_a.cid = cid
        # get w/ orders
        r = session_a.get(f"{API}/customers/{cid}")
        assert r.status_code == 200
        assert r.json()["name"] == "TEST_Ravi"
        # list has totals
        r = session_a.get(f"{API}/customers")
        assert r.status_code == 200
        found = [c for c in r.json() if c["id"] == cid][0]
        assert "total_pending" in found


# -------------------- ORDERS --------------------
class TestOrders:
    def test_cash_order_decrements_stock(self, session_a, _seed_a):
        pid = _seed_a["pid"]
        stock_before = [p for p in session_a.get(f"{API}/products").json() if p["id"] == pid][0]["stock"]
        r = session_a.post(f"{API}/orders", json={
            "items": [{"product_id": pid, "name": "TEST_Seed Rice", "price": 65, "qty": 2}],
            "discount": 5, "payment_method": "cash", "amount_received": 200
        })
        assert r.status_code == 200, r.text
        o = r.json()
        assert o["status"] == "paid"
        assert o["total"] == 65 * 2 - 5
        assert o["paid_amount"] == o["total"]
        _seed_a["paid_order_id"] = o["id"]

        stock_after = [p for p in session_a.get(f"{API}/products").json() if p["id"] == pid][0]["stock"]
        assert stock_after == stock_before - 2

    def test_udhaar_requires_customer(self, session_a, _seed_a):
        r = session_a.post(f"{API}/orders", json={
            "items": [{"product_id": _seed_a["pid"], "name": "TEST_Seed Rice", "price": 65, "qty": 1}],
            "discount": 0, "payment_method": "udhaar"
        })
        assert r.status_code == 400

    def test_udhaar_order_and_payment(self, session_a, _seed_a):
        r = session_a.post(f"{API}/orders", json={
            "items": [{"product_id": _seed_a["pid"], "name": "TEST_Seed Rice", "price": 65, "qty": 3}],
            "discount": 0, "payment_method": "udhaar",
            "customer_id": _seed_a["cid"]
        })
        assert r.status_code == 200
        o = r.json()
        assert o["status"] == "udhaar"
        assert o["pending_amount"] == 195

        # Udhaar aggregate
        r = session_a.get(f"{API}/udhaar")
        assert r.status_code == 200
        assert any(row["customer_id"] == _seed_a["cid"] and row["pending"] >= 195 for row in r.json())

        # Partial payment
        r = session_a.post(f"{API}/udhaar/pay", json={
            "customer_id": _seed_a["cid"], "amount": 100
        })
        assert r.status_code == 200
        assert r.json()["ok"] is True

        # Order should now have pending 95
        r = session_a.get(f"{API}/orders/{o['id']}")
        assert r.status_code == 200
        assert abs(r.json()["pending_amount"] - 95) < 0.01

    def test_list_orders_filters(self, session_a):
        r = session_a.get(f"{API}/orders", params={"status": "paid"})
        assert r.status_code == 200
        assert all(o["status"] == "paid" for o in r.json())

    def test_invoice_pdf(self, session_a, _seed_a):
        oid = _seed_a.get("paid_order_id")
        if not oid:
            # ensure there's a paid order
            r = session_a.post(f"{API}/orders", json={
                "items": [{"product_id": _seed_a["pid"], "name": "TEST_Seed Rice", "price": 65, "qty": 1}],
                "discount": 0, "payment_method": "cash", "amount_received": 65
            })
            oid = r.json()["id"]
        r = session_a.get(f"{API}/orders/{oid}/invoice.pdf")
        assert r.status_code == 200
        assert r.headers.get("content-type", "").startswith("application/pdf")
        assert r.content[:4] == b"%PDF"


# -------------------- DASHBOARD & REPORTS --------------------
class TestDashboardReports:
    def test_dashboard(self, session_a, _seed_a):
        # Ensure at least one order today exists for this session's shop
        session_a.post(f"{API}/orders", json={
            "items": [{"product_id": _seed_a["pid"], "name": "TEST_Seed Rice", "price": 65, "qty": 1}],
            "discount": 0, "payment_method": "cash", "amount_received": 65
        })
        r = session_a.get(f"{API}/dashboard")
        assert r.status_code == 200
        d = r.json()
        assert "today" in d and "total_pending" in d and "low_stock" in d and "recent_orders" in d
        assert d["today"]["orders"] >= 1

    @pytest.mark.parametrize("period", ["today", "week", "month"])
    def test_reports(self, session_a, period):
        r = session_a.get(f"{API}/reports", params={"period": period})
        assert r.status_code == 200
        j = r.json()
        assert j["period"] == period
        assert "totals" in j and "series" in j and "top_products" in j


# -------------------- MULTI-TENANT ISOLATION --------------------
class TestIsolation:
    def test_user_b_cannot_use_user_a_shop(self, session_a, session_b):
        s = requests.Session()
        s.post(f"{API}/auth/login", json={"email": session_b.email, "password": "ownerB12345"})
        s.headers["X-Shop-Id"] = session_a.shop_id  # A's shop
        r = s.get(f"{API}/products")
        assert r.status_code == 403

    def test_user_b_sees_own_products_only(self, session_a, session_b):
        r = session_b.get(f"{API}/products")
        assert r.status_code == 200
        assert all(p.get("shop_id") == session_b.shop_id for p in r.json())


# -------------------- UPI QR --------------------
class TestUPI:
    def test_upi_qr_400_when_unset(self, session_a):
        r = session_a.get(f"{API}/upi/qr")
        assert r.status_code == 400

    def test_upi_qr_after_setting(self, session_a):
        # Update shop with upi_id
        r = session_a.put(f"{API}/shops/{session_a.shop_id}", json={
            "name": "Owner A's Shop", "upi_id": "test@upi", "min_stock_default": 5
        })
        assert r.status_code == 200
        r = session_a.get(f"{API}/upi/qr")
        assert r.status_code == 200
        assert r.headers.get("content-type", "").startswith("image/png")
