import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import adapterModule from '../src/research/wigolo-exact-fetch-adapter.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const { createWigoloExactFetchAdapter } = adapterModule;
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tempRoot = path.join(repoRoot, 'var', 'wigolo-exact-fetch-smoke');
const sidecarPath = path.join(tempRoot, 'fake-wigolo.cjs');
const argsPath = path.join(tempRoot, 'args.json');
const runtimeRoot = path.join(tempRoot, 'runtime');
const port = 9760 + (process.pid % 150);
const baseUrl = `http://127.0.0.1:${port}`;
const MODE = 'wigolo-exact-fetch-adapter-smoke';
const acknowledgement = 'exact-url-untrusted-evidence-only';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

function writeFakeSidecar() {
  fs.mkdirSync(tempRoot, { recursive: true });
  fs.writeFileSync(
    sidecarPath,
    `#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const args = process.argv.slice(2);
fs.writeFileSync(path.join(__dirname, 'args.json'), JSON.stringify(args));
const requestedUrl = args[1] || '';
if (requestedUrl.includes('/malformed')) {
  process.stdout.write('not-json');
} else if (requestedUrl.includes('/slow')) {
  setTimeout(() => process.stdout.write(JSON.stringify({ url: requestedUrl, markdown: 'late evidence' })), 250);
} else {
  const markdown = 'Exact source evidence. '.repeat(24);
  process.stdout.write(JSON.stringify({
    url: requestedUrl,
    final_url: requestedUrl.includes('/redirect-private') ? 'http://127.0.0.1/private' : requestedUrl,
    title: 'Synthetic exact source',
    markdown,
    warning: requestedUrl.includes('/degraded') ? 'synthetic degradation' : null
  }));
}
`,
  );
  fs.chmodSync(sidecarPath, 0o755);
}

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/research/exact-fetch/readiness`);
      if (response.ok) return;
    } catch (_error) {
      // Wait for the local server to bind.
    }
    await delay(150);
  }
  throw new Error('Timed out waiting for exact-fetch API smoke server');
}

async function requestJson(pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, options);
  return { response, payload: await response.json() };
}

function postJson(body, contentType = 'application/json') {
  return requestJson('/api/research/exact-fetch', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': contentType },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

async function main() {
  fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  writeFakeSidecar();
  const resolveHost = async () => [{ address: '93.184.216.34', family: 4 }];
  const adapter = createWigoloExactFetchAdapter({
    enabled: true,
    sidecarPath,
    resolveHost,
    now: () => '2030-01-01T00:00:00.000Z',
  });

  assert.equal(adapter.getReadiness().ready, true);
  assert.equal(adapter.getReadiness().capabilities.exactUrlFetch, true);
  const input = {
    requestedUrl: 'https://93.184.216.34/exact?value=a%3Bb',
    maxContentChars: 256,
    operatorAcknowledgement: acknowledgement,
  };
  const evidence = await adapter.fetchExact(input);
  assert.equal(evidence.status, 'fetched');
  assert.equal(evidence.persisted, false);
  assert.equal(evidence.untrustedEvidence, true);
  assert.equal(evidence.excerpt.length, 256);
  assert.equal(evidence.truncated, true);
  assert.equal(evidence.sourcePosition.end, 256);
  assert.match(evidence.contentDigest, /^[a-f0-9]{64}$/);
  assert.ok(Object.isFrozen(evidence));
  assert.deepEqual(JSON.parse(fs.readFileSync(argsPath, 'utf8')), [
    'fetch',
    input.requestedUrl,
    '--render-js=never',
    '--max-content-chars=256',
    '--json',
  ]);

  const beforeRejected = fs.readFileSync(argsPath);
  for (const requestedUrl of [
    'http://127.0.0.1/private',
    'http://169.254.169.254/latest/meta-data',
    'http://[::1]/private',
    'https://user:secret@example.com/private',
  ]) {
    await assert.rejects(
      adapter.fetchExact({ ...input, requestedUrl }),
      /blocked|Credential-bearing/,
    );
  }
  assert.deepEqual(fs.readFileSync(argsPath), beforeRejected);
  await assert.rejects(
    adapter.fetchExact({ ...input, requestedUrl: 'https://93.184.216.34/redirect-private' }),
    /Private, loopback, and link-local targets are blocked/,
  );
  await assert.rejects(
    adapter.fetchExact({ ...input, requestedUrl: 'https://93.184.216.34/malformed' }),
    /malformed JSON/,
  );
  const timeoutAdapter = createWigoloExactFetchAdapter({
    enabled: true,
    sidecarPath,
    resolveHost,
    timeoutMs: 40,
  });
  await assert.rejects(
    timeoutAdapter.fetchExact({ ...input, requestedUrl: 'https://93.184.216.34/slow' }),
    /timed out/,
  );
  const disabled = createWigoloExactFetchAdapter({ enabled: false, sidecarPath });
  assert.equal(disabled.getReadiness().ready, false);
  await assert.rejects(disabled.fetchExact(input), /exact-fetch-disabled/);

  const server = spawn(
    process.execPath,
    ['scripts/serve-ui-slice-01.mjs', '--port', String(port), '--runtime-root', runtimeRoot],
    {
      cwd: repoRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        ORCHESTRATION_WIGOLO_EXACT_FETCH_ENABLED: '1',
        ORCHESTRATION_WIGOLO_SIDECAR_PATH: sidecarPath,
      },
    },
  );
  let stderr = '';
  server.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });
  try {
    await waitForServer();
    const readiness = await requestJson('/api/research/exact-fetch/readiness');
    assert.equal(readiness.payload.exactResearchReadiness.ready, true);
    const apiFetched = await postJson(input);
    assert.equal(apiFetched.response.status, 200);
    assert.equal(apiFetched.payload.exactResearchEvidence.status, 'fetched');
    const privateTarget = await postJson({
      ...input,
      requestedUrl: 'http://127.0.0.1/private',
    });
    assert.equal(privateTarget.response.status, 400);
    const wrongContentType = await postJson(input, 'text/plain');
    assert.equal(wrongContentType.response.status, 415);
    const oversized = await postJson(JSON.stringify({
      ...input,
      padding: 'x'.repeat(17 * 1024),
    }));
    assert.equal(oversized.response.status, 413);

    console.log(JSON.stringify({
      ok: true,
      mode: MODE,
      adapter: 'wigolo-exact-fetch',
      defaultDisabled: true,
      invocation: 'execFile-no-shell',
      output: [
        'requestedUrl',
        'finalUrl',
        'fetchedAt',
        'contentDigest',
        'excerpt',
        'sourcePosition',
        'degraded',
        'truncated',
      ],
      ssrf: 'requested-and-final-url-public-only',
      apiStatuses: {
        fetched: apiFetched.response.status,
        privateTarget: privateTarget.response.status,
        unsupportedMedia: wrongContentType.response.status,
        oversized: oversized.response.status,
      },
      blocked: ['crawl', 'cache', 'search', 'persistence', 'provider-synthesis', 'mission-injection'],
    }, null, 2));
  } finally {
    server.kill('SIGTERM');
    await Promise.race([
      new Promise((resolve) => server.once('exit', resolve)),
      delay(2000),
    ]);
    if (stderr.trim()) process.stderr.write(stderr);
    fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
