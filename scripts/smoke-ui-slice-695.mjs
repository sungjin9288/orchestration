import assert from 'node:assert/strict';
import fs from 'node:fs';

import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const MODE = 'ui-slice-695-agent-operations-desk-visual-redesign-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

const appSource = fs.readFileSync(new URL('../ui/app.js', import.meta.url), 'utf8');
const stylesSource = fs.readFileSync(new URL('../ui/styles.css', import.meta.url), 'utf8');
const designSource = fs.readFileSync(new URL('../DESIGN.md', import.meta.url), 'utf8');
const decisionSource = fs.readFileSync(
  new URL('../docs/01_decision-log.md', import.meta.url),
  'utf8',
);
const planSource = fs.readFileSync(
  new URL('../docs/112_agent-operations-desk-visual-redesign-plan.md', import.meta.url),
  'utf8',
);

assert.match(appSource, /class="llm-mission-lead-meta" aria-label="현재 미션 상태"/);
assert.match(appSource, /<span><i aria-hidden="true"><\/i> 현재 미션<\/span>/);
assert.match(
  appSource,
  /class="llm-turn llm-turn-\$\{escapeHtml\(entry\.tone\)\}" data-step="\$\{escapeHtml\(String\(index \+ 1\)\.padStart\(2, '0'\)\)\}"/,
);
assert.match(appSource, /class="llm-next-gate-copy"/);
assert.match(appSource, /다음 단계 준비/);
assert.match(appSource, /data-action="open-surface-for-mission"/);
assert.match(appSource, /data-action="start-new-mission"/);
assert.match(appSource, /data-action="set-mission-view"/);

assert.match(stylesSource, /--ops-rail: #111318/);
assert.match(stylesSource, /--ops-canvas: #eff1ee/);
assert.match(stylesSource, /--ops-mint: #6ed6be/);
assert.match(
  stylesSource,
  /body \.llm-app-shell \{[\s\S]*grid-template-columns: 224px minmax\(0, 1fr\)/,
);
assert.match(
  stylesSource,
  /body \.llm-app-shell \.nav-button-main \{[\s\S]*grid-template-columns: 28px minmax\(0, 1fr\) auto/,
);
assert.match(
  stylesSource,
  /body \.llm-app-shell \.llm-mission-lead\.is-active-mission \{[\s\S]*grid-template-columns: minmax\(0, 1fr\) minmax\(230px, 290px\)/,
);
assert.match(
  stylesSource,
  /body \.llm-app-shell \.llm-workstream \{[\s\S]*overflow: clip[\s\S]*border-radius: 8px[\s\S]*background: var\(--ops-paper\)/,
);
assert.match(
  stylesSource,
  /body \.llm-app-shell \.llm-next-gate \{[\s\S]*position: sticky[\s\S]*background: #191b20/,
);
assert.match(
  stylesSource,
  /body \.llm-app-shell \.llm-context-inspector \{[\s\S]*position: sticky[\s\S]*background: #17191e/,
);
assert.match(
  stylesSource,
  /@media \(max-width: 820px\) \{[\s\S]*body \.llm-app-shell \.nav-button\.is-active \{[\s\S]*border-bottom-color: var\(--ops-mint\)/,
);
assert.match(
  stylesSource,
  /@media \(max-width: 820px\) \{[\s\S]*body \.llm-app-shell \.llm-next-gate \{[\s\S]*position: static/,
);
assert.match(
  stylesSource,
  /body \.llm-app-shell :is\(button, input, select, textarea, summary, a\):focus-visible \{[\s\S]*outline: 3px solid #167a65[\s\S]*outline-color: #167a65 !important/,
);
assert.match(
  stylesSource,
  /@media \(max-width: 820px\) \{[\s\S]*body \.llm-app-shell \.llm-new-mission-button \{[\s\S]*min-height: 44px[\s\S]*body \.llm-app-shell \.nav-button \{[\s\S]*min-height: 44px[\s\S]*body \.llm-app-shell \.mission-view-option \{[\s\S]*min-height: 44px/,
);
assert.match(
  stylesSource,
  /@media \(max-width: 1100px\) \{[\s\S]*body \.llm-app-shell \.llm-context-summary \.llm-context-label \{[\s\S]*color: #176b58[\s\S]*body \.llm-app-shell \.llm-context-summary > p:not\(\.llm-context-label\)[\s\S]*color: #525a55/,
);
assert.doesNotMatch(stylesSource, /content: "⌘ N"/);
assert.doesNotMatch(stylesSource, /content: "N"/);
assert.match(stylesSource, /@media \(prefers-reduced-motion: reduce\)/);
assert.doesNotMatch(stylesSource, /letter-spacing:\s*-/);

assert.match(designSource, /Agent Operations Desk/);
assert.match(decisionSource, /### DEC-161/);
assert.match(decisionSource, /Agent Operations Desk/);
assert.match(planSource, /Reference access date: 2026-07-23/);
assert.match(planSource, /Pinterest detail pages returned `403`/);
assert.match(planSource, /No runtime, API, schema, persistence, dependency, provider/);

process.stdout.write(`${JSON.stringify({
  ok: true,
  mode: MODE,
  presentation: {
    thesis: 'agent-operations-desk',
    navigation: 'graphite-coded-project-rail',
    primaryCanvas: 'source-backed-agent-thread',
    nextGate: 'high-contrast-command-dock',
    inspector: 'bounded-dark-context-tool',
    mobile: 'three-row-rail-with-compact-current-state',
    negativeLetterSpacing: 0,
  },
  references: {
    pinterest: 3,
    officialProductSources: 3,
    mobbin: 'blocked_paid_plan',
  },
  scopeEvidence: {
    existingDataActions: [
      'open-surface-for-mission',
      'start-new-mission',
      'set-mission-view',
    ],
    behaviorCompatibility: 'covered-by-existing-focused-and-aggregate-smokes',
    focusIndicator: 'opaque-dual-surface-contrast',
    mobileActionTarget: '44px',
  },
}, null, 2)}\n`);
