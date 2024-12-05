;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('MigrateUserCreationController',MigrateUserCreationController);
	
	MigrateUserCreationController.$inject = ['$scope','appData','_','AdministrationService','$uibModalInstance','MessageService'];

	function MigrateUserCreationController($scope,appData,_,AdministrationService,$uibModalInstance,MessageService) {
		var mucc = this;
		var appdata = appData.getAppData();
		
		mucc.migrateFromOrgList = [];
		mucc.migrateUsersList = [];
		mucc.migrateToOrgList = [];
		mucc.migrateFromOrg = {};
		mucc.migrateUser = {};
		mucc.migrateToOrg = {};
		
		mucc.disableMigrateUser = disableMigrateUser;
		mucc.disableMigrateToOrg = disableMigrateToOrg;
		mucc.getSelectedUserName = getSelectedUserName;
		mucc.validateMigrateUserFields = validateMigrateUserFields;
		mucc.getMigrateOrgUsersList = getMigrateOrgUsersList;
		mucc.ok = ok;
		mucc.cancel = cancel;
		
		function disableMigrateUser() {
			var status = true;
			if(!_.isEmpty(mucc.migrateFromOrg)) {
				status = false;
			}
			return status;
		}
		
		function disableMigrateToOrg() {
			var status = true;
			if(!_.isEmpty(mucc.migrateFromOrg) && !_.isEmpty(mucc.migrateUser)) {
				status = false;
			}
			return status;
		}
		
		function getSelectedUserName(user) {
			if(user) {
				 var userName = "";	
				 if(!_.isEmpty(user.firstName) && !_.isEmpty(user.lastName)) {
					 userName = user.firstName+" "+user.lastName;
				 } else if(_.isEmpty(user.firstName) && _.isEmpty(user.firstName)) {
					 userName = user.loginId;
				 } else if(!_.isEmpty(user.firstName)) {
					 userName = user.firstName;
				 } else if(!_.isEmpty(user.lastName)) {
					 userName = user.lastName;
				 }
			}
			return userName;
		}
		
		function validateMigrateUserFields() {
			var status = true;
			if(!_.isEmpty(mucc.migrateFromOrg) && !_.isEmpty(mucc.migrateUser) && !_.isEmpty(mucc.migrateToOrg)) {
				status = false;
			}
			return status;
		}
		
		function prepareMigrateUsrPostdata() {
			var postdata = {};
			postdata["fromOrgId"] = mucc.migrateFromOrg.id;
			postdata["fromOrgName"] = mucc.migrateFromOrg.name;
			postdata["userId"] = mucc.migrateUser.loginId;
			postdata["toOrgId"] = mucc.migrateToOrg.id;
			postdata["toOrgName"] = mucc.migrateToOrg.name;
			return postdata;
		}
		
		function ok() {
			var postdata = prepareMigrateUsrPostdata();
			AdministrationService.migrateUser(postdata).then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					$uibModalInstance.close(resp.data);
				} else {
					MessageService.showErrorMessage("ADMINISTRATION_ERR",[resp.data.Message]);
				}
			});
		}
		
		function cancel() {
			$uibModalInstance.dismiss('cancel');
		}
		
		function getMigrateOrgUsersList() {
			mucc.migrateUser = {};
			var postdata = {};
			postdata["orgId"] = mucc.migrateFromOrg.id;
			postdata["roleType"] = "User";
			AdministrationService.getOrgUsersList(postdata).then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					mucc.migrateUsersList = resp.data.Users;
					if(!_.isEmpty(mucc.migrateUsersList)) {
						mucc.migrateUser = mucc.migrateUsersList[0];
					}
				}
			});
		}
		
		function getOrganizationsList() {
			AdministrationService.getOrganizationsList().then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					var organizationsList = resp.data.Organization;
					mucc.migrateFromOrgList = _.where(organizationsList,{"sharedOrg" : true});
					if(!_.isEmpty(mucc.migrateFromOrgList)) {
						mucc.migrateFromOrg = mucc.migrateFromOrgList[0];
						getMigrateOrgUsersList();
					}
					mucc.migrateToOrgList = _.where(organizationsList,{"sharedOrg" : false});
				}
			});
		}
		
		function init() {
			getOrganizationsList();
		}
		init();
	}	
	
})();