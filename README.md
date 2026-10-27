# Meet Lou website

The public marketing site for Meet Lou: one self-contained page in `site/index.html` (styles, scripts and images inlined; fonts from Google Fonts).

Netlify deploys the `site/` folder on every push to `main`. There is no build step.

## Before going public

- Fill in the placeholders in the privacy notice and footer: company name, company number, registered address, ICO number, how long enquiry details are kept, and the last-updated date.
- Remove the `noindex` meta tag in `site/index.html` and the `X-Robots-Tag` header in `netlify.toml`.
- Turn off the Netlify password and point meetlou.app at the site.

The product demo pages (client app, firm dashboard, results report and so on) are deliberately not in this repo.
