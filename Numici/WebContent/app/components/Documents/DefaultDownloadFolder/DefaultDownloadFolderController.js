;(function() {
	'use strict'; 
	
	angular.module('vdvcApp').controller('DefaultDownloadFolderController',
			['$scope','$q','$uibModalInstance','_','sourceInfo','SecFilingService','DocFactory','MessageService','$uibModal', 
	        function ($scope,$q, $uibModalInstance,_,sourceInfo,SecFilingService,DocFactory,MessageService,$uibModal) {
				var vm = this;
		
		//variables
		vm.docHierarchy = [] ;
		
		//methods
		vm.BrowseFolders = BrowseFolders;
		vm.ok = ok;
		vm.cancel = cancel;
		
		var getHierarchy = function(id) {
			DocFactory.getDocHierarchy(id,function(docHierarchy) {
				
				vm.docHierarchy =  docHierarchy;
			});  
		};
		
		getHierarchy(sourceInfo.folderId);
		
		function downloadGlobalDoc () {
			var postdata = {
		    		"docId":sourceInfo.docId,
		    		"folderId": sourceInfo.folderId
		    		};
			SecFilingService.saveSECfileToFolder(postdata).then(function(resp){
				 if(resp.status == 200 && resp.data.Status && resp.data.Notes) {
					 $uibModalInstance.close(resp);
				 }
			});
		}
		
		function BrowseFolders (size) {
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
			    			  "source" : undefined,
			    			  "folderId" :  sourceInfo.folderId,
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
			    		  return DocFactory.getDocsUnderFolder(sourceInfo.folderId);
			    	  }
			      }
			    });
			
			modalInstance.result.then(function (data) {
				sourceInfo.folderId = data.moveTo.id;
				if(data.moveTo.isLink) {
					sourceInfo.folderId = data.moveTo.linkSourceFolderId;
				}
				getHierarchy(sourceInfo.folderId);
			}, function () {
			      
			});
		}
		
		function ok () {
			downloadGlobalDoc ();
		}
	  
		function cancel () {
			$uibModalInstance.dismiss('cancel');
	    }
		
	}]);
})();