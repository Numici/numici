;(function(){
	'use strict';
		
	angular.module("vdvcApp").factory("ScheduleMaintenanceNtfService",ScheduleMaintenanceNtfService);
	
	ScheduleMaintenanceNtfService.$inject = ['$uibModal','_'];

	function ScheduleMaintenanceNtfService($uibModal,_) {
		
		var modalInstance;
		var ScheduleMaintenanceNtfService = {
				open : open,
				close : close
		};
		return ScheduleMaintenanceNtfService;
		
		function open(data) {
			var resolveData = {};
			if(!_.isEmpty(data)) {
				resolveData = data;
			}
							
			modalInstance = $uibModal.open({
				  animation: true,
			      templateUrl: 'app/components/Admin/Administration/MaintenanceSchedule/ScheduleMaintenanceNtf/ScheduleMaintenanceNtfTemplate.html',
			      controller: 'ScheduleMaintenanceNtfController',
			      windowClass: 'schedule-maintenance-ntf-modal',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'smnc',
			      backdrop: 'static',
			      resolve: {
			    	  ScheduleMaintenanceNtfData : resolveData
			      }
			});
			return modalInstance;
		}
		
		function close() {
			if(modalInstance) {
				modalInstance.close();
			}
		}
	}
})();