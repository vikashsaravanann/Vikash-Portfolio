# Vikash's Portfolio

A responsive portfolio with skills, certificates, and direct contact links. The homepage uses local assets and vanilla JavaScript, including accessible navigation, certificate previews, and animations that respect reduced-motion preferences. Its quick portfolio guide provides preset information locally and does not need an AI API.

## Local frontend development

```bash
npm ci
npm run dev
```

Open **http://127.0.0.1:5500**. Set `PORT` to use another port, for example `PORT=5501 npm run dev`. The preview serves only the portfolio pages and browser assets; `/api` requests return a clear `503` response because this workflow does not run the backend.

The main design files are `index.html`, `css/portfolio.css`, and `js/portfolio.js`. Fonts, portraits, and certificates live in `assets/`. No frontend build step or API credentials are required.

For optional browser smoke checks, install Playwright and its Chromium browser in your development tooling, start the preview, and run:

```bash
node tests/portfolio.smoke.cjs
```

The checks use `http://127.0.0.1:5500` and `/usr/bin/chromium` by default. Set `PORTFOLIO_URL` or `CHROMIUM_PATH` for a different preview address or browser installation.

## Legacy bridge and integrations

`npm start` still launches the legacy `server.js` bridge. That backend currently references missing modules, including `lib/contact-delivery.js` and `lib/analytics-store.js`, and requires separate repair before it can start. The redesigned homepage uses email and social links for contact. The following backend notes describe the older integration paths and do not apply to the frontend preview.

### Contact backend configuration

The legacy contact forms submit to `/api/contact`.

To receive incoming contact messages, configure **any** of the following notification channels in your local `.env` file or hosting environment variables dashboard. The backend will automatically detect and route messages to all configured systems:

### 1. Discord Webhooks (Recommended & Free)
Deliver form submissions directly as rich cards to a Discord server channel:
* `DISCORD_WEBHOOK_URL`: The webhook URL copied from your Discord channel settings.

### 2. Telegram Bot (Free)
Deliver form submissions as instant alerts directly to your phone via Telegram:
* `TELEGRAM_BOT_TOKEN`: The HTTP API token received from `@BotFather`.
* `TELEGRAM_CHAT_ID`: Your private Telegram user chat ID (you can get this by messaging `@userinfobot`).

### 3. SMTP Emails (Nodemailer)
Deliver submissions directly to your email inbox:
* `SMTP_HOST`: The SMTP server host address (e.g., `smtp.gmail.com`).
* `SMTP_PORT`: The connection port, typically `465` (SSL/TLS) or `587` (STARTTLS).
* `SMTP_USER`: The sender email address.
* `SMTP_PASS`: The sender account password (if using Gmail, generate and use a secure **App Password**).
* `CONTACT_RECEIVER_EMAIL`: The inbox address where you want to receive these messages (defaults to `vikash07052008@gmail.com` if left blank).

---

## Broadcast Automation Hub

The **Broadcast Automation Hub** (`automation-hub.html`) allows you to dispatch multi-channel announcements to a pre-defined list of recipients. 
It supports parallel dispatching to **Email (SMTP)**, **SMS (Fast2SMS)**, **Telegram**, and **WhatsApp (Cloud API)**.

### Accessing the Hub
The hub requires authentication. Set the `BROADCAST_ADMIN_TOKEN` in your environment variables. 
When you visit the page, you will be prompted to enter this token.

### Setting up the Channels

#### 1. Telegram
To allow recipients to receive Telegram broadcasts, they must start a conversation with your bot.
1. Set `TELEGRAM_BROADCAST_BOT_TOKEN` in your environment.
2. Set a secure `TELEGRAM_WEBHOOK_SECRET`.
3. Set your Telegram Bot's webhook to point to your live site:
   `https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=https://your-domain.com/api/broadcast/telegram-webhook?secret=<YOUR_SECRET>`
4. When a user sends `/start` to your bot, it will reply with their Chat ID. Add this ID to their profile in your recipient source.

#### 2. WhatsApp (Option A: Meta Cloud API)
To send WhatsApp messages serverlessly, you must use the official Meta WhatsApp Business Cloud API.
1. Register as a Meta Developer and create an App with WhatsApp access.
2. Generate a permanent access token and note your Phone Number ID.
3. Add `WHATSAPP_CLOUD_API_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID` to your environment.
*(Note: To send freeform text messages, an active 24-hour service window with the user is required. Otherwise, you must configure pre-approved templates in the code.)*

#### 3. SMS (Fast2SMS)
Set `FAST2SMS_API_KEY`. It automatically parses 10-digit Indian phone numbers.

### Recipient Data Source
For security, recipient data is not stored in the repository. Provide a JSON file endpoint in `BROADCAST_RECIPIENTS_SOURCE`. The JSON must be an array of objects like:
```json
[
  {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "telegram_chat_id": "123456789"
  }
]
```
