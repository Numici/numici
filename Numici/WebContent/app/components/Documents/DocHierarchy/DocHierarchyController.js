;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('DocHierarchyController',DocHierarchyController);
	
	DocHierarchyController.$inject = ["$scope","$state","DocFactory","_","appData"];

	function DocHierarchyController($scope,$state,DocFactory,_,appData) {
		var dhc = this;
		var appdata = appData.getAppData();
		// Instance variables
		dhc.document = angular.copy($scope.document);
		dhc.docHierarchyList = [];
		dhc.isGlobalDoc = false;
		
		// Methods
		dhc.openDocument = openDocument;
		
		function openDocument (document,event) {
			if(event) {
	    		event.stopPropagation();
	    		event.preventDefault();
	    	}
	    	
	    	if(document.trash || document.deleted) {
	    		$state.go("trash",{"trashId":document.id});
	    	} else {
	    		$state.go("docs",{"folderId":document.id});
	    	}
		}
		
		function getDocHierarchyList() {
			DocFactory.getDocLocation(dhc.document.id,dhc.document.clientId).then(function(response){
        		if(response.status == 200 && response.data.Status) {
        			var docHierarchyList = response.data.Notes;
        			_.each(docHierarchyList,function(doc,index) {
        				if(_.has(doc, 'root') ) {
        					doc._type = "Folder";
        				} else {
        					doc._type = "Document";
        				}
	       			});
        			if(docHierarchyList.length > 4) {
        				var dummyFoldr = {
        					    "id" : null,
        					    "name" : "...",
        					    "isDummy" : true,
        					    "ownerId" : null,
        					    "root" : false,
        					    "trash" : false,
        					    "parentFolderId" : null
        					};
        				docHierarchyList.splice(1, 0, dummyFoldr); 
        			}
        			dhc.docHierarchyList =  docHierarchyList;
        		}
        	});
		}
		
		function init() {
			if(dhc.document.global) {
				dhc.isGlobalDoc = dhc.document.global;
				dhc.docHierarchyList.push(dhc.document);
			} else {
				getDocHierarchyList();
			}
		}
		init();
	}	
	
})();