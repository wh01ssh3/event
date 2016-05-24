'use strict';

// region Module dependencies.
const passport = require('passport');
const mongoose = require('mongoose');
const passportLocal = require('passport-local');
const VError = require('verror');
const bcrypt = require('bcryptjs');

const User = mongoose.model('User');
// endregion

module.exports = (app) => {
  // Serialize sessions
  passport.serializeUser((user, done) => { return done(null, user._id); });

  // Deserialize sessions
  passport.deserializeUser((_id, done) => {
    User.findOne({_id}, {password: false})
      .then((user) => { return done(null, user); })
      .catch((err) => { return done(err); });
  });

  passport.use('loginUsers', new passportLocal.Strategy({
    usernameField: 'login',
    passwordField: 'password'
  }, (login, password, next) => {
    User.findOne({login: login})
      .then((user) => {
        if (!user) { return next(null, false, {message: 'Неверный логин.'}); }
        if (user.removeDate) { return next(null, false, {message: 'Пользователь удален.'}); }
        return bcrypt.compare(password, user.password, (err, res) => {
          if (err) { return next(new VError(err)); }
          if (!res) { return next(null, false, {message: 'Неверный пароль.'}); }
          user = user.toObject();
          delete user.password;
          return next(null, user);
        });
      })
      .catch((err) => { return next(new VError(err)); });
  }));

  // Add passport's middleware
  app.use(passport.initialize());
  app.use(passport.session());
};
