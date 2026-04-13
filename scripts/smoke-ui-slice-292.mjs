import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appJsPath, 'utf8');

assert.match(appJs, /회의 초안/);
assert.match(appJs, /회의실/);
assert.match(appJs, /실행 셀/);
assert.match(appJs, /고급 운영/);
assert.match(appJs, /label: getSurfaceDisplayName\(councilNextSurface\),/);
assert.doesNotMatch(appJs, /회의실 열기/);
assert.doesNotMatch(appJs, /참모 회의 초안 만들기/);
assert.doesNotMatch(appJs, /실행 셀 만들기/);
assert.doesNotMatch(appJs, /고급 운영 모드 열기/);

console.log(
  JSON.stringify(
    {
      ok: true,
      followupButtonVocabulary: {
        preserved: ['회의 초안', '회의실', '실행 셀', '고급 운영'],
        removed: ['회의실 열기', '참모 회의 초안 만들기', '실행 셀 만들기', '고급 운영 모드 열기'],
      },
    },
    null,
    2,
  ),
);
