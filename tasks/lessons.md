# lessons

## core loop

- runtime core는 file-based thin slice로 닫는 접근이 유효했다.
- gate enforcement는 UI보다 먼저 닫는 편이 구조적으로 안정적이었다.
- flags 모델(`blocked / waitingApproval / waitingDecision`)은 상태 확장보다 단순하고 유지보수에 유리했다.
- planner -> architect -> task-breaker -> builder preflight를 runtime/coordinator 위에 얇게 쌓는 방식은 broad refactor 없이 core loop를 닫는 데 유효했다.
- reviewer provenance는 task 전체의 latest artifact 조합이 아니라 latest builder live-mutation bundle 하나에 고정해야 drift를 막을 수 있었다.
- commit-package readiness와 local commit readiness도 latest passing reviewer bundle 하나에 고정하는 편이 provenance와 duplicate 제어를 단순하게 유지했다.
- release-package readiness는 task 전역 latest artifact를 다시 조합하지 말고 latest successful local commit bundle 하나에 고정해야 post-commit provenance drift를 막을 수 있었다.
- close-out readiness는 release-package readiness를 재사용하지 말고 별도 계산으로 두는 편이 승인 완료 release bundle과 terminal Done duplicate를 함께 다루기에 안정적이었다.

## shell / gate handling

- 초기 UI는 write action보다 gate/status visibility에 집중하는 편이 pack 제약과 구조 안정성에 더 맞았다.
- shell server 안의 최소 mutation route + snapshot echo만으로도 write UI를 generic API layer 없이 붙일 수 있었다.
- linked worktree selection도 같은 패턴으로 닫을 수 있었고, detection은 current project_path에서 server-derived로 계산하고 release/close-out guard ownership은 coordinator에 그대로 두는 편이 drift를 막았다.
- detected linked worktree와 registered project 매핑은 raw string path가 아니라 canonical realpath 기준으로 처리해야 symlink나 alias path가 섞여도 shell switch가 흔들리지 않았다.
- active project를 detected linked worktree root로 바꿀 때는 project migration을 시도하지 말고 기존 create/select 흐름만 재사용하면서 selected task/run/artifact/inbox selection을 새 project scope로 reset/hydrate 하는 편이 범위를 안정적으로 유지했다.
- linked worktree create도 Project Bootstrap의 단일 write action과 server-side `git worktree add` route 하나로 닫는 편이 범위와 UX를 안정적으로 유지했다.
- linked worktree create 직후에는 task migration이나 `task.worktreeRef` auto-set을 붙이지 말고, canonical realpath 기준 project register/select 재사용까지만 닫는 편이 기존 relation model과 core loop semantics를 흔들지 않았다.
- pending inbox action route 하나와 snapshot 기반 selection 갱신만으로 human gate loop를 닫을 수 있었다.
- approval authorization은 최신 approval record만 보는 것으로는 부족하고, 해당 record가 최신 preflight 또는 commit-package target을 가리키는지까지 확인해야 stale allow를 막을 수 있었다.
- live mutation, reviewer, commit-package, local commit enablement는 UI 추정보다 runtime/coordinator readiness를 그대로 읽는 편이 drift를 줄였다.
- provider opt-in도 같은 원칙으로 project-level coarse readiness summary만 노출하고, project.readiness 자체는 provider health로 재정의하지 않는 편이 경계를 안정적으로 유지했다.
- explicit live opt-in은 env 존재만으로 auto-enable하지 말고, config/env/readiness가 하나라도 비정상이면 local-stub fallback 없이 fail-closed로 막는 편이 no-secret-leak과 operator intent를 함께 지키기 쉬웠다.
- 첫 concrete live provider는 broad capability 비교보다 현재 `execute(request) -> outputText` 계약과 planner artifact path에 가장 작은 delta로 붙는 대상을 고르는 편이 범위를 안정적으로 유지했다.
- first live adapter canonical id를 `openai-responses`로 고정하고 `live-provider`는 임시 alias로만 두는 편이 이후 provider drift와 문서/상태 불일치를 줄이기 쉽다.
- planner live output은 Responses Structured Outputs(`text.format.type=json_schema`)로 `artifactMarkdown + normalizedResult`를 함께 받는 편이 기존 artifact contract와 decision routing을 가장 작게 유지한다.
- `outputText`는 `response.output_text`를 우선 사용하고, 없으면 `output` array의 `output_text` content를 aggregate하는 편이 응답 shape 변화에 더 안전하며 fixed-index 접근보다 유지보수가 쉽다.
- actual live adapter도 project-level readiness는 planner 기준 coarse summary만 노출하고, non-planner role은 adapter readiness에서 `degraded/blocked`로 닫는 편이 UI 개편 없이 scope를 유지하기 쉽다.
- malformed live provider response는 run error로만 남기고 artifact를 만들지 않는 편이 fail-closed와 provenance cleanliness를 함께 지키기 쉽다.
- first live scope는 planner-only로 고정하고, concrete model default는 repo에 박지 말고 operator-pinned project config로 두는 편이 v1 semantics와 provider drift를 함께 막기 쉬웠다.
- release-ready approval도 preflight target만으로는 충분하지 않고 `releasePackageArtifactId / commitResultArtifactId / commitPackageArtifactId / sourceReviewerRunId / sourceBuilderRunId / targetPreflightArtifactId / commitSha / deliveryStance`를 metadata에 모두 고정해야 stale allow를 막을 수 있었다.
- same source commit bundle에 대한 release approval은 pending/approved를 409로 닫고 rejected만 재요청 허용하는 편이 duplicate 제어와 human gate 재시도를 함께 단순하게 유지했다.
- release-package enable/disable과 approval status(`none / pending / approved / rejected / stale`)는 UI에서 별도 semantics를 다시 계산하지 말고 `releasePackageReadiness` summary를 그대로 읽어야 polling과 stale handling drift를 막을 수 있었다.
- release approval inbox item preselect는 surface 전환 없이 background selection만 갱신해야 Task Detail / Artifacts 중심 shell을 유지하면서 human gate follow-up을 연결할 수 있었다.
- global artifact default priority는 유지하고 release mutation 직후에만 새 `release-package` artifact를 명시적으로 선택해야 일반 refresh가 사용자의 현재 selection을 덮어쓰지 않았다.
- close-out gate는 runtime 일반 lifecycle guard에 release semantics를 밀어넣기보다 coordinator 전용 guard로 두고, `Review + passed + no flags + approved current release bundle + clean repo`를 한 번에 확인하는 편이 범위를 안정적으로 유지했다.
- terminal close-out duplicate는 latest approved release approval id가 아니라 `sourceReleasePackageArtifactId` 기준으로 닫는 편이 재실행 차단과 provenance 추적이 단순했다.
- local commit 이후에도 close-out 직전에 repo clean(unstaged/staged/untracked 모두 0)을 다시 확인해야 승인된 release bundle 이후의 drift를 막을 수 있었다.

