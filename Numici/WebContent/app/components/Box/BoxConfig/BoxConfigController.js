;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('BoxConfigController',BoxConfigController);
	
	BoxConfigController.$inject = ['$scope','$uibModal','$uibModalInstance','appData','_','APIUserMessages',
	                               'BoxService','boxConfig','pendingRequests','$confirm','commonService',
	                               'VDVCConfirmWithRadioButtonsService'];

	function BoxConfigController($scope,$uibModal,$uibModalInstance,appData,_,APIUserMessages,BoxService,
			boxConfig,pendingRequests,$confirm,commonService,VDVCConfirmWithRadioButtonsService) {
		var self = this;
		var postCommentsPromise;
		
		self.boxConfig = boxConfig;
		self.postComments = boxConfig.postComments;
		self.postCommentOnChange = postCommentOnChange;
		self.revokeAuthPerms = revokeAuthPerms;
		self.cancel = cancel;
		
		
		function postCommentOnChange() {
			var flag = self.postComments ? "on" : "off";
			
			pendingRequests.cancel(postCommentsPromise);
			
			postCommentsPromise = BoxService.setPostComments(flag);
			postCommentsPromise.then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					APIUserMessages.success("Box Config save Success");
	    		}
			});
		}
		
		function requestRevokeAuthPerms(cb) {
			var txt = 'Your Box being synchronized. Would you like to cancel synchronization and revoke authorization?';
			$confirm({text: txt})
	        .then(function() {
	        	BoxService.revokeAuthPerms({"scheduleRevoke":true}).then(function(resp) {
					if(resp.status == 200 && resp.data.Status) {
						APIUserMessages.success(resp.data.Message);
		    		}
				});
	        });
		}
		
		function revokeAuthPerms() {
			var actionButtonText = "REVOKE";
			var closeButtonText = "CANCEL";
			var confirmTitle = "Revoke Box authorization";
			var confirmText = "<p style='text-align: justify;margin-bottom: 15px;'>Revoking authorization will remove files added\
				from Box to any Taskspace from that Taskspace.\
				All highlights, comments and replies in those files will also be\
				permanently deleted. This operation cannot be reversed.\
				</p>\
				<p style='text-align: justify;'>Would you like to create a copy of such files along with all\
				existing annotations in your Numici account? If you answer yes,\
				the file copy with annotations will replace the file\
				from Box in the Taskspace.\
				</p>";
			var confirmRadioBtns = [{
					"label" : "No - remove files from Taskspace",
					"value" : "RemoveFilesFromTS"
				},
				{
					"label" : "Yes - create local copies",
					"value" : "CreateLocalCopies"
				}
			];
			var VDVCConfirmModalInstance;
			var VDVCConfirmWithRadioButtonsData = commonService.getVDVCConfirmWithRadioButtonsData(confirmTitle,confirmText,confirmRadioBtns,actionButtonText,closeButtonText);
			VDVCConfirmModalInstance = VDVCConfirmWithRadioButtonsService.open(VDVCConfirmWithRadioButtonsData);
			if(VDVCConfirmModalInstance) {
				VDVCConfirmModalInstance.result.then(function(confirmResponse) {
					BoxService.revokeAuthPerms({"actionOnTSDocs" : confirmResponse.selectedOption}).then(function(resp) {
						if(resp.status == 200 && resp.data.Status) {
							if(resp.data.InSync) {
								requestRevokeAuthPerms();
							} else {
								$uibModalInstance.close(resp.data.Status);
							}
			    		}
					});
		        });
			}
		}
		
		function cancel() {
			$uibModalInstance.dismiss('cancel');
		}
	}	
	
})();