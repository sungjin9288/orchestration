# Deterministic Proposal Draft Generation Implementation

## Purpose

This document records the approved implementation of one deterministic local inert proposal draft
generator. The generator maps one existing Growth Evidence Ledger candidate into an in-memory draft
only. It does not persist a durable record, mutate a queue, apply a proposal, call a provider,
does not persist memory, mutate runtime/UI/source state, commit, or push.

## Implementation Decision

| Field | Accepted value |
| --- | --- |
| `decisionId` | `operator-decision-vnext-proposal-generation-implementation-001` |
| `decisionStatus` | `approve-proposal-generation-implementation-slice` |
| `targetAuthority` | `deterministic local inert proposal draft generation implementation` |
| `candidateId` | `growth-evidence-ledger-proposal-readiness-candidate` |
| `implementationEntrypoint` | `src/runtime/proposal-drafts.js#createDeterministicProposalDraft` |
| `generationPlanRefs` | `docs/42_proposal-generation-planning-plan.md` |
| `rollbackRefs` | disable the entrypoint; discard the returned in-memory draft; preserve candidate evidence; run focused smoke and aggregate verification |
| `focusedSmokeRefs` | `node scripts/smoke-deterministic-proposal-draft-generation.mjs` |
| `aggregateVerificationRef` | `node scripts/verification_status.mjs` |
| `stillBlockedAuthorities` | durable record creation, proposal application, proposal queue mutation, provider calls, memory persistence, runtime/UI/source mutation, commit, push |
| `approvalStatement` | I approve implementation only for one deterministic local inert proposal draft path. This does not approve durable record creation, proposal application, provider calls, memory persistence, source mutation, commit, or push. |

## Runtime Boundary

`createDeterministicProposalDraft(input)` accepts one approved generation decision, one candidate,
explicit evidence freshness, and an explicit evaluation timestamp. It validates the fixed candidate
identity and ready status, required evidence arrays, approval statement, and freshness interval.
The caller supplies `evaluationAt`; the module never reads a clock, files, runtime state, or a
provider.

The returned object has `draftStatus: draft-only`, `applyAllowed: false`, no `recordId`, no
application status, and no queue mutation field. It retains positive and negative evidence,
route/source/verification refs, blocked actions, the human review question, and the approval ref.

## Rejection And Rollback

- Missing or mismatched implementation approval rejects generation.
- A candidate other than `growth-evidence-ledger-proposal-readiness-candidate` rejects generation.
- Missing positive or negative evidence rejects generation.
- Expired evidence at the caller-provided `evaluationAt` rejects generation.
- Because no output is persisted, rollback is limited to discarding a returned draft. The source
  candidate and all evidence refs remain unchanged.

## Focused Smoke

`scripts/smoke-deterministic-proposal-draft-generation.mjs` proves deterministic output, no durable
record id, forced-false application, retained blocked actions, approval rejection, incomplete
evidence rejection, stale-evidence rejection, and the absence of file-store/runtime-service/provider
dependencies.

## Verification

```bash
node scripts/smoke-deterministic-proposal-draft-generation.mjs
node scripts/vnext-proposal-generation-implementation-status.mjs
node scripts/verification_status.mjs
```

This implementation is not a durable proposal creation or application authority.
