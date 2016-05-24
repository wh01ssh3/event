'use strict';

const Promise = require('bluebird');

let server;
let mongodb;
let logger;
let config;

function start() {
  // Init models
  require('./models');
  // Using bluebird promises instead native promise
  global.Promise = Promise;

  server = require('./server');
  mongodb = require('./mongodb');
  logger = require('./logger');
  config = require('./config');

  logger.debug('Starting application...');
  logger.debug(`NODE_ENV: ${config.get('env')}`);
  return mongodb.connect()
    .then((dbConnection) => {
      return server.start(dbConnection);
    })
    .then(() => { return logger.info('Application started.'); });
}

// Start application
start()
  .catch((err) => {
    logger.error(err);
    return process.exit(1);
  });

exports.start = start;
