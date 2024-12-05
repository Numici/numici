;(function(){
	
	'use strict';
	
	angular.module("vdvcApp").controller("EvernoteErrorController",EvernoteErrorController);
	
	EvernoteErrorController.$inject = ['$state','$stateParams','$rootScope','$scope','appData',
	                                   '_','VDVCAlertService','localStorageService','$window'];
	
	function EvernoteErrorController($state,$stateParams,$rootScope,$scope,appData,_,
			VDVCAlertService,localStorageService,$window){
		var appdata = appData.getAppData();
		
		$scope.$emit("PageName",{"userName":appdata.UserName,"pageName":$state.current.pageName});
		
		var errorMessage = $stateParams.error;
		
		function init() {
			if(!_.isEmpty($stateParams.error)) {
				var confirm = VDVCAlertService.open({ text: $stateParams.error });
				confirm.result.then(function() {
					localStorageService.set("OpenEverNoteConfig" ,"true");
					$window.location.href = $stateParams.redirectUrl;
				}, function() {
					localStorageService.set("OpenEverNoteConfig" ,"true");
					$window.location.href = $stateParams.redirectUrl;
				});
			}
		}
		
		init();
	}
})();