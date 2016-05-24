'use strict';
((angular) => {
  angular
    .module('core')
    .component('imageUpload', {
      templateUrl: 'core/components/imageUpload/imageUpload.view.html',
      controller: ImageUploadController,
      bindings: {
        quest: '='
      }
    })
    .directive('inputFileHandler', inputFileHandler);

  function ImageUploadController($rootScope, $scope, FilesUpload, Quests, toastr) {
    this.model = null;
    this.cropper = {
      cropWidth: 100,
      cropHeight: 100
    };

    $rootScope.$on('imageUploaded', () => {
      Quests.addImage({questId: this.quest._id}, {_id: this.model._id}).$promise.then(() => {
        this.quest.images.push({
          placeholder: 'http://placehold.it/225x150?text=Ожидается обработка'
        });
        toastr.success('Изображение успешно добавлено');
        this.model = null;
      });
    });

    this.fileInput = (evt) => {
      let file = evt.target.files[0];
      if (file) {
        FilesUpload.uploadForCrop(file);
        $scope.$apply(() => {
          this.model = file;
        });
      }
    };

    this.uploadFile = () => {
      FilesUpload.uploadAsync(this.model, this.cropper);
    };
  }

  function inputFileHandler() {
    return {
      restrict: 'A',
      require: '^imageUpload',
      link: (scope, element, attr, ctrl) => {
        element.bind('change', ctrl.fileInput);
      }
    };
  }
})(window.angular);
