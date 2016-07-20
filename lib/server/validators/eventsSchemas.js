/**
 * Created by Elenochka on 20.07.2016.
 */
'use strict';

const trimStrings = require('./helpers/sanitizer').trimStrings;

function create(req) {
  req.body = trimStrings(req.body);
  return{
    title: {
      notEmpty: {errorMessage: 'Укажите название мероприятия'},
    },
  };
}
