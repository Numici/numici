;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('AddActionsController',AddActionsController);
	AddActionsController.$inject = ['$scope','appData','$uibModalInstance','modalType','selectedAction','selectedTaskspace','allSelectedTaskspaces','SaveSearchService','TaskSpaceService','_','$timeout'];

	function AddActionsController($scope,appData,$uibModalInstance,modalType,selectedAction,selectedTaskspace,allSelectedTaskspaces,SaveSearchService,TaskSpaceService,_,$timeout) {
		
		var appdata = appData.getAppData();
		var aac = this;
				
		aac.disableAction = false;
		aac.selectedActions = [];
		aac.showTaskspacesList = false;
		aac.selectedTaskspaces = [];
		aac.taskspaces = [];
		aac.actions = SaveSearchService.actions;
		
		aac.disableAddAction = disableAddAction;
		aac.onSelectAction = onSelectAction;
		aac.cancel = cancel;
		aac.ok = ok;
		
		function disableAddAction () {
			if(!_.isEmpty(aac.selectedActions)){
				var addToTaskspaceAction = _.findWhere(aac.selectedActions,{"type":"addToTaskspace"});
				if(!addToTaskspaceAction || (addToTaskspaceAction && !_.isEmpty(aac.selectedTaskspaces))) {
					return false;
				}
			}
			return true;
		}
		
		function getAllTaskSpaces(cb) {
			TaskSpaceService.getAllTaskSpaces().then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					aac.taskspaces = resp.data.Taskspaces;
					if(typeof cb == "function") {
						cb();
					} else {
						_.each(allSelectedTaskspaces, function(taskspace) {
							aac.taskspaces = _.without(aac.taskspaces, _.findWhere(aac.taskspaces, {id : taskspace.id}));
					    });
					}
				}
			});
		}
		
		function onSelectAction() {
			aac.showTaskspacesList = false;
			if(!_.isEmpty(aac.selectedActions)){
				var addToTaskspace = _.findWhere(aac.selectedActions,{"type" : "addToTaskspace"});
				if(addToTaskspace) {
					getAllTaskSpaces();
					$timeout(function () {
						aac.showTaskspacesList = true;
			        },0);
				}
			}
		}
		
		function cancel() {
			$uibModalInstance.dismiss('cancel');
		}
		
		function ok() {
			var results = {};
			if(!_.isEmpty(aac.selectedActions)) {
				results.selectedActions = aac.selectedActions;
				var addToTaskspaceAction = _.findWhere(aac.selectedActions,{"type":"addToTaskspace"});
				if(addToTaskspaceAction) {
					if(!_.isEmpty(aac.selectedTaskspaces)) {
						results.selectedTaskspaces = aac.selectedTaskspaces;
					} else {
						return false;
					}
				}
				$uibModalInstance.close(results);
			}
		}
		
		function init() {
			if(modalType.type == "edit") {
				var selectedActionTemp = _.findWhere(aac.actions,{"type":selectedAction.type});
				aac.selectedActions.push(selectedActionTemp);
				if(selectedActionTemp.type == "addToTaskspace") {
					getAllTaskSpaces(function() {
						if(selectedTaskspace) {
							var selectedTaskSpaceTemp = _.findWhere(aac.taskspaces, {id : selectedTaskspace.taskspace.id});
							selectedTaskSpaceTemp.selected = true;
							aac.selectedTaskspaces.push(selectedTaskSpaceTemp);
						}
						_.each(allSelectedTaskspaces, function(taskspace) {
							aac.taskspaces = _.without(aac.taskspaces, _.findWhere(aac.taskspaces, {id : taskspace.id}));
						});
						aac.showTaskspacesList = true;
					});
				}
				aac.disableAction = true;
			}
		}
		init();
	}
})();
