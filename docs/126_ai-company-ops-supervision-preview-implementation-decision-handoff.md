# AI Company Ops Supervision Preview Implementation Decision Handoff

## Purpose

이 문서는 `docs/125_ai-company-ops-supervision-preview-plan.md`의 planning-only evidence를 one
schema-v21-preserving response-only runtime/API/UI preview로 구현할지 operator가 complete fielded
shape로 결정하기 위한 handoff다. 이 문서 자체는 runtime, API, UI, schema, recovery,
settlement, cancellation, replay, provider, source mutation, commit, push, 또는 release authority를
열지 않는다.

## Current Gate

- Planning-only decision: accepted as `DEC-183`
- Implementation handoff: recorded as `DEC-184`
- Complete fielded implementation decision: missing and reserved for `DEC-185`
- Current runtime: schema v21 with exact attempt-specific inspection only
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
decisionId=operator-decision-ai-company-ops-supervision-preview-implementation-001
decisionStatus=approve-ai-company-ops-supervision-preview-implementation-slice
targetAuthority=one deterministic schema-v21-preserving response-only OpsSupervisionPreview for one operator-selected exact active WorkOrderAttempt SpecialistBatch first-attempt cell or SpecialistCellRetry attemptNumber=2
targetSurface=src/runtime/ops-supervision-preview.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs, ui/council-signals.js, ui/app.js, ui/styles.css, scripts/smoke-ai-company-ops-supervision-preview.mjs, scripts/smoke-ui-slice-702.mjs, scripts/verification_status.mjs, scripts/ui_qa_status.mjs
implementationPlanRefs=docs/125_ai-company-ops-supervision-preview-plan.md
runtimePath=require the exact six-key GET query targetType targetId parentId expectedTargetRecordDigest expectedParentDigest and evaluatedAt, reject evaluatedAt before target startedAt or more than five minutes ahead of runtime now and classify exact deadline equality as active-deadline-exceeded, load current schema-v21 state through the no-migration read path, validate exactly one active target and its complete durable parent source attempt role deadline and record lineage, derive the WorkOrder parent through the existing canonical ExecutionPlan digest and specialist parents through their persisted record digests, return one deeply frozen deterministic persisted=false status=supervision-required preview with the exact fixed response keys seven-key nullable evidenceRefs allowedActions empty ordered blockedActions canonical preview digest and derived id, use bounded 200 400 404 and 409 envelopes, and stop before every mutation or execution boundary
compatibilityPlanRefs=preserve DEC-097 WorkflowCheckpoint recovery and quarantine-only active-stage behavior, DEC-172 operator-stepped WorkOrder execution and exact attempt inspection, DEC-179 fixed SpecialistBatch first attempts and exact inspection, DEC-182 exact failed-cell retry replay settlement and lookup, all existing routes, generic specialist-map snapshot exclusion, provider contracts, Advanced Ops authority, and standalone Mission Council delivery memory Growth commit and release behavior
schemaPreservationRefs=keep STATE_SCHEMA_VERSION=21 and do not edit createEmptyState file-store normalization migrations sequences maps record validators or durable records, create no state on boot read GET render refresh invalid input or valid preview, and prove state plus source bytes remain unchanged
sourceEvidenceRefs=DEC-095, DEC-097, DEC-163, DEC-170, DEC-172, DEC-177, DEC-179, DEC-180, DEC-182, DEC-183, DEC-184, docs/48_ai-company-master-plan.md, docs/49_agent-runtime-contract.md, docs/50_council-operating-protocol.md, docs/51_ai-company-delivery-roadmap.md, docs/64_ai-company-checkpoint-resume-recovery-plan.md, docs/113_ai-company-multi-agent-completion-plan.md, docs/117_ai-company-operator-stepped-workorder-scheduler-plan.md, docs/121_ai-company-durable-specialist-batch-plan.md, docs/123_ai-company-specialist-cell-retry-plan.md, docs/125_ai-company-ops-supervision-preview-plan.md, src/runtime/contracts.js, src/runtime/work-order-attempts.js, src/runtime/workorder-verification-plan-preview.js, src/runtime/specialist-batches.js, src/runtime/specialist-cell-attempts.js, src/runtime/specialist-cell-retries.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs, ui/app.js
negativeEvidenceRefs=current schema v21 has exact type-specific attempt and parent inspection but no shared Ops supervision preview module exact cross-attempt GET contract deterministic deadline vocabulary source-bound response shape browser-memory inspection focused runtime smoke or UI smoke, and no settlement cancellation quarantine mutation resume replay retry rework provider application source Git release memory policy collection or connector authority
rollbackRefs=disable and remove the response-only preview module exact GET route UI inspection action and browser-memory result, preserve schema-v21 state and every WorkOrderAttempt SpecialistBatch SpecialistCellAttempt SpecialistCellRetry WorkflowCheckpoint plan run artifact approval source and policy record byte-for-byte, retain all existing exact inspection paths, and rerun focused compatibility README inventory UI QA and aggregate verification
focusedSmokeRefs=scripts/smoke-ai-company-ops-supervision-preview.mjs proving all three active target types exact six-key transport deterministic deadline equality no-deadline classification evaluatedAt before-start and future refusal exact target record parent and lineage digest binding seven-key evidenceRefs nullability ordered blockedActions canonical preview digest and id byte-equivalent replay deep freeze bounded redaction allowedActions empty bounded 200 400 404 and 409 envelopes malformed terminal stale mismatch extra repeated blank and oversized refusal zero state source worker provider approval inbox run artifact checkpoint Git release memory or policy mutation and DEC-097 DEC-172 DEC-179 DEC-182 compatibility; scripts/smoke-ui-slice-702.mjs proving exact-source action eligibility browser-memory invalidation safe failure rendering absent recovery controls unchanged authoritative surfaces and desktop mobile fit
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=schema-v22 migration, durable Ops supervision recovery disposition quarantine cancellation or reconciliation records, active WorkOrderAttempt SpecialistBatch SpecialistCellAttempt SpecialistCellRetry or WorkflowCheckpoint mutation, settlement, success or failure inference, resume, replay, retry, rework, automatic parallel dynamic autonomous or background scheduling, provider-backed execution, result application, source mutation, memory application, runtime-agent commit push or release, profile or policy mutation, approval bypass, collection list history search ranking recommendation automatic selection, and external connectors
approvalStatement=I approve implementation only for the schema-v21-preserving response-only exact active-attempt OpsSupervisionPreview described in docs/125_ai-company-ops-supervision-preview-plan.md. This permits inspection and classification only and does not approve schema migration durable recovery records settlement cancellation quarantine mutation resume replay retry rework scheduling provider execution result application source mutation Git release memory policy bypass collections or connectors.
```

## Other Valid Outcomes

### Request More Evidence

```text
decisionId=operator-decision-ai-company-ops-supervision-preview-implementation-001
decisionStatus=request-ai-company-ops-supervision-preview-evidence
requestedEvidenceRefs=
decisionNotes=
approvalStatement=I request the named evidence before OpsSupervisionPreview implementation can open.
```

### Reject

```text
decisionId=operator-decision-ai-company-ops-supervision-preview-implementation-001
decisionStatus=reject-ai-company-ops-supervision-preview-implementation
decisionNotes=
approvalStatement=I reject OpsSupervisionPreview implementation. Schema v21 and the existing exact inspection paths remain authoritative.
```

### Defer

```text
decisionId=operator-decision-ai-company-ops-supervision-preview-implementation-001
decisionStatus=defer-ai-company-ops-supervision-preview-implementation
decisionNotes=
approvalStatement=I defer OpsSupervisionPreview implementation. No runtime API UI schema recovery or downstream authority opens.
```

## Invalid Shortcuts

- `approval`, `approved`, `승인`, `전체 승인`, `continue`, `다음 스텝`, or `do everything`
- delegated self-approval for runtime, API, UI, or authority-bearing inspection
- planning-only `DEC-183`, handoff-only `DEC-184`, or earlier retry/checkpoint decisions
- automatic active-attempt enumeration or target selection
- returning a partial preview after lineage or record-digest mismatch
- adding `Retry`, `Resume`, `Cancel`, `Quarantine`, `Settle`, or `Mark successful` controls
- state migration, durable record creation, attempt mutation, worker/provider invocation, or source
  mutation inside a read-only preview
- persistence of raw source, prompt, provider payload, stdout, stderr, argv, environment, absolute
  path, credential, transcript, chain-of-thought, run body, or artifact body
- omission of exact transport, schema-preservation, zero-write, rollback, focused-smoke, or
  still-blocked-authority fields

## Acceptance Criteria

1. Every required field is present exactly once.
2. The decision names only the target files listed in the plan.
3. Schema v21 and every durable source record remain byte-stable.
4. The GET query has exactly six required keys.
5. Only one exact operator-selected active target is inspected.
6. All three target types bind exact target record and parent digests, using the canonical
   ExecutionPlan digest for WorkOrder parents and persisted record digests for specialist parents.
7. Deadline classification is deterministic and WorkOrderAttempt remains no-deadline.
8. Lineage mismatch fails closed.
9. Every valid response has `allowedActions=[]`.
10. Preview and UI contain no mutation or execution action.
11. Focused runtime/API/UI, UI QA, and aggregate verification pass.
12. Every authority outside inspection remains blocked.

## Stop Conditions

Stop and do not implement when the decision is incomplete, uses a shortcut, adds schema or durable
state, permits enumeration or automatic selection, weakens exact digest/lineage validation, exposes
raw bodies or secrets, adds a recovery action, changes existing routes, or bundles provider,
source, Git, release, memory, policy, collection, bypass, or connector authority.

## Verification After A Valid Decision

```bash
node scripts/smoke-ai-company-ops-supervision-preview-planning.mjs
node scripts/smoke-ai-company-ops-supervision-preview.mjs
node scripts/smoke-ui-slice-702.mjs
node scripts/smoke-ai-company-checkpoint-resume-recovery.mjs
node scripts/smoke-ai-company-operator-stepped-workorder-scheduler.mjs
node scripts/smoke-ai-company-durable-specialist-batch.mjs
node scripts/smoke-ai-company-specialist-cell-retry.mjs
node scripts/ui_qa_status.mjs
node scripts/verification_status.mjs
```

The exact valid approval outcome was supplied and recorded as `DEC-185`. The implementation gate is
consumed for the response-only inspect path only; every recovery, mutation, execution, schema,
provider, source, Git, release, memory, policy, collection, bypass, and connector authority remains
blocked.
