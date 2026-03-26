# todo

## milestone-m4-live-freeze

### current live baseline [accepted]
- [x] shipped default stays `local-stub`, and downstream delivery stance stays `local-demo-only`
- [x] explicit live opt-in uses canonical `openai-responses` project config with non-secret metadata only
- [x] the current live execution boundary is frozen at `planner -> architect -> task-breaker -> builder-preflight -> builder-live-mutation -> reviewer`
- [x] `builder-live-mutation` stays anchored to the latest approved preflight pair and persists atomic `change-summary / patch / diff` bundles only
- [x] `reviewer` stays anchored to the latest successful builder live-mutation bundle only and keeps `commit-package -> local commit -> release-package -> close-out` as explicit downstream local follow-up
- [x] `milestone-m4-live-freeze` does not add capability or change runtime, execution, or UI semantics

### regression / verification [required freeze gate]
- [x] unchanged required local baseline from `milestone-m3-freeze` remains green
- [x] `node scripts/smoke-dev-loop-m2.mjs`
- [x] `node scripts/smoke-runtime-slice-05.mjs`
- [x] `node scripts/smoke-runtime-slice-06.mjs`
- [x] `node scripts/smoke-execution-slice-05.mjs`
- [x] `node scripts/smoke-execution-slice-06.mjs`
- [x] `node scripts/smoke-execution-slice-07.mjs`
- [x] `node scripts/smoke-execution-slice-08.mjs`
- [x] `node scripts/smoke-execution-slice-09.mjs`
- [x] `node scripts/smoke-execution-slice-10.mjs`
- [x] `node scripts/smoke-execution-slice-11.mjs`
- [x] `node scripts/smoke-ui-slice-11.mjs`
- [x] `node scripts/smoke-ui-slice-12.mjs`
- [x] `node scripts/smoke-worktree-slice-03.mjs`
- [x] required live-provider synthetic baseline remains green
- [x] `node scripts/smoke-provider-slice-04.mjs`
- [x] `node scripts/smoke-provider-slice-05.mjs`
- [x] `node scripts/smoke-provider-slice-06.mjs`
- [x] `node scripts/smoke-provider-slice-07.mjs`
- [x] `node scripts/smoke-qa-slice-04.mjs`
- [x] `node scripts/smoke-qa-slice-05.mjs`
- [x] `node scripts/smoke-qa-slice-06.mjs`
- [x] `node scripts/smoke-qa-slice-07.mjs`

### optional real-live verification [non-blocking]
- [x] optional real-live verification is fully separate from the required freeze gate
- [x] missing `OPENAI_API_KEY` or `OPENAI_RESPONSES_MODEL` records `skipped` and does not fail `milestone-m4-live-freeze`
- [x] `ops-verification-m5-01` ran on `2026-03-23` as a non-blocking operational verification; env snapshot was `OPENAI_API_KEY=false`, `OPENAI_RESPONSES_MODEL=false`, so `skipped` was recorded as the normal result and `model` was recorded separately as `(unset)`
- [x] `node scripts/smoke-provider-live-slice-02.mjs` recorded `status=skipped`, `model=(unset)`
- [x] `node scripts/smoke-provider-live-slice-03.mjs` recorded `status=skipped`, `model=(unset)`
- [x] `node scripts/smoke-provider-live-slice-05.mjs` recorded `status=skipped`, `model=(unset)`
- [x] `node scripts/smoke-provider-live-slice-06.mjs` recorded `status=skipped`, `model=(unset)`
- [x] `node scripts/smoke-provider-live-slice-07.mjs` recorded `status=skipped`, `model=(unset)`
- [x] `node scripts/smoke-qa-live-slice-04.mjs` recorded `status=skipped`, `model=(unset)`
- [x] `node scripts/smoke-qa-live-slice-05.mjs` recorded `status=skipped`, `model=(unset)`
- [x] `node scripts/smoke-qa-live-slice-06.mjs` recorded `status=skipped`, `model=(unset)`
- [x] `node scripts/smoke-qa-live-slice-07.mjs` recorded `status=skipped`, `model=(unset)`
- [x] `ops-verification-m5-02` ran on `2026-03-25` as a non-blocking operational verification; env snapshot was `OPENAI_API_KEY=true`, `OPENAI_RESPONSES_MODEL=gpt-5.4`, and each script result was recorded without changing the required freeze gate
- [x] `node scripts/smoke-provider-live-slice-02.mjs` recorded `status=pass`, `model=gpt-5.4`
- [x] `node scripts/smoke-qa-live-slice-04.mjs` recorded `status=pass`, `model=gpt-5.4`
- [x] `node scripts/smoke-qa-live-slice-05.mjs` recorded `status=pass`, `model=gpt-5.4`
- [x] `node scripts/smoke-provider-live-slice-03.mjs` recorded `status=fail (stale expectation suspected)`, `model=gpt-5.4`
- [x] `node scripts/smoke-provider-live-slice-05.mjs` recorded `status=fail (stale expectation suspected)`, `model=gpt-5.4`
- [x] `node scripts/smoke-provider-live-slice-06.mjs` recorded `status=fail (stale expectation suspected)`, `model=gpt-5.4`
- [x] `node scripts/smoke-provider-live-slice-07.mjs` recorded `status=fail (real timeout observed)`, `model=gpt-5.4`
- [x] `node scripts/smoke-qa-live-slice-06.mjs` recorded `status=fail (real timeout observed)`, `model=gpt-5.4`
- [x] `node scripts/smoke-qa-live-slice-07.mjs` recorded `status=fail (real timeout observed)`, `model=gpt-5.4`
- [x] current `main` now aligns `scripts/smoke-provider-live-slice-03.mjs`, `scripts/smoke-provider-live-slice-05.mjs`, and `scripts/smoke-provider-live-slice-06.mjs` to the frozen reviewer/downstream readiness truth (`ready`, `allowed=true`), so the recorded stale failures remain historical operational evidence until the next configured-env rerun
- [x] current `main` now carries stage-level timeout diagnostics for `scripts/smoke-provider-live-slice-07.mjs`, `scripts/qa-slice-06-runner.mjs`, and `scripts/qa-slice-07-runner.mjs`, including `stageTimings`, `timeoutBudgetMs`, and failure-message suffixes with `stage` plus `durationMs`
- [x] `ops-verification-m5-10` reran the six target optional real-live entrypoints on `2026-03-26` from the current Codex execution context on `main@6ce61a7`; env snapshot remained `OPENAI_API_KEY=false`, `OPENAI_RESPONSES_MODEL=(unset)`, so each result recorded fresh `skipped_missing_env` evidence and no stale/semantic/timeout reclassification was possible from this context
- script: `node scripts/smoke-provider-live-slice-03.mjs`
  status: `skipped`
  model: `(unset)`
  failureClass: `skipped_missing_env`
  reason: `OPENAI_API_KEY and OPENAI_RESPONSES_MODEL are required for the optional real live smoke.`
  evidence: `observedAt=2026-03-26; branch=main; commit=6ce61a7; envVisible={OPENAI_API_KEY:false, OPENAI_RESPONSES_MODEL:(unset)}; output={"ok":true,"skipped":true,"reason":"OPENAI_API_KEY and OPENAI_RESPONSES_MODEL are required for the optional real live smoke."}`
- script: `node scripts/smoke-provider-live-slice-05.mjs`
  status: `skipped`
  model: `(unset)`
  failureClass: `skipped_missing_env`
  reason: `OPENAI_API_KEY and OPENAI_RESPONSES_MODEL are required for the optional real live smoke.`
  evidence: `observedAt=2026-03-26; branch=main; commit=6ce61a7; envVisible={OPENAI_API_KEY:false, OPENAI_RESPONSES_MODEL:(unset)}; output={"ok":true,"skipped":true,"reason":"OPENAI_API_KEY and OPENAI_RESPONSES_MODEL are required for the optional real live smoke."}`
- script: `node scripts/smoke-provider-live-slice-06.mjs`
  status: `skipped`
  model: `(unset)`
  failureClass: `skipped_missing_env`
  reason: `OPENAI_API_KEY and OPENAI_RESPONSES_MODEL are required for the optional real live smoke.`
  evidence: `observedAt=2026-03-26; branch=main; commit=6ce61a7; envVisible={OPENAI_API_KEY:false, OPENAI_RESPONSES_MODEL:(unset)}; output={"ok":true,"skipped":true,"reason":"OPENAI_API_KEY and OPENAI_RESPONSES_MODEL are required for the optional real live smoke."}`
- script: `node scripts/smoke-provider-live-slice-07.mjs`
  status: `skipped`
  model: `(unset)`
  failureClass: `skipped_missing_env`
  reason: `OPENAI_API_KEY and OPENAI_RESPONSES_MODEL are required for the optional real live smoke.`
  evidence: `observedAt=2026-03-26; branch=main; commit=6ce61a7; envVisible={OPENAI_API_KEY:false, OPENAI_RESPONSES_MODEL:(unset)}; output={"ok":true,"skipped":true,"reason":"OPENAI_API_KEY and OPENAI_RESPONSES_MODEL are required for the optional real live smoke."}`
- script: `node scripts/smoke-qa-live-slice-06.mjs`
  status: `skipped`
  model: `(unset)`
  failureClass: `skipped_missing_env`
  reason: `OPENAI_API_KEY and OPENAI_RESPONSES_MODEL are required for the optional real live smoke.`
  evidence: `observedAt=2026-03-26; branch=main; commit=6ce61a7; envVisible={OPENAI_API_KEY:false, OPENAI_RESPONSES_MODEL:(unset)}; output={"ok":true,"skipped":true,"reason":"OPENAI_API_KEY and OPENAI_RESPONSES_MODEL are required for the optional real live smoke."}`
- script: `node scripts/smoke-qa-live-slice-07.mjs`
  status: `skipped`
  model: `(unset)`
  failureClass: `skipped_missing_env`
  reason: `OPENAI_API_KEY and OPENAI_RESPONSES_MODEL are required for the optional real live smoke.`
  evidence: `observedAt=2026-03-26; branch=main; commit=6ce61a7; envVisible={OPENAI_API_KEY:false, OPENAI_RESPONSES_MODEL:(unset)}; output={"ok":true,"skipped":true,"reason":"OPENAI_API_KEY and OPENAI_RESPONSES_MODEL are required for the optional real live smoke."}`
- [x] `ops-verification-m5-11` reran the same six target optional real-live entrypoints on `2026-03-26` with configured env reconstructed transiently from recent local shell export history; `OPENAI_RESPONSES_MODEL=gpt-5.4` was present, but all six runs failed against current `main` with provider HTTP `401`, so the fresh configured-env result class is `semantic_fail`, not `stale_expectation`, `timeout_or_429`, or `skipped_missing_env`
- script: `node scripts/smoke-provider-live-slice-03.mjs`
  status: `fail`
  model: `gpt-5.4`
  failureClass: `semantic_fail`
  reason: `Configured env was present, but the live provider request failed with HTTP 401 before planner completed.`
  evidence: `observedAt=2026-03-26; branch=main; commit=6ce61a7; httpStatus=401; logPath=/tmp/orchestration-live-ops-20260326/smoke-provider-live-slice-03.log; callSite=runPlanner; runId/artifactId unavailable because planner artifact creation did not complete`
