import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(styles, /\.cast-avatar-panel \{[\s\S]*box-shadow:\s*inset 0 1px 0 rgba\(255, 255, 255, 0\.48\);/);
assert.match(styles, /\.cast-avatar-panel \+ \.cast-command \{[\s\S]*padding-top:\s*7px;[\s\S]*border-top:\s*1px solid rgba\(33, 57, 49, 0\.08\);/);
assert.match(styles, /\.cast-card-lead \.cast-avatar-panel \+ \.cast-command \{[\s\S]*border-top-color:\s*rgba\(21, 94, 117, 0\.12\);/);

console.log(
  JSON.stringify(
    {
      ok: true,
      councilCastAvatarTransition: {
        markers: [
          'inset 0 1px 0 rgba(255, 255, 255, 0.48)',
          'cast-avatar-panel + .cast-command',
          'padding-top: 7px',
          'rgba(21, 94, 117, 0.12)',
        ],
      },
    },
    null,
    2,
  ),
);
