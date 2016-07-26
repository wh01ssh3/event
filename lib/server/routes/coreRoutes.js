'use strict';

module.exports = (app) => {
  app.use('/api/auth', require('../controllers/authController'));
  app.use('/api/version', require('../controllers/versionController'));
  app.use('/api/events', require('../controllers/eventController'));
  app.use('/api/user', require('../controllers/userController'));
  app.use('/api/events/:id([0-9A-F]{24})/user/', require('../controllers/userController'));

};
