;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('VDVCConfirmController',VDVCConfirmController);
	
	VDVCConfirmController.$inject = ['$scope','$uibModalInstance','VDVCConfirmData'];

	function VDVCConfirmController($scope,$uibModalInstance,VDVCConfirmData) {
		var vcc = this;
		
		// Instance variables
		vcc.title = VDVCConfirmData.title;
		vcc.text = VDVCConfirmData.text;
		vcc.actionButtonText = VDVCConfirmData.actionButtonText;
		vcc.closeButtonText = VDVCConfirmData.closeButtonText;
		
		// Methods
		vcc.ok = ok;
		vcc.cancel = cancel;
		
		function ok() {
			$uibModalInstance.close();
		}
		
		function cancel() {
			$uibModalInstance.dismiss('cancel');
		}
	}
})();