;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('BrowseFoldersController',BrowseFoldersController);
	
	BrowseFoldersController.$inject = ['$scope','$uibModal', '$uibModalInstance','MessageService','resources',
	                                   'foldersList','DocFactory','_','appData','SecFilingService','pendingRequests','orderByFilter'];

	function BrowseFoldersController($scope,$uibModal,$uibModalInstance,MessageService,resources,
			foldersList,DocFactory,_,appData,SecFilingService,pendingRequests,orderBy) {
		
		var vm = this;
		var appdata = appData.getAppData();
		var getDocsUdrFldrPromise;
		// Instance variables
		vm.submitLable = resources.btnLable ? resources.btnLable : "Move here";
		vm.source = resources.source;
		vm.foldersList = foldersList;
		vm.docsList;
		vm.currntFolder = appdata.rootFolder;
		vm.selectedFolder = resources.folderId ? {'id':resources.folderId} : appdata.rootFolder;
		vm.fldrHierarchy = [];
		
		// Methods
		vm.getFileIcon = getFileIcon;
		vm.onSelectFolder = onSelectFolder;
		vm.openParent = openParent;
		vm.openFolder = openFolder;
		vm.enableMoveHere = enableMoveHere;
		vm.isValidTarget = isValidTarget;
		vm.ok = ok;
		vm.cancel = cancel;
		
		vm.OpenFolderModal = OpenFolderModal;
		
		processFolders(vm.foldersList);
		
		getHierarchy(vm.selectedFolder.id);
		
		function OpenFolderModal(size) {
			var modalInstance = $uibModal.open({
			      animation: vm.animationsEnabled,
			      templateUrl: 'app/components/Documents/Create/newFolderModal.html',
			      controller: 'CreateFolderController',
			      appendTo : $('.rootContainer'),
			      controllerAs : 'vm',
			      size: size,
			      resolve: {
			    	parentId : function() {
			    		return vm.selectedFolder.id;
			    	}
			      }
			    });
			
			modalInstance.result.then(function (newFolder) {
				MessageService.showSuccessMessage("FOLDER_CREATE",[newFolder.name]);
				vm.selectedFolder = newFolder;
				getHierarchy(newFolder.id);
				getDocsUnderFldr(newFolder.id);
			});
			
		}
		
		
		function getFileIcon(name) {
	    	return DocFactory.getFileIcon(name);
	    }
		
	    function onSelectFolder(folder) {
	    	if(vm.selectedFolder && vm.selectedFolder.id == folder.id) {
	    		vm.selectedFolder = vm.currntFolder;
	    	} else {
	    		vm.selectedFolder = folder;
	    	}
	    	
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
		
		function getDocsUnderFldr(id) {
			pendingRequests.cancel(pendingRequests);
			getDocsUdrFldrPromise = DocFactory.getDocsUnderFolder(id );
			getDocsUdrFldrPromise.then(function (allDocResp) {
				processFolders(allDocResp);
			});
		}
		
		function openFolder(folder) {
			vm.currntFolder = folder;
			vm.selectedFolder = folder;
			getHierarchy(folder.id);
			getDocsUnderFldr(folder.id);
		}
		
		function enableMoveHere() {
			var status = true;
			if(vm.source) {
				if(angular.isArray(vm.source) && vm.source[0].parentFolderId == vm.selectedFolder.id) {
					status = true; 
				} else if(vm.source.parentFolderId == vm.selectedFolder.id) {
					status = true;
				} else {
					status = false;
				}
				
			} else {
				status = false;
			}
			return status;
		}
		
		function isValidTarget(folder) {
			var status = true;
			if(vm.source) {// move
				if(angular.isArray(vm.source)) {
					var fldr = _.findWhere(vm.source,{"id": folder.id});
		    		if(fldr) {
		    			status = false;
		    		}
				} else if(folder.id == vm.source.id)  {
					status = false;
				}
			} 
			
			if(!folder.perms.edit) {
				status = false;
			}
			return status;
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
		
		
		function ok() {
			var data = {"source":vm.source,"moveTo":vm.selectedFolder,"fldrHierarchy":vm.fldrHierarchy};
			
			if(resources.action) {
				if(resources.action == "Move") {
					var postdata = processMoveToData(data);
					DocFactory.moveToFolder(postdata).then(function(resp){
				    	if(resp.status == 200 && resp.data.Status) {
				    		$uibModalInstance.close({"items":resp.data.resultList,"moveTo":vm.selectedFolder,"source":vm.source});
				    	}
				    });
				}
				
				if(resources.action == "SaveTo") {
					var postdata = {
				    		"docId":data.source.id,
				    		"folderId": data.moveTo.id
				    		};
					SecFilingService.saveSECfileToFolder(postdata).then(function(resp){
						 if(resp.status == 200 && resp.data.Status && resp.data.Notes) {
							 $uibModalInstance.close(resp);
						 }
					});
				}
				
				if(resources.action == "Browse") {
					$uibModalInstance.close(data);
				}
			} else {
				$uibModalInstance.close(data);
			}
		}

		function cancel() {
			pendingRequests.cancel(pendingRequests);
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
						DocFactory.setDocTypeBooleanFlags(doc);
						DocFactory.setDocPermissions(doc);
					}
				}
	        	
	        	if(_.isArray(folders)) {
					for (var i=0;i<folders.length; i++) {
						var doc = folders[i];
						doc._type = "Folder";
						DocFactory.setDocPermissions(doc);
					}
				}
	        	vm.foldersList = orderBy(folders,"name");
	        	vm.docsList = orderBy(docs, "displayName");
	        }
		}
		
		function getHierarchy(id) {
			DocFactory.getDocHierarchy(id,function(fldrHierarchy) {
				vm.fldrHierarchy = fldrHierarchy;
			});
		}
		
	}
	
})();