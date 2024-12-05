;(function() {
	'use strict'; 
	
	angular.module('vdvcApp').controller('MaintenanceModeController',MaintenanceModeController);
	
	MaintenanceModeController.$inject = ['$rootScope','$scope','$state','$stateParams','_',
	        '$uibModal','ScheduleMaintenanceNtfService'];
	
	function MaintenanceModeController($rootScope,$scope,$state,$stateParams,_,$uibModal,
			ScheduleMaintenanceNtfService) {
		
		var mmc = this;
		
		function init() {
			if(!_.isEmpty($stateParams.message)) {
				var MaintenanceNtfModalInstance = ScheduleMaintenanceNtfService.open({text : $stateParams.message});
				MaintenanceNtfModalInstance.result.then(function () {
					$state.go("login",{"fromCode" : true});
				}, function () {
					 
				});
			}
		}
		
		init();
	}
})();