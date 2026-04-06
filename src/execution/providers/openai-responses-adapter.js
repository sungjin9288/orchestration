'use strict';

const fs = require('fs');
const path = require('path');

const { PROVIDER_READINESS } = require('../../runtime/contracts');

const DEFAULT_OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
const DEFAULT_TIMEOUT_MS = 120000;
const DEFAULT_MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY_MS = 1500;
const MAX_RETRY_DELAY_MS = 60000;
const LIVE_ROLE_LIMIT_REASON =
  'openai-responses live execution is limited to planner, architect, task-breaker, builder-preflight, builder-live-mutation, and reviewer in provider-slice-07';

const KNOWLEDGE_WORK_DELIVERABLE_SPECS = {
  checklist: {
    filePath: 'docs/checklist.md',
    outputLabel: 'operational checklist',
    sections: ['Objective', 'Checklist', 'Readiness Signals', 'Risks', 'Next Action', 'Trace'],
  },
  'decision-memo': {
    filePath: 'docs/decision-memo.md',
    outputLabel: 'decision memo',
    sections: ['Decision', 'Context', 'Recommendation', 'Options Considered', 'Risks and Assumptions', 'Open Questions', 'Next Action', 'Trace'],
  },
  'execution-plan': {
    filePath: 'docs/execution-plan.md',
    outputLabel: 'execution plan',
    sections: ['Outcome', 'Scope', 'Milestones', 'Workstreams', 'Dependencies', 'Risks', 'Next Action', 'Trace'],
  },
  prd: {
    filePath: 'docs/prd.md',
    outputLabel: 'product requirements document',
    sections: ['Problem', 'User', 'Goals', 'Non-Goals', 'Requirements', 'Acceptance Signals', 'Open Questions', 'Trace'],
  },
  'research-brief': {
    filePath: 'docs/research-brief.md',
    outputLabel: 'research brief',
    sections: ['Research Question', 'Current Context', 'Findings', 'Implications', 'Unknowns', 'Next Action', 'Trace'],
  },
};

function isKnowledgeWorkPack(request) {
  return request?.project?.pack === 'knowledge-work';
}

function getKnowledgeWorkDeliverableSpec(request) {
  const deliverableType = sanitizeText(request?.task?.deliverableType) || 'decision-memo';

  return {
    deliverableType,
    ...(KNOWLEDGE_WORK_DELIVERABLE_SPECS[deliverableType] ||
      KNOWLEDGE_WORK_DELIVERABLE_SPECS['decision-memo']),
  };
}

function uniqueStringArray(values) {
  return [...new Set(sanitizeStringArray(values))];
}

function createStructuredResultSchema(allowedNextStages) {
  return {
    type: 'object',
    additionalProperties: false,
    required: [
      'blockers',
      'needsDecision',
      'nextStage',
      'summary',
      'decisionTitle',
      'decisionPrompt',
    ],
    properties: {
      blockers: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
      needsDecision: {
        type: 'boolean',
      },
      nextStage: {
        type: 'string',
        enum: allowedNextStages,
      },
      summary: {
        type: 'string',
      },
      decisionTitle: {
        type: 'string',
      },
      decisionPrompt: {
        type: 'string',
      },
    },
  };
}

function createPlannerStructuredOutputSchema() {
  return {
    type: 'object',
    additionalProperties: false,
    required: ['artifactMarkdown', 'normalizedResult'],
    properties: {
      artifactMarkdown: {
        type: 'string',
      },
      normalizedResult: createStructuredResultSchema(['architect', 'human gate']),
    },
  };
}

function createArchitectStructuredOutputSchema() {
  return {
    type: 'object',
    additionalProperties: false,
    required: ['anchor', 'artifact', 'normalizedResult'],
    properties: {
      anchor: {
        type: 'object',
        additionalProperties: false,
        required: [
          'projectId',
          'taskId',
          'planArtifactId',
          'planRunId',
          'sourceOfTruthPaths',
          'codeContextPaths',
        ],
        properties: {
          projectId: {
            type: 'string',
          },
          taskId: {
            type: 'string',
          },
          planArtifactId: {
            type: 'string',
          },
          planRunId: {
            type: 'string',
          },
          sourceOfTruthPaths: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'string',
            },
          },
          codeContextPaths: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'string',
            },
          },
        },
      },
      artifact: {
        type: 'object',
        additionalProperties: false,
        required: [
          'boundaryFit',
          'affectedComponentsOrContracts',
          'policyImpact',
          'decisionLogImpact',
          'approvedAssumptions',
          'noArchitectureChangeStatement',
          'blockingArchitectureIssues',
        ],
        properties: {
          boundaryFit: {
            type: 'string',
            enum: ['fit', 'human-gate-required'],
          },
          affectedComponentsOrContracts: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'string',
            },
          },
          policyImpact: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          decisionLogImpact: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          approvedAssumptions: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          noArchitectureChangeStatement: {
            type: 'string',
          },
          blockingArchitectureIssues: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },
      normalizedResult: createStructuredResultSchema(['task-breaker', 'human gate']),
    },
  };
}

function createTaskBreakerStructuredOutputSchema() {
  return {
    type: 'object',
    additionalProperties: false,
    required: ['anchor', 'artifact', 'normalizedResult'],
    properties: {
      anchor: {
        type: 'object',
        additionalProperties: false,
        required: [
          'projectId',
          'taskId',
          'planArtifactId',
          'planRunId',
          'architectureArtifactId',
          'architectureRunId',
          'sourceOfTruthPaths',
        ],
        properties: {
          projectId: {
            type: 'string',
          },
          taskId: {
            type: 'string',
          },
          planArtifactId: {
            type: 'string',
          },
          planRunId: {
            type: 'string',
          },
          architectureArtifactId: {
            type: 'string',
          },
          architectureRunId: {
            type: 'string',
          },
          sourceOfTruthPaths: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'string',
            },
          },
        },
      },
      artifact: {
        type: 'object',
        additionalProperties: false,
        required: [
          'orderedSubTasks',
          'checkpoints',
          'expectedArtifactsPerCheckpoint',
          'verificationCheckpoints',
          'reviewTriggerPoints',
          'stopAndEscalateConditions',
          'executionBoundarySummary',
        ],
        properties: {
          orderedSubTasks: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'string',
            },
          },
          checkpoints: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'string',
            },
          },
          expectedArtifactsPerCheckpoint: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'string',
            },
          },
          verificationCheckpoints: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'string',
            },
          },
          reviewTriggerPoints: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'string',
            },
          },
          stopAndEscalateConditions: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'string',
            },
          },
          executionBoundarySummary: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'string',
            },
          },
        },
      },
      normalizedResult: createStructuredResultSchema(['builder', 'human gate']),
    },
  };
}

function createBuilderPreflightStructuredOutputSchema() {
  return {
    type: 'object',
    additionalProperties: false,
    required: ['anchor', 'artifact', 'normalizedResult'],
    properties: {
      anchor: {
        type: 'object',
        additionalProperties: false,
        required: [
          'projectId',
          'taskId',
          'planArtifactId',
          'planRunId',
          'architectureArtifactId',
          'architectureRunId',
          'breakdownArtifactId',
          'breakdownRunId',
          'sourceOfTruthPaths',
          'architectureAllowlistPaths',
          'codeContextPaths',
        ],
        properties: {
          projectId: {
            type: 'string',
          },
          taskId: {
            type: 'string',
          },
          planArtifactId: {
            type: 'string',
          },
          planRunId: {
            type: 'string',
          },
          architectureArtifactId: {
            type: 'string',
          },
          architectureRunId: {
            type: 'string',
          },
          breakdownArtifactId: {
            type: 'string',
          },
          breakdownRunId: {
            type: 'string',
          },
          sourceOfTruthPaths: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'string',
            },
          },
          architectureAllowlistPaths: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'string',
            },
          },
          codeContextPaths: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'string',
            },
          },
        },
      },
      artifact: {
        type: 'object',
        additionalProperties: false,
        required: [
          'targetFiles',
          'intendedChanges',
          'risks',
          'verificationPlan',
          'reviewEvidenceExpectations',
          'escalationTriggers',
        ],
        properties: {
          targetFiles: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          intendedChanges: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          risks: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          verificationPlan: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          reviewEvidenceExpectations: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          escalationTriggers: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },
      normalizedResult: createStructuredResultSchema([
        'request-builder-live-mutation-approval',
        'architect',
        'task-breaker',
        'human gate',
      ]),
    },
  };
}

function createBuilderLiveMutationStructuredOutputSchema() {
  return {
    type: 'object',
    additionalProperties: false,
    required: ['anchor', 'artifact', 'normalizedResult'],
    properties: {
      anchor: {
        type: 'object',
        additionalProperties: false,
        required: [
          'projectId',
          'taskId',
          'planArtifactId',
          'planRunId',
          'architectureArtifactId',
          'architectureRunId',
          'breakdownArtifactId',
          'breakdownRunId',
          'preflightArtifactId',
          'preflightRunId',
          'approvalId',
          'approvalTargetArtifactId',
          'approvalTargetRunId',
          'sourceOfTruthPaths',
          'architectureAllowlistPaths',
          'targetFileAllowlistPaths',
          'codeContextPaths',
          'targetFileBaselineDigests',
        ],
        properties: {
          projectId: {
            type: 'string',
          },
          taskId: {
            type: 'string',
          },
          planArtifactId: {
            type: 'string',
          },
          planRunId: {
            type: 'string',
          },
          architectureArtifactId: {
            type: 'string',
          },
          architectureRunId: {
            type: 'string',
          },
          breakdownArtifactId: {
            type: 'string',
          },
          breakdownRunId: {
            type: 'string',
          },
          preflightArtifactId: {
            type: 'string',
          },
          preflightRunId: {
            type: 'string',
          },
          approvalId: {
            type: 'string',
          },
          approvalTargetArtifactId: {
            type: 'string',
          },
          approvalTargetRunId: {
            type: 'string',
          },
          sourceOfTruthPaths: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'string',
            },
          },
          architectureAllowlistPaths: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'string',
            },
          },
          targetFileAllowlistPaths: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'string',
            },
          },
          codeContextPaths: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'string',
            },
          },
          targetFileBaselineDigests: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['path', 'digest'],
              properties: {
                path: {
                  type: 'string',
                },
                digest: {
                  type: ['string', 'null'],
                },
              },
            },
          },
        },
      },
      artifact: {
        type: 'object',
        additionalProperties: false,
        required: ['changeSummary', 'targetFiles', 'fileUpdates', 'risks', 'verificationNotes'],
        properties: {
          changeSummary: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          targetFiles: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'string',
            },
          },
          fileUpdates: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['path', 'contentBase64'],
              properties: {
                path: {
                  type: 'string',
                },
                contentBase64: {
                  type: 'string',
                },
              },
            },
          },
          risks: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          verificationNotes: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },
      normalizedResult: createStructuredResultSchema(['reviewer', 'architect', 'human gate']),
    },
  };
}

function createKnowledgeWorkReviewerRubricSchema() {
  return {
    type: 'object',
    additionalProperties: false,
    required: [
      'deliverableType',
      'deliverablePath',
      'requiredSections',
      'deliverablePresent',
      'missingRequiredSections',
      'emptyRequiredSections',
      'explicitNextAction',
      'traceMarkerVerified',
      'checklistItemsPresent',
      'acceptanceSignalsExplicit',
    ],
    properties: {
      deliverableType: {
        type: 'string',
      },
      deliverablePath: {
        type: 'string',
      },
      requiredSections: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'string',
        },
      },
      deliverablePresent: {
        type: 'boolean',
      },
      missingRequiredSections: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
      emptyRequiredSections: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
      explicitNextAction: {
        type: 'boolean',
      },
      traceMarkerVerified: {
        type: 'boolean',
      },
      checklistItemsPresent: {
        type: 'boolean',
      },
      acceptanceSignalsExplicit: {
        type: 'boolean',
      },
    },
  };
}

function createReviewerStructuredOutputSchema(request) {
  const artifactRequired = [
    'verdict',
    'evidenceReviewed',
    'findings',
    'contractCompliance',
    'verificationEvidence',
    'acceptedRisks',
    'followUpGate',
  ];
  const artifactProperties = {
    verdict: {
      type: 'string',
      enum: ['pass', 'fail', 'changes_requested'],
    },
    evidenceReviewed: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'string',
      },
    },
    findings: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    contractCompliance: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'string',
      },
    },
    verificationEvidence: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'string',
      },
    },
    acceptedRisks: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    followUpGate: {
      type: 'object',
      additionalProperties: false,
      required: ['blockingIssue', 'decisionRequired'],
      properties: {
        blockingIssue: {
          type: 'boolean',
        },
        decisionRequired: {
          type: 'boolean',
        },
      },
    },
  };

  if (isKnowledgeWorkPack(request)) {
    artifactRequired.push('knowledgeWorkRubric');
    artifactProperties.knowledgeWorkRubric = createKnowledgeWorkReviewerRubricSchema();
  }

  return {
    type: 'object',
    additionalProperties: false,
    required: ['anchor', 'artifact', 'normalizedResult'],
    properties: {
      anchor: {
        type: 'object',
        additionalProperties: false,
        required: [
          'projectId',
          'taskId',
          'planArtifactId',
          'planRunId',
          'architectureArtifactId',
          'architectureRunId',
          'breakdownArtifactId',
          'breakdownRunId',
          'preflightArtifactId',
          'preflightRunId',
          'changeSummaryArtifactId',
          'changeSummaryRunId',
          'patchArtifactId',
          'patchRunId',
          'diffArtifactId',
          'diffRunId',
          'approvalId',
          'sourceBuilderRunId',
          'sourceOfTruthPaths',
          'changedFilePaths',
        ],
        properties: {
          projectId: {
            type: 'string',
          },
          taskId: {
            type: 'string',
          },
          planArtifactId: {
            type: 'string',
          },
          planRunId: {
            type: 'string',
          },
          architectureArtifactId: {
            type: 'string',
          },
          architectureRunId: {
            type: 'string',
          },
          breakdownArtifactId: {
            type: 'string',
          },
          breakdownRunId: {
            type: 'string',
          },
          preflightArtifactId: {
            type: 'string',
          },
          preflightRunId: {
            type: 'string',
          },
          changeSummaryArtifactId: {
            type: 'string',
          },
          changeSummaryRunId: {
            type: 'string',
          },
          patchArtifactId: {
            type: 'string',
          },
          patchRunId: {
            type: 'string',
          },
          diffArtifactId: {
            type: 'string',
          },
          diffRunId: {
            type: 'string',
          },
          approvalId: {
            type: 'string',
          },
          sourceBuilderRunId: {
            type: 'string',
          },
          sourceOfTruthPaths: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'string',
            },
          },
          changedFilePaths: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'string',
            },
          },
        },
      },
      artifact: {
        type: 'object',
        additionalProperties: false,
        required: artifactRequired,
        properties: artifactProperties,
      },
      normalizedResult: createStructuredResultSchema(['builder', 'architect', 'human gate']),
    },
  };
}

function sanitizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function sanitizeStringArray(values) {
  return Array.isArray(values) ? values.map((value) => sanitizeText(value)).filter(Boolean) : [];
}

function getReviewerVerdictSeverity(verdict) {
  const normalizedVerdict = sanitizeText(verdict);
  const severityByVerdict = {
    pass: 0,
    changes_requested: 1,
    fail: 2,
  };

  return Object.prototype.hasOwnProperty.call(severityByVerdict, normalizedVerdict)
    ? severityByVerdict[normalizedVerdict]
    : -1;
}

function buildKnowledgeWorkReviewFindings(rubric) {
  if (!rubric) {
    return [];
  }

  const findings = [];

  if (!rubric.deliverablePresent) {
    findings.push(`Expected deliverable file is missing at ${rubric.deliverablePath}.`);
  }

  findings.push(
    ...rubric.missingRequiredSections.map((section) => `Missing required section: ${section}.`),
  );
  findings.push(
    ...rubric.emptyRequiredSections.map((section) => `Required section is empty: ${section}.`),
  );

  if (!rubric.explicitNextAction) {
    findings.push('Next Action section must contain at least one explicit action item.');
  }

  if (!rubric.traceMarkerVerified) {
    findings.push(`Trace section must preserve the builder provenance marker for ${rubric.deliverablePath}.`);
  }

  if (rubric.deliverableType === 'checklist' && !rubric.checklistItemsPresent) {
    findings.push('Checklist section must contain at least one checklist item.');
  }

  if (rubric.deliverableType === 'prd' && !rubric.acceptanceSignalsExplicit) {
    findings.push('Acceptance Signals section must contain explicit acceptance bullets.');
  }

  return uniqueStringArray(findings);
}

function buildKnowledgeWorkVerificationEvidence(rubric) {
  if (!rubric) {
    return [];
  }

  return uniqueStringArray([
    `deliverable file reviewed: ${rubric.deliverablePath}`,
    `deliverable type reviewed: ${rubric.deliverableType}`,
    `expected section set reviewed: ${rubric.requiredSections.join(', ')}`,
    `deliverable file exists: ${rubric.deliverablePresent ? 'yes' : 'no'}`,
    `explicit next action verified: ${rubric.explicitNextAction ? 'yes' : 'no'}`,
    `trace marker verified: ${rubric.traceMarkerVerified ? 'yes' : 'no'}`,
    rubric.deliverableType === 'checklist'
      ? `checklist items present: ${rubric.checklistItemsPresent ? 'yes' : 'no'}`
      : '',
    rubric.deliverableType === 'prd'
      ? `acceptance signals explicit: ${rubric.acceptanceSignalsExplicit ? 'yes' : 'no'}`
      : '',
  ]);
}

function buildKnowledgeWorkContractComplianceLine(rubric) {
  if (!rubric) {
    return null;
  }

  return rubric.requiredVerdictSeverity === 0
    ? 'Required knowledge-work rubric checks passed for section coverage, explicit next action, and provenance trace.'
    : 'Knowledge-work rubric findings blocked handoff until missing structure or provenance issues are repaired.';
}

function renderKnowledgeWorkReviewerInputSection(request) {
  if (!isKnowledgeWorkPack(request)) {
    return '';
  }

  const deliverable = getKnowledgeWorkDeliverableSpec(request);
  const deliverablePath = request.project?.projectPath
    ? path.join(request.project.projectPath, deliverable.filePath)
    : null;
  const extraChecks = [
    'Missing deliverable files or missing Trace provenance markers are fatal reviewer failures.',
    'Missing or empty required sections must not pass review.',
  ];
  let deliverableSnapshot = '_deliverable file missing_';

  if (deliverablePath && fs.existsSync(deliverablePath)) {
    const content = fs.readFileSync(deliverablePath, 'utf8');
    deliverableSnapshot =
      content.length > 20000
        ? `${content.slice(0, 20000)}\n\n... [truncated after 20000 chars]`
        : content;
  }

  if (deliverable.deliverableType === 'checklist') {
    extraChecks.push('Checklist must contain at least one checkbox item.');
  }

  if (deliverable.deliverableType === 'prd') {
    extraChecks.push('Acceptance Signals must contain explicit acceptance bullets.');
  }

  if (deliverable.sections.includes('Next Action')) {
    extraChecks.push('Next Action must contain at least one explicit action item.');
  }

  return `
## Knowledge-Work Deliverable Contract
- deliverable type: ${deliverable.deliverableType}
- expected deliverable path: ${deliverable.filePath}
- expected deliverable label: ${deliverable.outputLabel}
- expected sections: ${deliverable.sections.join(', ')}

## Knowledge-Work Deliverable Snapshot
\`\`\`md
${deliverableSnapshot}
\`\`\`

## Knowledge-Work Reviewer Rubric
${renderList(extraChecks, 'none')}
`;
}

function renderFileSection(files, language = '') {
  if (!Array.isArray(files) || files.length === 0) {
    return 'No files provided.';
  }

  const fence = language ? language : '';

  return files
    .map(
      (file) => `### ${file.path}
\`\`\`${fence}
${file.content}
\`\`\``,
    )
    .join('\n\n');
}

function renderSourceOfTruthSection(sourceOfTruth) {
  return renderFileSection(sourceOfTruth, 'md');
}

function renderCodeContextSection(codeContext) {
  if (!Array.isArray(codeContext) || codeContext.length === 0) {
    return 'No code-context files provided.';
  }

  return codeContext
    .map(
      (file) => `### ${file.path}
\`\`\`
${file.content}
\`\`\``,
    )
    .join('\n\n');
}

function renderJsonFence(value) {
  return `\`\`\`json
${JSON.stringify(value, null, 2)}
\`\`\``;
}

function renderBase64FileUpdates(fileUpdates) {
  if (!Array.isArray(fileUpdates) || fileUpdates.length === 0) {
    return '_No file updates prepared._';
  }

  return fileUpdates
    .map(
      (fileUpdate) => `### ${fileUpdate.path}
\`\`\`base64
${Buffer.from(fileUpdate.content, 'utf8').toString('base64')}
\`\`\``,
    )
    .join('\n\n');
}

function renderBuilderLogsSection(builderLogs) {
  if (!Array.isArray(builderLogs) || builderLogs.length === 0) {
    return '- no builder logs provided';
  }

  return builderLogs
    .map((entry) => {
      const level = sanitizeText(entry?.level) || 'info';
      const message = sanitizeText(entry?.message) || '(empty log message)';
      return `- [${level}] ${message}`;
    })
    .join('\n');
}

function renderPlannerInput(request) {
  return `# Planner Execution Request

## Task
- id: ${request.task.id}
- title: ${request.task.title}
- intent: ${request.task.intent || 'none'}
- lifecycle state: ${request.task.lifecycleState || 'unknown'}

## Project
- id: ${request.project.id}
- name: ${request.project.name}
- project_path: ${request.project.projectPath}
- pack: ${request.project.pack}

## Routing Outcome
- classification: ${request.routingOutcome.classification || 'unspecified'}
- scope statement: ${request.routingOutcome.scopeStatement || 'none'}
- missing context: ${
    Array.isArray(request.routingOutcome.missingContext) && request.routingOutcome.missingContext.length > 0
      ? request.routingOutcome.missingContext.join(', ')
      : 'none'
  }
- decision note: ${request.routingOutcome.decisionNote || 'none'}

## Source Of Truth
${renderSourceOfTruthSection(request.sourceOfTruth)}
`;
}

function renderArchitectInput(request) {
  return `# Architect Execution Request

## Anchor
${renderJsonFence(request.anchor)}

## Task
- id: ${request.task.id}
- title: ${request.task.title}
- intent: ${request.task.intent || 'none'}
- lifecycle state: ${request.task.lifecycleState || 'unknown'}

## Project
- id: ${request.project.id}
- name: ${request.project.name}
- project_path: ${request.project.projectPath}
- pack: ${request.project.pack}

## Plan Artifact
- id: ${request.planArtifact.id}
- runId: ${request.anchor.planRunId}
\`\`\`md
${request.planArtifact.content}
\`\`\`

## Planner Run Summary
${renderJsonFence(request.plannerRunSummary || {})}

## Source Of Truth
${renderSourceOfTruthSection(request.sourceOfTruth)}

## Code Context
${renderCodeContextSection(request.codeContext)}
`;
}

function renderTaskBreakerInput(request) {
  return `# Task-Breaker Execution Request

## Anchor
${renderJsonFence(request.anchor)}

## Task
- id: ${request.task.id}
- title: ${request.task.title}
- intent: ${request.task.intent || 'none'}
- lifecycle state: ${request.task.lifecycleState || 'unknown'}

## Project
- id: ${request.project.id}
- name: ${request.project.name}
- project_path: ${request.project.projectPath}
- pack: ${request.project.pack}

## Plan Artifact
- id: ${request.planArtifact.id}
- runId: ${request.anchor.planRunId}
\`\`\`md
${request.planArtifact.content}
\`\`\`

## Architecture Artifact
- id: ${request.architectureArtifact.id}
- runId: ${request.anchor.architectureRunId}
\`\`\`md
${request.architectureArtifact.content}
\`\`\`

## Planner Run Summary
${renderJsonFence(request.plannerRunSummary || {})}

## Architect Run Summary
${renderJsonFence(request.architectRunSummary || {})}

## Source Of Truth
${renderSourceOfTruthSection(request.sourceOfTruth)}
`;
}

function renderBuilderPreflightInput(request) {
  return `# Builder Preflight Execution Request

## Anchor
${renderJsonFence(request.anchor)}

## Task
- id: ${request.task.id}
- title: ${request.task.title}
- intent: ${request.task.intent || 'none'}
- lifecycle state: ${request.task.lifecycleState || 'unknown'}

## Project
- id: ${request.project.id}
- name: ${request.project.name}
- project_path: ${request.project.projectPath}
- pack: ${request.project.pack}

## Plan Artifact
- id: ${request.planArtifact.id}
- runId: ${request.anchor.planRunId}
\`\`\`md
${request.planArtifact.content}
\`\`\`

## Architecture Artifact
- id: ${request.architectureArtifact.id}
- runId: ${request.anchor.architectureRunId}
\`\`\`md
${request.architectureArtifact.content}
\`\`\`

## Breakdown Artifact
- id: ${request.breakdownArtifact.id}
- runId: ${request.anchor.breakdownRunId}
\`\`\`md
${request.breakdownArtifact.content}
\`\`\`

## Planner Run Summary
${renderJsonFence(request.plannerRunSummary || {})}

## Architect Run Summary
${renderJsonFence(request.architectRunSummary || {})}

## Task-Breaker Run Summary
${renderJsonFence(request.taskBreakerRunSummary || {})}

## Source Of Truth
${renderSourceOfTruthSection(request.sourceOfTruth)}

## Code Context
  ${renderCodeContextSection(request.codeContext)}
  `;
}

function renderBuilderLiveMutationInput(request) {
  return `# Builder Live Mutation Execution Request

## Anchor
${renderJsonFence(request.anchor)}

## Task
- id: ${request.task.id}
- title: ${request.task.title}
- intent: ${request.task.intent || 'none'}
- lifecycle state: ${request.task.lifecycleState || 'unknown'}

## Project
- id: ${request.project.id}
- name: ${request.project.name}
- project_path: ${request.project.projectPath}
- pack: ${request.project.pack}

## Plan Artifact
- id: ${request.planArtifact.id}
- runId: ${request.anchor.planRunId}
\`\`\`md
${request.planArtifact.content}
\`\`\`

## Architecture Artifact
- id: ${request.architectureArtifact.id}
- runId: ${request.anchor.architectureRunId}
\`\`\`md
${request.architectureArtifact.content}
\`\`\`

## Breakdown Artifact
- id: ${request.breakdownArtifact.id}
- runId: ${request.anchor.breakdownRunId}
\`\`\`md
${request.breakdownArtifact.content}
\`\`\`

## Preflight Artifact
- id: ${request.preflightArtifact.id}
- runId: ${request.anchor.preflightRunId}
\`\`\`md
${request.preflightArtifact.content}
\`\`\`

## Approval
${renderJsonFence(request.approval || {})}

## Planner Run Summary
${renderJsonFence(request.plannerRunSummary || {})}

## Architect Run Summary
${renderJsonFence(request.architectRunSummary || {})}

## Task-Breaker Run Summary
${renderJsonFence(request.taskBreakerRunSummary || {})}

## Builder Preflight Run Summary
${renderJsonFence(request.preflightRunSummary || {})}

## Source Of Truth
${renderSourceOfTruthSection(request.sourceOfTruth)}

## Code Context
${renderCodeContextSection(request.codeContext)}
`;
}

