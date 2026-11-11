import json
import re
import unittest
from pathlib import Path

PUBLIC = Path(__file__).resolve().parents[1] / 'public'


class WorkflowVisualTest(unittest.TestCase):
    def test_how_we_help_script_covers_all_industries_and_thumbnails(self):
        html = (PUBLIC / 'how-we-help.html').read_text()
        script = (PUBLIC / 'how-we-help.js').read_text()
        categories = json.loads((PUBLIC / 'industries.json').read_text())
        self.assertIn('id="industry-page"', html)
        self.assertIn('id="help-navigation"', html)
        self.assertIn('Find your industry.', html)
        self.assertIn('function industryThumbnail(id)', script)
        self.assertIn('function showIndustry(id, updateURL = false)', script)
        self.assertIn('history.pushState', script)
        self.assertIn("window.addEventListener('popstate'", script)
        self.assertNotIn('not a customer result', script)
        self.assertEqual(sum(len(item['examples']) for item in categories), 57)
        for item in categories:
            self.assertIn(item['id'] + ':', script)
            self.assertIn(item['name'], script)
        self.assertEqual(script.count('"boundary": '), 19)

    def test_workflow_visual_assets_ship_only_on_home(self):
        how_it_works = (PUBLIC / 'index.html').read_text()
        self.assertIn('workflow-visual-6428c1f98a21.css', how_it_works)
        self.assertIn('workflow-visual-7ba2a9654c72.js', how_it_works)
        self.assertIn('id="workflow-frame"', how_it_works)
        for page in PUBLIC.glob('*.html'):
            if page.name == 'index.html':
                continue
            html = page.read_text()
            self.assertNotIn('workflow-visual-6428c1f98a21.css', html, page.name)
            self.assertNotIn('workflow-visual-7ba2a9654c72.js', html, page.name)
            self.assertNotIn('id="workflow-frame"', html, page.name)


if __name__ == '__main__':
    unittest.main()
