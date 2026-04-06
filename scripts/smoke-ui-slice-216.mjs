import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /options\.copy \|\| '이 인계선은 현재 태스크, 실행 기록, 증적, 준비도, 리뷰 기준만 읽습니다\.'/);
assert.doesNotMatch(appJs, /options\.copy \|\| '이 rail은 현재 task, run, artifact, readiness, review truth만 읽습니다\.'/);

console.log(
  JSON.stringify(
    {
      ok: true,
      evidenceRailHelperCopy: {
        markers: ['이 인계선은 현재 태스크, 실행 기록, 증적, 준비도, 리뷰 기준만 읽습니다.'],
      },
    },
    null,
    2,
  ),
);
