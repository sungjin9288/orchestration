'use strict';

const path = require('path');

const { PROVIDER_READINESS } = require('../../runtime/contracts');

const DEFAULT_OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
const DEFAULT_TIMEOUT_MS = 30000;
const PLANNER_AND_ARCHITECT_ONLY_REASON =
  'openai-responses live execution is limited to planner and architect in provider-slice-03';

function createStructuredResultSchema(allowedNextStages) {
  return {
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
        enum: allowedNextStages,
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
  };
}

function createPlannerStructuredOutputSchema() {
  return {
    type: 'object',
    additionalProperties: false,
    required: ['artifactMarkdown', 'normalizedResult'],
    properties: {
      artifactMarkdown: {
        type: 'string',
      },
      normalizedResult: createStructuredResultSchema(['architect', 'human gate']),
    },
  };
}

function createArchitectStructuredOutputSchema() {
  return {
    type: 'object',
    additionalProperties: false,
    required: ['anchor', 'artifact', 'normalizedResult'],
    properties: {
      anchor: {
        type: 'object',
        additionalProperties: false,
        required: [
          'projectId',
          'taskId',
          'planArtifactId',
          'planRunId',
          'sourceOfTruthPaths',
          'codeContextPaths',
        ],
        properties: {
          projectId: {
            type: 'string',
          },
          taskId: {
            type: 'string',
          },
          planArtifactId: {
            type: 'string',
          },
          planRunId: {
            type: 'string',
          },
          sourceOfTruthPaths: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'string',
            },
          },
          codeContextPaths: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'string',
            },
          },
        },
      },
      artifact: {
        type: 'object',
        additionalProperties: false,
        required: [
          'boundaryFit',
          'affectedComponentsOrContracts',
          'policyImpact',
          'decisionLogImpact',
          'approvedAssumptions',
          'noArchitectureChangeStatement',
          'blockingArchitectureIssues',
        ],
        properties: {
          boundaryFit: {
            type: 'string',
            enum: ['fit', 'human-gate-required'],
          },
          affectedComponentsOrContracts: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'string',
            },
          },
          policyImpact: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          decisionLogImpact: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          approvedAssumptions: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          noArchitectureChangeStatement: {
            type: 'string',
          },
          blockingArchitectureIssues: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },
      normalizedResult: createStructuredResultSchema(['task-breaker', 'human gate']),
    },
  };
}

function sanitizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function sanitizeStringArray(values) {
  return Array.isArray(values) ? values.map((value) => sanitizeText(value)).filter(Boolean) : [];
}

function renderFileSection(files, language = '') {
  if (!Array.isArray(files) || files.length === 0) {
    return 'No files provided.';
  }

  const fence = language ? language : '';

  return files
    .map(
      (file) => `### ${file.path}
\`\`\`${fence}
${file.content}
\`\`\``,
    )
    .join('\n\n');
}

function renderSourceOfTruthSection(sourceOfTruth) {
  return renderFileSection(sourceOfTruth, 'md');
}

function renderCodeContextSection(codeContext) {
  if (!Array.isArray(codeContext) || codeContext.length === 0) {
    return 'No code-context files provided.';
  }

  return codeContext
    .map(
      (file) => `### ${file.path}
\`\`\`
${file.content}
\`\`\``,
    )
    .join('\n\n');
}

