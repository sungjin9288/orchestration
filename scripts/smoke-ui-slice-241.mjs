import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appJsPath, 'utf8');

assert.match(appJs, /label: '접수 라인'/);
assert.match(appJs, /label: '배정 판단선'/);
assert.match(appJs, /왼쪽 접수 라인에서 첫 안건을 등록하면 회의와 판단선이 함께 열립니다\./);
assert.match(appJs, /왼쪽 등록대장에서 안건을 고르거나 위 입력선에서 새 안건을 등록합니다\./);
assert.match(appJs, /실행 셀을 하나 고르면 오른쪽 판단선이 바로 열립니다\./);

assert.doesNotMatch(appJs, /왼쪽 데스크/);
assert.doesNotMatch(appJs, /오른쪽 판단판/);
assert.doesNotMatch(appJs, /위 데스크/);

console.log(
  JSON.stringify(
    {
      ok: true,
      missionStripDetailReadability: {
        markers: [
          '왼쪽 입력선',
          '오른쪽 판단선',
          '왼쪽 입력선에서 첫 안건을 올리면 회의와 판단선이 함께 열립니다.',
          '왼쪽 목록에서 안건을 고르거나 위 입력선에서 새 안건을 접수합니다.',
          '실행 셀을 하나 고르면 오른쪽 판단선이 바로 열립니다.',
        ],
      },
    },
    null,
    2,
  ),
);
