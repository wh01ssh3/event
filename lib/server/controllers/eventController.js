/**
 * Created by Elenochka on 20.07.2016.
 */
'use strict';

// region Module dependencies.
const express = require('express');
const VError = require('verror');
const mongoose = require('mongoose');
const _ = require('lodash');

const dataOptions = require('../middlewares/dataOptions');


const Event = mongoose.model('Event');
// endregion

const router = express.Router();

function create(req, res, next) {
  const eventBody = req.body;
  const eventDoc = {
    title: eventBody.title,
    description: eventBody.description,
    privateStatus: eventBody.privateStatus
  };
  if (eventBody.date) {
    eventDoc.date = eventBody.date;
  }
  return Event.create(eventDoc)
    .then((event) => {
      return res.json(event);
    })
    .catch((err) => {
      return next(err instanceof Error ? err : new VError(err));
    });
}

function list(req, res) {
  Event.find(function (err, events) {
    res.send(events);
  });
}

router.post('/create', create);
router.get('/all', list);

module.exports = router;
