
;(function(){
	'use strict';
	
	angular.module("vdvcApp").controller('OneDriveConfigController',OneDriveConfigController);
	
	OneDriveConfigController.$inject = ['$scope','$rootScope','$uibModalInstance','_',"$timeout",'OneDriveService',
	                                    'googleConfig','oneDriveConfig','$deviceInfo','$confirm','APIUserMessages',
	                                    'VDVCConfirmWithRadioButtonsService','commonService','VDVCConfirmService',
	                                    'appData'];
	
	function OneDriveConfigController($scope,$rootScope,$uibModalInstance,_,$timeout,OneDriveService,
			googleConfig,oneDriveConfig,$deviceInfo,$confirm,APIUserMessages,VDVCConfirmWithRadioButtonsService,
			commonService,VDVCConfirmService,appData) {
			
			var odcc = this;
			
			odcc.config = angular.copy(oneDriveConfig);
			odcc.cancel = cancel;
			odcc.revoke = revoke;
			odcc.authorize = authorize;
			odcc.authorizeApp = authorizeApp;
			
			odcc.authorizeOneDrive = true;
			odcc.authorizeTeams = true;
			odcc.authorizeOneNote = true;
			odcc.authorizeOutlook = true;
			odcc.isOneDriveAuthorize = false;
			odcc.isTeamsAuthorize = false;
			odcc.isOneNoteAuthorize = false;
			odcc.isOutlookAuthorize = false;
			odcc.isAuthPresent = false;
			odcc.isGoogleMailAuthorize = false;
			
			if(null != googleConfig){
				if(googleConfig.data && googleConfig.data.GoogleConfig && googleConfig.data.GoogleConfig.authedToSendMail){
					odcc.isGoogleMailAuthorize = googleConfig.data.GoogleConfig.authedToSendMail;
					if(odcc.isGoogleMailAuthorize){
						if(null != oneDriveConfig){
							//do nothing
						} else {
							odcc.authorizeOutlook = false;	
						}
					}
				}
			}
			
			if(null != oneDriveConfig){
				odcc.isAuthPresent = true;
				if(oneDriveConfig.authedToOneDrive){
					odcc.authorizeOneDrive = oneDriveConfig.authedToOneDrive;
					odcc.isOneDriveAuthorize = oneDriveConfig.authedToOneDrive;
				} else {
					odcc.authorizeOneDrive = false;
				}
				if(oneDriveConfig.authedToTeams){
					odcc.authorizeTeams = oneDriveConfig.authedToTeams;
					odcc.isTeamsAuthorize = oneDriveConfig.authedToTeams;
				} else {
					odcc.authorizeTeams = false;
				}
				if(oneDriveConfig.authedToOneNote){
					odcc.authorizeOneNote = oneDriveConfig.authedToOneNote;
					odcc.isOneNoteAuthorize = oneDriveConfig.authedToOneNote;
				} else {
					odcc.authorizeOneNote = false;
				}
				if(oneDriveConfig.authedToSendMail){
					odcc.authorizeOutlook = oneDriveConfig.authedToSendMail;
					odcc.isOutlookAuthorize = oneDriveConfig.authedToSendMail;
				} else {
					odcc.authorizeOutlook = false;
				}
			}
			
			function cancel() {
				$uibModalInstance.dismiss('cancel');
			}
			
			function requestRevokeAuthPerms(cb) {
				var txt = 'Your OneDrive being synchronized. Would you like to cancel synchronization and revoke authorization?';
				$confirm({text: txt})
		        .then(function() {
		        	OneDriveService.revoke({"scheduleRevoke":true}).then(function(resp) {
						if(resp.status == 200 && resp.data.Status) {
							APIUserMessages.success(resp.data.Message);
			    		}
					});
		        });
			}
			
/*			function revoke() {
				var txt = 'Are you sure you want to revoke OneDrive Config ?';
				$confirm({text: txt})
		        .then(function() {
		        	var revoke = OneDriveService.revoke({});
					revoke.then(function(resp) {
						if(resp.status == 200 && resp.data.Status) {
							if(resp.data.InSync) {
								requestRevokeAuthPerms();
							} else {
								$uibModalInstance.close(resp.data.Status);
							}
						}
					});
		        });
			}*/
						
			function revoke(msApp) {
				var externalApp = angular.copy(msApp);
				var actionButtonText = "REVOKE";
				var closeButtonText = "CANCEL";
				if(msApp == "SendMail"){
					externalApp = "Outlook"
				} else if(msApp == "ALL"){
					externalApp = "Microsoft Office 365";
					actionButtonText = "REVOKE ALL";
				}
				var confirmTitle = "Revoke "+externalApp+" authorization";
				var confirmText = "<p style='text-align: justify;'>Are you sure you want to revoke "+externalApp+" Authorization?</p>";
				var confirmRadioBtns = [];
				
				var VDVCConfirmModalInstance;
				if((msApp == "ALL" || msApp == "OneDrive") && odcc.isOneDriveAuthorize) {
					confirmText = "<p style='text-align: justify;margin-bottom: 15px;'>Revoking authorization will remove files added\
						from OneDrive to any Taskspace from that Taskspace.\
						All highlights, comments and replies in those files will also be\
						permanently deleted. This operation cannot be reversed.\
						</p>\
						<p style='text-align: justify;'>Would you like to create a copy of such files along with all\
						existing annotations in your Numici account? If you answer yes,\
						the file copy with annotations will replace the file\
						from OneDrive in the Taskspace.\
						</p>";
					confirmRadioBtns = [{
							"label" : "No - remove files from Taskspace",
							"value" : "RemoveFilesFromTS"
						},
						{
							"label" : "Yes - create local copies",
							"value" : "CreateLocalCopies"
						}
					];
					var VDVCConfirmWithRadioButtonsData = commonService.getVDVCConfirmWithRadioButtonsData(confirmTitle,confirmText,confirmRadioBtns,actionButtonText,closeButtonText);
					VDVCConfirmModalInstance = VDVCConfirmWithRadioButtonsService.open(VDVCConfirmWithRadioButtonsData);
				} else {
					var VDVCConfirmData = commonService.getVDVCConfirmWithRadioButtonsData(confirmTitle,confirmText,confirmRadioBtns,actionButtonText,closeButtonText);
					VDVCConfirmModalInstance = VDVCConfirmService.open(VDVCConfirmData);
				}
				
				VDVCConfirmModalInstance.result.then(function(confirmResponse) {
					var postdata = {};
		        	if(msApp == "ALL"){
		        		//do nothing
		        	} else {
			        	var includeApps = [];
						includeApps.push(msApp);
			        	postdata.apps = includeApps;
			        }
		        	if((msApp == "ALL" || msApp == "OneDrive") && odcc.isOneDriveAuthorize) {
		        		postdata.actionOnTSDocs = confirmResponse.selectedOption;
		        	}
		        	var isAuthedToSendMail = angular.copy(oneDriveConfig.authedToSendMail);
		        	OneDriveService.revoke(postdata).then(function(resp) {
						if(resp.status == 200 && resp.data.Status) {
							if(resp.data.InSync) {
								requestRevokeAuthPerms();
							} else {
								if((msApp == "ALL" && isAuthedToSendMail) || msApp == "SendMail"){
									appData.setAppData("sendAsUserEmailId","");
								}
								$uibModalInstance.close(resp.data.Status);
							}
						}
					});
		        });
			}
						
			function authorizeApp(msApp) {
				var includeApps = [];
				includeApps.push(msApp);
				OneDriveService.autherize(includeApps);
			}
			
			function authorize() {
				var includeApps = [];
				if(odcc.authorizeOneDrive == true){
					includeApps.push("OneDrive");
				}
				if(odcc.authorizeTeams == true){
					includeApps.push("Teams");
				}
				if(odcc.authorizeOneNote == true){
					includeApps.push("OneNote");
				}
				if(odcc.authorizeOutlook == true){
					includeApps.push("SendMail");
				}
				
				OneDriveService.autherize(includeApps);
			}
			
	}
})();