function renderJsonFence(value) {
  return `\`\`\`json
${JSON.stringify(value, null, 2)}
\`\`\``;
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

function renderArchitectInput(request) {
  return `# Architect Execution Request

## Anchor
${renderJsonFence(request.anchor)}

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

## Plan Artifact
- id: ${request.planArtifact.id}
- runId: ${request.anchor.planRunId}
\`\`\`md
${request.planArtifact.content}
\`\`\`

## Planner Run Summary
${renderJsonFence(request.plannerRunSummary || {})}

## Source Of Truth
${renderSourceOfTruthSection(request.sourceOfTruth)}

## Code Context
${renderCodeContextSection(request.codeContext)}
`;
}

function buildPlannerInstructions(request) {
  return `${request.promptContract?.content || ''}

Return JSON only.
- artifactMarkdown must be the full markdown plan artifact that satisfies the planner prompt contract.
- normalizedResult must describe blockers, decision state, nextStage, summary, decisionTitle, and decisionPrompt for that same plan.
- Do not include secrets, raw environment variable values, auth material, or provider-internal debugging output.`;
}

function buildArchitectInstructions(request) {
  return `${request.promptContract?.content || ''}

Return JSON only.
- anchor must echo the request anchor exactly, including projectId, taskId, planArtifactId, planRunId, sourceOfTruthPaths, and codeContextPaths.
- artifact must include boundaryFit, affectedComponentsOrContracts, policyImpact, decisionLogImpact, approvedAssumptions, noArchitectureChangeStatement, and blockingArchitectureIssues.
- affectedComponentsOrContracts must contain repo-relative paths only.
- normalizedResult must describe blockers, decision state, nextStage, summary, decisionTitle, and decisionPrompt for that same architecture output.
- normalizedResult.nextStage must be task-breaker or human gate only.
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

function buildArchitectRequestBody(request, model) {
  return {
    model,
    instructions: buildArchitectInstructions(request),
    input: renderArchitectInput(request),
    text: {
      format: {
        type: 'json_schema',
        name: 'architect_artifact_response',
        strict: true,
        schema: createArchitectStructuredOutputSchema(),
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

function parseStructuredOutputPayload(outputText) {
  let parsedPayload = null;

  try {
    parsedPayload = JSON.parse(outputText);
  } catch (_error) {
    throw new Error('OpenAI Responses structured output JSON is required');
  }

  if (!parsedPayload || typeof parsedPayload !== 'object' || Array.isArray(parsedPayload)) {
    throw new Error('OpenAI Responses structured output JSON is required');
  }

  return parsedPayload;
}

function normalizeStructuredPlannerPayload(outputText) {
  const parsedPayload = parseStructuredOutputPayload(outputText);

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
    normalizedResult: normalizeStructuredResult(
      parsedPayload.normalizedResult,
      ['architect', 'human gate'],
      'planner',
    ),
  };
}

function normalizeStructuredResult(value, allowedNextStages, role) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('OpenAI Responses structured output normalizedResult is required');
  }

  if (!Array.isArray(value.blockers)) {
    throw new Error('OpenAI Responses structured output normalizedResult.blockers is required');
  }

  if (typeof value.needsDecision !== 'boolean') {
    throw new Error('OpenAI Responses structured output normalizedResult.needsDecision is required');
  }

  if (typeof value.summary !== 'string') {
    throw new Error('OpenAI Responses structured output normalizedResult.summary is required');
  }

  if (typeof value.decisionTitle !== 'string') {
    throw new Error('OpenAI Responses structured output normalizedResult.decisionTitle is required');
  }

  if (typeof value.decisionPrompt !== 'string') {
    throw new Error('OpenAI Responses structured output normalizedResult.decisionPrompt is required');
  }

  const nextStage = sanitizeText(value.nextStage);

  if (!allowedNextStages.includes(nextStage)) {
    throw new Error(`OpenAI Responses structured output nextStage is invalid for ${role} output`);
  }

  return {
    blockers: sanitizeStringArray(value.blockers),
    needsDecision: value.needsDecision,
    nextStage,
    summary: sanitizeText(value.summary),
    decisionTitle: sanitizeText(value.decisionTitle),
    decisionPrompt: sanitizeText(value.decisionPrompt),
  };
}

function normalizeRelativePath(value) {
  const normalized = String(value || '')
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\.\//, '');

  if (
    !normalized ||
    path.posix.isAbsolute(normalized) ||
    /^[A-Za-z]:\//.test(normalized) ||
    normalized === '..' ||
    normalized.startsWith('../') ||
    normalized.includes('/../')
  ) {
    return null;
  }

  return normalized;
}

function normalizeArchitectAnchor(anchor, label) {
  if (!anchor || typeof anchor !== 'object' || Array.isArray(anchor)) {
    throw new Error(`OpenAI Responses structured output ${label} is required`);
  }

  const normalizedAnchor = {
    projectId: sanitizeText(anchor.projectId),
    taskId: sanitizeText(anchor.taskId),
    planArtifactId: sanitizeText(anchor.planArtifactId),
    planRunId: sanitizeText(anchor.planRunId),
    sourceOfTruthPaths: sanitizeStringArray(anchor.sourceOfTruthPaths),
    codeContextPaths: sanitizeStringArray(anchor.codeContextPaths),
  };

  if (
    !normalizedAnchor.projectId ||
    !normalizedAnchor.taskId ||
    !normalizedAnchor.planArtifactId ||
    !normalizedAnchor.planRunId
  ) {
    throw new Error(`OpenAI Responses structured output ${label} is incomplete`);
  }

  if (
    normalizedAnchor.sourceOfTruthPaths.length === 0 ||
    normalizedAnchor.codeContextPaths.length === 0
  ) {
    throw new Error(`OpenAI Responses structured output ${label} is incomplete`);
  }

  return normalizedAnchor;
}

function sameExactStringArrays(left, right) {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return false;
    }
  }

  return true;
}

function assertArchitectAnchorExactMatch(expected, actual) {
  if (
    expected.projectId !== actual.projectId ||
    expected.taskId !== actual.taskId ||
    expected.planArtifactId !== actual.planArtifactId ||
    expected.planRunId !== actual.planRunId ||
    !sameExactStringArrays(expected.sourceOfTruthPaths, actual.sourceOfTruthPaths) ||
    !sameExactStringArrays(expected.codeContextPaths, actual.codeContextPaths)
  ) {
    throw new Error('OpenAI Responses structured output anchor must exactly match the architect request anchor');
  }
}

function normalizeArchitectArtifact(artifact) {
  if (!artifact || typeof artifact !== 'object' || Array.isArray(artifact)) {
    throw new Error('OpenAI Responses structured output artifact is required');
  }

  if (!Array.isArray(artifact.affectedComponentsOrContracts)) {
    throw new Error(
      'OpenAI Responses structured output artifact.affectedComponentsOrContracts is required',
    );
  }

  if (!Array.isArray(artifact.policyImpact)) {
    throw new Error('OpenAI Responses structured output artifact.policyImpact is required');
  }

  if (!Array.isArray(artifact.decisionLogImpact)) {
    throw new Error('OpenAI Responses structured output artifact.decisionLogImpact is required');
  }

  if (!Array.isArray(artifact.approvedAssumptions)) {
    throw new Error('OpenAI Responses structured output artifact.approvedAssumptions is required');
  }

  if (!Array.isArray(artifact.blockingArchitectureIssues)) {
    throw new Error(
      'OpenAI Responses structured output artifact.blockingArchitectureIssues is required',
    );
  }

  const affectedComponentsOrContracts = sanitizeStringArray(artifact.affectedComponentsOrContracts).map(
    (value) => {
      const normalizedValue = normalizeRelativePath(value);

      if (!normalizedValue) {
        throw new Error(
          'OpenAI Responses structured output affectedComponentsOrContracts must contain repo-relative paths only',
        );
      }

      return normalizedValue;
    },
  );

  if (affectedComponentsOrContracts.length === 0) {
    throw new Error(
      'OpenAI Responses structured output affectedComponentsOrContracts must contain at least one repo-relative path',
    );
  }

  const normalizedArtifact = {
    boundaryFit: sanitizeText(artifact.boundaryFit),
    affectedComponentsOrContracts,
    policyImpact: sanitizeStringArray(artifact.policyImpact),
    decisionLogImpact: sanitizeStringArray(artifact.decisionLogImpact),
    approvedAssumptions: sanitizeStringArray(artifact.approvedAssumptions),
    noArchitectureChangeStatement: sanitizeText(artifact.noArchitectureChangeStatement),
    blockingArchitectureIssues: sanitizeStringArray(artifact.blockingArchitectureIssues),
  };

  if (!['fit', 'human-gate-required'].includes(normalizedArtifact.boundaryFit)) {
    throw new Error('OpenAI Responses structured output boundaryFit is invalid for architect output');
  }

  if (!normalizedArtifact.noArchitectureChangeStatement) {
    throw new Error(
      'OpenAI Responses structured output noArchitectureChangeStatement is required',
    );
  }

  return normalizedArtifact;
}

function renderList(items, emptyValue) {
  if (!Array.isArray(items) || items.length === 0) {
    return `- ${emptyValue}`;
  }

  return items.map((item) => `- ${item}`).join('\n');
}

function getMarkdownSection(content, heading) {
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(
    `^## ${escapedHeading}\\n([\\s\\S]*?)(?=^## [^\\n]+\\n|(?![\\s\\S]))`,
    'm',
  );
  const match = String(content || '').match(pattern);

  return match ? match[1].trim() : '';
}

