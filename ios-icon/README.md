# App icon — hard-hat mark

Charcoal square, safety-orange hard hat (dome + brim), hi-vis-yellow stripe.
Flat, no gradients, no text — legible down to 40×40.

## Files here
- `icon-master.svg` — the editable 1024×1024 source (edit this, then re-run the
  generator below to rebuild every size).
- `icon-1024.png` — flattened 1024 master (no alpha — App Store safe).
- `AppIcon.appiconset/` — a ready-to-use Xcode asset catalog icon set with every
  iPhone/iPad size and a `Contents.json`.

## How it was generated (to rebuild after editing the SVG)
This machine has no SVG rasteriser (ImageMagick/rsvg), so it uses macOS built-ins:
```bash
cd ios-icon
qlmanage -t -s 1024 -o . icon-master.svg   # SVG → icon-master.svg.png
mv icon-master.svg.png icon-1024-raw.png
sips -s format jpeg icon-1024-raw.png --out _f.jpg   # drop alpha (App Store needs none)
sips -s format png _f.jpg --out icon-1024.png && rm _f.jpg icon-1024-raw.png
for S in 20 29 40 58 60 76 80 87 120 152 167 180; do
  sips -z $S $S icon-1024.png --out AppIcon.appiconset/icon-$S.png
done
cp icon-1024.png AppIcon.appiconset/icon-1024.png
```
For a perfectly crisp master (no JPEG edge softening), rasterise `icon-master.svg`
at 1024 with a real vector tool (Figma export, Inkscape, or `rsvg-convert`) and
drop it in as `icon-1024.png`, then re-run only the `sips -z` resize loop.

## Wiring it into the iOS app
This repo is the Capacitor **web** project — the native Xcode project isn't here
(a remote-wrapper; it lives in your separate iOS shell / is created by
`npx cap add ios`). Once you have that Xcode project:

**Option A — drag-and-drop (any Xcode):** In Xcode open
`App/App/Assets.xcassets`, delete the existing `AppIcon`, then drag this
`AppIcon.appiconset` folder in. Build — the hard-hat icon appears on the home
screen.

**Option B — Capacitor assets tool (regenerates everything):**
```bash
npm i -D @capacitor/assets
# put a 1024 icon at resources/icon.png (copy ios-icon/icon-1024.png)
npx @capacitor/assets generate --ios
npx cap sync ios
```

The web/PWA icon is already wired: `app/icon.svg` (favicon) and
`app/apple-icon.png` (home-screen icon) both use this mark, so the browser and
"Add to Home Screen" show it with no extra steps.
