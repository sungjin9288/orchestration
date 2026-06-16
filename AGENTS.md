# Orchestration 1.0 Repository Rules

## Purpose
Build Orchestration 1.0 as a local-first, single-user-first, ops-first control plane.

## Codex Operating Rules

### Default Flow
- Start non-trivial work with `$repo-intake`.
- Follow `$orchestration-freeze-gate` for runtime, UI, docs, tasks, smoke slices, and any change that can widen scope or alter baseline behavior.
- Finish with `$verify-gate` before close-out.
- Use `$task-ledger-sync` when `tasks/todo.md` or `tasks/lessons.md` should change as part of the work.
- Do not use `$release-evidence` by default; add it only when the task explicitly refreshes an existing QA, smoke, or handoff artifact flow.

### Source Of Truth
- Keep repo docs, `DESIGN.md` when present, and task files as source of truth.
- Preserve the frozen baseline unless the task explicitly widens scope.
- If a new discovery conflicts with the current docs, report the conflict and update docs only when the task scope supports it.

### Skill And MCP Expansion
- Add `$playwright` and Playwright MCP only when a real browser or UI slice needs runtime proof.
- Add `$linear` and Linear MCP only when the task is tied to tracked issue, project, or operations follow-up work.
- Keep optional live-provider verification non-blocking unless the task explicitly targets that boundary.
- If extra skills or MCPs are added, state briefly why they were needed.

### Execution Rules
- Choose the smallest vertical slice that satisfies the task.
- Do not silently change architecture, workflow boundaries, or downstream semantics.
- Distinguish required synthetic gates from optional live-provider reruns in both execution and reporting.
- Record environment visibility and runtime evidence exactly rather than inferring hidden state.

## Non-negotiable Rules
- local-first, single-user-first, ops-first
- source of truth for policy/contracts is repo files
- v1 scope = development pack only
- company/ERP-style shell, visible AI roles, meeting flow, and workday framing are allowed when they preserve execution gates, advanced-ops authority, and local-first operation
- do not introduce messenger-first, ranking, OAuth, multi-provider-first, budget/HR/org-management, or multiplayer workspace semantics
- project_path is required before any execution
- review before done
- approval before commit
- builder must not silently change architecture
- prefer thin-slice / vertical-slice
- propose a plan before multi-file edits
- do not edit files until approval when the task explicitly asks for planning first

## Required Read Order
1. AGENTS.md
2. docs/00_master-brief.md
3. docs/01_decision-log.md
4. docs/02_ia-v1.md
5. docs/03_architecture-roadmap-v1.md
6. packs/development/pack.md
7. tasks/todo.md
8. tasks/lessons.md

When UI shell/design work is in scope, also read `DESIGN.md` after the required docs.

## Required Output Format
- changed files
- why
- commands run
- test/check results
- remaining [OPEN]

---

## README 정직성 규칙 (포트폴리오 공개용 — 반드시 준수)

이 repo의 README는 채용 담당자·외부 방문자가 본다. README를 생성·수정할 때 아래를 **절대 규칙**으로 지킨다. 규칙을 어기면 작업을 멈추고 보고한다.

### 금지

- **측정 근거를 한 줄로 댈 수 없는 수치는 쓰지 않는다.** (예: "99.8% 비용 절감", "94.2% 자동화", "정확도 95%", "요청당 €0.0005")
  - 숫자를 쓰려면 **어떻게 쟀는지**(측정 커맨드·로그·방법)를 같은 자리에 표기한다. 못 대면 **삭제**한다.
- **과장 표현 금지**: "production-ready", "enterprise", "상용 운영", "엔터프라이즈". 실제가 PoC/MVP면 그대로 표기한다.
- 코드에 **없는** 기능·엔드포인트·성과를 적지 않는다. 추측 금지.

### 필수

- **테스트 수는 실제 코드로 카운트**해서 적고, 카운트 커맨드를 함께 둔다.
  - 예: `grep -rE "def test_" tests | wc -l`, `grep -rE "\b(test|it)\(" --include="*.test.*" | wc -l`
  - "정의된 함수 수"와 "통과 수"를 구분한다. 실제로 돌리지 않았으면 **"정의 기준 카운트, pass 여부는 별도 확인"**으로 표기.
- **엔드포인트·환경변수·디렉터리 구조는 코드/`.env.example`에서 직접 추출**한다. 손으로 지어내지 않는다.
- **`## Scope & Limitations` 섹션을 반드시 둔다.** 미구현·미검증·외부 의존·범위 밖 항목을 명시한다.
- **Demo·운영 URL은 접근 검증된 것만 링크**한다. 미검증이면 "(접근 검증 필요)"로 표기한다.

### 표준 구조

제목 → 한 줄 소개 → Why I Built This → Features → Tech Stack → Architecture → Key Design Decisions → Getting Started → (API/Usage) → Testing → Scope & Limitations → Links

### 갱신 절차

1. README를 고치기 전에 위 규칙을 먼저 적용한다.
2. 수정 후 **측정 근거 없는 새 수치가 들어가지 않았는지** 스스로 검사한다 (`99.8`, `production-ready` 등 grep).
3. 큰 변경은 "어디를 왜 바꿨는지"를 커밋 메시지/PR에 남긴다.
