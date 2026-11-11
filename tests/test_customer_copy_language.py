import unittest
from pathlib import Path

PUBLIC = Path(__file__).resolve().parents[1] / 'public'

class CopyLanguageTest(unittest.TestCase):
    def test_homepage_does_not_display_example_disclaimer(self):
        html = (PUBLIC / 'index.html').read_text()
        self.assertNotIn('Illustrative workflows, not customer results.', html)
        self.assertIn('Swipe the diagram to browse', html)

    def test_search_text_omits_illustrative_examples_qualifier(self):
        text = (PUBLIC / 'llms.txt').read_text().lower()
        self.assertNotIn('illustrative examples', text)
        self.assertIn('19 industries', text)
