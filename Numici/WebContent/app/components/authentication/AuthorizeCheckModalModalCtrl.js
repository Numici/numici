;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('AuthorizeCheckModalModalCtrl',AuthorizeCheckModalModalCtrl);
	
	AuthorizeCheckModalModalCtrl.$inject = ['$scope','$uibModal', '$uibModalInstance'];

	function AuthorizeCheckModalModalCtrl($scope,$uibModal,$uibModalInstance) {
		var vm = this;
		
		// Instance variables
		
		// Methods
		vm.ok = ok;
		vm.cancel = cancel;
		
				
		function ok() {
			$uibModalInstance.close({"selectedOption" : "Configure"});
		}

		function cancel() {
			$uibModalInstance.dismiss('cancel');
		}
		
	}
	
})();