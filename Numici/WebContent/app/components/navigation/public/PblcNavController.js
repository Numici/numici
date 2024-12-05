
;(function(){
	'use strict';
	
	angular.module("vdvcApp").controller('PblcNavController',PblcNavController);
	
	PblcNavController.$inject = ['$state','companyName','usrInfResp','$uibModal'];
	
	function PblcNavController($state,companyName,usrInfResp,$uibModal) {
			
			var vm = this;
			
			vm.Company = companyName;
			vm.currentState = $state.$current.name;
			vm.isCollapsed = true;
			vm.hasSession = false;
			vm.openRegisterModal = openRegisterModal;
			
			function openRegisterModal (size) {
				var modalInstance = $uibModal.open({
				      animation: true,
				      templateUrl: 'app/components/RegisterProvisionalUser/Registration/RegisterProUserModal.html',
				      controller: 'RegisterProUserModalController',
				      controllerAs: 'rpmc',
				      backdrop: 'static',
				      size: size,
				      resolve : {
					    	provisionalUser : {},
					  }
				    });
				
				modalInstance.result.then(function (Status) {
					
				});
			}
			
			function init() {
				if(usrInfResp.status == 200 && usrInfResp.data.Status) {
					if(usrInfResp.data.hasLogin) {
						vm.hasSession = true;
					}
				}
			}
			
			init();
			
	}
})();

