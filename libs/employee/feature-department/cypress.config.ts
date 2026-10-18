const {
  nxComponentTestingPreset,
} = require('@nx/angular/plugins/component-testing');
const { defineConfig } = require('cypress');
const path = require('path');

const preset = nxComponentTestingPreset(__filename);

module.exports = defineConfig({
  component: {
    ...preset,
    devServer: {
      ...preset.devServer,
      webpackConfig: {
        resolve: {
          alias: {
            '@fe-cryptolog-wave/data-access': path.resolve(
              __dirname,
              '../../../libs/employee/data-access/src/index.ts'
            ),
            '@fe-cryptolog-wave/ui': path.resolve(
              __dirname,
              '../../../libs/employee/ui/src/index.ts'
            ),
            '@fe-cryptolog-wave/feature-department': path.resolve(
              __dirname,
              '../../../libs/employee/feature-department/src/index.ts'
            ),
            '@fe-cryptolog-wave/feature-detail': path.resolve(
              __dirname,
              '../../../libs/employee/feature-detail/src/index.ts'
            ),
            '@fe-cryptolog-wave/shared-ui': path.resolve(
              __dirname,
              '../../../libs/shared/ui/src/index.ts'
            ),
            '@fe-cryptolog-wave/shared-utils': path.resolve(
              __dirname,
              '../../../libs/shared/utils/src/index.ts'
            ),
          },
        },
      },
    },
    justInTimeCompile: false,
  },
});
