# AI Company LearningCandidate Preview Implementation Decision Handoff

## Purpose

`docs/72_ai-company-learning-candidate-preview-plan.md`의 planning-only 결과를 one deterministic
response-only LearningCandidate preview runtime/API/UI slice로 넓히는 complete fielded decision을
보존한다. Recommended approval shape는 `DEC-109`로 소비됐고, 이 문서는 exact source tuple,
retrospectiveSpec, no-write contract, compatibility, rollback, focused evidence, and stop boundary의
decision provenance다.

## Current Gate

- Planning-only authority is accepted as `DEC-107`.
- The implementation decision handoff is recorded as `DEC-108`.
- The complete fielded approval is accepted and implemented as `DEC-109`.
- Current runtime remains schema v11 with exact MissionCloseOut terminal evidence.
- One response-only LearningCandidate compiler, POST route, and browser-memory UI preview exist.
- No LearningCandidate schema, durable record, review outcome, memory, or skill authority exists.

## Minimum Required Decision Fields

```text
decisionId=
decisionStatus=
targetAuthority=
targetSurface=
implementationPlanRefs=
runtimePath=
compatibilityPlanRefs=
sourceEvidenceRefs=
negativeEvidenceRefs=
rollbackRefs=
focusedSmokeRefs=
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=
approvalStatement=
```

## Recommended Approval Shape

```text
decisionId=operator-decision-ai-company-learning-candidate-preview-implementation-001
decisionStatus=approve-ai-company-learning-candidate-preview-implementation-slice
targetAuthority=one deterministic response-only LearningCandidate preview from one exact source-current schema-v11 completed Mission and immutable MissionCloseOut evidence tuple plus one operator-owned retrospectiveSpec
targetSurface=src/runtime/learning-candidate-preview.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs, ui/council-signals.js, ui/app.js, ui/styles.css, scripts/smoke-ai-company-learning-candidate-preview.mjs, scripts/smoke-ui-slice-660.mjs, scripts/verification_status.mjs, scripts/ui_qa_status.mjs
implementationPlanRefs=docs/72_ai-company-learning-candidate-preview-plan.md
runtimePath=require one exact source-current completed Mission and Done linked control task plus strict MissionCloseOut DeliveryPackage Acceptance ExecutionPlan terminal WorkflowCheckpoint completed Builder Reviewer QA WorkOrders passed review and closed-gate evidence, require one exact operator-owned retrospectiveSpec whose lesson applicability paths commands negative-evidence refs expiry and redaction acknowledgement remain inside that source set, accept no raw evidence body field and conservatively reject obvious credential markers without claiming perfect secret detection, compile one deeply frozen canonical response-only LearningCandidate preview with persisted=false redactionStatus=review-required reviewerStatus=review-required promotionStatus=proposed and every downstream authority false, expose it only from one explicit POST response and browser memory, and stop before schema migration persistence candidate review outcome memory skill provider source Git release scheduling next-Mission policy bypass or connectors
compatibilityPlanRefs=keep STATE_SCHEMA_VERSION 11 and do not edit createEmptyState file-store normalization migration MissionCloseOut package acceptance checkpoint plan WorkOrder task Mission Council Growth or proposal records, preserve DEC-088 DEC-091 DEC-094 DEC-097 DEC-100 DEC-103 DEC-106 and standalone task routes and behavior, create no snapshot field GET route run artifact approval inbox item checkpoint package candidate memory skill or next Mission, and preserve direct runtime consumers that do not invoke the new method
sourceEvidenceRefs=DEC-076, DEC-088, DEC-091, DEC-094, DEC-097, DEC-100, DEC-103, DEC-104, DEC-106, DEC-107, DEC-108, docs/48_ai-company-master-plan.md, docs/49_agent-runtime-contract.md, docs/50_council-operating-protocol.md, docs/51_ai-company-delivery-roadmap.md, docs/70_ai-company-mission-task-close-out-plan.md, docs/72_ai-company-learning-candidate-preview-plan.md, src/runtime/contracts.js, src/runtime/mission-close-outs.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs, ui/app.js
negativeEvidenceRefs=current state is schema v11 with no LearningCandidate type compiler preview digest retrospectiveSpec validator POST route UI preview focused runtime smoke or UI smoke; no runtime source file contains LearningCandidate learningCandidate retrospective evaluator implementation, and existing Growth Evidence Ledger or proposal flows are separate authority domains
rollbackRefs=disable the learning-candidate-preview POST route and Deliverables form, discard response and browser-memory previews, preserve every schema-v11 MissionCloseOut and source evidence record unchanged, keep Mission completed and linked task Done without synthetic reopen, and rerun focused compatibility README inventory UI QA and aggregate verification
focusedSmokeRefs=scripts/smoke-ai-company-learning-candidate-preview.mjs proving exact request keys strict current terminal tuple retrospectiveSpec validation source-contained applicability paths commands and negative evidence canonical digest stable preview id deep freeze exact replay changed-input distinction zero saveState and byte mutation no schema candidate run artifact approval inbox checkpoint package memory skill or next-Mission record stale malformed extra-field missing-evidence unsupported-ref path command obvious-high-risk-credential-marker raw-body-field invalid-expiry corrupt-source and authority-widening refusal no provider source Git release scheduling policy bypass or connector effect and DEC-088 DEC-091 DEC-094 DEC-097 DEC-100 DEC-103 DEC-106 standalone Council Growth and proposal compatibility; scripts/smoke-ui-slice-660.mjs proving explicit terminal-only preview form response-only redaction-and-review-required rendering persisted=false source refs expiry safe failure browser-memory reload clearing absent downstream controls unchanged close-out UI and desktop mobile fit
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=schema-v12 migration, durable LearningCandidate creation persistence acceptance rejection expiry mutation quarantine supersession deletion or promotion, memory persistence, cross-Mission retrieval, skill promotion, provider-assisted generation, raw transcript artifact-body source-content or secret ingestion, Mission or task reopen, package rejection changes-requested, standalone close-out, commit, push, release, automatic retry rework scheduling or next-Mission creation, provider-backed WorkOrders, provider expansion, profile or policy mutation, approval bypass, external connectors
approvalStatement=I approve implementation only for one deterministic response-only LearningCandidate preview described in docs/72_ai-company-learning-candidate-preview-plan.md. It must preserve schema v11, validate one exact completed Mission evidence tuple plus one operator-owned retrospectiveSpec, perform no state write, and keep the preview review-required and non-persistent. This does not approve durable candidates, memory, skills, provider generation, raw evidence ingestion, source mutation, Git, release, scheduling, next-Mission creation, policy mutation, approval bypass, or connectors.
```

