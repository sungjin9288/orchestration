# Harness Baseline (2026-04)

## Purpose
Define a harness-first baseline for Orchestration 1.0 that is compatible with the existing
local-first / single-user-first / ops-first constraints. This is not a product feature expansion;
it is a development and execution posture: capabilities are added through harnesses (tools,
skills, MCP servers, and local adapters) instead of widening the core runtime surface.

## What "Harness-First" Means Here
- Capabilities are attached via harnesses (MCP servers, skills, local CLI wrappers) rather than
  embedding new logic into the core runtime.
- Harnesses remain optional and local. They must not flip the shipped default away from
  `local-stub` or `local-demo-only`.
- Harnesses must be auditable, with explicit boundaries documented in repo files.
- Harness use is gated by the same approval / review contracts already defined in the pack.

## External Reference Signals (2026-04)
These projects are signals, not direct dependencies:
- `markitdown` (Microsoft): document-to-Markdown CLI with an MCP server option and a wide
  file-type conversion surface. Useful as a local harness for artifact preprocessing and
  documentation ingestion, not as a runtime dependency.
- `hermes-agent` (NousResearch): self-improving agent with skills, memory, MCP integration,
  and multi-provider + multi-platform gateway posture. Useful for thinking about skill registry
  and memory separation, not for multi-platform bots or provider breadth in v1.
- `mempalace` (MemPalace): local-first memory store that keeps raw verbatim conversations and
  exposes an MCP tools posture. Useful as a local-only memory harness signal for future post-v1 work.
- `free-code` fork (Claude Code): CLI harness posture with multi-provider switching and looser
  guardrails as a signal. Not a v1 dependency; do not adopt its multi-provider-first posture.

## Approved Harness Applications (Now)
1. **Document-to-Markdown preprocessing** via `markitdown` CLI
   - Keep it as a local optional CLI wrapper.
   - Use it only for artifact preprocessing or documentation ingestion.
   - Do not embed it into core runtime or auto-run flows.

2. **Memory harness (future-post-v1)**
   - Treat memory as an external harness with explicit ingest/export boundaries.
   - Only local-first memory stores are acceptable.
   - No networked, account-bound, or multi-tenant memory systems in v1.

## Out Of Scope (Still)
- Any harness that implies multi-provider-first execution.
- Messenger-first bot surfaces or multi-platform chat gateways.
- Budget/HR/org-management simulators.
- Multiplayer workspace or team-first runtime semantics.
- "curl | bash" auto-installers or guardrail removal as default guidance.

## Minimal Integration Contract
Harnesses must:
- live outside the core runtime boundary (`src/execution/*` stays minimal)
- be invoked explicitly, not automatically
- leave evidence in logs or artifacts when used
- be documented in repo source-of-truth files (this doc + decision log)

## Harness Intake Checklist (Before Adoption)
- Is it local-first and optional, with no hidden background execution?
- Does it avoid multi-provider-first, messenger-first, or team-first semantics?
- Can we invoke it explicitly and capture evidence without widening runtime scope?
- Does installation avoid "curl | bash" by default, or at least document review-first flow?

## Inventory Posture
- `approved-now`: safe to use as an explicit local helper in the current repo
- `future-post-v1`: acceptable direction, but not part of the current shipped path
- `signal-only`: useful reference signal only; do not normalize into repo defaults

## Concrete Local Tooling (Now)
### `scripts/markitdown-convert.mjs`
Wrapper for optional local `markitdown` CLI usage:
- converts a document into markdown for later inspection
- refuses to run if `markitdown` is not installed
- does not change runtime behavior or UI

### `scripts/harness-status.mjs`
Local harness inventory and posture report:
- reports approved/future/signal-only posture for current external harness references
- checks whether the related local command is available in `PATH`
- makes it explicit that command availability does not imply repo adoption