- script: `node scripts/smoke-provider-live-slice-05.mjs`
  status: `fail`
  model: `gpt-5.4`
  failureClass: `semantic_fail`
  reason: `Configured env was present, but the live provider request failed with HTTP 401 before planner completed.`
  evidence: `observedAt=2026-03-26; branch=main; commit=6ce61a7; httpStatus=401; logPath=/tmp/orchestration-live-ops-20260326/smoke-provider-live-slice-05.log; callSite=runPlanner; runId/artifactId unavailable because planner artifact creation did not complete`
- script: `node scripts/smoke-provider-live-slice-06.mjs`
  status: `fail`
  model: `gpt-5.4`
  failureClass: `semantic_fail`
  reason: `Configured env was present, but the live provider request failed with HTTP 401 before planner completed.`
  evidence: `observedAt=2026-03-26; branch=main; commit=6ce61a7; httpStatus=401; logPath=/tmp/orchestration-live-ops-20260326/smoke-provider-live-slice-06.log; callSite=runPlanner; runId/artifactId unavailable because planner artifact creation did not complete`
- script: `node scripts/smoke-provider-live-slice-07.mjs`
  status: `fail`
  model: `gpt-5.4`
  failureClass: `semantic_fail`
  reason: `Configured env was present, but the live provider request failed with HTTP 401 at the planner stage before any downstream live stage ran.`
  evidence: `observedAt=2026-03-26; branch=main; commit=6ce61a7; httpStatus=401; logPath=/tmp/orchestration-live-ops-20260326/smoke-provider-live-slice-07.log; stage=planner; durationMs=469; stageTimings=[{"durationMs":469,"stage":"planner","status":"error"}]; runId/artifactId unavailable because planner artifact creation did not complete`
- script: `node scripts/smoke-qa-live-slice-06.mjs`
  status: `fail`
  model: `gpt-5.4`
  failureClass: `semantic_fail`
  reason: `Configured env was present and the browser path reached approved builder execution, but the live provider request failed with HTTP 401 at the builder live-mutation API stage.`
  evidence: `observedAt=2026-03-26; branch=main; commit=6ce61a7; httpStatus=401; logPath=/tmp/orchestration-live-ops-20260326/smoke-qa-live-slice-06.log; stage=run-builder-live-mutation-api; durationMs=478; stageTimings=[{"durationMs":2105,"stage":"prepare-browser-harness","status":"ok"},{"durationMs":291,"stage":"browser-bootstrap-landing","status":"ok"},{"durationMs":27,"stage":"register-live-project","status":"ok"},{"durationMs":2382,"stage":"browser-refresh-after-project","status":"ok"},{"durationMs":302,"stage":"verify-browser-project-summary","status":"ok"},{"durationMs":95,"stage":"create-task","status":"ok"},{"durationMs":15,"stage":"prepare-upstream-context","status":"ok"},{"durationMs":2320,"stage":"browser-refresh-before-approval-request","status":"ok"},{"durationMs":83,"stage":"request-builder-approval","status":"ok"},{"durationMs":82,"stage":"wait-builder-approval-pending","status":"ok"},{"durationMs":77,"stage":"approve-builder-approval","status":"ok"},{"durationMs":75,"stage":"wait-builder-approval-approved","status":"ok"},{"durationMs":0,"stage":"queue-builder-live-mutation-response","status":"ok"},{"durationMs":2348,"stage":"browser-refresh-before-builder-run","status":"ok"},{"durationMs":10891,"stage":"browser-verify-builder-run-entry","status":"ok"},{"durationMs":478,"stage":"run-builder-live-mutation-api","status":"error"}]`
- script: `node scripts/smoke-qa-live-slice-07.mjs`
  status: `fail`
  model: `gpt-5.4`
  failureClass: `semantic_fail`
  reason: `Configured env was present and the browser path reached approved builder execution, but the live provider request failed with HTTP 401 at the builder live-mutation API stage.`
  evidence: `observedAt=2026-03-26; branch=main; commit=6ce61a7; httpStatus=401; logPath=/tmp/orchestration-live-ops-20260326/smoke-qa-live-slice-07.log; stage=run-builder-live-mutation-api; durationMs=486; stageTimings=[{"durationMs":1766,"stage":"prepare-browser-harness","status":"ok"},{"durationMs":288,"stage":"browser-bootstrap-landing","status":"ok"},{"durationMs":25,"stage":"register-live-project","status":"ok"},{"durationMs":2314,"stage":"browser-refresh-after-project","status":"ok"},{"durationMs":259,"stage":"verify-browser-project-summary","status":"ok"},{"durationMs":83,"stage":"create-task","status":"ok"},{"durationMs":17,"stage":"prepare-upstream-context","status":"ok"},{"durationMs":2304,"stage":"browser-refresh-before-approval-request","status":"ok"},{"durationMs":81,"stage":"request-builder-approval","status":"ok"},{"durationMs":74,"stage":"wait-builder-approval-pending","status":"ok"},{"durationMs":79,"stage":"approve-builder-approval","status":"ok"},{"durationMs":105,"stage":"wait-builder-approval-approved","status":"ok"},{"durationMs":0,"stage":"queue-builder-live-mutation-response","status":"ok"},{"durationMs":2743,"stage":"browser-refresh-before-builder-run","status":"ok"},{"durationMs":10320,"stage":"browser-verify-builder-run-entry","status":"ok"},{"durationMs":486,"stage":"run-builder-live-mutation-api","status":"error"}]`
- [x] `ops-verification-m5-12` generated a replacement OpenAI API key on `2026-03-26`, confirmed it with `/v1/models` (`200`), registered it into the current login-session env as `OPENAI_API_KEY` plus `OPENAI_RESPONSES_MODEL=gpt-5.4`, and reran the same six target optional real-live entrypoints on `main@6ce61a7`; the fresh current-main result class is now `timeout_or_429` across all six targets, replacing the earlier `skipped_missing_env` and `401`-only blocker states with current operational evidence
- script: `node scripts/smoke-provider-live-slice-03.mjs`
  status: `fail`
  model: `gpt-5.4`
  failureClass: `timeout_or_429`
  reason: `The replacement key authenticated successfully, but the planner live request failed with provider HTTP 429.`
  evidence: `observedAt=2026-03-26; branch=main; commit=6ce61a7; httpStatus=429; logPath=/tmp/orchestration-live-ops-20260326-newkey/smoke-provider-live-slice-03.log; callSite=runPlanner; runId/artifactId unavailable because planner artifact creation did not complete`
- script: `node scripts/smoke-provider-live-slice-05.mjs`
  status: `fail`
  model: `gpt-5.4`
  failureClass: `timeout_or_429`
  reason: `The replacement key authenticated successfully, but the planner live request failed with provider HTTP 429.`
  evidence: `observedAt=2026-03-26; branch=main; commit=6ce61a7; httpStatus=429; logPath=/tmp/orchestration-live-ops-20260326-newkey/smoke-provider-live-slice-05.log; callSite=runPlanner; runId/artifactId unavailable because planner artifact creation did not complete`
- script: `node scripts/smoke-provider-live-slice-06.mjs`
  status: `fail`
  model: `gpt-5.4`
  failureClass: `timeout_or_429`
  reason: `The replacement key authenticated successfully, but the planner live request failed with provider HTTP 429.`
  evidence: `observedAt=2026-03-26; branch=main; commit=6ce61a7; httpStatus=429; logPath=/tmp/orchestration-live-ops-20260326-newkey/smoke-provider-live-slice-06.log; callSite=runPlanner; runId/artifactId unavailable because planner artifact creation did not complete`
- script: `node scripts/smoke-provider-live-slice-07.mjs`
  status: `fail`
  model: `gpt-5.4`
  failureClass: `timeout_or_429`
  reason: `The replacement key authenticated successfully, but the planner stage failed with provider HTTP 429 before downstream live stages ran.`
  evidence: `observedAt=2026-03-26; branch=main; commit=6ce61a7; httpStatus=429; logPath=/tmp/orchestration-live-ops-20260326-newkey/smoke-provider-live-slice-07.log; stage=planner; durationMs=620; stageTimings=[{"durationMs":620,"stage":"planner","status":"error"}]`
- script: `node scripts/smoke-qa-live-slice-06.mjs`
  status: `fail`
  model: `gpt-5.4`
  failureClass: `timeout_or_429`
  reason: `The replacement key authenticated successfully and the browser path reached approved builder execution, but the builder live-mutation API request failed with provider HTTP 429.`
  evidence: `observedAt=2026-03-26; branch=main; commit=6ce61a7; httpStatus=429; logPath=/tmp/orchestration-live-ops-20260326-newkey/smoke-qa-live-slice-06.log; stage=run-builder-live-mutation-api; durationMs=1307; stageTimings=[{"durationMs":3869,"stage":"prepare-browser-harness","status":"ok"},{"durationMs":428,"stage":"browser-bootstrap-landing","status":"ok"},{"durationMs":38,"stage":"register-live-project","status":"ok"},{"durationMs":2439,"stage":"browser-refresh-after-project","status":"ok"},{"durationMs":414,"stage":"verify-browser-project-summary","status":"ok"},{"durationMs":332,"stage":"create-task","status":"ok"},{"durationMs":28,"stage":"prepare-upstream-context","status":"ok"},{"durationMs":2470,"stage":"browser-refresh-before-approval-request","status":"ok"},{"durationMs":103,"stage":"request-builder-approval","status":"ok"},{"durationMs":97,"stage":"wait-builder-approval-pending","status":"ok"},{"durationMs":97,"stage":"approve-builder-approval","status":"ok"},{"durationMs":99,"stage":"wait-builder-approval-approved","status":"ok"},{"durationMs":0,"stage":"queue-builder-live-mutation-response","status":"ok"},{"durationMs":2444,"stage":"browser-refresh-before-builder-run","status":"ok"},{"durationMs":13032,"stage":"browser-verify-builder-run-entry","status":"ok"},{"durationMs":1307,"stage":"run-builder-live-mutation-api","status":"error"}]`
- script: `node scripts/smoke-qa-live-slice-07.mjs`
  status: `fail`
  model: `gpt-5.4`
  failureClass: `timeout_or_429`
  reason: `The replacement key authenticated successfully and the browser path reached approved builder execution, but the builder live-mutation API request failed with provider HTTP 429.`
  evidence: `observedAt=2026-03-26; branch=main; commit=6ce61a7; httpStatus=429; logPath=/tmp/orchestration-live-ops-20260326-newkey/smoke-qa-live-slice-07.log; stage=run-builder-live-mutation-api; durationMs=2084; stageTimings=[{"durationMs":6972,"stage":"prepare-browser-harness","status":"ok"},{"durationMs":1002,"stage":"browser-bootstrap-landing","status":"ok"},{"durationMs":53,"stage":"register-live-project","status":"ok"},{"durationMs":2675,"stage":"browser-refresh-after-project","status":"ok"},{"durationMs":473,"stage":"verify-browser-project-summary","status":"ok"},{"durationMs":240,"stage":"create-task","status":"ok"},{"durationMs":35,"stage":"prepare-upstream-context","status":"ok"},{"durationMs":2712,"stage":"browser-refresh-before-approval-request","status":"ok"},{"durationMs":330,"stage":"request-builder-approval","status":"ok"},{"durationMs":102,"stage":"wait-builder-approval-pending","status":"ok"},{"durationMs":124,"stage":"approve-builder-approval","status":"ok"},{"durationMs":116,"stage":"wait-builder-approval-approved","status":"ok"},{"durationMs":0,"stage":"queue-builder-live-mutation-response","status":"ok"},{"durationMs":2467,"stage":"browser-refresh-before-builder-run","status":"ok"},{"durationMs":9158,"stage":"browser-verify-builder-run-entry","status":"ok"},{"durationMs":2084,"stage":"run-builder-live-mutation-api","status":"error"}]`
