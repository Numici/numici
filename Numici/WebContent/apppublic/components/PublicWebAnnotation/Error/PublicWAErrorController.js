;(function(){
	'use strict';
	
	angular.module("vdvcPublicApp").controller("PublicWAErrorController",PublicWAErrorController);
	
	PublicWAErrorController.$inject = ['$state','$stateParams','$scope','_',
	                             '$timeout','$window','$cookies','localStorage'];
	
	function PublicWAErrorController($state,$stateParams,$scope,_,$timeout,
			$window,$cookies,localStorage){
		var errorCodeMap = {
				"browser_is_not_chrome" : "If you are viewing this on a computer, use Chrome browser with Numici extension to<br> <b>see the highlights and associated comments on the original web page.</b> Learn more<br><br> You will be taken to the target web page in 5 seconds or<br>you can click here to go there immediately.",
				"extension_not_installed" : "Get Numici extension for Chrome to <br> <b>see the highlights and associated comments on the original web page.</b><br><br> You will be taken to the target web page in 5 seconds or<br>you can click here to go there immediately.",
				"extension_not_enabled" : "Get Numici extension for Chrome to <br> <b>see the highlights and associated comments on the original web page.</b><br><br> You will be taken to the target web page in 5 seconds or<br>you can click here to go there immediately.",
				"default" : "Please try after some time.The server encountered an unexpected error. "
		};
		
		var pwec = this;
		
		var goToTargetTimeout;
		
		//$scope.$emit("PageName",{"userName":(appdata ? appdata.UserName : ""),"pageName":$state.current.pageName});
		
		pwec.showLoginUrl = false;
		pwec.errorCode = $stateParams.error;
		pwec.chromeStoreBaseUrl = $stateParams.chromeStoreBaseUrl;
		pwec.extensionName = $stateParams.extensionName;
		pwec.extensionId = $stateParams.extensionId;
		pwec.error = "";
		pwec.ExtensionUrl = "";
		pwec.targetUrl = "";
		pwec.autoRedirectDuration = $stateParams.autoRedirectDuration;
		pwec.doNotShow = false;
		
		pwec.setCookieForDonnotShowWAError = setCookieForDonnotShowWAError;
		pwec.clearWebAnnotUrlFromLocalStorage = clearWebAnnotUrlFromLocalStorage;
		function setCookieForDonnotShowWAError() {
			if(pwec.doNotShow) {
				var expireDate = new Date();
				expireDate.setDate(expireDate.getDate() + 1);
				$cookies.putObject("publicwebannotate", {"disableRenderWAErrorPage" : pwec.doNotShow}, {'expires': expireDate});
			}
		}
		
		function clearWebAnnotUrlFromLocalStorage() {
			localStorage.removeItem("webAnnotationUrl");
			$window.location.href = pwec.targetUrl;
		}
		
		function init() {
			if(!_.isEmpty(pwec.errorCode)) {
				pwec.error = errorCodeMap[pwec.errorCode];
				if(pwec.errorCode == "extension_not_installed" || pwec.errorCode == "extension_not_enabled" || pwec.errorCode == "browser_is_not_chrome") {
					pwec.error = pwec.error.replace("5", ""+(pwec.autoRedirectDuration/1000));
					if(pwec.error && pwec.chromeStoreBaseUrl && pwec.extensionName && pwec.extensionId) {
						pwec.ExtensionUrl = pwec.chromeStoreBaseUrl+pwec.extensionName+"/"+pwec.extensionId;
						pwec.error = pwec.error.replace("Get Numici extension", "<a href='"+pwec.ExtensionUrl+"'>Get Numici extension</a>");
						if(pwec.errorCode != "browser_is_not_chrome") {
							pwec.error = pwec.error.replace("Get Numici extension", "<a href='"+pwec.ExtensionUrl+"'>Get Numici extension</a>");
						} else {
							pwec.error = pwec.error.replace("Learn more", "<a href='"+pwec.ExtensionUrl+"'>Learn more</a>");
						}
					}
					if($stateParams.target) {
						pwec.targetUrl = $stateParams.target;
						if($stateParams.annotationId && $stateParams.cid) {
							pwec.targetUrl = pwec.targetUrl +"#webannotations:"+ $stateParams.annotationId+"#client:"+$stateParams.cid;
							if($stateParams.tsId) {
								pwec.targetUrl +="#group:"+$stateParams.tsId;
							}
							if($stateParams.linkId) {
								pwec.targetUrl +="#linkId:"+$stateParams.linkId;
							}
						}
						pwec.error = pwec.error.replace("here", "<a href='"+pwec.targetUrl+"'>here</a>");
					}
				}
				
				if(!pwec.error){
					pwec.error = pwec.errorCode;
				}
			} else {
				pwec.error = errorCodeMap["default"];
			}
			/*if(_.isEmpty(appdata["UserId"])) {
				pwec.showLoginUrl = true;
			}*/
			
			$timeout.cancel(goToTargetTimeout);
			goToTargetTimeout = $timeout(function() {
				if(pwec.targetUrl) {
					clearWebAnnotUrlFromLocalStorage();
				}
				$timeout.cancel(goToTargetTimeout);
            },pwec.autoRedirectDuration);
		}
		init();
	}
})();