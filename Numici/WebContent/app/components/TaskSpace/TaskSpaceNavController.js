
;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('TaskSpaceNavController',TaskSpaceNavController);
	
	TaskSpaceNavController.$inject = ['$scope','AnnotationService'];

	function TaskSpaceNavController($scope,AnnotationService) {
		var vm = this;
		
		vm.TaskSpaceAction = TaskSpaceAction;
		vm.initComment = initComment;
		vm.activate = activate;
		vm.annotation = {"note" : ""};
		function activate($event,option) {
			console.log("activate");
		}
		
		function TaskSpaceAction($event,action,msg) {
			$scope.$emit("taskSpaceAction",{"event" : $event,"action" :action,"msg":msg});
		}
		function initComment() {
			AnnotationService.getUID().then(function(response){
				if (response.status == 200 && response.data.Status) {
					vm.annotation["resourceName"] = response.data.UniqueId;
				}
			});
		}
		vm.initComment();
	}
	
})();
