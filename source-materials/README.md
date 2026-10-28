# Legacy website migration

Source authorized by the user: https://kilangrepairsofa.com/

## Current evidence

The cloud egress proxy returned HTTP 403 on CONNECT before the website could be read. This is an environment access blocker; it does not establish that the website is unavailable. The source company name, service list, contacts, and gallery have **not** been verified or imported. The active demo has been changed to a sofa-service consultation concept. Its working brand name is derived from the domain, and the official company details remain unverified. The user will supply downloaded video/photo media later. Current gallery media is visibly labeled generated illustration, not successful-order evidence.

Custom domain additions `kilangrepairsofa.com` and `www.kilangrepairsofa.com` have been saved to the environment configuration draft, preserving package-manager presets. Draft saving does not apply or publish the network configuration.

## Import when access is active

From the existing checkout:

```sh
python scripts/import-legacy-site.py --max-pages 12
```

This uses the inherited HTTPS proxy and TLS verification, reads public pages on the specified domain, collects page text and headings, and downloads image candidates at the largest resolution advertised in HTML srcset. It keeps original files, records source pages and alt/title text, deduplicates identical binary images with SHA-256, and saves a timestamped manifest. External media hosts are reported for review, not silently fetched. Existing source files are preserved.

## Content conversion

- Replace the conceptual AWISH name, SEO metadata, navigation, introductory copy, philosophy, product descriptions, forms, and footer with facts verified against the source.
- Translate and rewrite the source services into clear customer-facing Chinese copy; retain the verified company name, actual contact methods, and service areas.
- Reassess retail categories, model product names, prices, product dimensions, and wishlist interactions against the actual service workflow. Do not invent prices, guarantees, response times, addresses, completed-order counts, or offered services.
- Retain the approved visual and animation direction while making calls to action match the source business.

## Case-photo review

Images collected from a website are candidates, not proof of successful orders. Review the surrounding source text before labeling an image as a completed project. Separate logos, icons, stock images, banners, workshop photos, and evidence-backed case images. Only present before/after pairs where source evidence identifies the same job. Keep before and after visible and accurately labeled; never fabricate a repaired result.

Keep originals untouched. Record selected originals and their page provenance in the manifest. Create display derivatives separately and preserve furniture condition, color, and material. Any retouching beyond simple export/size preparation must be reviewed against the original. No gallery image has been processed or published yet.

## Latest user-supplied material

The user subsequently supplied the GLOBAL MARS logo, confirmed the Rawang address and contact details, and uploaded `iloveimg-compressed.zip` containing 45 images plus `IMG_6094.MP4` as a motion reference. These direct user sources are authoritative for the current revision; source-site access is no longer a prerequisite for the supplied identity/contact/media work.

Twelve distinct, intact before/after composite photographs have been selected and copied without pixel edits. See `global-mars-selected-photos.json` for hashes and exact source names. The reference video is used for card/fan motion, not represented as company footage. Hotel, restaurant and office service scenes remain visibly labeled illustrations, not evidence of completed commercial contracts. Social account links remain unknown.
