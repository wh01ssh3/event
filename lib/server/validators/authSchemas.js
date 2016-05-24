'use strict';

const trimStrings = require('./helpers/sanitizer').trimStrings;

function signIn(req) {
  req.body = trimStrings(req.body);
  return {
    login: {
      notEmpty: {errorMessage: 'Поле должно быть заполнено'},
      isLength: {
        options: [5, 20],
        errorMessage: 'Допустимая длина пароля 5-30 символов'
      }
    },
    password: {
      isLength: {
        options: [6, 20],
        errorMessage: 'Допустимая длина пароля 6-20 символов'
      },
      notEmpty: {errorMessage: 'Поле должно быть заполнено'}
    }
  };
}

exports.signIn = signIn;
