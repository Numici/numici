;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('CreateFolderController',CreateFolderController);
	CreateFolderController.$inject = ['$scope', '$uibModalInstance','DocFactory','parentId'];
	
	function CreateFolderController ($scope, $uibModalInstance,DocFactory,parentId) {
			  var vm = this;
			  
			  var CreateFolder = CreateFolder;
			  
			  vm.folderName =  '';
			  vm.errMsg = null;
			  vm.isEditable = true;
			  vm.isPrivate = false;
			  vm.ok = ok;
			  vm.cancel = cancel;
			  
			  
			  function CreateFolder(folderName) {
				  var postdata = {};
					
				  postdata = {
						 "folderName" : folderName,
						 "parentFolderId" : parentId,
						 "isPrivate" : vm.isPrivate,
						 "isEditable" : vm.isEditable
				  };
				 
				  DocFactory.CreateFolder(postdata).then(function(resp){
					  if (resp.status == 200 && resp.data.Status) {
						
						  if(resp.data.FolderPresent) {
							  vm.errMsg = resp.data.Message;
						  } else {
							  $uibModalInstance.close(resp.data.Folders);
						  }
						
					  }
				  });	
			  }
				
			  function ok() {
				  CreateFolder(vm.folderName);
			  }

			  function cancel() {
			    $uibModalInstance.dismiss('cancel');
			  }
		}
})();