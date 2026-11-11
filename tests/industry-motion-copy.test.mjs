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

test('hero stage ships dedicated visible flow animation CSS with pause support', () => {
  assert.match(html, /\.workflow-motion/);
  assert.match(html, /\.motion-beam/);
  assert.match(html, /\.motion-review/);
  assert.match(html, /@keyframes beam-forward/);
  assert.match(html, /@keyframes review-pulse/);
  assert.match(html, /@keyframes beam-handoff/);
  assert.match(html, /\.stage\.paused \.workflow-motion \*/);
});

test('production JS renders input review handoff motion and honors reduced motion', () => {
  assert.match(js, /function stageMotion\(/);
  assert.match(js, /aria-label="Workflow flow from input to review to handoff"/);
  assert.match(js, /motionMedia = matchMedia\('\(prefers-reduced-motion: reduce\)'\)/);
  assert.match(js, /pause\.disabled = reduce/);
  assert.match(js, /pause\.textContent = reduce \? 'Motion reduced' : \(paused \? 'Play motion' : 'Pause motion'\)/);
  assert.match(js, /page\.querySelector\('\.stage'\)\.classList\.toggle\('paused', paused\)/);
});
