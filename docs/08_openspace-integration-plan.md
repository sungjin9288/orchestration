# Orchestration 1.0 OpenSpace Integration Plan

## Purpose
This document defines how to introduce OpenSpace into Orchestration 1.0 without changing the current control-plane contracts, stage semantics, or frozen baseline.

The target outcome is:
- keep the current Orchestration runtime, coordinator, approvals, reviews, artifacts, and shell semantics as-is
- add OpenSpace as an optional skill-evolution layer around the existing development-pack workflow
- allow repeated planner/architect/task-breaker/builder/reviewer work to improve over time
- keep all live execution and downstream local follow-up under the current repo-defined rules

## Scope Position

### In scope
- shared OpenSpace install outside the repo
- repo-local bridge skills that let host agents discover Orchestration-specific workflows
- repo-local scripts or docs that make the integration reproducible
- optional use of `DESIGN.md` for the shell/UI layer

### Out of scope
- replacing the current `development` pack with OpenSpace-native workflow semantics
- moving source-of-truth policy from repo docs into OpenSpace state
- allowing OpenSpace to bypass `project_path`, review, approval, or linked-worktree guards
- silently widening provider, release, or close-out behavior

## Why This Repo Fits
Orchestration already has:
- explicit staged execution
- stable repo-defined prompts and pack rules
- bounded mutation plus review and approval gates
- a local-first shell and a small UI surface

That makes it a good OpenSpace host because the repo already exposes reusable workflows that can become evolved skills:
- planner
- architect
- task-breaker
- builder preflight
- builder live-mutation preparation
- reviewer handoff and evidence checking

## Non-Negotiable Guardrails
OpenSpace must operate as a helper layer, not a replacement authority.

The following repo contracts remain authoritative:
- `AGENTS.md`
- `docs/00_master-brief.md`
- `docs/01_decision-log.md`
- `docs/02_ia-v1.md`
- `docs/03_architecture-roadmap-v1.md`
- `packs/development/pack.md`

OpenSpace-driven work must still respect:
- `project_path required before execution`
- `review before done`
- `approval before commit`
- `release-package` and `close-out` linked-worktree guard
- `local-stub` shipped default and narrow live opt-in boundary

## Target Architecture

### Layer 1: shared OpenSpace install
Install OpenSpace once in a shared location outside this repo.

Recommended path:
`/Users/sungjin/dev/personal/agent-infra/OpenSpace`

This layer owns:
- `openspace-mcp`
- OpenSpace workspace state
- downloaded or evolved shared skills
- optional cloud sync if you later opt in

### Layer 2: host-agent MCP registration
Register `openspace-mcp` in the agent host you actually use.

Required environment shape from OpenSpace upstream:

```json
{
  "mcpServers": {
    "openspace": {
      "command": "openspace-mcp",
      "toolTimeout": 600,
      "env": {
        "OPENSPACE_HOST_SKILL_DIRS": "/path/to/agent/skills",
        "OPENSPACE_WORKSPACE": "/Users/sungjin/dev/personal/agent-infra/OpenSpace",
        "OPENSPACE_API_KEY": "optional"
      }
    }
  }
}
```

For Orchestration work, `OPENSPACE_HOST_SKILL_DIRS` should include the directory that contains Orchestration bridge skills.

### Layer 3: repo-local bridge skills
This repo should not vendor the entire OpenSpace codebase.

Instead, add or maintain repo-local skills under:
- `.agents/skills/`

Recommended new skill directories:
- `.agents/skills/orchestration-openspace-bootstrap/`
- `.agents/skills/orchestration-openspace-dev-loop/`
- `.agents/skills/orchestration-openspace-ui/`

These skills should do one job each:
- bootstrap: explain repo contracts and the frozen boundary before any OpenSpace-assisted task
- dev-loop: map a request into the repo's actual `planner -> architect -> task-breaker -> builder -> reviewer` workflow
- ui: enforce shell/UI constraints plus `DESIGN.md` usage when the task touches `ui/`

### Layer 4: repo source-of-truth docs
OpenSpace skills must point back to repo files rather than restating policy from memory.

Each bridge skill should reference:
- `/Users/sungjin/dev/personal/orchestration/AGENTS.md`
- `/Users/sungjin/dev/personal/orchestration/packs/development/pack.md`
- `/Users/sungjin/dev/personal/orchestration/docs/03_architecture-roadmap-v1.md`
- `/Users/sungjin/dev/personal/orchestration/tasks/todo.md`
- `/Users/sungjin/dev/personal/orchestration/tasks/lessons.md`

## Recommended File Layout

