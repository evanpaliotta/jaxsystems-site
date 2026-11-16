"""Protect the approved industry selector and responsive illustration styles."""
import pathlib
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]


class IndustryStyleRecoveryTests(unittest.TestCase):
    def test_approved_selector_and_responsive_styles_are_preserved(self):
        html = (ROOT / 'public/how-we-help.html').read_text()
        # Fixture is recovered from the approved 19eeb58 style block; CI uses a shallow checkout.
        recovered = (ROOT / 'tests/fixtures/approved-industry-responsive.css').read_text()
        # Every original rule must survive, not just an unstyled selector in markup.
        for rule in recovered.splitlines():
            if rule.strip() and not rule.strip().startswith('/*'):
                self.assertIn(rule, html)

    def test_dynamic_ctas_go_directly_to_contact(self):
        js = (ROOT / 'public/how-we-help.js').read_text()
        self.assertNotIn('free-working-session.html', js)
        self.assertNotIn('dedicated free-session page', js)
        self.assertIn('href="contact.html#contact-form"', js)


if __name__ == '__main__':
    unittest.main()
