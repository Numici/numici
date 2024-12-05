;(function() {
	'use strict'; 
	
	angular.module('vdvcApp').controller('ConfirmDeleteAnnotationsCtrl',ConfirmDeleteAnnotationsCtrl);
	
	ConfirmDeleteAnnotationsCtrl.$inject = ['$scope', '$uibModalInstance'];
			
    function ConfirmDeleteAnnotationsCtrl($scope, $uibModalInstance) {
			
    	$scope.ok = ok;
    	$scope.cancel = cancel;
		
    	function ok() {
			$uibModalInstance.close();
		}
		
		function cancel() {
			$uibModalInstance.dismiss('cancel');
		}
	}
	
})();