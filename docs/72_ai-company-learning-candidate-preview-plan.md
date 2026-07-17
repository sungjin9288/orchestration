# AI Company LearningCandidate Preview Plan

## Purpose

이 문서는 `DEC-106`으로 완료된 one AI Company Mission의 immutable close-out evidence에서 one
response-only `LearningCandidate` preview를 만드는 Phase 8 첫 vertical slice를 정의한다. 이
계획은 operator-owned `retrospectiveSpec`을 exact source evidence에 결속하고 deterministic digest를
계산하는 데까지만 허용한다. Schema migration, durable candidate record, memory persistence, skill
promotion, provider generation, source mutation, commit, push, release, 또는 next-Mission 생성은 열지
않는다.

## Accepted Planning-Only Decision

| Field | Accepted value |
| --- | --- |
| `decisionId` | `operator-delegated-ai-company-learning-candidate-preview-planning-001` |
| `decisionStatus` | `approve-ai-company-learning-candidate-preview-planning-only` |
| `targetAuthority` | planning only for one deterministic response-only LearningCandidate preview from one exact source-current schema-v11 completed Mission and immutable MissionCloseOut evidence tuple plus one operator-owned retrospectiveSpec |
| `targetSurface` | docs plus the existing schema-v11 Mission, linked control task, ExecutionPlan, WorkOrders, WorkflowCheckpoint, DeliveryPackage, DeliveryPackageAcceptance, MissionCloseOut, Council/review/QA evidence, and read-only Deliverables surface |
| `sourceEvidenceRefs` | `DEC-076`, `DEC-088`, `DEC-091`, `DEC-094`, `DEC-097`, `DEC-100`, `DEC-103`, `DEC-104`, `DEC-106`, `docs/48_ai-company-master-plan.md`, `docs/49_agent-runtime-contract.md`, `docs/50_council-operating-protocol.md`, `docs/51_ai-company-delivery-roadmap.md`, `docs/70_ai-company-mission-task-close-out-plan.md`, `src/runtime/contracts.js`, `src/runtime/mission-close-outs.js`, `src/runtime/runtime-service.js`, `scripts/serve-ui-slice-01.mjs`, `ui/app.js` |
| `negativeEvidenceRefs` | current state is schema v11 with no LearningCandidate type, compiler, preview digest, retrospectiveSpec validator, route, UI preview, focused runtime smoke, or UI smoke; existing Growth Evidence Ledger and proposal flows are separate evidence surfaces and grant no AI Company learning authority |
| `implementationPlanRefs` | this document |
| `rollbackRefs` | disable the future response-only preview route and UI action, discard response and browser-memory previews, preserve every MissionCloseOut and source evidence record, keep schema v11 unchanged, and rerun focused compatibility README inventory UI QA and aggregate verification |
| `focusedSmokeRefs` | planning smoke only in `scripts/smoke-ai-company-learning-candidate-preview-planning.mjs`; runtime/API/UI implementation smokes remain blocked |
| `aggregateVerificationRef` | `node scripts/verification_status.mjs` |
| `stillBlockedAuthorities` | LearningCandidate preview implementation, schema-v12 migration, durable candidate record creation persistence acceptance rejection expiry mutation quarantine deletion or promotion, memory persistence, skill promotion, provider-assisted retrospective generation, raw transcript or artifact-body ingestion, Mission or task reopen, package rejection changes-requested supersession or deletion, standalone close-out, commit, push, release, automatic retry rework scheduling or next-Mission creation, provider-backed WorkOrders, provider expansion, profile or policy mutation, approval bypass, external connectors |
| `approvalStatement` | The operator approves planning only for one deterministic response-only LearningCandidate preview from exact completed Mission evidence and one exact operator-owned retrospectiveSpec. This does not approve runtime/API/UI implementation, schema migration, durable records, memory, skills, providers, source mutation, Git, release, scheduling, next-Mission creation, policy mutation, approval bypass, or connectors. |

## Current Baseline Evidence

- Current runtime is schema v11 with one immutable MissionCloseOut record bound to an exact accepted
  package/acceptance/plan/checkpoint tuple.
- The linked control task is `Done`, Mission is `completed`, required Builder/Reviewer/QA WorkOrders
  are completed, review passed, and the terminal WorkflowCheckpoint remains `delivery-ready`.
- DeliveryPackage and DeliveryPackageAcceptance stay immutable; MissionCloseOut is the dedicated
  terminal fact and does not invoke standalone commit/release close-out.
- `docs/48_ai-company-master-plan.md` and `docs/49_agent-runtime-contract.md` define learning as a
  reviewed promotion: retrospective output first becomes a LearningCandidate, while memory and skill
  promotion require separate authority.
