;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('MigrateUserActivityLogInfoController',MigrateUserActivityLogInfoController);
	
	MigrateUserActivityLogInfoController.$inject = ['$scope','$uibModalInstance','APIUserMessages','_','logInfo'];

	function MigrateUserActivityLogInfoController($scope,$uibModalInstance,APIUserMessages,_,logInfo) {
		var mualic = this;
		
		mualic.infoFor = angular.copy(logInfo.infoFor);
		mualic.info = !_.isEmpty(logInfo.info) ? angular.copy(logInfo.info) : "";
		
		mualic.close = close;
		mualic.copySuccess = copySuccess;
		mualic.copyFail = copyFail;
				
		function close() {
			$uibModalInstance.close();
		}
		
		function copySuccess() {
			APIUserMessages.info("Log info copied to clipboard.");
		}
		
		function copyFail(error) {
			console.log("copyFailError"+error);
		}
		
		function init() {
			if(!_.isEmpty(mualic.info)) {
				mualic.info = mualic.info.replace(/\r|\n/, "<br>");
			} else {
				mualic.info = "No info found";
			}
		}
		init();
	}	
	
})();