### `scripts/harness-run.mjs`
Repo-native execution gate for approved harnesses:
- only allows `approved-now` harness ids to execute
- rejects `future-post-v1` and `signal-only` harnesses even if they are installed locally
- currently dispatches only to the `markitdown` wrapper
- `node scripts/harness-run.mjs list` reports the currently executable harness ids
- `node scripts/harness-run.mjs info <harness-id>` reports posture, runner, local availability, executable status, and install-review guidance for one harness
- `node scripts/harness-run.mjs doctor` reports a host-level summary of `ready / install-required / deferred / policy-blocked`
  plus an ordered `actionQueue`, top-level `nextAction`, `readyHarnessIds`, `installRequiredHarnessIds`, `deferredHarnessIds`, and `policyBlockedHarnessIds`
  plus a compact `summary` object, including `currentHostState`, `primaryHarnessId`, `primaryHarnessState`, `primaryRecommendedAction`, `primaryInstallReview`, `primaryInstallReviewRequired`, `primaryNote`, `primaryPosture`, `primaryKind`, `primaryCommand`, `primaryRunner`, `primaryExecutable`, `primaryAvailable`, `primaryReady`, `primaryActionShort`, and `primaryActionMessage`,
  so the operator or consumer can read the current host posture and its representative harness without recomputing counts, booleans, or priority from the full payload

#### Frozen `doctor.summary` contract for this milestone
The compact summary is frozen for the current harness-baseline milestone with these keys:
- `currentHostState`
- `primaryHarnessId`
- `primaryHarnessState`
- `primaryRecommendedAction`
- `primaryInstallReview`
- `primaryInstallReviewRequired`
- `primaryNote`
- `primaryPosture`
- `primaryKind`
- `primaryCommand`
- `primaryRunner`
- `primaryExecutable`
- `primaryAvailable`
- `primaryReady`
- `primaryActionShort`
- `primaryActionMessage`

#### Completion boundary
- This milestone ends at the repo-native harness governance contract: `status / info / list / doctor / synthetic bundle`.
- Further `doctor.summary` field additions are not part of this milestone. Any new field requires a separate milestone or explicit consumer-driven justification.
- `consumer integration` and `host-ready install` stay as follow-up tracks and are not part of this completion batch.

### `scripts/harness_verification_status.mjs`
Repo-native harness verification bundle:
- runs harness inventory status plus smoke slices `01` through `04`, `06`, `07`, `08`, `09`, `10`, `11`, `12`, `13`, `14`, `15`, `16`, `17`, `18`, `19`, `20`, `21`, `22`, `23`, `24`, `25`, `26`, `27`, `28`, `29`, `30`, `31`, and `32`
- reports one synthetic harness status payload for the current repo posture
- keeps harness verification separate from broader runtime or UI verification bundles

## Verification
Use:
- `node scripts/harness-status.mjs`
- `node scripts/harness-run.mjs <harness-id> ...`
- `node scripts/harness-run.mjs list`
- `node scripts/harness-run.mjs info <harness-id>`
- `node scripts/harness-run.mjs doctor`
- `node scripts/harness_verification_status.mjs`
- `node --check scripts/markitdown-convert.mjs`
- `node scripts/smoke-harness-slice-01.mjs`
- `node scripts/smoke-harness-slice-02.mjs`
- `node scripts/smoke-harness-slice-03.mjs`
- `node scripts/smoke-harness-slice-04.mjs`
- `node scripts/smoke-harness-slice-05.mjs`
- `node scripts/smoke-harness-slice-06.mjs`
- `node scripts/smoke-harness-slice-07.mjs`
- `node scripts/smoke-harness-slice-08.mjs`
- `node scripts/smoke-harness-slice-09.mjs`
- `node scripts/smoke-harness-slice-10.mjs`
- `node scripts/smoke-harness-slice-11.mjs`
- `node scripts/smoke-harness-slice-12.mjs`
- `node scripts/smoke-harness-slice-13.mjs`
- `node scripts/smoke-harness-slice-14.mjs`
- `node scripts/smoke-harness-slice-15.mjs`
- `node scripts/smoke-harness-slice-16.mjs`
- `node scripts/smoke-harness-slice-17.mjs`
- `node scripts/smoke-harness-slice-18.mjs`
- `node scripts/smoke-harness-slice-19.mjs`
- `node scripts/smoke-harness-slice-20.mjs`
- `node scripts/smoke-harness-slice-21.mjs`
- `node scripts/smoke-harness-slice-22.mjs`
- `node scripts/smoke-harness-slice-23.mjs`
- `node scripts/smoke-harness-slice-24.mjs`
- `node scripts/smoke-harness-slice-25.mjs`
- `node scripts/smoke-harness-slice-26.mjs`
- `node scripts/smoke-harness-slice-27.mjs`
- `node scripts/smoke-harness-slice-28.mjs`
- `node scripts/smoke-harness-slice-29.mjs`
- `node scripts/smoke-harness-slice-30.mjs`
- `node scripts/smoke-harness-slice-31.mjs`
- `node scripts/smoke-harness-slice-32.mjs`
