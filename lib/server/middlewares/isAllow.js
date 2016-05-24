'use strict';

const _ = require('lodash');

/**
 *
 * @param permissions Array of roles.
 * @returns {Function}
 */
module.exports = () => {
  return (req, res, next) => {
    if (!req.user) { return res.responses.unauthorized(); }
    return next();
  };
};
