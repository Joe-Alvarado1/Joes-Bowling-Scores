# Joe's Bowling Scores

A React Native mobile score tracker built with TypeScript.

## What it does

- Track 10 bowling frames
- Enter pin counts for each roll
- Calculate total score including strikes and spares
- Validate frame input rules

## Run locally

1. Open a terminal in `C:\Users\jra62\Joes-Bowling-Scores`
2. Run `npm install`
3. Run `npm start`
4. Open the app on a phone or simulator with Expo

## Save scores to Google Sheets locally

The browser app uses a local proxy to avoid Google Apps Script CORS restrictions. In a second terminal, install and start it:

```bash
npm --prefix tools/proxy install
npm --prefix tools/proxy start
```

Keep the proxy running while saving scores. Configure `tools/proxy/.env` with the deployed Apps Script `/exec` URL as `TARGET_URL`.

## Notes

- Frames 1-9 use two rolls.
- Frame 10 supports up to three rolls.
- The app shows cumulative frame score and final total.
