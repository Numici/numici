;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('VDVCAlertController',VDVCAlertController);
	
	VDVCAlertController.$inject = ['$scope','$sce','$uibModalInstance','VDVCAlertData'];

	function VDVCAlertController($scope,$sce,$uibModalInstance,VDVCAlertData) {
		var vac = this;
		
		// Instance variables
		vac.text = $sce.trustAsHtml(VDVCAlertData.text);
		
		// Methods
		vac.ok = ok;
		
		function ok() {
			$uibModalInstance.close();
		}
	}
})();