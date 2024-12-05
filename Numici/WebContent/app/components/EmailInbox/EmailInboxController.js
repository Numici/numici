;(function() {
	'use strict'; 
	
	angular.module('vdvcApp').controller('EmailInboxController',EmailInboxController);
	
	EmailInboxController.$inject = ['$state','$scope','appData','_','orderByFilter','EmailInboxService',
	                                 'userService','commonService','$deviceInfo','DocFactory','$filter',
	                                 'sortDatePublishedFilter'];
	
	function EmailInboxController($state,$scope,appData,_,orderByFilter,EmailInboxService,userService,
			commonService,$deviceInfo,DocFactory,$filter,sortDatePublishedFilter) {
		
		 var eic = this;
		 var appdata = appData.getAppData();
		 var emailDocSortOptions = [{
		  		"label":"Date",
		  		"key" : "createdOn",
		  		"type" : "number"
	    	},
	    	{
	    		"label":"Subject",
	    		"key" : "name",
		  		"type" : "text"
	    	}
	     ];
		 
		 eic.sizePrecision = DocFactory.sizePrecision;
		 eic.UserRole = appdata.UserRole;
		 eic.deviceInfo = $deviceInfo;
		 eic.toggleSideBarChecked = false;
		 eic.currentFldrId = "";
		 eic.emailDocs = [];
		 eic.selectedEmailDoc = {};
		 eic.openedAttachment = {};
		 eic.emailDocListSortBy =  "createdOn";
		 eic.emailDocListSortByDec =  true;
		 
		 eic.sortDocsBy = sortDocsBy;
		 eic.getSortedOrderIcon = getSortedOrderIcon;
		 eic.getSortedField = getSortedField;
		 eic.onEmailDocClick = onEmailDocClick;
		 eic.openAttachment = openAttachment;
		 eic.toggleEmailList = toggleEmailList;
		 eic.showSelectedEmailName = showSelectedEmailName;
		 
		 $scope.$on("FOLDER_CHANGED", function(event, data) {
			 if(data && data.eventData && data.eventData.folderId == eic.currentFldrId) {
				 getEmailsList();
			 }
		 });
		 
		 function sortDocsBy(event, field) {
			 var emailDocList = [];
			 if (eic.emailDocListSortBy != field) {
				 eic.emailDocListSortByDec = false;
			 }
			 eic.emailDocListSortBy = !_.isEmpty(field) ? field : "name";
			 if (field == "createdOn") {
				 emailDocList = sortDatePublishedFilter(eic.emailDocs, eic.emailDocListSortBy, eic.emailDocListSortByDec);
			 } else {
				 emailDocList = orderByFilter(eic.emailDocs, eic.emailDocListSortBy, eic.emailDocListSortByDec);
			 }
			 if (!_.isEmpty(emailDocList)) {
				 eic.emailDocs = emailDocList;
			 }
			 if(_.isEmpty(eic.selectedEmailDoc)) {
				 onEmailDocClick(eic.emailDocs[0]);
			 }
		 }
		 
		 
		 
		 function getSortedOrderIcon() {
			 return commonService.getSortedOrderIcon(emailDocSortOptions, eic.emailDocListSortBy, eic.emailDocListSortByDec);
		 }
		 
		 function getSortedField() {
			 var sortedLable = "";
			 var selectedSortOption = _.findWhere(emailDocSortOptions,{"key": eic.emailDocListSortBy});
			 if(selectedSortOption) {
				 sortedLable = selectedSortOption.label;
			 } else {
				 sortedLable = emailDocSortOptions[0].label;
			 }
			 return sortedLable;
		 }
		 
		 function onEmailDocClick(emailDoc) {
			 if(emailDoc.docType == "EMail") {
				 eic.selectedEmailDoc = angular.copy(emailDoc);
				 eic.openedAttachment = {};
			 } else if(!_.isEmpty(emailDoc.mailDocumentId)) {
				 var attachmentEmailDoc = _.findWhere(eic.emailDocs,{"id" : emailDoc.mailDocumentId});
				 if(!_.isEmpty(attachmentEmailDoc)) {
					 eic.selectedEmailDoc = angular.copy(attachmentEmailDoc);
				 }
			 }
			 var msg = {
				type: emailDoc._type,
				id: emailDoc.id,
				clientId: emailDoc.clientId,
				docType: emailDoc.docType
			 };
			 $scope.$broadcast('openObject', msg);
		 }
		 
		 function openAttachment(attachment) {
			 eic.openedAttachment = angular.copy(attachment);
			 onEmailDocClick(attachment);
		 }
		 
		 function toggleEmailList() {
			 eic.toggleSideBarChecked = !eic.toggleSideBarChecked;
			 $scope.$broadcast('resizeDoc', false);
		 }
		 
		 function showSelectedEmailName() {
			 var currentDocName = "Inbox";
			 if (!_.isEmpty(eic.selectedEmailDoc)) {
				 currentDocName = eic.selectedEmailDoc.name;
			 }
			 return currentDocName;
		 }
		 
		 function getEmailsList() {
			 EmailInboxService.getEmailsList().then(function (emailDocResp) {
		        if(emailDocResp.status == 200 && emailDocResp.data.Status){
		        	var docs = emailDocResp.data.Mails;
		        	if(_.isArray(docs) && docs.length > 0) {
		        		eic.currentFldrId = docs[0].folderId;
						for (var i=0;i<docs.length; i++) {
							var doc = docs[i];
							doc._type = "Document";
							doc.parentFolderId = eic.currentFldrId;
							doc["displaySize"] = $filter('filesize')(doc.contentLength,eic.sizePrecision);
							DocFactory.setDocTypeBooleanFlags(doc);
							DocFactory.setDocPermissions(doc);
						}
					}
		        	docs = orderByFilter(docs, eic.emailDocListSortBy, eic.emailDocListSortByDec);
		        	eic.emailDocs = docs;
		        	if(!_.isEmpty(eic.emailDocs)) {
		        		sortDocsBy(false, eic.emailDocListSortBy);
		        	}
		        }
		     });
		 }
		 
		 function init() {
			 $scope.$emit("PageName",{"userName":appdata.UserName,"pageName":$state.current.pageName});
			 getEmailsList();
		 }
		 init();
	}
})();