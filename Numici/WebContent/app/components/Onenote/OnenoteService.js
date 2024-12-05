;(function() {
	'use strict';
	angular.module("vdvcApp").factory("OnenoteService",OnenoteService);
	OnenoteService.$inject = ['httpService','$http','$location','$window'];
	
	function OnenoteService(httpService,$http,$location,$window) {
		
		var noteBookListHeaders = [
				  	                  {
				  	                	  "label":"Name",
				  	                	  "value":"displayName",
				  	                	  "DValue":"displayName",
				  	                	  "checked" : true,
				  		                  "type" : "text",
				  		                  "class" : "col-md-3"
				  	                  },{
			 		                	  "label":"Created Date",
			 		                	  "value":"createdDateTime",
			 		                	  "DValue":"createdDateTime",
			 		                	  "checked" : true,
			 		                	  "type" : "Date",
			 		                	  "class" : "col-md-2"
			 		                  },{
			 		                	  "label":"Modified Date",
			 		                	  "value":"lastModifiedDateTime",
			 		                	  "DValue":"lastModifiedDateTime",
			 		                	  "checked" : true,
			 		                	  "type" : "Date",
			 		                	  "class" : "col-md-2"
			 		                  },{
			 		                	  "label":"Is Shared",
			 		                	  "value":"isShared",
			 		                	  "DValue":"isShared",
			 		                	  "checked" : true,
			 		                	  "type" : "Checkbox",
			 		                	  "class" : "col-md-1"
			 		                  }
				  	            ];
		
		var sectionListHeaders = [
				  	                  {
				  	                	  "label":"Name",
				  	                	  "value":"displayName",
				  	                	  "DValue":"displayName",
				  	                	  "checked" : true,
				  		                  "type" : "text",
				  		                  "class" : "col-md-3"
				  	                  },{
			 		                	  "label":"Created Date",
			 		                	  "value":"createdDateTime",
			 		                	  "DValue":"createdDateTime",
			 		                	  "checked" : true,
			 		                	  "type" : "Date",
			 		                	  "class" : "col-md-2"
			 		                  },{
			 		                	  "label":"Updated Date",
			 		                	  "value":"lastModifiedDateTime",
			 		                	  "DValue":"lastModifiedDateTime",
			 		                	  "checked" : true,
			 		                	  "type" : "Date",
			 		                	  "class" : "col-md-2"
			 		                  }
				  	            ];
		
		var pageListHeaders = [
		 		                  {
		 		                	  "label":"Title",
		 		                	  "value":"title",
		 		                	  "DValue":"title",
		 		                	  "checked" : true,
		 		                	  "type" : "text",
		 		                	  "class" : "col-md-3"
		 		                  },{
		 		                	  "label":"Created Date",
		 		                	  "value":"createdDateTime",
		 		                	  "DValue":"createdDateTime",
		 		                	  "checked" : true,
		 		                	  "type" : "Date",
		 		                	  "class" : "col-md-2"
		 		                  },{
		 		                	  "label":"Updated Date",
		 		                	  "value":"lastModifiedDateTime",
		 		                	  "DValue":"lastModifiedDateTime",
		 		                	  "checked" : true,
		 		                	  "type" : "Date",
		 		                	  "class" : "col-md-2"
		 		                  }
		 		            ];
				
		var OnenoteService = {
				getNotebookList : getNotebookList,
				getSectionList : getSectionList,
				getPageList : getPageList,
				getPageContent : getPageContent,
				createNotebook : createNotebook,
				createSection : createSection,
				createPage : createPage,
				overridePage : overridePage,
				appendToPage : appendToPage,
				noteBookListHeaders : noteBookListHeaders,
				sectionListHeaders : sectionListHeaders,
				pageListHeaders	: pageListHeaders
		};
		
		return OnenoteService;
						
		function getNotebookList() {
			return httpService.httpGet("onedrive/listUserNotebooks");
		}
		
		function getSectionList(notebookId) {
			return httpService.httpGet("onedrive/listNotebookSections/"+notebookId);
		}
		
		function getPageList(sectionId) {
			return httpService.httpGet("onedrive/listNotebookSectionPages/"+sectionId);
		}
		
		function getPageContent(pageId) {
			return httpService.httpGet("onedrive/getNotebookPageContent/"+pageId);
		}
		
		function createNotebook(postdata) {
			return httpService.httpPost("onedrive/createNotebook",postdata);
		}
		
		function createSection(postdata) {
			return httpService.httpPost("onedrive/createNotebookSection",postdata);
		}
		
		function createPage(postdata) {
			return httpService.httpPost("onedrive/createNotebookSectionPage",postdata);
		}
		
		function overridePage(postdata) {
			return httpService.httpPost("/onedrive/replaceNotebookPage",postdata);
		}
		
		function appendToPage(postdata) {
			return httpService.httpPost("/onedrive/appendToNotebookPage",postdata);
		}
	}
})();