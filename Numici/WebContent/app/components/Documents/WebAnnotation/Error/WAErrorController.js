;(function(){
	'use strict';
	
	angular.module("vdvcApp").controller("WAErrorController",WAErrorController);
	
	WAErrorController.$inject = ['$state','$stateParams','$scope','userInfo','_',
	                             '$timeout','$window','$cookies','localStorage'];
	
	function WAErrorController($state,$stateParams,$scope,userInfo,_,$timeout,
			$window,$cookies,localStorage){
		var appdata = userInfo;
		var errorCodeMap = {
				"browser_is_not_chrome" : "If you are viewing this on a computer, use Chrome browser with Numici extension to<br> <b>see the highlights and associated comments on the original web page.</b> Learn more<br><br> You will be taken to the target web page in 5 seconds or<br>you can click here to go there immediately.",
				"extension_not_installed" : "Get Numici extension for Chrome to <br> <b>see the highlights and associated comments on the original web page.</b><br><br> You will be taken to the target web page in 5 seconds or<br>you can click here to go there immediately.",
				"extension_not_enabled" : "Get Numici extension for Chrome to <br> <b>see the highlights and associated comments on the original web page.</b><br><br> You will be taken to the target web page in 5 seconds or<br>you can click here to go there immediately.",
				"default" : "Please try after some time.The server encountered an unexpected error. "
		};
		
		var wec = this;
		
		var goToTargetTimeout;
		
		$scope.$emit("PageName",{"userName":(appdata ? appdata.UserName : ""),"pageName":$state.current.pageName});
		
		wec.showLoginUrl = false;
		wec.errorCode = $stateParams.error;
		wec.chromeStoreBaseUrl = $stateParams.chromeStoreBaseUrl;
		wec.extensionName = $stateParams.extensionName;
		wec.extensionId = $stateParams.extensionId;
		wec.error = "";
		wec.ExtensionUrl = "";
		wec.targetUrl = "";
		wec.autoRedirectDuration = $stateParams.autoRedirectDuration;
		wec.doNotShow = false;
		
		wec.setCookieForDonnotShowWAError = setCookieForDonnotShowWAError;
		wec.clearWebAnnotUrlFromLocalStorage = clearWebAnnotUrlFromLocalStorage;
		function setCookieForDonnotShowWAError() {
			if(wec.doNotShow) {
				var expireDate = new Date();
				expireDate.setDate(expireDate.getDate() + 1);
				$cookies.putObject(appdata["UserId"], {"disableRenderWAErrorPage" : wec.doNotShow}, {'expires': expireDate});
			}
		}
		
		function clearWebAnnotUrlFromLocalStorage() {
			localStorage.removeItem("webAnnotationUrl");
			$window.location.href = wec.targetUrl;
		}
		
		function init() {
			if(!_.isEmpty(wec.errorCode)) {
				wec.error = errorCodeMap[wec.errorCode];
				if(wec.errorCode == "extension_not_installed" || wec.errorCode == "extension_not_enabled" || wec.errorCode == "browser_is_not_chrome") {
					wec.error = wec.error.replace("5", ""+(wec.autoRedirectDuration/1000));
					if(wec.error && wec.chromeStoreBaseUrl && wec.extensionName && wec.extensionId) {
						wec.ExtensionUrl = wec.chromeStoreBaseUrl+wec.extensionName+"/"+wec.extensionId;
						wec.error = wec.error.replace("Get Numici extension", "<a href='"+wec.ExtensionUrl+"'>Get Numici extension</a>");
						if(wec.errorCode != "browser_is_not_chrome") {
							wec.error = wec.error.replace("Get Numici extension", "<a href='"+wec.ExtensionUrl+"'>Get Numici extension</a>");
						} else {
							wec.error = wec.error.replace("Learn more", "<a href='"+wec.ExtensionUrl+"'>Learn more</a>");
						}
					}
					if($stateParams.target) {
						wec.targetUrl = $stateParams.target;
						if($stateParams.annotationId && $stateParams.cid) {
							wec.targetUrl = wec.targetUrl +"#webannotations:"+ $stateParams.annotationId+"#client:"+$stateParams.cid;
							if($stateParams.tsId) {
								wec.targetUrl +="#group:"+$stateParams.tsId;
							}
						}
						wec.error = wec.error.replace("here", "<a href='"+wec.targetUrl+"'>here</a>");
					}
				}
				
				if(!wec.error){
					wec.error = wec.errorCode;
				}
			} else {
				wec.error = errorCodeMap["default"];
			}
			if(_.isEmpty(appdata["UserId"])) {
				wec.showLoginUrl = true;
			}
			
			$timeout.cancel(goToTargetTimeout);
			goToTargetTimeout = $timeout(function() {
				if(wec.targetUrl) {
					clearWebAnnotUrlFromLocalStorage();
				}
				$timeout.cancel(goToTargetTimeout);
            },wec.autoRedirectDuration);
		}
		init();
	}
})();