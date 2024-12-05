;(function() {
	'use strict';
	angular.module("vdvcApp").factory("VAppFactory", VAppFactory);
	
	VAppFactory.$inject = ['httpService'];
	
	function VAppFactory(httpService) {
		var vAppFactory = {
				getVApps : getVApps
		};
		
		return vAppFactory;
		
		function getVApps() {
	        return httpService.httpGet('vapp/list/user');
	    }
	}
	
})();