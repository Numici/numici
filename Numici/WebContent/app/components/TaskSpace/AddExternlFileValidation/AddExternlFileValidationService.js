;(function() {
	
	angular.module("vdvcApp").factory("AddExternlFileValidationService",AddExternlFileValidationService);
	
	AddExternlFileValidationService.$inject = ['httpService','$uibModal'];
	
	function AddExternlFileValidationService(httpService,$uibModal) {
		var AddExternlFileValidation = {
				openAddExternlFileValidationModal : openAddExternlFileValidationModal
		};
		return AddExternlFileValidation;
		
	    function openAddExternlFileValidationModal (source) {
	    	modalInstance = $uibModal.open({
				animation: true,  
				templateUrl: 'app/components/TaskSpace/AddExternlFileValidation/AddExternlFileValidationModal.html',
			    controller: 'AddExternlFileValidationController',
			    controllerAs : 'aefvc',
			    backdrop: "static",
			    windowClass : "confirm-signedin-modal",
			    size: "md",
			    resolve : {
			    	source : {"ExternlFileSource" : source}
			    }
			});
			return modalInstance;
		}
	}
})();