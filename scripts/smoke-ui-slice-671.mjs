import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MODE = 'ui-slice-671-llm-native-primary-shell-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

const indexHtml = fs.readFileSync(path.join(repoRoot, 'ui', 'index.html'), 'utf8');
const appSource = fs.readFileSync(path.join(repoRoot, 'ui', 'app.js'), 'utf8');
const stylesSource = fs.readFileSync(path.join(repoRoot, 'ui', 'styles.css'), 'utf8');
const designSource = fs.readFileSync(path.join(repoRoot, 'DESIGN.md'), 'utf8');
const decisionSource = fs.readFileSync(path.join(repoRoot, 'docs', '01_decision-log.md'), 'utf8');

assert.match(indexHtml, /data-shell-generation="llm-native"/);
assert.match(indexHtml, /class="llm-new-mission-button"/);
assert.match(indexHtml, /data-action="start-new-mission"/);
assert.match(indexHtml, /class="shell-header-project"/);
assert.match(indexHtml, /class="shell-header-context"/);
assert.match(indexHtml, /id="refresh-status"/);
assert.match(indexHtml, /id="company-directory-summary"/);
assert.match(indexHtml, /id="company-directory-shell"/);

assert.match(appSource, /function renderLlmMissionLead\(/);
assert.match(appSource, /function renderLlmMissionWorkstream\(/);
assert.match(appSource, /function renderLlmMissionInspector\(/);
assert.match(appSource, /class="[^"]*llm-mission-composer[^"]*" data-form="create-mission"/);
assert.match(appSource, /class="llm-turn-list"/);
assert.match(appSource, /role: 'Operator'/);
assert.match(appSource, /role: 'Council'/);
assert.match(appSource, /role: 'Execution'/);
assert.match(appSource, /role: 'Deliverables'/);
assert.match(appSource, /class="llm-deep-inspector"/);
assert.match(appSource, /document\.body\.dataset\.navGroup = activeGroupId/);
assert.match(appSource, /document\.body\.dataset\.surface = state\.surface/);
assert.match(appSource, /state\.surface = 'mission';/);
assert.match(appSource, /data-action="open-surface-for-mission"/);

assert.match(stylesSource, /\/\* LLM-native primary shell\./);
assert.match(stylesSource, /body \.llm-app-shell \{[\s\S]*grid-template-columns: 232px minmax\(0, 1fr\)/);
assert.match(stylesSource, /body \.llm-app-shell \.office-sidebar-section-status \{[\s\S]*display: none/);
assert.match(stylesSource, /body\[data-nav-group="workflows"\] \.control-overview \{[\s\S]*display: none/);
assert.match(stylesSource, /\.llm-mission-lead h2 \{[\s\S]*font-size: 2rem/);
assert.match(stylesSource, /\.surface\[data-surface="mission"\] \.llm-mission-composer \{[\s\S]*border-radius: 8px;[\s\S]*background: #fff/);
assert.match(stylesSource, /\.llm-turn \{[\s\S]*grid-template-columns: 34px minmax\(0, 1fr\)/);
assert.match(stylesSource, /@media \(max-width: 820px\) \{[\s\S]*body \.llm-app-shell \{[\s\S]*grid-template-columns: minmax\(0, 1fr\)/);
assert.match(stylesSource, /@media \(max-width: 520px\) \{/);
assert.doesNotMatch(stylesSource, /\.llm-mission-lead[\s\S]{0,500}linear-gradient/);

assert.match(designSource, /LLM-native workbench/);
assert.match(designSource, /Conversation is the reading model; Mission, Council, Execution/);
assert.match(designSource, /This is not a chatbot clone/);
assert.match(designSource, /review before done/);
assert.match(decisionSource, /### DEC-137/);
assert.match(decisionSource, /LLM-native orchestration workspace/);
assert.match(decisionSource, /adds no chat history object, provider call, automatic submit/);

console.log(
  JSON.stringify(
    {
      ok: true,
      mode: MODE,
      primaryEntry: 'prompt-first-mission-composer',
      workstream: ['operator', 'council', 'execution', 'deliverables'],
      advancedOpsPreserved: true,
      responsiveBreakpoints: [820, 520],
      unchangedAuthorities: [
        'runtime-schema',
        'provider-call',
        'source-mutation',
        'approval-bypass',
        'commit',
        'push',
        'release',
      ],
    },
    null,
    2,
  ),
);