function renderReviewerInput(request) {
  return `# Reviewer Execution Request

## Anchor
${renderJsonFence(request.anchor)}

## Task
- id: ${request.task.id}
- title: ${request.task.title}
- intent: ${request.task.intent || 'none'}
- lifecycle state: ${request.task.lifecycleState || 'unknown'}

## Project
- id: ${request.project.id}
- name: ${request.project.name}
- project_path: ${request.project.projectPath}
- pack: ${request.project.pack}

## Builder Run Summary
${renderJsonFence(request.builderRun?.summary || {})}

## Builder Approval
${renderJsonFence(request.approval || {})}

## Plan Artifact
- id: ${request.planArtifact.id}
- runId: ${request.anchor.planRunId}
\`\`\`md
${request.planArtifact.content}
\`\`\`

## Architecture Artifact
- id: ${request.architectureArtifact.id}
- runId: ${request.anchor.architectureRunId}
\`\`\`md
${request.architectureArtifact.content}
\`\`\`

## Breakdown Artifact
- id: ${request.breakdownArtifact.id}
- runId: ${request.anchor.breakdownRunId}
\`\`\`md
${request.breakdownArtifact.content}
\`\`\`

## Preflight Artifact
- id: ${request.preflightArtifact.id}
- runId: ${request.anchor.preflightRunId}
\`\`\`md
${request.preflightArtifact.content}
\`\`\`

## Change Summary Artifact
- id: ${request.changeSummaryArtifact.id}
- runId: ${request.anchor.changeSummaryRunId}
\`\`\`md
${request.changeSummaryArtifact.content}
\`\`\`

## Patch Artifact
- id: ${request.patchArtifact.id}
- runId: ${request.anchor.patchRunId}
\`\`\`
${request.patchArtifact.content}
\`\`\`

## Diff Artifact
- id: ${request.diffArtifact.id}
- runId: ${request.anchor.diffRunId}
\`\`\`
${request.diffArtifact.content}
\`\`\`

## Source Of Truth
${renderSourceOfTruthSection(request.sourceOfTruth)}

## Builder Logs
${renderBuilderLogsSection(request.builderLogs)}
${renderKnowledgeWorkReviewerInputSection(request)}
`;
}

function buildPlannerInstructions(request) {
  return `${request.promptContract?.content || ''}

Return JSON only.
- artifactMarkdown must be the full markdown plan artifact that satisfies the planner prompt contract.
- normalizedResult must describe blockers, decision state, nextStage, summary, decisionTitle, and decisionPrompt for that same plan.
- Do not include secrets, raw environment variable values, auth material, or provider-internal debugging output.`;
}

function buildArchitectInstructions(request) {
  return `${request.promptContract?.content || ''}

Return JSON only.
- anchor must echo the request anchor exactly, including projectId, taskId, planArtifactId, planRunId, sourceOfTruthPaths, and codeContextPaths.
- artifact must include boundaryFit, affectedComponentsOrContracts, policyImpact, decisionLogImpact, approvedAssumptions, noArchitectureChangeStatement, and blockingArchitectureIssues.
- affectedComponentsOrContracts must contain repo-relative paths only.
- normalizedResult must describe blockers, decision state, nextStage, summary, decisionTitle, and decisionPrompt for that same architecture output.
- normalizedResult.nextStage must be task-breaker or human gate only.
- Do not include secrets, raw environment variable values, auth material, or provider-internal debugging output.`;
}

function buildTaskBreakerInstructions(request) {
  return `${request.promptContract?.content || ''}

Return JSON only.
- anchor must echo the request anchor exactly, including projectId, taskId, planArtifactId, planRunId, architectureArtifactId, architectureRunId, and sourceOfTruthPaths.
- anchor.sourceOfTruthPaths must contain repo-relative paths only.
- artifact must include orderedSubTasks, checkpoints, expectedArtifactsPerCheckpoint, verificationCheckpoints, reviewTriggerPoints, stopAndEscalateConditions, and executionBoundarySummary.
- normalizedResult must describe blockers, decision state, nextStage, summary, decisionTitle, and decisionPrompt for that same breakdown output.
- normalizedResult.nextStage must be builder or human gate only.
- builder output is valid only when needsDecision=false, blockers=[], and artifact.orderedSubTasks is non-empty.
- human gate output is valid only when needsDecision=true and blockers is non-empty.
- Do not include secrets, raw environment variable values, auth material, or provider-internal debugging output.`;
}

function buildBuilderPreflightInstructions(request) {
  return `${request.promptContract?.content || ''}

Return JSON only.
- anchor must echo the request anchor exactly, including projectId, taskId, planArtifactId, planRunId, architectureArtifactId, architectureRunId, breakdownArtifactId, breakdownRunId, sourceOfTruthPaths, architectureAllowlistPaths, and codeContextPaths.
- all anchor path arrays must contain repo-relative paths only and must keep the exact request ordering.
- artifact must include targetFiles, intendedChanges, risks, verificationPlan, reviewEvidenceExpectations, and escalationTriggers.
- artifact.targetFiles must contain repo-relative paths only and must stay inside anchor.architectureAllowlistPaths.
- normalizedResult must describe blockers, decision state, nextStage, summary, decisionTitle, and decisionPrompt for that same preflight output.
- normalizedResult.nextStage must be request-builder-live-mutation-approval, architect, task-breaker, or human gate only.
- request-builder-live-mutation-approval is valid only when needsDecision=false, blockers=[], and artifact.targetFiles is non-empty.
- architect or task-breaker escalation is valid only when needsDecision=false and blockers is non-empty.
- human gate output is valid only when needsDecision=true and blockers is non-empty.
- Do not include free-form Input Summary markdown; the adapter renders Input Summary from the validated anchor and upstream artifacts.
  - Do not include secrets, raw environment variable values, auth material, or provider-internal debugging output.`;
}

function buildBuilderLiveMutationInstructions(request) {
  return `${request.promptContract?.content || ''}

Return JSON only.
- anchor must echo the request anchor exactly, including projectId, taskId, planArtifactId, planRunId, architectureArtifactId, architectureRunId, breakdownArtifactId, breakdownRunId, preflightArtifactId, preflightRunId, approvalId, approvalTargetArtifactId, approvalTargetRunId, sourceOfTruthPaths, architectureAllowlistPaths, targetFileAllowlistPaths, codeContextPaths, and targetFileBaselineDigests.
- approvalTargetArtifactId and approvalTargetRunId must exactly match preflightArtifactId and preflightRunId.
- all anchor path arrays must contain repo-relative paths only and must keep the exact request ordering.
- codeContextPaths must exactly match targetFileAllowlistPaths for this slice.
- targetFileBaselineDigests must keep the exact request ordering and digest values.
- targetFileBaselineDigests[].digest may be null only when the target file does not exist yet and the slice is creating a bounded knowledge-work deliverable.
- artifact must include changeSummary, targetFiles, fileUpdates, risks, and verificationNotes.
- artifact.changeSummary, artifact.risks, and artifact.verificationNotes must be arrays of strings.
- artifact.targetFiles must exactly match anchor.targetFileAllowlistPaths in the same order.
- artifact.fileUpdates[].path must be repo-relative, unique, non-empty, and a subset of anchor.targetFileAllowlistPaths.
- artifact.fileUpdates[].contentBase64 must be a base64-encoded UTF-8 string containing the full post-mutation file contents.
- normalizedResult must describe blockers, decision state, nextStage, summary, decisionTitle, and decisionPrompt for that same live-mutation output.
- normalizedResult.nextStage must be reviewer, architect, or human gate only.
- reviewer is valid only when needsDecision=false, blockers=[], and artifact.fileUpdates is non-empty.
- architect escalation is valid only when needsDecision=false and blockers is non-empty.
- human gate is valid only when needsDecision=true and blockers is non-empty.
- Do not include free-form patch or diff markdown; the coordinator derives patch and diff after validation and file write.
- Do not include secrets, raw environment variable values, auth material, or provider-internal debugging output.`;
}

function buildReviewerInstructions(request) {
  const knowledgeWorkDeliverable = isKnowledgeWorkPack(request)
    ? getKnowledgeWorkDeliverableSpec(request)
    : null;

  return `${request.promptContract?.content || ''}

Return JSON only.
- anchor must echo the request anchor exactly, including projectId, taskId, planArtifactId, planRunId, architectureArtifactId, architectureRunId, breakdownArtifactId, breakdownRunId, preflightArtifactId, preflightRunId, changeSummaryArtifactId, changeSummaryRunId, patchArtifactId, patchRunId, diffArtifactId, diffRunId, approvalId, sourceBuilderRunId, sourceOfTruthPaths, and changedFilePaths.
- all anchor path arrays must contain repo-relative paths only and must keep the exact request ordering.
- artifact must include verdict, evidenceReviewed, findings, contractCompliance, verificationEvidence, acceptedRisks, and followUpGate.
- artifact.verdict must be pass, fail, or changes_requested only.
- artifact.followUpGate must include blockingIssue and decisionRequired booleans.
- artifact.followUpGate.decisionRequired must exactly match normalizedResult.needsDecision.
- artifact.followUpGate.blockingIssue must be true only for a blocking human-gate decision handoff where normalizedResult.nextStage is human gate, normalizedResult.needsDecision is true, and normalizedResult.blockers is non-empty; otherwise artifact.followUpGate.blockingIssue must be false.
- normalizedResult must describe blockers, decision state, nextStage, summary, decisionTitle, and decisionPrompt for that same review output.
- normalizedResult.nextStage must be builder, architect, or human gate only.
- builder is valid only when artifact.verdict is fail or changes_requested, needsDecision=false, and blockers=[].
- architect is valid only when artifact.verdict is fail or changes_requested, needsDecision=false, and blockers is non-empty.
- human gate is valid only for pass-side follow-up or explicit policy/risk follow-up, and it must not auto-start commit-package.
- routing matrix must be followed exactly:
  - verdict=pass => normalizedResult.nextStage must be human gate.
  - verdict=fail or changes_requested with blockers=[] => normalizedResult.nextStage must be builder.
  - verdict=fail or changes_requested with blockers non-empty => normalizedResult.nextStage must be architect.
- never emit verdict=pass with normalizedResult.nextStage=builder or architect.
- never emit normalizedResult.nextStage=builder with blockers non-empty.
- a blocking review-sourced decision item may be created only when needsDecision=true and blockers is non-empty.
- ${
    knowledgeWorkDeliverable
      ? `Because project.pack is knowledge-work, artifact.knowledgeWorkRubric is required and must describe the actual deliverable review result for ${knowledgeWorkDeliverable.deliverableType} at ${knowledgeWorkDeliverable.filePath}.`
      : 'artifact.knowledgeWorkRubric is optional and should be omitted unless project.pack is knowledge-work.'
  }
- ${
    knowledgeWorkDeliverable
      ? `artifact.knowledgeWorkRubric.requiredSections must exactly match ${knowledgeWorkDeliverable.sections.join(', ')} in the same order.`
      : 'When omitted, artifact.knowledgeWorkRubric must not appear in the response.'
  }
- ${
    knowledgeWorkDeliverable
      ? 'artifact.knowledgeWorkRubric must include deliverablePresent, missingRequiredSections, emptyRequiredSections, explicitNextAction, traceMarkerVerified, checklistItemsPresent, and acceptanceSignalsExplicit booleans.'
      : 'Do not invent knowledge-work rubric fields for non-knowledge-work tasks.'
  }
- ${
    knowledgeWorkDeliverable
      ? 'If deliverablePresent is false or traceMarkerVerified is false, artifact.verdict must not be softer than fail.'
      : 'Keep reviewer verdict grounded in the supplied builder bundle evidence.'
  }
- ${
    knowledgeWorkDeliverable
      ? 'If any required section is missing or empty, if explicitNextAction is false, if checklistItemsPresent is false for checklist, or if acceptanceSignalsExplicit is false for prd, artifact.verdict must not be pass.'
      : 'Do not soften review findings into pass when correction is still required.'
  }
- ${
    knowledgeWorkDeliverable
      ? 'Do not use a pass-side human gate when knowledge-work rubric issues remain without an explicit decision requirement.'
      : 'Human gate remains for explicit decision or pass-side follow-up only.'
  }
- Do not include commit-package, local commit, release-package, close-out, or approval execution.
- Do not include secrets, raw environment variable values, auth material, or provider-internal debugging output.`;
}

function buildPlannerRequestBody(request, model) {
  return {
    model,
    instructions: buildPlannerInstructions(request),
    input: renderPlannerInput(request),
    text: {
      format: {
        type: 'json_schema',
        name: 'planner_artifact_response',
        strict: true,
        schema: createPlannerStructuredOutputSchema(),
      },
    },
  };
}

function buildArchitectRequestBody(request, model) {
  return {
    model,
    instructions: buildArchitectInstructions(request),
    input: renderArchitectInput(request),
    text: {
      format: {
        type: 'json_schema',
        name: 'architect_artifact_response',
        strict: true,
        schema: createArchitectStructuredOutputSchema(),
      },
    },
  };
}

function buildTaskBreakerRequestBody(request, model) {
  return {
    model,
    instructions: buildTaskBreakerInstructions(request),
    input: renderTaskBreakerInput(request),
    text: {
      format: {
        type: 'json_schema',
        name: 'task_breaker_artifact_response',
        strict: true,
        schema: createTaskBreakerStructuredOutputSchema(),
      },
    },
  };
}

function buildBuilderPreflightRequestBody(request, model) {
  return {
    model,
    instructions: buildBuilderPreflightInstructions(request),
    input: renderBuilderPreflightInput(request),
    text: {
      format: {
        type: 'json_schema',
        name: 'builder_preflight_artifact_response',
        strict: true,
        schema: createBuilderPreflightStructuredOutputSchema(),
      },
    },
  };
}

function buildBuilderLiveMutationRequestBody(request, model) {
  return {
    model,
    instructions: buildBuilderLiveMutationInstructions(request),
    input: renderBuilderLiveMutationInput(request),
    text: {
      format: {
        type: 'json_schema',
        name: 'builder_live_mutation_artifact_response',
        strict: true,
        schema: createBuilderLiveMutationStructuredOutputSchema(),
      },
    },
  };
}

