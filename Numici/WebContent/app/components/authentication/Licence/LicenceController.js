;(function() {
	'use strict'; 
	
	angular.module('vdvcApp').controller('LicenceController',LicenceController);
	
	LicenceController.$inject = ['$scope','$rootScope','$uibModalInstance','_','userService','MessageService','$uibModal',
		'appData','$confirm','AuthService','$state','$timeout'];
	
	function LicenceController($scope,$rootScope,$uibModalInstance,_,userService,MessageService,$uibModal,
			appData,$confirm,AuthService,$state,$timeout) {
		
		var la = this;
		var appdata = appData.getAppData();
		//variables
		la.isPdfIsRendered = false;
		$scope.pdfViewerAPI = {};
		
		la.onPDFProgress = onPDFProgress;
		la.ok = ok;
		la.cancel = cancel;
		
		function onPDFProgress(operation, state, value, total, message) {
			if(operation === "render" && value === 1) {
				if(state === "success") {
					if(!la.isPdfIsRendered) {
						var tim = $timeout(function() {
							la.isPdfIsRendered = true;
							$scope.pdfViewerAPI.viewer.getPageView(0);
							$timeout.cancel(tim);
						}, 100);	
					}
				}
			}
		}
		
		function ok () {
			var postdata = {
					"termsAccepted" : true
			};
			
			userService.acceptTerms(postdata).then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					appdata["termsAccepted"] = true;
					$uibModalInstance.close(true);
				}
			});
						
		}
	  
		function cancel () {
			var text ='You will not be allowed to access "Numici", unless you accept the Agreement.\
					   Are you sure you want to Decline?';	
			$confirm({text: text})
	        .then(function() {
	        	 $rootScope.previousState = null;
	          	 $rootScope.previousStateParams = null;
	          	 $rootScope.$broadcast("LogOut",true);
		    });
	    }
		
	}
})();