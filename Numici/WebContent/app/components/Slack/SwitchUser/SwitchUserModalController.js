;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('SwitchUserModalController',SwitchUserModalController);
	SwitchUserModalController.$inject = ['$scope', '$uibModalInstance','message'];
	
	function SwitchUserModalController ($scope, $uibModalInstance,message) {
			  var vm = this;
			  
			  var CreateFolder = CreateFolder;
			  
			  vm.message = message;
			  vm.ok = ok;
			  vm.cancel = cancel;
				
			  function ok() {
				  $uibModalInstance.close();
			  }

			  function cancel() {
			    $uibModalInstance.dismiss('cancel');
			  }
		}
})();