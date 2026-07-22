import path from 'node:path';
import { fileURLToPath } from 'node:url';

import adapterModule from '../src/research/wigolo-exact-fetch-adapter.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const { createWigoloExactFetchAdapter } = adapterModule;
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MODE = 'wigolo-exact-fetch-live-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

const sidecarPath = process.env.ORCHESTRATION_WIGOLO_SIDECAR_PATH;
const requestedUrl = process.env.ORCHESTRATION_WIGOLO_LIVE_URL;
if (
  process.env.ORCHESTRATION_WIGOLO_EXACT_FETCH_ENABLED !== '1' ||
  !sidecarPath ||
  !requestedUrl
) {
  console.log(JSON.stringify({
    ok: true,
    mode: MODE,
    status: 'skipped_missing_env',
    required: [
      'ORCHESTRATION_WIGOLO_EXACT_FETCH_ENABLED=1',
      'ORCHESTRATION_WIGOLO_SIDECAR_PATH',
      'ORCHESTRATION_WIGOLO_LIVE_URL',
    ],
    repoRoot,
  }, null, 2));
} else {
  const adapter = createWigoloExactFetchAdapter({ enabled: true, sidecarPath });
  const evidence = await adapter.fetchExact({
    requestedUrl,
    maxContentChars: 2000,
    operatorAcknowledgement: 'exact-url-untrusted-evidence-only',
  });
  console.log(JSON.stringify({
    ok: true,
    mode: MODE,
    status: 'passed_live',
    evidence: {
      requestedUrl: evidence.requestedUrl,
      finalUrl: evidence.finalUrl,
      contentDigest: evidence.contentDigest,
      degraded: evidence.degraded,
      truncated: evidence.truncated,
    },
  }, null, 2));
}
