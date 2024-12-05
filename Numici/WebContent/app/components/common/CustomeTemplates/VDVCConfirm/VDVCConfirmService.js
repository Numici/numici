;(function(){
	'use strict';
		
	angular.module("vdvcApp").factory("VDVCConfirmService",VDVCConfirmService);
	
	VDVCConfirmService.$inject = ['$uibModal','_'];

	function VDVCConfirmService($uibModal,_) {
		
		var modalInstance;
		var VDVCConfirmService = {
				open : open,
				close : close
		};
		return VDVCConfirmService;
		
		function open(data) {
			var resolveData = {};
			var windowClass = "orient-support-warn-modal";
			if(!_.isEmpty(data)) {
				resolveData = data;
				if(!_.isEmpty(data.windowClass)) {
					windowClass = data.windowClass;
				}
			}
							
			modalInstance = $uibModal.open({
				  animation: true,
			      templateUrl: 'app/components/common/CustomeTemplates/VDVCConfirm/VDVCConfirmTemplate.html',
			      controller: 'VDVCConfirmController',
			      windowClass: windowClass,
			      appendTo : $('.rootContainer'),
			      controllerAs: 'vcc',
			      backdrop: 'static',
			      resolve: {
			    	  VDVCConfirmData : resolveData
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