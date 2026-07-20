# AI Company MemoryCandidate Preview Plan

## Purpose

이 문서는 `DEC-115`가 만든 accepted `LearningCandidateReview`를 durable memory나 skill로 바로
승격하지 않고, operator가 다음 storage decision 전에 검토할 수 있는 response-only
`MemoryCandidate` preview로 변환하는 Phase 8 네 번째 vertical slice를 계획한다.

Planning-only target은 exact schema-v13 candidate/review evidence와 operator-owned `memorySpec`에
결속된 deterministic preview 하나다. Runtime schema와 source candidate/review는 변경하지 않으며
memory persistence, cross-workspace retrieval, skill promotion, provider generation, source
application, Git/release, scheduling, next Mission, policy mutation, approval bypass, and connectors를
열지 않는다.

## Accepted Planning-Only Decision

| Field | Accepted value |
| --- | --- |
| `decisionId` | `operator-delegated-ai-company-memory-candidate-preview-planning-001` |
| `decisionStatus` | `approve-ai-company-memory-candidate-preview-planning-only` |
| `targetAuthority` | planning only for one deterministic response-only AI Company MemoryCandidate preview from one exact source-current accepted schema-v13 LearningCandidateReview and immutable LearningCandidate |
| `targetSurface` | docs plus the existing schema-v13 LearningCandidate and LearningCandidateReview read-only Deliverables evidence, memory-readiness spec, and verification surfaces |
| `sourceEvidenceRefs` | `DEC-049`, `DEC-051`, `DEC-076`, `DEC-106`, `DEC-109`, `DEC-112`, `DEC-115`, `docs/25_memory-readiness-decision-spec.md`, `docs/48_ai-company-master-plan.md`, `docs/49_agent-runtime-contract.md`, `docs/50_council-operating-protocol.md`, `docs/51_ai-company-delivery-roadmap.md`, `docs/72_ai-company-learning-candidate-preview-plan.md`, `docs/74_ai-company-durable-learning-candidate-persistence-plan.md`, `docs/76_ai-company-learning-candidate-review-outcome-plan.md`, `src/runtime/contracts.js`, `src/runtime/learning-candidates.js`, `src/runtime/learning-candidate-reviews.js`, `src/runtime/runtime-service.js`, `scripts/serve-ui-slice-01.mjs`, `ui/app.js` |
| `negativeEvidenceRefs` | current state is schema v13 with immutable LearningCandidate and append-only LearningCandidateReview records but no MemoryCandidate preview module contract digest runtime method route form focused smoke storage location lifecycle approval export deletion skill promotion or memory application authority |
| `implementationPlanRefs` | this document |
| `rollbackRefs` | disable the future response-only preview entrypoint and UI form, discard browser-memory previews, preserve schema-v13 candidate review and Mission evidence, create no migration or durable memory rollback, and rerun focused compatibility README inventory UI QA and aggregate verification |
| `focusedSmokeRefs` | planning smoke only in `scripts/smoke-ai-company-memory-candidate-preview-planning.mjs`; runtime/API/UI implementation smokes remain blocked |
| `aggregateVerificationRef` | `node scripts/verification_status.mjs` |
| `stillBlockedAuthorities` | MemoryCandidate preview implementation, schema-v14 migration, durable memory item creation persistence retrieval import apply export deletion expiry refresh or cross-workspace use, skill creation or promotion, LearningCandidate rewrite revision deletion supersession expiry mutation quarantine or rework, provider-assisted generation, raw transcript artifact-body source-content provider-payload environment credential or secret ingestion, source mutation, runtime-agent commit push or release, automatic retry rework parallel dynamic autonomous or background scheduling, next-Mission creation, profile or policy mutation, approval bypass, external connectors |
| `approvalStatement` | The operator approves planning only for one response-only MemoryCandidate preview from one exact accepted schema-v13 LearningCandidateReview. This does not approve runtime/API/UI implementation, schema migration, durable memory, retrieval, import, apply, export, deletion, skill promotion, candidate mutation, providers, raw evidence, source mutation, Git, release, scheduling, next-Mission creation, policy mutation, approval bypass, or connectors. |

## Current Baseline Evidence

- Current runtime state is schema v13 with immutable `LearningCandidate` records and separate
  append-only `LearningCandidateReview` events.
- Only `accepted`, `rejected`, or `changes-requested` review evidence exists. The source candidate
  remains `review-required` and `proposed`; no review rewrites it.
- Accepted review is evidence that the candidate was considered, not memory storage approval.
- `docs/25_memory-readiness-decision-spec.md` already separates readiness review, storage approval,
  export approval, deletion approval, and skill-promotion review.
- No MemoryCandidate preview, durable memory record, storage location, memory lifecycle, retrieval,
  import/apply, export/delete action, provider call, source mutation, or skill promotion exists.

## Architecture Choice

The next slice should remain response-only:

