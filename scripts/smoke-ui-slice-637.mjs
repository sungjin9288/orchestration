import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const appJs = fs.readFileSync(appPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(appJs, /resultHint:\s*'최종 작업 결과와 인계 패킷은 산출물에서 확인합니다\.'/);
assert.match(appJs, /resultHint:\s*'실행으로 만든 작업 결과는 산출물 패킷에서 확인합니다\.'/);
assert.match(appJs, /resultHint:\s*'run이 만든 원문 증적과 연결 근거는 아티팩트에서 확인합니다\.'/);
assert.match(appJs, /nextHint:\s*'목표와 제약을 역할별 의견으로 정렬하는 회의실이 열립니다\.'/);
assert.match(appJs, /nextHint:\s*'실행 결과가 패킷으로 정리된 전달 데스크가 열립니다\.'/);
assert.match(appJs, /nextHint:\s*'승인·보류·해결이 필요하면 결정함 큐가 열립니다\.'/);
assert.match(appJs, /workspace-location-hint/);
assert.match(appJs, /\$\{escapeHtml\(resultSurfaceLabel\)\}에서 결과 보기/);
assert.match(appJs, /\$\{escapeHtml\(targetSurfaceLabel\)\}에서 다음 처리 열기/);
assert.match(appJs, /data-action="open-surface"/);
assert.match(appJs, /data-target-surface="\$\{escapeHtml\(resultSurface\)\}"/);
assert.match(appJs, /data-target-surface="\$\{escapeHtml\(location\.targetSurface\)\}"/);

assert.match(styles, /\.workspace-location-hint \{/);
assert.match(styles, /font-size:\s*0\.66rem/);
assert.match(styles, /line-height:\s*1\.25/);

console.log(
  JSON.stringify(
    {
      ok: true,
      workspaceClickOutcomeGuidance: {
        resultHints: ['mission', 'execution', 'logs'],
        nextHints: ['mission', 'execution', 'artifacts'],
        routeSemantics: 'existing data-action=open-surface only',
        cssMarkers: ['workspace-location-hint'],
      },
    },
    null,
    2,
  ),
);
