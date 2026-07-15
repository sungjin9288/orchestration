'use strict';

const fs = require('fs');
const path = require('path');

const {
  resolveOpenAIResponsesMaxRetryAttempts,
  resolveOpenAIResponsesRetryDelayFromHeaders,
  resolveOpenAIResponsesRetryDelayMs,
  resolveOpenAIResponsesTimeoutMs,
  shouldRetryOpenAIResponsesStatus,
  waitForOpenAIResponsesRetryDelay,
} = require('./openai-responses-retry-policy');

const DEFAULT_API_URL = 'https://api.openai.com/v1/responses';
const ALLOWED_ROLES = new Set(['strategist', 'architect', 'decomposer', 'conductor']);

const STRING_ARRAY_SCHEMA = {
  type: 'array',
  items: { type: 'string' },
};

const POSITION_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'recommendation',
    'assumptions',
    'evidenceRefs',
    'objections',
    'risks',
    'confidence',
    'proposedNextStep',
  ],
  properties: {
    recommendation: { type: 'string' },
    assumptions: STRING_ARRAY_SCHEMA,
    evidenceRefs: { ...STRING_ARRAY_SCHEMA, minItems: 1 },
    objections: STRING_ARRAY_SCHEMA,
    risks: STRING_ARRAY_SCHEMA,
    confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
    proposedNextStep: { type: 'string' },
  },
};

const SYNTHESIS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'missionInterpretation',
    'adoptedRecommendation',
    'adoptedPositionRefs',
    'rejectedAlternatives',
    'dissentRefs',
    'unresolvedQuestions',
    'proposedExecutionBoundary',
    'proposedAcceptanceCriteria',
    'humanDecisionRequired',
  ],
  properties: {
    missionInterpretation: { type: 'string' },
    adoptedRecommendation: { type: 'string' },
    adoptedPositionRefs: { ...STRING_ARRAY_SCHEMA, minItems: 1 },
    rejectedAlternatives: STRING_ARRAY_SCHEMA,
    dissentRefs: STRING_ARRAY_SCHEMA,
    unresolvedQuestions: STRING_ARRAY_SCHEMA,
    proposedExecutionBoundary: { type: 'string' },
    proposedAcceptanceCriteria: { ...STRING_ARRAY_SCHEMA, minItems: 1 },
    humanDecisionRequired: { type: 'boolean', enum: [true] },
  },
};

class CouncilProviderError extends Error {
  constructor(code, message, options = {}) {
    super(message);
    this.name = 'CouncilProviderError';
    this.code = code;
    this.statusCode = options.statusCode || 502;
    this.providerEvidence = options.providerEvidence || null;
  }
}

function sanitizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeUsage(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const inputTokens = Number.isInteger(value.input_tokens) ? value.input_tokens : null;
  const outputTokens = Number.isInteger(value.output_tokens) ? value.output_tokens : null;
  const totalTokens = Number.isInteger(value.total_tokens)
    ? value.total_tokens
    : inputTokens !== null && outputTokens !== null
      ? inputTokens + outputTokens
      : null;

  return { inputTokens, outputTokens, totalTokens };
}

function extractOutputText(payload) {
  const direct = sanitizeText(payload?.output_text);

  if (direct) {
    return direct;
  }

  return (Array.isArray(payload?.output) ? payload.output : [])
    .flatMap((item) => (Array.isArray(item?.content) ? item.content : []))
    .filter((item) => item?.type === 'output_text')
    .map((item) => sanitizeText(item.text))
    .filter(Boolean)
    .join('\n\n');
}

function readRoleInstructions(repoRoot, profile) {
  if (!repoRoot || !profile || !ALLOWED_ROLES.has(profile.role)) {
    throw new CouncilProviderError('ROLE_NOT_ALLOWED', 'Council provider role is not allowed', {
      statusCode: 400,
    });
  }

  const roleRoot = path.resolve(repoRoot, 'company', 'roles');
  const expectedRef = `company/roles/${profile.role}.md`;

  if (profile.instructionsRef !== expectedRef) {
    throw new CouncilProviderError('ROLE_SOURCE_INVALID', 'Council role source is invalid', {
      statusCode: 400,
    });
  }

  const sourcePath = path.resolve(repoRoot, profile.instructionsRef);
  const relative = path.relative(roleRoot, sourcePath);
  const stat = fs.lstatSync(sourcePath);

  if (relative.startsWith('..') || path.isAbsolute(relative) || !stat.isFile() || stat.isSymbolicLink()) {
    throw new CouncilProviderError('ROLE_SOURCE_INVALID', 'Council role source is invalid', {
      statusCode: 400,
    });
  }

  const realRoleRoot = fs.realpathSync(roleRoot);
  const realSourcePath = fs.realpathSync(sourcePath);
  const realRelative = path.relative(realRoleRoot, realSourcePath);

  if (realRelative.startsWith('..') || path.isAbsolute(realRelative)) {
    throw new CouncilProviderError('ROLE_SOURCE_INVALID', 'Council role source is invalid', {
      statusCode: 400,
    });
  }

  return fs.readFileSync(realSourcePath, 'utf8');
}

