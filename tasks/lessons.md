# lessons

- runtime core는 file-based thin slice로 닫는 접근이 유효했다.
- gate enforcement는 UI보다 먼저 닫는 편이 구조적으로 안정적이었다.
- flags 모델(blocked / waitingApproval / waitingDecision)은 상태 확장보다 단순하고 유지보수에 유리했다.
- 다음 병목은 runtime이 아니라 role/authoring layer 부재다.
- role prompt contract는 pack 내부 계약을 그대로 반영하고 handoff/escalation을 명시해야 runtime 수정 없이도 drift를 줄일 수 있다.
