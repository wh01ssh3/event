/**
 * Created by Elenochka on 22.07.2016.
 */
'use strict';

// region Module dependencies.
const express = require('express');
const VError = require('verror');
const mongoose = require('mongoose');
const _ = require('lodash');
const path = require('path');
const bcrypt = require('bcryptjs');
const fsp = require('fs-promise');
const Promise = require('bluebird');

const dataOptions = require('../middlewares/dataOptions');


const User = mongoose.model('User');
// endregion

const router = express.Router();

function create(req, res, next) {
  const userBody = req.body;
  const userDoc = {
      login: userBody.login,
      password: userBody.password
    }
    ;
  bcrypt.genSalt = Promise.promisify(bcrypt.genSalt);
  bcrypt.hash = Promise.promisify(bcrypt.hash);
  if (userBody.date) {
    userDoc.date = userBody.date;
  }
  return bcrypt.genSalt()
    .then((salt) => {
      return bcrypt.hash(user.password, salt);
    })
    .then((hash) => {
      return User.create(_.assign(userDoc, {password: hash}));
    });
  /*return User.create(userDoc)
   .then((user) => {
   return res.json(user);
   })
   .catch((err) => {
   return next(err instanceof Error ? err : new VError(err));
   });*/
}

function createUsers() {
  const usersFilePath = path.resolve(__dirname, 'json', 'users.json');
  return fsp.readFile(usersFilePath)
    .then((text) => {
      let users = JSON.parse(text);
      return Promise.each(users, (user) => {
        const userDoc = {login: user.login};
        bcrypt.genSalt = Promise.promisify(bcrypt.genSalt);
        bcrypt.hash = Promise.promisify(bcrypt.hash);
        return bcrypt.genSalt()
          .then((salt) => {
            return bcrypt.hash(user.password, salt);
          })
          .then((hash) => {
            return User.create(_.assign(userDoc, {password: hash}));
          });
      });
    });
}

router.post('/', createUsers);
module.exports = router;
