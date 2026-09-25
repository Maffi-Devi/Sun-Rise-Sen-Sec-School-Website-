# Sun Rise Sr. Sec. School — Website

Static, SEO-ready website for Sun Rise Sr. Sec. School, Magho Majri (Kaithal).

## Structure
- `*.html` — the finished pages (upload these to hosting along with `assets/`, `sitemap.xml`, `robots.txt`, `site.webmanifest`)
- `assets/css/style.css`, `assets/js/main.js` — design & interactions
- `assets/img/` — optimised photos, logo, favicons
- `assets/docs/` — CBSE mandatory-disclosure certificates (PDF)
- `_build/` — source: edit `_build/pages/*.html`, then run `node _build/build.js` to regenerate all pages (shared header/footer, SEO tags, schema, sitemap)

## Before going live
- Check the domain in `_build/build.js` (`SITE.url`) and `robots.txt`.
- Fill the "To be updated" rows in Mandatory Disclosure (RTE recognition, SMC, PTA, results, infrastructure).
- Submit `sitemap.xml` in Google Search Console and claim the Google Business Profile.
