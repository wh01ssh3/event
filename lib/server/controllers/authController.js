'use strict';

// region Module dependencies.
const express = require('express');
const VError = require('verror');
const passport = require('passport');
const Promise = require('bluebird');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const logger = require('../logger');
const validate = require('../middlewares/validateSchema');
const authValid = require('../validators/authSchemas');

// endregion

const User = mongoose.model('User');

const router = express.Router();

function signIn(req, res, next) {
  return Promise.resolve()
    .then(() => {
      logger.info('Auth by login "%s:...', req.body.login);
      bcrypt.genSalt = Promise.promisify(bcrypt.genSalt);
      bcrypt.hash = Promise.promisify(bcrypt.hash);
      const token = jwt.sign({foo: req.body.login}, 'secret');
      return passport.authenticate('loginUsers', (err, user, info) => {
        if (err) { return next(new VError(err, 'authenticate failed')); }
        if (!user) { return res.status(401).json({message: info.message}); }
        return req.logIn(user, (err) => {
          if (err) { return next(new VError(err, 'req.logIn failed')); }
          logger.info('Account "%s" auth successfully.', req.body.login);
          logger.info('Token: ', token);
          return res.json({"token": token});
        });
      })(req, res, next);
    })
    .catch((err) => { return next(err instanceof Error ? err : new VError(err)); });
}

function signOut(req, res, next) {
  return Promise.resolve()
    .then(() => {
      if (req.user) {
        logger.info('Account "%s" logout.', req.user.login);
        req.logout();
      }
      return res.status(204).end();
    })
    .catch((err) => { return next(err instanceof Error ? err : new VError(err)); });
}

router.post('/signin', validate(authValid.signIn), signIn);
router.get('/signout', signOut);

module.exports = router;
