# Proposal Draft Downstream Authority Decision Packet

## Purpose

This packet turns the current `explicit downstream authority decision required` gate into one
concrete operator decision input for a reviewed deterministic local inert proposal draft.

It recommends one first authority only: planning local durable proposal record creation for the
reviewed draft. It does not record a decision, create or persist a proposal record, mutate a queue,
apply a proposal, call a provider, persist memory, mutate runtime/UI/source state, commit, or push.

## Current Decision State

- Accepted review evidence: `DEC-074`
- Candidate: `growth-evidence-ledger-proposal-readiness-candidate`
- Current packet status: `awaiting-fielded-downstream-authority-decision`
- Recommended first authority: `local durable proposal record creation planning for one reviewed deterministic inert draft`
- Current implementation authority: blocked
- Current durable record creation authority for this reviewed draft: blocked

## Decision Options

| Option | Meaning | What it allows |
| --- | --- | --- |
| `approve-local-durable-record-planning-only` | Allow one plan for mapping this reviewed inert draft into one local durable proposal record. | Planning, rollback design, and focused smoke design only. No record creation or persistence authority opens. |
| `request-more-evidence` | Keep the gate open because source or negative evidence is incomplete. | More read-only evidence collection only. |
| `reject` | Close this downstream path for now. | No planning or implementation authority opens. |
| `defer` | Leave the current state unchanged. | No planning or implementation authority opens. |

## Required Operator Decision

A valid decision must include every field below.

| Field | Required content |
| --- | --- |
| `decisionId` | Stable id for the operator decision. |
| `decisionStatus` | One of `approve-local-durable-record-planning-only`, `request-more-evidence`, `reject`, or `defer`. |
| `targetAuthority` | Exactly `local durable proposal record creation planning for one reviewed deterministic inert draft`. |
| `targetSurface` | Docs, the reviewed inert draft contract, and one future named local record-creation boundary. |
| `candidateId` | Exactly `growth-evidence-ledger-proposal-readiness-candidate`. |
| `sourceEvidenceRefs` | `DEC-070` through `DEC-074`, the generation plan and implementation, the pending review packet, and the accepted review-evidence decision. |
| `negativeEvidenceRefs` | No accepted record mapping plan for this draft, no accepted rollback plan, no focused smoke for this handoff, and every still-blocked authority. |
| `recordPlanRefs` | Empty until planning-only approval is accepted, then exactly one local record mapping plan. |
| `rollbackRefs` | Disable the future mapping entrypoint, quarantine invalid records, preserve review evidence, and prove aggregate verification after rollback. |
| `focusedSmokeRefs` | Planning smoke only until a later implementation decision; creation, persistence, queue mutation, application, provider, memory, source mutation, commit, and push stay blocked. |
| `aggregateVerificationRef` | `node scripts/verification_status.mjs`. |
| `stillBlockedAuthorities` | Every authority that remains blocked after planning-only approval. |
| `approvalStatement` | Plain wording that approves planning only and rejects implied implementation or persistence authority. |

## Recommended Planning Target

The first later plan should map exactly one reviewed deterministic inert draft into exactly one local
durable proposal record candidate. It must reuse the existing durable proposal record contract where
that contract fits and name any required adapter explicitly instead of inventing a second record
model.

The plan must keep these decisions separate:

- planning the record mapping
- implementing the mapping
- creating or persisting a record
- mutating a proposal queue
- applying a proposal
- calling a provider
- persisting memory
- mutating runtime, UI, or source state
- committing or pushing

## Still Blocked

- local durable proposal record planning until a fielded decision is accepted
- local durable proposal record implementation for this reviewed draft
- proposal record creation or persistence for this reviewed draft
- proposal queue mutation
- proposal application
- provider calls
- memory persistence
- runtime, UI, or source mutation
- commit
- push

## Stop Conditions

Stop before planning or implementation when any condition below is true:

- the decision names more than one target authority
- the decision uses a shortcut such as `continue`, `proceed`, `do everything`, or `approve all`
- the candidate differs from the reviewed deterministic inert draft
- source or negative evidence refs are missing
- record mapping, rollback, focused smoke, or aggregate verification is missing
- record creation or persistence is coupled to planning approval
- queue mutation or proposal application opens by implication
- provider, memory, runtime/UI/source mutation, commit, or push authority opens by implication

## Copy-Ready Planning Decision

```text
decisionId=operator-decision-vnext-proposal-draft-downstream-authority-001
decisionStatus=approve-local-durable-record-planning-only
targetAuthority=local durable proposal record creation planning for one reviewed deterministic inert draft
targetSurface=docs plus the reviewed inert draft contract and one future named local record-creation boundary
candidateId=growth-evidence-ledger-proposal-readiness-candidate
sourceEvidenceRefs=DEC-070, DEC-071, DEC-072, DEC-073, DEC-074, docs/42_proposal-generation-planning-plan.md, docs/43_proposal-generation-implementation.md, docs/44_proposal-draft-human-review.md, docs/45_proposal-draft-human-review-decision-packet.md, docs/46_proposal-draft-human-review-evidence-decision.md
negativeEvidenceRefs=no accepted record mapping plan for this reviewed draft, no accepted rollback plan, no focused mapping smoke, record creation and persistence remain blocked, queue mutation remains blocked, proposal application remains blocked, provider calls remain blocked, memory persistence remains blocked, runtime/UI/source mutation remains blocked, commit and push remain blocked
recordPlanRefs=empty until this planning-only approval is accepted
rollbackRefs=disable the future mapping entrypoint, quarantine invalid local records, preserve review evidence, prove aggregate verification after rollback
focusedSmokeRefs=planning smoke only; implementation, creation, persistence, queue mutation, application, provider, memory, runtime/UI/source mutation, commit, and push stay blocked
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=local durable proposal record implementation, record creation, record persistence, proposal queue mutation, proposal application, provider calls, memory persistence, runtime mutation, UI mutation, source mutation, commit, push
approvalStatement=I approve planning only for mapping one reviewed deterministic inert proposal draft into one local durable proposal record candidate. This approval allows one mapping plan, rollback plan, and focused smoke plan. It does not approve implementation, record creation, record persistence, queue mutation, proposal application, provider calls, memory persistence, runtime/UI/source mutation, commit, or push.
```

## Verification

```bash
node scripts/vnext-proposal-draft-downstream-authority-decision-packet-status.mjs
node scripts/verification_status.mjs
```

The status command is read-only. It verifies this packet, the accepted review evidence, the pending
review contract, decision history, audit, completion inventory, README, aggregate registration, and
still-blocked authority without recording an operator decision or changing runtime behavior.
