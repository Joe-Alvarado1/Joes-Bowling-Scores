Simple Express proxy to avoid browser CORS when calling an Apps Script web app.

Setup

1. From the repository root, install the proxy dependencies:

```bash
npm --prefix tools/proxy install
```

2. Copy `tools/proxy/.env.example` to `tools/proxy/.env` and set `TARGET_URL` to your Apps Script exec URL.

3. Start the proxy from a second terminal and keep it running while using the app:

```bash
npm --prefix tools/proxy start
```

Usage

- From the browser app, POST to `http://127.0.0.1:3000/proxy` with the same JSON payload you were sending to the Apps Script.
- The proxy forwards the request to the configured `TARGET_URL` and returns the response, while adding CORS headers so the browser can call it directly.

Notes

- This proxy binds to loopback and is intended for development/testing. For production, deploy a protected HTTPS proxy with authentication and rate limiting.
