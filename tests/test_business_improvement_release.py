"""Protect the approved refinement and real production enquiry flow."""
import re
import unittest
from pathlib import Path

PUBLIC = Path(__file__).resolve().parents[1] / 'public'

class BusinessImprovementReleaseTest(unittest.TestCase):
    def test_approved_homepage(self):
        html = (PUBLIC / 'index.html').read_text()
        self.assertTrue('Jax Systems helps Jacksonville businesses improve how they work—from a free working session on one of seven business areas to a direct build or a full Business Improvement Plan when the next step is clear.' in html)
        self.assertTrue('Request a free working session' in html and 'See the two paid paths' in html)
        self.assertTrue('Business judgment.' in html and 'Hands-on engineering.' in html)
        self.assertTrue('systems that work in the background' in html and 'not learning another tool' in html)
        self.assertTrue('class="experience-illustration"' in html)
        self.assertTrue(html.index('id="workflow-frame"') < html.index('id="experience-heading"') < html.index('id="examples"'))
        css = (PUBLIC / 'refinements.css').read_text()
        self.assertTrue('text-wrap: balance' in css)
        self.assertFalse('hero-intro-panel' in html or 'hero-intro-visual' in html)

    def test_pricing_and_offer_structure(self):
        html = (PUBLIC / 'pricing.html').read_text()
        for part in (
            'free working session',
            'one specific question',
            'Business Improvement Plan',
            'Path A: $2,499 first standard build',
            'Path B: $999 Business Improvement Plan',
            '$1,500',
            '$499/month optional support',
            '$250/month',
            'Priorities',
            'Measurement',
            'One implementation blueprint',
            'You keep the plan either way',
        ):
            self.assertTrue(part in html, part)
        self.assertTrue('targets are not guaranteed results' in html and 'One of seven areas of your business' in html)

    def test_real_contact_form(self):
        html = (PUBLIC / 'contact.html').read_text()
        js = (PUBLIC / 'site.js').read_text()
        self.assertTrue('Request a free working session' in html and 'one free session per business' in html)
        self.assertTrue('challenges.cloudflare.com/turnstile/v0/api.js?render=explicit' in html)
        self.assertTrue('action="/api/contact"' in html and "fetch('/api/contact'" in js)
        for token in ('data-preview-form', 'Local review only', 'nothing is sent', 'form passed validation'):
            self.assertTrue(token not in html and token not in js, token)

    def test_no_personal_identity_or_short_business_name(self):
        for path in PUBLIC.iterdir():
            if path.suffix in ('.html', '.js', '.css', '.json', '.xml', '.txt'):
                text = path.read_text()
                self.assertFalse(re.search(r'\b(?:Evan|Paliotta|Helm|iAltA|Verivend|Accern|Binnacle|Mesmerise)\b', text, re.I), path.name)
                if path.suffix in ('.html', '.js'):
                    text = re.sub(r'<!--.*?-->', '', text, flags=re.S)
                    self.assertFalse(re.search(r'\bJax\b(?!\s+Systems)', text), path.name)
        self.assertFalse((PUBLIC / 'about.html').exists())

if __name__ == '__main__':
    unittest.main()
