/* Renders the resource cards on index.html from apps.json.
 *
 * To add or change a resource, edit apps.json only: no HTML edit and no build
 * step. Sections appear on the page (and in the hero navigation) in the order
 * they are listed in apps.json.
 *
 * Each section names a palette (see PALETTES). The palette is applied as CSS
 * variables on the section element, which is why adding a section needs no CSS
 * change either.
 *
 * No-JS visitors get the short fallback list in index.html's <noscript>.
 * Descriptions may contain inline HTML links; apps.json is part of this repo
 * and is treated as trusted content.
 */

const ARROW_INTERNAL = 'M5 12h14M13 6l6 6-6 6';
const ARROW_EXTERNAL = 'M7 17L17 7M9 7h8v8';

const ICONS = {
  sparkle: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M18.5 15.5l.8 2.1 2.2.8-2.2.8-.8 2.1-.8-2.1-2.2-.8 2.2-.8z"/>',
  accessibility: '<circle cx="12" cy="4.5" r="1.8"/><path d="M4.5 8.5h15M12 8.5v6M12 14.5l-3.5 6M12 14.5l3.5 6"/>',
  // a figure in an academic cap
  professor: '<path d="M3 7.4L12 3.6l9 3.8-9 3.8z"/><circle cx="12" cy="11.6" r="2.5"/><path d="M4.8 21c0-3.5 3.2-5.9 7.2-5.9s7.2 2.4 7.2 5.9"/>',
  // an open book, for a section holding discipline-specific material
  book: '<path d="M4 5.8c2.7-.9 5.3-.9 8 .6 2.7-1.5 5.3-1.5 8-.6v12.2c-2.7-.9-5.3-.9-8 .6-2.7-1.5-5.3-1.5-8-.6z"/><path d="M12 6.4v12.2"/>',
};

