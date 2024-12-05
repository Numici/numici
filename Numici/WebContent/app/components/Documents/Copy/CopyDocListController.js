;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('CopyDocListController',CopyDocListController);
	
	CopyDocListController.$inject = ['$scope', '$uibModalInstance',"appData","docList","currentFolder","DocFactory","_"];
	
	function CopyDocListController($scope, $uibModalInstance,appData,docList,currentFolder,DocFactory,_) {
		  var cdlc = this;
		  var appdata = appData.getAppData();
		  
		  cdlc.docs = [];
		  cdlc.selectedDocList = angular.copy(docList);
		  cdlc.isCopyWithAnnotations = false;
		  
		  cdlc.disableCopy = disableCopy;
		  cdlc.onDocNameChange = onDocNameChange;
		  cdlc.ok = ok; 
		  cdlc.cancel = cancel;
		  
		  function cancel() {
		    $uibModalInstance.dismiss('cancel');
		  }
		  
		  function disableCopy () {
			  var status = false;
			  var errorDoc = _.findWhere(cdlc.selectedDocList,{"errorMsg":"Another Document with New Name Exists"});
			  if(errorDoc) {
				  status = true;
			  }
			  return status
		  }
		  
		  function onDocNameChange(event) {
			  if(event.which !== 13) {
				  validateSelectedDocs();
	          }
		  }
		  
		  function validateSelectedDocs(cb) {
			  var selectedDocsData = [];
			  _.each(cdlc.selectedDocList,function(selectedDoc,index) {
				  selectedDoc.errorMsg = "";
				  var data = {
		    				"isSecDocument" : false,
		    				"documentName" : selectedDoc.newName,
		    				"folderId" : selectedDoc.folderId,
		    				"docType" : selectedDoc.docType
		    			};
				  selectedDocsData.push(data);
			  });
			  DocFactory.isDocPresentList(selectedDocsData).then(function(response){
				  if(response.status == 200 && response.data.Status) {
					  var existedFiles = _.where(response.data.Notes, {isExist: true});
					   if(existedFiles && existedFiles.length > 0){
						   _.each(existedFiles,function(existedFile,index) {
							   var existedDoc = _.findWhere(cdlc.selectedDocList,{"newName":existedFile.documentName});
							   if(existedDoc) {
								   existedDoc.errorMsg = "Another Document with New Name Exists";
							   }
						  }); 
					   }
					   if(typeof cb == "function") {
						   cb();
					   }
				  }
			  });
		  }
		  function ok(postdata) {
			  validateSelectedDocs(function(){
				  var errorDoc = _.findWhere(cdlc.selectedDocList,{"errorMsg":"Another Document with New Name Exists"});
				  if(!errorDoc) {
					  $uibModalInstance.close({"newDocList" : cdlc.selectedDocList, "isCopyWithAnnotations" : cdlc.isCopyWithAnnotations});
				  }
			  });
		  }
		  
		  function processSelectedDocs() {
			  _.each(cdlc.selectedDocList,function(selectedDoc,index) {
				  var existedCopiedDocsListWithDN = [];
				  existedCopiedDocsListWithDN = _.filter(cdlc.docs,function(doc) {
					  if(doc.displayName.indexOf(selectedDoc.displayName) != -1 && doc.displayName.indexOf("Copy") != -1) {
						  return true;
					  }
				  });
				  
				  var maxValue = -1;
				  _.each(existedCopiedDocsListWithDN,function(existedCopiedDocWithDN,index) {
					  if(existedCopiedDocWithDN.displayName.indexOf("Copy") != -1 && existedCopiedDocWithDN.displayName.indexOf(" of "+selectedDoc.displayName) != -1) {
						  var res = existedCopiedDocWithDN.displayName.slice(existedCopiedDocWithDN.displayName.indexOf("Copy")+4, existedCopiedDocWithDN.displayName.indexOf(" of "+selectedDoc.displayName));
						  if(res.trim() != "" && !isNaN(parseInt(res.trim())) && parseInt(res.trim()) > maxValue) {
							  maxValue = parseInt(res.trim());
						  } else if(maxValue == -1 && res.trim() == "") {
							  maxValue = 0;
						  }
					  }
				  });
				  
				  selectedDoc.newName = "Copy of "+selectedDoc.displayName;
				  if(maxValue == 0) {
					  selectedDoc.newName = "Copy"+2+" of "+selectedDoc.displayName;
				  } else if(maxValue > 1) {
					  selectedDoc.newName = "Copy"+(maxValue+1)+" of "+selectedDoc.displayName;
				  }
				  
				  var errorDoc = _.findWhere(cdlc.docs,{"name":selectedDoc.newName});
				  if(!_.isEmpty(errorDoc)) {
					  var existedCopiedDocsList = [];
					  existedCopiedDocsList = _.filter(cdlc.docs,function(doc) {
						  if(doc.name.indexOf(selectedDoc.displayName) != -1 && doc.name.indexOf("Copy") != -1) {
							  return true;
						  }
					  });
					  
					  var maxValueWN = -1;
					  _.each(existedCopiedDocsList,function(existedCopiedDoc,index) {
						  if(existedCopiedDoc.name.indexOf("Copy") != -1 && existedCopiedDoc.name.indexOf(" of "+selectedDoc.displayName) != -1) {
							  var res = existedCopiedDoc.name.slice(existedCopiedDoc.name.indexOf("Copy")+4, existedCopiedDoc.name.indexOf(" of "+selectedDoc.displayName));
							  if(res.trim() != "" && !isNaN(parseInt(res.trim())) && parseInt(res.trim()) > maxValueWN) {
								  maxValueWN = parseInt(res.trim());
							  } else if(maxValueWN == -1 && res.trim() == "") {
								  maxValueWN = 0;
							  }
						  }
					  });
					  if(maxValueWN != -1 && maxValueWN > maxValue) {
						  if(maxValueWN == 0) {
							  selectedDoc.newName = "Copy"+2+" of "+selectedDoc.displayName;
						  } else if(maxValueWN > 1) {
							  selectedDoc.newName = "Copy"+(maxValueWN+1)+" of "+selectedDoc.displayName;
						  }
					  }
				  }
			  });
			  validateSelectedDocs();
		  }
		  
		  function init() {
			  DocFactory.getDocsUnderFolderWithInfo(currentFolder.id).then(function (allDocResp) {
				  if(allDocResp.status == 200 && allDocResp.data.Status){
					  var docs = allDocResp.data.Folders.documents;
					  if(_.isArray(docs)) {
						  for (var i=0;i<docs.length; i++) {
							  var doc = docs[i];
							  doc._type = "Document";
							  doc.parentFolderId = currentFolder.id;
						  }
					  }
					  cdlc.docs = docs;
					  processSelectedDocs()
				  }
			  });
		  }
		  init();
	}
})();