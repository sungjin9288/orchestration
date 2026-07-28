# AI Company Reviewer Rework Preview Implementation Decision Handoff

## Purpose

이 문서는 `docs/127_ai-company-reviewer-rework-preview-plan.md`의 planning-only evidence를 one
schema-v21-preserving response-only runtime/API/UI preview로 구현할지 operator가 complete fielded
shape로 결정하기 위한 handoff다. 이 문서 자체는 runtime, API, UI, schema, durable ReworkPlan,
retry, execution, source mutation, approval, scheduling, provider, memory, commit, push, 또는 release
authority를 열지 않는다.

## Current Gate

- Planning-only decision: accepted as `DEC-186`
- Implementation handoff: recorded as `DEC-187`
- Complete fielded implementation decision: missing and reserved for `DEC-188`
- Current runtime: schema v21 with exact Reviewer changes-requested durable evidence only
- Implementation authority: blocked

## Minimum Required Decision Fields

```text
decisionId
decisionStatus
targetAuthority
targetSurface
implementationPlanRefs
runtimePath
compatibilityPlanRefs
schemaPreservationRefs
sourceEvidenceRefs
negativeEvidenceRefs
rollbackRefs
focusedSmokeRefs
aggregateVerificationRef
stillBlockedAuthorities
approvalStatement
```

Every field must be present exactly once in one decision outcome.

## Valid Approval Outcome