function buildReviewerRequestBody(request, model) {
  return {
    model,
    temperature: 0,
    instructions: buildReviewerInstructions(request),
    input: renderReviewerInput(request),
    text: {
      format: {
        type: 'json_schema',
        name: 'reviewer_artifact_response',
        strict: true,
        schema: createReviewerStructuredOutputSchema(request),
      },
    },
  };
}

function extractOutputTextFromContent(payload) {
  const directOutputText = sanitizeText(payload?.output_text);

  if (directOutputText) {
    return directOutputText;
  }

  const segments = [];
  const outputItems = Array.isArray(payload?.output) ? payload.output : [];

  for (const item of outputItems) {
    if (!item || typeof item !== 'object') {
      continue;
    }

    const contentItems = Array.isArray(item.content) ? item.content : [];

    for (const contentItem of contentItems) {
      if (!contentItem || typeof contentItem !== 'object') {
        continue;
      }

      if (contentItem.type !== 'output_text') {
        continue;
      }

      const text = sanitizeText(contentItem.text);

      if (text) {
        segments.push(text);
      }
    }
  }

  return segments.join('\n\n').trim();
}

function parseStructuredOutputPayload(outputText) {
  let parsedPayload = null;

  try {
    parsedPayload = JSON.parse(outputText);
  } catch (_error) {
    throw new Error('OpenAI Responses structured output JSON is required');
  }

  if (!parsedPayload || typeof parsedPayload !== 'object' || Array.isArray(parsedPayload)) {
    throw new Error('OpenAI Responses structured output JSON is required');
  }

  return parsedPayload;
}

function normalizeStructuredPlannerPayload(outputText) {
  const parsedPayload = parseStructuredOutputPayload(outputText);

  const artifactMarkdown = sanitizeText(parsedPayload.artifactMarkdown);

  if (!artifactMarkdown) {
    throw new Error('OpenAI Responses structured output artifactMarkdown is required');
  }

  if (
    !parsedPayload.normalizedResult ||
    typeof parsedPayload.normalizedResult !== 'object' ||
    Array.isArray(parsedPayload.normalizedResult)
  ) {
    throw new Error('OpenAI Responses structured output normalizedResult is required');
  }

  return {
    artifactMarkdown,
    normalizedResult: normalizeStructuredResult(
      parsedPayload.normalizedResult,
      ['architect', 'human gate'],
      'planner',
    ),
  };
}

function normalizeStructuredResult(value, allowedNextStages, role) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('OpenAI Responses structured output normalizedResult is required');
  }

  if (!Array.isArray(value.blockers)) {
    throw new Error('OpenAI Responses structured output normalizedResult.blockers is required');
  }

  if (typeof value.needsDecision !== 'boolean') {
    throw new Error('OpenAI Responses structured output normalizedResult.needsDecision is required');
  }

  if (typeof value.summary !== 'string') {
    throw new Error('OpenAI Responses structured output normalizedResult.summary is required');
  }

  if (typeof value.decisionTitle !== 'string') {
    throw new Error('OpenAI Responses structured output normalizedResult.decisionTitle is required');
  }

  if (typeof value.decisionPrompt !== 'string') {
    throw new Error('OpenAI Responses structured output normalizedResult.decisionPrompt is required');
  }

  const nextStage = sanitizeText(value.nextStage);

  if (!allowedNextStages.includes(nextStage)) {
    throw new Error(`OpenAI Responses structured output nextStage is invalid for ${role} output`);
  }

  return {
    blockers: sanitizeStringArray(value.blockers),
    needsDecision: value.needsDecision,
    nextStage,
    summary: sanitizeText(value.summary),
    decisionTitle: sanitizeText(value.decisionTitle),
    decisionPrompt: sanitizeText(value.decisionPrompt),
  };
}

function normalizeRelativePath(value) {
  const normalized = String(value || '')
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\.\//, '');

  if (
    !normalized ||
    path.posix.isAbsolute(normalized) ||
    /^[A-Za-z]:\//.test(normalized) ||
    normalized === '..' ||
    normalized.startsWith('../') ||
    normalized.includes('/../')
  ) {
    return null;
  }

  return normalized;
}

function normalizeArchitectAnchor(anchor, label) {
  if (!anchor || typeof anchor !== 'object' || Array.isArray(anchor)) {
    throw new Error(`OpenAI Responses structured output ${label} is required`);
  }

  const normalizedAnchor = {
    projectId: sanitizeText(anchor.projectId),
    taskId: sanitizeText(anchor.taskId),
    planArtifactId: sanitizeText(anchor.planArtifactId),
    planRunId: sanitizeText(anchor.planRunId),
    sourceOfTruthPaths: sanitizeStringArray(anchor.sourceOfTruthPaths),
    codeContextPaths: sanitizeStringArray(anchor.codeContextPaths),
  };

  if (
    !normalizedAnchor.projectId ||
    !normalizedAnchor.taskId ||
    !normalizedAnchor.planArtifactId ||
    !normalizedAnchor.planRunId
  ) {
    throw new Error(`OpenAI Responses structured output ${label} is incomplete`);
  }

  if (
    normalizedAnchor.sourceOfTruthPaths.length === 0 ||
    normalizedAnchor.codeContextPaths.length === 0
  ) {
    throw new Error(`OpenAI Responses structured output ${label} is incomplete`);
  }

  return normalizedAnchor;
}

function normalizeTaskBreakerAnchor(anchor, label) {
  if (!anchor || typeof anchor !== 'object' || Array.isArray(anchor)) {
    throw new Error(`OpenAI Responses structured output ${label} is required`);
  }

  const sourceOfTruthPaths = sanitizeStringArray(anchor.sourceOfTruthPaths).map((value) => {
    const normalizedValue = normalizeRelativePath(value);

    if (!normalizedValue) {
      throw new Error(
        'OpenAI Responses structured output task-breaker anchor sourceOfTruthPaths must contain repo-relative paths only',
      );
    }

    return normalizedValue;
  });

  const normalizedAnchor = {
    projectId: sanitizeText(anchor.projectId),
    taskId: sanitizeText(anchor.taskId),
    planArtifactId: sanitizeText(anchor.planArtifactId),
    planRunId: sanitizeText(anchor.planRunId),
    architectureArtifactId: sanitizeText(anchor.architectureArtifactId),
    architectureRunId: sanitizeText(anchor.architectureRunId),
    sourceOfTruthPaths,
  };

  if (
    !normalizedAnchor.projectId ||
    !normalizedAnchor.taskId ||
    !normalizedAnchor.planArtifactId ||
    !normalizedAnchor.planRunId ||
    !normalizedAnchor.architectureArtifactId ||
    !normalizedAnchor.architectureRunId ||
    normalizedAnchor.sourceOfTruthPaths.length === 0
  ) {
    throw new Error(`OpenAI Responses structured output ${label} is incomplete`);
  }

  return normalizedAnchor;
}

function normalizeBuilderPreflightAnchor(anchor, label) {
  if (!anchor || typeof anchor !== 'object' || Array.isArray(anchor)) {
    throw new Error(`OpenAI Responses structured output ${label} is required`);
  }

  const normalizeRepoRelativePaths = (values, fieldName) =>
    sanitizeStringArray(values).map((value) => {
      const normalizedValue = normalizeRelativePath(value);

      if (!normalizedValue) {
        throw new Error(
          `OpenAI Responses structured output builder-preflight anchor ${fieldName} must contain repo-relative paths only`,
        );
      }

      return normalizedValue;
    });

  const normalizedAnchor = {
    projectId: sanitizeText(anchor.projectId),
    taskId: sanitizeText(anchor.taskId),
    planArtifactId: sanitizeText(anchor.planArtifactId),
    planRunId: sanitizeText(anchor.planRunId),
    architectureArtifactId: sanitizeText(anchor.architectureArtifactId),
    architectureRunId: sanitizeText(anchor.architectureRunId),
    breakdownArtifactId: sanitizeText(anchor.breakdownArtifactId),
    breakdownRunId: sanitizeText(anchor.breakdownRunId),
    sourceOfTruthPaths: normalizeRepoRelativePaths(anchor.sourceOfTruthPaths, 'sourceOfTruthPaths'),
    architectureAllowlistPaths: normalizeRepoRelativePaths(
      anchor.architectureAllowlistPaths,
      'architectureAllowlistPaths',
    ),
    codeContextPaths: normalizeRepoRelativePaths(anchor.codeContextPaths, 'codeContextPaths'),
  };

  if (
    !normalizedAnchor.projectId ||
    !normalizedAnchor.taskId ||
    !normalizedAnchor.planArtifactId ||
    !normalizedAnchor.planRunId ||
    !normalizedAnchor.architectureArtifactId ||
    !normalizedAnchor.architectureRunId ||
    !normalizedAnchor.breakdownArtifactId ||
    !normalizedAnchor.breakdownRunId ||
    normalizedAnchor.sourceOfTruthPaths.length === 0 ||
    normalizedAnchor.architectureAllowlistPaths.length === 0 ||
    normalizedAnchor.codeContextPaths.length === 0
  ) {
    throw new Error(`OpenAI Responses structured output ${label} is incomplete`);
  }

  return normalizedAnchor;
}

function normalizeBuilderLiveMutationDigestRecords(values, label) {
  if (!Array.isArray(values)) {
    throw new Error(`OpenAI Responses structured output ${label} is required`);
  }

  const normalizedDigests = values.map((value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error(`OpenAI Responses structured output ${label} entries must be objects`);
    }

    const relativePath = normalizeRelativePath(value.path);
    const rawDigest = value.digest === null ? null : sanitizeText(value.digest).toLowerCase();

    if (!relativePath) {
      throw new Error(
        `OpenAI Responses structured output ${label} path values must contain repo-relative paths only`,
      );
    }

    if (rawDigest !== null && !/^[a-f0-9]{64}$/.test(rawDigest)) {
      throw new Error(
        `OpenAI Responses structured output ${label} digest values must be lowercase sha256 hex strings or null for missing files`,
      );
    }

    return {
      path: relativePath,
      digest: rawDigest,
    };
  });

  const uniquePaths = new Set(normalizedDigests.map((value) => value.path));

  if (normalizedDigests.length === 0 || uniquePaths.size !== normalizedDigests.length) {
    throw new Error(`OpenAI Responses structured output ${label} must contain unique path entries`);
  }

  return normalizedDigests;
}

function normalizeBuilderLiveMutationAnchor(anchor, label) {
  if (!anchor || typeof anchor !== 'object' || Array.isArray(anchor)) {
    throw new Error(`OpenAI Responses structured output ${label} is required`);
  }

  const normalizeRepoRelativePaths = (values, fieldName) =>
    sanitizeStringArray(values).map((value) => {
      const normalizedValue = normalizeRelativePath(value);

      if (!normalizedValue) {
        throw new Error(
          `OpenAI Responses structured output builder-live-mutation anchor ${fieldName} must contain repo-relative paths only`,
        );
      }

      return normalizedValue;
    });

  const normalizedAnchor = {
    projectId: sanitizeText(anchor.projectId),
    taskId: sanitizeText(anchor.taskId),
    planArtifactId: sanitizeText(anchor.planArtifactId),
    planRunId: sanitizeText(anchor.planRunId),
    architectureArtifactId: sanitizeText(anchor.architectureArtifactId),
    architectureRunId: sanitizeText(anchor.architectureRunId),
    breakdownArtifactId: sanitizeText(anchor.breakdownArtifactId),
    breakdownRunId: sanitizeText(anchor.breakdownRunId),
    preflightArtifactId: sanitizeText(anchor.preflightArtifactId),
    preflightRunId: sanitizeText(anchor.preflightRunId),
    approvalId: sanitizeText(anchor.approvalId),
    approvalTargetArtifactId: sanitizeText(anchor.approvalTargetArtifactId),
    approvalTargetRunId: sanitizeText(anchor.approvalTargetRunId),
    sourceOfTruthPaths: normalizeRepoRelativePaths(anchor.sourceOfTruthPaths, 'sourceOfTruthPaths'),
    architectureAllowlistPaths: normalizeRepoRelativePaths(
      anchor.architectureAllowlistPaths,
      'architectureAllowlistPaths',
    ),
    targetFileAllowlistPaths: normalizeRepoRelativePaths(
      anchor.targetFileAllowlistPaths,
      'targetFileAllowlistPaths',
    ),
    codeContextPaths: normalizeRepoRelativePaths(anchor.codeContextPaths, 'codeContextPaths'),
    targetFileBaselineDigests: normalizeBuilderLiveMutationDigestRecords(
      anchor.targetFileBaselineDigests,
      'targetFileBaselineDigests',
    ),
  };

  if (
    !normalizedAnchor.projectId ||
    !normalizedAnchor.taskId ||
    !normalizedAnchor.planArtifactId ||
    !normalizedAnchor.planRunId ||
    !normalizedAnchor.architectureArtifactId ||
    !normalizedAnchor.architectureRunId ||
    !normalizedAnchor.breakdownArtifactId ||
    !normalizedAnchor.breakdownRunId ||
    !normalizedAnchor.preflightArtifactId ||
    !normalizedAnchor.preflightRunId ||
    !normalizedAnchor.approvalId ||
    !normalizedAnchor.approvalTargetArtifactId ||
    !normalizedAnchor.approvalTargetRunId ||
    normalizedAnchor.sourceOfTruthPaths.length === 0 ||
    normalizedAnchor.architectureAllowlistPaths.length === 0 ||
    normalizedAnchor.targetFileAllowlistPaths.length === 0 ||
    normalizedAnchor.codeContextPaths.length === 0 ||
    normalizedAnchor.targetFileBaselineDigests.length === 0
  ) {
    throw new Error(`OpenAI Responses structured output ${label} is incomplete`);
  }

  if (
    normalizedAnchor.approvalTargetArtifactId !== normalizedAnchor.preflightArtifactId ||
    normalizedAnchor.approvalTargetRunId !== normalizedAnchor.preflightRunId
  ) {
    throw new Error(
      'OpenAI Responses structured output builder-live-mutation anchor approvalTarget* must exactly match preflight*',
    );
  }

  if (
    !sameExactStringArrays(
      normalizedAnchor.targetFileAllowlistPaths,
      normalizedAnchor.codeContextPaths,
    )
  ) {
    throw new Error(
      'OpenAI Responses structured output builder-live-mutation anchor codeContextPaths must exactly match targetFileAllowlistPaths',
    );
  }

  if (
    !sameExactStringArrays(
      normalizedAnchor.targetFileAllowlistPaths,
      normalizedAnchor.targetFileBaselineDigests.map((value) => value.path),
    )
  ) {
    throw new Error(
      'OpenAI Responses structured output builder-live-mutation anchor targetFileBaselineDigests must exactly match targetFileAllowlistPaths',
    );
  }

  return normalizedAnchor;
}