## smoke / fixtures

- localhost 기반 UI smoke는 sandbox listen 제약을 받으므로 승인 가능한 로컬 서버 smoke로 정리하는 편이 실용적이었다.
- limited live mutation smoke는 repo root 파일을 직접 fixture로 쓰면 기존 mutation marker가 누적되어 no-op write를 숨길 수 있으므로, clean fixture project를 따로 만들어야 안정적이다.
- synthetic downstream bundle smoke는 reviewer, commit-package, local commit의 provenance 규칙을 빠르게 검증하는 데 유효했지만, upstream live-mutation path를 대체할 수는 없었다.
- release-package처럼 범위를 좁힌 후속 slice는 기존 dev-loop smoke를 흔들기보다 별도 execution smoke로 duplicate/stale/blocked 케이스를 닫는 편이 회귀 추적에 유리했다.
- close-out도 같은 패턴으로 synthetic downstream execution smoke를 따로 두는 편이 release-package 회귀와 Done transition 회귀를 분리해서 추적하기 좋았다.
- release gate 근거로는 synthetic smoke만으로 부족하고, planner부터 local commit까지 한 번에 도는 real-path dev loop smoke가 필요했다.
- stale smoke assertion은 과거 route-specific 에러 문구보다 현재 runtime/coordinator guard를 source of truth로 따라가는 편이 유지보수에 유리했다.
- browser click smoke는 DOM에서 landing/selection/visibility만 보고, task/worktree/close-out 의미론은 `/api/snapshot`과 artifact API로 확인하는 편이 범위와 brittleness를 함께 줄였다.
- provider opt-in browser smoke도 같은 원칙으로 DOM에서는 summary, readiness, allowed/reason, disabled state만 확인하고 fail-closed 의미론은 API로 한 번 더 닫는 편이 안정적이었다.
- planner-only live browser smoke도 provider config mutation 자체는 API로 두고, 브라우저에서는 opt-in 반영 상태와 planner click-through만 확인하는 편이 현재 shell 구조에서 더 안정적이었다.
- Task Detail help copy는 upstream artifact id가 아직 없을 수 있으므로 null-safe로 렌더링해야 browser smoke 전에 shell이 죽지 않는다.
- Playwright CLI 세션 고정은 wrapper 전용 env var에 기대지 말고 각 호출에 `--session`을 명시하는 편이 로컬 재현성과 디버깅 안정성이 높았다.

## next phase

- 다음 병목은 새 capability 추가가 아니라 consolidation이다.
- consolidation 단계에서는 `accepted / rejected / [OPEN]`를 구현 기준으로 다시 쓰고, task 문서도 같은 기준으로 즉시 재정렬해야 이후 release gate 논의가 흔들리지 않는다.
- release / human gate 전에는 provider stance, first-run project path, worktree requirement, task close-out requirement를 명시적으로 정리해야 한다.
- consolidation 문서는 speculative phase language보다 current implemented baseline + remaining open 구조로 정리하는 편이 drift를 줄이기 쉬웠다.
- linked worktree create/switch semantics는 새 capability처럼 문서를 넓히기보다 기존 `DEC-019`와 `DEC-026` 설명을 보강하는 편이 현재 경계를 더 정확하게 유지했다.
- core docs는 `runtime/contracts`, `runtime-service`, `execution-coordinator`, shell readiness summary를 source of truth로 따라가야 `Planned`, broad worktree isolation, generic inbox actions 같은 stale wording이 다시 들어오지 않았다.
