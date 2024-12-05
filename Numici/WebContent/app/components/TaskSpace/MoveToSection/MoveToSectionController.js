;(function() {

	'use strict';
	
	angular.module('vdvcApp').controller('MoveToSectionController',MoveToSectionController);
	
	MoveToSectionController.$inject = ['$rootScope','$scope','appData','_','$uibModal','$uibModalInstance',
	                                    'TaskSpaceService','orderByFilter','MessageService',
	                                    'moveObjectInfo','tsList','DeepLinkService','VDVCConfirmService'];
	
	function MoveToSectionController($rootScope,$scope,appData,_,$uibModal,$uibModalInstance,TaskSpaceService,
			orderByFilter,MessageService,moveObjectInfo,tsList,DeepLinkService,VDVCConfirmService) {
	
		var vm = this;
		
		var appdata = appData.getAppData();
		
		var isCopiedTrueDocs = [];
		var noSectionObj = {id : null, name : "< No Section >", description : ""};
		
		vm.fromTaskspace = angular.copy(moveObjectInfo.currentTaskspace);
		//vm.tsSections = !_.isEmpty(moveObjectInfo.currentTaskspace.sections) ? angular.copy(moveObjectInfo.currentTaskspace.sections) : [];
		vm.fromSection = {};
		
		vm.taskspaceList = tsList;
		vm.targetTS = {}; 
		vm.targetTSSection = {};
		vm.isFormSubmiting = false;
		
		vm.disableMove = disableMove;
		vm.getMoveObjectTitle = getMoveObjectTitle;
		vm.onTargetTSSelection = onTargetTSSelection;
		vm.showAddSectionBtn = showAddSectionBtn;
		vm.newTaskSpace = newTaskSpace;
		vm.addSectionToTS = addSectionToTS;
		vm.ok = ok;
		vm.cancel = cancel;
		
		function disableMove() {
			var status = true;
			if(!_.isEmpty(vm.targetTS) 
					&& !_.isEmpty(vm.targetTSSection) 
					&& (vm.fromTaskspace.id != vm.targetTS.id || vm.fromSection.id != vm.targetTSSection.id)){
				status = false;
			}
			return status;
		}
		
		function getMoveObjectTitle() {
			if(!_.isEmpty(moveObjectInfo.tsObj) && !_.isEmpty(moveObjectInfo.tsObj.objectInfo)) {
				if(moveObjectInfo.tsObj.objectInfo.docType == "WebResource"){
					return "Move Web Page";
				} else {
					return "Move Document";
				}
			} else {
				return "Move Document";
			}
		}
		
		function onTargetTSSelection(taskspace, model) {
			var tsNoSectionObj = _.findWhere(taskspace.sections,{"id" : noSectionObj.id});
			if(!_.isEmpty(taskspace.sections) && _.isEmpty(tsNoSectionObj)) {
				taskspace.sections.unshift(noSectionObj);
			} else if(_.isEmpty(taskspace.sections)){
				taskspace.sections = [noSectionObj];
			}
			vm.targetTSSection = vm.targetTS.sections[0];
		}
		
		function showAddSectionBtn(){
			var status = false;
			var tsNoSectionObj = _.findWhere(vm.targetTS.sections,{"id" : noSectionObj.id});
			if(!_.isEmpty(vm.targetTS) 
					&& !_.isEmpty(vm.targetTS.sections) 
					&& vm.targetTS.sections.length == 1 
					&& !_.isEmpty(tsNoSectionObj)){
				status = true;
			}
			return status;
		}
		
		function newTaskSpaceCallBack(taskspace) {
			$rootScope.$broadcast("TASKSPACE_ADDED", {"taskspace" : taskspace});
			taskspace.sections = [noSectionObj];
			vm.taskspaceList.push(taskspace);
			vm.taskspaceList = orderByFilter(vm.taskspaceList, "name", true);
			vm.targetTS = _.findWhere(vm.taskspaceList,{"id" : taskspace.id});
			vm.targetTSSection = vm.targetTS.sections[0];
		}
		
		function newTaskSpace() {
			var modalInstance = $uibModal.open({
			      animation: true,
			      templateUrl: 'app/components/TaskSpace/NewTaskSpace/newTaskSpace.html',
			      controller: 'NewTaskSpaceController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'vm',
			      backdrop: 'static',
			    });
			
			modalInstance.result.then(function (results) {
				newTaskSpaceCallBack(results.taskspace);
				MessageService.showSuccessMessage("TASKSPACE_CREATE",[results.taskspace.name]);
			}, function () {
				
			});
		}
		
		function newTaskSpaceSectionCallBack(section) {
			$rootScope.$broadcast("SEECTION_ADDED", {"taskspace" : vm.targetTS,"section" : section});
			if(!vm.targetTS.sections) {
				vm.targetTS.sections = [];
			}
			vm.targetTS.sections.push(section);
			vm.targetTSSection = _.findWhere(vm.targetTS.sections,{"id" : section.id});
		}
		
		function addSectionToTS() {
			var modalInstance = $uibModal.open({
			      animation: true,
			      templateUrl: 'app/components/TaskSpace/NewTSSecton/NewTSSecton.html',
			      controller: 'NewTSSectonController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'vm',
			      backdrop: 'static',
			      resolve : {
			    	  taskspace : function() {
			    		  return vm.targetTS;
			    	  }
			      }
			    });
			
			modalInstance.result.then(function (results) {
				newTaskSpaceSectionCallBack(results);
				MessageService.showSuccessMessage("TASKSPACE_SECTION_CREATE",[results.name]);
			}, function () {
				
			});
		}
		
		function checkLinkExists(tsObj,cb) {
			var postdata = {
					  "objectType" : "DigestDocument",
					  "linkObjectId" : moveObjectInfo.currentTaskspace.id,
					  "clientId" : moveObjectInfo.currentTaskspace.clientId ,
					  "documentId" : tsObj.objectId
			};
			DeepLinkService.checkLinkExists(postdata).then(function(resp) {
				if (resp.status == 200 && resp.data.Status) {
					if(typeof cb === "function") {
						cb(resp.data.Link);
  				  	}
  			    }
			});
		}
		
		function ok(event) {
			if(vm.targetTS.id != moveObjectInfo.currentTaskspace.id) {
				var postdata = {
						"fromTaskspaceId" : moveObjectInfo.currentTaskspace.id,
						"fromClientId" : moveObjectInfo.currentTaskspace.clientId,
						"resourceId" : moveObjectInfo.tsObj.objectId,
						"resourceClientId" : moveObjectInfo.tsObj.clientId,
						"toTaskspaceId" : 	vm.targetTS.id,
						"toClientId" : vm.targetTS.clientId,
						"actionOnAnnotations" : "move",
						"fromSectionId" : moveObjectInfo.tsObj.sectionId,
						"toSectionId" : vm.targetTSSection.id
						
					};
				checkLinkExists(moveObjectInfo.tsObj,function(Link) {
					if(!_.isEmpty(Link)) {
						var text = "<div class='col-xs-12'>The Document is Shared as a link; on moving " +
								"the Document the link would be deleted " +
								"permanently (shared link will not be accessible)" +
								"<br><br>" +
								"Are you sure you want to move the Document?</div>"
						var confirm = VDVCConfirmService.open({title : "CONFIRM", text : text});
						confirm.result.then(function () {
							$uibModalInstance.close(postdata);
						});
					} else {
						$uibModalInstance.close(postdata);
					}
				});
			} else if(vm.targetTS.id == moveObjectInfo.currentTaskspace.id && vm.targetTSSection.id != vm.fromSection.id) {
				vm.isFormSubmiting = true;
				var postdata = {
						"clientId": moveObjectInfo.currentTaskspace.clientId,
						"taskspaceId":moveObjectInfo.currentTaskspace.id,
						"documentId": moveObjectInfo.tsObj.objectId,
						"sectionId": vm.targetTSSection.id // id of the section to which document will be moved
					};
				TaskSpaceService.moveToTSSection(postdata).then(function(resp) {
					if(resp.status == 200 && resp.data.Status) {
						$uibModalInstance.close();
						vm.isFormSubmiting = false;
					}
				},function(error) {
					vm.isFormSubmiting = false;
            	});
			}
		}

		function cancel() {
			$uibModalInstance.dismiss('cancel');
		}
		
		function init() {
			if(_.isArray(vm.fromTaskspace.sections) && !_.isEmpty(vm.fromTaskspace.sections)) {
				vm.fromTaskspace.sections.unshift(noSectionObj);
			} else if(_.isArray(vm.fromTaskspace.sections) && _.isEmpty(vm.fromTaskspace.sections)) {
				vm.fromTaskspace.sections.push(noSectionObj);
			} else if(!_.isArray(vm.fromTaskspace.sections)) {
				vm.fromTaskspace.sections = [noSectionObj];
			}
			if(!_.isEmpty(moveObjectInfo.tsObj.sectionId)) {
				vm.fromSection = _.findWhere(vm.fromTaskspace.sections,{"id" : moveObjectInfo.tsObj.sectionId});
			} else {
				vm.fromSection = noSectionObj;
			}
			
			if(!_.isEmpty(vm.taskspaceList)) {
				vm.targetTS = _.findWhere(vm.taskspaceList,{"id" : vm.fromTaskspace.id});
			}
			if(_.isArray(vm.targetTS.sections) && !_.isEmpty(vm.targetTS.sections)) {
				vm.targetTS.sections.unshift(noSectionObj);
			} else if(_.isArray(vm.targetTS.sections) && _.isEmpty(vm.targetTS.sections)) {
				vm.targetTS.sections.push(noSectionObj);
			} else if(!_.isArray(vm.targetTS.sections)) {
				vm.targetTS.sections = [noSectionObj];
			}
			if(!_.isEmpty(vm.targetTS) && !_.isEmpty(vm.targetTS.sections) && !_.isEmpty(vm.fromSection)) {
				vm.targetTSSection = _.findWhere(vm.targetTS.sections,{"id" : vm.fromSection.id});
			} else {
				vm.targetTSSection = noSectionObj;
			}
		}
		init();
	}
	
})();