```text
orchestration/
├── .agents/
│   └── skills/
│       ├── orchestration-freeze-gate/
│       ├── orchestration-openspace-bootstrap/
│       │   └── SKILL.md
│       ├── orchestration-openspace-dev-loop/
│       │   └── SKILL.md
│       └── orchestration-openspace-ui/
│           └── SKILL.md
├── docs/
│   ├── 08_openspace-integration-plan.md
│   └── 09_design-md-guide.md
└── ui/
    ├── index.html
    ├── app.js
    └── styles.css
```

## Detailed Rollout

### Phase 0: shared infra
1. Clone OpenSpace into the shared infra path.
2. Create a Python 3.12 virtualenv.
3. Install with `pip install -e .`.
4. Verify `openspace-mcp --help`.

Suggested commands:

```bash
git clone https://github.com/HKUDS/OpenSpace.git /Users/sungjin/dev/personal/agent-infra/OpenSpace
cd /Users/sungjin/dev/personal/agent-infra/OpenSpace
python3.12 -m venv .venv
source .venv/bin/activate
pip install -e .
openspace-mcp --help
```

### Phase 1: host skill sync
Copy the upstream host skills into the host-agent skill directory used by your actual agent environment.

Required upstream host skills:
- `delegate-task`
- `skill-discovery`

Example:

```bash
cp -r /Users/sungjin/dev/personal/agent-infra/OpenSpace/openspace/host_skills/delegate-task /path/to/host/skills/
cp -r /Users/sungjin/dev/personal/agent-infra/OpenSpace/openspace/host_skills/skill-discovery /path/to/host/skills/
```

Do not copy those skills into this repo unless you intentionally want repo-local snapshots. Shared host skills should stay shared.

### Phase 2: Orchestration bridge skills
Create repo-local bridge skills that translate generic OpenSpace discovery into this repo's actual rules.

#### `orchestration-openspace-bootstrap`
Responsibilities:
- force reading order before substantial work
- remind the agent that repo files remain authoritative
- block any attempt to bypass frozen boundaries

Suggested `SKILL.md` skeleton:

```md
# orchestration-openspace-bootstrap

Before using evolved skills in this repo:
1. Read `AGENTS.md`.
2. Read `docs/00_master-brief.md`.
3. Read `docs/03_architecture-roadmap-v1.md`.
4. Read `packs/development/pack.md`.
5. Read `tasks/todo.md` and `tasks/lessons.md` when the task is non-trivial.

Never treat OpenSpace state as the source of truth over repo contracts.
Never bypass `project_path`, review, approval, or linked-worktree guards.
```

#### `orchestration-openspace-dev-loop`
Responsibilities:
- map tasks into the existing development pack
- prefer thin slices
- preserve builder/reviewer provenance

Suggested `SKILL.md` skeleton:

```md
# orchestration-openspace-dev-loop

Use this workflow:
`planner -> architect -> task-breaker -> builder-preflight -> builder-live-mutation -> reviewer`

Rules:
- Treat repo docs as source of truth.
- Do not widen runtime, provider, or release semantics.
- If a task changes architecture, route back through architecture review.
- Keep the current artifact taxonomy unchanged.
- Keep reviewer anchored to the latest builder live-mutation bundle only.
```

#### `orchestration-openspace-ui`
Responsibilities:
- limit UI tasks to the current shell semantics
- use `DESIGN.md` only as a visual reference, not as product-policy authority

Suggested `SKILL.md` skeleton:

```md
# orchestration-openspace-ui

When touching `ui/`:
- preserve `Taskboard / Logs / Artifacts / Decision Inbox` as authoritative ops surfaces
- preserve `Mission / Council / Execution / Deliverables` as orientation or primary shell framing only when repo docs already allow it
- do not introduce office-simulator, messenger-first, ranking, or platform-first semantics
- use `DESIGN.md` as visual guidance only
```

### Phase 3: `DESIGN.md` for shell work
This repo has a real UI surface under `ui/`, so `awesome-design-md` is useful here.

Recommended usage:
- pick one `DESIGN.md` that matches the intended control-plane mood
- store it at repo root as `DESIGN.md`
- reference it from the UI bridge skill
- treat it as visual language, not IA or workflow authority

What `DESIGN.md` should influence:
- typography
- spacing rhythm
- density
- action shelf styling
- hero/entry framing
- visual hierarchy across `Mission / Council / Execution / Deliverables`

What `DESIGN.md` must not override:
- task lifecycle
- decision and approval semantics
- worktree rules
- provider boundaries

### Phase 4: evolve the right skills first
Start with the most repetitive, high-signal workflows.

