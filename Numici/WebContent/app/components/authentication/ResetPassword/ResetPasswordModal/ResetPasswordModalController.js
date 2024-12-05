;(function() {
	'use strict'; 
	
	angular.module('vdvcApp').controller('ResetPasswordModalController',ResetPasswordModalController);
	
	ResetPasswordModalController.$inject = ['$scope','$state','$stateParams','$uibModalInstance','_','userService','MessageService','userInfo','$confirm'];
	
	function ResetPasswordModalController($scope,$state,$stateParams,$uibModalInstance,_,userService,MessageService,userInfo,$confirm) {
		
		var rpm = this;
		
		//variables
		rpm.userInfo = angular.copy(userInfo);
		rpm.newPasswordType = "password";
		rpm.confirmPasswordType = "password";
		rpm.newPassword;
		rpm.confirmPassword;
		rpm.showConfirmPwd = false;
		rpm.confirmPwdToolTip = "Show Confirm Password";
		rpm.currentPWDErrorMessage = "";
		rpm.ShowNewPWDErrorMessage = false;
		rpm.newPWDErrorMessage = "";
		rpm.ShowConfirmPWDErrorMessage = false;
		rpm.confirmPWDErrorMessage = "";
		
		//methods
		rpm.enableReset = enableReset;
		rpm.showConfirmPassword = showConfirmPassword;
		rpm.ok = ok;
		rpm.cancel = cancel;
		
		function enableReset() {
			var status = true;
			if((rpm.newPassword && rpm.newPassword.length > 0) && (rpm.confirmPassword && rpm.confirmPassword.length > 0)) {
				status = false;
			} else {
				status = true;
			}
			return status;
		}
		
		function showConfirmPassword () {
			rpm.showConfirmPwd = !rpm.showConfirmPwd;
			if(rpm.showConfirmPwd) {
				rpm.ConfirmPwdToolTip = "Hide Confirm Password";
			} else {
				rpm.ConfirmPwdToolTip = "Show Confirm Password";
			}
		}
		
		function ok () {
			if(rpm.newPassword && rpm.newPassword.length > 0){
				rpm.ShowNewPWDErrorMessage = false;
				rpm.newPWDErrorMessage = "";
				if(rpm.confirmPassword && rpm.confirmPassword.length > 0) {
					rpm.ShowConfirmPWDErrorMessage = false;
					rpm.confirmPWDErrorMessage = "";
					if(rpm.newPassword == rpm.confirmPassword) {
						rpm.ShowConfirmPWDErrorMessage = false;
						rpm.confirmPWDErrorMessage = "";
						var postdata = {};
						postdata['loginid'] = rpm.userInfo.loginId;
						postdata['password'] = rpm.newPassword;
						postdata['token'] = $stateParams.token;
						userService.resetPassword(postdata).then( function(resp) {
							if(resp.status && resp.data.Status) {
								$state.go("resetpwdsuccess");
							} else if(!resp.data.Status && resp.data.Message == "Error encrypting user password.") {
								MessageService.showErrorMessage("RESET_PWD_ERR_MSG",[resp.data.Message]);
							}
						});
					}  else {
						rpm.ShowConfirmPWDErrorMessage = true;
						rpm.confirmPWDErrorMessage = "New Password And Confirm Password Should Be Same";
					}
				} else {
					rpm.ShowConfirmPWDErrorMessage = true;
					rpm.confirmPWDErrorMessage = "Please Enter Valid Confirm Password";
				}
			}  else {
				rpm.ShowNewPWDErrorMessage = true;
				rpm.newPWDErrorMessage = "Please Enter Valid New Password";
			}
		}
	  
		function cancel () {
			$uibModalInstance.dismiss('cancel');
	    }
	}
})();