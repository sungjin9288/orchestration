# Orchestration 1.0 Architecture Roadmap v1

## Purpose
This document defines the implementation boundary and phased roadmap for building the first usable version of Orchestration 1.0.

## Architecture Guardrails
- keep the product `local-first / single-user-first / ops-first`
- treat repo files as the source of truth for policy and contracts
- enforce `project_path required` before execution
- enforce `review before done`
- enforce `approval before commit`
- prefer thin vertical slices over broad platform scaffolding
- do not silently change architecture without updating the decision log
- keep `v1 scope = development pack only`

## Reference Position
`claw-empire` is a reference for runtime and control-plane patterns only. Reuse the useful ideas around `project`, `task`, `worktree`, `logs`, `reports`, `APIs`, `AGENTS`, and bootstrap. Do not fork its product framing, office metaphor, messenger posture, or platform assumptions.

## System Boundary

### Inside v1
- local project registry with explicit `project_path`
- task orchestration lifecycle
- run execution tracking
- worktree-aware task isolation
- log capture and replay
- artifact capture and linkage
- decision, review, and approval gates
- `development` pack support

### Outside v1
- general team workspace model
- office-first or messenger-first surfaces
- ranking and gamification systems
- generic OAuth platform layer
- multi-provider-first orchestration
- non-development packs

## Source Of Truth

### Repo Files
- `AGENTS.md` for operating rules
- docs for product and architecture contracts
- pack files for capability boundaries

### Runtime State
Runtime may persist state for usability, but it must not become the hidden authority over the rules defined in repo files.

## Core Domain Contracts

### Project
Required minimum:
- stable identifier
- display name
- `project_path`
- pack type
- health or readiness state

### Task
Required minimum:
- task identifier
- title and intent
- lifecycle state
- blocker summary
- linked project
- linked worktree
- linked review and decision state

### Run
Required minimum:
- run identifier
- task identifier
- executor or role
- start and finish timestamps
- status and exit result
- log stream handle or reference

### Worktree
Required minimum:
- worktree identifier
- repo path
- branch or ref context
- merge or discard status

### Artifact
Required minimum:
- artifact identifier
- type
- origin task or run
- storage reference
- preview metadata

### Decision
Required minimum:
- decision identifier
- type
- prompt
- owner
- resolution state

### Review
Required minimum:
- review identifier
- subject task
- findings
- verification evidence
- outcome

### Approval
Required minimum:
- approval identifier
- scope
- approver
- status
- allowed next action

## Thin-Slice Roadmap

### Phase 0: Baseline Contracts
Deliverables:
- master brief
- decision log
- IA v1
- architecture roadmap

Exit Criteria:
- v1 scope and out-of-scope areas are explicit
- primary UI is fixed to the four required surfaces
- review and approval gates are documented

### Phase 1: Project Gate
Deliverables:
- local project registry
- `project_path` validation
- active project selection

Exit Criteria:
- no execution path exists without `project_path`
- project health can be shown in the global shell

### Phase 2: Task And Worktree Slice
Deliverables:
- task creation and lifecycle state
- worktree creation and linkage
- task detail model

Exit Criteria:
- a task can move from `Inbox` to `In Progress`
- task execution context is isolated by worktree when required

### Phase 3: Run And Logs Slice
Deliverables:
- run creation and tracking
- live log capture
- historical log replay

Exit Criteria:
- a started task produces a visible run
- `Logs` can show live and prior output tied to the task

### Phase 4: Review, Approval, And Decision Inbox
Deliverables:
- review workflow
- approval workflow
- decision inbox queue

Exit Criteria:
- task completion is blocked until review passes
- commit path is blocked until approval passes
- pending gates are visible in `Decision Inbox`

### Phase 5: Artifacts And Evidence
Deliverables:
- artifact storage model
- artifact browsing and preview
- review evidence linkage

Exit Criteria:
- runs and reviews can publish artifacts
- artifacts are traceable to tasks and runs

### Phase 6: Development Pack Hardening
Deliverables:
- development pack contract
- bootstrap expectations
- first-run checks

Exit Criteria:
- the `development` pack can be used end to end without cross-pack assumptions
- first-run setup is documented enough to prevent ambiguous operation

## Quality Gates

### Before Marking A Task Done
- review recorded
- findings resolved or explicitly accepted
- verification evidence attached

### Before Commit
- approval recorded
- affected task linked
- pending architecture or policy decisions resolved

### Before Architectural Expansion
- decision log updated
- scope impact recorded
- out-of-scope list revisited intentionally, not by drift

## Change Control
The following changes require an explicit decision log update before implementation:

- changing the primary UI surfaces
- expanding beyond `development pack only`
- weakening `project_path`, review, or approval gates
- changing provider strategy
- adding office-first, messenger-first, or multi-provider-first features

## Deferred Items
- office or radar visualization
- messenger adapters
- ranking or gamification
- generalized OAuth
- provider matrix
- non-development packs

## Open Architecture Questions
- which provider ships first behind the adapter boundary
- whether `Blocked`, `Waiting Approval`, and `Waiting Decision` are states or flags
- how artifact taxonomy maps to retention and preview behavior
- how much bootstrap should do on first run

## Slice Review Checklist
- [ ] does the slice preserve local-first behavior
- [ ] does it keep single-user-first assumptions
- [ ] does it improve ops visibility
- [ ] does it preserve `development pack only`
- [ ] does it respect review and approval gates
- [ ] does it avoid architecture drift from the decision log
