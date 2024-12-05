;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('LinkedInConfigController',LinkedInConfigController);
	
	LinkedInConfigController.$inject = ['$scope','$confirm','$uibModalInstance','appData','LinkedInService','config','APIUserMessages'];
	
	function LinkedInConfigController($scope,$confirm,$uibModalInstance,appData,LinkedInService,config,APIUserMessages) {
		var self = this;
		
		self.config = config;
		self.revokeAuthPerms = revokeAuthPerms;
		self.cancel = cancel;
		
		function revokeAuthPerms() {
			var txt = 'Are you sure you want to revoke LinkedIn Config ?';
			$confirm({text: txt})
	        .then(function() {
	        	LinkedInService.revokeAuthPerms({}).then(function(resp) {
					if(resp.status == 200 && resp.data.Status) {
						$uibModalInstance.close(resp.data.Status);
					}
				});
	        });
		}
		
		function cancel() {
			$uibModalInstance.dismiss('cancel');
		}
	}
	
})();