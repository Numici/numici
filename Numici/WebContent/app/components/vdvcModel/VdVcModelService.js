;(function() {
	'use strict';
	
	angular.module("vdvcApp").factory("ModelFactory",ModelFactory);
	
	ModelFactory.$inject = ['httpService'];
	
	function ModelFactory(httpService) {
		var modelFactory = {
				getModels : getModels
		};
		
		return modelFactory;
		
		function getModels() {
	        return httpService.httpGet('model/list/all');
	    }
	}
	
})();