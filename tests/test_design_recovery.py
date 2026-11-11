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

    def test_homepage_headline_has_three_separate_phrases(self):
        html = (PUBLIC / 'index.html').read_text()
        heading = re.search(r'<h1\b[^>]*>(.*?)</h1>', html, re.S)
        self.assertIsNotNone(heading)
        if heading is None:
            return
        phrases = re.findall(r'<span[^>]*>(.*?)</span>', heading.group(1))
        self.assertEqual(phrases, ['Win more work.', 'Help more customers.', 'Get more time back.'])

    def test_remove_requested_homepage_footer_copy(self):
        home = (PUBLIC / 'index.html').read_text()
        self.assertNotIn('Serving Jacksonville and Northeast Florida. Use the contact form to tell us about your business and the workflow you want to improve.', home)

    def test_requested_copy_cleanup_and_relocation(self):
        home = (PUBLIC / 'index.html').read_text()
        ways = (PUBLIC / 'ways-we-help.html').read_text()
        moved = [
            'Missed calls. Quotes waiting on a reply. Updates nobody has time to send.',
            'We connect the loose ends, using the tools you already have.',
        ]
        for phrase in moved:
            self.assertNotIn(phrase, home)
            # Superseded by the approved team-first Ways introduction.
            self.assertNotIn(phrase, ways)
        for phrase in [
            'An illustrative system. Your team stays in control.',
            'These are illustrative examples. They are not customer results, guarantees, or claims that every tool works the same way in every business.',
            'Concrete examples, not hype',
        ]:
            self.assertNotIn(phrase, home)
        self.assertIn('What could that look like in your business?', ways)
        self.assertIn('data-industry-directory', ways)
        self.assertIn('workflow-showcase-card', ways)
        self.assertNotIn('industry-sidebar', ways)
        self.assertNotIn('They stay illustrative on purpose.', ways)
        for page in PAGES:
            self.assertNotIn('Plain-language systems help for owner-led businesses.', page.read_text())

    def test_home_has_visual_workflow_stage_without_decorative_video(self):
        html = (PUBLIC / 'index.html').read_text()
        self.assertIn('Win more work. Help more customers. Get more time back.', html)
        self.assertIn('Jacksonville-based AI help for small businesses.', html)
        self.assertIn('class="workshop-intro"', html)
        self.assertIn('data-demo-stage', html)
        self.assertIn('data-demo-toggle', html)
        self.assertIn('role="tablist"', html)
        self.assertIn('id="examples"', html)
        self.assertNotIn('class="film-frame"', html)
        self.assertNotIn('hero.mp4', html)
        self.assertNotIn('Original workshop animation, kept', html)


if __name__ == '__main__':
    unittest.main()
