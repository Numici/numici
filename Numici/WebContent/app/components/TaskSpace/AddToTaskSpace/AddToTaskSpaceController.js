;(function() {

	'use strict';
	
	angular.module('vdvcApp').controller('AddToTaskSpaceController',AddToTaskSpaceController);
	
	AddToTaskSpaceController.$inject = ['$scope','appData','_','$uibModal','$uibModalInstance',
	                                    'TaskSpaceService','APIUserMessages','item','selectedChannelInfo',
	                                    'slackChannelConfigs','moveObjectInfo','addObjectsFromDocsInfo',
	                                    'orderByFilter','MessageService','SecFilingService','DocFactory',
	                                    '$confirm','AddExternlFileValidationService','CopyExternalFilesService',
	                                    'asanaconfig','AnnotationService','userService','VDVCConfirmService'];
	
	function AddToTaskSpaceController($scope,appData,_,$uibModal,$uibModalInstance,TaskSpaceService,
			APIUserMessages,item,selectedChannelInfo,slackChannelConfigs,moveObjectInfo,addObjectsFromDocsInfo,orderByFilter,
			MessageService,SecFilingService,DocFactory,$confirm,AddExternlFileValidationService,
			CopyExternalFilesService,asanaconfig,AnnotationService,userService,VDVCConfirmService) {
	
		var vm = this;
		
		var appdata = appData.getAppData();
		
		var isCopiedTrueDocs = [];
			
		vm.headerLabel = headerLabel;
		vm.submitLabel = submitLabel;
		vm.searchString = "";
		vm.taskSpaces = [];
		vm.selectedTS = {};
		vm.selectedTSSection = {};
		vm.tsField = userService.getUiState("taskspacesort").stateValue ? userService.getUiState("taskspacesort").stateValue.field : "name";
		vm.tsFieldDecending = userService.getUiState("taskspacesort").stateValue ? userService.getUiState("taskspacesort").stateValue.decending : false;
		vm.taskSpacesListHeaders = angular.copy(TaskSpaceService.AddToTaskSpaceListHeaders);
		vm.supportMultiSelectTaskspace = false;
		vm.autoPostAnns = false;
		
		vm.getTSListCount = getTSListCount;
		vm.searchStringFilter = searchStringFilter;
		vm.selectColumn = selectColumn;
		vm.sortByfield = sortByfield;
		vm.disableTaskspace = disableTaskspace;
		vm.disableAdd = disableAdd;
		vm.selectTaskspace = selectTaskspace;
		vm.openCreateTaskSpaceModal = openCreateTaskSpaceModal;
		vm.showSelectTsSection = showSelectTsSection;
		vm.showPostToSlackAutomatically = showPostToSlackAutomatically;
		vm.ok = ok;
		vm.cancel = cancel;
		
		function headerLabel() {
			if(!_.isEmpty(moveObjectInfo)) {
				return moveObjectInfo.HeaderLabel;
			}
			
			if(!_.isEmpty(selectedChannelInfo)) {
				return "Connect '"+selectedChannelInfo.channelName+"' Channel To";
			}
			
			if(!_.isEmpty(asanaconfig)) {
				return "Connect '"+asanaconfig.project.name+" To"
			}
			
			return "Add To Taskspace";
		}
		
		function submitLabel() {
			if(!_.isEmpty(moveObjectInfo)) {
				return moveObjectInfo.SubmitBtnLabel;
			}
			
			if(!_.isEmpty(selectedChannelInfo)) {
				return "CONNECT";
			}
			
			if(!_.isEmpty(asanaconfig)) {
				return "CONNECT";
			}
			
			return "ADD";
		}
		
		function getTSListCount() {
			var shownedTaskspacesCount = $('#ts-table tbody tr.ts-row').length;
			return shownedTaskspacesCount;
		}
		
		function searchStringFilter(ts) {
			var status = false;
			for(var i=0;i<vm.taskSpacesListHeaders.length;i++) {
				var taskspaceHeader = vm.taskSpacesListHeaders[i];
				var fieldValue = ts[taskspaceHeader.value];
				if(vm.searchString.trim() == "" || 
						(taskspaceHeader.checked && taskspaceHeader.value != "createdDate" && 
								taskspaceHeader.value != "lastOpened" && 
								fieldValue && fieldValue.toLowerCase().indexOf(vm.searchString.toLowerCase()) != -1)) {
					status = true;
					ts.show = true;
					break;
				} else {
					ts.show = false;
				}
			}
			return status;
		}
		
		function selectColumn (hdr,hdrList){
			var selectedColumns = _.where(hdrList,{"checked" : true});
			 if(hdr.checked) {
				 if(!_.isEmpty(selectedColumns) && selectedColumns.length > 1) {
					 hdr.checked = false;
				 }
			 } else {
				 hdr.checked = true;
			}
		}
		
		function sortByfield (hdr) {
			if(vm.tsField == hdr.value) {
    			vm.tsFieldDecending = !vm.tsFieldDecending;
    		} else {
    			vm.tsFieldDecending = false;
    		}
    		vm.tsField =  hdr.value;
    		vm.taskSpaces =  orderByFilter(vm.taskSpaces, vm.tsField, vm.tsFieldDecending);
    		userService.setUiState("taskspacesort",{field:vm.tsField,decending:vm.tsFieldDecending});
    	}
		
		function getErroredObjectWithReason(erroredObjects) {
			var erroredObject = {};
			erroredObject = _.findWhere(erroredObjects,function(erroredObject) {
				return (typeof erroredObject.Reason != undefined && erroredObject.Reason != null && erroredObject.Reason !== "");
			});
			return erroredObject;
		}
		
		function disableTaskspace(ts) {
			var status = false;
			if((!_.isEmpty(moveObjectInfo) && moveObjectInfo.currentTaskspace.id === ts.id) || !ts.permissions.edit) {
				status = true;
			}
			return status;
		}

		function disableAdd() {
			return !_.isEmpty(vm.selectedTS) ? false : true;
		}
		
		function getAllTaskSpaces() {
			TaskSpaceService.getAllTaskSpaces().then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					vm.taskSpaces = orderByFilter(resp.data.Taskspaces, vm.tsField, vm.tsFieldDecending);
					if(!_.isEmpty(selectedChannelInfo) && !_.isEmpty(appdata["UserId"])) {
						vm.taskSpaces = _.reject(vm.taskSpaces, function(taskspace){ 
			    			return taskspace.owner.toLowerCase() !== appdata["UserId"].toLowerCase(); 
			    		});
						_.each(slackChannelConfigs,function(slackChannelConfig){
							vm.taskSpaces = _.reject(vm.taskSpaces, function(taskspace){ 
				    			return taskspace.id === slackChannelConfig.taskspaceId; 
				    		});
						});
					} 
					
					if(!_.isEmpty(asanaconfig) && !_.isEmpty(appdata["UserId"])) {
						vm.taskSpaces = _.reject(vm.taskSpaces, function(taskspace){ 
			    			return taskspace.owner.toLowerCase() !== appdata["UserId"].toLowerCase(); 
			    		});
						_.each(asanaconfig.taskspaces,function(ts){
							vm.taskSpaces = _.reject(vm.taskSpaces, function(taskspace){ 
				    			return taskspace.id === ts.taskspaceId; 
				    		});
						});
					}
				}
			});
		}
		
		function selectTaskspace(ts) {
			var isNoteBookSelected = false;
			if(vm.selectedTS.id == ts.id) {
				isNoteBookSelected = true;
			}
			if(isNoteBookSelected) {
				vm.selectedTS = {};
			} else {
				vm.selectedTS = ts;
				insertDefaultSection();
			}
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
				TaskSpaceService.openTaskSpace(newTaskSpace.taskspace.clientId,newTaskSpace.taskspace.id).then(function(resp) {
					if(resp.status == 200 && resp.data.Status) {
						MessageService.showSuccessMessage("TASKSPACE_CREATE",[newTaskSpace.taskspace.name]);
						vm.taskSpaces.push(newTaskSpace.taskspace);
						vm.taskSpaces = orderByFilter(vm.taskSpaces, vm.tsField, vm.tsFieldDecending);
						selectTaskspace(newTaskSpace.taskspace);
					}
				});
			});
		}
		
		
		function showSelectTsSection() {
			var status = false;
			if(_.isEmpty(selectedChannelInfo) && _.isEmpty(asanaconfig) && !_.isEmpty(vm.selectedTS)) {
				status = true;
			}
			return status;
		}
		
		function insertDefaultSection() {
			if(showSelectTsSection()) {
				/*var defaultSection = {
						"id": null,
				        "name": TaskSpaceService.defaultSectionName,
				        "description": TaskSpaceService.defaultSectionDescription
				};
				if(_.isArray(vm.selectedTS.sections) && !_.isEmpty(vm.selectedTS.sections)) {
					vm.selectedTS.sections.unshift(defaultSection);
				} else if(_.isArray(vm.selectedTS.sections) && _.isEmpty(vm.selectedTS.sections)) {
					vm.selectedTS.sections.push(defaultSection);
				} else if(!_.isArray(vm.selectedTS.sections)) {
					vm.selectedTS.sections = [defaultSection];
				}*/
				var noSectionObj = {id : null, name : "No Section", description : ""};
				if(_.isArray(vm.selectedTS.sections) && !_.isEmpty(vm.selectedTS.sections)) {
					vm.selectedTS.sections.unshift(noSectionObj);
				} else if(_.isArray(vm.selectedTS.sections) && _.isEmpty(vm.selectedTS.sections)) {
					vm.selectedTS.sections.push(noSectionObj);
				} else if(!_.isArray(vm.selectedTS.sections)) {
					vm.selectedTS.sections = [noSectionObj];
				}
				
				//vm.selectedTS = TaskSpaceService.insertDefaultSection(vm.selectedTS);
				vm.selectedTSSection = vm.selectedTS.sections[0];
			}
		}
		
		function showPostToSlackAutomatically() {
			var status = false;
			if(!_.isEmpty(selectedChannelInfo)) {
				status = true;
			}
			return status;
		}
		
		function addToTaskSpaceCB(postdata,result,downloadResp) {
			var isAddedFalse = _.findWhere(result,{"isAdded" : false});
			var isAddedTrue = _.where(result,{"isAdded" : true});
			if(isAddedFalse) {
				APIUserMessages.error(isAddedFalse.reason);
			} else if(!_.isEmpty(downloadResp)) {
				$uibModalInstance.close(downloadResp);
			} else if(!_.isEmpty(isAddedTrue)) {
				$uibModalInstance.close(isAddedTrue);
			} 
			
			// This code is not using and this is for handle copy and add external file or continue.  
			/*if(isAddedFalse && isAddedFalse.reason === "Cannot add external file") {
				var openAddExternlFileValidationModalInstance = AddExternlFileValidationService.openAddExternlFileValidationModal(isAddedFalse.source);
				openAddExternlFileValidationModalInstance.result.then(function (status) {
					if(status === "Copy") {
						if(!_.isEmpty(item)) {
							CopyExternalFilesService.selectedObjectList = angular.copy([item]);
						} else if(!_.isEmpty(addObjectsFromDocsInfo) && !_.isEmpty(addObjectsFromDocsInfo.selectedObjects)) {
							CopyExternalFilesService.selectedObjectList = angular.copy(addObjectsFromDocsInfo.selectedObjects);
						}
						
						CopyExternalFilesService.copyExternalFiles(postdata,function(copyExternalFilesResp){
							if(copyExternalFilesResp.status == 200 && copyExternalFilesResp.data.Status) {
								handleCopyDocCB(postdata.objects,copyExternalFilesResp.data.resultList);
							}
						});
					} else if(status === "Continue") {
						postdata.checkExternalFiles = false;
						addItemToTaskSpace(postdata);
					} else if(status === "Cancel") {
						$uibModalInstance.dismiss('cancel');
					}
				}, function () {
					$uibModalInstance.dismiss('cancel');
				});
			} else if(isAddedFalse) {
				APIUserMessages.error(isAddedFalse.reason);
			} else if(!_.isEmpty(downloadResp)){
				$uibModalInstance.close(downloadResp);
				//MessageService.showSuccessMessage("COMMENT_DELETE");
			}
			if((!isAddedFalse || isAddedFalse.reason !== "Cannot add external file") && _.isEmpty(downloadResp) && !_.isEmpty(isAddedTrue)) {
				var results = [];
				_.each(isAddedTrue, function(obj, i) {
					var objectAdded = angular.copy(item);
					if(!objectAdded && !_.isEmpty(isCopiedTrueDocs)) {
						var isCopiedTrueDoc = _.findWhere(isCopiedTrueDocs,function(isCopiedTrueDocObj){
							return isCopiedTrueDocObj.copiedDoc.id == obj.objectId;
						});
						if(isCopiedTrueDoc) {
							objectAdded = isCopiedTrueDoc.copiedDoc;
						}
					}
					var newObj = {
						name : objectAdded.displayName,
						objectId : obj.objectId,
						clientId : obj.clientId,
						objectInfo : {
							"datePublished": objectAdded.datePublished,
					        "createdBy":  objectAdded.createdBy,
					        "docType":  objectAdded.docType,
					        "companyName":  objectAdded.companyName,
					        "name": objectAdded.displayName,
					        "isGlobal":  objectAdded.isGlobal,
					        "isShared":  objectAdded.isShared
						},
						timestamp : null,
						type : obj.objectType
					};
					results.push(newObj);
				});
				$uibModalInstance.close(results);
			}*/
		}

		function handleCopyDocCB(docList,results) {
			var isCopiedFalse = _.findWhere(results,{"isCopied" : false});
			var isCopiedTrueDocs = _.where(results,{"isCopied" : true});
						
			if(isCopiedFalse) {
				var NoPermOnObjectList = _.where(results,{"Reason" : "NoPermOnObject"});
				var ObjectNotFoundList = _.where(results,{"Reason":"ObjectNotFound"});
				var AnotherObjectExists = _.where(results,{"Reason":"AnotherObjectExists"});
				var erroredObject = getErroredObjectWithReason(results);
				
				if(!_.isEmpty(NoPermOnObjectList)) {
					MessageService.showErrorMessage("COPY_ITEMS_ERR");
				}
				
				if(!_.isEmpty(ObjectNotFoundList)) {
					MessageService.showErrorMessage("ITEMS_NOT_FOUND_COPY");
				}
				
				if(!_.isEmpty(AnotherObjectExists)) {
					MessageService.showErrorMessage("COPY_ANOTHER_DOC_EXISTS",[AnotherObjectExists[0].newName]);
				} else if(!_.isEmpty(erroredObject)) {
					MessageService.showErrorMessage("BACKEND_ERR_MSG",[erroredObject.Reason]);
				} else {
					MessageService.showErrorMessage("DEFAULT_ERROR_MSG");
				}
			} else {
				MessageService.showSuccessMessage("COPY_ITEMS");
			}
			if(!_.isEmpty(isCopiedTrueDocs)) {
				var copiedObjects = [];
				_.each(isCopiedTrueDocs,function(item,index) {
					if(!_.isEmpty(addObjectsFromDocsInfo)) {
						addObjectsFromDocsInfo.selectedObjects = _.reject(addObjectsFromDocsInfo.selectedObjects, function(doc){ 
							if(doc.id == item.objectId) {
								doc.selected = false;
							}
			    			return doc.id == item.objectId; 
			    		});
					}
					
					var doc = _.findWhere(docList,{"objectId" : item.objectId});
					item.copiedDoc.clientId = item.copiedDocClientId;
					item.copiedDoc._type = doc.type;
					item.copiedDoc.isGlobal = item.copiedDoc.global;
					item.copiedDoc.isShared = false;
					if(doc) {
						var object = {
								"type" :item.copiedDoc._type,
								"objectId" : item.copiedDoc.id,
								"clientId" : item.copiedDoc.clientId
							};
						copiedObjects.push(object);
					}
				});
				var postdata = {
						"id" : 	vm.selectedTS.id,
						"clientId" : vm.selectedTS.clientId,
						"objects" : copiedObjects,
						"checkExternalFiles" : true
					};
				addItemToTaskSpace(postdata);
			}
		}
		
		function confirmAnnotContextOnAdd(tsObj) {
	    	return $uibModal.open({
	    		animation: true,
	    		templateUrl: 'app/components/TaskSpace/AddToTaskSpace/ConfirmAddTSObjAnnotContext/ConfirmAddTSObjAnnotContextTemp.html',
	    		controller: 'ConfirmAddTSObjAnnotContextCtrl',
	    		appendTo : $('.rootContainer'),
	    		backdrop: 'static',
	    		size: 'md',
	    		windowClass: 'uploadFileWindow',
	    		resolve: {
	    			tsObj : tsObj
	    		}
		    });
	    }
		
		function getDocAnnotations(tsObj,cb) {
			var postdata = {
					"includePdfAnnotations" : tsObj.includePdfAnnotations,
					"annotationContext" : "document",
					"taskspaceId": undefined,
					"tsClientId" : undefined
			};
			AnnotationService.getAllDocAnnotations(tsObj.objectId,tsObj.clientId,postdata).then(function(resp){
				if(resp.status == 200 && resp.data.Status) {
					if(typeof cb === "function") {
						cb(resp.data.Annotations);
					}
				}
			});
		}
		
		function addItemToTaskSpace(postdata,downloadResp) {
			var tsObj = {"includePdfAnnotations" : true,"objectId": postdata.objects[0].objectId,"clientId": postdata.objects[0].clientId,"objectInfo":{"docType" : postdata.objects[0].type}}
			if(postdata.objects.length == 1) {
				getDocAnnotations(tsObj,function(annotList){
					if(!_.isEmpty(annotList)) {
						confirmAnnotContextOnAdd(tsObj).result.then(function (selectedOption) {
							if(selectedOption != "empty") {
								postdata["actionOnAnnotations"] = selectedOption;
							} else {
								postdata["actionOnAnnotations"] = null;
							}
							TaskSpaceService.addToTaskSpace(postdata).then(function(resp) {
								if(resp.status == 200 && resp.data.Status) {
									addToTaskSpaceCB(postdata,resp.data.Results,downloadResp);
								}
							});
		    			}, function () {
		    				cancel();
		    			});
					} else {
						TaskSpaceService.addToTaskSpace(postdata).then(function(resp) {
							if(resp.status == 200 && resp.data.Status) {
								addToTaskSpaceCB(postdata,resp.data.Results,downloadResp);
							}
						});
					}
				});
			} else if(postdata.objects.length > 1) {
				confirmAnnotContextOnAdd(tsObj).result.then(function (selectedOption) {
					if(selectedOption != "empty") {
						postdata["actionOnAnnotations"] = selectedOption;
					} else {
						postdata["actionOnAnnotations"] = null;
					}
					TaskSpaceService.addToTaskSpace(postdata).then(function(resp) {
						if(resp.status == 200 && resp.data.Status) {
							addToTaskSpaceCB(postdata,resp.data.Results,downloadResp);
						}
					});
    			}, function () {
    				cancel();
    			});
			}
		}
		
		function getDefaultDownloadFolder(cb) {
			DocFactory.getDownloadFolder().then(function(response){
				if(response.status == '200' && response.data.Status) {
					if(typeof cb == "function") {
						cb(response.data.Folders);
					}
				}
			});
		}
		
		function saveSECfileToFolder(postdata,cb) {
			SecFilingService.saveSECfileToFolder(postdata).then(function(resp){
				 if(resp.status == 200 && resp.data.Status && resp.data.Notes) {
					 if(typeof cb === "function") {
						 cb(resp);
					 }
				 }
			});
		}
		
		function SaveToDownloadFolder() {
			if(vm.selectedTS && !_.isEmpty(vm.selectedTS.defaultFolderId)) {
				var postdata = {
		    		"docId":item.id,
		    		"folderId": vm.selectedTS.defaultFolderId
			    };
				saveSECfileToFolder(postdata,function(resp) {
					var doc = resp.data.Notes;
					doc["_type"] = "Document";
					var postdata = {
							"id" : 	vm.selectedTS.id,
							"clientId" : vm.selectedTS.clientId,
							"objects" : [{
								"type" : doc._type,
								"objectId" : doc.id,
								"clientId" : doc.clientId
							}],
							checkExternalFiles : false
						};
					addItemToTaskSpace(postdata,resp);
				});
			} else {
				getDefaultDownloadFolder(function(defaultDownloadFolder) {
					var postdata = {
				    		"docId":item.id,
				    		"folderId": defaultDownloadFolder.id
					    };
					saveSECfileToFolder(postdata,function(resp) {
						var doc = resp.data.Notes;
						doc["_type"] = "Document";
						var postdata = {
								"id" : 	vm.selectedTS.id,
								"clientId" : vm.selectedTS.clientId,
								"objects" : [{
									"type" : doc._type,
									"objectId" : doc.id,
									"clientId" : doc.clientId
								}],
								checkExternalFiles : false
							};
						addItemToTaskSpace(postdata,resp);
					});
				});
			}
		}
		
		function globlaDocSaveConfirmation(text) {
			$confirm({text: text})
	        .then(function() {
	        	SaveToDownloadFolder();
		    });
		}
		
		function preProcessAddToTaskSpacePostdata(selectedObjects) {
	    	var objects = [];
			_.each(addObjectsFromDocsInfo.selectedObjects, function(selectedObject){
				var object = {
					"type" :selectedObject._type,
					"objectId" : selectedObject.id,
					"clientId" : selectedObject.clientId,
					"sectionId" : vm.selectedTSSection.id
				};
				objects.push(object);
			});
			var postdata = {
					"id" : 	vm.selectedTS.id,
					"clientId" : vm.selectedTS.clientId,
					"objects" : objects,
					"checkExternalFiles" : false
				};
			return postdata;
	    }
		
		function ok(event) {
			if(event) {
				event.stopPropagation();
			}
			if(vm.selectedTS) {
				if(!_.isEmpty(selectedChannelInfo)) {
					$uibModalInstance.close({"selectedTaskspace" : vm.selectedTS,"autoPostAnns" : vm.autoPostAnns});
				} else if(!_.isEmpty(asanaconfig)) {
					$uibModalInstance.close(vm.selectedTS);
				} else if(!_.isEmpty(moveObjectInfo)) {
					var postdata = {
							"fromTaskspaceId" : 	moveObjectInfo.currentTaskspace.id,
							"fromClientId" : moveObjectInfo.currentTaskspace.clientId,
							"resourceId" : moveObjectInfo.tsObj.objectId,
							"resourceClientId" : moveObjectInfo.tsObj.clientId,
							"toTaskspaceId" : 	vm.selectedTS.id,
							"toClientId" : vm.selectedTS.clientId,
							"actionOnAnnotations" : moveObjectInfo.actionOnAnnotations,
							"fromSectionId" : moveObjectInfo.tsObj.sectionId,
							"toSectionId" : vm.selectedTSSection.id
							
						};
					$uibModalInstance.close(postdata);
				} else if(!_.isEmpty(addObjectsFromDocsInfo) && addObjectsFromDocsInfo.action === "AddObjectsTOTS") {
					//$uibModalInstance.close(vm.selectedTS);
					var text = "Are you sure you want to add selected documents to the taskspace '"+vm.selectedTS.name+"' ?";
					if(addObjectsFromDocsInfo.selectedObjects.length == 1) {
						text = "Are you sure you want to add selected document '"+addObjectsFromDocsInfo.selectedObjects[0].displayName+"' to the taskspace '"+vm.selectedTS.name+"' ?";
					}
					
					var confirm = VDVCConfirmService.open({title : "CONFIRM", text : text});
					confirm.result.then(function () {
			        	var postdata = preProcessAddToTaskSpacePostdata();
						addItemToTaskSpace(postdata);
				    });
				} else {
					if(item && item.global) {
						var msg = "Documents in the Common Repository cannot be added to Taskspace. A local copy of the document will be saved.";
						globlaDocSaveConfirmation(msg);
						return false;
					}
					var postdata = {
							"id" : 	vm.selectedTS.id,
							"clientId" : vm.selectedTS.clientId,
							"objects" : [{
								"type" : item._type,
								"objectId" : item.id,
								"clientId" : item.clientId,
								"sectionId" : vm.selectedTSSection.id
							}],
							checkExternalFiles : false
						};
					addItemToTaskSpace(postdata);
				}
			}
		}

		function cancel() {
			$uibModalInstance.dismiss('cancel');
		}
		
		getAllTaskSpaces();
		
	}
	
})();
