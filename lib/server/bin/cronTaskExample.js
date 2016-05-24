#!/usr/bin/env node

// TODO: Таска вызываемая по крону

const taskService = require('../task');
const logger = require('../logger');

taskService.sendTask('exampleTask', {hello: 'world'})
  .then(() => {
    logger.info('exampleTask executed.');
    process.exit();
  })
  .catch((err) => {
    logger.error(err);
    process.exit(1);
  });
