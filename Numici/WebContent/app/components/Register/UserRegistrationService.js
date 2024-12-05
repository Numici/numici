;(function() {
	
	angular.module("vdvcApp").factory("UserRegistrationService",UserRegistrationService);
	
	UserRegistrationService.$inject = ['httpService','$uibModal'];
	
	function UserRegistrationService(httpService,$uibModal) {
		var user = {
				createUser: createUser,
				isUserExistWithEmail : isUserExistWithEmail,
				openVerifyOTPModal : openVerifyOTPModal,
				verifyOTP : verifyOTP,
				verifyUser : verifyUser,
				openVerifyOTPSuccessModal : openVerifyOTPSuccessModal,
		};
		
		return user;
		
	    function createUser(postdata) {
	        return httpService.httpPost('user/create',postdata);
	    }
	    
	    function isUserExistWithEmail(postdata) {
	        return httpService.httpPost('user/checkUserExists',postdata);
	    }
	    
	    function openVerifyOTPModal (provisionalUser,size) {
			var modalInstance = $uibModal.open({
			      animation: true,
			      templateUrl: 'app/components/Register/VerifyOTP/VerifyOTPModal/VerifyOTPModal.html',
			      controller: 'VerifyOTPModalController',
			      controllerAs: 'vomc',
			      windowClass : "complete-verification-modal",
			      backdrop: 'static',
			      size: size,
			      resolve : {
			    	  provisionalUser : function() {
			    		  return provisionalUser;
			    	  }
			      }
			});
			return modalInstance;
		}
	    
	    function verifyOTP(postdata) {
	        return httpService.httpPost('user/verifyOtp',postdata);
	    }
	    
	    function verifyUser(postdata) {
	        return httpService.httpPost('user/link/verify',postdata);
	    }
	    
	    function openVerifyOTPSuccessModal (verifyOTPResponse,beforeGoToHomePage,getExtensionMessage) {
	    	var modalInstance = $uibModal.open({
				animation: true,  
				templateUrl: 'app/components/Register/VerifyOTP/VerifyOTPModal/VerifyOTPSuccess/VerifyOTPSuccessModal.html',
			    controller: 'VerifyOTPSuccessController',
			    controllerAs : 'vosc',
			    backdrop: "static",
			    windowClass : "verification-otp-success-modal",
			    size: "md",
			    resolve : {
			    	verifyOTPResponse : verifyOTPResponse,
			    	beforeGoToHomePage : beforeGoToHomePage,
			    	getExtensionMessage : function(){
			    		return{"message" : getExtensionMessage}
			    	},
			    }
			});
			return modalInstance;
		}
	}

})();