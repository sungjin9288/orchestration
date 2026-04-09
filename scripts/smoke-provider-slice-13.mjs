import assert from 'node:assert/strict';

import retryPolicyModule from '../src/execution/providers/openai-responses-retry-policy.js';

const {
  DEFAULT_OPENAI_RESPONSES_MAX_RETRY_ATTEMPTS,
  DEFAULT_OPENAI_RESPONSES_RETRY_DELAY_MS,
  DEFAULT_OPENAI_RESPONSES_TIMEOUT_MS,
  MAX_OPENAI_RESPONSES_RETRY_DELAY_MS,
  parseOpenAIResponsesRetryDurationMs,
  resolveOpenAIResponsesMaxRetryAttempts,
  resolveOpenAIResponsesRetryDelayFromHeaders,
  resolveOpenAIResponsesRetryDelayMs,
  resolveOpenAIResponsesTimeoutMs,
  shouldRetryOpenAIResponsesStatus,
  waitForOpenAIResponsesRetryDelay,
} = retryPolicyModule;

function createHeaders(values = {}) {
  const entries = new Map(
    Object.entries(values).map(([key, value]) => [String(key).toLowerCase(), String(value)]),
  );

  return {
    get(name) {
      return entries.get(String(name || '').toLowerCase()) || null;
    },
  };
}

const originalEnv = {
  OPENAI_RESPONSES_MAX_RETRY_ATTEMPTS: process.env.OPENAI_RESPONSES_MAX_RETRY_ATTEMPTS,
  OPENAI_RESPONSES_RETRY_DELAY_MS: process.env.OPENAI_RESPONSES_RETRY_DELAY_MS,
  OPENAI_RESPONSES_TIMEOUT_MS: process.env.OPENAI_RESPONSES_TIMEOUT_MS,
};

try {
  delete process.env.OPENAI_RESPONSES_TIMEOUT_MS;
  delete process.env.OPENAI_RESPONSES_MAX_RETRY_ATTEMPTS;
  delete process.env.OPENAI_RESPONSES_RETRY_DELAY_MS;

  assert.equal(resolveOpenAIResponsesTimeoutMs(), DEFAULT_OPENAI_RESPONSES_TIMEOUT_MS);
  assert.equal(
    resolveOpenAIResponsesMaxRetryAttempts(),
    DEFAULT_OPENAI_RESPONSES_MAX_RETRY_ATTEMPTS,
  );
  assert.equal(resolveOpenAIResponsesRetryDelayMs(), DEFAULT_OPENAI_RESPONSES_RETRY_DELAY_MS);

  process.env.OPENAI_RESPONSES_TIMEOUT_MS = '54321';
  process.env.OPENAI_RESPONSES_MAX_RETRY_ATTEMPTS = '4';
  process.env.OPENAI_RESPONSES_RETRY_DELAY_MS = '875';

  assert.equal(resolveOpenAIResponsesTimeoutMs(), 54321);
  assert.equal(resolveOpenAIResponsesMaxRetryAttempts(), 4);
  assert.equal(resolveOpenAIResponsesRetryDelayMs(), 875);

  assert.equal(resolveOpenAIResponsesTimeoutMs({ timeoutMs: 11111 }), 11111);
  assert.equal(resolveOpenAIResponsesMaxRetryAttempts({ maxRetryAttempts: 2 }), 2);
  assert.equal(resolveOpenAIResponsesRetryDelayMs({ retryDelayMs: 125 }), 125);

  assert.equal(shouldRetryOpenAIResponsesStatus(429), true);
  assert.equal(shouldRetryOpenAIResponsesStatus(500), true);
  assert.equal(shouldRetryOpenAIResponsesStatus(400), false);

  assert.equal(parseOpenAIResponsesRetryDurationMs('250ms'), 250);
  assert.equal(parseOpenAIResponsesRetryDurationMs('2s'), 2000);
  assert.equal(parseOpenAIResponsesRetryDurationMs('1m30s'), MAX_OPENAI_RESPONSES_RETRY_DELAY_MS);
  assert.equal(parseOpenAIResponsesRetryDurationMs('bad-value'), null);

  assert.equal(
    resolveOpenAIResponsesRetryDelayFromHeaders(createHeaders({ 'retry-after': '2' }), 500, 0),
    2000,
  );
  assert.equal(
    resolveOpenAIResponsesRetryDelayFromHeaders(
      createHeaders({ 'x-ratelimit-reset-requests': '1500ms' }),
      500,
      0,
    ),
    1500,
  );
  assert.equal(
    resolveOpenAIResponsesRetryDelayFromHeaders(
      createHeaders({ 'x-ratelimit-reset-tokens': '1.5s' }),
      500,
      0,
    ),
    1500,
  );
  assert.equal(
    resolveOpenAIResponsesRetryDelayFromHeaders(createHeaders(), 700, 2),
    2100,
  );
  assert.equal(
    resolveOpenAIResponsesRetryDelayFromHeaders(createHeaders(), 40000, 2),
    MAX_OPENAI_RESPONSES_RETRY_DELAY_MS,
  );

  const delayedStartedAt = Date.now();
  await waitForOpenAIResponsesRetryDelay(5);
  assert.ok(Date.now() - delayedStartedAt >= 0);
  await waitForOpenAIResponsesRetryDelay(0);
} finally {
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

console.log(
  JSON.stringify(
    {
      ok: true,
      defaults: {
        maxRetryAttempts: DEFAULT_OPENAI_RESPONSES_MAX_RETRY_ATTEMPTS,
        retryDelayMs: DEFAULT_OPENAI_RESPONSES_RETRY_DELAY_MS,
        timeoutMs: DEFAULT_OPENAI_RESPONSES_TIMEOUT_MS,
      },
      smoke: 'openai-responses retry policy structure boundary',
    },
    null,
    2,
  ),
);
