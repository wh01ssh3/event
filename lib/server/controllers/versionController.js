'use strict';

// region Module dependencies.
const express = require('express');
const config = require('../config');
// endregion

const router = express.Router();

function getVersion(req, res, next) { return res.json({version: config.get('version')});}

router.get('/', getVersion);

module.exports = router;
