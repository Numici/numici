; (function() {
	'use strict';
	angular.module("vdvcApp").controller("TimeLogModalController", TimeLogModalController);

	TimeLogModalController.$inject = ['$rootScope', '_', 'TimeLogService', '$uibModalInstance', '$timeout'];

	function TimeLogModalController($rootScope, _, TimeLogService, $uibModalInstance, $timeout) {
		var vm = this;

		vm.timeLog = TimeLogService.timeLogInfo;
		vm.cancel = cancel;
		vm.clearlog = clearlog;
		vm.tableToExcel = tableToExcel;

		function clearlog() {
			TimeLogService.clearLog();
			vm.timeLog = TimeLogService.timeLogInfo;
		}

		function cancel() {
			$uibModalInstance.dismiss('cancel');
		}

		function tableToExcel() {
			var exportHref = TimeLogService.tableToExcel("#timeLog", "timeLog");
			$timeout(function() {

				var dt = new Date();
				var day = dt.getDate();
				var month = dt.getMonth() + 1;
				var year = dt.getFullYear();
				var hour = dt.getHours();
				var mins = dt.getMinutes();
				var postfix = day + "." + month + "." + year + "_" + hour + "." + mins;
				//creating a temporary HTML link element (they support setting file names)
				var a = document.createElement('a');
				//getting data from our div that contains the HTML table
				a.href = exportHref;
				//setting the file name
				a.download = 'time_log' + postfix + '.xls';
				//triggering the function
				a.click();
			}, 100);
		}

	}

})();