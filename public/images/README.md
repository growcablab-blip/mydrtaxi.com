# Site images

Everything here is copied into `dist/images/` at build time. This README is not deployed.
Image specs (file, intrinsic size, responsive variants) live in `src/config.mjs`.
A missing file makes the site fall back to its illustrated placeholder, and the build lists it.

## Pipeline

Source PNGs live in `assets/photos/`, which is **not deployed**. Run `npm run images` (Windows)
to regenerate every JPEG below, including the `-<width>` srcset variants, the avatar and `og.jpg`.
To replace a photo, overwrite the PNG in `assets/photos/` with the same name, run
`npm run images`, then update width/height in `src/config.mjs` if the size changed.

| Output (public/images/)                      | Section                                      | Size       | Source (assets/photos/)   |
|----------------------------------------------|----------------------------------------------|------------|---------------------------|
| `winton-driving.jpg` (+ `-960`)              | Hero, right side (priority loaded)           | 1672×941   | `winton-driving.png`      |
| `winton-avatar.jpg`                          | Hero driver strip avatar                     | 240×240    | `winton-driving.png` (face crop) |
| `meet-winton.jpg` (+ `-800`)                 | "Meet Winton" portrait                       | 1536×1024  | `meet-winton.png`         |
| `airports/airport-pop.jpg` (+ `-600`)        | POP card photo; text/button are live HTML    | 1024×1536  | `airport-pop.png`         |
| `airports/airport-sti.jpg` (+ `-600`)        | STI card photo                               | 1024×1536  | `airport-sti.png`         |
| `airports/airport-sdq.jpg` (+ `-600`)        | SDQ card photo                               | 1024×1536  | `airport-sdq.png`         |
| `airports/airport-puj.jpg` (+ `-600`)        | PUJ card photo                               | 1024×1536  | `airport-puj.png`         |
| `vehicle/vehicle-exterior.jpg` (+ `-800`)    | Vehicle section, top                         | 1448×1086  | `vehicle-exterior.png`    |
| `vehicle/vehicle-interior.jpg` (+ `-800`)    | Vehicle section, bottom                      | 1448×1086  | `vehicle-interior.png`    |
| `cta/cta-airport-arrival.jpg` (+ `-1100`)    | "Ready when you are" background              | 1672×941   | `cta-airport-arrival.png` |
| `og.jpg`                                     | Social share image (WhatsApp/Facebook)       | 1200×630   | `winton-driving.png` (hero crop) |
| `logo.png`                                   | Header / footer logo                         | 427×100    | `npm run icons` from `assets/logo-source.png` |

Rules
- Never bake text or buttons into photos. Airport codes, names, areas and CTAs are translated HTML.
- Never reference `C:\...` or other local paths in code. Only `/images/...`.
