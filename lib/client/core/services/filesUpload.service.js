'use strict';

((angular) => {
  angular
    .module('core')
    .service('FilesUpload', FilesUpload);

  function FilesUpload($http, $log, $rootScope) {
    this.uploadForCrop = (file) => {
      let fileReader = new FileReader();
      fileReader.onload = () => {
        file = fileReader.result;
      };
      fileReader.readAsDataURL(file);
    };
    this.uploadAsync = (file, cropper) => {
      let fileReader = new FileReader();
      fileReader.onload = () => {
        let sendChain = (_id, name, chains, chainNum) => {
          if (chainNum === chains.length) {return 'ready'};
          $log.debug(`Sending chain ${chainNum}`);
          let data = {
            data: btoa(String.fromCharCode.apply(null, chains[chainNum])),
            chunk: chainNum
          };
          $log.debug('File preparation');
          return $http.post(`api/files/${_id}`, data).then(() => {
            $log.debug('File prepared');
            return sendChain(_id, name, chains, chainNum + 1);
          });
        };

        file.mode = 'sending';
        let arr = new Uint8Array(fileReader.result);
        let cropData = {
          height: cropper.cropImageHeight,
          width: cropper.cropImageWidth,
          x: cropper.cropImageLeft,
          y: cropper.cropImageTop
        };
        $http.post('api/files', {originalName: file.name, size: arr.length, crop: cropData}).then((res) => {
          $log.debug(`File was created ${res.data._id}`);
          file._id = res.data._id;
          let arrays = _.chunk(arr, res.data.chunkSize);
          sendChain(res.data._id, file.name, arrays, 0).then(() => {
            $http.post(`api/files/${res.data._id}/close`).then(() => {
              file.isUploaded = true;
              file._id = res.data._id;
              $rootScope.$emit('imageUploaded');
            });
          });
        });
      };
      file.mode = 'reading';
      fileReader.readAsArrayBuffer(file);
    };
  }
})(window.angular);
