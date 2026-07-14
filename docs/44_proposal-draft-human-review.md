# Proposal Draft Human Review

## Purpose

This document defines the read-only human-review packet for one deterministic inert proposal draft.
It makes the draft's source finding, evidence, negative evidence, freshness, and blocked actions
available for inspection without recording a review outcome or opening any downstream authority.

## Review Boundary

The entrypoint is `src/runtime/proposal-draft-reviews.js#createProposalDraftHumanReviewPacket`.
It accepts only a current `draft-only` payload with `applyAllowed=false`, no durable record id, no
application status, no queue mutation, and fresh evidence. It returns `pending-human-review` only.

The packet does not create a durable record, mutate a proposal queue, apply a proposal, call a
provider, persist memory, mutate runtime/UI/source state, commit, or push. A future human review
outcome must be recorded through a separate explicit decision; this packet has no `reviewOutcome`.

## Packet Contract

| Field | Rule |
| --- | --- |
| `reviewStatus` | Always `pending-human-review`. |
| `humanReviewRequired` | Always `true`. |
| `candidateId` | Preserved from the inert draft. |
| `sourceFindingId` | Preserved from the inert draft. |
| `reviewQuestion` | Preserved for the human reviewer. |
| `evidence` | Preserves positive, negative, route, source, verification, and freshness evidence. |
| `blockedActions` | Preserved from the inert draft. |
| `reviewChecklist` | Requires relevance, negative-evidence, freshness, and separate-decision checks. |
| `reviewOutcome` | Always absent. |
| `durableRecordCreationAllowed` | Always `false`. |
| `proposalQueueMutationAllowed` | Always `false`. |
| `proposalApplicationAllowed` | Always `false`. |

## Rejection And Rollback

- Reject a payload that is not `draft-only` or has `applyAllowed=true`.
- Reject a payload carrying a record id, application status, queue mutation, incomplete evidence, or
  evidence that has expired at its recorded evaluation time.
- Because the packet is in-memory only, rollback is discarding the packet while preserving the draft
  and its source evidence unchanged.

## Decision Follow-up

`docs/45_proposal-draft-human-review-decision-packet.md` defines the fielded human outcome. `DEC-074`
records one accepted review-evidence-only outcome in
`docs/46_proposal-draft-human-review-evidence-decision.md`. Neither document adds a `reviewOutcome`
to this packet or opens durable record, queue, application, provider, memory, runtime/UI/source
mutation, commit, or push authority.

## Verification

```bash
node scripts/smoke-proposal-draft-human-review.mjs
node scripts/vnext-proposal-draft-human-review-status.mjs
node scripts/vnext-proposal-draft-human-review-decision-packet-status.mjs
node scripts/verification_status.mjs
```

This read-only review packet is not review approval, durable record creation, or proposal application.
