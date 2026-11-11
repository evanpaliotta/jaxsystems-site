import json
import re
import unittest
from html import unescape
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

PUBLIC = Path(__file__).resolve().parents[1] / 'public'
CORE_PAGES = {
    'index.html',
    'ways-we-help.html',
    'how-it-works.html',
    'pricing.html',
    'contact.html',
}
EXTRA_PAGES = {'about.html', 'privacy.html'}
ALL_PAGES = CORE_PAGES | EXTRA_PAGES
CANONICAL_BASE = 'https://jaxsystems.ai/'
TAGLINE = 'Win more work. Help more customers. Get more time back.'
LOCAL_DESCRIPTOR = 'Jacksonville-based AI help for small businesses.'


class Document(HTMLParser):
    def __init__(self, html: str):
        super().__init__()
        self.references = []
        self.ids = set()
        self.titles = []
        self.meta = []
        self.forms = []
        self.inputs = []
        self.labels = []
        self.scripts = []
        self.headings = []
        self._capture = None
        self._text = []
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get('id'):
            self.ids.add(attrs['id'])
        for attr in ('href', 'src', 'poster'):
            if attrs.get(attr):
                self.references.append(attrs[attr])
        if tag == 'meta':
            self.meta.append(attrs)
        elif tag == 'form':
            self.forms.append(attrs)
        elif tag in {'input', 'textarea', 'button'}:
            self.inputs.append((tag, attrs))
        elif tag == 'label':
            self.labels.append(attrs)
        elif tag == 'script' and attrs.get('type') == 'application/ld+json':
            self._capture = 'jsonld'
            self._text = []
        elif tag == 'title':
            self._capture = 'title'
            self._text = []
        elif tag in {'h1', 'h2', 'h3'}:
            self._capture = tag
            self._text = []

    def handle_endtag(self, tag):
        if tag == 'script' and self._capture == 'jsonld':
            self.scripts.append(''.join(self._text).strip())
            self._capture = None
        elif tag == 'title' and self._capture == 'title':
            self.titles.append(''.join(self._text).strip())
            self._capture = None
        elif tag in {'h1', 'h2', 'h3'} and self._capture == tag:
            self.headings.append((tag, ''.join(self._text).strip()))
            self._capture = None

    def handle_data(self, data):
        if self._capture:
            self._text.append(data)


