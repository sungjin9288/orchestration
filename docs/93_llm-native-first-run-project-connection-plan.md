# LLM-Native First-Run Project Connection Plan

## Status

- Decision: `DEC-142`
- Authority: delegated non-critical usability implementation
- Scope: Mission first-run project connection presentation only
- Runtime schema: v16 unchanged
- API contract: existing project create and select routes unchanged

## Problem

The first Mission screen asks what the operator wants to do even when no active project exists and a
Mission cannot yet be created. It then nests a surface panel, bootstrap panel, empty state, and form,
so the actual local path input and command fall below the first mobile viewport. The command also
wraps across multiple lines. The screen reads like an operations form instead of a direct LLM-native
entry gate.

## Product Boundary

This slice makes the prerequisite explicit and removes presentation-only nesting:

- the lead asks the operator to connect or select a project before asking for a Mission
- the first-project state omits the redundant empty-project card
- one unframed form exposes name, local path, work type, and one project connection command
- existing projects remain selectable when the active project is absent
- compact defaults show the selected pack, local-stub mode, and review/approval gate

The existing project create/select routes, absolute `project_path` validation, default local-stub
provider, project pack values, Mission handoff, and Advanced Ops provider/worktree controls do not
change.

## View Model

`ui/project-bootstrap.js` owns the first-run and project-selection copy through
`getMissionProjectBootstrapState(data)`. The renderer consumes that small state object instead of
repeating project-count branches across the lead, bootstrap panel, and command label.

## Interaction And Accessibility

- The page heading states the actual prerequisite.
- Existing semantic labels and native inputs/select remain intact.
- The command stays on one line and becomes full-width on narrow mobile screens.
- Desktop uses stable name/path/type columns; mobile uses one column with no horizontal overflow.
- Focus, validation, form submission, refresh, project selection, and Mission creation behavior stay
  on the existing paths.

## Verification

Focused smoke proves both pure view-model branches, first-project empty-state removal, unframed
composition, concise labels and command, existing route handoff, and the absence of runtime/API/schema
or dependency changes. Existing bootstrap/API smoke and browser runner copy targets remain compatible.
Real-browser QA covers desktop/mobile first viewport, text fit, focus order, zero horizontal overflow,
and zero console warnings or errors. Closure includes UI QA, README/inventory evidence, `git diff
--check`, and aggregate verification.

## Rollback

Restore the previous Mission-only outer panel and explanatory bootstrap framing, remove the Mission
bootstrap view-model export and focused smoke, and retain every runtime record unchanged.

## Still Blocked

- project auto-discovery, filesystem browsing, recent-project enumeration, or path recommendation
- provider setup, provider calls, worktree creation, source mutation, or execution from first-run
- automatic Mission creation, automatic scheduling, or background work
- runtime/API/schema/dependency changes, approval bypass, commit, push, release, policy mutation, or
  connectors
