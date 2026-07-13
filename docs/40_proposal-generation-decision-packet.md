# Proposal Generation Decision Packet

## Purpose

This packet turns the current blocked `proposal generation` authority into one concrete planning
decision. It covers deterministic local proposal draft generation from one existing Growth Evidence
Ledger candidate.

It is not planning approval, implementation approval, proposal record creation, proposal
application, provider approval, memory approval, source mutation approval, commit approval, or push
approval.

## Current Decision State

- Original gate: `proposal generation planning decision required`
- Current gate: `proposal generation implementation decision required`
- Current packet status: `consumed-by-proposal-generation-planning-only-decision`
- Source candidate surface: read-only Growth Evidence Ledger findings and proposal-readiness evidence
- Current proposal generation authority: blocked
- Recommended first path: deterministic local proposal draft generation from exactly one existing evidence candidate
- Provider-assisted generation: separately blocked

## Decision Options

| Option | Meaning | What it allows |
| --- | --- | --- |
| `approve-proposal-generation-planning-only` | Allow one implementation plan for deterministic local proposal draft generation. | Planning, rollback design, and focused smoke design only. No draft generation implementation or authority opens. |
| `request-more-evidence` | Keep the gate open because source or negative evidence is incomplete. | More read-only evidence collection only. |
| `reject` | Close this proposal generation path for now. | No planning or implementation authority opens. |
| `defer` | Leave the current state unchanged. | No planning or implementation authority opens. |

## Required Operator Decision

A valid planning decision must include every field below.

| Field | Required content |
| --- | --- |
| `decisionId` | Stable id for the operator decision. |
| `decisionStatus` | One of `approve-proposal-generation-planning-only`, `request-more-evidence`, `reject`, or `defer`. |
| `targetAuthority` | Exactly `deterministic local proposal draft generation planning`. |
| `targetSurface` | Docs, the existing read-only growth evidence surface, and a future named local draft-generation entrypoint. |
| `sourceEvidenceRefs` | Current growth candidate, reflection finding, proposal-readiness, proposal queue, and durable record contract evidence. |
| `negativeEvidenceRefs` | Missing generation plan, rollback plan, focused smoke, accepted draft schema, and any unresolved evidence risk. |
| `generationPlanRefs` | Empty until planning-only approval is accepted, then exactly one implementation plan. |
| `rollbackRefs` | Disable the future entrypoint, discard or quarantine invalid drafts, preserve source evidence, and prove aggregate verification. |
| `focusedSmokeRefs` | Planning smoke only until a later implementation decision; provider, memory, record creation, application, source mutation, commit, and push remain blocked. |
| `aggregateVerificationRef` | `node scripts/verification_status.mjs`. |
| `stillBlockedAuthorities` | Every authority that remains blocked after planning approval. |
| `approvalStatement` | Plain wording that approves planning only and rejects implied implementation or application authority. |

## Recommended Planning Target

The first planning target is one deterministic local proposal draft assembled from exactly one
existing Growth Evidence Ledger candidate.

The later plan must define:

- one input candidate id with source finding, source evidence, negative evidence, and verification refs
- one inert draft schema without a durable proposal record id or application status
- deterministic field mapping with no provider call or model inference
- explicit separation between draft generation, durable record creation, proposal application, and source mutation
- expiry or stale-evidence rejection before a draft can be reviewed for record creation
- rollback and quarantine behavior for malformed or stale drafts
- focused smoke coverage for missing approval, multiple candidates, missing evidence, and every blocked authority

## Generation Boundary

Planning may describe a future draft-generation function, but this packet does not create that
function. A later implementation decision must still name one entrypoint and one draft path.

The future draft must remain inert:

- it cannot create or persist a durable proposal record
- it cannot approve itself or set `applyAllowed=true`
- it cannot enter or mutate the proposal queue
- it cannot call providers
- it cannot persist memory or ingest transcripts
- it cannot mutate runtime state, UI state, project source, commits, or pushes

## Still Blocked

- proposal generation planning until the operator accepts a fielded planning-only decision
- proposal generation implementation
- provider-assisted proposal generation
- durable proposal record creation outside the approved runtime function
- durable proposal record UI creation action
- proposal application
- proposal queue mutation
- provider calls from growth surfaces
- memory persistence
- long-term memory store
- raw transcript ingestion
- cross-workspace memory
- skill promotion
- runtime or UI mutation from growth candidates
- source mutation outside the approved named path
- commit
- push

## Stop Conditions

Stop before planning or implementation when any condition below is true:

- the decision requests more than one target authority
- the target includes provider-assisted generation
- the target includes durable record creation or proposal application
- source or negative evidence refs are missing
- more than one input candidate is allowed
- a stable proposal record id or application status would be created during draft generation
- rollback or quarantine behavior is missing
- focused smoke or aggregate verification is missing
- provider calls, memory persistence, source mutation, commit, or push would open by implication
- the approval statement uses a shortcut such as `continue`, `approve all`, or `enable proposal generation`

## Copy-Ready Planning Decision

```text
decisionId=operator-decision-vnext-proposal-generation-planning-001
decisionStatus=approve-proposal-generation-planning-only
targetAuthority=deterministic local proposal draft generation planning
targetSurface=docs plus the existing read-only Growth Evidence Ledger and proposal review surfaces
sourceEvidenceRefs=DEC-048, DEC-050, DEC-052, DEC-053, DEC-057, DEC-062, DEC-067, docs/24_proposal-review-decision-spec.md, docs/26_authority-expansion-review-spec.md, docs/27_authority-implementation-decision-packet.md, docs/40_proposal-generation-decision-packet.md, scripts/growth-evidence-ledger-proposal-readiness-status.mjs, scripts/growth-proposal-queue-status.mjs
negativeEvidenceRefs=no accepted generation plan, no accepted inert draft schema, no accepted rollback plan, no focused generation smoke, provider calls remain blocked, memory persistence remains blocked, durable record creation outside the approved runtime function remains blocked, proposal application remains blocked, source mutation outside the approved named path remains blocked, commit and push remain blocked
generationPlanRefs=empty until this planning-only approval is accepted
rollbackRefs=disable the future draft generation entrypoint, discard or quarantine invalid drafts, preserve source evidence, prove aggregate verification after rollback
focusedSmokeRefs=planning smoke only; proposal generation implementation, provider calls, memory persistence, durable record creation, proposal application, source mutation, commit, and push stay blocked
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=proposal generation implementation, provider-assisted proposal generation, durable proposal record creation outside the approved runtime function, durable proposal record UI creation action, proposal application, proposal queue mutation, provider calls, memory persistence, long-term memory, raw transcript ingestion, cross-workspace memory, skill promotion, runtime mutation, UI mutation, source mutation outside the approved named path, commit, push
approvalStatement=I approve planning only for one deterministic local proposal draft generation path from one existing Growth Evidence Ledger candidate. This approval allows one generation plan, rollback plan, and focused smoke plan. It does not approve proposal generation implementation, provider calls, memory persistence, durable proposal record creation, proposal application, source mutation, commit, or push.
```

## Verification

Run:

```bash
node scripts/vnext-proposal-generation-decision-packet-status.mjs
```

The status command must remain read-only. It verifies this packet against the current growth
evidence, proposal queue, proposal record, vNext audit, README, decision log, completion inventory,
and blocked authority markers without opening proposal generation or any downstream authority.
