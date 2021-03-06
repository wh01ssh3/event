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
const Promise = require('bluebird');
const validate = require('../middlewares/validateSchema');
const regValid = require('../validators/regSchemas');


const dataOptions = require('../middlewares/dataOptions');


const User = mongoose.model('User');
// endregion

const router = express.Router();

function createUser(req, res, next) {
  const userBody = req.body;
  const userDoc = {
    login: userBody.login,
    nickname: userBody.nickname,
    gender: userBody.gender
  };

  bcrypt.genSalt = Promise.promisify(bcrypt.genSalt);
  bcrypt.hash = Promise.promisify(bcrypt.hash);
  if (userBody.date) {
    userDoc.date = userBody.date;
  }
  const conditions = {
    login: userBody.login
  };
  User.findOne(conditions)
    .then((user) => {
      if (user) {
        return res.responses.notFoundResource();
      }
      return bcrypt.genSalt()
        .then((salt) => {
          return bcrypt.hash(userBody.password, salt);
        })
        .then((hash) => {
          return User.create(_.assign(userDoc, {password: hash}))
            .then((user)=>{
              return res.json(user)
            });
        });
    })
    .catch((err) => {
      return next(err instanceof Error ? err : new VError(err));
    });
}

function updateUser(req, res, next) {
  const id = req.user.id;
  const userBody = req.body;
  const conditions = {
    _id: id
  };
  bcrypt.genSalt = Promise.promisify(bcrypt.genSalt);
  bcrypt.hash = Promise.promisify(bcrypt.hash);
  return User.findOne(conditions)
    .then((user) => {
      if (!user) {
        return res.responses.notFoundResource();
      }
      user.nickname = userBody.nickname;
      user.town = userBody.town;
      user.gender = userBody.gender;
      user.birthday = userBody.birthday;
      user.email = userBody.email;
      //user.password = userBody.password;
      user.modifyDate = Date.now();
      return bcrypt.genSalt()
        .then((salt) => {
          return (bcrypt.hash(userBody.password, salt));
        })
        .then((hash) => {
          return user.save(_.assign(user, {password: hash}))
        })
        .then((user) => {
          return res.json(user);
        });
    })
    .catch((err) => {
      return next(err instanceof Error ? err : new VError(err));
    });
}

function getAllUsers(req, res, next) {
  const user = req.user;
  console.log(user);
  return User.find()
    .then((users) => {
      res.json(users);
    })
    .catch((err) => {
      return next(err instanceof Error ? err : new VError(err));
    });
}

function getById(req, res, next) {
  const id = req.params.id;
  const conditions = {
    _id: id,
  };
  User.findOne(conditions)
    .then((user) => {
      if (!user) {
        return res.responses.notFoundResource();
      }
      return res.json(user);
    })
    .catch((err) => {
      return next(err instanceof Error ? err : new VError(err));
    });
}

function getMyEvents(req, res, next) {
  const id = req.user.id;
  const conditions = {
    _id: id
  };
  User.findOne(conditions)
    .then((user) => {
      if (!user) {
        return res.responses.notFoundResource();
      }
      return res.json(user.event);
    })
    .catch((err) => {
      return next(err instanceof Error ? err : new VError(err));
    });
}

//Добавление валидации
router.post('/', validate(regValid.createUser), createUser);
router.put('/', updateUser);
router.get('/favorite', getMyEvents);
router.get('/', getAllUsers);
router.get('/:id([0-9A-F]{24})', getById);
module.exports = router;
