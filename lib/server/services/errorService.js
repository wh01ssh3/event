'use strict'

// region Module dependencies.
const logger = require('../logger');
// endregion

function errorOutput(err, msg) {
  logger.error(msg || err.msg);
  logger.error(err.stack);
}

exports.errorOutput = errorOutput;
