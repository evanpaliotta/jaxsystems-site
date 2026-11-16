import re
import unittest
from pathlib import Path

PUBLIC = Path(__file__).resolve().parents[1] / 'public'


class VisualOfferTest(unittest.TestCase):
    def test_homepage_invitation_is_compact_and_visual_led(self):
        html = (PUBLIC / 'index.html').read_text()
        self.assertIn('id="free-session-invitation"', html)
        self.assertIn('class="session-invitation"', html)
        self.assertIn('class="session-worksheet-visual"', html)
        self.assertIn('One area', html)
        self.assertIn('One question', html)
        self.assertIn('Up to 60 minutes', html)
        self.assertIn('Written summary', html)
        self.assertIn('contact.html#contact-form', html)
        self.assertNotIn('href="free-working-session.html"', html)

    def test_how_we_help_uses_a_seven_area_selector_not_a_card_grid(self):
        html = (PUBLIC / 'ways-we-help.html').read_text()
        self.assertIn('id="seven-area-selector"', html)
        self.assertIn('id="area-visual-stage"', html)
        self.assertEqual(html.count('data-area-trigger='), 7)
        self.assertEqual(html.count('data-area-panel='), 7)
        self.assertNotIn('class="card-grid three-up"', html)
        self.assertIn('Problem', html)
        self.assertIn('Practical fix', html)
        self.assertNotIn('href="free-working-session.html"', html)

    def test_contact_page_leads_with_the_free_session_terms(self):
        html = (PUBLIC / 'contact.html').read_text()
        self.assertIn('id="session-lead"', html)
        self.assertIn('1 area', html)
        self.assertIn('1 question', html)
        self.assertIn('up to 60 minutes', html)
        self.assertIn('written summary', html)
        self.assertIn('small reversible fix', html)
        self.assertIn('owner or decision-maker', html)
        self.assertNotIn('href="free-working-session.html"', html)

    def test_offer_experience_assets_are_loaded_on_relevant_pages(self):
        for page_name in ('index.html', 'ways-we-help.html', 'contact.html'):
            html = (PUBLIC / page_name).read_text()
            with self.subTest(page=page_name):
                self.assertRegex(html, r'offer-experience\.css\?v=[0-9a-f]{12}')
                self.assertRegex(html, r'offer-experience\.js\?v=[0-9a-f]{12}')
        pricing = (PUBLIC / 'pricing.html').read_text()
        self.assertNotIn('offer-experience.css', pricing)


if __name__ == '__main__':
    unittest.main()
