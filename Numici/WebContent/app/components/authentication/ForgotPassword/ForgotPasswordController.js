;(function() {
	'use strict'; 
	
	angular.module('vdvcApp').controller('ForgotPasswordController',ForgotPasswordController);
	
	ForgotPasswordController.$inject = ['$scope','$uibModalInstance','_','userService','$confirm'];
	
	function ForgotPasswordController($scope,$uibModalInstance,_,userService,$confirm) {
		
		var fp = this;
		
		fp.userId = null;
		fp.showUserIdErrorMessage = false;
		fp.userIdErrorMessage = "";
		
		fp.enableSubmitBtn = enableSubmitBtn;
		fp.ok = ok;
		fp.cancel = cancel;
				
		function enableSubmitBtn() {
			var status = true;
			if(!_.isEmpty(fp.userId)) {
				status = false;
			} else {
				status = true;
			}
			return status;
		}
				
		function ok () {
			var postdata = {};
			postdata['loginid'] = fp.userId;
			userService.forgotPassword(postdata).then( function(resp) {
				if(resp.status && resp.data.Status) {
					$confirm({text: resp.data.Message},
							{ templateUrl: 'app/components/common/CustomeTemplates/confirmTemplate.html'})
			        .then(function() {
			        	$uibModalInstance.close(resp.data.Status);
				    },function() {
				    	$uibModalInstance.close(resp.data.Status);
				    });
				} else {
					fp.showUserIdErrorMessage = true;
					fp.userIdErrorMessage = resp.data.Message;
				}
			});
		}
	  
		function cancel () {
			$uibModalInstance.dismiss('cancel');
	    }
	}
})();