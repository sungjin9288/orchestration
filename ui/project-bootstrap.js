export function getProjectBootstrapState(data) {
  if (data.projects.length === 0) {
    return {
      copy: '태스크 생성이나 실행 전에 첫 프로젝트를 먼저 등록합니다.',
      title: '최초 진입 준비',
    };
  }

  if (!data.activeProject) {
    return {
      copy: '태스크 생성이나 실행 전에 현재 프로젝트를 먼저 고릅니다.',
      title: '프로젝트 선택 필요',
    };
  }

  return {
    copy: '프로젝트가 활성화되면 준비 경로는 닫히고, 다음 단계는 첫 태스크입니다.',
    title: '프로젝트 등록부',
  };
}

export function getMissionProjectBootstrapState(data) {
  const hasProjects = data.projects.length > 0;

  if (hasProjects) {
    return {
      actionLabel: '새 프로젝트 연결',
      contextLabel: '프로젝트 선택',
      copy: '등록된 경로를 선택하거나 새 프로젝트를 연결합니다.',
      heading: '작업할 프로젝트를 선택하세요',
      panelCopy: '현재 작업 문맥을 하나 선택합니다.',
      title: '등록된 프로젝트',
    };
  }

  return {
    actionLabel: '프로젝트 연결',
    contextLabel: '첫 설정',
    copy: 'Orchestration이 사용할 로컬 경로를 먼저 확인합니다.',
    heading: '작업할 프로젝트를 연결하세요',
    panelCopy: '',
    title: '프로젝트 연결',
  };
}

export function getProjectGateCopy(data, surfaceName) {
  if (data.projects.length === 0) {
    return `고급 운영 모드에서 프로젝트를 등록한 뒤 ${surfaceName}을 엽니다.`;
  }

  return `고급 운영 모드에서 현재 프로젝트를 고른 뒤 ${surfaceName}을 엽니다.`;
}
