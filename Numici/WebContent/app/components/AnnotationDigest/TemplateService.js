;(function(){
	'use strict';
	angular.module("vdvcApp").factory("TemplateService",TemplateService);
	
	TemplateService.$inject = ['$rootScope','httpService'];
	
	function TemplateService($rootScope,httpService) {
		
		
		var service = {
				listActiveDigestTemplates : listActiveDigestTemplates
		};
		
		function listActiveDigestTemplates() {
			return httpService.httpGet("templates/listActiveDigestTemplates");
		}
		
		
		
	    return service;
	}
	
})();