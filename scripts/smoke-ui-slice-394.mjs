import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /latestRun\?\.id \|\| '아직 없음'/);

console.log(
  JSON.stringify(
    {
      ok: true,
      taskboardLatestRunIdFallbackWording: {
        insertionPoint: 'taskboardLatestRunSummary->idFallbackWording->valueLabel',
        fallbackValue: '아직 없음',
      },
    },
    null,
    2,
  ),
);
