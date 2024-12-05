;(function() {
	'use strict'; 
	
	angular.module('vdvcApp').controller('ConfirmSignedInController',ConfirmSignedInController);
	
	ConfirmSignedInController.$inject = ['$scope','$uibModalInstance','_','signedInUserInfo'];
	
	function ConfirmSignedInController($scope,$uibModalInstance,_,signedInUserInfo) {
		
		var csc = this;
		
		//variables
		csc.confirmSignedInMessage = "<p class='confirm-signed-in-content'>There is an active session available for user '"+signedInUserInfo.UserId+"'.<br><br>\
Please click on 'Logout & Continue' button to continue registration process <div>OR</div> Click on 'Skip & Goto Active Session' button to stop the registration process and access active user session</p>";
		
		//methods
		csc.selectResponse = selectResponse;
				
		function selectResponse(userResponse) {
			$uibModalInstance.close(userResponse);
		}
	}
})();