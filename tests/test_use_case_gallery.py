import re
import unittest
from html.parser import HTMLParser
from pathlib import Path

PUBLIC = Path(__file__).resolve().parents[1] / 'public'


class GalleryDocument(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.tabs = []
        self.panels = []
        self.controls = []
        self.svg_count = 0
        self._tab = None
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'button' and attrs.get('role') == 'tab':
            self._tab = {'attrs': attrs, 'text': []}
            self.tabs.append(self._tab)
        if tag == 'article' and attrs.get('role') == 'tabpanel':
            self.panels.append(attrs)
        if tag == 'button' and attrs.get('id') in {'cycle-toggle', 'prev', 'next'}:
            self.controls.append(attrs)
        if tag == 'svg':
            self.svg_count += 1

    def handle_endtag(self, tag):
        if tag == 'button':
            self._tab = None

    def handle_data(self, data):
        if self._tab is not None:
            self._tab['text'].append(data)


class UseCaseGalleryTest(unittest.TestCase):
    def setUp(self):
        self.html = (PUBLIC / 'index.html').read_text()
        self.doc = GalleryDocument(self.html)
        self.script = (PUBLIC / 'site.js').read_text()
        self.styles = (PUBLIC / 'site.css').read_text()

    def test_five_approved_use_cases_replace_the_old_set(self):
        labels = [''.join(tab['text']).strip() for tab in self.doc.tabs]
        self.assertEqual(labels, [
            'Catch the enquiry',
            'Keep quotes moving',
            'Coordinate work',
            'Stop chasing paperwork',
            'Get paid faster',
        ])
        self.assertNotIn('Prepare updates faster', self.html)
        self.assertNotIn('Collect documents', self.html)

    def test_each_tab_has_a_matching_static_illustrated_panel(self):
        self.assertEqual(len(self.doc.panels), 5)
        self.assertEqual(self.doc.svg_count, 10)
        self.assertEqual(self.html.count('class="diagram desktop"'), 5)
        self.assertEqual(self.html.count('class="diagram mobile"'), 5)
        for index, panel in enumerate(self.doc.panels):
            tab = self.doc.tabs[index]['attrs']
            self.assertEqual(panel['id'], f'case-{index}')
            self.assertEqual(panel['aria-labelledby'], tab['id'])
            self.assertEqual(tab['aria-controls'], panel['id'])
        self.assertIn('PAPERWORK CHECKLIST', self.html)
        self.assertIn('FOLLOW-UP QUEUE', self.html)
        self.assertIn('PAYMENT RECEIVED', self.html)

    def test_centered_rail_and_playback_controls_are_present(self):
        self.assertIn('class="tabs" role="tablist"', self.html)
        self.assertEqual({c['id'] for c in self.doc.controls}, {'cycle-toggle', 'prev', 'next'})
        self.assertIn('function centerX', self.script)
        self.assertIn('function rebase', self.script)
        self.assertIn("behavior:animate&&!reduced.matches?'smooth':'instant'", self.script)
        self.assertIn("const fragments=[...tabs]", self.script)
        self.assertIn("clone.setAttribute('aria-hidden','true')", self.script)
        self.assertIn("prefers-reduced-motion: reduce", self.script)
        self.assertIn('mask-image:linear-gradient', self.styles)
        self.assertIn('.panel.is-active', self.styles)

    def test_industry_controls_keep_their_existing_styles(self):
        self.assertIn('.industry-buttons button {', self.styles)
        self.assertIn(".industry-buttons button[aria-pressed='true'] {", self.styles)

    def test_grid_section_cannot_expand_to_the_repeated_rail_width(self):
        rule = re.search(r'\.use-case-gallery \{([^}]+)\}', self.styles)
        self.assertIsNotNone(rule)
        if rule is None:
            return
        self.assertIn('min-width: 0', rule.group(1))

    def test_gallery_does_not_display_a_workflow_count_subtitle(self):
        self.assertNotIn('Five everyday workflows. Built around the way your team works.', self.html)

    def test_first_panel_is_readable_without_javascript(self):
        first = re.search(r'<article class="([^"]+)" role="tabpanel" id="case-0"', self.html)
        self.assertIsNotNone(first)
        if first is None:
            return
        self.assertIn('is-active', first.group(1).split())
        self.assertNotIn('demo-shell', self.html)
        self.assertNotIn('data-demo-title', self.html)


if __name__ == '__main__':
    unittest.main()
