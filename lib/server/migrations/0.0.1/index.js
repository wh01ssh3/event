'use strict';

// region Module dependencies.
const path = require('path');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const fsp = require('fs-promise');
const mongoose = require('mongoose');
const Promise = require('bluebird');

const User = mongoose.model('User');
const News = mongoose.model('News');
// endregion

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
          .then((salt) => {return bcrypt.hash(user.password, salt);})
          .then((hash) => {return User.create(_.assign(userDoc, {password: hash}));});
      });
    });
}

function createNews() {
  const newsFilePath = path.resolve(__dirname, 'json', 'news.json');
  return fsp.readFile(newsFilePath)
    .then((text) => {
      let newsArray = JSON.parse(text);
      return Promise.each(newsArray, (news) => {
        const newsDoc = {
          title: news.title,
          body: news.body,
          image: news.image,
          source: news.source,
          type: news.type
        };
        return News.create(newsDoc);
      });
    });
}

function getInfo() {
  return Promise.resolve({
    version: '0.0.1',
    requiredVersion: '0.0.0'
  });
}

function migrate() {
  return Promise.resolve()
    .then(createUsers)
    .then(createNews);
}

exports.getInfo = getInfo;
exports.migrate = migrate;
