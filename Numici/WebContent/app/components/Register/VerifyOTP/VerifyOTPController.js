;(function() {
	'use strict'; 
	
	angular.module('vdvcApp').controller('VerifyOTPController',VerifyOTPController);
	
	VerifyOTPController.$inject = ['$scope','$state','$stateParams','_','$confirm','UserRegistrationService','RegisterProUserService'];
	
	function VerifyOTPController($scope,$state,$stateParams,_,$confirm,UserRegistrationService,RegisterProUserService) {
		
		var voc = this;
		var provisionalUser = {};
		var VerifyOTPModalInstance;
		function init() {
			if(!_.isEmpty($stateParams.proUser)) {
				var proUser = [];
				proUser = $stateParams.proUser.split("::");
				provisionalUser.email = proUser[0];
				provisionalUser.encId = proUser[1];
			}
			if(!_.isEmpty(provisionalUser)) {
				if(!_.isEmpty($stateParams.otp)) {
					provisionalUser.otp = $stateParams.otp;
				}
				VerifyOTPModalInstance = UserRegistrationService.openVerifyOTPModal(provisionalUser,"md");
				VerifyOTPModalInstance.result.then(function (Status) {
					$state.go('login',{"fromCode":true});
				},function() {
					$state.go('login',{"fromCode":true});
			    });
			}
		}
		
		init();
	}
})();