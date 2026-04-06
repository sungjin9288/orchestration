import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const app = fs.readFileSync(appPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(app, /function renderCharterSignalStrip\(options = \{\}\)/);
assert.match(app, /<strong>회사 신호<\/strong>/);
assert.match(app, /홈에서 본 회사 흐름이 여기선 현재 안건 흐름으로 더 촘촘하게 이어집니다\./);
assert.match(app, /surface: 'mission'/);
assert.match(app, /surface: 'council'/);
assert.match(app, /surface: 'execution'/);
assert.match(app, /surface: 'deliverables'/);
assert.match(app, /surface: 'decision-inbox'/);
assert.match(app, /renderCharterSignalStrip\(\{ mission, councilSession, linkedTask, completionReady \}\)/);

assert.match(styles, /\.charter-signal-strip \{/);
assert.match(styles, /\.charter-signal-grid \{/);
assert.match(styles, /\.charter-signal-chip \{/);
assert.match(styles, /\.charter-signal-chip-decision-inbox \{/);
assert.match(styles, /\.charter-signal-dot-success \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      charterSignalStrip: {
        heading: '회사 신호',
        lanes: ['mission', 'council', 'execution', 'deliverables', 'decision-inbox'],
      },
    },
    null,
    2,
  ),
);
