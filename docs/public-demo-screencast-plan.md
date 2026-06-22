# Public Demo / Screencast Plan

## Decision

현재 public portfolio evidence는 hosted demo보다 recorded screencast를 우선한다.

## Why Recorded Screencast First

- 현재 제품은 local-first PoC이며, `project_path`가 실제 로컬 git worktree를 가리켜야 한다.
- hosted public demo는 runtime state, local path, artifact/log persistence, secret exposure boundary를 별도로 설계해야 한다.
- README와 `docs/local-demo-checklist.md`는 이미 local UI/API 확인 경로를 제공한다.
- 2026-06-22 기준 대표 local user-flow smoke가 pass evidence로 고정되어 있다.

Hosted demo는 아직 공개 URL이 없으므로 README에 demo URL로 연결하지 않는다.

## Source Evidence

| Evidence | File |
|---|---|
| Local demo checklist | `docs/local-demo-checklist.md` |
| Representative user-flow smoke | `evidence/cli-logs/smoke-v1-user-flow-kickoff-2026-06-22.status` |
| UI screenshots | `evidence/screenshots/mission-surface.png`, `taskboard-surface.png`, `artifacts-surface.png` |
| Evidence manifest | `evidence/evidence_manifest.md` |
| Local screencast artifact | `output/playwright/public-demo-screencast-2026-06-22/orchestration-public-demo-2026-06-22.webm` |
| Local portfolio package with screencast | `_portfolio_export/orchestration_portfolio_pack_2026-06-22_screencast.zip` |

## Recorded Local Artifact

2026-06-22에 local-first walkthrough screencast를 생성했다.

- 파일: `output/playwright/public-demo-screencast-2026-06-22/orchestration-public-demo-2026-06-22.webm`
- 형식: WebM
- 크기: `3.2M` (`ls -lh` 기준)
- 저장 경계: `output/`는 `.gitignore`에 의해 제외되므로 영상 파일은 repository commit에 포함하지 않는다.
- 녹화 범위: local UI/API server, real local `project_path`, project/task/planner run/artifact visibility, Mission/Council/Execution/Deliverables/Taskboard surfaces
- package attachment: `_portfolio_export/orchestration_portfolio_pack_2026-06-22_screencast.zip`에 screencast 포함 local portfolio package를 생성했다.
- 제한: hosted public URL 또는 외부 공유 URL은 아직 생성하지 않았다.

## Screencast Storyboard

1. Open README and show project scope.
   - Point out `PoC / local-first / single-user / ops-first`.
   - Point out Scope & Limitations before showing features.

2. Start the local UI/API server.

```bash
node scripts/serve-ui-slice-01.mjs --runtime-root /tmp/orchestration-demo-runtime
```

3. Confirm runtime state through the API.

```bash
curl http://127.0.0.1:4310/api/snapshot
```

4. Open the local shell.

```text
http://127.0.0.1:4310/
```

5. Show the primary surfaces.
   - Mission
   - Council
   - Execution
   - Deliverables
   - Taskboard
   - Logs
   - Artifacts
   - Decision Inbox

6. Show the local-stub demo path.
   - Register project with a real local `project_path`.
   - Create a task.
   - Run planner.
   - Confirm snapshot contains project, task, run, and artifact records.

7. Show evidence and limitations.
   - Open `evidence/cli-logs/smoke-v1-user-flow-kickoff-2026-06-22.status`.
   - Open `evidence/evidence_manifest.md`.
   - State that hosted public demo and optional live-provider rerun are not included yet.

## Capture Rules

- Do not display API keys, tokens, `.env` values, personal data, or unrelated local paths.
- Use `/tmp/orchestration-demo-runtime` for demo runtime state.
- Use a temporary or clearly non-sensitive local repo path when recording.
- Do not claim user metrics, automation percentages, performance improvements, or production readiness.
- Show missing hosted demo and optional live-provider status as limitations, not completed features.

## Verification Before Recording

Run these checks before recording the final screencast:

```bash
node scripts/smoke-v1-user-flow-kickoff.mjs
node scripts/verification_status.mjs
```

Expected current evidence:

- `smoke-v1-user-flow-kickoff`: pass
- `verification_status`: required `1/1`, informational `84/84`, failures `[]`

## Remaining Open Items

- Decide whether to publish the local portfolio package or screencast to an external share target if external review needs a URL.
- Decide whether to add a hosted static walkthrough later or keep the portfolio demo as a recorded local-first walkthrough plus local package.
- Rerun optional OpenAI live-provider smoke only when configured env is visible.
