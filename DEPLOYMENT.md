# 🚀 CureCycle Backend — Free Deployment Guide

Goal: get your backend live on the internet for **$0**, with MongoDB, cron jobs, OCR, and email all working.

---

## 🧱 Stack we'll use (all free)

| Component | Service | Free tier |
|---|---|---|
| Backend host | **Render** | 750 hrs/month |
| Database | **MongoDB Atlas** | 512 MB forever |
| Email | **Gmail SMTP** | 500 emails/day |
| Code hosting | **GitHub** | Free |

Total: **$0/month**.

---

## 📦 Step 1 — Install new dependencies (locally)

In your backend folder:

```bash
npm install nodemailer express-rate-limit
```

Make sure `package.json` already has: `express`, `mongoose`, `cors`, `dotenv`,
`bcryptjs`, `jsonwebtoken`, `multer`, `sharp`, `tesseract.js`, `node-cron`,
`openai`. If not:

```bash
npm install express mongoose cors dotenv bcryptjs jsonwebtoken multer sharp tesseract.js node-cron openai
```

Then add a start script to `package.json`:

```json
{
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  }
}
```

Test locally: `npm start` → should print `🚀 Server running on port 5000`.

---

## ☁️ Step 2 — Set up MongoDB Atlas (free DB)

1. Sign up at https://www.mongodb.com/atlas → **Build a database** → **M0 Free**.
2. Pick **AWS** + a region close to you (or close to Render's region).
3. Create a database **user** (username + strong password — save it).
4. Network Access → **Add IP** → **Allow access from anywhere** (`0.0.0.0/0`).
   *(Required because Render IPs change. Safe because you have password auth.)*
5. **Connect** → **Drivers** → copy the connection string. Looks like:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/curecycle?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password and add `/curecycle` as the DB name.

This is your `MONGO_URI`.

---

## 📧 Step 3 — Gmail App Password (free email)

1. https://myaccount.google.com/security → enable **2-Step Verification**.
2. https://myaccount.google.com/apppasswords → App: Mail, Device: "CureCycle" → **Generate**.
3. Copy the 16-character code → this is your `EMAIL_PASS`.
4. Your Gmail address is your `EMAIL_USER`.

---

## 🐙 Step 4 — Push code to GitHub

```bash
cd backend
git init
git add .
git commit -m "Initial backend"
```

⚠️ Create `.gitignore` first:
```
node_modules/
.env
uploads/
*.log
```

Create a new repo on github.com, then:
```bash
git remote add origin https://github.com/<you>/curecycle-backend.git
git branch -M main
git push -u origin main
```

---

## 🚀 Step 5 — Deploy on Render

1. Sign up at https://render.com (free, GitHub login).
2. **New +** → **Web Service** → connect your GitHub repo.
3. Settings:
   - **Name:** `curecycle-api`
   - **Region:** same as MongoDB Atlas
   - **Branch:** `main`
   - **Runtime:** Node
   - **Build command:** `npm install`
   - **Start command:** `npm start`
   - **Instance type:** **Free**
4. Scroll to **Environment Variables** → add:

   | Key | Value |
   |---|---|
   | `MONGO_URI` | (from Atlas) |
   | `JWT_SECRET` | a long random string (e.g. `openssl rand -hex 32`) |
   | `OPENAI_API_KEY` | your OpenAI key (optional, falls back if missing) |
   | `CLIENT_URL` | your frontend URL (e.g. `https://curecycle.lovable.app`) |
   | `EMAIL_USER` | your Gmail |
   | `EMAIL_PASS` | the 16-char App Password |
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` *(Render's default)* |

5. Click **Create Web Service**. First deploy takes ~5 min (sharp + tesseract are big).
6. When you see `🚀 Server running on port 10000` → ✅ done.
7. Your API is live at `https://curecycle-api.onrender.com`.

Test: visit `https://curecycle-api.onrender.com/` → should show `🚀 CureCycle API Running...`

---

## ⚠️ Important — Render Free tier quirks

1. **Sleeps after 15 min idle** → first request after sleep takes ~30s. Two fixes:
   - Use **UptimeRobot** (free) to ping `/` every 5 minutes → keeps it awake.
   - Or accept the cold start (fine for low-traffic v1).

2. **Ephemeral disk** → `uploads/` is wiped on each restart. Not a problem because:
   - Your scan controllers already delete files after processing ✅
   - Nothing else writes to disk

3. **node-cron works** because the process stays alive between requests. ✅

---

## 🎨 Step 6 — Connect your frontend

Wherever your Lovable frontend calls the API:

```ts
const API_URL = "https://curecycle-api.onrender.com/api";
fetch(`${API_URL}/auth/login`, { ... })
```

Make sure `CLIENT_URL` on Render matches your frontend URL exactly (CORS).

---

## 🧪 Step 7 — Test it

```bash
# Health check
curl https://curecycle-api.onrender.com/

# Register (rate-limited to 5/15min/IP)
curl -X POST https://curecycle-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test","email":"test@test.com","password":"test123"}'

# Barcode lookup (OpenFoodFacts)
curl -X POST https://curecycle-api.onrender.com/api/barcode \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"barcode":"8901030865278"}'
```

Set a reminder for 1 minute from now → check inbox 📧 → 🎉.

---

## 🆘 Troubleshooting

| Problem | Fix |
|---|---|
| `MongoServerError: bad auth` | Wrong password in MONGO_URI, or special chars not URL-encoded |
| `EAUTH` from Gmail | App Password wrong or 2FA not enabled |
| CORS error in browser | `CLIENT_URL` env var doesn't match frontend origin |
| Build fails on `sharp` | Render handles it automatically — wait, it's slow |
| API returns 429 | You hit the rate limit (5 logins / 15 min). Wait or use a different IP |
| Cold start too slow | Set up UptimeRobot ping every 5 min |

---

## 📈 When you outgrow Render free

- **Render Starter** $7/month → no sleep, more RAM
- **Railway** $5 credit then pay-as-you-go
- **Fly.io** stays mostly free with smart config
- **VPS** (Hetzner €4/month, DigitalOcean $6/month) for full control

You won't need this for a long time. 🚀

---

## ✅ Done!

You now have:
- Live API on the internet
- Free MongoDB
- Free email reminders + expiry digests
- Free barcode product lookup
- Brute-force protection
- All 12 v2 security/bug fixes

Next: build the frontend in Lovable and point it at your Render URL.
