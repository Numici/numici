;(function() {
	'use strict'; 
	
	angular.module('vdvcApp').directive("showPassword", function() { 
	    return function linkFn(scope, elem, attrs) {
	        scope.$watch(attrs.showPassword, function(newValue) {
	            if (newValue) {
	                elem.attr("type", "text");
	            } else {
	                elem.attr("type", "password");
	            };
	        });
	    };
	});
	
	angular.module('vdvcApp').controller('ChangePasswordController',ChangePasswordController);
	
	ChangePasswordController.$inject = ['$scope','$uibModalInstance','_','userService','MessageService','$uibModal','appData','$confirm'];
	
	function ChangePasswordController($scope,$uibModalInstance,_,userService,MessageService,$uibModal,appData,$confirm) {
		
		var vm = this;
		var appdata = appData.getAppData();
		//variables
		vm.currentPasswordType = "password";
		vm.newPasswordType = "password";
		vm.confirmPasswordType = "password";
		vm.currentPassword;
		vm.newPassword;
		vm.confirmPassword;
		vm.showCurrentPwd = false;
		vm.showConfirmPwd = false;
		vm.currentPwdToolTip = "Show Current Password";
		vm.confirmPwdToolTip = "Show Confirm Password";
		vm.ShowCurrentPWDErrorMessage = false;
		vm.currentPWDErrorMessage = "";
		vm.ShowNewPWDErrorMessage = false;
		vm.newPWDErrorMessage = "";
		vm.ShowConfirmPWDErrorMessage = false;
		vm.confirmPWDErrorMessage = "";
		vm.localPassword = appdata['localPassword'];
		vm.isCancelable = appdata['pwdChanged'];
		//methods
		vm.enableChange = enableChange;
		vm.showCurrentPassword = showCurrentPassword;
		vm.showConfirmPassword = showConfirmPassword;
		vm.ok = ok;
		vm.cancel = cancel;
		
		
		function enableChange() {
			var status = true;
			if((!vm.localPassword || vm.currentPassword && vm.currentPassword.length > 0) && (vm.newPassword && vm.newPassword.length > 0) && (vm.confirmPassword && vm.confirmPassword.length > 0)) {
				status = false;
			} else {
				status = true;
			}
			return status;
		}
		
		function showCurrentPassword () {
			vm.showCurrentPwd = !vm.showCurrentPwd;
			if(vm.showCurrentPwd) {
				vm.CurrentPwdToolTip = "Hide Current Password";
			} else {
				vm.CurrentPwdToolTip = "Show Current Password";
			}
		}
		
		function showConfirmPassword () {
			vm.showConfirmPwd = !vm.showConfirmPwd;
			if(vm.showConfirmPwd) {
				vm.ConfirmPwdToolTip = "Hide Confirm Password";
			} else {
				vm.ConfirmPwdToolTip = "Show Confirm Password";
			}
		}
		
		function ok () {
			if(!vm.localPassword || (vm.currentPassword && vm.currentPassword.length > 0)){
				vm.ShowCurrentPWDErrorMessage = false;
				vm.currentPWDErrorMessage = "";
				if(vm.newPassword && vm.newPassword.length > 0){
					vm.ShowNewPWDErrorMessage = false;
					vm.newPWDErrorMessage = "";
					if(!vm.localPassword || (vm.currentPassword != vm.newPassword)) {
						vm.ShowNewPWDErrorMessage = false;
						vm.newPWDErrorMessage = "";
						if(vm.confirmPassword && vm.confirmPassword.length > 0) {
							vm.ShowConfirmPWDErrorMessage = false;
							vm.confirmPWDErrorMessage = "";
							if(!vm.localPassword || (vm.newPassword == vm.confirmPassword)) {
								vm.ShowConfirmPWDErrorMessage = false;
								vm.confirmPWDErrorMessage = "";
								var postdata = {};
								postdata['username'] = appdata.UserId;
								if(vm.localPassword) {
									postdata['currentpassword'] = vm.currentPassword;
								}
								postdata['password'] = vm.newPassword;
								userService.changePassword(postdata).then( function(resp) {
									if(resp.status && resp.data.Status) {
										appdata['pwdChanged'] = true;
										MessageService.showSuccessMessage("PASSWORD_CHANGE");
										$confirm({text: 'Password is updated successfully, please re-login with new credentials'},
												{ templateUrl: 'app/components/common/CustomeTemplates/confirmTemplate.html' })
								        .then(function() {
								        	$uibModalInstance.close(resp.data.Status);
									    },function() {
									    	$uibModalInstance.close(resp.data.Status);
									    });
										
									} else if(!resp.data.Status && resp.data.Message == "Error encrypting user password.") {
										
									}
								});
							}  else {
								vm.ShowConfirmPWDErrorMessage = true;
								vm.confirmPWDErrorMessage = "New Password And Confirm Password Should Be Same";
							}
						} else {
							vm.ShowConfirmPWDErrorMessage = true;
							vm.confirmPWDErrorMessage = "Please Enter Valid Confirm Password";
						}
					} else {
						vm.ShowNewPWDErrorMessage = true;
						vm.newPWDErrorMessage = "Current Password And New Password Can't Be Same";
					}
				}  else {
					vm.ShowNewPWDErrorMessage = true;
					vm.newPWDErrorMessage = "Please Enter Valid New Password";
				}
			} else {
				vm.ShowCurrentPWDErrorMessage = true;
				vm.currentPWDErrorMessage = "Please Enter Valid New Password";
			}
						
		}
	  
		function cancel () {
			$uibModalInstance.dismiss('cancel');
	    }
		
	}
})();