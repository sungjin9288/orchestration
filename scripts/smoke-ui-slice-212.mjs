import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /현재 활성 프로젝트 기준으로 탐지된 연결 루트만 보여줍니다\./);
assert.doesNotMatch(appJs, /현재 활성 project 기준으로 탐지된 연결 루트만 보여줍니다\./);

console.log(
  JSON.stringify(
    {
      ok: true,
      linkedWorktreeProjectHelperCopy: {
        markers: ['현재 활성 프로젝트 기준'],
      },
    },
    null,
    2,
  ),
);
