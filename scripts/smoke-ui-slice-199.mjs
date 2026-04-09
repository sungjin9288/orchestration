import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const app = fs.readFileSync(appPath, 'utf8');
const councilEyebrowIndex = app.indexOf("eyebrow: '회의 권고 선반'");

assert.notEqual(councilEyebrowIndex, -1, 'expected council narrative deck eyebrow');

const narrativeDeckStart = app.lastIndexOf('renderNarrativeDeck({', councilEyebrowIndex);
const cardsIndex = app.indexOf('cards: [', councilEyebrowIndex);

assert.notEqual(narrativeDeckStart, -1, 'expected council narrative deck start');
assert.notEqual(cardsIndex, -1, 'expected council narrative deck cards');

const narrativeDeckBlock = app.slice(narrativeDeckStart, cardsIndex);

assert.match(narrativeDeckBlock, /heading:\s*'권고안, 이견, 승인 선반을 먼저 봅니다'/);
assert.match(
  narrativeDeckBlock,
  /copy:\s*'오른쪽 패널은 회의록 전체보다 현재 권고안, 열린 이견, 승인 상태를 먼저 보여 줍니다\.'/,
);
assert.doesNotMatch(narrativeDeckBlock, /entryFrame:\s*true/);

console.log(
  JSON.stringify(
    {
      ok: true,
      councilNarrativeDeckDensity: {
        eyebrow: '회의 권고 선반',
        heading: '권고안, 이견, 승인 선반을 먼저 봅니다',
        markers: ['renderNarrativeDeck', 'wide: false', 'entryFrame removed'],
      },
    },
    null,
    2,
  ),
);
