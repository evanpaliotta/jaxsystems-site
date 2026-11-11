import hashlib
import re
import unittest
from pathlib import Path
from urllib.parse import parse_qs, urlsplit

PUBLIC = Path(__file__).resolve().parents[1] / 'public'
PAGES = sorted(PUBLIC.glob('*.html'))
CONTENT_PAGES = [page for page in PAGES if page.name != 'ways-we-help.html']
REQUIRED_ALL = ('site.css', 'site.js')
OPTIONAL_ALL = ('how-we-help.css', 'how-we-help.js', 'workshop.css', 'workshop.js')


class DesignRecoveryTest(unittest.TestCase):
    def test_html_references_content_versioned_css_and_javascript(self):
        for page in PAGES:
            html = page.read_text()
            for asset in REQUIRED_ALL:
                refs = re.findall(r'(?:href|src)="(' + re.escape(asset) + r'[^"]*)"', html)
                if page.name == 'ways-we-help.html':
                    self.assertEqual(len(refs), 0, (page.name, asset, refs))
                    continue
                self.assertEqual(len(refs), 1, (page.name, asset, refs))
                url = urlsplit(refs[0])
                expected = hashlib.sha256((PUBLIC / asset).read_bytes()).hexdigest()[:12]
                self.assertEqual(parse_qs(url.query).get('v'), [expected], (page.name, asset))
            for asset in OPTIONAL_ALL:
                refs = re.findall(r'(?:href|src)="(' + re.escape(asset) + r'[^"]*)"', html)
                self.assertLessEqual(len(refs), 1, (page.name, asset, refs))
                if refs:
                    url = urlsplit(refs[0])
                    expected = hashlib.sha256((PUBLIC / asset).read_bytes()).hexdigest()[:12]
                    self.assertEqual(parse_qs(url.query).get('v'), [expected], (page.name, asset))

    def test_chosen_logo_is_present_in_header_and_footer_on_every_standard_page(self):
        logo = PUBLIC / 'jax-local-makers.webp'
        self.assertTrue(logo.is_file())
        self.assertGreater(logo.stat().st_size, 5000)
        for page in CONTENT_PAGES:
            html = page.read_text()
            if page.name == 'how-we-help.html':
                self.assertGreaterEqual(html.count('src="jax-local-makers.webp"'), 1, page.name)
            else:
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
        how = (PUBLIC / 'how-we-help.html').read_text()
        moved = [
            'Missed calls. Quotes waiting on a reply. Updates nobody has time to send.',
            'We connect the loose ends, using the tools you already have.',
        ]
        for phrase in moved:
            self.assertNotIn(phrase, home)
            self.assertNotIn(phrase, how)
        for phrase in [
            'An illustrative system. Your team stays in control.',
            'These are illustrative examples. They are not customer results, guarantees, or claims that every tool works the same way in every business.',
            'Concrete examples, not hype',
        ]:
            self.assertNotIn(phrase, home)
        self.assertIn('id="industry-page"', how)
        self.assertIn('id="industry-toggle"', how)
        self.assertNotIn('workflow-showcase-card', how)
        self.assertNotIn('They stay illustrative on purpose.', how)
        for page in CONTENT_PAGES:
            self.assertNotIn('Plain-language systems help for owner-led businesses.', page.read_text())

    def test_restored_workshop_animation_and_homepage_gallery(self):
        home = (PUBLIC / 'index.html').read_text()
        how = (PUBLIC / 'how-we-help.html').read_text()
        self.assertIn('class="film-frame"', home)
        self.assertIn('src="hero.mp4"', home)
        self.assertIn('data-motion', home)
        self.assertIn('role="tablist"', home)
        self.assertIn('id="examples"', home)
        self.assertIn('id="industry-page"', how)
        self.assertIn('function showIndustry(id, updateURL = false)', (PUBLIC / 'how-we-help.js').read_text())
        self.assertNotIn('workflow-showcase-card', how)

    def test_homepage_workflow_heading_is_not_duplicated(self):
        html = (PUBLIC / 'index.html').read_text()
        self.assertEqual(html.count('Pick a familiar slowdown.<br>See a clearer way through.'), 1)
        self.assertNotIn('class="hero-note card stack-md"', html)

    def test_home_has_restored_workshop_layout_with_animation(self):
        html = (PUBLIC / 'index.html').read_text()
        self.assertIn('Win more work. Help more customers. Get more time back.', html)
        self.assertIn('Jacksonville-based AI help for small businesses.', html)
        self.assertIn('class="workshop-intro"', html)
        self.assertIn('class="film-frame"', html)
        self.assertIn('hero.mp4', html)
        self.assertIn('data-motion', html)
        self.assertIn('role="tablist"', html)
        self.assertIn('id="examples"', html)
        self.assertNotIn('data-demo-stage', html)
        self.assertNotIn('film-fallback', html)


if __name__ == '__main__':
    unittest.main()
