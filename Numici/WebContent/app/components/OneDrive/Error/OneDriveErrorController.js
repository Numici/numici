;(function(){
	
	'use strict';
	
	angular.module("vdvcApp").controller("OneDriveErrorController",OneDriveErrorController);
	
	OneDriveErrorController.$inject = ['$state','$stateParams','$scope','appData','_','userService'];
	
	function OneDriveErrorController($state,$stateParams,$scope,appData,_,userService){
		var appdata = appData.getAppData();
		var errorCodeMap = {
				"access_denied" : "We cannot proceed unless the user consents.",
				"server_error" : "Please try after some time. The Microsoft server encountered an unexpected error.",
				"temporarily_unavailable" : "Please try after some time. The Microsoft server is temporarily too busy.", 
				"default" : "Please try after some time.The server encountered an unexpected error. "
		};
		
		var oe = this;
		$scope.$emit("PageName",{"userName":appdata.UserName,"pageName":$state.current.pageName});
		
		oe.errorCode = $stateParams.error;
		oe.error = "";
		
		oe.goToHome = goToHome;
		
		function goToHome() {
			userService.goToHomePage();
		}
		
		function init() {
			if(!_.isEmpty(oe.errorCode)) {
				oe.error = errorCodeMap[oe.errorCode];
				if(!oe.error){
					oe.error = oe.errorCode;
				}
			} else {
				oe.error = errorCodeMap["default"];
			}
		}
		
		init();
	}
})();