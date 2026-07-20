# AI Company LearningCandidate Review Outcome Plan

## Purpose

이 문서는 `DEC-112`가 보존한 schema-v12 immutable `LearningCandidate`를 operator가 명시적으로
검토하는 Phase 8 세 번째 vertical slice를 계획한다. Planning-only target은 exact candidate
identity/digest와 operator-owned review input에 결속된 append-only review event 하나다. Source
candidate는 수정하지 않으며 memory/skill promotion, provider generation, source/Git/release,
scheduling, next Mission, policy mutation, approval bypass, and connectors를 열지 않는다.

## Accepted Planning-Only Decision

| Field | Accepted value |
| --- | --- |
| `decisionId` | `operator-delegated-ai-company-learning-candidate-review-outcome-planning-001` |
| `decisionStatus` | `approve-ai-company-learning-candidate-review-outcome-planning-only` |
| `targetAuthority` | planning only for one deterministic local schema-v13 append-only LearningCandidateReview record from one exact source-current schema-v12 review-required LearningCandidate |
| `targetSurface` | docs plus the existing schema-v12 LearningCandidate record, read-only Deliverables evidence, and verification surfaces |
| `sourceEvidenceRefs` | `DEC-076`, `DEC-106`, `DEC-107`, `DEC-109`, `DEC-110`, `DEC-112`, `docs/48_ai-company-master-plan.md`, `docs/49_agent-runtime-contract.md`, `docs/50_council-operating-protocol.md`, `docs/51_ai-company-delivery-roadmap.md`, `docs/72_ai-company-learning-candidate-preview-plan.md`, `docs/74_ai-company-durable-learning-candidate-persistence-plan.md`, `src/runtime/contracts.js`, `src/runtime/file-store.js`, `src/runtime/learning-candidates.js`, `src/runtime/runtime-service.js`, `scripts/serve-ui-slice-01.mjs`, `ui/app.js` |
| `negativeEvidenceRefs` | current state is schema v12 with immutable review-required proposed LearningCandidate records only and no learningCandidateReview sequence map validator digest runtime method GET or review route UI action focused review smoke accepted rejected or changes-requested read model |
| `implementationPlanRefs` | this document |
| `rollbackRefs` | disable future review and GET entrypoints and UI controls, stop new review creation, preserve valid schema-v13 review records and every immutable source candidate and Mission evidence record, never downgrade delete or rewrite durable evidence, and rerun migration focused UI compatibility README inventory UI QA and aggregate verification |
| `focusedSmokeRefs` | planning smoke only in `scripts/smoke-ai-company-learning-candidate-review-outcome-planning.mjs`; schema/runtime/API/UI implementation smokes remain blocked |
| `aggregateVerificationRef` | `node scripts/verification_status.mjs` |
| `stillBlockedAuthorities` | schema-v13 implementation, LearningCandidateReview creation, candidate rewrite deletion supersession or duplicate review, expiry mutation automatic expiration quarantine or unquarantine, revised candidate creation, memory persistence or retrieval, skill creation or promotion, provider-assisted generation, raw transcript artifact-body source-content provider-payload environment credential or secret ingestion, Mission or task reopen, package mutation, standalone close-out, source mutation, runtime-agent commit push or release, automatic retry rework parallel dynamic autonomous or background scheduling, next-Mission creation, provider-backed WorkOrders, provider expansion, profile or policy mutation, approval bypass, external connectors |
| `approvalStatement` | The operator approves planning only for one exact append-only LearningCandidateReview record from one current schema-v12 durable candidate. This does not approve schema/runtime/API/UI implementation, candidate mutation, expiry or quarantine behavior, memory, skills, providers, raw evidence, source mutation, Git, release, scheduling, next-Mission creation, policy mutation, approval bypass, or connectors. |

## Current Baseline Evidence

- Current runtime state is schema v12 with one immutable LearningCandidate sequence/map.
- A candidate exists only after exact DEC-109 recomputation from one completed Mission terminal tuple
  plus operator-owned `retrospectiveSpec`.
- Durable records remain `persisted=true`, `redactionStatus=review-required`,
  `reviewerStatus=review-required`, and `promotionStatus=proposed`.
- Candidate and record digests bind immutable normalized evidence. Exact persistence replay is
  read-only and a divergent candidate for the same Mission conflicts.
- GET and Deliverables hydration expose durable evidence only. No candidate review decision,
  review event, derived review outcome, memory item, skill, provider call, source mutation, Git action,
  scheduler, or next Mission exists.

## Architecture Choice

Review is a separate append-only fact, not a rewrite of immutable candidate evidence:

```text
schema-v12 review-required LearningCandidate
-> require exact candidate identity, preview/candidate/record digests, and unexpired review window
-> require one exact operator reviewSpec and decision
-> append one immutable LearningCandidateReview record
-> derive accepted, rejected, or changes-requested presentation from the event
-> stop before candidate revision, expiry/quarantine, memory/skill promotion, or downstream action
```

The source candidate keeps `reviewerStatus=review-required` and `promotionStatus=proposed` in stored
evidence. A read model may expose the append-only decision separately, but it must not rewrite the
candidate, infer promotion authority, or create a replacement candidate.

