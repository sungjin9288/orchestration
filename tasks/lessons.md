# lessons

## core loop

- runtime core는 file-based thin slice로 닫는 접근이 유효했다.
- gate enforcement는 UI보다 먼저 닫는 편이 구조적으로 안정적이었다.
- flags 모델(`blocked / waitingApproval / waitingDecision`)은 상태 확장보다 단순하고 유지보수에 유리했다.
- planner -> architect -> task-breaker -> builder preflight를 runtime/coordinator 위에 얇게 쌓는 방식은 broad refactor 없이 core loop를 닫는 데 유효했다.
- reviewer provenance는 task 전체의 latest artifact 조합이 아니라 latest builder live-mutation bundle 하나에 고정해야 drift를 막을 수 있었다.
- commit-package readiness와 local commit readiness도 latest passing reviewer bundle 하나에 고정하는 편이 provenance와 duplicate 제어를 단순하게 유지했다.
- release-package readiness는 task 전역 latest artifact를 다시 조합하지 말고 latest successful local commit bundle 하나에 고정해야 post-commit provenance drift를 막을 수 있었다.

## shell / gate handling

- 초기 UI는 write action보다 gate/status visibility에 집중하는 편이 pack 제약과 구조 안정성에 더 맞았다.
- shell server 안의 최소 mutation route + snapshot echo만으로도 write UI를 generic API layer 없이 붙일 수 있었다.
- pending inbox action route 하나와 snapshot 기반 selection 갱신만으로 human gate loop를 닫을 수 있었다.
- approval authorization은 최신 approval record만 보는 것으로는 부족하고, 해당 record가 최신 preflight 또는 commit-package target을 가리키는지까지 확인해야 stale allow를 막을 수 있었다.
- live mutation, reviewer, commit-package, local commit enablement는 UI 추정보다 runtime/coordinator readiness를 그대로 읽는 편이 drift를 줄였다.
- release-ready approval도 preflight target만으로는 충분하지 않고 `releasePackageArtifactId / commitResultArtifactId / commitPackageArtifactId / sourceReviewerRunId / sourceBuilderRunId / targetPreflightArtifactId / commitSha / deliveryStance`를 metadata에 모두 고정해야 stale allow를 막을 수 있었다.
- same source commit bundle에 대한 release approval은 pending/approved를 409로 닫고 rejected만 재요청 허용하는 편이 duplicate 제어와 human gate 재시도를 함께 단순하게 유지했다.

## smoke / fixtures

- localhost 기반 UI smoke는 sandbox listen 제약을 받으므로 승인 가능한 로컬 서버 smoke로 정리하는 편이 실용적이었다.
- limited live mutation smoke는 repo root 파일을 직접 fixture로 쓰면 기존 mutation marker가 누적되어 no-op write를 숨길 수 있으므로, clean fixture project를 따로 만들어야 안정적이다.
- synthetic downstream bundle smoke는 reviewer, commit-package, local commit의 provenance 규칙을 빠르게 검증하는 데 유효했지만, upstream live-mutation path를 대체할 수는 없었다.
- release-package처럼 범위를 좁힌 후속 slice는 기존 dev-loop smoke를 흔들기보다 별도 execution smoke로 duplicate/stale/blocked 케이스를 닫는 편이 회귀 추적에 유리했다.
- release gate 근거로는 synthetic smoke만으로 부족하고, planner부터 local commit까지 한 번에 도는 real-path dev loop smoke가 필요했다.
- stale smoke assertion은 과거 route-specific 에러 문구보다 현재 runtime/coordinator guard를 source of truth로 따라가는 편이 유지보수에 유리했다.

## next phase

- 다음 병목은 새 capability 추가가 아니라 consolidation이다.
- consolidation 단계에서는 `accepted / rejected / [OPEN]`를 구현 기준으로 다시 쓰고, task 문서도 같은 기준으로 즉시 재정렬해야 이후 release gate 논의가 흔들리지 않는다.
- release / human gate 전에는 provider stance, first-run project path, worktree requirement, task close-out requirement를 명시적으로 정리해야 한다.
