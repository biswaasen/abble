# Abble

Launch site for Abble 1. Next.js App Router on Vercel, with a scroll-driven 3D device and an early access form that writes to a Google Sheet.

## Run

```
npm install
npm run dev
```

## Structure

```
app/
  page.js            home: 3D showcase, wear, FAQ, early access
  story/page.js      our story
  form/page.js       early access form, one question per screen
  api/early/route.js forwards sign-ups to the Google Sheet
  layout.js          metadata and font
  globals.css        all styles
components/
  Showcase.js        pinned hero and scroll story around the 3D device
  Device3D.js        three.js model of Abble 1
  screens.js         device screens drawn on canvas
  Nav.js, Footer.js, EarlyAccessButton.js, PhotoBand.js, Reveal.js
lib/launch.js        launch year and price
public/img/          hero, hand and wrist photos
public/brand/        agent icons shown on the device screens
apps-script/Code.gs  Google Apps Script that appends rows to the sheet
```

## Early access form

The form posts to `/api/early`, which forwards each sign-up to a Google Apps Script web app that appends a row to the sheet. The tab and its columns are created on the first sign-up.

1. In a blank Google Sheet open Extensions › Apps Script, paste `apps-script/Code.gs` and replace `PASTE_SECRET` with a secret of your choice.
2. Deploy › New deployment › Web app. Execute as: Me. Who has access: Anyone. Copy the `/exec` URL.
3. In Vercel › Settings › Environment Variables set `SHEET_WEBHOOK_URL` to the `/exec` URL and `SHEET_SECRET` to the same secret. Redeploy.

`GET /api/early` returns `{"configured": true}` once both are set. Keep a local copy of the script with the real secret as `apps-script/*.local.gs`; it is ignored by git.
