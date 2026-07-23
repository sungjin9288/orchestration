# DESIGN.md

## 1. Product Experience

Orchestration should feel like an LLM-native workbench for directing a bounded AI team. The first
interaction is a goal, the main narrative is the team's work, and operational evidence remains one
step away without taking over the screen.

- Mood: quiet, intelligent, focused, responsive
- Product posture: prompt-first orchestration workspace with visible agents and explicit gates
- Emotional target: "I can state the work once, follow the reasoning, and intervene at the right gate"
- Preferred feel: generous neutral canvas, strong text hierarchy, restrained semantic color, visible
  model activity, compact provenance
- Avoid: ERP dashboards, directory-first shells, KPI mosaics, generic chat bubbles, marketing heroes,
  decorative gradients, or autonomous-action theatre

This is not a chatbot clone. Conversation is the reading model; Mission, Council, Execution,
Deliverables, review, and approval remain the product model.

## 2. Visual System

Use near-neutral surfaces so active work, agent identity, and gate state carry the color.

| Token | Hex | Role |
| --- | --- | --- |
| `canvas` | `#f5f6f7` | app and Advanced Ops background |
| `navigation` | `#f8f9fa` | compact navigation rail |
| `workspace` | `#ffffff` | primary reading surface |
| `surface-soft` | `#f1f3f4` | inspector and secondary controls |
| `line` | `#e1e5e8` | dividers and inactive boundaries |
| `line-strong` | `#c8d0d6` | selected and focus boundaries |
| `text` | `#171a1f` | primary copy |
| `text-soft` | `#4e5660` | supporting copy |
| `muted` | `#747d87` | metadata and quiet labels |
| `accent` | `#0f766e` | active navigation, focus, primary action |
| `accent-soft` | `#e8f3f1` | selected row and bounded next-gate context |
| `accent-line` | `#b9d8d3` | selected and gate boundary |
| `council` | `#315cbd` | council reasoning and synthesis |
| `execution` | `#6d5bd0` | bounded execution activity |
| `success` | `#2f7d4c` | current proof and approved state |
| `warning` | `#a85d14` | waiting gate or operator attention |
| `danger` | `#a33b32` | blocked, failed, rejected |

Rules:

- Do not cover large regions with a semantic color.
- Do not use gradients or glow as product identity.
- Use color with text or shape; color alone never communicates state.
- Border radius stays at 8px or below.

## 3. Typography

- Primary UI: `Inter`, `Pretendard`, `IBM Plex Sans`, system sans-serif
- Operational IDs and paths: `IBM Plex Mono`, `SFMono-Regular`, monospace
- Do not use an editorial serif in the product shell.
- Do not scale type with viewport width and do not use negative letter spacing.

Hierarchy:

- Workspace prompt: 28-34px, semibold, one concise question
- Workstream heading: 18-22px, semibold
- Turn body: 14-16px with comfortable line-height
- Metadata and gate labels: 11-13px
- IDs and digests: 11-12px mono

## 4. Primary Shell

### Compact Navigation Rail

- Brand and `새 미션` action come first.
- Desktop uses one charcoal command rail so navigation is visibly distinct from the reading canvas.
  The mobile three-row rail uses the same dark identity without changing its topology.
- `새 미션` is the rail's one high-contrast command. Workstream destinations use a small semantic
  indicator, one readable label, and a trailing count rather than equal-weight pills.
- Recent Mission context and `Mission / Council / Execution / Deliverables` are the primary links.
- Current Mission title and count stay visible in one compact native disclosure; opening it shows the
  source-current newest-first Mission list and reuses the existing explicit selection path.
- The full Mission register may remain in the Mission workspace for detailed lifecycle inspection,
  but quick Mission switching belongs beside the new-Mission command.
- Company directory and deep runtime controls are demoted to optional inspection.
- `Taskboard / Logs / Artifacts / Decision Inbox` remain available as Advanced Ops.
- Advanced Ops uses one native disclosure below the primary links, not `workflows / review / ops`
  tabs with equal visual weight. Entering an Advanced Ops surface opens it; returning to the primary
  workstream closes it.
