;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('CreateNoteBookController',CreateNoteBookController);
	CreateNoteBookController.$inject = ['$scope', '$uibModalInstance','OnenoteService',
	                                    'MessageService'];
	
	function CreateNoteBookController ($scope, $uibModalInstance,OnenoteService,
			MessageService) {
			  var vm = this;
			  
			  var CreateNotebook = CreateNotebook;
			  vm.showLoader = false;
			  vm.notebookName =  '';
			  vm.errMsg = null;
			  
			  vm.ok = ok;
			  vm.cancel = cancel;
			  
			  
			  function CreateNotebook(notebookName) {
				  vm.showLoader = true;
				  var postdata = {};
				  postdata = {
						 "displayName" : notebookName
				  };
				  OnenoteService.createNotebook(postdata).then(function(result){
					  if (result.status==200 && result.data.Status) {
						  var notebook = result.data.Data;
						  notebook["id"] = notebook.notebookId;
						  notebook["displayName"] = notebookName;
						  $uibModalInstance.close(notebook);
						  MessageService.showSuccessMessage("CREATE_ONENOTE_NOTEBOOK",[notebook.displayName]);
					  }
				  }).finally(function() {
					  vm.showLoader = false;
				  });
			  }
				
			  function ok() {
				  CreateNotebook(vm.notebookName);
			  }

			  function cancel() {
			    $uibModalInstance.dismiss('cancel');
			  }
		}
})();