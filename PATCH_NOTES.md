# CureCycle Backend — Patch Notes (v2)

This patched build fixes the bugs and security issues found in the review.

## 🔒 Critical security fixes
- **#10 Notifications routes now require auth & are scoped to the logged-in user.**
  Previously `GET /api/notifications` returned **everyone's** notifications, and
  `PUT /api/notifications/:id/read` let anyone mark anyone's notification read.
- **#9 Search regex injection** — `keyword` is escaped before being passed to
  Mongo's `$regex`, blocking ReDoS / `.*` DoS payloads.
- **#7 Upload hardening** — both `/api/scan/ocr` and `/api/smart-scan` now:
  - require auth (`protect`)
  - cap uploads at 5 MB
  - reject non-image mimetypes
  - sanitize filenames
  - **always delete temp files** (smart-scan was leaking disk before)
- **#11 Global error handler** — controllers no longer leak `error.message` to
  clients in production. Errors are logged server-side.

## 🐛 Logic bug fixes
- **#1 `scanController.extractMfg`** — removed unreachable code after early `return`.
- **#2 `smartScanController` priority** — barcode no longer unconditionally
  overrides OCR. Uses proper `if/else if`. `source` is set in one place only.
- **#5 Reminder dedup** — duplicate-check now includes the message, so a user
  with multiple medicines at the same minute gets one alert *per medicine*
  (was: only one alert total per minute).
- **#4 Expiry message formatting** — dates now render as `YYYY-MM-DD` instead
  of `Wed Apr 30 2026 00:00:00 GMT+0000…`.
- **#6 Barcode controller** — removed misleading "extracted from barcode"
  expiry regex (EAN/UPC barcodes never contain expiry). Now returns a region
  hint and tells the client to fall back to OCR.
- **#8 Chat controller** — `OpenAI` errors now log `name/status/code` so quota
  vs. auth vs. network failures are debuggable instead of silently falling back.

## 🚀 Performance
- **#12 Indexes added** to:
  - `Medicine`: `(userId, expiryDate)`, `(userId, medicineName)`
  - `Reminder`: `(isActive, time)`, `(userId)`
  - `Notification`: `(userId, createdAt desc)`
  - `Donation`: `(status, expiryDate)`, `(userId, createdAt desc)`

## 🧰 Other improvements
- `server.js` ensures `uploads/` directory exists at boot (multer used to crash on first request).
- `express.json({ limit: "1mb" })` to prevent giant JSON DoS.
- Added `NODE_ENV=production` switch for safer error responses.

## ⚠️ Deployment reminders (NOT code changes)
- `sharp` + `tesseract.js` need a real Node host (Render, Railway, Fly, VPS).
  They will **not** work on Vercel / Cloudflare edge functions.
- `node-cron` only fires while the process is alive. On serverless platforms
  use an external scheduler (cron-job.org, Render Cron, GitHub Actions) hitting
  HTTP endpoints instead.

## Required `.env` keys (unchanged)
```
MONGO_URI=
JWT_SECRET=
OPENAI_API_KEY=
CLIENT_URL=
PORT=5000
NODE_ENV=production
```
