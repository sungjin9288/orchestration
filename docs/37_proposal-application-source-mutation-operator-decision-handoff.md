# Proposal Application Source Mutation Operator Decision Handoff

## Purpose

This document gives the operator a copy-ready decision shape for the `proposal application source mutation operator handoff required` gate.

It is not an operator decision. It does not approve source mutation planning or implementation. It does not apply proposals, generate proposals, call providers, persist memory, mutate source files, commit, or push.

## Current Gate

- Current gate: `proposal application source mutation operator handoff required`
- Handoff status: `decision-input-only`
- Decision packet: `docs/36_proposal-application-source-mutation-decision-packet.md`
- Application attempt evidence: `docs/35_proposal-application-implementation.md`
- Current proposal application authority: audit-only attempt records only
- Current source mutation authority: blocked
- Current provider, memory, commit, and push authority: blocked

## Source Evidence

- `DEC-057`
- `DEC-058`
- `DEC-059`
- `DEC-060`
- `DEC-061`
- `DEC-062`
- `DEC-063`
- `DEC-064`
- `docs/24_proposal-review-decision-spec.md`
- `docs/30_durable-proposal-record-implementation-plan.md`
- `docs/31_proposal-application-decision-packet.md`
- `docs/32_proposal-application-operator-decision-handoff.md`
- `docs/33_proposal-application-implementation-plan.md`
- `docs/34_proposal-application-implementation-decision-handoff.md`
- `docs/35_proposal-application-implementation.md`
- `docs/36_proposal-application-source-mutation-decision-packet.md`
- `node scripts/vnext-proposal-application-source-mutation-decision-packet-status.mjs`
- `node scripts/verification_status.mjs`

## Planning-Only Decision Shape

Use this shape only if the operator wants to approve one later source mutation plan.

Required fields: `decisionId`, `decisionStatus`, `targetAuthority`, `targetSurface`, `sourceEvidenceRefs`, `negativeEvidenceRefs`, `applicationAttemptRefs`, `mutationPlanRefs`, `rollbackRefs`, `focusedSmokeRefs`, `aggregateVerificationRef`, `stillBlockedAuthorities`, and `approvalStatement`.

```text
decisionId=operator-decision-vnext-proposal-source-mutation-001
decisionStatus=approve-source-mutation-planning-only
targetAuthority=proposal application source mutation planning for one audit-only application attempt path
targetSurface=docs plus existing proposal application attempt records, diff preview evidence, rollback evidence, and source mutation planning smoke
sourceEvidenceRefs=DEC-057, DEC-058, DEC-059, DEC-060, DEC-061, DEC-062, DEC-063, docs/24_proposal-review-decision-spec.md, docs/35_proposal-application-implementation.md, docs/36_proposal-application-source-mutation-decision-packet.md
negativeEvidenceRefs=source mutation implementation remains blocked, provider calls remain blocked, memory persistence remains blocked, proposal generation remains blocked, commit and push remain blocked, clean baseline proof is still required before any write
applicationAttemptRefs=existing approved audit-only proposal application attempt records
mutationPlanRefs=empty until this planning-only approval is accepted
rollbackRefs=disable source mutation planning path, preserve proposal record and application attempt audit evidence, quarantine failed planning records, prove aggregate verification after rollback
focusedSmokeRefs=source mutation planning smoke only; implementation, provider calls, memory persistence, proposal generation, commit, and push stay blocked
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=source mutation implementation, proposal generation, provider calls, memory persistence, source mutation, commit, push
approvalStatement=I approve planning only for one proposal application source mutation path based on existing audit-only application attempt evidence. This approval allows one mutation plan, rollback plan, and focused smoke plan. It does not approve source mutation implementation, proposal generation, provider calls, memory persistence, commit, or push.
```

## Implementation-Slice Decision Shape

Use this shape only after a source mutation plan, rollback plan, and focused smoke plan have already been accepted.

```text
decisionId=operator-decision-vnext-proposal-source-mutation-implementation-001
decisionStatus=approve-source-mutation-implementation-slice
targetAuthority=proposal application source mutation implementation for exactly one accepted mutation plan
targetSurface=<exact source files, runtime function, UI surface, smoke script, or docs path named by the accepted mutation plan>
mutationPlanRefs=<accepted source mutation plan refs>
applicationAttemptRefs=<existing audit-only proposal application attempt refs>
sourceEvidenceRefs=<positive evidence refs from the accepted plan>
negativeEvidenceRefs=<risks, rejected alternatives, dirty baseline concerns, rollback risks, and still-blocked authority>
rollbackRefs=<accepted rollback refs>
focusedSmokeRefs=<focused smoke proving the exact mutation path and still-blocked authorities>
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=proposal generation, provider calls, memory persistence, source mutation outside the named path, commit, push
approvalStatement=I approve implementation only for the source mutation slice described in <mutationPlanRefs>. This does not approve proposal generation, provider calls, memory persistence, source mutation outside the named path, commit, or push.
```

