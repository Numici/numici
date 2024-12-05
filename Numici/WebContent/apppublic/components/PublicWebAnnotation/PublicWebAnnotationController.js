;(function(){
	'use strict';
	
	angular.module("vdvcPublicApp").controller('PublicWebAnnotationController',PublicWebAnnotationController);
	
	PublicWebAnnotationController.$inject = ['$scope','$rootScope','$state',
	                                   '$stateParams','$window','$timeout',
	                                   '$deviceInfo','ChromeExtensionService',
	                                   '$cookies','CommonService','localStorage'];
	
	function PublicWebAnnotationController($scope,$rootScope,$state,$stateParams,$window,
			$timeout,$deviceInfo,ChromeExtensionService,$cookies,CommonService,localStorage) {
		var pwc = this;
		
		var disableRenderWAErrorPage = false;
		var getExtensionInfoTimeout;
		
		function redirectToErrorPage(errorCode,extensionId,autoRedirectDuration,chromeStoreBaseUrl,extensionName) {
			var params = {
					"error" : errorCode,
					"extensionId" : extensionId,
					"target" : $stateParams.target,
					"tsId": $stateParams.tsId,
					"cid": $stateParams.cid,
					"linkId": $stateParams.linkId,
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
			$state.go("publicwaerror",params);
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
			if(!_.isEmpty($stateParams.linkId)) {
				targetUrl = targetUrl+"#linkId:"+$stateParams.linkId;
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
				
				var storedCookie = $cookies.getObject("publicwebannotate");
				if(storedCookie && storedCookie.disableRenderWAErrorPage) {
					var targetUrl = goToWebannotation();
					$window.location.href = targetUrl;
					return false;
				}
				CommonService.getKeyValuesForWebAnnotationsType().then(function(resp){
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
				/*var listAppKeyValues  = [{
				    "type" : "WebAnnotations",
				    "key" : "ExtensionId",
				    "value" : "iahhmhdkmkifclacffbofcnmgkpalpoj",
				    "description" : "WebAnnotations ExtensionId",
				    "active" : true
				},{
				    "type" : "WebAnnotations",
				    "key" : "AutoRedirectDuration",
				    "value" : "5000",
				    "description" : "Time delay for redirecting the URL in milliseconds",
				    "active" : true
				},{
				    "type" : "WebAnnotations",
				    "key" : "ChromeStoreBaseUrl",
				    "value" : "https://chrome.google.com/webstore/detail/",
				    "description" : "ChromeStoreBaseUrl for downloading the chrome extension",
				    "active" : true
				},{
				    "type" : "WebAnnotations",
				    "key" : "ExtensionName",
				    "Value" : "numici-web-ext",
				    "description" : "Numici Web extension name",
				    "active" : true
				}];*/
				
			}
		}
		
		init();
	}
})();