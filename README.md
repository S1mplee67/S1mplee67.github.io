# Wency portfolio — GitHub Pages

This is a deployable static root based on the current personalized Wency
portfolio capture. The original local project remains unchanged.

## GitHub Pages publishing

Upload the CONTENTS of this directory (not a nested staging folder) to
the root of repository S1mplee67/S1mplee67.github.io on branch main.
Under GitHub Settings -> Pages select Deploy from a branch, main, /(root).

Expected public URL: https://s1mplee67.github.io/

index.html and 404.html are intentionally identical SPA entry points.
Direct visits to /projects, /experience and /contact render through the
React Router app using the Pages 404 fallback, though deep-link HTTP
status may still be 404. .nojekyll disables Jekyll processing.

## Public-hosting limits and rights

- The public ambient playlist now contains Scott Buckley's **Aurora**,
  **Snowfall**, and **Cirrus**, downloaded directly from the artist's
  Creative Commons music library under CC BY 4.0. Visible per-track
  attribution, source and license links are provided in
  [music-credits.html](music-credits.html) and via the player's Music
  Credits link. The three C418 tracks remain local and were not
  published.
- Captured Harshit personal gallery photos, experiment media, old project
  screenshots, banners and unrelated music are deliberately omitted.
  Some legacy compiled functions still mention their URLs, but the
  experiment routes and entry points have been removed.
- Amiamie OTF/TTF fonts are omitted because redistribution rights were
  not established. The staged CSS uses Google Font Inter as a fallback,
  together with Instrument Serif and JetBrains Mono from Google Fonts.
- Vercel Analytics is disabled only in the staged JavaScript because
  its /_vercel/insights/script.js endpoint is not on GitHub Pages.
- The Contact form is a local UI demonstration; successful delivery of
  messages is NOT configured or guaranteed.
- The portfolio derives from a captured third-party design and compiled
  JavaScript. Verify authorization to redistribute that underlying code
  and design prior to public publishing. This staging folder does NOT
  grant rights or a license to third-party assets.

Included: owner profile images, updated resume, two owned repository
project SVG thumbnails, core React bundle, CSS, README quicklook,
Minecraft biome selection, ambient-player UI code, CC BY 4.0 music,
music credits, HTML and SPA fallback.

## Manual checks

Verify routes /, /projects, /experience and /contact, image loading,
resume link, project SVG animation, README popup, night/day mode, and
absence of captured original-owner media. Verify all three licensed MP3s
load, Music Credits opens and lists the tracks, the player starts after an
eligible user interaction where browser autoplay is blocked, Next works,
and full songs shuffle on completion.