function renderArchitectArtifactMarkdown(request, anchor, artifact) {
  const sliceGoal = getMarkdownSection(request.planArtifact?.content, 'Slice Goal');
  const acceptanceTarget = getMarkdownSection(request.planArtifact?.content, 'Acceptance Target');
  const boundaryFitAssessment =
    artifact.boundaryFit === 'fit'
      ? 'The current plan fits the approved architecture boundary.'
      : 'The current plan requires a human gate before it may proceed downstream.';

  return `# Architecture Note: ${request.task.title}

## Boundary Fit Assessment
${boundaryFitAssessment}

## Affected Components or Contracts
${renderList(artifact.affectedComponentsOrContracts, 'none')}

## Policy Impact
${renderList(artifact.policyImpact, 'none')}

## Decision-Log Impact
${renderList(artifact.decisionLogImpact, 'none')}

## Approved Assumptions
${renderList(artifact.approvedAssumptions, 'none')}

## Planner Input Summary
- source artifact: ${anchor.planArtifactId}
- source run: ${anchor.planRunId}
- slice goal: ${sliceGoal || 'not stated'}
- acceptance target: ${acceptanceTarget || 'not stated'}

## No-Architecture-Change Statement
${artifact.noArchitectureChangeStatement}

## Blocking Architecture Issues
${renderList(artifact.blockingArchitectureIssues, 'none')}
`;
}

