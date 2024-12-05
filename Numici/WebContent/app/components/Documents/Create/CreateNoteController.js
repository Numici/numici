;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('CreateNoteController',CreateNoteController);
	
	CreateNoteController.$inject = ["$scope","$state","$uibModalInstance","DocFactory","folderId",
	                                "VDVCConfirmService","VDVCAlertService","_","SecFilingService","appData",
	                                "commonService","resources","selectedTS","selectedTSSection","selectedTsObjectList",
	                                "UploadFileFactory","DocViewerService"];
	
	function CreateNoteController($scope,$state,$uibModalInstance,DocFactory,folderId,VDVCConfirmService,
			VDVCAlertService,_,SecFilingService,appData,commonService,resources,selectedTS,selectedTSSection,
			selectedTsObjectList,UploadFileFactory,DocViewerService) {
		  var vm = this;
		  var appdata = appData.getAppData();
		  var docLockDuration = 0;
		  var clientId = appdata["OrganizationId"];
		  
		  vm.btnLable = "CREATE";
		  vm.companiesList = [];
		  vm.selectedTicker = {'tickerObj':null};
		  vm.noteName = '';
		  vm.folderId = folderId;
		  vm.isPrivate = false;
		  vm.isEditable = true;
		  vm.refreshTickers = refreshTickers;
		  vm.clear = clear;
		  vm.ok = createDocument; 
		  vm.cancel = cancel;
		  		  
		  function refreshTickers (searchKey) {
			   if(!_.isEmpty(searchKey)) {
				   SecFilingService.getCompaniesList({"searchTxt":searchKey}).then(function(resp){
				    	if(resp.status == 200 && resp.data.Status) {
				    		vm.companiesList = resp.data.Company;
				    	}
				    });
			   }
		  }
		  
		  function clear ($event) {
			  if($event) {
				  $event.stopPropagation(); 
			  }
			  vm.selectedTicker.tickerObj = null;
		  }
		  
		  function cancel() {
		    $uibModalInstance.dismiss('cancel');
		  }
		  
		  function getObjectLock(existingDocId,cb) {
			  DocFactory.getDocLock(existingDocId,clientId,docLockDuration).then(function(resp){
				  if(resp.status == 200 && resp.data.Status) {
					  if(typeof cb == "function") {
						  cb(resp);
					  }
				  }
			  });
		  }
		  
		  function createDocument() {
			  if(!_.isEmpty(vm.noteName)) {
				  var postdata = {};
				  postdata["context"] = commonService.getCurrentContext();
				  postdata["name"] = vm.noteName;
				  postdata["clientId"] = clientId;
				  postdata["parentFolderId"] = vm.folderId;
				  postdata["content"] = "";
				  postdata["isPrivate"] = vm.isPrivate;
				  postdata["isEditable"] = vm.isEditable;
				  postdata["docType"] = 'VidiViciNotes';
				  postdata["overwrite"] = false;
				  if(vm.selectedTicker.tickerObj ) {
					  postdata["ticker"] = vm.selectedTicker.tickerObj.ticker;
					  postdata["companyName"] = vm.selectedTicker.tickerObj.companyName;
					  postdata["cik"] = vm.selectedTicker.tickerObj.cik;
				  }
				  
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
				  });
			  }
		  }
		  
		  function CreateNote(postdata,docId) {
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
							UploadFileFactory.selectedTS = selectedTS;
							UploadFileFactory.selectedTSSection = selectedTSSection;
							UploadFileFactory.selectedTsObjectList = selectedTsObjectList;
							UploadFileFactory.refreshObjectsAndAddToTS();
						} else {
							$uibModalInstance.close(resp.data.Notes);
						}
					}
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
		  
		  getDocLockDuration();
	}
})();