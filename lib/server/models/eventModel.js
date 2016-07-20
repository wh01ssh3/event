'use strict';

const mongoose = require('mongoose');

const eventsSchema = new mongoose.Schema({
  title: {type: String, required: true},
  description: {type: String, required: false},
  date: {type: Date, 'default': Date.now, required: true},
  //image: {type: [{ uploaded: { type: Date, default: Date.now}, src: String}],
  //        default: [{uploaded: new Date(2016, 01, 01), src: '/img/default.png'}]
  //       }
  //participant: {type: String, required: false},
  privateStatus: {type: Boolean, default: false},
}, {
  strict: true,
  versionKey: false,
  collection: 'events'
});

exports.Event = mongoose.model('Event', eventsSchema);
