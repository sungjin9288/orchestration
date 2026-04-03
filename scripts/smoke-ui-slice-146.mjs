import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const app = fs.readFileSync(appPath, 'utf8');

assert.match(app, /회의실, 작전실, 관제실 기본 동선만 엽니다\./);

console.log(
  JSON.stringify(
    {
      ok: true,
      missionBriefActionsCopyTightening: {
        markers: ['회의실, 작전실, 관제실 기본 동선만 엽니다.'],
      },
    },
    null,
    2,
  ),
);