## Request More Evidence

Use this shape when the operator needs more read-only evidence.

```text
decisionId=operator-decision-vnext-proposal-source-mutation-001
decisionStatus=request-more-evidence
targetAuthority=proposal application source mutation planning for one audit-only application attempt path
targetSurface=docs plus existing proposal application attempt records
missingEvidenceRefs=<operator-provided evidence gap>
stillBlockedAuthorities=source mutation planning, source mutation implementation, proposal generation, provider calls, memory persistence, commit, push
approvalStatement=I request more read-only evidence before source mutation planning or implementation. No source mutation, provider, memory, commit, or push authority opens.
```

## Reject Or Defer

Use this shape when the operator wants to keep source mutation closed.

```text
decisionId=operator-decision-vnext-proposal-source-mutation-001
decisionStatus=reject
targetAuthority=proposal application source mutation planning for one audit-only application attempt path
targetSurface=docs plus existing proposal application attempt records
rejectionReason=<operator-provided reason>
stillBlockedAuthorities=source mutation planning, source mutation implementation, proposal generation, provider calls, memory persistence, commit, push
approvalStatement=I reject or defer proposal application source mutation for now. Source mutation planning, implementation, proposal generation, provider calls, memory persistence, commit, and push remain blocked.
```

## Invalid Shortcuts

These statements are not valid source mutation approval:

- `continue`
- `proceed`
- `do everything`
- `approve all`
- `implement vNext`
- `apply the proposal`
- `mutate source`
- `ship it`
- any statement that omits `decisionStatus`
- any statement that omits `applicationAttemptRefs`
- any statement that omits rollback refs
- any statement that omits focused smoke refs
- any statement that treats proposal record creation approval as source mutation approval
- any statement that treats application attempt approval as source mutation approval
- any statement that opens provider calls, memory persistence, commit, or push by implication

## Minimum Planning Acceptance

A planning-only decision is acceptable only when it:

1. Uses `decisionStatus=approve-source-mutation-planning-only`.
2. Names exactly one source mutation planning authority path.
3. Points to existing audit-only `applicationAttemptRefs`.
4. Keeps implementation blocked.
5. Keeps proposal generation blocked.
6. Keeps provider calls blocked.
7. Keeps memory persistence blocked.
8. Keeps commit and push blocked.
9. Includes rollback refs.
10. Includes focused smoke refs.
11. Includes aggregate verification refs.

## Minimum Implementation Acceptance

An implementation decision is acceptable only when it:

1. Uses `decisionStatus=approve-source-mutation-implementation-slice`.
2. Points to an accepted source mutation plan.
3. Names exactly one source mutation implementation path.
4. Names exact target files or surfaces.
5. Proves clean baseline and diff preview evidence.
6. Keeps provider calls blocked.
7. Keeps memory persistence blocked.
8. Keeps commit and push blocked.
9. Includes rollback refs.
10. Includes focused smoke refs.
11. Includes aggregate verification refs.

## Still Blocked

These authorities remain blocked from this handoff:

- source mutation planning
- source mutation implementation
- proposal generation
- proposal application beyond approved audit-only attempt records
- proposal queue mutation
- provider calls
- memory persistence
- long-term memory store
- raw transcript ingestion
- cross-workspace memory
- skill promotion
- commit
- push

## Stop Conditions

Stop before source mutation planning or implementation when:

- the operator decision is missing
- the operator decision is a shortcut instead of a fielded decision
- the operator decision omits required fields
- the operator decision names more than one source mutation path
- the operator decision omits `applicationAttemptRefs`
- the operator decision omits clean baseline proof for implementation
- the operator decision collapses application attempt approval and source mutation approval
- rollback refs are missing
- focused smoke refs are missing
- aggregate verification refs are missing
- provider calls, memory persistence, commit, or push would open by implication

## Verification

Run:

```bash
node scripts/vnext-proposal-application-source-mutation-operator-decision-handoff-status.mjs
```

The status script verifies this handoff, the source mutation decision packet, the approved audit-only application attempt evidence, the current development audit, README evidence, completion inventory, aggregate registration, and blocked authority markers. It does not record an operator decision or open source mutation authority.
