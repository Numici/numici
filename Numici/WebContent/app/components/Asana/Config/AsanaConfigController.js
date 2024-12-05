;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('AsanaConfigController',AsanaConfigController);
	
	AsanaConfigController.$inject = ['$scope','$uibModalInstance','appData','AsanaService','config','$confirm'];

	function AsanaConfigController($scope,$uibModalInstance,appData,AsanaService,config,$confirm) {
		var self = this;
		
		self.config = config;
		self.revokeAuthPerms = revokeAuthPerms;
		self.cancel = cancel;
		
		function revokeAuthPerms() {
			var txt = 'Are you sure you want to revoke Asana Config ?';
			$confirm({text: txt})
	        .then(function() {
	        	AsanaService.revokeAuthPerms().then(function(resp) {
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