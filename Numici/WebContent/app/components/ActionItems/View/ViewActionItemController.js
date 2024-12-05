;(function() {
	'use strict'; 
	
	angular.module('vdvcApp').controller('ViewActionItemController',ViewActionItemController);
	
	ViewActionItemController.$inject = ['$state','$stateParams','$scope','appData','_','ActionItemsService',
	                                     'userService','TaskSpaceService','AnnotationService','MessageService'];
	
	function ViewActionItemController($state,$stateParams,$scope,appData,_,ActionItemsService,userService,
			TaskSpaceService,AnnotationService,MessageService) {
		
		 var vaic = this;
		 var appdata = appData.getAppData();
		 
		 vaic.actionItemInfo = {};
		 vaic.isEditedActionItemInfo = false;
		 vaic.editedActionItemInfo = {};
		 vaic.actionItemId = $stateParams.actionItemId;
		 vaic.clientId = $stateParams.clientId;
		 
		 vaic.dueDateOptions = {
				"startingDay": 1,
				"minDate":	new Date(),
		    	"start" : new Date(),
		    	"end" : null,
			};

		 vaic.dueDate = {
				 opened: false
		 };
						  
		 vaic.dueDateOpen = function($event) {
			 vaic.dueDate.opened = true;
		 };
		 
		 vaic.mensionUsers = [];
		 vaic.actionItemCommentsHeaders = angular.copy(ActionItemsService.actionItemCommentsHeaders);
		 
		 vaic.disableEditActionItemBtn = disableEditActionItemBtn;
		 vaic.disableSaveActionItemBtn = disableSaveActionItemBtn;
		 vaic.disableCompleteActionItemBtn = disableCompleteActionItemBtn;
		 vaic.editActionItem = editActionItem;
		 vaic.cancelSaveActionItem = cancelSaveActionItem;
		 vaic.tagTransform = tagTransform;
		 vaic.getSelectedUserName  = getSelectedUserName;
		 vaic.saveActionItem = saveActionItem;
		 vaic.markCompleteActionItem = markCompleteActionItem;
		 vaic.openInContext = openInContext;
		 
		 function disableEditActionItemBtn() {
			 if(vaic.actionItemInfo.status && vaic.actionItemInfo.status.toLowerCase() === "complete") {
				 return true;
			 }
			 return false;
		 }
		 
		 function isEditedActionItemChanged() {
			 var editedDueDateTime = 0;
			 var editedDueDate = new Date(vaic.editedActionItemInfo.dueDate);
			 if(editedDueDate) {
				 editedDueDateTime = editedDueDate.getTime();
			 }
			 if(vaic.actionItemInfo.description !== vaic.editedActionItemInfo.description 
					 || (!_.isEmpty(vaic.actionItemInfo.description) 
							 && !_.isEmpty(vaic.editedActionItemInfo.description) 
							 && vaic.actionItemInfo.longDescription.trim() !== vaic.editedActionItemInfo.longDescription.trim()) 
					 || vaic.actionItemInfo.assignedTo !== vaic.editedActionItemInfo.users[0] 
					 || vaic.actionItemInfo.dueDate !== editedDueDateTime) {
				 return true;
			 }
			 return false;
		 }
		 
		 function disableSaveActionItemBtn() {
			 if(vaic.actionItemInfo.status 
				 && vaic.actionItemInfo.status.toLowerCase() !== "complete" 
				 && !_.isEmpty(vaic.editedActionItemInfo.description) 
				 && !_.isEmpty(vaic.editedActionItemInfo.users) 
				 && vaic.editedActionItemInfo.dueDate && isEditedActionItemChanged()) {
				 return false;
			 }
			 return true
		 }
		 
		 function disableCompleteActionItemBtn() {
			 if((vaic.actionItemInfo.status 
					 && vaic.actionItemInfo.status.toLowerCase() === "complete")
					 || vaic.isEditedActionItemInfo) {
				 return true;
			 }
			 return false;
		 }
		 
		 function getAnnotationByConvId(objClientId,objId,cb) {
			 AnnotationService.getAnnotationByConvId(objClientId,objId).then(function(AnnotationResp) {
				 if (AnnotationResp.status == 200 && AnnotationResp.data.Status) {
					 if(typeof cb === "function") {
						 cb(AnnotationResp.data.Annotations);
					 }
				 }
			 });
		 }
		 
		 function openInContext() {
			 if(event) {
				 event.stopPropagation();
				 //event.preventDefault();
			 }
			 if(vaic.actionItemInfo.objType === "Annotation") {
				 if(!_.isEmpty(vaic.actionItemInfo.taskspaceId) && !_.isEmpty(vaic.actionItemInfo.taskspaceClientId) && !_.isEmpty(vaic.actionItemInfo.documentId)) {
					 TaskSpaceService.isObjPresantInTaskSpace(vaic.actionItemInfo.taskspaceId,vaic.actionItemInfo.taskspaceClientId,vaic.actionItemInfo.documentId,function(isObjPresantResp){
						 if(isObjPresantResp == 1) {
							 TaskSpaceService.openTaskSpaceObject(vaic.actionItemInfo.taskspaceId,vaic.actionItemInfo.taskspaceClientId,vaic.actionItemInfo.documentId,function(openTSObjResp){
								 if(openTSObjResp) {
									 $state.go('taskspace.list.task',{"tsId": vaic.actionItemInfo.taskspaceId,"tsc":vaic.actionItemInfo.taskspaceClientId,d:vaic.actionItemInfo.documentId,da:vaic.actionItemInfo.objId},{ reload: true });
								 }
							 });
						 }
					 });
				 } else if(!_.isEmpty(vaic.actionItemInfo.documentId) && !_.isEmpty(vaic.actionItemInfo.documentClientId)) {
					 $state.go("docview",{"docId" : vaic.actionItemInfo.documentId,"clientId": vaic.actionItemInfo.documentClientId,"commentId":vaic.actionItemInfo.objId});
				 }
			 } else if(vaic.actionItemInfo.objType === "Conversation") {
				 if(!_.isEmpty(vaic.actionItemInfo.taskspaceId) && !_.isEmpty(vaic.actionItemInfo.taskspaceClientId) && !_.isEmpty(vaic.actionItemInfo.documentId)) {
					 TaskSpaceService.isObjPresantInTaskSpace(vaic.actionItemInfo.taskspaceId,vaic.actionItemInfo.taskspaceClientId,vaic.actionItemInfo.documentId,function(isObjPresantResp){
						 if(isObjPresantResp == 1) {
							 TaskSpaceService.openTaskSpaceObject(vaic.actionItemInfo.taskspaceId,vaic.actionItemInfo.taskspaceClientId,vaic.actionItemInfo.documentId,function(openTSObjResp){
								 if(openTSObjResp) {
									 getAnnotationByConvId(vaic.actionItemInfo.objClientId,vaic.actionItemInfo.objId,function(annotation){
										 if(!_.isEmpty(annotation)) {
											 $state.go('taskspace.list.task',{"tsId": vaic.actionItemInfo.taskspaceId,"tsc":vaic.actionItemInfo.taskspaceClientId,d:vaic.actionItemInfo.documentId,da:annotation.id},{ reload: true });
										 }
									 });
								 }
							 });
						 }
					 });
				 } else if(!_.isEmpty(vaic.actionItemInfo.documentId) && !_.isEmpty(vaic.actionItemInfo.documentClientId)) {
					 getAnnotationByConvId(vaic.actionItemInfo.objClientId,vaic.actionItemInfo.objId,function(annotation){
						 if(!_.isEmpty(annotation)) {
							 $state.go("docview",{"docId" : vaic.actionItemInfo.documentId,"clientId": vaic.actionItemInfo.documentClientId,"commentId":annotation.id});
						 }
					 });
				 }
			 }
		 }
		 
		 function getAllUsers() {
			 userService.getAllUsers().then(function(resp){
				 if(resp.status == 200 && resp.data.Status) {
					 var mensionUsers = resp.data.Users;
					 vaic.mensionUsers = [{"loginId": appdata["UserId"],"firstName": appdata["UserName"]}];
					 if(_.isArray(mensionUsers)) {
						 vaic.mensionUsers = vaic.mensionUsers.concat(mensionUsers);
					 }
				 }
			 });
		 }
		 
		 function editActionItem() {
			 vaic.isEditedActionItemInfo = true;
			 vaic.editedActionItemInfo = angular.copy(vaic.actionItemInfo);
			 getAllUsers();
			 vaic.editedActionItemInfo["users"] = [];
			 vaic.editedActionItemInfo["users"].push(vaic.editedActionItemInfo.assignedTo);
		 }
		 
		 function cancelSaveActionItem() {
			 vaic.isEditedActionItemInfo = false;
			 vaic.editedActionItemInfo = {};
		 }
		 
		 function tagTransform(tagname) {
			 var item = {}; 	
			 return item = {
			  		"loginId":tagname,
			  		"firstName" : tagname,
			  		"lastName" : "",
			  		"isNew" : true
			  	};
		 }
		 
		 function getSelectedUserName(user) {
			 var userName = "";	
			 if(!_.isEmpty(user)) {
				 if(!_.isEmpty(user.firstName) && !_.isEmpty(user.lastName)) {
					 userName = user.firstName+" "+user.lastName;
				 } else if(_.isEmpty(user.firstName) && _.isEmpty(user.firstName)) {
					 userName = user.loginId;
				 } else if(!_.isEmpty(user.firstName)) {
					 userName = user.firstName;
				 } else if(!_.isEmpty(user.lastName)) {
					 userName = user.lastName;
				 }
			 }
			 return userName;
		 }
		 
		 function saveActionItem() {
			 var postdata = {};
			 postdata["id"] = vaic.editedActionItemInfo.id;
			 postdata["clientId"] = vaic.editedActionItemInfo.clientId;
			 postdata["description"] = vaic.editedActionItemInfo.description;
			 postdata["longDescription"] = vaic.editedActionItemInfo.longDescription;
			 postdata["assignedTo"] =  vaic.editedActionItemInfo.users[0];
			 postdata["dueDate"] = vaic.editedActionItemInfo.dueDate;
			 ActionItemsService.saveActionItem(postdata).then(function(resp) {
				 if(resp.status == 200 && resp.data.Status) {
					 vaic.actionItemInfo = resp.data.Task;
					 $scope.$emit("ActionItemUpdated",resp.data.Task);
					 MessageService.showSuccessMessage("UPDATE_ACTION_ITEM");
					 cancelSaveActionItem();
				 }
			 });
		 }
		 
		 function markCompleteActionItem() {
			 ActionItemsService.markCompleteActionItem(vaic.actionItemInfo.clientId,vaic.actionItemInfo.id).then(function(resp) {
				 if(resp.status == 200 && resp.data.Status) {
					 vaic.actionItemInfo = resp.data.Task;
					 $scope.$emit("ActionItemUpdated",resp.data.Task);
					 MessageService.showSuccessMessage("MARK_COMPLETE_ACTION_ITEM");
				 }
			 });
		 }
		 
		 function getActionItem() {
			 ActionItemsService.getActionItem(vaic.clientId,vaic.actionItemId).then(function(resp) {
				 if(resp.status == 200 && resp.data.Status) {
					 vaic.actionItemInfo = resp.data.Task;
				 }
			 });
		 }
		 getActionItem();
	}
})();