;(function(){
	
	'use strict';
	
	angular.module("vdvcApp").controller("SlackHomeController",SlackHomeController);
	
	SlackHomeController.$inject = ['$rootScope','$state','$stateParams','usrInfResp','$scope','appData','_','SlackService','$window','LocalStorageService'];
	
	function SlackHomeController($rootScope,$state,$stateParams,usrInfResp,$scope,appData,_,SlackService,$window,LocalStorageService){
		var appdata = appData.getAppData();
		var shc = this;
		
		$scope.$emit("PageName",{"userName":appdata.UserName,"pageName":$state.current.pageName});
		
		shc.authUrl = "";
		shc.showAuthUrl = false;
		shc.showError = false;
		shc.errorCode = $stateParams.error;
		shc.hasSession = false;
		shc.error = "";
		//$rootScope.previousState = 'addslack';
    	//$rootScope.previousStateParams = $stateParams;
    	shc.addSlack = addSlack;
    	
    	function addSlack() {
    		if(shc.hasSession) {
    			SlackService.installUrl().then(function(resp) {
    				if(resp.data.Status) {
    					LocalStorageService.removeLocalStorage(LocalStorageService.SLACK_AUTH);
    					$window.location.href = resp.data.Data;
    				}
    			});
    		} else {
    			shc.error = "You need a Numici account before Slack can be added";
				shc.showError = true;
    		}
    	}
    	
		function init() {
			LocalStorageService.setLocalStorage(LocalStorageService.SLACK_AUTH,true);
			if(usrInfResp.status == 200 && usrInfResp.data.Status) {
				if(usrInfResp.data.hasLogin) {
					shc.hasSession = true;
				} 
			}
		}
		
		init();
	}
})();