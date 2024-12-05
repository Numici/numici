;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('MoveToFolderConfirmController',MoveToFolderConfirmController);
	
	MoveToFolderConfirmController.$inject = ['$scope', '$uibModalInstance','resources'];
	
	function MoveToFolderConfirmController($scope, $uibModalInstance,resources) {
		  
		  var vm = this;
		  vm.item = resources.item;
		  vm.targetFldr = resources.targetFldr;
			
		  vm.replaceAllDocs = replaceAllDocs;
		  vm.skipAllDocs = skipAllDocs;
		  vm.replaceDoc = replaceDoc;
		  vm.skipDoc = skipDoc;
		  vm.cancel = cancel;
		  
		  function replaceAllDocs() {
			  $uibModalInstance.close({"action" : "replaceAll"});
		  }
		  
		  function skipAllDocs() {
			  $uibModalInstance.close({"action" : "skipAll"});
		  }
		  
		  function replaceDoc() {
			  $uibModalInstance.close({"action" : "replace",'_for':vm.item});
		  }
		  
		  function skipDoc() {
			  $uibModalInstance.close({"action" : "skip",'_for':vm.item});
		  }

		  function cancel() {
			  $uibModalInstance.dismiss('cancel');
		  }
		  
	}
})();