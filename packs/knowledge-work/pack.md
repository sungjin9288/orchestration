# Knowledge-Work Pack

## Purpose
This pack governs bounded non-coding work inside a local project. It is for decisions, planning, documentation, research synthesis, operating notes, and similar work where the primary output is a reviewable artifact rather than shipped code.

The pack exists to keep knowledge work inspectable and controlled:
- local-first
- single-user-first
- ops-first
- `project_path` required before execution
- explicit evidence and assumptions
- review before done
- approval before commit when commit is actually requested

## Pack Boundary / Operating Principles
- `knowledge-work` is an explicit opt-in pack. It does not replace the `development` pack.
- Repo files stay the source of truth for workflow policy and contracts.
- Outputs should be grounded in local context, explicit assumptions, and visible evidence.
- Prefer one bounded deliverable over a broad documentation sweep.
- Keep the same approval, review, artifact, and provenance model used by the runtime.
- Do not silently convert planning or decision work into implementation, migration, release, or deployment work.

## In-Scope Work
- decision memos
- PRD or one-pager drafts
- execution plans
- operational checklists
- meeting briefs
- research summaries grounded in local context
- recommendation notes with explicit assumptions and open questions

## Out-Of-Scope Work
- hidden external research not captured in the deliverable
- silent implementation or rollout
- schema or infra changes that should be routed through the `development` pack
- office-first or messenger-first collaboration flows

## Stage Sequence
Contract stage flow stays the same:

`router -> planner -> architect -> task-breaker -> builder -> reviewer -> human gate`

Interpretation for this pack:
- `planner`: choose one bounded deliverable and define acceptance
- `architect`: check evidence boundaries, approval boundaries, and source-of-truth fit
- `task-breaker`: split drafting and review into the smallest useful checkpoints
- `builder`: prepare or write the bounded deliverable only
- `reviewer`: check clarity, grounding, evidence, and actionability

## Required Inputs
- active project identity
- valid `project_path`
- clear goal or decision question
- intended audience or consumer when known
- constraints and assumptions when known
- relevant repo docs or local source material

## Required Outputs / Artifacts
- `plan`: bounded deliverable plan
- `architecture`: boundary note for evidence, assumptions, and approval needs
- `breakdown`: ordered drafting and review checkpoints
- `preflight`: target files, risks, verification plan, escalation triggers
- `change-summary` / `patch` / `diff`: deliverable update evidence when files change
- `review`: verdict, findings, evidence reviewed, next action
- `output`: optional fallback artifact for generated deliverables when the slice does not map cleanly to a more specific type

## Review / Approval / Done Rules
- review is still required before a task can be considered done
- assumptions and missing evidence must be explicit
- recommendations must state next action or decision owner when possible
- reviewer should fail closed on missing deliverable files or missing provenance trace markers, and should request changes when required sections are missing or empty
- if commit or release follow-up is requested, the same explicit approval semantics remain in force

## Forbidden Actions
- treating speculation as grounded evidence
- hiding missing context or open questions
- silently widening into implementation or release work
- skipping review because the artifact is "just a document"
