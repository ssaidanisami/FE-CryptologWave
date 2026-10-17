const {
  nxComponentTestingPreset,
} = require('@nx/angular/plugins/component-testing');
const { defineConfig } = require('cypress');
module.exports = defineConfig({
  component: {
    ...nxComponentTestingPreset(__filename),
    // Cypress 14+ defaults justInTimeCompile to true (webpack only), which can
    // intermittently run 0 tests in CI. Remove this line to opt back in.
    justInTimeCompile: false,
  },
});
