'use strict';

// region Module dependencies.
const fsp = require('fs-promise');
const Promise = require('bluebird');
const path = require('path');
const _ = require('lodash');
const compareVersion = require('compare-version');
const mongoose = require('mongoose');

const logger = require('../logger');
const Version = mongoose.model('Version');
// endregion

function getVersion() {
  return Version.find({}, 'version', {sort: {createDate: -1}, limit: 1})
    .then((versions) => {
      if (versions.length === 0) {
        return Version.create({version: '0.0.0', description: 'Clean database'})
          .then((version) => { return version.version; });
      }
      return versions[0].version;
    });
}

function getMigrations() {
  return fsp.readdir(__dirname)
    .then((fileNames) => {
      const names = _.map(fileNames, (fileName) => {
        return path.join(__dirname, fileName, 'index.js');
      });
      return Promise.filter(names, (item) => {
        return fsp.access(item)
          .then(() => { return true; })
          .catch(() => { return false; });
      });
    })
    .then((names) => {
      return Promise.map(names, (name) => {
        const migration = require(name);
        if (!_.isFunction(migration.migrate)) {
          throw new Error(`Migration module "${name}" doesn\'t contain function "migrate".`);
        }
        if (!_.isFunction(migration.getInfo)) {
          throw new Error(`Migration module "${name}" doesn\'t contain function "getInfo".`);
        }
        return migration.getInfo()
          .then((info) => {
            return {
              version: info.version,
              requiredVersion: info.requiredVersion,
              migrate: migration.migrate
            };
          });
      });
    });
}

function buildMigrationPath(data) {
  function build(path) {
    const currentVersion = data.version;
    const migration = _.last(path);
    const needMigration = compareVersion(migration.version, currentVersion) === 1;
    if (needMigration) {
      const prevVersion = _.find(data.migrations, {version: migration.requiredVersion});
      if (prevVersion && compareVersion(prevVersion.version, currentVersion) === 1) {
        path.push(prevVersion);
        build(path);
      }
    }
    return path;
  }

  let maxMigration = data.migrations[0];
  for (let i = 1; i < data.migrations.length; i += 1) {
    if (compareVersion(data.migrations[i].version, maxMigration.version) === 1) {
      maxMigration = data.migrations[i];
    }
  }

  if (compareVersion(maxMigration.version, data.version) === 0) {
    logger.info('Database version %s is actual.', data.version);
    return [];
  }

  if (compareVersion(maxMigration.version, data.version) === -1) {
    logger.error('Database version is higher than latest migration ().', data.version);
    return [];
  }

  logger.info('Building migration path from current version %s to latest %s...', data.version,
    maxMigration.version);
  const path = build([maxMigration]).reverse();
  logger.info('Migration path: %s -> %s', data.version, _.map(path, 'version').join(' -> '));
  return path;
}

function migrateToActual() {
  const version = getVersion();
  const migrations = getMigrations();
  return Promise.all([version, migrations])
    .spread((version, migrations) => { return buildMigrationPath({version: version, migrations: migrations}); })
    .then((path) => {
      return Promise.each(path, (item) => {
        logger.info('Migration to version %s started...', item.version);
        item.migrate()
          .then(() => {
            logger.info('Migration to version %s successfully compconste.', item.version);
            return Version.create({version: item.version});
          });
      });
    })
    .catch((err) => {
      logger.error(err);
      return Promise.reject(err);
    });
}

// Module exports
exports.migrateToActual = migrateToActual;
