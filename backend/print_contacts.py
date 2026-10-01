import httpx

r = httpx.get('http://127.0.0.1:8000/api/v1/leads?limit=20')
leads = r.json()['leads']

print(f"{'Company':<30} | {'Primary Executive':<22} | {'Direct Phone':<18} | {'Direct Email':<32} | {'Service Match'}")
print("-" * 135)
for l in leads:
    dm = l['decision_makers'][0] if l.get('decision_makers') else {}
    company = l['company_name']
    name = dm.get('full_name', 'N/A')
    phone = dm.get('phone', 'N/A')
    email = dm.get('email', 'N/A')
    srv = l.get('opportunity', {}).get('recommended_service', 'N/A')
    print(f"{company:<30} | {name:<22} | {phone:<18} | {email:<32} | {srv}")