```text
schema-v13 immutable LearningCandidate
+ one append-only LearningCandidateReview(decision=accepted)
-> require exact source-current candidate and review digests
-> require one exact operator-owned memorySpec
-> validate project scope, applicability, evidence, redaction, review, and expiry inputs
-> return one deeply frozen persisted=false MemoryCandidate preview
-> keep preview only in the response and browser memory
-> stop before durable memory, retrieval, import/apply, export/delete, skill promotion, or source action
```

`rejected` and `changes-requested` reviews are terminal evidence for this slice. They must fail the
preview gate without creating revision, quarantine, rework, replacement candidate, or memory
proposal.

## Entry Gate

Future implementation must require all of the following from one strict schema-v13 read:

1. exact `learningCandidateId` and `learningCandidateReviewId` exist;
2. candidate and review remain source-current against the completed Mission evidence closure;
3. exact `previewId`, `candidateDigest`, `candidateRecordDigest`, and `reviewDigest` match;
4. review decision is exactly `accepted`;
5. candidate expiry is later than the explicit preview evaluation time;
6. request includes one exact bounded operator-owned `memorySpec`;
7. workspace scope equals the candidate project and cannot widen to another project or global scope;
8. target paths and verification commands remain subsets of candidate applicability;
9. positive, negative, redaction, and review refs are non-empty and source-contained;
10. every authority field remains false outside response-only preview generation.

Boot, GET, snapshot, hydration, rendering, accepted review creation, broad approval, or repeated
evidence never creates a MemoryCandidate preview.

## MemoryCandidate Preview Contract

```text
id
persisted: false
status: review-ready
projectId
sourceMissionId
sourceLearningCandidateId
sourceLearningCandidateReviewId
previewId
candidateDigest
candidateRecordDigest
reviewDigest
summary
applicability
workspaceScope
sourceRefs[]
evidenceRefs[]
negativeEvidenceRefs[]
redactionRefs[]
reviewRefs[]
expiresAt
redactionStatus: review-required
storageStatus: not-approved
promotionStatus: blocked
blockedActions[]
nonPersistenceStatement: readiness-only-not-durable-memory
previewDigest
evaluatedAt
```

Contract rules:

- The preview is deterministic, deeply frozen, response-only, and never assigned a durable memory id.
- `status=review-ready` means only that the preview can feed a later storage decision.
- `sourceRefs` bind the immutable candidate, accepted review, Mission close-out, package, QA, and
  approval evidence without including raw content.
- `evidenceRefs`, `negativeEvidenceRefs`, and `redactionRefs` must be non-empty source-contained
  subsets. Negative evidence cannot be dropped.
- `workspaceScope` is exactly one project. Global and cross-workspace scopes are invalid.
- Applicability paths and verification commands remain within the source candidate allowlists.
- The preview excludes raw transcript, artifact body, source content, provider payload, prompt,
  environment, credential, secret, personal profile, and chain-of-thought content.
- No field claims that redaction is complete; `redactionStatus` remains `review-required`.

## Operator MemorySpec

The exact request-owned `memorySpec` should contain:

```text
summary
workspaceScope.projectId
applicability.summary
applicability.targetPathAllowlist[]
applicability.verificationCommands[]
evidenceRefs[]
negativeEvidenceRefs[]
redactionRefs[]
reviewRefs[]
expiresAt
redactionAcknowledgement=source-summary-only
nonPersistenceStatement=readiness-only-not-durable-memory
```

All text is bounded and control-character/obvious-credential-marker checked. The runtime must not
invent summary, scope, applicability, evidence, redaction, review, or expiry fields from model output.

## Digest And Idempotency Binding

`previewDigest` should be SHA-256 over the canonical key-sorted preview payload excluding only the
derived `id`. The id is derived from the digest.

The exact request tuple is:

```text
learningCandidateId
learningCandidateReviewId
previewId
candidateDigest
candidateRecordDigest
reviewDigest
evaluatedAt
memorySpec
```

- Exact replay returns the same preview and digest without writes.
- Any stale candidate/review/source tuple fails without output or mutation.
- Rejected or changes-requested review, expired candidate, cross-workspace scope, unsupported path,
  command, evidence/ref, malformed input, raw-body field, credential marker, or widened authority
  fails before preview construction.

## Runtime And API Plan

Planned pure/runtime surface:

```text
src/runtime/memory-candidate-preview.js
previewLearningCandidateMemory(input)
```

Planned route:

```text
POST /api/learning-candidates/:learningCandidateId/memory-candidate-preview
```

The route accepts bounded exact JSON only. It returns one response-local preview and calls no
`saveState`. There is no GET route, runtime snapshot field, durable record, approval, Decision Inbox
item, run, artifact, provider attempt, source write, Git action, schedule, or next Mission.

## UI Boundary

- Add one explicit MemoryCandidate preview form only after an accepted review is hydrated.
- Keep source candidate and review evidence read-only.
- Store the preview only in browser memory and clear it on refresh, candidate/review change, input
  edit, or failed recomputation.
