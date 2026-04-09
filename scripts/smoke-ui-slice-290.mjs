import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.equal((appJs.match(/label: '바로'/g) || []).length >= 4, true);
assert.doesNotMatch(appJs, /label: '지금 열기'/);
assert.equal((appJs.match(/`바로:/g) || []).length >= 4, true);
assert.match(appJs, /작업판 상세/);
assert.match(appJs, /현재 실행 기록/);
assert.match(appJs, /현재 증적/);
assert.match(appJs, /대기 큐/);

console.log(
  JSON.stringify(
    {
      ok: true,
      immediateViewportCtaVocabulary: {
        cards: ['바로'],
        removed: ['지금 열기'],
        tokenPrefix: '바로',
      },
    },
    null,
    2,
  ),
);
