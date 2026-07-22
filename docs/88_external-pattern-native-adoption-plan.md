# External Pattern Native Adoption Plan

## Purpose

이 문서는 AirLLM, Build Your Own X, wigolo, AI Engineering From Scratch,
AI Agent Book, Superloopy, pxpipe에서 확인한 패턴을 Orchestration 안에 적용하는 순서를 정한다.
외부 프로젝트를 새 control plane으로 설치하는 계획이 아니다. 현재 runtime의 approval,
evidence, checkpoint, local-first 경계를 유지하면서 부족한 부분만 직접 구현한다.

## Current Baseline

- Runtime state는 schema v16이다.
- `ExecutionPlan`과 `WorkOrder`는 exact source digest와 승인 기록에 묶여 있다.
- `WorkflowCheckpoint`는 operator가 명시적으로 한 단계씩 재개하며 active 또는 애매한 실행을
  자동 복구하지 않는다.
- memory recall과 Mission context는 exact-id review까지만 열려 있고 자동 retrieval이나
  runtime injection은 없다.
- file store는 loaded-state revision과 state-path commit lock으로 stale writer를 거부하고,
  temporary file fsync와 rename으로 한 번의 write를 atomic하게 교체한다.

## Adoption Rule

외부 source의 아이디어와 검증 기준은 참고하되 source tree, plugin state, hook fleet, model
runtime을 복제하지 않는다. 구현은 현재 repo의 naming, contract, smoke, authority model을 따른다.
코드를 직접 가져와야 할 이유가 생기면 license와 provenance를 먼저 기록한다.

## Source Position

| Source | Adopt | Do not adopt |
| --- | --- | --- |
| Superloopy | command-backed criterion, proof freshness, no-progress stop, state lock | 별도 goal/evidence state와 completion hook |
| AI Engineering From Scratch | idempotency, risk envelope, rollback rehearsal, bounded trajectory | 교육용 sample implementation 복사 |
| AI Agent Book | context isolation, normalized handoff, independent new-information proof | 같은 transcript를 반복하는 role debate |
| wigolo | optional exact fetch, source position, degraded evidence, SSRF guard | vendoring, crawl, cache, research agent, automatic Mission injection |
| pxpipe | exact/gist classification과 request telemetry | digest, path, command, approval evidence의 lossy image compression |
| AirLLM | 향후 isolated local-provider spike의 참고 자료 | 현재 Node runtime에 Python/model lifecycle 직접 결합 |
| Build Your Own X | docs-only learning index 참고 | runtime dependency 또는 source redistribution |

## Phase 1: WorkOrder Verification Plan Preview

한 durable WorkOrder의 acceptance criteria, stop conditions, verification commands, expected
artifacts를 네 가지 criterion으로 정리한다.

- `happy-path`: accepted outcome과 human review evidence
- `risk`: stop boundary와 human review evidence
- `regression`: command transcript evidence
- `manual`: expected artifact inspection

입력은 exact current `ExecutionPlan`과 `WorkOrder` record digest, source digest, evaluation time에
묶인다. 결과는 deterministic, deeply frozen, `persisted=false`, `review-ready`다. command 실행,
proof 저장, approval, completion, provider, source mutation, Git, scheduling, connector authority는
열지 않는다.

Focused proof:

```text
node scripts/smoke-ai-company-workorder-verification-plan-preview.mjs
node scripts/smoke-ui-slice-668.mjs
```

## Phase 2: State Transaction Guard

새 durable record를 추가하기 전에 file-store의 read-modify-write commit을 안전하게 만든다.
긴 provider 요청이나 UI request 동안 process lock을 잡지 않는다. 대신 `loadState()`가 읽은 state
bytes의 digest를 non-enumerable revision으로 보존하고, commit lock 안에서 current digest와 다시
비교한다. 같은 base를 읽은 writer가 둘이면 먼저 저장한 writer만 성공하고 뒤 writer는 conflict로
중단한다.

