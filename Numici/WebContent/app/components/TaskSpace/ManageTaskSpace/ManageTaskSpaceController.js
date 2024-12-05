;(function() {
	'use strict';
	
	angular.module("vdvcApp").directive('taskspaceCard', ['$document',function($document) {
		return {
			restrict: 'A',
			templateUrl: 'app/components/TaskSpace/ManageTaskSpace/taskSpaceTemplate.html'
		};
	}]);
	
})();


;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('ManageTaskSpaceController',ManageTaskSpaceController);
	
	ManageTaskSpaceController.$inject = ['$scope','$state','$stateParams','$uibModal','_','TaskSpaceService','AdvSearchService','appData','MessageService',
		'TagService','userService','$confirm','$deviceInfo'];

	function ManageTaskSpaceController($scope,$state,$stateParams,$uibModal,_,TaskSpaceService,AdvSearchService,appData,MessageService,
			TagService,userService,$confirm,$deviceInfo) {
		var vm = this;
		var appdata = appData.getAppData();
		var taskspaceView_NewTaskspace;
		var taskspaceView_NewSection;
		$scope.$emit("PageName",{"userName":appdata.UserName,"pageName":$state.current.pageName});
		
		vm.deviceInfo = $deviceInfo;
		vm.view = userService.getUiState("taskspaceview").stateValue;
		vm.taskSpacesListHeaders = TaskSpaceService.TaskSpaceListHeaders;
		vm.taskSpacesList = [];
		vm.taskspaceField =  userService.getUiState("taskspacesort").stateValue.field;
	    vm.taskspaceFieldDecending = userService.getUiState("taskspacesort").stateValue.decending;
	    vm.actionProps = TaskSpaceService.actionProps;
	    vm.checkedItems = [];
	    vm.existedTaskspaces = [];
	    
		vm.isEnabled = isEnabled;
		vm.switchView = switchView;
		vm.newTaskSpace = newTaskSpace;
		vm.isNewTaskSpaceHidden = isNewTaskSpaceHidden;
		vm.isNewTaskSpaceDisable = isNewTaskSpaceDisable;
		vm.getAllTaskSpaces = getAllTaskSpaces;
		vm.unTag = unTag;
		vm.selectTaskSpace = selectTaskSpace;
		vm.onLongPress = onLongPress;
		vm.showGridCheckbox = showGridCheckbox;
		vm.unselectAll = unselectAll;
		vm.executeTSAction = executeTSAction;
		vm.gotoTaskSpace = gotoTaskSpace;
		vm.selectColumn = selectColumn;
		vm.sortByfield = sortByfield;
		vm.CloseManageTaskSpace = CloseManageTaskSpace;
		
		
		//Scope event listioners 
		if(appdata.UserSettings && appdata.UserSettings.taskspaceView_NewTaskspace) {
			taskspaceView_NewTaskspace = appdata.UserSettings.taskspaceView_NewTaskspace;
		}
		
		if(appdata.UserSettings && appdata.UserSettings.taskspaceView_NewSection) {
			taskspaceView_NewSection = appdata.UserSettings.taskspaceView_NewSection;
		}
		
		$scope.$on('UNSHARED',function(event,msg) {
			handleUnshare(msg);
		});
		
		function init() {
			if($stateParams.action && $stateParams.action === "new") {
				newTaskSpace();
			}
		}
		
		function handleUnshare(msg) {
			vm.taskSpacesList

			var tsObj = _.findWhere(vm.taskSpacesList,{"id" : msg.taskspaceId});
			if(tsObj) {
				var text = msg.userId+' Unshared the taskspace "'+tsObj.name+'"';
				$confirm({text:text}, {
					templateUrl: 'app/components/common/CustomeTemplates/confirmTemplate.html',
					backdrop: 'static'
				})['finally'](function(){
					var index = _.findIndex(vm.taskSpacesList, {"id" : tsObj.id});
					if(index >= 0) {
						vm.taskSpacesList.splice(index,1);
					}
				});
			}
		}
		
		function isEnabled(btn) {
	    	var status = false;
	    	if(appdata["VDVCDocButtons"]) {
	    		var btnConfig = _.findWhere(appdata["VDVCDocButtons"],{"key": btn});
	    		if(btnConfig && btnConfig.value == "Enabled") {
	    			status = true;
	    		}
	    	}
	    	return status;
	    }
		
		function switchView() {
			vm.view = (vm.view == 'Grid' )? 'List' : 'Grid';
			userService.setUiState("taskspaceview",vm.view);
		}
		
		function handleShareAtCreateCB(resultedTs,sharedInfo) {
			var isSharedFalse = _.findWhere(sharedInfo,{"isInvited" : false});
			if(isSharedFalse) {
				var NoPermOnObjectList = _.where(sharedInfo,{"Reason" : "Insufficient privileges"});
				var ObjectNotFoundList = _.where(sharedInfo,{"Reason":"Invalid taskspace"});
				var NoReasonObjectList = _.where(sharedInfo,{"Reason" : null});
				
				if(!_.isEmpty(NoPermOnObjectList)) {
					MessageService.showErrorMessage("SHARE_ITEMS_ERR");
				} else if(!_.isEmpty(NoReasonObjectList)) {
					MessageService.showErrorMessage("DEFAULT_ERROR_MSG");
				} else {
					MessageService.showErrorMessage("BACKEND_ERR_MSG",[isSharedFalse.reason]);
				}
			} else {
				MessageService.showSuccessMessage("TS_CREATE_N_SHARE",[resultedTs.name]);
			}
		}
		
		function newTaskSpace() {
			var modalInstance = $uibModal.open({
			      animation: true,
			      templateUrl: 'app/components/TaskSpace/NewTaskSpace/newTaskSpace.html',
			      controller: 'NewTaskSpaceController',
			      appendTo : $('.rootContainer'),
			      backdrop: 'static',
			      controllerAs: 'vm'
			    });
			
			modalInstance.result.then(function (results) {
				vm.taskSpacesList.push(results.taskspace);
				if(!_.isEmpty(results.sharedObjectsList)) {
					handleShareAtCreateCB(results.taskspace,results.sharedObjectsList);
				} else {
					MessageService.showSuccessMessage("TASKSPACE_CREATE",[results.taskspace.name]);
				}
			});
		}
		
		function isNewTaskSpaceHidden() {
			var status = false;
			if(taskspaceView_NewTaskspace == "Hidden") {
				status = true;
			}
			return status;
		}
		
		function isNewTaskSpaceDisable() {
			var status = false;
			if(taskspaceView_NewTaskspace == "Disable") {
				status = true;
			}
			return status;
		} 
		
		function getAllTaskSpaces() {
			TaskSpaceService.getAllTaskSpaces().then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					vm.taskSpacesList = resp.data.Taskspaces;
				}
			});
		}
				
		function CloseManageTaskSpace() {
			$state.go('taskspace.list');
		}
		
		function hideAllTSActions() {
			_.each(vm.actionProps,function(item,key) {
				item.show = false;
			});
    	}
		
		function showAllTSActions() {
			_.each(vm.actionProps,function(item,key) {
				item.show = true;
			});
    	}
		
		function onLongPress(obj) {
			if(obj.selected) {
				obj.selected = false;
			} else {
				obj.selected = true;
			}
			selectTaskSpace(obj);
		}
		
		function selectTaskSpace(obj) {
			hideAllTSActions();
			if(obj.selected) {
				vm.checkedItems.push(obj);
			} else {
				vm.checkedItems = _.without(vm.checkedItems, _.findWhere(vm.checkedItems, {id: obj.id }));
			}
			
			if(vm.checkedItems.length == 1 && vm.checkedItems[0].permissions.owner && vm.actionProps.Rename) {
				vm.actionProps.Rename.show = true;
			} 
			
			if(vm.checkedItems.length > 0) {
				
				var permissions = [];
				_.each(vm.checkedItems,function(item,index) {
					permissions.push(item.permissions);
				});
				
				var invitePerm = _.findWhere(permissions,{'invite': false});
				var viewPerm = _.findWhere(permissions,{'view': false});
				var deletePerm = _.findWhere(permissions,{'delete': false});
				var copyPerm = _.findWhere(permissions,{'copy': false});
				var editPerm = _.findWhere(permissions,{'edit': false});
				var ownerPerm = _.findWhere(permissions,{'owner': false});
				
				if(!invitePerm && !editPerm && vm.actionProps.Invite) {
					vm.actionProps.Invite.show = true;
				}
				if(!ownerPerm ) {
					if(vm.actionProps.Properties) {
						vm.actionProps.Properties.show = true;
					}
					if(vm.actionProps.Copy) {
						vm.actionProps.Copy.show = true;
					}
				}
				if(!viewPerm && vm.actionProps.Tag) {
					vm.actionProps.Tag.show = true;
				}
				if(!deletePerm && vm.actionProps.Delete) {
					vm.actionProps.Delete.show = true;
				}
			} 
		}
		
		function unselectAll($event) {
			if($event) {
				$event.stopPropagation();
			}
			
			_.each(vm.checkedItems,function(item,index) {
				item.selected = false;
			});
			hideAllTSActions();
			vm.checkedItems = [];
		 }
		
		 function showGridCheckbox(){
	    	var status = false;
	    	if(vm.checkedItems.length > 0 ) {
	    		status = true;
	    	}
	    	return status;
	     }
		 
		 function openTaskSpace(taskSpace,cb) {
			TaskSpaceService.openTaskSpace(taskSpace.clientId,taskSpace.id).then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					if(typeof cb == "function") {
						cb(taskSpace);
					}
				}
			});
		 }
			
		function setCurrent(ts,cb) {
			TaskSpaceService.setCurrent(ts.clientId,ts.id).then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					if(typeof cb == "function") {
						cb(ts);
					}
				}
			});
		}
			
		 function gotoTaskSpace(taskSpace,event) {
	    	if(event) {
	    		event.stopPropagation();
	    	}
	    	if(!vm.showGridCheckbox()) {
	    		//$state.go("taskspace.list",{"taskSpaceId":taskSpace.id});
	    		openTaskSpace(taskSpace,function(ts){
	    			setCurrent(ts,function(){
	    				$state.go("taskspace.list");
	    			});
	    		});
		    } else {
		    	taskSpace.selected = !taskSpace.selected;
				vm.selectTaskSpace(taskSpace);
			}	
		 }
		 
		function selectColumn(hdr){
			var selectedColumns = _.where(vm.taskSpacesListHeaders,{"checked" : true});
			 if(hdr.checked) {
				 if(!_.isEmpty(selectedColumns) && selectedColumns.length > 1) {
					 var firstSelected = _.findWhere(vm.taskSpacesListHeaders,{"label" : hdr.label});
					 if(firstSelected) {
						 firstSelected.checked = false;
					 }
				 }
			 } else {
				 if(!_.isEmpty(selectedColumns) && selectedColumns.length >= 3){
					 var firstSelected = _.findWhere(vm.taskSpacesListHeaders,{"checked" : true});
					 if(firstSelected) {
						 firstSelected.checked = false;
					 }
				 }
				 var newlySelected = _.findWhere(vm.taskSpacesListHeaders,{"label" : hdr.label});
				 if(newlySelected) {
					 newlySelected.checked = true;
				 }
			}
			 
		}
		 
		 function handleShareCB(sharedInfo,items) {
				var isSharedFalse = _.findWhere(sharedInfo,{"isInvited" : false});
				var isSharedTrue = _.where(sharedInfo,{"isInvited" : true});
				if(!_.isEmpty(isSharedTrue)) {
					_.each(isSharedTrue,function(source,index) {
						var item = _.findWhere(items,{"id":source.id});
						vm.checkedItems = _.reject(vm.checkedItems, function(taskspace){
							return taskspace.id == source.id;
						});
						item.selected = false;
					});
				}
				
				if(isSharedFalse) {
					var NoPermOnObjectList = _.where(sharedInfo,{"Reason" : "Insufficient privileges"});
					var ObjectNotFoundList = _.where(sharedInfo,{"Reason":"Invalid taskspace"});
					var NoReasonObjectList = _.where(sharedInfo,{"Reason" : null});
					
					if(!_.isEmpty(NoPermOnObjectList)) {
						MessageService.showErrorMessage("SHARE_ITEMS_ERR");
					} else if(!_.isEmpty(NoReasonObjectList)) {
						MessageService.showErrorMessage("DEFAULT_ERROR_MSG");
					} else {
						MessageService.showErrorMessage("BACKEND_ERR_MSG",[isSharedFalse.reason]);
					}
					
				} else if(!_.isEmpty(isSharedTrue)){
					vm.checkedItems = [];
					hideAllTSActions();
					MessageService.showSuccessMessage("SHARE_ITEMS");
				}
		 }
		 
		 function OpenShareTSModal(items,size) {
			 var modalInstance = $uibModal.open({
				  animation: true,
				  appendTo: $('.rootContainer'),
			      templateUrl: 'app/components/TaskSpace/ShareTaskSpace/shareTaskSpaceModal.html',
			      controller: 'ShareTSController',
			      controllerAs: 'vm',
			      size: size,
			      backdrop: 'static',
			      resolve: {
			    	  items : function() {
			    		  return items;
			    	  }
			      }
			 });
			 modalInstance.result.then(function (sharedInfo) {
				 handleShareCB(sharedInfo,items); 
			 });
		 }
		 
		 function OpenShareModalFromNav() {
		    	if(vm.checkedItems.length > 0) {
		    		OpenShareTSModal(vm.checkedItems);
		    	}
		 }
		 
		 function processItems(items) {
			 var processedItems = [];
			 _.each(items,function(item,index) {
				 var obj = {};
				 obj["Type"] = "Taskspace";
				 obj["TopObjectId"] = item.id;
				 obj["TopObjectClientId"] = item.clientId;
				 processedItems.push(obj);
			 });
			 return processedItems;
		 }
		
		 function saveTag(items,tags) {
			var postdata = {};
			postdata["Tags"] = tags;
			postdata["Items"] = processItems(items);
			
			TagService.tagItems(postdata).then(function(response) {
				if (response.status == 200 && response.data.Status) {
					_.each(items,function(item,idx) {
						item.selected = false;
						TagService.getItemTagsById(item);
					});
					hideAllTSActions();
					vm.checkedItems = [];
				}
			});
		 }
		 
		 function unTag(tag,item,$event) {
			$event.preventDefault();
		    $event.stopPropagation();
		    if(tag) {
				var text = "Are you sure you want to delete Tag "+tag.TagName+" ?";
	  			$confirm({text: text})
		        .then(function() {
		        	TagService.unTag(tag,item).then(function(response){
						if (response.status == 200) {
							TagService.getItemTagsById(item);
						}
					});
			    }, function() {
			    	
			    });
			}
		 }
		
		 function OpenAddTSTagModal(item,size) {
			if(!angular.isArray(item)) {
				item = [item];
			}
			var modalInstance = $uibModal.open({
			      animation: $scope.animationsEnabled,
			      templateUrl: 'app/components/Documents/TagDocuments/addTagModal.html',
			      controller: 'TagDocumentsController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'vm',
			      size: size,
			      resolve: {
			    	  item : function() {
			    		  return item;
			    	  },
			    	  userinfo : function() {
			    		  return $scope.userinfo;
			    	  }
			      }
			    });
			
			modalInstance.result.then(function (obj) {
				saveTag(obj.items,obj.tags);
			});
		 }
		 
		 function OpenAddTagModalFromNav() {
			 if(vm.checkedItems.length > 0) {
	    		 OpenAddTSTagModal(vm.checkedItems);
	    	 }
		 }
		 
		 function RenameTS(ts){
			var postdata = {
				"id" : ts.id,
				"clientId" : ts.clientId
			};
			postdata.name = ts.name;
			TaskSpaceService.renameTaskSpace(postdata).then(function(response){
				if (response.status == 200 && response.data.Status) {
					var orgTS = _.findWhere(vm.taskSpacesList,{"id":ts.id});
					if(orgTS) {
						orgTS.name = ts.name;
						orgTS.selected = false;
						hideAllTSActions();
						vm.checkedItems = [];
						MessageService.showSuccessMessage("TASKSPACE_RENAME");
					}
				}
			});
			
		 }
	 
	 	 function OpenRenameTSModal (ts,size) {
	 		ts._type = "Taskspace";
			var modalInstance = $uibModal.open({
			      animation: $scope.animationsEnabled,
			      templateUrl: 'app/components/Documents/Rename/renameDoc.html',
			      controller: 'RenameDocController',
			      appendTo : $('.rootContainer'),
			      controllerAs : 'vm',
			      size: size,
			      resolve: {
			    	 doc : function() {
			    		 return ts;
			    	 }
			      }
			    });
			modalInstance.result.then(function (renamedTS) {
				RenameTS(renamedTS);
			});
 		 }
		 
		 function OpenRenameModalFromNav() {
	    	if(vm.checkedItems.length == 1) {
	    		OpenRenameTSModal(vm.checkedItems[0]);
	    	}
	     }
		 
		 function removeForceDeleteFlag () {
			 if(!_.isEmpty(vm.checkedItems)) {
					_.each(vm.checkedItems,function(item) {
						delete item["forceDelete"];
					});
				} 
		 }
		 
		 function handleMoveToTrashCB(items) {
			removeForceDeleteFlag();
			var isDeletedFalse = _.findWhere(items,{"isDeleted" : false});
			var isDeletedTrue = _.where(items,{"isDeleted" : true});
			if(isDeletedTrue) {
				_.each(isDeletedTrue,function(source,index) {
					vm.taskSpacesList = _.reject(vm.taskSpacesList, function(taskspace){ 
		    			return taskspace.id == source.id; 
		    		});
					vm.checkedItems = _.reject(vm.checkedItems, function(item){ 
		    			return item.id == source.id; 
		    		});
				});
			}
			if(isDeletedFalse) {
				var NoPermOnObjectList = _.where(items,{"Reason" : "Insufficient privileges"});
				var ObjectNotFoundList = _.where(items,{"Reason":"Invalid taskspace"});
				if(!_.isEmpty(NoPermOnObjectList)) {
					MessageService.showErrorMessage("DELETE_ITEMS_ERR");
				} else {
					MessageService.showErrorMessage("BACKEND_ERR_MSG",[isDeletedFalse.reason]);
				}
			} else {
				if(!_.isEmpty(vm.checkedItems)) {
					_.each(vm.checkedItems,function(item) {
						if(item.selected) {
							item.selected = false;
						}
					});
				}
				vm.checkedItems = [];
				hideAllTSActions();
				MessageService.showSuccessMessage("DELETE_ITEMS");
			}
		}
			
		function moveToTrash(items) {
			var postdata = {};
        	var itemList = [];
        	
        	_.each(items,function(item,index) {
        		var ts = {
        			id : item.id,
        			clientId : item.clientId
        		};
        		if(item.forceDelete) {
        			ts.status = "forceDelete";
        		}
        		itemList.push(ts);
        	});
        	
        	postdata = itemList;
        	TaskSpaceService.deleteTaskSpace(postdata).then(function(result){
				if (result.status==200 && result.data.Status) {
					handleMoveToTrashCB(result.data.Results);
				}
			});
		}
		
		function OpenConfirmDeleteTsModal(results,items) {
			var modalInstance = $uibModal.open({
			      animation: $scope.animationsEnabled,
			      templateUrl: 'app/components/TaskSpace/ManageTaskSpace/TSDeleteConfirmation/TSDeleteConfirmationModal.html',
			      controller: 'TSDeleteConfirmationController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'tsdcc',
			      backdrop: 'static',
			      size : 'md',
			      resolve: {
			    	  existedTaskspaces : function() {
			    		  return vm.existedTaskspaces;
			    	  },
			    	  selectedTaskspaces : function() {
			    		  return items;
			    	  }
			      }
			});
			modalInstance.result.then(function (obj) {
				if(obj.action === "skip") {
					items = _.reject(items, function(item){ 
						var existedTs = _.findWhere(vm.existedTaskspaces,{taskspaceId : item.id});
						if(existedTs && !item.forceDelete) {
							return true;
						}
		    		});
				} else if(obj.action === "remove") {
					items = _.reject(items, function(item){ 
						var existedTs = _.findWhere(vm.existedTaskspaces,{taskspaceId : item.id});
						if(existedTs && !item.forceDelete) {
							return true;
						} else {
							return false;
						}
		    		});
				}
				moveToTrash(items);
			}, function () {
				removeForceDeleteFlag();
			});
		}
		
		function checkIsExistAndDelete(results,items) {
			vm.existedTaskspaces = [];
		   _.each(results,function(result) {
			   if((result.savedSearches && !_.isEmpty(result.savedSearches)) || 
					   (result.slackConfig && !_.isEmpty(result.slackConfig))) {
				   vm.existedTaskspaces.push(result);
			   }
	       });
		   if(vm.existedTaskspaces.length > 0){
				OpenConfirmDeleteTsModal(results,items); 
		   } else if(items.length > 0){
			   moveToTrash(items);
		   }
		}
		
		function checkTSBeforeDelete(items) {
			var postdata = {};
        	var itemList = [];
        	
        	_.each(items,function(item,index) {
        		itemList.push(item.id);
        	});
        	
        	postdata["taskspaceIds"] = itemList;
        	
        	TaskSpaceService.checkTSBeforeDelete(postdata).then(function(result){
				if (result.status==200 && result.data.Status) {
					checkIsExistAndDelete(result.data.Search,items);
				}
			});
		}
		
		function deleteItems(items) { 
			var txt = 'Are you sure you want to delete selected items ?';
			
			$confirm({text: txt}).then(function() {
				checkTSBeforeDelete(items);
	        }, function () {
				$('body').removeClass('modal-open');
			});
		}
			
		function deleteFromNav() {
	    	if(vm.checkedItems.length>0) {
	    		deleteItems(vm.checkedItems);
	    	}
	    }
	     
	    function handlePropertiesCB(items,data) {
			var isUpdatedFalse = _.findWhere(items,{"isUpdated" : false});
			var isUpdatedTrue = _.where(items,{"isUpdated" : true});
			
			if(isUpdatedTrue) {
				var count = 0;
				_.each(data.original,function(source,index) {
					if(data.modified[count].name) {
						source.name=data.modified[count].name;
					}
					if(data.modified[count].defaultFolderId) {
						source.defaultFolderId=data.modified[count].defaultFolderId;
					}
					if(data.modified[count].tickers) {
						source.tickers=data.modified[count].tickers;
					}
					source.selected = false;
					vm.checkedItems = _.reject(vm.checkedItems, function(doc){ 
		    			return doc.id == source.id; 
		    		});
					count++;
				});
				count = 0;
			}
			
			if(isUpdatedFalse) {
				var NoPermOnObjectList = _.where(items,{"Reason" : "Insufficient privileges"});
				var ObjectNotFoundList = _.where(items,{"Reason":"Invalid taskspace"});
				
				if(NoPermOnObjectList) {
					MessageService.showErrorMessage("EDIT_PROPERTIES_ERR");
				}
				
			} else {
				vm.checkedItems = [];
				hideAllTSActions();
				MessageService.showSuccessMessage("EDIT_PROPERTIES");
			}
						 
     	 }
     	 
		 function OpenPropertiesModal (source,size) {
			var modalInstance = $uibModal.open({
			      animation: $scope.animationsEnabled,
			      templateUrl: 'app/components/TaskSpace/EditTSProperties/editTSProperties.html',
			      controller: 'TSPropertiesController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'vm',
			      size: size,
			      resolve: {
			    	  source : function() {
			    		  return source;
			    	  }
			      }
			    });
			
			modalInstance.result.then(function (data) {
				TaskSpaceService.updateTSProperties(data.modified).then(function(resp) {
					 if(resp.status == 200 && resp.data.Status) {
						 handlePropertiesCB(resp.data.Results,data);
					 }
				 });
			});
		 }
     
		 function OpenPropertiesModalFromNav() {
	    	if(vm.checkedItems.length > 0) {
	    		OpenPropertiesModal(vm.checkedItems);
	    	}
    	 }
    	 
		 function executeTSAction(TSAction) {
	    	
	    	switch(TSAction) {
		    	case "Invite":
		    		OpenShareModalFromNav();
		    		break;
		    	case "Tag":
		    		OpenAddTagModalFromNav();
		    		break;
		    	case "Rename":
		    		OpenRenameModalFromNav();
		    		break;
		    	case "Delete":
		    		deleteFromNav();
		    		break;
		    	case "Copy":
		    		OpenCopyModalFromNav();
		    		break;
		    	case "Properties":
		    		OpenPropertiesModalFromNav();
		    		break;
	    	}
	    	
	    }
	    
		function sortByfield(hdr) {
			if(vm.taskspaceField == hdr.value) {
    			vm.taskspaceFieldDecending = !vm.taskspaceFieldDecending;
    		} else {
    			vm.taskspaceFieldDecending = false;
    		}
			vm.taskspaceField =  hdr.value;
			userService.setUiState("taskspacesort",{field:vm.taskspaceField,decending:vm.taskspaceFieldDecending});
	    }
	    init();
		getAllTaskSpaces();
	}
})();
