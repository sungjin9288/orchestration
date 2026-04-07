import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');
const dockMetadataSection = appJs.match(/const SURFACE_DOCK_METADATA = \{[\s\S]*?\n\};/);

assert.ok(dockMetadataSection, 'SURFACE_DOCK_METADATA section should exist');
const dockMetadata = dockMetadataSection[0];

assert.match(dockMetadata, /'decision-inbox':\s*\{\s*copy: '현재 안건과 다음 처리를 판단합니다\.',\s*kicker: '승인'/);
assert.match(dockMetadata, /execution:\s*\{\s*copy: '현재 실행 판단과 다음 행동을 정리합니다\.',\s*kicker: '실행'/);
assert.match(dockMetadata, /logs:\s*\{\s*copy: '현재 실행 기록과 다음 확인을 빠르게 훑습니다\.',\s*kicker: '실행 기록'/);
assert.match(dockMetadata, /taskboard:\s*\{\s*copy: '현재 실행 셀과 다음 실행을 조정합니다\.',\s*kicker: '실행 셀'/);

assert.doesNotMatch(dockMetadata, /kicker: '결재'/);
assert.doesNotMatch(dockMetadata, /kicker: '작전'/);
assert.doesNotMatch(dockMetadata, /kicker: '실행기록'/);
assert.doesNotMatch(dockMetadata, /kicker: '실행셀'/);

assert.match(appJs, /surface: 'decision-inbox',\s*label: '승인'/);
assert.match(appJs, /surface: 'decision-inbox',\s*kicker: '승인'/);
assert.doesNotMatch(appJs, /label: '결재'/);

console.log(
  JSON.stringify(
    {
      ok: true,
      preRealTestOpsDockNouns: {
        dockMetadata: ['승인', '실행', '실행 기록', '실행 셀'],
      },
    },
    null,
    2,
  ),
);
