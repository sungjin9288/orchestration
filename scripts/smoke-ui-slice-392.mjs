import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /throw new Error\('현재 비울 실행 기록이 없습니다\.'\);/);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionClearHistoryGuardWording: {
        insertionPoint: 'executionClearHistoryAction->guardWording->missingHistoryMessage',
        guardMessage: '현재 비울 실행 기록이 없습니다.',
      },
    },
    null,
    2,
  ),
);
