;(function() {
	'use strict';
	angular.module("vdvcApp").factory("EvernoteService",EvernoteService);
	EvernoteService.$inject = ['httpService','$http','$location','$window'];
	
	function EvernoteService(httpService,$http,$location,$window) {
		
		var noteBooksListHeaders = [
				  	                  {
				  	                	  "label":"Name",
				  	                	  "value":"name",
				  	                	  "DValue":"name",
				  	                	  "checked" : true,
				  		                  "type" : "text",
				  		                  "class" : "col-md-3"
				  	                  },{
			 		                	  "label":"Created Date",
			 		                	  "value":"createdDate",
			 		                	  "DValue":"createdDate",
			 		                	  "checked" : true,
			 		                	  "type" : "Date",
			 		                	  "class" : "col-md-2"
			 		                  },{
			 		                	  "label":"Updated Date",
			 		                	  "value":"updatedDate",
			 		                	  "DValue":"updatedDate",
			 		                	  "checked" : true,
			 		                	  "type" : "Date",
			 		                	  "class" : "col-md-2"
			 		                  }
				  	            ];
				
		var noteListHeaders = [
		 		                  {
		 		                	  "label":"Title",
		 		                	  "value":"title",
		 		                	  "DValue":"title",
		 		                	  "checked" : true,
		 		                	  "type" : "text",
		 		                	  "class" : "col-md-3"
		 		                  },{
		 		                	  "label":"Created Date",
		 		                	  "value":"createdDate",
		 		                	  "DValue":"createdDate",
		 		                	  "checked" : true,
		 		                	  "type" : "Date",
		 		                	  "class" : "col-md-2"
		 		                  },{
		 		                	  "label":"Updated Date",
		 		                	  "value":"updatedDate",
		 		                	  "DValue":"updatedDate",
		 		                	  "checked" : true,
		 		                	  "type" : "Date",
		 		                	  "class" : "col-md-2"
		 		                  }
		 		            ];
				
		var EvernoteService = {
				authorize: authorize,
				revoke : revoke,
				getConfig : getConfig,
				getConfigStatus : getConfigStatus,
				getNotebookList : getNotebookList,
				getNoteList : getNoteList,
				requestUserAuthrization : requestUserAuthrization,
				setFolderSync : setFolderSync,
				removeFolderSync : removeFolderSync,
				getFolderSync : getFolderSync,
				syncFolder : syncFolder,
				noteBooksListHeaders : noteBooksListHeaders,
				noteListHeaders	: noteListHeaders
		};
		
		return EvernoteService;
		
		
		function authorize() {
			var postdata = {"redirectURL" : $location.$$absUrl};
        	EvernoteService.requestUserAuthrization(postdata).then(function(resp){
        		if(resp.status == 200 && resp.data.authUrl) {
    				$window.location.href=resp.data.authUrl;
    			}
        	});
		}
		
		function revoke(postdata) {
			return httpService.httpPost('evernote/revoke',postdata);
		}
		
		function getConfig() {
			return httpService.httpGet('evernote/config');
		}
		
		function getConfigStatus() {
			return httpService.httpGet('evernote/configStatus');
		}
		
		function getAuthurl(postdata) {
			return httpService.httpPost('evernote/authurl',postdata);
		}
		
		function getNotebookList() {
			return httpService.httpGet("evernote/listnotebooks");
		}
		
		function getNoteList(notebookguid) {
			return httpService.httpGet("evernote/listnotes/"+notebookguid);
		}
		
		function requestUserAuthrization(postdata) {
			return  $http({
	            url : 'EvernoteOAuthService',
	            method : "POST",
	            data : postdata
	        });
			//return httpService.httpPost("EvernoteOAuthService",postdata);
		}
		
		function setFolderSync(postdata) {
			return httpService.httpPost("evernote/setfoldersync",postdata);
		}
		
		function removeFolderSync(postdata) {
			return httpService.httpPost("evernote/removefoldersync",postdata);
		}
		
		function getFolderSync(postdata) {
			return httpService.httpPost("evernote/getfoldersync",postdata);
		}
		
		function syncFolder(folderId) {
			return httpService.httpGet("evernote/sync/"+folderId);
		}
	}
})();