- [x] `ops-verification-m5-13` reran the same six target optional real-live entrypoints on `2026-03-26` after credits were added and a direct `/v1/responses` smoke returned `200`; current `main` now carries fresh configured-env evidence that separates one stale smoke expectation from five remaining real provider-limit failures without changing runtime, execution, provider, or UI semantics
- script: `node scripts/smoke-provider-live-slice-03.mjs`
  status: `fail`
  model: `gpt-5.4`
  failureClass: `timeout_or_429`
  reason: `Planner completed, but the architect live request failed with provider HTTP 429.`
  evidence: `observedAt=2026-03-26; branch=main; commit=6ce61a7; httpStatus=429; logPath=/tmp/orchestration-live-ops-20260326-postcredits/smoke-provider-live-slice-03.log; callSite=runArchitect`
- script: `node scripts/smoke-provider-live-slice-05.mjs`
  status: `fail`
  model: `gpt-5.4`
  failureClass: `stale_expectation`
  reason: `The post-credit rerun reached builder preflight, but the smoke still expected the full configured preflight allowlist instead of the coordinator's architecture-allowlist intersection for summary.codeContextPaths.`
  evidence: `observedAt=2026-03-26; branch=main; commit=6ce61a7; logPath=/tmp/orchestration-live-ops-20260326-postcredits/smoke-provider-live-slice-05.log; assertion=builderPreflightResult.run.summary.codeContextPaths; actual=["src/runtime/contracts.js","src/runtime/runtime-service.js","src/execution/execution-coordinator.js","ui/app.js"]; expected=["src/runtime/contracts.js","src/runtime/runtime-service.js","src/execution/provider-adapter.js","src/execution/execution-coordinator.js","src/execution/providers/openai-responses-adapter.js","ui/app.js"]`
- script: `node scripts/smoke-provider-live-slice-06.mjs`
  status: `fail`
  model: `gpt-5.4`
  failureClass: `timeout_or_429`
  reason: `Configured env was present, but the builder live-mutation request timed out before the smoke could record downstream artifacts.`
  evidence: `observedAt=2026-03-26; branch=main; commit=6ce61a7; logPath=/tmp/orchestration-live-ops-20260326-postcredits/smoke-provider-live-slice-06.log; callSite=runBuilderLiveMutation; timeoutBudgetMs=30000`
- script: `node scripts/smoke-provider-live-slice-07.mjs`
  status: `fail`
  model: `gpt-5.4`
  failureClass: `timeout_or_429`
  reason: `Planner, architect, task-breaker, and builder preflight completed, but builder live-mutation timed out at the live provider stage.`
  evidence: `observedAt=2026-03-26; branch=main; commit=6ce61a7; logPath=/tmp/orchestration-live-ops-20260326-postcredits/smoke-provider-live-slice-07.log; stage=builder-live-mutation; durationMs=30032; timeoutBudgetMs=30000; stageTimings=[{"durationMs":22985,"stage":"planner","status":"ok"},{"durationMs":11856,"stage":"architect","status":"ok"},{"durationMs":25505,"stage":"task-breaker","status":"ok"},{"durationMs":18423,"stage":"builder-preflight","status":"ok"},{"durationMs":30032,"stage":"builder-live-mutation","status":"error"}]`
- script: `node scripts/smoke-qa-live-slice-06.mjs`
  status: `fail`
  model: `gpt-5.4`
  failureClass: `timeout_or_429`
  reason: `The browser path reached approved builder execution, but the live builder-mutation API call timed out.`
  evidence: `observedAt=2026-03-26; branch=main; commit=6ce61a7; logPath=/tmp/orchestration-live-ops-20260326-postcredits/smoke-qa-live-slice-06.log; stage=run-builder-live-mutation-api; durationMs=30227; timeoutBudgetMs=30000; stageTimings=[{"durationMs":3357,"stage":"prepare-browser-harness","status":"ok"},{"durationMs":498,"stage":"browser-bootstrap-landing","status":"ok"},{"durationMs":34,"stage":"register-live-project","status":"ok"},{"durationMs":2568,"stage":"browser-refresh-after-project","status":"ok"},{"durationMs":332,"stage":"verify-browser-project-summary","status":"ok"},{"durationMs":318,"stage":"create-task","status":"ok"},{"durationMs":22,"stage":"prepare-upstream-context","status":"ok"},{"durationMs":2429,"stage":"browser-refresh-before-approval-request","status":"ok"},{"durationMs":106,"stage":"request-builder-approval","status":"ok"},{"durationMs":101,"stage":"wait-builder-approval-pending","status":"ok"},{"durationMs":104,"stage":"approve-builder-approval","status":"ok"},{"durationMs":105,"stage":"wait-builder-approval-approved","status":"ok"},{"durationMs":0,"stage":"queue-builder-live-mutation-response","status":"ok"},{"durationMs":2401,"stage":"browser-refresh-before-builder-run","status":"ok"},{"durationMs":10481,"stage":"browser-verify-builder-run-entry","status":"ok"},{"durationMs":30227,"stage":"run-builder-live-mutation-api","status":"error"}]`
- script: `node scripts/smoke-qa-live-slice-07.mjs`
  status: `fail`
  model: `gpt-5.4`
  failureClass: `timeout_or_429`
  reason: `The browser path reached approved builder execution, but the live builder-mutation API call timed out.`
  evidence: `observedAt=2026-03-26; branch=main; commit=6ce61a7; logPath=/tmp/orchestration-live-ops-20260326-postcredits/smoke-qa-live-slice-07.log; stage=run-builder-live-mutation-api; durationMs=30231; timeoutBudgetMs=30000; stageTimings=[{"durationMs":2275,"stage":"prepare-browser-harness","status":"ok"},{"durationMs":390,"stage":"browser-bootstrap-landing","status":"ok"},{"durationMs":31,"stage":"register-live-project","status":"ok"},{"durationMs":2406,"stage":"browser-refresh-after-project","status":"ok"},{"durationMs":418,"stage":"verify-browser-project-summary","status":"ok"},{"durationMs":125,"stage":"create-task","status":"ok"},{"durationMs":27,"stage":"prepare-upstream-context","status":"ok"},{"durationMs":2419,"stage":"browser-refresh-before-approval-request","status":"ok"},{"durationMs":169,"stage":"request-builder-approval","status":"ok"},{"durationMs":115,"stage":"wait-builder-approval-pending","status":"ok"},{"durationMs":188,"stage":"approve-builder-approval","status":"ok"},{"durationMs":502,"stage":"wait-builder-approval-approved","status":"ok"},{"durationMs":0,"stage":"queue-builder-live-mutation-response","status":"ok"},{"durationMs":2513,"stage":"browser-refresh-before-builder-run","status":"ok"},{"durationMs":11828,"stage":"browser-verify-builder-run-entry","status":"ok"},{"durationMs":30231,"stage":"run-builder-live-mutation-api","status":"error"}]`
- [x] `ops-verification-m5-14` fixed the `scripts/smoke-provider-live-slice-05.mjs` stale expectation on `2026-03-26` by aligning its builder-preflight summary assertion to the coordinator's current architecture-allowlist intersection, then reran the same live script immediately with configured env; the rerun passed and closed that stale-expectation housekeeping item without changing runtime, execution, provider, or UI semantics
- script: `node scripts/smoke-provider-live-slice-05.mjs`
  status: `pass (after stale expectation fix)`
  model: `gpt-5.4`
  failureClass: `stale_expectation`
  reason: `The stale smoke expectation was aligned to current coordinator truth, and the immediate configured-env rerun passed through builder preflight.`
  evidence: `observedAt=2026-03-26; branch=main; commit=6ce61a7; runtimeRoot=/Users/sungjin/dev/personal/orchestration/var/runtime-provider-live-slice-05; logPath=/tmp/orchestration-live-ops-20260326-postpatch-smoke-provider-live-slice-05.log; plannerRunId=run-0001; planArtifactId=artifact-0001; architectRunId=run-0002; architectureArtifactId=artifact-0002; taskBreakerRunId=run-0003; breakdownArtifactId=artifact-0003; builderPreflightRunId=run-0004; preflightArtifactId=artifact-0004; builderPreflightNextStage=architect`
- [x] `ops-verification-m5-15` strengthened diagnostics for `scripts/smoke-provider-live-slice-03.mjs` and `scripts/smoke-provider-live-slice-06.mjs` on `2026-03-26` without changing runtime, execution, provider, or UI semantics, then reran both with configured env; `slice-03` cleared the earlier provider-limit behavior and passed, while `slice-06` still times out but now records full upstream stage timings like `slice-07`
- script: `node scripts/smoke-provider-live-slice-03.mjs`
  status: `pass`
  model: `gpt-5.4`
  failureClass: `timeout_or_429`
  reason: `The diagnostics rerun no longer reproduced the earlier provider-limit behavior; planner and architect both completed successfully.`
  evidence: `observedAt=2026-03-26; branch=main; commit=6ce61a7; runtimeRoot=/Users/sungjin/dev/personal/orchestration/var/runtime-provider-live-slice-03; logPath=/tmp/orchestration-live-ops-20260326-diagnostics-smoke-provider-live-slice-03.log; plannerRunId=run-0001; planArtifactId=artifact-0001; architectRunId=run-0002; architectureArtifactId=artifact-0002; architectNextStage=task-breaker; stageTimings=[{"durationMs":21906,"stage":"planner","status":"ok"},{"durationMs":10741,"stage":"architect","status":"ok"}]`
- script: `node scripts/smoke-provider-live-slice-06.mjs`
  status: `fail`
  model: `gpt-5.4`
  failureClass: `timeout_or_429`
  reason: `The diagnostics rerun still timed out at builder live-mutation after planner, architect, task-breaker, and builder preflight completed.`
  evidence: `observedAt=2026-03-26; branch=main; commit=6ce61a7; logPath=/tmp/orchestration-live-ops-20260326-diagnostics-smoke-provider-live-slice-06.log; stage=builder-live-mutation; durationMs=30014; timeoutBudgetMs=30000; stageTimings=[{"durationMs":23808,"stage":"planner","status":"ok"},{"durationMs":13979,"stage":"architect","status":"ok"},{"durationMs":23053,"stage":"task-breaker","status":"ok"},{"durationMs":22227,"stage":"builder-preflight","status":"ok"},{"durationMs":30014,"stage":"builder-live-mutation","status":"error"}]`
