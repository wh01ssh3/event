'use strict';

const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  login: {type: String, required: true},
  nickname: String,
  password: {type: String, required: true},
  confirmPassword: String,
  createDate: {type: Date, 'default': Date.now, required: true},
  modifyDate: {type: Date, 'default': Date.now, required: true},
  event: [
    {
      _id: Object,
      title: String,
      description: String,
      date: Date,
      coordinate: {
        longitude: Number,
        latitude:  Number
      },
      privateStatus: Boolean
    }
  ]
}, {
  strict: true,
  versionKey: false,
  collection: 'users'
});

exports.User = mongoose.model('User', accountSchema);
