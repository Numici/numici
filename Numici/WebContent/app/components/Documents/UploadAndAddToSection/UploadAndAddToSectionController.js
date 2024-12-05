;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('UploadAndAddToSectionController',UploadAndAddToSectionController);
	
	UploadAndAddToSectionController.$inject = ["$scope","$rootScope","$uibModalInstance","_",
	                                "appData","selectedTS","selectedTSSection",
	                                "parentFolder","uploadDocFrom","UploadFileFactory",
	                                "EvernoteService","$confirm","sessionStorage","$window",
	                                "$uibModal","$location"];
	
	function UploadAndAddToSectionController($scope,$rootScope,$uibModalInstance,_,appData,
			selectedTS,selectedTSSection,parentFolder,uploadDocFrom,UploadFileFactory,
			EvernoteService,$confirm,sessionStorage,$window,$uibModal,$location) {
		  var vm = this;
		  var appdata = appData.getAppData();
		  var noSectionObj = {id : null, name : "< No Section >", description : ""};
		  
		  vm.folderId = parentFolder.id;
		  vm.formSubmitted = false;
		  vm.tsSectionsList = [];
		  vm.selectedTSSection = {};
		  
		  vm.ok = uploadDocument; 
		  vm.uploadFilesFromClient = uploadFilesFromClient;
		  vm.cancel = cancel;
		  
		  function cancel() {
		    $uibModalInstance.dismiss('cancel');
		  }
		  
		  var fileInfo = {};
		  fileInfo.fldrId = vm.folderId;
		  function uploadFilesFromClient(file, errFiles,uploadDocFrom) {
			  
			  vm.formSubmitted = true;
			  fileInfo.file = file;
			  fileInfo.errFiles = errFiles;
			  fileInfo.filesFrom = uploadDocFrom;
			  
			  UploadFileFactory.$scope = $rootScope.$new(true);
			  UploadFileFactory.$scope.showProgress = false;
			  UploadFileFactory.currntFolderId = vm.folderId;
			  UploadFileFactory.$uibModalInstance = $uibModalInstance;
			  UploadFileFactory.action = "addToTS";
			  UploadFileFactory.selectedTS = {"id" : selectedTS.id,"clientId" : selectedTS.clientId};;
			  UploadFileFactory.selectedTSSection = vm.selectedTSSection;
			  UploadFileFactory.uploadFiles(fileInfo);
			  vm.formSubmitted = false;
			  $uibModalInstance.close();
		  }
		  
		  function browseFromEvernotes (noteBooksList,TSSection,uploadDocFrom) {
				var modalInstance = $uibModal.open({
				      animation: $scope.animationsEnabled,
				      templateUrl: 'app/components/Documents/Evernote/BrowseEvernotes/browseFromEvernotes.html',
				      controller: 'BrowseFromEvernotesController',
				      controllerAs: 'vm',
				      appendTo : $('.rootContainer'),
				      backdrop: 'static',
				      resolve: {
				    	  fileInfo : fileInfo,
				    	  noteBooksList : {noteBooksList : noteBooksList}
				      }
				    });
				
				modalInstance.result.then(function (evernotes) {
					var evernoteids = [];
					var files = [];
					_.each(evernotes,function(evernote){
						files.push({"guid":evernote.guid,"name":evernote.title});
					});
					uploadFilesFromClient(files,null,uploadDocFrom);
				}, function () {
				      
				});
			}
			
			function uploadEvernoteAndAddToTS(TSSection,uploadDocFrom) {
				EvernoteService.getNotebookList().then(function(resp){
					if(resp.status == 200 && resp.data.Status) {
						if(!resp.data.OAuthErr) {
							var noteBooksList = resp.data.NoteBooks;
				    		browseFromEvernotes(noteBooksList,TSSection,uploadDocFrom);
						} else {
							var confirmText = "";
							switch(resp.data.EverNoteStatus) {
								case "NoAuth" :
									confirmText = "Your evernote account is not authorized with 'numici'. Do you want to Authorize to access your Evernote account";
									break;
								case "Invalid" :
									confirmText = "Authentication token is not valid. Do you want to Re-Authorize to access your Evernote account";
									break;
								case "Expired" :
									confirmText = "User authentication time expired. Do you want to Re-Authorize to access your Evernote account";
									break;
							}
								
				    		$confirm({text: confirmText})
					        .then(function() {
					        	var postdata = {"redirectURL" : $location.$$absUrl};
					        	EvernoteService.requestUserAuthrization(postdata).then(function(resp){
					    			if(resp.status == 200 && resp.data.authUrl) {
					    				var uploadSessionLocal = {};
					    				uploadSessionLocal["uploadFrom"] = uploadDocFrom;
					    				uploadSessionLocal["selectedFolderId"] = fileInfo.fldrId;
					    				uploadSessionLocal["TSSection"] = TSSection;
					    				sessionStorage.setItem("uploadSession",JSON.stringify(uploadSessionLocal));
					    				$window.location.href=resp.data.authUrl;
					    			}	
					    		});
						    });
						}
			    	} 
			    });
			}
			
			function uploadDocument() {
				vm.formSubmitted = true;
				if(uploadDocFrom.key == "uploadDocOptions_ClientSystem") {
					angular.element('#upload-from-section').triggerHandler('click');
				} else if(uploadDocFrom.key == "uploadDocOptions_Evernote"){
					uploadEvernoteAndAddToTS(vm.selectedTSSection,uploadDocFrom.key);
				}
				vm.formSubmitted = false;
			}
		  	  
			function initUploadDoc() {
				vm.tsSectionsList = angular.copy(selectedTS.sections);
				if(_.isArray(vm.tsSectionsList) && !_.isEmpty(vm.tsSectionsList)) {
					vm.tsSectionsList.unshift(noSectionObj);
				}
				vm.selectedTSSection = selectedTSSection.id != null ? selectedTSSection : (!_.isEmpty(vm.tsSectionsList) ? vm.tsSectionsList[0] : {});
			}
			initUploadDoc();
	}
})();