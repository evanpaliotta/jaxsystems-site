import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const html = readFileSync(new URL('public/how-we-help.html', root), 'utf8');
const js = readFileSync(new URL('public/how-we-help.js', root), 'utf8');
const data = vm.runInNewContext(js.match(/const industries = ([\s\S]*?);\nconst hasIndustry/)[1].replace(/;$/, '').replace(/^/, '(') + ')');

test('customer-facing copy removes illustrative and customer-result disclaimers', () => {
  assert.doesNotMatch(html, /illustrative/i);
  assert.doesNotMatch(html, /not a customer result/i);
  assert.doesNotMatch(js, /ILLUSTRATIVE EXAMPLE/);
  assert.doesNotMatch(js, /Illustrative workflow/);
  assert.doesNotMatch(js, /Illustrative ways to help/);
  for (const item of Object.values(data)) {
    assert.doesNotMatch(item.stageLabel, /illustrative/i);
    assert.doesNotMatch(item.overviewIntro, /illustrative/i);
  }
});

test('industry hero motion keeps reduced-motion protection without visible slider or pause controls', () => {
  assert.doesNotMatch(html, /Pause workflow motion/);
  assert.doesNotMatch(html, /Pause motion/);
  assert.doesNotMatch(html, /motion-beam/);
  assert.doesNotMatch(html, /motion-review/);
  assert.match(html, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(html, /\.stage-flow \.float-card\.first/);
  assert.match(html, /@keyframes card-focus/);
});

test('production JS renders the industry stories without stage slider controls', () => {
  assert.doesNotMatch(js, /function stageMotion\(/);
  assert.doesNotMatch(js, /Pause workflow motion/);
  assert.doesNotMatch(js, /Play workflow motion/);
  assert.match(js, /window\.addEventListener\('popstate'/);
  assert.match(js, /<div class="stage"/);
});
