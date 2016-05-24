'use strict';

// region Module dependencies.
const express = require('express');
const VError = require('verror');
const mongoose = require('mongoose');
const slug = require('slug');
const _ = require('lodash');

const dataOptions = require('../middlewares/dataOptions');
const validate = require('../middlewares/validateSchema');
const cityValid = require('../validators/citySchemas');
const isAllow = require('../middlewares/isAllow');

const City = mongoose.model('City');
// endregion

const router = express.Router();

function create(req, res, next) {
  const cityBody = req.body;
  const cityDoc = {
    title: cityBody.title,
    slug: slug(cityBody.title)
  };
  return City.create(cityDoc)
    .then((city) => { return res.json(city); })
    .catch((err) => { return next(err instanceof Error ? err : new VError(err)); });
}

function getById(req, res, next) {
  const id = req.params.id;
  const conditions = {
    _id: id,
    removeDate: {$exists: false}
  };
  City.findOne(conditions)
    .then((city) => {
      if (!city) { return res.responses.notFoundResource(); }
      return res.json(city);
    })
    .catch((err) => { return next(err instanceof Error ? err : new VError(err)); });
}

function getAll(req, res, next) {
  let startWith = req.query.startWith;
  let conditions = {
    removeDate: {$exists: false}
  };
  const limit = req.dataOptions.limit;
  if (startWith) {
    startWith = startWith.replace(/[её]/g, '(е|ё)');
    conditions = _.assign(conditions, {
      title: new RegExp(`^${startWith}`, 'i')
    });
  }
  const cityFind = City.find(conditions, null, req.dataOptions);
  const cityCount = City.count(conditions);
  return Promise.all([cityFind, cityCount])
    .spread((cities, count) => {
      res.set('X-Count-Items', count);
      res.set('X-Count-Pages', Math.ceil(count / limit));
      return res.json(cities);
    })
    .catch((err) => { return next(err instanceof Error ? err : new VError(err)); });
}

function update(req, res, next) {
  const id = req.params.id;
  const cityBody = req.body;
  const conditions = {
    _id: id,
    removeDate: {$exists: false}
  };
  return City.findOne(conditions)
    .then((city) => {
      if (!city) { return res.responses.notFoundResource(); }
      city.title = cityBody.title;
      city.slug = slug(cityBody.title);
      city.modifyDate = Date.now();
      return city.save()
        .then((city) => { return res.json(city); });
    })
    .catch((err) => { return next(err instanceof Error ? err : new VError(err)); });
}

function destroy(req, res, next) {
  const id = req.params.id;
  const conditions = {
    _id: id,
    removeDate: {$exists: false}
  };
  return City.findOne(conditions)
    .then((city) => {
      if (!city) { return res.responses.notFoundResource(); }
      city.removeDate = Date.now();
      return city.save()
        .then(() => { return res.responses.success(); }); })
    .catch((err) => { return next(err instanceof Error ? err : new VError(err)); });
}

router.post('/', isAllow(['Главный администратор', 'Администратор']), validate(cityValid.city), create);
router.get('/', isAllow(['Главный администратор', 'Администратор']), dataOptions(), getAll);
router.get('/:id([0-9A-F]{24})', isAllow(['Главный администратор', 'Администратор']), getById);
router.put('/:id([0-9A-F]{24})', isAllow(['Главный администратор', 'Администратор']), validate(cityValid.city), update);
router.delete('/:id([0-9A-F]{24})', isAllow(['Главный администратор', 'Администратор']), destroy);

module.exports = router;
