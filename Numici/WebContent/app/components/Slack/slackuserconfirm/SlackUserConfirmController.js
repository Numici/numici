;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('SlackUserConfirmController',SlackUserConfirmController);
	
	SlackUserConfirmController.$inject = ['$scope','$uibModalInstance','SlackUserConfirmData'];

	function SlackUserConfirmController($scope,$uibModalInstance,SlackUserConfirmData) {
		var succ = this;
		
		// Instance variables
		succ.title = SlackUserConfirmData.title;
		succ.text = SlackUserConfirmData.text;
		
		// Methods
		succ.ok = ok;
		succ.cancel = cancel;
		
		function ok() {
			$uibModalInstance.close();
		}
		
		function cancel() {
			$uibModalInstance.dismiss('cancel');
		}
	}
})();