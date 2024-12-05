;(function() {
	'use strict';
	angular.module("vdvcApp").factory("WebexService",WebexService);
	WebexService.$inject = ['$state','$window','$location','httpService','appData'];
	
	function WebexService($state,$window,$location,httpService,appData) {
		
		var WebexService = {
				autherize : autherize,
				reAutherize : reAutherize,
				getConfig : getConfig,
				getWebexUserRooms : getWebexUserRooms,
				shareArticleOnWebex : shareArticleOnWebex,
				revokeAuth : revokeAuth
		};
		
		return WebexService;
		
		function autherize(cb) {
			var appdata = appData.getAppData();
			if(appdata["webexAuthUrl"]) {
				if($state.current.name == "sharelinks") {
					$window.open(appdata["webexAuthUrl"], '_blank');
				} else {
					$window.location.href = appdata["webexAuthUrl"];
				}
				if(typeof cb == "function") {
					cb();
				}
			}
		}
		
		function reAutherize(reAutherizeUrl,cb) {
			if($state.current.name == "sharelinks") {
				$window.open(reAutherizeUrl, '_blank');
			} else {
				$window.location.href = reAutherizeUrl;
			}
			if(typeof cb == "function") {
				cb();
			}
		}
		
		function getConfig() {
			return httpService.httpGet("webex/config");
		}

		function getWebexUserRooms() {
			return httpService.httpGet("webex/rooms");
		}
		
		function shareArticleOnWebex (postData) {
			return httpService.httpPost("webex/message",postData);
		}
		
		function revokeAuth() {
			return httpService.httpPost("webex/revoke");
		}
	}
})();