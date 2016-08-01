'use strict';

var request = require('request');
var async = require('async');
var fs = require('fs');
var _ = require('lodash');
var path = require('path');

var log = require('./../../lib/server/log');
var server = require('./../../lib/server/server');
var db = require('./../../lib/server/db');

function login(login, password, next) {
  var requestOptions = {
    url: 'http://localhost:8091/api/auth/login',
    method: 'POST',
    body: {
      login: login,
      password: password
    },
    json: true
  };
  request(requestOptions, (err, res) => {
    var cookie = res.headers['set-cookie'][0];
    next(null, cookie);
  });
}

function fileUpload(test) {
  async.auto({
    login: (next) => { login('admin', 'admin', next); },
    open: ['login', (next, results) => {
      var cookie = results.login;
      var requestOptions = {
        headers: {Cookie: cookie},
        url: 'http://localhost:8091/api/files',
        method: 'POST',
        body: {
          originalName: '2MB.jpg',
          size: '2105043',
          node: {_id: 1}
        },
        json: true
      };
      request(requestOptions, (err, res, body) => {
        if (err) { return next(err); }
        next(null, body);
      });
    }],
    upload: ['open', (next, results) => {
      var cookie = results.login;
      var body = results.open;
      var filePath = path.resolve(__dirname, '..', 'images', '2MB.jpg');
      var file = fs.readFileSync(filePath);
      var arrays = _.chunk(file, body.chunkSize);
      async.reduce(arrays, null, (memo, chunk, cd) => {
        var requestOptions = {
          headers: {Cookie: cookie},
          url: `http://localhost:8091/api/files/${body._id}`,
          method: 'POST',
          body: {
            data: new Buffer(chunk).toString('base64')
          },
          json: true
        };
        request(requestOptions, (err, res, body) => { cd(err, body); });
      }, next);
    }],
    close: ['upload', (next, results) => {
      var cookie = results.login;
      var body = results.open;
      var requestOptions = {
        headers: {Cookie: cookie},
        url: `http://localhost:8091/api/files/${body._id}/close`,
        method: 'POST'
      };
      request(requestOptions, (err, res, body) => {
        if (err) { return next(err); }
        next(null, body);
      });
    }]
  }, (err, results) => {
    if (err) { return test.done(err); }
    log.info(results.close);
    test.done();
  });
}

module.exports = {
  setUp: function (next) {
    async.series([
      db.start,
      server.start
    ], next);
  },
  tearDown: function (next) {
    async.series([
      server.stop,
      db.stop
    ], next);
  },
  fileUpload: fileUpload
};