- [x] `ops-verification-m5-16` reran the remaining four optional real-live entrypoints on `2026-03-26` with the same funded configured env to check whether the remaining provider-limit failures were transient; `slice-06` no longer timed out but instead exposed a real builder output semantic mismatch, while `slice-07` and the two QA live slices still failed with fresh timeout evidence at their current stages
- script: `node scripts/smoke-provider-live-slice-06.mjs`
  status: `fail`
  model: `gpt-5.4`
  failureClass: `semantic_fail`
  reason: `Builder live-mutation completed far enough to return output, but the returned payload did not include the required base64 file update block and instead reported "_No file updates prepared."`
  evidence: `observedAt=2026-03-26; branch=main; commit=6ce61a7; logPath=/tmp/orchestration-live-ops-20260326-final-rerun/smoke-provider-live-slice-06.log; stage=builder-live-mutation; durationMs=15673; stageTimings=[{"durationMs":21382,"stage":"planner","status":"ok"},{"durationMs":12788,"stage":"architect","status":"ok"},{"durationMs":28285,"stage":"task-breaker","status":"ok"},{"durationMs":23801,"stage":"builder-preflight","status":"ok"},{"durationMs":15673,"stage":"builder-live-mutation","status":"error"}]; semanticError=Missing base64 file update block for _No file updates prepared.`
- script: `node scripts/smoke-provider-live-slice-07.mjs`
  status: `fail`
  model: `gpt-5.4`
  failureClass: `timeout_or_429`
  reason: `Planner and architect completed, but task-breaker timed out before builder preflight or downstream live stages ran.`
  evidence: `observedAt=2026-03-26; branch=main; commit=6ce61a7; logPath=/tmp/orchestration-live-ops-20260326-final-rerun/smoke-provider-live-slice-07.log; stage=task-breaker; durationMs=30015; timeoutBudgetMs=30000; stageTimings=[{"durationMs":23520,"stage":"planner","status":"ok"},{"durationMs":12447,"stage":"architect","status":"ok"},{"durationMs":30015,"stage":"task-breaker","status":"error"}]`
- script: `node scripts/smoke-qa-live-slice-06.mjs`
  status: `fail`
  model: `gpt-5.4`
  failureClass: `timeout_or_429`
  reason: `The browser path again reached approved builder execution, but the live builder-mutation API call timed out.`
  evidence: `observedAt=2026-03-26; branch=main; commit=6ce61a7; logPath=/tmp/orchestration-live-ops-20260326-final-rerun/smoke-qa-live-slice-06.log; stage=run-builder-live-mutation-api; durationMs=30227; timeoutBudgetMs=30000; stageTimings=[{"durationMs":3169,"stage":"prepare-browser-harness","status":"ok"},{"durationMs":434,"stage":"browser-bootstrap-landing","status":"ok"},{"durationMs":36,"stage":"register-live-project","status":"ok"},{"durationMs":2483,"stage":"browser-refresh-after-project","status":"ok"},{"durationMs":360,"stage":"verify-browser-project-summary","status":"ok"},{"durationMs":300,"stage":"create-task","status":"ok"},{"durationMs":22,"stage":"prepare-upstream-context","status":"ok"},{"durationMs":2383,"stage":"browser-refresh-before-approval-request","status":"ok"},{"durationMs":165,"stage":"request-builder-approval","status":"ok"},{"durationMs":162,"stage":"wait-builder-approval-pending","status":"ok"},{"durationMs":192,"stage":"approve-builder-approval","status":"ok"},{"durationMs":184,"stage":"wait-builder-approval-approved","status":"ok"},{"durationMs":0,"stage":"queue-builder-live-mutation-response","status":"ok"},{"durationMs":2635,"stage":"browser-refresh-before-builder-run","status":"ok"},{"durationMs":11980,"stage":"browser-verify-builder-run-entry","status":"ok"},{"durationMs":30227,"stage":"run-builder-live-mutation-api","status":"error"}]`
- script: `node scripts/smoke-qa-live-slice-07.mjs`
  status: `fail`
  model: `gpt-5.4`
  failureClass: `timeout_or_429`
  reason: `The browser path again reached approved builder execution, but the live builder-mutation API call timed out.`
  evidence: `observedAt=2026-03-26; branch=main; commit=6ce61a7; logPath=/tmp/orchestration-live-ops-20260326-final-rerun/smoke-qa-live-slice-07.log; stage=run-builder-live-mutation-api; durationMs=30223; timeoutBudgetMs=30000; stageTimings=[{"durationMs":2354,"stage":"prepare-browser-harness","status":"ok"},{"durationMs":414,"stage":"browser-bootstrap-landing","status":"ok"},{"durationMs":38,"stage":"register-live-project","status":"ok"},{"durationMs":2513,"stage":"browser-refresh-after-project","status":"ok"},{"durationMs":412,"stage":"verify-browser-project-summary","status":"ok"},{"durationMs":211,"stage":"create-task","status":"ok"},{"durationMs":35,"stage":"prepare-upstream-context","status":"ok"},{"durationMs":2472,"stage":"browser-refresh-before-approval-request","status":"ok"},{"durationMs":122,"stage":"request-builder-approval","status":"ok"},{"durationMs":122,"stage":"wait-builder-approval-pending","status":"ok"},{"durationMs":124,"stage":"approve-builder-approval","status":"ok"},{"durationMs":120,"stage":"wait-builder-approval-approved","status":"ok"},{"durationMs":0,"stage":"queue-builder-live-mutation-response","status":"ok"},{"durationMs":2400,"stage":"browser-refresh-before-builder-run","status":"ok"},{"durationMs":10365,"stage":"browser-verify-builder-run-entry","status":"ok"},{"durationMs":30223,"stage":"run-builder-live-mutation-api","status":"error"}]`
- [x] `ops-verification-m5-19` applied diagnostics-only failure-context enrichment to the remaining optional real-live open set on `2026-03-26`, reran the same four entrypoints with the funded configured env, and recorded richer current-main evidence including `runtimeRoot`, `outputRoot`, approval provenance, and task context without changing runtime, execution, provider, or UI semantics
- script: `node scripts/smoke-provider-live-slice-06.mjs`
  status: `fail`
  model: `gpt-5.4`
  failureClass: `timeout_or_429`
  reason: `The latest context-rich rerun did not reproduce the prior builder semantic mismatch and instead timed out at task-breaker before builder preflight approval or live mutation ran.`
  evidence: `observedAt=2026-03-26; branch=main; commit=6ce61a7; logPath=/tmp/orchestration-live-ops-20260326-context-rerun/smoke-provider-live-slice-06.log; stage=task-breaker; durationMs=30083; timeoutBudgetMs=30000; runtimeRoot=/Users/sungjin/dev/personal/orchestration/var/runtime-provider-live-slice-06; projectId=project-0001; taskId=task-0001; stageTimings=[{"durationMs":26800,"stage":"planner","status":"ok"},{"durationMs":14868,"stage":"architect","status":"ok"},{"durationMs":30083,"stage":"task-breaker","status":"error"}]`
- script: `node scripts/smoke-provider-live-slice-07.mjs`
  status: `fail`
  model: `gpt-5.4`
  failureClass: `semantic_fail`
  reason: `The latest context-rich rerun reached builder live-mutation, but the returned payload again omitted the required base64 file update block and reported "_No file updates prepared."`
  evidence: `observedAt=2026-03-26; branch=main; commit=6ce61a7; logPath=/tmp/orchestration-live-ops-20260326-context-rerun/smoke-provider-live-slice-07.log; stage=builder-live-mutation; durationMs=18466; runtimeRoot=/Users/sungjin/dev/personal/orchestration/var/runtime-provider-live-slice-07; projectId=project-0001; taskId=task-0001; preflightArtifactId=artifact-0004; approvalId=approval-0001; stageTimings=[{"durationMs":24659,"stage":"planner","status":"ok"},{"durationMs":20208,"stage":"architect","status":"ok"},{"durationMs":28446,"stage":"task-breaker","status":"ok"},{"durationMs":21524,"stage":"builder-preflight","status":"ok"},{"durationMs":18466,"stage":"builder-live-mutation","status":"error"}]; semanticError=Missing base64 file update block for _No file updates prepared.`
- script: `node scripts/smoke-qa-live-slice-06.mjs`
  status: `fail`
  model: `gpt-5.4`
  failureClass: `timeout_or_429`
  reason: `The latest context-rich rerun again reached approved builder execution, but the live builder-mutation API call timed out.`
  evidence: `observedAt=2026-03-26; branch=main; commit=6ce61a7; logPath=/tmp/orchestration-live-ops-20260326-context-rerun/smoke-qa-live-slice-06.log; stage=run-builder-live-mutation-api; durationMs=30353; timeoutBudgetMs=30000; outputRoot=/Users/sungjin/dev/personal/orchestration/output/playwright/qa-slice-06-live; runtimeRoot=/Users/sungjin/dev/personal/orchestration/var/runtime-qa-live-slice-06; projectId=project-0001; taskId=task-0001; approvalId=approval-0001; targetFiles=["src/runtime/runtime-service.js","src/execution/execution-coordinator.js"]; stageTimings=[{"durationMs":2440,"stage":"prepare-browser-harness","status":"ok"},{"durationMs":321,"stage":"browser-bootstrap-landing","status":"ok"},{"durationMs":28,"stage":"register-live-project","status":"ok"},{"durationMs":2380,"stage":"browser-refresh-after-project","status":"ok"},{"durationMs":369,"stage":"verify-browser-project-summary","status":"ok"},{"durationMs":90,"stage":"create-task","status":"ok"},{"durationMs":19,"stage":"prepare-upstream-context","status":"ok"},{"durationMs":2326,"stage":"browser-refresh-before-approval-request","status":"ok"},{"durationMs":93,"stage":"request-builder-approval","status":"ok"},{"durationMs":86,"stage":"wait-builder-approval-pending","status":"ok"},{"durationMs":86,"stage":"approve-builder-approval","status":"ok"},{"durationMs":83,"stage":"wait-builder-approval-approved","status":"ok"},{"durationMs":0,"stage":"queue-builder-live-mutation-response","status":"ok"},{"durationMs":2363,"stage":"browser-refresh-before-builder-run","status":"ok"},{"durationMs":9220,"stage":"browser-verify-builder-run-entry","status":"ok"},{"durationMs":30353,"stage":"run-builder-live-mutation-api","status":"error"}]`
