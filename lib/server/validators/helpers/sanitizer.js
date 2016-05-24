'use strict';

const _ = require('lodash');

/**
 *
 * @param rawObj
 * @returns {*}
 */
function removeFalsyItems(rawObj) {
  const clone = JSON.parse(JSON.stringify(rawObj));
  let accumulator = {};
  if (_.isArray(rawObj)) { accumulator = []; }
  return _.reduce(clone, (result, value, key) => {
    if (_.isObject(value)) { value = removeFalsyItems(value); }

    if (_.isString(value)) { value = _.trim(value);} // trim
    if (!value && value !== 0) { return result; } // remove falsy item
    if (_.isObject(value) && _.isEmpty(value)) { return result; } // remove empty arrays and objects

    if (_.isArray(result)) {
      result.push(value);
      return result;
    }
    const obj = {};
    obj[key] = value;
    return _.assign({}, result, obj);
  }, accumulator);
}

function trimStrings(rawObj) {
  const clone = JSON.parse(JSON.stringify(rawObj));
  let accumulator = {};
  if (_.isArray(rawObj)) { accumulator = []; }
  return _.reduce(clone, (result, value, key) => {
    if (_.isObject(value)) { value = trimStrings(value); }

    if (_.isString(value)) { value = _.trim(value);} // trim

    if (_.isArray(result)) {
      result.push(value);
      return result;
    }
    const obj = {};
    obj[key] = value;
    return _.assign({}, result, obj);
  }, accumulator);
}

exports.removeFalsyItems = removeFalsyItems;
exports.trimStrings = trimStrings;
