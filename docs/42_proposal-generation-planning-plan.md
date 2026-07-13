# Proposal Generation Planning Plan

## Purpose

This document records the accepted planning-only operator decision for one deterministic local
proposal draft generation path. It defines a later implementation boundary, rollback plan, and
focused smoke plan. It is not implementation approval and does not generate drafts, create durable
records, apply proposals, call providers, persist memory, mutate runtime, UI, or source, commit, or push.

## Accepted Planning-Only Decision

| Field | Accepted value |
| --- | --- |
| `decisionId` | `operator-decision-vnext-proposal-generation-planning-001` |
| `decisionStatus` | `approve-proposal-generation-planning-only` |
| `targetAuthority` | `deterministic local proposal draft generation planning` |
| `targetSurface` | docs plus the existing read-only Growth Evidence Ledger and proposal review surfaces |
| `sourceEvidenceRefs` | `DEC-048`, `DEC-050`, `DEC-052`, `DEC-053`, `DEC-057`, `DEC-062`, `DEC-067`, `DEC-068`, `docs/24_proposal-review-decision-spec.md`, `docs/26_authority-expansion-review-spec.md`, `docs/27_authority-implementation-decision-packet.md`, `docs/40_proposal-generation-decision-packet.md`, `scripts/growth-evidence-ledger-proposal-readiness-status.mjs`, `scripts/growth-proposal-queue-status.mjs` |
| `negativeEvidenceRefs` | no accepted generation plan, no accepted inert draft schema, no accepted rollback plan, no focused generation smoke; provider calls, memory persistence, record creation, proposal application, source mutation, commit, and push remain blocked |
| `generationPlanRefs` | this document |
| `rollbackRefs` | disable the future draft-generation entrypoint, discard or quarantine invalid drafts, preserve source evidence, and prove aggregate verification after rollback |
| `focusedSmokeRefs` | planning smoke only; implementation and all downstream authorities remain blocked |
| `aggregateVerificationRef` | `node scripts/verification_status.mjs` |
| `stillBlockedAuthorities` | proposal generation implementation, provider-assisted generation, durable record creation, proposal application, provider calls, memory persistence, source mutation, commit, push |
| `approvalStatement` | I approve planning only for one deterministic local proposal draft generation path from one existing Growth Evidence Ledger candidate. This does not approve implementation, provider calls, memory persistence, durable record creation, proposal application, source mutation, commit, or push. |

## Current Status

- Planning approval: accepted
- Implementation approval: blocked
- Current downstream gate: `proposal generation implementation decision required`
- Candidate input: exactly one existing Growth Evidence Ledger candidate
- Runtime implementation: not started

## Draft Generation Plan

A later implementation may add one named local entrypoint that accepts exactly one existing
Growth Evidence Ledger candidate and deterministically maps its source finding, positive evidence,
negative evidence, route refs, source refs, verification refs, blocked actions, and review question
into an inert draft object.

The draft must have no durable proposal id, no application status, no queue mutation, and no
self-approval. It must reject stale or incomplete evidence before it is available for later human
review. It must not call a model or provider; deterministic mapping is the only planned generation
mode.

## Inert Draft Contract

| Field | Rule |
| --- | --- |
| `candidateId` | Exactly one existing candidate id. |
| `sourceFindingId` | Required source finding reference from that candidate. |
| `evidenceRefs` | Required positive evidence copied from the candidate. |
| `negativeEvidenceRefs` | Required missing-proof or risk evidence copied from the candidate. |
| `routeRefs` | Required read-only route references. |
| `verificationRefs` | Required focused and aggregate verification references. |
| `blockedActions` | Explicitly retains proposal application, provider, memory, source mutation, commit, and push blocks. |
| `reviewQuestion` | Preserved human review question. |
| `draftStatus` | Always `draft-only`; never an application or durable-record status. |
| `recordId` | Always absent. |
| `applyAllowed` | Always `false`. |
| `nonApprovalStatement` | States that draft assembly is not approval, record creation, or application. |

## Rollback Plan

1. Disable the future draft-generation entrypoint without changing source evidence.
2. Discard or quarantine malformed or stale draft output without creating a durable record.
3. Preserve the originating candidate and its evidence references for review.
4. Verify no provider, memory, runtime, UI, source, commit, or push authority opened.
5. Run focused smoke and aggregate verification after rollback.

## Focused Smoke Plan

The later implementation must prove:

- missing planning approval prevents draft generation
- multiple candidates are rejected
- missing positive or negative evidence is rejected
- stale evidence is rejected
- deterministic output has the inert draft contract and `applyAllowed=false`
- no durable record, proposal application, queue mutation, provider call, memory persistence, runtime/UI/source mutation, commit, or push is possible
- rollback or quarantine preserves source evidence
- aggregate verification registers the focused smoke

## Implementation Decision Required

A later fielded implementation decision must name exactly one entrypoint and one inert draft path.
It must include this plan, rollback evidence, focused smoke refs, aggregate verification, and an
explicit statement that durable record creation, proposal application, provider calls, memory,
source mutation, commit, and push remain blocked.

## Stop Conditions

Stop before implementation when the proposed path accepts more than one candidate, calls a provider,
creates a record id, enters the proposal queue, sets an application status, omits stale-evidence
rejection, omits rollback/quarantine, or opens any blocked authority by implication.

## Verification

Run:

```bash
node scripts/vnext-proposal-generation-planning-plan-status.mjs
node scripts/vnext-development-audit-status.mjs
node scripts/verification_status.mjs
```

The planning status script verifies this accepted decision and plan as documentation-only evidence.
It does not execute or authorize proposal generation.
