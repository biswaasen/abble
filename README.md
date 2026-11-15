# abble

Landing page for abble. Next.js (App Router) on Vercel, with a 3D hero and an early-list form that writes to a Google Sheet.

## Run it

```
npm install
npm run dev
```

## Early-list form

The form posts to `/api/early`, which forwards each sign-up to a Google Apps Script web app that appends a row to the sheet.

1. In a blank Google Sheet: Extensions › Apps Script, paste `apps-script/Code.gs`, set `SECRET`.
2. Deploy › New deployment › Web app. Execute as: Me. Who has access: Anyone. Copy the `/exec` URL.
3. In Vercel › Settings › Environment Variables set `SHEET_WEBHOOK_URL` (the `/exec` URL) and `SHEET_SECRET` (same value as `SECRET`). Redeploy.

`GET /api/early` returns `{"configured": true}` once both are set.
