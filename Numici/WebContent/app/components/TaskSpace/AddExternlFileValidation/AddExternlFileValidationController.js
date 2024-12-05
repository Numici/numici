;(function() {
	'use strict'; 
	
	angular.module('vdvcApp').controller('AddExternlFileValidationController',AddExternlFileValidationController);
	
	AddExternlFileValidationController.$inject = ['$scope','$uibModalInstance','_','source','MessageService'];
	
	function AddExternlFileValidationController($scope,$uibModalInstance,_,source,MessageService) {
		
		var aefvc = this;
		
		//variables
		aefvc.AddExternlFileValidationMessage = MessageService.confirmMessages.ADD_EXTERNAL_DOC_CNF_MSG;
		
		//methods
		aefvc.selectedResponse = selectedResponse;
				
		function selectedResponse(userResponse) {
			$uibModalInstance.close(userResponse);
		}
	}
})();