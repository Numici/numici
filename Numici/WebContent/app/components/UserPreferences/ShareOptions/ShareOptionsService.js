;(function() {
	
	angular.module("vdvcApp").factory("ShareOptionsService",ShareOptionsService);
	
	ShareOptionsService.$inject = ["httpService","$q","$rootScope","appData",
	                               "_","userService","$document","$window",
	                               "$timeout","$state","orderByFilter"];
	
	function ShareOptionsService(httpService,$q,$rootScope,appData,_,
			userService,$document,$window,$timeout,$state,orderByFilter) {
		var shareOptions = [
			{
				"label" : "Embed",
				"field" : "Embed",
				"important" : false
			},
			{
				"label" : "Facebook",
				"field" : "Facebook",
				"important" : false
			},
			{
				"label" : "LinkedIn",
				"field" : "additionalNavigation_LinkedIn",
				"important" : false
			},
			{
				"label" : "Twitter",
				"field" : "Twitter",
				"important" : false
			},
			{
				"label" : "WhatsApp",
				"field" : "WhatsApp",
				"important" : false
			},
			{
				"label" : "Notion",
				"field" : "additionalNavigation_Notion",
				"important" : false
			},
			{
				"label" : "Slack",
				"field" : "additionalNavigation_Slack",
				"important" : false
			},
			{
				"label" : "Teams",
				"field" : "additionalNavigation_OneDrive",
				"important" : false
			},
			{
				"label" : "Webex",
				"field" : "additionalNavigation_Webex",
				"important" : false
			},
			{
				"label" : "Onenote",
				"field" : "additionalNavigation_OneDrive",
				"important" : false
			},
			{
				"label" : "Email",
				"field" : "email",
				"important" : true
			},
			{
				"label" : "Pdf",
				"field" : "pdf",
				"important" : false
			},
			{
				"label" : "Numici Note",
				"field" : "numicinote",
				"important" : false
			},
			{
				"label" : "Copy",
				"field" : "copy",
				"important" : true
			}
		];
		var integratedShareOptions = [
		    "additionalNavigation_LinkedIn",
		    "additionalNavigation_OneDrive",
		    "additionalNavigation_Notion",
		    "additionalNavigation_Slack",
		    "additionalNavigation_Webex"
		];
		var service = {
				shareOptions : shareOptions,
				getEnabledShareOptionsList : getEnabledShareOptionsList,
				setShareOptionsSettingsInUiUserState : setShareOptionsSettingsInUiUserState
		};
		
		function setShareOptionsSettingsInUiUserState() {
			var appdata = appData.getAppData();
			var UiUserState = appdata.UiUserState;
			if(!_.isArray(UiUserState)) {
				UiUserState = [];
			}
			userService.getUserStateForKey({"stateKey" : "ShareOptionsSettings"}).then(function(response) {
				if(response.status == 200 && response.data.Status) {
					var shareOptionsSettingsState = response.data.UserState;
					if(!_.isEmpty(shareOptionsSettingsState)) {
						if(!_.isEmpty(UiUserState)) {
							var ShareOptionsSettingsObjIndex = _.findIndex(UiUserState,{"stateKey" : "ShareOptionsSettings"});
							UiUserState[ShareOptionsSettingsObjIndex].stateValue = shareOptionsSettingsState[0].stateValue;
						} else {
							UiUserState.push(shareOptionsSettingsState[0]);
						}
					}
					appData.setAppData("UiUserState",UiUserState);
				}
			});
		}
		
		function getShareOptionsSettingsFromUiUserState(appdata) {
			var shareOptionsSettings = [];
			var ShareOptionsSettingsObj = _.findWhere(appdata.UiUserState,{"stateKey" : "ShareOptionsSettings"});
			if(!_.isEmpty(ShareOptionsSettingsObj)) {
				shareOptionsSettings = ShareOptionsSettingsObj.stateValue;
			}
			return shareOptionsSettings;
		}
		
		function getEnabledShareOptionsList(useService,shareOptionsSettingsState){
			var shareOptionsCopy = angular.copy(shareOptions)
			var appdata = appData.getAppData();
			if(appdata && !_.isEmpty(appdata.UserSettings)) {
				_.each(integratedShareOptions,function(integratedShareOption) {
					if(appdata.UserSettings[integratedShareOption] != "Enabled") {
						shareOptionsCopy = _.reject(shareOptionsCopy, function(shareOptionCopy){ 
			    			return shareOptionCopy.field == integratedShareOption; 
			    		});
					}
				});
			}
			var shareOptionsSettings = [];
			if(useService && !_.isEmpty(shareOptionsSettingsState)) {
				shareOptionsSettings = shareOptionsSettingsState.stateValue;
			} else if(appdata && !_.isEmpty(appdata.UiUserState)) {
				shareOptionsSettings = getShareOptionsSettingsFromUiUserState(appdata);
			}
			if(!_.isEmpty(shareOptionsSettings)) {
				_.each(shareOptionsCopy,function(shareOptionCopy,i) {
					var shareOptionsSettingObj = _.findWhere(shareOptionsSettings,{"label" : shareOptionCopy.label});
					if(!_.isEmpty(shareOptionsSettingObj)) {
						shareOptionsCopy[i].important = shareOptionsSettingObj.important;
					}
				});
			}
			shareOptionsCopy = orderByFilter(shareOptionsCopy, "label", false);
			return shareOptionsCopy;
		}
		
		return service;
	}
	
})();