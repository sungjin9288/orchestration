'use strict';

const crypto = require('crypto');
const dns = require('dns');
const fs = require('fs');
const net = require('net');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);
const DEFAULT_TIMEOUT_MS = 20_000;
const MAX_TIMEOUT_MS = 60_000;
const MIN_CONTENT_CHARS = 256;
const MAX_CONTENT_CHARS = 12_000;
const OPERATOR_ACKNOWLEDGEMENT = 'exact-url-untrusted-evidence-only';

class ExactResearchFetchError extends Error {
  constructor(message, statusCode = 409) {
    super(message);
    this.name = 'ExactResearchFetchError';
    this.statusCode = statusCode;
  }
}

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function isPrivateIpv4(address) {
  const octets = address.split('.').map(Number);
  if (octets.length !== 4 || octets.some((value) => !Number.isInteger(value))) return true;
  const [first, second] = octets;
  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    (first === 198 && [18, 19].includes(second)) ||
    first >= 224
  );
}

function isPrivateIp(address) {
  const normalized = String(address || '').toLowerCase().split('%', 1)[0];
  const family = net.isIP(normalized);
  if (family === 4) return isPrivateIpv4(normalized);
  if (family !== 6) return true;
  if (normalized.startsWith('::ffff:')) {
    return isPrivateIpv4(normalized.slice('::ffff:'.length));
  }
  return (
    normalized === '::' ||
    normalized === '::1' ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    /^fe[89ab]/.test(normalized)
  );
}

async function assertPublicHttpUrl(rawUrl, resolveHost) {
  let parsed;
  try {
    parsed = new URL(String(rawUrl || '').trim());
  } catch (_error) {
    throw new ExactResearchFetchError('Exact research fetch requires a valid URL', 400);
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new ExactResearchFetchError('Exact research fetch allows HTTP or HTTPS only', 400);
  }
  if (parsed.username || parsed.password) {
    throw new ExactResearchFetchError('Credential-bearing URLs are blocked', 400);
  }
  const hostname = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (
    !hostname ||
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local')
  ) {
    throw new ExactResearchFetchError('Loopback and local hostnames are blocked', 400);
  }

  let addresses;
  if (net.isIP(hostname)) {
    addresses = [{ address: hostname }];
  } else {
    try {
      addresses = await resolveHost(hostname);
    } catch (_error) {
      throw new ExactResearchFetchError('Exact research hostname resolution failed');
    }
  }
  if (!Array.isArray(addresses) || addresses.length === 0) {
    throw new ExactResearchFetchError('Exact research hostname resolved to no addresses');
  }
  if (addresses.some((entry) => isPrivateIp(entry.address))) {
    throw new ExactResearchFetchError('Private, loopback, and link-local targets are blocked', 400);
  }
  return parsed.toString();
}

function resolveSidecarPath(sidecarPath) {
  const requested = String(sidecarPath || '').trim();
  if (!requested || !path.isAbsolute(requested)) return null;
  try {
    const resolved = fs.realpathSync(requested);
    const stat = fs.statSync(resolved);
    fs.accessSync(resolved, fs.constants.X_OK);
    return stat.isFile() ? resolved : null;
  } catch (_error) {
    return null;
  }
}

