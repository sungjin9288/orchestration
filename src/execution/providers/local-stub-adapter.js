'use strict';

const fs = require('fs');
const path = require('path');

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

function normalizeListItem(line) {
  return String(line || '')
    .trim()
    .replace(/^[-*]\s+/, '')
    .trim();
}

function parseMarkdownList(content, heading) {
  return getMarkdownSection(content, heading)
    .split('\n')
    .map((line) => normalizeListItem(line))
    .filter(Boolean);
}

function uniqueList(items) {
  return [...new Set((items || []).map((item) => String(item || '').trim()).filter(Boolean))];
}

function normalizeRelativePath(value) {
  const normalized = String(value || '')
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\.\//, '');

  if (
    !normalized ||
    path.posix.isAbsolute(normalized) ||
    normalized === '..' ||
    normalized.startsWith('../') ||
    normalized.includes('/../')
  ) {
    return null;
  }

  return normalized;
}

function renderBase64FileUpdates(fileUpdates) {
  if (!Array.isArray(fileUpdates) || fileUpdates.length === 0) {
    return '_No file updates prepared._';
  }

  return fileUpdates
    .map(
      (fileUpdate) => `### ${fileUpdate.path}
\`\`\`base64
${Buffer.from(fileUpdate.content, 'utf8').toString('base64')}
\`\`\``,
    )
    .join('\n\n');
}

function buildMutationMarker(request, relativePath) {
  return `builder-live-mutation ${request.approval?.id || 'no-approval'} ${relativePath}`;
}

function buildUpdatedFileContent(request, relativePath, currentContent) {
  const marker = buildMutationMarker(request, relativePath);

  if (currentContent.includes(marker)) {
    return currentContent;
  }

  const extension = path.extname(relativePath).toLowerCase();
  const suffix =
    extension === '.md'
      ? `\n<!-- ${marker} -->\n`
      : extension === '.js' || extension === '.mjs' || extension === '.cjs'
        ? `\n// ${marker}\n`
        : `\n# ${marker}\n`;

  return `${currentContent.replace(/\s*$/, '\n').replace(/\n$/, '')}${suffix}`;
}

function buildLimitedFileUpdates(request) {
  const targetFiles = uniqueList(
    parseMarkdownList(request.preflightArtifact?.content, 'Target Files')
      .map((value) => normalizeRelativePath(value))
      .filter(Boolean),
  );

  const fileUpdates = [];

  for (const relativePath of targetFiles) {
    const absolutePath = path.join(request.project.projectPath, relativePath);

    if (!fs.existsSync(absolutePath)) {
      continue;
    }

    const currentContent = fs.readFileSync(absolutePath, 'utf8');
    const updatedContent = buildUpdatedFileContent(request, relativePath, currentContent);

    if (updatedContent === currentContent) {
      continue;
    }

    fileUpdates.push({
      path: relativePath,
      content: updatedContent,
    });
    break;
  }

  return {
    fileUpdates,
    targetFiles,
  };
}

function buildNormalizedPlannerResult(request) {
  const missingContext = request.routingOutcome.missingContext || [];
  const blockers = [];

  if (missingContext.length > 0) {
    blockers.push(`missing context: ${missingContext.join(', ')}`);
  }

  const needsDecision = Boolean(request.routingOutcome.decisionNote);
  const decisionContext = [];

  if (needsDecision) {
    decisionContext.push(`decision required: ${request.routingOutcome.decisionNote}`);
  }

  return {
    blockers,
    needsDecision,
    nextStage: blockers.length > 0 || needsDecision ? 'human gate' : 'architect',
    summary:
      blockers.length > 0 || needsDecision
        ? 'Planner identified follow-up that must route through the human gate.'
        : 'Planner output is ready for architect handoff.',
    decisionTitle: `Planner follow-up: ${request.task.title}`,
    decisionPrompt: renderList(
      [...blockers, ...decisionContext],
      'Planner output is ready for architect handoff.',
    ),
  };
}

function renderPlannerOutput(request) {
  const normalizedResult = buildNormalizedPlannerResult(request);
  const blockers = [...normalizedResult.blockers];

  if (normalizedResult.needsDecision) {
    blockers.push(`decision required: ${request.routingOutcome.decisionNote}`);
  }

  blockers.push('initial live provider choice remains open; local stub adapter is in use');

  return `# Plan: ${request.task.title}

## Slice Goal
${request.routingOutcome.scopeStatement}

## Intended Outcome
Connect the planner role to a real run path that reads the planner prompt contract, builds an execution request, calls a single adapter, and stores run, log, and plan artifacts in runtime state.

## Acceptance Target
- planner role runs through the execution coordinator
- runtime stores planner logs and a plan artifact
- planner output is ready for architect handoff
- no downstream roles execute in this slice

## Verification Approach
- run a local smoke script that executes the planner happy path
- inspect runtime snapshot, run logs, and stored artifact content
- confirm that only one planner run is created

## Dependencies and Blockers
${renderList(blockers, 'none')}

## Expected Artifacts
- plan
- execution-log

## Worktree Need
No. This slice only plans work and stores runtime evidence.

## Non-Goals
- builder execution
- reviewer execution
- six-role orchestration
- UI refactor
- multi-provider support
`;
}

