# LLM-native Visual System Convergence Plan

## Decision

Accept one presentation-only convergence slice for the existing LLM-native shell. The slice keeps
Mission, Council, Execution, Deliverables, Advanced Ops, every current action, and every evidence
gate intact while making the browser UI read as one current workbench instead of an LLM shell over
an older card-heavy control plane.

Runtime schema remains v16. API routes, state records, dependencies, provider behavior, action
handlers, review and approval semantics, source mutation, scheduling, commit, push, release, policy,
and connectors are unchanged.

## Evidence Intake

The intake is pattern research, not copied UI or a dependency decision.

| Source | Accepted pattern | Rejected pattern |
| --- | --- | --- |
| Pinterest command-center references | slim navigation, dominant work canvas, compact metadata, contextual side inspection | screenshot copying, unverified component semantics, ornamental dashboard tiles |
| Pinterest chat-workspace reference | chronological reading order and quiet role identity | generic chat bubbles, messenger-first navigation, fake typing activity |
| `beefiker/superloopy` at `009fe0bb36371e989007ccb29e8cd95b9419bf17` | bounded `Plan -> Act -> Observe -> Compare -> Gate` visual QA loop | vendoring its runtime, installing a global harness, widening Orchestration authority |
| DCInside article `thesingularity/1298663` | make the target state visual and keep evidence visible | treating screenshots or untrusted claims as product proof |
| local `pinterest-ui-design` skill | public-source intake, `KEEP / ADAPT / REJECT`, token contract, breakpoint evidence | private-board access, asset copying, automatic release claims |

Reviewed public references:

- `https://kr.pinterest.com/pin/133982157660567603/`
- `https://kr.pinterest.com/pin/810366526739329258/`
- `https://kr.pinterest.com/pin/75646468732936871/`
- `https://github.com/beefiker/superloopy`
- `https://gall.dcinside.com/mgallery/board/view/?id=thesingularity&no=1298663&page=1`

## Implementation Scope

### Semantic workbench tokens

- Add one explicit neutral workbench palette for canvas, rail, surface, dividers, text, selection,
  role identity, gate state, and shadow.
- Use the tokens in the active LLM-native shell and Advanced Ops convergence layer.
- Remove negative letter spacing from the stylesheet. Existing text size and line-height contracts
  remain source-controlled.

### Navigation and workspace header

- Keep the 232px desktop rail and the existing three-row mobile navigation.
- Make `새 미션` the one high-contrast rail command.
- Render every destination as semantic indicator, label, and trailing source count.
- Keep project, provider mode, gate count, refresh state, and refresh command in the existing header.
- At 390px, remove only the redundant current-surface label from presentation, constrain the project
  label, and ellipsize refresh status so the header occupies one actual 44px row.

### Mission workstream

- Keep the source-backed active Mission title, goal, `Thread | Graph`, ordered turns, exact lower gate,
  and existing action.
- Present the lead's navigation-only next-gate context as one bounded accent tool on desktop and one
  normal-flow region on mobile.
- Connect turns with a quiet vertical line while retaining unframed rows and source order.
- Treat the desktop context inspector as one bounded soft-surface tool. It returns to an unframed
  post-workstream section below 1100px.

### Advanced Ops

- Keep every current Taskboard, Logs, Artifacts, Decision Inbox, overview, detail, and action surface.
- Use a neutral canvas with an unframed primary column.
- Reserve frames for repeated records, forms, lanes, and the real detail tool.
- Remove entry-decoration rules from the active Advanced Ops layer.
- Collapse a narrow detail-card briefing grid to one column and allow detail actions and evidence to
  wrap so the page has no root horizontal overflow.

## Verification Gates

1. Static focused smoke proves tokens, navigation structure, Mission timeline, next-gate and inspector
   treatment, Advanced Ops containment, responsive header hierarchy, and zero negative letter
   spacing.
2. Existing shell, header, navigation, title, focus, language, graph, and Task provenance smokes stay
   green.
3. Real-browser checks cover Mission and Taskboard at desktop and 390px, with zero root horizontal
   overflow and no console or request failures.
4. UI QA and aggregate verification pass from the registered source.
5. README, decision log, `DESIGN.md`, and task ledger state the same presentation-only authority
   boundary.

## Explicit Non-goals

- No runtime, API, schema, state, provider, dependency, or route change.
- No action addition, automatic navigation, approval, execution, source mutation, scheduling, commit,
  push, release, policy mutation, or connector authority.
- No external repo vendoring, copied Pinterest asset, new font download, icon package, animation
  framework, or design-system dependency.
- No messenger-first shell, KPI dashboard, marketing hero, gradient identity, nested page-section
  cards, or autonomous-action theatre.

## Rollback

Remove the workbench token and presentation selectors, restore the prior navigation markup order,
and revert the two legacy typography smoke expectations. Runtime state and every source record remain
untouched because this slice performs no write outside repository source changes.
