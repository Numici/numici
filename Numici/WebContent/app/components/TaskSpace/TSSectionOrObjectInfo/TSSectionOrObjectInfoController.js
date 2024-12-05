;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('TSSectionOrObjectInfoController',TSSectionOrObjectInfoController);
	
	TSSectionOrObjectInfoController.$inject = ['$scope','appData','$uibModalInstance',
	                                  '_','source','DocFactory','TaskSpaceService',
	                                  'MessageService'];

	function TSSectionOrObjectInfoController($scope,appData,$uibModalInstance,_,
			source,DocFactory,TaskSpaceService,MessageService) {
		
		var appdata = appData.getAppData();
		var vm = this;
		var docsSortBy = {};
		vm.source = angular.copy(source);
		vm.headerLable = ""; 
		vm.sectionInfo = {};
		vm.documentInfo = {};
		
		vm.getAnnotCount = getAnnotCount;
		vm.getDocDateLable = getDocDateLable;
		vm.getDocDateValue = getDocDateValue;
		vm.cancel = cancel;
		
		function getAnnotCount(objectInfo) {
			return TaskSpaceService.getAnnotCount(objectInfo);
		}
		
		function getDocDateLable() {
			var docDateLable = "Annotated Date";
			if(docsSortBy.field == 'dateAdded'){
				docDateLable = "Added Date";
			} else if(docsSortBy.field == 'dateModified'){
				docDateLable = "Modified Date";
			}
			return docDateLable;
		}
		
		function getDocDateValue(documentInfo) {
			var docDateValue = documentInfo['annotatedDate'];
			if(docsSortBy.field == 'dateAdded') {
				docDateValue = documentInfo['dateAdded'];
			} else if(docsSortBy.field == 'dateModified' && !_.isEmpty(documentInfo.objectInfo)) {
				docDateValue = documentInfo.objectInfo['dateModified'];
			}
			return docDateValue;
		}
		
		function cancel() {
		    $uibModalInstance.dismiss('cancel');
		}
		
	    function initTSSectionOrObjectInfo() {
	    	if(vm.source.infoFor == "section") {
	    		vm.headerLable = "Section Info";
	    		vm.sectionInfo = vm.source.sectionInfo;
	    	} else if(vm.source.infoFor == "document") {
	    		vm.headerLable = "Document Info";
	    		vm.documentInfo = vm.source.documentInfo;
	    		docsSortBy = vm.source.docsSortBy;
	    	}
	    }
	    initTSSectionOrObjectInfo();
	}
})();