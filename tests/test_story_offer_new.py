"""Targeted coverage for the revised Jax Systems story and offer pages."""
import re
import unittest
from pathlib import Path

PUBLIC = Path(__file__).resolve().parents[1] / 'public'


class StoryOfferRefreshTest(unittest.TestCase):
    def test_homepage_keeps_headline_video_and_broad_small_business_positioning(self):
        home = (PUBLIC / 'index.html').read_text()
        self.assertIn('Win more work. Help more customers. Get more time back.', home)
        self.assertIn('hero.mp4', home)
        self.assertIn('Practical AI and better systems for Jacksonville small businesses', home)
        self.assertIn('even if you do not yet know what to fix.', home)
        self.assertNotIn('from a free working session on one of seven business areas to a direct build or a full Business Improvement Plan when the next step is clear.', home)

    def test_pricing_uses_consumer_friendly_paths_and_keeps_written_terms(self):
        pricing = (PUBLIC / 'pricing.html').read_text()
        self.assertIn('Know what to fix?', pricing)
        self.assertIn('Need a wider view?', pricing)
        for amount in ('$2,499', '$999', '$1,500', '$499/month', '$250/month'):
            self.assertIn(amount, pricing)
        self.assertIn('must be agreed in writing before payment', pricing)
        self.assertNotIn('Important limits and unresolved terms.', pricing)
        self.assertNotIn('does not invent rules', pricing)

    def test_contact_shows_an_honest_sample_written_summary(self):
        contact = (PUBLIC / 'contact.html').read_text()
        self.assertIn('Sample written summary', contact)
        self.assertIn('Possible bottleneck', contact)
        self.assertIn('Possible recommendation', contact)
        self.assertIn('Possible next step', contact)
        self.assertIn('A sample, not a client story.', contact)

    def test_pricing_bottom_callout_has_one_cta(self):
        pricing = (PUBLIC / 'pricing.html').read_text()
        callout = re.search(r'<section class="section"><div class="pricing-callout">(.*?)</div></section>', pricing, re.S)
        self.assertIsNotNone(callout)
        if callout is None:
            self.fail('pricing callout missing')
        self.assertEqual(callout.group(1).count('href="contact.html#contact-form"'), 1)


if __name__ == '__main__':
    unittest.main()