function normalizeReviewerAnchor(anchor, label) {
  if (!anchor || typeof anchor !== 'object' || Array.isArray(anchor)) {
    throw new Error(`OpenAI Responses structured output ${label} is required`);
  }

  const normalizeRepoRelativePaths = (values, fieldName) =>
    sanitizeStringArray(values).map((value) => {
      const normalizedValue = normalizeRelativePath(value);

      if (!normalizedValue) {
        throw new Error(
          `OpenAI Responses structured output reviewer anchor ${fieldName} must contain repo-relative paths only`,
        );
      }

      return normalizedValue;
    });

  const normalizedAnchor = {
    projectId: sanitizeText(anchor.projectId),
    taskId: sanitizeText(anchor.taskId),
    planArtifactId: sanitizeText(anchor.planArtifactId),
    planRunId: sanitizeText(anchor.planRunId),
    architectureArtifactId: sanitizeText(anchor.architectureArtifactId),
    architectureRunId: sanitizeText(anchor.architectureRunId),
    breakdownArtifactId: sanitizeText(anchor.breakdownArtifactId),
    breakdownRunId: sanitizeText(anchor.breakdownRunId),
    preflightArtifactId: sanitizeText(anchor.preflightArtifactId),
    preflightRunId: sanitizeText(anchor.preflightRunId),
    changeSummaryArtifactId: sanitizeText(anchor.changeSummaryArtifactId),
    changeSummaryRunId: sanitizeText(anchor.changeSummaryRunId),
    patchArtifactId: sanitizeText(anchor.patchArtifactId),
    patchRunId: sanitizeText(anchor.patchRunId),
    diffArtifactId: sanitizeText(anchor.diffArtifactId),
    diffRunId: sanitizeText(anchor.diffRunId),
    approvalId: sanitizeText(anchor.approvalId),
    sourceBuilderRunId: sanitizeText(anchor.sourceBuilderRunId),
    sourceOfTruthPaths: normalizeRepoRelativePaths(anchor.sourceOfTruthPaths, 'sourceOfTruthPaths'),
    changedFilePaths: normalizeRepoRelativePaths(anchor.changedFilePaths, 'changedFilePaths'),
  };

  if (
    !normalizedAnchor.projectId ||
    !normalizedAnchor.taskId ||
    !normalizedAnchor.planArtifactId ||
    !normalizedAnchor.planRunId ||
    !normalizedAnchor.architectureArtifactId ||
    !normalizedAnchor.architectureRunId ||
    !normalizedAnchor.breakdownArtifactId ||
    !normalizedAnchor.breakdownRunId ||
    !normalizedAnchor.preflightArtifactId ||
    !normalizedAnchor.preflightRunId ||
    !normalizedAnchor.changeSummaryArtifactId ||
    !normalizedAnchor.changeSummaryRunId ||
    !normalizedAnchor.patchArtifactId ||
    !normalizedAnchor.patchRunId ||
    !normalizedAnchor.diffArtifactId ||
    !normalizedAnchor.diffRunId ||
    !normalizedAnchor.approvalId ||
    !normalizedAnchor.sourceBuilderRunId ||
    normalizedAnchor.sourceOfTruthPaths.length === 0 ||
    normalizedAnchor.changedFilePaths.length === 0
  ) {
    throw new Error(`OpenAI Responses structured output ${label} is incomplete`);
  }

  return normalizedAnchor;
}

function sameExactStringArrays(left, right) {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return false;
    }
  }

  return true;
}

function assertArchitectAnchorExactMatch(expected, actual) {
  if (
    expected.projectId !== actual.projectId ||
    expected.taskId !== actual.taskId ||
    expected.planArtifactId !== actual.planArtifactId ||
    expected.planRunId !== actual.planRunId ||
    !sameExactStringArrays(expected.sourceOfTruthPaths, actual.sourceOfTruthPaths) ||
    !sameExactStringArrays(expected.codeContextPaths, actual.codeContextPaths)
  ) {
    throw new Error('OpenAI Responses structured output anchor must exactly match the architect request anchor');
  }
}

function assertTaskBreakerAnchorExactMatch(expected, actual) {
  if (
    expected.projectId !== actual.projectId ||
    expected.taskId !== actual.taskId ||
    expected.planArtifactId !== actual.planArtifactId ||
    expected.planRunId !== actual.planRunId ||
    expected.architectureArtifactId !== actual.architectureArtifactId ||
    expected.architectureRunId !== actual.architectureRunId ||
    !sameExactStringArrays(expected.sourceOfTruthPaths, actual.sourceOfTruthPaths)
  ) {
    throw new Error(
      'OpenAI Responses structured output anchor must exactly match the task-breaker request anchor',
    );
  }
}

function assertBuilderPreflightAnchorExactMatch(expected, actual) {
  if (
    expected.projectId !== actual.projectId ||
    expected.taskId !== actual.taskId ||
    expected.planArtifactId !== actual.planArtifactId ||
    expected.planRunId !== actual.planRunId ||
    expected.architectureArtifactId !== actual.architectureArtifactId ||
    expected.architectureRunId !== actual.architectureRunId ||
    expected.breakdownArtifactId !== actual.breakdownArtifactId ||
    expected.breakdownRunId !== actual.breakdownRunId ||
    !sameExactStringArrays(expected.sourceOfTruthPaths, actual.sourceOfTruthPaths) ||
    !sameExactStringArrays(
      expected.architectureAllowlistPaths,
      actual.architectureAllowlistPaths,
    ) ||
    !sameExactStringArrays(expected.codeContextPaths, actual.codeContextPaths)
  ) {
    throw new Error(
      'OpenAI Responses structured output anchor must exactly match the builder-preflight request anchor',
    );
  }
}

function sameExactDigestEntries(left, right) {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    if (left[index].path !== right[index].path || left[index].digest !== right[index].digest) {
      return false;
    }
  }

  return true;
}

function assertBuilderLiveMutationAnchorExactMatch(expected, actual) {
  if (
    expected.projectId !== actual.projectId ||
    expected.taskId !== actual.taskId ||
    expected.planArtifactId !== actual.planArtifactId ||
    expected.planRunId !== actual.planRunId ||
    expected.architectureArtifactId !== actual.architectureArtifactId ||
    expected.architectureRunId !== actual.architectureRunId ||
    expected.breakdownArtifactId !== actual.breakdownArtifactId ||
    expected.breakdownRunId !== actual.breakdownRunId ||
    expected.preflightArtifactId !== actual.preflightArtifactId ||
    expected.preflightRunId !== actual.preflightRunId ||
    expected.approvalId !== actual.approvalId ||
    expected.approvalTargetArtifactId !== actual.approvalTargetArtifactId ||
    expected.approvalTargetRunId !== actual.approvalTargetRunId ||
    !sameExactStringArrays(expected.sourceOfTruthPaths, actual.sourceOfTruthPaths) ||
    !sameExactStringArrays(expected.architectureAllowlistPaths, actual.architectureAllowlistPaths) ||
    !sameExactStringArrays(expected.targetFileAllowlistPaths, actual.targetFileAllowlistPaths) ||
    !sameExactStringArrays(expected.codeContextPaths, actual.codeContextPaths) ||
    !sameExactDigestEntries(expected.targetFileBaselineDigests, actual.targetFileBaselineDigests)
  ) {
    throw new Error(
      'OpenAI Responses structured output anchor must exactly match the builder-live-mutation request anchor',
    );
  }
}

function assertReviewerAnchorExactMatch(expected, actual) {
  if (
    expected.projectId !== actual.projectId ||
    expected.taskId !== actual.taskId ||
    expected.planArtifactId !== actual.planArtifactId ||
    expected.planRunId !== actual.planRunId ||
    expected.architectureArtifactId !== actual.architectureArtifactId ||
    expected.architectureRunId !== actual.architectureRunId ||
    expected.breakdownArtifactId !== actual.breakdownArtifactId ||
    expected.breakdownRunId !== actual.breakdownRunId ||
    expected.preflightArtifactId !== actual.preflightArtifactId ||
    expected.preflightRunId !== actual.preflightRunId ||
    expected.changeSummaryArtifactId !== actual.changeSummaryArtifactId ||
    expected.changeSummaryRunId !== actual.changeSummaryRunId ||
    expected.patchArtifactId !== actual.patchArtifactId ||
    expected.patchRunId !== actual.patchRunId ||
    expected.diffArtifactId !== actual.diffArtifactId ||
    expected.diffRunId !== actual.diffRunId ||
    expected.approvalId !== actual.approvalId ||
    expected.sourceBuilderRunId !== actual.sourceBuilderRunId ||
    !sameExactStringArrays(expected.sourceOfTruthPaths, actual.sourceOfTruthPaths) ||
    !sameExactStringArrays(expected.changedFilePaths, actual.changedFilePaths)
  ) {
    throw new Error(
      'OpenAI Responses structured output anchor must exactly match the reviewer request anchor',
    );
  }
}

function normalizeArchitectArtifact(artifact) {
  if (!artifact || typeof artifact !== 'object' || Array.isArray(artifact)) {
    throw new Error('OpenAI Responses structured output artifact is required');
  }

  if (!Array.isArray(artifact.affectedComponentsOrContracts)) {
    throw new Error(
      'OpenAI Responses structured output artifact.affectedComponentsOrContracts is required',
    );
  }

  if (!Array.isArray(artifact.policyImpact)) {
    throw new Error('OpenAI Responses structured output artifact.policyImpact is required');
  }

  if (!Array.isArray(artifact.decisionLogImpact)) {
    throw new Error('OpenAI Responses structured output artifact.decisionLogImpact is required');
  }

  if (!Array.isArray(artifact.approvedAssumptions)) {
    throw new Error('OpenAI Responses structured output artifact.approvedAssumptions is required');
  }

  if (!Array.isArray(artifact.blockingArchitectureIssues)) {
    throw new Error(
      'OpenAI Responses structured output artifact.blockingArchitectureIssues is required',
    );
  }

  const affectedComponentsOrContracts = sanitizeStringArray(artifact.affectedComponentsOrContracts).map(
    (value) => {
      const normalizedValue = normalizeRelativePath(value);

      if (!normalizedValue) {
        throw new Error(
          'OpenAI Responses structured output affectedComponentsOrContracts must contain repo-relative paths only',
        );
      }

      return normalizedValue;
    },
  );

  if (affectedComponentsOrContracts.length === 0) {
    throw new Error(
      'OpenAI Responses structured output affectedComponentsOrContracts must contain at least one repo-relative path',
    );
  }

  const normalizedArtifact = {
    boundaryFit: sanitizeText(artifact.boundaryFit),
    affectedComponentsOrContracts,
    policyImpact: sanitizeStringArray(artifact.policyImpact),
    decisionLogImpact: sanitizeStringArray(artifact.decisionLogImpact),
    approvedAssumptions: sanitizeStringArray(artifact.approvedAssumptions),
    noArchitectureChangeStatement: sanitizeText(artifact.noArchitectureChangeStatement),
    blockingArchitectureIssues: sanitizeStringArray(artifact.blockingArchitectureIssues),
  };

  if (!['fit', 'human-gate-required'].includes(normalizedArtifact.boundaryFit)) {
    throw new Error('OpenAI Responses structured output boundaryFit is invalid for architect output');
  }

  if (!normalizedArtifact.noArchitectureChangeStatement) {
    throw new Error(
      'OpenAI Responses structured output noArchitectureChangeStatement is required',
    );
  }

  return normalizedArtifact;
}

function renderList(items, emptyValue) {
  if (!Array.isArray(items) || items.length === 0) {
    return `- ${emptyValue}`;
  }

  return items.map((item) => `- ${item}`).join('\n');
}

function getMarkdownSection(content, heading) {
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(
    `^## ${escapedHeading}\\n([\\s\\S]*?)(?=^## [^\\n]+\\n|(?![\\s\\S]))`,
    'm',
  );
  const match = String(content || '').match(pattern);

  return match ? match[1].trim() : '';
}

function parseMarkdownList(content, heading) {
  return getMarkdownSection(content, heading)
    .split('\n')
    .map((line) => line.replace(/^[-*]\s+/, '').trim())
    .filter(Boolean);
}

function renderArchitectArtifactMarkdown(request, anchor, artifact) {
  const sliceGoal = getMarkdownSection(request.planArtifact?.content, 'Slice Goal');
  const acceptanceTarget = getMarkdownSection(request.planArtifact?.content, 'Acceptance Target');
  const boundaryFitAssessment =
    artifact.boundaryFit === 'fit'
      ? 'The current plan fits the approved architecture boundary.'
      : 'The current plan requires a human gate before it may proceed downstream.';

  return `# Architecture Note: ${request.task.title}

## Boundary Fit Assessment
${boundaryFitAssessment}

## Affected Components or Contracts
${renderList(artifact.affectedComponentsOrContracts, 'none')}

## Policy Impact
${renderList(artifact.policyImpact, 'none')}

## Decision-Log Impact
${renderList(artifact.decisionLogImpact, 'none')}

## Approved Assumptions
${renderList(artifact.approvedAssumptions, 'none')}

## Planner Input Summary
- source artifact: ${anchor.planArtifactId}
- source run: ${anchor.planRunId}
- slice goal: ${sliceGoal || 'not stated'}
- acceptance target: ${acceptanceTarget || 'not stated'}

## No-Architecture-Change Statement
${artifact.noArchitectureChangeStatement}

## Blocking Architecture Issues
${renderList(artifact.blockingArchitectureIssues, 'none')}
`;
}

