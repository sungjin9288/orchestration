import { getArtifactTypeDisplay } from './artifact-preview.js';
import {
  getRunStatusDisplay,
  getRunTone,
  getTaskLifecycleDisplay,
  getTaskLifecycleTone,
} from './execution-labels.js';
import { escapeHtml } from './formatters.js';
import { getInboxKindDisplay, getInboxStatusDisplay, getInboxTone } from './inbox-labels.js';
import {
  getPreferredTaskInboxItem,
  getTaskArtifacts,
  sortByCreatedDesc,
} from './task-summaries.js';

export function renderDeliverablesShelfSignalRow(entries = [], surfaces = []) {
  const selectedEntries = surfaces
    .map((surface) => entries.find((entry) => entry.surface === surface))
    .filter(Boolean);

  if (selectedEntries.length === 0) {
    return '';
  }

  return `
    <div class="deliverables-shelf-signal-row">
      ${selectedEntries
        .map(
          (entry) => `
            <div class="deliverables-shelf-signal deliverables-shelf-signal-${escapeHtml(entry.surface)}">
              <span class="deliverables-shelf-signal-dot deliverables-shelf-signal-dot-${escapeHtml(entry.tone)}"></span>
              <span class="deliverables-shelf-signal-label">${escapeHtml(entry.label)}</span>
              <strong class="deliverables-shelf-signal-status">${escapeHtml(entry.status)}</strong>
            </div>
          `,
        )
        .join('')}
    </div>
  `;
}

export function renderDeliverablesOpsEntryRow(entries = []) {
  if (entries.length === 0) {
    return '';
  }

  return `
    <div class="deliverables-ops-entry-row">
      ${entries
        .map(
          (entry) => `
            <div class="deliverables-ops-entry deliverables-ops-entry-${escapeHtml(entry.surface)}">
              <div class="deliverables-ops-entry-head">
                <span class="deliverables-ops-entry-dot deliverables-ops-entry-dot-${escapeHtml(entry.tone)}"></span>
                <span class="deliverables-ops-entry-label">${escapeHtml(entry.label)}</span>
              </div>
              <strong class="deliverables-ops-entry-status">${escapeHtml(entry.status)}</strong>
            </div>
          `,
        )
        .join('')}
    </div>
  `;
}

export function renderTaskboardOpsEntrySignalRow(entries = []) {
  if (entries.length === 0) {
    return '';
  }

  return `
    <div class="taskboard-ops-entry-signal-row">
      ${entries
        .map(
          (entry) => `
            <div class="taskboard-ops-entry-signal taskboard-ops-entry-signal-${escapeHtml(entry.surface)}">
              <span class="taskboard-ops-entry-signal-dot taskboard-ops-entry-signal-dot-${escapeHtml(entry.tone)}"></span>
              <span class="taskboard-ops-entry-signal-label">${escapeHtml(entry.label)}</span>
              <strong class="taskboard-ops-entry-signal-status">${escapeHtml(entry.status)}</strong>
            </div>
          `,
        )
        .join('')}
    </div>
  `;
}

export function getAdvancedOpsEntrySignals(options = {}) {
  const data = options.data || {};
  const task = options.task || null;
  const currentRun =
    options.currentRun || (task?.latestRunId ? data.runMap?.get(task.latestRunId) || null : null);
  const currentArtifact =
    options.currentArtifact ||
    (task && Array.isArray(data.artifacts)
      ? getTaskArtifacts(task.id, data.artifacts).sort(sortByCreatedDesc)[0] || null
      : null);
  const currentInboxItem =
    options.currentInboxItem || (task ? getPreferredTaskInboxItem(task.id, data) : null);
  const pendingApprovalCount = Number.isFinite(options.pendingApprovalCount)
    ? options.pendingApprovalCount
    : 0;
  const pendingDecisionCount = Number.isFinite(options.pendingDecisionCount)
    ? options.pendingDecisionCount
    : 0;

  return [
    {
      surface: 'taskboard',
      label: '작업판',
      status: task ? getTaskLifecycleDisplay(task.lifecycleState) : '셀 없음',
      tone: task ? getTaskLifecycleTone(task.lifecycleState) : 'warning',
    },
    {
      surface: 'logs',
      label: '로그',
      status: currentRun ? getRunStatusDisplay(currentRun.status) : 'run 없음',
      tone: currentRun ? getRunTone(currentRun.status) : 'neutral',
    },
    {
      surface: 'artifacts',
      label: '보관',
      status: currentArtifact ? getArtifactTypeDisplay(currentArtifact.type) : '증적 없음',
      tone:
        currentArtifact?.type === 'close-out'
          ? 'success'
          : currentArtifact
            ? 'accent'
            : 'neutral',
    },
    {
      surface: 'decision-inbox',
      label: '승인',
      status: currentInboxItem
        ? `${getInboxKindDisplay(currentInboxItem.kind)} ${getInboxStatusDisplay(currentInboxItem.status)}`
        : pendingApprovalCount > 0
          ? `승인 ${pendingApprovalCount}건`
          : pendingDecisionCount > 0
            ? `확인 ${pendingDecisionCount}건`
            : '대기 없음',
      tone: currentInboxItem
        ? getInboxTone(currentInboxItem)
        : pendingApprovalCount > 0
          ? 'accent'
          : pendingDecisionCount > 0
            ? 'warning'
            : 'success',
    },
  ];
}

export function renderAdvancedOpsEntrySignalRow(entries = []) {
  if (entries.length === 0) {
    return '';
  }

  return `
    <div class="advanced-ops-entry-signal-row">
      ${entries
        .map(
          (entry) => `
            <div class="advanced-ops-entry-signal advanced-ops-entry-signal-${escapeHtml(entry.surface)}">
              <span class="advanced-ops-entry-signal-dot advanced-ops-entry-signal-dot-${escapeHtml(entry.tone)}"></span>
              <span class="advanced-ops-entry-signal-label">${escapeHtml(entry.label)}</span>
              <strong class="advanced-ops-entry-signal-status">${escapeHtml(entry.status)}</strong>
            </div>
          `,
        )
        .join('')}
    </div>
  `;
}
