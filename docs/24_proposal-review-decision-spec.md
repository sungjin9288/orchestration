# Proposal Review Decision Spec

## Purpose

This spec defines the decision boundary that must exist before Orchestration can create or persist durable proposal records from Growth Evidence Ledger findings.

It does not implement proposal record creation. It exists to make the next implementation decision explicit, reviewable, and testable before any record, queue, approval, provider, source mutation, commit, or push authority is opened.

## Current Status

- `DEC-048` remains authoritative: the current `제안 검토 게이트` is review-readiness only.
- Growth Evidence Ledger proposal-record status scripts may shape, validate, review, accept, and finalize dry-run evidence, but they do not create or persist durable records.
- The current shell may show blocked proposal review readiness, but it must not expose a create, approve, persist, apply, commit, or push action for proposals.

## Non-Authority Boundary

The following authority remains blocked until a later accepted decision explicitly opens it:

- proposal record creation
- proposal record persistence
- proposal approval
- proposal application
- proposal queue mutation
- provider calls from proposal review surfaces
- long-term memory persistence
- runtime mutation
- UI action mutation
- source mutation
- commit
- push

Review-readiness evidence is not approval. Dry-run review acceptance is not approval. A durable proposal record, once later allowed, still cannot apply itself or authorize source mutation.

## Durable Proposal Record Contract

A future durable proposal record must define at least these fields before creation is allowed:

| Field | Required rule |
| --- | --- |
| `id` | Stable proposal record identity assigned only during an approved creation step. |
| `status` | Explicit lifecycle status, never inferred from a green review panel. |
| `createdAt` | Creation timestamp assigned only when the durable record is created. |
| `updatedAt` | Last record mutation timestamp, tied to explicit operator-visible changes. |
| `expiresAt` | Expiry timestamp or policy marker that prevents stale records from becoming hidden priority. |
| `sourceFindingId` | Growth Evidence Ledger finding id that originated the proposal candidate. |
| `sourceEvidenceRefs` | Positive evidence refs used to justify why this proposal should be reviewed. |
| `negativeEvidenceRefs` | Known counter-evidence, failures, blockers, or uncertainty that reviewers must see. |
| `reviewerRefs` | Human or review artifact refs that evaluated the proposal candidate. |
| `approvalRefs` | Explicit creation or application approvals; review refs do not satisfy this field. |
| `riskClass` | Operator-visible risk class used to decide review depth and approval path. |
| `proposedAction` | The bounded action being proposed, described without executing it. |
| `blockedActions` | Actions still blocked for this record, including apply, source mutation, commit, and push. |
| `nonApprovalStatement` | Plain statement that the record is not approval and cannot apply itself. |

Allowed `status` values must be fixed before implementation. The initial status should distinguish a review-ready draft from records approved for creation or rejected by review. Expired and superseded records must remain non-applicable.

## Approval Semantics

Proposal review, proposal record creation, and proposal application are separate gates:

- Review gate: evaluates evidence quality and operator usefulness. It may recommend whether a durable record should be created, but it does not approve creation or application.
- Creation approval: authorizes writing a durable proposal record with a stable `id`, initial `status`, and timestamps. It does not authorize applying the proposal.
- Application approval: authorizes a specific later implementation or source mutation path. It must bind to the current proposal record, current evidence, current review refs, and current operator approval.

No implementation may collapse these gates into one button, one status, or one implicit green state. Review acceptance can only feed the next explicit decision.

## Expiry And Supersession

Durable proposal records need expiry before creation because Growth Evidence Ledger evidence can become stale.

- An expired record cannot be applied.
- A superseded record cannot be applied.
- A record with missing source evidence, missing negative evidence, missing reviewer refs, or stale source refs cannot be applied.
- Refreshing an expired or superseded record requires a new review pass and new approval semantics.

## Stop Conditions

Any future implementation must stop before creation, persistence, or application when one of these conditions is true:

- missing `sourceFindingId`
- missing `sourceEvidenceRefs`
- missing `negativeEvidenceRefs`
- missing `reviewerRefs`
- missing explicit creation approval
- missing explicit application approval for source mutation
- stale source evidence
- unresolved negative evidence
- expired or superseded proposal record
- dirty runtime mutation attempt
- dirty source mutation attempt
- provider call attempt from the review surface
- commit or push attempt from proposal review

## Implementation Prerequisites

Before durable proposal record creation can open, the repo needs a later accepted decision that names:

- record storage location and migration/compatibility policy
- exact status lifecycle
- creation approval payload
- application approval payload
- redaction and export rules
- expiry and deletion rules
- focused smoke coverage proving proposal approval, application, memory persistence, source mutation, commit, and push remain blocked until their separate approvals exist

## Verification

Run:

```bash
node scripts/vnext-proposal-review-decision-spec-status.mjs
```

The status script must stay read-only. It verifies this spec, `DEC-048`, the vNext development audit, aggregate registration, and source-checkable blocked authority markers without opening proposal record creation or persistence.
