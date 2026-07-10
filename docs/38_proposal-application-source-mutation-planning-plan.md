# Proposal Application Source Mutation Planning Plan

## Purpose

This document records the accepted `approve-source-mutation-planning-only` operator decision and the planning plan for one proposal application source mutation path.

It is not source mutation implementation approval. It does not generate proposals, apply proposals, call providers, persist memory, mutate source files, commit, or push.

## Accepted Planning-Only Decision

| Field | Accepted value |
| --- | --- |
| `decisionId` | `operator-decision-vnext-proposal-source-mutation-001` |
| `decisionStatus` | `approve-source-mutation-planning-only` |
| `targetAuthority` | `proposal application source mutation planning for one audit-only application attempt path` |
| `targetSurface` | docs plus existing proposal application attempt records, diff preview evidence, rollback evidence, and source mutation planning smoke |
| `sourceEvidenceRefs` | `DEC-057`, `DEC-058`, `DEC-059`, `DEC-060`, `DEC-061`, `DEC-062`, `DEC-063`, `DEC-064`, `docs/35_proposal-application-implementation.md`, `docs/36_proposal-application-source-mutation-decision-packet.md`, `docs/37_proposal-application-source-mutation-operator-decision-handoff.md` |
| `negativeEvidenceRefs` | source mutation implementation remains blocked, provider calls remain blocked, memory persistence remains blocked, proposal generation remains blocked, commit and push remain blocked |
| `applicationAttemptRefs` | existing approved audit-only proposal application attempt records |
| `mutationPlanRefs` | this document |
| `rollbackRefs` | disable source mutation planning path, preserve proposal record and application attempt audit evidence, quarantine failed planning records, prove aggregate verification after rollback |
| `focusedSmokeRefs` | source mutation planning smoke only; implementation, provider calls, memory persistence, proposal generation, commit, and push stay blocked |
| `aggregateVerificationRef` | `node scripts/verification_status.mjs` |
| `stillBlockedAuthorities` | source mutation implementation, proposal generation, provider calls, memory persistence, source mutation, commit, push |
| `approvalStatement` | I approve planning only for one proposal application source mutation path based on existing audit-only application attempt evidence. This approval allows one mutation plan, rollback plan, and focused smoke plan. It does not approve source mutation implementation, proposal generation, provider calls, memory persistence, commit, or push. |

## Current Status

- Planning approval: accepted
- Implementation approval: accepted later under `DEC-067`
- Target authority: `proposal application source mutation planning for one audit-only application attempt path`
- Current proposal application authority: audit-only attempt records only
- Current source mutation planning authority: accepted historical plan evidence
- Current source mutation implementation authority: accepted for exactly one named path
- Current source mutation authority: approved runtime function only; all other paths blocked
- Current implementation evidence: `docs/39_proposal-application-source-mutation-implementation.md`

## Mutation Plan

The first source mutation implementation slice had to start from existing approved audit-only `proposalApplicationAttempts` records. This plan did not permit source writes by itself; the later `DEC-067` decision named and approved the exact path implemented in `docs/39_proposal-application-source-mutation-implementation.md`.

The implementation slice had to:

- identify exactly one eligible `proposalApplicationAttempts` record
- link that attempt to one durable proposal record
- capture clean baseline proof before any write
- name the exact source files or docs surfaces in scope
- define a dry-run diff preview before source mutation
- preserve proposal record evidence and application attempt evidence
- keep source mutation separate from provider calls, memory persistence, commit, and push
- reject expired, invalid, quarantined, or evidence-incomplete attempts
- record rollback proof before implementation authority can be reviewed
- keep all non-named source mutation paths blocked

The implementation slice must not:

- generate proposals
- apply more than one proposal
- mutate source without clean baseline proof
- mutate source without a diff preview
- call providers
- persist memory
- ingest raw transcripts
- promote skills
- commit
- push
- treat application attempt approval as source mutation implementation approval

## Source Mutation Contract

The accepted `DEC-067` implementation decision points back to this planning document and keeps source mutation narrow.

| Field | Rule |
| --- | --- |
| `applicationAttemptId` | Required id of one existing audit-only proposal application attempt. |
| `proposalId` | Required id of the durable proposal record linked to the attempt. |
| `targetFiles` | Exact repo-relative file paths or docs surfaces named before implementation. |
| `baselineProofRefs` | Required clean worktree, digest, or diff-base evidence captured before any write. |
| `diffPreviewRefs` | Required dry-run preview evidence before source mutation. |
| `rollbackRefs` | Required rollback and quarantine evidence. |
| `focusedSmokeRefs` | Required focused smoke refs proving the named path and blocked paths. |
| `sourceMutationImplementationAllowed` | `false` in this planning-only artifact; the later `DEC-067` decision opens only its named runtime function. |
| `sourceMutationAllowed` | Always `false` for this planning-only slice. |
| `providerCallsAllowed` | Always `false`. |
| `memoryPersistenceAllowed` | Always `false`. |
| `commitAllowed` | Always `false`. |
| `pushAllowed` | Always `false`. |
| `nonApprovalStatement` | Statement that planning approval is not source mutation implementation approval, provider approval, memory approval, commit approval, or push approval. |

## Rollback Plan

The approved implementation slice includes rollback evidence for these steps:

1. Disable the source mutation implementation entrypoint.
2. Preserve durable proposal record and application attempt audit evidence.
3. Quarantine failed mutation attempts instead of deleting evidence silently.
4. Restore local file state to the clean baseline.
5. Prove provider calls, memory persistence, source mutation outside the named path, commit, and push stay blocked after rollback.
6. Run focused smoke checks and aggregate verification after rollback.

## Focused Smoke Plan

The approved implementation slice adds focused smoke coverage proving:

- source mutation planning was accepted while implementation remained blocked until `DEC-067`
- implementation fails without explicit source mutation implementation approval
- implementation fails when the referenced application attempt does not exist
- implementation fails when the attempt is invalid, expired, quarantined, stale, or evidence-incomplete
- implementation fails when clean baseline proof is missing
- implementation fails when diff preview evidence is missing
- implementation fails when rollback refs are missing
- implementation preserves durable proposal record and application attempt evidence
- provider calls remain blocked
- memory persistence remains blocked
- proposal generation remains blocked
- commit and push remain blocked
- aggregate verification includes the new focused smoke

## Implementation Decision Evidence

Implementation started only after the operator provided `operator-decision-vnext-proposal-source-mutation-implementation-001` with `decisionStatus=approve-source-mutation-implementation-slice`, one accepted mutation plan, and exact target surfaces.

That decision keeps proposal generation, provider calls, memory persistence, commit, and push separate and blocked.

## Stop Conditions

Stop before implementation when any of these are true:

- the `approve-source-mutation-implementation-slice` decision is absent or invalid
- the implementation decision names more than one authority path
- source mutation approval is collapsed into proposal record creation approval
- source mutation approval is collapsed into application attempt approval
- clean baseline proof is missing
- diff preview evidence is missing
- target files or surfaces are missing
- rollback evidence is missing
- focused smoke refs are missing
- aggregate verification is not registered
- provider calls, memory persistence, commit, or push would open by implication

## Verification

Run:

```bash
node scripts/vnext-proposal-application-source-mutation-planning-plan-status.mjs
```

The plan status script verifies the accepted planning-only decision, this mutation plan, rollback plan, focused smoke plan, the separate `DEC-067` implementation evidence, vNext development audit, completion-gate inventory, README evidence, aggregate registration, upstream source mutation packet and handoff evidence, and the authorities that remain blocked. It does not record a new decision or widen the approved mutation path.
