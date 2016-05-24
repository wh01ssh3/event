'use strict';

var mongoose = require('mongoose');

var versionSchema = new mongoose.Schema({
  createDate: {type: Date, required: true, 'default': Date.now},
  version: {type: String, required: true},
  description: {type: String}
}, {
  strict: true,
  versionKey: false,
  collection: 'versions'
});

exports.Version = mongoose.model('Version', versionSchema);
