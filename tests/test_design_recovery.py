import hashlib
import re
import unittest
from pathlib import Path
from urllib.parse import parse_qs, urlsplit

PUBLIC = Path(__file__).resolve().parents[1] / 'public'
PAGES = sorted(PUBLIC.glob('*.html'))
ASSETS = ('site.css', 'workshop.css', 'site.js', 'workshop.js')


class DesignRecoveryTest(unittest.TestCase):
    def test_html_references_content_versioned_css_and_javascript(self):
        for page in PAGES:
            html = page.read_text()
            for asset in ASSETS:
                refs = re.findall(r'(?:href|src)="(' + re.escape(asset) + r'[^\"]*)"', html)
                self.assertEqual(len(refs), 1, (page.name, asset, refs))
                url = urlsplit(refs[0])
                expected = hashlib.sha256((PUBLIC / asset).read_bytes()).hexdigest()[:12]
                self.assertEqual(parse_qs(url.query).get('v'), [expected], (page.name, asset))

    def test_chosen_logo_is_present_in_header_and_footer_on_every_page(self):
        logo = PUBLIC / 'jax-local-makers.webp'
        self.assertTrue(logo.is_file())
        self.assertGreater(logo.stat().st_size, 5000)
        for page in PAGES:
            html = page.read_text()
            self.assertEqual(html.count('src="jax-local-makers.webp"'), 2, page.name)
            self.assertNotIn('<svg viewBox="0 0 48 36"', html, page.name)

    def test_home_has_workshop_structure_without_covering_labels(self):
        html = (PUBLIC / 'index.html').read_text()
        self.assertIn('Win more work. Help more customers. Get more time back.', html)
        self.assertIn('Jacksonville-based AI help for small businesses.', html)
        self.assertIn('class="workshop-intro"', html)
        self.assertIn('class="film-frame"', html)
        self.assertNotIn('class="film-card"', html)
        self.assertNotIn('film-fallback', html)
        self.assertNotIn('Original workshop animation, kept', html)
        self.assertIn('id="examples"', html)


if __name__ == '__main__':
    unittest.main()
