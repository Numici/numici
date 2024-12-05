;(function(){
	
	'use strict';
	
	angular.module("vdvcApp").controller("PublicADWarningController",PublicADWarningController);
	
	PublicADWarningController.$inject = ['$rootScope','$state','$stateParams','$scope','appData','userService',
	                                     'AuthService','TimeLogService','$window'];
	
	function PublicADWarningController($rootScope,$state,$stateParams,$scope,appData,userService,AuthService,
			TimeLogService,$window){
		
		var padwc = this;
		var appdata = appData.getAppData();
		
		padwc.message = $stateParams.message ? $stateParams.message : "Something went wrong";
		padwc.publicLink = $stateParams.publicLink;
		
		//Methods
		padwc.logoutAndProceed = logoutAndProceed;
		padwc.cancel = cancel;
		
		function logoutAndProceed() {
			$rootScope.previousState = null;
        	$rootScope.previousStateParams = null;
        	TimeLogService.clearLog();
			AuthService.logout().then(function (resp) {
				if(resp.status == 200 ) {
					$window.location.href = padwc.publicLink;
				}
			});
		}
		
		function cancel() {
			userService.goToHomePage();
		}
	}
})();