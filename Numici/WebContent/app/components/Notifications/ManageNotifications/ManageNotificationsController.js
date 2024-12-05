;(function(){
	'use strict';
	
	angular.module("vdvcApp").controller('ManageNotificationsController',ManageNotificationsController);
	
	ManageNotificationsController.$inject = ["$scope","$state","$confirm","_","MessageService","notificationService","appData","userService","SlackService"];
	
	function ManageNotificationsController($scope,$state,$confirm,_,MessageService,notificationService,appData,userService,SlackService) {
		var mnc = this;
		var appdata = appData.getAppData();
		
		var notificationSettings = [];
		var notificationSentToList = notificationService.notificationSentToList;
		var notificationEventList = notificationService.notificationEventList;
		
		mnc.notificationSentToListModal = angular.copy(notificationSentToList);
		mnc.notificationEventListModal = angular.copy(notificationEventList);
		mnc.isNtfSettingsEdited = false;
		mnc.slackWorkspaces = [];
		mnc.uiForManageNotifications = true;
		
		mnc.selectAllNotificationsSentTo = selectAllNotificationsSentTo;
		mnc.selectNotificationSentTo = selectNotificationSentTo;
		mnc.showNtfSettingsCB = showNtfSettingsCB;
		mnc.editNtfSettings = editNtfSettings;
		mnc.disableSaveNtfSttingsBtn = disableSaveNtfSttingsBtn;
		mnc.cancelEditNtfSettings = cancelEditNtfSettings;
		mnc.saveNtfSettings = saveNtfSettings;
		mnc.goSlackSettings = goSlackSettings;
		
		function selectAllNotificationsSentTo(notificationSentTo) {
			_.each(mnc.notificationSentToListModal,function(notificationSentToModal,index){
				if(notificationSentToModal.field === notificationSentTo.field) {
					_.each(mnc.notificationEventListModal,function(notificationEventModal){
						notificationSentToModal[notificationEventModal.field] = notificationSentTo.selectAll;
					});
				}
			});
		}
		
		function selectNotificationSentTo(notificationSentTo) {
			_.each(mnc.notificationSentToListModal,function(notificationSentToModal,index){
				if(notificationSentToModal.field === notificationSentTo.field) {
					var notifiedCount = 0;
					_.each(mnc.notificationEventListModal,function(notificationEventModal){
						if(notificationSentToModal[notificationEventModal.field]) {
							notifiedCount++
						}
					});
					if(!_.isEmpty(mnc.notificationEventListModal) && mnc.notificationEventListModal.length == notifiedCount) {
						notificationSentToModal.selectAll = true;
					} else {
						notificationSentToModal.selectAll = false;
					}
				}
			});
		}
		
		function showNtfSettingsCB(notificationSentTo,notificationEvent) {
			var status = false;
			if((notificationEvent.field !== 'docThreads' && (notificationSentTo.field === 'inAppPrefs' || notificationSentTo.field === 'mailPrefs' || notificationSentTo.field === 'mobilePrefs' || notificationSentTo.field === 'symphonyPrefs')) || (notificationEvent.field === 'docThreads' && notificationSentTo.field === 'symphonyPrefs')) {
				status = true;
			}
			return status;
		}
		
		function editNtfSettings() {
			mnc.isNtfSettingsEdited = true;
		}
		
		function disableSaveNtfSttingsBtn() {
			var status = true;
			for(var i = 0;i < mnc.notificationSentToListModal.length; i++) {
				var notificationSentToModal = mnc.notificationSentToListModal[i];
				var notificationSentTo = notificationSentToList[i];
				for(var j = 0;j < mnc.notificationEventListModal.length; j++) {
					var notificationEventModal = mnc.notificationEventListModal[j];
					if(typeof notificationSentToModal[notificationEventModal.field] == "undefined") {
						notificationSentToModal[notificationEventModal.field] = false;
					}
					if(typeof notificationSentTo[notificationEventModal.field] == "undefined") {
						notificationSentTo[notificationEventModal.field] = false;
					}
					if(notificationSentToModal[notificationEventModal.field] != notificationSentTo[notificationEventModal.field]) {
						status = false;
						break;
					}
				}
				if(!status) {
					break;
				}
			}
			return status;
		}
		
		function cancelEditNtfSettings() {
			_.each(mnc.notificationSentToListModal,function(notificationSentToModal,index){
				var notificationSentTo = notificationSentToList[index];
				_.each(mnc.notificationEventListModal,function(notificationEventModal){
					if(notificationSentToModal[notificationEventModal.field] != notificationSentTo[notificationEventModal.field]) {
						notificationSentToModal[notificationEventModal.field] = angular.copy(notificationSentTo[notificationEventModal.field]);
					}
				});
			});
			mnc.isNtfSettingsEdited = false;
		}
		
		function preparePostdata() {
			var postdata = {};
			_.each(mnc.notificationSentToListModal,function(notificationSentToModal,index){
				postdata[notificationSentToModal.field] = {};
				_.each(mnc.notificationEventListModal,function(notificationEventModal){
					if(notificationSentToModal[notificationEventModal.field]) {
						postdata[notificationSentToModal.field][notificationEventModal.field] = true;
					} else {
						postdata[notificationSentToModal.field][notificationEventModal.field] = false;
					}
				});
			});
			return postdata;
		}
		
		function saveNtfSettings() {
			var postdata = preparePostdata(postdata);
			notificationService.saveNtfSettings(postdata).then(function(response){
				if (response.status == 200 && response.data.Status) {
					MessageService.showSuccessMessage(response.data.Message);
					mnc.isNtfSettingsEdited = false;
				}
			});
		}
		
		function goSlackSettings(teamId) {
			var appdata = appData.getAppData();
			$state.go("manageslack",{"team": teamId,"user": appdata["UserId"]});
		}
		
		function processResponse(notificationSettings) {
			if(!_.isEmpty(notificationSettings)) {
				_.each(notificationSentToList,function(notificationSentTo,index){
					var notificationFieldSettings = notificationSettings[notificationSentTo.field];
					var notifiedCount = 0;
					_.each(mnc.notificationEventListModal,function(notificationEventModal){
						if(notificationFieldSettings && notificationFieldSettings[notificationEventModal.field]) {
							notificationSentTo[notificationEventModal.field] = true;
							notifiedCount++;
						} else {
							notificationSentTo[notificationEventModal.field] = false;
						}
					});
					if(!_.isEmpty(mnc.notificationEventListModal) && mnc.notificationEventListModal.length == notifiedCount) {
						notificationSentTo.selectAll = true;
					}
				});
				mnc.notificationSentToListModal = angular.copy(notificationSentToList);
			}
		}
		
		function init() {
			SlackService.getUserSlackWorkSpaces().then(function(resp){
				if(resp.data.Status) {
					if(resp.data.HasSlackAuth) {
						mnc.slackWorkspaces = resp.data.Data;
					}
				}
			});
			
			notificationService.getNtfSettings().then(function(response){
				if (response.status == 200 && response.data.Status) {
					var ntfSettings = response.data.Data;
					processResponse(ntfSettings);
				}
			});
			if($state.current.name != "managenotifications"){
				mnc.uiForManageNotifications = false;
			}
		}
		init();
	}
})();

