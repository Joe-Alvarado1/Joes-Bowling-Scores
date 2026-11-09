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

  if (typeof globalThis.window !== 'undefined' && globalThis.window.localStorage) {
    return globalThis.window.localStorage.getItem('googleSheetWebhookUrl') ?? '';
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

  if (typeof globalThis.window !== 'undefined' && globalThis.window.localStorage) {
    const stored = globalThis.window.localStorage.getItem('googleSheetWebhookUrl');
    if (stored) return stored;

    // local dev convenience: if running in browser and no webhook configured, use local proxy
    // only use this as a fallback for development/testing
    if (
      globalThis.window.location.hostname === 'localhost' ||
      globalThis.window.location.hostname === '127.0.0.1'
    ) {
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

  const controller = new globalThis.AbortController();
  const timeoutMs = 10000; // 10s timeout
  const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await globalThis.fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      mode: 'cors',
      signal: controller.signal,
    });

    globalThis.clearTimeout(timeout);

    if (!response.ok) {
      const body = await response.text();
      throw new Error(body || `Google Sheets save failed with status ${response.status}.`);
    }

    return response;
  } catch (error: unknown) {
    globalThis.clearTimeout(timeout);

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Network timeout when saving to Google Sheets.');
    }

    const details =
      error instanceof Error ? `${error.name}: ${error.message}` : `Error: ${String(error)}`;
    throw new Error(`Failed to save to Google Sheets: ${details}`);
  }
};
