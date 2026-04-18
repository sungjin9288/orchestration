import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /저장된 워크트리 경로와 현재 프로젝트 경로/);
assert.doesNotMatch(appJs, /task\.worktreeRef와 현재 project_path/);

console.log(
  JSON.stringify(
    {
      ok: true,
      worktreeRelationHeadingWording: {
        insertionPoint: 'taskDetailWorktreeRelation->headingWording->title',
        title: '저장된 워크트리 경로와 현재 프로젝트 경로',
      },
    },
    null,
    2,
  ),
);
