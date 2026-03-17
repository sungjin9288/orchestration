'use strict';

const { PROVIDER_READINESS } = require('../../runtime/contracts');

function createLiveProviderPlaceholderAdapter() {
  return {
    name: 'live-provider',
    getReadiness() {
      return {
        readiness: PROVIDER_READINESS.DEGRADED,
        allowed: false,
        reasons: ['live-provider execution remains disabled in provider-slice-01'],
      };
    },
    async execute() {
      throw new Error('live-provider execution remains disabled in provider-slice-01');
    },
  };
}

module.exports = {
  createLiveProviderPlaceholderAdapter,
};
