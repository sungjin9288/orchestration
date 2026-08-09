# AI Company Ops Attempt Quarantine Plan

## Purpose

`DEC-185`는 active attempt를 정확히 읽는 `OpsSupervisionPreview`까지 구현했지만, operator가
결과를 신뢰할 수 없는 interrupted attempt를 안전하게 격리하는 방법은 아직 없다. 이 문서는
Stage 6B의 다음 최소 권한을 planning-only로 정의한다.

첫 command는 `quarantine` 하나다. Attempt를 성공이나 실패로 추정하지 않고, 원본 record를
고치지 않으며, 새 worker나 retry를 시작하지 않는다. 대신 exact preview에 묶인 immutable
`OpsAttemptDisposition`을 append하고 그 target의 늦은 settlement를 fail closed한다.

## Completion Position

현재 schema v26 baseline은 DEC-218까지 닫혀 있다. 더 넓은 multi-agent completion에는 다음
순서가 남아 있다.

1. Stage 6B: exact active-attempt quarantine와 late-settlement guard
2. Stage 6C: 별도 승인된 cancel 또는 safe-checkpoint resume
3. Stage 7: reviewed `MissionContextAttachment`와 explicit context injection
4. Stage 8: provider-backed read-only role expansion
5. Phase 9: isolated local dogfood scenarios와 honest evidence close-out

Stage 6B는 이 순서를 바꾸지 않는다. Quarantine은 recovery가 아니라 recovery 전에 필요한
증거 보존과 실행 차단이다.

## Accepted Planning-Only Decision

| Field | Accepted value |
| --- | --- |
| `decisionId` | `operator-requested-ai-company-ops-attempt-quarantine-planning-001` |
| `decisionStatus` | `approve-ai-company-ops-attempt-quarantine-planning-only` |
| `targetAuthority` | planning only for one deterministic local schema-v27 append-only OpsAttemptDisposition with decision=quarantine from one exact source-current DEC-185 OpsSupervisionPreview |
| `targetSurface` | docs plus the current read-only OpsSupervisionPreview, exact attempt records, settlement entrypoints, Advanced Ops evidence, and verification surfaces |
| `implementationPlanRefs` | this document |
| `sourceEvidenceRefs` | `DEC-097`, `DEC-172`, `DEC-179`, `DEC-182`, `DEC-183`, `DEC-185`, `DEC-218`, `docs/64_ai-company-checkpoint-resume-recovery-plan.md`, `docs/113_ai-company-multi-agent-completion-plan.md`, `docs/125_ai-company-ops-supervision-preview-plan.md`, `src/runtime/ops-supervision-preview.js`, `src/runtime/work-order-attempts.js`, `src/runtime/specialist-cell-attempts.js`, `src/runtime/specialist-cell-retries.js`, `src/runtime/runtime-service.js` |
| `negativeEvidenceRefs` | current schema v26 has exact active-attempt classification but no durable Ops disposition, no quarantine command, no target-wide settlement guard, no exact disposition inspection, and no authority for cancel resume replay retry inferred settlement or worker termination |
| `rollbackRefs` | disable new quarantine creation and its UI command, preserve valid schema-v27 dispositions and exact inspection, keep settlement denial for already quarantined targets, preserve every source attempt and parent record, and never downgrade or delete accepted evidence |
| `focusedSmokeRefs` | planning smoke only in `scripts/smoke-ai-company-ops-attempt-quarantine-planning.mjs`; implementation and UI smokes remain blocked |
| `aggregateVerificationRef` | `node scripts/verification_status.mjs` |
| `stillBlockedAuthorities` | schema-v27 implementation, disposition creation, attempt mutation or settlement, cancel, worker termination, resume, replay, retry, rework, new attempt creation, parent status mutation, automatic selection, background scheduling, provider execution, result application, source mutation, memory application, runtime-agent Git/release, policy mutation, approval bypass, collections, and connectors |
| `approvalStatement` | The operator approves planning only for one exact append-only quarantine disposition. Runtime, schema, API, UI, settlement guards, and every recovery or execution authority require a separate complete fielded decision. |

This planning authority is recorded as `DEC-219`. The complete fielded implementation handoff is
recorded as `DEC-220`. Runtime implementation remains reserved for an exact `DEC-221`.

## Why Quarantine Comes First

An active record after interruption proves only that work started. It does not prove that the worker
failed, succeeded, or is still running. Mutating that record to a terminal state would invent
history. Replaying it could duplicate source or result effects.

The source attempt and parent remain immutable under the
`OpsAttemptDisposition(decision=quarantine)` contract. The safe first command is therefore:

```text
exact active target + exact DEC-185 preview + explicit operator quarantine decision
-> validate current lineage before write
-> append one immutable disposition
-> deny every later settlement for that exact target record digest
-> expose exact read-only evidence
-> stop
```

No process kill is claimed. Request-scoped local workers may already have stopped or may return
later. The disposition owns only the durable rule that a late result cannot settle the target.

## Planned Schema v27

The migration adds only:

```text
schemaVersion = 27
sequences.opsAttemptDisposition
opsAttemptDispositions{}
```

Migration and persistence rules:

- preserve every valid schema-v26 value;
- create no disposition during migration, boot, read, GET, hydration, preview, or invalid input;
- reject future, partial, duplicate, or semantically invalid schema-v27 state;
- validate the complete first-write candidate before one atomic migration-plus-append save;
- keep exact replay read-only with no sequence increment or save;
- retain valid v27 evidence during rollback without downgrade, deletion, or source-record rewrite.

