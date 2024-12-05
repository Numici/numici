;(function() {
	'use strict';
	angular.module("vdvcApp").factory("CopyExternalFilesService",CopyExternalFilesService);
	CopyExternalFilesService.$inject = ['appData','$uibModal','DocFactory','_'];
	
	function CopyExternalFilesService(appData,$uibModal,DocFactory,_) {
		var CopyExternalFilesService = {
				selectedObjectList : {},
				copyExternalFiles : copyExternalFiles
		};
		
		return CopyExternalFilesService;
		
		function copyDocList(docList,copyToFolderId,cb) {
			var objectList = [];
			_.each(docList,function(doc,index) {
				var obj = {
        				"objectId" : doc.objectId,
        				"clientId" : doc.clientId,
        				"withAnnotations" : false
        		};
				obj["newName"] = _.findWhere(CopyExternalFilesService.selectedObjectList,{"id" : doc.objectId}).name;
				objectList.push(obj);
        	});
			var postdata = {
						"copyToFolderId" : copyToFolderId,
						"objectList" : objectList,
						"copyExternalDocs" : true
					};
			DocFactory.copyDocList(postdata).then(function(resp) {
				if(typeof cb == "function") {
					cb(resp);
				}
			});
		}
		
		function BrowseFolders (cb) {
			var appdata = appData.getAppData();
			var modalInstance = $uibModal.open({
		      animation: true,
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
		
		function copyExternalFiles(postdata,cb) {
			BrowseFolders(function(copyToFolderId){
				copyDocList(postdata.objects,copyToFolderId,function(copyDocListResp){
					if(typeof cb == "function") {
						cb(copyDocListResp);
					}
				});
			});
		}
	}
})();