;(function(){
	
	'use strict';
	
	angular.module("vdvcApp").controller("LinkedInSuccessController",LinkedInSuccessController);
	
	LinkedInSuccessController.$inject = ['$state','$stateParams','$scope','appData','_','$window'];
	
	function LinkedInSuccessController($state,$stateParams,$scope,appData,_,$window){
		var appdata = appData.getAppData();
		
		var self = this;
		var origin = $stateParams.origin ? decodeURIComponent($stateParams.origin) : "chrome-extension://oojabgademjndedjpcnagfgiglcpolgd";
		
		$scope.$emit("PageName",{"userName":appdata.UserName,"pageName":$state.current.pageName});
		
		self.success = $stateParams.success ? decodeURIComponent($stateParams.success) : "LinkedIn user authorization Successful";
		
		function sendOAuthResponse($window) {
			if(!$window.opener) {
				console.log("Parent window closed");
				return;
			}
			var oAuthResponse = {type:"linkedin_authorization_response",code:"LinkedIn user authorization",state:"Success"};
			$window.opener.postMessage(oAuthResponse,origin);
			$window.close();
		}
		sendOAuthResponse($window);
	}
})();