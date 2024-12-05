;(function(){
	'use strict';
	
	angular.module("vdvcApp").controller('ShareOptionsController',ShareOptionsController);
	
	ShareOptionsController.$inject = ["$scope","$state","$confirm","_","MessageService","ShareOptionsService","appData","userService"];
	
	function ShareOptionsController($scope,$state,$confirm,_,MessageService,ShareOptionsService,appData,userService) {
		var soc = this;
		
		soc.shareOptionsList = angular.copy(ShareOptionsService.shareOptions);
		soc.isShareOptionsEdited = false;
		
		//Methods
		soc.editShareOptionsSettings = editShareOptionsSettings;
		soc.isSelectedAtLeastOneOption = isSelectedAtLeastOneOption;
		soc.disableSaveShareOptionsSettings = disableSaveShareOptionsSettings;
		soc.saveShareOptionsSettings = saveShareOptionsSettings;
		soc.cancelShareOptionsSettings = cancelShareOptionsSettings;
		
		function editShareOptionsSettings() {
			soc.isShareOptionsEdited = true;
		}
		
		function isSelectedAtLeastOneOption() {
			var status = false;
			var importantShareOptionObj = _.findWhere(soc.shareOptionsList,{"important" : true});
			if(importantShareOptionObj){
				status = true;
			}
			return status;
		}
		
		function disableSaveShareOptionsSettings() {
			var status = true;
			var isSelectedAtLeastOneOpt = isSelectedAtLeastOneOption();
			var shareOptionSettings = userService.getUiState("ShareOptionsSettings").stateValue;
			if(isSelectedAtLeastOneOpt && _.isEmpty(shareOptionSettings) || (isSelectedAtLeastOneOpt && !_.isEmpty(shareOptionSettings) && shareOptionSettings.length != soc.shareOptionsList.length)) {
				status = false;
			} else if(isSelectedAtLeastOneOpt && !_.isEmpty(shareOptionSettings)) {
				for(var i = 0;i < soc.shareOptionsList.length; i++) {
					var shareOption = soc.shareOptionsList[i];
					if(typeof shareOption.important == "undefined") {
						shareOption.important = false;
					}
					for(var j = 0;j < shareOptionSettings.length; j++) {
						var shareOptionSetting = shareOptionSettings[j];
						if(typeof shareOptionSetting.important == "undefined") {
							shareOptionSetting.important = false;
						}
						if(shareOption.label == shareOptionSetting.label && shareOption.important != shareOptionSetting.important) {
							status = false;
							break;
						}
					}
					if(!status) {
						break;
					}
				}
			}
			return status;
		}
		
		function saveShareOptionsSettings() {
			userService.setUiState("ShareOptionsSettings",soc.shareOptionsList);
			soc.isShareOptionsEdited = false;
		}
		
		function cancelShareOptionsSettings() {
			soc.isShareOptionsEdited = false;
		}
		
		function initShareOptions() {
			userService.getUserStateForKey({"stateKey" : "ShareOptionsSettings"}).then(function(response) {
				if(response.status == 200 && response.data.Status) {
					var shareOptionsSettingsState = response.data.UserState;
					if(!_.isEmpty(shareOptionsSettingsState)) {
						soc.shareOptionsList = ShareOptionsService.getEnabledShareOptionsList(true,shareOptionsSettingsState[0]);
					} else {
						soc.shareOptionsList = ShareOptionsService.getEnabledShareOptionsList(true);
					}
				}
			});
		}
		
		initShareOptions();
	}
})();