```text
decisionId=operator-decision-ai-company-reviewer-rework-preview-implementation-001
decisionStatus=approve-ai-company-reviewer-rework-preview-implementation-slice
targetAuthority=one deterministic schema-v21-preserving response-only ReviewerReworkPlanPreview from one operator-selected exact source-current StaffingEntry-bound ExecutionPlan stopped at Reviewer changes-requested
targetSurface=src/runtime/reviewer-rework-preview.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs, ui/council-signals.js, ui/app.js, ui/styles.css, scripts/smoke-ai-company-reviewer-rework-preview.mjs, scripts/smoke-ui-slice-703.mjs, scripts/verification_status.mjs, scripts/ui_qa_status.mjs
implementationPlanRefs=docs/127_ai-company-reviewer-rework-preview-plan.md
runtimePath=require one exact ExecutionPlan route plus the exact seven-key GET query reviewerWorkOrderId reviewerAttemptId reviewerRunId reviewArtifactId expectedExecutionPlanDigest expectedAttemptRecordDigest and evaluatedAt, reject evaluatedAt before Reviewer completion or more than five minutes ahead of runtime now, load current schema-v21 state through the no-migration read path, validate the complete source-current accepted StaffingPlan StaffingEntry CouncilSession Mission CompanyBlueprint role-source ExecutionPlan WorkOrder WorkOrderAttempt Builder Run Reviewer Run Review Artifact Decision Inbox and unexecuted QA lineage, require plan blocked at reviewer-changes-requested and one latest run-reviewer attemptNumber=1 with status changes-requested, enforce a 64 KiB pre-read Artifact byte cap, derive reviewEvidenceDigest in the runtime because the current durable Artifact has no persisted record or content digest, parse one changes_requested review with one through 32 bounded redaction-safe source-ordered duplicate-preserving findings, inherit the original targetPathAllowlist and verificationCommands byte-equivalently, derive canonical review evidence source progress finding preview digests and ids, return one deeply frozen persisted=false status=rework-review-required preview with maxAdditionalBuilderAttempts=1 nextAttemptNumber=2 allowedActions empty and exact ordered blockedActions through bounded 200 400 404 and 409 envelopes, and stop before every write execution approval retry or scheduling boundary
compatibilityPlanRefs=preserve DEC-091 ExecutionPlan persistence, DEC-094 reviewed-delivery pass and changes-requested paths, DEC-097 WorkflowCheckpoint recovery, DEC-169 StaffingEntry binding, DEC-172 operator-stepped WorkOrder execution, DEC-176 DEC-179 DEC-182 specialist paths, DEC-185 OpsSupervisionPreview, all existing exact routes, provider contracts, Advanced Ops authority, generic snapshot exclusions, and standalone Mission Council delivery learning memory Growth commit and release behavior
schemaPreservationRefs=keep STATE_SCHEMA_VERSION=21 and do not edit createEmptyState file-store normalization migrations sequences maps contracts or durable record validators, create no state on boot read GET render refresh invalid input or valid preview, and prove state Artifact source and project bytes remain unchanged
sourceEvidenceRefs=DEC-076, DEC-088, DEC-091, DEC-094, DEC-097, DEC-163, DEC-169, DEC-172, DEC-185, DEC-186, DEC-187, docs/48_ai-company-master-plan.md, docs/49_agent-runtime-contract.md, docs/50_council-operating-protocol.md, docs/51_ai-company-delivery-roadmap.md, docs/113_ai-company-multi-agent-completion-plan.md, docs/117_ai-company-operator-stepped-workorder-scheduler-plan.md, docs/127_ai-company-reviewer-rework-preview-plan.md, src/runtime/contracts.js, src/runtime/work-order-attempts.js, src/runtime/mission-workorder-compiler.js, src/runtime/runtime-service.js, src/execution/coordinator/artifact-content.js, src/execution/execution-coordinator.js, scripts/serve-ui-slice-01.mjs, ui/app.js
negativeEvidenceRefs=current schema v21 has source-bound Reviewer WorkOrderAttempt changes-requested and structured review Artifact evidence but no persisted Artifact record or content digest ReviewerReworkPlanPreview module exact seven-key GET canonical review evidence or source progress digest bounded finding normalization browser-memory preview focused runtime smoke UI smoke durable ReworkPlan new Builder attempt retry preflight approval mutation execution or scheduling authority
rollbackRefs=disable and remove the response-only preview module exact GET route UI preview action and browser-memory result, preserve schema-v21 state review Artifact bytes and every StaffingPlan StaffingEntry CouncilSession Mission ExecutionPlan WorkOrder WorkOrderAttempt Run Artifact Decision Inbox checkpoint specialist Ops source provider Git release memory and policy record byte-for-byte, retain all existing exact inspection and execution paths, and rerun focused compatibility README inventory UI QA and aggregate verification
focusedSmokeRefs=scripts/smoke-ai-company-reviewer-rework-preview.mjs proving one exact source-current bound changes-requested stop exact seven-key transport complete source and run-artifact lineage runtime-derived reviewEvidenceDigest 64 KiB pre-read cap structured verdict one-through-32 bounded redacted duplicate-preserving findings byte-equivalent target and verification inheritance canonical review evidence source progress finding preview digests and ids attempt cap next attempt allowedActions empty ordered blockedActions deep freeze replay bounded 200 400 404 and 409 envelopes malformed missing extra repeated oversized unknown stale legacy-unbound provider-backed active terminal pass fail missing-finding QA-already-run widened-path widened-command raw-body credential and lineage-conflict refusal zero state source worker provider approval inbox run artifact checkpoint Git release memory or policy mutation and DEC-091 DEC-094 DEC-097 DEC-169 DEC-172 DEC-179 DEC-182 DEC-185 compatibility; scripts/smoke-ui-slice-703.mjs proving exact-source action eligibility browser-memory invalidation bounded safe rendering absent downstream controls unchanged authoritative actions and desktop mobile fit
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=schema-v22 migration, durable ReworkPlan or rework decision records, new Builder WorkOrder or WorkOrderAttempt append, retry, start-rework, preflight, approval creation or resolution, source mutation, Reviewer or QA execution, automatic parallel dynamic autonomous or background scheduling, provider-backed WorkOrders, result application, memory application, runtime-agent commit push or release, profile or policy mutation, approval bypass, collection list history search ranking recommendation automatic selection, and external connectors
approvalStatement=I approve implementation only for the schema-v21-preserving response-only exact ReviewerReworkPlanPreview described in docs/127_ai-company-reviewer-rework-preview-plan.md. This permits inspection and deterministic planning evidence only and does not approve schema migration durable ReworkPlan new WorkOrder or attempt retry rework execution preflight approval source mutation scheduling providers memory Git release policy bypass collections or connectors.
```

## Other Valid Outcomes

### Request More Evidence

