;(function(){
	
	'use strict';
	
		angular.module("vdvcApp").controller("TrashController",TrashController);
		
		TrashController.$inject = ['$rootScope','$scope','MessageService','DocFactory','TagService','SECImportFactory',
		                           'SecFilingService','_','userService','$state','$stateParams','$document',
							       '$uibModal','Upload', '$timeout','$confirm','appData','$window','$filter','orderByFilter'];
		
		function TrashController($rootScope,$scope,MessageService,DocFactory,TagService,SECImportFactory,SecFilingService,
									_,userService,$state,$stateParams,$document,$uibModal,Upload,$timeout,$confirm,appData,
									$window,$filter,orderBy){
		
		var appCtrlScope = $scope.$parent;
		var appdata = appData.getAppData();
		var docButtonsList = [];
		$scope.currentPage = $state.current.pageName;
		
		$scope.view = userService.getUiState("docsview").stateValue;
		$scope.folders=[];
		$scope.docs =[];
		$scope.sizePrecision = DocFactory.sizePrecision;
		$scope.currentFolder = null;
		$scope.currentFldrId = _.isEmpty($stateParams.trashId) ? appdata.rootFolderId : $stateParams.trashId;
		
		$scope.docHierarchy = [];
		
		$scope.animationsEnabled = true;
		
	    $scope.highlightIcn = null;
		
	    $scope.showProgress = false;
	    
	    $scope.existedFiles = [];
	    $scope.checkedItems = [];
	    
	    
	    $scope.fldrlistHeaders = DocFactory.fldrlistHeaders;
	    $scope.doclistHeaders =  DocFactory.doclistHeaders;
	    
	    $scope.docField =  userService.getUiState("docsort").stateValue.field;
	    $scope.docFieldDecending =  userService.getUiState("docsort").stateValue.decending;
	    
	    $scope.fldrField =  userService.getUiState("foldersort").stateValue.field;
	    $scope.fldrFieldDecending = userService.getUiState("foldersort").stateValue.decending;
	    
	    $scope.docActionProps = DocFactory.trashActionProps;
	    
	    function init() {
	    	docButtonsList = DocFactory.getDocButtons();
	    }
	    
	    init();
	    
	    $scope.sortByfield = function(hdr,type) {
	    	switch(type) {
	    	case "folder":
	    		if($scope.fldrField == hdr.value) {
	    			$scope.fldrFieldDecending = !$scope.fldrFieldDecending;
	    		} else {
	    			$scope.fldrFieldDecending = false;
	    		}
	    		$scope.fldrField =  hdr.value;
	    		$scope.folders =  orderBy($scope.folders, hdr.value, $scope.fldrFieldDecending);
	    		userService.setUiState("foldersort",{field:$scope.fldrField,decending:$scope.fldrFieldDecending});
	    		break;
	    	case "doc":
	    		if($scope.docField == hdr.value) {
	    			$scope.docFieldDecending =  !$scope.docFieldDecending;
	    		} else {
	    			$scope.docFieldDecending = false;
	    		}
	    		$scope.docField =  hdr.value;
	    		$scope.docs =  orderBy($scope.docs, hdr.value, $scope.docFieldDecending);
	    		userService.setUiState("docsort",{field:hdr.value,decending:$scope.docFieldDecending});
	    		break;
	    	}
	    };
	    
	    
	    $scope.docsButton = function(key) {
	    	var docButton = {};
	    	if(!_.isEmpty(docButtonsList)) {
	    		docButton = _.findWhere(docButtonsList,{"key": key});
	    	}
	    	return docButton;
	    };
	    
	    $scope.openDocument = function(doc, event) {
	    	if(event) {
	    		event.stopPropagation();
	    		event.preventDefault();
	    	}
	    	
	    	if(!$scope.showGridCheckbox()) {
	    		if(doc._type == "Document") {
	    			$state.go("docview",{"docId":doc.id,"clientId":doc.clientId});
		    	} else if(doc.root) {
		    		$state.go("docs",{"folderId":doc.id});
		    	} else if(doc.trash) {
	    			$state.go("trash",{"trashId":doc.id});
	    			return;
	    		} else if(doc._type == "Folder") {
	    			$state.go("trash",{"trashId":doc.id});
	    		}
	    		
			} else {
				doc.selected = !doc.selected;
				$scope.checkFolderOrFile(doc);
			}
	    	
	    };
	    
	    $scope.switchView = function() {
	    	$scope.view = $scope.view == 'Grid' ? 'List' : 'Grid';
	    	userService.setUiState("docsview",$scope.view);
	    };
	    
	    $scope.setDropdownPosition = function(event,doc){
	    	
    		var dropdownHeight = $(event.currentTarget).find(".dropdown-menu").outerHeight()+$(event.currentTarget).outerHeight();
    		var clientY = event.clientY+dropdownHeight;
    		var viewportHeight = $($window).innerHeight(); 
    		if(!isNaN(clientY) && clientY > viewportHeight) {
    			doc.showUP = true;
    		} else {
    			doc.showUP = false;
    		}
	    };
	    
	    
	    $scope.getFileIcon = function(doc) {
	    	return DocFactory.getFileImgIcon(doc.name,doc.docType);;
	    };
	   
	    $scope.getDocName = function(doc) {
	    	
	    	if(doc.secFile || doc.secCompareFile) {
	    		return doc.displayName;
	    	} else {
	    		return doc.name;
	    	}
	    	
	    	
	    };
	    
	    
	    
		$scope.isShared = function(doc) {
			return (doc.ownerId !== $scope.userinfo["UserId"] || doc.shared) ? true : false;
		};
		
		
		$scope.openDoc = function(doc) {
			$state.go("docview",{"docId":doc.id,"clientId":doc.clientId});
		};
		
		/*$scope.openFolder = function(folder) {
			if(!$scope.showGridCheckbox()) {
				$state.go("docs",{ "folderId": folder.id });
			} else {
				folder.selected = !folder.selected;
				$scope.checkFolderOrFile(folder);
			}
		};*/
		
		var SetSharedFlag = function(doc) {
			if (doc._type == "Document") {
				DocFactory.getSharedUsersForDoc(doc.id,doc.clientId).then(function(resp){
					 if(resp.status == 200 && resp.data.Status) {
						 doc.sharedWith = resp.data.Notes;
						 doc.shared = _.isEmpty(resp.data.Notes) ? false : true;
					 }
				});
			}
			
			if (doc._type == "Folder") {
				DocFactory.getSharedUsersForFolder(doc.id).then(function(resp){
					 if(resp.status == 200 && resp.data.Status) {
						 doc.sharedWith = resp.data.Folders;
						 doc.shared = _.isEmpty(resp.data.Folders) ? false : true;
					 }
				});
			}
		};
		
		var getDocHierarchy = function(folderId) {
			 DocFactory.getDocHierarchy(folderId,function(fldrHierarchy) {
				 var fldrName = _.findWhere(fldrHierarchy,{id:folderId}).name;
				 $scope.$emit("PageName",{"userName":appdata.UserName,"pageName":fldrName});
				 $scope.docHierarchy = fldrHierarchy;
			 });
			 
		};
		
		
		var getDocsUnderFolder = function(folderName) {
			 var folderId = $scope.currentFldrId;
			 
			 getDocHierarchy(folderId);
			 
		     DocFactory.getDocsUnderFolder(folderId).then(function (allDocResp) {
		        if(allDocResp.status == 200 && allDocResp.data.Status){
		        	var folders = allDocResp.data.Folders.folders;
		        	var docs = allDocResp.data.Folders.documents;
		        	folders =  orderBy(folders, $scope.fldrField, $scope.fldrFieldDecending);
		        	docs =  orderBy(docs, $scope.docField, $scope.docFieldDecending);
		        	if(_.isArray(docs)) {
						for (var i=0;i<docs.length; i++) {
							var doc = docs[i];
							doc._type = "Document";
							doc.parentFolderId = folderId;
							doc["displaySize"] = $filter('filesize')(doc.contentLength,$scope.sizePrecision);
							SetSharedFlag(doc);
							DocFactory.setDocTypeBooleanFlags(doc);
							DocFactory.setDocPermissions(doc);
						}
					}
		        	
		        	if(_.isArray(folders)) {
						for (var i=0;i<folders.length; i++) {
							var doc = folders[i];
							doc._type = "Folder";
							doc.isCurrentFolder = false;
							doc["displaySize"] = $filter('filesize')(doc.contentLength,$scope.sizePrecision);
							SetSharedFlag(doc);
							DocFactory.setDocPermissions(doc);
							doc.isCurrentFolder = true;
						}
					}
		        	folders =  orderBy(folders, $scope.fldrField, $scope.fldrFieldDecending);
		        	docs =  orderBy(docs, $scope.docField, $scope.docFieldDecending);
		        	$scope.folders = folders;
		        	$scope.docs = docs;
		        }
		     });
		};
	
		getDocsUnderFolder();
	   
		var handleDeletePermanentlyCB = function(items,type) {
			var isDeletedFalse = _.findWhere(items,{"isDeleted" : false});
			var isDeletedTrue = _.where(items,{"isDeleted" : true});
			
			
			if(!_.isEmpty(isDeletedTrue)) {
				_.each(isDeletedTrue,function(source,index) {
					if(source.objectType == "Document") {
		    			$scope.docs = _.reject($scope.docs, function(doc){ 
			    			return doc.id == source.objectId; 
			    		});
		    		} else if(source.objectType == "Folder") {
		    			$scope.folders = _.reject($scope.folders, function(fldr){ 
			    			return fldr.id == source.objectId; 
			    		});
		    		}
					
					if($scope.checkedItems) {
						$scope.checkedItems = _.reject($scope.checkedItems, function(doc){ 
			    			return doc.id == source.objectId; 
			    		});
					}
					
				});
			}
			
			if(isDeletedFalse) {
				var NoPermOnObjectList = _.where(items,{"Reason" : "NoPermOnObject"});
				var ObjectNotFoundList = _.where(items,{"Reason":"ObjectNotFound"});
				
				if(!_.isEmpty(NoPermOnObjectList)) {
					MessageService.showErrorMessage("DELETE_ITEMS_ERR");
				} else {
					MessageService.showErrorMessage("DEFAULT_ERROR_MSG");
				}
				
			} else {
				$scope.checkedItems = [];
				hideAllDocActions();
				if(type == "multiselect") {
					MessageService.showSuccessMessage("DELETE_ITEMS");
				} else if(type == "emptytrash"){
					MessageService.showSuccessMessage("EMPTY_TRASH");
				}
				
			}
			
		};
		
		var deleteItemsPermanently = function(items,type) {
			
			/*_.each(items,function(item,index) {
				var postdata = {};
	        	postdata["userId"] = $scope.userinfo["UserId"];
				if(item._type == "Document") {
					DocFactory.deleteDocument(item.id,postdata).then(function(result){
						if (result.status==200 && result.data.Status) {
							$scope.docs = _.reject($scope.docs, function(doc){ 
				    			return doc.id == item.id; 
				    		});
							$scope.checkedItems = _.reject($scope.checkedItems, function(doc){ 
				    			return doc.id == item.id; 
				    		});
							MessageService.showSuccessMessage("DOC_DELETE",[item.name]);
						}
					});
				} else if(item._type == "Folder") {
					DocFactory.deleteFolder(item.id,postdata).then(function(result){
						if (result.status==200 && result.data.Status) {
							
							$scope.folders = _.reject($scope.folders, function(fldr){ 
				    			return fldr.id == item.id; 
				    		});
							$scope.checkedItems = _.reject($scope.checkedItems, function(doc){ 
				    			return doc.id == item.id; 
				    		});
							MessageService.showSuccessMessage("FOLDER_DELETE",[item.name]);
							
						}
					});
				}
        		
        		
        	});*/
			
			var postdata = {};
        	var itemList = [];
        	
        	_.each(items,function(item,index) {
        		var obj = {
        				"objectType" : item._type,
        				"objectId" : item.id,
        				"clientId" : (item._type == "Folder") ? appdata["OrganizationId"] : item.clientId
        		};
        		itemList.push(obj);
        	});
        	
        	postdata["objectList"] = itemList;
        	DocFactory.deleteItemsPermanently(postdata).then(function(result){
				if (result.status==200 && result.data.Status) {
					
					handleDeletePermanentlyCB(result.data.resultList,type);
				}
			});
		};
		
		$scope.deleteItems = function(items) { 
			var txt = 'Are you sure you want to delete selected items?(items would be deleted permanently)';
			$confirm({text: txt})
	        .then(function() {
	        	deleteItemsPermanently(items,'multiselect');
	        });
		}; 
		$scope.EmptyTrash = function() {
			var txt = 'Are you sure you want to empty trash?(all items would be deleted permanently)';
			$confirm({text: txt})
		    .then(function() {
		    	var items = [];
		    	_.each($scope.folders,function(folder,index) {
		    		items.push(folder);
				});
		    	_.each($scope.docs,function(doc,index) {
		    		items.push(doc);
				});
		    	deleteItemsPermanently(items,'emptytrash');
		    });
	    };
		var processItems = function(items) {
			 var processedItems = [];
			 _.each(items,function(item,index) {
				 var obj = {};
				 obj["Type"] = item._type;
				 obj["TopObjectId"] = item.id;
				 processedItems.push(obj);
			 });
			 return processedItems;
		};
		
		
		
		
		$scope.unTag = function(tag,item,$event) {
			$event.preventDefault();
		    $event.stopPropagation();
			TagService.unTag(tag,item).then(function(response){
				if (response.status == 200) {
					TagService.getItemTagsById(item);
				}
			});
		};
		
		var handlePropertiesCB = function(items,data) {
			var isUpdatedFalse = _.findWhere(items,{"isUpdated" : false});
			var isUpdatedTrue = _.where(items,{"isUpdated" : true});
			
			
			if(!_.isEmpty(isUpdatedTrue)) {
				_.each(data.original,function(source,index) {
					source.ticker=data.modified.ticker;
					source.companyName=data.modified.companyName;
					source.cik=data.modified.cik;
					source.selected = false;
					
					$scope.checkedItems = _.reject($scope.checkedItems, function(doc){ 
		    			return doc.id == source.id; 
		    		});
				});
			}
			
			if(isUpdatedFalse) {
				var NoPermOnObjectList = _.where(items,{"Reason" : "NoPermOnObject"});
				var ObjectNotFoundList = _.where(items,{"Reason":"ObjectNotFound"});
				
				if(!_.isEmpty(NoPermOnObjectList)) {
					MessageService.showErrorMessage("EDIT_PROPERTIES_ERR");
				} else {
					MessageService.showErrorMessage("DEFAULT_ERROR_MSG");
				}
				
			} else {
				$scope.checkedItems = [];
				hideAllDocActions();
				MessageService.showSuccessMessage("EDIT_PROPERTIES");
			}
						 
		};
		$scope.OpenPropertiesModal = function (source,size) {
			var modalInstance = $uibModal.open({
			      animation: $scope.animationsEnabled,
			      templateUrl: 'app/components/Documents/EditDocProperties/EditDocProperties.html',
			      controller: 'DocPropertiesController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'vm',
			      size: size,
			      resolve: {
			    	  source : function() {
			    		  return source;
			    	  },
			    	  docTypes : function () {
			    		  return  DocFactory.uploadDocTypes;
			    	  }
			      }
			    });
			
			modalInstance.result.then(function (data) {
				 DocFactory.updateDocProperties(data.modified).then(function(resp) {
					 if(resp.status == 200 && resp.data.Status) {
						 handlePropertiesCB(resp.data.resultList,data);
					 }
				 });
			}, function () {
			      
			});
		};
		
		var rejectFolderOrDoc = function(source) {
			
			if(source.objectType == "Document") {
    			$scope.docs = _.reject($scope.docs, function(doc){ 
	    			return doc.id == source.documentId; 
	    		});
    		} else if(source.objectType == "Folder") {
    			$scope.folders = _.reject($scope.folders, function(fldr){ 
	    			return fldr.id == source.folderId; 
	    		});
    		}
		};
		
		var OpenMoveTofolderConfirmModal = function(item,itemlist,targetFolder,itemsToMove,size) {
			var modalInstance = $uibModal.open({
			      animation: $scope.animationsEnabled,
			      templateUrl: 'app/components/Documents/MoveToFolder/MoveToFolderConfirmation.html',
			      controller: 'MoveToFolderConfirmController',
			      controllerAs: 'vm',
			      appendTo : $('.rootContainer'),
			      size: size,
			      resolve: {
			    	  resources : function () {
			    		  return {
			    			  "item" : item,
			    			  "targetFldr" : targetFolder
			    		  };
			    	  }
			      }
			    });
			
			modalInstance.result.then(function (data) {
				if(data) {
					switch(data.action) {
					case "replaceAll":
						for(var i = 0;i<itemlist.length;i++){
							itemlist[i].overwrite = true;
						}
						break;
					case "replace":
						for(var i = 0;i<itemlist.length;i++){
							if(itemlist[i].objectType == "Folder" && itemlist[i].folderId == data["_for"].id) {
								itemlist[i].overwrite = true;
								break;
							}
							
							if(itemlist[i].objectType == "Document" && itemlist[i].documentId == data["_for"].id) {
								itemlist[i].overwrite = true;
								break;
							}
						}
						break;
					case "skipAll":
						itemlist = [];
						break;
					case "skip":
						for(var i = 0;i<itemlist.length;i++){
							if(itemlist[i].objectType == "Folder" && itemlist[i].folderId == data["_for"].id) {
								itemlist.splice(i,1);
								--i;
								break;
							}
							
							if(itemlist[i].objectType == "Document" && itemlist[i].documentId == data["_for"].id) {
								itemlist.splice(i,1);
								--i;
								break;
							}
						}
						break;
					
					}
					
					checkIsExistAndMove(itemlist,targetFolder,itemsToMove);
				}
			}, function () {
			      
			});
		};
		
		var checkIsExistAndMove = function(ObjectExistsList,targetFolder,itemsToMove) {
			   var existedFiles = _.where(ObjectExistsList, {overwrite: false});
			   
			   if(existedFiles && existedFiles.length > 0){
				   var item;
				   
				   if(existedFiles[0].objectType == "Folder") {
					   item = _.findWhere(itemsToMove, {"id": existedFiles[0].folderId});
				   }
				   
				   if(existedFiles[0].objectType == "Document") {
					   item = _.findWhere(itemsToMove, {"id": existedFiles[0].documentId});
				   }
				   
				   if(item) {
					   OpenMoveTofolderConfirmModal(item,ObjectExistsList,targetFolder,itemsToMove);
				   }   
			   } else if(ObjectExistsList.length > 0){
				   _.each(ObjectExistsList,function(obj,index) {
					   if(obj._type == "Folder") {
						   obj.clientId = appdata["OrganizationId"];
					   }
				   });
				   var postdata = {
							"newFolderId" : targetFolder.id,
							"objectList" : ObjectExistsList
						};
				   DocFactory.moveToFolder(postdata).then(function(resp){
				    	if(resp.status == 200 && resp.data.Status) {
				    		MoveTofolderCallBack({"items":resp.data.resultList,"moveTo":targetFolder,"source" : itemsToMove});
				    	}
				   });
			   }
		 };
		
		var handleMoveToFolderSenerios = function(failedDocs,targetFolder,itemsToMove) {
			
			var NoReplacePermOnObjectList = _.where(failedDocs,{"Reason":"NoReplacePermOnObject"});
			var ObjectExistsList = _.where(failedDocs,{"Reason":"AnotherObjectExists"});
			var NoPermOnObjectList = _.where(failedDocs,{"Reason":"NoPermOnObject"});
			var ObjectNotFoundList = _.where(failedDocs,{"Reason":"ObjectNotFound"});
			if(!_.isEmpty(ObjectExistsList)) {
				checkIsExistAndMove(ObjectExistsList,targetFolder,itemsToMove);
			} else {
				MessageService.showErrorMessage("DEFAULT_ERROR_MSG");
			}
		};
		
		var MoveTofolderCallBack = function(data) {
			
			var failedDocs =  _.where(data.items,{"isMoved":false});
			if(!_.isEmpty(failedDocs)) {
				handleMoveToFolderSenerios(failedDocs,data.moveTo,data.source);
			} else {
				if(angular.isArray(data.items)) {
					_.each(data.items,function(val,index) {
						if(val.isMoved) {
							rejectFolderOrDoc(val);
						}
					});	
				} else {
					if(data.items.isMoved) {
						rejectFolderOrDoc(data.items);
					}
				}
				$scope.checkedItems = [];
			}
		};
		
		$scope.OpenMoveTofolderModal = function (source,size) {
			var modalInstance = $uibModal.open({
			      animation: $scope.animationsEnabled,
			      templateUrl: 'app/components/BrowseFileOrFolder/BrowseFileOrFolder.html',
			      controller: 'BrowseFileOrFolderController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'vm',
			      size: size,
			      resolve: {
			    	  resources : function () {
			    		  return {
			    			  "source" : source,
			    			  "folderId" : null,
			    			  "btnLable" : "Move here",
			    			  "action" : "Move",
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
			    		  return DocFactory.getDocsUnderFolder(appdata.rootFolderId);
			    	  }
			      }
			    });
			
			modalInstance.result.then(function (data) {
				MoveTofolderCallBack(data);
			}, function () {
			      
			});
		};
		
		var hideAllDocActions = function() {
			_.each($scope.docActionProps,function(action,index) {
				action.show = false;
			});
		};
		
		
		$scope.unselectAll = function($event) {
			if($event) {
				$event.stopPropagation();
			}
			
			_.each($scope.checkedItems,function(item,index) {
				item.selected = false;
			});
			hideAllDocActions();
			$scope.checkedItems = [];
		};
		
		$scope.onLongPress = function(obj) {
			obj.selected = true;
			$scope.checkFolderOrFile(obj);
		};
		
		$scope.checkFolderOrFile = function(obj) {
			hideAllDocActions();
			if(obj.selected) {
				$scope.checkedItems.push(obj);
			} else {
				$scope.checkedItems = _.without($scope.checkedItems, _.findWhere($scope.checkedItems, {id: obj.id }));
			}
			
			if($scope.checkedItems.length > 0) {
				var nonOwnedItem = _.findWhere($scope.checkedItems, {"isOwner": false});
				if(nonOwnedItem) {
					
				} else {
					_.each($scope.docActionProps,function(action,index) {
						action.show = true;
					});
				}
			} 
			
			
		};
		
		$scope.showGridCheckbox = function(){
	    	var status = false;
	    	if($scope.checkedItems.length > 0 ) {
	    		status = true;
	    	}
	    	return status;
	    };
	    
	    $scope.executeDocAction = function(docAction) {
	    	
	    	switch(docAction) {
		    	case "Delete":
		    		deleteFromNav();
		    		break;
		    	case "Move to...":
		    		OpenMoveToModalFromNav();
		    		break;
		    	case "Properties":
		    		OpenPropertiesModalFromNav();
		    		break;
	    	}
	    	
	    };
	    
	    
	    var deleteFromNav = function() {
	    	if($scope.checkedItems.length>0) {
	    		$scope.deleteItems($scope.checkedItems);
	    	}
	    };
	    
	    var OpenMoveToModalFromNav = function() {
	    	if($scope.checkedItems.length>0) {
	    		$scope.OpenMoveTofolderModal($scope.checkedItems);
	    	} 
	    };
	    
	    var OpenPropertiesModalFromNav = function() {
	    	if($scope.checkedItems.length > 0) {
	    		$scope.OpenPropertiesModal($scope.checkedItems);
	    	}
	    };
	    $scope.closeProgress = function() {
			$scope.showProgress = false;
		};
		
	   $scope.OpenImportSECFilingModal = function (size) {
			var modalInstance = $uibModal.open({
			      animation: $scope.animationsEnabled,
			      templateUrl: 'app/components/Documents/ImportSecFiles/importSECfilingModal.html',
			      controller: 'ImportSECModalCtrl',
			      appendTo : $('.rootContainer'),
			      size: size,
			      resolve: {
			    	 
			      }
			    });
			modalInstance.result.then(function (SecfileInfo) {
				$scope.OpenGlobalSECFilings(SecfileInfo);
			}, function () {
			      
			});
		};
		
		$scope.ImportSECFilings = function(postdata) {
			
			postdata["parentFolderId"] = $scope.currentFldrId;
			
			//Todo Needs to Updated in the back end to get userId and ownerId
			postdata["userId"] = $scope.userinfo["UserId"];
			postdata["ownerId"] = $scope.userinfo["UserId"];
			
			postdata["docType"] = "SECFile";

			
			
			SECImportFactory.importSECFile(postdata).success(function(result){
				if (result.Status) {
					getDocsUnderFolder();
				}
			});
		};
		
		
		$scope.OpenGlobalSECFilings = function(postdata) {
			
			SECImportFactory.openGlobalSECFile(postdata).then(function(response){
				if (response.status == 200 && response.data.Status) {
					if (response.data.Notes) {
						$state.go('docview',{'docId': response.data.Notes,'clientId': null});
					}
				}
			});
		};
		
		
		
		
		$scope.closeProgress = function() {
			$scope.showProgress = false;
		};
	   
	   $scope.$on("$destroy",function() {
		   $scope.showProgress = false;
       });
	   
	   
	}   
	
})();

