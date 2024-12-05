;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('WebexConfigController',WebexConfigController);
	
	WebexConfigController.$inject = ['$uibModalInstance',"appData",'WebexService','config','$confirm'];

	function WebexConfigController($uibModalInstance,appData,WebexService,config,$confirm) {
		var self = this;
		
		self.config = config;
		self.revokeAuthPerms = revokeAuthPerms;
		self.cancel = cancel;
		
		function revokeAuthPerms() {
			var txt = 'Are you sure you want to revoke Webex Authorization?';
			$confirm({text: txt})
	        .then(function() {
				WebexService.revokeAuth().then(function(resp) {
					if(resp.status == 200 && resp.data.Status) {
						$uibModalInstance.close(resp.data.Status);
						var appdata = appData.getAppData();
						appData.setAppData("hasWebexAuth",false);
					}
				});
	        });
		}
		
		function cancel() {
			$uibModalInstance.dismiss('cancel');
		}
	}	
	
})();