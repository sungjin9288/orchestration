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
  /function buildTaskWorktreeRelation\(task, activeProjectLinkedWorktrees\) \{[\s\S]*if \(!task\.worktreeRef\) \{[\s\S]*label: '워크트리:아직 없음'/,
);
assert.doesNotMatch(
  appJs,
  /function buildTaskWorktreeRelation\(task, activeProjectLinkedWorktrees\) \{[\s\S]*if \(!task\.worktreeRef\) \{[\s\S]*label: '워크트리:미설정'/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      worktreeHelperNotSetLabelWording: {
        insertionPoint: 'worktreeHelperBatch->notSetBranchLabelWording->tokenLabel',
        tokenLabel: '워크트리:아직 없음',
      },
    },
    null,
    2,
  ),
);
