;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('DeleteMeController',DeleteMeController);
	
	DeleteMeController.$inject = ['httpService','appData','userService','VDVCConfirmService'];
	
	function DeleteMeController(httpService,appData,userService,VDVCConfirmService) {
		var dmc = this;
		var appdata = appData.getAppData();
		
		//Methods
		dmc.deleteMe = deleteMe;
		dmc.isSharedOrganization = appdata.IsSharedOrganization;
		dmc.userRole = appdata.UserRole;
		dmc.showMessage = "Please contact Numici Support at support@numici.com.";
		dmc.showDeleteButton = false;
		
		if(dmc.isSharedOrganization & dmc.userRole == 'User') {
			dmc.showMessage = "Click on 'Delete My Account' button to delete your account along with all your data. <br><br>Once you delete your account, all the data (Taskspaces, Documents, ...) <br> will be permanently deleted, you will not be able to retrieve them.";
			dmc.showDeleteButton = true;
		} else if(dmc.isSharedOrganization & (dmc.userRole == 'OrgAdmin')) {
			dmc.showMessage = "You cannot delete your Account as you are the administrator for your organization. <br><br>Please contact Numici Support at support@numici.com.";
		} else if(!dmc.isSharedOrganization & dmc.userRole == 'User') {
			dmc.showMessage = "You cannot delete your Account as it is a Business Account. <br><br>Please contact your Organization Admin.";
			userService.getOrgAdmin().then(function(orgAdmin) {
				 if(orgAdmin.status == 200 && orgAdmin.data.Status) {
					 if(orgAdmin.data.orgAdminUserName) {
						 var orgAdminUserName = orgAdmin.data.orgAdminUserName;
						 var orgAdminUserId = orgAdmin.data.orgAdminUserId;
						 dmc.showMessage = "You cannot delete your Account as it is a Business Account. <br><br>Please contact your Organization Admin "+orgAdminUserName+" at "+orgAdminUserId+".";
					 }
				 }
			 });
		} else if(!dmc.isSharedOrganization & (dmc.userRole == 'VDVCSiteAdmin' || dmc.userRole == 'VDVCAdmin')) {
			dmc.showMessage = "You cannot delete your Account as you are a site administrator for Numici.";
		} else if(!dmc.isSharedOrganization & (dmc.userRole == 'OrgAdmin')) {
			dmc.showMessage = "You cannot delete your Account as you are an administrator for your organization. <br><br>Please contact Numici Support at support@numici.com.";
		}
		
		function deleteMe() {
			var confirmTxt = 'Are you sure you want to delete your Account? <br><br> Once you delete your account, all the data (Taskspaces, Documents, ...) will be permanently deleted, you will not be able to retrieve them.';
	        
	        var VDVCConfirmModalInstance = VDVCConfirmService.open({text : confirmTxt, title : "CONFIRM"});
    		VDVCConfirmModalInstance.result.then(function() {
    			return httpService.httpGet("user/deleteMe");
    		});
		}
		
	}
	
})();