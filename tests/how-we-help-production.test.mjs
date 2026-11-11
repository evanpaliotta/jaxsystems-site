import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const html = readFileSync(new URL('public/how-we-help.html', root), 'utf8');
const redirectHtml = readFileSync(new URL('public/ways-we-help.html', root), 'utf8');
const js = readFileSync(new URL('public/how-we-help.js', root), 'utf8');
const canonical = JSON.parse(readFileSync(new URL('public/industries.json', root), 'utf8'));
const data = vm.runInNewContext(js.match(/const industries = ([\s\S]*?);\nconst hasIndustry/)[1].replace(/;$/, '').replace(/^/, '(') + ')');
const drawingsSource = js.match(/const drawings = \{([\s\S]*?)\n  \};/m)[1];
const drawingIds = [...drawingsSource.matchAll(/^\s*([a-z]+):/gm)].map(match => match[1]);

test('production page uses How we help metadata without preview-only markers', () => {
  assert.match(html, /<title>How we help for Jacksonville small businesses · Jax Systems<\/title>/);
  assert.match(html, /rel="canonical" href="https:\/\/jaxsystems.ai\/how-we-help"/);
  assert.doesNotMatch(html, /PREVIEW ONLY/);
  assert.doesNotMatch(html, /noindex,nofollow/);
  assert.doesNotMatch(html, /live website has not changed/);
  assert.match(html, /id="industry-label">Jax Systems for<\/strong>/);
  assert.match(html, /id="help-navigation"/);
});

test('script keeps the exact 19 canonical industries and 57 approved stories', () => {
  assert.deepEqual(Object.keys(data), canonical.map(item => item.id));
  const stories = Object.values(data).flatMap(item => item.stories.map(story => story.title));
  assert.equal(stories.length, 57);
  assert.equal(new Set(stories).size, 57);
  for (const item of canonical) {
    assert.equal(data[item.id].name, item.name);
    assert.equal(data[item.id].stories.length, 3);
    assert.equal(data[item.id].hero.length, 3);
    assert.equal(data[item.id].pillars.length, 3);
  }
  assert.equal(Object.values(data).filter(item => typeof item.boundary === 'string' && item.boundary.length > 25).length, 19);
});

test('thumbnail menu and history-aware link generation are wired in production JS', () => {
  assert.deepEqual(drawingIds, canonical.map(item => item.id));
  assert.match(js, /function industryThumbnail\(id\)/);
  assert.match(js, /searchParams\.set\('industry'/);
  assert.match(js, /history\.pushState/);
  assert.match(js, /window\.addEventListener\('popstate'/);
  assert.match(js, /data-nav-industry/);
  assert.match(js, /Illustrative ways to help\. Your people stay in control\./);
});

test('legacy ways route redirects to how-we-help while preserving industry selectors', () => {
  assert.match(redirectHtml, /location\.replace/);
  assert.match(redirectHtml, /how-we-help\.html/);
  assert.match(redirectHtml, /validIndustries/);
  assert.match(redirectHtml, /queryIndustry/);
  assert.match(redirectHtml, /hashIndustry/);
});