/* Colour sets, all drawn from the FPDS blue and green. */
const PALETTES = {
  navy: {
    '--accent': 'var(--navy)',
    '--accent-2': 'var(--navy-soft)',
    '--accent-text': 'var(--navy)',
    '--accent-border': 'var(--navy)',
    '--accent-hover': 'var(--navy-soft)',
    '--accent-rule': 'linear-gradient(90deg,var(--navy),rgba(44,63,122,0))',
    '--accent-cta': 'var(--navy)',
    '--accent-cta-hover': 'var(--navy-soft)'
  },
  green: {
    '--accent': 'var(--green-deep)',
    '--accent-2': 'var(--green)',
    '--accent-text': 'var(--green-deep)',
    '--accent-border': 'var(--green)',
    '--accent-hover': 'var(--green-dark)',
    '--accent-rule': 'linear-gradient(90deg,var(--green),rgba(17,179,108,0))',
    '--accent-cta': 'var(--green-deep)',
    '--accent-cta-hover': '#08512f'
  },
  blend: {
    '--accent': 'var(--navy)',
    '--accent-2': 'var(--green)',
    '--accent-text': 'var(--navy)',
    '--accent-border': 'var(--navy-soft)',
    '--accent-hover': 'var(--green-dark)',
    '--accent-rule': 'linear-gradient(90deg,var(--navy-soft),var(--green) 55%,rgba(17,179,108,0))',
    '--accent-cta': 'var(--navy-soft)',
    '--accent-cta-hover': 'var(--green-deep)'
  }
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function svg(name, width) {
  const body = ICONS[name];
  if (!body) return '';
  const w = width || 2;
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + w +
    '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + '</svg>';
}

function arrow(external) {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' +
    (external ? ARROW_EXTERNAL : ARROW_INTERNAL) + '"/></svg>';
}

function renderThumb(card) {
  const t = card.thumb || {};
  const ext = card.external ? ' target="_blank" rel="noopener noreferrer"' : '';
  const aria = ' aria-label="' + esc(t.aria || card.title) + '"';
  const href = ' href="' + esc(card.url) + '"' + ext + aria;
  return '        <a class="thumb"' + href + '>\n' +
    '          <img src="' + esc(t.src) + '" alt="" loading="lazy" width="720" height="405">\n        </a>';
}

function renderCard(card) {
  const ext = card.external ? ' target="_blank" rel="noopener noreferrer"' : '';
  return '      <li class="card">\n' + renderThumb(card) + '\n' +
    '        <div class="card-body">\n' +
    '          <h3>' + esc(card.title) + '</h3>\n' +
    '          <p>' + card.description + '</p>\n' +
    '          <div class="go">\n' +
    '            <a href="' + esc(card.url) + '"' + ext + '>' + esc(card.cta) + '\n              ' +
    arrow(card.external) + '\n            </a>\n' +
    '          </div>\n        </div>\n      </li>';
}

function renderSection(section) {
  const palette = PALETTES[section.palette] || PALETTES.navy;
  const style = Object.keys(palette).map((k) => k + ':' + palette[k]).join(';');
  return '  <section class="theme" id="' + esc(section.id) + '" aria-labelledby="' + esc(section.id) +
    '-heading" style="' + style + '">\n' +
    '    <h2 id="' + esc(section.id) + '-heading">\n' +
    '      <span class="icon" aria-hidden="true">\n        ' + svg(section.icon) + '\n      </span>\n      ' +
    esc(section.label) + '\n    </h2>\n' +
    '    <p class="intro">' + section.intro + '</p>\n\n' +
    '    <ul class="cards">\n' + section.cards.map(renderCard).join('\n\n') + '\n    </ul>\n  </section>';
}

function renderNav(sections) {
  return sections.map((s) =>
    '      <a class="jump" href="#' + esc(s.id) + '">\n        ' + svg(s.icon) + '\n        ' +
    esc(s.navLabel || s.label) + '\n      </a>').join('\n');
}


/* Keeps a row of cards the same height when a description runs long. The ceiling has
   to clear the inline links a description carries: the knowledge-base card points at
   its Gem and NotebookLM notebook in prose, and clipping either one mid-sentence
   leaves the card reading as if the link were missing. Seven lines shows those two
   with a line to spare, which also absorbs font and zoom differences. Anything past
   the ceiling is clamped, and only then does a More toggle appear to expand it in
   place; cards that fit inside the ceiling are untouched, so no description is hidden. */
const CLAMP_LINES = 7;
function applyClamps() {
  document.querySelectorAll('.card p').forEach((p) => {
    p.style.webkitLineClamp = CLAMP_LINES;
    p.classList.add('clamped');
    if (p.scrollHeight <= p.clientHeight + 1) {
      p.classList.remove('clamped');
      return;
    }
    const btn = document.createElement('button');
    btn.className = 'toggle';
    btn.type = 'button';
    btn.setAttribute('aria-expanded', 'false');
    // name the card, so a screen reader announcing "More" knows which one
    const heading = p.closest('.card').querySelector('h3');
    if (heading) btn.setAttribute('aria-label', 'More about ' + heading.textContent);
    btn.textContent = 'More';
    btn.addEventListener('click', () => {
      const clamped = p.classList.toggle('clamped');
      btn.setAttribute('aria-expanded', String(!clamped));
      btn.textContent = clamped ? 'More' : 'Less';
    });
    p.insertAdjacentElement('afterend', btn);
  });
}

async function init() {
  const nav = document.getElementById('section-nav');
  const main = document.getElementById('main');
  if (!nav || !main) return;
  try {
    // no-store: apps.json is tiny, and an edit must show up on a normal reload
    // rather than after a hard refresh.
    const res = await fetch('apps.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
    const data = await res.json();
    const sections = (data.sections || []).filter((s) => s && s.id && Array.isArray(s.cards));
    if (!sections.length) throw new Error('no sections in apps.json');
    nav.innerHTML = renderNav(sections);
    const fallback = main.querySelector('noscript');
    main.innerHTML = sections.map(renderSection).join('\n\n') + (fallback ? '\n' + fallback.outerHTML : '\n');
    applyClamps();
  } catch (err) {
    main.innerHTML = '<p class="intro">The resource list could not be loaded (' + esc(err.message) +
      '). Please reload the page, or view the <a href="apps.json">resource data</a> directly.</p>';
  }
}

document.addEventListener('DOMContentLoaded', init);