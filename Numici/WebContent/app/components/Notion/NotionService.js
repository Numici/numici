;(function() {
	'use strict';
	angular.module("vdvcApp").factory("NotionService",NotionService);
	NotionService.$inject = ['$state','$window','$location','httpService','appData'];
	
	function NotionService($state,$window,$location,httpService,appData) {
		
		var NotionService = {
				autherize : autherize,
				reAutherize : reAutherize,
				getConfig : getConfig,
				getNotionUserDatabases : getNotionUserDatabases,
				getNotionUserObjTree : getNotionUserObjTree,
				shareEmbedLink : shareEmbedLink,
				revokeAuth : revokeAuth
		};
		
		return NotionService;
		
		function autherize(cb) {
			var appdata = appData.getAppData();
			if(appdata["notionAuthUrl"]) {
				if($state.current.name == "sharelinks") {
					$window.open(appdata["notionAuthUrl"], '_blank');
				} else {
					$window.location.href = appdata["notionAuthUrl"];
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
			return httpService.httpGet("notion/config");
		}
		
		function getNotionUserDatabases() {
			return httpService.httpGet("notion/databases");
		}
		
		function getNotionUserObjTree() {
			return httpService.httpGet("notion/objtree");
		}
		
		function revokeAuth() {
			return httpService.httpPost("notion/revoke");
		}
		
		function shareEmbedLink(postdata) {
			return httpService.httpPost("notion/embedLink",postdata);
		}
	}
})();