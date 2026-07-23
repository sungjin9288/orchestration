'use strict';

const crypto = require('crypto');

const GRAPH_SCHEMA_VERSION = 1;
const MAX_GRAPH_NODES = 250;
const LANE_ORDER = Object.freeze(['context', 'plan', 'build', 'verify', 'deliver', 'close']);

const ROLE_LANES = Object.freeze({
  planner: 'plan',
  architect: 'plan',
  'task-breaker': 'plan',
  'builder-preflight': 'build',
  builder: 'build',
  reviewer: 'verify',
  qa: 'verify',
  commit: 'deliver',
  release: 'deliver',
  'close-out': 'close',
});

function freezeJson(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) freezeJson(child);
  return value;
}

function digestJson(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function boundedText(value, fallback) {
  const normalized = typeof value === 'string' ? value.trim() : '';
  return (normalized || fallback).slice(0, 120);
}

function sortedIds(values) {
  return [...new Set((values || []).filter((value) => typeof value === 'string' && value))].sort();
}

function recordStatus(record, fallback = 'recorded') {
  return boundedText(
    record?.status ||
      record?.lifecycleState ||
      record?.reviewStatus ||
      record?.decision ||
      record?.alignment?.status,
    fallback,
  );
}

function recordTime(record) {
  return record?.createdAt || record?.updatedAt || record?.startedAt || record?.finishedAt || null;
}

function sortedRecords(records) {
  return [...records].sort((left, right) =>
    String(recordTime(left) || '').localeCompare(String(recordTime(right) || '')) ||
    String(left?.id || '').localeCompare(String(right?.id || '')));
}

function graphNodeId(kind, sourceId) {
  return `${kind}:${sourceId}`;
}

function missingTaskError(taskId) {
  const error = new Error(`Task not found: ${taskId}`);
  error.statusCode = 404;
  return error;
}

function activeProjectError(taskId) {
  const error = new Error(`Task ${taskId} does not belong to the active project`);
  error.statusCode = 409;
  return error;
}

function artifactLane(type) {
  if (['plan', 'architecture', 'breakdown'].includes(type)) return 'plan';
  if (['preflight', 'change-summary', 'patch', 'diff', 'output'].includes(type)) return 'build';
  if (['review', 'qa-evidence'].includes(type)) return 'verify';
  if (['commit-package', 'commit-result', 'release-package'].includes(type)) return 'deliver';
  if (type === 'close-out') return 'close';
  return 'build';
}

function artifactKind(type) {
  const normalized = typeof type === 'string' && type.trim() ? type.trim() : 'output';
  return `artifact-${normalized}`;
}

function missionIdOf(record) {
  return typeof record?.missionId === 'string' && record.missionId
    ? record.missionId
    : null;
}

function importanceForPriority(priority) {
  if (priority <= 2) return 'root';
  if (priority <= 25) return 'major';
  if (priority <= 50) return 'operational';
  return 'evidence';
}

function buildTaskExecutionProvenanceGraph(state, taskId, options = {}) {
  const exactTaskId = typeof taskId === 'string' ? taskId : '';
  const task = state?.tasks?.[exactTaskId];
  if (!task) throw missingTaskError(exactTaskId || 'empty');
  if (state.activeProjectId !== task.projectId) throw activeProjectError(task.id);

  const project = state.projects?.[task.projectId];
  if (!project) throw activeProjectError(task.id);
  const taskMissionId = missionIdOf(task);
  const mission = taskMissionId && state.missions?.[taskMissionId]?.projectId === task.projectId
    ? state.missions[taskMissionId]
    : null;
  const lineageMissionId = mission?.id || null;
  const candidates = new Map();
  const edgeCandidates = [];

  function addNode({ sourceId, kind, lane, label, status, priority, createdAt, sourceRefs }) {
    if (!sourceId || !kind || !LANE_ORDER.includes(lane)) return null;
    const id = graphNodeId(kind, sourceId);
    const refs = sortedIds(sourceRefs?.length ? sourceRefs : [sourceId]);
    if (refs.length === 0) return null;
    const existing = candidates.get(id);
    if (existing) {
      existing.sourceRefs = sortedIds([...existing.sourceRefs, ...refs]);
      return id;
    }
    candidates.set(id, {
      id,
      kind,
      lane,
      label: boundedText(label, sourceId),
      status: boundedText(status, 'recorded'),
      sourceRefs: refs,
      createdAt: createdAt || null,
      importance: importanceForPriority(priority),
      priority,
    });
    return id;
  }

  function addEdge(kind, from, to, sourceRefs) {
    const refs = sortedIds(sourceRefs);
    if (!kind || !from || !to || from === to || refs.length === 0) return;
    edgeCandidates.push({ kind, from, to, sourceRefs: refs });
  }

  const projectNode = addNode({
    sourceId: project.id,
    kind: 'project',
    lane: 'context',
    label: project.name,
    status: 'active',
    priority: 0,
    createdAt: project.createdAt,
    sourceRefs: [project.id],
  });
  const missionNode = mission && addNode({
    sourceId: mission.id,
    kind: 'mission',
    lane: 'context',
    label: mission.title,
    status: recordStatus(mission, 'recorded'),
    priority: 1,
    createdAt: recordTime(mission),
    sourceRefs: [mission.id],
  });
  const taskNode = addNode({
    sourceId: task.id,
    kind: 'task',
    lane: 'context',
    label: task.title,
    status: recordStatus(task, 'recorded'),
    priority: 2,
    createdAt: recordTime(task),
    sourceRefs: [task.id],
  });
  addEdge('contains', projectNode, missionNode || taskNode, [project.id, mission?.id || task.id]);
  if (missionNode) addEdge('contains', missionNode, taskNode, [mission.id, task.id]);

  const plans = sortedRecords(Object.values(state.executionPlans || {}).filter((plan) =>
    plan?.controlTaskId === task.id &&
    plan.projectId === task.projectId &&
    missionIdOf(plan) === lineageMissionId,
  ));
  const planNodeById = new Map();
  const workOrderNodeById = new Map();
  const runNodeById = new Map();
  const artifactNodeById = new Map();

  function ensureTaskRun(runId) {
    const run = state.runs?.[runId];
    if (!run || run.taskId !== task.id) return null;
    if (runNodeById.has(run.id)) return runNodeById.get(run.id);
    const role = typeof run.role === 'string' ? run.role.trim() : '';
    const normalizedRole = role.toLowerCase();
    const lane = ROLE_LANES[normalizedRole] || 'build';
    const runNode = addNode({
      sourceId: run.id,
      kind: 'run',
      lane,
      label: role ? `${role} run` : 'Execution run',
      status: recordStatus(run, 'recorded'),
      priority: 50,
      createdAt: recordTime(run),
      sourceRefs: [run.id],
    });
    runNodeById.set(run.id, runNode);
    if (role) {
      const roleNode = addNode({
        sourceId: `${task.id}:${normalizedRole}`,
        kind: 'role',
        lane,
        label: role,
        status: 'observed',
        priority: 45,
        createdAt: recordTime(run),
        sourceRefs: [run.id],
      });
      addEdge('performed', roleNode, runNode, [run.id]);
    }
    addEdge('attempted-by', taskNode, runNode, [task.id, run.id]);
    return runNode;
  }

  function ensureTaskArtifact(artifactId) {
    const artifact = state.artifacts?.[artifactId];
    if (!artifact || artifact.taskId !== task.id) return null;
    if (artifactNodeById.has(artifact.id)) return artifactNodeById.get(artifact.id);
    const node = addNode({
      sourceId: artifact.id,
      kind: artifactKind(artifact.type),
      lane: artifactLane(artifact.type),
      label: `${artifact.type || 'Output'} artifact`,
      status: recordStatus(artifact, 'recorded'),
      priority: 60,
      createdAt: recordTime(artifact),
      sourceRefs: [artifact.id],
    });
    artifactNodeById.set(artifact.id, node);
    const runNode = artifact.runId ? ensureTaskRun(artifact.runId) : null;
    addEdge('produced', runNode || taskNode, node, [artifact.id, ...(runNode ? [artifact.runId] : [task.id])]);
    return node;
  }

  for (const plan of plans) {
    const planNode = addNode({
      sourceId: plan.id,
      kind: 'execution-plan',
      lane: 'plan',
      label: 'ExecutionPlan',
      status: recordStatus(plan, 'recorded'),
      priority: 10,
      createdAt: recordTime(plan),
      sourceRefs: [plan.id],
    });
    planNodeById.set(plan.id, planNode);
    addEdge('planned-as', taskNode, planNode, [task.id, plan.id]);

    const planApprovalIds = sortedIds([plan.approvalId, plan.terminalGateApprovalId]);
    for (const approvalId of planApprovalIds) {
      const approval = state.approvals?.[approvalId];
      if (!approval || approval.taskId !== task.id) continue;
      const approvalNode = addNode({
        sourceId: approval.id,
        kind: 'approval',
        lane: 'verify',
        label: approval.scope || approval.allowedNextAction || 'Approval',
        status: recordStatus(approval, 'recorded'),
        priority: 20,
        createdAt: recordTime(approval),
        sourceRefs: [approval.id],
      });
      addEdge('gated-by', planNode, approvalNode, [plan.id, approval.id]);
    }

    for (const workOrderId of sortedIds(plan.workOrderIds)) {
      const workOrder = state.workOrders?.[workOrderId];
      if (!workOrder || workOrder.executionPlanId !== plan.id) continue;
      const workOrderRole =
        typeof workOrder.role === 'string' ? workOrder.role.trim().toLowerCase() : '';
      const lane = ROLE_LANES[workOrderRole] || 'build';
      const workOrderNode = addNode({
        sourceId: workOrder.id,
        kind: 'work-order',
        lane,
        label: workOrder.title || workOrder.role || 'WorkOrder',
        status: recordStatus(workOrder, 'recorded'),
        priority: 30,
        createdAt: recordTime(workOrder),
        sourceRefs: [workOrder.id],
      });
      workOrderNodeById.set(workOrder.id, workOrderNode);
      addEdge('contains', planNode, workOrderNode, [plan.id, workOrder.id]);

      for (const runId of sortedIds(workOrder.runRefs)) {
        const runNode = ensureTaskRun(runId);
        if (runNode) addEdge('executed-by', workOrderNode, runNode, [workOrder.id, runId]);
      }
      for (const artifactId of sortedIds(workOrder.artifactRefs)) {
        const artifactNode = ensureTaskArtifact(artifactId);
        if (artifactNode) addEdge('produced', workOrderNode, artifactNode, [workOrder.id, artifactId]);
      }
      for (const approvalId of sortedIds(workOrder.approvalRefs)) {
        const approval = state.approvals?.[approvalId];
        if (!approval || approval.taskId !== task.id) continue;
        const approvalNode = addNode({
          sourceId: approval.id,
          kind: 'approval',
          lane: 'verify',
          label: approval.scope || approval.allowedNextAction || 'Approval',
          status: recordStatus(approval, 'recorded'),
          priority: 20,
          createdAt: recordTime(approval),
          sourceRefs: [approval.id],
        });
        addEdge('gated-by', workOrderNode, approvalNode, [workOrder.id, approval.id]);
      }
      for (const criterionId of sortedIds(workOrder.acceptanceCriterionRefs)) {
        const criterion = state.acceptanceCriteria?.[criterionId];
        if (
          !criterion ||
          criterion.executionPlanId !== plan.id ||
          criterion.workOrderId !== workOrder.id ||
          criterion.projectId !== task.projectId ||
          missionIdOf(criterion) !== lineageMissionId
        ) continue;
        const criterionNode = addNode({
          sourceId: criterion.id,
          kind: 'acceptance-criterion',
          lane: 'verify',
          label: criterion.title || criterion.kind || 'Acceptance criterion',
          status: recordStatus(criterion, 'recorded'),
          priority: 55,
          createdAt: recordTime(criterion),
          sourceRefs: [criterion.id],
        });
        addEdge('requires', workOrderNode, criterionNode, [workOrder.id, criterion.id]);
        for (const proof of sortedRecords(Object.values(state.verificationProofs || {}).filter((entry) =>
          entry?.acceptanceCriterionId === criterion.id &&
          entry.executionPlanId === plan.id &&
          entry.workOrderId === workOrder.id,
        ))) {
          const proofNode = addNode({
            sourceId: proof.id,
            kind: 'verification-proof',
            lane: 'verify',
            label: `${proof.proofKind || 'Verification'} proof`,
            status: recordStatus(proof, 'recorded'),
            priority: 56,
            createdAt: recordTime(proof),
            sourceRefs: [proof.id],
          });
          addEdge('verified-by', criterionNode, proofNode, [criterion.id, proof.id]);
          for (const artifactId of sortedIds(proof.evidenceArtifactIds)) {
            const artifactNode = ensureTaskArtifact(artifactId);
            if (artifactNode) addEdge('evidenced-by', proofNode, artifactNode, [proof.id, artifactId]);
          }
        }
      }
    }

    for (const workOrder of Object.values(state.workOrders || {})) {
      if (!workOrderNodeById.has(workOrder?.id) || workOrder.executionPlanId !== plan.id) continue;
      for (const dependencyId of sortedIds(workOrder.dependencyIds)) {
        const dependencyNode = workOrderNodeById.get(dependencyId);
        const targetNode = workOrderNodeById.get(workOrder.id);
        if (dependencyNode && targetNode) {
          addEdge('depends-on', targetNode, dependencyNode, [plan.id, workOrder.id, dependencyId]);
        }
      }
    }

    for (const checkpointId of sortedIds(plan.checkpointRefs)) {
      const checkpoint = state.workflowCheckpoints?.[checkpointId];
      if (!checkpoint || checkpoint.executionPlanId !== plan.id) continue;
      const checkpointNode = addNode({
        sourceId: checkpoint.id,
        kind: 'workflow-checkpoint',
        lane: 'verify',
        label: checkpoint.stage || 'Workflow checkpoint',
        status: recordStatus(checkpoint, 'recorded'),
        priority: 25,
        createdAt: recordTime(checkpoint),
        sourceRefs: [checkpoint.id],
      });
      addEdge('checkpointed-by', planNode, checkpointNode, [plan.id, checkpoint.id]);
    }

    for (const deliveryPackageId of sortedIds(plan.deliveryPackageRefs)) {
      const deliveryPackage = state.deliveryPackages?.[deliveryPackageId];
      if (
        !deliveryPackage ||
        deliveryPackage.executionPlanId !== plan.id ||
        deliveryPackage.projectId !== task.projectId ||
        missionIdOf(deliveryPackage) !== lineageMissionId
      ) continue;
      const packageNode = addNode({
        sourceId: deliveryPackage.id,
        kind: 'delivery-package',
        lane: 'deliver',
        label: 'DeliveryPackage',
        status: recordStatus(deliveryPackage, 'recorded'),
        priority: 15,
        createdAt: recordTime(deliveryPackage),
        sourceRefs: [deliveryPackage.id],
      });
      addEdge('delivers', planNode, packageNode, [plan.id, deliveryPackage.id]);
      for (const acceptance of sortedRecords(Object.values(state.deliveryPackageAcceptances || {}).filter((entry) =>
        entry?.deliveryPackageId === deliveryPackage.id && entry.executionPlanId === plan.id,
      ))) {
        const acceptanceNode = addNode({
          sourceId: acceptance.id,
          kind: 'delivery-acceptance',
          lane: 'deliver',
          label: 'Delivery acceptance',
          status: recordStatus(acceptance, 'recorded'),
          priority: 16,
          createdAt: recordTime(acceptance),
          sourceRefs: [acceptance.id],
        });
        addEdge('accepted-by', packageNode, acceptanceNode, [deliveryPackage.id, acceptance.id]);
      }
      for (const closeOut of sortedRecords(Object.values(state.missionCloseOuts || {}).filter((entry) =>
        entry?.linkedTaskId === task.id &&
        entry.executionPlanId === plan.id &&
        entry.deliveryPackageId === deliveryPackage.id &&
        missionIdOf(entry) === lineageMissionId,
      ))) {
        const closeOutNode = addNode({
          sourceId: closeOut.id,
          kind: 'mission-close-out',
          lane: 'close',
          label: 'Mission close-out',
          status: recordStatus(closeOut, 'recorded'),
          priority: 14,
          createdAt: recordTime(closeOut),
          sourceRefs: [closeOut.id],
        });
        addEdge('closed-by', packageNode, closeOutNode, [deliveryPackage.id, closeOut.id]);
      }
    }
  }

  for (const run of sortedRecords(Object.values(state.runs || {}).filter((entry) => entry?.taskId === task.id))) {
    ensureTaskRun(run.id);
  }
  for (const artifact of sortedRecords(Object.values(state.artifacts || {}).filter((entry) => entry?.taskId === task.id))) {
    ensureTaskArtifact(artifact.id);
  }
  for (const approval of sortedRecords(Object.values(state.approvals || {}).filter((entry) => entry?.taskId === task.id))) {
    const approvalNode = addNode({
      sourceId: approval.id,
      kind: 'approval',
      lane: 'verify',
      label: approval.scope || approval.allowedNextAction || 'Approval',
      status: recordStatus(approval, 'recorded'),
      priority: 20,
      createdAt: recordTime(approval),
      sourceRefs: [approval.id],
    });
    addEdge('gated-by', taskNode, approvalNode, [task.id, approval.id]);
  }
  for (const item of sortedRecords(Object.values(state.decisionInboxItems || {}).filter((entry) => entry?.taskId === task.id))) {
    const decisionNode = addNode({
      sourceId: item.id,
      kind: 'decision',
      lane: 'verify',
      label: item.kind || item.sourceType || 'Decision',
      status: recordStatus(item, 'recorded'),
      priority: 21,
      createdAt: recordTime(item),
      sourceRefs: [item.id],
    });
    addEdge('reviewed-in', taskNode, decisionNode, [task.id, item.id]);
    const approval = item.sourceId && state.approvals?.[item.sourceId];
    if (approval?.taskId === task.id) {
      addEdge('reviewed-in', graphNodeId('approval', approval.id), decisionNode, [approval.id, item.id]);
    }
  }

  const orderedCandidates = [...candidates.values()].sort((left, right) =>
    left.priority - right.priority ||
    LANE_ORDER.indexOf(left.lane) - LANE_ORDER.indexOf(right.lane) ||
    String(left.createdAt || '').localeCompare(String(right.createdAt || '')) ||
    left.id.localeCompare(right.id));
  const selectedCandidates = orderedCandidates.slice(0, MAX_GRAPH_NODES);
  const selectedIds = new Set(selectedCandidates.map((node) => node.id));
  const nodes = selectedCandidates.map(({ priority, ...node }) => node);
  const edges = edgeCandidates
    .filter((edge) => selectedIds.has(edge.from) && selectedIds.has(edge.to))
    .sort((left, right) =>
      left.kind.localeCompare(right.kind) ||
      left.from.localeCompare(right.from) ||
      left.to.localeCompare(right.to) ||
      left.sourceRefs.join('|').localeCompare(right.sourceRefs.join('|')))
    .filter((edge, index, entries) =>
      index === 0 || JSON.stringify(edge) !== JSON.stringify(entries[index - 1]))
    .map((edge) => ({ id: `edge-${digestJson(edge).slice(0, 16)}`, ...edge }));
  const digestSource = {
    schemaVersion: GRAPH_SCHEMA_VERSION,
    projectId: project.id,
    missionId: mission?.id || null,
    taskId: task.id,
    nodes,
    edges,
  };

  return freezeJson({
    ...digestSource,
    generatedAt: options.generatedAt || new Date().toISOString(),
    sourceDigest: digestJson(digestSource),
    maxNodes: MAX_GRAPH_NODES,
    truncated: orderedCandidates.length > MAX_GRAPH_NODES,
    counts: {
      availableNodes: orderedCandidates.length,
      projectedNodes: nodes.length,
      excludedNodes: Math.max(0, orderedCandidates.length - nodes.length),
      projectedEdges: edges.length,
    },
    authority: {
      readOnly: true,
      persistenceAllowed: false,
      mutationAllowed: false,
      blockedActions: [
        'approval',
        'execution',
        'resume',
        'source-mutation',
        'commit',
        'push',
        'release',
      ],
    },
  });
}

module.exports = {
  GRAPH_SCHEMA_VERSION,
  LANE_ORDER,
  MAX_GRAPH_NODES,
  buildTaskExecutionProvenanceGraph,
};
