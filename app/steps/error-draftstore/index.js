const Step = require('app/core/steps/Step');

module.exports = class DraftstoreError extends Step {
  get url() {
    return '/ds-service-notification';
  }
};