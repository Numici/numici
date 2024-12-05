;(function() {

	'use strict';
	
	angular.module('vdvcApp').controller('AddedTaskspacesController',AddedTaskspacesController);
	
	AddedTaskspacesController.$inject = ['$state','$scope','appData','_',"$uibModal",'$uibModalInstance',
	                                     'resolveData','AddedTaskspacesService',
	                                     "userService","orderByFilter","MessageService"];
	
	function AddedTaskspacesController($state,$scope,appData,_,$uibModal,$uibModalInstance,
			resolveData,AddedTaskspacesService,userService,orderByFilter,MessageService) {
	
		var atc = this;
		
		var appdata = appData.getAppData();
		var SelectedDoc = resolveData.SelectedDoc;
		atc.headerLabel = headerLabel;
		atc.searchString = "";
		atc.taskspaces = !_.isEmpty(resolveData.AddedTaskspaces) ? angular.copy(resolveData.AddedTaskspaces) : [];
		atc.tsField = "name";
		atc.tsFieldDecending = false;
		atc.taskspacesListHeaders = angular.copy(AddedTaskspacesService.TaskSpaceListHeaders);
		atc.supportMultiSelectTaskspace = false;
		
		atc.getTSListCount = getTSListCount;
		atc.searchStringFilter = searchStringFilter;
		atc.sortByfield = sortByfield;
		atc.goToDocument = goToDocument;
		atc.ok = ok;
		atc.cancel = cancel;
		
		function headerLabel() {
			return "Associated Taskspaces";
		}
		
		function getTSListCount() {
			var shownedTaskspacesCount = $('#ts-table tbody tr.ts-row').length;
			return shownedTaskspacesCount;
		}
		
		function searchStringFilter(ts) {
			var status = false;
			for(var i=0;i<atc.taskspacesListHeaders.length;i++) {
				var taskspaceHeader = atc.taskspacesListHeaders[i];
				var fieldValue = ts[taskspaceHeader.value];
				if(atc.searchString.trim() == "" || 
						(taskspaceHeader.checked && taskspaceHeader.value != "createdDate" && 
								taskspaceHeader.value != "lastOpened" && 
								fieldValue && fieldValue.toLowerCase().indexOf(atc.searchString.toLowerCase()) != -1)) {
					status = true;
					ts.show = true;
					break;
				} else {
					ts.show = false;
				}
			}
			return status;
		}
		
		function sortByfield (hdr) {
			if(atc.tsField == hdr.value) {
    			atc.tsFieldDecending = !atc.tsFieldDecending;
    		} else {
    			atc.tsFieldDecending = false;
    		}
    		atc.tsField =  hdr.value;
    		atc.taskspaces =  orderByFilter(atc.taskspaces, atc.tsField, atc.tsFieldDecending);
    	}
		
		function goToDocument(ts) {
			$state.go('taskspace.list.task',{'tsId' : ts.taskspaceId,'tsc' : ts.tsClientId,'d' : SelectedDoc.id,'dc' : SelectedDoc.clientId},{"reload" : true}); 
		}
		
		function openCreateTaskSpaceModal(size) {
			var modalInstance = $uibModal.open({
			      animation: $scope.animationsEnabled,
			      templateUrl: 'app/components/TaskSpace/NewTaskSpace/newTaskSpace.html',
			      controller: 'NewTaskSpaceController',
			      appendTo : $('.rootContainer'),
			      controllerAs : 'vm',
			      backdrop: 'static',
			      size: size
			    });
			modalInstance.result.then(function (newTaskSpace) {
				MessageService.showSuccessMessage("TASKSPACE_CREATE",[newTaskSpace.taskspace.name]);
				atc.taskspaces.push(newTaskSpace.taskspace);
				atc.taskspaces = orderByFilter(atc.taskspaces, atc.tsField, atc.tsFieldDecending);
			});
		}
		
		function ok() {
			$uibModalInstance.close();
		}

		function cancel() {
			$uibModalInstance.dismiss('cancel');
		}
		
	}
})();