class PublicSiteTest(unittest.TestCase):
    maxDiff = None

    def test_expected_pages_exist(self):
        self.assertEqual({p.name for p in PUBLIC.glob('*.html')}, ALL_PAGES)

    def test_homepage_has_approved_positioning(self):
        home = (PUBLIC / 'index.html').read_text()
        self.assertIn(TAGLINE, home)
        self.assertIn(LOCAL_DESCRIPTOR, home)
        self.assertIn('Tell us what’s slowing you down', home)
        self.assertIn('Pick a familiar slowdown.<br>See a clearer way through.', home)
        self.assertIn('class="film-frame"', home)
        self.assertIn('hero.mp4', home)
        self.assertIn('data-motion', home)
        self.assertNotIn('data-demo-stage', home)
        self.assertNotIn('design study', home.lower())
        self.assertNotIn('prototype', home.lower())
        self.assertNotIn('design-lab', home)
        self.assertNotIn('5-star', home.lower())
        self.assertNotIn('testimonial', home.lower())

    def test_metadata_canonicals_and_jsonld(self):
        required_title_bits = {
            'index.html': 'Jacksonville AI help',
            'ways-we-help.html': 'Ways we help',
            'how-it-works.html': 'How it works',
            'pricing.html': 'Pricing',
            'contact.html': 'Contact',
            'about.html': 'About',
            'privacy.html': 'Privacy',
        }
        descriptions = set()
        for page_name in ALL_PAGES:
            html = (PUBLIC / page_name).read_text()
            doc = Document(html)
            self.assertEqual(len(doc.titles), 1, page_name)
            title = doc.titles[0]
            self.assertIn(required_title_bits[page_name], title, page_name)
            self.assertIn('Jax Systems', title, page_name)

            description = next((m['content'] for m in doc.meta if m.get('name') == 'description'), None)
            self.assertTrue(description, page_name)
            self.assertIn('Jacksonville', description, page_name)
            descriptions.add(description)

            canonical = re.search(r'<link[^>]+rel="canonical"[^>]+href="([^"]+)"', html)
            self.assertIsNotNone(canonical, page_name)
            expected = CANONICAL_BASE if page_name == 'index.html' else CANONICAL_BASE + page_name.removesuffix('.html')
            self.assertEqual(canonical.group(1), expected, page_name)

            robots = next((m['content'] for m in doc.meta if m.get('name') == 'robots'), '')
            self.assertNotIn('noindex', robots.lower(), page_name)

            schemas = [json.loads(script) for script in doc.scripts]
            schema_types = {schema.get('@type') for schema in schemas}
            self.assertIn('Organization', schema_types, page_name)
            self.assertIn('WebSite', schema_types, page_name)
            self.assertIn('Service', schema_types, page_name)
            for schema in schemas:
                schema_text = json.dumps(schema)
                self.assertNotIn('review', schema_text.lower(), page_name)
                self.assertNotIn('aggregateRating', schema_text, page_name)
                self.assertNotIn('PostalAddress', schema_text, page_name)
        self.assertEqual(len(descriptions), len(ALL_PAGES))

    def test_contact_page_uses_real_api_contract_and_accessible_labels(self):
        html = (PUBLIC / 'contact.html').read_text()
        doc = Document(html)
        self.assertNotIn('POST /api/contact', html)
        self.assertNotIn('GET /api/contact', html)
        form = next((form for form in doc.forms if form.get('id') == 'contact-form'), None)
        self.assertIsNotNone(form)
        self.assertEqual(form.get('method', '').lower(), 'post')
        self.assertEqual(form.get('action'), '/api/contact')

        labels = {label.get('for') for label in doc.labels}
        field_ids = {'name', 'email', 'business', 'message', 'website'}
        self.assertTrue(field_ids.issubset(labels))

        input_map = {attrs.get('id'): (tag, attrs) for tag, attrs in doc.inputs if attrs.get('id')}
        self.assertEqual(input_map['name'][1].get('name'), 'name')
        self.assertEqual(input_map['email'][1].get('name'), 'email')
        self.assertEqual(input_map['business'][1].get('name'), 'business')
        self.assertEqual(input_map['message'][1].get('name'), 'message')
        self.assertEqual(input_map['website'][1].get('name'), 'website')
        self.assertEqual(input_map['website'][1].get('autocomplete'), 'off')
        self.assertIn('Tell us what’s slowing you down', html)
        self.assertIn('We only treat this as received after the message is actually delivered.', html)
        self.assertNotIn('Nothing is sent or saved', html)
        self.assertNotIn('preview-form', html)
        self.assertNotIn('mailto:', html)

    def test_all_relative_links_assets_and_anchors_resolve(self):
        for page in PUBLIC.glob('*.html'):
            doc = Document(page.read_text())
            for ref in doc.references:
                url = urlsplit(ref)
                if url.scheme or url.netloc:
                    continue
                if url.path.startswith('/'):
                    target = (PUBLIC / url.path.lstrip('/')).resolve()
                else:
                    target = (page.parent / unquote(url.path)).resolve() if url.path else page.resolve()
                self.assertTrue(target.is_relative_to(PUBLIC), (page.name, ref))
                self.assertTrue(target.is_file(), (page.name, ref))
                if url.fragment and target.suffix == '.html':
                    self.assertIn(unquote(url.fragment), Document(target.read_text()).ids, (page.name, ref))

    def test_industries_and_examples_preserved(self):
        categories = json.loads((PUBLIC / 'industries.json').read_text())
        self.assertEqual(len(categories), 19)
        self.assertEqual(sum(len(x['examples']) for x in categories), 57)
        ways = unescape((PUBLIC / 'ways-we-help.html').read_text())
        self.assertIn('19 industries', ways)
        self.assertIn('57 examples', ways)
        self.assertIn('Illustrative examples', ways)
        self.assertIn('industry-layout', ways)
        self.assertIn('industry-sidebar', ways)
        self.assertNotIn('workflow-showcase-card', ways)
        for industry in categories:
            self.assertIn(industry['name'], ways)
            self.assertIn(industry['human'], ways)
            for example in industry['examples']:
                self.assertIn(example['title'], ways)

    def test_search_and_discovery_files_exist(self):
        sitemap = (PUBLIC / 'sitemap.xml').read_text()
        for page in sorted(ALL_PAGES):
            loc = CANONICAL_BASE if page == 'index.html' else CANONICAL_BASE + page.removesuffix('.html')
            self.assertIn(f'<loc>{loc}</loc>', sitemap)

        robots = (PUBLIC / 'robots.txt').read_text()
        self.assertIn('Sitemap: https://jaxsystems.ai/sitemap.xml', robots)
        self.assertIn('Allow: /', robots)

        llms = (PUBLIC / 'llms.txt').read_text()
        self.assertIn('https://jaxsystems.ai/', llms)
        self.assertIn('Jacksonville-based AI help for small businesses.', llms)

    def test_public_assets_and_copy_boundaries(self):
        for asset in ['hero.mp4', 'poster.webp', 'site.js', 'workshop.js', 'site.css', 'workshop.css', 'sitemap.xml', 'robots.txt', 'llms.txt']:
            self.assertGreater((PUBLIC / asset).stat().st_size, 0)
        blocked = [
            'design study',
            'design lab',
            'booking not connected',
            'prototype',
            'our website is on the way',
            'fake review',
            'guaranteed results',
        ]
        for page in PUBLIC.glob('*.html'):
            text = page.read_text().lower()
            for needle in blocked:
                self.assertNotIn(needle, text, (page.name, needle))


if __name__ == '__main__':
    unittest.main()
