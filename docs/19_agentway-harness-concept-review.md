# AgentWay Harness Concept Review

## Purpose
This note records how the two local AgentWay PDFs should influence Orchestration after the completed
v1 baseline:

- `/Users/sungjin/Downloads/book1-claude-code-en.pdf`
- `/Users/sungjin/Downloads/book2-comparing-en.pdf`

The goal is not to copy Claude Code, Codex, or any third-party runtime. The goal is to use the
books as source-only concept signals for Orchestration's existing local-first, single-user-first,
ops-first control plane.

## Sources Checked
- `book1-claude-code-en.pdf`
  - `pdfinfo`: 108 pages, created 2026-04-19, not encrypted.
  - `pdftotext -layout` extracted `tmp/pdfs/book1-claude-code-en.txt`.
  - Main axes reviewed: control plane, query loop, tool permissions, context governance, recovery,
    multi-agent verification, team adoption, and checklists.
- `book2-comparing-en.pdf`
  - `pdfinfo`: 60 pages, created 2026-04-19, not encrypted.
  - `pdftotext -layout` extracted `tmp/pdfs/book2-comparing-en.txt`.
  - Main axes reviewed: Claude Code runtime-first harnessing, Codex explicit control-layer
    harnessing, continuity placement, tool policy, local rules, delegation, and builder guidance.

## Concept Extraction

### 1. Harness Is The Product Boundary
The books converge on a useful judgment: the model is the unstable component, and the harness is
where order lives. For Orchestration this confirms the current architecture choice:

- keep `project_path required`, review, approval, artifacts, and logs as first-class product
  contracts
- do not let the company/ERP shell or visible AI roles become hidden authority
- treat role language as readable surface mapping over the existing bounded execution engine

### 2. Orchestration Should Stay Closer To Explicit Control-Layer Design
The comparison book frames Claude Code as more runtime-first and Codex as more explicit
control-layer-first. Orchestration is already closer to the explicit side:

- repo files define operating policy
- pack files define lifecycle and artifact boundaries
- runtime state persists usability data but does not override repo contracts
- approvals and review are explicit state, not informal conversation outcomes

This should remain the default. Future runtime flexibility can be added only after the explicit
control layer stays inspectable.

### 3. Context Governance Must Not Become Prompt Stacking
The PDFs repeatedly warn against treating more prompt/context as maturity. The local implication is:

- keep `AGENTS.md`, docs, packs, and task ledgers as separate lifetime layers
- use summaries, briefs, or reference notes when importing concepts from large documents
- do not move whole reference books, long transcripts, or broad skill catalogs into normal runtime
  prompt context
- prefer source-backed distilled rules with applicability and rejection criteria

### 4. Tool And Permission Boundaries Are Runtime Semantics
The books treat tools as managed execution interfaces, not generic capability. Orchestration already
implements this through:

- no-write `builder-preflight` before bounded `builder-live-mutation`
- approval records that target exact provenance
- local commit and release follow-up as explicit approval-consuming steps
- linked-worktree and local-demo-only guards

The development implication is to keep any new local helper, harness, or PDF-derived workflow behind
explicit command, proof, and approval boundaries.

### 5. Verification Must Be Independent And Evidence-Bearing
The books' strongest implementation-facing point is that verification cannot be a polite final
gesture. In Orchestration terms:

- reviewer evidence must stay independent from builder output
- doc-only concept adoption still needs grep/source checks
- runtime or UI changes need representative smoke, browser, or source checks
- "done" must stay tied to visible evidence, not confident explanation

### 6. Multi-Agent Value Is Responsibility Partitioning
The PDF material supports Orchestration's visible `Mission / Council / Execution / Deliverables`
direction only when roles partition responsibility:

- `Council` should show role perspective and unresolved conflict, not just personality
- `Execution` should show gates, current owner, and next bounded action
- `Deliverables` should show review, approval, and proof chain
- subagent or multi-agent expansion should not be justified by parallelism alone

## Adopt / Keep / Defer / Reject

| Decision | Concept | Orchestration interpretation |
| --- | --- | --- |
| Adopt | Explicit context lifetime layers | Keep stable policy, product docs, task ledgers, extracted references, and runtime state separate. |
| Adopt | Risk-tiered approval | Continue consequence-based approval boundaries for mutation, commit, release, provider, and external side effects. |
| Adopt | Independent verification | Require verification evidence even for documentation and reference-intake slices. |
| Adopt | Recovery as main path | Treat interrupted, skipped, stale, missing-env, and fail-closed states as normal evidence states. |
| Keep | Explicit control-layer authority | Preserve repo docs and pack contracts as source of truth over runtime display state. |
| Keep | Local-first harness posture | External references remain signal-only unless a local wrapper, evidence path, and gate are defined. |
| Defer | Advanced hooks around every lifecycle event | Useful later, but only after baseline governance and current smokes stay stable. |
| Defer | Persistent memory store | Directionally aligned, but needs explicit ingest, redaction, export, expiry, and approval rules. |
| Reject | Prompt-stacking as context strategy | Do not solve reference intake by loading more long-form text into normal execution context. |
| Reject | Runtime improvisation replacing institutions | Do not let AI-role discussion bypass approval, review, artifact, or pack boundaries. |
| Reject | Multi-provider or messenger-first expansion | The PDFs do not change the existing out-of-scope list. |

## Development Implications

### Immediate Product/Architecture Development
- Add this note as a reference-backed concept gate for future harness and growth work.
- Treat AgentWay books as source-only concept signals beside the existing `OpenHarness`, `OpenClaw`,
  Hermes, and public repo reference notes.
- Use the note when evaluating future proposals for memory, skills, hooks, delegation, or
  continuous-development loops.

### Next Safe Build Candidates
These are candidates, not approvals:

1. A read-only context-governance status command that inventories repo instruction layers and flags
   prompt-stacking risks.
2. A reference-intake checklist for large local PDFs that requires extraction, distilled decisions,
   adoption/rejection criteria, and verification commands.
3. A growth/reflection evaluator rule that checks whether a proposed improvement preserves explicit
   control-layer authority instead of adding tacit runtime behavior.

### Not A Runtime Change
This review does not authorize:

- new provider execution
- new memory persistence
- hook installation
- prompt injection of PDF contents
- autonomous background execution
- commit, push, release, merge, or external publication semantics

## Thin-Slice Checklist
- [x] Extract PDF metadata and text locally.
- [x] Compare the concepts against current repo source-of-truth boundaries.
- [x] Record adopt / keep / defer / reject decisions without copying runtime behavior.
- [x] Preserve local-first, single-user-first, ops-first, development-pack-only constraints.
- [ ] Future slice only: add a read-only status/check command if this concept gate becomes a
      repeated workflow.

## Close-Out Judgment
The useful development move is not to make Orchestration more like Claude Code or Codex directly.
It is to make Orchestration stricter about where uncertainty is caged:

- runtime uncertainty stays inside bounded execution and recovery states
- institutional uncertainty stays inside repo docs, packs, approvals, and review records
- context uncertainty is handled through distilled, source-backed notes instead of bulk prompt
  accumulation

That aligns the PDF concepts with the current Orchestration baseline without widening scope.
