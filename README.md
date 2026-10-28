# Kilang Repair Sofa — service website concept

A service-focused revision of the earlier furniture demo. The visual direction retains cinematic room imagery, an expanding craft scene, smooth scrolling, and an interactive 3D sofa. The website provides enquiry-topic filtering, preparation guidance, a gallery with filters and lightbox, FAQs, and an enquiry form with local photo previews.

## Open the demo

Open `demo/kilang-repair-sofa-demo.html` in a normal current browser that permits local HTML. The file embeds all demo assets and needs no server. WebGL is needed for the interactive model.

`demo/awish-demo.html` retains the earlier retail concept for reference. The active source, production build, and latest demo are the sofa-service version.

## Run and validate

Use the existing `/workspace/Awishfurniture` checkout; cloud tasks are already isolated, so do not create Git worktrees unless explicitly requested. Node.js 24 is installed.

```sh
npm ci --no-audit --no-fund
npm run dev -- --port 3000
npm run demo
npm test
```

The build produces `dist/` for static hosting plus the bundled HTML demo. Tests use the installed `/usr/bin/chromium` and their own temporary local server. They exercise desktop/mobile filtering, enquiry guidance and form, photo preview/removal, scroll-driven storytelling, FAQs, gallery lightbox, overflow, Escape, runtime errors, and the standalone demo with subresource requests blocked. The managed browser blocks `file://`; the bundled HTML is therefore tested over HTTP with no external asset requests.

## Real media replacement

- Put the opening video at `src/assets/hero.mp4` or `hero.webm`. The application detects it and uses it as a muted, inline, looping hero with the room image as a poster. Before adding a long video, prepare a web-optimized version and test mobile loading.
- Replace the locally imported scene and gallery imagery in `src/main.jsx` and `src/assets/`. Keep originals outside the source bundle, preserve accurate captions, and identify real project photos by their source and context.
- Update the gallery's `galleryItems` only after receiving actual project media. The current pictures are generated concept illustrations with visible labels, not real completed orders. No fabricated before/after comparisons are used.
- The enquiry photos remain in memory as local object URLs and are never sent to a server. Contact details, WhatsApp/email integration, actual pricing, and form delivery are not configured.

## Source and content status

The user supplied `https://kilangrepairsofa.com/`. As of this revision, the environment proxy still denies that host with 403 on CONNECT. Official company spelling, complete service list, contacts, and real case media have not been read or verified. The display name is derived from the domain and identified as provisional in the demo footer. Enquiry categories describe customer problems rather than guaranteeing every repair is available. Do not invent service coverage, warranties, prices, or order counts.

The user will supply downloaded photos and videos later. `scripts/import-legacy-site.py` is also available for source collection if website access becomes active. See `source-materials/README.md` for provenance and review rules.

## GitHub Pages deployment

The repository uses `.github/workflows/deploy-pages.yml` to build and publish the website on every push to `main`. In **Settings → Pages → Build and deployment**, keep the source set to **GitHub Actions**. No template selection or extra token is required. The workflow installs from the lockfile with Node.js 24, builds `dist/`, uploads the official Pages artifact, and deploys it using a job-scoped Pages/OIDC token.

Check **Actions → Deploy demo to GitHub Pages** for the actual build and deployment outcome. After deployment succeeds, the project URL is `https://fnfmobilitymy-boop.github.io/Awishfurniture/`. A committed workflow alone does not establish a successful live deployment.

`base: './'` keeps asset URLs valid under the repository subpath. The previously generated `docs/` files remain as a branch-publishing alternative, but the selected Actions workflow builds directly from source and publishes `dist/`. No external contact integration is configured.
