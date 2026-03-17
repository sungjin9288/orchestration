'use strict';

const { PROVIDER_READINESS } = require('../../runtime/contracts');

const DEFAULT_OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
const DEFAULT_TIMEOUT_MS = 30000;
const PLANNER_ONLY_REASON =
  'openai-responses live execution is planner-only in provider-slice-02';

function createPlannerStructuredOutputSchema() {
  return {
    type: 'object',
    additionalProperties: false,
    required: ['artifactMarkdown', 'normalizedResult'],
    properties: {
      artifactMarkdown: {
        type: 'string',
      },
      normalizedResult: {
        type: 'object',
        additionalProperties: false,
        required: [
          'blockers',
          'needsDecision',
          'nextStage',
          'summary',
          'decisionTitle',
          'decisionPrompt',
        ],
        properties: {
          blockers: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          needsDecision: {
            type: 'boolean',
          },
          nextStage: {
            type: 'string',
            enum: ['architect', 'human gate'],
          },
          summary: {
            type: 'string',
          },
          decisionTitle: {
            type: 'string',
          },
          decisionPrompt: {
            type: 'string',
          },
        },
      },
    },
  };
}

function sanitizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function renderSourceOfTruthSection(sourceOfTruth) {
  if (!Array.isArray(sourceOfTruth) || sourceOfTruth.length === 0) {
    return 'No source-of-truth files provided.';
  }

  return sourceOfTruth
    .map(
      (file) => `### ${file.path}
\`\`\`md
${file.content}
\`\`\``,
    )
    .join('\n\n');
}

function renderPlannerInput(request) {
  return `# Planner Execution Request

## Task
- id: ${request.task.id}
- title: ${request.task.title}
- intent: ${request.task.intent || 'none'}
- lifecycle state: ${request.task.lifecycleState || 'unknown'}

## Project
- id: ${request.project.id}
- name: ${request.project.name}
- project_path: ${request.project.projectPath}
- pack: ${request.project.pack}

## Routing Outcome
- classification: ${request.routingOutcome.classification || 'unspecified'}
- scope statement: ${request.routingOutcome.scopeStatement || 'none'}
- missing context: ${
    Array.isArray(request.routingOutcome.missingContext) && request.routingOutcome.missingContext.length > 0
      ? request.routingOutcome.missingContext.join(', ')
      : 'none'
  }
- decision note: ${request.routingOutcome.decisionNote || 'none'}

## Source Of Truth
${renderSourceOfTruthSection(request.sourceOfTruth)}
`;
}

function buildPlannerInstructions(request) {
  return `${request.promptContract?.content || ''}

Return JSON only.
- artifactMarkdown must be the full markdown plan artifact that satisfies the planner prompt contract.
- normalizedResult must describe blockers, decision state, nextStage, summary, decisionTitle, and decisionPrompt for that same plan.
- Do not include secrets, raw environment variable values, auth material, or provider-internal debugging output.`;
}

function buildPlannerRequestBody(request, model) {
  return {
    model,
    instructions: buildPlannerInstructions(request),
    input: renderPlannerInput(request),
    text: {
      format: {
        type: 'json_schema',
        name: 'planner_artifact_response',
        strict: true,
        schema: createPlannerStructuredOutputSchema(),
      },
    },
  };
}

function extractOutputTextFromContent(payload) {
  const directOutputText = sanitizeText(payload?.output_text);

  if (directOutputText) {
    return directOutputText;
  }

  const segments = [];
  const outputItems = Array.isArray(payload?.output) ? payload.output : [];

  for (const item of outputItems) {
    if (!item || typeof item !== 'object') {
      continue;
    }

    const contentItems = Array.isArray(item.content) ? item.content : [];

    for (const contentItem of contentItems) {
      if (!contentItem || typeof contentItem !== 'object') {
        continue;
      }

      if (contentItem.type !== 'output_text') {
        continue;
      }

      const text = sanitizeText(contentItem.text);

      if (text) {
        segments.push(text);
      }
    }
  }

  return segments.join('\n\n').trim();
}

function normalizeStructuredPlannerPayload(outputText) {
  let parsedPayload = null;

  try {
    parsedPayload = JSON.parse(outputText);
  } catch (_error) {
    throw new Error('OpenAI Responses structured output JSON is required');
  }

  if (!parsedPayload || typeof parsedPayload !== 'object' || Array.isArray(parsedPayload)) {
    throw new Error('OpenAI Responses structured output JSON is required');
  }

  const artifactMarkdown = sanitizeText(parsedPayload.artifactMarkdown);

  if (!artifactMarkdown) {
    throw new Error('OpenAI Responses structured output artifactMarkdown is required');
  }

  if (
    !parsedPayload.normalizedResult ||
    typeof parsedPayload.normalizedResult !== 'object' ||
    Array.isArray(parsedPayload.normalizedResult)
  ) {
    throw new Error('OpenAI Responses structured output normalizedResult is required');
  }

  return {
    artifactMarkdown,
    normalizedResult: parsedPayload.normalizedResult,
  };
}

