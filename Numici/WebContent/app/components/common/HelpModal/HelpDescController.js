;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('HelpDescController',HelpDescController);
	
	HelpDescController.$inject = ['$scope','$uibModal', '$uibModalInstance','helpDescInputs'];

	function HelpDescController($scope,$uibModal,$uibModalInstance,helpDescInputs) {
		var vm = this;
		
		// Instance variables
		vm.title = helpDescInputs.title;
		vm.message = helpDescInputs.message;
		
		
		// Methods
		vm.cancel = cancel;
		
	
		
		
		function cancel() {
			$uibModalInstance.dismiss('cancel');
		}
		
	}
	
})();