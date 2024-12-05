;(function(){
	'use strict';
		
	angular.module("vdvcApp").factory("VDVCAlertService",VDVCAlertService);
	
	VDVCAlertService.$inject = ['$uibModal','_'];

	function VDVCAlertService($uibModal,_) {
		
		var modalInstance;
		var VDVCAlertService = {
				open : open,
				close : close
		};
		return VDVCAlertService;
		
		function open(data) {
			var resolveData = {};
			if(!_.isEmpty(data)) {
				resolveData = data;
			}
							
			modalInstance = $uibModal.open({
				  animation: true,
			      templateUrl: 'app/components/common/CustomeTemplates/VDVCAlert/VDVCAlertTemplate.html',
			      controller: 'VDVCAlertController',
			      windowClass: 'orient-support-warn-modal',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'vac',
			      backdrop: 'static',
			      resolve: {
			    	  VDVCAlertData : resolveData
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