function normalizeUsage(usage) {
  if (!usage || typeof usage !== 'object') {
    return null;
  }

  const inputTokens =
    typeof usage.input_tokens === 'number'
      ? usage.input_tokens
      : typeof usage.inputTokens === 'number'
        ? usage.inputTokens
        : null;
  const outputTokens =
    typeof usage.output_tokens === 'number'
      ? usage.output_tokens
      : typeof usage.outputTokens === 'number'
        ? usage.outputTokens
        : null;
  const totalTokens =
    typeof usage.total_tokens === 'number'
      ? usage.total_tokens
      : typeof usage.totalTokens === 'number'
        ? usage.totalTokens
        : null;

  if (inputTokens === null && outputTokens === null && totalTokens === null) {
    return null;
  }

  return {
    inputTokens,
    outputTokens,
    totalTokens,
  };
}

function createHttpError(status) {
  if (status === 401) {
    return new Error('OpenAI Responses API request failed with status 401');
  }

  if (status === 429) {
    return new Error('OpenAI Responses API request failed with status 429');
  }

  if (status >= 500) {
    return new Error(`OpenAI Responses API request failed with status ${status}`);
  }

  return new Error(`OpenAI Responses API request failed with status ${status}`);
}

function createNetworkError(error) {
  if (error?.name === 'AbortError') {
    return new Error('OpenAI Responses API request timed out');
  }

  return new Error('OpenAI Responses API request failed before a response was received');
}

function createOpenAIResponsesProviderAdapter(options = {}) {
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  const apiUrl = options.apiUrl || DEFAULT_OPENAI_RESPONSES_URL;
  const timeoutMs = Number.isInteger(options.timeoutMs) ? options.timeoutMs : DEFAULT_TIMEOUT_MS;

  return {
    name: 'openai-responses',
    getReadiness(input = {}) {
      if (typeof fetchImpl !== 'function') {
        return {
          readiness: PROVIDER_READINESS.ERROR,
          allowed: false,
          reasons: ['openai-responses adapter requires fetch support'],
        };
      }

      if (input.role !== 'planner') {
        return {
          readiness: PROVIDER_READINESS.DEGRADED,
          allowed: false,
          reasons: [`${PLANNER_ONLY_REASON}; ${input.role} remains blocked`],
        };
      }

      return {
        readiness: PROVIDER_READINESS.READY,
        allowed: true,
        reasons: [],
      };
    },
    async execute(request, context = {}) {
      if (request.role !== 'planner') {
        throw new Error(`${PLANNER_ONLY_REASON}; ${request.role} remains blocked`);
      }

      const providerConfig =
        context.providerConfig && typeof context.providerConfig === 'object'
          ? context.providerConfig
          : {};
      const apiKeyVar = sanitizeText(providerConfig.env?.apiKeyVar);
      const model = sanitizeText(providerConfig.model);
      const apiKey = apiKeyVar ? process.env[apiKeyVar] || '' : '';

      if (!model) {
        throw new Error('live provider model is required before execution');
      }

      if (!apiKeyVar) {
        throw new Error('live provider apiKey env var is required before execution');
      }

      if (!apiKey) {
        throw new Error(`live provider env var ${apiKeyVar} is not configured for execution`);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      let response = null;

      try {
        response = await fetchImpl(apiUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(buildPlannerRequestBody(request, model)),
          signal: controller.signal,
        });
      } catch (error) {
        throw createNetworkError(error);
      } finally {
        clearTimeout(timeoutId);
      }

      const rawResponseText = await response.text();
      let payload = {};

      try {
        payload = rawResponseText ? JSON.parse(rawResponseText) : {};
      } catch (_error) {
        throw new Error('OpenAI Responses API returned invalid JSON');
      }

      if (!response.ok) {
        throw createHttpError(response.status);
      }

      const rawOutputText = extractOutputTextFromContent(payload);

      if (!rawOutputText) {
        throw new Error('OpenAI Responses response outputText is required');
      }

      const structuredPayload = normalizeStructuredPlannerPayload(rawOutputText);

      return {
        model: sanitizeText(payload.model) || model,
        normalizedResult: structuredPayload.normalizedResult,
        outputText: structuredPayload.artifactMarkdown,
        providerRunId: sanitizeText(payload.id) || null,
        usage: normalizeUsage(payload.usage),
      };
    },
  };
}

module.exports = {
  createOpenAIResponsesProviderAdapter,
};
