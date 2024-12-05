;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('ScheduleMaintenanceNtfController',ScheduleMaintenanceNtfController);
	
	ScheduleMaintenanceNtfController.$inject = ['$scope','$uibModalInstance','ScheduleMaintenanceNtfData'];

	function ScheduleMaintenanceNtfController($scope,$uibModalInstance,ScheduleMaintenanceNtfData) {
		var smnc = this;
		
		// Instance variables
		smnc.title = ScheduleMaintenanceNtfData.title;
		smnc.text = ScheduleMaintenanceNtfData.text;
		
		// Methods
		smnc.close = close;
		
		function close() {
			$uibModalInstance.close();
		}
	}
})();