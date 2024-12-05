;(function(){
	'use strict';
	
	angular.module("vdvcApp").controller('WebAnnotationController',WebAnnotationController);
	
	WebAnnotationController.$inject = ['$scope','$rootScope','$state',
	                                   '$stateParams','$window','$timeout',
	                                   '$deviceInfo','commonService',
	                                   'ChromeExtensionService','$cookies',
	                                   'userInfo','localStorage'];
	
	function WebAnnotationController($scope,$rootScope,$state,$stateParams,$window,
			$timeout,$deviceInfo,commonService,ChromeExtensionService,
			$cookies,userInfo,localStorage) {
		var wc = this;
		
		var disableRenderWAErrorPage = false;
		var getExtensionInfoTimeout;
		
		function redirectToErrorPage(errorCode,extensionId,autoRedirectDuration,chromeStoreBaseUrl,extensionName) {
			var params = {
					"error" : errorCode,
					"extensionId" : extensionId,
					"target" : $stateParams.target,
					"tsId": $stateParams.tsId,
					"cid": $stateParams.cid,
					"autoRedirectDuration" : autoRedirectDuration
				};
			
			if($stateParams.annotationId) {
				params.annotationId = $stateParams.annotationId;
			}
			if(chromeStoreBaseUrl) {
				params.chromeStoreBaseUrl = chromeStoreBaseUrl;
			}
			if(extensionName) {
				params.extensionName = extensionName;
			}
			if(!_.isEmpty(userInfo["UserId"])) {
				$state.go("WAError",params);
			} else {
				$state.go("WAErrorWOA",params);
			}
		}
		
		function goToWebannotation() {
			var targetUrl = $stateParams.target;
			if(!_.isEmpty($stateParams.annotationId)) {
				targetUrl = targetUrl+"#webannotations:"+$stateParams.annotationId;
	    	}
			if(!_.isEmpty($stateParams.cid)) {
				targetUrl = targetUrl+"#client:"+$stateParams.cid;
	    	}
			if(!_.isEmpty($stateParams.tsId)) {
				targetUrl = targetUrl+"#group:"+$stateParams.tsId;
	    	} 
			return targetUrl;
		}
		
		function getExtensionInfo(extensionId,autoRedirectDuration,chromeStoreBaseUrl,extensionName) {
			var targetUrl = goToWebannotation();
			ChromeExtensionService.isExtensionInstalled(extensionId,function(response){
				if(response && response.type === "pong") {
					$window.location.href = targetUrl;
				} else {
					if(!_.isEmpty($stateParams.actualUrl)) {
						targetUrl = $stateParams.actualUrl;
					}
					localStorage.setItem("webAnnotationUrl",targetUrl);
					redirectToErrorPage("extension_not_installed",extensionId,autoRedirectDuration,chromeStoreBaseUrl,extensionName);
				}
			});
		}
		
		function checkforDeviceSupport() {
			if($deviceInfo.isMobile || $deviceInfo.isTablet) {
				return false;
			} else {
				return true;
			}
		}
		
		function init() {
			if($stateParams.target) {
				
				if(!checkforDeviceSupport()) {
					var targetUrl = goToWebannotation();
					$window.location.href = targetUrl;
					return false;
				}
				
				if(userInfo && userInfo["UserId"]) {
					var storedCookie = $cookies.getObject(userInfo["UserId"]);
					if(storedCookie && storedCookie.disableRenderWAErrorPage) {
						var targetUrl = goToWebannotation();
						$window.location.href = targetUrl;
						return false;
					}
				}
				
				commonService.getNavMenuItems({"type":"WebAnnotations"}).then(function(resp){
					if(resp.status == 200 && resp.data.Status) {
						
						var listAppKeyValues  = resp.data.listAppKeyValues;
						var chromeStoreBaseUrlObj = _.findWhere(listAppKeyValues,{"key": "ChromeStoreBaseUrl"});
						var extensionNameObj = _.findWhere(listAppKeyValues,{"key": "ExtensionName"});
						var extensionIdObj = _.findWhere(listAppKeyValues,{"key": "ExtensionId"});
						var autoRedirectDurationObj = _.findWhere(listAppKeyValues,{"key": "AutoRedirectDuration"});
						var autoRedirectDuration = 5000;
						if(autoRedirectDurationObj) {
							autoRedirectDuration = autoRedirectDurationObj.value;
						}
						
						if(extensionIdObj) {
							if($deviceInfo.isChrome) {
								if(chromeStoreBaseUrlObj && extensionNameObj) {
									getExtensionInfo(extensionIdObj.value,autoRedirectDuration,chromeStoreBaseUrlObj.value,extensionNameObj.value);
								} else {
									getExtensionInfo(extensionIdObj.value,autoRedirectDuration);
								}
							} else {
								if(chromeStoreBaseUrlObj && extensionNameObj) {
									redirectToErrorPage("browser_is_not_chrome",extensionIdObj.value,autoRedirectDuration,chromeStoreBaseUrlObj.value,extensionNameObj.value);
								} else {
									redirectToErrorPage("browser_is_not_chrome",extensionIdObj.value,autoRedirectDuration);
								}
							}
						}
					}
				});
			}
		}
		
		init();
	}
})();