import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /아직 저장된 워크트리 경로가 없습니다\./);
assert.match(appJs, /label: '워크트리:아직 없음'/);
assert.match(appJs, /저장된 워크트리 경로가 현재 프로젝트 경로와 일치합니다\./);
assert.match(appJs, /저장된 워크트리 경로는 \$\{formatWorktreeOptionLabel\(matchedOption\)\}를 가리키지만 현재 프로젝트 경로는 \$\{activeProjectLinkedWorktrees\.projectPath \|\| '미설정'\}로 남아 있습니다\./);
assert.match(appJs, /현재 프로젝트 경로에서는 연결 워크트리 탐지를 사용할 수 없습니다\. 저장된 워크트리 경로는 \$\{task\.worktreeRef\}입니다\./);
assert.match(appJs, /저장된 워크트리 경로가 현재 탐지된 연결 워크트리 목록 밖에 있습니다\./);
assert.match(appJs, /태스크 \$\{taskId\}의 저장된 워크트리 경로를 비우는 중…/);
assert.match(appJs, /태스크 \$\{taskId\}의 저장된 워크트리 경로를 비웠습니다/);
assert.match(appJs, /태스크 \$\{taskId\}의 저장된 워크트리 경로를 업데이트했습니다/);
assert.match(appJs, /현재 project_path/);
assert.match(appJs, /createToken\('현재 프로젝트 경로', 'success'\)/);
assert.match(appJs, /저장된 워크트리 경로만 바꿉니다\. 릴리스 패키지와 종료 정리는 여전히 현재 프로젝트 경로와 같은 연결 워크트리 루트로 풀려야 합니다\./);
assert.match(appJs, /현재 프로젝트 경로에서 탐지된 연결 워크트리가 없습니다\./);

assert.doesNotMatch(appJs, /task\.worktreeRef가 아직 설정되지 않았습니다\./);
assert.doesNotMatch(appJs, /label: '워크트리:미설정'/);
assert.doesNotMatch(appJs, /task\.worktreeRef가 현재 project_path와 일치합니다\./);
assert.doesNotMatch(appJs, /task\.worktreeRef는 \$\{formatWorktreeOptionLabel\(matchedOption\)\}를 가리키지만 현재 project_path는/);
assert.doesNotMatch(appJs, /현재 project_path에서는 연결 워크트리 탐지를 사용할 수 없습니다\. 저장된 task\.worktreeRef는/);
assert.doesNotMatch(appJs, /저장된 task\.worktreeRef가 현재 탐지된 연결 워크트리 목록 밖에 있습니다\./);
assert.doesNotMatch(appJs, /태스크 \$\{taskId\}의 task\.worktreeRef를 비우는 중…/);
assert.doesNotMatch(appJs, /태스크 \$\{taskId\}의 task\.worktreeRef를 비웠습니다/);
assert.doesNotMatch(appJs, /태스크 \$\{taskId\}의 task\.worktreeRef를 업데이트했습니다/);
assert.doesNotMatch(appJs, /실행 전 project_path가 필요합니다/);
assert.doesNotMatch(appJs, /createToken\('현재 project_path', 'success'\)/);
assert.doesNotMatch(appJs, /task\.worktreeRef만 저장합니다\. release-package와 close-out은 여전히 현재 project_path와 같은 연결 워크트리 루트로 풀려야 합니다\./);
assert.doesNotMatch(appJs, /현재 project_path에서 탐지된 연결 워크트리가 없습니다\./);

console.log(
  JSON.stringify(
    {
      ok: true,
      worktreeProjectHelperBatch: {
        markers: [
          '저장된 워크트리 경로',
          '아직 저장된 워크트리 경로가 없습니다.',
          '워크트리:아직 없음',
          '현재 프로젝트 경로',
          '현재 프로젝트 경로',
          '프로젝트 경로(project_path)',
        ],
      },
    },
    null,
    2,
  ),
);