function normalizeTaskBreakerArtifact(artifact) {
  if (!artifact || typeof artifact !== 'object' || Array.isArray(artifact)) {
    throw new Error('OpenAI Responses structured output artifact is required');
  }

  const requiredArrayFields = [
    'orderedSubTasks',
    'checkpoints',
    'expectedArtifactsPerCheckpoint',
    'verificationCheckpoints',
    'reviewTriggerPoints',
    'stopAndEscalateConditions',
    'executionBoundarySummary',
  ];

  for (const field of requiredArrayFields) {
    if (!Array.isArray(artifact[field])) {
      throw new Error(`OpenAI Responses structured output artifact.${field} is required`);
    }
  }

  const normalizedArtifact = {
    orderedSubTasks: sanitizeStringArray(artifact.orderedSubTasks),
    checkpoints: sanitizeStringArray(artifact.checkpoints),
    expectedArtifactsPerCheckpoint: sanitizeStringArray(artifact.expectedArtifactsPerCheckpoint),
    verificationCheckpoints: sanitizeStringArray(artifact.verificationCheckpoints),
    reviewTriggerPoints: sanitizeStringArray(artifact.reviewTriggerPoints),
    stopAndEscalateConditions: sanitizeStringArray(artifact.stopAndEscalateConditions),
    executionBoundarySummary: sanitizeStringArray(artifact.executionBoundarySummary),
  };

  for (const [field, value] of Object.entries(normalizedArtifact)) {
    if (value.length === 0) {
      throw new Error(
        `OpenAI Responses structured output artifact.${field} must contain at least one item`,
      );
    }
  }

  return normalizedArtifact;
}

function normalizeBuilderPreflightArtifact(artifact) {
  if (!artifact || typeof artifact !== 'object' || Array.isArray(artifact)) {
    throw new Error('OpenAI Responses structured output artifact is required');
  }

  const requiredArrayFields = [
    'targetFiles',
    'intendedChanges',
    'risks',
    'verificationPlan',
    'reviewEvidenceExpectations',
    'escalationTriggers',
  ];

  for (const field of requiredArrayFields) {
    if (!Array.isArray(artifact[field])) {
      throw new Error(`OpenAI Responses structured output artifact.${field} is required`);
    }
  }

  return {
    targetFiles: sanitizeStringArray(artifact.targetFiles).map((value) => {
      const normalizedValue = normalizeRelativePath(value);

      if (!normalizedValue) {
        throw new Error(
          'OpenAI Responses structured output targetFiles must contain repo-relative paths only',
        );
      }

      return normalizedValue;
    }),
    intendedChanges: sanitizeStringArray(artifact.intendedChanges),
    risks: sanitizeStringArray(artifact.risks),
    verificationPlan: sanitizeStringArray(artifact.verificationPlan),
    reviewEvidenceExpectations: sanitizeStringArray(artifact.reviewEvidenceExpectations),
    escalationTriggers: sanitizeStringArray(artifact.escalationTriggers),
  };
}

function normalizeBuilderLiveMutationArtifact(artifact) {
  if (!artifact || typeof artifact !== 'object' || Array.isArray(artifact)) {
    throw new Error('OpenAI Responses structured output artifact is required');
  }

  const requiredArrayFields = [
    'changeSummary',
    'targetFiles',
    'fileUpdates',
    'risks',
    'verificationNotes',
  ];

  for (const field of requiredArrayFields) {
    if (!Array.isArray(artifact[field])) {
      throw new Error(`OpenAI Responses structured output artifact.${field} is required`);
    }
  }

  const targetFiles = sanitizeStringArray(artifact.targetFiles).map((value) => {
    const normalizedValue = normalizeRelativePath(value);

    if (!normalizedValue) {
      throw new Error(
        'OpenAI Responses structured output artifact.targetFiles must contain repo-relative paths only',
      );
    }

    return normalizedValue;
  });
  const fileUpdates = artifact.fileUpdates.map((value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error('OpenAI Responses structured output artifact.fileUpdates entries are required');
    }

    const relativePath = normalizeRelativePath(value.path);
    const contentBase64 = sanitizeText(value.contentBase64);

    if (!relativePath) {
      throw new Error(
        'OpenAI Responses structured output artifact.fileUpdates paths must contain repo-relative paths only',
      );
    }

    if (!contentBase64) {
      throw new Error(
        'OpenAI Responses structured output artifact.fileUpdates contentBase64 is required',
      );
    }

    return {
      path: relativePath,
      content: Buffer.from(contentBase64, 'base64').toString('utf8'),
    };
  });
  const uniqueFileUpdatePaths = new Set(fileUpdates.map((value) => value.path));

  if (uniqueFileUpdatePaths.size !== fileUpdates.length) {
    throw new Error(
      'OpenAI Responses structured output artifact.fileUpdates paths must be unique for builder-live-mutation',
    );
  }

  return {
    changeSummary: sanitizeStringArray(artifact.changeSummary),
    targetFiles,
    fileUpdates,
    risks: sanitizeStringArray(artifact.risks),
    verificationNotes: sanitizeStringArray(artifact.verificationNotes),
  };
}

function normalizeKnowledgeWorkReviewerRubric(rubric, request) {
  if (!rubric || typeof rubric !== 'object' || Array.isArray(rubric)) {
    throw new Error(
      'OpenAI Responses structured output artifact.knowledgeWorkRubric is required for knowledge-work reviewer output',
    );
  }

  const deliverable = getKnowledgeWorkDeliverableSpec(request);
  const deliverablePath = normalizeRelativePath(rubric.deliverablePath);
  const requiredSections = sanitizeStringArray(rubric.requiredSections);
  const missingRequiredSections = uniqueStringArray(rubric.missingRequiredSections);
  const emptyRequiredSections = uniqueStringArray(rubric.emptyRequiredSections);
  const subsetValues = [...missingRequiredSections, ...emptyRequiredSections];

  if (sanitizeText(rubric.deliverableType) !== deliverable.deliverableType) {
    throw new Error(
      'OpenAI Responses structured output artifact.knowledgeWorkRubric.deliverableType must match the task deliverableType',
    );
  }

  if (deliverablePath !== deliverable.filePath) {
    throw new Error(
      'OpenAI Responses structured output artifact.knowledgeWorkRubric.deliverablePath must match the expected deliverable path',
    );
  }

  if (!sameExactStringArrays(requiredSections, deliverable.sections)) {
    throw new Error(
      'OpenAI Responses structured output artifact.knowledgeWorkRubric.requiredSections must exactly match the expected deliverable sections',
    );
  }

  if (
    subsetValues.some((value) => !deliverable.sections.includes(value)) ||
    new Set(subsetValues).size !== subsetValues.length
  ) {
    throw new Error(
      'OpenAI Responses structured output artifact.knowledgeWorkRubric missing/empty sections must be unique members of requiredSections',
    );
  }

  const normalizedRubric = {
    deliverableType: deliverable.deliverableType,
    deliverablePath,
    requiredSections,
    deliverablePresent: rubric.deliverablePresent === true,
    missingRequiredSections,
    emptyRequiredSections,
    explicitNextAction: rubric.explicitNextAction === true,
    traceMarkerVerified: rubric.traceMarkerVerified === true,
    checklistItemsPresent: rubric.checklistItemsPresent === true,
    acceptanceSignalsExplicit: rubric.acceptanceSignalsExplicit === true,
  };
  const requiredVerdictSeverity =
    !normalizedRubric.deliverablePresent || !normalizedRubric.traceMarkerVerified
      ? 2
      : normalizedRubric.missingRequiredSections.length > 0 ||
          normalizedRubric.emptyRequiredSections.length > 0 ||
          !normalizedRubric.explicitNextAction ||
          (deliverable.deliverableType === 'checklist' && !normalizedRubric.checklistItemsPresent) ||
          (deliverable.deliverableType === 'prd' && !normalizedRubric.acceptanceSignalsExplicit)
        ? 1
        : 0;

  return {
    ...normalizedRubric,
    requiredVerdictSeverity,
  };
}

function assertKnowledgeWorkReviewerRubricOutcome(rubric, normalizedResult, verdict) {
  if (!rubric) {
    return;
  }

  if (getReviewerVerdictSeverity(verdict) < rubric.requiredVerdictSeverity) {
    throw new Error(
      'OpenAI Responses structured output reviewer artifact.verdict must not understate knowledge-work rubric issues',
    );
  }

  if (
    rubric.requiredVerdictSeverity > 0 &&
    normalizedResult.nextStage === 'human gate' &&
    normalizedResult.needsDecision !== true
  ) {
    throw new Error(
      'OpenAI Responses structured output knowledge-work reviewer follow-up must not use a pass-side human gate while rubric issues remain',
    );
  }
}

function normalizeReviewerArtifact(artifact, request) {
  if (!artifact || typeof artifact !== 'object' || Array.isArray(artifact)) {
    throw new Error('OpenAI Responses structured output artifact is required');
  }

  const requiredArrayFields = [
    'evidenceReviewed',
    'findings',
    'contractCompliance',
    'verificationEvidence',
    'acceptedRisks',
  ];

  for (const field of requiredArrayFields) {
    if (!Array.isArray(artifact[field])) {
      throw new Error(`OpenAI Responses structured output artifact.${field} is required`);
    }
  }

  if (!artifact.followUpGate || typeof artifact.followUpGate !== 'object' || Array.isArray(artifact.followUpGate)) {
    throw new Error('OpenAI Responses structured output artifact.followUpGate is required');
  }

  const verdict = sanitizeText(artifact.verdict);

  if (!['pass', 'fail', 'changes_requested'].includes(verdict)) {
    throw new Error('OpenAI Responses structured output artifact.verdict is invalid for reviewer output');
  }

  if (!isKnowledgeWorkPack(request) && artifact.knowledgeWorkRubric !== undefined) {
    throw new Error(
      'OpenAI Responses structured output artifact.knowledgeWorkRubric is only allowed for knowledge-work reviewer output',
    );
  }

  const normalizedArtifact = {
    verdict,
    evidenceReviewed: sanitizeStringArray(artifact.evidenceReviewed),
    findings: sanitizeStringArray(artifact.findings),
    contractCompliance: sanitizeStringArray(artifact.contractCompliance),
    verificationEvidence: sanitizeStringArray(artifact.verificationEvidence),
    acceptedRisks: sanitizeStringArray(artifact.acceptedRisks),
    followUpGate: {
      blockingIssue: artifact.followUpGate.blockingIssue === true,
      decisionRequired: artifact.followUpGate.decisionRequired === true,
    },
    knowledgeWorkRubric: isKnowledgeWorkPack(request)
      ? normalizeKnowledgeWorkReviewerRubric(artifact.knowledgeWorkRubric, request)
      : null,
  };

  if (
    normalizedArtifact.evidenceReviewed.length === 0 ||
    normalizedArtifact.contractCompliance.length === 0 ||
    normalizedArtifact.verificationEvidence.length === 0
  ) {
    throw new Error(
      'OpenAI Responses structured output reviewer artifact must include evidenceReviewed, contractCompliance, and verificationEvidence',
    );
  }

  return normalizedArtifact;
}

function renderTaskBreakerArtifactMarkdown(request, anchor, artifact, normalizedResult) {
  const sliceGoal = getMarkdownSection(request.planArtifact?.content, 'Slice Goal');
  const approvedAssumptions = getMarkdownSection(
    request.architectureArtifact?.content,
    'Approved Assumptions',
  );
  const executionBoundarySummary = [
    ...artifact.executionBoundarySummary,
    `next stage: ${normalizedResult.nextStage}`,
    `planner artifact: ${anchor.planArtifactId}`,
    `planner run: ${anchor.planRunId}`,
    `architecture artifact: ${anchor.architectureArtifactId}`,
    `architecture run: ${anchor.architectureRunId}`,
    `slice goal: ${sliceGoal || 'not stated'}`,
    `approved assumptions: ${approvedAssumptions ? 'present' : 'not stated'}`,
  ];

  return `# Task Breakdown: ${request.task.title}

## Ordered Sub-Tasks
${renderList(artifact.orderedSubTasks, 'none')}

## Checkpoints
${renderList(artifact.checkpoints, 'none')}

## Expected Artifacts Per Checkpoint
${renderList(artifact.expectedArtifactsPerCheckpoint, 'none')}

## Verification Checkpoints
${renderList(artifact.verificationCheckpoints, 'none')}

## Review Trigger Point
${renderList(artifact.reviewTriggerPoints, 'none')}

## Stop-And-Escalate Conditions
${renderList(artifact.stopAndEscalateConditions, 'none')}

## Execution Boundary Summary
${renderList(executionBoundarySummary, 'none')}
`;
}

function renderBuilderPreflightArtifactMarkdown(request, anchor, artifact, normalizedResult) {
  const sliceGoal = getMarkdownSection(request.planArtifact?.content, 'Slice Goal');
  const acceptanceTarget = getMarkdownSection(request.planArtifact?.content, 'Acceptance Target');
  const approvedAssumptions = getMarkdownSection(
    request.architectureArtifact?.content,
    'Approved Assumptions',
  );
  const orderedSubTasks = parseMarkdownList(request.breakdownArtifact?.content, 'Ordered Sub-Tasks');

  return `# Builder Preflight: ${request.task.title}

## Target Files
${renderList(artifact.targetFiles, 'none identified')}

## Intended Changes
${renderList(artifact.intendedChanges, 'none')}

## Risks
${renderList(artifact.risks, 'none')}

## Verification Plan
${renderList(artifact.verificationPlan, 'none')}

## Review Evidence Expectations
${renderList(artifact.reviewEvidenceExpectations, 'none')}

## Escalation Triggers
${renderList(artifact.escalationTriggers, 'none')}

## Input Summary
- plan artifact: ${anchor.planArtifactId}
- plan run: ${anchor.planRunId}
- architecture artifact: ${anchor.architectureArtifactId}
- architecture run: ${anchor.architectureRunId}
- breakdown artifact: ${anchor.breakdownArtifactId}
- breakdown run: ${anchor.breakdownRunId}
- source-of-truth files: ${anchor.sourceOfTruthPaths.length}
- architecture allowlist files: ${anchor.architectureAllowlistPaths.length}
- code context files: ${anchor.codeContextPaths.length}
- ordered sub-tasks in latest breakdown: ${orderedSubTasks.length}
- slice goal: ${sliceGoal || 'not stated'}
- acceptance target: ${acceptanceTarget || 'not stated'}
- approved assumptions: ${approvedAssumptions ? 'present' : 'not stated'}
- next action: ${normalizedResult.nextStage}
- execution mode: ${request.executionMode || 'unspecified'}
  - mutation allowed: ${request.mutationAllowed === false ? 'no' : 'yes'}
  `;
}

