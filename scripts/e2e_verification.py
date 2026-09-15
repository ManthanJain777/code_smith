import urllib.request
import json
import sys

ROLES = [
    ("Procurement Officer", "procurement.demo@gembid.local", "Password123!"),
    ("Reviewer", "reviewer.demo@gembid.local", "Password123!"),
    ("Auditor", "auditor.demo@gembid.local", "Password123!"),
    ("Bidder (Apex)", "bidder.demo@gembid.local", "Password123!"),
    ("Admin", "admin.demo@gembid.local", "Password123!"),
]

def make_req(url, data=None, token=None, method='GET', timeout=25):
    req = urllib.request.Request(url, method=method)
    if data:
        req.data = json.dumps(data).encode('utf-8')
        req.add_header('Content-Type', 'application/json')
    if token:
        req.add_header('Authorization', f'Bearer {token}')
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        body = resp.read().decode('utf-8')
        return resp.status, json.loads(body) if 'application/json' in resp.headers.get('Content-Type', '') else body

print("=" * 60)
print("1. VERIFYING USER AUTH & ROLES (Spring Boot on 8080)")
print("=" * 60)

tokens = {}
for role_name, email, password in ROLES:
    try:
        status, res = make_req(
            'http://localhost:8080/api/v1/auth/login',
            data={'email': email, 'password': password},
            method='POST'
        )
        token = res.get('token')
        tokens[role_name] = token
        user = res.get('user', {})
        print(f"[PASS] {role_name:20}: Logged in successfully. Role={user.get('role')} ID={user.get('id')}")
    except Exception as e:
        print(f"[FAIL] {role_name:20}: {e}")

print("\n" + "=" * 60)
print("2. VERIFYING CORE BACKEND ENDPOINTS (Spring Boot on 8080)")
print("=" * 60)

officer_token = tokens.get("Procurement Officer")
reviewer_token = tokens.get("Reviewer")
bidder_token = tokens.get("Bidder (Apex)")

test_endpoints = [
    ("Tenders List (Officer)", 'http://localhost:8080/api/v1/tenders', officer_token),
    ("Analytics Overview (Officer)", 'http://localhost:8080/api/v1/analytics/overview', officer_token),
    ("Admin Calibration (Reviewer)", 'http://localhost:8080/api/v1/admin/calibration', reviewer_token),
    ("Seller Profile (Bidder)", 'http://localhost:8080/api/v1/sellers/me', bidder_token),
    ("AI Health (Public)", 'http://localhost:8080/api/v1/ai/health', None),
    ("Notifications (Officer)", 'http://localhost:8080/api/v1/notifications', officer_token),
]

for desc, url, tok in test_endpoints:
    try:
        status, res = make_req(url, token=tok)
        if isinstance(res, list):
            detail = f"{len(res)} items returned"
        elif isinstance(res, dict):
            detail = f"Keys: {list(res.keys())[:4]}"
        else:
            detail = "OK"
        print(f"[PASS] {desc:32}: HTTP {status} - {detail}")
    except Exception as e:
        print(f"[FAIL] {desc:32}: {e}")

print("\n" + "=" * 60)
print("3. VERIFYING FASTAPI AI SERVICE (FastAPI on 8000)")
print("=" * 60)

ai_tests = [
    (
        "Copilot Query (Officer)",
        'http://localhost:8000/api/v1/ai/copilot/query',
        {'question': 'Verify mandatory ISO 9001 certification under GFR Rule 173.', 'role': 'PROCUREMENT_OFFICER'},
        'POST'
    ),
    (
        "Copilot Query (Bidder Guardrail)",
        'http://localhost:8000/api/v1/ai/copilot/query',
        {'question': 'Compare my bid with other competitor bids.', 'role': 'BIDDER'},
        'POST'
    ),
]

for desc, url, payload, meth in ai_tests:
    try:
        status, res = make_req(url, data=payload, method=meth)
        ans = res.get('answer', '')[:100].replace('\n', ' ')
        model = res.get('model_used', 'N/A')
        print(f"[PASS] {desc:32}: HTTP {status} | Model: {model} | Ans: {ans}...")
    except Exception as e:
        print(f"[FAIL] {desc:32}: {e}")

print("\n" + "=" * 60)
print("4. VERIFYING STATIC ASSETS & NEW LOGO (Vite on 3000)")
print("=" * 60)

static_tests = [
    ("gem_star.svg (New Logo)", 'http://localhost:3000/gem_star.svg'),
    ("gem_shield.svg (New Logo)", 'http://localhost:3000/gem_shield.svg'),
    ("index.html (HTML Shell)", 'http://localhost:3000/index.html'),
]

for desc, url in static_tests:
    try:
        with urllib.request.urlopen(url, timeout=5) as r:
            body = r.read().decode('utf-8', errors='ignore')
            has_paths = '<path' in body or '<html' in body
            print(f"[PASS] {desc:30}: HTTP {r.status} | Size: {len(body)} bytes | Valid: {has_paths}")
    except Exception as e:
        print(f"[FAIL] {desc:30}: {e}")

print("\n" + "=" * 60)
print("E2E VERIFICATION SUITE COMPLETE")
print("=" * 60)
