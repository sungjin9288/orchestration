# Durable Proposal Record Planning Preview

## Purpose

This preview turns the recommended first candidate into a concrete planning input.

It is not `approve-planning-only`. It is not implementation approval. It does not create proposal records, persist records, mutate queues, call providers, mutate source, commit, or push.

## Current Status

- Original gate: `operator decision required`
- Accepted follow-up: `DEC-056`
- Current downstream gate: `proposal application decision required`
- Decision packet: `docs/27_authority-implementation-decision-packet.md`
- Implementation plan: `docs/30_durable-proposal-record-implementation-plan.md`
- Recommended first candidate: durable proposal record creation and persistence
- Current preview status: `consumed-by-planning-only-decision`
- Current implementation authority: accepted for durable proposal record creation and persistence only

## Non-Authority Boundary

The preview keeps these authorities blocked:

- proposal generation
- proposal application
- proposal record creation outside the approved runtime function
- proposal record persistence outside the approved runtime function
- durable proposal record UI creation action
- proposal queue mutation
- memory persistence
- provider calls
- runtime mutation outside the approved proposal record creation/persistence function
- UI action mutation
- source mutation
- commit
- push

## Planning Scope

The first later implementation plan should be limited to durable proposal record creation and persistence.

The plan may describe:

- local record storage shape
- stable id policy
- initial status policy
- `createdAt`, `updatedAt`, and `expiresAt` timestamp policy
- source evidence refs and negative evidence refs
- reviewer refs and creation approval refs
- rollback and deletion behavior
- focused smoke coverage
- aggregate verification

The plan must not describe proposal application, provider calls, memory persistence, source mutation, commit, push, or automatic execution as part of this first slice.

## Record Shape Preview

Use the existing proposal queue contract as the starting point:

| Field | Preview rule |
| --- | --- |
| `proposalId` | Stable id generated only inside a later approved creation slice. |
| `title` | Human-readable proposal title from reviewed evidence. |
| `proposalType` | Existing queue type such as documentation, smoke-guard, ui-copy, runtime-contract, skill-memory, or gateway-routing. |
| `status` | Initial status selected only inside a later approved creation slice. |
| `createdAt` | Timestamp assigned only inside a later approved creation slice. |
| `sourceClaimIds` | Growth Evidence Ledger claim ids that originated the candidate. |
| `evidenceRefs` | Positive evidence refs used for creation review. |
| `negativeEvidenceRefs` | Known risks, missing proof, rejected alternatives, and unresolved blockers. |
| `affectedFiles` | Repo-relative files or docs affected by the proposed future change. |
| `riskClass` | Existing queue risk class used to choose review depth. |
| `approvalGate` | Creation approval gate only. Application approval remains separate. |
| `reviewQuestion` | Human review question for the candidate. |
| `verificationPlan` | Focused and aggregate checks required before and after implementation. |
| `applyAllowed` | Always `false` for the creation slice. |

Optional fields may include `operatorDecisionRef`, `implementationSliceId`, `expectedUserImpact`, `rollbackPlan`, `expiresAt`, and `deferredReason`.

## Storage Candidate

The first implementation plan should use local-first storage only.

The storage candidate is a file-store-backed durable proposal record collection under the selected runtime root. The exact path, migration policy, and compatibility behavior must be named in the later accepted implementation plan before code changes.

The planning preview only records that candidate. It does not create a directory, write a record, allocate an id, stamp a timestamp, or persist queue state.

## Focused Smoke Preview

A later implementation plan should include focused smoke coverage proving:

- a record cannot be created without explicit creation approval
- created records include stable id, initial status, timestamps, source evidence refs, negative evidence refs, reviewer refs, approval refs, risk class, blocked actions, and non-approval statement
- proposal application remains blocked
- memory persistence remains blocked
- provider calls remain blocked
- source mutation remains blocked
- commit and push remain blocked
- expired or superseded records cannot be applied
- missing source evidence, missing negative evidence, or missing reviewer refs stop creation

## Rollback Preview

A later implementation plan should include rollback evidence for:

- disabling the proposal record creation path
- restoring the previous local file-store state
- removing or quarantining invalid local records
- preserving review evidence for audit
- proving aggregate verification after rollback

## Stop Conditions

Stop before the next authority slice when any of these are true:

- no later proposal application decision exists for the created durable proposal records
- more than one authority path is included
- storage path is unnamed
- id policy is missing
- initial status policy is missing
- timestamp policy is missing
- expiry policy is missing
- rollback plan is missing
- focused smoke refs are missing
- aggregate verification ref is missing
- proposal application is coupled to record creation
- provider calls, memory persistence, source mutation, commit, or push would open by implication

## Verification

Run:

```bash
node scripts/vnext-durable-proposal-record-planning-preview-status.mjs
```

The script must stay read-only. It verifies this preview, the operator decision packet, proposal review decision spec, proposal queue contract, proposal record creation readiness, vNext development audit, completion-gate inventory, README evidence, aggregate registration, and blocked authority markers without opening proposal application or UI creation actions.
