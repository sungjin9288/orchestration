import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const app = fs.readFileSync(appPath, 'utf8');
const councilEyebrowIndex = app.indexOf("eyebrow: '회의 판단판'");

assert.notEqual(councilEyebrowIndex, -1, 'expected council narrative deck eyebrow');

const narrativeDeckStart = app.lastIndexOf('renderNarrativeDeck({', councilEyebrowIndex);
const cardsIndex = app.indexOf('cards: [', councilEyebrowIndex);

assert.notEqual(narrativeDeckStart, -1, 'expected council narrative deck start');
assert.notEqual(cardsIndex, -1, 'expected council narrative deck cards');

const narrativeDeckBlock = app.slice(narrativeDeckStart, cardsIndex);

assert.match(narrativeDeckBlock, /heading:\s*'회의 결론과 다음 이동만 먼저 봅니다'/);
assert.match(
  narrativeDeckBlock,
  /copy:\s*'오른쪽 패널은 긴 회의록 대신 현재 결론과 다음 표면만 먼저 보여 줍니다\.'/,
);
assert.doesNotMatch(narrativeDeckBlock, /entryFrame:\s*true/);

console.log(
  JSON.stringify(
    {
      ok: true,
      councilNarrativeDeckDensity: {
        eyebrow: '회의 판단판',
        heading: '회의 결론과 다음 이동만 먼저 봅니다',
        markers: ['renderNarrativeDeck', 'wide: false', 'entryFrame removed'],
      },
    },
    null,
    2,
  ),
);
