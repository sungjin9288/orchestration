# LLM-Native Mission Next-Gate Navigation Plan

## Decision

`DEC-156` adds one browser-only navigation cue to the active Mission Thread. It does not add an approval or execution command.

## Problem

The first Mission viewport shows the title and goal, while the source-backed next gate remains below the recorded turns. On a narrow screen this makes the current bounded next step harder to reach even though the existing lower gate already owns the correct action.

## Scope

- Show a compact `Next gate` status in the active Mission lead only when the selected Mission has a non-Mission `nextAction.surface`, an `actionLabel`, and the Thread lower gate is rendered.
- Use one native fragment anchor to the existing lower gate.
- Give that lower gate one mission-specific `id` and `tabindex="-1"` so fragment navigation scrolls and focuses the exact existing target.
- Preserve the existing `open-surface-for-mission` button inside the lower gate as the only authority-bearing action in this lead-to-gate navigation pair.
- Keep Thread as the default and Graph rendering unchanged.

## Non-Goals

- No new handler, route, runtime projection, API, schema, dependency, persistence, provider call, source mutation, commit, push, release, scheduling, policy, or connector behavior.
- No quick link for no selected Mission, an expanded new-Mission composer, Graph mode, missing next-action fields, or a Mission-only next action.
- No change to the Mission composer, recorded turns, lower gate copy, or existing `open-surface-for-mission` handler.

## Interaction Contract

The lead exposes source-backed status and a link only. Following the link lands on the existing lower gate after the recorded evidence. Within this navigation pair, only the lower gate has a button that can open another surface. At 821px and wider the target reserves sticky-header space; at 820px and below it follows normal static-header scrolling. Both the link and target have visible keyboard focus treatment.

## Verification

- `node --check ui/app.js scripts/smoke-ui-slice-690.mjs scripts/ui_qa_status.mjs scripts/verification_status.mjs`
- `node scripts/smoke-ui-slice-690.mjs`
- Compatibility: `674`, `675`, `676`, `677`, `684`, `685`, `686`, `687`, `688`, `689`.
- Browser checks at `1440`, `821`, `820`, and `390`, full UI QA `68/68`, and aggregate verification `264/264` pass.

## Rollback

Remove the lead navigation markup, its styles, and the optional lower-target attributes. The existing lower gate, action handler, source evidence, and all runtime behavior remain unchanged.

Runtime schema: v16 unchanged.

API contract: unchanged.

No runtime, API, schema, dependency, storage, provider, source, Git, or authority change is included.
