;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('NewTaskSpaceController',NewTaskSpaceController);
	
	NewTaskSpaceController.$inject = ['$rootScope','$scope','appData','$uibModalInstance','_','userService','DocFactory','SecFilingService','TaskSpaceService','MessageService','$uibModal'];

	function NewTaskSpaceController($rootScope,$scope,appData,$uibModalInstance,_,userService,DocFactory,SecFilingService,TaskSpaceService,MessageService,$uibModal) {
		var appdata = appData.getAppData();
		var vm = this;
		var taskspace = {};
		var sharePostdata = {};
		var taskspaceSharedUserList = [];
		var sharedObjectsList = [];
		var results = {};
		
		vm.taskSpaceName;
		vm.companiesList = [];
		vm.selectedTicker = {'tickerObj':null} ;
		vm.folderHierarchy = [];
		vm.selectedDefaultFolder = {"id" : ""};
		vm.user_ShareObjAcrossOrg = (appdata.UserSettings && appdata.UserSettings.user_ShareObjAcrossOrg && appdata.UserSettings.user_ShareObjAcrossOrg == "Yes") ? "Yes" : "No";
		vm.user_AllowShareToGuestUser = (appdata.UserSettings && appdata.UserSettings.user_AllowShareToGuestUser && appdata.UserSettings.user_AllowShareToGuestUser == "Yes") ? "Yes" : "No";
		vm.user_GenerativeAI = (appdata.UserSettings && appdata.UserSettings.user_GenerativeAI && appdata.UserSettings.user_GenerativeAI == "Yes") ? true : false;
		vm.userPerms = {};
		vm.userPerms.users = [];
		vm.userPerms.grantedPerms = [];
		vm.sharePropagateLable = "Sharable";
		vm.Users=[];
		vm.permSet;
		vm.propagateShare = false;
		vm.isAutoSummarize = false;
		vm.disablePropagateShare = false;
		vm.autoSummarizeOptionsList = angular.copy(TaskSpaceService.autoSummarizeOptions);
		vm.autoSummarizeOption = vm.autoSummarizeOptionsList[1];
		 
		vm.getSuggestedName = getSuggestedName;
		vm.showTickersFilter = showTickersFilter;
		vm.refreshTickers = refreshTickers;
		vm.clear = clear;
		vm.removeDefaultFolder = removeDefaultFolder;
		vm.browseFolders = browseFolders;
		vm.tagTransform = tagTransform;
		vm.getSelectedUserName = getSelectedUserName;
		vm.selectPerms = selectPerms;
		vm.isTaskspaceSharing = isTaskspaceSharing;
		vm.onChangeAutoSummarize = onChangeAutoSummarize;
		vm.cancel = cancel;
		vm.ok = ok;
				
		function tagTransform(tagname) {
			 var item = {}; 	
			 return item = {
			  		"loginId":tagname,
			  		"firstName" : tagname,
			  		"lastName" : "",
			  		"isNew" : true
			  	};
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
		 
		 function selectPerms (selected){
			 if(selected.toLowerCase() == "edit") {
				 vm.propagateShare = true;
				 vm.disablePropagateShare = true;
			 } else if(selected.toLowerCase() == "view" || selected.toLowerCase() == "readonly") {
				 vm.propagateShare = false;
				 vm.disablePropagateShare = false;
			 }
		 }
		 
		 function isTaskspaceSharing() {
			 var status = false;
			 if(!_.isEmpty(vm.userPerms.users)) {
				 status = true;
			 }
			 return status;
		 }
		 
		 function getSuggestedName () {
			var suggestedName = vm.taskSpaceName;
			
			if(vm.selectedTicker.tickerObj && vm.selectedTicker.tickerObj.ticker && vm.selectedTicker.tickerObj.ticker != null && vm.selectedTicker.tickerObj.ticker != "") {
				suggestedName = vm.selectedTicker.tickerObj.ticker+" - ";
				
				if(vm.taskSpaceName) {
					suggestedName += vm.taskSpaceName;
				}
			}
			return suggestedName;
			
		 }
		
		function showTickersFilter() {
			var status = false;
			appdata = appData.getAppData();
			if(appdata && appdata.UserSettings && appdata.UserSettings.contentAccess_FinancialAnalyst == "Yes") {
				status = true;
			}
			return status;
		}
			
		function refreshTickers(searchKey) {
			 if(!_.isEmpty(searchKey)) {
				 SecFilingService.getCompaniesList({"searchTxt":searchKey}).then(function(resp){
					 if(resp.status == 200 && resp.data.Status) {
						vm.companiesList = resp.data.Company;
					 }
				 });
			 }
		}
		
		function onChangeAutoSummarize () {
			vm.isAutoSummarize = !vm.isAutoSummarize;
		}
		
		function clear($event) {
			if($event) {
				$event.stopPropagation(); 
			}
		    vm.selectedTicker.tickerObj = null;
		}
		
		function getHierarchy() {
			if(!_.isEmpty(vm.selectedDefaultFolder.id)) {
				DocFactory.getDocHierarchy(vm.selectedDefaultFolder.id,function(docHierarchy) {
					vm.folderHierarchy = docHierarchy;
				});
  		  	}
		}
		
		function removeDefaultFolder() {
			vm.selectedDefaultFolder.id = null;
			vm.folderHierarchy = [];
		}
		
		function browseFolders(size) {
			var modalInstance = $uibModal.open({
			      animation: $scope.animationsEnabled,
			      templateUrl: 'app/components/BrowseFileOrFolder/BrowseFileOrFolder.html',
			      controller: 'BrowseFileOrFolderController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'vm',
			      backdrop: 'static',
			      size: size,
			      resolve: {
			    	  resources : function () {
			    		  return {
			    			  "source" : undefined,
			    			  "folderId" :  !_.isEmpty(vm.selectedDefaultFolder.id) ? vm.selectedDefaultFolder.id : "",
			    			  "btnLable" : "SELECT",
			    			  "action" : "Browse For TS Default",
			    			  "enableAction" : "Folder",
			    			  "disableDocuments" : true,
			    			  "validateFolderPerms" : true,
			    			  "supportMultiSelectDoc" : false,
			    			  "supportMultiSelectFolder" : false,
			    			  "showAddFolder" : true,
			    			  "showNewDoc" : false,
			    			  "showUploadDoc" : false
			    		  };
			    	  },
			    	  foldersList : function() {
			    		  var folderList = [];
			    		  if(!_.isEmpty(vm.selectedDefaultFolder.id)) {
			    			  folderList = DocFactory.getDocsUnderFolder(vm.selectedDefaultFolder.id);
			    		  } else {
			    			  folderList = DocFactory.getDocsUnderFolder(appdata.rootFolder.id);
			    		  }
			    		  return folderList;
			    	  }
			      }
			});
			modalInstance.result.then(function (data) {
				vm.selectedDefaultFolder.id = data.moveTo.id;
				if(data.moveTo.isLink) {
					vm.selectedDefaultFolder.id = data.moveTo.linkSourceFolderId;
				}
				getHierarchy();
			}, function () {
			      
			});
		}
		
		function cancel() {
			$uibModalInstance.dismiss('cancel');
		}
		
		function prepareSharePostdata() {
			var objectList = [];
			var usersList = {};
			var obj = {
				      "objectType": "Taskspace",
				      "objectId": taskspace.id,
				      "clientId": taskspace.clientId
				    };
			objectList.push(obj); 
			sharePostdata["objectList"] = objectList;
			 
			for(var i=0;i<vm.userPerms.users.length;i++) {
				usersList[vm.userPerms.users[i]] = {
						 "permissions" : vm.userPerms.grantedPerms[0],
						 "propagateShare" : vm.propagateShare
				};
			}
			sharePostdata["userList"] = usersList;
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
						 usersList[selectedUsers[i].loginId] = {
								  "permissions" : vm.userPerms.grantedPerms[0],
								  "propagateShare" : vm.propagateShare
						  };
					 }
					 sharePostdata["userList"] = usersList;
					 sharePostdata["targetOrg"] = obj.targetOrg;
					 inviteGuestUsersToTaskSpace();
				 } 
			 }, function () {
				 if(!_.isEmpty(sharedObjectsList)) {
					 processSharedObjectsList();
				 }
				 results = {};
				 results["taskspace"] = taskspace;
				 results["sharedObjectsList"] = sharedObjectsList;
				 $uibModalInstance.close(results);
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
				 if (action === "CanNotShareToNonNumiciUsers"){
					 handelSharedInfo();
				 }
			 }, function () {
				 $uibModalInstance.dismiss('cancel');
			 });
		 }
		
		function processSharedObjectsList() {
			 var isSharedTrue = _.where(sharedObjectsList,{"isInvited" : true});
			 if(isSharedTrue) {
				 taskspace.collaborators = [];
				 for(var i=0;i<vm.userPerms.users.length;i++) {
					 var data = {};
					 var isUserExist = _.findWhere(taskspace.collaborators,{"userId" : vm.userPerms.users[i]});
					 if(isUserExist) {
						 taskspace.collaborators = _.reject(taskspace.collaborators,{"userId" : vm.userPerms.users[i]});
					 }
					 data.userId = vm.userPerms.users[i];
					 data.permissions = vm.userPerms.grantedPerms[0];
					 data.propagateShare = vm.propagateShare;
					 taskspace.collaborators.push(data);
				 }
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
					 confirmGuestUserShare(nonNumiciUsers,"GuestUserSahre");
				 }  else if(!_.isEmpty(canNotShareNonNumiciUsers)) {
					 var nonNumiciUsers = [];
					 for(var i=0;i<canNotShareNonNumiciUsers.length;i++) {
						 var user = {
								  	"loginId" : canNotShareNonNumiciUsers[i],
								  	"selected" : false
								 };
						 nonNumiciUsers.push(user);
					 }
					 confirmShare(nonNumiciUsers,"CanNotShareToNonNumiciUsers");
				 } else if(!_.isEmpty(sharedObjectsList)) {
					 processSharedObjectsList();
					 results = {};
					 results["taskspace"] = taskspace;
					 results["sharedObjectsList"] = sharedObjectsList;
					 $uibModalInstance.close(results);
				 }
			 } else {
				 if(!_.isEmpty(sharedObjectsList)) {
					 processSharedObjectsList();
					 results = {};
					 results["taskspace"] = taskspace;
					 results["sharedObjectsList"] = sharedObjectsList;
					 $uibModalInstance.close(results);
				 }
				 results = {};
				 results["taskspace"] = taskspace;
				 $uibModalInstance.close(results);
			 }
		}
		
		function inviteUsersToTaskSpace() {
			 TaskSpaceService.inviteToTaskSpaceList(sharePostdata).then(function(resp){
				  if(resp.status == 200 && resp.data.Status) {
					  handelSharedInfo(resp.data);
				  }
			 });
		}
		
		function shareTaskspace() {
			prepareSharePostdata();
			if(!_.isEmpty(sharePostdata)) {
				inviteUsersToTaskSpace();
			}
		}
		
		function createNewTaskSpace(postdata) {
			TaskSpaceService.newTaskSpace(postdata).then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					taskspace = resp.data.Taskspace;
					if(!_.isEmpty(taskspace)) {
						if(isTaskspaceSharing()) {
							shareTaskspace(taskspace)
						} else {
							results = {};
							results["taskspace"] = taskspace;
							$uibModalInstance.close(results);
						}
					} else {
						MessageService.showErrorMessage("DEFAULT_ERROR_MSG");
					}
				}
			});
		}
		
		function ok() {
			var postdata = {};
			if(vm.taskSpaceName) {
				postdata["name"] = vm.taskSpaceName;
			}
			if(vm.selectedTicker.tickerObj) {
				postdata["tickers"] = [vm.selectedTicker.tickerObj.ticker];
			}
			if(vm.selectedDefaultFolder.id) {
				postdata["defaultFolderId"] = vm.selectedDefaultFolder.id;
			}
			if(!_.isEmpty(vm.taskSpaceName)) {
				createNewTaskSpace(postdata);
			}
			postdata["autoSummarize"] = vm.isAutoSummarize;
			if(vm.isAutoSummarize) {
				postdata["autoSummarizeUsing"] = vm.autoSummarizeOption.name;
			} else {
				postdata["autoSummarizeUsing"] = null;
			}
		}
		
		userService.getAllUsersIncludeOtherOrgSharedUsers().then(function(resp) {
			 if(resp.status == 200 && resp.data.Status) {
				 vm.Users = resp.data.Users;
				 for(var i=0;i<vm.Users.length;i++) {
					 vm.Users[i].hasPermission = false;
				 }
			 }
		});
		
		function getPermissionSet() {
			if(!_.isEmpty($rootScope.permissions)&& !_.isEmpty($rootScope.permissions["Taskspace"])) {
				 vm.permSet = $rootScope.permissions["Taskspace"];
				 vm.userPerms.grantedPerms = [vm.permSet[0].name];
			}
		}
		getPermissionSet();
	}
})();