- commit lock은 state path별로 하나만 획득한다.
- current digest compare, normalization, temporary write, fsync, rename을 짧은 lock 구간에 묶는다.
- lock owner에는 process id와 생성 시각만 기록하고 runtime data나 credential은 넣지 않는다.
- stale revision과 lock timeout은 `409`로 fail-closed되며 caller가 임의로 무시할 수 없다.
- stale lock 회수는 owner process 부재와 bounded age를 함께 확인한다.
- symlink state path, concurrent writer, active/dead owner lock, temporary-file cleanup, lost update를
  smoke로 검증한다.

Schema는 v15를 유지한다. runtime behavior는 같아야 하며 transaction API로 옮긴 method만
동시에 실행될 때 lost update를 막는다.

## Phase 3: Durable Acceptance Criterion And Proof Ledger

Schema v16은 다음 record만 추가한다.

```text
sequences.acceptanceCriterion
sequences.verificationProof
acceptanceCriteria
verificationProofs
WorkOrder.acceptanceCriterionRefs
```

Criterion은 source WorkOrder와 Phase 1 preview digest에 묶인 immutable record다. Proof는 append-only
record이며 criterion을 다시 쓰지 않는다. 처음 자동 실행 가능한 command는 기존 shell-free
`node --check <allowlisted project path>`뿐이다. 일반 shell, pipe, redirect, environment expansion,
network command는 허용하지 않는다. Manual criterion은 artifact 또는 human review evidence 없이는
통과하지 않는다.

WorkOrder completion gate는 essential criterion이 current source digest에서 다시 검증됐을 때만
열린다. 기존 review-before-done과 approval-before-commit은 그대로 유지한다.

첫 durable slice는 Builder WorkOrder에만 적용한다. Criteria는 Builder waiting-gate에서 별도
operator approval로 한 번 기록되고, Builder live mutation 뒤 Reviewer-ready checkpoint에서 proof를
받는다. Review/manual proof는 exact Builder artifact refs와 operator verdict/rationale를 요구한다.
Command proof는 target allowlist 안의 exact `node --check`만 shell 없이 실행하며 current file-set
digest가 달라지면 이전 passed proof를 stale로 분류한다. 모든 essential proof가 current passed일
때만 기존 exact checkpoint resume가 Reviewer를 열 수 있다. Criteria가 없는 기존 plan은 DEC-094의
Builder→Reviewer→QA compatibility path를 그대로 유지한다.

Focused proof:

```text
node scripts/smoke-ai-company-acceptance-criterion-proof.mjs
node scripts/smoke-ui-slice-669.mjs
```

## Phase 4: Bounded Continuation Guard

기존 explicit checkpoint resume 앞에 response-only guard를 둔다.

- operator는 한 번에 한 단계만 요청한다.
- current checkpoint, source, completed unit, artifact set을 하나의 progress digest로 계산한다.
- 이전 evidence와 digest가 같으면 `no-progress`로 멈춘다.
- operator가 지정한 bounded step limit, deadline, cancellation을 넘기지 않는다.
- background scheduling, automatic retry, active mutation replay는 계속 금지한다.

Guard preview가 현재 checkpoint를 허용해도 기존 resume authority를 대신하지 않는다. 실제 resume는
현재 exact checkpoint tuple과 Decision Inbox gate를 다시 통과해야 한다.

구현은 schema v16을 유지한다. `ExecutionContinuationPreview`는 current latest ready checkpoint,
source/input/authority digest, completed unit, artifact set을 하나의 progress digest로 묶고 exact
operator `action`, `maxSteps=1`, 15분 이내 deadline, cancellation flag, optional previous progress
digest를 검증한다. 결과는 `continuation-ready`, `no-progress`, `deadline-exceeded`, `cancelled` 중
하나이며 항상 `persisted=false`다. UI는 response/browser memory preview가 current일 때만 기존
Reviewer 또는 QA resume control을 노출하며, runtime resume는 기존 source, approval, Decision Inbox,
proof, checkpoint tuple 검증을 그대로 다시 수행한다.

Focused proof:

```text
node scripts/smoke-ai-company-bounded-continuation.mjs
node scripts/smoke-ui-slice-670.mjs
```

## Phase 5: Optional Exact Research Fetch

wigolo source는 repo에 복제하거나 submodule로 넣지 않는다. 별도 설치된 unmodified sidecar를
명시적으로 선택했을 때만 read-only adapter가 호출한다.