function normalizeStructuredArchitectPayload(outputText, request) {
  const parsedPayload = parseStructuredOutputPayload(outputText);
  const expectedAnchor = normalizeArchitectAnchor(request.anchor, 'anchor');
  const responseAnchor = normalizeArchitectAnchor(parsedPayload.anchor, 'anchor');

  assertArchitectAnchorExactMatch(expectedAnchor, responseAnchor);

  if (
    !parsedPayload.normalizedResult ||
    typeof parsedPayload.normalizedResult !== 'object' ||
    Array.isArray(parsedPayload.normalizedResult)
  ) {
    throw new Error('OpenAI Responses structured output normalizedResult is required');
  }

  const artifact = normalizeArchitectArtifact(parsedPayload.artifact);
  const normalizedResult = normalizeStructuredResult(
    parsedPayload.normalizedResult,
    ['task-breaker', 'human gate'],
    'architect',
  );

  if (
    artifact.boundaryFit === 'fit' &&
    (normalizedResult.nextStage !== 'task-breaker' ||
      normalizedResult.needsDecision === true ||
      normalizedResult.blockers.length > 0 ||
      artifact.blockingArchitectureIssues.length > 0)
  ) {
    throw new Error('OpenAI Responses structured output boundaryFit=fit must hand off cleanly to task-breaker');
  }

  if (artifact.boundaryFit === 'human-gate-required') {
    if (normalizedResult.nextStage !== 'human gate') {
      throw new Error(
        'OpenAI Responses structured output boundaryFit=human-gate-required must hand off to human gate',
      );
    }

    if (artifact.blockingArchitectureIssues.length === 0) {
      throw new Error(
        'OpenAI Responses structured output blockingArchitectureIssues are required when architect output routes to human gate',
      );
    }
  }

  return {
    artifactMarkdown: renderArchitectArtifactMarkdown(request, responseAnchor, artifact),
    normalizedResult,
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

function validateLiveProviderConfig(providerConfig) {
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

  return {
    apiKey,
    model,
  };
}

function buildRequestBody(request, model) {
  if (request.role === 'planner') {
    return buildPlannerRequestBody(request, model);
  }

  if (request.role === 'architect') {
    return buildArchitectRequestBody(request, model);
  }

  throw new Error(`${PLANNER_AND_ARCHITECT_ONLY_REASON}; ${request.role} remains blocked`);
}

function normalizeStructuredPayload(outputText, request) {
  if (request.role === 'planner') {
    return normalizeStructuredPlannerPayload(outputText);
  }

  if (request.role === 'architect') {
    return normalizeStructuredArchitectPayload(outputText, request);
  }

  throw new Error(`${PLANNER_AND_ARCHITECT_ONLY_REASON}; ${request.role} remains blocked`);
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

      if (input.role !== 'planner' && input.role !== 'architect') {
        return {
          readiness: PROVIDER_READINESS.DEGRADED,
          allowed: false,
          reasons: [`${PLANNER_AND_ARCHITECT_ONLY_REASON}; ${input.role} remains blocked`],
        };
      }

      return {
        readiness: PROVIDER_READINESS.READY,
        allowed: true,
        reasons: [],
      };
    },
    async execute(request, context = {}) {
      if (request.role !== 'planner' && request.role !== 'architect') {
        throw new Error(`${PLANNER_AND_ARCHITECT_ONLY_REASON}; ${request.role} remains blocked`);
      }

      const providerConfig =
        context.providerConfig && typeof context.providerConfig === 'object'
          ? context.providerConfig
          : {};
      const { apiKey, model } = validateLiveProviderConfig(providerConfig);

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
          body: JSON.stringify(buildRequestBody(request, model)),
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

      const structuredPayload = normalizeStructuredPayload(rawOutputText, request);

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
