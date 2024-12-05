;(function() {
	'use strict'; 
	
	angular.module('vdvcApp').controller('ShareDocModalCtrl',ShareDocModalCtrl);
	
	ShareDocModalCtrl.$inject = ['$rootScope','$scope','$confirm','$q','$uibModal','$uibModalInstance','_','items',
	                             'appData','userService','DocFactory','MessageService'];
	
	function ShareDocModalCtrl($rootScope,$scope,$confirm,$q,$uibModal,$uibModalInstance,_,items,appData,
			userService,DocFactory,MessageService) {
		
		 var vm = this;
		 var appdata = appData.getAppData();
		 var docSharePostData = {};
		 var docSharedUserList = [];
		 var folderSharedUserList = [];
		 var sharedObjectsList = [];
		 var permChangedObjects = [];
		 
		 vm.user_ShareObjAcrossOrg = (appdata.UserSettings && appdata.UserSettings.user_ShareObjAcrossOrg && appdata.UserSettings.user_ShareObjAcrossOrg == "Yes") ? "Yes" : "No";
		 vm.user_AllowShareToGuestUser = (appdata.UserSettings && appdata.UserSettings.user_AllowShareToGuestUser && appdata.UserSettings.user_AllowShareToGuestUser == "Yes") ? "Yes" : "No";
		 vm.isSharedOrganization = appdata.IsSharedOrganization;
		 vm.sharedOrgUser_AllowFolderShare = (appdata.UserSettings && appdata.UserSettings.sharedOrgUser_AllowFolderShare && appdata.UserSettings.sharedOrgUser_AllowFolderShare == "Yes") ? "Yes" : "No";
		 vm.items = items;
		 vm.permSet;
		 vm.loggedInUser = appdata.UserId;
		 vm.sharePropagateLable = "Sharable";
		 vm.userPerms = {};
		 vm.userPerms.users = [];
		 vm.userPerms.grantedPerms = [];
		 vm.hasInvalidUser = false;
		 vm.errorMessage = "";
		 vm.isPropagateShare = false;
		 vm.sharedWith;
		 vm.sharedWithModel;
		 
		 vm.Users;
		 vm.selecteditems;
		 vm.permChanged = false;
		 vm.isFormSubmiting = false;
		 vm.isUserSelected = isUserSelected;
		 vm.showProUsersList = showProUsersList;
		 vm.showGuestUsersList = showGuestUsersList;
		 vm.tagTransform = tagTransform;
		 vm.checkIsInvalidUser = checkIsInvalidUser;
		 vm.getSelectedUserName = getSelectedUserName;
		 vm.isFolderAvailable = isFolderAvailable;
		 vm.showTransferDocOwnershipBtn = showTransferDocOwnershipBtn;
		 vm.transferDocOwnership = transferDocOwnership;
		 
		 function isUserSelected() {
			 var status = false;
			 if(vm.userPerms.users.length > 0) {
				 status = true;
			 }
			 return status;
		 }
		 
		 function showProUsersList() {
			 var status = false;
			 var keys = [];
			 _.each( vm.sharedWithModel, function( val, key ) {
			   if ( val ) {
			     keys.push(key);
			   }
			 });
			 if(!_.isEmpty(keys) && vm.sharedWithModel && !_.isEmpty(vm.sharedWithModel)) {
				 for(var i=0;i<keys.length;i++) {
					 var userObj = vm.sharedWithModel[keys[i]];
					 if(!status && userObj && !_.isEmpty(userObj) && userObj.userType == "Provisional") {
						 status = true;
					 }
				 }
			 }
			 return status;
		 }
		 
		 function showGuestUsersList() {
			 var status = false;
			 var keys = [];
			 _.each( vm.sharedWithModel, function( val, key ) {
			   if ( val ) {
			     keys.push(key);
			   }
			 });
			 if(!_.isEmpty(keys) && vm.sharedWithModel && !_.isEmpty(vm.sharedWithModel)) {
				 for(var i=0;i<keys.length;i++) {
					 var userObj = vm.sharedWithModel[keys[i]];
					 if(!status && userObj && !_.isEmpty(userObj) && userObj.userType == "Guest") {
						 status = true;
					 }
				 }
			 }
			 return status;
		 }
		 
		 function isFolderAvailable() {
			 var folderList = _.findWhere(vm.items,{"_type" : "Folder"});
			 if(folderList) {
				 return true;
			 }
			 return false;
		 }
		 
		 function tagTransform(tagname) {
			 var item = {}; 	
			 return item = {
			  		"loginId":tagname,
			  		"firstName" : tagname,
			  		"lastName" : "",
			  		"isNew" : true
			  	};
		 }
		 
		 function checkIsInvalidUser(selectedUser) {
			 if(vm.items.length == 1) {
				 vm.hasInvalidUser = false;
				 vm.errorMessage = "";
				 var users = [];
				 var isUserExists = false;
				 var existedUser;
				 _.each(vm.userPerms.users, function(user){
					 users.push(user);
					 if(!isUserExists && !_.isEmpty(vm.sharedWithModel[user])) {
						 existedUser = user;
						 isUserExists = true; 
					 }
				 });
				 var hasOwner = _.contains( users, vm.items[0].createdBy );
				 if(hasOwner) {
					 //MessageService.showErrorMessage("SHARE_ITEMS_TO_OWNER");
					 vm.errorMessage = "Can not share selected item to owner";
					 vm.hasInvalidUser = true;
					 return true;
				 }
				 if(isUserExists) {
					 //MessageService.showErrorMessage("SHARED_ITEMS_TO_USER",[existedUser]);
					 vm.errorMessage = "Selected item already shared to "+existedUser;
					 vm.hasInvalidUser = true;
					 return true;
				 }
			 }
			 return false;
		 }
		 
		 function getSelectedUserName(user) {
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
			 return userName;
		 }
		 
		 function getPermissionSet() {
			 var folderObject = _.findWhere(vm.items,{_type : "Folder"});
			 if(folderObject) {
				 if(!_.isEmpty($rootScope.permissions)&& !_.isEmpty($rootScope.permissions[folderObject._type])) {
					 vm.permSet = $rootScope.permissions[folderObject._type];
					 vm.userPerms.grantedPerms = [vm.permSet[0].name];
				 }
			 } else {
				 if(!_.isEmpty($rootScope.permissions)&& !_.isEmpty($rootScope.permissions["Document"])) {
					 vm.permSet = $rootScope.permissions["Document"];
					 vm.userPerms.grantedPerms = [vm.permSet[0].name];
				 }
			 }
		 }
		
		 function listUsers (resp) {
			if(resp.status == 200 && resp.data.Status) {
				 vm.Users = resp.data.Users;
				 if(vm.items && vm.items.length == 1) {
					 getUsersSharedWith(removeSharedUsers);
				 } else {
					for(var i=0;i<vm.Users.length;i++) {
						 vm.Users[i].hasPermission = false;
					}
				 }
				 
			 }
		 }
		
		 if(isFolderAvailable()) {
			 userService.getAllUsers().then(function(resp){
				 listUsers(resp);
			 });
		 } else {
			 userService.getAllUsersIncludeOtherOrgSharedUsers().then(function(resp){
				 listUsers(resp);
			 });
		 }
		 
		 function removeSharedUsers() {
			 for(var i=0;i<vm.Users.length;i++) {
				if( vm.sharedWith && vm.sharedWith[vm.Users[i].loginId]) {
					vm.Users[i].hasPermission = true;
				} else {
					vm.Users[i].hasPermission = false;
				}
			}
		 }
		 
		 function getUsersSharedWith(cb) {
			 for(var i = 0;i<vm.items.length;i++) {
				 if(vm.items[i]._type == "Folder") {   
					 DocFactory.getSharedUsersForFolder(vm.items[i].id).then(function(resp){
						 if(resp.status == 200 && resp.data.Status) {
							 vm.sharedWith = resp.data.Folders;
							 vm.sharedWithModel = angular.copy(resp.data.Folders);
							 if(typeof cb == "function") {
								 cb();
							 }
						 }
					 });
				 }else if(vm.items[i]._type == "Document"){
					 DocFactory.getSharedUsersForDoc(vm.items[i].id,vm.items[i].clientId).then(function(resp){
						 if(resp.status == 200 && resp.data.Status) {
							 vm.sharedWith = resp.data.Notes;
							 vm.sharedWithModel = angular.copy(resp.data.Notes);
							 if(typeof cb == "function") {
								 cb();
							 }
						 }
					 });
				 }
			 }
		 }
		 
		 function updateUsers(userId) {
			 var usr = _.find(vm.Users, function(obj) {
				 var loginId = obj.loginId;
				 if(obj.loginId && !_.isEmpty(obj.loginId)) {
				 	loginId = obj.loginId.toLowerCase();
				 }
				 return loginId == userId.toLowerCase(); 
			 });
			 if(usr) {
				 usr.hasPermission = false;
			 }
			 if(vm.sharedWith) {
				 delete vm.sharedWith[userId];
				 delete vm.sharedWithModel[userId];
				 if(vm.sharedWith && Object.keys(vm.sharedWith).length > 1) {
					 vm.items[0].shared = true;
					 items[0].shared = true;
				 } else {
					 vm.items[0].shared = false;
					 items[0].shared = false;
				 }
			 }
		 }
		 
		 vm.selectPerms = function(selected){
			 if(selected.toLowerCase() == "edit") {
				 vm.isPropagateShare = true;
				 vm.disablePropagateShare = true;
			 } else if(selected.toLowerCase() == "view" || selected.toLowerCase() == "readonly") {
				 vm.isPropagateShare = false;
				 vm.disablePropagateShare = false;
			 }
		 };
		 
		 vm.revokePermissions = function(user){
			 var text = "Are you sure you want to revoke permission ?";
			 $confirm({text: text}).then(function() {
				 for(var i = 0;i<vm.items.length;i++) {
					 if(vm.items[i]._type == "Folder"){
						 DocFactory.unShareFolder(vm.items[i].id,{'users':[user]}).then(function(resp ) {
							 if(resp.status == 200 && resp.data.Status) {
								 getUsersSharedWith(removeSharedUsers);
							 }
						 });
					 } else if(vm.items[i]._type == "Document") {
						 DocFactory.unShareDocument(vm.items[i].id,vm.items[i].clientId,{'users':[user]}).then(function(resp ) {
							 if(resp.status == 200 && resp.data.Status) {
								 getUsersSharedWith(removeSharedUsers);
							 }
						 });
					 }
				 }
			 }, function() {
			    	
			 });
		 };
		 
		 vm.cancel = function () {
			 $uibModalInstance.dismiss('cancel');
		 };
		 
		 vm.cancelChangePermissions = function () {
			 if(vm.sharedWithModel) {
				  vm.permChanged = false;			  
				  _.each(vm.sharedWithModel, function(element,key){
					  if(!_.isEqual(element, vm.sharedWith[key])) {
						  vm.sharedWithModel[key] = angular.copy(vm.sharedWith[key]);
					  } 
				  }); 
				  permChangedObjects = [];
			  }
		 };
		 
		 function shareCallBack(resp) {
			 if(resp && resp.status == 200 && resp.data.Status) {
				 if(!_.isEmpty(resp.data.resultList)) {
					 sharedObjectsList = sharedObjectsList.concat(resp.data.resultList);
				 }
				 if(!_.isEmpty(resp.data.Notes)) {
					 docSharedUserList = docSharedUserList.concat(resp.data.Notes);
				 }
				 if(!_.isEmpty(resp.data.Folders)) {
					 folderSharedUserList = folderSharedUserList.concat(resp.data.Folders);
				 }
				 var tempNonNumiciUsers = resp.data.NonNumiciUsers;
				 var canNotShareNonNumiciUsers = resp.data.NonNumiciUsersCanNotBeShared;
				 var canNotShareFolderToOtherOrgUsers = resp.data.CanNotShareFolderToOtherOrgUsers;
				 var otherOrgUsers = [];
				 var nonNumiciUsers = [];
				 if(!_.isEmpty(canNotShareFolderToOtherOrgUsers)) {
					 otherOrgUsers = canNotShareFolderToOtherOrgUsers;
				 }
				 if(!_.isEmpty(tempNonNumiciUsers)) {
					 for(var j=0;j<tempNonNumiciUsers.length;j++) {
						 var user = {
								  	"loginId" : tempNonNumiciUsers[j],
								  	"selected" : false
								 };
						 nonNumiciUsers.push(user);
					 }
					 //confirmShare(nonNumiciUsers,otherOrgUsers,"SharedToNonExistedUsers");
					 confirmGuestUserShare(nonNumiciUsers,otherOrgUsers,"GuestUserSahre");
				 } else if(!_.isEmpty(canNotShareNonNumiciUsers)) {
					 for(var j=0;j<canNotShareNonNumiciUsers.length;j++) {
						 var user = {
								  	"loginId" : canNotShareNonNumiciUsers[j],
								  	"selected" : false
								 };
						 nonNumiciUsers.push(user);
					 }
					 confirmGuestUserShare(nonNumiciUsers,otherOrgUsers,"CanNotShareToNonNumiciUsers");
				 } else if(!_.isEmpty(otherOrgUsers)) {
					 confirmGuestUserShare(nonNumiciUsers,otherOrgUsers,"CanNotShareFolderToOtherOrgUsers");
				 } else if(!_.isEmpty(sharedObjectsList)) {
					 $uibModalInstance.close(sharedObjectsList);
				 }
			 } else {
				 $uibModalInstance.close(sharedObjectsList);
			 }
		 }
		 
		 function shareToUsers() {
			 DocFactory.shareItems(docSharePostData).then(function(resp){
				 shareCallBack(resp);
			 });
		 }
		 
		 function shareItemsToProvisionalUsers() {
			 DocFactory.shareItemsToProvisionalUsers(docSharePostData).then(function(resp){
				 shareCallBack(resp);
			 });
		 }
		 
		 
		 function shareItemsToGuestUsers() {
			 userService.shareObjectListToGuestUser(docSharePostData).then(function(resp){
				 shareCallBack(resp);
			 });
		 }
		 
		 function confirmGuestUserShare(NonNumiciUsers,otherOrgUsers,action) {
			 var modalInstance = $uibModal.open({
				 animation: true,
				 templateUrl: 'app/components/common/ShareToGuestUser/ShareToGuestUsers.html',
			     controller: 'ShareToGuestUsersController',
			     appendTo : $('.rootContainer'),
			     controllerAs: 'snc',
			     backdrop: 'static',
			     size: 'md',
			     resolve: {
			    	 NonNumiciUsers : function() {
			    		 return NonNumiciUsers;
			    	 },
			    	 docSharedUserList : function() {
			    		 return docSharedUserList;
			    	 },
			    	 folderSharedUserList : function() {
			    		 return folderSharedUserList;
			    	 },
			    	 taskspaceSharedUserList : function() {
			    		 return [];
			    	 },otherOrgUsers : function() {
			    		 return otherOrgUsers;
			    	 },action : function() {
			    		 return {"action" : action};
			    	 }
			     }
			 });
			 modalInstance.result.then(function (obj) {
				 var selectedUsers = obj.users;
				 if (selectedUsers && selectedUsers.length > 0 && vm.userPerms.grantedPerms.length > 0 ) { 
					 var data = {};
					 for(var i=0;i<selectedUsers.length;i++) {
						 var sharedUser = vm.sharedWithModel[selectedUsers[i].loginId];
						 if(!_.isEmpty(sharedUser)) {
							 data[selectedUsers[i].loginId] = {
									  "permissions" : sharedUser.permissions[0],
									  "isPropagateShare" : sharedUser.isSharable
							  		};
						 } else {
							 data[selectedUsers[i].loginId] = {
									  "permissions" : vm.userPerms.grantedPerms[0],
									  "isPropagateShare" : vm.isPropagateShare
							  		};
						 } 
						 
					 }	
					 docSharePostData["userList"] = data;
					 docSharePostData["targetOrg"] = obj.targetOrg;
					 shareItemsToGuestUsers();
				  } else {
					  shareCallBack();
				  }
			 }, function () {
				 $uibModalInstance.dismiss('cancel');
			 });
		 }
		 
		 function confirmShare(NonNumiciUsers,otherOrgUsers,action) {
			 var modalInstance = $uibModal.open({
				 animation: true,
			     templateUrl: 'app/components/common/ShareToNonExistedUsers/ShareToNonExistedUsers.html',
			     controller: 'ShareToNonExistedUsersController',
			     appendTo : $('.rootContainer'),
			     controllerAs: 'snc',
			     backdrop: 'static',
			     size: 'md',
			     resolve: {
			    	 NonNumiciUsers : function() {
			    		 return NonNumiciUsers;
			    	 },
			    	 docSharedUserList : function() {
			    		 return docSharedUserList;
			    	 },
			    	 folderSharedUserList : function() {
			    		 return folderSharedUserList;
			    	 },
			    	 taskspaceSharedUserList : function() {
			    		 return [];
			    	 },otherOrgUsers : function() {
			    		 return otherOrgUsers;
			    	 },action : function() {
			    		 return {"action" : action};
			    	 }
			     }
			 });
			 modalInstance.result.then(function (selectedUsers) {
				 if (selectedUsers && selectedUsers.length > 0 && vm.userPerms.grantedPerms.length > 0 ) { 
					 var data = {};
					 for(var i=0;i<selectedUsers.length;i++) {
						 var sharedUser = vm.sharedWithModel[selectedUsers[i].loginId];
						 if(!_.isEmpty(sharedUser)) {
							 data[selectedUsers[i].loginId] = {
									  "permissions" : sharedUser.permissions[0],
									  "isPropagateShare" : sharedUser.isSharable
							  		};
						 } else {
							 data[selectedUsers[i].loginId] = {
									  "permissions" : vm.userPerms.grantedPerms[0],
									  "isPropagateShare" : vm.isPropagateShare
							  		};
						 }
					 }	
					 docSharePostData["userList"] = data;
					 shareItemsToProvisionalUsers();
				  } else {
					  shareCallBack();
				  }
			 }, function () {
				 $uibModalInstance.dismiss('cancel');
			 });
		 }
		 
		 var getPermsChangedUserList = function() {
			  var usersList = {};
			  if(!vm.permChanged) {
				  for(var i=0;i<vm.userPerms.users.length;i++) {
					  usersList[vm.userPerms.users[i]] = {
							  "permissions" : vm.userPerms.grantedPerms[0],
							  "isPropagateShare": vm.isPropagateShare
					  };
				  }
			  }
			  if(vm.items && vm.items.length == 1 && vm.permChanged) {
				 _.each(vm.sharedWithModel, function(perms,user){
					 var originalSharedUserObj = {};
					 var duplicateSharedUserObj = {};
					 var permChangedObject = {};
					 originalSharedUserObj[user] = vm.sharedWith[user];
					 duplicateSharedUserObj[user] = vm.sharedWithModel[user];
					 for(var i = 0; permChangedObjects.length > i; i++) {
						 var permChangedObj = {};
						 permChangedObj = permChangedObjects[i];
						 var existedPermChangedObj = {};
						 existedPermChangedObj = permChangedObj[user];
						 if(!_.isEmpty(existedPermChangedObj)) {
							 permChangedObject = permChangedObj;
						 }
					 }
					 if(!_.isEmpty(permChangedObject[user]) && !_.isEqual(duplicateSharedUserObj, originalSharedUserObj)) {
						 usersList[user] = {
								 "permissions" : duplicateSharedUserObj[user].permissions[0],
								 "isPropagateShare" : duplicateSharedUserObj[user].isSharable
						 }; 
						 if(duplicateSharedUserObj[user].displayName) {
							 usersList[user].displayName = duplicateSharedUserObj[user].displayName;
						 }
					 }
				 });
			  }
			  return usersList;
		 }
		 
		 vm.ok = function () {
			 vm.isFormSubmiting = true;
			 var userList = getPermsChangedUserList();
			 if(vm.items.length == 1) {
				 var users = [];
				 _.each(userList, function(perms,user){
					 users.push(user);
				 });
				 var hasOwner = _.contains( users, vm.items[0].createdBy );
				 if(hasOwner) {
					 MessageService.showErrorMessage("SHARE_ITEMS_TO_OWNER");
					 vm.isFormSubmiting = false;
					 return false;
				 }
			 }
			 docSharePostData["userList"] = userList;
			 if (userList && !_.isEmpty(userList)) {
				 var itemList = [];
				 for(var i= 0; i < vm.items.length;i++) {
					 var item = {};
					 item = {
						 "objectType" : vm.items[i]._type,
						 "objectId" : vm.items[i].id,
						 "clientId" : (vm.items[i]._type == "Folder") ? appdata['OrganizationId'] : vm.items[i].clientId
					 };
					 itemList.push(item);
				 }
				 docSharePostData["objectList"] = itemList;
				 shareToUsers();
			  }
		  };
		  
		  vm.permsEdited = function() {
			  if(vm.sharedWithModel) {
				  vm.permChanged = false;
				  _.each(vm.sharedWithModel, function(perms,collab){
					  var originalCollaborator = {};
					  var permChangedObject = {};
					  originalCollaborator[collab] = vm.sharedWith[collab];
					  permChangedObject[collab] = vm.sharedWithModel[collab];
					  if(!_.isEqual(permChangedObject[collab].permissions, originalCollaborator[collab].permissions) 
							  || !_.isEqual(permChangedObject[collab].isSharable, originalCollaborator[collab].isSharable)) {
						  vm.permChanged = true;
						  permChangedObjects.push(permChangedObject);
						  return;
					  }  else if(_.isEqual(permChangedObject[collab].permissions, originalCollaborator[collab].permissions) 
							  && _.isEqual(permChangedObject[collab].isSharable, originalCollaborator[collab].isSharable)) {
						  permChangedObjects = _.reject(permChangedObjects, function(permChangedObj){ 
							  var status = false;
							  var existedPermChangedObj = {};
							  existedPermChangedObj = permChangedObj[collab];
							  if(!_.isEmpty(existedPermChangedObj)) {
								  status = true;
							  }
							  return status; 
						  });
					  }
				  });
			  }
		  };
		  
		  vm.getLoggedInUser = function(user) {
			  var status = false;
			  if(!_.isEmpty(vm.loggedInUser) && !_.isEmpty(user) && vm.loggedInUser.toLowerCase() == user.toLowerCase()) {
				  status = true;
			  }
			  return status;
		  };
		  
		  vm.disableSharableForManaged = function(user) {
			  var status = false;
			  if(!_.isEmpty(vm.sharedWithModel[user].permissions[0]) && (vm.sharedWithModel[user].permissions[0].toLowerCase() == "view" || vm.sharedWithModel[user].permissions[0].toLowerCase() == "readonly")) {
				  vm.sharedWithModel[user].isSharable = false;
				  status = true;
			  } else if(!_.isEmpty(vm.loggedInUser) && !_.isEmpty(user) && vm.loggedInUser.toLowerCase() == user.toLowerCase()) {
				  status = true;
			  }
			  return status;
		  };
		  
		  function showTransferDocOwnershipBtn() {
			  var status = false;
			  if(!_.isEmpty(vm.items)) {
					var permissions = [];
					_.each(vm.items,function(item,index) {
						permissions.push(item.perms);
					});
			  }
			  var nonOwnedItem = _.findWhere(permissions,{'owner': false});
			  var externalFolderObj = _.find(vm.items, function(item) {
				  var externalFolderStatus = false;
				  if(item._type == "Folder" && (DocFactory.isDropBoxFolder(item) || DocFactory.isBoxFolder(item) || DocFactory.isoneDriveFolder(item))) {
					  externalFolderStatus = true;
				  }
				  return externalFolderStatus;
			  });
			  var isExternalDocPresent = DocFactory.isExternalDocPresent(vm.items);
			  
			  if(!appdata.IsSharedOrganization && !vm.permChanged && !nonOwnedItem && !externalFolderObj && !isExternalDocPresent) {
				  status = true;
			  }
			  return status;
		  }
		  
		  function transferDocOwnership() {
			 var modalInstance = $uibModal.open({
				  animation: true,
			      templateUrl: 'app/components/common/TransferOwnership/TransferOwnership.html',
			      controller: 'TransferOwnershipController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'toc',
			      backdrop: 'static',
			      size: 'md',
			      resolve: {
			    	  items : function() {
			    		  return vm.items;
			    	  },
			    	  transferFor : function() {
			    		  return {"type" : "Documents"}
			    	  }
			      }
			 });
			 modalInstance.result.then(function (trnasferedInfo) {
				 $uibModalInstance.close({respType : "transfer", "trnasferedInfo" : trnasferedInfo});
			 }, function () {
			      
			 });
		 }
			 
		  getPermissionSet();
		  
	}
	
})();