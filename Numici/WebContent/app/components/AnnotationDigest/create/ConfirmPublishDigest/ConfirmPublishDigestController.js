;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('ConfirmPublishDigestController',ConfirmPublishDigestController);
	
	ConfirmPublishDigestController.$inject = ['$scope','$uibModalInstance','ConfirmData'];

	function ConfirmPublishDigestController($scope,$uibModalInstance,ConfirmData) {
		var cpdc = this;
		
		// Instance variables
		cpdc.ConfirmData = angular.copy(ConfirmData);
		// Methods
		cpdc.confirmAction = confirmAction;
		cpdc.cancel = cancel;
				
		function confirmAction(action) {
			$uibModalInstance.close({"action" : action});
		}
		
		function cancel() {
			$uibModalInstance.dismiss("cancel");
		}
		
	}
})();