- script: `node scripts/smoke-qa-live-slice-07.mjs`
  status: `fail`
  model: `gpt-5.4`
  failureClass: `timeout_or_429`
  reason: `The latest context-rich rerun again reached approved builder execution, but the live builder-mutation API call timed out.`
  evidence: `observedAt=2026-03-26; branch=main; commit=6ce61a7; logPath=/tmp/orchestration-live-ops-20260326-context-rerun/smoke-qa-live-slice-07.log; stage=run-builder-live-mutation-api; durationMs=30224; timeoutBudgetMs=30000; outputRoot=/Users/sungjin/dev/personal/orchestration/output/playwright/qa-slice-07-live; runtimeRoot=/Users/sungjin/dev/personal/orchestration/var/runtime-qa-live-slice-07; projectId=project-0001; taskId=task-0001; approvalId=approval-0001; targetFiles=["src/runtime/runtime-service.js","src/execution/execution-coordinator.js"]; stageTimings=[{"durationMs":4354,"stage":"prepare-browser-harness","status":"ok"},{"durationMs":440,"stage":"browser-bootstrap-landing","status":"ok"},{"durationMs":38,"stage":"register-live-project","status":"ok"},{"durationMs":2508,"stage":"browser-refresh-after-project","status":"ok"},{"durationMs":548,"stage":"verify-browser-project-summary","status":"ok"},{"durationMs":293,"stage":"create-task","status":"ok"},{"durationMs":21,"stage":"prepare-upstream-context","status":"ok"},{"durationMs":2578,"stage":"browser-refresh-before-approval-request","status":"ok"},{"durationMs":115,"stage":"request-builder-approval","status":"ok"},{"durationMs":176,"stage":"wait-builder-approval-pending","status":"ok"},{"durationMs":144,"stage":"approve-builder-approval","status":"ok"},{"durationMs":245,"stage":"wait-builder-approval-approved","status":"ok"},{"durationMs":0,"stage":"queue-builder-live-mutation-response","status":"ok"},{"durationMs":2534,"stage":"browser-refresh-before-builder-run","status":"ok"},{"durationMs":9657,"stage":"browser-verify-builder-run-entry","status":"ok"},{"durationMs":30224,"stage":"run-builder-live-mutation-api","status":"error"}]`
- [x] `ops-verification-m5-20` reran the same four optional real-live entrypoints again on `2026-03-26` after confirming `launchctl`-visible configured env plus a direct `/v1/responses` `200`, then injected that env inline for the live scripts because the bare `node` subprocess in this shell did not inherit the login-session values; current `main` evidence remains non-blocking housekeeping only and no runtime, execution, provider, or UI semantics changed
- script: `node scripts/smoke-provider-live-slice-06.mjs`
  status: `fail`
  model: `gpt-5.4`
  failureClass: `timeout_or_429`
  reason: `The latest configured-env rerun again cleared planner-through-preflight, but the live builder-mutation provider request timed out at the 30s budget.`
  evidence: `observedAt=2026-03-26; branch=main; commit=6ce61a7; configuredEnvSource=inline-launchctl; directResponsesPing=200; stage=builder-live-mutation; durationMs=30088; timeoutBudgetMs=30000; runtimeRoot=/Users/sungjin/dev/personal/orchestration/var/runtime-provider-live-slice-06; projectId=project-0001; taskId=task-0001; approvalId=approval-0001; preflightArtifactId=artifact-0004; stageTimings=[{"durationMs":20114,"stage":"planner","status":"ok"},{"durationMs":16084,"stage":"architect","status":"ok"},{"durationMs":27983,"stage":"task-breaker","status":"ok"},{"durationMs":27477,"stage":"builder-preflight","status":"ok"},{"durationMs":30088,"stage":"builder-live-mutation","status":"error"}]`
- script: `node scripts/smoke-provider-live-slice-07.mjs`
  status: `fail`
  model: `gpt-5.4`
  failureClass: `timeout_or_429`
  reason: `The latest configured-env rerun did not reproduce the prior downstream semantic mismatch and instead timed out immediately at planner.`
  evidence: `observedAt=2026-03-26; branch=main; commit=6ce61a7; configuredEnvSource=inline-launchctl; directResponsesPing=200; stage=planner; durationMs=30013; timeoutBudgetMs=30000; runtimeRoot=/Users/sungjin/dev/personal/orchestration/var/runtime-provider-live-slice-07; projectId=project-0001; taskId=task-0001; stageTimings=[{"durationMs":30013,"stage":"planner","status":"error"}]`
- script: `node scripts/smoke-qa-live-slice-06.mjs`
  status: `fail`
  model: `gpt-5.4`
  failureClass: `timeout_or_429`
  reason: `The latest configured-env browser rerun again reached approved builder execution, but the live builder-mutation API call timed out at the provider boundary.`
  evidence: `observedAt=2026-03-26; branch=main; commit=6ce61a7; configuredEnvSource=inline-launchctl; directResponsesPing=200; stage=run-builder-live-mutation-api; durationMs=30221; timeoutBudgetMs=30000; outputRoot=/Users/sungjin/dev/personal/orchestration/output/playwright/qa-slice-06-live; runtimeRoot=/Users/sungjin/dev/personal/orchestration/var/runtime-qa-live-slice-06; projectId=project-0001; taskId=task-0001; approvalId=approval-0001; targetFiles=["src/runtime/runtime-service.js","src/execution/execution-coordinator.js"]; stageTimings=[{"durationMs":3205,"stage":"prepare-browser-harness","status":"ok"},{"durationMs":707,"stage":"browser-bootstrap-landing","status":"ok"},{"durationMs":42,"stage":"register-live-project","status":"ok"},{"durationMs":2470,"stage":"browser-refresh-after-project","status":"ok"},{"durationMs":1323,"stage":"verify-browser-project-summary","status":"ok"},{"durationMs":402,"stage":"create-task","status":"ok"},{"durationMs":27,"stage":"prepare-upstream-context","status":"ok"},{"durationMs":2943,"stage":"browser-refresh-before-approval-request","status":"ok"},{"durationMs":361,"stage":"request-builder-approval","status":"ok"},{"durationMs":117,"stage":"wait-builder-approval-pending","status":"ok"},{"durationMs":121,"stage":"approve-builder-approval","status":"ok"},{"durationMs":110,"stage":"wait-builder-approval-approved","status":"ok"},{"durationMs":0,"stage":"queue-builder-live-mutation-response","status":"ok"},{"durationMs":2538,"stage":"browser-refresh-before-builder-run","status":"ok"},{"durationMs":11510,"stage":"browser-verify-builder-run-entry","status":"ok"},{"durationMs":30221,"stage":"run-builder-live-mutation-api","status":"error"}]`
- script: `node scripts/smoke-qa-live-slice-07.mjs`
  status: `fail`
  model: `gpt-5.4`
  failureClass: `timeout_or_429`
  reason: `The latest configured-env browser rerun again reached approved builder execution, but the live builder-mutation API call timed out at the provider boundary.`
  evidence: `observedAt=2026-03-26; branch=main; commit=6ce61a7; configuredEnvSource=inline-launchctl; directResponsesPing=200; stage=run-builder-live-mutation-api; durationMs=30237; timeoutBudgetMs=30000; outputRoot=/Users/sungjin/dev/personal/orchestration/output/playwright/qa-slice-07-live; runtimeRoot=/Users/sungjin/dev/personal/orchestration/var/runtime-qa-live-slice-07; projectId=project-0001; taskId=task-0001; approvalId=approval-0001; targetFiles=["src/runtime/runtime-service.js","src/execution/execution-coordinator.js"]; stageTimings=[{"durationMs":2698,"stage":"prepare-browser-harness","status":"ok"},{"durationMs":461,"stage":"browser-bootstrap-landing","status":"ok"},{"durationMs":30,"stage":"register-live-project","status":"ok"},{"durationMs":2423,"stage":"browser-refresh-after-project","status":"ok"},{"durationMs":650,"stage":"verify-browser-project-summary","status":"ok"},{"durationMs":307,"stage":"create-task","status":"ok"},{"durationMs":21,"stage":"prepare-upstream-context","status":"ok"},{"durationMs":2602,"stage":"browser-refresh-before-approval-request","status":"ok"},{"durationMs":310,"stage":"request-builder-approval","status":"ok"},{"durationMs":103,"stage":"wait-builder-approval-pending","status":"ok"},{"durationMs":104,"stage":"approve-builder-approval","status":"ok"},{"durationMs":109,"stage":"wait-builder-approval-approved","status":"ok"},{"durationMs":0,"stage":"queue-builder-live-mutation-response","status":"ok"},{"durationMs":2415,"stage":"browser-refresh-before-builder-run","status":"ok"},{"durationMs":12136,"stage":"browser-verify-builder-run-entry","status":"ok"},{"durationMs":30237,"stage":"run-builder-live-mutation-api","status":"error"}]`
- [x] `ops-verification-m5-21` reran the previously open optional real-live provider and QA entrypoints on `2026-03-26` after lifting the default OpenAI Responses timeout to `120000ms`, honoring valid builder live-mutation escalation branches before base64 file-update parsing, narrowing the live smoke target set to bounded `src/runtime/contracts.js` work, and aligning the QA reviewer any-terminal assertion to current commit-package readiness truth; all four reruns now complete green on current `main` without widening runtime, execution, provider, or UI semantics
- script: `node scripts/smoke-provider-live-slice-06.mjs`
  status: `pass`
  model: `gpt-5.4`
  failureClass: `timeout_or_429`
  reason: `The latest rerun no longer hit the builder live-mutation provider timeout and completed the bounded mutation successfully against the narrowed target file set.`
  evidence: `observedAt=2026-03-26; branch=main; commit=6ce61a7; configuredEnvSource=inline-launchctl; runtimeRoot=/Users/sungjin/dev/personal/orchestration/var/runtime-provider-live-slice-06; runId=run-0005; artifactId=artifact-0005; preflightArtifactId=artifact-0004; approvalId=approval-0001; stage=builder-live-mutation; durationMs=76348; stageTimings=[{"durationMs":21413,"stage":"planner","status":"ok"},{"durationMs":11054,"stage":"architect","status":"ok"},{"durationMs":24590,"stage":"task-breaker","status":"ok"},{"durationMs":15018,"stage":"builder-preflight","status":"ok"},{"durationMs":76348,"stage":"builder-live-mutation","status":"ok"}]; timeoutBudgetMs=120000; changedFiles=["src/runtime/contracts.js"]`
- script: `node scripts/smoke-provider-live-slice-07.mjs`
  status: `pass`
  model: `gpt-5.4`
  failureClass: `timeout_or_429`
  reason: `The latest rerun completed builder live-mutation plus terminal reviewer processing within the extended provider budget, so the earlier timeout and output-shape instability no longer reproduced on current main.`
  evidence: `observedAt=2026-03-26; branch=main; commit=6ce61a7; configuredEnvSource=inline-launchctl; runtimeRoot=/Users/sungjin/dev/personal/orchestration/var/runtime-provider-live-slice-07; runId=run-0005; artifactId=artifact-0005; reviewRunId=run-0006; reviewArtifactId=artifact-0008; preflightArtifactId=artifact-0004; approvalId=approval-0001; stage=reviewer; durationMs=16677; stageTimings=[{"durationMs":27321,"stage":"planner","status":"ok"},{"durationMs":10528,"stage":"architect","status":"ok"},{"durationMs":24069,"stage":"task-breaker","status":"ok"},{"durationMs":18415,"stage":"builder-preflight","status":"ok"},{"durationMs":110306,"stage":"builder-live-mutation","status":"ok"},{"durationMs":16677,"stage":"reviewer","status":"ok"}]; timeoutBudgetMs=120000; changedFiles=["src/runtime/contracts.js"]; reviewerRawVerdict=fail; reviewerMappedStatus=changes_requested`