function buildNormalizedArchitectResult(request) {
  const sliceGoal = getMarkdownSection(request.planArtifact?.content, 'Slice Goal');
  const intendedOutcome = getMarkdownSection(request.planArtifact?.content, 'Intended Outcome');
  const scopeText = [sliceGoal, intendedOutcome].filter(Boolean).join('\n');
  const blockers = [];
  let nextStage = 'task-breaker';

  if (/provider\s+(strategy|adapter|model|boundary|redesign)/i.test(scopeText)) {
    blockers.push(
      'The plan crosses the single-provider-first boundary and would require an explicit architecture decision before implementation.',
    );
    nextStage = 'human gate';
  }

  if (/(new|additional)\s+lifecycle\s+status|lifecycle\s+status\s+(change|expansion|addition)/i.test(scopeText)) {
    blockers.push(
      'The plan expands task lifecycle status instead of preserving the current flags model, so it requires an explicit architecture decision.',
    );
    nextStage = 'human gate';
  }

  const needsDecision = blockers.length > 0;

  return {
    blockers,
    needsDecision,
    nextStage,
    summary: needsDecision
      ? 'Architect found a blocking architecture issue that must route through the human gate.'
      : 'Architect confirmed that the slice fits the current architecture boundary.',
    decisionTitle: `Architecture decision: ${request.task.title}`,
    decisionPrompt: renderList(
      blockers,
      'Architect confirmed the slice fits the current architecture boundary.',
    ),
  };
}

function renderArchitectOutput(request) {
  const normalizedResult = buildNormalizedArchitectResult(request);
  const sliceGoal = getMarkdownSection(request.planArtifact?.content, 'Slice Goal');
  const acceptanceTarget = getMarkdownSection(request.planArtifact?.content, 'Acceptance Target');
  const affectedComponents = [
    'prompts/builder.md',
    'src/execution/execution-coordinator.js',
    'src/execution/providers/local-stub-adapter.js',
    'src/runtime/runtime-service.js',
    'scripts/smoke-execution-slice-05.mjs',
    'scripts/serve-ui-slice-01.mjs',
    'ui/app.js',
  ];
  const policyImpact = normalizedResult.needsDecision
    ? [
        'This plan would cross a protected architecture boundary and cannot proceed without human resolution.',
      ]
    : [
        'The slice stays inside the current development-pack boundary.',
        'No provider redesign, lifecycle expansion, or downstream role execution is approved.',
      ];
  const decisionLogImpact = normalizedResult.needsDecision
    ? [
        'If approved, the follow-up may require a decision-log update before implementation proceeds.',
      ]
    : ['None. The current decision log and pack guardrails remain unchanged.'];
  const assumptions = [
    `Architect input comes from planner artifact ${request.planArtifact.id}.`,
    'The slice ends after saving an architecture artifact and any required decision item.',
    'No code mutation is authorized by this architecture note.',
  ];

  return `# Architecture Note: ${request.task.title}

## Boundary Fit Assessment
${
  normalizedResult.needsDecision
    ? 'The current plan does not fit the approved architecture boundary without an explicit human decision.'
    : 'The current plan fits the approved architecture boundary for a planner-to-architect thin slice.'
}

## Affected Components or Contracts
${renderList(affectedComponents, 'none')}

## Policy Impact
${renderList(policyImpact, 'none')}

## Decision-Log Impact
${renderList(decisionLogImpact, 'none')}

## Approved Assumptions
${renderList(assumptions, 'none')}

## Planner Input Summary
- source artifact: ${request.planArtifact.id}
- slice goal: ${sliceGoal || 'not stated'}
- acceptance target: ${acceptanceTarget || 'not stated'}

## No-Architecture-Change Statement
${
  normalizedResult.needsDecision
    ? 'No architecture change is approved by this note. Human resolution is required before any downstream implementation work.'
    : 'No architecture change is approved by this note. Downstream work, if later enabled, must stay within the current coordinator, artifact, and UI boundaries.'
}

## Blocking Architecture Issues
${renderList(normalizedResult.blockers, 'none')}
`;
}

