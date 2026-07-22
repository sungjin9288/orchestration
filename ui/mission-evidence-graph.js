import { escapeHtml } from './formatters.js';

export const MISSION_GRAPH_STAGES = Object.freeze([
  { id: 'mission', label: 'Mission' },
  { id: 'council', label: 'Council' },
  { id: 'execution', label: 'Execution' },
  { id: 'verification', label: 'Verification' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'learning', label: 'Learning' },
]);

export const MISSION_GRAPH_STATUS_TONES = Object.freeze([
  { id: 'success', label: '완료 / 승인' },
  { id: 'warning', label: '대기 / 검토' },
  { id: 'danger', label: '차단 / 실패' },
  { id: 'neutral', label: '기타' },
]);

const GRAPH_WIDTH = 1060;
const MIN_GRAPH_HEIGHT = 220;
const STAGE_LEFT = 80;
const STAGE_GAP = 180;
const NODE_ROW_GAP = 52;
const MAX_QUERY_LENGTH = 120;
const STAGE_IDS = new Set(MISSION_GRAPH_STAGES.map((stage) => stage.id));
const STATUS_TONE_IDS = new Set(MISSION_GRAPH_STATUS_TONES.map((tone) => tone.id));

export function getMissionGraphStatusTone(status) {
  const normalized = String(status || '').toLowerCase();

  if (/failed|blocked|rejected|cancelled|expired|changes-requested/.test(normalized)) {
    return 'danger';
  }
  if (/pending|waiting|review|required|draft|inbox|aligning/.test(normalized)) {
    return 'warning';
  }
  if (/accepted|approved|completed|done|passed|ready|stored|recorded|retained/.test(normalized)) {
    return 'success';
  }
  return 'neutral';
}

function normalizeExplorerState(options) {
  const query = String(options.query || '').trim().slice(0, MAX_QUERY_LENGTH);
  const stage = STAGE_IDS.has(options.stage) ? options.stage : 'all';
  const statusTone = STATUS_TONE_IDS.has(options.statusTone) ? options.statusTone : 'all';

  return {
    query,
    normalizedQuery: query.toLowerCase(),
    stage,
    statusTone,
    selectedNodeId: typeof options.selectedNodeId === 'string' ? options.selectedNodeId : null,
  };
}

function nodeMatchesQuery(node, normalizedQuery) {
  if (!normalizedQuery) return true;

  return [node.label, node.kind, node.status, node.stage, node.sourceRef]
    .some((value) => String(value || '').toLowerCase().includes(normalizedQuery));
}

function sortRelationships(left, right) {
  return (
    left.direction.localeCompare(right.direction) ||
    left.kind.localeCompare(right.kind) ||
    left.node.label.localeCompare(right.node.label) ||
    left.node.sourceRef.localeCompare(right.node.sourceRef)
  );
}

export function createMissionGraphExplorerView(graph, options = {}) {
  const explorer = normalizeExplorerState(options);
  const sourceNodes = Array.isArray(graph?.nodes) ? graph.nodes : [];
  const sourceEdges = Array.isArray(graph?.edges) ? graph.edges : [];
  const visibleNodes = sourceNodes.filter((node) => (
    (explorer.stage === 'all' || node.stage === explorer.stage) &&
    (explorer.statusTone === 'all' || getMissionGraphStatusTone(node.status) === explorer.statusTone) &&
    nodeMatchesQuery(node, explorer.normalizedQuery)
  ));
  const visibleNodeIds = new Set(visibleNodes.map((node) => node.id));
  const visibleEdges = sourceEdges.filter(
    (edge) => visibleNodeIds.has(edge.from) && visibleNodeIds.has(edge.to),
  );
  const selectedNode = visibleNodes.find((node) => node.id === explorer.selectedNodeId) || null;
  const focusedNodeIds = new Set(selectedNode ? [selectedNode.id] : []);

  if (selectedNode) {
    for (const edge of visibleEdges) {
      if (edge.from === selectedNode.id) focusedNodeIds.add(edge.to);
      if (edge.to === selectedNode.id) focusedNodeIds.add(edge.from);
    }
  }

  const visibleNodeById = new Map(visibleNodes.map((node) => [node.id, node]));
  const selectedRelationships = selectedNode
    ? visibleEdges
        .filter((edge) => edge.from === selectedNode.id || edge.to === selectedNode.id)
        .map((edge) => {
          const outgoing = edge.from === selectedNode.id;
          return {
            direction: outgoing ? 'outgoing' : 'incoming',
            kind: edge.kind,
            node: visibleNodeById.get(outgoing ? edge.to : edge.from),
            sourceRefs: [...edge.sourceRefs],
          };
        })
        .filter((relationship) => relationship.node)
        .sort(sortRelationships)
    : [];
  const visibleNodesByStage = new Map(
    MISSION_GRAPH_STAGES.map((stage) => [
      stage.id,
      visibleNodes.filter((node) => node.stage === stage.id),
    ]),
  );

  return {
    explorer: {
      query: explorer.query,
      stage: explorer.stage,
      statusTone: explorer.statusTone,
      selectedNodeId: selectedNode?.id || null,
    },
    visibleNodes,
    visibleEdges,
    visibleNodesByStage,
    selectedNode,
    selectedRelationships,
    focusedNodeIds,
    counts: {
      sourceNodes: sourceNodes.length,
      sourceEdges: sourceEdges.length,
      visibleNodes: visibleNodes.length,
      visibleEdges: visibleEdges.length,
    },
  };
}

