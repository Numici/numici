;(function() {
	'use strict';
	angular.module("vdvcApp").factory("LinkFolderService",LinkFolderService);
	LinkFolderService.$inject = ['httpService'];
	
	function LinkFolderService(httpService) {
		var LinkFolderService = {
				createLinkFolder : createLinkFolder
		};
		
		return LinkFolderService;
		
		function createLinkFolder(postdata) {
			 return httpService.httpPost("folder/create",postdata);
		}
	}
})();