- The current source tree contains no `LearningCandidate`, `learningCandidate`, or retrospective
  runtime/API/UI implementation. Read, boot, hydration, and Mission close-out create no learning object.
- Existing Growth Evidence Ledger and proposal-draft flows concern product-improvement evidence. They
  must not be reused as hidden AI Company Mission-learning persistence or approval authority.

## Architecture Choice

The first learning slice is a pure evidence-bound preview:

```text
schema-v11 completed Mission + strict MissionCloseOut
-> resolve immutable package/acceptance/plan/checkpoint/WorkOrder/review/QA evidence
-> accept one exact operator-owned retrospectiveSpec
-> validate applicability and negative-evidence refs against that closed source set
-> reject raw transcript, artifact-body, provider payload, secret, or unbounded source content
-> compute one canonical LearningCandidate preview and digest
-> return response-only evidence with persisted=false and every promotion authority=false
-> stop before schema migration, durable record, memory, skill, provider, source, Git, or next-Mission action
```

The runtime does not invent lesson text that is absent from source evidence and does not call a model.
The operator supplies the bounded retrospective statement; deterministic code validates identities,
source refs, paths, verification commands, redaction posture, expiry, and closed authority before
rendering a deeply frozen preview.

## Entry Gate

Future preview generation must require all of the following from one current snapshot:

1. exact Mission exists, is `completed`, and points to one linked control task;
2. exact linked task is `Done`, belongs to the Mission, has passed review, and has no active gate;
3. exact ExecutionPlan is `delivery-ready`, source-current, and owns that control task;
4. required Builder, Reviewer, and QA WorkOrders are all `completed` with exact run/artifact refs;
5. exact terminal WorkflowCheckpoint remains strict `delivery-ready` evidence;
6. exact DeliveryPackage remains immutable `review-required`, has no unresolved blocking item, and
   matches the current recomputed preview/source/package/checkpoint tuple;
7. exact DeliveryPackageAcceptance is `accepted` and matches that package;
8. exact MissionCloseOut matches the Mission/task/plan/package/acceptance/checkpoint tuple and current
   terminal states;
9. `retrospectiveSpec` has exact keys, bounded operator-authored summary fields, a source-contained
   applicability scope, at least one evidence-bound negative-evidence statement, and a valid expiry;
10. every referenced path, verification command, and evidence id is already present in the closed
    plan/WorkOrder/review/QA/package/Council evidence set;
11. request and output authority explicitly keep persistence, promotion, provider, source, Git,
    release, scheduling, next-Mission, policy, bypass, and connector actions false.

Any mismatch fails without state mutation. Boot, GET snapshot, Deliverables hydration, Mission close-out,
and ordinary rendering never create or recompute a preview implicitly.

## Operator RetrospectiveSpec Contract

```text
retrospectiveSpec
- lesson
- applicabilitySummary
- targetPathAllowlist[]
- verificationCommands[]
- negativeEvidence[]
  - sourceEvidenceRef
  - statement
- expiresAt
- redactionAcknowledgement: source-summary-only
```

Contract rules:

- Exact keys only; strings are trimmed, non-empty, bounded, and control-character free.
- `targetPathAllowlist` is a non-empty ordered subset of the ExecutionPlan target paths and retains
  repo-relative path rules. No absolute, parent-traversal, symlink target, or new path is accepted.
- `verificationCommands` is a non-empty ordered subset of the approved WorkOrder/QA command set. It
  does not authorize execution and cannot introduce shell syntax or a new executable.
- `negativeEvidence` is non-empty. Every item points to existing Council conflict/dissent, reviewer
  finding or accepted-risk, QA, package unresolved/accepted-risk, or terminal close-out evidence.
  A source-backed no-blocking-negative-evidence statement may be used only when the referenced review
  or package evidence explicitly records that absence; absence is not inferred from a missing field.
- `expiresAt` is a valid ISO timestamp after MissionCloseOut creation. Expiry is review metadata only;
  no timer, scheduler, background mutation, or automatic deletion is introduced.
- `source-summary-only` acknowledges that the spec contains operator-authored summaries and existing
  ids/paths/commands only. The API accepts no raw transcript, source-file, artifact-body, prompt,
  provider-payload, environment, credential, or arbitrary-filesystem-content field. A conservative
  guard rejects obvious credential labels, token prefixes, and private-key markers in summary text,
  but this is not proof that arbitrary operator text is secret-free; the preview therefore keeps
  `redactionStatus=review-required` until a later human review decision.

## Planned Response-Only Contract

