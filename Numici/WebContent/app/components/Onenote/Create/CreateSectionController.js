;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('CreateSectionController',CreateSectionController);
	CreateSectionController.$inject = ['$scope', '$uibModalInstance','OnenoteService',
	                                   'CurrntNoteBook','MessageService'];
	
	function CreateSectionController ($scope, $uibModalInstance,OnenoteService,CurrntNoteBook,
			MessageService) {
			  var vm = this;
			  
			  var CreateSection = CreateSection;
			  vm.showLoader = false;
			  vm.sectionName =  '';
			  vm.errMsg = null;
			  
			  vm.ok = ok;
			  vm.cancel = cancel;
			  
			  
			  function CreateSection(sectionName) {
				  vm.showLoader = true;
				  var postdata = {
							"notebookId" : CurrntNoteBook.id,
							"displayName" : sectionName
					};
				 
				  OnenoteService.createSection(postdata).then(function(result){
					  if (result.status==200 && result.data.Status) {
						  var section = result.data.Data;
						  section["id"] = section.sectionId;
						  section["displayName"] = sectionName;
						  $uibModalInstance.close(section);
						  MessageService.showSuccessMessage("CREATE_ONENOTE_SECTION",[section.displayName]);
					  }
				  }).finally(function() {
					  vm.showLoader = false;
				  });	
			  }
				
			  function ok() {
				  CreateSection(vm.sectionName);
			  }

			  function cancel() {
			    $uibModalInstance.dismiss('cancel');
			  }
		}
})();