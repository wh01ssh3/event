'use strict';

// region  Module dependencies.
const http = require('http');
const VError = require('verror');
const Promise = require('bluebird');

const logger = require('./logger');
const config = require('./config');
const express = require('./express');
// endregion

let httpServer;

function start(dbConnection) {
  logger.debug('Starting server...');
  const app = express.init(dbConnection);
  httpServer = http.createServer(app);
  httpServer.listen(config.get('http.port'), (err) => {
    return new Promise((resolve, reject) => {
      if (err) { return reject(new VError(err, 'App listen failed')); }
      logger.debug('Http started at %s port.', httpServer.address().port);
      return resolve();
    });
  });
}

function stop() {
  logger.debug('Closing http server...');
  httpServer.close((err, result) => {
    return new Promise((resolve, reject) => {
      if (err) { return reject(new VError(err, 'Http close failed')); }
      logger.debug('Http server closed.');
      return resolve();
    });
  });
}

exports.start = start;
exports.stop = stop;
