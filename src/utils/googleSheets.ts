export type GoogleSheetPayload = {
  timestamp: string;
  total: number;
  row: string[];
  frames: string[];
};

export const buildGoogleSheetPayload = (
  frames: Array<{ rolls: string[] }>,
  total: number,
  timestamp: string = new Date().toISOString()
): GoogleSheetPayload => ({
  timestamp,
  total,
  row: [timestamp, String(total), ...frames.map((frame) => frame.rolls.join(''))],
  frames: frames.map((frame) => frame.rolls.join('')),
});

export const getGoogleSheetWebhookUrl = () => {
  const envValue = (globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  }).process?.env?.EXPO_PUBLIC_GOOGLE_SHEET_WEBHOOK_URL;

  if (envValue) {
    return envValue;
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem('googleSheetWebhookUrl') ?? '';
  }

  return '';
};

export const getGoogleSheetWebhookUrlWithProxyFallback = () => {
  // priority: explicit proxy env, explicit webhook env, localStorage, local dev proxy fallback
  const proxyEnv = (globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  }).process?.env?.EXPO_PUBLIC_GOOGLE_SHEET_PROXY_URL;

  if (proxyEnv) return proxyEnv;

  const webhookEnv = (globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  }).process?.env?.EXPO_PUBLIC_GOOGLE_SHEET_WEBHOOK_URL;

  if (webhookEnv) return webhookEnv;

  if (typeof window !== 'undefined' && window.localStorage) {
    const stored = window.localStorage.getItem('googleSheetWebhookUrl');
    if (stored) return stored;

    // local dev convenience: if running in browser and no webhook configured, use local proxy
    // only use this as a fallback for development/testing
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
      return 'http://127.0.0.1:3000/proxy';
    }
  }

  return '';
};

export const saveScoreToGoogleSheet = async (
  payload: GoogleSheetPayload,
  endpointUrl: string
) => {
  if (!endpointUrl) {
    throw new Error('No Google Sheet endpoint configured.');
  }

  if (!/^https?:\/\//i.test(endpointUrl)) {
    throw new Error('Google Sheet endpoint must be an HTTP(S) URL.');
  }

  const controller = new AbortController();
  const timeoutMs = 10000; // 10s timeout
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Debug: log endpoint before attempting fetch (helps diagnose 'Failed to fetch')
    try {
      console.debug('GoogleSheets: POST', endpointUrl, 'payload:', payload);
    } catch {}

    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      mode: 'cors',
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const body = await response.text();
      throw new Error(body || `Google Sheets save failed with status ${response.status}.`);
    }

    return response;
  } catch (err: any) {
    clearTimeout(timeout);
    // Log full error for debugging in browser console
    try {
      console.error('GoogleSheets: save error', err);
    } catch {}

    if (err && err.name === 'AbortError') {
      throw new Error('Network timeout when saving to Google Sheets.');
    }

    const details = `${err?.name ?? 'Error'}: ${err?.message ?? String(err)}`;
    throw new Error(`Failed to save to Google Sheets: ${details}`);
  }
};
