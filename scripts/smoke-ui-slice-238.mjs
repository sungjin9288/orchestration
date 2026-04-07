import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appJsPath, 'utf8');

assert.match(appJs, /회의와 실행으로 같은 경로를 이어 갑니다\./);
assert.match(appJs, /첫 안건을 접수하면 회의와 실행 흐름이 같이 깨어납니다\./);
assert.match(appJs, /title: activeTask \? activeTask\.title : '실행 대기'/);
assert.match(appJs, /eyebrow: '표면 인계선'/);
assert.match(appJs, /heading: '이 아래는 입력선과 판단선으로 나눕니다'/);
assert.match(appJs, /왼쪽 데스크에서 첫 안건을 올리면 회의와 판단판이 함께 열립니다\./);
assert.match(appJs, /접수 즉시 참모 회의 초안이 열리고, 승인 전까지는 실행으로 넘어가지 않습니다\./);
assert.match(appJs, /회의, 실행, 관제실 기본 동선만 엽니다\./);
assert.match(appJs, /approvalBridge\?\.actionLabel \|\| '실행 후속'/);
assert.match(appJs, /approvalBridge\?\.nextStepCopy \|\| '실행에서 현재 지시를 계속 전진합니다\.'/);

console.log(
  JSON.stringify(
    {
      ok: true,
      missionHandoffReadabilityBatch: {
        markers: [
          '회의와 실행으로 같은 경로를 이어 갑니다.',
          '첫 안건을 접수하면 회의와 실행 흐름이 같이 깨어납니다.',
          '실행 대기',
          '표면 인계선',
          '이 아래는 입력선과 판단선으로 나눕니다',
          '왼쪽 데스크에서 첫 안건을 올리면 회의와 판단판이 함께 열립니다.',
          '접수 즉시 참모 회의 초안이 열리고, 승인 전까지는 실행으로 넘어가지 않습니다.',
          '회의, 실행, 관제실 기본 동선만 엽니다.',
          '실행 후속',
          '실행에서 현재 지시를 계속 전진합니다.',
        ],
      },
    },
    null,
    2,
  ),
);
