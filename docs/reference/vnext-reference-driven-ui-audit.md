# vNext Reference-Driven UI Audit

## Purpose

This audit fixes the reference boundary for the vNext shell redesign. The goal is not to clone another product. The goal is to combine proven patterns into an Orchestration-specific shell that stays local-first, approval-gated, and evidence-rich.

## Reference Matrix

| Reference | Adopt | Reject |
| --- | --- | --- |
| Linear | Fast navigation, low-noise hierarchy, human-and-agent workflow language | Roadmap-first team workspace, generic issue tracker posture |
| LangSmith Studio | Agent debugging, traces, evaluation, and state inspection as one operator workspace | Generalized hosted agent IDE or broad deployment console |
| Retool | Dense internal-tool layout, register rows, permission-aware operational framing | Broad app builder, database connector expansion, enterprise admin scope |
| Dify | Workflow visibility, agentic workflow structure, RAG/observability adjacency | Visual canvas as the primary surface, provider marketplace posture |
| n8n HITL | Human approval that pauses risky tool use and shows approve/deny decisions clearly | Channel-first approval routing, chat/messenger-first flow |
| Zapier | Governed automation, runtime reliability, audit-trail language | Generic automation marketplace and app-integration breadth |
| NN/g 2026 UX | Trust, transparency, control, consistency, and support when AI fails | AI novelty, decorative sparkle, or claims that outpace evidence |

## Implemented Design Implications

- The shell uses a warm enterprise palette from `DESIGN.md` rather than a generic blue SaaS palette.
- The first viewport centers `operator runway`, current owner, current gate, next action, and evidence location.
- Growth learning is displayed as read-only evidence extraction, not as autonomous learning completion.
- Personalization is local-only UI preference: recent desks, preferred project hint, and evidence density.
- Advanced ops surfaces remain visible and aligned with the same register, packet, and approval-line grammar.
- The proposal review gate displays record-opening prerequisites, but durable proposal record creation and long-term memory stay blocked by `DEC-048`.

## Authority Boundary

The vNext UI may display growth candidates and local preferences, but it must not grant these authorities:

- provider calls
- memory persistence
- long-term memory store
- proposal generation or proposal application
- durable proposal record creation or persistence
- source mutation
- commit or push
- hidden gateway action

Any future step that changes those authorities requires a separate decision entry and focused smoke coverage.

## Verification Hooks

The UI implementation exposes source-checkable markers:

- `GROWTH_AUTHORITY_BOUNDARY`
- `UI_PREFERENCE_STORAGE_KEY`
- `data-growth-learning-surface="read-only"`
- `data-personalization-scope="local-only"`
- `data-provider-calls-allowed="false"`
- `data-memory-persistence-allowed="false"`
- `data-long-term-memory-store-allowed="false"`
- `data-proposal-record-creation-allowed="false"`
- `data-proposal-record-persistence-allowed="false"`
- `data-source-mutation-allowed="false"`
