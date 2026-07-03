'use strict';

const fs = require('fs');
const path = require('path');

const { normalizeRelativePath } = require('../coordinator/paths');

function renderList(items, emptyValue) {
  if (!Array.isArray(items) || items.length === 0) {
    return `- ${emptyValue}`;
  }

  return items.map((item) => `- ${item}`).join('\n');
}

function escapeRegExp(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getMarkdownSection(content, heading) {
  const escapedHeading = escapeRegExp(heading);
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

function hasMarkdownHeading(content, heading) {
  return new RegExp(`^## ${escapeRegExp(heading)}$`, 'm').test(String(content || ''));
}

function mergeReviewerVerdicts(...verdicts) {
  const priority = {
    pass: 0,
    changes_requested: 1,
    fail: 2,
  };

  return verdicts
    .map((value) => String(value || '').trim().toLowerCase())
    .filter((value) => Object.prototype.hasOwnProperty.call(priority, value))
    .sort((left, right) => priority[right] - priority[left])[0] || 'pass';
}

function isKnowledgeWorkPack(request) {
  return request?.project?.pack === 'knowledge-work';
}

function getKnowledgeWorkDeliverableSpec(request) {
  const deliverableType = request?.task?.deliverableType || 'decision-memo';
  const specs = {
    checklist: {
      filePath: 'docs/checklist.md',
      label: '체크리스트',
      outputLabel: 'operational checklist',
      sections: ['Objective', 'Checklist', 'Readiness Signals', 'Risks', 'Next Action', 'Trace'],
    },
    'decision-memo': {
      filePath: 'docs/decision-memo.md',
      label: '의사결정 메모',
      outputLabel: 'decision memo',
      sections: ['Decision', 'Context', 'Recommendation', 'Options Considered', 'Risks and Assumptions', 'Open Questions', 'Next Action', 'Trace'],
    },
    'execution-plan': {
      filePath: 'docs/execution-plan.md',
      label: '실행 계획서',
      outputLabel: 'execution plan',
      sections: ['Outcome', 'Scope', 'Milestones', 'Workstreams', 'Dependencies', 'Risks', 'Next Action', 'Trace'],
    },
    prd: {
      filePath: 'docs/prd.md',
      label: 'PRD',
      outputLabel: 'product requirements document',
      sections: ['Problem', 'User', 'Goals', 'Non-Goals', 'Requirements', 'Acceptance Signals', 'Open Questions', 'Trace'],
    },
    'research-brief': {
      filePath: 'docs/research-brief.md',
      label: '리서치 브리프',
      outputLabel: 'research brief',
      sections: ['Research Question', 'Current Context', 'Findings', 'Implications', 'Unknowns', 'Next Action', 'Trace'],
    },
  };

  return {
    deliverableType,
    ...(specs[deliverableType] || specs['decision-memo']),
  };
}

function getKnowledgeWorkGoal(request) {
  return request?.task?.intent || request?.task?.title || 'knowledge-work deliverable';
}

function renderKnowledgeWorkTemplate(request, deliverable, marker) {
  const goal = getKnowledgeWorkGoal(request);
  const scope = getMarkdownSection(request?.planArtifact?.content, 'Slice Goal') || goal;

  if (deliverable.deliverableType === 'prd') {
    return `# ${request.task.title}

## Problem
${goal}

## User
- Primary operator: single-user owner reviewing the next bounded move
- Reviewer: person approving whether this PRD is actionable enough to hand off

## Goals
- Clarify the intended outcome for this slice
- Keep the deliverable reviewable without hidden context
- Make the next bounded action explicit

## Non-Goals
- implementation
- release or deployment execution
- external research beyond current project context

## Requirements
- ${scope}
- Explicit assumptions and open questions stay visible
- Evidence should be traceable from the current project context

## Acceptance Signals
- The operator can explain the desired outcome after reading this PRD
- A reviewer can tell what is in scope and out of scope
- The next bounded action is explicit

## Open Questions
- Which local document or source of truth should be treated as the final owner?
- Is more evidence needed before implementation or approval?

## Trace
- ${marker}
`;
  }

  if (deliverable.deliverableType === 'checklist') {
    return `# ${request.task.title}

## Objective
${goal}

## Checklist
- [ ] Confirm the outcome and owner of this slice
- [ ] Review the local context and current constraints
- [ ] Draft the bounded deliverable or recommendation
- [ ] Verify assumptions, risks, and next action are explicit

## Readiness Signals
- The checklist can be executed without hidden context
- The next decision or handoff is explicit
- The work remains inside the approved boundary

## Risks
- Checklist items can look complete before the underlying evidence is strong enough
- Scope can widen if the owner or stop condition stays implicit

## Next Action
- Review the checklist with the operator and resolve any missing evidence

## Trace
- ${marker}
`;
  }

  if (deliverable.deliverableType === 'execution-plan') {
    return `# ${request.task.title}

## Outcome
${goal}

## Scope
- ${scope}
- Keep the work bounded to one reviewable plan

## Milestones
- Milestone 1: align on the intended result
- Milestone 2: prepare the bounded deliverable
- Milestone 3: review assumptions, risks, and next action

## Workstreams
- Context framing
- Deliverable drafting
- Review and operator handoff

## Dependencies
- Local source-of-truth documents
- Explicit owner for the next action

## Risks
- Hidden dependencies can make the plan look simpler than it is
- Ambiguous ownership can block the next handoff

## Next Action
- Confirm milestone ownership and proceed with the first bounded step

## Trace
- ${marker}
`;
  }

  if (deliverable.deliverableType === 'research-brief') {
    return `# ${request.task.title}

## Research Question
${goal}

## Current Context
- Scope for this brief: ${scope}
- Use only currently available local context in this slice

## Findings
- The current project context provides enough information for a bounded first brief
- Missing evidence should remain explicit instead of guessed

## Implications
- A recommendation can be drafted, but confidence depends on the visible evidence trail
- Downstream implementation should wait for explicit approval

## Unknowns
- Which source is the final decision authority?
- What evidence is still missing?

## Next Action
- Validate the findings with the operator and decide whether deeper research is needed

## Trace
- ${marker}
`;
  }

  return `# ${request.task.title}

## Decision
${goal}

## Context
- Scope for this memo: ${scope}
- The memo should stay bounded and reviewable

## Recommendation
- Proceed with the smallest useful next move that stays inside the approved boundary

## Options Considered
- Keep the scope bounded to a single deliverable
- Delay the move until more evidence is gathered

## Risks and Assumptions
- Assumption: the current project context is enough for a bounded first recommendation
- Risk: hidden context can weaken the memo if not called out explicitly

## Open Questions
- What needs explicit approval before downstream execution?
- What evidence is still missing?

## Next Action
- Review the recommendation and confirm whether to proceed or revise

## Trace
- ${marker}
`;
}

function buildKnowledgeWorkFileContent(request, relativePath) {
  const marker = buildMutationMarker(request, relativePath);
  const deliverable = getKnowledgeWorkDeliverableSpec(request);
  const extension = path.extname(relativePath).toLowerCase();

  if (extension === '.md' || !extension) {
    return renderKnowledgeWorkTemplate(request, deliverable, marker);
  }

  return `${marker}\n`;
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

function getKnowledgeWorkReviewAssessment(request) {
  const deliverable = getKnowledgeWorkDeliverableSpec(request);
  const relativePath = deliverable.filePath;
  const absolutePath = request?.project?.projectPath
    ? path.join(request.project.projectPath, relativePath)
    : null;
  const changedFiles = uniqueList(
    (
      Array.isArray(request.builderRun?.summary?.changedFiles)
        ? request.builderRun.summary.changedFiles
        : request?.anchor?.changedFilePaths
    )
      .map((value) => normalizeRelativePath(value))
      .filter(Boolean),
  );
  const evidence = [
    `deliverable file reviewed: ${relativePath}`,
    `deliverable type reviewed: ${deliverable.deliverableType}`,
    `required section set reviewed: ${deliverable.sections.join(', ')}`,
  ];
  const fatalFindings = [];
  const revisionFindings = [];

  if (!absolutePath) {
    fatalFindings.push('Project path is missing, so the reviewer cannot inspect the deliverable file.');

    return {
      deliverable,
      evidence,
      fatalFindings,
      findings: [...fatalFindings],
      revisionFindings,
      verdict: 'fail',
    };
  }

  if (!fs.existsSync(absolutePath)) {
    fatalFindings.push(`Expected ${deliverable.outputLabel} file is missing at ${relativePath}.`);

    return {
      deliverable,
      evidence: [...evidence, 'deliverable file exists: no'],
      fatalFindings,
      findings: [...fatalFindings],
      revisionFindings,
      verdict: 'fail',
    };
  }

  const content = fs.readFileSync(absolutePath, 'utf8');
  const traceMarker = buildMutationMarker(request, relativePath);

  evidence.push('deliverable file exists: yes');
  evidence.push(
    `builder bundle includes deliverable target: ${changedFiles.includes(relativePath) ? 'yes' : 'no'}`,
  );

  if (!changedFiles.includes(relativePath)) {
    fatalFindings.push(
      `Builder bundle changed files do not include the expected deliverable target ${relativePath}.`,
    );
  }

  for (const section of deliverable.sections) {
    if (!hasMarkdownHeading(content, section)) {
      revisionFindings.push(`Missing required section: ${section}.`);
      continue;
    }

    if (!getMarkdownSection(content, section)) {
      revisionFindings.push(`Required section is empty: ${section}.`);
    }
  }

  if (
    deliverable.sections.includes('Trace') &&
    !getMarkdownSection(content, 'Trace').includes(traceMarker)
  ) {
    fatalFindings.push(`Trace section must include the builder mutation marker for ${relativePath}.`);
  }

  if (
    deliverable.sections.includes('Next Action') &&
    hasMarkdownHeading(content, 'Next Action') &&
    !/^- /m.test(getMarkdownSection(content, 'Next Action'))
  ) {
    revisionFindings.push('Next Action section must contain at least one explicit action item.');
  }

  if (
    deliverable.deliverableType === 'checklist' &&
    hasMarkdownHeading(content, 'Checklist') &&
    !/^- \[[ xX]\]\s+/m.test(getMarkdownSection(content, 'Checklist'))
  ) {
    revisionFindings.push('Checklist section must contain at least one checklist item.');
  }

  if (
    deliverable.deliverableType === 'prd' &&
    hasMarkdownHeading(content, 'Acceptance Signals') &&
    !/^- /m.test(getMarkdownSection(content, 'Acceptance Signals'))
  ) {
    revisionFindings.push('Acceptance Signals section must contain explicit acceptance bullets.');
  }

  const findings = [...fatalFindings, ...revisionFindings];

  return {
    deliverable,
    evidence,
    fatalFindings,
    findings,
    revisionFindings,
    verdict:
      fatalFindings.length > 0 ? 'fail' : revisionFindings.length > 0 ? 'changes_requested' : 'pass',
  };
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
      if (isKnowledgeWorkPack(request)) {
        fileUpdates.push({
          path: relativePath,
          content: buildKnowledgeWorkFileContent(request, relativePath),
        });
        break;
      }
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

  if (isKnowledgeWorkPack(request)) {
    const deliverable = getKnowledgeWorkDeliverableSpec(request);

    return `# Plan: ${request.task.title}

## Slice Goal
${request.routingOutcome.scopeStatement}

## Intended Outcome
Turn the mission into one bounded ${deliverable.outputLabel} without widening into implementation.

## Acceptance Target
- one explicit target deliverable is selected: ${deliverable.label}
- audience, decision owner, and success criteria are stated
- assumptions, dependencies, and missing evidence are visible
- the slice is reviewable before any downstream execution or implementation begins

## Verification Approach
- check that the recommendation is grounded in the stated goal and constraints
- verify that the deliverable can be reviewed by another human without hidden context
- confirm that open questions and missing evidence are called out explicitly

## Dependencies and Blockers
${renderList(blockers, 'none')}

## Expected Artifacts
- plan
- output
- review

## Preferred Deliverable
- type: ${deliverable.deliverableType}
- label: ${deliverable.label}
- target file: ${deliverable.filePath}

## Preferred Sections
${renderList(deliverable.sections, 'none')}

## Worktree Need
No. This slice is document, planning, or decision work unless later implementation is explicitly requested.

## Non-Goals
- code implementation
- schema or infrastructure changes
- commit, release, or deployment work
`;
  }

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

  if (isKnowledgeWorkPack(request)) {
    const deliverable = getKnowledgeWorkDeliverableSpec(request);
    const affectedKnowledgeAreas = [deliverable.filePath, 'tasks/todo.md', 'tasks/lessons.md'];

    return `# Architecture Note: ${request.task.title}

## Boundary Fit Assessment
${
  normalizedResult.needsDecision
    ? 'The current plan crosses a protected knowledge-work boundary and needs an explicit human decision.'
    : 'The current plan fits the approved knowledge-work boundary for a bounded decision, planning, or documentation slice.'
}

## Affected Components or Contracts
${renderList(affectedKnowledgeAreas, 'none')}

## Policy Impact
${renderList(
  normalizedResult.needsDecision
    ? ['This follow-up would widen beyond the approved document/decision boundary and must stop for human resolution.']
    : [
        'The slice stays inside the current knowledge-work pack boundary.',
        'Grounded evidence, explicit assumptions, and reviewability remain required.',
      ],
  'none',
)}

## Decision-Log Impact
${renderList(
  normalizedResult.needsDecision
    ? ['If approved, the follow-up may require a decision-log or operating-rule update before execution proceeds.']
    : ['None. Existing product and pack guardrails remain unchanged.'],
  'none',
)}

## Approved Assumptions
${renderList(
  [
    `Architect input comes from planner artifact ${request.planArtifact.id}.`,
    `The selected deliverable remains ${deliverable.label} in ${deliverable.filePath}.`,
    'The output must remain reviewable without hidden context.',
    'No code mutation or implementation commitment is authorized by this note alone.',
  ],
  'none',
)}

## Planner Input Summary
- source artifact: ${request.planArtifact.id}
- slice goal: ${sliceGoal || 'not stated'}
- acceptance target: ${acceptanceTarget || 'not stated'}

## No-Architecture-Change Statement
${
  normalizedResult.needsDecision
    ? 'No broader workflow or product boundary change is approved by this note. Human resolution is required before downstream work.'
    : 'No broader workflow or product boundary change is approved by this note. Downstream work must stay inside the current mission, evidence, and review boundaries.'
}

## Blocking Architecture Issues
${renderList(normalizedResult.blockers, 'none')}
`;
  }

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

  if (isKnowledgeWorkPack(request)) {
    return `# Task Breakdown: ${request.task.title}

## Ordered Sub-Tasks
- restate the decision, planning, or documentation objective in one sentence
- collect the smallest set of evidence or source material needed for the first draft
- draft one bounded deliverable and stop before implementation or rollout work

## Checkpoints
- checkpoint 1: confirm audience, owner, and success criteria
- checkpoint 2: draft the bounded memo, plan, checklist, or brief
- checkpoint 3: attach explicit open questions and review evidence

## Expected Artifacts Per Checkpoint
- checkpoint 1: breakdown
- checkpoint 2: output, diff
- checkpoint 3: review

## Verification Checkpoints
${renderList(
  verificationApproach
    ? verificationApproach
        .split('\n')
        .map((line) => line.replace(/^- /, '').trim())
        .filter(Boolean)
    : [],
  'check that the draft is grounded, scoped, and reviewable',
)}

## Review Trigger Point
- Trigger review after the bounded deliverable is drafted and the evidence trail is attached.

## Stop-And-Escalate Conditions
${renderList(
  [
    ...normalizedResult.blockers,
    'Stop if the work turns into implementation, migration, or release execution.',
    'Stop if the recommendation depends on evidence that is not available in the current project context.',
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
  let nextStage = 'request-builder-live-mutation-approval';

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
      : 'Builder preflight artifact is ready for explicit live-mutation approval request without mutating code.',
    decisionTitle: `Builder preflight risk: ${request.task.title}`,
    decisionPrompt: renderList(
      blockers,
      'Builder preflight is ready for explicit live-mutation approval request.',
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

  if (isKnowledgeWorkPack(request)) {
    const deliverable = getKnowledgeWorkDeliverableSpec(request);
    const knowledgeTargetFiles = targetFiles.length > 0 ? targetFiles : [deliverable.filePath];

    return `# Builder Preflight: ${request.task.title}

## Target Files
${renderList(knowledgeTargetFiles, deliverable.filePath)}

## Intended Changes
${renderList(
  [
    `Prepare one bounded ${deliverable.label} tied to the current mission.`,
    'Keep evidence, assumptions, and open questions explicit inside the deliverable.',
    'Avoid any code or release action unless a later human-approved task explicitly asks for it.',
  ],
  'none',
)}

## Risks
${renderList(
  normalizedResult.blockers.length > 0
    ? normalizedResult.blockers
    : [
        'The draft can become too broad if audience, owner, or success criteria stay implicit.',
        'A recommendation without explicit evidence can look finished while still being weak.',
      ],
  'none',
)}

## Verification Plan
${renderList(
  [
    'Check that the deliverable has a clear audience, owner, and next action.',
    'Check that assumptions and missing evidence are called out explicitly.',
    'Check that the target files stay inside the approved knowledge-work boundary.',
  ],
  'none',
)}

## Review Evidence Expectations
${renderList(
  [
    'The saved preflight artifact must list target files, intended changes, risks, and review expectations.',
    'A later reviewer must be able to inspect the deliverable without hidden context.',
    `The drafted ${deliverable.label} should contain these sections: ${deliverable.sections.join(', ')}.`,
  ],
  'none',
)}

## Escalation Triggers
${renderList(
  [
    ...escalationTriggers,
    'Escalate if the requested output requires new external research or implementation authority that is not available.',
  ],
  'none',
)}

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

  if (isKnowledgeWorkPack(request)) {
    const deliverable = getKnowledgeWorkDeliverableSpec(request);

    return `# Builder Live Mutation: ${request.task.title}

## Change Summary
- preflight artifact: ${request.preflightArtifact.id}
- approval id: ${request.approval?.id || 'missing'}
- target file allowlist count: ${targetFiles.length}
- prepared file updates: ${fileUpdates.length}
- deliverable type: ${deliverable.deliverableType}
- reviewer executed: no

## Target Files
${renderList(targetFiles, 'none')}

## File Updates
${renderBase64FileUpdates(fileUpdates)}

## Risks
${renderList(
  normalizedResult.blockers.length > 0
    ? normalizedResult.blockers
    : [
        'The written memo can imply stronger certainty than the evidence supports if assumptions are not visible.',
        'The deliverable must stay inside the approved target-file boundary and not widen into implementation.',
      ],
  'none',
)}

## Verification Notes
${renderList(
  [
    'Store the raw deliverable change summary plus generated patch and observed diff artifacts.',
    'Do not run reviewer, commit, merge, or release steps from this mutation path.',
    'Keep explicit assumptions, open questions, and next action inside the drafted deliverable.',
  ],
  'none',
)}
`;
  }

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

function getReviewerDirective(request) {
  const directiveText = [request.task?.intent, request.changeSummaryArtifact?.content]
    .filter(Boolean)
    .join('\n');
  let manualVerdict = 'pass';

  if (/review verdict:\s*fail|review fail/i.test(directiveText)) {
    manualVerdict = 'fail';
  } else if (
    /review verdict:\s*changes_requested|review changes requested|request changes/i.test(
      directiveText,
    )
  ) {
    manualVerdict = 'changes_requested';
  }

  const assessment = isKnowledgeWorkPack(request) ? getKnowledgeWorkReviewAssessment(request) : null;

  return {
    assessment,
    blockingIssue: /blocking review issue/i.test(directiveText),
    decisionRequired: /review decision required/i.test(directiveText),
    verdict: mergeReviewerVerdicts(manualVerdict, assessment?.verdict),
  };
}

function buildNormalizedReviewerResult(request) {
  const directive = getReviewerDirective(request);
  const blockers = directive.assessment ? [...directive.assessment.findings] : [];
  let nextStage = directive.verdict === 'pass' ? 'human gate' : 'builder';

  if (directive.decisionRequired) {
    nextStage = 'human gate';
  }

  if (directive.blockingIssue) {
    blockers.push(
      'Reviewer found a blocking follow-up that requires a human decision before work may proceed.',
    );
  }

  return {
    blockers,
    needsDecision: directive.decisionRequired,
    nextStage,
    summary:
      directive.verdict === 'pass'
        ? 'Reviewer found the latest builder live mutation bundle acceptable for review handoff.'
        : directive.verdict === 'fail'
          ? 'Reviewer found a terminal failure and mapped the result to review follow-up.'
          : 'Reviewer requested changes before work may proceed.',
    decisionTitle: `Review follow-up: ${request.task.title}`,
    decisionPrompt: renderList(
      blockers,
      'Review follow-up requires a human decision before work may proceed.',
    ),
  };
}

function renderReviewerOutput(request) {
  const directive = getReviewerDirective(request);
  const normalizedResult = buildNormalizedReviewerResult(request);
  const changedFiles = Array.isArray(request.builderRun?.summary?.changedFiles)
    ? request.builderRun.summary.changedFiles
    : [];
  const evidenceReviewed = [
    `source builder run: ${request.builderRun.id}`,
    `plan artifact: ${request.planArtifact.id}`,
    `architecture artifact: ${request.architectureArtifact.id}`,
    `breakdown artifact: ${request.breakdownArtifact.id}`,
    `preflight artifact: ${request.preflightArtifact.id}`,
    `change-summary artifact: ${request.changeSummaryArtifact.id}`,
    `patch artifact: ${request.patchArtifact.id}`,
    `diff artifact: ${request.diffArtifact.id}`,
    `builder logs reviewed: ${request.builderLogs.length}`,
  ];
  const findings =
    directive.verdict === 'pass'
      ? ['No blocking findings in the anchored builder live mutation bundle.']
      : directive.verdict === 'fail'
        ? ['Observed live mutation output requires correction before the task may proceed.']
        : ['A follow-up implementation pass is required before the task may proceed.'];
  const contractCompliance =
    directive.verdict === 'pass'
      ? [
          'Review stayed anchored to the latest builder live mutation run bundle.',
          'No commit, merge, or release action was reviewed as executed.',
        ]
      : [
          'Review stayed anchored to the latest builder live mutation run bundle.',
          'The task remains inside the review gate until follow-up is completed.',
        ];
  const verificationEvidence = [
    `changed files reviewed: ${changedFiles.length}`,
    `approval linkage reviewed: ${request.approval?.id || 'missing'}`,
    `builder execution mode reviewed: ${request.builderRun.summary?.executionMode || 'unknown'}`,
  ];
  const nextAction =
    normalizedResult.nextStage === 'human gate'
      ? ['Route to human gate after review.']
      : normalizedResult.nextStage === 'architect'
        ? ['Return to architect with the review artifact and builder bundle context.']
        : ['Return to builder with the review artifact and builder bundle context.'];

  if (isKnowledgeWorkPack(request)) {
    const assessment = directive.assessment || getKnowledgeWorkReviewAssessment(request);
    const deliverable = assessment.deliverable;
    const knowledgeFindings =
      assessment.findings.length > 0
        ? assessment.findings
        : directive.verdict === 'pass'
          ? [`The bounded ${deliverable.outputLabel} is reviewable and grounded enough for human handoff.`]
          : directive.verdict === 'fail'
            ? [`The ${deliverable.outputLabel} is not yet reliable enough to hand off as a decision aid.`]
            : [`The ${deliverable.outputLabel} needs another revision before it can serve as a reliable decision or planning aid.`];
    const knowledgeContractCompliance =
      directive.verdict === 'pass'
        ? [
            'Review stayed anchored to the latest builder live mutation run bundle.',
            'The deliverable remained inside the approved knowledge-work boundary.',
            'Required knowledge-work rubric checks passed for section coverage, explicit next action, and provenance trace.',
            'No commit, merge, release, or implementation action was treated as completed.',
          ]
        : [
            'Review stayed anchored to the latest builder live mutation run bundle.',
            'The deliverable remained inside the approved knowledge-work boundary.',
            'Knowledge-work rubric findings blocked handoff until the missing structure or provenance issue is repaired.',
            'No commit, merge, release, or implementation action was treated as completed.',
          ];

    return `# Reviewer Report: ${request.task.title}

## Review Verdict
- verdict: ${directive.verdict}
- source builder run: ${request.builderRun.id}
- preflight artifact: ${request.preflightArtifact.id}
- change-summary artifact: ${request.changeSummaryArtifact.id}
- patch artifact: ${request.patchArtifact.id}
- diff artifact: ${request.diffArtifact.id}

## Evidence Reviewed
${renderList(evidenceReviewed, 'none')}

## Findings
${renderList(knowledgeFindings, 'none')}

## Contract Compliance
${renderList(
  knowledgeContractCompliance,
  'none',
)}

## Verification Evidence
${renderList(
  [
    `changed files reviewed: ${changedFiles.length}`,
    `approval linkage reviewed: ${request.approval?.id || 'missing'}`,
    'audience, owner, assumptions, and next action were checked for explicitness',
    `expected section set reviewed: ${deliverable.sections.join(', ')}`,
    ...assessment.evidence,
  ],
  'none',
)}

## Accepted Risks
- none

## Next Action
${renderList(nextAction, 'none')}

## Follow-Up Gate
- blocking issue: ${directive.blockingIssue ? 'yes' : 'no'}
- decision required: ${directive.decisionRequired ? 'yes' : 'no'}
`;
  }

  return `# Reviewer Report: ${request.task.title}

## Review Verdict
- verdict: ${directive.verdict}
- source builder run: ${request.builderRun.id}
- preflight artifact: ${request.preflightArtifact.id}
- change-summary artifact: ${request.changeSummaryArtifact.id}
- patch artifact: ${request.patchArtifact.id}
- diff artifact: ${request.diffArtifact.id}

## Evidence Reviewed
${renderList(evidenceReviewed, 'none')}

## Findings
${renderList(findings, 'none')}

## Contract Compliance
${renderList(contractCompliance, 'none')}

## Verification Evidence
${renderList(verificationEvidence, 'none')}

## Accepted Risks
- none

## Next Action
${renderList(nextAction, 'none')}

## Follow-Up Gate
- blocking issue: ${directive.blockingIssue ? 'yes' : 'no'}
- decision required: ${directive.decisionRequired ? 'yes' : 'no'}
`;
}

function createLocalStubProviderAdapter() {
  return {
    name: 'local-stub',
    async execute(request) {
      if (request.role === 'reviewer') {
        return {
          providerRunId: `local-stub-reviewer-${request.task.id}`,
          model: 'local-stub-reviewer-v1',
          normalizedResult: buildNormalizedReviewerResult(request),
          outputText: renderReviewerOutput(request),
          usage: {
            inputTokens: 0,
            outputTokens: 0,
          },
        };
      }

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
