import html
import json
import re
import unittest
from pathlib import Path

PUBLIC = Path(__file__).resolve().parents[1] / 'public'
HTML = (PUBLIC / 'how-we-help.html').read_text()
INDUSTRIES = json.loads((PUBLIC / 'industries.json').read_text())


class IndustryDiscoveryTest(unittest.TestCase):
    maxDiff = None

    def test_industry_page_ships_a_static_discovery_summary_from_canonical_data(self):
        self.assertIn('id="industry-page"', HTML)
        self.assertIn('class="industry-discovery"', HTML)
        self.assertIn('Explore ways we help different businesses.', HTML)
        self.assertIn('The industry selector above needs JavaScript', HTML)
        self.assertEqual(HTML.count('class="industry-summary"'), 19)
        self.assertEqual(HTML.count('class="industry-example"'), 57)

        for industry in INDUSTRIES:
            with self.subTest(industry=industry['id']):
                self.assertIn(f'<h3>{html.escape(industry["name"])}</h3>', HTML)
                self.assertIn(html.escape(industry['audience']), HTML)
                self.assertIn(html.escape(industry['human']), HTML)
                for example in industry['examples']:
                    self.assertIn(html.escape(example['title']), HTML)
                    self.assertIn(html.escape(example['problem']), HTML)
                    self.assertIn(html.escape(example['fix']), HTML)

    def test_industry_page_has_truthful_industries_metadata_and_collection_schema(self):
        self.assertIn('<meta property="og:title" content="Industries for Jacksonville small businesses · Jax Systems">', HTML)
        self.assertIn('<meta name="twitter:title" content="Industries for Jacksonville small businesses · Jax Systems">', HTML)
        self.assertIn('<meta property="og:description" content="Explore practical ways Jacksonville businesses can improve everyday workflows, with your team in control.">', HTML)

        schemas = [json.loads(block) for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>', HTML, re.S)]
        collection = next((schema for schema in schemas if schema.get('@type') == 'CollectionPage'), None)
        self.assertIsNotNone(collection)
        collection = collection or {}
        self.assertEqual(collection['name'], 'Industries for Jacksonville small businesses')
        self.assertEqual(collection['url'], 'https://jaxsystems.ai/how-we-help')
        self.assertEqual(collection['mainEntity']['@type'], 'ItemList')
        self.assertEqual(collection['mainEntity']['numberOfItems'], 19)
        self.assertEqual(
            [item['url'] for item in collection['mainEntity']['itemListElement']],
            [f'https://jaxsystems.ai/how-we-help?industry={industry["id"]}' for industry in INDUSTRIES],
        )
        self.assertEqual(
            [item['name'] for item in collection['mainEntity']['itemListElement']],
            [industry['name'] for industry in INDUSTRIES],
        )


if __name__ == '__main__':
    unittest.main()
