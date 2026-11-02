# apps

mini-apps

## Adding or changing a resource

`docs/apps.json` is the single source of truth for the cards on `docs/index.html`.
To add, change or reorder a resource, edit that file only. The page renders the
cards, the section headings and the jump links when it loads, so there is no build
step and no HTML to touch.

A section has an `id`, a `label`, a `navLabel`, an `icon`, a `palette` and a list of
`cards`. Sections appear in the order they are listed, on the page and in the hero
navigation. Palettes are `navy`, `green` and `blend`, all drawn from the FPDS blue
and green; a new section can reuse one of them without any CSS change.

A card needs a `title`, a `description` (inline links allowed), a `url`, a `cta`
label and a `thumb`. Set `"external": true` for anything that leaves the site.

A `thumb` is a screenshot in `docs/img`, 720x405 like the rest:

    "thumb": { "kind": "image", "src": "img/aied.webp", "aria": "Browse the knowledge base" }

The `src` is relative to `docs/`, and `aria` is the link's accessible name, so it
should read as the action the click performs. Section heading icons are inline SVG
names from `docs/apps.js`, not files.

Descriptions are clamped to seven lines so that every card in a row stays the same
height. A description longer than that gets a More toggle that expands it in place,
so a later edit cannot break the layout.

## How it is rendered

`docs/apps.js` fetches `docs/apps.json` and builds the page. Visitors without
JavaScript get the short fallback list in the `<noscript>` block of
`docs/index.html`.

## The QR code in the footer

The footer of `docs/index.html` carries a QR code and the short link
`tinyurl.com/fpdapps`, so a slide or a printed handout can hand the page to a
phone. The image is `docs/img/qr-code-fpdapps.png` and the markup is static
HTML in the footer, not part of `apps.json`: it is a fixed page-level element,
not a resource card.

The short link and the QR code reach the same place — the code encodes
`https://fpdshc.github.io/apps/` and the link redirects there — so replacing one
means checking the other still agrees. The image keeps its own white quiet zone,
which is why the CSS adds only a thin border and padding around it.

## Link previews

When somebody posts a link to the home page on Slack, Teams, Facebook, LinkedIn or X,
the preview image is `docs/img/social-card.png` — 1200x630, which is the size those
crawlers expect — declared in the `og:image` and `twitter:image` tags in
`docs/index.html`. It has to be an absolute URL, because a crawler does not resolve a
relative one against the page it fetched.

The image is generated, not hand-made. `tools/og-card.html` reproduces the left side of
the hero band — same gradient and glow, same heading, standfirst and short link — and
drops the QR code, which is useless in a preview nobody can point a phone at. After a
change to the hero copy, the palette or the logo, re-render and commit the result:

    tools/render-social-card.sh

The script finds a Chromium (`$CHROME_BIN`, a Playwright cache, or the usual system
paths), screenshots the card at exactly 1200x630 and fails if the output is any other
size. Keep the card's text in step with the hero by hand; the two are separate files.
