import pytest
from app.services.discovery_service import discovery_service

def test_normalize_domain_variations():
    cases = [
        ("https://www.example.com/pricing", "example.com"),
        ("http://example.com/", "example.com"),
        ("www.sample.io", "sample.io"),
        ("https://sub.portal.co/login?ref=123", "sub.portal.co"),
    ]
    for raw, expected in cases:
        assert discovery_service.normalize_domain(raw) == expected
