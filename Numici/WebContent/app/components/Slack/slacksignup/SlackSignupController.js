;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('slackSignupController',slackSignupController);
	
	slackSignupController.$inject = ['$scope','$uibModalInstance','slackAuthInfo'];

	function slackSignupController($scope,$uibModalInstance,slackAuthInfo) {
		var ssc = this;
		
		// Instance variables
		ssc.slackUserMail = slackAuthInfo.slackUserMail;
		ssc.signUpType = {"type" : ""};
		
		// Methods
		ssc.ok = ok;
		ssc.cancel = cancel;
		
		function ok() {
			$uibModalInstance.close(ssc.signUpType.type);
		}
		
		function cancel() {
			$uibModalInstance.dismiss('cancel');
		}
	}
})();