- script: `node scripts/smoke-qa-live-slice-06.mjs`
  status: `pass`
  model: `gpt-5.4`
  failureClass: `timeout_or_429`
  reason: `The latest browser/API rerun no longer timed out at the live builder-mutation boundary and completed the approved mutation path successfully.`
  evidence: `observedAt=2026-03-26; branch=main; commit=6ce61a7; configuredEnvSource=inline-launchctl; outputRoot=/Users/sungjin/dev/personal/orchestration/output/playwright/qa-slice-06-live; runtimeRoot=/Users/sungjin/dev/personal/orchestration/var/runtime-qa-live-slice-06; runId=run-0005; artifactId=artifact-0005; preflightArtifactId=artifact-0004; approvalId=approval-0001; stage=run-builder-live-mutation-api; durationMs=85492; timeoutBudgetMs=120000; stageTimings=[{"durationMs":2872,"stage":"prepare-browser-harness","status":"ok"},{"durationMs":624,"stage":"browser-bootstrap-landing","status":"ok"},{"durationMs":32,"stage":"register-live-project","status":"ok"},{"durationMs":2330,"stage":"browser-refresh-after-project","status":"ok"},{"durationMs":292,"stage":"verify-browser-project-summary","status":"ok"},{"durationMs":96,"stage":"create-task","status":"ok"},{"durationMs":18,"stage":"prepare-upstream-context","status":"ok"},{"durationMs":2365,"stage":"browser-refresh-before-approval-request","status":"ok"},{"durationMs":156,"stage":"request-builder-approval","status":"ok"},{"durationMs":176,"stage":"wait-builder-approval-pending","status":"ok"},{"durationMs":191,"stage":"approve-builder-approval","status":"ok"},{"durationMs":195,"stage":"wait-builder-approval-approved","status":"ok"},{"durationMs":0,"stage":"queue-builder-live-mutation-response","status":"ok"},{"durationMs":2575,"stage":"browser-refresh-before-builder-run","status":"ok"},{"durationMs":12088,"stage":"browser-verify-builder-run-entry","status":"ok"},{"durationMs":85492,"stage":"run-builder-live-mutation-api","status":"ok"}]; changedFiles=["src/runtime/contracts.js"]`
- script: `node scripts/smoke-qa-live-slice-07.mjs`
  status: `pass`
  model: `gpt-5.4`
  failureClass: `stale_expectation`
  reason: `The live reviewer path was healthy; the only failing check was a stale any-terminal readiness expectation for commit-package review anchoring on changes-requested reviews. After aligning that assertion to current coordinator truth, the rerun completed end-to-end through reviewer.`
  evidence: `observedAt=2026-03-26; branch=main; commit=6ce61a7; configuredEnvSource=inline-launchctl; outputRoot=/Users/sungjin/dev/personal/orchestration/output/playwright/qa-slice-07-live; runtimeRoot=/Users/sungjin/dev/personal/orchestration/var/runtime-qa-live-slice-07; runId=run-0005; artifactId=artifact-0005; reviewRunId=run-0006; reviewArtifactId=artifact-0008; preflightArtifactId=artifact-0004; approvalId=approval-0001; stage=reviewer; durationMs=18560; timeoutBudgetMs=120000; stageTimings=[{"durationMs":1956,"stage":"prepare-browser-harness","status":"ok"},{"durationMs":477,"stage":"browser-bootstrap-landing","status":"ok"},{"durationMs":53,"stage":"register-live-project","status":"ok"},{"durationMs":2632,"stage":"browser-refresh-after-project","status":"ok"},{"durationMs":463,"stage":"verify-browser-project-summary","status":"ok"},{"durationMs":201,"stage":"create-task","status":"ok"},{"durationMs":39,"stage":"prepare-upstream-context","status":"ok"},{"durationMs":2588,"stage":"browser-refresh-before-approval-request","status":"ok"},{"durationMs":188,"stage":"request-builder-approval","status":"ok"},{"durationMs":174,"stage":"wait-builder-approval-pending","status":"ok"},{"durationMs":198,"stage":"approve-builder-approval","status":"ok"},{"durationMs":199,"stage":"wait-builder-approval-approved","status":"ok"},{"durationMs":0,"stage":"queue-builder-live-mutation-response","status":"ok"},{"durationMs":2787,"stage":"browser-refresh-before-builder-run","status":"ok"},{"durationMs":9879,"stage":"browser-verify-builder-run-entry","status":"ok"},{"durationMs":92944,"stage":"run-builder-live-mutation-api","status":"ok"},{"durationMs":2577,"stage":"browser-refresh-before-reviewer-run","status":"ok"},{"durationMs":16920,"stage":"browser-trigger-reviewer","status":"ok"},{"durationMs":11766,"stage":"wait-reviewer-success-snapshot","status":"ok"}]; reviewerRawVerdict=changes_requested; reviewerMappedStatus=changes_requested; changedFiles=["src/runtime/contracts.js"]`

### source-of-truth docs/tasks [accepted]
- [x] `docs/00_master-brief.md`, `docs/03_architecture-roadmap-v1.md`, `packs/development/pack.md`, and `tasks/todo.md` describe the current implemented planner-through-reviewer live boundary without widening scope
- [x] optional real-live verification is described as non-blocking and separate from required synthetic gates
- [x] `docs/01_decision-log.md` remains unchanged in this freeze
- [x] `docs/04_codex-handoff-master-brief.md` and `docs/05_execution-spec-ops-verification-m5-02.md` record the current `main` handoff package and immediate stale-vs-real-fail execution spec without widening the frozen baseline
- [x] drift-prone non-SSoT reference docs were reduced to the current repo-integrated numbered set under `docs/00..05`; `docs/04` and `docs/05` remain explicit derivative handoff docs referenced from `docs/03` and do not float as separate ad-hoc notes

### operator rehearsal [accepted]
- [x] `operator-hardening-m5-03` ran on `2026-03-26` against current `main` using synthetic/local smoke only because configured live env was not visible to this process
- [x] `node scripts/smoke-ui-slice-01.mjs` reconfirmed the primary shell surfaces `Taskboard / Logs / Artifacts / Decision Inbox`, project-scoped snapshot state, and explicit review/approval gate visibility
- [x] `node scripts/smoke-worktree-slice-03.mjs` reconfirmed project register/select reuse for linked worktree create/switch without task migration or hidden worktree auto-assignment
- [x] `node scripts/smoke-dev-loop-m2.mjs` reconfirmed the bounded planner -> architect -> task-breaker -> builder preflight -> builder live-mutation -> reviewer -> commit-package -> local commit operator path on a clean temp repo
- [x] `node scripts/smoke-ui-slice-11.mjs` reconfirmed `release-package` visibility as explicit `local-demo-only` downstream follow-up with current readiness and approval summaries preserved
- [x] `node scripts/smoke-ui-slice-12.mjs` reconfirmed `close-out` visibility as explicit release-bundle-consuming finalization with clean-repo and duplicate-close-out guards preserved
- [x] no hidden auto-transition, no silent fallback, and no downstream auto-start was observed in the current operator rehearsal path

### stabilization close [accepted]
- [x] `v1-stabilization-close-m5-04` reran the changed runtime/execution/ui smoke bundle on current `main` and confirmed the current smoke-fixture realignment remains green after docs/tasks reconciliation
- [x] rerun bundle confirmed green for `node scripts/smoke-runtime-slice-05.mjs`, `node scripts/smoke-execution-slice-05.mjs`, `node scripts/smoke-execution-slice-06.mjs`, `node scripts/smoke-execution-slice-07.mjs`, `node scripts/smoke-execution-slice-08.mjs`, `node scripts/smoke-execution-slice-09.mjs`, `node scripts/smoke-execution-slice-10.mjs`, `node scripts/smoke-execution-slice-11.mjs`, `node scripts/smoke-ui-slice-11.mjs`, and `node scripts/smoke-ui-slice-12.mjs`
- [x] `qa-runner-log-selection-m5-05` closed the synthetic logs-surface verification drift by selecting the target run row before asserting log detail visibility; `node scripts/smoke-qa-slice-06.mjs` and `node scripts/smoke-qa-slice-07.mjs` both pass on current `main` without widening runtime or UI semantics
- [x] `provider-synthetic-readiness-alignment-m5-17` aligned `scripts/smoke-provider-slice-03.mjs` to the current frozen reviewer/downstream readiness truth and reran `node scripts/smoke-provider-slice-03.mjs`, `node scripts/smoke-provider-slice-05.mjs`, and `node scripts/smoke-provider-slice-06.mjs` green on current `main`
- [x] `qa-diagnostics-regression-m5-18` reran `node scripts/smoke-qa-slice-06.mjs` and `node scripts/smoke-qa-slice-07.mjs` green after the diagnostics-only failure-context patch, confirming the added timeout context did not change QA synthetic execution semantics
- [x] the optional real-live verification gap is closed on current `main`; future live reruns from this Codex execution context still need inline `launchctl` env injection or an app relaunch because the bare `node` subprocess here does not inherit the login-session env automatically

### v1 usable completion [accepted]
- [x] current `main` now satisfies the operator-usable `development` pack v1 baseline defined by `docs/00_master-brief.md`, `docs/02_ia-v1.md`, `docs/03_architecture-roadmap-v1.md`, and `packs/development/pack.md`
- [x] required local baseline, required live-provider synthetic baseline, operator rehearsal, and stabilization-close reruns are all green on current `main`
- [x] optional real-live reruns remain non-blocking operational verification only and do not prevent `v1 usable completion`
- [x] the first post-v1 development priority moves to `artifact redaction policy`; optional real-live reruns stay available as separate ops housekeeping whenever configured env is visible to the execution context

### post-freeze backlog ordering [accepted]
- [x] `strategy-m5-01` is limited to docs-only backlog ordering; no new capability or runtime/execution/UI semantics change is introduced
- [x] priority 1 is fixed to optional real-live verification and stays non-blocking instead of becoming a required freeze gate
- [x] priority 2 remains artifact redaction policy
- [x] priority 3 remains commit/release future scope
- [x] priority 4 remains second provider adapter
- [x] `docs/01_decision-log.md` remains untouched in this slice

### artifact redaction policy [accepted]
- [x] `strategy-m5-02` is limited to docs/tasks policy lock; no new capability or runtime/execution/UI semantics change is introduced
- [x] provider secret/auth/raw payload/env non-leak remains a persistence-prohibited boundary and is kept separate from repo-content redaction policy
- [x] repo-content redaction policy does not rewrite raw stored artifact content in the current frozen baseline; raw stored artifact content plus runtime metadata remain the source of truth
- [x] the first repo-content redaction implementation stays `preview/export only` and must not create redacted derivative copies as new source-of-truth artifacts
- [x] `patch` and `diff` remain exact raw provenance evidence and stay outside redaction scope in the current frozen baseline
- [x] `change-summary` and `review` keep canonical structured provenance, findings, verdict, verification, and follow-up fields intact; only duplicated large verbatim repo-content excerpts are future redaction candidates
- [x] runtime snapshot metadata, logs, artifact storage, and the current Artifact Detail raw-content view remain unchanged in this slice
- [x] `artifact-redaction-m5-06` implements the first preview-only repo-content redaction on current `main`: `Artifacts -> Artifact Detail -> change-summary` keeps file paths visible in structured preview, redacts stored `File Updates` payloads there, and leaves the raw artifact block unchanged as the source of truth
- [x] `node scripts/smoke-ui-slice-11.mjs` now fixes the UI contract for preview-only change-summary redaction by asserting `parseChangeSummaryFileUpdates`, `renderStructuredChangeSummary`, the redacted `File Updates` preview copy, and unchanged raw-content source-of-truth copy in `ui/app.js`

