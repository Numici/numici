;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('SaveSearchController',SaveSearchController);
	SaveSearchController.$inject = ['$scope','appData','$uibModal','$uibModalInstance','modalTitle','savedSearch','query','advancedInputs','AdvSearchService','SaveSearchService','_','MessageService'];

	function SaveSearchController($scope,appData,$uibModal,$uibModalInstance,modalTitle,savedSearch,query,advancedInputs,AdvSearchService,SaveSearchService,_,MessageService) {
		
		var appdata = appData.getAppData();
		var saveSrchObj = this;
				
		saveSrchObj.modalTitle = !_.isEmpty(modalTitle) ? modalTitle.title :"Save Search";
		saveSrchObj.selected = {"name" : "None"};
		saveSrchObj.systemSearchName = "";
		saveSrchObj.systemSearchSlctd = {"name" : "None"};
		saveSrchObj.query = angular.copy(query);
		saveSrchObj.criteriaName = "";
		saveSrchObj.systemSearch = appdata.isSiteAdmin ? true : false;
		saveSrchObj.allGroups = [];
		saveSrchObj.group = [];
		saveSrchObj.actions = SaveSearchService.actions;
		saveSrchObj.selectedActions = [];
		saveSrchObj.selectedPostActions = [];
		
		saveSrchObj.enableSaveSearch = enableSaveSearch;
		saveSrchObj.isDisabled = isDisabled;
		saveSrchObj.reverseOrderFilterFn = reverseOrderFilterFn;
		saveSrchObj.cancel = cancel;
		saveSrchObj.getGroups = getGroups;
		saveSrchObj.addNewActions = addNewActions;
		saveSrchObj.editTaskspaceAction = editTaskspaceAction;
		saveSrchObj.removeSelectedAction = removeSelectedAction;
		saveSrchObj.prepareSelectedActionsList = prepareSelectedActionsList;
		saveSrchObj.getActionLabel = getActionLabel;
		saveSrchObj.saveCriteria = saveCriteria;
		
		function enableSaveSearch (criteriaName) {
			if(_.isEmpty(criteriaName)){
				return true;
			}
			return false;
		}
				
		function isDisabled() {
			return (!_.isEmpty(advancedInputs.documentType) || !_.isEmpty(advancedInputs.subtypes)) ? false : true;
		}
		
		function reverseOrderFilterFn(group) {
			return _.sortBy(group, 'name');
		}
		
		function cancel() {
			$uibModalInstance.dismiss('cancel');
		}
		
		function getGroups() {
			AdvSearchService.getAllSearchGroups().then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					saveSrchObj.allGroups = resp.data.Groups;
					saveSrchObj.group = !_.isEmpty(saveSrchObj.selected.group) ? [saveSrchObj.selected.group] : [];
				}
			});
		}
		
		function prepareSelectedActionsList() {
			if(!_.isEmpty(saveSrchObj.selectedActions)){
				var notifyAction = _.findWhere(saveSrchObj.selectedActions,{"type":"notify"});
				if(notifyAction) {
					var notifyActionPresent = _.find(saveSrchObj.selectedPostActions,function(selectedPostAction) {
						if(selectedPostAction.type == "notify" && selectedPostAction.requestBy == $scope.userinfo.UserId) {
							return true;
						} else {
							return false;
						}
					});
					if(!notifyActionPresent) {
						var actionObj = {
								"type" : notifyAction.type,
		                        "requestBy" : $scope.userinfo.UserId
		                };
						saveSrchObj.selectedPostActions.push(actionObj);
					}
				}
				var addToTaskspaceAction = _.findWhere(saveSrchObj.selectedActions,{"type":"addToTaskspace"});
				if(addToTaskspaceAction && !_.isEmpty(saveSrchObj.selectedTaskspaces)) {
					var addToTaskspaceActionPresent = _.find(saveSrchObj.selectedPostActions,function(selectedPostAction) {
						if(selectedPostAction.type == "addToTaskspace" && selectedPostAction.requestBy == $scope.userinfo.UserId) {
							return true;
						} else {
							return false;
						}
					});
					var actionObj = {
							"type" : addToTaskspaceAction.type,
	                        "requestBy" : $scope.userinfo.UserId,
	                        "taskspaces" : []
	                };
					_.each(saveSrchObj.selectedTaskspaces, function(taskspace) {
						if(addToTaskspaceActionPresent && _.isArray(addToTaskspaceActionPresent.taskspaces)) {
							var selectedTaskspace = _.findWhere(addToTaskspaceActionPresent.taskspaces,{"id":taskspace.id});
							if(!selectedTaskspace) {
								var ts={"id" : taskspace.id,"clientId" : taskspace.clientId,"name" : taskspace.name};
								if(!_.isEmpty(taskspace.owner)) {
									ts.owner = taskspace.owner;
								}
								addToTaskspaceActionPresent.taskspaces.push(ts);
							}
						} else {
							actionObj.taskspaces.push({"id" : taskspace.id,"clientId" : taskspace.clientId,"name" : taskspace.name,"owner" : taskspace.owner});
							saveSrchObj.selectedPostActions.push(actionObj);
						}
					});
				}
			}
		}
		function openAddActionModal(type,action,taskspace) {
			var modalInstance = $uibModal.open({
				 animation: $scope.animationsEnabled,
			      templateUrl: 'app/components/AdvancedSearch/SaveSearch/AddActions/AddActionsModal.html',
			      controller: 'AddActionsController',
			      appendTo : $('.vdvc-3ps-wrap'),
			      controllerAs: 'aac',
			      backdrop: 'static',
			      resolve : {
			    	  modalType : {type : type},
			    	  selectedAction : {type : action.type},
			    	  selectedTaskspace : {taskspace : taskspace},
			    	  allSelectedTaskspaces : function() {
			    		  var selectedTaskspaces = [];
			    		  var addToTaskspaceActions = _.where(saveSrchObj.selectedPostActions,{"type":"addToTaskspace"});
						  if(!_.isEmpty(addToTaskspaceActions)) {
							  _.each(addToTaskspaceActions, function(action){
								  _.each(action.taskspaces, function(ts){
									  if(taskspace) {
										  if(ts.id != taskspace.id) {
											  selectedTaskspaces.push(ts);
										  }
									  } else {
										  selectedTaskspaces.push(ts);
									  }
									  
								  });
							  });
						  }
			    		  return selectedTaskspaces;
			    	  }
			      }
			 });
			 modalInstance.result.then(function (result) {
				 if(type == "edit") {
					 removeSelectedAction(action,taskspace);
				 }
				 if(result.selectedTaskspaces) {
					 saveSrchObj.selectedTaskspaces = result.selectedTaskspaces;
				 }
				 if(result.selectedActions) {
					 saveSrchObj.selectedActions = result.selectedActions;
					 prepareSelectedActionsList();
				 }
			 });
		}
		function addNewActions() {
			openAddActionModal("add","");
		}
		
		function editTaskspaceAction(action,taskspace) {
			openAddActionModal("edit",action,taskspace);
		}
		
		function removeActionFromPostActions(action,taskspace) {
			saveSrchObj.selectedPostActions = _.reject(saveSrchObj.selectedPostActions, function(selectedPostAction){ 
    			if(selectedPostAction.type == action.type && selectedPostAction.requestBy == action.requestBy) {
    				return true;
    			} else {
    				return false;
    			}
			});
		}
		
		function removeSelectedAction(action,taskspace) {
			if(action.type == "notify") {
				removeActionFromPostActions(action,taskspace);
			} else if(action.type == "addToTaskspace") {
				action.taskspaces = _.reject(action.taskspaces, function(ts){ 
	    			if(action.requestBy == $scope.userinfo.UserId && ts.id == taskspace.id) {
	    				return true;
	    			} else {
	    				return false;
	    			}
				});
				if(_.isEmpty(action.taskspaces)){
					removeActionFromPostActions(action,taskspace);
				}
			}
		}
		
		function getActionLabel(action,taskspace) {
			var actionLabel = "";
			if(action.type == "notify") {
				var notifyAction = _.findWhere(saveSrchObj.actions,{"type":"notify"});
				actionLabel = notifyAction.label+" - "+"true";
			}
			if(action.type == "addToTaskspace") {
				var addToTaskspaceAction = _.findWhere(saveSrchObj.actions,{"type":"addToTaskspace"});
				actionLabel = addToTaskspaceAction.label;
				if(taskspace) {
					actionLabel = actionLabel+" - "+taskspace.name;
					if(!_.isEmpty(taskspace.owner)){
						actionLabel = actionLabel+" ("+taskspace.owner+")";
					}
				}
			}
			return actionLabel;
		}
		
		function saveCriteria($event) {
			var current = saveSrchObj;
			if($event) {
				$event.stopPropagation();
			}
			var postdata = {};
			var query = saveSrchObj.query;
			var mode;
			var srch;
			if(current.systemSearchSlctd.id) {
        		srch = current.systemSearchSlctd;
				mode = "system";
        	}
        	if(current.selected.id ) {
				srch = current.selected;
				mode = "user";
        	}
			
			postdata.name = current.criteriaName;
			if(!_.isEmpty(saveSrchObj.selectedPostActions)) {
				postdata.actions = saveSrchObj.selectedPostActions;
			}
			postdata.systemSearch = current.systemSearch.toString();
			postdata.group = !_.isEmpty(current.group) ? current.group[0] : "";
			postdata.map = query;
			
			if(mode == "system") {
				postdata.systemSearchId = srch.id;
			}
			
			if(saveSrchObj.modalTitle == "Save Search" || saveSrchObj.modalTitle == "Save Search As") {
				AdvSearchService.isSearchPresentByName({"name" : postdata.name}).then(function(resp) {
					if(resp.status == 200 && resp.data.Status) {
						if(resp.data.Search) {
							MessageService.showErrorMessage("ADV_SEARCH_SAVE_ERR",[postdata.name]);
						} else {
							AdvSearchService.saveSearchCriteria(postdata).then(function(result) {
								if(result.status ==200 && result.data.Status) {
									MessageService.showSuccessMessage("ADV_SEARCH_SAVE",[postdata.name]);
									$uibModalInstance.close(result.data.Search);
								}
							});
						}	
					}
				});
			}
			
			if(saveSrchObj.modalTitle == "Edit Search") {
				postdata.id = srch.id;
				AdvSearchService.updateSavedSearch(postdata).then(function(resp) {
					if(resp.status == 200 && resp.data.Status) {
						$uibModalInstance.close(resp.data.Search);
					}
				});
			}
			
		}
		
		function init() {
			saveSrchObj.group = [];
			saveSrchObj.criteriaName = "";
			saveSrchObj.systemSearch = appdata.isSiteAdmin ? true : false;
			saveSrchObj.getGroups();
			if(!_.isEmpty(savedSearch)) {
				saveSrchObj.selected = angular.copy(savedSearch);
				saveSrchObj.criteriaName = saveSrchObj.selected.name;
				saveSrchObj.systemSearch = saveSrchObj.selected.system;
				saveSrchObj.selectedPostActions = saveSrchObj.selected.actions ? saveSrchObj.selected.actions : [];
				if(!_.isEmpty(saveSrchObj.selectedPostActions)) {
					saveSrchObj.selectedActions = saveSrchObj.selectedPostActions;
					var addToTaskspaceAction = _.findWhere(saveSrchObj.selectedPostActions,{"type":"addToTaskspace"});
					if(addToTaskspaceAction) {
						saveSrchObj.selectedTaskspaces = addToTaskspaceAction.taskspaces;
					}
				}
			}
		}
		init();
	}
})();
