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
	
	angular.module('vdvcApp').controller('UserRegistrationController',UserRegistrationController);
	
	UserRegistrationController.$inject = ['$scope','$uibModalInstance','_','UserRegistrationService','MessageService','appData'];
	
	function UserRegistrationController($scope,$uibModalInstance,_,UserRegistrationService,MessageService,appData) {
		
		var ur = this;
		var appdata = appData.getAppData();
		//variables
		ur.firstName;
		ur.lastName;
		ur.organization;
		ur.mobilePhone;
		ur.email;
		ur.newPassword;
		ur.confirmPassword;
		
		ur.showConfirmPwd = false;
		ur.confirmPwdToolTip = "Show Confirm Password";
		ur.errorMessage = "";
		ur.showErrorMessage = false;
		ur.firstNameError = false;
		ur.lastNameError = false;
		ur.mobileError = false;
		ur.userIdError = false;
		ur.PWDError = false;
		ur.confirmPWDError = false;
		ur.isCancelable = appdata['pwdChanged'];
		
		//methods
		ur.disableRegister = disableRegister;
		ur.showConfirmPassword = showConfirmPassword;
		ur.ok = ok;
		ur.cancel = cancel;
		
		function isValidEmail () {
			var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
			return regex.test(ur.email);
		}
		
		function isValidMobile () {
			var regex = /^[0-9]{10}$/;
			return regex.test(ur.mobilePhone);
		}
		
		function disableRegister() {
			var status = true;
			if((ur.firstName && ur.firstName.length > 0) && 
				(ur.lastName && ur.lastName.length > 0) && 
				(ur.email && ur.email.length > 0 && isValidEmail()) && 
				(ur.newPassword && ur.newPassword.length > 0) && 
				(ur.confirmPassword && ur.confirmPassword.length > 0)) {
				status = false;
			}
			return status;
		}
		
		function showConfirmPassword () {
			ur.showConfirmPwd = !ur.showConfirmPwd;
			if(ur.showConfirmPwd) {
				ur.ConfirmPwdToolTip = "Hide Confirm Password";
			} else {
				ur.ConfirmPwdToolTip = "Show Confirm Password";
			}
		}
		
		function removeErrorMsgs () {
			ur.firstNameError = false;
			ur.lastNameError = false;
			ur.mobileError = false;
			ur.userIdError = false;
			ur.PWDError = false;
			ur.confirmPWDError = false;
			ur.showErrorMessage = false;
			ur.errorMessage = "";
		}
		
		function setErrorMsg (field,type) {
			ur.showErrorMessage = true;
			if(field === "all") {
				ur.firstNameError = true;
				ur.lastNameError = true;
				ur.errorMessage = "Please Fill All Required Fields.";
			}
			
			if(field === "mobile" && type === "invalid") {
				ur.mobileError = true;
				ur.errorMessage = "Please Enter Valid Mobile Number.";
			}
			
			if(field === "all" || field === "email") {
				ur.userIdError = true;
				if(field === "email" && type === "invalid") {
					ur.errorMessage = "Please Enter Valid Email.";
				}
				if(field === "email" && type === "exist") {
					ur.errorMessage = "User With Given Email Already Exists.";
				}
			}
			if(field === "all" || field === "pwd") {
				ur.PWDError = true;
				if(field === "pwd" && type === "invalid") {
					ur.errorMessage = "Please Enter Valid Password.";
				}
			}
			if(field === "all" || field === "confirmpwd") {
				ur.confirmPWDError = true;
				if(field === "confirmpwd" && type === "invalid") {
					ur.errorMessage = "Please Enter Valid Confirm Password.";
				}
				if(field === "confirmpwd" && type === "notmatch") {
					ur.errorMessage = "New Password And Confirm Password Should Be Same.";
				}
			}
			if(field === "register") {
				ur.errorMessage = "Something Went Wrong While Register.";
			}
		}
		
		function processPostdata () {
			var postdata = {};
			postdata['firstName'] = ur.firstName;
			postdata['lastName'] = ur.lastName;
			if(ur.organization && ur.organization.length > 0) {
				postdata['organization'] = ur.organization;
			}
			
			postdata['email'] = ur.email;
			postdata['password'] = ur.newPassword;
			return postdata;
		}
		var VerifyOTPModalInstance;
		function createUser (postdata) {
			UserRegistrationService.createUser(postdata).then( function(resp) {
				if(resp.status && resp.data.Status) {
					var provisionalUser = {};
					provisionalUser["email"] = ur.email;
					provisionalUser["encId"] = resp.data.encId;
					provisionalUser["message"] = resp.data.Message;
					VerifyOTPModalInstance = UserRegistrationService.openVerifyOTPModal (provisionalUser,"md");
					VerifyOTPModalInstance.result.then(function (Status) {
						$uibModalInstance.close(Status);
					},function() {
				    	$uibModalInstance.close();
				    });
				} else {
					ur.showErrorMessage = true;
					ur.errorMessage = resp.data.Message;
				}
			});
		}
		function ok () {
			if(!disableRegister()){
				removeErrorMsgs();
				if(isValidEmail()) {
					if(ur.newPassword && ur.newPassword.length > 0){
						if(ur.confirmPassword && ur.confirmPassword.length > 0) {
							if(ur.newPassword == ur.confirmPassword) {
								var postdata = processPostdata();
								if(_.isEmpty(ur.mobilePhone)) {
									createUser (postdata);
								} else if(!_.isEmpty(ur.mobilePhone) && isValidMobile()) {
									postdata['mobile'] = ur.mobilePhone;
									createUser (postdata);
								} else if(!_.isEmpty(ur.mobilePhone) && !isValidMobile()) {
									setErrorMsg("mobile","invalid");
								}
							}  else {
								setErrorMsg("confirmpwd","notmatch");
							}
						} else {
							setErrorMsg("confirmpwd","invalid");
						}
						
					}  else {
						setErrorMsg("pwd","invalid");
					}
				} else {
					setErrorMsg("email","invalid");
				}
			} else {
				setErrorMsg("all");
			}
						
		}
	  
		function cancel () {
			$uibModalInstance.dismiss('cancel');
	    }
		
	}
})();