### commit/release future scope [accepted]
- [x] `strategy-m5-03` is limited to docs/tasks future-scope lock; no new capability or runtime/execution/UI semantics change is introduced
- [x] the current downstream local follow-up baseline remains explicit after reviewer: `commit-package` and `release-package` stay approval-producing prepare steps, while `local commit` and `close-out` stay approval-consuming local execution steps
- [x] the current split between review, approval, git side effects, linked-worktree release guard, and `local-demo-only` delivery stance remains intentional and unchanged in the current frozen baseline
- [x] recommended priority 1 for any future automation candidate is operator-invoked local convenience chaining only, and only when it reuses the current readiness, approval, provenance, linked-worktree, and delivery-stance guards without redefining them
- [x] provider or reviewer auto-start of downstream commit/release follow-up remains out of scope, as do approval auto-resolution and hidden step chaining
- [x] push, merge, publish, and external release remain widening-forbidden lines, and `release-package` plus `close-out` continue to require the current dedicated linked worktree boundary
- [x] `strategy-m5-04` is limited to docs/tasks-only convenience-scope lock; no new capability or runtime/execution/UI semantics change is introduced
- [x] priority 1 convenience candidate is commit-side bounded continuation only: `commit-package -> local commit`
- [x] the only acceptable future shape is a resume helper that re-checks the current commit approval state before continuing into the next explicit local step; it must not auto-create, auto-resolve, auto-consume, or hide the approval boundary
- [x] `release-package -> close-out` remains deferred future scope because linked-worktree guard, approved current release provenance, clean-repo verification, and terminal `Review -> Done` finalization stay heavier downstream boundaries
- [x] the full four-step downstream chain remains non-recommended and widening-forbidden, and provider/reviewer auto-start, hidden multi-step chaining, linked-worktree auto-switch, plus push/merge/publish/external release remain out of scope
- [x] `strategy-m5-05` is limited to docs/tasks-only operator-facing form lock; no new capability or runtime/execution/UI semantics change is introduced
- [x] the preferred operator-facing form is an in-panel commit-side resume CTA inside the existing commit guard area, not a one-click `prepare + commit` chain and not a new standalone surface
- [x] the final commit-side operator-facing label is `Resume Approved Local Commit`, and the executing CTA belongs only in `Task Detail`; `Artifacts` and `Decision Inbox` may at most navigate back to that panel
- [x] approval visibility remains mandatory: current approval status/id, current commit-package id, reviewer/builder/preflight provenance, and blocked reasons stay visible next to the helper
- [x] helper availability must come directly from current `commitExecutionReadiness` and `commitPackageReadiness`; the client must not recompute hidden commit semantics beyond those summaries
- [x] when approval is pending, rejected, stale, missing, or otherwise blocked, the helper stays disabled or absent and the operator continues through the existing explicit approval path; inbox affordance may at most navigate back to the task/panel without executing the step
- [x] `strategy-m5-06` is limited to docs/tasks-only release-side convenience-scope lock; no new capability or runtime/execution/UI semantics change is introduced
- [x] release-side is not permanently closed as manual/local-only; it remains a deferred convenience candidate only
- [x] the only allowed future shape is an in-panel resume helper from the approved current `release-package` bundle into `close-out`, not a new standalone surface and not a release-side one-click chain
- [x] the final release-side operator-facing label is `Resume Approved Close Out`, and the executing CTA belongs only in `Task Detail`; `Artifacts` and `Decision Inbox` stay navigation-only when a current approved release bundle exists
- [x] helper scope excludes `release-package` prepare/regeneration, `release-ready` approval resolution, linked worktree create/switch, and repo-clean recovery; those remain explicit/manual prerequisites outside the helper
- [x] Decision Inbox may at most navigate back to the current task/panel for release follow-up; it must not execute release-side steps
- [x] stale or blocked release bundles continue to show existing guard reasons only; navigation hints are reserved for current approved release bundles and do not appear as alternate execution affordances
- [x] one-click `release-package -> approval -> close-out`, hidden approval consumption, linked-worktree automation, repo-clean recovery automation, auto close-out, and the broader four-step chain remain widening-forbidden

### post-v1 coverage defaults [accepted]
- [x] `milestone-m3-freeze` remains a pure archive provenance record and is not trimmed in the current closure pass
- [x] `node scripts/smoke-qa-slice-01.mjs` remains optional browser coverage and is not promoted into the required regression gate
- [x] `node scripts/smoke-qa-slice-01.mjs` synthetic reviewed-bundle fixture now matches the current reviewer anchor contract and passes on current `main` when rerun outside the sandbox
- [x] task-breaker optional real-live coverage stays on the existing `node scripts/smoke-qa-live-slice-04.mjs` path and does not require a standalone provider live entrypoint
- [x] `DEC-030` is resolved by keeping future delete/archive/GC work behind an explicit operator-invoked retention consumer over the normalized Tier A/B/C rules

### remaining [OPEN]
- [x] the funded configured env plus inline `launchctl` injection now reruns all six target optional real-live entrypoints green on current `main`; future reruns from this shell still need inline env injection or app relaunch because bare `node` here does not inherit the login-session values automatically
- [x] `commit-helper-m5-07` implements the bounded `Resume Approved Local Commit` helper in `Task Detail` only: `Prepare Commit Package` and `Resume Approved Local Commit` stay executable there, while `Artifacts` and `Decision Inbox` keep commit provenance/readiness visible but downgrade to navigation-only hints back to the same guard area
- [x] `node scripts/smoke-ui-slice-10.mjs` now fixes the helper contract by asserting the `Resume Approved Local Commit` label, `open-taskboard-task` navigation path, `Open Task Detail Commit Guard` hint, and the `currentSurface === 'taskboard'` execution boundary in `ui/app.js`
- [x] `release-helper-m5-08` implements the bounded `Resume Approved Close Out` helper in `Task Detail` only: `Artifacts` and `Decision Inbox` keep release/close-out provenance and guard reasons visible but downgrade to navigation-only hints back to the same guard area only when the current approved release bundle is ready
- [x] `node scripts/smoke-ui-slice-12.mjs` now fixes the release-side helper contract by asserting the `Resume Approved Close Out` label, `Open Task Detail Close-Out Guard` hint, and navigation-only close-out copy in `ui/app.js`
- [x] `provider-eval-m5-09` concludes that no second provider adapter is needed for current completion: current `main` stays `openai-responses` only, and provider expansion remains explicitly deferred until optional real-live housekeeping or a concrete operator gap shows the current planner-through-reviewer boundary is insufficient
- [x] clean non-SSoT reference docs that can drift from the repo contracts

## milestone-m3-freeze [archive]

Historical freeze baseline retained for provenance. Current source-of-truth freeze entry is `milestone-m4-live-freeze`.

### freeze baseline [accepted]
- [x] current v1 baseline is frozen as `local-first / single-user-first / ops-first`, `development` pack only, and `local-demo-only` by default
- [x] docs/tasks language matches the implemented lifecycle, gate model, artifact taxonomy, linked worktree boundary, and close-out path
- [x] remaining v1 open items are separated into explicit `vNext` backlog entries only
- [x] `milestone-m3-freeze` does not add new capability or change runtime, execution, or UI semantics

### regression / verification [required freeze gate]
- [x] `node scripts/smoke-dev-loop-m2.mjs`
- [x] `node scripts/smoke-runtime-slice-05.mjs`
- [x] `node scripts/smoke-runtime-slice-06.mjs`
- [x] `node scripts/smoke-execution-slice-05.mjs`
- [x] `node scripts/smoke-execution-slice-06.mjs`
- [x] `node scripts/smoke-execution-slice-07.mjs`
- [x] `node scripts/smoke-execution-slice-08.mjs`
- [x] `node scripts/smoke-execution-slice-09.mjs`
- [x] `node scripts/smoke-execution-slice-10.mjs`
- [x] `node scripts/smoke-execution-slice-11.mjs`
- [x] `node scripts/smoke-ui-slice-11.mjs`
- [x] `node scripts/smoke-ui-slice-12.mjs`
- [x] `node scripts/smoke-worktree-slice-03.mjs`

### regression / verification [extended browser]
- [ ] `node scripts/smoke-qa-slice-01.mjs`
- [ ] `node scripts/smoke-qa-slice-02.mjs`
- [x] `node scripts/smoke-qa-slice-04.mjs`
- [x] `node scripts/smoke-qa-slice-06.mjs`

### clean worktree / reproducibility
- [x] no unintended worktree drift was introduced by the required freeze regression run; only intended freeze files remain modified
- [x] canonical regression entrypoints stay direct `node scripts/*.mjs`; no root package runner is required for the frozen baseline
- [x] required smoke fixtures keep runtime roots isolated under `var/` and use temp git repos for reproducible local execution

