'use strict';

const path = require('path');

const {
  ARTIFACT_CATALOG,
  ARTIFACT_RETENTION_TIER,
  RETENTION_CONSUMER_ACTION,
  RETENTION_CONSUMER_STATUS,
} = require('./contracts');

function normalizeRelativeArtifactPath(value) {
  const normalized = String(value || '')
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\.\//, '');

  if (
    !normalized ||
    path.posix.isAbsolute(normalized) ||
    normalized === '..' ||
    normalized.startsWith('../') ||
    normalized.includes('/../')
  ) {
    return null;
  }

  return normalized;
}

function assertSupportedArtifactType(type) {
  if (!Object.prototype.hasOwnProperty.call(ARTIFACT_CATALOG, type)) {
    throw new Error(`Unsupported artifact type: ${type}`);
  }
}

function compareByCreatedDesc(left, right) {
  const leftValue = left.createdAt || '';
  const rightValue = right.createdAt || '';

  if (leftValue === rightValue) {
    return String(left.id || '').localeCompare(String(right.id || ''));
  }

  return rightValue.localeCompare(leftValue);
}

function cloneJsonValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function listRetentionFutureEligibleActions(retentionTier) {
  if (retentionTier === ARTIFACT_RETENTION_TIER.TIER_A) {
    return [];
  }

  if (retentionTier === ARTIFACT_RETENTION_TIER.TIER_B) {
    return [RETENTION_CONSUMER_ACTION.ARCHIVE];
  }

  return [
    RETENTION_CONSUMER_ACTION.ARCHIVE,
    RETENTION_CONSUMER_ACTION.DELETE,
    RETENTION_CONSUMER_ACTION.GC,
  ];
}

function listRetentionAvailableActions(retentionTier, retentionStatus) {
  if (retentionTier === ARTIFACT_RETENTION_TIER.TIER_A) {
    return [];
  }

  if (retentionTier === ARTIFACT_RETENTION_TIER.TIER_B) {
    return retentionStatus === RETENTION_CONSUMER_STATUS.ACTIVE
      ? [RETENTION_CONSUMER_ACTION.ARCHIVE]
      : [];
  }

  if (retentionStatus === RETENTION_CONSUMER_STATUS.ACTIVE) {
    return [RETENTION_CONSUMER_ACTION.ARCHIVE, RETENTION_CONSUMER_ACTION.DELETE];
  }

  if (retentionStatus === RETENTION_CONSUMER_STATUS.ARCHIVED) {
    return [RETENTION_CONSUMER_ACTION.DELETE];
  }

  if (retentionStatus === RETENTION_CONSUMER_STATUS.DELETED) {
    return [RETENTION_CONSUMER_ACTION.GC];
  }

  return [];
}

function getRetentionCurrentPolicy(retentionTier, retentionStatus) {
  if (retentionTier === ARTIFACT_RETENTION_TIER.TIER_A) {
    return 'protected-history-retained';
  }

  if (retentionTier === ARTIFACT_RETENTION_TIER.TIER_B) {
    return retentionStatus === RETENTION_CONSUMER_STATUS.ARCHIVED
      ? 'archived-inspectable-history-retained'
      : 'latest-centered-browse-with-history-retained';
  }

  if (retentionStatus === RETENTION_CONSUMER_STATUS.ARCHIVED) {
    return 'archived-inspectable-awaiting-explicit-delete';
  }

  if (retentionStatus === RETENTION_CONSUMER_STATUS.DELETED) {
    return 'deleted-inspectable-awaiting-explicit-gc';
  }

  if (retentionStatus === RETENTION_CONSUMER_STATUS.GC) {
    return 'gc-tombstone-retained';
  }

  return 'retain-history-until-explicit-consumer';
}

function getRetentionReason(retentionTier, retentionStatus) {
  if (retentionTier === ARTIFACT_RETENTION_TIER.TIER_A) {
    return 'Tier A provenance-critical artifacts stay protected under DEC-030.';
  }

  if (retentionTier === ARTIFACT_RETENTION_TIER.TIER_B) {
    return retentionStatus === RETENTION_CONSUMER_STATUS.ARCHIVED
      ? 'Tier B artifacts remain inspectable after explicit archive while history stays retained.'
      : 'Tier B artifacts remain inspectable and latest-centered until explicitly archived.';
  }

  if (retentionStatus === RETENTION_CONSUMER_STATUS.ARCHIVED) {
    return 'Tier C artifacts may be archived first so the operator can inspect them before an explicit delete.';
  }

  if (retentionStatus === RETENTION_CONSUMER_STATUS.DELETED) {
    return 'Tier C artifacts stay inspectable after explicit delete until a later explicit gc removes raw content.';
  }

  if (retentionStatus === RETENTION_CONSUMER_STATUS.GC) {
    return 'Tier C raw content has been garbage-collected, but the artifact tombstone remains inspectable.';
  }

  return 'Tier C artifacts are the first cleanup candidates when an explicit operator action is implemented.';
}

module.exports = {
  assertSupportedArtifactType,
  cloneJsonValue,
  compareByCreatedDesc,
  getRetentionCurrentPolicy,
  getRetentionReason,
  listRetentionAvailableActions,
  listRetentionFutureEligibleActions,
  normalizeRelativeArtifactPath,
};
