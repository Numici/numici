;(function() {
	'use strict';
	angular.module("vdvcApp").factory("AsanaService",AsanaService);
	AsanaService.$inject = ['httpService','$http','$window','appData','localStorageService','$location'];
	
	function AsanaService(httpService,$http,$window,appData,localStorageService,$location) {
		
		var settingsHeaders = [
             {
           	  "label":"PROJECT",
           	  "value":"name",
           	  "DValue":"name",
           	  "checked" : true,
           	  "type" : "text",
           	  "class" : "col-sm-3"
             },{
           	  "label":"TASKSPACE",
           	  "value":"taskspaceName",
           	  "DValue":"taskspaceName",
           	  "checked" : true,
           	  "type" : "text",
           	  "class" : "col-sm-4"
             }/*,{
           	  "label":"OWNER",
           	  "value":"taskspaceOwner",
           	  "DValue":"taskspaceOwner",
           	  "checked" : true,
           	  "type" : "text",
           	  "class" : "col-sm-3"
             }*/
       ];
		
		var AsanaService = {
				autherize : autherize,
				checkAuthStatus: checkAuthStatus,
				getConfig: getConfig,
				listProjects: listProjects,
				mapTaskspace: mapTaskspace,
				unMapProject: unMapProject,
				revokeAuthPerms: revokeAuthPerms,
				settingsHeaders : settingsHeaders
		};
		
		return AsanaService;
		

		function autherize() {
			var appdata = appData.getAppData();
			localStorageService.set("AsanaAuthRequest",{
				"isAuthRequest" : true,
				"currentUrl" : $location.absUrl()
			});
			
			if(appdata["asanaAuthUrl"]) {
				$window.location.href = appdata["asanaAuthUrl"];
			}
		}
		
		function checkAuthStatus(data) {
			if(data.OAuthErr && (data.AsanaStatus == "Invalid" || data.AsanaStatus == "NoAuth") ) {
				return false;
			}
			return true;
		}
		
		function getConfig() {
			return httpService.httpGet("asana/config");
		}
		
		function listProjects() {
			return httpService.httpGet("asana/list/projects");
		}
		
		function mapTaskspace(postdata) {
			return httpService.httpPost("asana/maptaskspace",postdata);
		}
		
		function unMapProject(postdata) {
			return httpService.httpPost("asana/unmapproject",postdata);
		}
		
		function revokeAuthPerms() {
			return httpService.httpGet("asana/revoke");
		}
	}
})();