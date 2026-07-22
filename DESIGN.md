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
| `canvas` | `#f7f7f8` | app and navigation background |
| `workspace` | `#ffffff` | primary reading surface |
| `surface-soft` | `#f3f4f6` | composer and secondary controls |
| `line` | `#e5e7eb` | dividers and inactive boundaries |
| `line-strong` | `#cbd5e1` | selected and focus boundaries |
| `text` | `#18181b` | primary copy |
| `text-soft` | `#64646d` | metadata and supporting copy |
| `accent` | `#0f766e` | active navigation, focus, primary action |
| `council` | `#2563eb` | council reasoning and synthesis |
| `execution` | `#7c3aed` | bounded execution activity |
| `success` | `#15803d` | current proof and approved state |
| `warning` | `#b45309` | waiting gate or operator attention |
| `danger` | `#b42318` | blocked, failed, rejected |

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
- Recent Mission context and `Mission / Council / Execution / Deliverables` are the primary links.
- Company directory and deep runtime controls are demoted to optional inspection.
- `Taskboard / Logs / Artifacts / Decision Inbox` remain available as Advanced Ops.

### Workspace Header

- One compact line shows current project, local/provider mode, refresh state, and open gate count.
- It must not become a second dashboard or repeat the sidebar.

### Prompt Composer

- The Mission composer is the first-viewport focal point.
- Goal text is primary; title, project, constraints, deliverable type, and Council mode are supporting
  context.
- The composer remains an explicit submit boundary. Typing never starts provider or mutation work.
- Use a clear command button; mode selection should read as a compact control, not three competing
  hero CTAs.

### Agent Workstream

- Render work chronologically: operator goal, Council positions and synthesis, execution progress,
  review/QA, delivery, and the next operator gate.
- Each turn has a small role marker, role label, status, content, and source/evidence affordance.
- Use unframed rows and dividers instead of chat bubbles or nested cards.
- Tool and run activity uses compact inline status rather than fake typing animation.

### Context Inspector

- Desktop may show one narrow right inspector for current Mission, authority, next gate, and evidence.
- Mobile places the inspector after the workstream or behind an explicit disclosure.
- Deep IDs, logs, packets, and legacy controls remain available under a details disclosure or
  Advanced Ops.

## 5. Surface Semantics

- `Mission`: goal composer, current Mission thread, recent Mission history
- `Council`: source-backed role positions, conflict, synthesis, operator alignment
- `Execution`: WorkOrders, current step, bounded progress, approval and resume gates
- `Deliverables`: result, verification, review, package, acceptance, close-out
- `Advanced Ops`: Taskboard, logs, artifacts, Decision Inbox, harness and deep evidence controls

The visual language may be conversational, but authority must remain procedural. A model response is
not an approval, a displayed plan is not execution, and a completed turn is not Mission completion.
The shell must keep `review before done` and `approval before commit` visible at the current gate.

## 6. Layout

- Desktop: `220-240px navigation / fluid workstream / 260-320px optional inspector`.
- Keep the reading column near 760-860px even on wide screens.
- The first viewport should expose the composer and either recent work or the first agent turn.
- Do not place more than one metadata band above the workspace.
- Do not use page-section cards. Cards are reserved for repeated durable records or a genuinely
  bounded tool.
- Use stable widths, min/max constraints, and fixed control heights so status changes do not shift the
  shell.

## 7. Interaction And Accessibility

- Keep visible keyboard focus and the existing skip link.
- Navigation exposes one current item; inactive items omit `aria-current`.
- Agent turns and execution stages use ordered/list semantics where sequence matters.
- Loading, provider, approval, and failure states are announced without moving focus unexpectedly.
- Destructive or authority-widening actions never hide behind an icon-only control.
- Familiar icon-only controls require an accessible name and tooltip.

## 8. Responsive Behavior

- Under 820px, the navigation becomes a compact top rail and the workspace starts in the first
  viewport.
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
- Desktop and mobile screenshots show the composer in the first viewport.
- There is no horizontal overflow, clipped action text, console error, or inaccessible current state.
- Runtime schema, approval semantics, provider boundaries, and source mutation authority are unchanged
  unless separately approved.