### vNext backlog
#### candidate A [next]
- [x] define the `DEC-016` live-provider opt-in boundary without changing the default `local-demo-only` baseline
- [x] keep the shipped default on `local-stub` and treat any live provider as explicit operator opt-in
- [x] clarify the adapter contract, secrets handling, health checks, and failure modes before any live-provider implementation starts
- [x] record the first concrete live provider as `OpenAI Responses API` in a new decision instead of extending `DEC-029`
- [x] fix the first live scope to `planner` only while keeping explicit opt-in, fail-closed behavior, and no fallback
- [x] lock the first live adapter strategy to canonical id `openai-responses`, with `live-provider` allowed only as a temporary compatibility alias
- [x] lock planner live output to Responses Structured Outputs via `text.format.type=json_schema`, with schema fields `artifactMarkdown` and `normalizedResult`
- [x] lock `outputText` extraction to top-level `response.output_text` first, then safe aggregated `output` content without fixed-index access
- [x] keep the concrete live model operator-pinned in project config instead of adding a repo default
- [x] implement opt-in provider selection/config plumbing behind the accepted boundary without changing current v1 semantics
- [x] add synthetic smoke coverage for config missing, readiness failure, fail-closed behavior, malformed adapter responses, and no-secret-leak guarantees
- [x] define `strategy-slice-03` as the architect-only live opt-in boundary while keeping the implemented planner live path unchanged
- [x] lock architect live input anchor to the latest plan bundle plus the fixed source-of-truth and architect code-context allowlists
- [x] lock architect live structured output to schema-backed `anchor`, `artifact`, and `normalizedResult` data with adapter-rendered markdown
- [x] lock architect live defaults to `task-breaker | human gate`, blocking decision-on-valid-blocked only, and fail-closed on invalid output or readiness failure
- [x] keep builder/reviewer live expansion and release/close-out semantics out of scope for this slice
- [x] update provider and release wording only if future implementation requires new operator-visible copy
- [x] implement architect live adapter, role-specific readiness, and architect-specific smoke coverage in a later slice
- [x] define `strategy-slice-04` as the task-breaker-only next live boundary while keeping the implemented planner plus architect live path unchanged
- [x] lock task-breaker input anchor to `planArtifactId / planRunId + architectureArtifactId / architectureRunId` and require latest architecture provenance to match the current latest plan before live execution
- [x] lock task-breaker live output to schema-backed `anchor`, `artifact`, and `normalizedResult` data with adapter-rendered canonical breakdown markdown
- [x] lock task-breaker live defaults to `builder | human gate` only, with builder allowed only on `needsDecision=false`, `blockers=[]`, and non-empty ordered sub-tasks
- [x] lock task-breaker blocked output to `needsDecision=true`, non-empty blockers, and exactly one blocking decision item (`kind=decision`, `sourceType=decision`, `blocksTask=true`)
- [x] keep the current breakdown UI/parser contract unchanged and keep builder/reviewer live expansion out of scope for this slice
- [x] implement task-breaker live adapter, provenance-chain enforcement, and task-breaker-specific readiness in `provider-slice-04`
- [x] add synthetic task-breaker live smoke coverage for happy-path, human-gate, provenance-mismatch, fail-closed, and no-secret-leak cases
- [x] add optional real live task-breaker smoke coverage behind explicit `OPENAI_API_KEY` and `OPENAI_RESPONSES_MODEL`
- [x] add task-breaker live browser/API QA coverage without widening current UI semantics
- [x] define `strategy-slice-05` as the builder-preflight-only next live boundary while keeping the implemented planner plus architect plus task-breaker live path unchanged
- [x] lock builder-preflight live input anchor to `planArtifactId / planRunId + architectureArtifactId / architectureRunId + breakdownArtifactId / breakdownRunId`, require the current architecture and breakdown provenance chain to match the current latest plan, and keep code context inside the approved architecture boundary
- [x] lock builder-preflight live structured output to schema-backed `anchor`, `artifact`, and `normalizedResult` data with adapter-rendered canonical preflight markdown that preserves the current shell parser contract
- [x] lock builder-preflight clean handoff to `request-builder-live-mutation-approval` only, with `architect | task-breaker | human gate` as the only escalation paths and builder-live-mutation plus reviewer live still blocked
- [x] lock builder-preflight config/readiness/failure defaults to explicit live opt-in, coarse project readiness, fail-closed no-fallback behavior, and no-secret-leak guarantees
- [x] keep builder live mutation / reviewer live expansion and release/close-out semantics out of scope for this slice
- [x] implement builder-preflight live adapter, upstream provenance enforcement, and builder-preflight-specific readiness in `provider-slice-05`
- [x] add synthetic builder-preflight live smoke coverage for happy-path, escalation-path, provenance-mismatch, fail-closed, and no-secret-leak cases
- [x] add builder-preflight live browser/API QA coverage without widening current UI semantics
- [x] define `strategy-slice-06` as the builder-live-mutation-only next live boundary while keeping the implemented planner plus architect plus task-breaker plus builder-preflight live path unchanged
- [x] lock builder-live-mutation input anchor to `projectId / taskId + planArtifactId / planRunId + architectureArtifactId / architectureRunId + breakdownArtifactId / breakdownRunId + preflightArtifactId / preflightRunId + approvalId + approvalTargetArtifactId / approvalTargetRunId + sourceOfTruthPaths + architectureAllowlistPaths + targetFileAllowlistPaths + codeContextPaths + targetFileBaselineDigests`
- [x] lock `approvalTarget*` to exact-match `preflight*`, lock `codeContextPaths` to the target-file allowlist set, and keep target files existing-file-only in this slice
- [x] lock builder-live-mutation allowlist/exact-match rules to repo-relative unique non-empty file-update paths inside the target-file allowlist, with actual changed files required to exact-match the validated file-update set
- [x] lock builder-live-mutation `nextStage` to `reviewer | architect | human gate` only, with reviewer valid only on `needsDecision=false`, `blockers=[]`, and `fileUpdates.length>=1`, and human gate valid only on `needsDecision=true`, `blockers.length>=1`, and exactly one blocking decision item
- [x] lock `change-summary / patch / diff` to one mutation bundle with partial persistence forbidden, repo restore + artifact non-creation + approval non-consumption on validation failure
- [x] keep reviewer live expansion out of scope, and document reviewer blocked/degraded in a live-mode project as an explicit operator step instead of a silent fallback
- [x] keep provider secret/auth/raw payload/env value non-leak in scope for this slice while leaving repo-content redaction policy out of scope
- [x] implement builder-live-mutation live adapter, anchor enforcement, atomic mutation-bundle persistence, and approval-consumption rules in `provider-slice-06`
- [x] add synthetic builder-live-mutation live smoke coverage for happy-path, approval-consumption, allowlist-mismatch, exact-match-failure, fail-closed, and no-secret-leak cases
- [x] add builder-live-mutation live browser/API QA coverage without widening reviewer live semantics
- [x] define `strategy-slice-07` as the reviewer-only next live boundary while keeping the current implemented live path unchanged until later `provider-slice-06` and `provider-slice-07`
- [x] lock reviewer live input to the latest builder live-mutation bundle only, with matched upstream provenance, builder logs, exact changed-file context, and no recombining latest artifacts by type
- [x] lock reviewer live structured output to schema-backed `anchor / artifact / normalizedResult` data with canonical `Review Verdict / Evidence Reviewed / Findings / Contract Compliance / Verification Evidence / Accepted Risks / Next Action / Follow-Up Gate` headings and raw `fail` preserved
- [x] lock reviewer live follow-up to `builder | architect | human gate` only, keep pass-side follow-up explicit instead of auto-starting `commit-package`, and allow at most one blocking `sourceType=review` decision item only when the review explicitly needs it
- [x] keep reviewer live fail-closed, no-fallback, no-approval-creation, and no-secret-leak guarantees in scope without widening commit-package, local commit, release-package, or close-out semantics
- [x] implement reviewer live adapter, builder-bundle anchor enforcement, and terminal review artifact persistence in `provider-slice-07`
- [x] add synthetic reviewer live smoke coverage for pass, fail, changes-requested, architecture-drift, human-gate, fail-closed, and no-secret-leak cases
- [x] add reviewer live browser/API QA coverage without widening commit-package, local commit, release-package, or close-out semantics

#### candidate B [later]
- [ ] define retention-consumer capability against the normalized Tier A/B/C artifact rules
- [ ] apply delete/archive/GC policy without weakening provenance-critical artifact protection
- [ ] keep Tier A protected while preserving explicit, inspectable retention behavior for Tier B and Tier C

#### optional verification / housekeeping
- [x] optional real live planner plus architect smoke entrypoints are available behind explicit `OPENAI_API_KEY` and `OPENAI_RESPONSES_MODEL`
- [x] `node scripts/smoke-qa-live-slice-04.mjs` historical optional real-live result is now tracked in `milestone-m4-live-freeze -> optional real-live verification`
- [x] `node scripts/smoke-qa-live-slice-05.mjs` historical optional real-live result is now tracked in `milestone-m4-live-freeze -> optional real-live verification`
- [x] `node scripts/smoke-qa-live-slice-06.mjs` historical optional real-live result is now tracked in `milestone-m4-live-freeze -> optional real-live verification`
- [x] `node scripts/smoke-qa-live-slice-07.mjs` historical optional real-live result is now tracked in `milestone-m4-live-freeze -> optional real-live verification`
- [x] `node scripts/smoke-qa-slice-01.mjs` remains optional browser coverage unless a later freeze decision explicitly promotes it
- [x] clean non-SSoT reference docs that can drift from the repo contracts

## milestone-m2-consolidation

### current core loop [accepted]
- [x] `project_path` gate is enforced before task execution and task creation in the shell
- [x] first-run bootstrap is the `Taskboard` project registry and later project selection reuses the same shell path
- [x] `planner -> architect -> task-breaker -> builder preflight` stores logs and artifacts through the coordinator
- [x] builder live mutation requires a targeted approval for the latest preflight and saves `change-summary`, `patch`, and `diff`
- [x] reviewer is anchored to the latest builder live-mutation bundle and records a terminal review artifact
- [x] `commit-package` and limited local git commit are wired behind explicit human approval
- [x] `release-package` is anchored to the latest successful local commit bundle and only prepares a local/demo-only release artifact plus `human/release` approval
- [x] latest approved `release-package` bundle now drives explicit `close-out` artifact capture and `Review -> Done` transition without push, publish, or external release
- [x] dedicated linked worktree guarding is narrow and only applies to `release-package` and `close-out`
- [x] `Taskboard / Logs / Artifacts / Decision Inbox` operate as the primary ops shell surfaces
- [x] `Task Detail / Artifacts` can prepare a `release-package`, show structured release provenance and guard reasons, and preselect the matching `human/release` inbox item without forcing a surface change
- [x] stale smoke expectations and live-mutation fixture assumptions were consolidated around the current guard and preflight contract
- [x] a real-path end-to-end development loop smoke now covers planner through local commit on a clean temp repo
- [x] provider stance keeps `local-stub` as the shipped default while planner plus architect `openai-responses` live opt-in remains explicit and fail-closed
- [x] accepted / rejected / [OPEN] docs are reconciled to the implemented bootstrap, worktree, build, review, commit, release-package, close-out, and artifact-policy baseline

### next phase entry conditions
- [x] real-path smoke coverage is green for planner through local commit, including the end-to-end dev loop smoke
- [x] red or stale smoke debt is either fixed or replaced with current coverage
- [x] `accepted / rejected / [OPEN]` docs match the implemented core loop and remaining release gate

### remaining [OPEN]
- [x] remaining release or human-gate scope is explicitly approved instead of implied

### completed slices [archive]
- [x] strategy-slice-02
- [x] provider-slice-02
- [x] strategy-slice-03
- [x] full-docs-reconcile-01
- [x] docs-patch-06
- [x] runtime-slice-01
- [x] runtime-slice-02
- [x] runtime-slice-03
- [x] runtime-slice-04
- [x] runtime-slice-05
- [x] authoring-slice-01
- [x] ui-slice-01
- [x] execution-slice-01
- [x] execution-slice-02
- [x] execution-slice-03
- [x] execution-slice-04
- [x] execution-slice-05
- [x] execution-slice-06
- [x] execution-slice-07
- [x] execution-slice-08
- [x] execution-slice-09
- [x] execution-slice-10
- [x] execution-slice-11
- [x] ui-slice-02
- [x] ui-slice-03
- [x] ui-slice-04
- [x] ui-slice-05
- [x] ui-slice-06
- [x] ui-slice-07
- [x] ui-slice-08
- [x] ui-slice-09
- [x] ui-slice-10
- [x] ui-slice-11
- [x] ui-slice-12
- [x] worktree-slice-01
- [x] worktree-slice-02
- [x] worktree-slice-03
- [x] qa-slice-01
- [x] provider-slice-01

### deferred / rejected
- [ ] provider adapter
- [ ] report/content packs
- [ ] office/radar view
