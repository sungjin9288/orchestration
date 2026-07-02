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

assert.match(appJs, /resultHint:\s*'작업 결과는 산출물에서 확인합니다\.'/);
assert.match(
  appJs,
  /location\.resultHint \|\| '작업 결과는 산출물에서 확인합니다\.'/,
);
assert.match(appJs, /nextHint:\s*'다음으로 처리할 desk가 열립니다\.'/);
assert.match(appJs, /nextHint:\s*'먼저 미션에서 제목, 목표, 경계를 등록해 첫 안건을 만듭니다\.'/);
assert.match(
  appJs,
  /location\.nextHint \|\| '다음으로 처리할 desk가 열립니다\.'/,
);
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
        resultHints: ['shared-result-location'],
        nextHints: ['shared-next-desk', 'mission-intake'],
        routeSemantics: 'existing data-action=open-surface only',
        cssMarkers: ['workspace-location-hint'],
      },
    },
    null,
    2,
  ),
);
