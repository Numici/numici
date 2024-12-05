;(function() {
	
	angular.module("vdvcApp").factory("RegisterProUserService",RegisterProUserService);
	
	RegisterProUserService.$inject = ['httpService'];
	
	function RegisterProUserService(httpService) {
		var user = {
				checkProuser : checkProuser,
				registerProvisionalUser: registerProvisionalUser,
				sendOTP : sendOTP
		};
		
		return user;
		
		function checkProuser(postdata) {
	        return httpService.httpPost('user/checkprouser',postdata);
	    }
		
		function registerProvisionalUser(postdata) {
	        return httpService.httpPost('user/regprouser',postdata);
	    }
	    
	    function sendOTP(postdata) {
	        return httpService.httpPost('user/sendotp',postdata);
	    }
	}

})();