```text
LearningCandidatePreview
- previewId
- persisted: false
- sourceMissionId
- sourceMissionCloseOutId
- sourceExecutionPlanId
- sourceDeliveryPackageId
- sourceDeliveryPackageAcceptanceId
- sourceTerminalCheckpointId
- sourceEvidenceRefs[]
- lesson
- applicability
  - summary
  - projectId
  - targetPathAllowlist[]
  - verificationCommands[]
- negativeEvidence[]
- redactionMode: source-summary-only
- redactionStatus: review-required
- expiry
  - expiresAt
  - status: review-required
- reviewerStatus: review-required
- promotionStatus: proposed
- authoritySummary
- candidateDigest
```

`authoritySummary` fixes all of these to false: `persistCandidate`, `acceptCandidate`, `promoteMemory`,
`promoteSkill`, `callProvider`, `readRawTranscript`, `mutateSource`, `commit`, `push`, `release`,
`schedule`, `createNextMission`, `mutatePolicy`, `bypassApproval`, and `callConnector`.

The preview is not a schema-v11 state object. It has no durable candidate id, createdAt, acceptance,
review outcome, quarantine disposition, memory key, skill id, or mutable lifecycle refs.

## Digest And Idempotency Binding

`candidateDigest` is SHA-256 over a canonical key-sorted payload containing the exact MissionCloseOut
and source tuple, normalized retrospectiveSpec, ordered source evidence refs, fixed preview statuses,
and closed authority summary. `previewId` is derived from that digest. Current wall-clock time and
response-local object identity are excluded.

- Exact current source plus exact normalized spec returns the same preview id and digest.
- Repeated preview requests perform no write and create no durable object.
- Any stale source tuple, changed spec, missing evidence, invalid redaction posture, or unsupported
  authority fails or produces a distinct preview without mutating prior evidence.
- Deep freeze protects response-local objects from accidental caller mutation but is not claimed as
  persistence or cross-process identity.

## Runtime And API Plan

Planned pure compiler:

```text
compileLearningCandidatePreview(input)
```

Planned runtime method:

```text
previewMissionLearningCandidate(input)
```

Planned route:

```text
POST /api/missions/:missionId/learning-candidate-preview
```

The POST route accepts only the exact Mission/source tuple and retrospectiveSpec. Transport and runtime
both validate exact keys. The runtime loads one current snapshot, resolves strict terminal evidence,
calls the pure compiler, and returns the preview. It never calls `saveState`, file-store mutation,
provider adapters, execution coordinators, Git, memory, skill, scheduler, policy, or connector code.

No GET route or snapshot field is added in this slice because a response-only preview cannot be
rehydrated as durable evidence. Reload clears the browser-memory preview and leaves source evidence
unchanged.

## UI Boundary

- Add one explicit `학습 후보 미리보기` form/action under terminal Deliverables evidence.
- Require the operator to provide every retrospectiveSpec field and display exact source ids/digests.
- Render preview id/digest, source refs, lesson, applicability, negative evidence, redaction status,
  expiry, reviewer status, and `persisted:false` from the response only.
- Label the preview as review-required and non-persistent; reload must not imply saved learning.
- Expose no accept/reject/expire/quarantine/delete, memory/skill promotion, provider generation, raw
  evidence expansion, source mutation, commit, push, release, retry, schedule, next-Mission, policy,
  bypass, or connector action.
- Long ids, paths, commands, and summaries must fit desktop and mobile without horizontal overflow.

## Compatibility

- Keep `STATE_SCHEMA_VERSION = 11`; do not edit empty state, file-store normalization, schema
  migration, MissionCloseOut, package, acceptance, checkpoint, plan, WorkOrder, task, or Mission records.
- Preserve DEC-088/091/094/097/100/103/106 routes, UI actions, idempotency, and strict loaders.
- Preserve standalone task commit/release close-out and every Growth Evidence Ledger/proposal flow.
- Preserve direct runtime consumers that never call the new method.
- Create no run, artifact, approval, Decision Inbox item, checkpoint, package, candidate, memory, skill,
  or next Mission.

## Focused Verification Plan

Future implementation smoke must prove:

- exact request keys at transport and runtime boundaries;
- strict source-current completed Mission/task/close-out/package/acceptance/plan/checkpoint/WorkOrder/
  review/QA tuple before compilation;
- exact retrospectiveSpec shape, bounded text, path/command subset, negative-evidence provenance,
  expiry, and redaction acknowledgement validation;
- canonical digest, stable preview id, deep freeze, exact replay, and changed-input distinction;
- zero `saveState` calls and zero state-byte changes on success, replay, invalid input, hydration, or reload;
- no candidate/schema/run/artifact/approval/inbox/checkpoint/package/memory/skill record creation;
- stale, malformed, extra-field, missing-evidence, unsupported path/command/ref, obvious high-risk
  credential marker, raw-body field, expired/invalid expiry, corrupt source, and authority-widening
  refusal;
