import html
import json
import re
from pathlib import Path
from typing import Optional

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'public'
PAGE = PUBLIC / 'how-we-help.html'
INDUSTRIES = json.loads((PUBLIC / 'industries.json').read_text())

DESCRIPTION = 'Explore practical ways Jacksonville businesses can improve everyday workflows, with your team in control.'
OG_TITLE = 'Industries for Jacksonville small businesses · Jax Systems'
COLLECTION_NAME = 'Industries for Jacksonville small businesses'
META_START = '<!-- industry-discovery-meta:start -->'
META_END = '<!-- industry-discovery-meta:end -->'
CSS_START = '/* industry-discovery-css:start */'
CSS_END = '/* industry-discovery-css:end */'
SCHEMA_START = '<!-- industry-discovery-schema:start -->'
SCHEMA_END = '<!-- industry-discovery-schema:end -->'
SECTION_START = '<!-- industry-discovery-section:start -->'
SECTION_END = '<!-- industry-discovery-section:end -->'

SOCIAL_META = f'''{META_START}
<meta property="og:type" content="website">
<meta property="og:url" content="https://jaxsystems.ai/how-we-help">
<meta property="og:title" content="{OG_TITLE}">
<meta property="og:description" content="{DESCRIPTION}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{OG_TITLE}">
<meta name="twitter:description" content="{DESCRIPTION}">
{META_END}'''

DISCOVERY_CSS = f'''{CSS_START}.industry-discovery{{padding:6px 0 64px}}.industry-discovery-copy{{max-width:760px;margin-bottom:30px}}.industry-discovery-copy h1{{font-size:clamp(34px,4.5vw,56px);line-height:1.04;letter-spacing:-.05em;font-weight:600;margin:0 0 14px}}.industry-discovery-copy p{{margin:0;color:#566f65;font-size:15px;line-height:1.7}}.industry-discovery-note{{margin-top:16px;padding:14px 16px;border-radius:12px;background:#edf3ea;border:1px solid #d5e0d6;color:#34594d;font-size:13px}}.industry-discovery-list{{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}}.industry-summary{{padding:22px;border:1px solid #dde5dc;border-radius:18px;background:#fffef9;box-shadow:0 8px 24px rgba(26,58,55,.05)}}.industry-summary-head{{display:grid;grid-template-columns:auto 1fr;gap:14px;align-items:start;margin-bottom:14px}}.industry-summary-index{{margin:0;font:10px ui-monospace,monospace;letter-spacing:.12em;color:#688174}}.industry-summary h3{{margin:0;font-size:23px;line-height:1.1;letter-spacing:-.035em}}.industry-summary-audience{{margin:7px 0 0;color:#5c756a;font-size:12px;line-height:1.5;text-transform:uppercase;letter-spacing:.06em}}.industry-summary-human{{margin:0 0 16px;color:#315d52;font-size:13px;line-height:1.6;font-weight:600}}.industry-examples{{display:grid;gap:12px;margin:0;padding:0;list-style:none}}.industry-example{{padding:14px 15px;border-radius:14px;background:#f7f4ea;border:1px solid #e8e0cb}}.industry-example strong{{display:block;font-size:14px;line-height:1.35}}.industry-example p{{margin:8px 0 0;color:#5a7368;font-size:12px;line-height:1.55}}.industry-example p b{{color:#274e44}}@media(max-width:900px){{.industry-discovery-list{{grid-template-columns:1fr}}}}@media(max-width:760px){{.industry-discovery{{padding:0 0 42px}}.industry-discovery-copy h1{{font-size:clamp(31px,9vw,46px)}}.industry-discovery-copy p{{font-size:14px}}.industry-summary{{padding:18px}}.industry-summary h3{{font-size:21px}}}}{CSS_END}'''


