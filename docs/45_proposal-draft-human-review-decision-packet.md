# Proposal Draft Human Review Decision Packet

## Purpose

This packet defines the fielded human decision for one deterministic local inert proposal draft.
It lets an operator confirm review evidence, request more evidence, reject the draft, or defer the
decision without creating a durable record or opening any downstream authority.

## Current Decision State

- Original gate: `proposal draft human review decision required`
- Review packet: `docs/44_proposal-draft-human-review.md`
- Current packet status: `consumed-by-accept-review-evidence-only-decision`
- Accepted evidence decision: `operator-decision-vnext-proposal-draft-human-review-001` under `DEC-074`
- Candidate scope: exactly one existing Growth Evidence Ledger candidate
- Allowed outcome: review evidence confirmation only; it is not proposal record creation or application
- Durable record, queue mutation, proposal application, provider, memory, runtime/UI/source mutation,
  commit, and push authority: blocked

## Decision Options

| Option | Meaning | What it allows |
| --- | --- | --- |
| `accept-review-evidence-only` | Confirm that the current packet may remain review evidence. | Nothing downstream. A separate later decision is still required before any durable or external action. |
| `request-more-evidence` | Keep the gate open because the packet, source, negative evidence, or freshness is insufficient. | More read-only evidence collection only. |
| `reject` | Reject this inert draft for the current candidate. | No record, queue, application, or external authority opens. |
| `defer` | Leave the packet pending without a decision. | No authority opens. |

## Required Operator Decision

A valid decision must include every field below.

| Field | Required content |
| --- | --- |
| `decisionId` | Stable id for this single human-review decision. |
| `decisionStatus` | One of `accept-review-evidence-only`, `request-more-evidence`, `reject`, or `defer`. |
| `targetAuthority` | Exactly `human review evidence confirmation for one deterministic local inert proposal draft`. |
| `reviewPacketRef` | `docs/44_proposal-draft-human-review.md` and the named `pending-human-review` packet. |
| `candidateId` | Exactly `growth-evidence-ledger-proposal-readiness-candidate`. |
| `sourceEvidenceRefs` | Positive evidence, source, route, verification, and generation approval references from the pending packet. |
| `negativeEvidenceRefs` | Incomplete, stale, missing, or promotion-risk evidence that remains visible to the reviewer. |
| `evidenceFreshnessRef` | The packet freshness values and the review time used to confirm they have not expired. |
| `reviewOutcome` | The same value as `decisionStatus`; no implicit success status is allowed. |
| `aggregateVerificationRef` | `node scripts/verification_status.mjs`. |
| `stillBlockedAuthorities` | Every durable or external authority that remains blocked after the human outcome. |
| `approvalStatement` | Plain wording that confirms the outcome does not create a record, mutate a queue, apply a proposal, or open any downstream authority. |

## Review Boundary

The decision must apply to exactly one `pending-human-review` packet created by
`src/runtime/proposal-draft-reviews.js#createProposalDraftHumanReviewPacket`.

An `accept-review-evidence-only` outcome confirms only that the human has inspected the current
evidence. `docs/46_proposal-draft-human-review-evidence-decision.md` records that decision as
repository history. It does not add `reviewOutcome` to the packet, persist a runtime decision, create a durable
proposal record, mutate the proposal queue, apply a proposal, call a provider, persist memory,
mutate runtime/UI/source state, commit, or push.

Any later proposal record creation, proposal queue mutation, proposal application, provider call,
memory persistence, source mutation, commit, or push requires its own explicit authority and
verification. This packet cannot supply that authority.
`docs/47_proposal-draft-downstream-authority-decision-packet.md` defines the separate fielded input
for that next choice without recording an outcome.

## Stop Conditions

Stop without accepting a review outcome when any condition below is true:

- the input is not a fresh `pending-human-review` packet
- more than one candidate or packet is named
- the packet has a durable record id, application status, queue mutation, or promoted draft state
- positive, negative, source, route, or verification evidence is missing
- freshness has expired at the stated review time
- the decision uses a shortcut such as `continue`, `approve all`, or `apply it`
- the decision treats human review as durable record, queue, application, provider, memory, source,
  commit, or push approval
- the approval statement omits the still-blocked authorities

## Copy-Ready Decision Responses

### Accept Review Evidence Only

```text
decisionId=operator-decision-vnext-proposal-draft-human-review-001
decisionStatus=accept-review-evidence-only
targetAuthority=human review evidence confirmation for one deterministic local inert proposal draft
reviewPacketRef=docs/44_proposal-draft-human-review.md; pending-human-review packet for growth-evidence-ledger-proposal-readiness-candidate
candidateId=growth-evidence-ledger-proposal-readiness-candidate
sourceEvidenceRefs=DEC-068, DEC-070, DEC-071, DEC-072, docs/42_proposal-generation-planning-plan.md, docs/43_proposal-generation-implementation.md, docs/44_proposal-draft-human-review.md, scripts/growth-evidence-ledger-proposal-readiness-status.mjs
negativeEvidenceRefs=no durable proposal record, no queue mutation, no proposal application, no provider call, no memory persistence, no runtime/UI/source mutation, no commit, no push authority
evidenceFreshnessRef=review the packet evidenceFreshness at the stated review time; reject if expired
reviewOutcome=accept-review-evidence-only
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=durable proposal record creation, proposal queue mutation, proposal application, provider calls, memory persistence, runtime mutation, UI mutation, source mutation, commit, push
approvalStatement=I confirm only that the current pending human-review evidence has been reviewed for one deterministic local inert proposal draft. This does not create or persist a review outcome, durable record, queue mutation, proposal application, provider call, memory item, source mutation, commit, or push authority.
```

### Request More Evidence

```text
decisionId=operator-decision-vnext-proposal-draft-human-review-001
decisionStatus=request-more-evidence
targetAuthority=human review evidence confirmation for one deterministic local inert proposal draft
reviewPacketRef=docs/44_proposal-draft-human-review.md; pending-human-review packet for growth-evidence-ledger-proposal-readiness-candidate
candidateId=growth-evidence-ledger-proposal-readiness-candidate
negativeEvidenceRefs=<operator-provided missing, stale, or unresolved evidence>
reviewOutcome=request-more-evidence
stillBlockedAuthorities=durable proposal record creation, proposal queue mutation, proposal application, provider calls, memory persistence, runtime mutation, UI mutation, source mutation, commit, push
approvalStatement=I request more read-only evidence before a human review outcome. No durable record, queue, application, provider, memory, runtime/UI/source mutation, commit, or push authority opens.
```

### Reject Or Defer

```text
decisionId=operator-decision-vnext-proposal-draft-human-review-001
decisionStatus=reject
targetAuthority=human review evidence confirmation for one deterministic local inert proposal draft
reviewPacketRef=docs/44_proposal-draft-human-review.md; pending-human-review packet for growth-evidence-ledger-proposal-readiness-candidate
candidateId=growth-evidence-ledger-proposal-readiness-candidate
reviewOutcome=reject
stillBlockedAuthorities=durable proposal record creation, proposal queue mutation, proposal application, provider calls, memory persistence, runtime mutation, UI mutation, source mutation, commit, push
approvalStatement=I reject or defer the current inert proposal draft human review outcome. No downstream authority opens.
```

## Verification

Run:

```bash
node scripts/vnext-proposal-draft-human-review-decision-packet-status.mjs
node scripts/verification_status.mjs
```

The status command is read-only. It verifies the decision-input contract, pending review packet,
accepted evidence-decision history, decision log, audit, completion inventory, README, aggregate
registration, and still-blocked authority without changing runtime behavior.
