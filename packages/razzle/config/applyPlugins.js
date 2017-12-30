'use strict';

const logger = require('razzle-dev-utils/logger');

const loadPlugin = (plugin, logger) => {
  try {
    console.log(require.resolve(plugin));
  } catch (e) {
    logger.error(
      `Missing '${plugin}' plugin package". Have you installed the package?`,
      e
    );
  }
  plugin = require(plugin).default;
  if (typeof current !== 'function') {
    logger.error(
      `Plugin package '${plugin}' does not export a default function.`
    );
  }
  return plugin;
};

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
    let modifyFunction;
    let options = {};
    console.log(typeof current);
    if (typeof current === 'function') {
      modifyFunction = current;
    } else if (typeof current === 'string') {
      plugin = loadPlugin(current, logger);
    } else if (current !== null && typeof current === 'object') {
      if (!current.name && typeof current !== 'string') {
        logger.error(`Plugin name is required.`);
      }
      plugin = loadPlugin(current, logger);
      if (current.options) {
        options = Object.assign({}, current.options);
      }
    } else {
      logger.error('Could not load plugin.');
    }
    const modifiedConfig =
      (modifyFunction && modifyFunction(result)) ||
      plugin(options).modify(result);
    return Object.assign({}, result, modifiedConfig);
  }, config);
};

module.exports = applyPlugins;
