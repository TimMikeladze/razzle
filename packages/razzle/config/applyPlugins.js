'use strict';

const logger = require('razzle-dev-utils/logger');

const applyPlugins = (config, razzle) => {
  if (!razzle.plugins) {
    return config;
  }
  if (!Array.isArray(razzle.plugins)) {
    logger.error(
      `The value for the 'plugin' key in razzle.config.js must be an array.`
    );
  }
  return razzle.plugins.reduce((result, current) => {
    let plugin;
    if (typeof current === 'function') {
      plugin = current;
    }
    if (typeof current === 'string') {
      try {
        console.log(require.resolve(current));
      } catch (e) {
        logger.error(
          `Missing '${current}' plugin package". Have you installed the package?`,
          e
        );
      }
      plugin = require(current).default;
      if (typeof current !== 'function') {
        logger.error(
          `Plugin package '${current}' does not export a default function.`
        );
      }
    } else {
      logger.error('Could not log plugin.');
    }
    return Object.assign({}, result, plugin(result));
  }, config);
};

module.exports = applyPlugins;
