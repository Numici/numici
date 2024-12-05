;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('NewTSSectonController',NewTSSectonController);
	
	NewTSSectonController.$inject = ['$rootScope','$scope','appData','$uibModalInstance','_','taskspace','TaskSpaceService','MessageService'];

	function NewTSSectonController($rootScope,$scope,appData,$uibModalInstance,_,taskspace,TaskSpaceService,MessageService) {
		var appdata = appData.getAppData();
		var vm = this;
				
		vm.taskSpaceSectionName = "";
		vm.taskSpaceSectionDescription = "";
		
		vm.cancel = cancel;
		vm.ok = ok;
				
		function cancel() {
			$uibModalInstance.dismiss('cancel');
		}
		
		function createNewTSSection(postdata) {
			TaskSpaceService.addTSSection(postdata).then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					$uibModalInstance.close(resp.data.TsSection);
				}
			});
		}
		
		function ok() {
			var postdata = {
					"taskspaceId": taskspace.id,
					"clientId": taskspace.clientId
				};
			if(!_.isEmpty(vm.taskSpaceSectionDescription)) {
				postdata["description"] = vm.taskSpaceSectionDescription;
			}
			if(!_.isEmpty(vm.taskSpaceSectionName) && vm.taskSpaceSectionName.toLowerCase() != TaskSpaceService.defaultSectionName.toLowerCase()) {
				postdata["name"] = vm.taskSpaceSectionName;
				createNewTSSection(postdata);
			}
		}
		
	}
})();