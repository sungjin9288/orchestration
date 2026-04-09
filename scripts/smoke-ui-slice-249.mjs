import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const appJs = fs.readFileSync(appJsPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(appJs, /<p class="eyebrow">작업 지시 보드<\/p>/);
assert.match(appJs, /<h2>현재 작업 지시와 승인 게이트를 같은 제어선에서 다룹니다<\/h2>/);
assert.match(appJs, /Execution은 회의 결론, 현재 작업 지시, 승인선, 최근 실행 로그를 같은 work-order 보드로 묶어 제어합니다\./);
assert.match(appJs, /<p class="execution-control-label">현재 작업 지시<\/p>/);
assert.match(appJs, /<p class="execution-control-label">승인 게이트 큐<\/p>/);
assert.match(appJs, /<p class="execution-control-label">최근 실행 로그<\/p>/);
assert.match(appJs, /eyebrow: '작업 지시 개요'/);
assert.match(appJs, /heading: '실행 지시 데스크'/);
assert.match(appJs, /copy: '왼쪽 패널은 현재 작업 지시, 다음 처리, 연결 근거를 먼저 보여 줍니다\.'/);
assert.match(appJs, /<h2>게이트 제어 데스크<\/h2>/);
assert.match(appJs, /eyebrow: '게이트 판단판'/);
assert.match(appJs, /heading: '현재 게이트와 바로 처리할 후속을 먼저 봅니다'/);
assert.match(appJs, /<strong>승인선<\/strong>/);
assert.match(appJs, /<strong>차단 사유<\/strong>/);
assert.match(appJs, /<strong>실행 준비 패킷<\/strong>/);
assert.match(appJs, /<strong>빠른 이동<\/strong>/);
assert.match(appJs, /실행 데스크/);

assert.match(styles, /\.surface\[data-surface="execution"\] \.execution-control-board \{/);
assert.match(styles, /\.execution-control-grid \{/);
assert.match(styles, /\.execution-control-card \{/);
assert.match(styles, /\.execution-control-card-primary \{/);
assert.match(styles, /\.execution-control-label \{/);
assert.match(styles, /\.execution-control-title \{/);
assert.match(styles, /\.execution-control-copyline \{/);
assert.match(styles, /\.execution-control-foot \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      companyShellExecutionControlSurface: {
        markers: [
          '작업 지시 보드',
          '현재 작업 지시와 승인 게이트를 같은 제어선에서 다룹니다',
          '실행 지시 데스크',
          '게이트 제어 데스크',
          '승인 게이트 큐',
          '최근 실행 로그',
          '실행 준비 패킷',
        ],
      },
    },
    null,
    2,
  ),
);
