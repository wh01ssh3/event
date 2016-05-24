'use strict';

// NB: Для корректной работы валидатора имена полей, находящиеся в req.body, req.query, req.params, не должны совпадать.

const _ = require('lodash');

module.exports = (schemaFactory) => {
  return (req, res, next) => {
    // Вызов  schemaFactory(req) делается перед клонированием объекта req, так как в некотрых схемах происходит очистка
    // пустых полей объекта req.body вызовом метода cleanFalsyItems
    const schema = schemaFactory(req);
    // -------------------------------

    const cloneParams = JSON.parse(JSON.stringify(req.params));
    // Все поля, которые необходимо завалидировать добавляются в req.params
    req.params = JSON.parse(JSON.stringify(_.assign({}, req.body, req.query, req.params)));
    req.checkParams(schema);
    req.asyncValidationErrors(true)
      .then(() => {
        // Восстанавливаем исходное состояние req.params
        req.params = cloneParams;
        return next();
      })
      .catch((err) => {
        delete err.isOperational;
        const errOptions = {
          errors: err
        };
        return res.responses.validationError('Validation error', errOptions);
      });
  };
};
