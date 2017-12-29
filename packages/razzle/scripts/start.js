#! /usr/bin/env node
'use strict';

process.env.NODE_ENV = 'development';
const fs = require('fs-extra');
const webpack = require('webpack');
const paths = require('../config/paths');
const createConfig = require('../config/createConfig');
const applyPlugins = require('../config/applyPlugins');
const devServer = require('webpack-dev-server');
const printErrors = require('razzle-dev-utils/printErrors');
const clearConsole = require('react-dev-utils/clearConsole');
const logger = require('razzle-dev-utils/logger');

process.noDeprecation = true; // turns off that loadQuery clutter.

if (process.argv.includes('--inspect')) {
  process.env.INSPECT_ENABLED = true;
}

// Optimistically, we make the console look exactly like the output of our
// FriendlyErrorsPlugin during compilation, so the user has immediate feedback.
// clearConsole();
logger.start('Compiling...');
let razzle = {};

// Check for razzle.config.js file
if (fs.existsSync(paths.appRazzleConfig)) {
  try {
    razzle = require(paths.appRazzleConfig);
  } catch (e) {
    clearConsole();
    logger.error('Invalid razzle.config.js file.', e);
    process.exit(1);
  }
}

// Delete assets.json to always have a manifest up to date
fs.removeSync(paths.appManifest);

// Create dev configs using our config factory, passing in razzle file as
// options.
let clientConfig = createConfig('web', 'dev', razzle);
let serverConfig = createConfig('node', 'dev', razzle);

// Apply plugins to config
clientConfig = applyPlugins(clientConfig, razzle);
serverConfig = applyPlugins(serverConfig, razzle);

// Check if razzle.config has a modify function. If it does, call it on the
// configs we just created.
if (razzle.modify) {
  clientConfig = razzle.modify(
    clientConfig,
    { target: 'web', dev: true },
    webpack
  );
  serverConfig = razzle.modify(
    serverConfig,
    { target: 'node', dev: true },
    webpack
  );
}

const serverCompiler = compile(serverConfig);

// Start our server webpack instance in watch mode.
serverCompiler.watch(
  {
    quiet: true,
    stats: 'none',
  },
  /* eslint-disable no-unused-vars */
  stats => {}
);

// Compile our assets with webpack
const clientCompiler = compile(clientConfig);

// Create a new instance of Webpack-dev-server for our client assets.
// This will actually run on a different port than the users app.
const clientDevServer = new devServer(clientCompiler, clientConfig.devServer);

// Start Webpack-dev-server
clientDevServer.listen(
  (process.env.PORT && parseInt(process.env.PORT) + 1) || razzle.port || 3001,
  err => {
    if (err) {
      logger.error(err);
    }
  }
);

// Webpack compile in a try-catch
function compile(config) {
  let compiler;
  try {
    compiler = webpack(config);
  } catch (e) {
    printErrors('Failed to compile.', [e]);
    process.exit(1);
  }
  return compiler;
}
