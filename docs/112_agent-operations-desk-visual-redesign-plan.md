# Agent Operations Desk Visual Redesign Plan

## Status

- Decision: `DEC-161`
- Scope: browser presentation and source-backed UI composition only
- Runtime schema: v16 unchanged
- Authority: existing Mission, Council, Execution, Deliverables, and Advanced Ops actions only
- Reference access date: 2026-07-23

## Problem

The DEC-160 first viewport was structurally different from its predecessor, but the selected-Mission
state still read as a generic internal admin page. The main canvas had weak density, the agent
timeline looked like a basic activity list, the next gate used a pastel status card, and the context
inspector did not create a distinct LLM workspace identity.

The redesign must make the current object, agent work, and next operator command legible in one scan
without turning the product into a chat clone, dashboard mosaic, or office simulation.

## Reference Ledger

| Decision | Source | Observed pattern | Local consequence |
| --- | --- | --- | --- |
| ADAPT | [Codex app](https://openai.com/index/introducing-the-codex-app/) | Projects own separate agent threads and long-running work stays inspectable in context. | Keep Mission as the active thread and make role-authored work the dominant canvas. |
| ADAPT | [Linear](https://linear.app/) | Compact navigation, dense selected states, and quiet metadata preserve focus. | Use compact coded navigation marks, grouped rows, and a narrow context tool instead of dashboard cards. |
| ADAPT | [Raycast AI Chat](https://manual.raycast.com/ai/chat) | A focused command surface keeps the next operator action clear without a permanent toolbar. | Present the exact source-backed next gate as one dark command dock. |
| ADAPT | [Task and Project Management Dashboard Pin](https://www.pinterest.com/pin/189010515618491878/) | A visible workflow sequence gives orientation before detail. | Preserve Mission, Council, Execution, and Deliverables as an ordered workstream with sparse role color. |
| ADAPT | [Pipeline View Pin](https://www.pinterest.com/pin/pipeline-view-by-stead-on-dribbble--105130972549826741/) | Stage progression is readable through aligned state and restrained separators. | Keep chronological turns connected and number them without adding inferred progress. |
| KEEP | Existing Orchestration authority gates | Review, approval, source evidence, and blocked states are already operationally correct. | Change hierarchy and presentation only; do not restyle blocked work as available. |
| REJECT | [AI Innovation Workspace Pin](https://www.pinterest.com/pin/516717757248110779/) as a canvas model | Infinite-canvas composition supports divergent ideation rather than a source-ordered execution thread. | Keep Thread as the default reading model and Graph as the explicit read-only alternate. |
| REJECT | Neon dark analytics and card mosaics | Decorative metrics and equal-weight tiles compete with the current Mission. | Use one light work canvas, one dark rail, one dark command surface, and no KPI grid. |

Pinterest detail pages returned `403` to automated fetches. Their public search previews and metadata
are composition-only, medium-confidence references; no interaction behavior or asset is inferred from
them. Mobbin search was unavailable because the connected account requires a paid plan.

## Visual Thesis

**Agent Operations Desk:** a graphite project rail around a cool paper workspace, with source-backed
agent work grouped into one continuous thread, exact authority in one high-contrast context tool, and
the next allowed action in one high-contrast command dock.

### Foundations

- graphite navigation: `#111318`
- cool paper canvas: `#eff1ee`
- reading surface: `#fbfcfa`
- primary ink: `#15171a`
- interaction accent: mint `#6ed6be` with dark readable text
- Council, Execution, Deliverables retain distinct blue, violet, and green role signals
- radius is 8px or less; elevation is limited to the grouped thread, inspector, and command dock
- motion is 120ms named-property feedback only and is removed under reduced motion

### Desktop

- Keep one 224px project rail with compact coded destinations and exact source counts.
- Treat the active Mission title and next gate as one masthead.
- Group chronological turns in one continuous source-backed reading surface.
- Present the next gate as a dark command dock after the recorded thread.
- Make the right context inspector a dark, sticky, bounded tool rather than another light page card.

### Mobile

- Keep the three-row navigation topology but remove the outlined desktop-like tab container.
- Use a compact underline current state and hide decorative destination marks.
- Keep the Mission title, next-gate summary, new-Mission command, and Thread/Graph selector in order.
- Return the context inspector to an unframed light region after the primary thread.
- Preserve 44px action targets and zero horizontal overflow at 390x844.

## Compatibility

- Existing routes, `data-action` values, form names, source counts, Mission selection, Thread/Graph
  mode, Council actions, Execution actions, delivery actions, and Advanced Ops destinations remain
  unchanged.
- No runtime, API, schema, persistence, dependency, provider, source mutation, scheduling, commit,
  push, release, policy, or connector authority is added.
- The redesign does not infer progress, completion, approval, recommendation, or availability.

## Verification

1. Focused source smoke proves the Agent Operations Desk tokens and composition.
2. Existing Mission focus, mode, navigation, next-gate, mobile, graph, and visual convergence smokes
   remain green.
3. Browser evidence covers 1280x720 and 390x844 Mission plus a mobile Council navigation state.
4. Browser checks prove exact current navigation, zero root horizontal overflow, visible focus, and
   no action-contract drift.
5. UI QA and aggregate verification pass with README, completion inventory, and task ledgers aligned.

## Rollback

Remove the DEC-161 markup additions and the final Agent Operations Desk style layer. Preserve every
runtime and source record, then rerun focused UI and aggregate verification.
