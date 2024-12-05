;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('LinkFolderModalController',LinkFolderModalController);
	
	LinkFolderModalController.$inject = ['$state','$scope','$uibModal', '$uibModalInstance','MessageService','resources','foldersList','DocFactory','_','appData','LinkFolderService','APIUserMessages','orderByFilter','$filter'];

	function LinkFolderModalController($state,$scope,$uibModal,$uibModalInstance,MessageService,resources,foldersList,DocFactory,_,appData,LinkFolderService,APIUserMessages,orderBy,$filter) {
		var vm = this;
		var appdata = appData.getAppData();
		// Instance variables
		
		vm.sizePrecision = DocFactory.sizePrecision;
		vm.foldersList = foldersList;
		vm.docsList;
		vm.targetFolder = resources.folderId ? {'id':resources.folderId} : appdata.rootFolder;
		vm.currntFolder = appdata.rootFolder;
		vm.fldrHierarchy = [];
		vm.folderSearchString = "";
		vm.fldrlistHeaders = DocFactory.fldrlistHeaders;
		vm.doclistHeaders =  DocFactory.doclistHeaders;
	    
		vm.docField =  vm.doclistHeaders[0].value;
		vm.docFieldDecending =  false;
	    
		vm.fldrField =  vm.fldrlistHeaders[0].value;
		vm.fldrFieldDecending = false;
		vm.checkAllFolders = {"selected":false};
		vm.selectedFolders = [];
		vm.showNewNameSection = false;
		vm.errMsg = "";
		vm.linkFolderNewName = "";
		// Methods
		
		vm.getFolderListCount = getFolderListCount;
		vm.folderSearchStringFilter = folderSearchStringFilter;
		vm.selectColumn = selectColumn;
		vm.sortByfield = sortByfield;
		vm.isShared = isShared;
		vm.getFileIcon = getFileIcon;
		vm.openParent = openParent;
		vm.openFolder = openFolder;
		vm.selectAllFolders = selectAllFolders;
		vm.selectFolder = selectFolder;
		vm.disableFolder = disableFolder;
		vm.disableLinkFolder = disableLinkFolder;
		vm.disableNewFolder = disableNewFolder;
		vm.OpenFolderModal = OpenFolderModal;
		vm.goToAddNewName = goToAddNewName;
		vm.ok = ok;
		vm.cancel = cancel;
		vm.back = back;
		
		processFolders(vm.foldersList);
		
		getHierarchy(vm.currntFolder.id);
		
		function getFolderListCount() {
			var shownedFoldersCount = $('#folders-table tbody tr.fldr-row').length;
			return shownedFoldersCount;
		}
		
		function folderSearchStringFilter(folder) {
			var status = false;
			for(var i=0;i<vm.fldrlistHeaders.length;i++) {
				var fldrHeader = vm.fldrlistHeaders[i];
				var fieldValue = folder[fldrHeader.DValue];
				if(vm.folderSearchString.trim() == "" || 
						(fldrHeader.checked && fldrHeader.type != "Date" && 
								fieldValue && _.isString(fieldValue)&& fieldValue.toLowerCase().indexOf(vm.folderSearchString.toLowerCase()) != -1)) {
					status = true;
					break;
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
		
		function sortByfield (hdr,type) {
	    	switch(type) {
	    	case "folder":
	    		if(vm.fldrField == hdr.value) {
	    			vm.fldrFieldDecending = !vm.fldrFieldDecending;
	    		} else {
	    			vm.fldrFieldDecending = false;
	    		}
	    		vm.fldrField =  hdr.value;
	    		vm.foldersList = orderBy(vm.foldersList, vm.fldrField, vm.fldrFieldDecending);
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
	    
		function isShared (folder) {
			var status = false;
			if((folder.createdBy && $scope.userinfo["UserId"] && folder.createdBy.toLowerCase() !== $scope.userinfo["UserId"].toLowerCase()) && folder.shared) {
				status = true;
			}
			return status;
		}
		
		function getFileIcon(doc) {
	    	return DocFactory.getFileImgIcon(doc.name,doc.docType);
	    }
		
		function openParent(event) {
			if(event) {
				event.stopPropagation();
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
			getHierarchy(folder.id);
			DocFactory.getDocsUnderFolderWithInfo(folder.id).then(function (allDocResp) {
				processFolders(allDocResp);
			});
		}
		
		function selectAllFolders() {
			angular.forEach(vm.foldersList, function(itm) { 
    			itm.selected = vm.checkAllFolders.selected;
    			vm.selectedFolders = _.reject(vm.selectedFolders, function(folder){ 
	    			return folder.id == itm.id; 
	    		});
    		});
	    	if(vm.checkAllFolders.selected) {
	    		angular.forEach(vm.foldersList, function(folder){ 
	    			folder.selected = vm.checkAllFolders.selected;
	    			vm.selectedFolders.push(folder);
	    		});
	    	}
		}
		
		function selectFolder(folder) {
			var isFolderSelected = _.any(vm.selectedFolders, function(item){ 
				return _.isEqual(item, _.findWhere(vm.selectedFolders, {
					  id: folder.id
				}));
			});
			if(isFolderSelected) {
				vm.selectedFolders = _.without(vm.selectedFolders, _.findWhere(vm.selectedFolders, {
					id: folder.id
				}));
				folder.selected = false;
				vm.selectedFolders = [];
			} else {
				if(!_.isEmpty(vm.selectedFolders)) {
					_.each(vm.selectedFolders, function(selectedFolder){
						selectedFolder.selected = false;
					});
					vm.selectedFolders = [];
				}
				folder.selected = true;
				vm.selectedFolders.push(folder);
			}
		}
		
		function disableFolder(folder) {
			var status = false;
			if(folder.id == vm.targetFolder.id || folder.isLink || (folder.name === "WebResources" && folder.parentFolderId == appdata.rootFolder.id)) {
				status = true;
			}
			return status;
		}
		
		function disableLinkFolder() {
			var status = true;
			if(!_.isEmpty(vm.selectedFolders)) {
				status = false;
			}
			return status;
		}
		
		function disableNewFolder() {
			var status = true;
			if(vm.currntFolder.root || (vm.currntFolder.perms && vm.currntFolder.perms.edit)) {
				status = false;
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
		
		function goToAddNewName() {
			if(!_.isEmpty(vm.selectedFolders)) {
				vm.showNewNameSection = true;
				vm.linkFolderNewName = vm.selectedFolders[0].name+" - LNK";
			}
		}
		
		function ok() {
			if(!_.isEmpty(vm.selectedFolders) && !_.isEmpty(vm.linkFolderNewName)) {
				vm.errMsg = "";
				var objects = [];
				_.each(vm.selectedFolders, function(folder){
					var object = {
							"folderName" : vm.linkFolderNewName,
							"parentFolderId" : vm.targetFolder.id,
							"isPrivate" : false,	
					        "isReadOnly" : false,
					        "linkSourceFolderId" : folder.id,
					        "linkFolderClientId" : folder.clientId,
					        "isLinkFolder" : true
					}
					objects.push(object);
				});
				var postdata = objects[0];
				LinkFolderService.createLinkFolder(postdata).then(function (response) {
					if(response.data.FolderPresent) {
						vm.errMsg = response.data.Message;
					} else if(response.status == 200 && response.data.Status) {
						$uibModalInstance.close(response.data.Folders);
					}
				});
			}
		}

		function cancel() {
			$uibModalInstance.dismiss('cancel');
		}
		
		function back() {
			vm.showNewNameSection = false;
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
	        	//vm.docsList = orderBy(docs, "displayName");
	        }
		}
		
		function getHierarchy(id) {
			DocFactory.getDocHierarchy(id,function(docHierarchy) {
				vm.fldrHierarchy =  docHierarchy;
			});  
		}
		
	}
	
})();