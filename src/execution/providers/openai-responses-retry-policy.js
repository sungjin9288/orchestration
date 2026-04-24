'use strict';

const DEFAULT_OPENAI_RESPONSES_TIMEOUT_MS = 120000;
const DEFAULT_OPENAI_RESPONSES_MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_OPENAI_RESPONSES_RETRY_DELAY_MS = 1500;
const MAX_OPENAI_RESPONSES_RETRY_DELAY_MS = 60000;

function normalizeRetryHeaderValue(value) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
}

function resolveOpenAIResponsesTimeoutMs(options = {}) {
  if (Number.isInteger(options.timeoutMs) && options.timeoutMs > 0) {
    return options.timeoutMs;
  }

  const envTimeoutMs = Number.parseInt(process.env.OPENAI_RESPONSES_TIMEOUT_MS || '', 10);

  if (Number.isInteger(envTimeoutMs) && envTimeoutMs > 0) {
    return envTimeoutMs;
  }

  return DEFAULT_OPENAI_RESPONSES_TIMEOUT_MS;
}

function resolveOpenAIResponsesMaxRetryAttempts(options = {}) {
  if (Number.isInteger(options.maxRetryAttempts) && options.maxRetryAttempts >= 0) {
    return options.maxRetryAttempts;
  }

  const envValue = Number.parseInt(process.env.OPENAI_RESPONSES_MAX_RETRY_ATTEMPTS || '', 10);

  if (Number.isInteger(envValue) && envValue >= 0) {
    return envValue;
  }

  return DEFAULT_OPENAI_RESPONSES_MAX_RETRY_ATTEMPTS;
}

function resolveOpenAIResponsesRetryDelayMs(options = {}) {
  if (Number.isInteger(options.retryDelayMs) && options.retryDelayMs >= 0) {
    return options.retryDelayMs;
  }

  const envValue = Number.parseInt(process.env.OPENAI_RESPONSES_RETRY_DELAY_MS || '', 10);

  if (Number.isInteger(envValue) && envValue >= 0) {
    return envValue;
  }

  return DEFAULT_OPENAI_RESPONSES_RETRY_DELAY_MS;
}

function shouldRetryOpenAIResponsesStatus(status) {
  return status === 429 || status >= 500;
}

function parseOpenAIResponsesRetryDurationMs(value) {
  const sanitized = normalizeRetryHeaderValue(value);

  if (!sanitized) {
    return null;
  }

  const durationMatches = [...sanitized.matchAll(/(\d+(?:\.\d+)?)(ms|s|m|h)/g)];

  if (durationMatches.length > 0) {
    const matchedLength = durationMatches.reduce((total, match) => total + match[0].length, 0);

    if (matchedLength === sanitized.length) {
      let totalMs = 0;

      for (const [, amountText, unit] of durationMatches) {
        const amount = Number.parseFloat(amountText);

        if (!Number.isFinite(amount) || amount < 0) {
          return null;
        }

        if (unit === 'ms') {
          totalMs += amount;
        } else if (unit === 's') {
          totalMs += amount * 1000;
        } else if (unit === 'm') {
          totalMs += amount * 60 * 1000;
        } else if (unit === 'h') {
          totalMs += amount * 60 * 60 * 1000;
        }
      }

      return Math.min(Math.ceil(totalMs), MAX_OPENAI_RESPONSES_RETRY_DELAY_MS);
    }
  }

  const numericSeconds = Number.parseFloat(sanitized);

  if (Number.isFinite(numericSeconds) && numericSeconds >= 0) {
    return Math.min(
      Math.ceil(numericSeconds * 1000),
      MAX_OPENAI_RESPONSES_RETRY_DELAY_MS,
    );
  }

  return null;
}

function resolveOpenAIResponsesRetryDelayFromHeaders(headers, fallbackDelayMs, attemptIndex) {
  const retryAfter = normalizeRetryHeaderValue(headers?.get?.('retry-after'));

  if (retryAfter) {
    const retryAfterSeconds = Number.parseFloat(retryAfter);

    if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds >= 0) {
      return Math.min(
        Math.ceil(retryAfterSeconds * 1000),
        MAX_OPENAI_RESPONSES_RETRY_DELAY_MS,
      );
    }

    const retryAfterDate = Date.parse(retryAfter);

    if (Number.isFinite(retryAfterDate)) {
      return Math.min(
        Math.max(0, retryAfterDate - Date.now()),
        MAX_OPENAI_RESPONSES_RETRY_DELAY_MS,
      );
    }
  }

  const requestResetDelayMs = parseOpenAIResponsesRetryDurationMs(
    headers?.get?.('x-ratelimit-reset-requests'),
  );
  const tokenResetDelayMs = parseOpenAIResponsesRetryDurationMs(
    headers?.get?.('x-ratelimit-reset-tokens'),
  );
  const headerResetDelayMs = Math.max(requestResetDelayMs || 0, tokenResetDelayMs || 0);

  if (headerResetDelayMs > 0) {
    return headerResetDelayMs;
  }

  const scaledFallbackDelayMs = fallbackDelayMs * (attemptIndex + 1);
  return Math.min(scaledFallbackDelayMs, MAX_OPENAI_RESPONSES_RETRY_DELAY_MS);
}

function waitForOpenAIResponsesRetryDelay(ms) {
  if (!Number.isFinite(ms) || ms <= 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

module.exports = {
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
};
