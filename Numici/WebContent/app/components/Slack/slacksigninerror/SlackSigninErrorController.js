;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('SlackSigninErrorController',SlackSigninErrorController);
	
	SlackSigninErrorController.$inject = ['$scope','$uibModalInstance','SlackSigninErrorData'];

	function SlackSigninErrorController($scope,$uibModalInstance,SlackSigninErrorData) {
		var ssec = this;
		
		// Instance variables
		ssec.title = SlackSigninErrorData.title;
		ssec.text = SlackSigninErrorData.text;
		
		// Methods
		ssec.ok = ok;
		
		function ok() {
			$uibModalInstance.close();
		}
	}
})();