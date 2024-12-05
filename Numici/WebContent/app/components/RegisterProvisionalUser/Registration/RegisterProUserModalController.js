;(function() {
	'use strict'; 
	
	angular.module('vdvcApp').controller('RegisterProUserModalController',RegisterProUserModalController);
	
	RegisterProUserModalController.$inject = ['$scope','$state','$stateParams','$uibModalInstance','_','appData',
	                                          'AuthService','userService','provisionalUser','UserRegistrationService',
	                                          'RegisterProUserService','MessageService','$confirm','$window','uuidService',
	                                          'commonService'];
	
	function RegisterProUserModalController($scope,$state,$stateParams,$uibModalInstance,_,appData,AuthService,
			userService,provisionalUser,UserRegistrationService,RegisterProUserService,MessageService,$confirm,
			$window,uuidService,commonService) {
		
		var rpmc = this;
		var appdata = appData.getAppData();
		var uid = uuidService.newUuid();
		$scope.signInUrl = "";
		$scope.googleSignInUrl = "";
		$scope.$emit("PageName",{"userName":appdata.UserName,"pageName":$state.current.pageName});
		var appdata = appData.getAppData();
		var userExists = false;
		//variables
		rpmc.UserRole = appdata.UserRole;
		rpmc.firstName;
		rpmc.lastName;
		rpmc.organization;
		rpmc.mobilePhone;
		rpmc.email = !_.isEmpty(provisionalUser.email) ? angular.copy(provisionalUser.email) : "";
		rpmc.newPassword;
		rpmc.confirmPassword;
		rpmc.isProvisionalUser = false;
		
		rpmc.showConfirmPwd = false;
		rpmc.confirmPwdToolTip = "Show Confirm Password";
		rpmc.isOtpSent = false;
		rpmc.errorMessage = "";
		rpmc.showErrorMessage = false;
		rpmc.firstNameError = false;
		rpmc.lastNameError = false;
		rpmc.mobileError = false;
		rpmc.userIdError = false;
		rpmc.PWDError = false;
		rpmc.confirmPWDError = false;
		rpmc.otpError = false; 
		rpmc.registerUserFromExt = false;
		
		//methods
		rpmc.validateEmail = validateEmail;
		rpmc.validateFirstName = validateFirstName;
		rpmc.validateLastName = validateLastName;
		rpmc.validatePwd = validatePwd;
		rpmc.validateConfirmPwd = validateConfirmPwd;
		rpmc.disableRegister = disableRegister;
		rpmc.showConfirmPassword = showConfirmPassword;
		rpmc.getAttrVal = getAttrVal;
		rpmc.ok = ok;
		rpmc.cancel = cancel;
		rpmc.signInWithSlack = signInWithSlack;
		
		rpmc.googleInitError = false;
		rpmc.googleIniterrMsg = "";
		
		function isValidEmail () {
			var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
			return regex.test(rpmc.email);
		}
		
		function isUserExistWithEmail() {
			var postdata = {"loginId" : rpmc.email};
			UserRegistrationService.isUserExistWithEmail(postdata).then( function(resp) {
				if(resp.status && resp.data.Status) {
					userExists = resp.data.userExists;
					if(userExists) {
						setErrorMsg("email","exist",resp.data.Message);
					} else {
						rpmc.userIdError = false;
						rpmc.userIdErrorMessage = "";
					}
				}
			});
		}
		
		function validateEmail() {
			rpmc.showErrorMessage = false;
			rpmc.errorMessage = "";
			if(!isValidEmail ()) {
				setErrorMsg("email","invalid");
			} else {
				rpmc.userIdError = false;
				rpmc.userIdErrorMessage = "";
				isUserExistWithEmail();
			}
		}
		
		function validateFirstName() {
			if(_.isEmpty(rpmc.firstName)) {
				setErrorMsg("firstName","invalid");
			} else {
				rpmc.firstNameError = false;
				rpmc.firstNameErrorMessage = "";
			}
		}
		
		function validateLastName() {
			if(_.isEmpty(rpmc.lastName)) {
				setErrorMsg("lastName","invalid");
			} else {
				rpmc.lastNameError = false;
				rpmc.lastNameErrorMessage = "";
			}
		}
		
		function validatePwd() {
			if(_.isEmpty(rpmc.newPassword)) {
				setErrorMsg("pwd","invalid");
			} else {
				rpmc.PWDError = false;
				rpmc.PWDErrorMessage = "";
			}
		}
		
		function validateConfirmPwd() {
			if(_.isEmpty(rpmc.confirmPassword)) {
				setErrorMsg("confirmpwd","invalid");
			} else if(!_.isEmpty(rpmc.newPassword) && rpmc.newPassword != rpmc.confirmPassword) {
				setErrorMsg("confirmpwd","notmatch");
			} else {
				rpmc.confirmPWDError = false;
				rpmc.confirmPWDErrorMessage = "";
			}
		}
		
		function isValidMobile () {
			var regex = /^[0-9]{10}$/;
			return regex.test(rpmc.mobilePhone);
		}
		
		function disableRegister() {
			var status = true;
			if((rpmc.firstName && rpmc.firstName.length > 0) && 
				(rpmc.lastName && rpmc.lastName.length > 0) && 
				(rpmc.email && rpmc.email.length > 0 && isValidEmail() && !userExists) && 
				(rpmc.newPassword && rpmc.newPassword.length > 0) && 
				(rpmc.confirmPassword && rpmc.confirmPassword.length > 0)) {
				status = false;
			}
			return status;
		}
		
		function showConfirmPassword () {
			rpmc.showConfirmPwd = !rpmc.showConfirmPwd;
			if(rpmc.showConfirmPwd) {
				rpmc.ConfirmPwdToolTip = "Hide Confirm Password";
			} else {
				rpmc.ConfirmPwdToolTip = "Show Confirm Password";
			}
		}
		
		function removeErrorMsgs () {
			rpmc.userIdError = false;
			rpmc.firstNameError = false;
			rpmc.lastNameError = false;
			rpmc.mobileError = false;
			rpmc.PWDError = false;
			rpmc.confirmPWDError = false;
			rpmc.otpError = false;
			rpmc.showErrorMessage = false;
			rpmc.errorMessage = "";
			rpmc.userIdErrorMessage = "";
			rpmc.firstNameErrorMessage = "";
			rpmc.lastNameErrorMessage = "";
			rpmc.mobileErrorMessage = "";
			rpmc.PWDErrorMessage = "";
			rpmc.confirmPWDErrorMessage = "";
		}
		
		function setErrorMsg (field,type,Message) {
			if(field === "all") {
				rpmc.showErrorMessage = true;
				rpmc.errorMessage = "Please Fill All Required Fields.";
				rpmc.userIdError = true;
				rpmc.firstNameError = true;
				rpmc.lastNameError = true;
				rpmc.PWDError = true;
				rpmc.confirmPWDError = true;
			}
			
			if(field === "email") {
				rpmc.userIdError = true;
				if(field === "email" && type === "invalid") {
					rpmc.userIdErrorMessage = "Please Enter Valid Email.";
					if(!_.isEmpty(Message)) {
						rpmc.userIdErrorMessage = Message;
					}
				}
				if(field === "email" && type === "exist") {
					rpmc.userIdErrorMessage = "User With Given Email Already Exists.";
					if(!_.isEmpty(Message)) {
						rpmc.userIdErrorMessage = Message;
					}
				}
			}
			if(field === "firstName" && type === "invalid") {
				rpmc.firstNameError = true;
				rpmc.firstNameErrorMessage = "Please Enter Valid First Name.";
			}
			if(field === "lastName" && type === "invalid") {
				rpmc.lastNameError = true;
				rpmc.lastNameErrorMessage = "Please Enter Valid Last Name.";
			}
			if(field === "mobile" && type === "invalid") {
				rpmc.mobileError = true;
				rpmc.mobileErrorMessage = "Please Enter Valid Mobile Number.";
			}
			if(field === "pwd" && type === "invalid") {
				rpmc.PWDError = true;
				rpmc.PWDErrorMessage = "Please Enter Valid Password.";
			}
			if(field === "confirmpwd") {
				rpmc.confirmPWDError = true;
				if(field === "confirmpwd" && type === "invalid") {
					rpmc.confirmPWDErrorMessage = "Please Enter Valid Confirm Password.";
				}
				if(field === "confirmpwd" && type === "notmatch") {
					rpmc.confirmPWDErrorMessage = "New Password And Confirm Password Should Be Same.";
				}
			}
			if(field === "otp" && type === "invalid") {
				rpmc.otpError = true;
				rpmc.showErrorMessage = true;
				rpmc.errorMessage = "Please Enter Valid OTP.";
			}
			if(field === "register") {
				rpmc.showErrorMessage = true;
				rpmc.errorMessage = "Something Went Wrong While Register.";
			}
		}
		
		function preparePostdata () {
			var postdata = {};
			postdata['firstName'] = rpmc.firstName;
			postdata['lastName'] = rpmc.lastName;
			if(rpmc.organization && rpmc.organization.length > 0) {
				postdata['organization'] = rpmc.organization;
			}
			postdata['email'] = rpmc.email;
			if(provisionalUser.encId) {
				postdata['encId'] = provisionalUser.encId;
			}
			postdata['password'] = rpmc.newPassword;
			return postdata;
		}
		
		function cancelRegister() {
			location.href = document.referrer;
		}
		
		var VerifyOTPModalInstance;
		function createUser (postdata) {
			rpmc.showErrorMessage = false;
			rpmc.errorMessage = "";
			UserRegistrationService.createUser(postdata).then( function(resp) {
				if(resp.status && resp.data.Status) {
					var provisionalUser = {};
					provisionalUser["email"] = rpmc.email;
					provisionalUser["encId"] = resp.data.encId;
					provisionalUser["message"] = resp.data.Message;
					VerifyOTPModalInstance = UserRegistrationService.openVerifyOTPModal (provisionalUser,"md");
					VerifyOTPModalInstance.result.then(function (Status) {
						if(rpmc.registerUserFromExt){
							cancelRegister();
						} else{
							$uibModalInstance.close(Status);
						}
					},function() {
						if(rpmc.registerUserFromExt){
							cancelRegister();
						} else{
							$uibModalInstance.dismiss('cancel');
						}
					});
				} else {
					rpmc.showErrorMessage = true;
					rpmc.errorMessage = resp.data.Message;
				}
			});
		}
		
		/*var VerifyOTPSuccessModalInstance;
		function openVerifyOtpSuccessModal(registerProvisionalUserResponse) {
			VerifyOTPSuccessModalInstance = UserRegistrationService.openVerifyOTPSuccessModal (registerProvisionalUserResponse);
			VerifyOTPSuccessModalInstance.result.then(function (verifyOTPSuccessResponse) {
				if(verifyOTPSuccessResponse === "skipGetExtension") {
					$uibModalInstance.close(registerProvisionalUserResponse.data.Status);
				} else if(verifyOTPSuccessResponse === "getExtension") {
					var extensionUrl = "https://chrome.google.com/webstore/detail/numici-annotate-converse/oojabgademjndedjpcnagfgiglcpolgd";
					$window.open(extensionUrl);
					$uibModalInstance.close(registerProvisionalUserResponse.data.Status);
				}
			},function() {
		    	
		    });
		}*/
		
		function registerProUser (postdata) {
			RegisterProUserService.registerProvisionalUser(postdata).then( function(resp) {
				if(resp.status && resp.data.Status) {
					$uibModalInstance.close("skipGetExtension");
					//openVerifyOtpSuccessModal(resp);
					/*provisionalUser["message"] = resp.data.Message;
					VerifyOTPModalInstance = UserRegistrationService.openVerifyOTPSuccessModal (verifyOTPResponse);
					VerifyOTPModalInstance.result.then(function (Status) {
						$uibModalInstance.close(Status);
					},function() {
						$uibModalInstance.dismiss('cancel');
				    });*/
				}
			});
		}
		
		function getAttrVal(prefix) {
			if(prefix) {
				return prefix+"_"+uid;
			}
		}
		
		function ok () {
			if(!disableRegister()){
				removeErrorMsgs();
				if(isValidEmail()) {
					if(rpmc.newPassword && rpmc.newPassword.length > 0){
						if(rpmc.confirmPassword && rpmc.confirmPassword.length > 0) {
							if(rpmc.newPassword == rpmc.confirmPassword) {
								var postdata = preparePostdata();
								if(_.isEmpty(rpmc.mobilePhone)) {
									if(!_.isEmpty(provisionalUser.email)) {
										registerProUser(postdata)
									} else {
										createUser (postdata);
									}
								} else if(!_.isEmpty(rpmc.mobilePhone) && isValidMobile()) {
									postdata['mobile'] = rpmc.mobilePhone;
									if(!_.isEmpty(provisionalUser.email)) {
										registerProUser(postdata)
									} else {
										createUser (postdata);
									}
								} else if(!_.isEmpty(rpmc.mobilePhone) && !isValidMobile()) {
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
			if(rpmc.registerUserFromExt){
				cancelRegister();
			} else{
				$uibModalInstance.dismiss('cancel');
			}
		}
		
		function signInWithSlack() {
			AuthService.logout().then(function (resp) {
				if(resp.status == 200 ) {
					$window.location.href = $scope.signInUrl;
				}
			});
		}
		
		function init() {
			if($state && $state.params && !_.isEmpty($state.params.proUser)) {
				rpmc.isProvisionalUser = true;
			}
			userService.getSlackSignInUrl().then(function(resp) {
				if(resp.data.Status) {
					$scope.signInUrl = resp.data.Data;
				}
			});
			userService.getGoogleSignInUrl().then(function(resp) {
				if(resp.data.Status) {
					$scope.googleSignInUrl = resp.data.Data;
				}
			});
			if($state.current.name == "reguserfromext"){
				rpmc.registerUserFromExt = true;
			} else{
				rpmc.registerUserFromExt = false;
			}
			if($state.params.donotShowNavBar) {
				commonService.hideNaveBar();
			}
			/*AuthService.startApp().then(function(resp) {
				if(!resp.status) {
					rpmc.googleInitError = true;
					rpmc.googleIniterrMsg = resp.error;
				}
			});*/
		}
		 
		init();
	}
})();