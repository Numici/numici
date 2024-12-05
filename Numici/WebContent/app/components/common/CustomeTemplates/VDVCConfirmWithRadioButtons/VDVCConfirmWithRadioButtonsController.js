;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('VDVCConfirmWithRadioButtonsController',VDVCConfirmWithRadioButtonsController);
	
	VDVCConfirmWithRadioButtonsController.$inject = ['$scope','$uibModalInstance','VDVCConfirmWithRadioButtonsData'];

	function VDVCConfirmWithRadioButtonsController($scope,$uibModalInstance,VDVCConfirmWithRadioButtonsData) {
		var vcwrbc = this;
		
		// Instance variables
		vcwrbc.confirmResponse = {"selectedOption" : ""};
		vcwrbc.title = VDVCConfirmWithRadioButtonsData.title;
		vcwrbc.text = VDVCConfirmWithRadioButtonsData.text;
		vcwrbc.radioBtns = VDVCConfirmWithRadioButtonsData.radioBtns;
		vcwrbc.actionButtonText = VDVCConfirmWithRadioButtonsData.actionButtonText;
		vcwrbc.closeButtonText = VDVCConfirmWithRadioButtonsData.closeButtonText;
		
		// Methods
		vcwrbc.ok = ok;
		vcwrbc.cancel = cancel;
		
		function ok() {
			$uibModalInstance.close(vcwrbc.confirmResponse);
		}
		
		function cancel() {
			$uibModalInstance.dismiss('cancel');
		}
	}
})();