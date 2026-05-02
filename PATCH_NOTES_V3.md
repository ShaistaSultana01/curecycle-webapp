# CureCycle Backend — v3 Patch Notes (additive)

Building on v2. Adds three free, production-ready features.

## ✨ New in v3

### 📧 1. Email notifications (Nodemailer + Gmail SMTP — free)
- New `services/emailService.js` with reusable `sendEmail()` + branded HTML wrapper.
- **Pill reminders** now also email the user at the scheduled time, not just create a DB notification.
- **Expiry scheduler** sends ONE daily digest per user (e.g. *"3 medicines need attention"*) instead of spamming inboxes.
- If `EMAIL_USER` / `EMAIL_PASS` are missing, emails are silently skipped — the app keeps running so dev/local works without setup.

### 🔎 2. Real barcode → medicine lookup (OpenFoodFacts — free, no key)
- `controllers/barcodeController.js` now calls `world.openfoodfacts.org`.
- Returns `medicineName`, `brand`, `category`, `imageUrl`, plus region detection.
- Honest about limits: barcodes don't encode expiry → still tells client to fall back to OCR.

### 🛡 3. Rate limiting (`express-rate-limit` — free)
- New `middleware/rateLimiter.js` exports `authLimiter` (5 / 15 min) and `apiLimiter` (100 / 15 min).
- Applied to `POST /api/auth/login` and `POST /api/auth/register` to block brute-force.

## 📦 New dependencies

Install in your backend folder:
```bash
npm install nodemailer express-rate-limit
```

## 🔐 New `.env` keys (optional but recommended)

```env
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=xxxxxxxxxxxxxxxx          # 16-char Gmail App Password
EMAIL_FROM=your.email@gmail.com      # optional display sender
```

### How to get a Gmail App Password (free, 2 minutes)
1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification** (required by Google to use App Passwords).
3. Visit https://myaccount.google.com/apppasswords
4. App = "Mail", Device = "Other → CureCycle". Click **Generate**.
5. Copy the 16-character password (spaces optional). Paste into `EMAIL_PASS`.
6. Done. Gmail allows **500 emails/day free** — plenty for v1.

If you ever hit the limit, swap to **Brevo** (300/day forever) or **Resend** (3,000/month) — same Nodemailer code, different SMTP host.
