;(function() {
	'use strict'; 
	
	angular.module('vdvcApp').controller('ShareTSController',ShareTSController);
	
	ShareTSController.$inject = ['$rootScope','$scope','$q','$uibModal','$uibModalInstance','appData','_','items','userService','DocFactory','MessageService','TaskSpaceService','$confirm'];
	
	function ShareTSController($rootScope,$scope,$q,$uibModal,$uibModalInstance,appData,_,items,userService,DocFactory,MessageService,TaskSpaceService,$confirm) {
		 
		var vm = this;
		var appdata = appData.getAppData();
		var sharedUserList = [];
		var taskspaceSharedUserList = [];
		var sharedObjectsList = [];
		var selectedProvisionalUsers = [];
		var permChangedObjects = [];
		var sharePostdata = {};
		
		// Instance variables
		 vm.isFormSubmiting = false;
		 vm.user_ShareObjAcrossOrg = (appdata.UserSettings && appdata.UserSettings.user_ShareObjAcrossOrg && appdata.UserSettings.user_ShareObjAcrossOrg == "Yes") ? "Yes" : "No";
		 vm.user_AllowShareToGuestUser = (appdata.UserSettings && appdata.UserSettings.user_AllowShareToGuestUser && appdata.UserSettings.user_AllowShareToGuestUser == "Yes") ? "Yes" : "No";
		 vm.items = items;
		 vm.permSet;
		 vm.loggedInUser = appdata.UserId;
		 vm.userPerms = {};
		 vm.userPerms.users = [];
		 vm.userPerms.grantedPerms = [];
		 vm.hasInvalidUser = false;
		 vm.errorMessage = "";
		 vm.sharePropagateLable = "Sharable";
		 vm.sharedWith = [];
		 vm.sharedWithModel = [];
		 vm.Users=[];
		 vm.propagateShare = false;
		 vm.disablePropagateShare = false;
		 vm.permChanged = false;
		 
		// Methods
		 vm.isUserSelected = isUserSelected;
		 vm.showProUsersList = showProUsersList;
		 vm.showGuestUsersList = showGuestUsersList;
		 vm.tagTransform = tagTransform;
		 vm.checkIsInvalidUser = checkIsInvalidUser;
		 vm.getSelectedUserName = getSelectedUserName;
		 vm.ok = ok;
		 vm.cancel = cancel;
		 vm.cancelChangePermissions = cancelChangePermissions;
		 vm.revokePermissions = revokePermissions;
		 vm.selectPerms = selectPerms;
		 vm.permsEdited = permsEdited;
		 vm.isLoggedInUser = isLoggedInUser;
		 vm.isTsSharable = isTsSharable;
		 vm.disableSharableForManaged = disableSharableForManaged;
		 vm.showTransferTSOwnershipBtn = showTransferTSOwnershipBtn;
		 vm.transferTSOwnership = transferTSOwnership;
		 
		 if(vm.items && vm.items.length == 1) {
			 vm.sharedWith = vm.items[0].collaborators;
			 vm.sharedWithModel = angular.copy(vm.items[0].collaborators);
		 }
		 
		 function isUserSelected() {
			 var status = false;
			 if(vm.userPerms.users.length > 0) {
				 status = true;
			 }
			 return status;
		 }
		 
		 function showProUsersList() {
			 var status = false;
			 var proUserObj = _.findWhere(vm.sharedWithModel,{"userType" : "Provisional"});
			 if(!_.isEmpty(proUserObj)) {
				 status = true;
			 }
			 return status;
		 }
		 
		 function showGuestUsersList() {
			 var status = false;
			 var guestUserObj = _.findWhere(vm.sharedWithModel,{"userType" : "Guest"});
			 if(!_.isEmpty(guestUserObj)) {
				 status = true;
			 }
			 return status;
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
				 var existedUserId;
				 _.each(vm.userPerms.users, function(user){
					 users.push(user);
					 var existedUser = _.findWhere(vm.sharedWithModel,{userId : user});
					 if(!isUserExists && !_.isEmpty(existedUser)) {
						 existedUserId = existedUser.userId;
						 isUserExists = true; 
					 }
				 });
				 var hasOwner = _.contains( users, vm.items[0].owner );
				 if(hasOwner) {
					 //MessageService.showErrorMessage("SHARE_ITEMS_TO_OWNER");
					 vm.errorMessage = "Can not share selected item to owner";
					 vm.hasInvalidUser = true;
					 return true;
				 }
				 if(isUserExists) {
					 //MessageService.showErrorMessage("SHARED_ITEMS_TO_USER",[existedUser]);
					 vm.errorMessage = "Selected item already shared to "+existedUserId;
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
			/*DocFactory.getFolderPermissionSet().then(function(resp) {
				 if(resp.status == 200 && resp.data.Status) {
					 vm.permSet = resp.data.Folders;
					 vm.userPerms.grantedPerms = [vm.permSet[0]];
				 }
			});*/
			if(!_.isEmpty($rootScope.permissions)&& !_.isEmpty($rootScope.permissions["Taskspace"])) {
				 vm.permSet = $rootScope.permissions["Taskspace"];
				 vm.userPerms.grantedPerms = [vm.permSet[0].name];
			}
		 }
		  
		 userService.getAllUsersIncludeOtherOrgSharedUsers().then(function(resp) {
			 if(resp.status == 200 && resp.data.Status) {
				 vm.Users = resp.data.Users;
				 if(vm.items && vm.items.length == 1) {
					 removeSharedUsers();
				 } else {
					for(var i=0;i<vm.Users.length;i++) {
						 vm.Users[i].hasPermission = false;
					}
				 }
			 }
		 });
		 
		 function removeSharedUsers() {
			 for(var i=0;i<vm.Users.length;i++) {
				 _.each(vm.items, function(item,index){
					 	var elem = _.find(item.collaborators, function(collaborator) {
						    return collaborator.userId.toLowerCase() == vm.Users[i].loginId.toLowerCase();
						});
						if(elem) {
							vm.Users[i].hasPermission = true;
						} else {
							vm.Users[i].hasPermission = false;
						}
				 }); 
			 }
		 }
		 
		 function updateUsers(colbrtr) {
			 var usr = _.find(vm.Users, function(obj) {
				 return colbrtr.userId.toLowerCase() == obj.loginId.toLowerCase();
			 });
			 
			 if(usr) {
				 usr.hasPermission = false;
			 }
			
		 	 vm.sharedWith = _.reject(vm.sharedWith, function(obj){ 
		 		 return obj.userId.toLowerCase() == colbrtr.userId.toLowerCase(); 
		 	 });
			
		 	 vm.sharedWithModel = _.reject(vm.sharedWithModel, function(obj){ 
		 		 return obj.userId.toLowerCase() == colbrtr.userId.toLowerCase(); 
		 	 });
			
		 	 vm.items[0].collaborators  = vm.sharedWith;
		 }
		 
		 function revokePermissions(colbrtr){
			
			 var text = "Are you sure you want to revoke permission ?";
	  			$confirm({text: text})
		        .then(function() {
					 if(vm.items && vm.items.length == 1) {
						 var postdata = {
								 "id" : vm.items[0].id,
								 "clientId" : vm.items[0].clientId,
								 "collaborators" : [colbrtr],
						 };
						 
						 TaskSpaceService.removeCollaborator(postdata).then(function(resp) {
							 if(resp.status == 200 && resp.data.Status) {
								 updateUsers(colbrtr);
							 }
						 });
					 } 
		        }, function() {
			    	
			    });
		 }
		 
		 function selectPerms (selected){
			 if(selected.toLowerCase() == "edit") {
				 vm.propagateShare = true;
				 vm.disablePropagateShare = true;
			 } else if(selected.toLowerCase() == "view" || selected.toLowerCase() == "readonly") {
				 vm.propagateShare = false;
				 vm.disablePropagateShare = false;
			 }
		 };
		 
		 function cancel() {
			 $uibModalInstance.dismiss('cancel');
		 }
		 
		 function cancelChangePermissions () {
			 if(vm.sharedWithModel) {
				  vm.permChanged = false;			  
				  _.each(vm.sharedWithModel, function(element,key){
					  if(!_.isEqual(element, vm.sharedWith[key])) {
						  vm.sharedWithModel[key] = angular.copy(vm.sharedWith[key]);
					  } 
				  }); 
				  permChangedObjects = [];
			  }
		 }
		 
		 function inviteProvisionalUsersToTaskSpace() {
			 TaskSpaceService.inviteProvisionalUsersToTaskSpace(sharePostdata).then(function(resp){
				  if(resp.status == 200 && resp.data.Status) {
					  handelSharedInfo(resp.data);
				  }
			 });
		 }
		 
		 function inviteGuestUsersToTaskSpace() {
			 userService.shareObjectListToGuestUser(sharePostdata).then(function(resp){
				  if(resp.status == 200 && resp.data.Status) {
					  handelSharedInfo(resp.data);
				  }
			 });
		 }
		 
		 function confirmShare(NonNumiciUsers,action) {
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
			    		 return [];
			    	 },
			    	 folderSharedUserList : function() {
			    		 return [];
			    	 },
			    	 taskspaceSharedUserList : function() {
			    		 return taskspaceSharedUserList;
			    	 },otherOrgUsers : function() {
			    		 return [];
			    	 },action : function() {
			    		 return {"action" : action};
			    	 }
			     }
			 });
			 
			 modalInstance.result.then(function (selectedUsers) {
				 if (action === "SharedToNonExistedUsers" && selectedUsers.length > 0 && vm.userPerms.grantedPerms.length > 0 ) { 
					 var usersList = {};
					 for(var i=0;i<selectedUsers.length;i++) {
						 var sharedUser = _.findWhere(vm.sharedWithModel,{userId : selectedUsers[i].loginId});
						 selectedProvisionalUsers.push(selectedUsers[i].loginId);
						 if(sharedUser) {
							 taskspaceSharedUserList = taskspaceSharedUserList.concat(sharedUser.userId); 
							 usersList[sharedUser.userId] = {
									  "permissions" : sharedUser.permissions,
									  "propagateShare" : sharedUser.propagateShare
							 };
						 } else {
							 usersList[selectedUsers[i].loginId] = {
									  "permissions" : vm.userPerms.grantedPerms[0],
									  "propagateShare" : vm.propagateShare
							 };
						 }
						 
					 }
					 sharePostdata["userList"] = usersList;
					 inviteProvisionalUsersToTaskSpace();
				 } else if (action === "CanNotShareToNonNumiciUsers"){
					 handelSharedInfo();
				 }
			 }, function () {
				 $uibModalInstance.dismiss('cancel');
			 });
		 }
		 
		 function confirmGuestUserShare(NonNumiciUsers,action) {
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
			    		 return [];
			    	 },
			    	 folderSharedUserList : function() {
			    		 return [];
			    	 },
			    	 taskspaceSharedUserList : function() {
			    		 return taskspaceSharedUserList;
			    	 },
			    	 otherOrgUsers : function() {
			    		 return [];
			    	 },
			    	 action : function() {
			    		 return {"action" : action};
			    	 }
			     }
			 });
			 
			 modalInstance.result.then(function (obj) {
				 var selectedUsers = obj.users;
				 if (action === "GuestUserSahre" && selectedUsers.length > 0 && vm.userPerms.grantedPerms.length > 0 ) { 
					 var usersList = {};
					 for(var i=0;i<selectedUsers.length;i++) {
						 var sharedUser = _.findWhere(vm.sharedWithModel,{userId : selectedUsers[i].loginId});
						 selectedProvisionalUsers.push(selectedUsers[i].loginId);
						 if(sharedUser) {
							 taskspaceSharedUserList = taskspaceSharedUserList.concat(sharedUser.userId); 
							 usersList[sharedUser.userId] = {
									  "permissions" : sharedUser.permissions,
									  "propagateShare" : sharedUser.propagateShare
							 };
						 } else {
							 usersList[selectedUsers[i].loginId] = {
									  "permissions" : vm.userPerms.grantedPerms[0],
									  "propagateShare" : vm.propagateShare
							 };
						 }
						 
					 }
					 sharePostdata["userList"] = usersList;
					 sharePostdata["targetOrg"] = obj.targetOrg;
					 inviteGuestUsersToTaskSpace();
				 } else if (action === "CanNotShareToNonNumiciUsers"){
					 handelSharedInfo();
				 }
			 }, function () {
				 $uibModalInstance.dismiss('cancel');
			 });
		 }
		 
		 
		 
		 function confirmSharedToNonExistedUsers(NonNumiciUsers) {
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
			    	 sharedUserList : function() {
			    		 return sharedUserList;
			    	 }
			     }
			 });
			 modalInstance.result.then(function (selectedUsers) {
				 if (selectedUsers.length > 0 && vm.userPerms.grantedPerms.length > 0 ) { 
					 var usersList = {};
					 for(var i=0;i<selectedUsers.length;i++) {
						 var sharedUser = _.findWhere(vm.sharedWithModel,{userId : selectedUsers[i].loginId});
						 selectedProvisionalUsers.push(selectedUsers[i].loginId);
						 if(sharedUser) {
							 sharedUserList = sharedUserList.concat(sharedUser.userId); 
							 usersList[sharedUser.userId] = {
									  "permissions" : sharedUser.permissions,
									  "propagateShare" : sharedUser.propagateShare
							 };
						 } else {
							 usersList[selectedUsers[i].loginId] = {
									  "permissions" : vm.userPerms.grantedPerms[0],
									  "propagateShare" : vm.propagateShare
							 };
						 }
						 
					 }
					 sharePostdata["userList"] = usersList;
					 inviteProvisionalUsersToTaskSpace();
				 }
			 }, function () {
				 $uibModalInstance.dismiss('cancel');
			 });
		 }
		 
		 function canNotSharedToNonExistedUsers(NonNumiciUsers) {
			 var modalInstance = $uibModal.open({
				 animation: true,
			     templateUrl: 'app/components/common/CanNotShareToNonExistedUsers/CanNotShareToNonExistedUsers.html',
			     controller: 'CanNotShareToNonExistedUsersController',
			     appendTo : $('.rootContainer'),
			     controllerAs: 'cnsnc',
			     backdrop: 'static',
			     size: 'md',
			     resolve: {
			    	 NonNumiciUsers : function() {
			    		 return NonNumiciUsers;
			    	 },
			    	 sharedUserList : function() {
			    		 return sharedUserList;
			    	 }
			     }
			 });
			 modalInstance.result.then(function () {
				 handelSharedInfo();
			 }, function () {
				 $uibModalInstance.dismiss('cancel');
			 });
		 }
		 
		 function processSharedObjectsList() {
			 var isSharedTrue = _.where(sharedObjectsList,{"isInvited" : true});
			 if(!_.isEmpty(isSharedTrue)) {
				 _.each(isSharedTrue,function(source,index) {
					 var item = _.findWhere(vm.items,{"id":source.id});
					 item.selected = false;
					 delete item["isVisible"]; 
					 if(_.isEmpty(item.collaborators)) {
						 item.collaborators = [];
					 }
					 for(var i=0;i<vm.userPerms.users.length;i++) {
						 if(taskspaceSharedUserList.indexOf(vm.userPerms.users[i]) != -1 || selectedProvisionalUsers.indexOf(vm.userPerms.users[i]) != -1) {
							 var isUserExist = _.findWhere(item.collaborators,{"userId" : vm.userPerms.users[i]});
							 if(isUserExist) {
								 item.collaborators = _.reject(item.collaborators,{"userId" : vm.userPerms.users[i]});
							 }
							 var data = {};
							 data.userId = vm.userPerms.users[i];
							 data.displayName = vm.userPerms.users[i];
							 data.permissions = vm.userPerms.grantedPerms[0];
							 data.propagateShare = vm.propagateShare;
							 item.collaborators.push(data);
						 }
					 }
					 if(!_.isEmpty(vm.items) && vm.items.length == 1) {
						 _.each(vm.sharedWithModel, function(collaborator) {
							 if(taskspaceSharedUserList.indexOf(collaborator.userId) != -1 || selectedProvisionalUsers.indexOf(vm.userPerms.users[i]) != -1) {
								 var isUserExist = _.findWhere(item.collaborators,{"userId" : collaborator.userId});
								 if(isUserExist) {
									 item.collaborators = _.reject(item.collaborators,{"userId" : collaborator.userId});
								 }
								 var tempElement = {};
								 tempElement.propagateShare = collaborator.propagateShare;
								 tempElement.permissions = collaborator.permissions;
								 tempElement.userId = collaborator.userId;
								 tempElement.userType = collaborator.userType;
								 if(collaborator.displayName) {
									 tempElement.displayName = collaborator.displayName;
								 }
								 item.collaborators.push(tempElement);
							 }
						 });
					 }
				 });
			 }
		 }
		 
		 function handelSharedInfo(responseData) {
			 if(responseData) {
				 if(!_.isEmpty(responseData.Results)) {
					 sharedObjectsList = sharedObjectsList.concat(responseData.Results);
				 }
				 if(!_.isEmpty(responseData.sharedUsers)) {
					 taskspaceSharedUserList = taskspaceSharedUserList.concat(responseData.sharedUsers);
				 }
				 var tempNonNumiciUsers = responseData.NonNumiciUsers;
				 var canNotShareNonNumiciUsers = responseData.NonNumiciUsersCanNotBeShared;
				 if(!_.isEmpty(tempNonNumiciUsers)) {
					 var nonNumiciUsers = [];
					 for(var i=0;i<tempNonNumiciUsers.length;i++) {
						 var user = {
								  	"loginId" : tempNonNumiciUsers[i],
								  	"selected" : false
								 };
						 nonNumiciUsers.push(user);
					 }
					 //confirmSharedToNonExistedUsers(nonNumiciUsers);
					 //confirmShare(nonNumiciUsers,"SharedToNonExistedUsers");
					 confirmGuestUserShare(nonNumiciUsers,"GuestUserSahre");
				 } else if(!_.isEmpty(canNotShareNonNumiciUsers)) {
					 var nonNumiciUsers = [];
					 for(var i=0;i<canNotShareNonNumiciUsers.length;i++) {
						 var user = {
								  	"loginId" : canNotShareNonNumiciUsers[i],
								  	"selected" : false
								 };
						 nonNumiciUsers.push(user);
					 }
					 //canNotSharedToNonExistedUsers(nonNumiciUsers);
					 confirmShare(nonNumiciUsers,"CanNotShareToNonNumiciUsers");
				 } else if(!_.isEmpty(sharedObjectsList)) {
					 processSharedObjectsList();
					 $uibModalInstance.close(sharedObjectsList);
				 } 
			 } else {
				 if(!_.isEmpty(sharedObjectsList)) {
					 processSharedObjectsList();
				 }
				 $uibModalInstance.close(sharedObjectsList);
			 }
		 }
		 
		 function preparePostdata() {
			 var objectList = [];
			 var usersList = {};
			 _.each(vm.items,function(item,index) {
				 var tempItem = {
					      "objectType": "Taskspace",
					      "objectId": item.id,
					      "clientId": item.clientId
					    };
				 objectList.push(tempItem); 
				 sharePostdata["objectList"] = objectList;
				 	
			 }); 
			 if(!vm.permChanged) {
				 for(var i=0;i<vm.userPerms.users.length;i++) {
					 usersList[vm.userPerms.users[i]] = {
							 "permissions" : vm.userPerms.grantedPerms[0],
							 "propagateShare" : vm.propagateShare
					 };
				 }
			 }
			 
			 if(vm.items && vm.items.length == 1 && vm.permChanged) {
				 _.each(vm.sharedWithModel, function(collaborator){
					 var originalSharedUserObj = _.findWhere(vm.sharedWith,{"userId":collaborator.userId});
					 var permChangedObject = _.findWhere(permChangedObjects,{"userId":collaborator.userId});
					 if(!_.isEmpty(permChangedObject) && !_.isEqual(collaborator, originalSharedUserObj)) {
						 usersList[collaborator.userId] = {
								 "permissions" : collaborator.permissions,
								 "propagateShare" : collaborator.propagateShare
						 }; 
						 if(collaborator.displayName) {
							 usersList[collaborator.userId].displayName = collaborator.displayName;
						 }
					 }
				 });
			 }
			 if(vm.items.length == 1) {
				 var users = [];
				 _.each(usersList, function(perms,user){
					 users.push(user);
				 });
				 var hasOwner = _.contains( users, vm.items[0].owner );
				 if(hasOwner) {
					 MessageService.showErrorMessage("SHARE_ITEMS_TO_OWNER");
					 vm.isFormSubmiting = false;
					 return false;
				 }
			 }
			 sharePostdata["userList"] = usersList;
			 return true;
		 }
		 
		 function inviteUsersToTaskSpace() {
			 TaskSpaceService.inviteToTaskSpaceList(sharePostdata).then(function(resp){
				  if(resp.status == 200 && resp.data.Status) {
					  handelSharedInfo(resp.data);
				  }
			 });
		 }
		 
		 function ok() {
			 vm.isFormSubmiting = true;
			 var postdata = preparePostdata();
			 if (postdata && !_.isEmpty(sharePostdata)) {
				 inviteUsersToTaskSpace();
			 }
		 }
		  
	 	  function permsEdited() {
			  if(vm.sharedWithModel) {
				  vm.permChanged = false;
				  _.each(vm.sharedWithModel, function(colbrtr){
					  var originalCollaborator = _.findWhere(vm.sharedWith,{userId : colbrtr.userId});
					  if(!_.isEqual(colbrtr.permissions, originalCollaborator.permissions) 
							  || !_.isEqual(colbrtr.propagateShare, originalCollaborator.propagateShare)) {
						  vm.permChanged = true;
						  permChangedObjects.push(colbrtr);
						  return;
					  }  else {
						  permChangedObjects = _.reject(permChangedObjects, function(permChangedObject){ 
							  return permChangedObject.userId == colbrtr.userId; 
						  });
					  }
				  }); 
			  }
		  }
		  
		  function isLoggedInUser(user) {
			  var status = false;
			  if(!_.isEmpty(vm.loggedInUser) && !_.isEmpty(user) && vm.loggedInUser.toLowerCase() == user.toLowerCase()) {
				  status = true;
			  }
			  return status;
		  }
		  
		  function isTsSharable(ts) {
			  return TaskSpaceService.isTsSharable(ts,vm.loggedInUser);
		  }
		  
		  function disableSharableForManaged (colbrtr) {
			  var status = false;
			  if(!_.isEmpty(colbrtr.permissions) && (colbrtr.permissions.toLowerCase() == "view" || colbrtr.permissions.toLowerCase() == "readonly")) {
				  colbrtr.propagateShare = false;
				  status = true;
			  } else if(!_.isEmpty(vm.loggedInUser) && !_.isEmpty(colbrtr.userId) && vm.loggedInUser.toLowerCase() == colbrtr.userId.toLowerCase()) {
				  status = true;
			  }
			  return status;
		  }
		  
		  function showTransferTSOwnershipBtn() {
			  var status = false;
			  if(!_.isEmpty(vm.items)) {
					var permissions = [];
					_.each(vm.items,function(item,index) {
						permissions.push(item.permissions);
					});
			  }
			  var nonOwnedItem = _.findWhere(permissions,{'owner': false});
			  if(!appdata.IsSharedOrganization && !vm.permChanged && !nonOwnedItem && vm.items.length == 1) {
				  status = true;
			  }
			  return status;
		  }
		  
		  function transferTSOwnership() {
			  var modalInstance = $uibModal.open({
				  animation: $scope.animationsEnabled,
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
			    		  return {"type" : "Taskspace"}
			    	  }
			      }
			  });
			  modalInstance.result.then(function (status) {
				  if(status) {
					  $uibModalInstance.close({"status" : "Ownership Transferred"});
				  } 
			  }, function () {
			      
			  });
		  }
		  
		  getPermissionSet();
		  
	}
	
})();