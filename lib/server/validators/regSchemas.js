/**
 * Created by Elenochka on 25.07.2016.
 */
const trimStrings = require('./helpers/sanitizer').trimStrings;

function createUser(req) {
  req.body = trimStrings(req.body);
  return {
    login: {
      notEmpty: {errorMessage: 'Поле должно быть заполнено'},
      isLength: {
        options: [10, 10],
        errorMessage: 'Допустимая длина логина 10 символов'
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

exports.createUser = createUser;
