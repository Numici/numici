;(function() {
	'use strict'; 
	
	angular.module('vdvcApp').controller('confirmAnnotationContextModalCtrl',confirmAnnotationContextModalCtrl);
	
	confirmAnnotationContextModalCtrl.$inject = ['$scope', '$uibModalInstance'];
			
    function confirmAnnotationContextModalCtrl($scope, $uibModalInstance) {
			
			$scope.ok = ok;
			$scope.cancel = cancel;
			
			function ok() {
				$uibModalInstance.close(true);
			};

			function cancel() {
				$uibModalInstance.dismiss('cancel');
			};
		}
	
})();