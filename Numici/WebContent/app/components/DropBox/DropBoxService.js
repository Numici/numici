;(function() {
	'use strict';
	angular.module("vdvcApp").factory("DropBoxService",DropBoxService);
	DropBoxService.$inject = ['httpService','$http','$window','appData','localStorageService','$location'];
	
	function DropBoxService(httpService,$http,$window,appData,localStorageService,$location) {
		var DropBoxService = {
				autherize : autherize,
				getConfig: getConfig,
				revokeAuthPerms: revokeAuthPerms
		};
		
		return DropBoxService;
		

		function autherize() {
			var appdata = appData.getAppData();
			localStorageService.set("DropBoxAuthRequest",{
				"isAuthRequest" : true,
				"currentUrl" : $location.absUrl()
			});
			
			if(appdata["dropboxAuthUrl"]) {
				$window.location.href = appdata["dropboxAuthUrl"];
			}
		}
		
		function getConfig() {
			return httpService.httpGet("dropbox/config");
		}
		
		function revokeAuthPerms(postdata) {
			return httpService.httpPost("dropbox/revoke",postdata);
		}
	}
})();