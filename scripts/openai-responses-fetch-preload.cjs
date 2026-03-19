'use strict';

const fs = require('node:fs');

const rawQueue = process.env.QA_SLICE_03_OPENAI_FETCH_STUB_PAYLOADS || '';
const capturePath = process.env.QA_SLICE_03_OPENAI_FETCH_CAPTURE_PATH || '';
const targetUrl =
  process.env.QA_SLICE_03_OPENAI_FETCH_STUB_TARGET_URL ||
  'https://api.openai.com/v1/responses';

if (rawQueue) {
  if (typeof globalThis.fetch !== 'function') {
    throw new Error('QA slice 03 fetch preload requires global fetch support');
  }

  const originalFetch = globalThis.fetch.bind(globalThis);
  const queue = JSON.parse(rawQueue);
  const capturedCalls = [];

  function sanitizeHeaders(headers) {
    const source = headers && typeof headers === 'object' ? headers : {};
    const lowerCaseHeaders = {};

    for (const [key, value] of Object.entries(source)) {
      lowerCaseHeaders[String(key).toLowerCase()] = value;
    }

    return {
      authorizationPresent: Boolean(
        lowerCaseHeaders.authorization && String(lowerCaseHeaders.authorization).trim(),
      ),
      contentType:
        typeof lowerCaseHeaders['content-type'] === 'string'
          ? lowerCaseHeaders['content-type']
          : null,
    };
  }

  function persistCapturedCalls() {
    if (!capturePath) {
      return;
    }

    fs.writeFileSync(capturePath, `${JSON.stringify(capturedCalls, null, 2)}\n`, 'utf8');
  }

  globalThis.fetch = async function qaSlice03FetchStub(url, init = {}) {
    const resolvedUrl =
      typeof url === 'string'
        ? url
        : url && typeof url === 'object' && typeof url.url === 'string'
          ? url.url
          : String(url);

    if (resolvedUrl !== targetUrl) {
      return originalFetch(url, init);
    }

    capturedCalls.push({
      body: typeof init.body === 'string' ? init.body : '',
      headers: sanitizeHeaders(init.headers),
      method: typeof init.method === 'string' ? init.method : 'GET',
      url: resolvedUrl,
    });
    persistCapturedCalls();

    if (queue.length === 0) {
      throw new Error('No queued response for qa-slice-03 openai-responses fetch stub');
    }

    const next = queue.shift();

    if (next && typeof next === 'object' && typeof next.throwError === 'string') {
      throw new Error(next.throwError);
    }

    const status =
      next && typeof next === 'object' && Number.isInteger(next.status) ? next.status : 200;
    const payload =
      next && typeof next === 'object' && next.payload && typeof next.payload === 'object'
        ? next.payload
        : {};

    return {
      ok: status >= 200 && status < 300,
      status,
      async text() {
        return JSON.stringify(payload);
      },
    };
  };
}
