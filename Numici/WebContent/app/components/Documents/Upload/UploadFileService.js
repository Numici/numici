;(function() {
	'use strict'; 
	angular.module('vdvcApp').factory('UploadFileFactory',UploadFileFactory);
	UploadFileFactory.$inject = ["$rootScope","httpService","appData","_","DocFactory","Upload",
	                             "TaskSpaceService","APIUserMessages","$filter","$uibModal","userService",
	                             "$compile","MessageService"]; 
	function UploadFileFactory ($rootScope,httpService,appData,_,DocFactory,Upload,TaskSpaceService,APIUserMessages,
			$filter,$uibModal,userService,$compile,MessageService) {
		
		var uploadCallCount = 0;
		var uploadFileFactory = {
				getUploadOptions : getUploadOptions,
				uploadFiles : uploadFiles,
				refreshObjectsAndAddToTS : refreshObjectsAndAddToTS,
				$scope : {},
				currntFolderId : "",
				$uibModalInstance : {},
				action : "",
				selectedTS : {},
				selectedTsObjectList : [],
				uploadedDocIds : []
		};
	    return uploadFileFactory;
	    
	    function getUploadOptions() {
	    	var uploadOptionsList = [];
	    	var uploadOptions = userService.getUserSettingsKeyList("uploadDocOptions_");
			if(!_.isEmpty(uploadOptions)) {
				_.each(uploadOptions,function(item){
					var uploadOption = {};
					switch(item) {
					case "uploadDocOptions_ClientSystem":
					case "uploadDocOptions_Evernote":
					case "uploadDocOptions_DropBox":
					case "uploadDocOptions_GoogleDrive":
						uploadOption = userService.getUiSetting(item);
						if(uploadOption.show) {
							uploadOptionsList.push(uploadOption);
						}
						break;
					}
				});
			}
			return uploadOptionsList;
	    }
	    
	    function addObjectsToTaskSpace() {
	    	if(!_.isEmpty(uploadFileFactory.selectedTsObjectList)) {
	    		var objects = [];
				_.each(uploadFileFactory.selectedTsObjectList, function(doc){
					var object = {
						"type" :doc._type,
						"objectId" : doc.id,
						"clientId" : doc.clientId,
						"sectionId" : uploadFileFactory.selectedTSSection.id
					}
					objects.push(object);
				});
				var postdata = uploadFileFactory.selectedTS;
				postdata["objects"] = objects;
				TaskSpaceService.addToTaskSpace(postdata).then(function(resp) {
					if(resp.status == 200 && resp.data.Status) {
						var isNotAdded = _.findWhere(resp.data.Results,{"isAdded" : false});
						if(isNotAdded) {
							APIUserMessages.error(isNotAdded.reason);
						} 
						var results = [];
						_.each(resp.data.Results, function(obj, i) {
							var objectAdded = _.findWhere(uploadFileFactory.selectedTsObjectList,{id : obj.objectId});
							if(obj.isAdded || obj.reason === "Object already added") {
								if(objectAdded) {
									objectAdded.selected = false;
								}
								uploadFileFactory.selectedTsObjectList = _.reject(uploadFileFactory.selectedTsObjectList, function(selectedTsObject){ 
									return selectedTsObject.id == obj.objectId; 
					    		});
							}
							if(obj.isAdded) {
								var newObj = {
									name : objectAdded.displayName,
									objectId : obj.objectId,
									clientId : obj.clientId,
									objectInfo : {
										"datePublished": objectAdded.datePublished,
								        "createdBy": objectAdded.createdBy,
								        "docType": objectAdded.docType,
								        "companyName": objectAdded.companyName,
								        "name": objectAdded.displayName,
								        "isGlobal": objectAdded.isGlobal,
								        "isShared": objectAdded.isShared
									},
									timestamp : null,
									type : obj.objectType,
									sectionId : uploadFileFactory.selectedTSSection.id,
									annotatedDate : obj.annotatedDate
								};
								results.push(newObj);
							}
						});
						
						$rootScope.$broadcast("upload-completed",results);
						if(!_.isEmpty(uploadFileFactory.$uibModalInstance)) {
							if(!_.isEmpty(results)) {
								uploadFileFactory.$uibModalInstance.close(results);
							} else {
								uploadFileFactory.$uibModalInstance.close();
							}
						}
						uploadFileFactory.currntFolderId = "";
						uploadFileFactory.uploadedDocIds = [];
						uploadFileFactory.$uibModalInstance = {};
						uploadFileFactory.$scope = {};
						uploadFileFactory.action = "";
						uploadFileFactory.selectedTS = {};
						uploadFileFactory.selectedTsObjectList = [];
					}
				});
	    	}
	    }
	    
	    function processAndSelectDocs(docs) {
			if(_.isArray(docs)) {
        		for (var i=0;i<docs.length; i++) {
					var doc = docs[i];
					doc._type = "Document";
					doc["displaySize"] = $filter('filesize')(doc.contentLength,DocFactory.sizePrecision);
					DocFactory.setDocTypeBooleanFlags(doc);
					DocFactory.setDocPermissions(doc);
					var selectedDoc = _.findWhere(uploadFileFactory.uploadedDocIds,{id : doc.id});
					if(selectedDoc) {
						uploadFileFactory.selectedTsObjectList.push(doc);
					}
				}
			}
        }
	    
	    function getDocsUnderFolder(folderId,cb) {
			DocFactory.getDocsUnderFolderWithInfo(folderId).then(function (allDocResp) {
				if(typeof cb === "function") {
					cb(allDocResp);
				}
			});
		}
	    
	    function refreshObjectsAndAddToTS() {
	    	getDocsUnderFolder(uploadFileFactory.currntFolderId,function(allDocResp){
    			if(allDocResp.status == 200 && allDocResp.data.Status){
    				processAndSelectDocs(allDocResp.data.Folders.documents);
    				addObjectsToTaskSpace();
    			}
       		});
	    }
	    function fileUpload(file,postdata) {
			postdata["file"] = file;
			   
		    file.upload = Upload.upload({
	            url: 'docUpload',
	            data: postdata
	        });

	        file.upload.then(function (response) {
	            if (response.status == 200 && response.data.Status) {
	            	uploadFileFactory.uploadedDocIds.push({"id" : response.data.uploadDocIds[0]});
	            }
	            uploadCallCount++;
	        	if(uploadCallCount == uploadFileFactory.$scope.multiFiles.length && 
	        			uploadFileFactory.action === "addToTS" && 
	        			uploadFileFactory.uploadedDocIds.length > 0) {
	        		refreshObjectsAndAddToTS();
	        	}
	        }, function (response) {
	            if (response.status > 0)
	            	uploadFileFactory.$scope.errorMsg = response.status + ': ' + response.data;
	        }, function (evt) {
	            file.progress = Math.min(100, parseInt(100.0 * 
	                        evt.loaded / evt.total));
	        });
		}
		
		function evernoteUpload(file,postdata) {
			postdata["evernoteids"] = file.guid;
			Upload.upload({url: 'docUpload',data: postdata}).then(function (response) {
	             if (response.status == 200 && response.data.Status) {
	            	 uploadFileFactory.uploadedDocIds.push({"id" : response.data.uploadDocIds[0]});
	             }
	             uploadCallCount++;
	             if(uploadCallCount == uploadFileFactory.$scope.multiFiles.length && 
	            		 uploadFileFactory.action === "addToTS" && 
	            		 uploadFileFactory.uploadedDocIds.length > 0) {
	            	 refreshObjectsAndAddToTS();
	             }
	        });
		}
		
		function checkSizesAndUpload(filesConfig,fileInfo,file,index,resp) {
			var appdata = appData.getAppData();
			var usedSpaceInBytes = resp.data.UserRootFolderSize;
			var userAllocatedSpaceInBytes = resp.data.UserAllocatedSize;
			if(file.size > appdata.UserSettings.user_MaxUploadFileSize) {
				var maxUploadFileSize = $filter('filesize')(appdata.UserSettings.user_MaxUploadFileSize,DocFactory.sizePrecision);
				var UploadFileSizeErrorMessage = "Error in uploading the file: '"+file.name+"' - Files size is more than the max size ("+maxUploadFileSize+") allowed for upload.";
				MessageService.showErrorMessage("BACKEND_ERR_MSG",[UploadFileSizeErrorMessage]);
			} else if((file.size+usedSpaceInBytes) > userAllocatedSpaceInBytes) {
				var UploadFileSizeErrorMessage = "You have reached the allocated storage quota. Please contact sales@numici.com to upgrade your account. Document '"+file.name+"' can't be uploaded.";
				MessageService.showErrorMessage("BACKEND_ERR_MSG",[UploadFileSizeErrorMessage]);
			} else {
				var postdata = {};
				postdata["parentFolderId"] = fileInfo.fldrId;
				postdata["context"] = fileInfo.context;
				postdata["taskspaceId"] = fileInfo.taskspaceId;
				postdata["tsClientId"] = fileInfo.tsClientId;
				if(fileInfo.ticker) {
					postdata["ticker"] = fileInfo.ticker;
				}
				if(fileInfo.cik) {
					postdata["cik"] = fileInfo.cik;
				}
				if(fileInfo.companyName) {
					postdata["companyName"] = fileInfo.companyName;
				}
				if(fileInfo.isGlobal) {
					postdata["isGlobal"] = fileInfo.isGlobal;
				}
				postdata['overwrite'] = "false";
				if(filesConfig[index].isOverWrite){
					postdata.id = filesConfig[index].existingDocId;
					postdata['overwrite'] = "true";
				}
				if(fileInfo.filesFrom == "uploadDocOptions_ClientSystem") {
					postdata["docType"] = fileInfo.docType ? fileInfo.docType : "OtherDoc";
					if(fileInfo.subType) {
						postdata["subType"] = fileInfo.subType;
					}
					fileUpload(file,postdata);
				} else if(fileInfo.filesFrom == "uploadDocOptions_Evernote") {
					evernoteUpload(file,postdata);
				}
			}
		}
		
	    function upload(filesConfig,fileInfo) {
	    	var appdata = appData.getAppData();
	    	uploadCallCount = 0;
	    	uploadFileFactory.$scope.multiFiles = fileInfo.file;
	    	uploadFileFactory.uploadedDocIds = [];
	    	var uploadContainer = angular.element(document.querySelector('upload-file-progress-bar'));
	    	uploadContainer.remove();
	    	if(fileInfo.filesFrom == "uploadDocOptions_ClientSystem") {
	    		uploadFileFactory.$scope.showProgress = true;
	    		var divElement = angular.element(document.querySelector('.rootContainer'));
				var template = "<upload-file-progress-bar></upload-file-progress-bar>";
				var appendHtml = $compile(template)(uploadFileFactory.$scope);
			    divElement.append(appendHtml);
			}
	    		    	
			angular.forEach(uploadFileFactory.$scope.multiFiles, function(file,index) {
				userService.getUsedSpace().then(function(resp){
					if (resp.status == 200 && resp.data.Status) {
						if(appdata.rootFolderId == resp.data.RootFolder) {
							checkSizesAndUpload(filesConfig,fileInfo,file,index,resp);
						}
					}
				});
			});
		}
	    
	    function OpenConfirmUploadDocModal(file,files,fileInfo) {
			var modalInstance = $uibModal.open({
			      animation: true,
			      templateUrl: 'app/components/Documents/Upload/confirmUploadDocModal.html',
			      controller: 'ConfirmUploadDocModalCtrl',
			      appendTo : $('.rootContainer'),
			      backdrop: 'static',
			      resolve: {
			    	  existedFile : function() {
			    		  return file;
			    	  }
			      }
			});
			modalInstance.result.then(function (obj) {
				switch(obj.selectedOption) {
				case "replaceAll":
					for(var i = 0;i<files.length;i++){
						if(files[i].isExist) {
							files[i].isOverWrite = true;
							files[i].isExist = false;
						}
					}
					break;
				case "replace":
					for(var i = 0;i<files.length;i++){
						if(files[i].documentName == obj["_for"]) {
							files[i].isOverWrite = true;
							files[i].isExist = false;
							break;
						}
					}
					break;
				case "skipAll":
					for(var i = 0;i<files.length;i++){
						if(files[i].isExist) {
							files.splice(i,1);
							fileInfo.file.splice(i,1);
							--i;
						}
					}
					break;
				case "skip":
					for(var i = 0;i<files.length;i++){
						if(files[i].documentName == obj["_for"]) {
							
							files.splice(i,1);
							fileInfo.file.splice(i,1);
							--i;
							break;
						}
					}
					break;
				
				}
				checkIsExistAndUpload(files,fileInfo);
			}, function () {
			      
			});
		}
	    
	    function checkIsExistAndUpload(files,fileInfo) {
	    	var existedFiles = _.where(files, {isExist: true});
	    	if(existedFiles && existedFiles.length > 0){
	    		OpenConfirmUploadDocModal(existedFiles[0],files,fileInfo); 
	    	} else if(fileInfo.file.length > 0){
	    		upload(files,fileInfo);
	    	}
		}
	    
	    function isPdfFile(file) {
	    	let status = false;
	    	try{
	    		if(file.type.toLowerCase() === "application/pdf") {
	    			status = true;
	    		}
	    	} catch (e) {
				// TODO: handle exception
			}
	    	
	    	return true;
	    }
	    
	    function confirmAnnotContext() {
	    	return $uibModal.open({
			      animation: true,
			      templateUrl: 'app/components/Documents/Upload/confirmAnnotationContextModal.html',
			      controller: 'confirmAnnotationContextModalCtrl',
			      appendTo : $('.rootContainer'),
			      backdrop: 'static',
			      size: 'md',
			      windowClass: 'uploadFileWindow'
			    });
	    }
	    
	    function hasPdfFile(files) {
	    	let hasPdfFile = false;
	    	for(var i=0;i<files.length;i++){
	    		hasPdfFile = isPdfFile(files[i]);
	    		if(hasPdfFile) {
	    			break;
	    		}
	    	}
	    	
	    	return hasPdfFile;
	    }
	    
	    function preProcessFilesAndUpload(fileInfo,contextInfo) {
	    	var filesData = [];
	    	fileInfo = _.extend(fileInfo,contextInfo);
        	for(var i=0;i<fileInfo.file.length;i++){
        		var data = {
	    				"isSecDocument" : false,
	    				"documentName" : fileInfo.file[i].name,
	    				"folderId" : fileInfo.fldrId,
	    				"isGlobal" : fileInfo.isGlobal,
	    				"docType" : fileInfo.docType
	    		};
        		if(fileInfo.subType) {
        			data["subType"] = fileInfo.subType;
        		}
        		if(fileInfo.filesFrom && fileInfo.filesFrom === "uploadDocOptions_Evernote") {
        			data["evernoteGuid"] = fileInfo.file[i].guid;
        		}
        		filesData.push(data);
	        }
        	
        	DocFactory.isDocPresentList(filesData).then(function(response){
        		if(response.status == 200 && response.data.Status) {
        			checkIsExistAndUpload(response.data.Notes,fileInfo);
				}
			}); 
	    }
	    
	    
	    function uploadFiles(fileInfo) {
	    	if (fileInfo.file) {
	    		let contextInfo = {
	    			"context" : "document"	
	    		};
	    		if(!_.isEmpty(uploadFileFactory.selectedTS) && hasPdfFile(fileInfo.file)) {
	    			confirmAnnotContext().result.then(function (results) {
	    				contextInfo["context"] = "taskspace";
	    				contextInfo["taskspaceId"] = uploadFileFactory.selectedTS.id;
	    				contextInfo["tsClientId"] = uploadFileFactory.selectedTS.clientId;
	    				preProcessFilesAndUpload(fileInfo,contextInfo);
	    			}, function () {
	    				preProcessFilesAndUpload(fileInfo,contextInfo);
	    			});
	    		} else {
	    			preProcessFilesAndUpload(fileInfo,contextInfo);
	    		}
	        	
	    	}
	    }
	}
})();