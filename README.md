# GLOBAL MARS — Furniture Restoration

A trilingual (Bahasa Melayu, English, Chinese) furniture-restoration website deployed to GitHub Pages. The company identity, address and contacts were supplied directly by the user. The site covers furniture restoration and hotel, restaurant and office furniture projects.

## Development and verification

Use the existing checkout at `/workspace/Awishfurniture`; cloud tasks are already isolated, so do not create a Git worktree unless explicitly requested. Node.js 24 is installed.

```sh
npm ci --no-audit --no-fund
npm run dev -- --port 3000
npm test
```

The browser checks use `/usr/bin/chromium` and a temporary server under the actual `/Awishfurniture/` Pages subpath. They verify complete translation coverage, original-photo integrity and uniqueness, visible pointer-driven water refraction, company logo and contacts, four project sectors, project-card scrolling, filters/lightbox, local photo previews, prepared WhatsApp enquiries, all three mobile layouts, reduced motion and the offline bundle. Tests never send WhatsApp messages.

## Deployment

Every push to `main` runs `.github/workflows/deploy-pages.yml`: lockfile install, production build, official Pages artifact upload, then deployment with scoped Pages/OIDC permissions. Keep **Settings → Pages → Source** set to **GitHub Actions**. Check the workflow's actual outcome before claiming a new version is live.

Site: https://fnfmobilitymy-boop.github.io/Awishfurniture/

`npm run build` writes the normal static site to `dist/`. Photographs and fonts are separate cacheable files, and lower-page imagery loads lazily. `npm run pages` also refreshes `docs/`, retained as an optional branch-publishing alternative. The active Actions deployment uses `dist/`.

`npm run demo` writes a standalone `demo/global-mars-demo.html` with embedded assets. The normal browser may open that HTML locally; the managed browser blocks file URLs, so tests validate it over HTTP with all subresource requests blocked. `node scripts/record-demo.mjs` records a walkthrough to `demo/global-mars-walkthrough.mp4`.

## Typography and motion

Titles use the locally bundled Anton display font, chosen to match the supplied heavy condensed reference. Chinese titles use a heavy CJK system-font fallback. Body copy remains in DM Sans for legibility. Water refraction is intentionally restrained: low amplitude, less frequent impulses, faster damping, and a hard displacement cap to avoid exaggerated distortion.

## Identity, contacts and languages

- `src/content.js`: GLOBAL MARS, the supplied Rawang address, `globalmars.sb@gmail.com`, phone `010 200 7153`, Google Maps search and WhatsApp destination `60102007153`.
- `src/i18n.js`: every translatable UI string in `ms`, `en` and `zh`, including navigation, projects, FAQs, form validation, accessibility labels and prepared WhatsApp messages. New visitors start in English. Language paths determine the displayed locale, with an optional explicit `?lang=en`, `?lang=ms` or `?lang=zh` override; `<html lang>`, page title and description update on switching.
- `src/assets/global-mars-logo.webp`: a transparent web derivative prepared from the logo supplied in chat. Colours and the sofa emblem remain recognizable. It is shown on an ivory brand panel for legibility over photography.
- TikTok, Instagram, Facebook and YouTube icons are present. Account URLs have not been supplied. The buttons display a translated notice instead of linking to an invented account. Replace these with verified account links when available.

## Project media and provenance

The client uploaded 45 photos in `iloveimg-compressed.zip`. Twelve visually distinct before/after project composites are selected in `src/cases.js`. They are copied byte-for-byte, uncropped and unretouched; their original captions and before/after pairings are preserved. `source-materials/global-mars-selected-photos.json` records source names, dimensions and SHA-256 hashes. Original uploads are retained outside the checkout at `/workspace/source-assets/global-mars-photos/`.

`CaseShowcase.jsx` uses those originals once each: one featured original connects the Hero to the cases; the next six form a scroll-expanded card fan (a horizontal scroll sequence on mobile), and the remaining five form a grid. Filtering never duplicates an item. The lightbox shows the corresponding original, with keyboard navigation. The latest uploaded reference MP4 informs the motion direction; it is not embedded as a company project video.

Room/craft imagery and the four sector illustrations are distinct generated visuals, labeled as illustrations rather than completed commercial projects. No photographic asset is repeated across main page sections. `WaterImage.jsx` applies gentle pointer/scroll refraction only to illustrative photography, leaving original project comparisons and UI text stable. Reduced-motion and no-WebGL fallbacks preserve readable static imagery.

To add a company-owned opening film, place a web-optimized `hero.mp4` or `hero.webm` in `src/assets/`. It will be detected automatically. Do not use a recorded reference website as original company footage.

## Enquiries

The form prepares a WhatsApp message. The visitor explicitly opens WhatsApp and confirms sending there; no message is sent automatically. Selected photos stay in browser memory for local preview and must be attached separately in WhatsApp. The footer and floating WhatsApp button use the actual user-supplied contact number. No database, image upload API, email delivery or tracking service is configured.

## Link sharing

The static HTML includes an English title and description, canonical URL, Open Graph metadata and a Twitter large-image card. `public/social-preview-en.jpg` is a 1200 × 630 English homepage export with the logo and imagery; its URL is absolute and public so no JavaScript is needed to discover or fetch it. Share metadata stays English while the on-page language can change.

To regenerate the share cover after a visual change, run `npm run build && node scripts/create-social-preview.mjs`, then build again to include the refreshed JPEG. Messaging platforms may cache an existing card; an already-sent preview is not under the site's control.

## Static SEO and service pages

`npm run build` now runs Vite followed by `scripts/prerender.mjs`, which generates three localized homepages and four service pages per language. A browser is required at build time; the cloud instance has `/usr/bin/chromium`, and the GitHub Actions workflow installs its own Playwright Chromium on Ubuntu 24.04. `CHROMIUM_BIN` may select a different installed browser. `npm run build:client` only builds the client bundle for debugging.

The published locale paths are the base URL (English), `ms/` and `zh/`. Language switching uses crawlable links and browser history. Legacy `?lang=` links normalize to the corresponding locale URL. `src/seo.js` owns the production site URL, page titles, canonical/hreflang and structured data; `src/services.js` contains localized service-page copy. See [SEO.md](SEO.md) for the keyword map, sitemap submission, Search Console ownership and the host-root robots limitation. Indexing and rankings have not been confirmed.

## Assembly Hero and service ticker

`HeroAssembly.jsx` separates the conceptual sofa's frame/support, seat cushions, backs, arms and pillow, then reassembles them. Scroll progress transforms one room from worn furniture through exploded construction layers into an assembled, furnished space, then introduces the featured original case. Restart returns to the beginning; reduced-motion mode shows the finished room. It is an illustration of construction layers, not a recording of an actual repair. The home-page ticker uses translated furniture/service/place copy; the duplicate track is hidden from assistive technology and motion stops for reduced-motion users. Original before/after photographs remain unchanged.
