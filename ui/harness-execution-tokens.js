import { formatDate } from './formatters.js';

export function getHarnessExecutionTimestampLabel(execution, fallbackLabel = '기록 없음') {
  if (!execution?.executedAt) {
    return fallbackLabel;
  }

  return formatDate(execution.executedAt);
}

export function getHarnessExecutedAtTokenLabel(executedAtLabel) {
  if (!executedAtLabel) {
    return '';
  }

  return `실행:${executedAtLabel}`;
}

export function getHarnessPrimaryTokenLabel(execution) {
  if (!execution?.harnessId) {
    return '';
  }

  return `대표:${execution.harnessId}`;
}

export function getHarnessExecutionRequestId(execution) {
  return execution?.requestId || execution?.executionId || '';
}

export function getHarnessRequestTokenLabel(requestId) {
  if (!requestId) {
    return '';
  }

  return `요청:${requestId}`;
}

export function getHarnessHistoryRequestLabel(requestId, index) {
  return requestId || `최근 ${index + 1}`;
}

export function getHarnessHistoryInputPath(execution) {
  return execution?.inputPath || execution?.resolvedInputPath || '';
}

export function getHarnessHistoryOutputPath(execution) {
  return execution?.outputPath || execution?.resolvedOutputPath || '';
}

export function getHarnessExecutionActionOutputPath(execution) {
  return execution?.resolvedOutputPath || execution?.outputPath || '';
}

export function getHarnessPolicyReportTokenLabel(isPolicyReport) {
  return isPolicyReport ? '정책 리포트' : '';
}

export function isHarnessPolicyReportExecution(execution) {
  return execution?.actionMode === 'policy-report';
}

export function getHarnessResultStateToken(isPolicyReport) {
  if (isPolicyReport) {
    return {
      label: 'no-write',
      tone: 'neutral',
    };
  }

  return {
    label: '완료',
    tone: 'success',
  };
}

export function getHarnessOutputChannelToken(usesOutputFile) {
  if (usesOutputFile) {
    return {
      label: '출력 파일',
      tone: 'accent',
    };
  }

  return {
    label: '표준 출력',
    tone: 'neutral',
  };
}

export function getHarnessOutputSummaryValue(outputPath) {
  return outputPath || '표준 출력 전용';
}

export function getHarnessInputSummaryValue(inputPath) {
  return inputPath || '경로 없음';
}

export function getHarnessStatusSummaryValue(value) {
  return value || '미확인';
}

export function getHarnessExecutionPreviewText(execution) {
  return execution?.outputPreview || execution?.stdoutPreview || '';
}
