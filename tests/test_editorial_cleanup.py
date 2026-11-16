"""Reject leftover offer labels and unfinished customer-facing copy sitewide."""
import re
import unittest
from pathlib import Path

PUBLIC = Path(__file__).resolve().parents[1] / 'public'


class EditorialCleanupTest(unittest.TestCase):
    def test_rejected_copy_is_absent_from_static_and_generated_content(self):
        rejected = ('1. Free working session', 'Path A', 'Path B', '2A.', '2B.',
                    'what stays exact', 'pricing story', 'Priorities and Measurement',
                    'the full $999 is credited in full',
                    'If secure spam protection is enabled, it will appear here.',
                    'Are refund or credit-expiry terms set here?')
        for file in PUBLIC.iterdir():
            if file.suffix not in ('.html', '.js', '.txt'):
                continue
            text = file.read_text()
            for phrase in rejected:
                with self.subTest(file=file.name, phrase=phrase):
                    flags = 0 if phrase == 'Priorities and Measurement' else re.I
                    self.assertIsNone(re.search(r'(?<!\w)' + re.escape(phrase) + r'(?!\w)', text, flags), phrase)

    def test_industry_page_has_the_shared_mobile_navigation(self):
        html = (PUBLIC / 'how-we-help.html').read_text()
        self.assertRegex(html, r'<button[^>]*class="menu-toggle"[^>]*aria-controls="site-nav"')
        self.assertRegex(html, r'<nav[^>]*class="header-right site-nav"[^>]*id="site-nav"')
        css = (PUBLIC / 'how-we-help.css').read_text()
        self.assertIn('body.how-help-page .header-right .header-link', css)
        self.assertIn('body.how-help-page .header-right .header-cta', css)

    def test_payment_terms_keep_the_pre_payment_agreement_boundary(self):
        html = (PUBLIC / 'pricing.html').read_text()
        self.assertIn('Scope, payment, refund and any credit-expiry terms must be agreed in writing before payment.', html)
        self.assertNotRegex(html, r'(?i)(non-refundable|refund within|credit expires after)')
