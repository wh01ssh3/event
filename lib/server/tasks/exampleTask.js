'use strict';

////////////////////////////////////
// TODO: Примеер вызова задачи можно увидеть в контроллере сitController sendTask
////////////////////////////////////

// region Module dependencies.
const VError = require('verror');

const logger = require('../logger');
// endregion

const exampleTask = {
  name: 'exampleTask',
  handler: (context) => {
    logger.info(`Task executed. Context: ${JSON.stringify(context)}`);
    return Promise.resolve();
  }
};

exports.exampleTask = exampleTask;