function buildSafeAgenda(agenda) {
  return {
    missionId: agenda.missionId,
    title: agenda.title,
    goal: agenda.goal,
    constraints: agenda.constraints,
    deliverableType: agenda.deliverableType,
  };
}

function buildProviderInput(request, kind) {
  const input = {
    contract: kind === 'position' ? 'council-position-v1' : 'council-synthesis-v1',
    sourceDigest: request.sourceDigest,
    agenda: buildSafeAgenda(request.agenda),
    role: request.agent.role,
    objective: request.agent.objective,
    revisionRequest: request.revisionRequest
      ? {
          note: request.revisionRequest.note,
          targetAgentIds: request.revisionRequest.targetAgentIds || [],
        }
      : null,
    authorityBoundary: {
      recommendationOnly: true,
      humanDecisionRequired: true,
      providerToolsAllowed: false,
      sourceMutationAllowed: false,
      memoryPersistenceAllowed: false,
      commitAllowed: false,
      pushAllowed: false,
      releaseAllowed: false,
    },
  };

  if (kind === 'synthesis') {
    input.positions = request.positions.map((position) => ({
      id: position.id,
      agentId: position.agentId,
      role: position.role,
      recommendation: position.recommendation,
      assumptions: position.assumptions,
      evidenceRefs: position.evidenceRefs,
      objections: position.objections,
      risks: position.risks,
      confidence: position.confidence,
      proposedNextStep: position.proposedNextStep,
    }));
    input.conflictSummary = {
      requiredRoleFailures: request.conflictSummary.requiredRoleFailures.map((failure) => ({
        agentId: failure.agentId,
        role: failure.role,
        code: failure.code,
      })),
      unsupportedEvidenceRefs: request.conflictSummary.unsupportedEvidenceRefs,
      sharedAssumptions: request.conflictSummary.sharedAssumptions,
      conflictingRecommendations: request.conflictSummary.conflictingRecommendations,
      uniqueObjections: request.conflictSummary.uniqueObjections,
      dissentPositionRefs: request.conflictSummary.dissentPositionRefs,
      approvalReady: request.conflictSummary.approvalReady,
    };
  }

  return input;
}

function buildRequestBody({ request, instructions, kind, model }) {
  return {
    model,
    instructions: `${instructions}\n\nReturn only the strict JSON object requested by the supplied schema.`,
    input: JSON.stringify(buildProviderInput(request, kind)),
    text: {
      format: {
        type: 'json_schema',
        name: kind === 'position' ? 'council_position' : 'council_synthesis',
        strict: true,
        schema: kind === 'position' ? POSITION_SCHEMA : SYNTHESIS_SCHEMA,
      },
    },
  };
}

function resolveProviderConfig(providerConfig) {
  const model = sanitizeText(providerConfig?.model);
  const apiKeyVar = sanitizeText(providerConfig?.env?.apiKeyVar);
  const apiKey = apiKeyVar ? sanitizeText(process.env[apiKeyVar]) : '';

  if (
    providerConfig?.mode !== 'live' ||
    providerConfig?.adapter !== 'openai-responses' ||
    !model ||
    !apiKeyVar ||
    !apiKey
  ) {
    throw new CouncilProviderError(
      'NOT_CONFIGURED',
      'OpenAI Responses Council provider is not configured',
      { statusCode: 409 },
    );
  }

  return { apiKey, model };
}

function createEvidence({ model, startedAt, completedAt, providerAttemptCount, payload, outcome, errorCode }) {
  return {
    adapter: 'openai-responses',
    model,
    providerRunId: sanitizeText(payload?.id) || null,
    usage: normalizeUsage(payload?.usage),
    providerAttemptCount,
    startedAt,
    completedAt,
    outcome,
    errorCode: errorCode || null,
  };
}

function attachEvidence(error, evidence) {
  if (error instanceof CouncilProviderError) {
    error.providerEvidence = evidence;
    return error;
  }

  return new CouncilProviderError('NETWORK_ERROR', 'OpenAI Responses Council request failed', {
    providerEvidence: evidence,
  });
}

