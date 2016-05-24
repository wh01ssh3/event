'use strict';

const http = require('http');
const _ = require('lodash');

class ResponseFactory {
  constructor(res) { this.res = res; }

  notFoundResource(message, options) {
    const opts = _.defaults(options || {}, {statusCode: 404});
    const responseMessage = {
      message: message || http.STATUS_CODES[opts.statusCode]
    };
    return this.res.status(opts.statusCode).json(responseMessage);
  }

  requestError(message, options) {
    const opts = _.defaults(options || {}, {statusCode: 400});
    const responseMessage = {
      message: message || http.STATUS_CODES[opts.statusCode]
    };
    return this.res.status(opts.statusCode).json(responseMessage);
  }

  validationError(message, options) {
    const opts = _.defaults(options || {}, {statusCode: 422, errors: null});
    delete options.errors.isOperational;
    const responseMessage = {
      message: message || http.STATUS_CODES[opts.statusCode],
      errors: opts.errors || 'Validation error'
    };

    return this.res.status(opts.statusCode).json(responseMessage);
  }

  unauthorized(message, options) {
    const opts = _.defaults(options || {}, {statusCode: 401});
    const responseMessage = {
      message: message || http.STATUS_CODES[opts.statusCode]
    };

    return this.res.status(opts.statusCode).json(responseMessage);
  }

  accessDenied(message, options) {
    const opts = _.defaults(options || {}, {statusCode: 403});
    const responseMessage = {
      message: message || http.STATUS_CODES[opts.statusCode]
    };

    return this.res.status(opts.statusCode).json(responseMessage);
  }

  serverError(message, options) {
    const opts = _.defaults(options || {}, {statusCode: 500});
    const responseMessage = {
      message: message || http.STATUS_CODES[opts.statusCode]
    };

    return this.res.status(opts.statusCode).json(responseMessage);
  }

  success(message, options) {
    const opts = _.defaults(options || {}, {statusCode: 200});
    const responseMessage = {
      message: message || http.STATUS_CODES[opts.statusCode]
    };

    return this.res.status(opts.statusCode).json(responseMessage);
  }

  created(obj, options) {
    const opts = _.defaults(options || {}, {statusCode: 201});
    const responseMessage = {
      _id: obj._id
    };

    return this.res.status(opts.statusCode).json(responseMessage);
  }

  NoContent(message, options) {
    const opts = _.defaults(options || {}, {statusCode: 204});
    const responseMessage = {
      message: message || http.STATUS_CODES[opts.statusCode]
    };

    return this.res.status(opts.statusCode).json(responseMessage);
  }
}

function responseMiddleware() {
  return (req, res, next) => {
    res.responses = new ResponseFactory(res);
    next();
  };
}

module.exports = responseMiddleware;
