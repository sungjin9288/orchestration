# Orchestration 1.0 Design Direction

## Purpose
This file defines the visual direction for Orchestration 1.0 shell and UI work.

Use it for changes to:
- `ui/index.html`
- `ui/app.js`
- `ui/styles.css`
- related UI copy and visual hierarchy

This file is visual guidance only.

It must not override:
- runtime contracts
- task lifecycle semantics
- decision, review, or approval rules
- provider boundaries
- linked-worktree guards

## Product Tone
Orchestration should feel like:
- a local control room
- a single-operator mission desk
- a bounded execution console
- a thoughtful AI command surface

It should not feel like:
- a corporate office simulator
- a playful AI social app
- a generic dashboard template
- a dark cyberpunk ops cliché

## Core Tension
The product has two coexisting modes:
- primary orchestration framing: `Mission / Council / Execution / Deliverables`
- authoritative ops surfaces: `Taskboard / Logs / Artifacts / Decision Inbox`

The design must help these coexist without semantic drift.

Meaning:
- the top layer can feel cinematic and alive
- the underlying ops surfaces must still read as trustworthy operator tools

## Visual Direction

### Keywords
- warm control plane
- human-scale command center
- editorial operations
- tactile glass and paper
- bounded seriousness

### Visual Metaphor
Think:
- mission planning room
- review desk
- evidence wall
- operations shelf

Not:
- fake office role-play
- surveillance command bunker
- enterprise admin panel monotony

## Color System

### Primary mood
Keep the current warm-earth plus soft-mint family.
The product should feel warmer and more human than typical blue-gray admin consoles.

Suggested direction:

```css
:root {
  --bg-top: #fff6ec;
  --bg-bottom: #edf4ef;
  --panel: rgba(255, 252, 247, 0.84);
  --panel-strong: rgba(255, 253, 250, 0.96);
  --line: rgba(58, 76, 79, 0.14);
  --text: #23333a;
  --muted: #62727a;

  --accent: #cb7654;
  --accent-soft: rgba(203, 118, 84, 0.13);
  --success: #3f8d73;
  --success-soft: rgba(63, 141, 115, 0.14);
  --warning: #be8b3d;
  --warning-soft: rgba(190, 139, 61, 0.14);
  --danger: #c96e62;
  --danger-soft: rgba(201, 110, 98, 0.14);
}
```

### Rules
- warm neutrals should dominate large surfaces
- accent should guide attention, not flood the viewport
- status colors must remain legible and semantically distinct
- glass panels should feel soft and tactile, not glossy and futuristic

### Avoid
- hard black/charcoal dominance
- too much blue enterprise chrome
- fluorescent AI gradients
- overusing one bright accent everywhere

## Typography

### Direction
The UI should feel intentional and slightly editorial.

Preferred families:
- Pretendard
- IBM Plex Sans
- Avenir Next Rounded or Nunito only as secondary personality when already present

### Rules
- headings should feel compact and confident
- support copy should stay readable and shorter than the visual framing invites
- operational labels should be concise and direct
- avoid overly cute or whimsical language

## Layout Principles

### 1. Shell first, spectacle second
The top shell may be expressive, but it must still tell the operator:
- where they are
- what is active
- what needs attention

### 2. Action zones need strong containment
Buttons and next steps should sit inside clear shelves, strips, or action rows.
Do not scatter primary actions like generic utility buttons.

### 3. Preview surfaces need hierarchy
Mission and Council can be more expressive, but Execution and Deliverables must become sharper, denser, and more actionable.

### 4. Ops surfaces must remain trustworthy
Taskboard, Logs, Artifacts, and Decision Inbox should feel like precise control surfaces, not decorative extensions of the hero.

## Surface Guidance

### Mission
Mission should feel like a charter desk.

Preferred:
- clear goal statement
- compact current state
- obvious next action
- restrained motion

### Council
Council may feel staged, but should still read as a decision alignment surface.

Preferred:
- seat or role hierarchy
- concise role summaries
- visible current consensus or disagreement

Avoid:
- theatrical office storytelling that implies runtime behavior not backed by the repo

### Execution
Execution is the sharpest surface.

Preferred:
- stage clarity
- gate clarity
- actionable shelves
- direct state changes

### Deliverables
Deliverables should feel like a review and handoff room.

Preferred:
- evidence-forward structure
- obvious provenance
- clear next-step CTAs

### Advanced Ops Mode
Taskboard, Logs, Artifacts, and Decision Inbox should preserve operator confidence.

Preferred:
- denser layouts
- stronger tabular or strip hierarchy
- less decorative copy
- more evidence and status

## Component Direction

### Header
The header can be cinematic, but it must still be a control header.

Preferred:
- compact status framing
- current project visibility
- runtime and gate cues

Avoid:
- long marketing paragraphs
- novelty first, clarity second

### Chips and pills
Use chips to express:
- role identity
- state
- constraints
- category

They should feel informative, not ornamental.

### Cards
Cards should feel like stations or shelves, not consumer app cards.

Preferred:
- visible edge or rail
- clear title and meta separation
- consistent action placement

### Action shelves
Any area where the operator can act should read as a handling zone.

Preferred:
- short handling copy
- one primary next action
- secondary actions clearly subordinated

## Motion

### Preferred
- soft staggered entrance
- slight hover lift
- subtle rail or glow emphasis on active surface
- compact transitions between surface states

### Avoid
- big parallax movements
- noisy continuous animation
- motion that makes logs, evidence, or gates harder to scan

## Copy Style

### Prefer
- direct Korean operational language
- concrete status wording
- next-step phrasing
- role and stage names that align with repo contracts

### Avoid
- office theater language that implies fake company simulation
- mascot-style voice
- vague AI magic language

Bad examples:
- `참모들이 알아서 다 처리합니다`
- `가상의 조직이 자동으로 움직입니다`
- `놀라운 AI 팀 체험`

## Hard Don'ts
- do not make the product feel like a fake company sim
- do not let visual metaphor outrun runtime truth
- do not hide gates behind decorative framing
- do not flatten advanced ops surfaces into generic pastel cards
- do not introduce a dark-mode bias unless the repo explicitly moves there

## Implementation Checklist
- [ ] keep Mission/Council expressive but bounded
- [ ] keep Execution and Deliverables more operational and shelf-driven
- [ ] preserve advanced ops surfaces as authoritative control surfaces
- [ ] keep warm neutral palette and restrained accent use
- [ ] improve hierarchy before adding new decoration
- [ ] preserve readability and gate visibility above visual novelty