```text
decisionId=operator-decision-ai-company-reviewer-rework-preview-implementation-001
decisionStatus=request-ai-company-reviewer-rework-preview-evidence
requestedEvidenceRefs=
decisionNotes=
approvalStatement=I request the named evidence before ReviewerReworkPlanPreview implementation can open.
```

### Reject

```text
decisionId=operator-decision-ai-company-reviewer-rework-preview-implementation-001
decisionStatus=reject-ai-company-reviewer-rework-preview-implementation
decisionNotes=
approvalStatement=I reject ReviewerReworkPlanPreview implementation. Schema v21 and the existing Reviewer changes-requested evidence remain authoritative.
```

### Defer

```text
decisionId=operator-decision-ai-company-reviewer-rework-preview-implementation-001
decisionStatus=defer-ai-company-reviewer-rework-preview-implementation
decisionNotes=
approvalStatement=I defer ReviewerReworkPlanPreview implementation. No runtime API UI schema retry rework execution or downstream authority opens.
```

## Invalid Shortcuts

- `approval`, `approved`, `승인`, `전체 승인`, `continue`, `다음 스텝`, or `do everything`
- delegated self-approval for runtime, API, UI, Artifact reads, or authority-bearing inspection
- planning-only `DEC-186`, handoff-only `DEC-187`, or earlier scheduler/review decisions
- legacy unbound, provider-backed, automatic, collection-based, or inferred plan selection
- returning a partial preview after source, digest, run, Artifact, finding, or QA-state mismatch
- widening target paths, verification commands, findings, attempt count, or provider budget
- adding `Retry`, `Start rework`, `Approve`, `Run Builder`, `Run Reviewer`, `Run QA`, `Commit`,
  `Push`, or `Release` controls
- state migration, durable record creation, WorkOrder append, attempt append, preflight, approval,
  worker/provider invocation, or source mutation inside a read-only preview
- persistence or response exposure of raw source, prompt, provider payload, stdout, stderr, argv,
  environment, absolute path, credential, transcript, chain-of-thought, Run body, or Artifact body
- omission of exact transport, Artifact byte cap, schema preservation, zero-write, rollback,
  focused-smoke, or still-blocked-authority fields

## Acceptance Criteria

1. Every required field is present exactly once.
2. The decision names only the target files listed in the plan.
3. Schema v21 and every durable source, Artifact, and project byte remain stable.
4. The route has exactly one path id and seven required query keys.
5. Only one exact operator-selected source-current bound changes-requested stop is inspected.
6. Plan, WorkOrder, attempt, Builder Run, Reviewer Run, Artifact, and source digests are mandatory.
7. Artifact size is checked before reading and raw Artifact content never leaves the runtime.
8. Findings are bounded, redaction-safe, source-ordered, and duplicate-preserving.
9. Target paths and verification commands are inherited without widening.
10. The source progress digest and attempt cap are deterministic.
11. Every valid response has `allowedActions=[]`.
12. Preview and UI contain no mutation, approval, retry, or execution action.
13. Focused runtime/API/UI, UI QA, and aggregate verification pass.
14. Every authority outside response-only inspection remains blocked.

## Stop Conditions

Stop and do not implement when the decision is incomplete, uses a shortcut, adds schema or durable
state, weakens current bound-source validation, reads an oversized Artifact, exposes raw bodies or
secrets, drops duplicate findings, widens target or verification scope, adds a downstream action,
changes existing routes, or bundles provider, source, Git, release, memory, policy, collection,
bypass, or connector authority.

## Verification After A Valid Decision

```bash
node scripts/smoke-ai-company-reviewer-rework-preview-planning.mjs
node scripts/smoke-ai-company-reviewer-rework-preview.mjs
node scripts/smoke-ui-slice-703.mjs
node scripts/smoke-ai-company-operator-stepped-workorder-scheduler.mjs
node scripts/smoke-ai-company-reviewed-delivery.mjs
node scripts/smoke-ai-company-ops-supervision-preview.mjs
node scripts/ui_qa_status.mjs
node scripts/verification_status.mjs
```

Until one exact valid outcome is supplied, implementation remains blocked. Planning and this handoff
authorize no runtime, API, UI, schema, durable rework, retry, execution, approval, provider, source,
Git/release, memory, policy, collection, bypass, or connector behavior.
