;(function() {
	'use strict'; 
	
	angular.module('vdvcApp').controller('VerifyOTPSuccessController',VerifyOTPSuccessController);
	
	VerifyOTPSuccessController.$inject = ['$scope','$state','$sce','appData','$uibModalInstance','_','verifyOTPResponse',
	                                      'userService','LocalStorageService','beforeGoToHomePage','getExtensionMessage'];
	
	function VerifyOTPSuccessController($scope,$state,$sce,appData,$uibModalInstance,_,verifyOTPResponse,userService,
			LocalStorageService,beforeGoToHomePage,getExtensionMessage) {
		
		var vosc = this;
		var appdata = appData.getAppData();
		
		//variables
		vosc.verifyOTPResponseMessage = !_.isEmpty(verifyOTPResponse) ? verifyOTPResponse.data.Message : "";
		var tempGetExtensionMessage = !_.isEmpty(getExtensionMessage) ? getExtensionMessage.message : "";
		vosc.getExtensionMessage = $sce.trustAsHtml(tempGetExtensionMessage);
		vosc.doNotShow = false;
		vosc.beforeGoToHomePage = beforeGoToHomePage;
		//methods
		vosc.skipGoToExtension = skipGoToExtension;
		vosc.goToExtension = goToExtension;
			
		function close() {
			var getExtensionPageSession = {};
			getExtensionPageSession["user"] = appdata["UserId"];
			getExtensionPageSession["close"] = true;
			getExtensionPageSession = JSON.stringify(getExtensionPageSession);
			LocalStorageService.setLocalStorage(LocalStorageService.EXTENSION_PAGE,getExtensionPageSession);
		}
		
		function skipGoToExtension() {
			if(vosc.beforeGoToHomePage) {
				close();
			}
			if(vosc.doNotShow) {
				var postdata = {"doNotShowExtensionMsg" : vosc.doNotShow};
				userService.setDoNotShowExtensionMsg(postdata).then(function(resp) {
					if(resp.status == 200 && resp.data.Status) {
						$uibModalInstance.close("skipGetExtension");
					}
				});
			} else {
				$uibModalInstance.close("skipGetExtension");
			}
		}
		
		function goToExtension() {
			if(vosc.beforeGoToHomePage) {
				close();
			}
			if(vosc.doNotShow) {
				var postdata = {"doNotShowExtensionMsg" : vosc.doNotShow};
				userService.setDoNotShowExtensionMsg(postdata).then(function(resp) {
					if(resp.status == 200 && resp.data.Status) {
						$uibModalInstance.close("getExtension");
					}
				});
			} else {
				$uibModalInstance.close("getExtension");
			}
		}
	}
})();