# Authority Implementation Decision Packet

## Purpose

This packet turns the current `operator decision required` gate into a concrete decision input.

It does not approve implementation. It does not create proposal records, persist memory, call providers, mutate source, commit, or push. It only states what the operator must decide before a later implementation slice can open exactly one authority path.

## Current Decision State

- Current gate: `operator decision required`
- Source review: `docs/26_authority-expansion-review-spec.md`
- Current recommended first candidate: durable proposal record creation and persistence
- Current packet status: `ready-for-operator-decision`
- Current implementation authority: blocked

## Decision Options

The operator can choose one of these outcomes:

| Option | Meaning | What it allows |
| --- | --- | --- |
| `approve-planning-only` | Allow a later implementation plan for one named authority path. | Planning and review only. No code, runtime, provider, persistence, commit, or push authority opens. |
| `approve-implementation-slice` | Allow one later implementation slice after its plan, rollback, and focused smoke are accepted. | Only the named authority in that accepted decision. Everything else stays blocked. |
| `request-more-evidence` | Keep the gate open because the packet is not specific enough. | More read-only evidence collection only. |
| `reject` | Close the authority request for now. | No implementation planning or authority opening. |
| `defer` | Leave the current state unchanged. | No implementation planning or authority opening. |

## Required Operator Decision

A valid implementation-opening decision must name all of these fields:

| Field | Required content |
| --- | --- |
| `decisionId` | Stable id for the operator decision. |
| `decisionStatus` | One of `approve-planning-only`, `approve-implementation-slice`, `request-more-evidence`, `reject`, or `defer`. |
| `targetAuthority` | Exactly one authority path. Broad values such as `enable vNext` are invalid. |
| `targetSurface` | The docs, UI surface, script, runtime path, or storage surface affected by the decision. |
| `sourceEvidenceRefs` | Positive evidence proving why this authority is needed now. |
| `negativeEvidenceRefs` | Known risks, missing proof, rejected alternatives, and unresolved blockers. |
| `implementationPlanRefs` | The later plan that keeps the change narrower than the requested authority. |
| `rollbackRefs` | How the implementation can be disabled, reverted, or restored if it fails. |
| `focusedSmokeRefs` | Focused checks that prove the exact opened path and the still-blocked paths. |
| `aggregateVerificationRef` | The aggregate command that must pass after implementation. |
| `stillBlockedAuthorities` | All authority paths that remain blocked after the decision. |
| `approvalStatement` | Plain operator wording that separates planning approval, implementation approval, and application approval. |

## Recommended First Candidate

The first candidate should be durable proposal record creation and persistence.

This is the narrowest candidate because the repo already has:

- proposal review boundary: `DEC-048`
- durable proposal record contract: `DEC-050`
- proposal review decision spec: `docs/24_proposal-review-decision-spec.md`
- authority expansion review: `DEC-052`
- current authority review spec: `docs/26_authority-expansion-review-spec.md`

The first implementation plan still needs to prove storage, ids, timestamps, expiry, rollback, and proposal-application separation. This packet does not provide that approval.

## Completion Path

Proceed in this order:

1. Decide one operator outcome from this packet.
2. If the outcome is `approve-planning-only`, write one implementation plan for durable proposal record creation and persistence.
3. Keep that plan limited to record storage, stable ids, timestamps, expiry, review refs, rollback, and read-only UI evidence.
4. Add focused smoke coverage before implementation that proves proposal application, memory persistence, provider calls, source mutation, commit, and push still stay blocked.
5. Implement only the accepted proposal-record slice after implementation approval exists.
6. Run the focused smoke and aggregate verification before any commit.
7. Reopen this packet for memory persistence, provider calls, or source mutation only after the proposal-record slice is verified and closed.

This path is a sequence for finishing the project. It is not approval to start implementation.

## Still Blocked

These authorities remain blocked until a later accepted implementation decision explicitly opens one narrower path:

- proposal generation
- proposal application
- proposal record creation
- proposal record persistence
- memory persistence
- long-term memory store
- raw transcript ingestion
- cross-workspace memory
- skill promotion
- provider calls from growth or memory surfaces
- runtime mutation from growth candidates
- UI action mutation from growth candidates
- source mutation
- commit
- push

## Stop Conditions

Stop before implementation when any of these are true:

- more than one `targetAuthority` is requested
- `targetSurface` is missing
- source evidence is stale or indirect
- negative evidence is missing
- rollback evidence is missing
- focused smoke refs are missing
- aggregate verification ref is missing
- approval wording collapses planning, implementation, and application into one approval
- any blocked authority would open by implication
- commit or push is requested without a separate explicit approval

## Verification

Run:

```bash
node scripts/vnext-authority-implementation-decision-packet-status.mjs
```

The script must stay read-only. It verifies this packet, the authority expansion review, the vNext development audit, README evidence, completion-gate inventory, aggregate registration, and blocked authority markers without opening proposal, memory, provider, source mutation, commit, or push authority.
