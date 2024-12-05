;(function() {
	'use strict'; 
	
	angular.module('vdvcApp').controller('ConfirmTransferTSOwnershipController',ConfirmTransferTSOwnershipController);
	
	ConfirmTransferTSOwnershipController.$inject = ['$scope','$uibModalInstance','_','docsInfo','slackInfo'];
	
	function ConfirmTransferTSOwnershipController($scope,$uibModalInstance,_,docsInfo,slackInfo) {
		
		 var cttsoc = this;
		 
		 cttsoc.docsInfo = docsInfo;
		 cttsoc.slackInfo = slackInfo;
		 cttsoc.slackConnection = {"status" : ""};
		 cttsoc.selectAllDocs = false;
		 cttsoc.selectedDocs = [];
		 
		 cttsoc.selectAllDocuments = selectAllDocuments;
		 cttsoc.disableSelectAllDocs = disableSelectAllDocs;
		 cttsoc.selectDocument = selectDocument;
		 cttsoc.cancel = cancel;
		 cttsoc.transferOwneship = transferOwneship;
		 
		 function selectAllDocuments() {
			 if(cttsoc.selectAllDocs) {
				 cttsoc.selectedDocs = [];
				 _.each(cttsoc.docsInfo,function(doc,index) {
					 if(doc.canTransfer) {
						 doc.selected = true;
						 cttsoc.selectedDocs.push(doc);
				 	 }
				 });
			 } else if(!cttsoc.selectAllDocs) {
				 var selectedDoc = _.findWhere(cttsoc.docsInfo,{"selected" : true});
				 if(selectedDoc) {
					 _.each(cttsoc.docsInfo,function(doc,index) {
						 if(doc.canTransfer) {
							 doc.selected = false;
						 }
					 }); 
					 cttsoc.selectedDocs = [];
				 }
			 }
		 }
		 
		 function disableSelectAllDocs() {
			 var status = false;
			 var canTransferDoc = _.findWhere(cttsoc.docsInfo,{"canTransfer" : true});
			 if(_.isEmpty(canTransferDoc)) {
				 status = true;
			 }
			 return status;
		 }
		 
		 function selectDocument(doc) {
			 if(doc.selected) {
				 var selectedDoc = _.findWhere(cttsoc.selectedDocs,{"id" : doc.id});
				 if(!selectedDoc) {
					 cttsoc.selectedDocs.push(doc);
				 }
			 } else if(!doc.selected) {
				 var selectedDoc = _.findWhere(cttsoc.selectedDocs,{"id" : doc.id});
				 if(selectedDoc) {
					 cttsoc.selectedDocs = _.reject(cttsoc.selectedDocs, function(selectedDoc){ 
						 return selectedDoc.id == doc.id; 
					 });
				 }
			 }
			 
			 var canTransferDocs = _.where(cttsoc.docsInfo,{"canTransfer" : true});
			 if(!_.isEmpty(canTransferDocs) && !_.isEmpty(cttsoc.selectedDocs) && canTransferDocs.length == cttsoc.selectedDocs.length) {
				 cttsoc.selectAllDocs = true;
			 } else {
				 cttsoc.selectAllDocs = false;
			 }
		 }
		 
		 function cancel() {
			 $uibModalInstance.dismiss('cancel');
		 }
		 
		 function transferOwneship() {
			 var selectedDocs = _.where(cttsoc.docsInfo,{"selected" : true});
			 var selectedDocIds = [];
			 _.each(selectedDocs,function(doc,index) {
				 selectedDocIds.push(doc.id);
			 });
			 var slackConnection = "None";
			 if(cttsoc.slackInfo.connection == "CanTransfer") {
				 slackConnection = cttsoc.slackConnection.status;
			 }
			 $uibModalInstance.close({"selectedDocIds" : selectedDocIds,"slackConnection" : slackConnection});
		 }
	}
})();