# State Transition Summary

| Step | Active project | Task lifecycle | Flags | Runs | Artifacts | Latest run |
|---|---|---|---|---:|---:|---|
| 00 initial | - | - | - | 0 | 0 | - |
| 01 after project | project-0001 | - | - | 0 | 0 | - |
| 02 after task | project-0001 | Inbox | blocked=false<br>waitingApproval=false<br>waitingDecision=false | 0 | 0 | - |
| 03 after planner | project-0001 | In Progress | blocked=false<br>waitingApproval=false<br>waitingDecision=false | 1 | 1 | run-0001 |
| 04 after architect | project-0001 | In Progress | blocked=false<br>waitingApproval=false<br>waitingDecision=false | 2 | 2 | run-0002 |
| 05 after task-breaker | project-0001 | In Progress | blocked=false<br>waitingApproval=false<br>waitingDecision=false | 3 | 3 | run-0003 |

## Response Result Summary

- 01-create-project-response.json: create-project ok
- 02-create-task-response.json: create-task ok
- 03-run-planner-response.json: run-planner ok
- 04-run-architect-response.json: run-architect ok
- 05-run-task-breaker-response.json: run-task-breaker ok
