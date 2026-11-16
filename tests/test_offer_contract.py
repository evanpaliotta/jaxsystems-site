"""Regression coverage for the approved free-session / two-path / seven-area offer."""
import unittest
from pathlib import Path

PUBLIC = Path(__file__).resolve().parents[1] / 'public'
AREAS = [
    'Offer',
    'Marketing',
    'Sales',
    'Delivery and customer experience',
    'Retention',
    'Operations and people',
    'Finance',
]


class OfferContractTest(unittest.TestCase):
    def test_entry_pages_lead_with_the_free_working_session(self):
        home = (PUBLIC / 'index.html').read_text().lower()
        contact = (PUBLIC / 'contact.html').read_text().lower()
        ways = (PUBLIC / 'ways-we-help.html').read_text().lower()
        how_help = ((PUBLIC / 'how-we-help.html').read_text() + (PUBLIC / 'how-we-help.js').read_text()).lower()
        llms = (PUBLIC / 'llms.txt').read_text().lower()
        for name, text in {
            'home': home,
            'contact': contact,
            'ways-we-help': ways,
            'how-we-help': how_help,
            'llms': llms,
        }.items():
            with self.subTest(page=name):
                self.assertIn('free working session', text)

    def test_contact_page_sets_the_session_boundaries(self):
        contact = (PUBLIC / 'contact.html').read_text()
        for marker in (
            'one question',
            'up to 60 minutes',
            'owner or decision-maker',
            'one free session per business',
            'read-only unless',
            'written summary',
        ):
            with self.subTest(marker=marker):
                self.assertIn(marker, contact)

    def test_pricing_page_explains_the_two_paid_paths_and_credit(self):
        pricing = (PUBLIC / 'pricing.html').read_text()
        for marker in (
            'Build one improvement · $2,499',
            'Business Improvement Plan · $999',
            '$1,500',
            '$499/month optional support',
            '$250/month',
            'signed scope card',
            'One implementation blueprint',
            'credited in full',
        ):
            with self.subTest(marker=marker):
                self.assertIn(marker, pricing)

    def test_pricing_omits_duplicate_area_catalogue(self):
        pricing = (PUBLIC / 'pricing.html').read_text()
        self.assertNotIn('id="seven-areas-heading"', pricing)
        self.assertNotIn('The seven business areas stay the same.', pricing)
        for marker in ('$999', '$2,499', '$499/month', '$1,500', '$250/month'):
            self.assertIn(marker, pricing)

    def test_seven_business_areas_remain_in_the_help_catalogues(self):
        how_help = (PUBLIC / 'how-we-help.js').read_text()
        ways = (PUBLIC / 'ways-we-help.html').read_text()
        for area in AREAS:
            with self.subTest(area=area):
                self.assertIn(area, ways)
                self.assertIn(area, how_help)

    def test_pricing_metadata_and_repeat_scope_match_the_approved_offer(self):
        pricing = (PUBLIC / 'pricing.html').read_text()
        self.assertIn('content="Jacksonville pricing for a free working session, direct builds and Business Improvement Plans with optional support and clearly scoped follow-on work.', pricing)
        self.assertNotIn('pricing for discovery', pricing)
        self.assertIn('approved setup and access', pricing)
        self.assertNotIn('setup and approach', pricing)


if __name__ == '__main__':
    unittest.main()
