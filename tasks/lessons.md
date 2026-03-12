# lessons

- runtime core는 file-based thin slice로 닫는 접근이 유효했다.
- gate enforcement는 UI보다 먼저 닫는 편이 구조적으로 안정적이었다.
- flags 모델(blocked / waitingApproval / waitingDecision)은 상태 확장보다 단순하고 유지보수에 유리했다.
- 다음 병목은 runtime이 아니라 role/authoring layer 부재다.
- role prompt contract는 pack 내부 계약을 그대로 반영하고 handoff/escalation을 명시해야 runtime 수정 없이도 drift를 줄일 수 있다.
- ui-slice-01은 runtime snapshot/log/artifact read surface만으로도 4개 1급 화면의 read-only ops shell을 닫을 수 있었다.
- 초기 UI는 write action 없이 gate/status visibility에 집중하는 편이 pack 제약과 구조 안정성에 더 맞았다.
- localhost 기반 UI smoke는 sandbox listen 제약을 받으므로 브라우저 검증 경로는 승인 가능한 로컬 서버 smoke로 정리하는 편이 실용적이었다.
- execution coordinator를 runtime 위에 얇게 올리고 planner만 먼저 연결하면 role 실행 경로를 broad refactor 없이 검증할 수 있다.
- shell server 안의 최소 mutation route + snapshot echo만으로도 write UI를 generic API layer 없이 붙일 수 있었다.
- planner artifact를 architect input으로 직접 handoff하면 runtime contract 확장 없이 role chaining과 blocking decision 생성 규칙을 얇게 검증할 수 있다.
- ui-slice-03은 pending inbox action route 하나와 snapshot 기반 selection 갱신만으로 human gate loop를 닫을 수 있었다.
- task-breaker는 pending blocking decision/approval를 run 시작 전에 거절하면 builder 전 단계 gate enforcement를 UI 없이도 안정적으로 유지할 수 있다.
- ui-slice-04는 breakdown markdown을 best-effort parse하고 raw fallback을 항상 남기면 artifact contract를 바꾸지 않고도 generated subtasks read surface를 붙일 수 있다.
- task-breaker UI disable은 pending approval / blocksTask decision 실데이터 기준으로 계산하고 최종 판정은 server/coordinator에 남기는 편이 drift를 줄인다.
