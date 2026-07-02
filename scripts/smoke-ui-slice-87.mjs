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

assert.match(
  masterBrief,
  /allow the next primary shell to adopt a company\/ERP-style command-center frame with visible AI cast, meeting, attendance, desk, and workday cues/,
);
assert.match(masterBrief, /budget\/HR\/org-management simulator or avatar-only gameplay framing/);
assert.match(decisionLog, /### DEC-044/);
assert.match(
  decisionLog,
  /A display-oriented `HQ \/ crew \/ flow ownership` metaphor is allowed on the post-v1 primary shell as the minimum safe baseline/,
);
assert.match(
  decisionLog,
  /Budgets, payroll, workforce simulation, org-chart management, or room metaphors that displace goal input, execution gates, or advanced-ops authority remain rejected/,
);
assert.match(
  decisionLog,
  /Company\/ERP shell framing is allowed when it stays inside the accepted `DEC-042`, `DEC-044`, and `DEC-045` boundary/,
);
assert.match(roadmap, /budget\/HR\/org-management simulator or messenger-first surfaces/);
assert.match(
  roadmap,
  /`DEC-042` records the accepted post-v1 pivot direction, `DEC-044` records the earlier safe display-layer baseline, and `DEC-045` widens the shell into a fuller company\/ERP command-center posture/,
);

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
