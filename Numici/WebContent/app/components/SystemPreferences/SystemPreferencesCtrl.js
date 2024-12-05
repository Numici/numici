;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('SysPrefController',SystemPreferencesCtrl);
	
	SystemPreferencesCtrl.$inject = ['$scope','$rootScope','$sanitize','commonService','MessageService','_','userService','$state','$stateParams','$document','$timeout','$confirm','appData','$window','$filter'];

	function SystemPreferencesCtrl($scope,$rootScope,$sanitize,commonService,MessageService,_,userService,$state,$stateParams,$document,$timeout,$confirm,appData,$window,$filter) {
		var vm = this;
		var appdata = appData.getAppData();
		$scope.$emit("PageName",{"userName":appdata.UserName,"pageName":$state.current.pageName});
		// Instance variables
		vm.appKeyTypeList = ["AdminEmailNotification","DocExtension","DocVersionSettings","HelpDisplay","HelpInfoMapping","GlobalSettings","Integration","ObjLocking","PermissionsDisplayName","SearchSnippet","ShareLinkInfo","SuppressSync","TaskspaceTipsWizard","ToolTips","UserNotification","UserRegistration","VDVCColorCode","VDVCHelpDesc","VDVCSlackHelp","VDVCUsers","WebAnnotations"];
		vm.helpTextDisplayTypes = ["helpTextPopup","helpTextPopupWithMenu","helpTextSideMenu"];
		vm.helpTextTopics = [];
		vm.helpTopicOrders = ["helpInfoMapping","alphaNumericAscending"];
		vm.appKeyType = "VDVCColorCode";
		vm.appKeyValuesList=appdata.VDVCColorCodes;
		vm.enableEdit = true;
		
		//Methods
		
		vm.selectedAppKeyData = selectedAppKeyData;
		vm.EditAppKeyValues = EditAppKeyValues;
		vm.showTextBox = showTextBox;
		vm.showTextArea = showTextArea;
		vm.showHelpTextDisplayTypes = showHelpTextDisplayTypes;
		vm.showHelpTextTopics = showHelpTextTopics;
		vm.showColorPicker = showColorPicker;
		vm.SaveAppKeyValues = SaveAppKeyValues;
		vm.CancelEdit = CancelEdit;
		
		if(appdata.HelpInfo && appdata.HelpInfo.Help && appdata.HelpInfo.Help.topics) {
			vm.helpTopics = appdata.HelpInfo.Help.topics
			for(var i = 0; i < vm.helpTopics.length; i++) {
				var helpTopic = vm.helpTopics[i];
				if(helpTopic) {
					vm.helpTextTopics.push(helpTopic.title);
				}
			}
		}
				
		function selectedAppKeyData() {
			commonService.getNavMenuItems({"type":vm.appKeyType}).then(function(resp){
				if(resp.status == 200 && resp.data.Status) {
					vm.appKeyValuesList = resp.data.listAppKeyValues;
				}
			});
		}
		
		function EditAppKeyValues(appKeyValue) {
			if(appKeyValue.clone) {
				delete appKeyValue.clone;
			}
			appKeyValue.clone = angular.copy(appKeyValue);
			appKeyValue.clone.isEdited = true;
			
		}
		
		function showTextBox() {
			if(vm.appKeyType != 'VDVCColorCode' && vm.appKeyType != 'HelpInfoMapping' && vm.appKeyType != 'HelpDisplay' && vm.appKeyType != 'VDVCHelpDesc' && vm.appKeyType != 'VDVCSlackHelp' && vm.appKeyType != 'TaskspaceTipsWizard' && vm.appKeyType != 'ShareLinkInfo' && vm.appKeyType != 'SuppressSync') {
				return true;
			} else{
				return false;
			}
		}
		
		function showTextArea() {
			if(vm.appKeyType == 'VDVCHelpDesc' || vm.appKeyType == 'VDVCSlackHelp' || vm.appKeyType == 'TaskspaceTipsWizard' || vm.appKeyType == 'ShareLinkInfo' || vm.appKeyType == 'SuppressSync') {
				return true;
			} else{
				return false;
			}
		}
		
		function showHelpTextDisplayTypes() {
			if(vm.appKeyType == 'HelpDisplay') {
				return true;
			} else{
				return false;
			}
		}
		
		function showHelpTextTopics() {
			if(vm.appKeyType == 'HelpInfoMapping') {
				return true;
			} else{
				return false;
			}
		}
		
		function showColorPicker() {
			if(vm.appKeyType == 'VDVCColorCode') {
				return true;
			} else{
				return false;
			}
		}
		
		function SaveAppKeyValues(appKeyValue) {
			if(appKeyValue && appKeyValue.clone) {
				delete appKeyValue.clone.isEdited;
				commonService.updateNavMenuItems(appKeyValue.clone).then(function(resp){
					if(resp.status == 200 && resp.data.Status) {
						appKeyValue.value = appKeyValue.clone.value;
						appKeyValue.active = appKeyValue.clone.active;
						var appKeyValueCopy = angular.copy(appKeyValue.clone);
						$rootScope.$broadcast('SysPrefChanged',appKeyValueCopy);
						delete appKeyValue.clone;
					}
				});
			}
			
		}
		
		function CancelEdit(appKeyValue) {
			appKeyValue.clone.isEdited = false;
		}
		
	}	
	
})();