- DEC-088/091/094/097/100/103/106, standalone task, Council, Growth, and proposal compatibility;
- no provider, raw transcript, source mutation, Git, release, scheduler, next-Mission, policy, bypass,
  or connector effect;
- response-only UI rendering, explicit non-persistence, safe failure, reload clearing, absent downstream
  controls, and desktop/mobile fit.

## Rollback Plan

1. Disable the future POST route and Deliverables preview form/action.
2. Discard response-local and browser-memory previews; there is no durable candidate to migrate.
3. Preserve schema-v11 MissionCloseOut and every source Mission/task/plan/WorkOrder/checkpoint/package/
   acceptance/run/artifact/review/QA/Council record unchanged.
4. Keep Mission completion and standalone close-out behavior unchanged; never synthesize reopen.
5. Leave durable learning, memory, skill, providers, source, Git, release, scheduling, next-Mission,
   policy, bypass, and connectors blocked.
6. Rerun focused runtime/UI compatibility, README inventory, UI QA, and aggregate verification.

## Implementation Target Surface

```text
src/runtime/learning-candidate-preview.js
src/runtime/runtime-service.js
scripts/serve-ui-slice-01.mjs
ui/council-signals.js
ui/app.js
ui/styles.css
scripts/smoke-ai-company-learning-candidate-preview.mjs
scripts/smoke-ui-slice-660.mjs
scripts/verification_status.mjs
scripts/ui_qa_status.mjs
```

## Implementation Sequence

1. Add one pure exact-field retrospectiveSpec validator and canonical preview compiler.
2. Resolve the strict schema-v11 terminal source tuple in one read-only runtime method.
3. Add the exact POST route with transport and runtime key allowlists and no save path.
4. Add a terminal Deliverables form and response-only review-required preview.
5. Add focused runtime/API/UI smokes for determinism, no-write behavior, redaction, and compatibility.
6. Synchronize docs, README, inventory, task ledger, UI QA, and aggregate verification.
7. Perform adversarial authority/redaction/no-write review before operator-side commit and push.

## Acceptance Criteria

1. Schema remains v11 and no persisted state value changes.
2. Only one exact current terminal Mission evidence tuple plus exact retrospectiveSpec produces a preview.
3. The preview is deterministic, deeply frozen, response-only, review-required, and `persisted:false`.
4. Applicability, paths, commands, and negative evidence remain source-contained.
5. No raw transcript/artifact/source/provider field is accepted, obvious credential markers fail
   closed, and redaction remains explicitly review-required rather than claiming perfect detection.
6. No durable candidate, memory, skill, provider, source, Git, release, scheduler, next-Mission, policy,
   bypass, or connector authority opens.
7. Existing Mission close-out, standalone task, Council, Growth, and proposal behavior is unchanged.
8. Focused runtime/API/UI, compatibility, UI QA, README inventory, and aggregate verification pass.

## Exclusions

- schema-v12 migration or durable LearningCandidate storage
- candidate acceptance, rejection, expiry mutation, quarantine, supersession, deletion, or promotion
- memory persistence, cross-Mission retrieval, skill generation, or profile/policy learning
- provider-assisted retrospective drafting or raw transcript/artifact/source ingestion
- Mission/task reopen, package rejection/changes-requested, automatic rework, or next-Mission creation
- commit, push, release, merge, publish, standalone close-out, or Git mutation
- retry scheduling, parallel/dynamic/autonomous/background execution, provider expansion, approval bypass,
  or external connectors

## Planning Status

- Planning-only authority: accepted as `DEC-107`.
- Complete fielded implementation handoff: documented as `DEC-108`.
- Runtime/API/UI implementation: blocked pending the complete fielded decision in
  `docs/73_ai-company-learning-candidate-preview-implementation-decision-handoff.md`.
- Schema-v12, durable candidate lifecycle, memory/skill promotion, providers, source/Git/release,
  scheduling, next-Mission, policy, bypass, and connector authority remain blocked.

## Verification

```bash
node scripts/smoke-ai-company-learning-candidate-preview-planning.mjs
node scripts/smoke-ai-company-mission-task-close-out-planning.mjs
node scripts/smoke-ai-company-mission-task-close-out.mjs
node scripts/smoke-ui-slice-659.mjs
node scripts/smoke-readme-scope-evidence.mjs
node scripts/smoke-completion-gate-inventory-current-evidence.mjs
node scripts/ui_qa_status.mjs
node scripts/verification_status.mjs
```

Current schema v11 and `DEC-106` terminal evidence are read-only planning inputs. No LearningCandidate
preview implementation, durable learning, memory/skill promotion, provider call, source/Git/release
action, scheduling, next-Mission creation, policy mutation, approval bypass, or connector is authorized.
