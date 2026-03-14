# todo

## milestone-m2-consolidation

### current core loop [accepted]
- [x] `project_path` gate is enforced before task execution and task creation in the shell
- [x] `planner -> architect -> task-breaker -> builder preflight` stores logs and artifacts through the coordinator
- [x] builder live mutation requires a targeted approval for the latest preflight and saves `change-summary`, `patch`, and `diff`
- [x] reviewer is anchored to the latest builder live-mutation bundle and records a terminal review artifact
- [x] `commit-package` and limited local git commit are wired behind explicit human approval
- [x] `release-package` is anchored to the latest successful local commit bundle and only prepares a local/demo-only release artifact plus `human/release` approval
- [x] latest approved `release-package` bundle now drives explicit `close-out` artifact capture and `Review -> Done` transition without push, publish, or external release
- [x] `Taskboard / Logs / Artifacts / Decision Inbox` operate as the primary ops shell surfaces
- [x] `Task Detail / Artifacts` can prepare a `release-package`, show structured release provenance and guard reasons, and preselect the matching `human/release` inbox item without forcing a surface change
- [x] stale smoke expectations and live-mutation fixture assumptions were consolidated around the current guard and preflight contract
- [x] a real-path end-to-end development loop smoke now covers planner through local commit on a clean temp repo

### now [OPEN]
- [ ] decide release stance for provider choice: initial live provider vs `local-stub` demo-only
- [ ] decide first-run project registration/select UX required before release

### next phase entry conditions
- [x] real-path smoke coverage is green for planner through local commit, including the end-to-end dev loop smoke
- [x] red or stale smoke debt is either fixed or replaced with current coverage
- [x] `accepted / rejected / [OPEN]` docs match the implemented core loop and remaining release gate
- [ ] remaining release or human-gate scope is explicitly approved instead of implied

### completed slices [archive]
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

### deferred / rejected
- [ ] provider adapter
- [ ] report/content packs
- [ ] office/radar view
