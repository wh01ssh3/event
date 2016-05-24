'use strict';

const winston = require('winston');
winston.emitErrs = true;

const log = new winston.Logger({
  transports: [
    new winston.transports.File({
      level: 'debug',
      filename: `${__dirname}/../../logs/all.log`,
      handleExceptions: false,
      json: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      colorize: false
    }),
    new winston.transports.Console({
      level: 'debug',
      handleExceptions: false,
      json: false,
      colorize: true
    })
  ],
  exitOnError: false
});

const morganLog = new winston.Logger({
  transports: [
    new winston.transports.File({
      level: 'debug',
      filename: `${__dirname}/../../logs/morgan.log`,
      handleExceptions: false,
      json: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      colorize: false
    })
  ],
  exitOnError: false
});

module.exports = log;
module.exports.stream = {
  write: (message, encoding) => {
    morganLog.info(message);
  }
};
