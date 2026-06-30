# Proposal Application Source Mutation Decision Packet

## Purpose

This packet turns the current `proposal application source mutation decision required` gate into concrete operator decision input.

It is not source mutation approval. It does not apply proposals, generate proposals, call providers, persist memory, mutate project source files, commit, or push. It only states what must be decided before any later source-mutation planning or implementation slice can open.

## Current Decision State

- Original gate: `proposal application source mutation decision required`
- Source implementation: `DEC-062`
- Current packet status: `consumed-by-source-mutation-planning-only-decision`
- Current proposal application authority: audit-only attempt records only
- Current source mutation planning authority: planning only
- Current source mutation implementation authority: blocked
- Current source mutation authority: blocked
- Current provider, memory, commit, and push authority: blocked

## Decision Options

The operator can choose one of these outcomes:

| Option | Meaning | What it allows |
| --- | --- | --- |
| `approve-source-mutation-planning-only` | Allow one later plan for source mutation semantics after an audit-only application attempt. | Planning, rollback design, and focused smoke design only. No source mutation, provider call, memory persistence, commit, or push opens. |
| `approve-source-mutation-implementation-slice` | Allow one later source mutation implementation slice after its plan, rollback, and focused smoke are accepted. | Only the named mutation path in that accepted decision. Everything else stays blocked. |
| `request-more-evidence` | Keep the gate open because the packet is not specific enough. | More read-only evidence collection only. |
| `reject` | Keep proposal source mutation closed for now. | No planning or implementation authority opens. |
| `defer` | Leave the current state unchanged. | No planning or implementation authority opens. |

## Required Operator Decision

A valid source-mutation-opening decision must name all of these fields:

| Field | Required content |
| --- | --- |
| `decisionId` | Stable id for the operator decision. |
| `decisionStatus` | One of `approve-source-mutation-planning-only`, `approve-source-mutation-implementation-slice`, `request-more-evidence`, `reject`, or `defer`. |
| `targetAuthority` | Exactly one source mutation authority path. Broad values such as `apply all proposals` are invalid. |
| `targetSurface` | The docs, runtime function, proposal record field, source file scope, smoke script, or review surface affected by the decision. |
| `sourceEvidenceRefs` | Positive evidence proving why source mutation is needed now. |
| `negativeEvidenceRefs` | Known risks, missing proof, rejected alternatives, and unresolved blockers. |
| `applicationAttemptRefs` | Existing audit-only proposal application attempt records that this decision depends on. |
| `mutationPlanRefs` | The later plan that separates dry-run, review, source mutation, rollback, and verification. |
| `rollbackRefs` | How the mutation path can be disabled, reverted, or quarantined if it fails. |
| `focusedSmokeRefs` | Focused checks that prove the exact opened path and the still-blocked paths. |
| `aggregateVerificationRef` | The aggregate command that must pass after implementation. |
| `stillBlockedAuthorities` | All authority paths that remain blocked after the decision. |
| `approvalStatement` | Plain operator wording that separates application evidence, source mutation approval, provider approval, memory approval, commit approval, and push approval. |

## Source Mutation Boundary

A later source mutation plan must start from an existing audit-only application attempt. It must not infer authority from a durable proposal record alone.

The first source mutation plan must define:

- which `proposalApplicationAttempts` records are eligible
- which durable proposal record and attempt evidence refs are required
- which source files, if any, are in scope
- whether the first path is dry-run-only, patch-draft-only, source-file mutation, runtime-contract mutation, UI-copy mutation, smoke-guard mutation, or docs-only mutation
- how baseline digests, dirty worktree state, patch drafts, diff previews, and reviewer evidence are captured before any write
- how source mutation remains separate from provider calls, memory persistence, commit, and push
- how rollback restores local file state, preserves audit evidence, and quarantines failed attempts
- which focused smoke proves the exact allowed path

The first source mutation plan is now recorded in `docs/38_proposal-application-source-mutation-planning-plan.md`. That planning artifact still must not combine multiple proposal types or source targets unless a later decision explicitly names that broader scope.

## Still Blocked

These authorities remain blocked from this packet:

- proposal generation
- proposal application beyond approved audit-only attempt records
- proposal queue mutation
- provider calls
- memory persistence
- long-term memory store
- raw transcript ingestion
- cross-workspace memory
- skill promotion
- runtime mutation from growth candidates
- UI action mutation from growth candidates
- project source mutation
- commit
- push

## Stop Conditions

Stop before source mutation planning or implementation when any of these are true:

- more than one `targetAuthority` is requested
- `targetSurface` is missing
- source evidence refs are missing
- negative evidence refs are missing
- application attempt refs are missing
- mutation plan refs are missing for an implementation-opening decision
- rollback refs are missing
- focused smoke refs are missing
- aggregate verification ref is missing
- durable proposal record approval, application attempt approval, and source mutation approval are collapsed into one approval
- provider calls, memory persistence, commit, or push would open by implication
- source mutation is requested without clean baseline proof, exact target-file scope, dry-run evidence, rollback proof, and focused smoke coverage
- commit or push is requested without a separate explicit approval

## Verification

Run:

```bash
node scripts/vnext-proposal-application-source-mutation-decision-packet-status.mjs
```

The script must stay read-only. It verifies this packet, the implemented audit-only application attempt evidence, the vNext development audit, README evidence, completion-gate inventory, aggregate registration, and blocked authority markers without opening source mutation authority.
