/**
 * Created by Elenochka on 01.08.2016.
 */
'use strict';

// region Module dependencies.
const express = require('express');
const VError = require('verror');
const mongoose = require('mongoose');
const imageSize = require('image-size');
const fileType = require('file-type');
const _ = require('lodash');
const slug = require('slug');

const logger = require('../logger');
const isAllow = require('../middlewares/isAllow');
const constants = require('../constants');
const config = require('../config');
const validate = require('../middlewares/validateSchema');
const fileValid = require('../validators/fileSchemas');
const fileService = require('../services/fileService');

const File = mongoose.model('File');
const User = mongoose.model('User');
const Quest = mongoose.model('Quest');
// endregion

const router = express.Router();

/*
 key: _id - fileId
 value: {
 gridStore: gsConnection,
 atime: Date.now(),
 name: originalName,
 _id: _id // fileId
 }
 */
const gridStores = {};

const FILE_MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const TIME_OPEN_CONNECTION_LIMIT = 60 * 60 * 1000; // 1h
const TIME_OF_CHECK = 30 * 60 * 1000; // 30 min

function closeOpenConnection() {
  logger.debug(`Count of open connections: ${Object.keys(gridStores).length}`);
  _.forOwn(gridStores, (value, key) => {
    if (Date.now() - value.atime > TIME_OPEN_CONNECTION_LIMIT) {
      value.gridStore.unlink()
        .then(() => {
          logger.debug('Connection closed.');
          delete gridStores[key];
        })
        .catch((err) => {
          logger.debug('Error: Connection closing.');
          logger.debug(err);
        });
    }
  });
}

