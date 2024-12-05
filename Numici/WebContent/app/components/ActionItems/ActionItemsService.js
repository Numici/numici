;(function() {
	'use strict';
	angular.module("vdvcApp").factory("ActionItemsService",ActionItemsService);
	ActionItemsService.$inject = ['httpService'];
	
	function ActionItemsService(httpService) {
		
		var actionItemsCreatedByMeHeaders = [
	 		                  {
	 		                	  "label":"Name",
	 		                	  "value":"description",
	 		                	  "DValue":"description",
	 		                	  "checked" : true,
	 		                	  "type" : "text",
	 		                	  "class" : "col-md-2"
	 		                  },{
	 		                	  "label":"Obj Type",
	 		                	  "value":"objType",
	 		                	  "DValue":"objType",
	 		                	  "checked" : true,
	 		                	  "type" : "text",
	 		                	  "class" : "col-md-1"
	 		                  },{
	 		                	  "label":"Created By",
	 		                	  "value":"createdBy",
	 		                	  "DValue":"createdBy",
	 		                	  "checked" : false,
	 		                	  "type" : "text",
	 		                	  "class" : "col-md-2"
	 		                  },{
	 		                	  "label":"Assigned To",
	 		                	  "value":"assignedTo",
	 		                	  "DValue":"assignedTo",
	 		                	  "checked" : true,
	 		                	  "type" : "text",
	 		                	  "class" : "col-md-2"
	 		                  },{
	 		                	  "label":"Created Date",
	 		                	  "value":"createdDate",
	 		                	  "DValue":"createdDate",
	 		                	  "checked" : true,
	 		                	  "type" : "Date",
	 		                	  "class" : "col-md-1"
	 		                  },{
	 		                	  "label":"Due Date",
	 		                	  "value":"dueDate",
	 		                	  "DValue":"dueDate",
	 		                	  "checked" : true,
	 		                	  "type" : "Date",
	 		                	  "class" : "col-md-1"
	 		                  },{
	 		                	  "label":"Completed Date",
	 		                	  "value":"completedDate",
	 		                	  "DValue":"completedDate",
	 		                	  "checked" : true,
	 		                	  "type" : "Date",
	 		                	  "class" : "col-md-1"
	 		                  },{
	 		                	  "label":"Status",
	 		                	  "value":"status",
	 		                	  "DValue":"status",
	 		                	  "checked" : true,
	 		                	  "type" : "text",
	 		                	  "class" : "col-md-1"
	 		                  }
	 		            ];
		var actionItemsAssignedToMeHeaders = [
		        	 		                  {
		        	 		                	  "label":"Name",
		        	 		                	  "value":"description",
		        	 		                	  "DValue":"description",
		        	 		                	  "checked" : true,
		        	 		                	  "type" : "text",
		        	 		                	  "class" : "col-md-2"
		        	 		                  },{
		        	 		                	  "label":"Obj Type",
		        	 		                	  "value":"objType",
		        	 		                	  "DValue":"objType",
		        	 		                	  "checked" : true,
		        	 		                	  "type" : "text",
		        	 		                	  "class" : "col-md-1"
		        	 		                  },{
		        	 		                	  "label":"Created By",
		        	 		                	  "value":"createdBy",
		        	 		                	  "DValue":"createdBy",
		        	 		                	  "checked" : true,
		        	 		                	  "type" : "text",
		        	 		                	  "class" : "col-md-2"
		        	 		                  },{
		        	 		                	  "label":"Assigned To",
		        	 		                	  "value":"assignedTo",
		        	 		                	  "DValue":"assignedTo",
		        	 		                	  "checked" : false,
		        	 		                	  "type" : "text",
		        	 		                	  "class" : "col-md-2"
		        	 		                  },{
		        	 		                	  "label":"Created Date",
		        	 		                	  "value":"createdDate",
		        	 		                	  "DValue":"createdDate",
		        	 		                	  "checked" : true,
		        	 		                	  "type" : "Date",
		        	 		                	  "class" : "col-md-1"
		        	 		                  },{
		        	 		                	  "label":"Due Date",
		        	 		                	  "value":"dueDate",
		        	 		                	  "DValue":"dueDate",
		        	 		                	  "checked" : true,
		        	 		                	  "type" : "Date",
		        	 		                	  "class" : "col-md-1"
		        	 		                  },{
		        	 		                	  "label":"Completed Date",
		        	 		                	  "value":"completedDate",
		        	 		                	  "DValue":"completedDate",
		        	 		                	  "checked" : true,
		        	 		                	  "type" : "Date",
		        	 		                	  "class" : "col-md-1"
		        	 		                  },{
		        	 		                	  "label":"Status",
		        	 		                	  "value":"status",
		        	 		                	  "DValue":"status",
		        	 		                	  "checked" : true,
		        	 		                	  "type" : "text",
		        	 		                	  "class" : "col-md-1"
		        	 		                  }
		        	 		            ];
		var actionItemTabs = [{
	       	  "label":"Created By Me",
	     	  "tabName":"CreatedByMe",
	     	  "current" : true
	       },{
	     	  "label":"Assigned To Me",
	     	  "tabName":"AssignedToMe",
	     	  "current" : false
	       }];
		
		var actionItemCommentsHeaders = [
			{
           	  "label":"Comment By",
           	  "value":"commentBy",
           	  "DValue":"commentBy",
           	  "checked" : true,
           	  "type" : "text",
           	  "class" : "col-md-2"
             },{
        	  "label":"Created Date",
         	  "value":"createdDate",
         	  "DValue":"createdDate",
         	  "checked" : true,
         	  "type" : "Date",
         	  "class" : "col-md-2"
             },{
/*        	  "label":"Modified Date",
         	  "value":"modifiedDate",
         	  "DValue":"modifiedDate",
         	  "checked" : true,
         	  "type" : "Date",
         	  "class" : "col-md-2"
             },{*/
           	  "label":"Text",
           	  "value":"text",
           	  "DValue":"text",
           	  "checked" : true,
           	  "type" : "text",
           	  "class" : "col-md-8"
             }
		];
		var ActionItemsService = {
				actionItemTabs : actionItemTabs,
				openfromNotification : false,
				actionItemsCreatedByMeHeaders : actionItemsCreatedByMeHeaders,
				actionItemsAssignedToMeHeaders : actionItemsAssignedToMeHeaders,
				actionItemCommentsHeaders : actionItemCommentsHeaders,
				createActionItem : createActionItem,
				getActionItem : getActionItem,
				saveActionItem : saveActionItem,
				markCompleteActionItem : markCompleteActionItem,
				getTasksCreatedByMe : getTasksCreatedByMe,
				getTasksAssignedToMe : getTasksAssignedToMe,
				createActionItemSync : createActionItemSync,
				getActionItemSync : getActionItemSync,
				removeActionItemSync : removeActionItemSync,
				getExcelFileName : getExcelFileName
		};
		
		return ActionItemsService;
		
		
		function createActionItem(postdata) {
			return httpService.httpPost("task/new",postdata);
		}
		
		function getActionItem(clientid,actionid) {
			return httpService.httpGet("task/"+clientid+"/"+actionid);
		}
		
		function saveActionItem(postdata) {
			return httpService.httpPost("task/save",postdata);
		}
		
		function markCompleteActionItem(clientid,actionid) {
			return httpService.httpGet("task/markcomplete/"+clientid+"/"+actionid);
		}
		
		function getTasksCreatedByMe() {
			return httpService.httpGet("task/getTasksCreatedByMe");
		}
		
		function getTasksAssignedToMe() {
			return httpService.httpGet("task/getTasksAssignedToMe");
		}
		
		//creates new ActionItemSync for taskspace
		function createActionItemSync(postdata) {
			return httpService.httpPost("task/newtasksync",postdata);
		}
		
		//return ActionItemSync details for taskspace
		function getActionItemSync(taskspaceClientid,taskspaceId) {
			return httpService.httpGet("task/tasksync/"+taskspaceClientid+"/"+taskspaceId);
		}
		
		//deletes ActionItemSync, if any, for taskspace
		function removeActionItemSync(taskspaceClientid,taskspaceId) {
			return httpService.httpGet("task/removetasksync/"+taskspaceClientid+"/"+taskspaceId);
		}
		
		//returns Excel file name from taskspace
		function getExcelFileName(taskspaceClientid,taskspaceId) {
			return httpService.httpGet("task/excelfilename/"+taskspaceClientid+"/"+taskspaceId);
		}
	}
})();