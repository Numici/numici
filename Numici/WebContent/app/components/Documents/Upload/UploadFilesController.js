;(function() {
	'use strict'; 
	
	angular.module('vdvcApp').controller('UploadFileModalCtrl',
			['$rootScope','$scope','$state','$q','$uibModalInstance','_','folder','docTypes','docSubTypes','userService',
			 'SecFilingService','DocFactory','MessageService','$confirm','Upload','uploadFrom','$uibModal',
			 'appData','commonService','EvernoteService','$window','$location','UploadFileFactory','resources',
			 'selectedTsObjectList','selectedTS','selectedTSSection','sessionStorage', 
	        function ($rootScope,$scope,$state,$q, $uibModalInstance,_,folder,docTypes,docSubTypes,userService,
	        		SecFilingService,DocFactory,MessageService,$confirm,Upload,uploadFrom,$uibModal,appData,
	        		commonService,EvernoteService,$window,$location,UploadFileFactory,resources,selectedTsObjectList,
	        		selectedTS,selectedTSSection,sessionStorage) {
		
		var appdata = appData.getAppData();
		$scope.btnLable = "UPLOAD";
		$scope.uploadOptionsList = [];
		$scope.uploadFromChoiseList = [];
		$scope.uploadFromChoise = {};
		$scope.companiesList = [];
		$scope.docTypes = angular.copy(docTypes);
		$scope.docTypeSelected = {"type" : $scope.docTypes[$scope.docTypes.length-1].type};
		$scope.docSubTypeSelected = {};
		$scope.docSubTypes = angular.copy(docSubTypes);
		$scope.selectedDocSubTypes = [];
		$scope.selectedTicker = {'tickerObj':null} ;
		$scope.docHierarchy = [] ;
		$scope.isSiteAdmin = appdata["isSiteAdmin"];
		$scope.asGlobalDoc = false;
		
		var uploadSession = sessionStorage.getItem("uploadSession");
		sessionStorage.removeItem("uploadSession");
		var uploadSessionObj;
		if(uploadSession) {
			uploadSessionObj = JSON.parse(uploadSession);
		}
		
		if($state.current.name == "taskspace.list.task") {
			$scope.btnLable = "UPLOAD & ADD";
		}
		
		var getHierarchy = function(id) {
			DocFactory.getDocHierarchy(id,function(docHierarchy) {
				$scope.docHierarchy =  docHierarchy;
			});  
		};
		
		var fileInfo = {};
		
		fileInfo.fldrId = folder.folderId;
		
		function init() {
			$scope.uploadOptionsList = UploadFileFactory.getUploadOptions();
			if(!_.isEmpty($scope.uploadOptionsList)) {
				var defaultUploadOption = _.findWhere($scope.uploadOptionsList,{'key':uploadFrom.from});
				var enabledUploadOption = _.findWhere($scope.uploadOptionsList,{"isEnabled": true});
				if(!_.isEmpty(defaultUploadOption) && defaultUploadOption.isEnabled) {
					$scope.uploadFromChoise.from = defaultUploadOption;
				} else if(!_.isEmpty(enabledUploadOption)) {
					$scope.uploadFromChoise.from = enabledUploadOption;
				}
			}
		}
		init();
		   
		$scope.refreshTickers = function(searchKey) {
			 if(!_.isEmpty(searchKey)) {
				SecFilingService.getCompaniesList({"searchTxt":searchKey}).then(function(resp){
				    if(resp.status == 200 && resp.data.Status) {
			    		$scope.companiesList = resp.data.Company;
			    		if(uploadSessionObj && uploadSessionObj.selectedTicker) {
			    			_.each($scope.companiesList,function(company){
			    				if(company.companyName == uploadSessionObj.selectedTicker.companyName) {
			    					company.selected = true;
			    				}
			    			});
						}
			    	}
			    });
			}
		};
		
		$scope.clear = function ($event) {
			if($event) {
				$event.stopPropagation(); 
			}
			$scope.selectedTicker.tickerObj = null;
		};
		
		$scope.BrowseFolders = function (size) {
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
			    			  "folderId" :  fileInfo.fldrId,
			    			  "btnLable" : "SELECT",
			    			  "action" : "Browse",
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
			    		  return DocFactory.getDocsUnderFolder(fileInfo.fldrId);
			    	  }
			      }
			    });
			
			modalInstance.result.then(function (data) {
				fileInfo.fldrId = data.moveTo.id;
				if(data.moveTo.isLink) {
					fileInfo.fldrId = data.moveTo.linkSourceFolderId;
				}
				getHierarchy(fileInfo.fldrId);
			}, function () {
			      
			});
		};
		
		$scope.browseFromEvernotes = function (noteBooksList) {
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
				$scope.uploadFilesFromClient(files,null);
			}, function () {
			      
			});
		};
		
		$scope.onDocTypeChange = function() {
			if($scope.docTypeSelected.type) {
				var tempSelectedDocSubTypes = $scope.docSubTypes[$scope.docTypeSelected.type];
				if(!_.isEmpty(tempSelectedDocSubTypes)) {
					$scope.selectedDocSubTypes = tempSelectedDocSubTypes;
					$scope.docSubTypeSelected = {"type" : $scope.selectedDocSubTypes[$scope.selectedDocSubTypes.length-1].type};
				}else {
					$scope.selectedDocSubTypes = [];
					$scope.docSubTypeSelected = {};
				}
			} 
		};
		
		$scope.uploadFiles = function(){
			
			if($scope.selectedTicker.tickerObj ) {
				fileInfo.ticker = $scope.selectedTicker.tickerObj.ticker;
				fileInfo.companyName = $scope.selectedTicker.tickerObj.companyName;
				fileInfo.cik = $scope.selectedTicker.tickerObj.cik;
			}
			
			if($scope.uploadFromChoise.from && $scope.uploadFromChoise.from.key == "uploadDocOptions_ClientSystem") {
				fileInfo.docType = $scope.docTypeSelected.type;
				if($scope.docSubTypeSelected && $scope.docSubTypeSelected.type) {
					fileInfo.subType = $scope.docSubTypeSelected.type;
				} else if(fileInfo.subType) {
					delete fileInfo.subType;
				}
			}
			
			if($scope.isSiteAdmin) {
				fileInfo.isGlobal = $scope.asGlobalDoc;
				if(fileInfo.isGlobal) {
					fileInfo.fldrId = null;
				}
			}
			
			if($scope.uploadFromChoise.from && $scope.uploadFromChoise.from.key == "uploadDocOptions_ClientSystem") {
				angular.element('.uploadFromClientBtn').triggerHandler('click');
			} else if($scope.uploadFromChoise.from.key == "uploadDocOptions_Evernote") {
				EvernoteService.getNotebookList().then(function(resp){
					if(resp.status == 200 && resp.data.Status) {
						if(!resp.data.OAuthErr) {
							var noteBooksList = resp.data.NoteBooks;
				    		$scope.browseFromEvernotes(noteBooksList);
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
					    				uploadSessionLocal["uploadFrom"] = $scope.uploadFromChoise.from;
					    				uploadSessionLocal["selectedFolderId"] = fileInfo.fldrId;
					    				if($scope.selectedTicker.tickerObj ) {
					    					uploadSessionLocal["selectedTicker"] = $scope.selectedTicker.tickerObj;
					    				}
					    				if($scope.isSiteAdmin) {
					    					uploadSessionLocal.asGlobalDoc = $scope.asGlobalDoc;
					    				}
					    				sessionStorage.setItem("uploadSession",JSON.stringify(uploadSessionLocal));
					    				$window.location.href=resp.data.authUrl;
					    			}	
					    		});
						    });
						}
			    	} 
			    });
			}
		};
		
		$scope.uploadFilesFromClient = function(file, errFiles){
			fileInfo.file = file;
			fileInfo.errFiles = errFiles;
			fileInfo.filesFrom = $scope.uploadFromChoise.from.key;
			if($state.current.name == "taskspace.list.task" && (resources && resources.action === "addToTS")) {
				UploadFileFactory.$scope = $rootScope.$new(true);
				UploadFileFactory.$scope.showProgress = false;
				UploadFileFactory.currntFolderId = fileInfo.fldrId;
				UploadFileFactory.$uibModalInstance = $uibModalInstance;
				UploadFileFactory.action = resources.action;
				UploadFileFactory.selectedTS = selectedTS;
				UploadFileFactory.selectedTSSection = selectedTSSection;
				UploadFileFactory.selectedTsObjectList = selectedTsObjectList;
				UploadFileFactory.uploadFiles(fileInfo);
				$uibModalInstance.close();
			} else {
				$uibModalInstance.close(fileInfo);
			}
		};
		
	   $scope.cancel = function () {
		   $uibModalInstance.dismiss('cancel');
	   };
		  
	   if(uploadSessionObj) {
			getHierarchy(uploadSessionObj.selectedFolderId);
			fileInfo.fldrId = uploadSessionObj.selectedFolderId;
			$scope.uploadFromChoise.from = uploadSessionObj.uploadFrom;
			if(uploadSessionObj.selectedTicker) {
				$scope.selectedTicker.tickerObj = uploadSessionObj.selectedTicker;
			}
			if($scope.isSiteAdmin) {
				$scope.asGlobalDoc = uploadSessionObj.asGlobalDoc;
			}
			$scope.uploadFiles();
	   } else {
			getHierarchy(folder.folderId);
	   }
	   $scope.closeProgress = function() {
			$scope.showProgress = false;
	   };
	}]);
})();