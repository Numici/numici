;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('WarningController',WarningController);
	
	WarningController.$inject = ['$scope','$uibModal', '$uibModalInstance','data'];

	function WarningController($scope,$uibModal,$uibModalInstance,data) {
		var wc = this;
		
		// Instance variables
		wc.title = data.title;
		wc.message = data.message;
		wc.enableHeader = data.enableHeader;
		wc.enableFooter = data.enableFooter;
		
		// Methods
		wc.ok = ok;
		
		/*$scope.$on('orientationChange', function (orientation) {
			if(orientation == "landscape") {
				$uibModalInstance.dismiss();
			}
		});*/

		function ok() {
			$uibModalInstance.dismiss();
		}
		
	}
	
})();