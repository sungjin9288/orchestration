import { requireNoCliArgs } from './read-only-cli-guard.mjs';

requireNoCliArgs(process.argv.slice(2), { mode: 'manual-ui-qa-checklist' });

const manualChecklist = [
  {
    id: 'mission-blocked-gate',
    surface: 'mission',
    title: 'Mission blocked reason visibility',
    route: 'Mission -> handoff preview -> task detail helper',
    verify: [
      'provider-not-ready 또는 linked-worktree mismatch 상태에서 실행 CTA가 진행되지 않는지 확인합니다.',
      '막힌 이유가 합성 문장 없이 첫 blocked reason 그대로 보이는지 확인합니다.',
    ],
  },
  {
    id: 'council-transition',
    surface: 'council',
    title: 'Council selected and empty continuity',
    route: 'Council -> selected state / empty state -> approval shelf',
    verify: [
      'selected 상태와 empty 상태가 같은 company heartbeat tone으로 이어지는지 확인합니다.',
      'approval shelf copy가 결과/후속만 짧게 남기는지 확인합니다.',
    ],
  },
  {
    id: 'deliverables-to-ops-entry',
    surface: 'deliverables',
    title: 'Deliverables advanced ops handoff',
    route: 'Deliverables -> 관제실 직행',
    verify: [
      'entry row가 작업판 / 로그 / 보관 / 결재 상태를 미리 보여 주는지 확인합니다.',
      '실행이 막혀 있을 때 helper가 첫 blocked reason만 그대로 보여 주는지 확인합니다.',
    ],
  },
  {
    id: 'taskboard-first-zone',
    surface: 'taskboard',
    title: 'Taskboard first deck to first detail',
    route: 'Advanced Ops -> Taskboard',
    verify: [
      'first deck 아래 첫 detail block에 같은 lane signal row가 이어지는지 확인합니다.',
      '최신 run / 워크트리 block이 generic detail card처럼 튀지 않는지 확인합니다.',
    ],
  },
  {
    id: 'logs-first-zone',
    surface: 'logs',
    title: 'Logs first deck to first detail',
    route: 'Advanced Ops -> Logs',
    verify: [
      'run 기본 정보 block이 first deck와 같은 lane language를 유지하는지 확인합니다.',
      '현재 run에서 깊은 provenance로 내려갈 때 rhythm이 갑자기 무거워지지 않는지 확인합니다.',
    ],
  },
  {
    id: 'artifacts-first-zone',
    surface: 'artifacts',
    title: 'Artifacts first deck to first handling hint',
    route: 'Advanced Ops -> Artifacts',
    verify: [
      'preselected pending hint에 같은 lane signal row가 보이는지 확인합니다.',
      '현재 증적에서 첫 승인 처리로 내려갈 때 generic helper로 돌아가지 않는지 확인합니다.',
    ],
  },
  {
    id: 'decision-first-zone',
    surface: 'decision-inbox',
    title: 'Decision Inbox first deck to first action',
    route: 'Advanced Ops -> Decision Inbox',
    verify: [
      '지금 처리 block이 first deck와 같은 lane signal row를 유지하는지 확인합니다.',
      '첫 action zone이 generic approval shelf처럼 보이지 않는지 확인합니다.',
    ],
  },
];

console.log(
  JSON.stringify(
    {
      ok: true,
      mode: 'manual-ui-qa-checklist',
      browserAutomation: 'manual-required',
      prerequisites: [
        '로컬 UI 서버가 http://127.0.0.1:4315 에서 응답해야 합니다.',
        'project_path가 설정된 development pack 상태를 사용합니다.',
        'blocked path 확인 시 provider-not-ready 또는 linked-worktree mismatch 상태를 재현합니다.',
      ],
      checklist: manualChecklist,
      notes: [
        '이 스크립트는 manual QA 체크리스트만 제공합니다.',
        'synthetic smoke와 snapshot 상태는 node scripts/ui_qa_status.mjs 로 함께 확인합니다.',
      ],
    },
    null,
    2,
  ),
);
