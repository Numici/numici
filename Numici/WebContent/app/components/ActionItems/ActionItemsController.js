;(function() {
	'use strict'; 
	
	angular.module('vdvcApp').controller('ActionItemsController',ActionItemsController);
	
	ActionItemsController.$inject = ['$state','$scope','appData','_','orderByFilter','ActionItemsService',
	                                 'userService','AnnotationService','TaskSpaceService','$uibModal'];
	
	function ActionItemsController($state,$scope,appData,_,orderByFilter,ActionItemsService,userService,
			AnnotationService,TaskSpaceService,$uibModal) {
		
		 var aic = this;
		 var appdata = appData.getAppData();
		 
		 aic.actionItemTabs = angular.copy(ActionItemsService.actionItemTabs);
		 aic.currentTab = {};
		 aic.aiSearchTxt;
		 aic.actionItems = [];
		 aic.actionItemField;
		 aic.actionItemFieldDecending;
		 aic.checkAllActionItems = {"selected" : false};
		 
		 aic.actionItemsCreatedByMe = [];
		 
		 aic.actionItemsAssignedToMe = [];
		 
		 aic.actionItemsHeaders = [];
		 
		 aic.checkedActionItems = [];
		 
		 aic.toggleAiListSideBarChecked = false;
		 
		 aic.currentActionItem = {};
		 
		 aic.toggleOnePaneAiList = toggleOnePaneAiList;
		 aic.selectActionItemTab = selectActionItemTab;
		 aic.getActionItemsCount = getActionItemsCount;
		 aic.selectColumn = selectColumn;
		 aic.sortByfield = sortByfield;
		 aic.getSortedFieldLabel = getSortedFieldLabel;
		 aic.viewAdditionalInfo = viewAdditionalInfo;
		 aic.openActionItem = openActionItem;
		 aic.checkActionItem = checkActionItem;
		 aic.onLongPress = onLongPress;
		 aic.selectAllActionItems = selectAllActionItems;
		 aic.unselectAllActionItems = unselectAllActionItems;
		 aic.openInContext = openInContext;
		 
		 $scope.$on("ActionItemUpdated",function(event,actionItem){
			 if(!_.isEmpty(aic.actionItems) && !_.isEmpty(actionItem)) {
				 _.extend(_.findWhere(aic.actionItems, { id: actionItem.id }), actionItem);
			 }
		 });
	 
		 function selectActionItemTab(tab) {
			 angular.forEach(aic.actionItemTabs, function(actionItemTab){
				 actionItemTab.current = false; 
			 });
			 tab.current = true;
			 aic.currentTab = angular.copy(tab);
			 if(aic.currentTab && aic.currentTab.tabName === "CreatedByMe") {
				 getTasksCreatedByMe();
			 } else if(aic.currentTab && aic.currentTab.tabName === "AssignedToMe") {
				 getTasksAssignedToMe();
			 }
		 }
		 
		 function getActionItemsCount(tabName) {
			 var actionItemsCount = 0;
			 if(tabName === "CreatedByMe") {
				 actionItemsCount = aic.actionItemsCreatedByMe.length;
			 } else if(tabName === "AssignedToMe") {
				 actionItemsCount = aic.actionItemsAssignedToMe.length;
			 }
			 return actionItemsCount;
		 }
		 
		 function selectColumn (hdr,hdrList){
			 var selectedColumns = _.where(hdrList,{"checked" : true});
			 if(hdr.checked) {
				 if(!_.isEmpty(selectedColumns) && selectedColumns.length > 1) {
					 hdr.checked = false;
				 }
			 } else {
				 hdr.checked = true;
			 }
		 }
		 
		 function sortByfield (hdr,tabName) {
			 if(aic.actionItemField == hdr.value) {
				 aic.actionItemFieldDecending = !aic.actionItemFieldDecending;
			 } else {
				 aic.actionItemFieldDecending = false;
			 }
			 aic.actionItemField =  hdr.value;
			 aic.actionItems =  orderByFilter(aic.actionItems, aic.actionItemField, aic.actionItemFieldDecending);
			 switch(tabName) {
			 case "CreatedByMe":
				 userService.setUiState("createdactionitemsort",{field:aic.actionItemField,decending:aic.actionItemFieldDecending});
				 break;
			 case "AssignedToMe":
				 userService.setUiState("assignedactionitemsort",{field:aic.actionItemField,decending:aic.actionItemFieldDecending});
				 break;
			 }
		 }
		 
		 function getSortedFieldLabel() {
			 var filedLabel = "";
			 var sortedField = _.findWhere(aic.actionItemsHeaders,{"value" : aic.actionItemField});
			 if(sortedField) {
				 filedLabel = sortedField.label;
			 }
			 return filedLabel;
		 }
		 
		 function toggleOnePaneAiList() {
			 aic.toggleAiListSideBarChecked = !aic.toggleAiListSideBarChecked;
			 $scope.$broadcast('resizeDoc', false);
		 }
		 
		 function viewAdditionalInfo(actionItem,event) {
			 if(event) {
				 event.stopPropagation();
				 event.preventDefault();
			 }
			 var modalInstance = $uibModal.open({
				 animation: true,
			     templateUrl: 'app/components/ActionItems/ViewAdditionalInfo/ViewAIAdditionalInfoModal.html',
			     controller: 'ViewAIAdditionalInfoController',
			     appendTo : $('.rootContainer'),
			     controllerAs: 'vaiaic',
			     size: "md",
			     backdrop: 'static',
			     resolve: {
			    	 ActionItem : function() {
			    		 return {
			    				 "info" : actionItem
			    		 }
			    	 }
			     }
		 	});
		 	modalInstance.result.then(function (ActionItemsErrorResp) {
			 
		 	});
		 }
		 
		 function viewActionItem(actionItem) {
			 var modalInstance = $uibModal.open({
				 animation: true,
			     templateUrl: 'app/components/ActionItems/View/ViewActionItemModal.html',
			     controller: 'ViewActionItemController',
			     appendTo : $('.rootContainer'),
			     controllerAs: 'vaic',
			     size: "md",
			     backdrop: 'static',
			     resolve: {
			    	 ActionItem : function() {
			    		 return {
			    				 "info" : actionItem
			    		 }
			    	 }
			     }
		 	});
		 	modalInstance.result.then(function (ActionItemsErrorResp) {
			 
		 	});
		 }
		 
		 function openActionItem(actionItem,event) {
			 if(event) {
				 event.stopPropagation();
				 event.preventDefault();
			 }
			 if(aic.checkedActionItems.length > 0) {
				 actionItem.selected = !actionItem.selected;
				 checkActionItem(actionItem);
			 } else {
				 //viewActionItem(actionItem);
				 angular.forEach(aic.actionItems, function(itm){
					 itm.current = false;
				 });
				 actionItem.current = true;
				 aic.currentActionItem = angular.copy(actionItem);
				 $state.go('actionitems.actionitem',{'actionItemId' : actionItem.id,'clientId' : actionItem.clientId});
			 }
		 }
		 
		 function checkActionItem(actionItem) {
			 //hideAllDocActions();
			 if(actionItem.selected) {
				 aic.checkedActionItems.push(actionItem);
			 } else {
				 aic.checkedActionItems = _.without(aic.checkedActionItems, _.findWhere(aic.checkedActionItems, {id: actionItem.id}));
			 }
			 
			 if((aic.checkedActionItems.length > 0) && (aic.actionItems.length == aic.checkedActionItems.length)) {
				 aic.checkAllActionItems.selected = true;
			 } else {
				 aic.checkAllActionItems.selected = false;
			 }
			 
			 //checkDocActions();
		 }
		 
		 function onLongPress(actionItem) {
			 actionItem.selected = true;
			 checkActionItem(actionItem);
		 }
		 
		 function selectAllCreatedActions() {
			 //hideAllDocActions();
			 angular.forEach(aic.actionItemsCreatedByMe, function(itm){
				 itm.selected = aic.checkAllActionItemsCreatedByMe.selected; 
				 aic.checkedActionItems = _.reject(aic.checkedActionItems, function(checkedActionItem){ 
					 return checkedActionItem.id == itm.id; 
				 });
			 });
			 if(aic.checkAllActionItemsCreatedByMe.selected) {
				 angular.forEach(aic.actionItemsCreatedByMe, function(itm){
					 itm.selected = aic.checkAllActionItemsCreatedByMe.selected; 
					 aic.checkedActionItems.push(itm);
				 });
			 }
			 //checkDocActions();
		 }
	    
		 function selectAllAssignedActions() {
			 //hideAllDocActions();
			 angular.forEach(aic.actionItemsAssignedToMe, function(itm){ 
				 itm.selected = aic.checkAllActionItemsAssignedToMe.selected;
				 aic.checkedActionItems = _.reject(aic.checkedActionItems, function(checkedActionItem){ 
					 return checkedActionItem.id == itm.id; 
				 });
			 });
			 if(aic.checkAllActionItemsAssignedToMe.selected) {
				 angular.forEach(aic.actionItemsAssignedToMe, function(itm){ 
					 itm.selected = aic.checkAllActionItemsAssignedToMe.selected;
					 aic.checkedActionItems.push(itm);
				 });
			 }
			 //checkDocActions();
		 }
		 
		 function selectAllActionItems(type) {
			 //hideAllDocActions();
			 angular.forEach(aic.actionItems, function(itm){ 
				 itm.selected = aic.checkAllActionItems.selected;
				 aic.checkedActionItems = _.reject(aic.checkedActionItems, function(checkedActionItem){ 
					 return checkedActionItem.id == itm.id; 
				 });
			 });
			 if(aic.checkAllActionItems.selected) {
				 angular.forEach(aic.actionItems, function(itm){ 
					 itm.selected = aic.checkAllActionItems.selected;
					 aic.checkedActionItems.push(itm);
				 });
			 }
			 //checkDocActions();
		 }
		 
		 function unselectAllActionItems(event) {
			 if(event) {
				 event.stopPropagation();
			 }
			 _.each(aic.checkedActionItems,function(item,index) {
				 item.selected = false;
			 });
			 aic.checkAllActionItems.selected = false;
			 aic.checkedActionItems = [];
			//hideAllDocActions();
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
	 
		 function openInContext(actionItem,event) {
			 if(event) {
				 event.stopPropagation();
				 //event.preventDefault();
			 }
			 if(actionItem.objType === "Annotation") {
				 if(!_.isEmpty(actionItem.taskspaceId) && !_.isEmpty(actionItem.taskspaceClientId) && !_.isEmpty(actionItem.documentId)) {
					 TaskSpaceService.isObjPresantInTaskSpace(actionItem.taskspaceId,actionItem.taskspaceClientId,actionItem.documentId,function(isObjPresantResp){
						 if(isObjPresantResp == 1) {
							 TaskSpaceService.openTaskSpaceObject(actionItem.taskspaceId,actionItem.taskspaceClientId,actionItem.documentId,function(openTSObjResp){
								 if(openTSObjResp) {
									 $state.go('taskspace.list.task',{"tsId": actionItem.taskspaceId,"tsc":actionItem.taskspaceClientId,d:actionItem.documentId,da:actionItem.objId},{ reload: true });
								 }
							 });
						 }
					 });
				 } else if(!_.isEmpty(actionItem.documentId) && !_.isEmpty(actionItem.documentClientId)) {
					 $state.go("docview",{"docId" : actionItem.documentId,"clientId": actionItem.documentClientId,"commentId":actionItem.objId});
				 }
			 } else if(actionItem.objType === "Conversation") {
				 if(!_.isEmpty(actionItem.taskspaceId) && !_.isEmpty(actionItem.taskspaceClientId) && !_.isEmpty(actionItem.documentId)) {
					 TaskSpaceService.isObjPresantInTaskSpace(actionItem.taskspaceId,actionItem.taskspaceClientId,actionItem.documentId,function(isObjPresantResp){
						 if(isObjPresantResp == 1) {
							 TaskSpaceService.openTaskSpaceObject(actionItem.taskspaceId,actionItem.taskspaceClientId,actionItem.documentId,function(openTSObjResp){
								 if(openTSObjResp) {
									 getAnnotationByConvId(actionItem.objClientId,actionItem.objId,function(annotation){
										 if(!_.isEmpty(annotation)) {
											 $state.go('taskspace.list.task',{"tsId": actionItem.taskspaceId,"tsc":actionItem.taskspaceClientId,d:actionItem.documentId,da:annotation.id},{ reload: true });
										 }
									 });
								 }
							 });
						 }
					 });
				 } else if(!_.isEmpty(actionItem.documentId) && !_.isEmpty(actionItem.documentClientId)) {
					 getAnnotationByConvId(actionItem.objClientId,actionItem.objId,function(annotation){
						 if(!_.isEmpty(annotation)) {
							 $state.go("docview",{"docId" : actionItem.documentId,"clientId": actionItem.documentClientId,"commentId":annotation.id});
						 }
					 });
				 }
			 }
		 }
		 
		 function getTasksCreatedByMe(cb) {
			 ActionItemsService.getTasksCreatedByMe().then(function(resp){
				 if(resp.status == 200 && resp.data.Status) {
					 aic.actionItemsCreatedByMe = resp.data.Task;
					 aic.actionItems = resp.data.Task;
					 aic.actionItemsHeaders = angular.copy(ActionItemsService.actionItemsCreatedByMeHeaders);
					 aic.actionItemField = userService.getUiState("createdactionitemsort").stateValue ? userService.getUiState("createdactionitemsort").stateValue.field : "description";
					 aic.actionItemFieldDecending = userService.getUiState("createdactionitemsort").stateValue ? userService.getUiState("createdactionitemsort").stateValue.decending : false;
					 if(!_.isEmpty(aic.actionItems) && !ActionItemsService.openfromNotification) {
						 openActionItem(aic.actionItems[0],false);
					 } else if(ActionItemsService.openfromNotification && 
							 !_.isEmpty($state.params.actionItemId) && 
							 !_.isEmpty($state.params.clientId)){
						 ActionItemsService.openfromNotification = false;
						 getTasksAssignedToMe(function(selectedItemInAssignedList){
							 if(selectedItemInAssignedList) {
								 var currentTab = _.findWhere(aic.actionItemTabs,{"tabName" : "AssignedToMe"});
								 selectActionItemTab(currentTab);
							 } else if(!_.isEmpty(aic.actionItems)) {
								 openActionItem(aic.actionItems[0],false);
							 }
						 });
					 }
					 if(typeof cb === "function") {
						 cb(resp.data.Status);
					 }
				 }
			 });
		 }
		 
		 function getTasksAssignedToMe(cb) {
			 ActionItemsService.getTasksAssignedToMe().then(function(resp){
				 if(resp.status == 200 && resp.data.Status) {
					 aic.actionItemsAssignedToMe = resp.data.Task;
					 aic.actionItems = resp.data.Task;
					 aic.actionItemsHeaders = angular.copy(ActionItemsService.actionItemsAssignedToMeHeaders);
					 aic.actionItemField = userService.getUiState("assignedactionitemsort").stateValue ? userService.getUiState("createdactionitemsort").stateValue.field : "description";
					 aic.actionItemFieldDecending = userService.getUiState("assignedactionitemsort").stateValue ? userService.getUiState("createdactionitemsort").stateValue.decending : false;
					 if(!_.isEmpty(aic.actionItems)) {
						 if(!_.isEmpty($state.params.actionItemId) && !_.isEmpty($state.params.clientId)) {
							 var selectedItem = _.findWhere(aic.actionItems,{id : $state.params.actionItemId});
							 if(selectedItem) {
								 if(typeof cb === "function") {
									 cb(selectedItem);
								 } else {
									 openActionItem(selectedItem,false);
								 }
							 } else {
								 openActionItem(aic.actionItems[0],false);
							 }
						 } else {
							 openActionItem(aic.actionItems[0],false);
						 }
					 }
					 if(typeof cb === "function") {
						 cb(resp.data.Status);
					 }
				 }
			 });
		 }
		 
		 function init() {
			 var currentTab = _.findWhere(aic.actionItemTabs,{"current" : true});
			 if(currentTab) {
				 aic.currentTab = angular.copy(currentTab);
				 if(currentTab.tabName === "CreatedByMe") {
					 getTasksCreatedByMe();
				 } else if(currentTab.tabName === "AssignedToMe") {
					 getTasksAssignedToMe();
				 }
			 }
			 
		 }
		 init();
	}
})();