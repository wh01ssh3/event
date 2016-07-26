'use strict';

const mongoose = require('mongoose');

const eventsSchema = new mongoose.Schema({
  title: {type: String, required: true},
  description: String,
  date: {type: Date, 'default': Date.now, required: true},
  removeDate: Date,
  coordinate: {
    longitude: Number,
    latitude:  Number
  },
  //image: {type: [{ uploaded: { type: Date, default: Date.now}, src: String}],
  //        default: [{uploaded: new Date(2016, 01, 01), src: '/img/default.png'}]
  //       }
  privateStatus: Boolean,
  user: [{
    _id: Object,
    nickname: String,
    login: String
  }]
}, {
  strict: true,
  versionKey: false,
  collection: 'events'
});

exports.Event = mongoose.model('Event', eventsSchema);
