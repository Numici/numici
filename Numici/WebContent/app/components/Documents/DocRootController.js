;(function() {
'use strict';
	
	angular.module("vdvcApp").directive('folderCard', ['$document',function($document) {
		return {
			restrict: 'A',
			templateUrl: 'app/components/Documents/folderTemplate.html'
		};
	}]).directive('scrollToCurrentFolder', ['$document','$window','$timeout',function($document,$window,$timeout) {
	    return {
	        restrict : 'A',
	        link : function(scope,element,attr) {
	        	
	            scope.$watch(attr.isCurrentFolder,function() {
	                $timeout(function() {
	                	if(attr.isCurrentFolder == "true"){
	                		element[0].scrollIntoView(true);
	                		$(element).closest('body').scrollTop($(element).closest('body').scrollTop()-200);
	        	    	}
	                },2000);
	            });
	        }
	    };
	}]).directive('docCard', ['$document',function($document) {
		return {
			restrict: 'A',
			templateUrl: 'app/components/Documents/documentTemplate.html',
	        link: function(scope, element, attrs) {

	        }
		};
	}]);
})();

;(function(){
	
	'use strict';
	
	angular.module("vdvcApp").controller("DocRootController",DocRootController);
	
	DocRootController.$inject = ['$rootScope','$scope','MessageService','DocFactory','TagService',
	                             'SECImportFactory','SecFilingService','_','userService','$state',
	                             '$stateParams','$document','$uibModal','Upload', '$timeout','$confirm',
	                             'appData','$window','$filter','orderByFilter','EvernoteService','$location',
	                             'DeepLinkService','APIUserMessages','$deviceInfo','DocViewerService',
	                             'UploadFileFactory','BoxService','commonService','sessionStorage','AddedTaskspacesService'];
	
	function DocRootController($rootScope,$scope,MessageService,DocFactory,TagService,
			SECImportFactory,SecFilingService,_,userService,$state,$stateParams,$document,
			$uibModal,Upload,$timeout,$confirm,appData,$window,$filter,orderBy,EvernoteService,
			$location,DeepLinkService,APIUserMessages,$deviceInfo,DocViewerService,UploadFileFactory,
			BoxService,commonService,sessionStorage,AddedTaskspacesService){

		var fileBaseUrl = commonService.getContext();
		var limitStep = 6;
		var appdata = appData.getAppData();
		var appCtrlScope = $scope.$parent;
		var uploadSessionObj;
	    var setFolderSyncSessionObj;
	    var syncSessionObj;
	    var getLinkTimer;
	    var docButtonsList = [];
	    
	    var uiView = userService.getUiState("docsview").stateValue;
		
	    $scope.view = uiView ? uiView : "Grid";
		$scope.deviceInfo = $deviceInfo;
		
		$scope.folderlimit = 6;
		$scope.sizePrecision = DocFactory.sizePrecision;
		$scope.folders=[];
		$scope.docs =[];
		$scope.folderId;
		$scope.folderName;
		$scope.docId;
		$scope.currentFolder;
		$scope.currentFldrId = _.isEmpty($stateParams.folderId) ? appdata.rootFolderId : $stateParams.folderId;
		$scope.btnlable = "SHOW MORE";
		$scope.docHierarchy = [];
		
		$scope.animationsEnabled = true;
		
	    $scope.highlightIcn;
		
	    $scope.showProgress = false;
	    
	    $scope.existedFiles = [];
	    $scope.checkedItems = [];
	    
	    
	    $scope.fldrlistHeaders = DocFactory.fldrlistHeaders;
	    $scope.doclistHeaders =  DocFactory.doclistHeaders;
	    
	    $scope.docField =  userService.getUiState("docsort").stateValue.field;
	    $scope.docFieldDecending =  userService.getUiState("docsort").stateValue.decending;
	    
	    $scope.fldrField =  userService.getUiState("foldersort").stateValue.field;
	    $scope.fldrFieldDecending = userService.getUiState("foldersort").stateValue.decending;
	    
	    $scope.docActionProps = DocFactory.docActionProps;
	    $scope.switchPrivate =  switchPrivate;
	    
	    $scope.checkAllFolders = {"selected":false};
	    $scope.checkAllDocs = {"selected":false};
	        
	    // Scope event
	    
	    $scope.$on("BoxRevoke", function(event, data) {
			handelRevokeEvent("box",data);
		});
		
		$scope.$on("DropBoxRevoke", function(event, data) {
			handelRevokeEvent("dropBox",data);
		});
		
		$scope.$on("OneDriveRevoke", function(event, data) {
			handelRevokeEvent("oneDrive",data);
		});
		
	    function handelRevokeEvent(fieldName,data) {
	    	if($scope.currentFldrId === appdata.rootFolderId) {
	    		getDocsUnderFolder();
	    	} else {
	    		var externalStorageFolder = _.find($scope.docHierarchy,function(folder) {
	    	        var externalStorageInfo  = folder["externalStorageInfo"];
	    			if(!_.isEmpty(externalStorageInfo)) {
	    				return externalStorageInfo[fieldName];
	    			} 
	    			return false;
				});
				
	    		if(!_.isEmpty(externalStorageFolder)) {
	    			$state.go("docs",{"folderId":appdata.rootFolderId});
	    		}
	    	}
	    }
	    
	    $scope.$on("FOLDER_CHANGED", function(event, data) {
	    	
			if(data && data.eventData && data.eventData.folderId == $scope.currentFldrId) {
				getDocsUnderFolder();
			}
		});
	    
	    $scope.$on("ROOT_FOLDER_CHANGED", function(event, data) {
			if(appdata.rootFolderId == $scope.currentFldrId) {
				getDocsUnderFolder();
			}
		});
	    
	    
	    $scope.$on("FOLDER_INDEX_COMPLETE", function(event, data) {
	    	if(data.eventData && data.eventData.Name) {
	    		APIUserMessages.success(data.eventData.Name+" Indexing Complete");
	    	} else {
	    		APIUserMessages.success("Indexing Complete");
	    	}
			
			getDocsUnderFolder();
		});
		
		$scope.$on("FOLDER_UNINDEX_COMPLETE", function(event, data) {
			if(data.eventData && data.eventData.Name) {
	    		APIUserMessages.success(data.eventData.Name+" Unindexing Complete");
	    	} else {
	    		APIUserMessages.success("Unindexing Complete");
	    	}
			getDocsUnderFolder();
		});
		 
	    
	    function loadSesssionStorageData() {
	    	var uploadSession = sessionStorage.getItem("uploadSession");
	    	sessionStorage.removeItem("uploadSession");
			if(uploadSession) {
				uploadSessionObj = JSON.parse(uploadSession);
			}
			
		    var setFolderSyncSession = sessionStorage.getItem("setFolderSyncSession");
			sessionStorage.removeItem("setFolderSyncSession");
			if(setFolderSyncSession) {
				setFolderSyncSessionObj = JSON.parse(setFolderSyncSession);
			}
			
			var syncSession = sessionStorage.getItem("syncSession");
			sessionStorage.removeItem("syncSession");
			if(syncSession) {
				syncSessionObj = JSON.parse(syncSession);
			}
	    }
	    
	    loadSesssionStorageData();
	    
	    function init() {
	    	docButtonsList = DocFactory.getDocButtons();
	    }
	    
	    init();
		
	    
	    $scope.getDocLogo = function(doc) {
			if(doc && !_.isEmpty(doc.docSource)) {
				let type = doc.docSource.toLowerCase();
				return DocFactory.getExtFileIcon(type);
			}
		};
	    
	    $scope.getFolderLogo = function(folder) {
	    	var type;
			if(folder && folder.isSyncedWithEvernote) {
				type = "evernote";
			} else if(folder && folder.boxId && !_.isEmpty(folder.boxId)) {
				type = "box";
			} else if(folder && folder.oneDriveId && !_.isEmpty(folder.oneDriveId)) {
				type = "onedrive";
			} else if(folder && folder.dropBoxUserId && !_.isEmpty(folder.dropBoxUserId)) {
				type = "dropbox";
			}
			if(type){
				return DocFactory.getExtFileIcon(type);
			}
		};
	    
	    $scope.selectColumn = function (hdr,hdrList){
			var selectedColumns = _.where(hdrList,{"checked" : true});
			 if(hdr.checked) {
				 if(!_.isEmpty(selectedColumns) && selectedColumns.length > 1) {
					 hdr.checked = false;
				 }
			 } else {
				 hdr.checked = true;
			}
		};
	    
		function checkSyncSession() {
			if(setFolderSyncSessionObj) {
    			angular.forEach($scope.folders, function(itm){
    				if(itm.id == setFolderSyncSessionObj.selectedFolder.id) {
    					itm.selected = setFolderSyncSessionObj.selectedFolder.selected; 
    	    			$scope.checkedItems.push(itm);
    				}
        		});
    			if($scope.checkedItems.length == 1) {
    	    		$scope.OpenSyncModal($scope.checkedItems);
    	    	}
    		}
		};
		
		$scope.syncFolder = function(folder,cb) {
			EvernoteService.syncFolder(folder.id).then(function(response){
				if(response.status == 200 && response.data.Status) {
					if(!response.data.OAuthErr) {
						MessageService.showSuccessMessage("FOLDER_SYNC_EVERNOTE");
						if(typeof cb == "function") {
							cb();
						}
					} else {
						var confirmText = "";
						switch(response.data.EverNoteStatus) {
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
				    				var syncSessionLocal = {};
				    				syncSessionLocal["selectedFolder"] = folder;
				    				sessionStorage.setItem("syncSession",JSON.stringify(syncSessionLocal));
				    				$window.location.href=resp.data.authUrl;
				    			}	
				    		});
					    });
					}
				}
			});
	    };

	    $scope.linkInfo = {};
	    $scope.linkUIProperties = {
	    		templateUrl : 'app/components/DeepLink/DeepLinkPopOver.html',
	    		trigger : 'none',
	    		cpToClipBoard : DeepLinkService.isCpToClipSupported,
	    		copySuccess : function() {
	    			APIUserMessages.info("Link copied to clipboard.");
	    		},
	    		copyfail : function(err) {
	    			
	    		},
	    		close: function() {
	    			hideDocLinkPopup();
	    			hideFolderLinkPopup()
	    		}
	    };
	    
	    function hideDocLinkPopup() {
	    	var docObj = _.findWhere($scope.docs,{'showLink': true});
	    	if(docObj) {
	    		delete docObj.showLink;
	    	}
	    }
	    
	    function hideFolderLinkPopup() {
	    	var folderObj = _.findWhere($scope.folders,{'showLink': true});
	    	if(folderObj) {
	    		delete folderObj.showLink;
	    	}
	    }
	    
	    $scope.getDocLink = function(doc) {
	    	if(doc.isSharable) {
	    		$scope.linkInfo = {};
	    		$timeout.cancel(getLinkTimer);
	    		getLinkTimer = $timeout(function() {
		    		var linkInfo = {
		    				objectType : "DocumentObj",
		    				linkObjectId : doc.id,
		    				text : doc.displayName,
		    				linkType : 'Protected',
		    				clientId : doc.clientId
		    		};
		    		DeepLinkService.createLink(linkInfo).then(function(resp) {
						if(resp.status == 200 && resp.data.Status) {
							$scope.linkInfo.url = resp.data.Link.url;
							$scope.linkInfo.link = resp.data.Link.linkObj;
							$scope.linkInfo.focusLink = true;
							doc.showLink = true;
						}
					});
		    		$timeout.cancel(getLinkTimer);
	    		},100);
	    	}
	    };
	    
	    
	    $scope.getFolderLink = function(folder) {
	    	if(folder.isSharable) {
	    		$scope.linkInfo = {};
	    		$timeout.cancel(getLinkTimer);
	    		getLinkTimer = $timeout(function() {
		    		var linkInfo = {
		    				objectType : "FolderObj",
		    				linkObjectId : folder.id,
		    				text : folder.name,
		    				linkType : 'Protected',
		    				clientId : folder.clientId
		    		};
		    		DeepLinkService.createLink(linkInfo).then(function(resp) {
						if(resp.status == 200 && resp.data.Status) {
							$scope.linkInfo.url = resp.data.Link.url;
							$scope.linkInfo.link = resp.data.Link.linkObj;
							$scope.linkInfo.focusLink = true;
							folder.showLink = true;
						}
					});
		    		$timeout.cancel(getLinkTimer);
	    		},100);
	    	}
	    };
	    
		$scope.selectAllFolders = function() {
	    	hideAllDocActions();
	    	angular.forEach($scope.folders, function(itm){
    			itm.selected = $scope.checkAllFolders.selected; 
    			$scope.checkedItems = _.reject($scope.checkedItems, function(doc){ 
	    			return doc.id == itm.id; 
	    		});
    		});
	    	if($scope.checkAllFolders.selected) {
	    		angular.forEach($scope.folders, function(itm){
	    			itm.selected = $scope.checkAllFolders.selected; 
	    			$scope.checkedItems.push(itm);
	    		});
	    	}
	    	checkDocActions();
	    };
	    
	    $scope.selectAllDocs = function() {
	    	hideAllDocActions();
	    	angular.forEach($scope.docs, function(itm){ 
    			itm.selected = $scope.checkAllDocs.selected;
    			$scope.checkedItems = _.reject($scope.checkedItems, function(doc){ 
	    			return doc.id == itm.id; 
	    		});
    		});
	    	if($scope.checkAllDocs.selected) {
	    		angular.forEach($scope.docs, function(itm){ 
	    			itm.selected = $scope.checkAllDocs.selected;
	    			$scope.checkedItems.push(itm);
	    		});
	    	}
	    	checkDocActions();
	    };
	    	    
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
	    	    
	    $scope.openTrash = function(btn) {
	    	if(appdata.TrashFolderId) {
	    		$state.go("trash",{"trashId":appdata.TrashFolderId});
	    	}
	    };
	    
	    
	    
	    
	    $scope.docsButton = function(key) {
	    	var docButton = {};
	    	if(!_.isEmpty(docButtonsList)) {
	    		docButton = _.findWhere(docButtonsList,{"key": key});
	    	}
	    	return docButton;
	    };
	    
	    $scope.disableDocsButton = function(key) {
			var status = true;
			var docButton = {};
			if(!_.isEmpty(docButtonsList)) {
	    		docButton = _.findWhere(docButtonsList,{"key": key});
	    	}
			if(docButton && docButton.isEnabled) {
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
		};
	    
	    $scope.openDocument = function(obj,event) {
	    	
	    	if(event) {
	    		event.stopPropagation();
	    		event.preventDefault();
	    	}
	    	if(!$scope.showGridCheckbox()) {
	    		if(obj._type == "Document") {
		    		$state.go("docview",{"docId":obj.id,"clientId":obj.clientId});
		    	} else {
		    		if(obj.trash) {
		    			$state.go("trash",{"trashId":obj.id});
		    			return;
		    		} else if(obj.isLink) {
		    			$state.go("docs",{"folderId":obj.linkSourceFolderId});
		    		} else {
		    			$state.go("docs",{"folderId":obj.id});
		    		}
		    	}
	    	} else {
				obj.selected = !obj.selected;
				$scope.checkFolderOrFile(obj);
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
	    	
	    
	    
	    var fileIconMap = {
				"doc" :"fl fl-docx",
				"docx" :"fl fl-docx",
				"pdf" :"fl fl-pdf",
				"xls" :"fl fl-xlx",
				"xlsx" :"fl fl-xlx",
				"pptx" :"fl fl-ppt",
				"ppt" :"fl fl-ppt",
				"jpeg" :"fl fl-img",
				"jpg" :"fl fl-img",
				"png" :"fl fl-img",
				"gif" :"fl fl-img",
				"xml" : "fl fl-txt",
				"txt" : "fl fl-txt"
		};
		
		$scope.getFileIcon = function(info) {
			return DocFactory.getFileImgIcon(info.displayName,info.docType);
		};
	    
	    
	  /*  
	    $scope.getFileIcon = function(name) {
	    	return DocFactory.getFileIcon(name);
	    };*/
	   
	    $scope.getDocName = function(doc) {
	    	if(doc.secFile || doc.secCompareFile) {
	    		return doc.displayName;
	    	} else {
	    		return doc.name;
	    	}
	    };
	    
	    $scope.hoveredIcon = function(icon){
	    	$scope.highlightIcn = icon;
	    };
	    
	    $scope.showMore = false;
		$scope.ItemTags = {};
		
		
		$scope.getItemTags = function(id) {
			return $scope.ItemTags[id];
		};
		
		$scope.isShared = function(doc) {
			return (doc.createdBy !== $scope.userinfo["UserId"] || doc.shared) ? true : false;
		};
				
		$scope.incrementFolderLimit = function() {
			
			if ($scope.folders) {
				if($scope.btnlable == "SHOW MORE") {
					$scope.folderlimit = $scope.folders.length;
					$scope.btnlable = "SHOW LESS";
				} else {
					$scope.folderlimit = limitStep;
					$scope.btnlable = "SHOW MORE";
				}
			}
			
			
		};
				
		$scope.setFolderName = function(name) {
			$scope.folderName = name;
		};
		
		$scope.openDoc = function(doc) {
			$state.go("docview",{"docId":doc.id,"clientId":doc.clientId});
		};
		
		function SetSharedFlag(doc) {
			if (doc._type == "Document") {
				DocFactory.getSharedUsersForDoc(doc.id,doc.clientId).then(function(resp){
					 if(resp.status == 200 && resp.data.Status) {
						 doc.sharedWith = resp.data.Notes;
						 if(!_.isEmpty(doc.sharedWith) && Object.keys(doc.sharedWith).length > 1) {
							 doc.shared = true;
						 } else {
							 doc.shared = false;
						 }
					 }
				});
			}
			
			if (doc._type == "Folder") {
				DocFactory.getSharedUsersForFolder(doc.id).then(function(resp){
					 if(resp.status == 200 && resp.data.Status) {
						 doc.sharedWith = resp.data.Folders;
						 if(!_.isEmpty(doc.sharedWith) && Object.keys(doc.sharedWith).length > 1) {
							 doc.shared = true;
						 } else {
							 doc.shared = false;
						 }
					 }
				});
			}
		}
		
		function getDocHierarchy(folderId) {
			 DocFactory.getDocHierarchy(folderId,function(fldrHierarchy) {
				var fldrName = _.findWhere(fldrHierarchy,{id:folderId});
				if(fldrName) {
					$scope.$emit("PageName",{"userName":appdata.UserName,"pageName":fldrName.name});
				}
		 		$scope.docHierarchy = fldrHierarchy;
			 });
		}
		
		function evernoteRedirectCB(folderName) {
			if(folderName != "evernoteUploadVR") {
        		if(uploadSessionObj) {
		    		$scope.OpenUploadDocModal("uploadDocOptions_Evernote");
		    	}
	        	if(setFolderSyncSessionObj) {
		    		checkSyncSession();
		    	}
	        	if(syncSessionObj) {
	        		$scope.syncFolder(syncSessionObj.selectedFolder);
	        	}
        	}
		}
		
		function getErroredObjectWithReason(erroredObjects) {
			var erroredObject = {};
			erroredObject = _.findWhere(erroredObjects,function(erroredObject) {
				return (typeof erroredObject.Reason != undefined && erroredObject.Reason != null && erroredObject.Reason !== "");
			});
			return erroredObject;
		}
		
		function getDocsUnderFolder(folderName) {
			 var folderId = $scope.currentFldrId;
			 
			 getDocHierarchy(folderId);
 			 
		     DocFactory.getDocsUnderFolderWithInfo(folderId).then(function (allDocResp) {
		        if(allDocResp.status == 200 && allDocResp.data.Status){
		        	var folders = allDocResp.data.Folders.folders;
		        	var docs = allDocResp.data.Folders.documents;
		        	
		        	
		        	if(_.isArray(docs)) {
						for (var i=0;i<docs.length; i++) {
							var doc = docs[i];
							doc._type = "Document";
							doc.parentFolderId = folderId;
							doc["displaySize"] = $filter('filesize')(doc.contentLength,$scope.sizePrecision);
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
							DocFactory.setDocPermissions(doc);
							
							if(folderName && doc.name == folderName && i>=6) {
								$scope.folderlimit = folders.length;
								$scope.btnlable = "SHOW LESS";
								doc.isCurrentFolder = true;
							}
							else if(folderName && doc.name == folderName && i<6) {
								doc.isCurrentFolder = true;
							}
						}
					}
		        	folders =  orderBy(folders, $scope.fldrField, $scope.fldrFieldDecending);
		        	docs =  orderBy(docs, $scope.docField, $scope.docFieldDecending);
		        	$scope.folders = folders;
		        	$scope.docs = docs;
		        	evernoteRedirectCB(folderName);		        	
		        }
		     });
		}
	
		getDocsUnderFolder();
	   	
		function handleMoveToTrashCB(items) {
			var isTrashedFalse = _.findWhere(items,{"isTrashed" : false});
			var isTrashedTrue = _.where(items,{"isTrashed" : true});
			
			
			if(!_.isEmpty(isTrashedTrue)) {
				_.each(isTrashedTrue,function(source,index) {
					if(source.objectType == "Document") {
		    			$scope.docs = _.reject($scope.docs, function(doc){ 
			    			return doc.id == source.objectId; 
			    		});
		    		} else if(source.objectType == "Folder") {
		    			$scope.folders = _.reject($scope.folders, function(fldr){ 
			    			return fldr.id == source.objectId; 
			    		});
		    		}
					
					$scope.checkedItems = _.reject($scope.checkedItems, function(doc){ 
		    			return doc.id == source.objectId; 
		    		});
				});
			}
			
			if(isTrashedFalse) {
				var NoPermOnObjectList = _.where(items,{"Reason" : "NoPermOnObject"});
				var ObjectNotFoundList = _.where(items,{"Reason":"ObjectNotFound"});
				var ObjectAssociatedWithTaskSpace = _.where(items,{"Reason":"ObjectAssociatedWithTaskSpace"});
				
				if(!_.isEmpty(NoPermOnObjectList)) {
					MessageService.showErrorMessage("DELETE_ITEMS_ERR");
				} else if(!_.isEmpty(ObjectNotFoundList)) {
					MessageService.showErrorMessage("ITEMS_NOT_FOUND_DELETE");
				} else if(!_.isEmpty(ObjectAssociatedWithTaskSpace)) {
					MessageService.showErrorMessage("ITEMS_ASSOCIATED_WITH_TASKSPACE_DELETE");
				} else {
					MessageService.showErrorMessage("BACKEND_ERR_MSG",[isTrashedFalse.Reason]);
				}
				
			} else {
				$scope.checkedItems = [];
				$scope.checkAllFolders.selected = false;
				$scope.checkAllDocs.selected = false;
				hideAllDocActions();
				MessageService.showSuccessMessage("DELETE_ITEMS");
			}
			
		}
		
		function moveToTrash(items) {
			var postdata = {};
        	var itemList = [];
        	
        	_.each(items,function(item,index) {
        		var obj = {
        				"objectType" : item._type,
        				"objectId" : item.id,
        				"clientId" : item.clientId
        		};
        		if(item._type == "Folder") {
        			obj["clientId"] = appdata["OrganizationId"];
        		}
        		itemList.push(obj);
        	});
        	
        	postdata["objectList"] = itemList;
        	DocFactory.deleteItems(postdata).then(function(result){
				if (result.status==200 && result.data.Status) {
					handleMoveToTrashCB(result.data.resultList);
				}
			});
		}
		
		$scope.deleteItems = function(items) { 
			var txt = 'Are you sure you want to delete selected items ?';
			
			if(items.length == 1) {
				txt = 'Are you sure you want to delete Folder "'+items[0].name+'" ?';
				if(items[0]._type == "Document") {
					txt = 'Are you sure you want to delete Document "'+items[0].name+'" ?';
				}
			}
			$confirm({text: txt})
	        .then(function() {
	        	moveToTrash(items);
	        });
		}; 
		
		
		/* This is old api call */
		$scope.deleteFolder = function(doc) { 
			var txt = 'Are you sure you want to delete Folder "'+doc.name+'" ?';
			if(doc._type == "Document") {
				txt = 'Are you sure you want to delete Document "'+doc.name+'" ?';
			}
			$confirm({text: txt})
	        .then(function() {
	        	var postdata = {};
	        	postdata["userId"] = $scope.userinfo["UserId"];
				switch(doc._type) {
				case "Folder":
					DocFactory.deleteFolder(doc.id,postdata).success(function(result){
						if (result.Status) {
							getDocsUnderFolder();
							MessageService.showSuccessMessage("FOLDER_DELETE",[doc.name]);
						}
					});
					break;
				case "Document":
					DocFactory.deleteDocument(doc.id,postdata).success(function(result){
						if (result.Status) {
							getDocsUnderFolder();
							MessageService.showSuccessMessage("DOC_DELETE",[doc.name]);
						}
					});
					break;
				}
				
	        });
			
		}; 
				
		$scope.RenameDoc = function(doc){
			var postdata = {
				"id" : doc.id
			};
			switch(doc._type) {
			case "Folder":
				postdata.newName = doc.name;
				DocFactory.renameFolder(postdata).then(function(response){
					if (response.status == 200 && response.data.Status) {
						//getDocsUnderFolder();
						var orgDoc = _.findWhere($scope.folders,{"id":doc.id});
						if(orgDoc) {
							orgDoc.name = doc.name;
							orgDoc.selected = false;
							hideAllDocActions();
							$scope.checkedItems = [];
							$scope.checkAllFolders.selected = false;
							$scope.checkAllDocs.selected = false;
							MessageService.showSuccessMessage("FOLDER_RENAME");
						}
					}
				});
				break;
			case "Document":
				postdata.newDisplayName = doc.displayName;
				postdata.clientId = doc.clientId;
				DocFactory.renameDocument(postdata).then(function(response){
					if(response.status == 200 && response.data.Status) {
						var orgDoc = _.findWhere($scope.docs,{"id":doc.id});
						if(orgDoc) {
							orgDoc.displayName = doc.displayName;
							orgDoc.selected = false;
							hideAllDocActions();
							$scope.checkedItems = [];
							$scope.checkAllFolders.selected = false;
							$scope.checkAllDocs.selected = false;
							MessageService.showSuccessMessage("DOC_RENAME");
						}
					}
				});
				break;
			}
			
		};
		
		function processItems(items) {
			 var processedItems = [];
			 _.each(items,function(item,index) {
				 var obj = {};
				 obj["Type"] = item._type;
				 obj["TopObjectId"] = item.id;
				 obj["TopObjectClientId"] = item.clientId;
				 processedItems.push(obj);
			 });
			 return processedItems;
		}
		
		function handleSaveTagCB(items,results) {
			var isTaggedFalse = _.findWhere(results,{"isTagged" : false});
			var isTaggedTrue = _.where(results,{"isTagged" : true});
			
			
			if(!_.isEmpty(isTaggedTrue)) {
				_.each(isTaggedTrue,function(item,index) {
					
					var selectedItem = _.findWhere(items,{"id":item.TopObjectId});
					if(selectedItem) {
						TagService.getItemTagsById(selectedItem);
						selectedItem.selected = false;
					}
					
					$scope.checkedItems = _.reject($scope.checkedItems, function(doc){ 
		    			return doc.id == item.TopObjectId; 
		    		});
				});
			}
			
			if(isTaggedFalse) {
				var NoPermOnObjectList = _.where(results,{"Reason" : "NoPermOnObject"});
				var ObjectNotFoundList = _.where(results,{"Reason":"ObjectNotFound"});
				
				if(!_.isEmpty(NoPermOnObjectList)) {
					MessageService.showErrorMessage("TAG_ITEMS_ERR");
				}
				
				if(!_.isEmpty(ObjectNotFoundList)) {
					MessageService.showErrorMessage("ITEMS_NOT_FOUND_TAG");
				}
				
			} else {
				$scope.checkedItems = [];
				$scope.checkAllFolders.selected = false;
				$scope.checkAllDocs.selected = false;
				hideAllDocActions();
				MessageService.showSuccessMessage("TAG_ITEMS");
			}
			
		}
		
		$scope.saveTag = function(items,tags) {
			var postdata = {};
			tags = _.without(tags, _.findWhere(tags, {"TagName" : ""}));
			postdata["tags"] = tags;
			//postdata["Values"] = values;
			postdata["Items"] = processItems(items);
			
			TagService.tagItems(postdata).then(function(response) {
				if (response.status == 200 && response.data.Status) {
					handleSaveTagCB(items,response.data.resultList);
				}
			});
		};
		
		
		$scope.unTag = function(tag,item,$event) {
			$event.preventDefault();
		    $event.stopPropagation();
		    if(tag) {
				var text = "Are you sure you want to delete Tag "+tag.TagName+" ?";
	  			$confirm({text: text})
		        .then(function() {
		        	TagService.unTag(tag,item).then(function(response){
						if (response.status == 200) {
							TagService.getItemTagsById(item);
						}
					});
			    }, function() {
			    	
			    });
			}
			
		};
		
		$scope.OpenAddTagModal = function (item,size) {
			if(!angular.isArray(item)) {
				item = [item];
			}
			var modalInstance = $uibModal.open({
			      animation: $scope.animationsEnabled,
			      templateUrl: 'app/components/Documents/TagDocuments/addTagModal.html',
			      controller: 'TagDocumentsController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'vm',
			      backdrop: 'static',
			      size: size,
			      resolve: {
			    	  item : function() {
			    		  return item;
			    	  },
			    	  userinfo : function() {
			    		  return $scope.userinfo;
			    	  }
			      }
			    });
			
			modalInstance.result.then(function (obj) {
				$scope.saveTag(obj.items,obj.tags,obj.values);
			}, function () {
				
			});
		};
		
		function handlePropertiesCB(items,data) {
			var isUpdatedFalse = _.findWhere(items,{"isUpdated" : false});
			var isUpdatedTrue = _.where(items,{"isUpdated" : true});
			
			if(!_.isEmpty(isUpdatedTrue)) {
				_.each(isUpdatedTrue,function(updated,index) {
					var source = _.findWhere(data.original,{"id" : updated.objectId});
					if(source) {
						if(data.modified.cik) {
							source.ticker = data.modified.ticker;
							source.companyName = data.modified.companyName;
							source.cik = data.modified.cik;
						} else {
							source.ticker = null;
							source.companyName = null;
							source.cik = null;
						}
						
						if(typeof data.modified.isEditable !== 'undefined') {
							source["editable"] =  _.toBoolean(data.modified.isEditable);
						}
						
						if(typeof data.modified.isPrivate !== 'undefined') {
							source["private"] = _.toBoolean(data.modified.isPrivate);
						}
						
						if(data.modified.docType) {
							source.docType = data.modified.docType;
						}
						
						if(data.modified.subType) {
							source.subType = data.modified.subType;
						}
						
						source.selected = false;
						
						$scope.checkedItems = _.reject($scope.checkedItems, function(doc){ 
			    			return doc.id == source.id; 
			    		});
					}
				});
			}
			
			if(isUpdatedFalse) {
				var NoPermOnObjectList = _.where(items,{"Reason" : "NoPermOnObject"});
				var ObjectNotFoundList = _.where(items,{"Reason":"ObjectNotFound"});
				
				if(!_.isEmpty(NoPermOnObjectList)) {
					MessageService.showErrorMessage("EDIT_PROPERTIES_ERR");
				}
				
			} else {
				$scope.checkedItems = [];
				$scope.checkAllFolders.selected = false;
				$scope.checkAllDocs.selected = false;
				hideAllDocActions();
				MessageService.showSuccessMessage("EDIT_PROPERTIES");
			}
						 
		}
		
		$scope.OpenPropertiesModal = function (source,size) {
			var modalInstance = $uibModal.open({
			      animation: $scope.animationsEnabled,
			      templateUrl: 'app/components/Documents/EditDocProperties/EditDocProperties.html',
			      controller: 'DocPropertiesController',
			      controllerAs: 'vm',
			      appendTo : $('.rootContainer'),
			      backdrop: 'static',
			      size: size,
			      resolve: {
			    	  source : function() {
			    		  return source;
			    	  },
			    	  docTypes : function () {
			    		  return  DocFactory.uploadDocTypes;
			    	  },
			    	  docSubTypes : function () {
			    		  return  DocFactory.uploadDocSubTypes;
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
		
		function handleCopyDocCB(items,results) {
			var isCopiedFalse = _.findWhere(results,{"isCopied" : false});
			var isCopiedTrue = _.where(results,{"isCopied" : true});
						
			if(!_.isEmpty(isCopiedTrue)) {
				_.each(isCopiedTrue,function(item,index) {
					$scope.checkedItems = _.reject($scope.checkedItems, function(doc){ 
		    			return doc.id == item.TopObjectId; 
		    		});
				});
				getDocsUnderFolder();
			}
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
				$scope.checkedItems = [];
				$scope.checkAllFolders.selected = false;
				$scope.checkAllDocs.selected = false;
				hideAllDocActions();
				MessageService.showSuccessMessage("COPY_ITEMS");
			}
		}
		
		function copyDocList(docList,isCopyWithAnnotations) {
			var objectList = [];
			_.each(docList,function(doc,index) {
        		var obj = {
        				"objectId" : doc.id,
        				"clientId" : doc.clientId,
        				"newName" : doc.newName,
        				"withAnnotations" : isCopyWithAnnotations
        		};
        		objectList.push(obj);
        	});
			 var postdata = {
						"copyToFolderId" : $scope.currentFldrId,
						"objectList" : objectList
					};
			DocFactory.copyDocList(postdata).then(function(resp) {
				 if(resp.status == 200 && resp.data.Status) {
					 handleCopyDocCB($scope.checkedItems,resp.data.resultList);
				 }
			});
		}
		
		function OpenCopyDocListModal (docList,size) {
			var modalInstance = $uibModal.open({
			      animation: $scope.animationsEnabled,
			      templateUrl: 'app/components/Documents/Copy/CopyDocListModal.html',
			      controller: 'CopyDocListController',
			      controllerAs: 'cdlc',
			      appendTo : $('.rootContainer'),
			      backdrop: 'static',
			      size: size,
			      resolve: {
			    	  docList : function() {
			    		  return docList;
			    	  },
			    	  currentFolder:{"id" : $scope.currentFldrId}
			      }
			});
			modalInstance.result.then(function (resp) {
				copyDocList(resp.newDocList,resp.isCopyWithAnnotations);
			}, function () {
			      
			});
		}
		
		function handleSynchronizationCB(data) {
			data.selected = false;
			hideAllDocActions();
			$scope.checkedItems = [];
			$scope.checkAllFolders.selected = false;
			$scope.checkAllDocs.selected = false;
		}
		
		function handleBoxSynchronizationCB() {
			hideAllDocActions();
			$scope.checkedItems = [];
			$scope.checkAllFolders.selected = false;
			$scope.checkAllDocs.selected = false;
		}
		
		$scope.OpenSyncModal = function (source,size) {
			var modalInstance = $uibModal.open({
			      animation: $scope.animationsEnabled,
			      templateUrl: 'app/components/Documents/Synchronization/synchronizationModal.html',
			      controller: 'SynchronizationController',
			      controllerAs: 'vm',
			      appendTo : $('.rootContainer'),
			      backdrop: 'static',
			      size: size,
			      resolve: {
			    	  source : function() {
			    		  return source;
			    	  }
			      }
			    });
			modalInstance.result.then(function (data) {
				 handleSynchronizationCB(data);
			}, function () {
			      
			});
		};
		
		
		$scope.OpenBoxSyncModal = function (source,size) {
			var modalInstance = $uibModal.open({
			      animation: $scope.animationsEnabled,
			      templateUrl: 'app/components/Box/BrowseBox/box.html',
			      controller: 'BoxController',
			      controllerAs: 'box',
			      appendTo : $('.rootContainer'),
			      backdrop: 'static',
			      size: size,
			      resolve: {
			    	  "source" : function() {
			    		  return _.isEmpty(source) ? null : source[0];
			    	  }
			      }
			    });
			modalInstance.result.then(function (data) {
				handleBoxSynchronizationCB();
			}, function () {
			      
			});
		};
		
		
		
		
		function rejectFolderOrDoc(source) {
			
			if(source.objectType == "Document") {
    			$scope.docs = _.reject($scope.docs, function(doc){ 
	    			return doc.id == source.documentId; 
	    		});
    			$scope.checkedItems = _.reject($scope.checkedItems, function(doc){ 
	    			return doc.id == source.documentId; 
	    		});
    		} else if(source.objectType == "Folder") {
    			$scope.folders = _.reject($scope.folders, function(fldr){ 
	    			return fldr.id == source.folderId; 
	    		});
    			$scope.checkedItems = _.reject($scope.checkedItems, function(fldr){ 
    				return fldr.id == source.folderId;
	    		});
    		}
		}
		
		function OpenMoveTofolderConfirmModal(item,itemlist,targetFolder,itemsToMove,size) {
			var modalInstance = $uibModal.open({
			      animation: $scope.animationsEnabled,
			      templateUrl: 'app/components/Documents/MoveToFolder/MoveToFolderConfirmation.html',
			      controller: 'MoveToFolderConfirmController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'vm',
			      backdrop: 'static',
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
		}
		
		function checkIsExistAndMove(ObjectExistsList,targetFolder,itemsToMove) {
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
			   } else {
				   MoveTofolderCallBack({"items":itemsToMove,"moveTo":targetFolder,"source" : itemsToMove});
			   }
		 }
		
		function handleMoveToFolderSenerios(failedDocs,targetFolder,itemsToMove) {
			
			var NoReplacePermOnObjectList = _.where(failedDocs,{"Reason":"NoReplacePermOnObject"});
			var ObjectExistsList = _.where(failedDocs,{"Reason":"AnotherObjectExists"});
			var NoPermOnObjectList = _.where(failedDocs,{"Reason":"NoPermOnObject"});
			var ObjectNotFoundList = _.where(failedDocs,{"Reason":"ObjectNotFound"});
			var erroredObject = getErroredObjectWithReason(failedDocs);
			if(!_.isEmpty(NoPermOnObjectList)) {
				MessageService.showErrorMessage("MOVE_TO_PERM_ERROR");
			} else if(!_.isEmpty(erroredObject)) {
				MessageService.showErrorMessage("BACKEND_ERR_MSG",[erroredObject.Reason]);
			} else {
				MessageService.showErrorMessage("DEFAULT_ERROR_MSG");
			}
			if(ObjectExistsList && ObjectExistsList.length > 0) {
				checkIsExistAndMove(ObjectExistsList,targetFolder,itemsToMove);
			}
		}
		
		function MoveTofolderCallBack(data) {
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
			var failedDocs =  _.where(data.items,{"isMoved":false});
			if(failedDocs && failedDocs.length > 0) {
				handleMoveToFolderSenerios(failedDocs,data.moveTo,data.source);
			} else {
				var checkedFolders = _.where($scope.checkedItems, {_type:"Folder"});
				var checkedDocs = _.where($scope.checkedItems, {_type:"Document"});
				
				if(($scope.checkedItems.length > 0) && ($scope.folders.length == checkedFolders.length)) {
					$scope.checkAllFolders.selected = true;
				} else {
					$scope.checkAllFolders.selected = false;
				}
				
				if(($scope.checkedItems.length > 0) && ($scope.docs.length == checkedDocs.length)) {
					$scope.checkAllDocs.selected = true;
				} else {
					$scope.checkAllDocs.selected = false;
				}
			}
		}
		
		$scope.OpenMoveTofolderModal = function (source,size) {
			var modalInstance = $uibModal.open({
			      animation: $scope.animationsEnabled,
			      templateUrl: 'app/components/BrowseFileOrFolder/BrowseFileOrFolder.html',
			      controller: 'BrowseFileOrFolderController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'vm',
			      backdrop: 'static',
			      size: "lg",
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
		
		function fileUploadToExternalApps(file,postdata) {
			postdata["file"] = file;
			   
		    file.upload = Upload.upload({
	            url: 'fileUpload',
	            data: postdata
	        });

	        file.upload.then(function (response) {
	        	if (response.status == 200 && response.data.Status &&_.isEmpty(response.data.failedFile)) {
	     		   getDocsUnderFolder();
	     		} else if(!_.isEmpty(response.data.failedFile) && !_.isEmpty(response.data.failedFileErrors)){
	     			MessageService.showErrorMessage("BACKEND_ERR_MSG",[response.data.failedFileErrors[0]]);
	     		} else if(!_.isEmpty(response.data.failedFile)) {
	     			MessageService.showErrorMessage("BACKEND_ERR_MSG",["Unable to upload file "+response.data.failedFile[0]]);
	     		}
	        }, function (response) {
	            if (response.status > 0)
	                $scope.errorMsg = response.status + ': ' + response.data;
	        }, function (evt) {
	            file.progress = Math.min(100, parseInt(100.0 * 
	                        evt.loaded / evt.total));
	        });
		}
		
		$scope.UploadFilesToExternalApps = function(files, errFiles) {
			var postdata = {};
			postdata["parentFolderId"] = $scope.currentFldrId;
			angular.forEach(files, function(file,index) {
				userService.getUsedSpace().then(function(resp){
					if (resp.status == 200 && resp.data.Status) {
						if(appdata.rootFolderId == resp.data.RootFolder) {
							fileUploadToExternalApps(file,postdata);
						}
					}
				});
			});
		};
		
		$scope.OpenUploadDocModal = function (uploadFrom,size) {
			var isNumiciFolder = true;
			isNumiciFolder = DocFactory.isNumiciFolder($scope.docHierarchy[$scope.docHierarchy.length - 1]);
			if(!isNumiciFolder) {
				angular.element('.uploadFromClientBtn').triggerHandler('click');
				return false;
			}
			var modalInstance = $uibModal.open({
			      animation: $scope.animationsEnabled,
			      templateUrl: 'app/components/Documents/Upload/uploadFileModal.html',
			      controller: 'UploadFileModalCtrl',
			      appendTo : $('.rootContainer'),
			      backdrop: 'static',
			      size: size,
			      resolve: {
			    	  folder : function() {
			    		  return {
			    			  folderId:  $scope.currentFldrId,
			    			  folderName:_.findWhere($scope.docHierarchy,{id:$scope.currentFldrId}).name
			    		  };
			    	  },
			    	  docTypes : function () {
			    		  return  DocFactory.uploadDocTypes;
			    	  },
			    	  docSubTypes : function () {
			    		  return  DocFactory.uploadDocSubTypes;
			    	  },
			    	  uploadFrom : {"from":uploadFrom},
			    	  resources : {},
			    	  selectedTS : {},
			    	  selectedTSSection : {},
			    	  selectedTsObjectList : {}
			      }
			    });
			
			modalInstance.result.then(function (fileInfo) {
				if(fileInfo) {
					uploadFiles(fileInfo);
				}
			}, function () {
			      
			});
		};
		
	 function fileUpload(file,postdata) {
		postdata["file"] = file;
		   
	    file.upload = Upload.upload({
            url: 'docUpload',
            data: postdata
        });

        file.upload.then(function (response) {
            if (response.status == 200 && response.data.Status) {
        	   getDocsUnderFolder();
            }
        }, function (response) {
            if (response.status > 0)
                $scope.errorMsg = response.status + ': ' + response.data;
        }, function (evt) {
            file.progress = Math.min(100, parseInt(100.0 * 
                        evt.loaded / evt.total));
        });
	}
	
	function evernoteUpload(file,postdata) {
		postdata["evernoteids"] = file.guid;
		
	    Upload.upload({url: 'docUpload',data: postdata}).then(function (response) {
             if (response.status == 200 && response.data.Status) {
            	 getDocsUnderFolder("evernoteUploadVR");
             }
        });
	}
	
	function checkSizesAndUpload(filesConfig,fileInfo,file,index,resp) {
		var usedSpaceInBytes = resp.data.UserRootFolderSize;
		var userAllocatedSpaceInBytes = resp.data.UserAllocatedSize;
		if(file.size > appdata.UserSettings.user_MaxUploadFileSize) {
			var maxUploadFileSize = $filter('filesize')(appdata.UserSettings.user_MaxUploadFileSize,$scope.sizePrecision);
			var UploadFileSizeErrorMessage = "Error in uploading the file: '"+file.name+"' - Files size is more than the max size ("+maxUploadFileSize+") allowed for upload.";
			MessageService.showErrorMessage("BACKEND_ERR_MSG",[UploadFileSizeErrorMessage]);
		} else if((file.size+usedSpaceInBytes) > userAllocatedSpaceInBytes) {
			var UploadFileSizeErrorMessage = "You have reached the allocated storage quota. Please contact sales@numici.com to upgrade your account. Document '"+file.name+"' can't be uploaded.";
			MessageService.showErrorMessage("BACKEND_ERR_MSG",[UploadFileSizeErrorMessage]);
		} else {
			var postdata = {};
			postdata["parentFolderId"] = fileInfo.fldrId;
			postdata["context"] = "document";
			if(fileInfo.context) {
				postdata["context"] = fileInfo.context;
			}
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
		
		if(fileInfo.filesFrom == "uploadDocOptions_ClientSystem") {
			$scope.showProgress = true;
		}
		
		$scope.multiFiles = fileInfo.file;
		
		angular.forEach($scope.multiFiles, function(file,index) {
			userService.getUsedSpace().then(function(resp){
				if (resp.status == 200 && resp.data.Status) {
					if(appdata.rootFolderId == resp.data.RootFolder) {
						checkSizesAndUpload(filesConfig,fileInfo,file,index,resp);
					}
				}
			});
			
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
	 
	 function OpenConfirmUploadDocModal(file,files,fileInfo) {
			var modalInstance = $uibModal.open({
			      animation: $scope.animationsEnabled,
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
	 
	  function uploadFiles(fileInfo) {
	        if (fileInfo.file) {
	        	fileInfo["context"] = "document";
	        	var filesData = [];
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
	   }
	  
		$scope.OpenNoteModal = function (size) {
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
			    		return $scope.currentFldrId;
			    	},
			    	resources : function() {
			    		return {"action" : "addToTS"};
			    	},
			    	selectedTS : {},
			    	selectedTSSection : {},
			    	selectedTsObjectList : {}
			      }
			    });
			
			modalInstance.result.then(function (doc) {
				if(doc) {
					DocViewerService.docViewModeData = {'docId': doc.id,'viewMode':'Edit'};
					$state.go('docview',{'docId': doc.id,'clientId':doc.clientId});
				}
			}, function () {
			      
			});
		};

		$scope.OpenFolderModal = function (size) {
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
			    		return $scope.currentFldrId;
			    	}
			      }
			    });
			
			modalInstance.result.then(function (newFolder) {
				MessageService.showSuccessMessage("FOLDER_CREATE",[newFolder.name]);
				getDocsUnderFolder(newFolder.name);
			}, function () {
			      
			});
			
		};
		
		$scope.OpenLinkFolderModal = function (size) {
			var modalInstance = $uibModal.open({
			      animation: $scope.animationsEnabled,
			      templateUrl: 'app/components/Documents/LinkFolder/LinkFolderModal.html',
			      controller: 'LinkFolderModalController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'vm',
			      backdrop: 'static',
			      size: size,
			      resolve: {
			    	  resources : function () {
			    		  return {
			    			  "folderId" : $scope.currentFldrId
			    		  };
			    	  },
			    	  foldersList : function() {
			    		  return DocFactory.getDocsUnderFolder(appdata.rootFolderId);
			    	  }
			      }
			    });
			
			modalInstance.result.then(function (newFolder) {
				MessageService.showSuccessMessage("FOLDER_LINK",[newFolder.name]);
				getDocsUnderFolder();
			}, function () {
			      
			});
		};
		
		$scope.OpenRenameFolderModal = function (doc,size) {
			
			var modalInstance = $uibModal.open({
			      animation: $scope.animationsEnabled,
			      templateUrl: 'app/components/Documents/Rename/renameDoc.html',
			      controller: 'RenameDocController',
			      appendTo : $('.rootContainer'),
			      controllerAs : 'vm',
			      backdrop: 'static',
			      size: size,
			      resolve: {
			    	 doc : function() {
			    		 return doc;
			    	 }
			      }
			    });
			modalInstance.result.then(function (renamedDoc) {
				$scope.RenameDoc(renamedDoc);
			}, function () {
			      
			});
		};
		
		function hideAllDocActions() {
			_.each($scope.docActionProps,function(docAction,key) {
				docAction.show = false;
			});
		}
		
		function checkDocActions() {
			if($scope.checkedItems.length > 0) {
				var permissions = [];
				_.each($scope.checkedItems,function(item,index) {
					permissions.push(item.perms);
				});
				
				var nonOwnedItem = _.findWhere(permissions,{'owner': false});
				var nonEditItem = _.findWhere(permissions,{'edit': false});
				var nonViewItem = _.findWhere(permissions,{'view': false});
				var nonDeleteItem = _.findWhere(permissions,{'delete': false});
				var nonShareItem = _.findWhere(permissions,{'share': false});
				
				var webResourceDocObj = _.findWhere($scope.checkedItems, {"docType": "WebResource"});
				var webResourceFolderObj = _.find($scope.checkedItems, function(item) {
					var status = false;
					if(item._type == "Folder" && item.name == "WebResources") {
						status = true;
					}
					return status;
				});
				
				var externalFolderObj = _.find($scope.checkedItems, function(item) {
					var status = false;
					if(item._type == "Folder" && (DocFactory.isDropBoxFolder(item) || DocFactory.isBoxFolder(item) || DocFactory.isoneDriveFolder(item))) {
						status = true;
					}
					return status;
				});
				var privateDocs = _.findWhere($scope.checkedItems, {"private": true});
				var checkedFolders = _.where($scope.checkedItems, {_type:"Folder"});
				var LinkedFolders = _.where(checkedFolders, {isLink:true});
				var isExternalDocPresent = DocFactory.isExternalDocPresent($scope.checkedItems);
				
				var folderSharable = true;
				if(!_.isEmpty(checkedFolders) && appdata.IsSharedOrganization && appdata.UserSettings.sharedOrgUser_AllowFolderShare !== "Yes") {
					folderSharable = false;
				}
				var isLinkedFoldersOccured = false;
				if(!_.isEmpty(checkedFolders) && !_.isEmpty(LinkedFolders)) {
					isLinkedFoldersOccured = true;
				}
				
				if(!webResourceDocObj && !webResourceFolderObj && !isLinkedFoldersOccured && !nonViewItem) {
					$scope.docActionProps.Tag.show = true;
				}
				
				if(_.isEmpty(checkedFolders) && !webResourceDocObj) {
					$scope.docActionProps.AddToTaskspace.show = true;
				}
				
				if(!nonShareItem && 
						!nonEditItem && 
						folderSharable && 
						!webResourceDocObj && 
						!webResourceFolderObj && 
						!externalFolderObj &&
						!isExternalDocPresent) {
					$scope.docActionProps.Share.show = true;
				}
				
				if($scope.checkedItems.length == 1 && $scope.checkedItems[0]._type == "Folder" && $scope.checkedItems[0].name != "WebResources" && !nonEditItem && !isLinkedFoldersOccured) {
					$scope.docActionProps.Sync.show = true;
					if($scope.checkedItems[0].isSyncedWithEvernote) {
						$scope.docActionProps.evernoteSync.show = true;
					}
				}
				
				var boxSyncEnabled = appdata.UserSettings["additionalNavigation_Box"] === "Enabled" ;
				if(boxSyncEnabled && $scope.checkedItems.length == 1 && $scope.checkedItems[0]._type == "Folder" && $scope.checkedItems[0].name != "WebResources" && !nonEditItem && !isLinkedFoldersOccured) {
					$scope.docActionProps.boxSync.show = false;
				}
				
				if(!nonDeleteItem) {
					$scope.docActionProps.Delete.show = true;
				}
				
				if($scope.checkedItems.length == 1 && $scope.checkedItems[0]._type != "Folder" && !webResourceDocObj && !isLinkedFoldersOccured && !nonViewItem && !isExternalDocPresent) {
					$scope.docActionProps.Copy.show = true;
				}
				
				if($scope.checkedItems.length == 1) {
					var fldr = $scope.checkedItems[0];
					if(fldr._type == "Folder" && fldr.perms.owner){
						if(!DocFactory.isNumiciFolder(fldr)) {
							if(_.isEmpty(fldr.indexDocs) || (!_.isEmpty(fldr.indexDocs) && fldr.indexDocs.toLowerCase() == "no")) {
								$scope.docActionProps.Index.show = true;
							} else if((!_.isEmpty(fldr.indexDocs) && fldr.indexDocs.toLowerCase() == "yes")) {
								$scope.docActionProps.UnIndex.show = true;
							}
						}
					}
				}
				
				if(!nonOwnedItem && !webResourceDocObj && !webResourceFolderObj) {
					
					if($scope.checkedItems.length == 1) {
		    			$scope.docActionProps.Rename.show = true;
		    		} else {
		    			$scope.docActionProps.Rename.show = false;
		    		}
					
					if(!isLinkedFoldersOccured) {
						$scope.docActionProps.MoveTo.show = true;
					}
					
					if(isLinkedFoldersOccured) {
						if($scope.checkedItems.length == 1) {
							$scope.docActionProps.Properties.show = true;
			    		} else {
			    			$scope.docActionProps.Properties.show = false;
			    		}
					} else {
		    			$scope.docActionProps.Properties.show = true;
		    		}
				}
				if($scope.checkedItems.length == 1 && $scope.checkedItems[0]._type != "Folder") {
					$scope.docActionProps.AssociatedTaskspace.show = true;
				}
			} 
		}
		
		$scope.unselectAll = function($event) {
			if($event) {
				$event.stopPropagation();
			}
			
			_.each($scope.checkedItems,function(item,index) {
				item.selected = false;
			});
			hideAllDocActions();
			$scope.checkedItems = [];
			var checkedFolders = _.where($scope.checkedItems, {_type:"Folder"});
			var checkedDocs = _.where($scope.checkedItems, {_type:"Document"});
			
			if(($scope.checkedItems.length > 0) && ($scope.folders.length == checkedFolders.length)) {
				$scope.checkAllFolders.selected = true;
			} else {
				$scope.checkAllFolders.selected = false;
			}
			
			if(($scope.checkedItems.length > 0) && ($scope.docs.length == checkedDocs.length)) {
				$scope.checkAllDocs.selected = true;
			} else {
				$scope.checkAllDocs.selected = false;
			}
		};
		
		
		$scope.onLongPress = function(obj) {
			if(obj.selected) {
				obj.selected = false;
			} else {
				obj.selected = true;
			}
			$scope.checkFolderOrFile(obj);
		};
		
		$scope.checkFolderOrFile = function(obj) {
			hideAllDocActions();
			if(obj.selected) {
				$scope.checkedItems.push(obj);
			} else {
				$scope.checkedItems = _.without($scope.checkedItems, _.findWhere($scope.checkedItems, {id: obj.id}));
			}
			
			var checkedFolders = _.where($scope.checkedItems, {_type:"Folder"});
			var checkedDocs = _.where($scope.checkedItems, {_type:"Document"});
			
			if(($scope.checkedItems.length > 0) && ($scope.folders.length == checkedFolders.length)) {
				$scope.checkAllFolders.selected = true;
			} else {
				$scope.checkAllFolders.selected = false;
			}
			
			if(($scope.checkedItems.length > 0) && ($scope.docs.length == checkedDocs.length)) {
				$scope.checkAllDocs.selected = true;
			} else {
				$scope.checkAllDocs.selected = false;
			}
			
			checkDocActions();
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
		    	case "Share":
		    		OpenShareModalFromNav();
		    		break;
		    	case "Index Docs":
		    		indexOrUnIndexDocs("Yes");
		    		break;
		    	case "Unindex docs":
		    		indexOrUnIndexDocs("No");
		    		break;
		    	case "Add To Taskspace":
		    		addObjectsToTaskSpace();
		    		break;
		    	case "Associated Taskspace":
		    		addedTaskspaces();
		    		break;
		    	case "Tag":
		    		OpenAddTagModalFromNav();
		    		break;
		    	case "Rename":
		    		OpenRenameModalFromNav();
		    		break;
		    	case "Delete":
		    		deleteFromNav();
		    		break;
		    	case "Move to...":
		    		OpenMoveToModalFromNav();
		    		break;
		    	case "Properties":
		    		OpenPropertiesModalFromNav();
		    		break;
		    	case "Copy":
		    		CopyDocsFromNav();
		    		break;
		    	case "Connect with Evernote Notebook":
		    		OpenConnectWithEvernoteModalFromNav();
		    		break;
		    	case "Sync with Evernote Notebook":
		    		OpenSyncWithEvernoteModalFromNav();
		    		break;
		    	case "Sync with Box":
		    		OpenBoxSyncModalFromNav();
		    		break;
	    	}
	    	
	    };
	    
	    function OpenShareModalFromNav() {
	    	if($scope.checkedItems.length > 0) {
	    		$scope.OpenShareDocModal($scope.checkedItems);
	    	}
	    }
	    	    
	    function indexOrUnIndexDocs(option) {
	    	if($scope.checkedItems.length == 1) {
	    		var data = { "folder": $scope.checkedItems[0].id, "option":option};
	    		DocFactory.indexOrUnIndexDocs(data).then(function(resp) {
	    			if(resp.status == 200 && resp.data.Status) {
	    				var msgVal = (option == "Yes" ? "indexing" : "unindexing");
	    				var indexDocs = (option == "Yes" ? "to yes" : "to no");
	    				APIUserMessages.info(msgVal+" started");
	    				$scope.checkedItems[0]["indexDocs"] = indexDocs;
	    				$scope.checkedItems[0]["selected"] = false;
	    				$scope.checkedItems = [];
	    				hideAllDocActions();
		   			}
	    		});
	    	}
	    }
	    
	    function addObjectsToTaskSpace() {
			var modalInstance = $uibModal.open({
			      animation: $scope.animationsEnabled,
			      templateUrl: 'app/components/TaskSpace/AddToTaskSpace/addToTaskSpace.html',
			      controller: 'AddToTaskSpaceController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'vm',
			      backdrop: 'static',
			      size: "lg",
			      resolve: {
			    	  item : {},
			    	  selectedChannelInfo : {},
			    	  slackChannelConfigs : {},
			    	  moveObjectInfo : {},
			    	  addObjectsFromDocsInfo : function() {
			    		  return {
			    				  "action" : "AddObjectsTOTS",
			    				  "selectedObjects" : $scope.checkedItems
			    		  };
			    	  },
			    	  asanaconfig : {}
			      }
			});
			modalInstance.result.then(function (resultsData) {
				if(!_.isEmpty(resultsData)) {
					_.each(resultsData,function(item,index) {
						$scope.checkedItems = _.reject($scope.checkedItems, function(doc){ 
							if(doc.id == item.objectId) {
								doc.selected = false;
							}
			    			return doc.id == item.objectId; 
			    		});
					});
					$scope.checkedItems = [];
					$scope.checkAllFolders.selected = false;
					$scope.checkAllDocs.selected = false;
					hideAllDocActions();
					MessageService.showSuccessMessage("DOCS_ADDED_TO_TS");
				}
			}, function () {
				
			});
		}
	    
	    function addedTaskspaces () {
			DocFactory.getDocAssociatedToTaskspace($scope.checkedItems[0].clientId,$scope.checkedItems[0].id).then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					AddedTaskspacesService.open({"windowClass" : "added-taskspaces-list", "SelectedDoc" : $scope.checkedItems[0],"AddedTaskspaces" : resp.data.Taskspaces});
				}
			});
		}
	    
	    function OpenAddTagModalFromNav() {
	    	if($scope.checkedItems.length > 0) {
	    		$scope.OpenAddTagModal($scope.checkedItems);
	    	}
	    }
	    
	    function OpenRenameModalFromNav() {
	    	if($scope.checkedItems.length == 1) {
	    		$scope.OpenRenameFolderModal($scope.checkedItems[0]);
	    	}
	    }
	    
	    function deleteFromNav() {
	    	if($scope.checkedItems.length>0) {
	    		$scope.deleteItems($scope.checkedItems);
	    	}
	    }
	    
	    function OpenMoveToModalFromNav() {
	    	if($scope.checkedItems.length>0) {
	    		$scope.OpenMoveTofolderModal($scope.checkedItems);
	    	} 
	    }
	    
	    function OpenPropertiesModalFromNav() {
	    	if($scope.checkedItems.length > 0) {
	    		$scope.OpenPropertiesModal($scope.checkedItems);
	    	}
	    }
	    
	    function CopyDocsFromNav() {
	    	if($scope.checkedItems.length > 0) {
	    		OpenCopyDocListModal($scope.checkedItems);
	    	}
	    }
	    
	    function OpenConnectWithEvernoteModalFromNav() {
	    	if($scope.checkedItems.length > 0) {
	    		$scope.OpenSyncModal($scope.checkedItems);
	    	}
	    }
	    
	    function OpenSyncWithEvernoteModalFromNav() {
	    	if($scope.checkedItems.length > 0) {
	    		$scope.syncFolder($scope.checkedItems[0],function(){
	    			handleSynchronizationCB($scope.checkedItems[0]);
	    		});
	    	}
	    }
	    
	    function OpenBoxSyncModalFromNav() {
	    	if($scope.checkedItems.length > 0) {
	    		if(appdata.hasBoxAuth) {
	    			$scope.OpenBoxSyncModal($scope.checkedItems);
				} else {
					BoxService.autherize();
				}
	    	}
	    }
	    
	    $scope.closeProgress = function() {
			$scope.showProgress = false;
		};
		
	   $scope.OpenImportSECFilingModal = function (size) {
			var modalInstance = $uibModal.open({
			      animation: $scope.animationsEnabled,
			      templateUrl: 'app/components/Documents/ImportSecFiles/importSECfilingModal.html',
			      controller: 'ImportSECModalCtrl',
			      appendTo : $('.rootContainer'),
			      backdrop: 'static',
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
						$state.go('docview',{'docId': response.data.Notes,"clientId":null});
					}
				}
			});
		};
		
		function handleTransferOwnershipCB(trnasferedInfo,items) {
			var isTrnasferedFalse = _.findWhere(trnasferedInfo,{"isTrnasfered" : false});
			var isTrnasferedTrue = _.where(trnasferedInfo,{"isTrnasfered" : true});
			
			if(!_.isEmpty(isTrnasferedTrue)) {
				_.each(isTrnasferedTrue,function(source,index) {
					var item = _.findWhere(items,{"id":source.documentId});
					if(source.objectType == "Folder") {
						item = _.findWhere(items,{"id":source.folderId});
					}
					$scope.checkedItems = _.reject($scope.checkedItems, function(doc){ 
		    			return doc.id == source.documentId; 
		    		});
					item.selected = false;
				});
			}
			
			if(isTrnasferedFalse) {
				//MessageService.showErrorMessage("BACKEND_ERR_MSG",[isTrnasferedFalse.Reason]);
			} else if(!_.isEmpty(isTrnasferedTrue)) {
				$scope.checkedItems = [];
				$scope.checkAllFolders.selected = false;
				$scope.checkAllDocs.selected = false;
				hideAllDocActions();
				//MessageService.showSuccessMessage("TRANSFER_OWNERSHIP");
				getDocsUnderFolder();
			}
		}
		
		function handleShareCB(sharedInfo,items) {
			var isSharedFalse = _.findWhere(sharedInfo,{"isShared" : false});
			var isSharedTrue = _.where(sharedInfo,{"isShared" : true});
			
			if(!_.isEmpty(isSharedTrue)) {
				_.each(isSharedTrue,function(source,index) {
					var item = _.findWhere(items,{"id":source.objectId});
					
					$scope.checkedItems = _.reject($scope.checkedItems, function(doc){ 
		    			return doc.id == source.objectId; 
		    		});
					item.selected = false;
					SetSharedFlag(item);
				});
			}
			
			if(isSharedFalse) {
				var NoPermOnObjectList = _.where(sharedInfo,{"Reason" : "NoPermOnObject"});
				var ObjectNotFoundList = _.where(sharedInfo,{"Reason":"ObjectNotFound"});
				var NoReasonObjectList = _.where(sharedInfo,{"Reason" : null});
				
				if(!_.isEmpty(NoPermOnObjectList)) {
					MessageService.showErrorMessage("SHARE_ITEMS_ERR");
				} else if(!_.isEmpty(NoReasonObjectList)) {
					MessageService.showErrorMessage("DEFAULT_ERROR_MSG");
				} else {
					MessageService.showErrorMessage("BACKEND_ERR_MSG",[isSharedFalse.Reason]);
				}
				
			} else if(!_.isEmpty(isSharedTrue)) {
				$scope.checkedItems = [];
				$scope.checkAllFolders.selected = false;
				$scope.checkAllDocs.selected = false;
				hideAllDocActions();
				MessageService.showSuccessMessage("SHARE_ITEMS");
			}
		}
		
		 $scope.OpenShareDocModal = function (items,size) {
			 var modalInstance = $uibModal.open({
				 animation: $scope.animationsEnabled,
			      templateUrl: 'app/components/Documents/ShareDocuments/shareDocModal.html',
			      controller: 'ShareDocModalCtrl',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'vm',
			      backdrop: 'static',
			      size: size,
			      resolve: {
			    	  items : function() {
			    		  return items;
			    	  }
			      }
			 });
			 modalInstance.result.then(function (sharedInfo) {
				 if(sharedInfo.respType == "transfer") {
					 handleTransferOwnershipCB(sharedInfo.trnasferedInfo,items)
				 } else {
					 handleShareCB(sharedInfo,items);
				 }
			 }, function () {
			      
			 });
		 };
		 
		$scope.closeProgress = function() {
			$scope.showProgress = false;
		};
	   
	   $scope.$on("$destroy",function() {
		   $scope.showProgress = false;
       });
	   
	   function toggleFolderPrivate(doc) {
		   var priOrpub = doc["private"] ? "Public" : "Private";
		   var text = 'Dou you want make "'+doc.name+'" '+priOrpub;
		   $confirm({text: text})
	        .then(function() {
	        	var postdata = {};
		   		postdata.folderId = doc.id;
		   		postdata.isPrivate = !doc["private"];
		   		DocFactory.toggleFolderPrivate(postdata).then(function(resp) {
		   			if(resp.status == 200 && resp.data.Status && resp.data.Folders) {
		   				doc["private"] = !doc["private"];
		   			}
		   		});
	        });
	    }
	    
	    function toggleDocPrivate(doc) {
			   var priOrpub = doc["private"] ? "Public" : "Private";
			   
			   var docName = doc._type == "Document" ? doc.displayName : doc.name;
			   var text = 'Dou you want make "'+docName+'" '+priOrpub;
			   $confirm({text: text})
		        .then(function() {
		        	var postdata = {
		        			"objectList": [
		        			              {
		        			                "objectId": doc.id,
		        			                "objectType" : doc._type,
		        			                'clientId' : (doc._type == "Folder") ? appdata["OrganizationId"] : doc.clientId
		        			              }
		        			            ],
    			            "displayName": doc.displayName,
    			            "isPrivate": (!doc["private"]).toString(),
    			            "isEditable": (doc["editable"]).toString(),
    			            "ticker": doc.ticker,
    			            "companyName": doc.companyName,
    			            "cik": doc.cik,
    			            "docType": doc.docType
		        	};
			   		
			   		DocFactory.updateDocProperties(postdata).then(function(resp) {
						 if(resp.status == 200 && resp.data.Status) {
							 handlePropertiesCB(resp.data.resultList,{"modified":postdata,"original":[doc]});
						 }
					});
		        });
		    }
	    	   
		    function switchPrivate(doc) {
		    	if(doc.isOwner) {
		    		toggleDocPrivate(doc);
		    	}
		    }
		     
	}
})();