- Pending gate count may remain visible on the disclosure summary, but deep surface counts and controls
  appear only after the operator opens Advanced Ops.

### Workspace Header

- One compact line shows current project, local/provider mode, refresh state, and open gate count.
- It must not become a second dashboard or repeat the sidebar.
- At 390px, keep that metadata on one actual line: project truncates first, the redundant current
  surface label drops, and refresh copy ellipsizes while provider mode, gate count, and the refresh
  command remain visible.

### Prompt Composer

- The Mission composer is the first-viewport focal point when no Mission is selected or the operator
  explicitly starts a new Mission.
- An active Mission prioritizes its title and `Thread | Graph` workstream; new-Mission creation stays
  available as one compact command and expands into the same explicit composer.
- Goal text is primary; title, project, constraints, deliverable type, and Council mode are supporting
  context.
- The composer remains an explicit submit boundary. Typing never starts provider or mutation work.
- Use a clear command button; mode selection should read as a compact control, not three competing
  hero CTAs.
- Council mode uses one native segmented control and one Mission submit command; disabled provider
  modes keep their readiness reason visible without becoming a second action.
- Before a project exists, the first screen states that prerequisite directly and uses one unframed
  local-path form. Do not place project connection inside nested panels or repeat an empty-state card.
- The first-run desktop viewport pairs one Mission context column with one bounded project command
  surface. `project_path` is the dominant first field; name and pack are supporting context. Mobile
  keeps path, name, pack, and the submit command visible in the 390x844 first viewport.

### Agent Workstream

- Render work chronologically: operator goal, Council positions and synthesis, execution progress,
  review/QA, delivery, and the next operator gate.
- Render only turns backed by current Mission evidence. Do not present future Execution or
  Deliverables stages as if they were completed conversation turns; the next gate owns that pending
  state.
- The active Mission lead is the conversation title. Do not repeat that title in the thread heading
  or the Operator turn.
- Each turn has a small role marker, role label, status, content, and source/evidence affordance.
- Use unframed rows and dividers instead of chat bubbles or nested cards.
- Connect chronological turns with one quiet vertical rule so sequence reads before surface framing.
- Tool and run activity uses compact inline status rather than fake typing animation.

### Mission Evidence Graph

- `Thread` remains the default Mission reading model; `Graph` is an explicit alternate view for the
  selected Mission.
- The graph projects source-backed Mission, Council, Execution, Verification, Delivery, and Learning
  records. It does not infer actions, persist layout, or change runtime state.
- Keep the projection at 250 nodes or fewer. Larger source sets use deterministic truncation and
  state the excluded count.
- Stage color, node size, text status, keyboard labels, and a semantic list fallback work together;
  color alone never communicates record state.
- Desktop may use a bounded scroll area for the SVG. At 390px, replace the SVG with the semantic
  evidence list so the page keeps zero horizontal overflow.
- Let sparse projections use a short canvas derived from the densest stage instead of reserving the
  large-graph viewport. In the mobile list, empty stages keep their heading and count but do not add
  a repeated empty-state paragraph.
- Keep graph exploration compact: one short-field search, one lifecycle menu, one status menu, and
  one reset command. These controls filter the current response; they do not become a query builder.
- Selecting a node should emphasize only that node and its direct visible neighbors, then show exact
  source and relationship refs in one unframed detail region below the graph.
- Desktop SVG nodes and mobile list buttons share the same selected state and keyboard behavior.
  Explorer state stays in browser memory and clears when the Mission changes.

### Context Inspector

- Desktop may show one narrow right inspector for current Mission, authority, next gate, and evidence.
- The desktop inspector is one bounded soft-surface tool, not another page section; it becomes
  unframed after the workstream when the optional third column collapses.
- Mobile places the inspector after the workstream or behind an explicit disclosure.
- Deep IDs, logs, packets, and legacy controls remain available under a details disclosure or
  Advanced Ops.

### Council Conversation