def build_discovery_html() -> str:
    cards = []
    for position, industry in enumerate(INDUSTRIES, start=1):
        examples = []
        for example in industry['examples']:
            examples.append(
                f'''<li class="industry-example"><strong>{html.escape(example['title'])}</strong><p><b>Problem:</b> {html.escape(example['problem'])}</p><p><b>Example:</b> {html.escape(example['fix'])}</p></li>'''
            )
        cards.append(
            f'''<article class="industry-summary" id="industry-summary-{html.escape(industry['id'])}"><div class="industry-summary-head"><p class="industry-summary-index">{position:02d}</p><div><h3>{html.escape(industry['name'])}</h3><p class="industry-summary-audience">{html.escape(industry['audience'])}</p></div></div><p class="industry-summary-human">{html.escape(industry['human'])}</p><ol class="industry-examples">{"".join(examples)}</ol></article>'''
        )
    return f'''{SECTION_START}<section class="industry-discovery" aria-labelledby="industry-discovery-title"><div class="industry-discovery-copy"><h1 id="industry-discovery-title">Explore ways we help different businesses.</h1><p>Every business is different. Explore familiar challenges and ways your team could work more smoothly.</p><noscript><p class="industry-discovery-note">The industry selector above needs JavaScript, but the full industry library stays available below.</p></noscript></div><div class="industry-discovery-list">{"".join(cards)}</div></section>{SECTION_END}'''


def upsert_between(text: str, start: str, end: str, block: str, anchor: Optional[str] = None) -> str:
    pattern = re.compile(re.escape(start) + r'[\s\S]*?' + re.escape(end))
    if pattern.search(text):
        return pattern.sub(block, text, count=1)
    if anchor is None:
        return text
    return text.replace(anchor, block + '\n' + anchor, 1)


def strip_legacy_insertions(text: str) -> str:
    for start, end in ((META_START, META_END), (CSS_START, CSS_END), (SCHEMA_START, SCHEMA_END), (SECTION_START, SECTION_END)):
        text = re.sub(re.escape(start) + r'[\s\S]*?' + re.escape(end), '', text)
    text = text.replace('\n' + SOCIAL_META.replace(f'{META_START}\n', '').replace(f'\n{META_END}', ''), '')
    text = text.replace(DISCOVERY_CSS.removeprefix(CSS_START).removesuffix(CSS_END), '')
    text = re.sub(r'\n\s*<script type="application/ld\+json">\{\n  "@context": "https://schema\.org",\n  "@type": "CollectionPage"[\s\S]*?</script>', '', text, count=1)
    text = re.sub(r'<div id="industry-page">[\s\S]*?</div>\n</main>', '<div id="industry-page"></div>\n</main>', text, count=1)
    return text


def build_collection_schema() -> str:
    schema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        'name': COLLECTION_NAME,
        'url': 'https://jaxsystems.ai/how-we-help',
        'description': DESCRIPTION,
        'isPartOf': {
            '@type': 'WebSite',
            'name': 'Jax Systems',
            'url': 'https://jaxsystems.ai',
        },
        'about': {
            '@type': 'Service',
            'name': 'AI workflow setup for small businesses',
            'provider': {
                '@type': 'Organization',
                'name': 'Jax Systems',
            },
        },
        'mainEntity': {
            '@type': 'ItemList',
            'numberOfItems': len(INDUSTRIES),
            'itemListElement': [
                {
                    '@type': 'ListItem',
                    'position': position,
                    'name': industry['name'],
                    'url': f"https://jaxsystems.ai/how-we-help?industry={industry['id']}",
                }
                for position, industry in enumerate(INDUSTRIES, start=1)
            ],
        },
    }
    return json.dumps(schema, indent=2)


text = strip_legacy_insertions(PAGE.read_text())
text = re.sub(r'\n{3,}', '\n\n', text)
text = re.sub(
    r'<meta name="description" content="[^"]+">',
    f'<meta name="description" content="{DESCRIPTION}">\n{SOCIAL_META}',
    text,
    count=1,
)
text = upsert_between(text, CSS_START, CSS_END, DISCOVERY_CSS, '</style>')
collection_script = f'''{SCHEMA_START}
      <script type="application/ld+json">{build_collection_schema()}</script>
{SCHEMA_END}'''
text = upsert_between(text, SCHEMA_START, SCHEMA_END, collection_script, '<script src="site.js?v=ab345a7f6ab2" defer></script>')
text = re.sub(
    r'<div id="industry-page">[\s\S]*?</div>\n</main>',
    f'<div id="industry-page">{build_discovery_html()}</div>\n</main>',
    text,
    count=1,
)
PAGE.write_text(text)
print(f'updated {PAGE}')
