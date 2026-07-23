import { escapeHtml } from './formatters.js';

export const EXECUTION_PROVENANCE_LANES = Object.freeze([
  { id: 'context', label: 'Context' },
  { id: 'plan', label: 'Plan' },
  { id: 'build', label: 'Build' },
  { id: 'verify', label: 'Verify' },
  { id: 'deliver', label: 'Deliver' },
  { id: 'close', label: 'Close' },
]);

export const EXECUTION_PROVENANCE_STATUS_TONES = Object.freeze([
  { id: 'success', label: '완료 / 승인' },
  { id: 'warning', label: '대기 / 검토' },
  { id: 'danger', label: '차단 / 실패' },
  { id: 'neutral', label: '기타' },
]);

const GRAPH_WIDTH = 1040;
const MIN_GRAPH_HEIGHT = 220;
const LANE_LEFT = 72;
const LANE_GAP = 172;
const NODE_ROW_GAP = 50;
const MAX_QUERY_LENGTH = 120;
const LANE_IDS = new Set(EXECUTION_PROVENANCE_LANES.map((lane) => lane.id));
const STATUS_TONE_IDS = new Set(
  EXECUTION_PROVENANCE_STATUS_TONES.map((tone) => tone.id),
);

export function getExecutionProvenanceStatusTone(status) {
  const value = String(status || '').toLowerCase();

  if (/failed|blocked|rejected|cancelled|expired|changes-requested/.test(value)) {
    return 'danger';
  }
  if (/pending|waiting|review|required|draft|inbox|aligning/.test(value)) {
    return 'warning';
  }
  if (/accepted|approved|completed|done|passed|ready|stored|recorded|retained|observed/.test(value)) {
    return 'success';
  }
  return 'neutral';
}

function normalizeExplorer(options) {
  const query = String(options.query || '').trim().slice(0, MAX_QUERY_LENGTH);
  const lane = LANE_IDS.has(options.lane) ? options.lane : 'all';
  const statusTone = STATUS_TONE_IDS.has(options.statusTone)
    ? options.statusTone
    : 'all';

  return {
    query,
    normalizedQuery: query.toLowerCase(),
    lane,
    statusTone,
    selectedNodeId:
      typeof options.selectedNodeId === 'string' ? options.selectedNodeId : null,
  };
}

function nodeMatchesQuery(node, query) {
  if (!query) return true;

  return [
    node.label,
    node.kind,
    node.status,
    node.lane,
    ...(node.sourceRefs || []),
  ].some((value) => String(value || '').toLowerCase().includes(query));
}

