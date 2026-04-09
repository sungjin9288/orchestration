# DESIGN.md

## 1. Visual Theme & Atmosphere

Orchestration should feel like a company operating system for AI work, not a marketing website and not a playful game.

- Mood: deliberate, executive, operational, dense, calm
- Product posture: ERP/control-plane, boardroom, assignment desk, approval line, delivery desk
- Emotional target: "a team of AI staff is on shift and working this mission now"
- Preferred feel: warm enterprise surfaces, ink-heavy typography, structured boards, status-rich chrome
- Avoid: poster heroes, floating marketing cards, candy gradients, empty whitespace for its own sake, whimsical mascot tone

This shell should look distributable to other operators and companies.

## 2. Color Palette & Roles

Use semantic colors consistently. Prefer restrained enterprise tones over startup neon or purple SaaS gradients.

| Token | Hex | Role |
| --- | --- | --- |
| `canvas` | `#f4efe6` | app background |
| `surface` | `#fbf8f2` | default panel |
| `surface-strong` | `#fffdf8` | elevated panel / active desk |
| `surface-ink` | `#1f2732` | dark ribbon / masthead band |
| `line` | `#cdbfa9` | borders, grid separators |
| `line-strong` | `#a99579` | active rails, desk accents |
| `text` | `#202733` | primary copy |
| `text-soft` | `#5d645f` | secondary copy |
| `mission` | `#8b5a2b` | intake / charter / mission accent |
| `council` | `#335f4d` | meeting / council accent |
| `execution` | `#375d78` | work-order / execution accent |
| `deliverables` | `#79622f` | delivery / approval accent |
| `approval` | `#2f6a45` | approved / ready signal |
| `warning` | `#b26a1f` | caution / pending decision |
| `danger` | `#9f4032` | blocked / failed / rejected |
| `info` | `#3c5f89` | neutral informational state |

## 3. Typography Rules

The shell should feel like enterprise software with a point of view.

- Primary UI font: `IBM Plex Sans`, `Segoe UI`, `Helvetica Neue`, sans-serif
- Editorial / section emphasis: `IBM Plex Serif`, `Georgia`, serif
- Operational ids / logs / artifact ids: `IBM Plex Mono`, `SFMono-Regular`, monospace

Hierarchy:

- App title / shell title: serif or strong sans, 30-36px, semibold
- Surface title: sans, 22-26px, semibold
- Desk / board title: sans, 16-18px, semibold
- Status / queue label: sans, 12-13px, medium, uppercase optional
- Helper copy: sans, 13-14px, regular
- Operational metadata: mono, 12-13px

Rules:

- Headlines should feel operational, not promotional.
- Use serif selectively for authority, not everywhere.
- IDs, run numbers, artifact ids, and paths should always read as machine-readable.

## 4. Component Stylings

### Masthead
- Dense horizontal bar with current project, current mission, active approvals, current role owner
- Reads like a control bar, not a hero banner

### Status Chips
- Compact, rectangular, slightly industrial
- Color-coded by semantics, never rainbow-only decoration
- Always pair color with text

### Desk Cards
- Panels should feel like desks, boards, or packets
- Strong top rail or left rail is acceptable
- Use active-state accents to indicate current owner or current handoff

### Queue / Register Rows
- Prefer structured rows over free-floating cards when listing missions, attendees, tasks, or artifacts
- Each row should expose owner, state, and next action without opening detail first

### Council Attendee Cards
- Must show role, attendance/state, stance, and current responsibility
- Should read like meeting participants, not fantasy characters

### Approval Line
- Keep a visible linear sequence: current packet, current approver, current allowed next action
- Approval zones should look procedural and trustworthy

### Artifact Packet
- Deliverables should feel bundled and signed off
- Show packet summary, evidence list, reviewer stance, and next approval clearly

## 5. Layout Principles

- Desktop-first density is acceptable; do not design this like a broad landing page
- Prefer aligned boards, registers, shelves, and desk clusters over isolated hero cards
- Use consistent rails and separators to make the company workflow legible
- Keep current owner / current state / next handoff visible above the fold
- Advanced Ops can be denser than the primary shell, but it must still share the same design language
- First viewport must answer `what is active / who owns it / what is blocked / what is next` without requiring the user to read multiple stacked strips
- Do not stack more than one meta/status band above the active workspace
- Left rail should be queue-first and action-first; long intro prose belongs below the fold or should be removed
- Company feel should come from visible staff, ownership, approvals, and packets, not from repeating metaphor nouns
- Prefer `selection rail + active detail + evidence rail` over a sequence of independent summary cards

Grid guidance:

- Desktop: 12-column grid or equivalent aligned board system
- Main shell: masthead + command strip + primary board area
- Surface-level layout should prioritize information hierarchy over symmetry

## 6. Depth & Elevation

- Surfaces should layer like paper, folders, and desks
- Use restrained shadows and strong borders
- Prefer edge definition and top rails over glassmorphism
- Active panels may glow slightly in their semantic color, but keep it subtle

## 7. Do's And Don'ts

### Do
- Design like an internal operating system for a company team of AI roles
- Show who is active, who is waiting, and who needs approval
- Make `Mission / Council / Execution / Deliverables` feel like connected workday surfaces
- Keep `advanced ops mode` visually aligned with the main shell
- Use enterprise density and structured panel hierarchy

### Don't
- Don't build a marketing homepage hero
- Don't hide critical workflow state behind decorative cards
- Don't use purple-on-dark startup gradients as the default look
- Don't make a pixel office, management sim, or playful empire game
- Don't let AI roles feel like mascots without responsibilities
- Don't make the shell look like a generic chatbot with tabs

## 8. Responsive Behavior

- Mobile should collapse boards into stacked desks, not turn everything into giant cards
- Keep current owner, current gate, and next action visible early in the mobile flow
- Sticky action bars are acceptable when they preserve approvals and next-step clarity
- Dense data can collapse, but semantic grouping must remain obvious

## 9. Agent Prompt Guide

When redesigning the UI, use prompts like:

- "Design this as a company ERP-style command center for AI orchestration."
- "Make the shell feel like an operations boardroom with assigned AI staff, attendance, queues, and approval lines."
- "Avoid marketing-site hero patterns; use structured desks, shelves, registers, and work-order density."
- "Keep advanced ops aligned with the same enterprise visual language."

Quick reminders for agents:

- `Mission` = intake board + assignment register
- `Council` = meeting room + attendee roster + objections board
- `Execution` = work-order floor + queue + gate control
- `Deliverables` = delivery desk + packet + approval line
- `Advanced Ops` = deep inspection control plane

Research note:

- Detailed external synthesis and the current-shell diagnosis live in `docs/11_orchestration-ui-research.md`
