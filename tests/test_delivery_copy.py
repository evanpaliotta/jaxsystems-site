"""Guard the approved team-first delivery story and industry experience."""
import re
import unittest
from pathlib import Path

PUBLIC = Path(__file__).resolve().parents[1] / 'public'


class DeliveryCopyTest(unittest.TestCase):
    def test_how_it_works_leads_with_delivery_not_payment(self):
        html = (PUBLIC / 'how-it-works.html').read_text()
        self.assertNotIn('What the four steps mean in practice', html)
        self.assertNotIn('<section class="section" aria-label="Our approach">', html)
        self.assertIn('id="workflow-frame"', html)
        self.assertEqual(html.count('class="workflow-description"'), 4)
        self.assertLess(html.index('id="workflow-frame"'), html.index('A clear scope at every step.'))
        for heading in ['Understand your day', 'Find the bottleneck', 'Build and test together', 'Put it to work']:
            self.assertIn(heading, html)
        self.assertIn('documentation your team can use', html)
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
        self.assertIn('Your people stay in control.', html)
        self.assertIn('const industries = {', script)
        self.assertIn("searchParams.set('industry'", script)
        self.assertIn("window.addEventListener('popstate'", script)
        self.assertNotIn('workflow-frame', html)
        self.assertNotIn('problem-card', html)
        self.assertNotIn('PREVIEW ONLY', html)


if __name__ == '__main__':
    unittest.main()