function nodeRadius(importance) {
  if (importance === 'root') return 13;
  if (importance === 'major') return 10;
  if (importance === 'operational') return 8;
  return 6;
}

function shortLabel(value, maxLength = 16) {
  const text = String(value || 'Evidence');
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

function buildLayout(view) {
  const positionedNodes = new Map();
  let largestRowCount = 1;

  MISSION_GRAPH_STAGES.forEach((stage, stageIndex) => {
    const stageNodes = view.visibleNodesByStage.get(stage.id);
    const rowCount = Math.max(1, stageNodes.length);
    largestRowCount = Math.max(largestRowCount, rowCount);

    stageNodes.forEach((node, nodeIndex) => {
      positionedNodes.set(node.id, {
        ...node,
        x: STAGE_LEFT + stageIndex * STAGE_GAP,
        y: 88 + nodeIndex * NODE_ROW_GAP,
      });
    });
  });

  return {
    height: Math.max(MIN_GRAPH_HEIGHT, 140 + largestRowCount * NODE_ROW_GAP),
    positionedNodes,
  };
}

function renderEmptyState(message) {
  return `
    <section class="mission-evidence-graph mission-evidence-graph-empty" aria-live="polite">
      <strong>${escapeHtml(message)}</strong>
    </section>
  `;
}

function renderOption(value, label, selectedValue) {
  return `<option value="${escapeHtml(value)}" ${value === selectedValue ? 'selected' : ''}>${escapeHtml(label)}</option>`;
}

function renderExplorerControls(view) {
  const hasExplorerState = Boolean(
    view.explorer.query ||
    view.explorer.stage !== 'all' ||
    view.explorer.statusTone !== 'all' ||
    view.selectedNode,
  );

  return `
    <form class="mission-graph-explorer" data-form="mission-graph-explorer">
      <label class="mission-graph-search">
        <span>Evidence 검색</span>
        <input
          type="search"
          name="missionGraphQuery"
          value="${escapeHtml(view.explorer.query)}"
          maxlength="${MAX_QUERY_LENGTH}"
          placeholder="label, status, source ref"
          autocomplete="off"
        />
      </label>
      <label>
        <span>Lifecycle</span>
        <select name="missionGraphStage">
          ${renderOption('all', '전체 단계', view.explorer.stage)}
          ${MISSION_GRAPH_STAGES.map((stage) => renderOption(stage.id, stage.label, view.explorer.stage)).join('')}
        </select>
      </label>
      <label>
        <span>Status</span>
        <select name="missionGraphStatusTone">
          ${renderOption('all', '전체 상태', view.explorer.statusTone)}
          ${MISSION_GRAPH_STATUS_TONES.map((tone) => renderOption(tone.id, tone.label, view.explorer.statusTone)).join('')}
        </select>
      </label>
      <div class="mission-graph-explorer-actions">
        <button type="submit" class="secondary-button">검색 적용</button>
        <button
          type="button"
          class="secondary-button mission-graph-reset-button"
          data-action="clear-mission-graph-explorer"
          ${hasExplorerState ? '' : 'disabled'}
        >초기화</button>
      </div>
    </form>
    <p class="mission-graph-result-count" aria-live="polite">
      ${view.counts.visibleNodes}개 node · ${view.counts.visibleEdges}개 관계 표시
    </p>
  `;
}

function renderSemanticFallback(view) {
  return `
    <details class="mission-evidence-graph-fallback" open>
      <summary>Evidence 목록으로 보기</summary>
      <div class="mission-evidence-graph-fallback-body">
        ${MISSION_GRAPH_STAGES.map((stage) => {
          const nodes = view.visibleNodesByStage.get(stage.id) || [];
          return `
            <section class="mission-evidence-graph-fallback-stage ${nodes.length === 0 ? 'is-empty' : ''}">
              <h4>${escapeHtml(stage.label)} <span>${nodes.length}</span></h4>
              ${
                nodes.length > 0
                  ? `<ul>${nodes
                      .map((node) => {
                        const selected = node.id === view.selectedNode?.id;
                        return `
                          <li>
                            <button
                              type="button"
                              data-action="select-mission-graph-node"
                              data-node-id="${escapeHtml(node.id)}"
                              aria-pressed="${selected}"
                              class="${selected ? 'is-selected' : ''}"
                            >
                              <strong>${escapeHtml(node.label)}</strong>
                              <span>${escapeHtml(node.kind)} · ${escapeHtml(node.status)} · ${escapeHtml(node.sourceRef)}</span>
                            </button>
                          </li>
                        `;
                      })
                      .join('')}</ul>`
                  : '<p>표시할 evidence가 없습니다.</p>'
              }
            </section>
          `;
        }).join('')}
        <p class="mission-evidence-graph-edge-count">표시된 관계 ${escapeHtml(String(view.counts.visibleEdges))}개</p>
      </div>
    </details>
  `;
}

function renderNodeDetail(view) {
  if (!view.selectedNode) {
    return `
      <section class="mission-graph-detail" aria-live="polite">
        <p>노드를 선택하면 source와 직접 연결된 관계를 확인할 수 있습니다.</p>
      </section>
    `;
  }

  const node = view.selectedNode;
  return `
    <section class="mission-graph-detail" aria-live="polite" aria-labelledby="mission-graph-detail-title">
      <div class="mission-graph-detail-heading">
        <div>
          <p>${escapeHtml(node.stage)} · ${escapeHtml(node.kind)}</p>
          <h4 id="mission-graph-detail-title">${escapeHtml(node.label)}</h4>
        </div>
        <span>${escapeHtml(node.status)}</span>
      </div>
      <dl>
        <div><dt>Source</dt><dd>${escapeHtml(node.sourceRef)}</dd></div>
        <div><dt>Importance</dt><dd>${escapeHtml(node.importance)}</dd></div>
        ${node.createdAt ? `<div><dt>Created</dt><dd>${escapeHtml(node.createdAt)}</dd></div>` : ''}
      </dl>
      <div class="mission-graph-relationships">
        <h5>직접 연결 ${view.selectedRelationships.length}</h5>
        ${
          view.selectedRelationships.length > 0
            ? `<ul>${view.selectedRelationships.map((relationship) => `
                <li>
                  <span>${relationship.direction === 'outgoing' ? 'Outgoing' : 'Incoming'} · ${escapeHtml(relationship.kind)}</span>
                  <strong>${escapeHtml(relationship.node.label)}</strong>
                  <code>${escapeHtml(relationship.sourceRefs.join(' · '))}</code>
                </li>
              `).join('')}</ul>`
            : '<p>현재 필터 안에서 직접 연결된 관계가 없습니다.</p>'
        }
      </div>
    </section>
  `;
}

export function renderMissionEvidenceGraph(graph, options = {}) {
  if (options.loading) return renderEmptyState('Evidence graph를 읽는 중입니다.');
  if (options.error) return renderEmptyState(options.error);
  if (!graph) return renderEmptyState('선택한 미션의 graph를 불러오지 않았습니다.');

  const view = createMissionGraphExplorerView(graph, options);
  const { height, positionedNodes } = buildLayout(view);
  const truncatedCopy = graph.truncated
    ? ` · ${graph.counts.excludedNodes}개 제외됨`
    : '';

  return `
    <section class="mission-evidence-graph" aria-labelledby="mission-evidence-graph-title">
      <div class="mission-evidence-graph-heading">
        <div>
          <p>Evidence graph</p>
          <h3 id="mission-evidence-graph-title">미션 증빙 흐름</h3>
        </div>
        <span>${escapeHtml(String(graph.counts.projectedNodes))}/${escapeHtml(String(graph.maxNodes))} nodes${escapeHtml(truncatedCopy)}</span>
      </div>
      ${renderExplorerControls(view)}
      <div class="mission-evidence-graph-legend" aria-label="그래프 범례">
        <span><i class="graph-legend-root" aria-hidden="true"></i>Mission</span>
        <span><i class="graph-legend-major" aria-hidden="true"></i>Gate / package</span>
        <span><i class="graph-legend-evidence" aria-hidden="true"></i>Evidence</span>
        <span>Read-only projection</span>
      </div>
      <div class="mission-evidence-graph-viewport" tabindex="0" aria-label="미션 evidence graph 스크롤 영역">
        ${view.visibleNodes.length === 0 ? '<p class="mission-graph-no-results">검색 조건에 맞는 evidence가 없습니다.</p>' : ''}
        <svg
          class="mission-evidence-graph-svg"
          viewBox="0 0 ${GRAPH_WIDTH} ${height}"
          role="group"
          aria-label="${escapeHtml(graph.missionId)} evidence graph"
        >
          ${MISSION_GRAPH_STAGES.map(
            (stage, stageIndex) => `
              <g class="graph-stage graph-stage-${escapeHtml(stage.id)}">
                <text class="graph-stage-label" x="${STAGE_LEFT + stageIndex * STAGE_GAP}" y="30" text-anchor="middle">${escapeHtml(stage.label)}</text>
                <line x1="${STAGE_LEFT + stageIndex * STAGE_GAP}" y1="48" x2="${STAGE_LEFT + stageIndex * STAGE_GAP}" y2="${height - 20}"></line>
              </g>
            `,
          ).join('')}
          <g class="graph-edges" aria-hidden="true">
            ${view.visibleEdges.map((edge) => {
              const from = positionedNodes.get(edge.from);
              const to = positionedNodes.get(edge.to);
              const dimmed = view.selectedNode && edge.from !== view.selectedNode.id && edge.to !== view.selectedNode.id;
              return `<line class="${dimmed ? 'is-dimmed' : ''}" x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"><title>${escapeHtml(edge.kind)}</title></line>`;
            }).join('')}
          </g>
          <g class="graph-nodes">
            ${[...positionedNodes.values()].map((node) => {
              const tone = getMissionGraphStatusTone(node.status);
              const radius = nodeRadius(node.importance);
              const selected = node.id === view.selectedNode?.id;
              const dimmed = view.selectedNode && !view.focusedNodeIds.has(node.id);
              const showLabel = selected || node.importance === 'root' || node.importance === 'major';
              const accessibleLabel = `${node.label}, ${node.kind}, ${node.status}, source ${node.sourceRef}`;
              return `
                <g
                  class="graph-node graph-node-${escapeHtml(node.stage)} graph-node-${escapeHtml(node.importance)} graph-node-status-${tone} ${selected ? 'is-selected' : ''} ${dimmed ? 'is-dimmed' : ''}"
                  transform="translate(${node.x} ${node.y})"
                  tabindex="0"
                  role="button"
                  aria-pressed="${selected}"
                  aria-label="${escapeHtml(accessibleLabel)}"
                  data-action="select-mission-graph-node"
                  data-node-id="${escapeHtml(node.id)}"
                >
                  <title>${escapeHtml(accessibleLabel)}</title>
                  <circle r="${radius}"></circle>
                  ${showLabel ? `<text x="0" y="${radius + 15}" text-anchor="middle">${escapeHtml(shortLabel(node.label))}</text>` : ''}
                </g>
              `;
            }).join('')}
          </g>
        </svg>
      </div>
      ${renderSemanticFallback(view)}
      ${renderNodeDetail(view)}
      <p class="mission-evidence-graph-footnote">Source digest ${escapeHtml(graph.sourceDigest.slice(0, 12))} · exact GET · state write 없음</p>
    </section>
  `;
}
