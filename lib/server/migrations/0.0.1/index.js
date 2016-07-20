'use strict';

// region Module dependencies.
const path = require('path');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const fsp = require('fs-promise');
const mongoose = require('mongoose');
const Promise = require('bluebird');

const User = mongoose.model('User');
const Event = mongoose.model('Event');
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

function createEvents() {
  const eventsFilePath = path.resolve(__dirname, 'json', 'events.json');
  return fsp.readFile(eventsFilePath)
    .then((text) => {
      let events = JSON.parse(text);
      return Promise.each(events, (event) => {
        const eventDoc = {
          title: event.title,
          description: event.description,
          /*date: events.date,
          image: events.image,
          participant: events.participant,
          private: events.private*/
        };
        return Event.create(eventDoc);
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
    .then(createEvents);
}

exports.getInfo = getInfo;
exports.migrate = migrate;
