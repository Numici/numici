;(function() {
	'use strict';
	angular.module("vdvcApp").factory("EmailInboxService",EmailInboxService);
	EmailInboxService.$inject = ['httpService'];
	
	function EmailInboxService(httpService) {
		var EmailInboxService = {
				getEmailsList : getEmailsList
		};
		
		return EmailInboxService;
		
		function getEmailsList() {
	    	return httpService.httpGet("folder/listmails");
	    }
	}
})();