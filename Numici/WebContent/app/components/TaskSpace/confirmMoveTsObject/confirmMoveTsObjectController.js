;(function() {
	'use strict'; 
	
	angular.module('vdvcApp').controller('confirmMoveTsObjectController',confirmMoveTsObjectController);
	
	confirmMoveTsObjectController.$inject = ['$scope', '$uibModal', '$uibModalInstance', '_'];
			
    function confirmMoveTsObjectController($scope, $uibModal, $uibModalInstance, _) {
			
    	$scope.moveDocumentTo = {"option" : ""};
    	
    	$scope.disableConfirm = disableConfirm;
    	$scope.ok = ok;
    	$scope.cancel = cancel;
		
    	function disableConfirm() {
    		if(!_.isEmpty($scope.moveDocumentTo.option)){
    			return false;
    		}
    		return true;
    	}
    	    	    	
		function ok() {
			$uibModalInstance.close($scope.moveDocumentTo.option);
		}
		
		function cancel() {
			$uibModalInstance.dismiss('cancel');
		}
	}
	
})();