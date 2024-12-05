;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('ManageHelpModalController',ManageHelpModalController);
	
	ManageHelpModalController.$inject = ['$scope','$uibModal', '$uibModalInstance','MessageService',
	                                   'foldersList','DocFactory','_','appData','SecFilingService','pendingRequests','orderByFilter','HelpService'];

	function ManageHelpModalController($scope,$uibModal,$uibModalInstance,MessageService,
			foldersList,DocFactory,_,appData,SecFilingService,pendingRequests,orderBy,HelpService) {
		
		var appdata = appData.getAppData();
		var mhmc = this;
		var getDocsUdrFldrPromise;
		
		// Instance variables
		mhmc.hasHelpFolder = false;
		mhmc.submitLable = "APPLY";
		mhmc.foldersList;
		mhmc.docsList;
		mhmc.currntFolder = appdata.rootFolder;
		mhmc.selectedFolder = appdata.rootFolder;
		mhmc.fldrHierarchy = [];
		mhmc.selectedDocs = [];
		
		// Methods
		mhmc.getFileIcon = getFileIcon;
		mhmc.onSelectFolderOrFile = onSelectFolderOrFile;
		mhmc.openFolder = openFolder;
		mhmc.enableMoveHere = enableMoveHere;
		mhmc.isValidTarget = isValidTarget;
		mhmc.ok = ok;
		mhmc.cancel = cancel;
				
		processFolders(foldersList,true);
		
		getHierarchy(mhmc.selectedFolder.id);
		
		
		function getFileIcon(doc) {
	    	return DocFactory.getFileImgIcon(doc.name,doc.docType);
	    }
		
	    function onSelectFolderOrFile(folderOrFile) {
	    	if(folderOrFile._type == "Folder") {
	    		if(mhmc.selectedFolder && mhmc.selectedFolder.id == folderOrFile.id) {
		    		mhmc.selectedFolder = mhmc.currntFolder;
		    	} else {
		    		mhmc.selectedFolder = folderOrFile;
		    	}
	    	}
	    	if(folderOrFile._type == "Document") {
	    		if(mhmc.selectedFolder && mhmc.selectedFolder.id == folderOrFile.id) {
		    		mhmc.selectedFolder = mhmc.currntFolder;
		    	} else {
		    		mhmc.selectedFolder = folderOrFile;
		    	}
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
			//mhmc.currntFolder = folder;
			//mhmc.selectedFolder = folder;
			getHierarchy(folder.id);
			getDocsUnderFldr(folder.id);
		}
		
		function enableMoveHere() {
			var status = true;
			if(!_.isEmpty(mhmc.selectedFolder) && (mhmc.selectedFolder.id !== appdata.rootFolder.id) && !_.isEmpty(mhmc.selectedDocs)) {
				status = true; 
			} else {
				status = false;
			}
			return status;
		}
		
		function isValidTarget(folderOrDoc) {
			var status = true;
			if(folderOrDoc.parentFolderId == appdata.rootFolder.id) {// move
				if(folderOrDoc._type === "Folder" && folderOrDoc.name !== "Help") {
					status = false;
				}
				
			} 
			
			if(!folderOrDoc.perms.edit) {
				status = false;
			}
			return status;
		}
		
		function ok() {
			HelpService.creatHelpTopics(mhmc.selectedFolder.id).then(function(resp){
				 if(resp.status == 200 && resp.data.Status) {
					 $uibModalInstance.close(resp);
				 }
			});
		}

		function cancel() {
			pendingRequests.cancel(pendingRequests);
			$uibModalInstance.dismiss('cancel');
		}
		
		function processFolders(resp,init) {
			if(resp.status == 200 && resp.data.Status){
	        	var helpFolder;
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
	        	if(init || !mhmc.hasHelpFolder) {
	        		helpFolder = _.findWhere(folders,{"name":"Help"});
	        	}
	        	if((init || !mhmc.hasHelpFolder) && helpFolder) {
	        		mhmc.hasHelpFolder = true;
	        		mhmc.currntFolder = helpFolder;
	        		mhmc.selectedFolder = helpFolder;
	        		mhmc.openFolder(helpFolder);
	        	}
	        	if(mhmc.hasHelpFolder) {
	        		mhmc.foldersList = orderBy(folders,"name");
	        		mhmc.docsList = orderBy(docs, "displayName");
	        	}
	        	
	        }
		}
		
		function getHierarchy(id) {
			DocFactory.getDocHierarchy(id,function(fldrHierarchy) {
				mhmc.fldrHierarchy = fldrHierarchy;
			});
		}
		
	}
	
})();