## Other Valid Outcomes

Evidence request:

```text
decisionStatus=request-evidence
approvalStatement=I request the named evidence before response-only LearningCandidate preview implementation authority can open.
```

Rejection:

```text
decisionStatus=reject
approvalStatement=I reject LearningCandidate preview implementation. Schema-v11 MissionCloseOut evidence remains the terminal AI Company boundary.
```

Deferral:

```text
decisionStatus=defer
approvalStatement=I defer LearningCandidate preview implementation. No runtime, route, UI, schema, record, memory, skill, provider, source, Git, release, scheduling, policy, or connector authority opens.
```

## Invalid Shortcuts

The following do not open implementation authority:

- `approval`, `approved`, `continue`, `do everything`, `approve all`, `self approve`, or
  `use your judgment`;
- planning approval without the complete fielded implementation decision;
- prior MissionCloseOut, package acceptance, Growth Evidence Ledger, or proposal-generation authority;
- interpreting a response-only preview as a durable candidate, accepted lesson, memory, or skill;
- using browser localStorage as durable learning persistence;
- using optional provider credentials as implicit retrospective generation authority.

## Minimum Acceptance Criteria

The implementation decision must explicitly:

1. keep schema v11 and every persisted record unchanged;
2. require one exact completed Mission/task/close-out/package/acceptance/plan/checkpoint/WorkOrder/
   review/QA source tuple;
3. require the exact retrospectiveSpec with bounded summaries, source-contained paths/commands/negative
   evidence, valid expiry, and `source-summary-only` acknowledgement;
4. call no provider, accept no raw transcript/artifact/source/prompt/provider/env field, reject obvious
   credential markers conservatively, and keep redaction review-required without claiming perfect detection;
5. return one deterministic deeply frozen response-only preview with `persisted=false`,
   `reviewerStatus=review-required`, and `promotionStatus=proposed`;
6. create no GET/snapshot persistence path and clear browser-memory preview on reload;
7. perform zero state saves and create no candidate/run/artifact/approval/inbox/checkpoint/package/memory/
   skill/next-Mission record;
8. keep every persistence, promotion, provider, source, Git, release, scheduler, next-Mission, policy,
   bypass, and connector authority false;
9. fail stale, malformed, extra-field, missing-evidence, unsupported-ref/path/command, redaction,
   expiry, corrupt-source, or authority-widening input without mutation;
10. preserve DEC-088/091/094/097/100/103/106, standalone task, Council, Growth, and proposal behavior;
11. name rollback discard and focused runtime/API/UI/browser verification.

## Stop Conditions

Stop without implementation if:

- any required decision field is missing or conflicts with the plan;
- source evidence, retrospectiveSpec, redaction, expiry, path, command, or negative-evidence rules are
  widened or left ambiguous;
- implementation requires a schema migration, file-store write, durable candidate, snapshot field, or
  implicit hydration generation;
- implementation calls a provider, reads raw transcript/artifact/source bodies, or persists secrets;
- implementation opens candidate lifecycle, memory, skill, source, Git, release, scheduling,
  next-Mission, policy, bypass, or connector authority;
- focused runtime/API/UI, compatibility, README inventory, UI QA, or aggregate verification fails.

## Verification After A Later Decision

```bash
node scripts/smoke-ai-company-learning-candidate-preview-planning.mjs
node scripts/smoke-ai-company-learning-candidate-preview.mjs
node scripts/smoke-ui-slice-660.mjs
node scripts/smoke-ai-company-mission-task-close-out.mjs
node scripts/smoke-ui-slice-659.mjs
node scripts/ui_qa_status.mjs
node scripts/verification_status.mjs
```

The complete fielded approval shape above is consumed as `DEC-109`. Current schema v11 remains
authoritative; only the response-only runtime/API/UI slice is implemented, and every durable or
downstream authority listed above stays blocked.
