import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getStrategistContextConsumptionSummary } from '../ui/council-signals.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const mode = 'ui-slice-717';
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const app = fs.readFileSync(path.join(repoRoot, 'ui', 'app.js'), 'utf8');
const styles = fs.readFileSync(path.join(repoRoot, 'ui', 'styles.css'), 'utf8');
const server = fs.readFileSync(
  path.join(repoRoot, 'scripts', 'serve-ui-slice-01.mjs'),
  'utf8',
);

requireNoCliArgs(process.argv.slice(2), { mode });

for (const pattern of [
  /data-form="staffing-plan-strategist-context-entry"/,
  /data-action="enter-staffing-plan-council-with-strategist-context"/,
  /council-entry-with-strategist-context/,
  /use-exact-reviewed-mission-context-for-strategist-only/,
  /name="contextRationale"/,
  /function enterStaffingPlanCouncilWithStrategistContext/,
  /payload\.mutation\?\.staffingEntryId/,
  /Strategist context exact inspection receipt/,
  /missionStrategistContextEvidence/,
  /Exact Strategist context consumption receipt/,
]) {
  assert.match(app, pattern);
}

for (const pattern of [
  /council-entry-with-strategist-context/,
  /runtime\.enterStaffingPlanCouncilWithStrategistContext/,
  /Context-bound StaffingEntry request has unexpected or missing fields/,
  /stoppedAt: 'human-alignment'/,
]) {
  assert.match(server, pattern);
}
const routeStart = server.indexOf('staffingPlanCouncilEntryWithStrategistContextMatch');
const routeEnd = server.indexOf('staffingEntryInspectMatch', routeStart);
assert.ok(routeStart >= 0 && routeEnd > routeStart);
const routeSurface = server.slice(routeStart, routeEnd);
assert.doesNotMatch(routeSurface, /staffingEntry: result\.staffingEntry/);
assert.doesNotMatch(routeSurface, /councilSession: result\.councilSession/);

for (const pattern of [
  /\.strategist-context-entry-form/,
  /\.strategist-context-receipt/,
  /\.strategist-context-entry-grid/,
  /@media \(max-width: 820px\)/,
  /grid-template-columns: minmax\(0, 1fr\)/,
]) {
  assert.match(styles, pattern);
}

const mission = {
  id: 'mission-0001',
  projectId: 'project-0001',
  status: 'draft',
  linkedTaskId: null,
  councilSessionId: null,
  staffingEntryId: null,
};
const staffingPlan = {
  id: 'staffing-plan-0001',
  projectId: mission.projectId,
  missionId: mission.id,
  missionDigest: 'a'.repeat(64),
  persisted: true,
  status: 'accepted',
  mode: 'council',
  providerMode: 'local-stub',
};
const attachment = {
  id: 'mission-context-attachment-0001',
  projectId: mission.projectId,
  targetMissionId: mission.id,
  targetMissionDigest: staffingPlan.missionDigest,
  recordDigest: 'b'.repeat(64),
  persisted: true,
  status: 'attached',
};

const ready = getStrategistContextConsumptionSummary(
  mission,
  staffingPlan,
  null,
  attachment,
);
assert.equal(ready.attachmentCurrent, true);
assert.equal(ready.canEnter, true);
assert.equal(ready.downstreamAllowed, false);
assert.equal(ready.exactReceipt, false);

const contextRef = {
  attachmentId: attachment.id,
  attachmentRecordDigest: attachment.recordDigest,
  consumptionDigest: 'c'.repeat(64),
  contextDigest: 'd'.repeat(64),
};
const receipt = {
  ...contextRef,
  targetMissionId: mission.id,
  targetRole: 'strategist',
};
const exactEvidence = {
  staffingEntry: { missionContextAttachmentRef: contextRef },
  councilSession: { strategistContextConsumption: receipt },
};
const hydrated = getStrategistContextConsumptionSummary(
  { ...mission, status: 'aligning', staffingEntryId: 'staffing-entry-0001' },
  staffingPlan,
  { id: 'staffing-entry-0001' },
  attachment,
  exactEvidence,
);
assert.equal(hydrated.canEnter, false);
assert.equal(hydrated.exactReceipt, true);
assert.equal(hydrated.receipt, receipt);
assert.equal(
  getStrategistContextConsumptionSummary(
    mission,
    staffingPlan,
    null,
    { ...attachment, recordDigest: 'e'.repeat(64) },
    exactEvidence,
  ).exactReceipt,
  false,
);
assert.equal(
  getStrategistContextConsumptionSummary(
    { ...mission, id: 'mission-outside-source' },
    staffingPlan,
    null,
    attachment,
  ).canEnter,
  false,
);

const formStart = app.indexOf('data-form="staffing-plan-strategist-context-entry"');
const formEnd = app.indexOf('</form>', formStart);
assert.ok(formStart >= 0 && formEnd > formStart);
const formSurface = app.slice(formStart, formEnd);
assert.doesNotMatch(
  formSurface,
  /data-action="(?:approve|resume|retry|dispatch|inject|run-provider|commit|push|release|schedule)"/,
);

process.stdout.write(`${JSON.stringify({
  ok: true,
  mode,
  action: 'explicit-strategist-context-council-entry',
  transport: 'redacted-bounded-nine-key-post-and-exact-staffing-entry-get',
  gating: 'accepted-local-plan-and-exact-current-attachment',
  hydration: 'exact-staffing-entry-inspection-only',
  downstreamControls: 'absent',
  responsive: 'two-column-to-one-column',
}, null, 2)}\n`);
