;(function() {
	'use strict';
	angular.module("vdvcApp").factory("TimeLogService",TimeLogService);
	
	TimeLogService.$inject = ['$rootScope','_','$log','$window'];
	
	function TimeLogService($rootScope,_,$log,$window) {
		var uri = 'data:application/vnd.ms-excel;base64,',
		template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>',
		base64 = function(s) { return $window.btoa(unescape(encodeURIComponent(s))); },
		format = function(s, c) { return s.replace(/{(\w+)}/g, function(m, p) { return c[p]; }) };
		var TimeLog = {
				timeLogInfo : [],
				setTimeLogInfo : setTimeLogInfo,
				getTimeLogInfo : getTimeLogInfo,
				clearLog : clearLog,
				tableToExcel : tableToExcel,
		};
		
		return TimeLog;
		
		function setTimeLogInfo(logInfo) {
			TimeLog.timeLogInfo.push(logInfo);
	    }
	    
	    function getTimeLogInfo() {
	    	return TimeLog.timeLogInfo;
	    }
	    
	    function clearLog() {
	    	TimeLog.timeLogInfo = [];
	    }

        function tableToExcel(tableId, worksheetName) {
			var table = angular.element(document.querySelector(tableId)),
				ctx = { worksheet: worksheetName, table: table.html() },
				href = uri + base64(format(template, ctx));
			return href;
		}

	}
	
})();