function createWigoloExactFetchAdapter(options = {}) {
  const enabled = options.enabled === true;
  const sidecarPath = resolveSidecarPath(options.sidecarPath);
  const timeoutMs = Number.isInteger(options.timeoutMs)
    ? Math.min(Math.max(options.timeoutMs, 1), MAX_TIMEOUT_MS)
    : DEFAULT_TIMEOUT_MS;
  const resolveHost = options.resolveHost || ((hostname) =>
    dns.promises.lookup(hostname, { all: true, verbatim: true }));
  const now = options.now || (() => new Date().toISOString());

  function getReadiness() {
    const reasons = [];
    if (!enabled) reasons.push('exact-fetch-disabled');
    if (!sidecarPath) reasons.push('sidecar-path-unavailable');
    return deepFreeze({
      adapter: 'wigolo-exact-fetch',
      enabled,
      ready: reasons.length === 0,
      reasons,
      capabilities: {
        exactUrlFetch: reasons.length === 0,
        crawl: false,
        search: false,
        cacheControl: false,
        authenticatedFetch: false,
        persistence: false,
      },
    });
  }

  async function fetchExact(input) {
    const expectedFields = [
      'maxContentChars',
      'operatorAcknowledgement',
      'requestedUrl',
    ].sort();
    const actualFields = Object.keys(input || {}).sort();
    if (
      actualFields.length !== expectedFields.length ||
      actualFields.some((field, index) => field !== expectedFields[index])
    ) {
      throw new ExactResearchFetchError(
        'Exact research fetch has unexpected or missing fields',
        400,
      );
    }
    const readiness = getReadiness();
    if (!readiness.ready) {
      throw new ExactResearchFetchError(
        `Exact research fetch is unavailable: ${readiness.reasons.join(', ')}`,
      );
    }
    if (input.operatorAcknowledgement !== OPERATOR_ACKNOWLEDGEMENT) {
      throw new ExactResearchFetchError('Exact research acknowledgement does not match', 400);
    }
    if (
      !Number.isInteger(input.maxContentChars) ||
      input.maxContentChars < MIN_CONTENT_CHARS ||
      input.maxContentChars > MAX_CONTENT_CHARS
    ) {
      throw new ExactResearchFetchError(
        `maxContentChars must be an integer from ${MIN_CONTENT_CHARS} to ${MAX_CONTENT_CHARS}`,
        400,
      );
    }

    const requestedUrl = await assertPublicHttpUrl(input.requestedUrl, resolveHost);
    let stdout;
    try {
      ({ stdout } = await execFileAsync(
        sidecarPath,
        [
          'fetch',
          requestedUrl,
          '--render-js=never',
          `--max-content-chars=${input.maxContentChars}`,
          '--json',
        ],
        {
          encoding: 'utf8',
          env: {
            HOME: process.env.HOME || '',
            PATH: process.env.PATH || '',
            TMPDIR: process.env.TMPDIR || '',
          },
          maxBuffer: 2 * 1024 * 1024,
          timeout: timeoutMs,
          windowsHide: true,
        },
      ));
    } catch (error) {
      const reason = error.killed || error.signal ? 'timed out' : 'failed';
      throw new ExactResearchFetchError(`wigolo exact fetch ${reason}`);
    }

    let result;
    try {
      result = JSON.parse(stdout);
    } catch (_error) {
      throw new ExactResearchFetchError('wigolo exact fetch returned malformed JSON');
    }
    if (!result || typeof result !== 'object' || Array.isArray(result)) {
      throw new ExactResearchFetchError('wigolo exact fetch returned an invalid response');
    }
    const markdown = String(result.markdown || '');
    if (!markdown.trim()) {
      throw new ExactResearchFetchError('wigolo exact fetch returned no markdown evidence');
    }
    const finalUrl = await assertPublicHttpUrl(
      result.final_url || result.finalUrl || result.url || requestedUrl,
      resolveHost,
    );
    const excerpt = markdown.slice(0, input.maxContentChars);
    const truncated = Boolean(
      result.truncated || markdown.length > input.maxContentChars || /\btruncated\b/i.test(markdown),
    );
    const degraded = Boolean(
      result.degraded ||
      result.warning ||
      result.blocked_by_challenge ||
      (Array.isArray(result.warnings) && result.warnings.length > 0),
    );

    return deepFreeze({
      adapter: 'wigolo-exact-fetch',
      status: degraded ? 'degraded' : 'fetched',
      persisted: false,
      untrustedEvidence: true,
      requestedUrl,
      finalUrl,
      fetchedAt: now(),
      contentDigest: digest(markdown),
      excerpt,
      sourcePosition: {
        unit: 'character',
        start: 0,
        end: excerpt.length,
      },
      title: String(result.title || '').trim() || null,
      degraded,
      truncated,
      blockedAuthorities: [
        'crawl',
        'search',
        'cache-control',
        'persistence',
        'provider-synthesis',
        'mission-injection',
      ],
    });
  }

  return Object.freeze({ fetchExact, getReadiness });
}

module.exports = {
  ExactResearchFetchError,
  OPERATOR_ACKNOWLEDGEMENT,
  assertPublicHttpUrl,
  createWigoloExactFetchAdapter,
  isPrivateIp,
};
