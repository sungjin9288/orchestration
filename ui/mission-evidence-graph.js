import { escapeHtml } from './formatters.js';

export const MISSION_GRAPH_STAGES = Object.freeze([
  { id: 'mission', label: 'Mission' },
  { id: 'council', label: 'Council' },
  { id: 'execution', label: 'Execution' },
  { id: 'verification', label: 'Verification' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'learning', label: 'Learning' },
]);

const GRAPH_WIDTH = 1060;
const STAGE_LEFT = 80;
const STAGE_GAP = 180;
const NODE_ROW_GAP = 52;

function statusTone(status) {
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

function buildLayout(graph) {
  const nodesByStage = new Map(MISSION_GRAPH_STAGES.map((stage) => [stage.id, []]));

  for (const node of graph.nodes || []) {
    if (nodesByStage.has(node.stage)) nodesByStage.get(node.stage).push(node);
  }

  const positionedNodes = new Map();
  let largestRowCount = 1;

  MISSION_GRAPH_STAGES.forEach((stage, stageIndex) => {
    const stageNodes = nodesByStage.get(stage.id);
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
    height: Math.max(360, 140 + largestRowCount * NODE_ROW_GAP),
    nodesByStage,
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

function renderSemanticFallback(graph, nodesByStage) {
  return `
    <details class="mission-evidence-graph-fallback" open>
      <summary>Evidence 목록으로 보기</summary>
      <div class="mission-evidence-graph-fallback-body">
        ${MISSION_GRAPH_STAGES.map((stage) => {
          const nodes = nodesByStage.get(stage.id) || [];
          return `
            <section>
              <h4>${escapeHtml(stage.label)} <span>${nodes.length}</span></h4>
              ${
                nodes.length > 0
                  ? `<ul>${nodes
                      .map(
                        (node) => `
                          <li>
                            <strong>${escapeHtml(node.label)}</strong>
                            <span>${escapeHtml(node.kind)} · ${escapeHtml(node.status)} · ${escapeHtml(node.sourceRef)}</span>
                          </li>
                        `,
                      )
                      .join('')}</ul>`
                  : '<p>연결된 evidence가 없습니다.</p>'
              }
            </section>
          `;
        }).join('')}
        <p class="mission-evidence-graph-edge-count">관계 ${escapeHtml(String(graph.counts?.projectedEdges || 0))}개</p>
      </div>
    </details>
  `;
}

export function renderMissionEvidenceGraph(graph, options = {}) {
  if (options.loading) return renderEmptyState('Evidence graph를 읽는 중입니다.');
  if (options.error) return renderEmptyState(options.error);
  if (!graph) return renderEmptyState('선택한 미션의 graph를 불러오지 않았습니다.');

  const { height, nodesByStage, positionedNodes } = buildLayout(graph);
  const visibleEdges = (graph.edges || []).filter(
    (edge) => positionedNodes.has(edge.from) && positionedNodes.has(edge.to),
  );
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
      <div class="mission-evidence-graph-legend" aria-label="그래프 범례">
        <span><i class="graph-legend-root" aria-hidden="true"></i>Mission</span>
        <span><i class="graph-legend-major" aria-hidden="true"></i>Gate / package</span>
        <span><i class="graph-legend-evidence" aria-hidden="true"></i>Evidence</span>
        <span>Read-only projection</span>
      </div>
      <div class="mission-evidence-graph-viewport" tabindex="0" aria-label="미션 evidence graph 스크롤 영역">
        <svg
          class="mission-evidence-graph-svg"
          viewBox="0 0 ${GRAPH_WIDTH} ${height}"
          role="list"
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
            ${visibleEdges.map((edge) => {
              const from = positionedNodes.get(edge.from);
              const to = positionedNodes.get(edge.to);
              return `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"><title>${escapeHtml(edge.kind)}</title></line>`;
            }).join('')}
          </g>
          <g class="graph-nodes">
            ${[...positionedNodes.values()].map((node) => {
              const tone = statusTone(node.status);
              const radius = nodeRadius(node.importance);
              const showLabel = node.importance === 'root' || node.importance === 'major';
              const accessibleLabel = `${node.label}, ${node.kind}, ${node.status}, source ${node.sourceRef}`;
              return `
                <g
                  class="graph-node graph-node-${escapeHtml(node.stage)} graph-node-${escapeHtml(node.importance)} graph-node-status-${tone}"
                  transform="translate(${node.x} ${node.y})"
                  tabindex="0"
                  role="listitem"
                  aria-label="${escapeHtml(accessibleLabel)}"
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
      ${renderSemanticFallback(graph, nodesByStage)}
      <p class="mission-evidence-graph-footnote">Source digest ${escapeHtml(graph.sourceDigest.slice(0, 12))} · exact GET · state write 없음</p>
    </section>
  `;
}