function getFileInfo(storageId) {
  const _id = new mongoose.Types.ObjectId(storageId);
  const gs = new mongoose.mongo.GridStore(mongoose.connection.db, _id, 'r');
  return gs.open()
    .then(() => {
      const MAX_BUFFER_SIZE = 128 * 1024;
      return gs.read(MAX_BUFFER_SIZE)
        .then((buffer) => {
          gs.close();
          const fileTypeInfo = fileType(buffer);
          if (!fileTypeInfo) { return null; }
          fileTypeInfo.isImage = false;
          let imageDimensions = null;
          if (/image\/*/.test(fileTypeInfo.mime)) {
            try {
              imageDimensions = imageSize(buffer);
              fileTypeInfo.isImage = true;
            } catch (e) {}
          }
          return _.assign({}, fileTypeInfo, imageDimensions);
        });
    })
    .catch((err) => {
      return Promise.reject(err instanceof Error ? err : new VError(err));
    });
}

function startUploading(req, res, next) {
  const userId = String(req.user._id);
  const originalName = slug(req.body.originalName);
  const crop = req.body.crop;
  const _id = new mongoose.Types.ObjectId();
  const gridStore = new mongoose.mongo.GridStore(mongoose.connection.db, _id, originalName, 'w', {root: 'fs'});
  const conditions = {
    _id: userId,
    removeDate: {$exists: false}
  };
  const userPromise = User.findOne(conditions);
  const gsConnectionPromise = gridStore.open();
  return Promise.all([userPromise, gsConnectionPromise])
    .spread((user, gsConnection) => {
      if (!user || !gsConnection) { return res.responses.notFoundResource(); }
      const doc = {
        title: originalName,
        originalName: originalName,
        user: user,
        uploadStatus: 'open',
        storageId: _id,
        crop: crop
      };
      return File.create(doc)
        .then((file) => {
          gridStores[file._id.toString()] = {
            currentFileSize: 0,
            gridStore: gsConnection,
            atime: Date.now(),
            name: originalName,
            _id: _id
          };
          return res.json({_id: file._id, chunkSize: config.get('uploadChunkSize')});
        });
    })
    .catch((err) => { return next(err instanceof Error ? err : new VError(err)); });
}

function uploadChunk(req, res, next) { // TODO: добавить валидацию
  const data = req.body.data;
  const fileId = req.params.fileId;
  const gridStore = gridStores[fileId] && gridStores[fileId].gridStore;
  if (!gridStore) { return res.responses.notFoundResource(); }
  gridStores[fileId].currentFileSize += config.get('uploadChunkSize');
  if (gridStores[fileId].currentFileSize > FILE_MAX_SIZE) {
    return gridStore.unlink()
      .then(() => {
        delete gridStores[fileId];
        return res.responses.requestError('Максимальный допуситмый размер файла 10MB.');
      })
      .catch((err) => { return next(err instanceof Error ? err : new VError(err)); });
  }
  const buffer = new Buffer(data, 'base64');
  return gridStore.write(buffer)
    .then(() => { return res.responses.success(); })
    .catch((err) => { return next(err instanceof Error ? err : new VError(err)); });
}

// TODO: Clear gridStore
function finishUploading(req, res, next) {
  const fileId = req.params.fileId;
  const gridStore = gridStores[fileId] && gridStores[fileId].gridStore;
  if (!gridStore) { return res.responses.notFoundResource(); }
  const closeConnection = gridStore.close();
  const filePromise = File.findOne({_id: fileId});
  return Promise.all([filePromise, closeConnection])
    .spread((file, closeConnection) => {
      if (!file || !closeConnection) { return res.responses.notFoundResource(); }
      file.size = closeConnection.length;
      file.uploadStatus = 'close';
      const imageSizePromise = getFileInfo(file.storageId);
      return Promise.resolve(imageSizePromise)
        .then((fileInfo) => {
          if (fileInfo) {
            file.contentType = fileInfo.mime;
            if (fileInfo.isImage) {
              file.isImage = true;
              file.width = fileInfo.width;
              file.height = fileInfo.height;
            } else {
              fileService.removeFile(fileId);
              return res.responses.notFoundResource('Допустима загрузка только изображений.');
            }
          }
          delete gridStores[fileId];
          return file.save()
            .then((file) => { return res.json(file); });
        });
    })
    .catch((err) => { return next(err instanceof Error ? err : new VError(err)); });
}

function getFileById(req, res, next) {
  const fileId = req.params.fileId;
  const conditions = {
    _id: fileId,
    removeDate: {$exists: false}
  };
  return File.findOne(conditions)
    .then((file) => {
      if (!file) { return res.responses.notFoundResource(); }
      const gs = new mongoose.mongo.GridStore(mongoose.connection.db, file.storageId, 'r');
      return gs.open()
        .then((gsConnection) => {
          if (!gsConnection) { return res.responses.notFoundResource(); }
          const gsStream = gsConnection.stream();
          res.set('Content-Disposition', `inline; filename=${file.originalName}`);
          res.set('Content-Type', file.contentType);
          gsStream.on('error', (err) => {
            logger.error('Error: filesController: Stream file error');
            return Promise.reject(new VError(err, 'Stream file error'));
          });
          return gsStream.pipe(res);
        });
    })
    .catch((err) => {
      const error = err instanceof Error ? err : new VError(err);
      return next(error);
    });
}

function getFileMetaData(req, res, next) {
  const fileId = req.params.fileId;
  const conditions = {
    _id: fileId,
    removeDate: {$exists: false}
  };
  return File.findOne(conditions)
    .then((file) => {
      if (!file) { return res.responses.notFoundResource(); }
      return res.json(file);
    })
    .catch((err) => {
      const error = err instanceof Error ? err : new VError(err);
      return next(error);
    });
}

setInterval(closeOpenConnection, TIME_OF_CHECK);

router.post('/', startUploading);
router.post('/:fileId([0-9A-F]{24})', uploadChunk);
router.post('/:fileId([0-9A-F]{24})/close', finishUploading);
router.get('/:fileId([0-9A-F]{24})', getFileById);
router.get('/:fileId([0-9A-F]{24})/meta', getFileMetaData);

module.exports = router;
