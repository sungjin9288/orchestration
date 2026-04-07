import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');
const auditPath = path.join(repoRoot, 'docs', 'reference', 'agent-product-pattern-audit.md');

const appJs = fs.readFileSync(appJsPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');
const audit = fs.readFileSync(auditPath, 'utf8');

assert.match(audit, /claw-empire/);
assert.match(audit, /dify/i);
assert.match(audit, /crewAI/i);
assert.match(audit, /oh-my-openagent/i);
assert.match(audit, /paperclip/i);
assert.match(audit, /목표 가시성/);
assert.match(audit, /역할 가시성/);
assert.match(audit, /흐름 가시화/);
assert.match(audit, /운영 기준 가시성/);
assert.match(audit, /회사 시뮬레이터/);
assert.match(audit, /generic workflow builder/);

assert.match(appJs, /function renderOrchestrationCharter/);
assert.match(appJs, /목표 헌장/);
assert.match(appJs, /참모 구성/);
assert.match(appJs, /진행 흐름/);
assert.match(appJs, /운영 기준/);
assert.match(appJs, /프로젝트 지정 후 실행/);
assert.match(appJs, /리뷰 후 완료/);
assert.match(appJs, /승인 후 커밋/);
assert.match(appJs, /한정된 실행 유지/);
assert.match(appJs, /label: '안건 접수'/);
assert.match(appJs, /summary: '현재 안건 판단과 바로 이동을 시작합니다\.'/);
assert.match(appJs, /label: '참모 회의'/);
assert.match(appJs, /summary: '각 역할이 같은 안건을 함께 읽고 방향을 정리합니다\.'/);
assert.match(appJs, /label: '실행 방향'/);
assert.match(appJs, /summary: '현재 실행 판단과 다음 행동을 정리합니다\.'/);
assert.match(appJs, /label: '결과 보고'/);
assert.match(appJs, /summary: '현재 보고 판단과 다음 행동을 확인합니다\.'/);

assert.match(styles, /\.briefing-charter \{/);
assert.match(styles, /\.charter-card \{/);
assert.match(styles, /\.charter-crew-list,/);
assert.match(styles, /\.charter-flow \{/);
assert.match(styles, /\.charter-flow-step \{/);
assert.match(styles, /\.charter-step-copy \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      repoPatternCharterShell: {
        sections: ['목표 헌장', '참모 구성', '진행 흐름', '운영 기준'],
        adoptedPatterns: ['목표 가시성', '역할 가시성', '흐름 가시화', '운영 기준 가시성'],
        rejectedPatterns: ['회사 시뮬레이터', 'generic workflow builder'],
      },
    },
    null,
    2,
  ),
);
