'use strict';

// region Module dependencies.
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const session = require('express-session');
const expressValidator = require('express-validator');
const MongoStore = require('connect-mongo')(session);
const helmet = require('helmet');
const path = require('path');
const glob = require('glob');

const logger = require('./logger');
const config = require('./config');
const responses = require('./middlewares/responses');
const passportConf = require('./passport');
// endregion

/**
 * Initialize local constiables
 */
module.exports.initLocalconstiables = (app) => {
  app.use((req, res, next) => {
    res.locals.host = `${req.protocol}://${req.hostname}`;
    res.locals.url = `${req.protocol}://${req.headers.host}${req.originalUrl}`;
    next();
  });
};

/**
 * Initialize application middleware
 */
module.exports.initMiddleware = (app) => {
  app.use(morgan(':method :url :status :response-time ms - :res[content-length]', {stream: logger.stream}));

  app.use((req, res, next) => {
    const originalUrl = req.originalUrl;
    switch (true) {
      case /\/api\/files.*/.test(originalUrl):
        return bodyParser.json({limit: config.get('uploadChunkSize') * 2})(req, res, next);
      default:
        return bodyParser.json()(req, res, next);
    }
  });
  app.use((err, req, res, next) => {
    return res.status(400).json({message: 'Invalid JSON string.'});
  });
  app.use(responses());
  app.use(expressValidator());
  passportConf(app);
};

/**
 * Configure Express session
 */
module.exports.initSession = (app, dbConnection) => {
  app.use(session({
    saveUninitialized: true,
    resave: true,
    secret: config.get('sessionSecret'),
    store: new MongoStore({
      mongooseConnection: dbConnection
    })
  }));
};

/**
 * Configure Helmet headers configuration
 */
module.exports.initHelmetHeaders = (app) => {
  // Use helmet to secure Express headers
  const SIX_MONTHS = 15778476000;
  app.use(helmet.xframe());
  app.use(helmet.xssFilter());
  app.use(helmet.nosniff());
  app.use(helmet.ienoopen());
  app.use(helmet.hsts({
    maxAge: SIX_MONTHS,
    includeSubdomains: true,
    force: true
  }));
  app.disable('x-powered-by');
};

/**
 * Configure the modules static routes
 */
module.exports.initModulesClientRoutes = (app) => {
  app.use('/', express.static(path.resolve('./public')));
};

/**
 * Configure the modules server routes
 */
module.exports.initModulesServerRoutes = (app) => {
  glob.sync('./lib/server/routes/*.js')
    .forEach((file) => {
      require(path.resolve(file))(app);
    });
};

/**
 * Configure error handling
 */
module.exports.initErrorRoutes = (app) => {
  app.use((err, req, res, next) => {
    if (!err) { return next(); }

    const result = {
      status: 500,
      message: err.message || 'Error'
    };
    logger.error('Unexpected Error in controller');
    logger.error(err.stack || err);
    res.statusCode = result.status;
    return res.json(result);
  });
};

module.exports.notFoundRoutes = (app) => {
  app.use('/api/*', (req, res) => {
    res.responses.notFoundResource('Endpoint not found');
  });
  if (config.get('env') === 'dev-local') {
    app.use((req, res) => { res.sendFile('index.html', {root: path.resolve(__dirname, '../../', 'public')}); });
  }
};

/**
 * Initialize the Express application
 */
module.exports.init = (dbConnection) => {
  // Initialize express app
  let app = express();

  // Initialize local constiables
  this.initLocalconstiables(app);

  // Initialize Express session
  this.initSession(app, dbConnection);

  // Initialize Express middleware
  this.initMiddleware(app);

  // Initialize Helmet security headers
  this.initHelmetHeaders(app);

  // Initialize modules static client routes, before session!
  this.initModulesClientRoutes(app);

  // Initialize modules server routes
  this.initModulesServerRoutes(app);

  // Initialize error routes
  this.initErrorRoutes(app);

  // Initialize notFound routes
  this.notFoundRoutes(app);

  return app;
};
