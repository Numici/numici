;(function() {
	'use strict'; 
	
	angular.module('vdvcApp').controller('ShareToGuestUsersController',ShareToGuestUsersController);
	
	ShareToGuestUsersController.$inject = ['$scope', '$uibModalInstance','action','NonNumiciUsers','docSharedUserList','folderSharedUserList','taskspaceSharedUserList','otherOrgUsers','_','appData'];
			
    function ShareToGuestUsersController($scope, $uibModalInstance,action,NonNumiciUsers,docSharedUserList,folderSharedUserList,taskspaceSharedUserList,otherOrgUsers,_,appData) {
			
    	var snc = this;
		var appdata = appData.getAppData();
		
		snc.action = angular.copy(action.action);
		snc.NonNumiciUsers = angular.copy(NonNumiciUsers);
		snc.docSharedUserList = angular.copy(docSharedUserList);
		snc.folderSharedUserList = angular.copy(folderSharedUserList);
		snc.taskspaceSharedUserList = angular.copy(taskspaceSharedUserList);
		snc.sharedUserList = [];
		if(_.isEqual(docSharedUserList, folderSharedUserList)) {
			snc.sharedUserList = angular.copy(docSharedUserList);
		}
		snc.otherOrgUsers = otherOrgUsers;
		
		snc.selectedUsers = [];
		
		snc.targetOrg = {"type" : "sharedorg"};
		
		snc.getDocSharedUsers = getDocSharedUsers;
		snc.getFolderSharedUsers = getFolderSharedUsers;
		snc.getTaskspaceSharedUsers = getTaskspaceSharedUsers;
		snc.getOtherOrgUsers = getOtherOrgUsers;
		snc.disableShare = disableShare;
		snc.isSharedOrgUser = isSharedOrgUser;
		snc.ok = ok;
		snc.cancel = cancel;
			
		function getDocSharedUsers() {
			var result = "";
			if(!_.isEmpty(snc.docSharedUserList)) {
				_.each(snc.docSharedUserList, function(sharedUser,index){
					if(index == 0) {
						result = sharedUser;
					} else {
						result = result+"', '"+sharedUser;
					}
				});
			}
			return result;
		}
		
		function getFolderSharedUsers() {
			var result = "";
			if(!_.isEmpty(snc.folderSharedUserList)) {
				_.each(snc.folderSharedUserList, function(sharedUser,index){
					if(index == 0) {
						result = sharedUser;
					} else {
						result = result+"', '"+sharedUser;
					}
				});
			}
			return result;
		}
		
		function getTaskspaceSharedUsers() {
			var result = "";
			if(!_.isEmpty(snc.taskspaceSharedUserList)) {
				_.each(snc.taskspaceSharedUserList, function(sharedUser,index){
					if(index == 0) {
						result = sharedUser;
					} else {
						result = result+"', '"+sharedUser;
					}
				});
			}
			return result;
		}
		
		function getOtherOrgUsers() {
			var result = "";
			if(!_.isEmpty(snc.otherOrgUsers)) {
				_.each(snc.otherOrgUsers, function(sharedUser,index){
					if(index == 0) {
						result = sharedUser;
					} else {
						result = result+"', '"+sharedUser;
					}
				});
			}
			return result;
		}
				
		function disableShare() {
			var status = true;
			snc.selectedUsers = _.where(snc.NonNumiciUsers,{"selected":true});
			if(!_.isEmpty(snc.selectedUsers)) {
				status = false;
			}
			return status;
		}
		
		function isSharedOrgUser() {
			return appdata.IsSharedOrganization;
		}
		
		function ok () {
			if(snc.action == "GuestUserSahre" && !disableShare()) {
				$uibModalInstance.close({"users": snc.selectedUsers,"targetOrg":snc.targetOrg.type});
			} else {
				$uibModalInstance.close();
			}
		}
		
		function cancel () {
			$uibModalInstance.dismiss('cancel');
		}
			
	}
	
})();