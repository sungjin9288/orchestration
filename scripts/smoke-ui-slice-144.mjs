import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const app = fs.readFileSync(appPath, 'utf8');

assert.match(app, /<strong>안건 접수 흐름<\/strong>[\s\S]*안건을 접수하면 바로 참모 회의로 이어집니다\./);

console.log(
  JSON.stringify(
    {
      ok: true,
      missionOrderDeskCopyTightening: {
        markers: ['안건을 접수하면 바로 참모 회의로 이어집니다.'],
      },
    },
    null,
    2,
  ),
);
