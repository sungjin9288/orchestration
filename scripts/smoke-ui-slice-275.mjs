import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const appJs = fs.readFileSync(appPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(appJs, /renderReviewInspectorSteps\(check, selectedPacket\)/);
assert.match(appJs, /패킷/);
assert.match(appJs, /타입/);
assert.match(appJs, /연결 run/);
assert.match(appJs, /열린 gate/);
assert.match(appJs, /패킷 확인/);
assert.match(appJs, /근거 교차 확인/);
assert.match(appJs, /다음 이동/);

assert.match(styles, /\.review-packet-register \{/);
assert.match(styles, /\.review-packet-strip \{/);
assert.match(styles, /\.review-inspector-steps \{/);
assert.match(styles, /\.review-inspector-step \{/);
assert.match(styles, /\.review-inspector-step-index \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      reviewPacketInspectorPolish: {
        app: [
          'renderReviewInspectorSteps(check, selectedPacket)',
          '패킷',
          '타입',
          '연결 run',
          '열린 gate',
          '패킷 확인',
          '근거 교차 확인',
          '다음 이동',
        ],
        styles: [
          'review-packet-register',
          'review-packet-strip',
          'review-inspector-steps',
          'review-inspector-step',
        ],
      },
    },
    null,
    2,
  ),
);
