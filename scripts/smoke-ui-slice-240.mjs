import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const councilConfigPath = path.join(repoRoot, 'ui', 'council-config.js');

const appJs = fs.readFileSync(appJsPath, 'utf8') + fs.readFileSync(councilConfigPath, 'utf8');

assert.match(appJs, /owner: '운영자 · 안건 흐름'/);
assert.match(appJs, /owner: '회의 리드 \+ 참여 역할'/);
assert.match(appJs, /owner: '실행 역할 · 실행 흐름'/);
assert.match(appJs, /owner: '결과 보고 · 보고 흐름'/);
assert.match(appJs, /위 등록대장에서 새 안건을 올리면 바로 이 줄에 이어집니다\./);
assert.match(appJs, /위 등록대장에서 첫 안건을 만들면 이곳에 바로 쌓입니다\./);
assert.match(appJs, /<strong>신규 안건 등록<\/strong>/);

assert.doesNotMatch(appJs, /운영자 · 안건 데스크/);
assert.doesNotMatch(appJs, /선임 실행관 · 실행 흐름/);
assert.doesNotMatch(appJs, /결과 보고 · 관제실/);
assert.doesNotMatch(appJs, /안건 접수 데스크/);

console.log(
  JSON.stringify(
    {
      ok: true,
      stepOwnerIntakeReadability: {
        markers: [
          '운영자 · 안건 흐름',
          '회의 리드 + 참여 역할',
          '실행 역할 · 실행 흐름',
          '결과 보고 · 보고 흐름',
          '안건 접수 흐름',
          '위 접수 흐름에서 새 안건을 열면 바로 이 줄에 이어집니다.',
        ],
      },
    },
    null,
    2,
  ),
);
