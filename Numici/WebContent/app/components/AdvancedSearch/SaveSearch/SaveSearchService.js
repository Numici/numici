;(function(){
	'use strict';
	
	angular.module("vdvcApp").factory("SaveSearchService",SaveSearchService);
	
	SaveSearchService.$inject = ['httpService'];
	
	function SaveSearchService(httpService) {
		var SaveSearchService = {};
		SaveSearchService.actions = [{
					"type": "notify",
					"label": "Notifications",
					"order": 1
				},{
					"type": "addToTaskspace",
					"label": "Add To Taskspace",
					"order": 2
				}];
		return SaveSearchService;
	}

})();