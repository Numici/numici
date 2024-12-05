;(function() {

	'use strict';
	
	angular.module('vdvcApp').controller('SearchTsObjectsController',SearchTsObjectsController);
	
	SearchTsObjectsController.$inject = ['$scope','$state','appData','_','$uibModalInstance','TaskSpaceService','$timeout'];
	
	function SearchTsObjectsController($scope,state,appData,_,$uibModalInstance,TaskSpaceService,$timeout) {
		var sto = this;
		var appdata = appData.getAppData();
		
		sto.cancel = cancel;
		
		function cancel() {
			TaskSpaceService.showOpenInTaskspaceBtn = false;
			$uibModalInstance.dismiss('cancel');
		}
		
		function init() {
			$timeout(function() {
				$(".adv-srch-body").css("padding","0px");
			}, 100);
			if(state.current.name == "taskspace.list.task" && !_.isEmpty(TaskSpaceService.currentTaskspace)) {
				TaskSpaceService.showOpenInTaskspaceBtn = true;
	    	}
		}
		init();
	}
})();
