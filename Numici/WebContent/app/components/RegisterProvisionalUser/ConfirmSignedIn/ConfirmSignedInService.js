;(function() {
	
	angular.module("vdvcApp").factory("ConfirmSignedInService",ConfirmSignedInService);
	
	ConfirmSignedInService.$inject = ['httpService','$uibModal'];
	
	function ConfirmSignedInService(httpService,$uibModal) {
		var ConfirmSignedIn = {
				openConfirmSignedInModal : openConfirmSignedInModal,
		};
		
		return ConfirmSignedIn;
		
	    function openConfirmSignedInModal (signedInUserInfo) {
	    	var modalInstance = $uibModal.open({
				animation: true,  
				templateUrl: 'app/components/RegisterProvisionalUser/ConfirmSignedIn/ConfirmSignedInModal.html',
			    controller: 'ConfirmSignedInController',
			    controllerAs : 'csc',
			    backdrop: "static",
			    windowClass : "confirm-signedin-modal",
			    size: "md",
			    resolve : {
			    	signedInUserInfo : signedInUserInfo,
			    }
			});
			return modalInstance;
		}
	}

})();