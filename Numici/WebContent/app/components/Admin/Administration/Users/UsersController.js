;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('UsersController',UsersController);
	
	UsersController.$inject = ['$state','$scope','appData','_','$confirm','AdministrationService','MessageService',
	                           '$uibModal','$timeout'];

	function UsersController($state,$scope,appData,_,$confirm,AdministrationService,MessageService,$uibModal,
			$timeout) {
		var uc = this;
		var appdata = appData.getAppData();
		var userFields = AdministrationService.newUserFields;
		var guestUserRequest = AdministrationService.guestUserRequest;
		// Instance variables
		
		uc.isInViewMode = false;
		uc.showUserDetails = false;
		uc.currentUser = appdata.UserId;
		uc.searchString = "";
		uc.userHeaders = angular.copy(AdministrationService.userHeaders);
		uc.getOrgUsersRole = angular.copy(AdministrationService.getOrgUsersRole);
		uc.usersList = [];
		uc.userFieldsModel = angular.copy(userFields);
		uc.userFieldsOffset = 7;
		uc.totalUsersCount = 0;
		uc.totalActiveUsersCount = 0;
		//Methods
		uc.searchStringFilter = searchStringFilter;
		uc.createUser = createUser;
		uc.viewUser = viewUser;
		uc.disableEditGuestUser = disableEditGuestUser;
		uc.viewUserInPopup = viewUserInPopup;
		uc.editUser = editUser;
		uc.deleteUser = deleteUser;
		uc.convertGuestToProuser = convertGuestToProuser;
		
		function searchStringFilter(user) {
			var status = false;
			for(var i=0;i<uc.userHeaders.length;i++) {
				var userHeader = uc.userHeaders[i];
				var fieldValue = user[userHeader.key];
				if(uc.searchString.trim() == "" || (userHeader.key != "creationDate" && userHeader.key != "modifiedDate" && fieldValue && fieldValue.toLowerCase().indexOf(uc.searchString.toLowerCase()) != -1)) {
					status = true;
					break
				}
			}
			return status;
		}
		
		function getOrgUsersList() {
			var postdata = {};
			postdata["orgId"] = $scope.selectedOrganization.id;
			postdata["roleType"] = uc.getOrgUsersRole.key;
			AdministrationService.getOrgUsersList(postdata).then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					uc.usersList = resp.data.Users;
					_.each(uc.usersList,function(usr){
						usr.showUserDetails = false;
						usr.selected = false;
					});
				}
			});
		}
		
		function getUsersList() {
			AdministrationService.getUsersList().then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					uc.usersList = resp.data.Users;
					_.each(uc.usersList,function(usr){
						usr.showUserDetails = false;
						if(!_.isEmpty(guestUserRequest) && usr.loginId === guestUserRequest.guestUserId) {
							usr["selected"] = true;
							guestUserRequest = null;
							AdministrationService.guestUserRequest = null;
						}
					});
					uc.totalUsersCount = uc.usersList.length;
					uc.totalActiveUsersCount = _.where(uc.usersList,{status:"Active"}).length;
					var timer = $timeout(function() {
						var elmnt = document.querySelector(".user-details.selected");
						if(elmnt) {
							elmnt.scrollIntoView();
						}
						$timeout.cancel(timer);
			        }, 1000);
				}
			});
		}
		
		function userModal(user,mode) {
			var templateUrl = "app/components/Admin/Administration/Users/AddUsers/AddUserTemplate.html";
			var windowClass = "new-user-modal-window";
			var backdropClass = "new-user-modal-backdrop";
			if(!_.isEmpty(user)) {
				templateUrl = "app/components/Admin/Administration/Users/AddUsers/EditUserTemplate.html";
				windowClass = "edit-user-modal-window";
				backdropClass = "edit-user-modal-backdrop";
			}
			var modalInstance = $uibModal.open({
			      animation: true,
			      templateUrl: templateUrl,
			      controller: 'AddUserController',
			      appendTo : $('body'),
			      controllerAs: 'auc',
			      backdrop: 'static',
			      size: "md",
			      windowClass: windowClass, 
			      backdropClass: backdropClass, 
			      resolve: {
			    	  user : function() {
			    		  return user;
			    	  },
			    	  mode : function() {
			    		  return mode;
			    	  }
			      }
			});
			return modalInstance;
		}
		
		function createUser() {
			var modalInstance = userModal({},{});
			modalInstance.result.then(function (user) {
				MessageService.showSuccessMessage("USER_CREATED",[user.firstName+" "+user.lastName]);
				getUsersList();
			}, function () {
				
			});
		}
		
		function processUserInfo(user) {
			_.each(uc.userFieldsModel,function(userField){
				if(userField.key !== "password" && userField.key !== "confirmPassword") {
					userField.value = user[userField.key];
					userField.show = true;
				} else {
					userField.show = false;
				}
				if(userField.key == "termsAccepted" || userField.key == "pwdChanged" || userField.key == "passwordExpires") {
					if(userField.subField) {
						userField.subField.value = user[userField.subField.key];
						userField.subField.show = true;
					}
				}
				if(userField.key == "loginId" || userField.key == "verified" || userField.key == "termsAccepted" || userField.key == "pwdChanged" || userField.key == "passwordExpires" || userField.key == "doNotShowHelpOnLogin" || userField.key == "doNotShowTipsOnLogin" || userField.key == "creationDate" || userField.key == "modifiedDate") {
					userField.disable = true;
				}
			});
		}
		
		function viewUser(user) {
			if(user.showUserDetails) {
				user.showUserDetails = false;
				user.selected = false;
			} else {
				user.showUserDetails = true;
				user.selected = true;
			}
			_.each(uc.usersList,function(usr){
				if(user.id != usr.id) {
					usr.showUserDetails = false;
					usr.selected = false;
				}
			});
			processUserInfo(user);
		}
		
		
		function disableEditGuestUser(user) {
			var status = false;
			if(user.role === 'Guest' || user.role === 'Provisional') {
				status = true;
			}
			return status;
		}
		
		function viewUserInPopup(user) {
			var modalInstance = userModal(user,{"type" : "view"});
			modalInstance.result.then(function (result) {
				
			}, function () {
				
			});
		}
		
		function editUser(user) {
			var modalInstance = userModal(user,{"type" : "edit"});
			modalInstance.result.then(function (result) {
				MessageService.showSuccessMessage("USER_UPDATED",[result.firstName+" "+result.lastName]);
				getUsersList();
			}, function () {
				
			});
		}
		
		function deleteUser(user) {
			var text = "Are you sure you want to DELETE '"+user.firstName+" "+user.lastName+"' User";
			$confirm({text: text})
		        .then(function() {
		        	AdministrationService.deleteUser(user.id).then(function(resp) {
						if(resp.status == 200 && resp.data.Status) {
							MessageService.showSuccessMessage("USER_DELETED",[user.firstName+" "+user.lastName]);
							getUsersList();
						} else {
							MessageService.showErrorMessage("ADMINISTRATION_ERR",[resp.data.Message]);
						}
					});
		        });
		}
		
		function convertGuestToProuser(user) {
			if(appdata.UserRole === 'VDVCSiteAdmin' || appdata.UserRole === 'VDVCAdmin' || appdata.UserRole === "OrgAdmin"){
				var postdata = {};
				postdata["guestUserId"] = user.loginId;
				AdministrationService.convertGuestToProuser(postdata).then(function(resp) {
					if(resp.status == 200 && resp.data.Status) {
						MessageService.showSuccessMessage("CONVERT_GUEST_TO_PROUSER",[user.firstName]);
						getUsersList();
					}
				});
			}
		}
		
		function init() {
			if(appdata.UserRole == 'VDVCSiteAdmin' || appdata.UserRole == 'OrgAdmin') {
				if(!_.isEmpty($scope.selectedOrganization)) {
					uc.isInViewMode = true;
					_.each(uc.userHeaders,function(userHeader){
						if(uc.isInViewMode && (userHeader.key == "firstName" || userHeader.key == "lastName")) {
							userHeader["class"]= "col-xs-2";
						}
					});
					getOrgUsersList();
				} else {
					_.each(uc.userHeaders,function(userHeader){
						if(userHeader.key == "firstName" || userHeader.key == "lastName") {
							userHeader["class"]= "col-xs-1";
						}
					});
					getUsersList();
				}
			}
		}
		
		init();
	}	
	
})();