'use strict';

const pluginFoo = options => ({
  modify: config => {
    console.log(config);
    console.log(options);
    return config;
  },
});

module.exports = {
  plugins: [pluginFoo({ foo: 'bar' })],
  modify(config, { target, dev }, webpack) {
    const appConfig = config; // stay immutable here

    // Change the name of the server output file in production
    if (target === 'node' && !dev) {
      appConfig.output.filename = 'custom.js';
    }

    return appConfig;
  },
};
