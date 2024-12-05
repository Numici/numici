
;(function(){
	'use strict';
	
	angular.module("vdvcApp").controller('GoogleConfigController',GoogleConfigController);
	
	GoogleConfigController.$inject = ['$scope','$rootScope','appData','$uibModalInstance','_',"$timeout",'GoogleService',
	                                    'googleConfig','oneDriveConfig','userinfo','$deviceInfo','$confirm','APIUserMessages'];
	
	function GoogleConfigController($scope,$rootScope,appData,$uibModalInstance,_,$timeout,GoogleService,
			googleConfig,oneDriveConfig,userinfo,$deviceInfo,$confirm,APIUserMessages) {
			
			var gcc = this;
			
			gcc.config = angular.copy(googleConfig);
			gcc.oneDriveConfig = angular.copy(oneDriveConfig);
			gcc.userinfo = angular.copy(userinfo);
			gcc.cancel = cancel;
			gcc.revoke = revoke;
			gcc.authorize = authorize;
			gcc.authorizeApp = authorizeApp;
			
			gcc.isAuthPresent = false;
			gcc.isSigninWithGoogle = false;
			gcc.isGoogleMailAuthorize = false;
			gcc.isOneDriveOutlookAuthorize = false;
			
			if(null != googleConfig){
				gcc.isAuthPresent = true;
				if(googleConfig.signInWithGoogle){
					gcc.isSigninWithGoogle = googleConfig.signInWithGoogle;	
				}
				if(googleConfig.authedToSendMail){
					gcc.isGoogleMailAuthorize = googleConfig.authedToSendMail;	
				}
			}
			
			if(null != oneDriveConfig){
				if(oneDriveConfig.data && oneDriveConfig.data.OneDriveConfig && oneDriveConfig.data.OneDriveConfig.authedToSendMail){
					gcc.isOneDriveOutlookAuthorize = oneDriveConfig.data.OneDriveConfig.authedToSendMail;
				}
			}
			
			function cancel() {
				$uibModalInstance.dismiss('cancel');
			}
						
			function revoke(msApp) {
				var txt = "Are you sure you want to revoke Gmail Authorization?";
				if(msApp == "ALL"){
					//do nothing
				} else {
					var appDisplayName;
					if(msApp == "SendMail"){
						appDisplayName = "Gmail"
					} else {
						appDisplayName = msApp;
					}
					txt = "Are you sure you want to revoke '"+appDisplayName+"' Authorization?";
				}
				$confirm({text: txt})
		        .then(function() {
		        	var postdata = {};
		        	if(msApp == "ALL"){
		        		//do nothing
		        	} else {
			        	var includeApps = [];
						includeApps.push(msApp);
			        	postdata.apps = includeApps;
		        	}
		        	GoogleService.revoke(postdata).then(function(resp) {
						if(resp.status == 200 && resp.data.Status) {
							if((msApp == "ALL" && gcc.isGoogleMailAuthorize) || msApp == "SendMail"){
								appData.setAppData("sendAsUserEmailId","");
							}
							$uibModalInstance.close(resp.data.Status);
						}
					});
		        });
			}
						
			function authorizeApp(msApp) {
				var includeApps = [];
				includeApps.push(msApp);
				GoogleService.autherize(includeApps);
			}
			
			function authorize() {
				var includeApps = [];
				if(gcc.authorizeOutlook == true){
					includeApps.push("SendMail");
				}
				GoogleService.autherize(includeApps);
			}
			
	}
})();

