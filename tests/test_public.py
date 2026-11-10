import json
import re
import unittest
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

PUBLIC = Path(__file__).resolve().parents[1] / 'public'
PAGES = {'index.html', 'ways-we-help.html', 'how-it-works.html', 'pricing.html', 'contact.html'}

class Document(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.references = []
        self.ids = set()
        self.feed(html)
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get('id'):
            self.ids.add(attrs['id'])
        for attr in ('href', 'src', 'poster'):
            if attrs.get(attr):
                self.references.append(attrs[attr])

class PublicSiteTest(unittest.TestCase):
    def test_selected_workshop_pages(self):
        self.assertEqual({p.name for p in PUBLIC.glob('*.html')}, PAGES)
        home = (PUBLIC / 'index.html').read_text()
        self.assertIn('Keep the work', home)
        self.assertIn('data-demo', home)
        self.assertIn('hero.mp4', home)
        self.assertNotIn('Our website is on the way', home)

    def test_every_relative_link_asset_and_anchor(self):
        for page in PUBLIC.glob('*.html'):
            doc = Document(page.read_text())
            for ref in doc.references:
                url = urlsplit(ref)
                if url.scheme or url.netloc:
                    continue
                target = (page.parent / unquote(url.path)).resolve() if url.path else page.resolve()
                self.assertTrue(target.is_relative_to(PUBLIC), (page.name, ref))
                self.assertTrue(target.is_file(), (page.name, ref))
                if url.fragment and target.suffix == '.html':
                    self.assertIn(unquote(url.fragment), Document(target.read_text()).ids, (page.name, ref))

    def test_industry_map_and_media(self):
        categories = json.loads((PUBLIC / 'industries.json').read_text())
        self.assertEqual(len(categories), 19)
        self.assertEqual(sum(len(x['examples']) for x in categories), 57)
        for asset in ['hero.mp4', 'poster.webp', 'site.js', 'workshop.js', 'site.css', 'workshop.css']:
            self.assertGreater((PUBLIC / asset).stat().st_size, 0)

    def test_preview_contact_boundary_preserved(self):
        contact = (PUBLIC / 'contact.html').read_text()
        self.assertIn('NOT A BOOKING FORM', contact)
        self.assertIn('preview-form', contact)
        self.assertNotIn('mailto:evan@jaxsystems.ai', contact)

    def test_only_public_site_assets(self):
        self.assertFalse(list(PUBLIC.glob('*.md')))
        self.assertFalse((PUBLIC / '.github').exists())
        self.assertFalse((PUBLIC / 'README.md').exists())
        for page in PUBLIC.glob('*.html'):
            self.assertIn('https://evanpaliotta.github.io/jax-systems/design-lab/', page.read_text())

if __name__ == '__main__':
    unittest.main()