- 기본 상태는 disabled다.
- 첫 slice는 exact URL fetch 한 건만 지원한다.
- response에는 requested URL, final URL, fetchedAt, content digest, bounded excerpt, source position,
  degraded/truncated status를 포함한다.
- private, loopback, link-local, credential-bearing URL을 거부한다.
- fetched content는 untrusted evidence로 표시한다.
- crawl, cache, search ranking, research agent, persistence, provider synthesis, Mission injection은 없다.

Synthetic smoke는 local fake sidecar만 사용한다. 실제 network smoke는 optional이며 aggregate gate를
막지 않는다.

구현은 공식 one-shot CLI contract인 `wigolo fetch <url> --render-js=never
--max-content-chars=<n> --json`만 사용한다. `ORCHESTRATION_WIGOLO_EXACT_FETCH_ENABLED=1`과 repo 밖
absolute executable `ORCHESTRATION_WIGOLO_SIDECAR_PATH`가 함께 있어야 readiness가 열린다. Adapter는
shell 없이 exact argv를 실행하고 credential-bearing URL과 requested/final URL의 private, loopback,
link-local address를 거부한다. 성공 응답은 bounded markdown만 untrusted response evidence로
normalization하며 state, cache control, Mission, provider context에는 연결하지 않는다. 공식 CLI와
fetch parameter source는 <https://github.com/KnockOutEZ/wigolo/blob/main/docs/cli.md> 및
<https://github.com/KnockOutEZ/wigolo/blob/main/docs/tools.md>다.

Focused proof:

```text
node scripts/smoke-wigolo-exact-fetch-adapter.mjs
node scripts/smoke-wigolo-exact-fetch-live.mjs # optional; skipped_missing_env by default
```

## Phase 6: Context Budget Telemetry

먼저 payload를 바꾸지 않는 response-only report를 만든다.

- `exact`: id, digest, path, command, approval, negative evidence
- `gist`: 반복 설명, 오래된 tool summary처럼 복구 가능한 bulk text

Report는 UTF-8 bytes, character count, field count, exact/gist 분포, truncation eligibility를 보여
준다. provider call이나 compression은 하지 않는다. 실제 provider usage와 model-specific benchmark가
쌓이기 전에는 token 절감률이나 비용 절감률을 README에 쓰지 않는다.

구현은 모든 JSON leaf를 기본 `exact`로 분류한다. Operator는 unique explicit JSON Pointer
`gistPathAllowlist`로 복구 가능한 text subtree만 지정할 수 있고, ID/ref/digest/path/command/approval/
negative-evidence/status/action/decision/authority/source/verification 계열 field는 gist 지정 자체가
거부된다. Report는 raw value 없이 field path/type/value digest/encoded character count/UTF-8 bytes와
operator threshold 기준 eligibility만 반환한다. 입력 payload는 rewrite, truncate, compress, persist,
provider-call하지 않는다.

Focused proof:

```text
node scripts/smoke-context-budget-telemetry.mjs
```

pxpipe 방식의 image packaging은 별도 실험으로 남긴다. source-of-truth와 authority evidence에는
적용하지 않는다.

## Download Policy

- Superloopy, pxpipe, AirLLM은 현재 설치하지 않는다.
- Build Your Own X와 두 교육 repo는 docs/reference source로만 사용한다.
- wigolo는 Phase 5 operator opt-in이 필요할 때 repo 밖의 별도 경로에 pin한다.
- 외부 clone, model, cache, package output을 git에 넣지 않는다.

## Rollback Order

1. 새 response-only route와 UI control을 비활성화한다.
2. active external request를 취소한다.
3. durable v16 evidence는 삭제하거나 downgrade하지 않고 inspection-only로 남긴다.
4. source WorkOrder, checkpoint, approval, run, artifact evidence를 보존한다.
5. focused smoke와 aggregate verification을 다시 실행한다.

## Current Status

- Phase 1: implemented under `DEC-131`.
- Phase 2: implemented under `DEC-132`.
- Phase 3: implemented under `DEC-133`.
- Phase 4: implemented under `DEC-134`.
- Phase 5: implemented under `DEC-135`; live network evidence remains optional and unconfigured.
- Phase 6: implemented under `DEC-136` as measurement-only telemetry.
- AirLLM integration and lossy provider-payload compression: deferred.
