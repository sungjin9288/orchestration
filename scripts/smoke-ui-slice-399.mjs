import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /createToken\('현재 프로젝트 경로', 'success'\)/);
assert.doesNotMatch(appJs, /createToken\('현재 project_path', 'success'\)/);

console.log(
  JSON.stringify(
    {
      ok: true,
      linkedWorktreeSuccessTokenWording: {
        insertionPoint: 'linkedWorktreeRow->successTokenWording->tokenLabel',
        tokenLabel: '현재 프로젝트 경로',
      },
    },
    null,
    2,
  ),
);
