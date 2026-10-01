import httpx

r = httpx.get('http://127.0.0.1:8000/api/v1/leads?limit=20')
leads = r.json()['leads']

for l in leads:
    print(f"\n### {l['company_name']} ({l.get('city', '')}, {l.get('country', '')})")
    print(f"- **Website:** {l['website_url']} | **Company Phone:** `{l.get('phone', 'N/A')}`")
    print(f"- **Recommended Service:** [{l.get('opportunity', {}).get('recommended_service', 'N/A')}](https://labs-terminal.vercel.app/services)")
    print(f"- **Identified Pain:** {l.get('opportunity', {}).get('primary_problem', 'N/A')}")
    print(f"- **Executive Contacts:**")
    for dm in l.get('decision_makers', []):
        p_badge = " *(Primary)*" if dm.get('is_primary') else ""
        print(f"  - **{dm['full_name']}** — {dm['title']}{p_badge}")
        print(f"    - **Phone / WhatsApp:** [`{dm.get('phone')}`](tel:{dm.get('phone')}) | [Chat on WhatsApp](https://wa.me/{dm.get('phone', '').replace(' ', '').replace('+', '').replace('(', '').replace(')', '').replace('-', '')})")
        print(f"    - **Email:** [`{dm.get('email')}`](mailto:{dm.get('email')}) (Confidence: {int(dm.get('email_confidence', 0)*100)}%)")
        print(f"    - **LinkedIn:** [{dm['full_name']} Profile]({dm.get('linkedin_url')})")
        print(f"    - **Source Provenance:** {dm.get('provenance_note')}")
