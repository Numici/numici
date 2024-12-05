;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('RenameTsSectionController',RenameTsSectionController);
	RenameTsSectionController.$inject = ['$scope', '$uibModalInstance','taskspace','TsSection','TaskSpaceService'];

	function RenameTsSectionController($scope, $uibModalInstance,taskspace,TsSection,TaskSpaceService) {
		var vm = this;
		
		vm.tsSection = angular.copy(TsSection);
		vm.ok = ok;
		vm.cancel = cancel;
		  
		function ok() {
			var postdata = {
					"clientId": taskspace.clientId,
					"taskspaceId":taskspace.id, 
					"sectionId": vm.tsSection.id, // id of the section to be renamed
					"name":vm.tsSection.name,  // new name for the section
					"description": vm.tsSection.description // optional to change description
				};
			TaskSpaceService.renameTSSection(postdata).then(function(resp) {
  			  	if (resp.status == 200 && resp.data.Status) {
  			  		$uibModalInstance.close(vm.tsSection);
  			  	} 
  		  	});
		}
		
		function cancel() {
		    $uibModalInstance.dismiss('cancel');
		}
	}
})();
