'use strict';

const _ = require('lodash');

module.exports = (options) => {
  const middlewareOpts = _.defaults(options || {}, {
    sort: '-modifyDate',
    perPage: 20,
    maxPerPage: 100
  });
  return (req, res, next) => {
    const opts = {};
    const page = Number(req.query.page) || 0;
    const perPage = Number(req.query.perPage);

    if (perPage > middlewareOpts.maxPerPage) {
      const message = `Invalid perPage value ${perPage}, max value - ${middlewareOpts.maxPerPage}`;
      return res.responses.requestError(message);
    }

    opts.limit = perPage || middlewareOpts.perPage;
    opts.skip = page ? (page - 1) * opts.limit : 0;

    const sort = req.query.sort || middlewareOpts.sort;
    if (sort) {
      const sortArr = _.without(_.isArray(sort) ? sort : sort.replace(/ /g, '').split(','), '');
      if (sortArr.length > 0) {
        opts.sort = {};
        _.forEach(sortArr, (field) => {
          let direction = 1;
          if (field.indexOf('-') === 0) {
            direction = -1;
            field = field.substring(1);
          }
          opts.sort[field] = direction;
        });
      }
    }
    req.dataOptions = opts;
    return next();
  };
};
