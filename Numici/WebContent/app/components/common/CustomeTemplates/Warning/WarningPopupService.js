;(function(){
	'use strict';
		
	angular.module("vdvcApp").factory("WarningPopupService",WarningPopupService);
	
	WarningPopupService.$inject = ['$uibModal','_'];

	function WarningPopupService($uibModal,_) {
		
		var defaultData = {
				"title" : "",
				"message" : "You don't have permission",
				"enableHeader" : true,
				"enableFooter" : true
			};
		var modalInstance;
		var WarningPopupService = {
				open : open,
				close : close
		};
		return WarningPopupService;
		
		function open(data) {
			var resolveData = {};
			if(!_.isEmpty(data)) {
				resolveData = _.extend(resolveData,defaultData,data);
			}else {
				resolveData = defaultData;
			}
				
			modalInstance = $uibModal.open({
				  animation: true,
			      templateUrl: 'app/components/common/CustomeTemplates/Warning/WarningTemplate.html',
			      controller: 'WarningController',
			      windowClass: 'orient-support-warn-modal',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'wc',
			      backdrop: 'static',
			      resolve: {
			    	  data : resolveData
			      }
			 });
		}
		
		function close() {
			if(modalInstance) {
				modalInstance.dismiss();
			}
		}
				
	}
})();