## Entry Gate

Future review implementation must require all of the following in one loaded state:

1. exact `learningCandidateId` exists in strict schema-v12 state;
2. candidate remains source-current against its completed Mission, MissionCloseOut, package,
   acceptance, plan, terminal checkpoint, review, QA, approval, and Council evidence;
3. candidate `previewId`, `candidateDigest`, and `recordDigest` match current strict validation;
4. candidate expiry timestamp is still later than the explicit review time;
5. exact request includes candidate identity/digests, one allowed decision, normalized rationale,
   source-contained evidence refs, and `reviewerAcknowledgement=human-reviewed`;
6. decision is exactly one of `accept`, `reject`, or `changes-requested`;
7. no review already exists for the candidate, except exact idempotent replay;
8. every review authority field outside recording the named outcome remains false.

Migration, boot, GET, snapshot, hydration, rendering, candidate preview/persistence, broad approval,
or expiry passage never creates review evidence.

## Planned State Schema v13

The later complete fielded decision may authorize only this additive migration:

```text
schemaVersion = 13
sequences.learningCandidateReview
learningCandidateReviews{}
```

Migration requirements:

- Preserve every valid schema-v12 domain value and immutable candidate record.
- Add only an empty sequence and map; migration creates no review.
- Keep older domain migration predicates tied to their introduction schema versions.
- Reject unknown future schemas and partial or semantically invalid schema-v13 records.
- Save migration and review append through one atomic temporary-file/rename boundary.
- Preserve valid schema-v13 evidence during rollback without downgrade, deletion, or source rewrite.

## LearningCandidateReview Contract

```text
id
projectId
sourceMissionId
learningCandidateId
previewId
candidateDigest
candidateRecordDigest
decision: accepted | rejected | changes-requested
rationale
evidenceRefs[]
reviewerAcknowledgement: human-reviewed
authoritySummary
reviewDigest
createdAt
```

Contract rules:

- The record is immutable and append-only.
- At most one review exists per LearningCandidate.
- Request values `accept`, `reject`, and `changes-requested` normalize to the stored decision values
  `accepted`, `rejected`, and `changes-requested`.
- Rationale is bounded operator-authored summary text. Evidence refs must be a non-empty subset of the
  candidate's `sourceEvidenceRefs`.
- The record excludes raw transcript, artifact body, source content, provider payload, prompt,
  environment, credential, secret, chain-of-thought, and generated replacement lesson text.
- Accepted evidence does not authorize memory or skill promotion. Rejected evidence does not delete
  or quarantine the candidate. Changes requested does not create a revision or rework loop.

## Digest And Idempotency Binding

`reviewDigest` is SHA-256 over a canonical key-sorted payload containing candidate/source identity,
exact preview/candidate/record digests, normalized decision, rationale, evidence refs,
`reviewerAcknowledgement`, and closed authority. Record id and timestamp are excluded.

The exact request tuple is:

```text
learningCandidateId
previewId
candidateDigest
candidateRecordDigest
decision
rationale
evidenceRefs[]
reviewerAcknowledgement=human-reviewed
```

- Exact replay returns the existing event with `idempotent=true` and performs no write.
- Any differing tuple for an already reviewed candidate conflicts without mutation.
- Stale, expired, malformed, unsupported evidence, credential-marked, or authority-widening input
  fails before migration or append and leaves serialized state unchanged.

## Runtime And API Plan

Planned runtime methods:

```text
getLearningCandidateReview(learningCandidateId)
reviewLearningCandidate(input)
```

Planned routes:

```text
GET  /api/learning-candidates/:learningCandidateId/review
POST /api/learning-candidates/:learningCandidateId/review
```

The POST route accepts bounded exact JSON only. It appends one review event and transitions no
Mission, task, plan, WorkOrder, checkpoint, package, acceptance, close-out, run, artifact, approval,
inbox, candidate, memory, skill, provider, source, Git, release, schedule, policy, or connector state.

## UI Boundary

- Keep durable LearningCandidate evidence read-only.
- Add one explicit review form with a decision control, bounded rationale, evidence-ref selection,
  and visible `human-reviewed` acknowledgement.
- Show review id, decision, digest, timestamp, and immutable candidate digest after reload.
- Make accepted evidence visibly separate from promotion or memory authority.
- Expose no candidate rewrite/delete/supersession, expiry/quarantine, revision generation,
  memory/skill promotion, provider, raw evidence, source, Git, release, schedule, next-Mission,
  policy, bypass, or connector control.
- Long ids, digests, rationale, and evidence refs must fit desktop and mobile.

## Compatibility And Migration

- Preserve DEC-109 response-only preview and DEC-112 durable persistence routes and behavior.
- Keep the schema-v12 candidate immutable and digest-stable.
- Preserve standalone task, Council, Growth Evidence Ledger, proposal, and memory-readiness paths.
- Create no approval or Decision Inbox item; the exact POST request is the explicit operator review.
- A review event cannot be consumed as memory, skill, provider, source, Git, release, schedule,
  policy, or next-Mission authority.