- Label the result `review-ready`, `persisted:false`, `storage:not-approved`, and
  `promotion:blocked`.
- Expose no store, retrieve, import, apply, export, delete, expire, refresh, promote-skill, provider,
  source, Git, release, schedule, next-Mission, policy, bypass, or connector action.
- Long ids, digests, scope, refs, and blocked actions must fit desktop and mobile.

## Compatibility

- Keep schema v13 unchanged.
- Preserve DEC-109 preview, DEC-112 durable candidate, and DEC-115 review routes and evidence.
- Preserve standalone task, Council, WorkOrder, DeliveryPackage, checkpoint, Growth Evidence Ledger,
  proposal, and existing memory-readiness behavior.
- Browser local preferences remain convenience state and cannot satisfy memory readiness.
- The new preview cannot be consumed as storage, retrieval, skill, provider, source, Git, release,
  scheduling, policy, or next-Mission authority.

## Focused Verification Plan

Future `scripts/smoke-ai-company-memory-candidate-preview.mjs` must prove:

- strict schema-v13 read-only load and exact accepted candidate/review/source binding;
- rejected and changes-requested reviews fail without revision, rework, quarantine, or output;
- bounded exact `memorySpec`, project-only scope, source-contained applicability/evidence/redaction/
  review refs, expiry, non-persistence statement, and conservative credential refusal;
- canonical digest, stable id, deep freeze, exact replay, and zero `saveState`;
- state/source bytes remain unchanged and no schema-v14/memory/skill/provider/Git/release/schedule/
  next-Mission/policy/connector record or action appears;
- DEC-109/112/115 plus standalone/Council/Growth/proposal/memory-readiness compatibility.

Future `scripts/smoke-ui-slice-663.mjs` must prove bounded POST, accepted-review-only form visibility,
response-only browser-memory lifecycle, edit/refresh invalidation, read-only source evidence, safe
stale/malformed/cross-workspace/credential/API failures, absent downstream controls, and
desktop/mobile fit.

## Rollback Plan

1. Disable the future preview route and UI form.
2. Discard response-local and browser-memory previews.
3. Preserve schema-v13 state and all LearningCandidate, LearningCandidateReview, and Mission evidence.
4. Create no migration, downgrade, durable-memory deletion, candidate rewrite, or Mission reopen.
5. Keep the existing read-only memory-readiness surface unchanged.
6. Rerun focused compatibility, README/inventory, UI QA, and aggregate verification.

## Implementation Target Surface

The later complete fielded decision may open only:

```text
src/runtime/memory-candidate-preview.js
src/runtime/runtime-service.js
scripts/serve-ui-slice-01.mjs
ui/council-signals.js
ui/app.js
ui/styles.css
scripts/smoke-ai-company-memory-candidate-preview.mjs
scripts/smoke-ui-slice-663.mjs
scripts/verification_status.mjs
scripts/ui_qa_status.mjs
```

## Acceptance Criteria

1. Only one exact source-current accepted review can produce a preview.
2. Schema v13, candidate, review, Mission, task, and source bytes remain unchanged.
3. Preview fields satisfy the existing memory-readiness contract without claiming storage.
4. Exact replay is deterministic; stale, rejected, changes-requested, expired, malformed,
   cross-workspace, unsupported, or credential-marked input fails closed.
5. Preview exists only in the response and browser memory.
6. No durable memory, retrieval, import/apply, export/delete, skill/provider/source/Git/release/
   scheduling/policy/connector authority opens.
7. Focused runtime/API/UI, compatibility, README/inventory, UI QA, and aggregate gates pass.

## Exclusions

- schema-v14 migration or any durable MemoryCandidate/MemoryItem record
- memory storage, retrieval, import, apply, export, deletion, expiry mutation, refresh, or GC
- cross-workspace or global memory
- skill creation/promotion or policy/profile learning
- candidate rewrite/revision/delete/quarantine/rework
- provider generation or raw transcript/artifact/source/provider/env/secret ingestion
- source mutation, commit, push, release, scheduling, next Mission, approval bypass, connectors

## Planning Status

- Planning-only authority: accepted as `DEC-116`.
- Complete fielded implementation handoff: documented as `DEC-117`.
- Current runtime remains schema v13 with no MemoryCandidate preview implementation.
- Runtime/API/UI implementation and every durable memory or downstream authority remain blocked.

## Verification

```bash
node scripts/smoke-ai-company-memory-candidate-preview-planning.mjs
node scripts/smoke-ai-company-learning-candidate-review-outcome-planning.mjs
node scripts/smoke-ai-company-learning-candidate-review-outcome.mjs
node scripts/smoke-ui-slice-662.mjs
node scripts/vnext-memory-readiness-decision-spec-status.mjs
node scripts/smoke-readme-scope-evidence.mjs
node scripts/smoke-completion-gate-inventory-current-evidence.mjs
node scripts/ui_qa_status.mjs
node scripts/verification_status.mjs
```