function buildNormalizedTaskBreakerResult(request) {
  const sliceGoal = getMarkdownSection(request.planArtifact?.content, 'Slice Goal');
  const acceptanceTarget = getMarkdownSection(request.planArtifact?.content, 'Acceptance Target');
  const architectureBoundary = getMarkdownSection(
    request.architectureArtifact?.content,
    'No-Architecture-Change Statement',
  );
  const blockers = [];
  let nextStage = 'builder';
  const breakdownScopeText = [
    request.task?.intent,
    sliceGoal,
    acceptanceTarget,
    architectureBoundary,
  ]
    .filter(Boolean)
    .join('\n');

  if (/(operator|manual|human)\s+choice|checkpoint\s+choice|breakdown\s+decision/i.test(breakdownScopeText)) {
    blockers.push(
      'The breakdown depends on an unresolved operator choice, so task-breaker must raise a blocking decision before builder handoff.',
    );
    nextStage = 'human gate';
  }

  const needsDecision = blockers.length > 0;

  return {
    blockers,
    needsDecision,
    nextStage,
    summary: needsDecision
      ? 'Task-breaker found a blocking breakdown issue that must route through the human gate.'
      : 'Task-breaker output is ready for builder handoff.',
    decisionTitle: `Breakdown decision: ${request.task.title}`,
    decisionPrompt: renderList(
      blockers,
      'Task-breaker output is ready for builder handoff.',
    ),
  };
}

function renderTaskBreakerOutput(request) {
  const normalizedResult = buildNormalizedTaskBreakerResult(request);
  const sliceGoal = getMarkdownSection(request.planArtifact?.content, 'Slice Goal');
  const verificationApproach = getMarkdownSection(
    request.planArtifact?.content,
    'Verification Approach',
  );
  const approvedAssumptions = getMarkdownSection(
    request.architectureArtifact?.content,
    'Approved Assumptions',
  );

  return `# Task Breakdown: ${request.task.title}

## Ordered Sub-Tasks
- Validate the approved slice boundary from ${request.planArtifact.id} and ${request.architectureArtifact.id}.
- Prepare the minimum implementation sequence for the slice without widening scope.
- Stop after the bounded implementation slice is ready for builder handoff.

## Checkpoints
- checkpoint 1: confirm the implementation boundary and non-goals remain unchanged
- checkpoint 2: make the smallest end-to-end change required by the approved slice
- checkpoint 3: collect verification evidence before review handoff

## Expected Artifacts Per Checkpoint
- checkpoint 1: breakdown
- checkpoint 2: diff, execution-log
- checkpoint 3: verification, review

## Verification Checkpoints
${renderList(
  verificationApproach
    ? verificationApproach
        .split('\n')
        .map((line) => line.replace(/^- /, '').trim())
        .filter(Boolean)
    : [],
  'run the smallest practical verification tied to the approved slice',
)}

## Review Trigger Point
- Trigger review after the bounded implementation sequence is complete and verification evidence is attached.

## Stop-And-Escalate Conditions
${renderList(
  [
    ...normalizedResult.blockers,
    'Stop if implementation would require an architecture change outside the approved note.',
    'Stop if execution requires a new lifecycle status, provider redesign, or unapproved scope expansion.',
  ],
  'none',
)}

## Execution Boundary Summary
- next stage: ${normalizedResult.nextStage}
- planner artifact: ${request.planArtifact.id}
- architecture artifact: ${request.architectureArtifact.id}
- slice goal: ${sliceGoal || 'not stated'}
- approved assumptions: ${approvedAssumptions ? 'present' : 'not stated'}
`;
}

function buildNormalizedBuilderPreflightResult(request) {
  const sliceGoal = getMarkdownSection(request.planArtifact?.content, 'Slice Goal');
  const acceptanceTarget = getMarkdownSection(request.planArtifact?.content, 'Acceptance Target');
  const riskSignalText = [request.task?.intent, sliceGoal, acceptanceTarget]
    .filter(Boolean)
    .join('\n');
  const blockers = [];
  let nextStage = 'reviewer';

  if (/(blocking risk|preflight risk|human approval before live execution)/i.test(riskSignalText)) {
    blockers.push(
      'Builder preflight found a blocking risk that requires a human decision before any live execution may begin.',
    );
    nextStage = 'human gate';
  }

  const needsDecision = blockers.length > 0;

  return {
    blockers,
    needsDecision,
    nextStage,
    summary: needsDecision
      ? 'Builder preflight captured a blocking risk that must route through the human gate.'
      : 'Builder preflight artifact is ready for reviewer-facing inspection without mutating code.',
    decisionTitle: `Builder preflight risk: ${request.task.title}`,
    decisionPrompt: renderList(
      blockers,
      'Builder preflight is ready for reviewer-facing inspection.',
    ),
  };
}

