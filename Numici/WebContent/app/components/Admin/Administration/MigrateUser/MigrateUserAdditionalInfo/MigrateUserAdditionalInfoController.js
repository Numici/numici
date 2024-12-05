;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('MigrateUserAdditionalInfoController',MigrateUserAdditionalInfoController);
	
	MigrateUserAdditionalInfoController.$inject = ['$scope','$uibModalInstance','_','additionalInfo'];

	function MigrateUserAdditionalInfoController($scope,$uibModalInstance,_,additionalInfo) {
		var muaic = this;
		
		muaic.infoFor = angular.copy(additionalInfo.infoFor);
		muaic.elementValue = angular.copy(additionalInfo.elementValue);
		muaic.info = !_.isEmpty(additionalInfo.info) ? angular.copy(additionalInfo.info) : "";
		
		muaic.ok = ok;
				
		function ok() {
			$uibModalInstance.close();
		}
		
		function init() {
			if(!_.isEmpty(muaic.info)) {
				muaic.info = muaic.info.replace(/\/n/g, "<br>");
			} else {
				muaic.info = "No info found";
			}
		}
		init();
	}	
	
})();