- Council is a source-backed review flow, not a boardroom simulation or group chat.
- Lead with the selected Mission, then render independent role positions, one Conductor synthesis,
  recorded dissent, and the operator alignment gate in that order.
- Do not repeat the same Mission, participant, recommendation, or gate evidence through hero cards,
  attendance boards, heartbeat rails, handoff decks, and outcome shelves.
- Keep source ids, provider attempts, execution evidence, revision input, and WorkOrder preparation in
  collapsed secondary details. Approval and stop remain visible before those secondary controls.
- Render no typing indicators, avatars, seating charts, synthetic agreement, future role turns, or
  inferred messages.

### Execution Flow

- Lead with the selected Mission and linked task, then show the current source-backed checkpoint and
  its one bounded operator command before the broader progress record.
- Render Strategist, Architect, Decomposer, Maker, and Critic as one ordered execution progress list.
  Completed, current, blocked, and waiting labels must come from the existing checkpoint projection.
- Do not repeat the current gate through a command board, a second judgment deck, a gate queue card,
  and a separate action shelf.
- Keep exact run, approval, inbox, artifact, preflight, harness, and readiness evidence in collapsed
  secondary details. Those details may explain authority but must not create or select an action.
- The visible command must reuse an existing action handler and exact readiness boolean. Rendering it
  never resolves an approval, advances a stage, or starts background work.

### Deliverables Flow

- Lead with the selected Mission and linked task, then show the current source-backed delivery state
  and at most one existing bounded operator command.
- Render Result, Verification, Package, Acceptance, and Close-out once in source order. A stage may
  be complete, current, or waiting only from its current artifact, review, package, acceptance, and
  close-out records; missing evidence must never look completed.
- Do not repeat artifact, review, approval, and handoff state through a delivery board, completion
  register, evidence rail, package shelf, and a second approval desk.
- Keep exact record refs, approval and Decision Inbox ids, package review controls, close-out controls,
  and post-close-out learning or memory handoffs in collapsed secondary details.
- Deliverables must not place Harness tooling before the result. Harness commands remain part of
  Execution or Advanced Ops.
- The visible command must reuse existing package persistence, acceptance, close-out, Execution, or
  Mission handlers and their current readiness contracts. Rendering it never infers acceptance,
  closes a Mission, or advances a stage.

### Task Execution Provenance Graph

- Task Detail may expose one secondary, default-closed `Execution Provenance` disclosure. It is not a
  primary navigation destination and never replaces Taskboard, Logs, Artifacts, or Decision Inbox.
- The disclosure reads one exact active-project Task projection in Context, Plan, Build, Verify,
  Deliver, and Close lanes. Opening it may fetch; search, filters, focus, and selected detail remain
  browser-local and do not change Task selection or workflow state.
- Desktop uses a bounded SVG and mobile uses the same source-backed records as a semantic list.
  Node size describes provenance tier, not graph degree; dashed amber edges describe recorded gates.
- The graph is inspection only. It has no control for approval, execution, resume, source mutation,
  commit, push, release, persistence, layout save, or automatic navigation.

## 5. Surface Semantics

- `Mission`: goal composer, current Mission thread or read-only evidence graph, recent Mission history
- `Council`: source-backed role positions, conflict, synthesis, operator alignment
- `Execution`: WorkOrders, current step, bounded progress, approval and resume gates
- `Deliverables`: result, verification, review, package, acceptance, close-out
- `Advanced Ops`: Taskboard, logs, artifacts, Decision Inbox, harness and deep evidence controls

Secondary operations evidence follows the authoritative workspace in a native, default-closed
disclosure. It stays absent from primary workflows and retains the existing renderer, browser-local,
and authority contracts when opened from Advanced Ops.

Mission Thread keeps the next gate visible as source-backed status in the active Mission lead. The
lead may link to the existing lower gate after the recorded evidence, but it must never duplicate that
gate's approval or execution action. Graph stays a separate read-only view.

Primary workstream copy uses natural operator language for system-authored status and section labels.
`Mission`, `Council`, `Execution`, `Deliverables`, `Thread`, and `Graph` remain product object names;
exact IDs, internal status, and provenance remain in existing default-closed evidence details.
Source-derived, provider-authored, and user-authored text is not rewritten for presentation.

