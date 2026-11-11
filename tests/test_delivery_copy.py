"""Guard the approved team-first delivery story and industry experience."""
import re
import unittest
from pathlib import Path

PUBLIC = Path(__file__).resolve().parents[1] / 'public'


class DeliveryCopyTest(unittest.TestCase):
    def test_how_it_works_leads_with_delivery_not_payment(self):
        html = (PUBLIC / 'how-it-works.html').read_text()
        headings = re.findall(r'<h2>(.*?)</h2>', html)
        self.assertEqual(headings[:4], [
            'Learn how your business runs.',
            'Find what’s worth fixing.',
            'Build around your team.',
            'Make it part of the day.',
        ])
        self.assertIn('test it with your team', html)
        self.assertIn('runbook', html)
        self.assertIn('pricing.html', html)
        self.assertNotIn('Send the enquiry</h3>', html)
        self.assertNotIn('Price: $999', html)

    def test_how_we_help_uses_the_approved_selector_experience(self):
        html = (PUBLIC / 'how-we-help.html').read_text()
        script = (PUBLIC / 'how-we-help.js').read_text()
        self.assertIn('How we help for Jacksonville small businesses', html)
        self.assertIn('id="industry-label">Jax Systems for</strong>', html)
        self.assertIn('id="industry-toggle"', html)
        self.assertIn('id="help-toggle"', html)
        self.assertIn('id="industry-page"', html)
        self.assertIn('Find your industry.', html)
        self.assertIn('Illustrative ways to help. Your people stay in control.', html)
        self.assertIn('const industries = {', script)
        self.assertIn("searchParams.set('industry'", script)
        self.assertIn("window.addEventListener('popstate'", script)
        self.assertNotIn('workflow-frame', html)
        self.assertNotIn('problem-card', html)
        self.assertNotIn('PREVIEW ONLY', html)


if __name__ == '__main__':
    unittest.main()
