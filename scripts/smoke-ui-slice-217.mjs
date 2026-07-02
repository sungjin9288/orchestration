import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const executionLabelsPath = path.join(repoRoot, 'ui', 'execution-labels.js');
const appJs = fs.readFileSync(appPath, 'utf8') + fs.readFileSync(executionLabelsPath, 'utf8');

assert.match(appJs, /if \(label === 'commit-executor run'\) return '커밋실행 기록';/);
assert.match(appJs, /if \(label === 'commit-packager run'\) return '커밋패키저 실행 기록';/);
assert.match(appJs, /if \(label === 'reviewer run'\) return '리뷰어 실행 기록';/);
assert.match(appJs, /if \(label === 'release-packager run'\) return '릴리스패키저 실행 기록';/);
assert.match(appJs, /if \(label === 'close-out run'\) return '종료정리 실행 기록';/);
assert.match(appJs, /if \(label === 'run'\) return '실행 기록';/);
assert.doesNotMatch(appJs, /return '커밋실행 run';/);
assert.doesNotMatch(appJs, /return '커밋패키저 run';/);
assert.doesNotMatch(appJs, /return '리뷰어 run';/);
assert.doesNotMatch(appJs, /return '릴리스패키저 run';/);
assert.doesNotMatch(appJs, /return '종료정리 run';/);
assert.doesNotMatch(appJs, /if \(label === 'run'\) return 'run';/);

console.log(
  JSON.stringify(
    {
      ok: true,
      runRelationLabelDisplay: {
        markers: [
          '커밋실행 기록',
          '커밋패키저 실행 기록',
          '리뷰어 실행 기록',
          '릴리스패키저 실행 기록',
          '종료정리 실행 기록',
          '실행 기록',
        ],
      },
    },
    null,
    2,
  ),
);
