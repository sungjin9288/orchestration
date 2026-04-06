import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');
const executionGateStatePath = path.join(repoRoot, 'var', 'runtime-ui-slice-20', 'state.json');

assert.equal(fs.existsSync(executionGateStatePath), true, 'runtime-ui-slice-20 state.json is required');

const appJs = fs.readFileSync(appJsPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');
const executionGateState = JSON.parse(fs.readFileSync(executionGateStatePath, 'utf8'));

assert.match(appJs, /function renderNarrativeDeck\(options = \{\}\)/);
assert.match(appJs, /function renderDeliverablesReportDeck\(options = \{\}\)/);
assert.match(appJs, /function renderOpsCenterDeck\(options = \{\}\)/);

assert.match(appJs, /heading: '결과 보고실'/);
assert.match(appJs, /eyebrow: '보고 개요판'/);
assert.match(appJs, /결과 보고실 왼쪽 패널도 현재 보고 판단, 다음 행동, 연결 근거부터 먼저 보여 줍니다\./);
assert.match(appJs, /상류 준비 보고/);
assert.match(appJs, /후속 전달 보고/);
assert.match(appJs, /최신 보고 현황/);
assert.match(appJs, /리뷰 보고/);
assert.match(appJs, /결재선 현황/);
assert.match(appJs, /현재 결재 안건/);
assert.match(appJs, /관제실 직행/);
assert.match(appJs, /선택된 run만 세 칸으로 요약하는 로그실/);
assert.match(appJs, /현재 run과 다음 확인을 먼저 보는 로그 상세/);
assert.match(appJs, /실행 기본 정보/);
assert.match(appJs, /보고 연결선/);
assert.match(appJs, /실행 원문 로그/);
assert.match(appJs, /보관실 아래는 증적 목록과 현재 증적으로 나눕니다/);
assert.match(appJs, /선택된 증적만 세 칸으로 요약하는 보관실/);
assert.match(appJs, /증적 상세/);
assert.match(appJs, /증적 연결선/);
assert.match(appJs, /보고 미리보기/);
assert.match(appJs, /보관 원문/);
assert.match(appJs, /선택된 결재 안건만 세 칸으로 요약하는 결재함/);
assert.match(appJs, /대기 결재 \+ 최근 처리/);
assert.match(appJs, /결재 상세/);
assert.match(appJs, /영향 실행 셀/);
assert.match(appJs, /결재 기록/);
assert.match(appJs, /처리 메모/);

assert.match(styles, /\.command-deck-wide \{/);

const executingMission = Object.values(executionGateState.missions)[0];
const executingTask = executionGateState.tasks[executingMission.linkedTaskId];
const executingApproval = Object.values(executionGateState.approvals).find((approval) => approval.status === 'pending');

assert.ok(executingMission);
assert.ok(executingTask);
assert.ok(executingApproval);
assert.equal(executingMission.status, 'executing');
assert.equal(executingTask.flags.waitingApproval, true);
assert.equal(executingApproval.allowedNextAction, 'builder-live-mutation');

console.log(
  JSON.stringify(
    {
      ok: true,
      hqReportAndOpsCenterShell: {
        deliverables: ['결과 보고실', '보고 개요판', '결재선 현황', '안건 종료 보고'],
        opsCenter: ['로그실', '보관실', '결재함'],
        detailFlow: ['실행 기본 정보', '보고 연결선', '보관 원문', '처리 메모'],
        executionGate: {
          missionStatus: executingMission.status,
          waitingApproval: executingTask.flags.waitingApproval,
          allowedNextAction: executingApproval.allowedNextAction,
        },
      },
    },
    null,
    2,
  ),
);
