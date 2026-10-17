const {
  nxComponentTestingPreset,
} = require('@nx/angular/plugins/component-testing');
const { defineConfig } = require('cypress');
module.exports = defineConfig({
  component: {
    ...nxComponentTestingPreset(__filename),
    justInTimeCompile: false,
  },
});