function renderBuilderLiveMutationArtifactMarkdown(request, anchor, artifact, normalizedResult) {
  const summaryLines = [
    ...artifact.changeSummary,
    `preflight artifact: ${anchor.preflightArtifactId}`,
    `preflight run: ${anchor.preflightRunId}`,
    `approval id: ${anchor.approvalId}`,
    `approval target artifact: ${anchor.approvalTargetArtifactId}`,
    `approval target run: ${anchor.approvalTargetRunId}`,
    `prepared file updates: ${artifact.fileUpdates.length}`,
    `reviewer executed: no`,
    `commit or release executed: no`,
    `next stage: ${normalizedResult.nextStage}`,
  ];

  return `# Builder Live Mutation: ${request.task.title}

## Change Summary
${renderList(summaryLines, 'none')}

## Target Files
${renderList(artifact.targetFiles, 'none')}

## File Updates
${renderBase64FileUpdates(artifact.fileUpdates)}

## Risks
${renderList(artifact.risks, 'none')}

## Verification Notes
${renderList(artifact.verificationNotes, 'none')}
`;
}

function renderReviewerArtifactMarkdown(request, anchor, artifact, normalizedResult) {
  const knowledgeWorkFindings = buildKnowledgeWorkReviewFindings(artifact.knowledgeWorkRubric);
  const knowledgeWorkVerificationEvidence = buildKnowledgeWorkVerificationEvidence(
    artifact.knowledgeWorkRubric,
  );
  const knowledgeWorkContractCompliance = buildKnowledgeWorkContractComplianceLine(
    artifact.knowledgeWorkRubric,
  );
  const nextAction =
    normalizedResult.nextStage === 'architect'
      ? ['Return to architect with the review artifact and builder bundle context.']
      : normalizedResult.nextStage === 'human gate'
        ? ['Route to human gate after review.']
        : ['Return to builder with the review artifact and builder bundle context.'];
  const findings = uniqueStringArray([...artifact.findings, ...knowledgeWorkFindings]);
  const contractCompliance = uniqueStringArray([
    ...artifact.contractCompliance,
    knowledgeWorkContractCompliance || '',
  ]);
  const verificationEvidence = uniqueStringArray([
    ...artifact.verificationEvidence,
    ...knowledgeWorkVerificationEvidence,
  ]);

  return `# Reviewer Report: ${request.task.title}

## Review Verdict
- verdict: ${artifact.verdict}
- source builder run: ${anchor.sourceBuilderRunId}
- preflight artifact: ${anchor.preflightArtifactId}
- change-summary artifact: ${anchor.changeSummaryArtifactId}
- patch artifact: ${anchor.patchArtifactId}
- diff artifact: ${anchor.diffArtifactId}

## Evidence Reviewed
${renderList(artifact.evidenceReviewed, 'none')}

## Findings
${renderList(findings, 'none')}

## Contract Compliance
${renderList(contractCompliance, 'none')}

## Verification Evidence
${renderList(verificationEvidence, 'none')}

## Accepted Risks
${renderList(artifact.acceptedRisks, 'none')}

## Next Action
${renderList(nextAction, 'none')}

## Follow-Up Gate
- blocking issue: ${artifact.followUpGate.blockingIssue ? 'yes' : 'no'}
- decision required: ${artifact.followUpGate.decisionRequired ? 'yes' : 'no'}
`;
}

function normalizeStructuredArchitectPayload(outputText, request) {
  const parsedPayload = parseStructuredOutputPayload(outputText);
  const expectedAnchor = normalizeArchitectAnchor(request.anchor, 'anchor');
  const responseAnchor = normalizeArchitectAnchor(parsedPayload.anchor, 'anchor');

  assertArchitectAnchorExactMatch(expectedAnchor, responseAnchor);

  if (
    !parsedPayload.normalizedResult ||
    typeof parsedPayload.normalizedResult !== 'object' ||
    Array.isArray(parsedPayload.normalizedResult)
  ) {
    throw new Error('OpenAI Responses structured output normalizedResult is required');
  }

  const artifact = normalizeArchitectArtifact(parsedPayload.artifact);
  const normalizedResult = normalizeStructuredResult(
    parsedPayload.normalizedResult,
    ['task-breaker', 'human gate'],
    'architect',
  );

  if (
    artifact.boundaryFit === 'fit' &&
    (normalizedResult.nextStage !== 'task-breaker' ||
      normalizedResult.needsDecision === true ||
      normalizedResult.blockers.length > 0 ||
      artifact.blockingArchitectureIssues.length > 0)
  ) {
    throw new Error('OpenAI Responses structured output boundaryFit=fit must hand off cleanly to task-breaker');
  }

  if (artifact.boundaryFit === 'human-gate-required') {
    if (normalizedResult.nextStage !== 'human gate') {
      throw new Error(
        'OpenAI Responses structured output boundaryFit=human-gate-required must hand off to human gate',
      );
    }

    if (artifact.blockingArchitectureIssues.length === 0) {
      throw new Error(
        'OpenAI Responses structured output blockingArchitectureIssues are required when architect output routes to human gate',
      );
    }
  }

  return {
    artifactMarkdown: renderArchitectArtifactMarkdown(request, responseAnchor, artifact),
    normalizedResult,
  };
}

function normalizeStructuredTaskBreakerPayload(outputText, request) {
  const parsedPayload = parseStructuredOutputPayload(outputText);
  const expectedAnchor = normalizeTaskBreakerAnchor(request.anchor, 'anchor');
  const responseAnchor = normalizeTaskBreakerAnchor(parsedPayload.anchor, 'anchor');

  assertTaskBreakerAnchorExactMatch(expectedAnchor, responseAnchor);

  if (
    !parsedPayload.normalizedResult ||
    typeof parsedPayload.normalizedResult !== 'object' ||
    Array.isArray(parsedPayload.normalizedResult)
  ) {
    throw new Error('OpenAI Responses structured output normalizedResult is required');
  }

  const artifact = normalizeTaskBreakerArtifact(parsedPayload.artifact);
  const normalizedResult = normalizeStructuredResult(
    parsedPayload.normalizedResult,
    ['builder', 'human gate'],
    'task-breaker',
  );

  if (
    normalizedResult.nextStage === 'builder' &&
    (normalizedResult.needsDecision ||
      normalizedResult.blockers.length > 0 ||
      artifact.orderedSubTasks.length === 0)
  ) {
    throw new Error(
      'OpenAI Responses structured output builder handoff must keep needsDecision=false, blockers=[], and orderedSubTasks non-empty',
    );
  }

  if (
    normalizedResult.nextStage === 'human gate' &&
    (!normalizedResult.needsDecision || normalizedResult.blockers.length === 0)
  ) {
    throw new Error(
      'OpenAI Responses structured output human gate handoff must keep needsDecision=true and blockers non-empty',
    );
  }

  return {
    artifactMarkdown: renderTaskBreakerArtifactMarkdown(
      request,
      responseAnchor,
      artifact,
      normalizedResult,
    ),
    normalizedResult,
  };
}

function normalizeStructuredBuilderPreflightPayload(outputText, request) {
  const parsedPayload = parseStructuredOutputPayload(outputText);
  const expectedAnchor = normalizeBuilderPreflightAnchor(request.anchor, 'anchor');
  const responseAnchor = normalizeBuilderPreflightAnchor(parsedPayload.anchor, 'anchor');

  assertBuilderPreflightAnchorExactMatch(expectedAnchor, responseAnchor);

  if (
    !parsedPayload.normalizedResult ||
    typeof parsedPayload.normalizedResult !== 'object' ||
    Array.isArray(parsedPayload.normalizedResult)
  ) {
    throw new Error('OpenAI Responses structured output normalizedResult is required');
  }

  const artifact = normalizeBuilderPreflightArtifact(parsedPayload.artifact);
  const normalizedResult = normalizeStructuredResult(
    parsedPayload.normalizedResult,
    [
      'request-builder-live-mutation-approval',
      'architect',
      'task-breaker',
      'human gate',
    ],
    'builder-preflight',
  );
  const targetFilesOutsideArchitecture = artifact.targetFiles.filter(
    (relativePath) => !responseAnchor.architectureAllowlistPaths.includes(relativePath),
  );

  if (targetFilesOutsideArchitecture.length > 0) {
    throw new Error(
      'OpenAI Responses structured output targetFiles must stay inside the approved architecture allowlist',
    );
  }

  if (
    normalizedResult.nextStage === 'request-builder-live-mutation-approval' &&
    (normalizedResult.needsDecision ||
      normalizedResult.blockers.length > 0 ||
      artifact.targetFiles.length === 0)
  ) {
    throw new Error(
      'OpenAI Responses structured output clean builder-preflight handoff must keep needsDecision=false, blockers=[], and targetFiles non-empty',
    );
  }

  if (
    (normalizedResult.nextStage === 'architect' || normalizedResult.nextStage === 'task-breaker') &&
    (normalizedResult.needsDecision || normalizedResult.blockers.length === 0)
  ) {
    throw new Error(
      'OpenAI Responses structured output architect/task-breaker escalation must keep needsDecision=false and blockers non-empty',
    );
  }

  if (
    normalizedResult.nextStage === 'human gate' &&
    (!normalizedResult.needsDecision || normalizedResult.blockers.length === 0)
  ) {
    throw new Error(
      'OpenAI Responses structured output human gate handoff must keep needsDecision=true and blockers non-empty',
    );
  }

  return {
    artifactMarkdown: renderBuilderPreflightArtifactMarkdown(
      request,
      responseAnchor,
      artifact,
      normalizedResult,
    ),
    normalizedResult,
  };
}

function normalizeStructuredBuilderLiveMutationPayload(outputText, request) {
  const parsedPayload = parseStructuredOutputPayload(outputText);
  const expectedAnchor = normalizeBuilderLiveMutationAnchor(request.anchor, 'anchor');
  const responseAnchor = normalizeBuilderLiveMutationAnchor(parsedPayload.anchor, 'anchor');

  assertBuilderLiveMutationAnchorExactMatch(expectedAnchor, responseAnchor);

  if (
    !parsedPayload.normalizedResult ||
    typeof parsedPayload.normalizedResult !== 'object' ||
    Array.isArray(parsedPayload.normalizedResult)
  ) {
    throw new Error('OpenAI Responses structured output normalizedResult is required');
  }

  const artifact = normalizeBuilderLiveMutationArtifact(parsedPayload.artifact);
  const normalizedResult = normalizeStructuredResult(
    parsedPayload.normalizedResult,
    ['reviewer', 'architect', 'human gate'],
    'builder-live-mutation',
  );
  const outOfScopeFiles = artifact.fileUpdates.filter(
    (fileUpdate) => !responseAnchor.targetFileAllowlistPaths.includes(fileUpdate.path),
  );

  if (!sameExactStringArrays(responseAnchor.targetFileAllowlistPaths, artifact.targetFiles)) {
    throw new Error(
      'OpenAI Responses structured output artifact.targetFiles must exactly match targetFileAllowlistPaths',
    );
  }

  if (!sameExactStringArrays(responseAnchor.targetFileAllowlistPaths, responseAnchor.codeContextPaths)) {
    throw new Error(
      'OpenAI Responses structured output builder-live-mutation anchor codeContextPaths must exactly match targetFileAllowlistPaths',
    );
  }

  if (outOfScopeFiles.length > 0) {
    throw new Error(
      'OpenAI Responses structured output artifact.fileUpdates must stay inside the approved target-file allowlist',
    );
  }

  if (
    normalizedResult.nextStage === 'reviewer' &&
    (normalizedResult.needsDecision ||
      normalizedResult.blockers.length > 0 ||
      artifact.fileUpdates.length === 0)
  ) {
    throw new Error(
      'OpenAI Responses structured output reviewer handoff must keep needsDecision=false, blockers=[], and artifact.fileUpdates non-empty',
    );
  }

  if (
    normalizedResult.nextStage === 'architect' &&
    (normalizedResult.needsDecision || normalizedResult.blockers.length === 0)
  ) {
    throw new Error(
      'OpenAI Responses structured output architect escalation must keep needsDecision=false and blockers non-empty',
    );
  }

  if (
    normalizedResult.nextStage === 'human gate' &&
    (!normalizedResult.needsDecision || normalizedResult.blockers.length === 0)
  ) {
    throw new Error(
      'OpenAI Responses structured output human gate handoff must keep needsDecision=true and blockers non-empty',
    );
  }

  return {
    artifactMarkdown: renderBuilderLiveMutationArtifactMarkdown(
      request,
      responseAnchor,
      artifact,
      normalizedResult,
    ),
    normalizedResult,
  };
}

