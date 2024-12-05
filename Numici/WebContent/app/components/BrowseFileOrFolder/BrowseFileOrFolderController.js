;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('BrowseFileOrFolderController',BrowseFileOrFolderController);
	
	BrowseFileOrFolderController.$inject = ['$state','$scope','$uibModal', '$uibModalInstance','MessageService',
	                                        'resources','foldersList','DocFactory','SecFilingService','_',
	                                        'appData','TaskSpaceService','APIUserMessages','orderByFilter',
	                                        '$filter','Upload','$timeout','DocViewerService','UploadFileFactory',
	                                        'AddExternlFileValidationService','$confirm','ActionItemsService',
	                                        'OneDriveService','AnnotationService'];

	function BrowseFileOrFolderController($state,$scope,$uibModal,$uibModalInstance,MessageService,resources,
			foldersList,DocFactory,SecFilingService,_,appData,TaskSpaceService,APIUserMessages,orderBy,$filter,
			Upload,$timeout,DocViewerService,UploadFileFactory,AddExternlFileValidationService,$confirm,
			ActionItemsService,OneDriveService,AnnotationService) {
		var vm = this;
		var appdata = appData.getAppData();
		// Instance variables
		var docButtonsList = [];
		var showAddFolder = resources.showAddFolder ? resources.showAddFolder : false;
		var showNewDoc = resources.showNewDoc ? resources.showNewDoc : false;
		var showUploadDoc = resources.showUploadDoc ? resources.showUploadDoc : false;
		var uploadDocIds = [];
		var disableExternalFolders = false;
		var disableSharedFolders = false;
		
		vm.selectedTSSection = !_.isEmpty(resources.selectedTSSection) ? resources.selectedTSSection : {};
		vm.submitLable = resources.btnLable ? resources.btnLable : "ADD";
		vm.fileOrFolderSearchString = "";
		vm.source = resources.source;
		vm.resourceAction = resources.action;
		vm.tsId = resources.tsId;
		vm.clientId = resources.clientId;
		vm.tsSectionsList = !_.isEmpty(resources.tsSectionsList) ? resources.tsSectionsList : [];
		vm.sizePrecision = DocFactory.sizePrecision;
		vm.foldersList = foldersList;
		vm.docsList;
		vm.currntFolder = !_.isEmpty(resources.folderId) ? {'id':resources.folderId} : angular.copy(appdata.rootFolder);
		vm.fldrHierarchy = [];
		
		vm.fldrlistHeaders = DocFactory.fldrlistHeaders;
		vm.doclistHeaders =  DocFactory.doclistHeaders;
	    
		vm.docField =  vm.doclistHeaders[0].value;
		vm.docFieldDecending =  false;
	    
		vm.fldrField =  vm.fldrlistHeaders[0].value;
		vm.fldrFieldDecending = false;
		vm.checkAllDocs = {"selected":false};
		vm.checkAllFolders = {"selected":false};
		vm.selectedObjectList = [];
		
		vm.supportMultiSelectFolder = resources.supportMultiSelectFolder ? resources.supportMultiSelectFolder : false;
		vm.supportMultiSelectDoc = resources.supportMultiSelectDoc ? resources.supportMultiSelectDoc : false;
		vm.enableAction = resources.enableAction ? resources.enableAction : "Any";
		vm.disableDoc = resources.disableDocuments ? resources.disableDocuments : false;
		vm.validateFolderPerms = resources.validateFolderPerms ? resources.validateFolderPerms : false;
		
		// Methods
		vm.getFolderListCount = getFolderListCount;
		vm.fileOrFolderSearchFilter = fileOrFolderSearchFilter;
		vm.getDocsListCount = getDocsListCount;
		vm.selectColumn = selectColumn;
		vm.sortByfield = sortByfield;
		vm.isShared = isShared;
		vm.getFileIcon = getFileIcon;
		vm.openParent = openParent;
		vm.openFolder = openFolder;
		vm.disableFolder = disableFolder;
		vm.disableDocument = disableDocument;
		vm.selectAllFolders = selectAllFolders;
		vm.selectAllDocs = selectAllDocs;
		vm.selectDocOrFolder = selectDocOrFolder;
		vm.disableSubmitBtn = disableSubmitBtn;
		vm.showDocsButton = showDocsButton;
		vm.disableDocsButton = disableDocsButton;
		vm.OpenFolderModal = OpenFolderModal;
		vm.OpenNoteModal = OpenNoteModal;
		vm.OpenUploadModal = OpenUploadModal;
		vm.ok = ok;
		vm.cancel = cancel;
		vm.popupForAddToTaskspace = popupForAddToTaskspace;
		
		processFolders(vm.foldersList);
		
		getHierarchy(vm.currntFolder.isLink ? vm.currntFolder.linkSourceFolderId : vm.currntFolder.id);
		
		if(!_.isEmpty(resources.defaultUploadFolderId)) {
			vm.currntFolder.id = resources.defaultUploadFolderId;
		}
		
		
		/*if(_.isEmpty(vm.selectedObjectList) && vm.currntFolder.id == appdata.rootFolder.id) {
			selectRootFolder();
		}*/
		
		function getFolderListCount() {
			var shownedFoldersCount = $('#folders-table tbody tr.fldr-row').length;
			return shownedFoldersCount;
		}
		
		function fileOrFolderSearchFilter(fileOrFolder) {
			var status = false;
			var fileOrFolderListHeaders = [];
			if(fileOrFolder._type == "Folder") {
				fileOrFolderListHeaders = vm.fldrlistHeaders;
			}
			if(fileOrFolder._type == "Document") {
				fileOrFolderListHeaders = vm.doclistHeaders;
			}
			for(var i=0;i<fileOrFolderListHeaders.length;i++) {
				var fileOrFolderHeader = fileOrFolderListHeaders[i];
				var fieldValue = fileOrFolder[fileOrFolderHeader.DValue];
				if(vm.fileOrFolderSearchString.trim() == "" || 
						(fileOrFolderHeader.checked && fileOrFolderHeader.type != "Date" && 
								fieldValue && _.isString(fieldValue)&& fieldValue.toLowerCase().indexOf(vm.fileOrFolderSearchString.toLowerCase()) != -1)) {
					status = true;
					break;
				}
			}
			return status;
		}
		
		function getDocsListCount() {
			var shownedDocsCount = $('#docs-table tbody tr.doc-row').length;
			return shownedDocsCount;
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
		};
		
		function sortByfield (hdr,type) {
	    	switch(type) {
	    	case "folder":
	    		if(vm.fldrField == hdr.value) {
	    			vm.fldrFieldDecending = !vm.fldrFieldDecending;
	    		} else {
	    			vm.fldrFieldDecending = false;
	    		}
	    		vm.fldrField =  hdr.value;
	    		vm.foldersList =  orderBy(vm.foldersList, vm.fldrField, vm.fldrFieldDecending);
	    		break;
	    	case "doc":
	    		if(vm.docField == hdr.value) {
	    			vm.docFieldDecending =  !vm.docFieldDecending;
	    		} else {
	    			vm.docFieldDecending = false;
	    		}
	    		vm.docField =  hdr.value;
	    	    vm.docsList =  orderBy(vm.docsList, vm.docField, vm.docFieldDecending);
	    		break;
	    	}
	    }
	    
		function selectRootFolder() {
			if(vm.source) {
				if((angular.isArray(vm.source) && vm.source[0].parentFolderId != appdata.rootFolder.id) || (!angular.isArray(vm.source) && vm.source.parentFolderId != appdata.rootFolder.id)) {
					vm.selectedObjectList.push(vm.currntFolder);
				}
			} else if(resources.action == "Browse" || resources.action == "Browse For TS Default") {
				vm.selectedObjectList.push(vm.currntFolder);
			}
		}
		
		function isShared (doc) {
			var status = false;
			if((doc.createdBy && $scope.userinfo["UserId"] && doc.createdBy.toLowerCase() !== $scope.userinfo["UserId"].toLowerCase()) || doc.shared) {
				status = true;
			}
			return status;
		}
		
		function getFileIcon(doc) {
	    	return DocFactory.getFileImgIcon(doc.name,doc.docType);
	    }
		
		function getDocsUnderFolder(folderId,cb) {
			DocFactory.getDocsUnderFolderWithInfo(folderId).then(function (allDocResp) {
				if(typeof cb === "function") {
					cb(allDocResp);
				}
			});
		}
		
		function openParent(event) {
			if(event) {
				event.stopPropagation();
			}
			var length = vm.fldrHierarchy.length;
			if((length-2) > -1) {
				vm.openFolder(vm.fldrHierarchy[length-2]);
			} else {
				vm.openFolder(appdata.rootFolder);
			}
		}
		
		function openFolder(folder) {
			vm.currntFolder = folder;
			var folderId = folder.id;
			if(folder.isLink) {
				folderId = folder.linkSourceFolderId;
			}
			getHierarchy(folderId);
			vm.selectedObjectList = [];
			/*if(_.isEmpty(vm.selectedObjectList) && vm.currntFolder.id == appdata.rootFolder.id) {
				selectRootFolder();
			}*/
			if(_.isEmpty(vm.selectedObjectList) && (vm.enableAction == 'Folder' || vm.enableAction == 'Any')) {
				selectDocOrFolder(vm.currntFolder);
			}
			getDocsUnderFolder(folderId,function(allDocResp){
				processFolders(allDocResp);
			});
		}
		
		function disableFolder(folder) {
			var status = false;
			if(folder.name === "WebResources" && folder.parentFolderId == appdata.rootFolder.id) {
				status = true;
			}
			if(disableExternalFolders && 
					(!_.isEmpty(folder["boxId"]) 
							|| !_.isEmpty(folder["dropBoxUserId"])
							|| !_.isEmpty(folder["oneDriveId"]))) {
				status = true;
			}
			if(disableSharedFolders && folder.createdBy !== appdata.UserId) {
				status = true;
			}
			if(vm.validateFolderPerms && folder.perms && !folder.perms.edit) {
				status = true;
			}
			if(vm.source && angular.isArray(vm.source)) {
				var sourceObj = _.findWhere(vm.source,{id : folder.id}); 
				if(sourceObj) {
					status = true;
				}
			} else if(vm.source && !angular.isArray(vm.source) && vm.source.id == folder.id) {
				status = true;
			}
			return status;
		}
		
		function disableDocument(doc) {
			var status = false;
			if((vm.enableAction !== 'Document' && vm.enableAction !== 'Any') || vm.disableDoc || doc.docType === "WebResource") {
				status = true;
			}
			return status;
		}
		
		function removeRootFolder() {
			var isRootFolderSelected = _.any(vm.selectedObjectList, function(item){ 
				return _.isEqual(item, _.findWhere(vm.selectedObjectList, {
					  id: vm.currntFolder.id
				}));
			});
			if(isRootFolderSelected) {
				vm.selectedObjectList = _.without(vm.selectedObjectList, _.findWhere(vm.selectedObjectList, {
					id: vm.currntFolder.id
				}));
			}
		}
		
		function selectAllFolders() {
			removeRootFolder();
			angular.forEach(vm.foldersList, function(itm) { 
    			itm.selected = vm.checkAllFolders.selected;
    			vm.selectedObjectList = _.reject(vm.selectedObjectList, function(folder){ 
	    			return folder.id == itm.id; 
	    		});
    		});
	    	if(vm.checkAllFolders.selected) {
	    		angular.forEach(vm.foldersList, function(folder){ 
	    			if(!disableFolder(folder)) {
	    				folder.selected = vm.checkAllFolders.selected;
		    			vm.selectedObjectList.push(folder);
	    			}
	    		});
	    	}
		}
		
		function selectAllDocs() {
			removeRootFolder();
			angular.forEach(vm.docsList, function(itm){ 
    			itm.selected = vm.checkAllDocs.selected;
    			vm.selectedObjectList = _.reject(vm.selectedObjectList, function(obj){ 
	    			return obj.id == itm.id; 
	    		});
    		});
	    	if(vm.checkAllDocs.selected) {
	    		angular.forEach(vm.docsList, function(doc){ 
					if(!disableDocument(doc)) {
						doc.selected = vm.checkAllDocs.selected;
						if(!_.isEmpty(vm.selectedTSSection)) {
		    				doc.sectionId = vm.selectedTSSection.id;
		    			}
		    			vm.selectedObjectList.push(doc);
					}
	    		});
	    	}
		}
		
		function selectDocOrFolder(obj,cb) {
			removeRootFolder();
			if((obj._type == "Document" && vm.supportMultiSelectDoc) || (obj._type == "Folder" && vm.supportMultiSelectFolder)) {
				var isDocSelected = _.any(vm.selectedObjectList, function(item){ 
					return _.isEqual(item, _.findWhere(vm.selectedObjectList, {
						  id: obj.id
					}));
				});
				if(isDocSelected) {
					vm.selectedObjectList = _.without(vm.selectedObjectList, _.findWhere(vm.selectedObjectList, {
						id: obj.id
					}));
					obj.selected = false;
				} else {
					obj.selected = true;
					if(!_.isEmpty(vm.selectedTSSection)) {
						obj.sectionId = vm.selectedTSSection.id;
	    			}
					vm.selectedObjectList.push(obj);
				}
				var selectedFolders = _.where(vm.selectedObjectList, {_type:"Folder"});
				var selectedDocs = _.where(vm.selectedObjectList, {_type:"Document"});
				if(vm.selectedObjectList.length > 0 && vm.foldersList.length == selectedFolders.length) {
					vm.checkAllFolders.selected = true;
				} else {
					vm.checkAllFolders.selected = false;
				}
				if(vm.selectedObjectList.length > 0 && vm.docsList.length == selectedDocs.length) {
					vm.checkAllDocs.selected = true;
				} else {
					vm.checkAllDocs.selected = false;
				}
			} else {
				var isFolderSelected = _.any(vm.selectedObjectList, function(item){ 
					return _.isEqual(item, _.findWhere(vm.selectedObjectList, {
						  id: obj.id
					}));
				});
				if(isFolderSelected) {
					vm.selectedObjectList = _.without(vm.selectedObjectList, _.findWhere(vm.selectedObjectList, {
						id: obj.id
					}));
					obj.selected = false;
					vm.selectedObjectList = [];
				} else {
					if(!_.isEmpty(vm.selectedObjectList)) {
						_.each(vm.selectedObjectList, function(selectedFolder){
							selectedFolder.selected = false;
						});
						vm.selectedObjectList = [];
					}
					obj.selected = true;
					vm.selectedObjectList.push(obj);
				}
			}
			$timeout(function() {
				var ele = $(".link-folder-selected")[0];
				if(ele) {
					ele.scrollIntoView(true);
				}
            },0);
			if(typeof cb === "function"){
				cb();
			}
		}
		
		function disableSubmitBtn() {
			var status = true;
			if(!_.isEmpty(vm.selectedObjectList)) {
				status = false;
				if(vm.source) {
					if(angular.isArray(vm.source) && vm.source[0].parentFolderId == vm.selectedObjectList[0].id) {
						status = true; 
					} else if(angular.isArray(vm.source) && vm.source[0].id == vm.selectedObjectList[0].id) {
						status = true;
					} else if(vm.source.parentFolderId == vm.selectedObjectList[0].id && vm.source.id == vm.selectedObjectList[0].id) {
						status = true;
					}
				}
			}
			return status;
		}
		
		function showDocsButton (key) {
	    	var status = false;
			var docButton = {};
	    	if(!_.isEmpty(docButtonsList)) {
	    		docButton = _.findWhere(docButtonsList,{"key": key});
	    	}
	    	if(docButton && docButton.show && ((key === "researchView_Upload" && showUploadDoc) || 
	    			(key === "researchView_AddDocument" && showNewDoc) ||
	    			(key === "researchView_AddFolder" && showAddFolder))) {
	    		status = true;
	    	}
	    	return status;
	    };
	    
		function disableDocsButton(key) {
			var status = true;
			var docButton = {};
			if(!_.isEmpty(docButtonsList)) {
	    		docButton = _.findWhere(docButtonsList,{"key": key});
	    	}
			if((docButton && docButton.isEnabled) && (vm.currntFolder.root || (vm.currntFolder.perms && vm.currntFolder.perms.edit) || (!vm.currntFolder.perms && vm.currntFolder.id))) {
				if(key === "researchView_Upload") {
					var uploadOptionsList = UploadFileFactory.getUploadOptions();
					if(!_.isEmpty(uploadOptionsList)) {
						var enabledUploadOption = _.findWhere(uploadOptionsList,{"isEnabled": true});
						if(!_.isEmpty(enabledUploadOption)) {
							status = false;
						}
					}
				} else {
					status = false;
				}
			}
			return status;
		}
		
		function OpenFolderModal(size) {
			var modalInstance = $uibModal.open({
			      animation: $scope.animationsEnabled,
			      templateUrl: 'app/components/Documents/Create/newFolderModal.html',
			      controller: 'CreateFolderController',
			      appendTo : $('.rootContainer'),
			      controllerAs : 'vm',
			      backdrop: 'static',
			      size: size,
			      resolve: {
			    	parentId : function() {
			    		return vm.currntFolder.id;
			    	}
			      }
			    });
			modalInstance.result.then(function (newFolder) {
				MessageService.showSuccessMessage("FOLDER_CREATE",[newFolder.name]);
				newFolder._type = "Folder";
				newFolder.perms = {"edit" : true};
				openFolder(newFolder);
			});
		}
		
		function OpenNoteModal (size) {
			var modalInstance = $uibModal.open({
			      animation: $scope.animationsEnabled,
			      templateUrl: 'app/components/Documents/Create/newNoteModal.html',
			      controller: 'CreateNoteController',
			      appendTo : $('.rootContainer'),
			      controllerAs : 'vm',
			      backdrop: 'static',
			      size: size,
			      resolve: {
			    	folderId : function() {
			    		return vm.currntFolder.id;
			    	},
			    	resources : function() {
			    		return {"action" : "addToTS"};
			    	},
			    	selectedTS : function () {
			    		return  {
							"id" : 	vm.tsId,
							"clientId" : vm.clientId,
						};
			    	},
			    	selectedTSSection : function() {
			    		return vm.selectedTSSection;
			    	},
			    	selectedTsObjectList : function () {
			    		return  vm.selectedObjectList;
			    	}
			      }
			    });
			modalInstance.result.then(function (results) {
				if(!_.isEmpty(results)){
					$uibModalInstance.close(results);
				}
			}, function() {
			      
			});
		}
		
		function OpenUploadModal(uploadFrom) {
			var modalInstance = $uibModal.open({
			      animation: $scope.animationsEnabled,
			      templateUrl: 'app/components/Documents/Upload/uploadFileModal.html',
			      controller: 'UploadFileModalCtrl',
			      appendTo : $('.rootContainer'),
			      backdrop: 'static',
			      size: 'md',
			      windowClass: 'uploadFileWindow',
			      resolve: {
			    	  folder : function() {
			    		  return {
			    			  folderId: vm.currntFolder.id,
			    			  folderName:vm.currntFolder.name
			    		  };
			    	  },
			    	  docTypes : function () {
			    		  return  DocFactory.uploadDocTypes;
			    	  },
			    	  docSubTypes : function () {
			    		  return  DocFactory.uploadDocSubTypes;
			    	  },
			    	  uploadFrom : {"from":uploadFrom},
			    	  resources : {"action" : "addToTS"},
			    	  selectedTS : function () {
			    		  return  {
								"id" : 	vm.tsId,
								"clientId" : vm.clientId,
							};
			    	  },
			    	  selectedTSSection : function() {
			    		  return vm.selectedTSSection;
			    	  },
			    	  selectedTsObjectList : function () {
			    		  return  vm.selectedObjectList;
			    	  }
			      }
			    });
			
			modalInstance.result.then(function (results) {
				if(!_.isEmpty(results)){
					$uibModalInstance.close(results);
				} else {
					$uibModalInstance.close();
				}
			}, function () {
			      
			});
		}
		
		function createMoveTosourceObj(source) {
			var obj = {};
			obj.objectType = source._type;
			obj.overwrite = false;
			if(source._type == "Document") {
				obj.documentId = source.id;
				obj.docType = source.docType;
				obj.clientId = source.clientId;
			}
			if(source._type == "Folder") {
				obj.folderId = source.id;
				obj.clientId = appdata["OrganizationId"];
			}
			
			return obj;
		}
		
		function processMoveToData(data) {
			var postdata = {
				"newFolderId" : data.moveTo.id,
				"objectList" : []
			};
			if(data.moveTo.isLink) {
				postdata.newFolderId = data.moveTo.linkSourceFolderId;
			}
			if(angular.isArray(data.source)) {
				_.each(data.source,function(val,index) {
					var obj = createMoveTosourceObj(val);
					postdata.objectList.push(obj);
				});
			} else {
				var obj = createMoveTosourceObj(data.source);
				postdata.objectList.push(obj);
			}
			return postdata;
		}
		
		function BrowseFolders (cb) {
			var modalInstance = $uibModal.open({
			      animation: $scope.animationsEnabled,
			      templateUrl: 'app/components/BrowseFileOrFolder/BrowseFileOrFolder.html',
			      controller: 'BrowseFileOrFolderController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'vm',
			      backdrop: 'static',
			      size: 'md',
			      resolve: {
			    	  resources : function () {
			    		  return {
			    			  "source" : undefined,
			    			  "folderId" :  appdata.rootFolder.id,
			    			  "btnLable" : "SELECT",
			    			  "action" : "Browse For Copy",
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
			    		  return DocFactory.getDocsUnderFolder(appdata.rootFolder.id);
			    	  }
			      }
			    });
			
			modalInstance.result.then(function (data) {
				var copyToFolderId = data.moveTo.id;
				if(copyToFolderId && typeof cb === "function"){
					cb(copyToFolderId);
				}
			}, function () {
			      
			});
		}
		
		function getErroredObjectWithReason(erroredObjects) {
			var erroredObject = {};
			erroredObject = _.findWhere(erroredObjects,function(erroredObject) {
				return (typeof erroredObject.Reason != undefined && erroredObject.Reason != null && erroredObject.Reason !== "");
			});
			return erroredObject;
		}
		
		function handleCopyDocCB(docList,results) {
			var isCopiedFalse = _.findWhere(results,{"isCopied" : false});
			var isCopiedTrue = _.where(results,{"isCopied" : true});
						
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
			if(!_.isEmpty(isCopiedTrue)) {
				var copiedObjects = [];
				_.each(isCopiedTrue,function(item,index) {
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
						"id" : 	vm.tsId,
						"clientId" : vm.clientId,
						"objects" : copiedObjects
					};
				addToTaskSpace(postdata,true,isCopiedTrue);
			}
		}
		
		function copyDocList(docList,copyToFolderId) {
			var objectList = [];
			_.each(docList,function(doc,index) {
				var obj = {
        				"objectId" : doc.objectId,
        				"clientId" : doc.clientId,
        				"withAnnotations" : false
        		};
				obj["newName"] = _.findWhere(vm.selectedObjectList,{"id" : doc.objectId}).name;
				objectList.push(obj);
        	});
			var postdata = {
						"copyToFolderId" : copyToFolderId,
						"objectList" : objectList,
						"copyExternalDocs" : true
					};
			DocFactory.copyDocList(postdata).then(function(resp) {
				 if(resp.status == 200 && resp.data.Status) {
					 handleCopyDocCB(docList,resp.data.resultList);
				 }
			});
		}
		
		function copyExternalFiles(postdata) {
			BrowseFolders(function(copyToFolderId){
				copyDocList(postdata.objects,copyToFolderId);
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
		
		function addToTaskSpaceCB(postdata,resp,isCopiedTrueDocs) {
			var isAddedFalse = _.findWhere(resp.data.Results,{"isAdded" : false});
			var isAddedTrue = _.where(resp.data.Results,{"isAdded" : true});
			if(isAddedFalse && isAddedFalse.reason === "Cannot add external file") {
				var openAddExternlFileValidationModalInstance = AddExternlFileValidationService.openAddExternlFileValidationModal(isAddedFalse.source);
				openAddExternlFileValidationModalInstance.result.then(function (status) {
					if(status === "Copy") {
						copyExternalFiles(postdata);
					} else if(status === "Continue") {
						addToTaskSpace(postdata,false);
					} else if(status === "Cancel") {
						$uibModalInstance.dismiss('cancel');
					}
				}, function () {
					$uibModalInstance.dismiss('cancel');
				});
			} else if(isAddedFalse) {
				APIUserMessages.error(isAddedFalse.reason);
			}
			
			if((!isAddedFalse || isAddedFalse.reason !== "Cannot add external file") && !_.isEmpty(isAddedTrue)) {
				var results = [];
				_.each(isAddedTrue, function(obj, i) {
					var objectAdded = _.findWhere(vm.selectedObjectList,{id : obj.objectId});
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
					        "isShared":  objectAdded.isShared,
					        "docSource": objectAdded.docSource
						},
						timestamp : null,
						type : obj.objectType
					};
					results.push(newObj);
				});
				$uibModalInstance.close(results);
			}
		}
		
		function addToTaskSpace(postdata,checkExternalFiles,isCopiedTrueDocs) {
			postdata.checkExternalFiles = checkExternalFiles;
			var selectedObject = postdata.objects[0];
			var object = {
				"includePdfAnnotations" : postdata.includePdfAnnotations,
				"objectInfo" : {"docType" : selectedObject.type},
				"objectId" : selectedObject.objectId,
				"clientId" : selectedObject.clientId
			};
			if(postdata.objects.length == 1) {
				getDocAnnotations(object,function(annotList){
					if(!_.isEmpty(annotList)) {
						confirmAnnotContextOnAdd(object).result.then(function (selectedOption) {
							if(selectedOption != "empty") {
								postdata["actionOnAnnotations"] = selectedOption;
							} else {
								postdata["actionOnAnnotations"] = null;
							}
							delete postdata['includePdfAnnotations'];
							TaskSpaceService.addToTaskSpace(postdata).then(function(resp) {
								if(resp.status == 200 && resp.data.Status) {
									addToTaskSpaceCB(postdata,resp,isCopiedTrueDocs);
								}
							});
		    			}, function () {
		    				cancel();
		    			});
					} else {
						delete postdata['includePdfAnnotations'];
						TaskSpaceService.addToTaskSpace(postdata).then(function(resp) {
							if(resp.status == 200 && resp.data.Status) {
								addToTaskSpaceCB(postdata,resp,isCopiedTrueDocs);
							}
						});
					}
				});
			} else if(postdata.objects.length > 1) {
				confirmAnnotContextOnAdd(object).result.then(function (selectedOption) {
					if(selectedOption != "empty") {
						postdata["actionOnAnnotations"] = selectedOption;
					} else {
						postdata["actionOnAnnotations"] = null;
					}
					delete postdata['includePdfAnnotations'];
					TaskSpaceService.addToTaskSpace(postdata).then(function(resp) {
						if(resp.status == 200 && resp.data.Status) {
							addToTaskSpaceCB(postdata,resp,isCopiedTrueDocs);
						}
					});
    			}, function () {
    				cancel();
    			});
			}
		}
		
		function getExcelFileName(cb) {
			ActionItemsService.getExcelFileName(vm.source.clientId,vm.source.id).then(function(resp) {
	    		if(resp.status == 200 && resp.data.Status) {
	    			var ExcelFileName = resp.data.ExcelFileName;
	    			if(typeof cb == "function") {
	    				cb(ExcelFileName);
	    			}
	    		}
			});
		}
		
		function getActionItemSync(cb) {
			ActionItemsService.getActionItemSync(vm.source.clientId,vm.source.id).then(function(resp) {
	    		if(resp.status == 200 && resp.data.Status) {
	    			var TaskSync = resp.data.TaskSync;
	    			if(typeof cb == "function") {
	    				cb(TaskSync);
	    			}
	    		}
			});
		}
		
		function checkIsExcelFileExist(ExcelFileName,allDocResp) {
			var status = false;
			var docs = allDocResp.data.Folders.documents;
        	if(_.isArray(docs)) {
				for (var i=0;i<docs.length; i++) {
					if(docs[i].name === ExcelFileName){
						status = true;
					}
				}
			}
	        return status;
		}
		
		function createActionItemSync(ExcelFileName) {
			var postdata = {
					"taskspaceId" : vm.source.id,
					"taskspaceClientId" : vm.source.clientId,
					"taskspaceOwnerId" : vm.source.owner,
					"folderId" : vm.selectedObjectList[0].id,
					"folderClientId" : appdata["OrganizationId"],
					"fileName" : ExcelFileName+".xlsx"
				};
			ActionItemsService.createActionItemSync(postdata).then(function(resp) {
	    		if(resp.status == 200 && resp.data.Status) {
	    			var TaskSync = resp.data.TaskSync;
	    			if(TaskSync) {
						DocFactory.getDocHierarchy(TaskSync.folderId,function(docHierarchy) {
							TaskSync.fldrHierarchy =  docHierarchy;
							$uibModalInstance.close(TaskSync);
						});
					}
	    		}
			});
		}
		
		function confirmOverRideExcelSync(ExcelFileName) {
			var text = "Do you wnat overwrite existed the excel file or not?";
			$confirm({text: text})
	        .then(function() {
	        	createActionItemSync(ExcelFileName);
		    }, function() {
		    	cancel();
		    });
		}
		
		function checkIsExcelFileExistAndCreateActionItemSync(ExcelFileName,existAt) {
			if(existAt === "OneDrive") {
				var postdata = {
						"folderId": vm.selectedObjectList[0].id,
						"fileName" : ExcelFileName+".xlsx"
				};
				OneDriveService.checkIsExcelFileExistInOneDrive(postdata).then(function(resp) {
					if(resp.status == 200 && resp.data.Status) {
						if(resp.data.FileExists){
							confirmOverRideExcelSync(ExcelFileName)
						} else {
							createActionItemSync(ExcelFileName);
						}
					}
				});
			} else {
				getDocsUnderFolder(vm.selectedObjectList[0].id,function(allDocResp){
					if(allDocResp.status == 200 && allDocResp.data.Status){
						if(checkIsExcelFileExist(ExcelFileName+".xlsx",allDocResp)){
							confirmOverRideExcelSync(ExcelFileName)
						} else {
							createActionItemSync(ExcelFileName);
						}
					}
				});
			}
			
		}
		
		function ok() {
			if(!_.isEmpty(vm.selectedObjectList)) {
				if(resources.action) {
					if(resources.action == "addToTS") {
						var objects = [];
						_.each(vm.selectedObjectList, function(doc){
							var object = {
								"type" :doc._type,
								"objectId" : doc.id,
								"clientId" : doc.clientId,
								"sectionId" : vm.selectedTSSection.id
							}
							objects.push(object);
						});
						var postdata = {
								"includePdfAnnotations" : true,
								"id" : 	vm.tsId,
								"clientId" : vm.clientId,
								"objects" : objects,
							};
						addToTaskSpace(postdata,false);
					}
					var data = {"source":vm.source,"moveTo":vm.selectedObjectList[0],"fldrHierarchy":vm.fldrHierarchy};
					if(resources.action == "Move") {
						var postdata = processMoveToData(data);
						DocFactory.moveToFolder(postdata).then(function(resp){
					    	if(resp.status == 200 && resp.data.Status) {
					    		$uibModalInstance.close({"items":resp.data.resultList,"moveTo":vm.selectedObjectList[0],"source":vm.source});
					    	}
					    });
					}
					
					if(resources.action == "SaveTo") {
						var postdata = {
					    		"docId":data.source.id,
					    		"folderId": data.moveTo.id
					    		};
						if(data.moveTo.isLink) {
							postdata.folderId = data.moveTo.linkSourceFolderId;
						}
						
						SecFilingService.saveSECfileToFolder(postdata).then(function(resp){
							 if(resp.status == 200 && resp.data.Status && resp.data.Notes) {
								 $uibModalInstance.close(resp);
							 }
						});
					}
					
					if(resources.action == "Browse" || resources.action == "Browse For Copy" || resources.action == "Browse For TS Default") {
						$uibModalInstance.close(data);
					}
					
					if(resources.action == "Action Item Sync") {
						getExcelFileName(function(ExcelFileName) {
							var existAt;
							if(!_.isEmpty(vm.selectedObjectList) 
									&& !_.isEmpty(vm.selectedObjectList[0]["oneDriveId"])) {
								existAt = "OneDrive";
							}
							if(ExcelFileName) {
								checkIsExcelFileExistAndCreateActionItemSync(ExcelFileName,existAt);
							} else {
								checkIsExcelFileExistAndCreateActionItemSync(vm.source.name,existAt);
							}
						});
					}
				} else {
					$uibModalInstance.close();
				}
			}
		}

		function cancel() {
			$uibModalInstance.dismiss('cancel');
		}
		
		function processFolders(resp) {
			if(resp.status == 200 && resp.data.Status){
	        	
	        	var folders = resp.data.Folders.folders;
	        	var docs = resp.data.Folders.documents;
	        	
	        	if(_.isArray(docs)) {
					for (var i=0;i<docs.length; i++) {
						var doc = docs[i];
						doc._type = "Document";
						doc["displaySize"] = $filter('filesize')(doc.contentLength,vm.sizePrecision);
						DocFactory.setDocTypeBooleanFlags(doc);
						DocFactory.setDocPermissions(doc);
					}
				}
	        	
	        	if(_.isArray(folders)) {
					for (var i=0;i<folders.length; i++) {
						var folder = folders[i];
						folder._type = "Folder";
						folder["displaySize"] = $filter('filesize')(folder.contentLength,vm.sizePrecision);
						DocFactory.setDocPermissions(folder);
					}
				}
	        	vm.foldersList = orderBy(folders,"name");
	        	vm.docsList = orderBy(docs, "displayName");
	        }
		}
		
		function getHierarchy(id) {
			DocFactory.getDocHierarchy(id,function(docHierarchy) {
				vm.fldrHierarchy =  docHierarchy;
			});  
		}
		
		function popupForAddToTaskspace() {
			var status = false;
			if(resources.action && resources.action == "addToTS") {
				status = true;
			}
			return status;
		}
		
		function init() {
			docButtonsList = DocFactory.getDocButtons();
			if(resources.action == "Browse For Copy" || resources.action == "Browse For TS Default" || resources.action == "Action Item Sync") {
				disableExternalFolders = true;
			}
			
			if(resources.action == "Action Item Sync") {
				disableSharedFolders = true;
			}
		}
		init();
	}
})();