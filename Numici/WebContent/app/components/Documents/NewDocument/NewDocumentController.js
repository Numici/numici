;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('NewDocumentController',NewDocumentController);
	
	NewDocumentController.$inject = ["$scope","$state","$uibModalInstance","DocFactory",
	                                "VDVCConfirmService","VDVCAlertService","_","SecFilingService",
	                                "appData","commonService","selectedTS","selectedTSSection",
	                                "parentFolder","docType","UploadFileFactory","DocViewerService",
	                                "TaskSpaceService"];
	
	function NewDocumentController($scope,$state,$uibModalInstance,DocFactory,VDVCConfirmService,
			VDVCAlertService,_,SecFilingService,appData,commonService,selectedTS,selectedTSSection,
			parentFolder,docType,UploadFileFactory,DocViewerService,TaskSpaceService) {
		  var vm = this;
		  var appdata = appData.getAppData();
		  var docLockDuration = 0;
		  var clientId = appdata["OrganizationId"];
		  var resources = {"action" : "addToTS"};
		  var noSectionObj = {id : null, name : "< No Section >", description : ""};
		  
		  vm.headerLable = docType.key == "VidiViciNotes" ? "New Document" : "New Note";
		  vm.btnLable = "CREATE";
		  vm.noteName = '';
		  vm.folderId = parentFolder.id;
		  vm.isPrivate = false;
		  vm.isEditable = true;
		  vm.formSubmitted = false;
		  vm.tsSectionsList = [];
		  vm.selectedTSSection = {};
		  
		  vm.ok = createDocument; 
		  vm.cancel = cancel;
		  
		  
		  function cancel() {
		    $uibModalInstance.dismiss('cancel');
		  }
		  
		  function getObjectLock(existingDocId,cb) {
			  vm.formSubmitted = true;
			  DocFactory.getDocLock(existingDocId,clientId,docLockDuration).then(function(resp){
				  if(resp.status == 200 && resp.data.Status) {
					  if(typeof cb == "function") {
						  cb(resp);
					  }
				  }
			  })['finally'](function() {
				  vm.formSubmitted = false;
			  });
		  }
		  
		  function createDocument() {
			  if(!_.isEmpty(vm.noteName)) {
				  vm.formSubmitted = true;
				  if(docType.key == "Notes") {
					  var postdata = {};
					  postdata["id"] = selectedTS.id;
					  postdata["name"] = vm.noteName;
					  postdata["clientId"] = selectedTS.clientId;
					  postdata["sectionId"] = vm.selectedTSSection.id;
					  TaskSpaceService.newNote(postdata).then(function(resp){
						  if(resp.status == 200 && resp.data.Status) {
							  if(_.isArray(resp.data.Results) && !_.isEmpty(resp.data.Results) && resp.data.Results[0].objectId) {
								  DocViewerService.docViewModeData = {'docId': resp.data.Results[0].objectId,'viewMode':'Edit'};
							  }
							  $uibModalInstance.close(resp.data.Results);
						  }
					  })['finally'](function() {
						  vm.formSubmitted = false;
					  });
				  } else if(docType.key == "VidiViciNotes") {
					  var postdata = {};
					  postdata["context"] = commonService.getCurrentContext();
					  postdata["name"] = vm.noteName;
					  postdata["clientId"] = clientId;
					  postdata["parentFolderId"] = vm.folderId;
					  postdata["content"] = "";
					  postdata["isPrivate"] = vm.isPrivate;
					  postdata["isEditable"] = vm.isEditable;
					  postdata["docType"] = docType.key;
					  postdata["overwrite"] = false;
					  
					  var data = [{
						  "isSecDocument" : false,
						  "documentName" : vm.noteName,
						  "folderId" : vm.folderId,
						  "clientId" : clientId
					  }];
					  DocFactory.isDocPresentList(data).then(function(response){
						  if(response.status == 200 && response.data.Status) {
							  var isExist = _.findWhere(response.data.Notes,{"isExist":true});
							  if(isExist) {
								  var docPresentCnfMessage = "The folder already has a file named '"+vm.noteName+"'.<br/><br/>Click 'OK' to replace the file.";
								  var VDVCConfirmModalInstance;
								  VDVCConfirmModalInstance = VDVCConfirmService.open({text : docPresentCnfMessage,title : "CONFIRM"});
								  VDVCConfirmModalInstance.result.then(function() {
									  vm.formSubmitted = true;
									  postdata.id = response.data.Notes[0].existingDocId;
									  postdata.overwrite = true;
									  getObjectLock(postdata.id,function(resp){
										  var docLockId = resp.data.LockId;
										  if(docLockId != null) {
											  postdata.lockId = docLockId;
											  CreateNote(postdata,response.data.Notes[0].existingDocId);
										  } else {
											  var text = 'Unable to replace document as '+resp.data.LockOwner+' is currently editing the file';
											  VDVCAlertService.open({text:text});
										  }
									  });
								  });
							  } else {
								  CreateNote(postdata);
							  }
						  }
					  })['finally'](function() {
						  vm.formSubmitted = false;
					  });
				  }
				  
			  }
		  }
		  
		  function CreateNote(postdata,docId) {
			  vm.formSubmitted = true;
			  DocFactory.autoSaveDocument(postdata).then(function(resp){
					if (resp.status ==200 && resp.data.Status) {
						if($state.current.name == "taskspace.list.task" && (resources && resources.action === "addToTS")) {
							if(_.isEmpty(docId) && resp.data.Notes) {
								docId = resp.data.Notes.id;
							}
							DocViewerService.docViewModeData = {'docId': docId,'viewMode':'Edit'};
							UploadFileFactory.currntFolderId = vm.folderId;
							UploadFileFactory.uploadedDocIds.push({"id" : docId});
							UploadFileFactory.$uibModalInstance = $uibModalInstance;
							UploadFileFactory.action = resources.action;
							UploadFileFactory.selectedTS = {"id" : selectedTS.id,"clientId" : selectedTS.clientId};
							UploadFileFactory.selectedTSSection = vm.selectedTSSection;
							UploadFileFactory.refreshObjectsAndAddToTS();
						} else {
							$uibModalInstance.close(resp.data.Notes);
						}
					}
				})['finally'](function() {
					vm.formSubmitted = false;
				});
		  }
		  
		  function getDocLockDuration() {
			  commonService.getNavMenuItems({"type":"ObjLocking","isActive":true}).then(function(resp){
				  if(resp.status == 200 && resp.data.Status) {
					  var ObjLockingList = resp.data.listAppKeyValues;
					  var docLockDurationObj = _.findWhere(ObjLockingList,{'key':'DocLockDuration'});
					  if(docLockDurationObj) {
						  docLockDuration = docLockDurationObj.value
					  }
				  }
			  });  
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
		  
		  function initNewDoc() {
			  getDocLockDuration();
			  vm.tsSectionsList = angular.copy(selectedTS.sections);
			  if(_.isArray(vm.tsSectionsList) && !_.isEmpty(vm.tsSectionsList)) {
				  vm.tsSectionsList.unshift(noSectionObj);
			  }
			  vm.selectedTSSection = selectedTSSection.id != null ? selectedTSSection : (!_.isEmpty(vm.tsSectionsList) ? vm.tsSectionsList[0] : {});
		  }
		  initNewDoc();
	}
})();