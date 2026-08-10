import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getMissionContextAttachmentSummary } from '../ui/council-signals.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const mode = 'ui-slice-716';
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const app = fs.readFileSync(path.join(repoRoot, 'ui', 'app.js'), 'utf8');
const styles = fs.readFileSync(path.join(repoRoot, 'ui', 'styles.css'), 'utf8');
const server = fs.readFileSync(
  path.join(repoRoot, 'scripts', 'serve-ui-slice-01.mjs'),
  'utf8',
);

requireNoCliArgs(process.argv.slice(2), { mode });

for (const pattern of [
  /\/api\/missions\/\$\{encodeURIComponent\(targetMission\.id\)\}\/context-attachments/,
  /\/api\/missions\/\$\{encodeURIComponent\(selectedMission\.id\)\}\/context-attachment/,
  /data-form="attach-reviewed-mission-context"/,
  /data-action="attach-reviewed-mission-context"/,
  /name="rationale"/,
  /name="reviewedAt"/,
  /reviewed-exact-memory-context-for-immutable-mission-attachment/,
  /function renderMissionContextAttachmentRecord/,
  /role-consumption:\$\{attachment\.roleConsumptionStatus\}/,
  /policy-injection:\$\{attachment\.policyInjectionStatus\}/,
]) {
  assert.match(app, pattern);
}

for (const pattern of [
  /context-attachments/,
  /context-attachment/,
  /runtime\.attachReviewedMissionContext/,
  /runtime\.getMissionContextAttachment/,
  /MissionContextAttachment body has unexpected or missing fields/,
  /stoppedAt: 'mission-context-attached-role-consumption-blocked'/,
]) {
  assert.match(server, pattern);
}

assert.match(styles, /\.mission-context-attachment-form/);
assert.match(styles, /\.mission-context-attachment-record/);
assert.match(styles, /\.memory-candidate-grid/);
assert.match(styles, /@media \(max-width: 720px\)/);
assert.match(styles, /grid-template-columns: 1fr/);

const mission = { id: 'mission-0002' };
const preview = {
  id: 'mission-memory-context-preview-0123456789abcdef',
  persisted: false,
  status: 'context-review-ready',
  targetMissionId: mission.id,
  targetMissionDigest: 'a'.repeat(64),
  targetMissionStatus: 'draft',
  previewDigest: 'b'.repeat(64),
  missionInjectionStatus: 'blocked',
  workOrderInjectionStatus: 'blocked',
};
const ready = getMissionContextAttachmentSummary(preview, null, mission);
assert.equal(ready.canAttach, true);
assert.equal(ready.exactPreview, true);

const attachment = {
  id: 'mission-context-attachment-0001',
  persisted: true,
  status: 'attached',
  targetMissionId: mission.id,
  targetMissionDigest: preview.targetMissionDigest,
  sourcePreviewId: preview.id,
  sourcePreviewDigest: preview.previewDigest,
  roleConsumptionStatus: 'blocked',
  policyInjectionStatus: 'blocked',
};
const attached = getMissionContextAttachmentSummary(preview, attachment, mission);
assert.equal(attached.canAttach, false);
assert.equal(attached.exactAttachment, true);
assert.equal(attached.attachment, attachment);
assert.equal(
  getMissionContextAttachmentSummary(
    { ...preview, previewDigest: 'c'.repeat(64) },
    attachment,
    mission,
  ).exactAttachment,
  false,
);
assert.equal(
  getMissionContextAttachmentSummary(preview, null, {
    id: 'mission-outside-source',
  }).canAttach,
  false,
);

const renderStart = app.indexOf('function renderMissionContextAttachmentRecord');
const renderEnd = app.indexOf('\nfunction renderMemoryCandidatePreview', renderStart);
assert.ok(renderStart >= 0 && renderEnd > renderStart);
const renderSurface = app.slice(renderStart, renderEnd);
assert.doesNotMatch(
  renderSurface,
  /data-action="(?:consume|inject|apply|recommend|replace|delete|run-provider|commit|push|release|schedule|create-next-mission)"/,
);

process.stdout.write(`${JSON.stringify({
  ok: true,
  mode,
  action: 'attach-one-reviewed-mission-context',
  transport: 'bounded-ten-key-post-and-exact-mission-get',
  gating: 'browser-preview-review-rationale-reviewed-at-and-source-digests',
  hydration: 'exact-mission-locator-only',
  downstreamControls: 'absent',
  responsive: 'desktop-mobile-bounded',
}, null, 2)}\n`);
