;(function() {
	'use strict'; 
	
	angular.module('vdvcApp').controller('AddActionItemsController',AddActionItemsController);
	
	AddActionItemsController.$inject = ['$scope','appData','$uibModalInstance','_','ActionItemsInfo',
	                                 'ActionItemsService','userService','DocFactory','MessageService', 
	                                 'defautlDateFormat','VDVCConfirmService','TaskSpaceService'];
	
	function AddActionItemsController($scope,appData,$uibModalInstance,_,ActionItemsInfo,ActionItemsService,
			userService,DocFactory,MessageService,defautlDateFormat,VDVCConfirmService,TaskSpaceService) {
		
		 var aaic = this;
		 var appdata = appData.getAppData();
		 
		 aaic.ActionItemsInfo = angular.copy(ActionItemsInfo);
		 
		 aaic.actionItem = {};
		 aaic.dueDateOptions = {
				"startingDay": 1,
				"minDate":	new Date(),
		    	"start" : new Date(),
		    	"end" : null,
			};

		 aaic.dueDate = {
				 opened: false
		 };
						  
		 aaic.dueDateOpen = function($event) {
			 aaic.dueDate.opened = true;
		 };
		 
		 aaic.mensionUsers = [];
		 aaic.isFormSubmiting = false;
		 
		 
		 aaic.isUserSelected = isUserSelected;
		 aaic.tagTransform = tagTransform;
		 aaic.getSelectedUserName  = getSelectedUserName;
		 
		 
		 function isUserSelected() {
			 var status = false;
			 if(aaic.actionItem.users.length > 0) {
				 status = true;
			 }
			 return status;
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
			 if(!_.isEmpty(user.firstName) && !_.isEmpty(user.lastName)) {
				 userName = user.firstName+" "+user.lastName;
			 } else if(_.isEmpty(user.firstName) && _.isEmpty(user.firstName)) {
				 userName = user.loginId;
			 } else if(!_.isEmpty(user.firstName)) {
				 userName = user.firstName;
			 } else if(!_.isEmpty(user.lastName)) {
				 userName = user.lastName;
			 }
			 return userName;
		 }
		 
		 aaic.cancel = function () {
			 $uibModalInstance.dismiss('cancel');
		 };
		 
		 aaic.disableAssign = function () {
			 var status = true;
			 if(!_.isEmpty(aaic.actionItem.bDescription) 
					 && (!_.isEmpty(aaic.actionItem.users) || !_.isEmpty(aaic.ActionItemsInfo.assignedTo)) 
					 && aaic.actionItem.dueDate) {
				 status = false;
			 }
			 return status
		 };
		 
		 function preparePostdata() {
			 var postdata = {};
			 postdata["clientId"] = appdata["OrganizationId"];
			 postdata["description"] = aaic.actionItem.bDescription;
			 postdata["longDescription"] = aaic.actionItem.lDescription;
			 postdata["createdBy"] = appdata["UserId"];
			//postdata["assignedTo"] = aaic.actionItem.users[0];
			 postdata["assignedTo"] =  aaic.ActionItemsInfo.assignedTo;
			 postdata["dueDate"] = aaic.actionItem.dueDate;
			 postdata["status"] = "open";
			 
			 if(!_.isEmpty(aaic.ActionItemsInfo) && !_.isEmpty(aaic.ActionItemsInfo.document)) {
				 postdata["documentClientId"] = aaic.ActionItemsInfo.document.clientId;
				 postdata["documentId"] = aaic.ActionItemsInfo.document.id;
			 }
			 if(!_.isEmpty(aaic.ActionItemsInfo) && !_.isEmpty(aaic.ActionItemsInfo.tasksapce)) {
				 postdata["taskspaceClientId"] = aaic.ActionItemsInfo.tasksapce.clientId;
				 postdata["taskspaceId"] = aaic.ActionItemsInfo.tasksapce.id;
			 }			 
			 			 
			 return postdata;
		 }
		 
		 function getUsersSharedWith(context,cb) {
			 if(context == "Taskspace") { 
				 TaskSpaceService.getTaskSpaceById(ActionItemsInfo.tasksapce.clientId,ActionItemsInfo.tasksapce.id).then(function(resp) {
					 var currentTaskspace = resp.data.Taskspace;
					 if(typeof cb == "function") {
						 cb(currentTaskspace.collaborators);
					 }
				 });
			 }else if(context == "Document") {
				 DocFactory.getSharedUsersForDoc(ActionItemsInfo.document.id,ActionItemsInfo.document.clientId).then(function(resp){
					 if(resp.status == 200 && resp.data.Status) {
						 var sharedWith = resp.data.Notes;
						 if(typeof cb == "function") {
							 cb(sharedWith);
						 }
					 }
				 });
			 }
		 }
		 
		 aaic.ok = function () {
			 aaic.isFormSubmiting = true;
			 var postdata = preparePostdata();
			 
			 if(ActionItemsInfo.objType === "Document" && postdata) {
				 getUsersSharedWith(ActionItemsInfo.objType,function(sharedWith){
					 if(_.isEmpty(sharedWith[aaic.ActionItemsInfo.assignedTo])) {
						 var text = "'"+aaic.ActionItemsInfo.assignedTo+"'  User doesn't have privileges to access on Document,<br/><br/>If you still want to continue and assign Action Item, click on 'OK' button."
						 var confirm = VDVCConfirmService.open({title : "CONFIRM", text : text});
						 confirm.result.then(function () {
							 postdata["objType"] = ActionItemsInfo.objType;
							 postdata["objId"] = ActionItemsInfo.document.id;
							 postdata["objClientId"] = ActionItemsInfo.document.clientId;
							 ActionItemsService.createActionItem(postdata).then(function(resp) {
								 if(resp.status == 200 && resp.data.Status) {
									 $uibModalInstance.close(resp.data.Task);
								 }
							 });
						 }, function () {
							 $uibModalInstance.dismiss('cancel');
						 });   
					 } else {
						 postdata["objType"] = ActionItemsInfo.objType;
							postdata["objId"] = ActionItemsInfo.document.id;
							postdata["objClientId"] = ActionItemsInfo.document.clientId;
							ActionItemsService.createActionItem(postdata).then(function(resp) {
								if(resp.status == 200 && resp.data.Status) {
									$uibModalInstance.close(resp.data.Task);
								}
							});
					 }
				 });
			 } else if(postdata) {
				 if(_.isEmpty(ActionItemsInfo.tasksapce)) {
					 getUsersSharedWith("Document",function(sharedWith){
						 if(aaic.ActionItemsInfo.assignedTo != aaic.ActionItemsInfo.document.createdBy && 
								 _.isEmpty(sharedWith[aaic.ActionItemsInfo.assignedTo])) {
							 var text = "'"+aaic.ActionItemsInfo.assignedTo+"' User doesn't have privileges to access on Document,<br/><br/>If you still want to continue and assign Action Item, click on 'OK' button."
							 var confirm = VDVCConfirmService.open({title : "CONFIRM", text: text});
							 confirm.result.then(function () {
								 $uibModalInstance.close(postdata);
							 }, function () {
								 $uibModalInstance.dismiss('cancel');
							 });   
						 } else {
							 $uibModalInstance.close(postdata);
						 }
					 });
				 } else if(!_.isEmpty(ActionItemsInfo.tasksapce)){
					 getUsersSharedWith("Taskspace",function(sharedWith){
						 var sharedUser = _.findWhere(sharedWith,{"userId":aaic.ActionItemsInfo.assignedTo});
						 if(aaic.ActionItemsInfo.assignedTo != aaic.ActionItemsInfo.tasksapce.owner &&
								 _.isEmpty(sharedUser)) {
							 var text = "'"+aaic.ActionItemsInfo.assignedTo+"' doesn't have privileges to access on Taskspace Document,<br/><br/>If you still want to continue and assign Action Item, click on 'OK' button."
							 var confirm = VDVCConfirmService.open({title : "CONFIRM", text: text});
							 confirm.result.then(function () {
								 $uibModalInstance.close(postdata);
							 }, function () {
								 $uibModalInstance.dismiss('cancel');
							 });
						 } else {
							 $uibModalInstance.close(postdata);
						 }
					 });
				 }
				 
			 }
		 };
		 
		 function getAllUsers() {
			 userService.getAllUsersIncludeOtherOrgSharedUsers().then(function(resp){
				 if(resp.status == 200 && resp.data.Status) {
					 aaic.mensionUsers = resp.data.Users;
				 }
			 });
		 }
		 
		 
		 function init() {
			 aaic.actionItem["lDescription"] = aaic.ActionItemsInfo["lDescription"];
		 }
		 
		 init();
		 
		 //getAllUsers();
	}
	
})();