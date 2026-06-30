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

export function getProjectGateCopy(data, surfaceName) {
  if (data.projects.length === 0) {
    return `고급 운영 모드에서 프로젝트를 등록한 뒤 ${surfaceName}을 엽니다.`;
  }

  return `고급 운영 모드에서 현재 프로젝트를 고른 뒤 ${surfaceName}을 엽니다.`;
}
