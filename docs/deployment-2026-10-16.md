# 15 October post-change deployment

- Published to https://www.lorimerclothing.com on 16 October 2026.
- Vercel deployment: `lorimer-clothing-agh8skq8s-hieronymous1s-projects.vercel.app`.
- Replaced Cookies footer links with Shipping & Returns, targeting `about.html#delivery-title`; removed the cookie page and its popup link. The popup retains its stored acceptance behavior.
- Removed the loader photograph and overlay, leaving white, the centered logo, top-left location, and bottom-right progress counter.
- Removed the cap-specific image padding and sizing override.
- Backed up the live `about.terms` CMS entry to `.vercel/backups/about-terms-before-cookie-removal-2026-10-16.json`, then removed only the stale cookie-page reference using a conditional update. Verified the exact resulting content.
- All 176 automated tests pass. Production checks at 1440 and 390 pixels confirm the white loader, footer destination, matching cap and neighboring image dimensions, and no mobile overflow.