export function createExecutionProvenanceView(graph, options = {}) {
  const explorer = normalizeExplorer(options);
  const sourceNodes = Array.isArray(graph?.nodes) ? graph.nodes : [];
  const sourceEdges = Array.isArray(graph?.edges) ? graph.edges : [];
  const visibleNodes = sourceNodes.filter((node) => (
    (explorer.lane === 'all' || node.lane === explorer.lane) &&
    (explorer.statusTone === 'all' ||
      getExecutionProvenanceStatusTone(node.status) === explorer.statusTone) &&
    nodeMatchesQuery(node, explorer.normalizedQuery)
  ));
  const visibleNodeIds = new Set(visibleNodes.map((node) => node.id));
  const visibleEdges = sourceEdges.filter(
    (edge) => visibleNodeIds.has(edge.from) && visibleNodeIds.has(edge.to),
  );
  const selectedNode =
    visibleNodes.find((node) => node.id === explorer.selectedNodeId) || null;
  const focusedNodeIds = new Set(selectedNode ? [selectedNode.id] : []);

  if (selectedNode) {
    for (const edge of visibleEdges) {
      if (edge.from === selectedNode.id) focusedNodeIds.add(edge.to);
      if (edge.to === selectedNode.id) focusedNodeIds.add(edge.from);
    }
  }

  const visibleNodeById = new Map(visibleNodes.map((node) => [node.id, node]));
  const relationships = selectedNode
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
        .sort((left, right) => (
          left.direction.localeCompare(right.direction) ||
          left.kind.localeCompare(right.kind) ||
          left.node.label.localeCompare(right.node.label)
        ))
    : [];

  return {
    explorer: {
      query: explorer.query,
      lane: explorer.lane,
      statusTone: explorer.statusTone,
      selectedNodeId: selectedNode?.id || null,
    },
    visibleNodes,
    visibleEdges,
    nodesByLane: new Map(
      EXECUTION_PROVENANCE_LANES.map((lane) => [
        lane.id,
        visibleNodes.filter((node) => node.lane === lane.id),
      ]),
    ),
    selectedNode,
    relationships,
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
  let largestLane = 1;

  EXECUTION_PROVENANCE_LANES.forEach((lane, laneIndex) => {
    const laneNodes = view.nodesByLane.get(lane.id);
    largestLane = Math.max(largestLane, laneNodes.length);

    laneNodes.forEach((node, nodeIndex) => {
      positionedNodes.set(node.id, {
        ...node,
        x: LANE_LEFT + laneIndex * LANE_GAP,
        y: 86 + nodeIndex * NODE_ROW_GAP,
      });
    });
  });

  return {
    height: Math.max(MIN_GRAPH_HEIGHT, 136 + largestLane * NODE_ROW_GAP),
    positionedNodes,
  };
}

function renderOption(value, label, selectedValue) {
  return `<option value="${escapeHtml(value)}" ${value === selectedValue ? 'selected' : ''}>${escapeHtml(label)}</option>`;
}

function renderControls(view) {
  const hasExplorerState = Boolean(
    view.explorer.query ||
    view.explorer.lane !== 'all' ||
    view.explorer.statusTone !== 'all' ||
    view.selectedNode,
  );

  return `
    <form class="execution-provenance-explorer" data-form="execution-provenance-explorer">
      <label class="execution-provenance-search">
        <span>근거 검색</span>
        <input
          type="search"
          name="executionProvenanceQuery"
          value="${escapeHtml(view.explorer.query)}"
          maxlength="${MAX_QUERY_LENGTH}"
          placeholder="label, status, source ref"
          autocomplete="off"
        />
      </label>
      <label>
        <span>단계</span>
        <select name="executionProvenanceLane">
          ${renderOption('all', '전체 단계', view.explorer.lane)}
          ${EXECUTION_PROVENANCE_LANES
            .map((lane) => renderOption(lane.id, lane.label, view.explorer.lane))
            .join('')}
        </select>
      </label>
      <label>
        <span>상태</span>
        <select name="executionProvenanceStatusTone">
          ${renderOption('all', '전체 상태', view.explorer.statusTone)}
          ${EXECUTION_PROVENANCE_STATUS_TONES
            .map((tone) => renderOption(tone.id, tone.label, view.explorer.statusTone))
            .join('')}
        </select>
      </label>
      <div class="execution-provenance-explorer-actions">
        <button type="submit" class="secondary-button">검색 적용</button>
        <button
          type="button"
          class="secondary-button"
          data-action="clear-execution-provenance-explorer"
          ${hasExplorerState ? '' : 'disabled'}
        >
          초기화
        </button>
      </div>
    </form>
  `;
}

function renderSvg(view) {
  const layout = buildLayout(view);
  const edges = view.visibleEdges
    .map((edge) => {
      const from = layout.positionedNodes.get(edge.from);
      const to = layout.positionedNodes.get(edge.to);
      if (!from || !to) return '';
      const dimmed = view.selectedNode &&
        (!view.focusedNodeIds.has(from.id) || !view.focusedNodeIds.has(to.id));
      const gate = edge.kind === 'gated-by' || edge.kind === 'reviewed-in';

      return `
        <line
          x1="${from.x}"
          y1="${from.y}"
          x2="${to.x}"
          y2="${to.y}"
          class="${dimmed ? 'is-dimmed ' : ''}${gate ? 'is-gate' : ''}"
        />
      `;
    })
    .join('');
  const nodes = [...layout.positionedNodes.values()]
    .map((node) => {
      const tone = getExecutionProvenanceStatusTone(node.status);
      const selected = view.selectedNode?.id === node.id;
      const dimmed = view.selectedNode && !view.focusedNodeIds.has(node.id);

      return `
        <g
          class="execution-provenance-node execution-provenance-node-${escapeHtml(node.lane)} execution-provenance-node-status-${tone}${selected ? ' is-selected' : ''}${dimmed ? ' is-dimmed' : ''}"
          role="button"
          tabindex="0"
          aria-pressed="${selected ? 'true' : 'false'}"
          aria-label="${escapeHtml(`${node.label}, ${node.status}, ${node.lane}`)}"
          data-action="select-execution-provenance-node"
          data-node-id="${escapeHtml(node.id)}"
          transform="translate(${node.x} ${node.y})"
        >
          <circle r="${nodeRadius(node.importance)}"></circle>
          <text x="17" y="4">${escapeHtml(shortLabel(node.label))}</text>
        </g>
      `;
    })
    .join('');

  return `
    <div
      class="execution-provenance-viewport"
      tabindex="0"
      aria-label="Task execution provenance graph"
    >
      ${view.visibleNodes.length === 0 ? '<p class="execution-provenance-no-results">조건에 맞는 근거가 없습니다.</p>' : ''}
      <svg
        class="execution-provenance-svg"
        viewBox="0 0 ${GRAPH_WIDTH} ${layout.height}"
        role="group"
        aria-label="Context에서 Close까지의 실행 근거 관계"
      >
        <g class="execution-provenance-lanes">
          ${EXECUTION_PROVENANCE_LANES.map((lane, index) => {
            const x = LANE_LEFT + index * LANE_GAP;
            return `
              <g>
                <line x1="${x}" y1="42" x2="${x}" y2="${layout.height - 24}"></line>
                <text x="${x}" y="25" text-anchor="middle">${escapeHtml(lane.label)}</text>
              </g>
            `;
          }).join('')}
        </g>
        <g class="execution-provenance-edges">${edges}</g>
        <g>${nodes}</g>
      </svg>
    </div>
  `;
}

function renderSemanticList(view) {
  return `
    <div class="execution-provenance-fallback" aria-label="Task execution provenance semantic list">
      ${EXECUTION_PROVENANCE_LANES.map((lane) => {
        const nodes = view.nodesByLane.get(lane.id);
        return `
          <section class="${nodes.length === 0 ? 'is-empty' : ''}">
            <h4>${escapeHtml(lane.label)} <span>${nodes.length}</span></h4>
            ${nodes.length === 0
              ? '<p>기록 없음</p>'
              : `<ul>${nodes.map((node) => `
                  <li>
                    <button
                      type="button"
                      class="${view.selectedNode?.id === node.id ? 'is-selected' : ''}"
                      data-action="select-execution-provenance-node"
                      data-node-id="${escapeHtml(node.id)}"
                      aria-pressed="${view.selectedNode?.id === node.id ? 'true' : 'false'}"
                    >
                      <strong>${escapeHtml(node.label)}</strong>
                      <span>${escapeHtml(`${node.kind} · ${node.status}`)}</span>
                    </button>
                  </li>
                `).join('')}</ul>`}
          </section>
        `;
      }).join('')}
    </div>
  `;
}

function renderSelectedDetail(view) {
  if (!view.selectedNode) {
    return `
      <section class="execution-provenance-detail" aria-live="polite">
        <p>노드를 선택하면 저장된 상태, source refs, 직접 연결된 근거를 확인할 수 있습니다.</p>
      </section>
    `;
  }

  const node = view.selectedNode;
  const relationships = view.relationships.length > 0
    ? `
      <ul>
        ${view.relationships.map((relationship) => `
          <li>
            <span>${relationship.direction === 'outgoing' ? 'outgoing' : 'incoming'} · ${escapeHtml(relationship.kind)}</span>
            <strong>${escapeHtml(relationship.node.label)}</strong>
            <code>${escapeHtml(relationship.sourceRefs.join(', '))}</code>
          </li>
        `).join('')}
      </ul>
    `
    : '<p>현재 필터 안에 직접 연결된 근거가 없습니다.</p>';

  return `
    <section class="execution-provenance-detail" aria-live="polite">
      <div class="execution-provenance-detail-heading">
        <div>
          <p>${escapeHtml(node.kind)}</p>
          <h4>${escapeHtml(node.label)}</h4>
        </div>
        <span>${escapeHtml(node.status)}</span>
      </div>
      <dl>
        <div><dt>Lane</dt><dd>${escapeHtml(node.lane)}</dd></div>
        <div><dt>Node ID</dt><dd>${escapeHtml(node.id)}</dd></div>
        <div><dt>Source refs</dt><dd>${escapeHtml((node.sourceRefs || []).join(', '))}</dd></div>
      </dl>
      <div class="execution-provenance-relationships">
        <h5>직접 연결</h5>
        ${relationships}
      </div>
    </section>
  `;
}

export function renderExecutionProvenanceGraph(graph, options = {}) {
  if (!graph) {
    return `
      <section class="execution-provenance-graph execution-provenance-empty" aria-live="polite">
        <strong>표시할 execution provenance가 없습니다.</strong>
      </section>
    `;
  }

  const view = createExecutionProvenanceView(graph, options);

  return `
    <section class="execution-provenance-graph">
      <div class="execution-provenance-heading">
        <div>
          <p>Read-only projection</p>
          <h3>Execution Provenance</h3>
        </div>
        <span>${graph.counts.projectedNodes} nodes · ${graph.counts.projectedEdges} edges</span>
      </div>
      ${renderControls(view)}
      <p class="execution-provenance-result-count">
        현재 ${view.counts.visibleNodes}/${view.counts.sourceNodes} nodes ·
        ${view.counts.visibleEdges}/${view.counts.sourceEdges} edges
      </p>
      ${renderSvg(view)}
      ${renderSemanticList(view)}
      ${renderSelectedDetail(view)}
      <p class="execution-provenance-footnote">
        exact GET · state write 없음 · source digest ${escapeHtml(graph.sourceDigest)}
        ${graph.truncated ? ` · ${graph.counts.excludedNodes} nodes 제외` : ''}
      </p>
    </section>
  `;
}
