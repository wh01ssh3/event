'use strict';

module.exports = (app) => {
  app.use('/api/auth', require('../controllers/authController'));
  app.use('/api/version', require('../controllers/versionController'));
  app.use('/api/events', require('../controllers/eventController'));
};
