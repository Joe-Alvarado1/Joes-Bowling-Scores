Simple Express proxy to avoid browser CORS when calling an Apps Script web app.

Setup

1. From the `tools/proxy` folder run:

```bash
npm install
```

2. Copy `.env.example` to `.env` and set `TARGET_URL` to your Apps Script exec URL.

3. Start the proxy:

```bash
npm start
```

Usage

- From the browser app, POST to `http://localhost:3000/proxy` with the same JSON payload you were sending to the Apps Script.
- The proxy forwards the request to the configured `TARGET_URL` and returns the response, while adding CORS headers so the browser can call it directly.

Notes

- This proxy is intended for development/testing. For production, run it behind HTTPS and add authentication/ratelimiting.
