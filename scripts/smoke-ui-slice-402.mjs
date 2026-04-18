import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /상대 경로는 현재 프로젝트 경로 기준으로 풀고, 절대 경로는 현재 프로젝트 경로, repo root, 또는 <code>\/tmp<\/code> 하위만 허용합니다\./);
assert.doesNotMatch(appJs, /상대 경로는 현재 project_path 기준으로 풀고, 절대 경로는 현재 project_path, repo root, 또는 <code>\/tmp<\/code> 하위만 허용합니다\./);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessRunFormHelpWording: {
        insertionPoint: 'harnessRunForm->pathFormHelpWording->helperCopy',
        helperCopy: '상대 경로는 현재 프로젝트 경로 기준으로 풀고, 절대 경로는 현재 프로젝트 경로, repo root, 또는 /tmp 하위만 허용합니다.',
      },
    },
    null,
    2,
  ),
);
