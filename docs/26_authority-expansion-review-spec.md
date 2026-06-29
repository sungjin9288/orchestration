# Authority Expansion Review Spec

## Purpose

This spec defines the review boundary that must exist before Orchestration can open any currently blocked vNext authority.

It does not approve implementation. It records the minimum evidence, approval wording, rollback plan, and verification plan required before a later slice may open durable proposal records, memory persistence, provider calls, source mutation, commit, or push.

## Current Status

- `DEC-048` keeps proposal review readiness separate from proposal approval, creation, application, and persistence.
- `DEC-049` keeps long-term memory as readiness only.
- `DEC-050` defines the future durable proposal record contract.
- `DEC-051` defines the future durable memory contract.
- `DEC-052` makes authority expansion review a read-only gate. Passing this review is not implementation approval.

## Non-Authority Boundary

The following authority remains blocked until a later accepted implementation decision explicitly opens a narrower path:

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

An authority expansion review may recommend a future implementation slice. It must not create records, persist memory, call providers, mutate source, commit, push, or treat review acceptance as approval.

## Review Request Contract

A future authority expansion request must define at least these fields before implementation planning can proceed:

| Field | Required rule |
| --- | --- |
| `id` | Stable review request identity assigned before any implementation work starts. |
| `status` | Explicit review state such as `draft`, `ready-for-review`, `accepted-for-planning`, `rejected`, `expired`, or `superseded`. |
| `createdAt` | Request timestamp assigned when the review request is created. |
| `updatedAt` | Last review update timestamp tied to an operator-visible change. |
| `expiresAt` | Expiry timestamp or policy marker that prevents stale review acceptance from opening authority later. |
| `targetAuthorities` | Exact authority list being requested, never a broad "enable vNext" flag. |
| `scopeRefs` | Source docs, decisions, UI surfaces, scripts, and task refs that bound the requested authority. |
| `sourceEvidenceRefs` | Positive evidence proving why the authority is needed now. |
| `negativeEvidenceRefs` | Known risks, blockers, rejected alternatives, stale evidence, and missing prerequisites. |
| `approvalRefs` | Human approval refs for planning or implementation; review refs alone do not satisfy this field. |
| `implementationPlanRefs` | Concrete plan refs that show how the future slice stays narrower than the requested authority set. |
| `verificationPlanRefs` | Focused and aggregate check refs that must pass before and after implementation. |
| `rollbackRefs` | Restore, revert, disable, or fallback evidence required if the implementation fails. |
| `blockedActions` | Actions still blocked for the request, including apply, persistence, source mutation, commit, and push. |
| `nonApprovalStatement` | Plain statement that this review request is not implementation approval. |

## Review Candidates

| Candidate | Current state | Why it is not open yet | Minimum later smoke |
| --- | --- | --- | --- |
| Durable proposal record creation and persistence | Implemented for approved local runtime records only | `DEC-057` implements approved local `proposalRecords` storage with stable ids, timestamps, expiry, rollback quarantine, and `applyAllowed=false`. | Keep proposal application, UI creation actions, provider calls, memory persistence, source mutation, commit, and push blocked until a later explicit decision. |
| Memory persistence | Blocked | `docs/25_memory-readiness-decision-spec.md` defines durable memory readiness, but no storage decision has accepted source refs, redaction refs, expiry, export, deletion, or workspace scope as write behavior. | Prove storage rejects raw transcripts, secrets, cross-workspace leakage, missing review refs, and stale evidence. |
| Provider calls from growth surfaces | Blocked | Current growth learning is evidence extraction only. Provider calls would change runtime trust, cost, failure, and data-boundary behavior. | Prove provider calls are opt-in, scoped, logged, retry-bounded, cancellable, and never treated as memory or source mutation approval. |
| Source mutation from accepted improvement candidates | Blocked | Growth candidates are review evidence, not executable changes. Mutation needs a separate plan, approval payload, rollback path, and verification bundle. | Prove accepted candidates cannot mutate source without implementation approval, focused diff checks, rollback evidence, and aggregate verification. |

## Recommendation

The safest first future candidate is durable proposal record creation and persistence, because proposal review, proposal queue handoff, and proposal record readiness already have the most mature source-backed contracts.

That recommendation is not application approval. It names the first implemented creation/persistence slice. `DEC-056` accepted the implementation plan, and `DEC-057` moved the current downstream state to `proposal application decision required`.

## Approval Semantics

Authority expansion has separate gates:

- Review readiness: verifies whether the request has enough evidence to be considered. It does not approve implementation.
- Planning approval: allows a future implementation plan to be written against a named authority set. It does not allow code or runtime mutation.
- Implementation approval: allows one narrow implementation slice to change source, runtime, provider, persistence, commit, or push behavior according to the accepted plan.
- Application approval: required again when a proposal, memory item, provider path, source mutation, commit, or push would act on real state.

No implementation may collapse these gates into one button, one green status, one accepted review, or one durable record. Review acceptance can only feed the next explicit decision.

## Stop Conditions

Any future implementation must stop before authority expansion when one of these conditions is true:

- missing `targetAuthorities`
- broad or ambiguous authority scope
- missing `scopeRefs`
- missing `sourceEvidenceRefs`
- missing `negativeEvidenceRefs`
- missing explicit planning approval
- missing explicit implementation approval
- missing implementation plan refs
- missing verification plan refs
- missing rollback refs
- stale source evidence
- unresolved negative evidence
- expired or superseded authority request
- hidden provider call attempt
- hidden memory persistence attempt
- hidden proposal record creation attempt
- hidden source mutation attempt
- commit or push attempt without a separate explicit approval

## Implementation Prerequisites

Before any authority expansion implementation can open, the repo needs a later accepted decision that names:

- the exact authority being opened
- the storage or runtime surface being changed
- the implementation plan and rollback plan
- the approval payload and owner
- the focused smoke coverage
- the aggregate verification command
- the explicit authorities that remain blocked

## Verification

Run:

```bash
node scripts/vnext-authority-expansion-review-status.mjs
```

The status script must stay read-only. It verifies this spec, `DEC-052`, the vNext development audit, aggregate registration, and source-checkable blocked authority markers without opening proposal, memory, provider, source mutation, commit, or push authority.
