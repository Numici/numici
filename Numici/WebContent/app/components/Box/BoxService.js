;(function() {
	'use strict';
	angular.module("vdvcApp").factory("BoxService",BoxService);
	BoxService.$inject = ['httpService','$http','$window','appData','localStorageService','$location'];
	
	function BoxService(httpService,$http,$window,appData,localStorageService,$location) {
		var BoxService = {
				getBoxFolderList : getBoxFolderList,
				getRoot : getRoot,
				autherize : autherize,
				setFolderSync : setFolderSync,
				removeFolderSync : removeFolderSync,
				getFolderSync : getFolderSync,
				getallfoldersyncs : getallfoldersyncs,
				getConfig: getConfig,
				setPostComments: setPostComments,
				revokeAuthPerms: revokeAuthPerms

		};
		
		return BoxService;
		
		function getBoxFolderList(folderId) {
			return httpService.httpGet("box/listfolder/"+folderId);
		}
		
		function getRoot() {
			return httpService.httpGet("box/listroot");
		}

		function autherize() {
			var appdata = appData.getAppData();
			localStorageService.set("BoxAuthRequest",{
				"isAuthRequest" : true,
				"currentUrl" : $location.absUrl()
			});
			
			if(appdata["boxAuthUrl"]) {
				$window.location.href = appdata["boxAuthUrl"];
			}
		}
		
		function setFolderSync(postdata) {
			return httpService.httpPost("box/setfoldersync",postdata);
		}
		
		function removeFolderSync(postdata) {
			return httpService.httpPost("box/removefoldersync",postdata);
		}
		
		function getFolderSync(postdata) {
			return httpService.httpPost("box/getfoldersync",postdata);
		}
		
		function getallfoldersyncs() {
			return httpService.httpGet("box/getallfoldersyncs");
		}
		
		function getConfig() {
			return httpService.httpGet("box/config");
		}
		
		function setPostComments(flag) {
			return httpService.httpGet("box/postcomments/"+flag);
		}
		
		function revokeAuthPerms(postdata) {
			return httpService.httpPost("box/revoke",postdata);
		}
	}
})();