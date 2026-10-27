# Meet Lou website

The Meet Lou website and its interactive demo pages.

- `site/index.html` is the marketing site: one self-contained page (styles, scripts and images inlined; fonts from Google Fonts).
- `site/demo/` holds the demo pages, each self-contained, with fictional firms and example data: firm dashboard, client app, results report, complaint workspace, staff access log, pilot console and capture health. `site/demo/index.html` lists them. They link to each other with site-relative paths, so they work on any domain.

Netlify deploys the `site/` folder on every push to `main`. There is no build step.

## Before going public

- Fill in the placeholders in the privacy notice and footer: company name, company number, registered address, ICO number, how long enquiry details are kept, and the last-updated date.
- Remove the `noindex` meta tag in `site/index.html` and the `X-Robots-Tag` header in `netlify.toml`.
- Turn off the Netlify password and point meetlou.app at the site.

Every demo page carries a `noindex` tag and a banner saying the data is fictional. Keep it that way: this repo is public, so never put real firm or client data in it.
