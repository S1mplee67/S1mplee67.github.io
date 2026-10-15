# Wency portfolio ? GitHub Pages staging

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

- Three C418 MP3 files are not included; only licensed or otherwise
  authorized files should be made publicly accessible. The music widget
  will show its missing-audio state until audio is properly hosted.
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
Minecraft biome selection, ambient-player UI code, HTML and SPA fallback.

## Manual checks

Verify routes /, /projects, /experience and /contact, image loading,
resume link, project SVG animation, README popup, night/day mode, and
absence of captured original-owner media. Because audio MP3s are omitted,
the player should not make sound or claim to play music. Browser
autoplay restrictions still apply after any later licensed audio setup.
