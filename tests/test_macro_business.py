import unittest
from pathlib import Path

PUBLIC = Path(__file__).resolve().parents[1] / 'public'


class MacroBusinessPageTest(unittest.TestCase):
    def test_page_frames_the_selector_as_one_connected_business_system(self):
        html = (PUBLIC / 'ways-we-help.html').read_text()
        self.assertIn('See the business system, then start where it strains.', html)
        self.assertIn('Most businesses share the same connected functions: offer, marketing, sales, delivery, retention, operations, and finance.', html)
        self.assertIn('When one area slips, the others feel it.', html)
        self.assertIn('Explore the connected parts of your business.', html)

    def test_sales_panel_reads_as_a_broad_sales_system_not_just_quote_follow_up(self):
        html = (PUBLIC / 'ways-we-help.html').read_text()
        self.assertIn('Give sales a visible path from first conversation to clear decision.', html)
        self.assertIn('Examples: qualification, proposals, follow-up, approvals, and handoff.', html)
        self.assertNotIn('Keep warm quotes from fading into callbacks and memory.', html)

    def test_mobile_tab_rail_styles_live_in_a_page_specific_stylesheet(self):
        html = (PUBLIC / 'ways-we-help.html').read_text()
        self.assertIn('macro-business.css', html)

        css = (PUBLIC / 'macro-business.css').read_text()
        self.assertIn('.area-trigger-list', css)
        self.assertIn('overflow-x: auto', css)
        self.assertIn('scroll-snap-type: x proximity', css)
        self.assertIn('min-height: 44px', css)


if __name__ == '__main__':
    unittest.main()
