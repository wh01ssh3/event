'use strict';

// region Module dependencies.
const util = require('util');
const http = require('http');
const _ = require('lodash');
const VError = require('verror');
// endregion

function IncorrectFilter(message) {
  this.status = 400;
  this.message = message || http.STATUS_CODES[400];
  Error.captureStackTrace(this, this.constructor);
}
util.inherits(IncorrectFilter, Error);
IncorrectFilter.prototype.name = 'IncorrectFilter';

function setSpecificValueFilter(value, valueType) {
  if (value.toLowerCase() === 'null') { return null; }
  switch (valueType) {
    case 'ObjectId': {
      let sanitizedId = value.toLowerCase();
      sanitizedId = _.padEnd(sanitizedId.replace(/[^0-9a-f]+/g, 0), 24, 0);
      sanitizedId = sanitizedId.substring(0, 24);
      return sanitizedId;
    }
    case 'SchemaBoolean': { return !(value.toLowerCase() === 'false' || value === '0'); }
    case 'SchemaNumber': {
      const convertedValue = Number(value);
      if (_.isFinite(convertedValue)) { return convertedValue; }
      throw new IncorrectFilter('Некорректное значение фильтра.');
    }
    case 'SchemaString': { return new RegExp(`.*${_.escapeRegExp(value)}.*`, 'i'); }
    default: throw new IncorrectFilter('Фильтрация по выбранному полю невозможна');
  }
}

function createCond(path, value, valueType) {
  if (_.isArray(path) && path.length > 1) {
    const valueObject = {};
    const lastPath = path[path.length - 1];
    valueObject[lastPath] = setSpecificValueFilter(value, valueType);
    const wrappedValue = {$elemMatch: valueObject};
    path.pop();
    return createCond(path, wrappedValue, valueType);
  }
  const result = {};
  if (_.isString(value)) {
    result[path] = setSpecificValueFilter(value, valueType);
  } else {
    result[path] = value;
  }
  return result;
}

function parser(sourcePath, value, Model) {
  const paths = sourcePath.split('$');
  const p = [];
  _.map(paths, (path, index) => {
    paths[index] = path.replace(/^\.|\.$/g, '');
    p.push('schema');
    p.push('paths');
    p.push(paths[index]);
  });
  if (!_.has(Model, p)) { return null; }
  const valueType = _.get(Model, p).casterConstructor
    && _.get(Model, p).casterConstructor.name
    || _.get(Model, p).constructor.name;
  return createCond(paths, value, valueType);
}

/**
 * Принимает на вход queryObject и формирует из него условаия для поиска
 *
 * queryObject {
 *               filterPath1 = 'user.profile.title', filterValue1 = 'Иван',
 *               filterPath2 = 'user.phone', filterValue2 = '7913'
 *             }
 * Conditions {
 *              'user.profile.title' = /.*Иван.*\/i',
 *              'user.phone' = '7913'
 *              }
 * @param Model Mongoose
 */
function filterConditions(Model) {
  return (req, res, next) => {
    const objQuery = req.query;
    const query = [];
    for (let key in objQuery) {
      if (objQuery.hasOwnProperty(key) && (/^filterPath\d{1,2}$/).test(key)) {
        const number = key.match(/\d+$/)[0];
        const valueNameProperty = `filterValue${number}`;
        const path = objQuery[key];
        const value = objQuery[valueNameProperty];
        const isPathOrValueString = _.isString(path) && _.isString(value);
        if (objQuery.hasOwnProperty(valueNameProperty) || isPathOrValueString) {
          const filter = {
            path: path,
            value: value
          };
          query.push(filter);
        }
      }
    }
    const conditions = [];
    try {
      _.forEach(query, (queryItem) => {
        const condition = parser(queryItem.path, queryItem.value, Model);
        if (!condition) { return null; }
        return conditions.push(condition);
      });
    } catch (e) {
      const err = e instanceof Error ? e : new VError(e);
      if (err instanceof IncorrectFilter) {
        return res.responses.requestError(err.message);
      }
      return next(err);
    }

    const groupConditions = _.groupBy(conditions, (cond) => {
      return cond && Object.keys(cond)[0];
    });
    let filters = _.map(groupConditions, (cond) => {
      if (cond.length > 1) { return {$or: cond}; }
      return cond[0];
    });
    if (filters && filters.length) {
      filters = {$and: filters};
    } else {
      filters = {};
    }
    req.filters = filters;
    return next();
  };
}

module.exports = filterConditions;
