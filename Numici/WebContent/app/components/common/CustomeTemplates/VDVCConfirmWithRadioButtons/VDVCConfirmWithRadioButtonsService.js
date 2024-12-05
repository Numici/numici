;(function(){
	'use strict';
		
	angular.module("vdvcApp").factory("VDVCConfirmWithRadioButtonsService",VDVCConfirmWithRadioButtonsService);
	
	VDVCConfirmWithRadioButtonsService.$inject = ['$uibModal','_'];

	function VDVCConfirmWithRadioButtonsService($uibModal,_) {
		
		var modalInstance;
		var VDVCConfirmWithRadioButtonsService = {
				open : open,
				close : close
		};
		return VDVCConfirmWithRadioButtonsService;
		
		function open(data) {
			var resolveData = {};
			var windowClass = "vdvc-confirm-with-radio-buttons-modal";
			if(!_.isEmpty(data)) {
				resolveData = data;
				if(!_.isEmpty(data.windowClass)) {
					windowClass = data.windowClass;
				}
			}
							
			modalInstance = $uibModal.open({
				  animation: true,
			      templateUrl: 'app/components/common/CustomeTemplates/VDVCConfirmWithRadioButtons/VDVCConfirmWithRadioButtonsTemplate.html',
			      controller: 'VDVCConfirmWithRadioButtonsController',
			      windowClass: windowClass,
			      appendTo : $('.rootContainer'),
			      controllerAs: 'vcwrbc',
			      backdrop: 'static',
			      resolve: {
			    	  VDVCConfirmWithRadioButtonsData : resolveData
			      }
			});
			return modalInstance;
		}
		
		function close() {
			if(modalInstance) {
				modalInstance.dismiss();
			}
		}
	}
})();