# GLOBAL MARS SEO implementation and next steps

The site now provides 15 real static HTML pages: three localized homepages and four service pages in each language. Search bots and visitors without JavaScript receive actual headings, service text, project images and company contacts. The interactive version then adds animation and enquiry tools.

## Page and keyword map

Live base URL: https://fnfmobilitymy-boop.github.io/Awishfurniture/

| Page | Primary search intent examples | English URL path |
| --- | --- | --- |
| Home | GLOBAL MARS, furniture restoration Rawang, furniture repair Selangor | `/` |
| Furniture and sofa repair | sofa repair Rawang, furniture restoration Rawang, baiki sofa Rawang, Rawang 沙发维修 | `/services/sofa-furniture-repair/` |
| Hotel furniture | hotel furniture restoration, pemulihan perabot hotel, 酒店家具修复 | `/services/hotel-furniture-restoration/` |
| Restaurant furniture | restaurant chair repair, restaurant seating restoration, baiki kerusi restoran, 餐厅餐椅维修 | `/services/restaurant-chair-sofa-repair/` |
| Office furniture | office furniture repair, office chair upholstery, baiki perabot pejabat, 办公家具修复 | `/services/office-furniture-chair-repair/` |

Malay URLs add `ms/` after the base; Chinese URLs add `zh/`. Language links preserve the selected service. These keyword mappings are relevance targets, not claims about search volume, rankings or current Google indexing. We have not used a `meta keywords` tag; titles, headings, useful page content, internal links and actual business information carry the relevance.

## Implemented

- Static HTML generation via Chromium on every build, including no-JavaScript readable layouts.
- Distinct page titles, descriptions, one H1, self-canonical URL and reciprocal `hreflang` alternatives.
- Genuine service-specific content and contextual internal links from the home page and footer.
- LocalBusiness, WebSite and WebPage JSON-LD; individual service pages also include Service JSON-LD. Address, phone and email are user-supplied facts. No ratings, opening hours, coordinates, prices or guarantees were invented.
- XML sitemap with 15 canonical pages, language alternatives and original project-image URLs.
- English Open Graph/Twitter metadata and the existing branded share image.
- A noindex 404 document, descriptive image alternatives, local fonts, lazy lower-page images and reduced-motion/static fallbacks.

## Google Search Console

Google has not been confirmed to have indexed the site. Search Console ownership and reporting require the owner's Google account; this task did not log in, submit the site, or fabricate verification.

1. Open https://search.google.com/search-console/ and add a **URL-prefix** property for `https://fnfmobilitymy-boop.github.io/Awishfurniture/`.
2. Use the HTML meta-tag verification option. The owner can supply the public verification tag to add to `index.html`; do not provide a Google password or private access token. The build preserves a verification tag when added.
3. After the deployed verification is confirmed, submit `https://fnfmobilitymy-boop.github.io/Awishfurniture/sitemap.xml`.
4. Inspect the home page and priority service URLs. Request indexing where appropriate, then monitor indexing reasons, actual queries, impressions and clicks. A successful submission is not a ranking guarantee.

Search Console is useful for submission and diagnostics; it is not the only way Google can discover a public site.

## GitHub Pages robots limitation

The published `/Awishfurniture/robots.txt` is a portable project copy. Crawlers only treat `https://fnfmobilitymy-boop.github.io/robots.txt` at the host root as authoritative. This repository cannot change that root policy. A missing host-root robots file normally leaves crawling allowed; current host-root behavior has not been independently verified from this restricted environment. Submit the sitemap directly in Search Console rather than claiming the project robots file controls crawling.

## Company domain and local presence

For long-term promotion, use the confirmed company-owned production domain once the site is actually deployed there. `SITE_URL` in `src/seo.js` drives canonical URLs, locale/service paths, the sitemap and the Vite asset base. Rebuild and verify all routes after a domain change. Do not point canonicals at an old domain until the new pages actually exist there; server redirects and DNS changes are outside this repository.

Keep the verified company name, supplied Rawang address and phone consistent with the actual Google Business Profile, if one exists. No Business Profile account or social accounts were connected in this task. Use genuine completed-project media, accurate captions and useful service details; do not create fabricated reviews or multiple thin city pages.