## Focused Verification Plan

Future `scripts/smoke-ai-company-learning-candidate-review-outcome.mjs` must prove:

- atomic v12-to-v13 migration and zero review creation on migration/read/boot/snapshot/render;
- exact candidate identity, `previewId`, `candidateDigest`, `recordDigest`, and review input binding
  before write;
- one immutable normalized accepted, rejected, or changes-requested event with canonical digest;
- source candidate and every terminal Mission evidence record remain byte-stable;
- exact replay idempotency and divergent same-candidate conflict;
- stale, expired, malformed, extra/missing-field, unsupported-ref, credential, raw-body, corrupt
  source, digest, and authority-widening refusal with unchanged bytes;
- no candidate revision/delete/quarantine/promotion, memory, skill, provider, source, Git, release,
  scheduling, next-Mission, policy, bypass, or connector effect;
- DEC-109/112 and standalone/Council/Growth/proposal compatibility.

Future `scripts/smoke-ui-slice-662.mjs` must prove exact-gated review, read-only candidate and review
hydration, all three decisions, safe stale/expired/API failures, idempotent replay, absent downstream
controls, refresh behavior, and desktop/mobile fit.

## Rollback Plan

1. Disable future review GET/POST routes and review UI controls.
2. Stop new review creation; do not synthesize replacement outcomes.
3. Preserve valid schema-v13 review events and every source candidate/Mission evidence record.
4. Never downgrade schema, delete or rewrite evidence, reopen Mission/task, or mutate candidate status.
5. Keep DEC-109 preview and DEC-112 durable candidate inspection available.
6. Keep memory/skill/provider/source/Git/release/scheduling/next-Mission/policy authority blocked.
7. Rerun migration, focused runtime/UI, compatibility, README/inventory, UI QA, and aggregate gates.

## Implementation Target Surface

The later complete fielded decision may open only:

```text
src/runtime/contracts.js
src/runtime/file-store.js
src/runtime/assertions.js
src/runtime/learning-candidate-reviews.js
src/runtime/runtime-service.js
scripts/serve-ui-slice-01.mjs
ui/council-signals.js
ui/app.js
ui/styles.css
scripts/smoke-ai-company-learning-candidate-review-outcome.mjs
scripts/smoke-ui-slice-662.mjs
scripts/verification_status.mjs
scripts/ui_qa_status.mjs
```

## Implementation Sequence

1. Add schema-v13 sequence/map migration and strict append-only review validator.
2. Add pure review normalization, canonical digest, and exact source binding helper.
3. Implement one idempotent review append path over a single loaded state.
4. Add bounded exact GET/POST routes.
5. Add explicit review form and read-only decision evidence.
6. Add focused migration/runtime/API/UI/compatibility smokes.
7. Sync docs, README, inventory, task ledger, UI QA, aggregate verification, review, commit, and push.

## Acceptance Criteria

1. Migration creates no review and preserves all schema-v12 evidence.
2. Only one exact current unexpired candidate may receive one explicit review outcome.
3. Candidate content, status, and digest never change.
4. Exact replay is idempotent; stale or divergent requests never write.
5. Accepted, rejected, and changes-requested evidence grants no downstream authority.
6. No other runtime/source/provider/memory/skill/Git/release/scheduling/policy effect occurs.
7. DEC-109/112 and existing standalone/Council/Growth/proposal behavior is unchanged.
8. Focused runtime/API/UI, compatibility, README/inventory, UI QA, and aggregate gates pass.

## Exclusions

- candidate rewrite, deletion, supersession, duplicate review, automatic revision, or rework
- expiry mutation, automatic expiration, quarantine, unquarantine, or replacement candidate
- memory persistence/retrieval, skill creation/promotion, profile/policy learning
- provider-assisted generation or raw transcript/artifact/source/provider/env/secret ingestion
- Mission/task reopen, package mutation, standalone close-out, source mutation, commit, push, release
- automatic retry/rework, scheduling, next-Mission creation, provider expansion, approval bypass,
  or external connectors

## Planning Status

- Planning-only authority: accepted as `DEC-113`.
- Complete fielded implementation handoff: documented as `DEC-114`.
- Implementation authority: accepted as `DEC-115`.
- Current runtime is schema v13 with one exact append-only LearningCandidateReview path.
- Candidate mutation, expiry/quarantine, memory/skill, provider, source/Git/release, scheduling,
  next-Mission, policy, bypass, and connector authority remain blocked.

## Verification

```bash
node scripts/smoke-ai-company-learning-candidate-review-outcome-planning.mjs
node scripts/smoke-ai-company-learning-candidate-review-outcome.mjs
node scripts/smoke-ui-slice-662.mjs
node scripts/smoke-ai-company-durable-learning-candidate-planning.mjs
node scripts/smoke-ai-company-durable-learning-candidate.mjs
node scripts/smoke-ui-slice-661.mjs
node scripts/smoke-readme-scope-evidence.mjs
node scripts/smoke-completion-gate-inventory-current-evidence.mjs
node scripts/ui_qa_status.mjs
node scripts/verification_status.mjs
```
