import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const masterBrief = fs.readFileSync(path.join(repoRoot, 'docs', '00_master-brief.md'), 'utf8');
const decisionLog = fs.readFileSync(path.join(repoRoot, 'docs', '01_decision-log.md'), 'utf8');
const roadmap = fs.readFileSync(path.join(repoRoot, 'docs', '03_architecture-roadmap-v1.md'), 'utf8');

assert.match(masterBrief, /display-only `crew \/ HQ \/ flow` metaphor/);
assert.match(masterBrief, /office-simulator or avatar-only product framing/);
assert.match(decisionLog, /### DEC-044/);
assert.match(decisionLog, /display-only `HQ \/ crew \/ flow ownership` metaphor/);
assert.match(decisionLog, /company simulation, org management, budget\/workforce semantics/);
assert.match(decisionLog, /DEC-042` plus `DEC-044/);
assert.match(roadmap, /display-only `crew \/ HQ \/ flow ownership` layer is acceptable only when it remains an orientation layer/);
assert.match(roadmap, /office-simulator or messenger-first surfaces/);
assert.match(roadmap, /DEC-042` now records the accepted post-v1 pivot direction, and `DEC-044` narrows the allowed display-layer metaphor/);

console.log(
  JSON.stringify(
    {
      ok: true,
      repoContractDisplayMetaphor: {
        accepted: [
          'display-only crew/HQ/flow ownership metaphor',
          'orientation layer over the same ops-first engine',
        ],
        rejected: [
          'office simulator',
          'company management semantics',
          'messenger-first expansion',
        ],
      },
    },
    null,
    2,
  ),
);