The visual language may be conversational, but authority must remain procedural. A model response is
not an approval, a displayed plan is not execution, and a completed turn is not Mission completion.
The shell must keep `review before done` and `approval before commit` visible at the current gate.

## 6. Layout

- Desktop: `220-240px navigation / fluid workstream / 260-320px optional inspector`.
- Keep the reading column near 760-860px even on wide screens.
- The first viewport should expose either the explicit composer plus recent work, or the selected
  Mission title plus its current workstream.
- Do not place more than one metadata band above the workspace.
- Do not use page-section cards. Cards are reserved for repeated durable records or a genuinely
  bounded tool.
- Advanced Ops uses a neutral canvas, one unframed primary column, and individually bounded repeated
  records or tools. Do not put one framed page panel around those framed records.
- Use stable widths, min/max constraints, and fixed control heights so status changes do not shift the
  shell.
- A redesign must change the first-viewport scan path, composition, or control hierarchy. Token-only
  recoloring, spacing normalization, and unchanged DOM proportions are polish, not redesign proof.

## 7. Interaction And Accessibility

- Keep visible keyboard focus and the existing skip link.
- Desktop workspace focus reserves the sticky header height with a scroll margin on the existing
  `main.surface-stack`; the 820px-and-below mobile header stays static and keeps its current scroll
  behavior.
- Periodic snapshot reads that change only the read timestamp must preserve the current DOM, focus,
  caret, drafts, disclosures, and scroll position. Explicit refresh remains a full reconciliation;
  a visible selected log may update only its own surface when append-only content changes; stale
  responses for a previous selection must be discarded.
- Navigation exposes one current item; inactive items omit `aria-current`.
- Agent turns and execution stages use ordered/list semantics where sequence matters.
- Evidence graph nodes are keyboard focusable and expose label, kind, status, and source reference.
- Loading, provider, approval, and failure states are announced without moving focus unexpectedly.
- Destructive or authority-widening actions never hide behind an icon-only control.
- Familiar icon-only controls require an accessible name and tooltip.

## 8. Responsive Behavior

- Under 820px, the navigation becomes a compact top rail and the workspace starts in the first
  viewport.
- In its collapsed state, the mobile rail uses three rows: brand and new Mission, the four primary
  workstream links, then current Mission and Advanced Ops. Opening either native disclosure may grow
  the rail and gives that disclosure the full width needed for readable source-current choices.
- The collapsed current-Mission summary keeps the complete title readable through natural wrapping;
  it must not trade context for a one-line ellipsis.
- Hide the company roster and non-current group descriptions on mobile.
- Keep the composer, current gate, and next action visible before deep evidence.
- Controls wrap by intent; labels never truncate into ambiguous actions.
- The page must have zero horizontal overflow at 390px.

## 9. Do And Do Not

### Do

- Start from a goal and show the team working through it.
- Make agent roles visible through authored work, not through a large staff directory.
- Let reasoning, execution state, and evidence read in one chronological stream.
- Keep approval, source mutation, commit, push, and release gates explicit.
- Preserve Advanced Ops as the authoritative inspection layer.

### Do Not

- Do not make the first screen an ERP dashboard or company directory.
- Do not imitate a consumer messenger with alternating bubbles.
- Do not hide current authority, source, gate, or failure state for visual simplicity.
- Do not add fake streaming, fake autonomy, or decorative agent activity.
- Do not turn the shell into a landing page, office simulation, or provider marketplace.

## 10. Verification

Every primary-shell change must prove:

- Mission submit and existing route/action contracts still work.
- Council, Execution, Deliverables, and Advanced Ops remain reachable.
- Desktop and mobile screenshots show the full composer in explicit compose mode and the selected
  Mission workstream in the active-Mission first viewport.
- There is no horizontal overflow, clipped action text, console error, or inaccessible current state.
- Runtime schema, approval semantics, provider boundaries, and source mutation authority are unchanged
  unless separately approved.
