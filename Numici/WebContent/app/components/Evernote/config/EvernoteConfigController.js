
;(function(){
	'use strict';
	
	angular.module("vdvcApp").controller('EvernoteConfigController',EvernoteConfigController);
	
	EvernoteConfigController.$inject = ['$uibModalInstance','_','EvernoteService',
	                                    'evernoteConfig','evernoteConfigStatus','userinfo','$confirm'];
	
	function EvernoteConfigController($uibModalInstance,_,EvernoteService,
			evernoteConfig,evernoteConfigStatus,userinfo,$confirm) {
			var ecc = this;
			
			ecc.config = angular.copy(evernoteConfig);
			ecc.cancel = cancel;
			ecc.revoke = revoke;
			ecc.authorize = authorize;
			ecc.reAuthorize = reAuthorize;
			
			ecc.serviceCallInProgress = false;
			ecc.isAuthPresent = false;
			ecc.isAuthInvalid = false;
			ecc.authIssueTxt = "";
			ecc.evernoteUserEmail = "...";
			ecc.evernoteUserName = "...";
			ecc.numiciUserName = "";
			
			if(null != evernoteConfig){
				ecc.isAuthPresent = true;
				if(null != ecc.config.email){
					ecc.evernoteUserEmail = ecc.config.email;
				}
				
				if(null != ecc.config.businessName){
					ecc.evernoteUserName = ecc.config.businessName;
				} else if(null != ecc.config.name){
					ecc.evernoteUserName = ecc.config.name;
				}
				
				if(userinfo){
					ecc.numiciUserName = userinfo["FirstName"]+" "+userinfo["LastName"];
				}
			}
			
			if(null != evernoteConfigStatus){
				if(evernoteConfigStatus == "Invalid" ){
					ecc.isAuthInvalid = true;
					ecc.authIssueTxt = "Authentication token is not valid. You need to Re-Authorize to access your Evernote account";
				} else if(evernoteConfigStatus == "Expired" ){
					ecc.isAuthInvalid = true;
					ecc.authIssueTxt = "User authentication time expired. You need to Re-Authorize to access your Evernote account";
				}
			}
			
			function cancel() {
				$uibModalInstance.dismiss('cancel');
			}
			
			function revokeAuth(postdata,cb) {
				EvernoteService.revoke(postdata).then(function(resp) {
					if(resp.status == 200 && resp.data.Status) {
						if(typeof cb == "function") {
							cb(resp.data);
						}
					}
				});
			}
			
			function revoke() {
				var txt = "Are you sure you want to revoke Evernote Authorization?";
				$confirm({text: txt})
		        .then(function() {
		        	ecc.serviceCallInProgress = true;
		        	var postdata = {};
		        	revokeAuth(postdata,function(respData) {
		        		ecc.serviceCallInProgress = false;
		        		$uibModalInstance.close(respData.Status);
		        	});
		        });
			}
			
			function authorize() {
				ecc.serviceCallInProgress = true;
				EvernoteService.authorize();
			}
			
			function reAuthorize() {
				authorize();
			}
	}
})();