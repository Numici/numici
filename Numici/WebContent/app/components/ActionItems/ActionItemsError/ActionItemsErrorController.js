;(function() {
	'use strict'; 
	
	angular.module('vdvcApp').controller('ActionItemsErrorController',ActionItemsErrorController);
	
	ActionItemsErrorController.$inject = ['$scope','$uibModalInstance','ActionItemsError'];
	
	function ActionItemsErrorController($scope,$uibModalInstance,ActionItemsError) {
		
		 var aiec = this;
		 
		 aiec.ActionItemsError = angular.copy(ActionItemsError.message);
		 
		 aiec.ok = ok;
		 aiec.cancel = cancel;
		 
		 function ok(){
			 $uibModalInstance.close(true);
		 }
		 
		 function cancel() {
			 $uibModalInstance.dismiss('cancel');
		 }
	}
})();