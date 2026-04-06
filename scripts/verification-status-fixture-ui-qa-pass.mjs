console.log(
  JSON.stringify({
    ok: true,
    allChecksOk: true,
    browserAutomation: 'fixture',
    counts: {
      requiredChecks: 1,
      passedRequiredChecks: 1,
      failedRequiredChecks: 0,
      informationalChecks: 0,
      passedInformationalChecks: 0,
      failedInformationalChecks: 0,
      skippedInformationalChecks: 0,
    },
    lanes: {
      required: {
        totalChecks: 1,
        passedChecks: 1,
        failedChecks: 0,
      },
      informational: {
        totalChecks: 0,
        passedChecks: 0,
        failedChecks: 0,
        skippedChecks: 0,
      },
    },
  }),
);
