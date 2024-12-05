;(function() {
	'use strict'; 
	
	angular.module('vdvcApp').controller('ResetPasswordController',ResetPasswordController);
	
	ResetPasswordController.$inject = ['$scope','$state','$stateParams','_','userService','$uibModal'];
	
	function ResetPasswordController($scope,$state,$stateParams,_,userService,$uibModal) {
		
		var rp = this;
		rp.userObj = {};
		
		function openResetPasswordModal() {
			var modalInstance = $uibModal.open({
			      animation: $scope.animationsEnabled,
			      templateUrl: 'app/components/authentication/ResetPassword/ResetPasswordModal/ResetPasswordModal.html',
			      controller: 'ResetPasswordModalController',
			      controllerAs: 'rpm',
			      windowClass : "resetPwdModal",
			      appendTo : $('#Reset-Pwd-Container'),
			      backdrop: 'static',
			      resolve: {
				      userInfo : rp.userObj
			      }
			});
			modalInstance.result.then(function (status) {
				$state.go("login",{"fromCode":true});
			});
		}
		
		function init() {
			var postdata = {};
			postdata['token'] = $stateParams.token;
			userService.getByResetToken(postdata).then( function(resp) {
				if(resp.status && resp.data.Status) {
					rp.userObj = resp.data.Users;
					openResetPasswordModal();
				}
			});
		}
		
		init();
	}
})();