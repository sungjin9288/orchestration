import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(
  appJs,
  /function buildTaskWorktreeRelation\(task, activeProjectLinkedWorktrees\) \{[\s\S]*if \(!task\.worktreeRef\) \{[\s\S]*copy: '아직 저장된 워크트리 경로가 없습니다\.'/,
);
assert.doesNotMatch(
  appJs,
  /function buildTaskWorktreeRelation\(task, activeProjectLinkedWorktrees\) \{[\s\S]*if \(!task\.worktreeRef\) \{[\s\S]*copy: '저장된 워크트리 경로가 아직 설정되지 않았습니다\.'/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      worktreeHelperNotSetWording: {
        insertionPoint: 'worktreeHelperBatch->notSetBranchWording->helperCopy',
        helperCopy: '아직 저장된 워크트리 경로가 없습니다.',
      },
    },
    null,
    2,
  ),
);
