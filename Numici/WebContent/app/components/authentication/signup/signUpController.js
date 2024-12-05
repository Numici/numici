;(function() {
	'use strict'; 
	
	angular.module('vdvcApp').controller('SignUpController',SignUpController);
	
	SignUpController.$inject = ['$scope','$state','$uibModal','_','userService'];
	
	function SignUpController($scope,$state,$uibModal,_,userService) {
		
		var self = this;
		
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
				
			},function() {
				$state.go('login');
		    });
		}
		function init() {
			userService.getLoginInfo().then(function(usrInfResp) {
	   			if(usrInfResp.status == 200 && usrInfResp.data.Status) {
	   				if(usrInfResp.data.hasLogin) {
	   					userService.goToHomePage();
	   				} else {
	   					openRegisterModal('md');
	   				}
	   			}
			});
		}
		init();
	}
})();