function renderBuilderPreflightOutput(request) {
  const normalizedResult = buildNormalizedBuilderPreflightResult(request);
  const sliceGoal = getMarkdownSection(request.planArtifact?.content, 'Slice Goal');
  const acceptanceTarget = getMarkdownSection(request.planArtifact?.content, 'Acceptance Target');
  const verificationApproach = getMarkdownSection(
    request.planArtifact?.content,
    'Verification Approach',
  );
  const approvedAssumptions = getMarkdownSection(
    request.architectureArtifact?.content,
    'Approved Assumptions',
  );
  const orderedSubTasks = parseMarkdownList(request.breakdownArtifact?.content, 'Ordered Sub-Tasks');
  const stopConditions = parseMarkdownList(
    request.breakdownArtifact?.content,
    'Stop-And-Escalate Conditions',
  );
  const targetFiles = uniqueList([
    ...parseMarkdownList(
      request.architectureArtifact?.content,
      'Affected Components or Contracts',
    ),
  ]);
  const intendedChanges = uniqueList([
    'Add a limited builder live mutation run path that starts only from the latest builder preflight.',
    'Require the latest approved builder live mutation approval to target the same latest preflight artifact and run.',
    'Validate that live mutation only changes files inside the preflight target files allowlist.',
    'Save run/log evidence plus diff, patch, and change-summary artifacts without running reviewer or commit paths.',
    'Add a minimal smoke path that verifies approval gating, target-file enforcement, and artifact capture.',
  ]);
  const risks = normalizedResult.blockers.length > 0
    ? normalizedResult.blockers
    : [
        'Preflight target files can drift if the latest architecture and breakdown artifacts stop reflecting the approved slice.',
        'Live mutation must fail closed when approval, target-file parsing, or actual changed-file validation does not match the latest preflight.',
      ];
  const verificationPlan = uniqueList([
    ...verificationApproach
      .split('\n')
      .map((line) => normalizeListItem(line))
      .filter(Boolean),
    'Run a dedicated execution smoke for planner -> architect -> task-breaker -> builder preflight -> approval -> builder live mutation.',
    'Verify that pending, rejected, stale, and missing approvals all block live mutation.',
    'Verify that actual changed files stay inside the latest preflight target files allowlist.',
    'Verify that the runtime snapshot stores run logs plus diff, patch, and change-summary artifacts for the mutation run.',
  ]);
  const reviewEvidenceExpectations = uniqueList([
    'The saved preflight artifact must list target files, intended changes, risks, verification plan, review evidence expectations, and escalation triggers.',
    'A later live mutation run must be able to reuse the saved target files as its allowlist without operator-supplied file overrides.',
    orderedSubTasks.length > 0
      ? `Breakdown alignment should remain visible through ${orderedSubTasks.length} ordered sub-task references.`
      : 'Breakdown alignment should remain visible through the latest breakdown artifact.',
    approvedAssumptions
      ? 'Review should confirm the preflight plan stays inside the approved architecture assumptions.'
      : 'Review should confirm the preflight plan stays inside the approved architecture boundary.',
  ]);
  const escalationTriggers = uniqueList([
    ...stopConditions,
    'Escalate to architect if target files or intended changes would cross the approved architecture boundary.',
    'Escalate to task-breaker if the latest breakdown artifact is missing the execution checkpoint needed to proceed safely.',
    'Escalate to human gate if builder preflight finds a blocking risk that cannot be resolved as an implementation assumption.',
  ]);

  return `# Builder Preflight: ${request.task.title}

## Target Files
${renderList(targetFiles, 'none identified')}

## Intended Changes
${renderList(
  intendedChanges.map((item) => {
    if (/latest plan, architecture, and breakdown/i.test(item)) {
      return `${item} Inputs: ${request.planArtifact.id}, ${request.architectureArtifact.id}, ${request.breakdownArtifact.id}.`;
    }

    return item;
  }),
  'none',
)}

## Risks
${renderList(risks, 'none')}

## Verification Plan
${renderList(verificationPlan, 'none')}

## Review Evidence Expectations
${renderList(reviewEvidenceExpectations, 'none')}

## Escalation Triggers
${renderList(escalationTriggers, 'none')}

## Input Summary
- plan artifact: ${request.planArtifact.id}
- architecture artifact: ${request.architectureArtifact.id}
- breakdown artifact: ${request.breakdownArtifact.id}
- slice goal: ${sliceGoal || 'not stated'}
- acceptance target: ${acceptanceTarget || 'not stated'}
- execution mode: ${request.executionMode || 'unspecified'}
- mutation allowed: ${request.mutationAllowed === false ? 'no' : 'yes'}
`;
}

