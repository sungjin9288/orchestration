# LLM-Native Primary Workstream Language Plan

- Decision: `DEC-157`
- Scope: browser-only language hierarchy for Mission, Council, Execution, and Deliverables
- Runtime schema: v16 unchanged
- API contract: unchanged

## Goal

Use natural Korean operator language for system-authored primary status tokens and section labels.
Keep `Mission`, `Council`, `Execution`, `Deliverables`, `Thread`, and `Graph` as product object names.

## Contract

- Mission changes `Next gate` to `다음 단계`, `Context` to `미션 정보`, and removes
  system-composed task and artifact identifiers from the visible Thread and context summary. Exact
  Mission and Task references remain in the existing collapsed detail.
- Council replaces primary raw task tokens, role count, synthesis, dissent, alignment, and review
  display labels. The existing collapsed source disclosure retains exact Mission, Task, Session, Mode,
  and Phase references.
- Execution replaces primary task/run/approval/inbox tokens and section labels. The existing evidence
  disclosure retains exact Task, Latest run, Approval, and Decision Inbox references.
- Deliverables replaces primary task/status/artifact-count tokens and section labels. The existing
  evidence disclosure retains exact Task, ExecutionPlan, Checkpoint, DeliveryPackage, Acceptance,
  Close-out, and artifact references. Known source-flow statuses use explicit display labels;
  unknown statuses fail closed as `확인 필요` with danger tone instead of appearing as normal waiting.
- Source-derived, provider-authored, and user-authored content stays byte-for-byte in its existing
  rendering path. Action attributes, disabled/readiness conditions, render order, and handlers stay
  unchanged.

## Verification

- `node --check ui/app.js`
- `node scripts/smoke-ui-slice-691.mjs`
- Existing focused compatibility slices 651, 671, 674, 677-680, 683, 684, and 687-690
- README and completion-inventory source smokes, UI QA, aggregate verification, and a 1440/821/820/390
  browser matrix that checks natural primary labels, collapsed exact refs, unchanged action readiness,
  zero write requests, overflow, and browser errors

## Boundaries

No runtime/API/schema/dependency/storage/provider/source-mutation/Git authority changes are permitted.
No new module, dependency, endpoint, persistence, or automatic action is introduced.
