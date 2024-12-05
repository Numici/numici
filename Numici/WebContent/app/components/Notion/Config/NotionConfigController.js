;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('NotionConfigController',NotionConfigController);
	
	NotionConfigController.$inject = ['$uibModalInstance','NotionService','config','$confirm'];

	function NotionConfigController($uibModalInstance,NotionService,config,$confirm) {
		var self = this;
		
		self.config = config;
		self.revokeAuthPerms = revokeAuthPerms;
		self.cancel = cancel;
		
		function revokeAuthPerms() {
			var txt = 'Are you sure you want to revoke Notion Config ?';
			$confirm({text: txt})
	        .then(function() {
				NotionService.revokeAuth().then(function(resp) {
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