"""Guard the approved review promotion and removal of identifying About content."""
import re
import unittest
from pathlib import Path

PUBLIC = Path(__file__).resolve().parents[1] / 'public'


class ReviewPublicationTest(unittest.TestCase):
    def test_about_page_and_identity_are_not_published(self):
        self.assertFalse((PUBLIC / 'about.html').exists())
        for page in PUBLIC.iterdir():
            if page.suffix in {'.html', '.js', '.json', '.txt', '.xml', '.svg'}:
                text = page.read_text().lower()
                self.assertNotIn('paliotta', text, page.name)
                self.assertNotRegex(text, r'\bevan\b', page.name)
                self.assertNotRegex(text, r'href=[\"\'][^\"\']*\babout(?:\.html)?[\"\'#?]', page.name)
        for name in ('sitemap.xml', 'llms.txt'):
            self.assertNotIn('jaxsystems.ai/about', (PUBLIC / name).read_text())
        redirects = (PUBLIC / '_redirects').read_text()
        self.assertIn('/about / 302', redirects)
        self.assertIn('/about.html / 302', redirects)

    def test_workflow_heading_is_visible_and_centered(self):
        home = (PUBLIC / 'index.html').read_text()
        self.assertRegex(home, r'<h2 id="workflow-heading"[^>]*>How Jax Systems works\.</h2>')
        self.assertRegex(home, r'<h2 id="workflow-heading"[^>]*style="text-align:\s*center"')
        self.assertLess(home.index('id="workflow-heading"'), home.index('id="workflow-frame"'))

    def test_rejected_eyebrows_are_removed_from_static_and_dynamic_markup(self):
        for page in PUBLIC.iterdir():
            if page.suffix in {'.html', '.js'}:
                self.assertNotRegex(page.read_text(), r'<(?:p|span|div)\b[^>]*class=[\"\'][^\"\']*\b(?:eyebrow|gallery-eyebrow)\b', page.name)

    def test_pricing_steps_are_neutral_and_prices_preserved(self):
        pricing = (PUBLIC / 'pricing.html').read_text()
        self.assertEqual(pricing.count('class="pricing-card"'), 3)
        self.assertNotIn('class="pricing-card featured"', pricing)
        for amount in ('$999 Business Improvement Plan', '$2,499 first standard build', '$499/month ongoing support', '$1,500', '$249/month'):
            self.assertIn(amount, pricing)

    def test_old_workflow_route_redirects_without_duplicate_page(self):
        redirect = (PUBLIC / 'how-it-works.html').read_text()
        self.assertIn("window.location.replace('index.html#workflow-frame')", redirect)
        self.assertNotIn('<nav', redirect)
        for page in PUBLIC.glob('*.html'):
            if page.name != 'how-it-works.html':
                self.assertNotIn('href="how-it-works.html"', page.read_text(), page.name)
