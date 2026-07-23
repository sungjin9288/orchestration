# LLM-native First-viewport Corrective Redesign Plan

## Status

- Decision: `DEC-160`
- Scope: browser presentation only
- Runtime schema: v16 unchanged
- Authority: existing project create/select and Mission navigation contracts only

## Problem

`DEC-159` normalized colors, spacing, navigation metadata, Mission chronology, and overflow, but the
first viewport retained the previous light rail, centered prerequisite copy, and three equal-weight
fields. The implementation was technically coherent without reading as a real redesign to the
operator.

The corrective slice must change the scan path and workspace composition, not only CSS tokens.

## Design Outcome

### Shell

- Use one charcoal command rail on desktop and the existing three-row mobile navigation topology.
- Keep the brand, new-Mission command, all eight destinations, source counts, Mission history, and
  Advanced Ops disclosure unchanged.
- Make the new-Mission command the rail's high-contrast white command and active destinations a
  restrained rail selection with a visible accent edge.

### First-run Mission workspace

- Replace the centered heading-plus-form stack with a two-column desktop workspace:
  - left: prerequisite title, exact lifecycle stages, and authority boundary;
  - right: one bounded local-project command surface.
- Keep the first-run heading and copy source-controlled by `ui/project-bootstrap.js`.
- Make `project_path` the dominant first field while preserving the existing field names and submit
  action.
- Keep project name and pack as compact supporting fields.
- Use one solid project-connect command; remove the visible legacy gradient.

### Mobile

- Preserve the three-row navigation and one-line workspace metadata.
- Collapse the first-run workspace to one column.
- Keep the title on natural Korean word boundaries.
- Keep path, name, pack, and project-connect command visible in the 390x844 first viewport.
- Preserve zero root horizontal overflow.

## Compatibility

- No runtime, API, route, schema, storage, provider, dependency, or state change.
- No new action, automatic project registration, Mission creation, selection, execution, approval,
  source mutation, scheduling, commit, push, release, policy mutation, or connector authority.
- Existing `create-project-from-mission`, `projectName`, `projectPath`, and `projectPack` contracts
  remain authoritative.
- Active Mission, Council, Execution, Deliverables, and Advanced Ops renderers retain their current
  evidence and gate semantics.

## Verification Gates

1. Focused source smoke proves the dark rail, structural first-run workspace, dominant path field,
   solid command, mobile layout, and unchanged action contracts.
2. Existing first-run, active Mission, mobile navigation, workspace header, and visual convergence
   smokes remain green.
3. Browser evidence covers loaded desktop and mobile states plus the first-run presentation at
   1440x900 and 390x844.
4. Browser checks prove zero root horizontal overflow, visible mobile project-connect command,
   natural heading wrapping, keyboard focus, and zero console errors.
5. UI QA and aggregate verification pass with README, inventory, and task ledger counts aligned.

## Rollback

Remove the DEC-160 wrapper classes and final presentation override block. Restore the previous
first-run stack without changing any runtime state or source record.
