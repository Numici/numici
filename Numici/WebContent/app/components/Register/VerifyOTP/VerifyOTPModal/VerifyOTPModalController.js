;(function() {
	'use strict'; 
	
	angular.module('vdvcApp').controller('VerifyOTPModalController',VerifyOTPModalController);
	
	VerifyOTPModalController.$inject = ['$scope','$uibModal','$uibModalInstance','_','RegisterProUserService',
	                                    'provisionalUser','UserRegistrationService','MessageService','$confirm',
	                                    'commonService','$window'];
	
	function VerifyOTPModalController($scope,$uibModal,$uibModalInstance,_,RegisterProUserService,
			provisionalUser,UserRegistrationService,MessageService,$confirm,commonService,$window) {
		
		var vomc = this;
		
		var chromeStoreBaseUrlObj = {};
		var extensionNameObj = {};
		var extensionIdObj = {};
		
		$scope.signInUrl = "";
		
		//variables
		vomc.otp = !_.isEmpty(provisionalUser.otp) ? angular.copy(provisionalUser.otp) : "";
		vomc.isOtpSent = true;
		vomc.errorMessage = "";
		vomc.showErrorMessage = false;
		vomc.responseMessage = "";
		vomc.showResponseMessage = false;
		vomc.otpError = false;
		
		//methods
		vomc.disableOTP = disableOTP;
		vomc.disableVerify = disableVerify;
		vomc.sendOTP = sendOTP;
		vomc.ok = ok;
		vomc.cancel = cancel;
		
		function isValidOTP() {
			return !isNaN(vomc.otp);
		}
		
		function disableOTP() {
			return !vomc.isOtpSent;
		}
		
		function disableVerify() {
			var status = true;
			if(!disableOTP() && (vomc.otp && vomc.otp.length > 0 && isValidOTP())) {
				status = false;
			}
			return status;
		}
		
		function sendOTP() {
			vomc.isOtpSent = false;
			var postdata= {};
			postdata['email'] = provisionalUser.email;
			if(provisionalUser.encId) {
				postdata['encId'] = provisionalUser.encId;
			}
			RegisterProUserService.sendOTP(postdata).then( function(resp) {
				if(resp.status && resp.data.Status) {
					vomc.isOtpSent = true;
					var confirmText = resp.data.Message;
					$confirm({text: confirmText},
							{ templateUrl: 'app/components/common/CustomeTemplates/confirmTemplate.html' })
			        .then(function() {
			        	
				    },function() {
				    	
				    });
				}
			});
		}
		
		function removeErrorMsgs () {
			vomc.otpError = false;
			vomc.showErrorMessage = false;
			vomc.errorMessage = "";
		}
		
		function setErrorMsg (field,type) {
			vomc.showErrorMessage = true;
			if(field === "all" || field === "otp") {
				vomc.otpError = true;
				if(field === "otp" && type === "invalid") {
					vomc.errorMessage = "Please Enter Valid OTP.";
				}
			}
			
		}
		
		function preparePostdata () {
			var postdata = {};
			postdata['email'] = provisionalUser.email;
			if(provisionalUser.encId) {
				postdata['encId'] = provisionalUser.encId;
			}
			postdata['otp'] = vomc.otp;
			return postdata;
		}
		
		/*var VerifyOTPSuccessModalInstance;
		function openVerifyOtpSuccessModal(verifyOTPResponse) {
			VerifyOTPSuccessModalInstance = UserRegistrationService.openVerifyOTPSuccessModal (verifyOTPResponse);
			VerifyOTPSuccessModalInstance.result.then(function (verifyOTPSuccessResponse) {
				if(verifyOTPSuccessResponse === "skipGetExtension") {
					$uibModalInstance.close(verifyOTPResponse.data.Status);
				} else if(verifyOTPSuccessResponse === "getExtension") {
					var extensionUrl = "https://chrome.google.com/webstore/detail/numici-annotate-converse/oojabgademjndedjpcnagfgiglcpolgd";
					$window.open(extensionUrl);
					$uibModalInstance.close(verifyOTPResponse.data.Status);
				}
			},function() {
		    	
		    });
		}*/
		
		function verifyOTP (postdata) {
			UserRegistrationService.verifyOTP(postdata).then( function(resp) {
				if(resp.status && resp.data.Status) {
					$uibModalInstance.close();
					//openVerifyOtpSuccessModal(resp);
				} else {
					vomc.showErrorMessage = true;
					vomc.errorMessage = resp.data.Message;
				}
			});
		}
		
		function ok () {
			if(!disableVerify()){
				removeErrorMsgs();
				if(isValidOTP()) {
					var postdata = preparePostdata();
					verifyOTP (postdata);
				} else {
					setErrorMsg("otp","invalid");
				}
			} else {
				setErrorMsg("all");
			}
						
		}
	  
		function cancel () {
			$uibModalInstance.dismiss('cancel');
	    }
		
		function init() {
			if(!_.isEmpty(provisionalUser.message)) {
				vomc.responseMessage = provisionalUser.message;
				vomc.showResponseMessage = true;
			}
			/*commonService.getNavMenuItems({"type":"WebAnnotations"}).then(function(resp){
				if(resp.status == 200 && resp.data.Status) {
					var listAppKeyValues  = resp.data.listAppKeyValues;
					chromeStoreBaseUrlObj = _.findWhere(listAppKeyValues,{"key": "ChromeStoreBaseUrl"});
					extensionNameObj = _.findWhere(listAppKeyValues,{"key": "ExtensionName"});
					extensionIdObj = _.findWhere(listAppKeyValues,{"key": "ExtensionId"});
				}
			});*/
		}
		init();
	}
})();