## OpsAttemptDisposition Contract

```text
id
projectId
targetType
targetId
parentId
targetRecordDigest
parentDigest
sourceDigest
attemptNumber
role
startedAt
deadlineAt
evaluatedAt
previewId
previewDigest
decision
reasonCode
authoritySummary
recordDigest
createdAt
```

Fixed values:

```text
decision=quarantine
reasonCode=operator-uncertain-outcome-after-interruption
authoritySummary.quarantineEvidenceAllowed=true
authoritySummary.lateSettlementAllowed=false
```

Every other authority flag is false. The record contains identifiers, timestamps, digests, fixed
classification, and fixed authority only. It stores no source bytes, path, prompt, transcript,
provider payload, command output, environment value, credential, secret, or operator prose.

`recordDigest` is canonical SHA-256 over all immutable fields except `id`, `createdAt`, and
`recordDigest` itself. At most one disposition may bind one `(targetType, targetId,
targetRecordDigest)` tuple.

## Exact Request

The proposed command is:

```text
POST /api/ops/attempt-dispositions/quarantine
```

The exact eleven-key request contains:

```text
targetType
targetId
parentId
expectedTargetRecordDigest
expectedParentDigest
evaluatedAt
previewId
previewDigest
decision=quarantine
reasonCode=operator-uncertain-outcome-after-interruption
acknowledgement=quarantine-without-settlement-or-recovery
```

First write recomputes DEC-185 from the current state using the exact six source fields. The
submitted preview id and digest must match. The target must still be active and source-bound.
Terminal, stale, mismatched, unsupported, malformed, extra, repeated, blank, or oversized input
fails before save.

Exact replay validates the retained source record and disposition before recomputing mutable state.
It returns the retained record with `idempotent=true` and performs no save. A divergent replay
conflicts.

## Settlement Guard

Quarantine has operational meaning only if later outcomes cannot overwrite it. Every settlement
path for the three DEC-185 target types must check the exact target record digest against retained
dispositions immediately before transition and save:

- `WorkOrderAttempt`
- Specialist first-attempt `SpecialistCellAttempt`
- Specialist retry-attempt `SpecialistCellAttempt`

When a matching disposition exists, settlement returns a bounded conflict and leaves state and
source bytes unchanged. It does not mark failure, cancel the parent, create another attempt, or
infer success. Existing terminal records cannot receive a new disposition.

The guard belongs in deterministic runtime code, not in the browser or worker adapter.

## Exact Inspection And UI

The exact locator is:

```text
GET /api/ops/attempt-dispositions/:opsAttemptDispositionId
```

No list, history, search, ranking, polling, automatic target selection, or bulk command is added.

Advanced Ops may show `Quarantine uncertain attempt` only beside an exact source-current DEC-185
preview. The operator must select the fixed acknowledgement. After creation, the UI renders the
immutable disposition and removes execution controls. Refresh hydrates only through the exact id
returned by the command or an already loaded target-bound exact locator; it does not enumerate
records.

## Compatibility

- Preserve DEC-097 checkpoint recovery and cancellation routes.
- Preserve DEC-172 operator-stepped scheduler behavior for targets without a disposition.
- Preserve DEC-179 first-attempt and DEC-182 retry settlement for non-quarantined targets.
- Preserve DEC-185 response-only preview and all generic snapshot exclusions.
- Preserve schema-v26 rework package acceptance and every standalone task, Council, Growth,
  provider, memory, commit, and release path.
- Create no Approval, Decision Inbox item, Run, Artifact, WorkOrderAttempt, checkpoint, retry,
  recovery record, source mutation, Git action, or provider call.

## Planned Implementation Surface

```text
src/runtime/contracts.js
src/runtime/file-store.js
src/runtime/assertions.js
src/runtime/ops-attempt-dispositions.js
src/runtime/runtime-service.js
scripts/serve-ui-slice-01.mjs
ui/council-signals.js
ui/app.js
ui/styles.css
scripts/smoke-ai-company-ops-attempt-quarantine.mjs
scripts/smoke-ui-slice-714.mjs
scripts/verification_status.mjs
scripts/ui_qa_status.mjs
```

README, decision docs, completion inventory, and task ledger may move only to keep current evidence
honest.

## Focused Verification Plan

The runtime/API smoke must prove:

- atomic v26-to-v27 migration and no passive creation;
- exact request keys, preview binding, current active lineage, and fixed decision values;
- one immutable record, canonical digest, uniqueness, reload, and exact inspection;
- exact replay before source recomputation and divergent replay refusal;
- all three target types, terminal/stale/partial/future/duplicate refusal;
- settlement denial after quarantine for WorkOrder, specialist first attempt, and specialist retry;
- unchanged bytes on every denied settlement and invalid request;
- unchanged behavior for non-quarantined DEC-172, DEC-179, DEC-182, and DEC-185 paths;
- no parent mutation, inferred result, new attempt, retry, worker/provider call, source mutation,
  Approval, Inbox item, Run, Artifact, checkpoint, memory, Git, release, policy, collection, bypass,
  or connector effect.

The UI smoke must prove exact preview gating, explicit acknowledgement, safe stale failure, exact
hydration, immutable evidence rendering, refresh/reload behavior, absent cancel/resume/retry/settle
controls, and bounded desktop/mobile fit.

## Stop Condition

Planning is complete when DEC-219 and DEC-220, this plan, the fielded handoff, planning smoke,
completion roadmap, README, inventory, and task ledger agree. No implementation file, schema field,
POST route, settlement guard, or UI command may exist before exact DEC-221 approval.
