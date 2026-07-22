'use strict';

const crypto = require('crypto');

const GRAPH_SCHEMA_VERSION = 1;
const MAX_GRAPH_NODES = 250;

const STAGE_ORDER = Object.freeze([
  'mission',
  'council',
  'execution',
  'verification',
  'delivery',
  'learning',
]);

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

function sortedRecords(records) {
  return [...records].sort((left, right) => {
    const leftTime = left?.createdAt || left?.updatedAt || '';
    const rightTime = right?.createdAt || right?.updatedAt || '';
    return leftTime.localeCompare(rightTime) || String(left?.id).localeCompare(String(right?.id));
  });
}

function graphNodeId(kind, sourceId) {
  return `${kind}:${sourceId}`;
}

function activeProjectError(missionId) {
  const error = new Error(`Mission ${missionId} does not belong to the active project`);
  error.statusCode = 409;
  return error;
}

function missingMissionError(missionId) {
  const error = new Error(`Mission not found: ${missionId}`);
  error.statusCode = 404;
  return error;
}

function buildMissionEvidenceGraph(state, missionId, options = {}) {
  const normalizedMissionId = typeof missionId === 'string' ? missionId.trim() : '';
  const mission = state?.missions?.[normalizedMissionId];

  if (!mission) throw missingMissionError(normalizedMissionId || 'empty');
  if (state.activeProjectId !== mission.projectId) throw activeProjectError(mission.id);

  const nodeCandidates = new Map();
  const edgeCandidates = [];

  function addNode({ sourceId, kind, stage, label, status, importance, rank, createdAt = null }) {
    if (!sourceId) return null;
    const id = graphNodeId(kind, sourceId);
    if (!nodeCandidates.has(id)) {
      nodeCandidates.set(id, {
        id,
        kind,
        stage,
        label: boundedText(label, sourceId),
        status: boundedText(status, 'recorded'),
        sourceRef: sourceId,
        importance,
        createdAt: createdAt || null,
        rank,
      });
    }
    return id;
  }

  function addEdge(kind, from, to, sourceRefs) {
    if (!from || !to || from === to) return;
    const refs = [...new Set((sourceRefs || []).filter(Boolean))].sort();
    if (refs.length === 0) return;
    edgeCandidates.push({ kind, from, to, sourceRefs: refs });
  }

  const missionNode = addNode({
    sourceId: mission.id,
    kind: 'mission',
    stage: 'mission',
    label: mission.title,
    status: mission.status,
    importance: 'root',
    rank: 0,
    createdAt: mission.createdAt,
  });

  const councilSessions = sortedRecords(
    Object.values(state.councilSessions || {}).filter(
      (session) => session.missionId === mission.id,
    ),
  );
  const councilNodeById = new Map();

  for (const session of councilSessions) {
    const sessionNode = addNode({
      sourceId: session.id,
      kind: 'council-session',
      stage: 'council',
      label: session.mode ? `Council · ${session.mode}` : 'Council session',
      status: recordStatus(session, 'pending'),
      importance: 'major',
      rank: 10,
      createdAt: session.createdAt,
    });
    councilNodeById.set(session.id, sessionNode);
    addEdge('contains', missionNode, sessionNode, [mission.id, session.id]);

    for (const [attemptIndex, attempt] of (session.attempts || []).entries()) {
      const attemptNode = addNode({
        sourceId: attempt.id,
        kind: 'council-attempt',
        stage: 'council',
        label: `Council attempt ${attemptIndex + 1}`,
        status: recordStatus(attempt, 'recorded'),
        importance: 'operational',
        rank: 11,
        createdAt: attempt.createdAt,
      });
      addEdge('contains', sessionNode, attemptNode, [session.id, attempt.id]);

      const positionNodes = [];
      for (const position of attempt.positions || []) {
        const positionNode = addNode({
          sourceId: position.id,
          kind: 'council-position',
          stage: 'council',
          label: position.role || position.agentId || 'Council position',
          status: position.providerEvidence?.outcome || position.confidence || 'recorded',
          importance: 'operational',
          rank: 12,
          createdAt: position.createdAt,
        });
        positionNodes.push(positionNode);
        addEdge('contains', attemptNode, positionNode, [attempt.id, position.id]);
      }

      if (attempt.synthesis?.id) {
        const synthesisNode = addNode({
          sourceId: attempt.synthesis.id,
          kind: 'council-synthesis',
          stage: 'council',
          label: 'Conductor synthesis',
          status: attempt.synthesis.providerEvidence?.outcome || 'review-required',
          importance: 'major',
          rank: 13,
          createdAt: attempt.synthesis.createdAt,
        });
        addEdge('contains', attemptNode, synthesisNode, [attempt.id, attempt.synthesis.id]);
        for (const positionNode of positionNodes) {
          addEdge('informs', positionNode, synthesisNode, [attempt.synthesis.id]);
        }
      }
    }
  }

  const runNodeById = new Map();
  const artifactNodeById = new Map();
  const approvalNodeById = new Map();
  const inboxNodeById = new Map();

  function ensureRun(runId, rank = 40) {
    const run = state.runs?.[runId];
    if (!run) return null;
    if (!runNodeById.has(run.id)) {
      runNodeById.set(run.id, addNode({
        sourceId: run.id,
        kind: 'run',
        stage: 'execution',
        label: `${run.role || run.stage || 'Execution'} run`,
        status: recordStatus(run, 'recorded'),
        importance: 'evidence',
        rank,
        createdAt: run.createdAt,
      }));
    }
    return runNodeById.get(run.id);
  }

  function ensureArtifact(artifactId, rank = 60) {
    const artifact = state.artifacts?.[artifactId];
    if (!artifact) return null;
    if (!artifactNodeById.has(artifact.id)) {
      artifactNodeById.set(artifact.id, addNode({
        sourceId: artifact.id,
        kind: 'artifact',
        stage: 'verification',
        label: `${artifact.type || 'Output'} artifact`,
        status: recordStatus(artifact, 'retained'),
        importance: 'evidence',
        rank,
        createdAt: artifact.createdAt,
      }));
    }
    return artifactNodeById.get(artifact.id);
  }

  function ensureApproval(approvalId) {
    const approval = state.approvals?.[approvalId];
    if (!approval) return null;
    if (!approvalNodeById.has(approval.id)) {
      approvalNodeById.set(approval.id, addNode({
        sourceId: approval.id,
        kind: 'approval',
        stage: 'verification',
        label: approval.scope || approval.allowedNextAction || 'Approval',
        status: recordStatus(approval, 'pending'),
        importance: 'major',
        rank: 30,
        createdAt: approval.createdAt,
      }));
    }
    return approvalNodeById.get(approval.id);
  }

  function ensureInboxItem(itemId) {
    const item = state.decisionInboxItems?.[itemId];
    if (!item) return null;
    if (!inboxNodeById.has(item.id)) {
      inboxNodeById.set(item.id, addNode({
        sourceId: item.id,
        kind: 'decision',
        stage: 'verification',
        label: item.kind || item.sourceType || 'Decision',
        status: recordStatus(item, 'pending'),
        importance: 'major',
        rank: 31,
        createdAt: item.createdAt,
      }));
    }
    return inboxNodeById.get(item.id);
  }

  const executionPlans = sortedRecords(
    Object.values(state.executionPlans || {}).filter((plan) => plan.missionId === mission.id),
  );

  for (const plan of executionPlans) {
    const planNode = addNode({
      sourceId: plan.id,
      kind: 'execution-plan',
      stage: 'execution',
      label: 'ExecutionPlan',
      status: recordStatus(plan, 'draft'),
      importance: 'major',
      rank: 20,
      createdAt: plan.createdAt,
    });
    addEdge('contains', missionNode, planNode, [mission.id, plan.id]);
    addEdge('derived-from', councilNodeById.get(plan.councilSessionId), planNode, [plan.id]);

    const task = state.tasks?.[plan.controlTaskId] || state.tasks?.[mission.linkedTaskId];
    const taskNode = task
      ? addNode({
          sourceId: task.id,
          kind: 'task',
          stage: 'execution',
          label: task.title,
          status: recordStatus(task, 'inbox'),
          importance: 'operational',
          rank: 21,
          createdAt: task.createdAt,
        })
      : null;
    addEdge('controls', planNode, taskNode, [plan.id, task?.id]);

    const workOrderNodeById = new Map();
    for (const workOrderId of plan.workOrderIds || []) {
      const workOrder = state.workOrders?.[workOrderId];
      if (!workOrder) continue;
      const workOrderNode = addNode({
        sourceId: workOrder.id,
        kind: 'work-order',
        stage: 'execution',
        label: workOrder.title || workOrder.role || 'WorkOrder',
        status: recordStatus(workOrder, 'draft'),
        importance: 'operational',
        rank: 22,
        createdAt: workOrder.createdAt,
      });
      workOrderNodeById.set(workOrder.id, workOrderNode);
      addEdge('contains', planNode, workOrderNode, [plan.id, workOrder.id]);
      if (workOrder.linkedTaskId) addEdge('controls', workOrderNode, taskNode, [workOrder.id]);

      for (const runId of workOrder.runRefs || []) {
        const runNode = ensureRun(runId);
        addEdge('executed-by', workOrderNode, runNode, [workOrder.id, runId]);
      }
      for (const artifactId of workOrder.artifactRefs || []) {
        const artifactNode = ensureArtifact(artifactId);
        addEdge('produced', workOrderNode, artifactNode, [workOrder.id, artifactId]);
      }
      for (const criterionId of workOrder.acceptanceCriterionRefs || []) {
        const criterion = state.acceptanceCriteria?.[criterionId];
        if (!criterion) continue;
        const criterionNode = addNode({
          sourceId: criterion.id,
          kind: 'acceptance-criterion',
          stage: 'verification',
          label: criterion.title || criterion.kind || 'Acceptance criterion',
          status: recordStatus(criterion, 'pending'),
          importance: 'evidence',
          rank: 50,
          createdAt: criterion.createdAt,
        });
        addEdge('requires', workOrderNode, criterionNode, [workOrder.id, criterion.id]);
        for (const proof of sortedRecords(
          Object.values(state.verificationProofs || {}).filter(
            (entry) => entry.acceptanceCriterionId === criterion.id,
          ),
        )) {
          const proofNode = addNode({
            sourceId: proof.id,
            kind: 'verification-proof',
            stage: 'verification',
            label: `${proof.proofMode || proof.kind || 'Verification'} proof`,
            status: recordStatus(proof, 'recorded'),
            importance: 'evidence',
            rank: 51,
            createdAt: proof.createdAt,
          });
          addEdge('verified-by', criterionNode, proofNode, [criterion.id, proof.id]);
        }
      }
    }

    const dependencyEdges = Array.isArray(plan.dependencyEdges) && plan.dependencyEdges.length > 0
      ? plan.dependencyEdges
      : (plan.workOrderIds || []).flatMap((workOrderId) => {
          const workOrder = state.workOrders?.[workOrderId];
          return (workOrder?.dependencyIds || []).map((dependencyId) => ({
            from: dependencyId,
            to: workOrderId,
          }));
        });
    for (const dependency of dependencyEdges) {
      const handoffRefs = (plan.handoffPacketIds || []).filter(
        (packetId) => state.handoffPackets?.[packetId]?.workOrderId === dependency.to,
      );
      addEdge(
        'depends-on',
        workOrderNodeById.get(dependency.from),
        workOrderNodeById.get(dependency.to),
        [plan.id, ...handoffRefs],
      );
    }

    const planApprovalIds = [plan.approvalId, plan.terminalGateApprovalId].filter(Boolean);
    for (const approvalId of planApprovalIds) {
      const approvalNode = ensureApproval(approvalId);
      addEdge('gated-by', planNode, approvalNode, [plan.id, approvalId]);
    }

    for (const checkpointId of plan.checkpointRefs || []) {
      const checkpoint = state.workflowCheckpoints?.[checkpointId];
      if (!checkpoint) continue;
      const checkpointNode = addNode({
        sourceId: checkpoint.id,
        kind: 'workflow-checkpoint',
        stage: 'verification',
        label: checkpoint.stage || 'Workflow checkpoint',
        status: recordStatus(checkpoint, 'recorded'),
        importance: 'major',
        rank: 32,
        createdAt: checkpoint.createdAt,
      });
      addEdge('checkpointed-by', planNode, checkpointNode, [plan.id, checkpoint.id]);
    }

    for (const deliveryPackageId of plan.deliveryPackageRefs || []) {
      const deliveryPackage = state.deliveryPackages?.[deliveryPackageId];
      if (!deliveryPackage) continue;
      const packageNode = addNode({
        sourceId: deliveryPackage.id,
        kind: 'delivery-package',
        stage: 'delivery',
        label: 'DeliveryPackage',
        status: recordStatus(deliveryPackage, 'review-required'),
        importance: 'major',
        rank: 70,
        createdAt: deliveryPackage.createdAt,
      });
      addEdge('delivers', planNode, packageNode, [plan.id, deliveryPackage.id]);
      for (const acceptance of sortedRecords(
        Object.values(state.deliveryPackageAcceptances || {}).filter(
          (entry) => entry.deliveryPackageId === deliveryPackage.id,
        ),
      )) {
        const acceptanceNode = addNode({
          sourceId: acceptance.id,
          kind: 'delivery-acceptance',
          stage: 'delivery',
          label: 'Delivery acceptance',
          status: recordStatus(acceptance, 'accepted'),
          importance: 'major',
          rank: 71,
          createdAt: acceptance.createdAt,
        });
        addEdge('accepted-by', packageNode, acceptanceNode, [deliveryPackage.id, acceptance.id]);
      }
    }

    for (const closeOut of sortedRecords(
      Object.values(state.missionCloseOuts || {}).filter(
        (entry) => entry.executionPlanId === plan.id && entry.missionId === mission.id,
      ),
    )) {
      const closeOutNode = addNode({
        sourceId: closeOut.id,
        kind: 'mission-close-out',
        stage: 'delivery',
        label: 'Mission close-out',
        status: recordStatus(closeOut, 'completed'),
        importance: 'major',
        rank: 72,
        createdAt: closeOut.createdAt,
      });
      addEdge('closed-by', planNode, closeOutNode, [plan.id, closeOut.id]);
    }

    if (task) {
      for (const run of sortedRecords(
        Object.values(state.runs || {}).filter((entry) => entry.taskId === task.id),
      )) {
        const runNode = ensureRun(run.id);
        addEdge('attempted-by', taskNode, runNode, [task.id, run.id]);
      }
      for (const artifact of sortedRecords(
        Object.values(state.artifacts || {}).filter((entry) => entry.taskId === task.id),
      )) {
        const artifactNode = ensureArtifact(artifact.id);
        const runNode = artifact.runId ? ensureRun(artifact.runId) : null;
        addEdge('produced', runNode || taskNode, artifactNode, [artifact.id, runNode ? artifact.runId : task.id]);
      }
      for (const approval of sortedRecords(
        Object.values(state.approvals || {}).filter((entry) => entry.taskId === task.id),
      )) {
        const approvalNode = ensureApproval(approval.id);
        addEdge('gated-by', taskNode, approvalNode, [task.id, approval.id]);
      }
      for (const item of sortedRecords(
        Object.values(state.decisionInboxItems || {}).filter((entry) => entry.taskId === task.id),
      )) {
        const inboxNode = ensureInboxItem(item.id);
        addEdge('reviewed-in', taskNode, inboxNode, [task.id, item.id]);
        if (item.sourceId && state.approvals?.[item.sourceId]) {
          addEdge('reviewed-in', ensureApproval(item.sourceId), inboxNode, [item.sourceId, item.id]);
        }
      }
    }
  }

  const learningCandidates = sortedRecords(
    Object.values(state.learningCandidates || {}).filter(
      (candidate) => candidate.sourceMissionId === mission.id,
    ),
  );
  for (const candidate of learningCandidates) {
    const candidateNode = addNode({
      sourceId: candidate.id,
      kind: 'learning-candidate',
      stage: 'learning',
      label: 'LearningCandidate',
      status: candidate.reviewerStatus || candidate.promotionStatus || 'review-required',
      importance: 'operational',
      rank: 80,
      createdAt: candidate.createdAt,
    });
    addEdge('derived-from', missionNode, candidateNode, [mission.id, candidate.id]);

    for (const review of sortedRecords(
      Object.values(state.learningCandidateReviews || {}).filter(
        (entry) => entry.learningCandidateId === candidate.id,
      ),
    )) {
      const reviewNode = addNode({
        sourceId: review.id,
        kind: 'learning-review',
        stage: 'learning',
        label: 'Learning review',
        status: review.decision,
        importance: 'evidence',
        rank: 81,
        createdAt: review.createdAt,
      });
      addEdge('reviewed-by', candidateNode, reviewNode, [candidate.id, review.id]);
    }

    for (const memoryItem of sortedRecords(
      Object.values(state.memoryItems || {}).filter(
        (entry) => entry.sourceLearningCandidateId === candidate.id,
      ),
    )) {
      const memoryNode = addNode({
        sourceId: memoryItem.id,
        kind: 'memory-item',
        stage: 'learning',
        label: 'MemoryItem',
        status: recordStatus(memoryItem, 'stored'),
        importance: 'evidence',
        rank: 82,
        createdAt: memoryItem.createdAt,
      });
      addEdge('stored-as', candidateNode, memoryNode, [candidate.id, memoryItem.id]);

      for (const recall of sortedRecords(
        Object.values(state.memoryRecalls || {}).filter(
          (entry) => entry.sourceMemoryItemId === memoryItem.id,
        ),
      )) {
        const recallNode = addNode({
          sourceId: recall.id,
          kind: 'memory-recall',
          stage: 'learning',
          label: 'MemoryRecall',
          status: recordStatus(recall, 'recorded'),
          importance: 'evidence',
          rank: 83,
          createdAt: recall.createdAt,
        });
        addEdge('recalled-as', memoryNode, recallNode, [memoryItem.id, recall.id]);
      }
    }
  }

  const orderedCandidates = [...nodeCandidates.values()].sort((left, right) =>
    left.rank - right.rank ||
    STAGE_ORDER.indexOf(left.stage) - STAGE_ORDER.indexOf(right.stage) ||
    String(left.createdAt || '').localeCompare(String(right.createdAt || '')) ||
    left.id.localeCompare(right.id));
  const selectedCandidates = orderedCandidates.slice(0, MAX_GRAPH_NODES);
  const selectedIds = new Set(selectedCandidates.map((node) => node.id));
  const nodes = selectedCandidates.map(({ rank, ...node }) => node);
  const edges = edgeCandidates
    .filter((edge) => selectedIds.has(edge.from) && selectedIds.has(edge.to))
    .sort((left, right) =>
      left.from.localeCompare(right.from) ||
      left.to.localeCompare(right.to) ||
      left.kind.localeCompare(right.kind) ||
      left.sourceRefs.join('|').localeCompare(right.sourceRefs.join('|')))
    .filter((edge, index, all) =>
      index === 0 || JSON.stringify(edge) !== JSON.stringify(all[index - 1]))
    .map((edge) => ({
      id: `edge-${digestJson(edge).slice(0, 16)}`,
      ...edge,
    }));
  const digestSource = {
    schemaVersion: GRAPH_SCHEMA_VERSION,
    projectId: mission.projectId,
    missionId: mission.id,
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
  MAX_GRAPH_NODES,
  STAGE_ORDER,
  buildMissionEvidenceGraph,
};
