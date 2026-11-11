"""Guard the approved team-first delivery story and example directory."""
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

    def test_ways_opens_with_partnership_then_examples(self):
        html = (PUBLIC / 'ways-we-help.html').read_text()
        self.assertIn('<h1>Solutions built around the way your business works.</h1>', html)
        self.assertIn('You don’t need to know what to automate.', html)
        self.assertIn('What could that look like in your business?', html)
        self.assertNotIn('Start with the problem you already feel', html)
        self.assertNotIn('Most owners do not need', html)
        self.assertNotIn('problem-card', html)
        self.assertIn('industry-layout', html)
        self.assertEqual(html.count('class="example-card"'), 57)


if __name__ == '__main__':
    unittest.main()
