# Memory Readiness Decision Spec

## Purpose

This spec defines the decision boundary that must exist before Orchestration can persist long-term memory, ingest raw transcripts, promote skills, or share memory across workspaces.

It does not implement memory storage. It keeps local browser preferences, Growth Evidence Ledger findings, and future durable memory separate until source, redaction, export, expiry, deletion, and human review rules are explicit.

## Current Status

- `DEC-049` remains authoritative: the current long-term memory surface is readiness only.
- Browser `localStorage` preferences are convenience state, not runtime memory.
- Growth Evidence Ledger findings can inform future review, but they do not become memory items by themselves.
- The current shell may show a blocked memory readiness gate, but it must not expose store, import, ingest, promote, export, delete, provider-call, source-mutation, commit, or push actions for memory.

## Non-Authority Boundary

The following authority remains blocked until a later accepted decision explicitly opens it:

- memory persistence
- long-term memory store
- raw transcript ingestion
- cross-workspace memory
- skill promotion
- memory import or apply
- provider calls from memory surfaces
- runtime mutation from memory readiness
- UI action mutation from memory readiness
- source mutation
- commit
- push

Local personalization is not memory. Copyable preference review is not import. A repeated pattern in Growth Evidence Ledger is not durable learning until a reviewed memory item is explicitly created under a later approved storage path.

## Memory Item Contract

A future durable memory item must define at least these fields before persistence is allowed:

| Field | Required rule |
| --- | --- |
| `id` | Stable memory item identity assigned only during an approved storage step. |
| `status` | Explicit lifecycle status, never inferred from repeated evidence or local preference usage. |
| `createdAt` | Creation timestamp assigned only when durable memory is created. |
| `updatedAt` | Last mutation timestamp tied to explicit operator-visible changes. |
| `expiresAt` | Expiry timestamp or policy marker that prevents stale memory from silently steering work. |
| `sourceRefs` | Repo, artifact, run, decision, approval, or review refs that justify the item. |
| `evidenceRefs` | Positive evidence refs supporting why the memory should exist. |
| `negativeEvidenceRefs` | Counter-evidence, uncertainty, failures, or blocked conditions that must remain visible. |
| `redactionRefs` | Evidence that secret, transcript, and unrelated personal data handling was reviewed. |
| `workspaceScope` | The exact workspace or project scope where the memory can apply. |
| `applicability` | The conditions under which the memory may be suggested or ignored. |
| `reviewRefs` | Human or review artifact refs that evaluated the memory candidate. |
| `exportRefs` | Export record refs when the memory is copied out of the local store. |
| `deletionRefs` | Deletion or expiry review refs when the item is removed or invalidated. |
| `blockedActions` | Actions still blocked for this item, including auto-apply, source mutation, commit, and push. |
| `nonPersistenceStatement` | Plain statement that readiness evidence is not durable memory persistence. |

Allowed `status` values must be fixed before implementation. The initial status should distinguish a review-ready candidate from a stored memory item, rejected candidate, expired item, or deleted item.

## Source And Redaction Rules

Memory storage cannot open until source and redaction rules are explicit:

- Source refs must be repo-relative or runtime/artifact ids that the operator can inspect.
- Raw transcripts must not be ingested by default.
- Secrets, credentials, tokens, provider payloads, unrelated personal data, and unreviewed raw chat content must not enter durable memory.
- Redaction evidence must be recorded before storage, export, or skill promotion.
- Negative evidence must stay attached so a memory item cannot hide uncertainty.

## Review And Approval Semantics

Memory readiness, memory storage, memory export, memory deletion, and skill promotion are separate gates:

- Readiness review: evaluates whether a candidate is worth considering. It does not persist memory.
- Storage approval: authorizes writing a durable memory item with a stable `id`, initial `status`, timestamps, source refs, and redaction evidence.
- Export approval: authorizes copying a memory item out of its local store or workspace scope.
- Deletion approval: authorizes deleting, expiring, or invalidating a durable memory item.
- Skill-promotion review: evaluates whether repeated evidence should become a skill or reusable rule. It does not promote skills by itself.

No implementation may collapse these gates into one button, one status, or one implicit green state. Readiness can only feed the next explicit decision.

## Expiry And Deletion

Durable memory needs expiry and deletion before storage because local project evidence can become stale.

- An expired item cannot steer recommendations.
- A deleted item cannot be suggested as active memory.
- A memory item outside its `workspaceScope` cannot be applied.
- A memory item with missing source refs, missing redaction refs, missing review refs, unresolved negative evidence, or stale evidence cannot be stored, exported, promoted, or applied.
- Refreshing an expired item requires a new review pass and new approval semantics.

## Stop Conditions

Any future implementation must stop before memory storage, export, deletion, skill promotion, or application when one of these conditions is true:

- missing `sourceRefs`
- missing `evidenceRefs`
- missing `negativeEvidenceRefs`
- missing `redactionRefs`
- missing `reviewRefs`
- missing explicit storage approval
- missing explicit export approval for copied memory
- missing explicit deletion approval for removal
- stale source evidence
- unresolved negative evidence
- expired or deleted memory item
- cross-workspace memory attempt
- raw transcript ingestion attempt
- secret-bearing payload detected
- provider call attempt from memory readiness
- source mutation attempt from memory readiness
- commit or push attempt from memory readiness

## Implementation Prerequisites

Before long-term memory persistence can open, the repo needs a later accepted decision that names:

- memory storage location and migration/compatibility policy
- exact memory item status lifecycle
- storage approval payload
- export approval payload
- deletion and expiry payload
- redaction review payload
- workspace-scope enforcement
- skill-promotion review boundary
- focused smoke coverage proving raw transcript ingestion, cross-workspace memory, skill promotion, provider calls, source mutation, commit, and push remain blocked until their separate approvals exist

## Verification

Run:

```bash
node scripts/vnext-memory-readiness-decision-spec-status.mjs
```

The status script must stay read-only. It verifies this spec, `DEC-049`, the vNext development audit, aggregate registration, and source-checkable blocked authority markers without opening memory persistence, raw transcript ingestion, cross-workspace memory, or skill promotion.
