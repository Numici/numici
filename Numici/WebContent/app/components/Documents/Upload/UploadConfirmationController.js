;(function() {
	'use strict'; 
	
	angular.module('vdvcApp').controller('ConfirmUploadDocModalCtrl',ConfirmUploadDocModalCtrl);
	
	ConfirmUploadDocModalCtrl.$inject = ['$scope', '$uibModalInstance','existedFile'];
			
    function ConfirmUploadDocModalCtrl($scope, $uibModalInstance,existedFile) {
			
			$scope.existedFileName = existedFile.documentName;
			
			$scope.replaceAllDocs = function () {
				$uibModalInstance.close({"selectedOption":"replaceAll"});
			};
			
			$scope.skipAllDocs = function () {
				$uibModalInstance.close({"selectedOption":"skipAll"});
			};
			
			$scope.replaceDoc = function () {
				$uibModalInstance.close({"selectedOption":"replace",'_for':existedFile.documentName});
			};
			
			$scope.skipDoc = function () {
				$uibModalInstance.close({"selectedOption":"skip",'_for':existedFile.documentName});
			};

			$scope.cancel = function () {
				$uibModalInstance.dismiss('cancel');
			};
			
			
		}
	
})();