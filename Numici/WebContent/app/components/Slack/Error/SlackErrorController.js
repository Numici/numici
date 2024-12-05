;(function(){
	
	'use strict';
	
	angular.module("vdvcApp").controller("SlackErrorController",SlackErrorController);
	
	SlackErrorController.$inject = ['$state','$stateParams','$scope','appData','_'];
	
	function SlackErrorController($state,$stateParams,$scope,appData,_){
		var appdata = appData.getAppData();
		var errorCodeMap = {
				"access_denied" : "We cannot proceed unless the user consents.",
				"server_error" : "Please try after some time. The Microsoft server encountered an unexpected error.",
				"temporarily_unavailable" : "Please try after some time. The Microsoft server is temporarily too busy.", 
				"default" : "Please try after some time.The server encountered an unexpected error. ",
				"NOT AUTHORIZED" : "You have not authorized Numici"
		};
		
		var sec = this;
		$scope.$emit("PageName",{"userName":appdata.UserName,"pageName":$state.current.pageName});
		
		sec.authUrl = "";
		sec.showAuthUrl = false;
		sec.showLoginUrl = false;
		sec.errorCode = $stateParams.error;
		sec.error = "";
		
		
		function init() {
			if(!_.isEmpty(sec.errorCode)) {
				sec.error = errorCodeMap[sec.errorCode];
				if(!sec.error){
					sec.error = sec.errorCode;
				}
				if($stateParams.error == "NOT AUTHORIZED") {
					if(!_.isEmpty($stateParams.oAuthUrl)) {
						sec.authUrl = $stateParams.oAuthUrl;
						sec.showAuthUrl = true;
					}
				}
				if($stateParams.isLoggedIn && $stateParams.isLoggedIn == "NO") {
					sec.showLoginUrl = true;
				}
			} else {
				sec.error = errorCodeMap["default"];
			}
		}
		
		init();
	}
})();