Recommended first targets:
1. planner artifact drafting
2. architect boundary-check artifact drafting
3. task-breaker breakdown drafting
4. reviewer evidence normalization
5. UI copy/hierarchy cleanup for `ui/`

Do not start with:
- `release-package`
- `close-out`
- provider adapter internals
- hidden cleanup or retention mutations

## First Pilot Backlog

### Pilot A: planner + architect assistance
Goal:
- reduce repeated prompt scaffolding
- improve thin-slice planning consistency

Success metric:
- plan and architecture artifacts require less manual cleanup
- no new decision-log drift

### Pilot B: reviewer artifact assistance
Goal:
- make review outputs more consistent
- keep findings and verification formatting stable

Success metric:
- no provenance drift
- no accidental pass on malformed evidence

### Pilot C: UI evolution with `DESIGN.md`
Goal:
- improve visual language in `ui/` without changing runtime semantics

Success metric:
- shell hierarchy becomes clearer
- smoke expectations and control-plane semantics remain unchanged

## Operational Rules

### When to allow OpenSpace
- repetitive development-pack tasks
- reusable prompt and artifact drafting
- UI refinement inside existing product boundaries

### When not to allow OpenSpace to lead
- tasks that alter frozen contracts
- changes that require decision-log updates first
- commit or release authority
- provider boundary changes
- retention/delete/archive semantics

## Minimal Acceptance Checklist
- [x] shared OpenSpace install exists outside the repo at `/Users/sungjin/dev/personal/agent-infra/OpenSpace`
- [x] host MCP config registers `openspace` and points at the shared OpenSpace workspace
- [x] configured host skill dirs include this repo's `.agents/skills`
- [x] reusable host skills `delegate-task` and `skill-discovery` are available in the configured skill dir
- [x] Orchestration bridge skills exist under `.agents/skills/`
- [x] bridge skills point back to repo docs as authority
- [x] optional `DESIGN.md` exists because this repo has an active UI shell
- [x] first pilot remains limited to planner/architect/task-breaker/reviewer/UI assistance
- [x] current smoke and freeze semantics remain unchanged

## Current Verification Status
`node scripts/smoke-openspace-slice-01.mjs` is the current repo wiring check for this
integration. The current verified shape is:

- repo-local bridge skill directories are present
- local OpenSpace skill discovery finds the expected Orchestration bridge skills plus host skills
- Codex MCP config contains `[mcp_servers.openspace]`
- Codex MCP config mentions this repo's `.agents/skills`
- Codex MCP config mentions `/Users/sungjin/dev/personal/agent-infra/OpenSpace`
- `execute_task` reaches OpenSpace runtime initialization from the current shell context
- current shell `execute_task` stops at `blocked_missing_host_llm_credentials` because OpenRouter cookie auth is not visible in this shell context

Treat `blocked_missing_host_llm_credentials` as host execution follow-up, not repo wiring
regression. Do not move OpenSpace state into repo source-of-truth files to work around it.

## Validation After Adoption
After any real rollout, re-run the repo's existing required synthetic gates before treating the integration as accepted.

At minimum, keep the required baseline from `tasks/todo.md` authoritative instead of inventing a new OpenSpace-specific gate.

## Notes
- OpenSpace belongs around the repo, not inside the runtime core.
- This repo is a strong fit because it already has stable workflow boundaries.
- The main risk is semantic drift, not install complexity.

## Current Smoke Commands

This repo now carries dedicated OpenSpace integration smokes:

```bash
node scripts/smoke-openspace-slice-01.mjs
node scripts/smoke-openspace-slice-02.mjs
```

`smoke-openspace-slice-01` checks:
- repo-local bridge skill presence
- Codex MCP config registration for `openspace`
- local `search_skills(..., source="local")` discovery against `.agents/skills`
- best-effort `execute_task(...)` from the current shell context

`smoke-openspace-slice-02` checks:
- this document's minimal acceptance checklist stays aligned with verified repo wiring
- host credential follow-up remains explicit and is not treated as repo wiring regression
- repo source-of-truth files remain authoritative over OpenSpace state

Expected outcomes:
- `executeTask.status == "ok"` means the current shell context can execute OpenSpace end to end
- `executeTask.status == "blocked_missing_host_llm_credentials"` means wiring is correct but the current shell context cannot supply host LLM auth, so execution stops at model auth
- `executeTask.status == "timeout"` means local skill discovery and MCP wiring are ready, but the plain shell smoke budget is not enough to close the execute path in the current host context

The second and third cases should be treated as host execution follow-up, not as repo wiring regression.
