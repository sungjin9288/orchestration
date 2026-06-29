# Proposal Application Decision Packet

## Purpose

This packet turns the current `proposal application decision required` gate into a concrete decision input.

It is not proposal application approval. It does not apply proposals, generate proposals, call providers, persist memory, mutate source, commit, or push. It only states what an operator must decide before any later application slice can open exactly one authority path.

## Current Decision State

- Original gate: `proposal application decision required`
- Source implementation: `DEC-057`
- Current packet status: `decision-input-only`
- Current implementation authority: durable proposal record creation and persistence only
- Current application authority: blocked
- Current UI authority: read-only durable proposal record ledger only

## Decision Options

The operator can choose one of these outcomes:

| Option | Meaning | What it allows |
| --- | --- | --- |
| `approve-application-planning-only` | Allow a later implementation plan for proposal application semantics. | Planning and review only. No proposal application, source mutation, provider call, memory persistence, commit, or push opens. |
| `approve-application-implementation-slice` | Allow one later application implementation slice after its plan, rollback, and focused smoke are accepted. | Only the named application path in that accepted decision. Everything else stays blocked. |
| `request-more-evidence` | Keep the gate open because the packet is not specific enough. | More read-only evidence collection only. |
| `reject` | Close proposal application for now. | No application planning or implementation authority opens. |
| `defer` | Leave the current state unchanged. | No application planning or implementation authority opens. |

## Required Operator Decision

A valid application-opening decision must name all of these fields:

| Field | Required content |
| --- | --- |
| `decisionId` | Stable id for the operator decision. |
| `decisionStatus` | One of `approve-application-planning-only`, `approve-application-implementation-slice`, `request-more-evidence`, `reject`, or `defer`. |
| `targetAuthority` | Exactly one authority path. Broad values such as `apply all proposals` are invalid. |
| `targetSurface` | The docs, UI surface, runtime function, or storage surface affected by the decision. |
| `sourceEvidenceRefs` | Positive evidence proving why proposal application is needed now. |
| `negativeEvidenceRefs` | Known risks, missing proof, rejected alternatives, and unresolved blockers. |
| `applicationPlanRefs` | The later plan that separates review, application, source mutation, rollback, and verification. |
| `rollbackRefs` | How the application path can be disabled, reverted, or quarantined if it fails. |
| `focusedSmokeRefs` | Focused checks that prove the exact opened path and the still-blocked paths. |
| `aggregateVerificationRef` | The aggregate command that must pass after implementation. |
| `stillBlockedAuthorities` | All authority paths that remain blocked after the decision. |
| `approvalStatement` | Plain operator wording that separates creation approval, application approval, source mutation approval, commit approval, and push approval. |

## Application Boundary

The first later application plan, if approved, must stay narrower than "apply proposals".

It must define:

- which durable proposal record statuses are eligible for application
- which evidence refs, negative evidence refs, reviewer refs, and approval refs are required
- whether application is documentation-only, runtime-contract-only, UI-copy-only, smoke-guard-only, gateway-routing-only, or skill-memory-only
- whether source mutation is still blocked or separately approved
- how `applyAllowed=false` changes, if it changes at all
- how expired, superseded, quarantined, or stale records are rejected
- how rollback preserves audit evidence
- which focused smoke proves the exact allowed path

The first application plan must not combine multiple proposal types unless a later decision explicitly names that broader scope.

## Still Blocked

These authorities remain blocked from this packet:

- proposal generation
- proposal application
- proposal queue mutation
- durable proposal record UI creation action
- provider calls
- memory persistence
- long-term memory store
- raw transcript ingestion
- cross-workspace memory
- skill promotion
- runtime mutation from growth candidates
- UI action mutation from growth candidates
- source mutation
- commit
- push

## Stop Conditions

Stop before application planning or implementation when any of these are true:

- more than one `targetAuthority` is requested
- `targetSurface` is missing
- source evidence refs are missing
- negative evidence refs are missing
- application plan refs are missing for an implementation-opening decision
- rollback refs are missing
- focused smoke refs are missing
- aggregate verification ref is missing
- creation approval and application approval are collapsed into one approval
- application approval and source mutation approval are collapsed into one approval
- provider calls, memory persistence, source mutation, commit, or push would open by implication
- commit or push is requested without a separate explicit approval

## Verification

Run:

```bash
node scripts/vnext-proposal-application-decision-packet-status.mjs
```

The script must stay read-only. It verifies this packet, the proposal review decision spec, the durable proposal record implementation evidence, the vNext development audit, README evidence, completion-gate inventory, aggregate registration, and blocked authority markers without recording an operator decision or opening proposal application authority.
