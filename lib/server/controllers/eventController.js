/**
 * Created by Elenochka on 20.07.2016.
 */
'use strict';

// region Module dependencies.
const express = require('express');
const VError = require('verror');
const mongoose = require('mongoose');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const logger = require('../logger');

const dataOptions = require('../middlewares/dataOptions');


const Event = mongoose.model('Event');
const User = mongoose.model('User');
// endregion

const router = express.Router();

function create(req, res, next) {
  const eventBody = req.body;
  const eventDoc = {
    title: eventBody.title,
    description: eventBody.description,
    coordinate: eventBody.coordinate,
    privateStatus: eventBody.privateStatus,
    creator: req.user
  };
  if (eventBody.date) {
    eventDoc.date = eventBody.date;
  }
  const conditions = {
    title: eventBody.title,
    removeDate: {$exists: false}
  };
  Event.findOne(conditions)
    .then((event) => {
      if (event) {
        return res.status(406).json({'message': 'Событие с таким названием уже сушествует'})
      }
      return Event.create(eventDoc)
        .then((event) => {
          return res.json(event);
        })
        .catch((err) => {
          return next(err instanceof Error ? err : new VError(err));
        });
    })
}

function update(req, res, next) {
  const id = req.params.id;
  const eventBody = req.body;
  const conditions = {
    _id: id,
    removeDate: {$exists: false}
  };
  return Event.findOne(conditions)
    .then((event) => {
      if (!event) {
        return res.responses.notFoundResource();
      }
      event.title = eventBody.title;
      event.description = eventBody.description;
      event.date = eventBody.date;
      event.longitude = eventBody.longitude;
      event.latitude = eventBody.latitude;
      //push:{user};
      event.privateStatus = eventBody.privateStatus;
      return event.save()
        .then((event) => {
          return res.json(event);
        });
    })
    .catch((err) => {
      return next(err instanceof Error ? err : new VError(err));
    });
}

function getById(req, res, next) {
  const id = req.params.id;
  const conditions = {
    _id: id,
    removeDate: {$exists: false}
  };
  Event.findOne(conditions)
    .then((event) => {
      if (!event) {
        return res.responses.notFoundResource();
      }
      return res.json(event);
    })
    .catch((err) => {
      return next(err instanceof Error ? err : new VError(err));
    });
}

function destroy(req, res, next) {
  const id = req.params.id;
  const conditions = {
    _id: id,
    removeDate: {$exists: false}
  };
  return Event.findOne(conditions)
    .then((event) => {
      if (!event) {
        return res.responses.notFoundResource();
      }
      event.removeDate = Date.now();
      //было remove вместо save
      return event.save()
        .then(() => {
          return res.responses.success();
        });
    })
    .catch((err) => {
      return next(err instanceof Error ? err : new VError(err));
    });
}

function getAll(req, res, next) {
  //const user = req.user;
  //console.log(user);
  const conditions = {
    removeDate: {$exists: false}
  };
  return Event.find(conditions)
    .then((events) => {
      res.json(events);
    })
    .catch((err) => {
      return next(err instanceof Error ? err : new VError(err));
    });
}

function addUser(req, res, next) {
  const id = req.params.id;
  const userId = req.params.userId;
  const conditions = {
    _id: id,
    removeDate: {$exists: false}
  };
  const userConditions = {
    _id: userId,
    removeDate: {$exists: false}
  };
  const eventPromise = Event.findOne(conditions);
  const userPromise = User.findOne(userConditions);
  Promise.all([userPromise, eventPromise])
    .spread((user, event) => {
      event.user.push(user);
      user.event.push(event);
      return (user.save(), event.save());
    })
    .then((user, event) => {
      return res.json(user).json(event);
    });
}

function deleteUser(req, res, next) {
  const id = req.params.id;
  const userId = req.params.userId;
  const conditions = {
    _id: id,
    removeDate: {$exists: false}
  };
  const userConditions = {
    _id: userId,
    removeDate: {$exists: false}
  };
  const eventPromise = Event.findOne(conditions);
  const userPromise = User.findOne(userConditions);
  Promise.all([userPromise, eventPromise])
    .spread((user, event) => {
      event.user.pull(user);
      user.event.pull(event);
      return Promise.all([event.save(), user.save()]);
    })
    .spread((event) => {
      return res.json(event);
    });
}

function isAuth(req, res, next) {
  const advertHeader = req.header('X-Token');
  jwt.verify(advertHeader, 'secret', (err, token) => {
    if (err) {
      return res.responses.notFoundResource();
    }
    const conditions = {
      login: token.foo
    };
    return User.findOne(conditions)
      .then((user) => {
        logger.info(token.foo);
        req.user = user;
        next();
      }) ;
  });
}

router.post('/', isAuth, create);
router.put('/:id([0-9A-F]{24})', isAuth, update);
router.put('/:id([0-9A-F]{24})/user/:userId([0-9A-F]{24})', isAuth, addUser);
router.delete('/:id([0-9A-F]{24})/user/:userId([0-9A-F]{24})',isAuth, deleteUser);
router.get('/', getAll);
router.get('/:id([0-9A-F]{24})', getById);
router.delete('/:id([0-9A-F]{24})', isAuth, destroy);


module.exports = router;