function buildNormalizedBuilderLiveMutationResult(request) {
  const { fileUpdates } = buildLimitedFileUpdates(request);
  const blockers = [];
  let nextStage = 'reviewer';

  if (fileUpdates.length === 0) {
    blockers.push(
      'Builder live mutation could not find an existing preflight target file to update inside the current project_path.',
    );
    nextStage = 'architect';
  }

  return {
    blockers,
    needsDecision: false,
    nextStage,
    summary:
      blockers.length > 0
        ? 'Builder live mutation could not prepare a bounded file update and must stop without changing files.'
        : 'Builder live mutation prepared a bounded file update inside the approved preflight target files.',
    decisionTitle: `Builder live mutation follow-up: ${request.task.title}`,
    decisionPrompt: renderList(
      blockers,
      'Builder live mutation prepared a bounded file update.',
    ),
  };
}

function renderBuilderLiveMutationOutput(request) {
  const normalizedResult = buildNormalizedBuilderLiveMutationResult(request);
  const { fileUpdates, targetFiles } = buildLimitedFileUpdates(request);

  return `# Builder Live Mutation: ${request.task.title}

## Change Summary
- preflight artifact: ${request.preflightArtifact.id}
- approval id: ${request.approval?.id || 'missing'}
- target file allowlist count: ${targetFiles.length}
- prepared file updates: ${fileUpdates.length}
- reviewer executed: no
- commit or release executed: no

## Target Files
${renderList(targetFiles, 'none')}

## File Updates
${renderBase64FileUpdates(fileUpdates)}

## Risks
${renderList(
  normalizedResult.blockers.length > 0
    ? normalizedResult.blockers
    : [
        'Actual file writes must fail closed if any file falls outside the latest preflight target files.',
        'The approval must stay tied to the latest preflight artifact and run.',
      ],
  'none',
)}

## Verification Notes
${renderList(
  [
    'Store the raw change summary plus generated patch and observed diff artifacts.',
    'Do not run reviewer, commit, merge, or release steps from this mutation path.',
    'Compare actual changed files against the preflight target allowlist after writing files.',
  ],
  'none',
)}
`;
}

function createLocalStubProviderAdapter() {
  return {
    name: 'local-stub',
    async execute(request) {
      if (request.role === 'builder') {
        if (request.executionMode === 'live-mutation') {
          return {
            providerRunId: `local-stub-builder-live-mutation-${request.task.id}`,
            model: 'local-stub-builder-live-mutation-v1',
            normalizedResult: buildNormalizedBuilderLiveMutationResult(request),
            outputText: renderBuilderLiveMutationOutput(request),
            usage: {
              inputTokens: 0,
              outputTokens: 0,
            },
          };
        }

        return {
          providerRunId: `local-stub-builder-${request.task.id}`,
          model: 'local-stub-builder-preflight-v1',
          normalizedResult: buildNormalizedBuilderPreflightResult(request),
          outputText: renderBuilderPreflightOutput(request),
          usage: {
            inputTokens: 0,
            outputTokens: 0,
          },
        };
      }

      if (request.role === 'task-breaker') {
        return {
          providerRunId: `local-stub-${request.role}-${request.task.id}`,
          model: 'local-stub-task-breaker-v1',
          normalizedResult: buildNormalizedTaskBreakerResult(request),
          outputText: renderTaskBreakerOutput(request),
          usage: {
            inputTokens: 0,
            outputTokens: 0,
          },
        };
      }

      if (request.role === 'architect') {
        return {
          providerRunId: `local-stub-${request.role}-${request.task.id}`,
          model: 'local-stub-architect-v1',
          normalizedResult: buildNormalizedArchitectResult(request),
          outputText: renderArchitectOutput(request),
          usage: {
            inputTokens: 0,
            outputTokens: 0,
          },
        };
      }

      if (request.role !== 'planner') {
        throw new Error(`Unsupported local stub role: ${request.role}`);
      }

      return {
        providerRunId: `local-stub-${request.role}-${request.task.id}`,
        model: 'local-stub-planner-v1',
        normalizedResult: buildNormalizedPlannerResult(request),
        outputText: renderPlannerOutput(request),
        usage: {
          inputTokens: 0,
          outputTokens: 0,
        },
      };
    },
  };
}

module.exports = {
  createLocalStubProviderAdapter,
};
