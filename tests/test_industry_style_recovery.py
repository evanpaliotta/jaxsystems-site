"""Protect the approved industry selector and responsive illustration styles."""
import pathlib
import subprocess
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]


class IndustryStyleRecoveryTests(unittest.TestCase):
    def test_approved_selector_and_responsive_styles_are_preserved(self):
        html = (ROOT / 'public/how-we-help.html').read_text()
        approved = subprocess.check_output(
            ['git', 'show', '19eeb58:public/how-we-help.html'], cwd=ROOT, text=True)
        start = approved.index('@media(max-width:760px){.wrap{')
        end = approved.index('.art-wrap:has(.folder-art)', start)
        recovered = approved[start:end].replace(".motion-beam", ".flow-beam").replace(".motion-review", ".flow-review")
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
