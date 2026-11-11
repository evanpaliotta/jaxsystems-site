import hashlib
import re
import unittest
from pathlib import Path

PUBLIC = Path(__file__).resolve().parents[1] / 'public'


class WorkflowVisualTest(unittest.TestCase):
    def test_ways_introduction_uses_approved_workflow_visual(self):
        html = (PUBLIC / 'ways-we-help.html').read_text()
        heading = html.index('<h1>Solutions built around the way your business works.</h1>')
        self.assertIn('id="workflow-frame"', html)
        visual = html.index('id="workflow-frame"')
        examples = html.index('What could that look like in your business?')
        self.assertLess(heading, visual)
        self.assertLess(visual, examples)
        self.assertIn('id="svg-desktop"', html)
        self.assertIn('id="svg-mobile"', html)
        for marker in ['Understand your day', 'Find the bottleneck', 'Build and test together', 'Put it to work', 'Simplify', 'Connect', 'Automate', 'Team approval']:
            self.assertIn(marker, html)
        self.assertEqual(len(re.findall(r'class="step-btn" data-step=', html)), 4)
        self.assertIn('id="btn-toggle"', html)
        self.assertIn('id="btn-all"', html)
        self.assertIn('id="btn-replay"', html)
        self.assertNotIn('We work alongside your team to find what’s slowing things down and build practical solutions', html)
        self.assertNotIn('You don’t need to know what to automate.', html)
        self.assertIn('industry-layout', html)
        self.assertEqual(html.count('class="example-card"'), 57)

    def test_workflow_assets_are_content_versioned_and_only_on_ways(self):
        ways = (PUBLIC / 'ways-we-help.html').read_text()
        for ext in ('css', 'js'):
            matches = re.findall(r'(?:href|src)="(workflow-visual-([0-9a-f]{12})\.' + ext + r')"', ways)
            self.assertEqual(len(matches), 1)
            name, digest = matches[0]
            self.assertEqual(hashlib.sha256((PUBLIC / name).read_bytes()).hexdigest()[:12], digest)
            for page in PUBLIC.glob('*.html'):
                if page.name != 'ways-we-help.html':
                    self.assertNotIn(name, page.read_text())


if __name__ == '__main__':
    unittest.main()
