# Abble

Launch site for Abble 1 (abble.si). Next.js App Router on Vercel: a scroll-driven 3D device that tells the story, and a waitlist form that writes to a Google Sheet.

## Run

```
npm install
npm run dev
```

Pushing to `main` deploys to production on Vercel.

## Structure

```
app/
  page.js              home: 3D story, then "Be one of the first." with the waitlist button
  waitlist/page.js     waitlist form, one question per screen
  api/early/route.js   forwards sign-ups to the Google Sheet
  layout.js            metadata, fonts (Satoshi)
  manifest.js          web app manifest
  globals.css          all styles
components/
  Showcase.js          pinned hero and scroll captions around the 3D device
  Device3D.js          three.js model of Abble 1; shows the screen images
  Footer.js, Logo.js, Reveal.js
lib/launch.js          launch year and price
public/
  screens/4k/*.webp    device screens at 4096 × 3000 (desktop)
  screens/*.webp       the same screens at 2048 × 1500 (phones)
  img/abble-1.webp     still of the device, shown if WebGL is unavailable
  og.jpg               link preview image
design/screens/        source HTML and icons for the device screens (not deployed)
apps-script/Code.gs    Google Apps Script that appends rows to the sheet
```

## Device screens

The 3D device shows four images in story order: `home`, `ask`, `talk`, `done`. To change one, edit `design/screens/screens.html`, capture each screen at 4× (4096 × 3000) and save it as webp to `public/screens/4k/`, plus a 2048 × 1500 copy to `public/screens/`.

## Waitlist form

The form posts to `/api/early`, which forwards each sign-up to a Google Apps Script web app that appends a row to the sheet. The tab and its columns are created on the first sign-up. Old `/form` links redirect to `/waitlist`.

1. In a blank Google Sheet open Extensions › Apps Script, paste `apps-script/Code.gs` and replace `PASTE_SECRET` with a secret of your choice.
2. Deploy › New deployment › Web app. Execute as: Me. Who has access: Anyone. Copy the `/exec` URL.
3. In Vercel › Settings › Environment Variables set `SHEET_WEBHOOK_URL` to the `/exec` URL and `SHEET_SECRET` to the same secret. Redeploy.

`GET /api/early` returns `{"configured": true}` once both are set. Keep a local copy of the script with the real secret as `apps-script/*.local.gs`; it is ignored by git.