function createCouncilOpenAIResponsesAdapter(options = {}) {
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  const apiUrl = options.apiUrl || DEFAULT_API_URL;
  const repoRoot = path.resolve(options.repoRoot || process.cwd());
  const timeoutMs = resolveOpenAIResponsesTimeoutMs(options);
  const maxRetryAttempts = resolveOpenAIResponsesMaxRetryAttempts(options);
  const retryDelayMs = resolveOpenAIResponsesRetryDelayMs(options);
  const waitForRetry = options.waitForRetry || waitForOpenAIResponsesRetryDelay;
  const now = options.now || (() => new Date().toISOString());

  function getReadiness({ providerConfig, profile } = {}) {
    const reasons = [];

    if (typeof fetchImpl !== 'function') reasons.push('fetch support is unavailable');
    if (!profile || !ALLOWED_ROLES.has(profile.role)) reasons.push('Council role is not allowed');
    if (!profile?.providerPolicy?.allowedModes?.includes('openai-responses')) {
      reasons.push('Council role policy blocks openai-responses');
    }

    try {
      resolveProviderConfig(providerConfig);
    } catch (_error) {
      reasons.push('project provider is not configured for openai-responses');
    }

    return {
      adapter: 'openai-responses',
      mode: 'real-openai-responses',
      allowed: reasons.length === 0,
      readiness: reasons.length === 0 ? 'ready' : 'blocked',
      reasons,
    };
  }

  async function execute(request, context, kind) {
    const { apiKey, model } = resolveProviderConfig(context.providerConfig);
    const instructions = readRoleInstructions(repoRoot, context.profile);
    const startedAt = now();
    let providerAttemptCount = 0;
    let payload = null;

    for (let attemptIndex = 0; attemptIndex <= maxRetryAttempts; attemptIndex += 1) {
      providerAttemptCount += 1;
      const controller = new AbortController();
      let timedOut = false;
      const onAbort = () => controller.abort();
      const timeoutId = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, timeoutMs);

      if (context.signal?.aborted) {
        onAbort();
      } else {
        context.signal?.addEventListener('abort', onAbort, { once: true });
      }

      let response;

      try {
        response = await fetchImpl(apiUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(buildRequestBody({ request, instructions, kind, model })),
          signal: controller.signal,
        });
      } catch (error) {
        const completedAt = now();
        const code = timedOut ? 'TIMEOUT' : context.signal?.aborted ? 'CANCELLED' : 'NETWORK_ERROR';
        throw attachEvidence(
          new CouncilProviderError(code, `OpenAI Responses Council request ${code.toLowerCase()}`),
          createEvidence({
            model,
            startedAt,
            completedAt,
            providerAttemptCount,
            payload,
            outcome: code === 'CANCELLED' ? 'cancelled' : 'failed',
            errorCode: code,
          }),
        );
      } finally {
        clearTimeout(timeoutId);
        context.signal?.removeEventListener('abort', onAbort);
      }

      if (
        response.ok ||
        !shouldRetryOpenAIResponsesStatus(response.status) ||
        attemptIndex === maxRetryAttempts
      ) {
        if (!response.ok) {
          const code = 'HTTP_ERROR';
          throw new CouncilProviderError(code, `OpenAI Responses Council request returned HTTP ${response.status}`, {
            providerEvidence: createEvidence({
              model,
              startedAt,
              completedAt: now(),
              providerAttemptCount,
              payload,
              outcome: 'failed',
              errorCode: code,
            }),
          });
        }

        const responseText = await response.text();

        try {
          payload = responseText ? JSON.parse(responseText) : {};
        } catch (_error) {
          const code = 'INVALID_JSON';
          throw new CouncilProviderError(code, 'OpenAI Responses Council response was invalid JSON', {
            providerEvidence: createEvidence({
              model,
              startedAt,
              completedAt: now(),
              providerAttemptCount,
              payload,
              outcome: 'failed',
              errorCode: code,
            }),
          });
        }

        const outputText = extractOutputText(payload);

        if (!outputText) {
          const code = 'OUTPUT_MISSING';
          throw new CouncilProviderError(code, 'OpenAI Responses Council output was missing', {
            providerEvidence: createEvidence({
              model,
              startedAt,
              completedAt: now(),
              providerAttemptCount,
              payload,
              outcome: 'failed',
              errorCode: code,
            }),
          });
        }

        let output;

        try {
          output = JSON.parse(outputText);
        } catch (_error) {
          const code = 'INVALID_JSON';
          throw new CouncilProviderError(code, 'OpenAI Responses Council output was invalid JSON', {
            providerEvidence: createEvidence({
              model,
              startedAt,
              completedAt: now(),
              providerAttemptCount,
              payload,
              outcome: 'failed',
              errorCode: code,
            }),
          });
        }

        return {
          output,
          providerEvidence: createEvidence({
            model: sanitizeText(payload.model) || model,
            startedAt,
            completedAt: now(),
            providerAttemptCount,
            payload,
            outcome: 'succeeded',
            errorCode: null,
          }),
        };
      }

      await response.body?.cancel?.();

      await waitForRetry(
        resolveOpenAIResponsesRetryDelayFromHeaders(response.headers, retryDelayMs, attemptIndex),
      );
    }

    throw new CouncilProviderError('UNAVAILABLE', 'OpenAI Responses Council provider is unavailable');
  }

  return {
    id: 'council-openai-responses',
    mode: 'openai-responses',
    getReadiness,
    executePosition(request, context = {}) {
      return execute(request, context, 'position');
    },
    executeSynthesis(request, context = {}) {
      return execute(request, context, 'synthesis');
    },
  };
}

module.exports = {
  ALLOWED_ROLES,
  CouncilProviderError,
  POSITION_SCHEMA,
  SYNTHESIS_SCHEMA,
  createCouncilOpenAIResponsesAdapter,
};
