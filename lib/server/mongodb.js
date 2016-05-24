'use strict';

const mongoose = require('mongoose');
const VError = require('verror');
const Promise = require('bluebird');

mongoose.Promise = Promise;

const logger = require('./logger');
const config = require('./config');
const migrations = require('./migrations');

function dropDatabase() {
  logger.info('Database dropped');
  return mongoose.connection.db.dropDatabase();
}

function connect() {
  logger.debug('Init database...');
  mongoose.set('debug', config.get('db.debug'));
  mongoose.connection.on('error', (err) => { logger.error(new VError(err)); });
  return new Promise((resolve, reject) => {
    let mongooseThenable;
    mongoose.connection.on('open', () => {
      logger.debug('Connected to MongoDB');
      return resolve({mongooseThenable: mongooseThenable});
    });
    mongoose.connection.once('error', (err) => { return reject(new VError(err)); });
    mongooseThenable = mongoose.connect(config.get('db.uri'), config.get('db.options'));
  })
    .then((db) => {
      return Promise.resolve()
        .then(() => { return config.get('db.dropDatabaseAlways') ? dropDatabase() : null; })
        .then(() => { return migrations.migrateToActual(); })
        .then(() => { return db.mongooseThenable.connection; })
        .catch((err) => { return Promise.reject(new VError(err)); });
    });
}

function disconnect() {
  logger.debug('Closing mongodb connection...');
  return mongoose.disconnect()
    .then(() => { return logger.debug('Mongodb connection closed.'); })
    .catch((err) => { return Promise.reject(new VError(err, 'Mongo connection close failed')); });
}

module.exports = {
  connect: connect,
  disconnect: disconnect,
  dropDatabase: dropDatabase
};