function normalizeStructuredReviewerPayload(outputText, request) {
  const parsedPayload = parseStructuredOutputPayload(outputText);
  const expectedAnchor = normalizeReviewerAnchor(request.anchor, 'anchor');
  const responseAnchor = normalizeReviewerAnchor(parsedPayload.anchor, 'anchor');

  assertReviewerAnchorExactMatch(expectedAnchor, responseAnchor);

  if (
    !parsedPayload.normalizedResult ||
    typeof parsedPayload.normalizedResult !== 'object' ||
    Array.isArray(parsedPayload.normalizedResult)
  ) {
    throw new Error('OpenAI Responses structured output normalizedResult is required');
  }

  const artifact = normalizeReviewerArtifact(parsedPayload.artifact, request);
  const normalizedResult = normalizeStructuredResult(
    parsedPayload.normalizedResult,
    ['builder', 'architect', 'human gate'],
    'reviewer',
  );
  const expectsDecisionFollowUp =
    normalizedResult.nextStage === 'human gate' &&
    normalizedResult.needsDecision === true &&
    normalizedResult.blockers.length > 0;

  if (artifact.followUpGate.decisionRequired !== normalizedResult.needsDecision) {
    throw new Error(
      'OpenAI Responses structured output reviewer followUpGate.decisionRequired must exactly match normalizedResult.needsDecision',
    );
  }

  if (artifact.followUpGate.blockingIssue !== expectsDecisionFollowUp) {
    throw new Error(
      'OpenAI Responses structured output reviewer followUpGate.blockingIssue must match the validated human-gate decision condition',
    );
  }

  assertKnowledgeWorkReviewerRubricOutcome(
    artifact.knowledgeWorkRubric,
    normalizedResult,
    artifact.verdict,
  );

  if (
    normalizedResult.nextStage === 'builder' &&
    (artifact.verdict === 'pass' ||
      normalizedResult.needsDecision ||
      normalizedResult.blockers.length > 0)
  ) {
    throw new Error(
      'OpenAI Responses structured output reviewer builder handoff must keep non-pass verdict, needsDecision=false, and blockers=[]',
    );
  }

  if (
    normalizedResult.nextStage === 'architect' &&
    (artifact.verdict === 'pass' ||
      normalizedResult.needsDecision ||
      normalizedResult.blockers.length === 0)
  ) {
    throw new Error(
      'OpenAI Responses structured output reviewer architect handoff must keep non-pass verdict, needsDecision=false, and blockers non-empty',
    );
  }

  if (normalizedResult.nextStage === 'human gate') {
    if (normalizedResult.needsDecision && normalizedResult.blockers.length === 0) {
      throw new Error(
        'OpenAI Responses structured output reviewer human gate decision follow-up must keep blockers non-empty',
      );
    }

    if (!normalizedResult.needsDecision && normalizedResult.blockers.length > 0) {
      throw new Error(
        'OpenAI Responses structured output reviewer pass-side human gate follow-up must keep blockers empty',
      );
    }
  }

  return {
    artifactMarkdown: renderReviewerArtifactMarkdown(
      request,
      responseAnchor,
      artifact,
      normalizedResult,
    ),
    normalizedResult,
  };
}

function normalizeUsage(usage) {
  if (!usage || typeof usage !== 'object') {
    return null;
  }

  const inputTokens =
    typeof usage.input_tokens === 'number'
      ? usage.input_tokens
      : typeof usage.inputTokens === 'number'
        ? usage.inputTokens
        : null;
  const outputTokens =
    typeof usage.output_tokens === 'number'
      ? usage.output_tokens
      : typeof usage.outputTokens === 'number'
        ? usage.outputTokens
        : null;
  const totalTokens =
    typeof usage.total_tokens === 'number'
      ? usage.total_tokens
      : typeof usage.totalTokens === 'number'
        ? usage.totalTokens
        : null;

  if (inputTokens === null && outputTokens === null && totalTokens === null) {
    return null;
  }

  return {
    inputTokens,
    outputTokens,
    totalTokens,
  };
}

function createHttpError(status) {
  if (status === 401) {
    return new Error('OpenAI Responses API request failed with status 401');
  }

  if (status === 429) {
    return new Error('OpenAI Responses API request failed with status 429');
  }

  if (status >= 500) {
    return new Error(`OpenAI Responses API request failed with status ${status}`);
  }

  return new Error(`OpenAI Responses API request failed with status ${status}`);
}

function createNetworkError(error) {
  if (error?.name === 'AbortError') {
    return new Error('OpenAI Responses API request timed out');
  }

  return new Error('OpenAI Responses API request failed before a response was received');
}

function validateLiveProviderConfig(providerConfig) {
  const apiKeyVar = sanitizeText(providerConfig.env?.apiKeyVar);
  const model = sanitizeText(providerConfig.model);
  const apiKey = apiKeyVar ? process.env[apiKeyVar] || '' : '';

  if (!model) {
    throw new Error('live provider model is required before execution');
  }

  if (!apiKeyVar) {
    throw new Error('live provider apiKey env var is required before execution');
  }

  if (!apiKey) {
    throw new Error(`live provider env var ${apiKeyVar} is not configured for execution`);
  }

  return {
    apiKey,
    model,
  };
}

function buildRequestBody(request, model) {
  if (request.role === 'planner') {
    return buildPlannerRequestBody(request, model);
  }

  if (request.role === 'architect') {
    return buildArchitectRequestBody(request, model);
  }

  if (request.role === 'task-breaker') {
    return buildTaskBreakerRequestBody(request, model);
  }

  if (request.role === 'builder' && request.executionMode === 'preflight') {
    return buildBuilderPreflightRequestBody(request, model);
  }

  if (request.role === 'builder' && request.executionMode === 'live-mutation') {
    return buildBuilderLiveMutationRequestBody(request, model);
  }

  if (request.role === 'reviewer') {
    return buildReviewerRequestBody(request, model);
  }

  throw new Error(`${LIVE_ROLE_LIMIT_REASON}; ${request.role} remains blocked`);
}

function resolveTimeoutMs(options = {}) {
  if (Number.isInteger(options.timeoutMs) && options.timeoutMs > 0) {
    return options.timeoutMs;
  }

  const envTimeoutMs = Number.parseInt(process.env.OPENAI_RESPONSES_TIMEOUT_MS || '', 10);

  if (Number.isInteger(envTimeoutMs) && envTimeoutMs > 0) {
    return envTimeoutMs;
  }

  return DEFAULT_TIMEOUT_MS;
}

function resolveMaxRetryAttempts(options = {}) {
  if (Number.isInteger(options.maxRetryAttempts) && options.maxRetryAttempts >= 0) {
    return options.maxRetryAttempts;
  }

  const envValue = Number.parseInt(process.env.OPENAI_RESPONSES_MAX_RETRY_ATTEMPTS || '', 10);

  if (Number.isInteger(envValue) && envValue >= 0) {
    return envValue;
  }

  return DEFAULT_MAX_RETRY_ATTEMPTS;
}

function resolveRetryDelayMs(options = {}) {
  if (Number.isInteger(options.retryDelayMs) && options.retryDelayMs >= 0) {
    return options.retryDelayMs;
  }

  const envValue = Number.parseInt(process.env.OPENAI_RESPONSES_RETRY_DELAY_MS || '', 10);

  if (Number.isInteger(envValue) && envValue >= 0) {
    return envValue;
  }

  return DEFAULT_RETRY_DELAY_MS;
}

function shouldRetryStatus(status) {
  return status === 429 || status >= 500;
}

function parseDurationHeaderMs(value) {
  const sanitized = sanitizeText(value);

  if (!sanitized) {
    return null;
  }

  const durationMatches = [...sanitized.matchAll(/(\d+(?:\.\d+)?)(ms|s|m|h)/g)];

  if (durationMatches.length > 0) {
    const matchedLength = durationMatches.reduce((total, match) => total + match[0].length, 0);

    if (matchedLength === sanitized.length) {
      let totalMs = 0;

      for (const [, amountText, unit] of durationMatches) {
        const amount = Number.parseFloat(amountText);

        if (!Number.isFinite(amount) || amount < 0) {
          return null;
        }

        if (unit === 'ms') {
          totalMs += amount;
        } else if (unit === 's') {
          totalMs += amount * 1000;
        } else if (unit === 'm') {
          totalMs += amount * 60 * 1000;
        } else if (unit === 'h') {
          totalMs += amount * 60 * 60 * 1000;
        }
      }

      return Math.min(Math.ceil(totalMs), MAX_RETRY_DELAY_MS);
    }
  }

  const numericSeconds = Number.parseFloat(sanitized);

  if (Number.isFinite(numericSeconds) && numericSeconds >= 0) {
    return Math.min(Math.ceil(numericSeconds * 1000), MAX_RETRY_DELAY_MS);
  }

  return null;
}

function resolveRetryDelayFromHeaders(headers, fallbackDelayMs, attemptIndex) {
  const retryAfter = sanitizeText(headers?.get?.('retry-after'));

  if (retryAfter) {
    const retryAfterSeconds = Number.parseFloat(retryAfter);

    if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds >= 0) {
      return Math.min(Math.ceil(retryAfterSeconds * 1000), MAX_RETRY_DELAY_MS);
    }

    const retryAfterDate = Date.parse(retryAfter);

    if (Number.isFinite(retryAfterDate)) {
      return Math.min(Math.max(0, retryAfterDate - Date.now()), MAX_RETRY_DELAY_MS);
    }
  }

  const requestResetDelayMs = parseDurationHeaderMs(headers?.get?.('x-ratelimit-reset-requests'));
  const tokenResetDelayMs = parseDurationHeaderMs(headers?.get?.('x-ratelimit-reset-tokens'));
  const headerResetDelayMs = Math.max(requestResetDelayMs || 0, tokenResetDelayMs || 0);

  if (headerResetDelayMs > 0) {
    return headerResetDelayMs;
  }

  const scaledFallbackDelayMs = fallbackDelayMs * (attemptIndex + 1);
  return Math.min(scaledFallbackDelayMs, MAX_RETRY_DELAY_MS);
}

function waitForDelay(ms) {
  if (!Number.isFinite(ms) || ms <= 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function normalizeStructuredPayload(outputText, request) {
  if (request.role === 'planner') {
    return normalizeStructuredPlannerPayload(outputText);
  }

  if (request.role === 'architect') {
    return normalizeStructuredArchitectPayload(outputText, request);
  }

  if (request.role === 'task-breaker') {
    return normalizeStructuredTaskBreakerPayload(outputText, request);
  }

  if (request.role === 'builder' && request.executionMode === 'preflight') {
    return normalizeStructuredBuilderPreflightPayload(outputText, request);
  }

  if (request.role === 'builder' && request.executionMode === 'live-mutation') {
    return normalizeStructuredBuilderLiveMutationPayload(outputText, request);
  }

  if (request.role === 'reviewer') {
    return normalizeStructuredReviewerPayload(outputText, request);
  }

  throw new Error(`${LIVE_ROLE_LIMIT_REASON}; ${request.role} remains blocked`);
}

function createOpenAIResponsesProviderAdapter(options = {}) {
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  const apiUrl = options.apiUrl || DEFAULT_OPENAI_RESPONSES_URL;
  const timeoutMs = resolveTimeoutMs(options);
  const maxRetryAttempts = resolveMaxRetryAttempts(options);
  const retryDelayMs = resolveRetryDelayMs(options);

  return {
    name: 'openai-responses',
    getReadiness(input = {}) {
      if (typeof fetchImpl !== 'function') {
        return {
          readiness: PROVIDER_READINESS.ERROR,
          allowed: false,
          reasons: ['openai-responses adapter requires fetch support'],
        };
      }

      if (
        input.role !== 'planner' &&
        input.role !== 'architect' &&
        input.role !== 'task-breaker' &&
        input.role !== 'builder-preflight' &&
        input.role !== 'builder-live-mutation' &&
        input.role !== 'reviewer'
      ) {
        return {
          readiness: PROVIDER_READINESS.DEGRADED,
          allowed: false,
          reasons: [`${LIVE_ROLE_LIMIT_REASON}; ${input.role} remains blocked`],
        };
      }

      return {
        readiness: PROVIDER_READINESS.READY,
        allowed: true,
        reasons: [],
      };
    },
    async execute(request, context = {}) {
      if (
        request.role !== 'planner' &&
        request.role !== 'architect' &&
        request.role !== 'task-breaker' &&
        request.role !== 'reviewer' &&
        !(
          request.role === 'builder' &&
          (request.executionMode === 'preflight' || request.executionMode === 'live-mutation')
        )
      ) {
        throw new Error(`${LIVE_ROLE_LIMIT_REASON}; ${request.role} remains blocked`);
      }

      const providerConfig =
        context.providerConfig && typeof context.providerConfig === 'object'
          ? context.providerConfig
          : {};
      const { apiKey, model } = validateLiveProviderConfig(providerConfig);

      let response = null;
      const requestBody = JSON.stringify(buildRequestBody(request, model));

      for (let attempt = 0; attempt <= maxRetryAttempts; attempt += 1) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
          response = await fetchImpl(apiUrl, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: requestBody,
            signal: controller.signal,
          });
        } catch (error) {
          throw createNetworkError(error);
        } finally {
          clearTimeout(timeoutId);
        }

        if (response.ok || !shouldRetryStatus(response.status) || attempt === maxRetryAttempts) {
          break;
        }

        await waitForDelay(resolveRetryDelayFromHeaders(response.headers, retryDelayMs, attempt));
      }

      const rawResponseText = await response.text();
      let payload = {};

      try {
        payload = rawResponseText ? JSON.parse(rawResponseText) : {};
      } catch (_error) {
        throw new Error('OpenAI Responses API returned invalid JSON');
      }

      if (!response.ok) {
        throw createHttpError(response.status);
      }

      const rawOutputText = extractOutputTextFromContent(payload);

      if (!rawOutputText) {
        throw new Error('OpenAI Responses response outputText is required');
      }

      const structuredPayload = normalizeStructuredPayload(rawOutputText, request);

      return {
        model: sanitizeText(payload.model) || model,
        normalizedResult: structuredPayload.normalizedResult,
        outputText: structuredPayload.artifactMarkdown,
        providerRunId: sanitizeText(payload.id) || null,
        usage: normalizeUsage(payload.usage),
      };
    },
  };
}

module.exports = {
  DEFAULT_OPENAI_RESPONSES_TIMEOUT_MS: DEFAULT_TIMEOUT_MS,
  createOpenAIResponsesProviderAdapter,
};
