;(function(){
	'use strict';
	angular.module("vdvcApp").factory("AppSettingsService",AppSettingsService);
	
	AppSettingsService.$inject = ['httpService'];
	
	function AppSettingsService(httpService){
		
		var userSettingsTypes = {
			    "additionalNavigation_TimeLog": {"fieldType" : "DropDown", "valuesType" : "Enable-Disable"},
			    "additionalNavigation_OneDrive": {"fieldType" : "DropDown", "valuesType" : "Enable-Disable"},
			    "additionalNavigation_Box": {"fieldType" : "DropDown", "valuesType" : "Enable-Disable"},
			    "additionalNavigation_DeleteMe": {"fieldType" : "DropDown", "valuesType" : "Enable-Disable"},
			    "additionalNavigation_DropBox": {"fieldType" : "DropDown", "valuesType" : "Enable-Disable"},
			    "additionalNavigation_LinkedIn": {"fieldType" : "DropDown", "valuesType" : "Enable-Disable"},
			    "additionalNavigation_Notion": {"fieldType" : "DropDown", "valuesType" : "Enable-Disable"},
			    "additionalNavigation_Slack": {"fieldType" : "DropDown", "valuesType" : "Enable-Disable"},
			    "additionalNavigation_Asana": {"fieldType" : "DropDown", "valuesType" : "Enable-Disable"},
			    "additionalNavigation_Evernote": {"fieldType" : "DropDown", "valuesType" : "Enable-Disable"},
			    "additionalNavigation_Google": {"fieldType" : "DropDown", "valuesType" : "Enable-Disable"},
			    "additionalNavigation_Webex": {"fieldType" : "DropDown", "valuesType" : "Enable-Disable"},
			    "additionalNavigation_ManageNotifications": {"fieldType" : "DropDown", "valuesType" : "Enable-Disable"},
			    "additionalNavigation_UserPreferences": {"fieldType" : "DropDown", "valuesType" : "Enable-Disable"},
			    "researchView_AddDocument": {"fieldType" : "DropDown", "valuesType" : "Enable-Disable"},
			    "researchView_AddNote": {"fieldType" : "DropDown", "valuesType" : "Enable-Disable"},
			    "researchView_AddFolder": {"fieldType" : "DropDown", "valuesType" : "Enable-Disable"},
			    "researchView_AddLinkFolder": {"fieldType" : "DropDown", "valuesType" : "Enable-Disable"},
			    "researchView_Upload": {"fieldType" : "DropDown", "valuesType" : "Enable-Disable"},
			    "researchView_OpenSEC": {"fieldType" : "DropDown", "valuesType" : "Enable-Disable"},
			    "researchView_SwitchCardListView": {"fieldType" : "DropDown", "valuesType" : "Enable-Disable"},
			    "researchView_TrashFolder": {"fieldType" : "DropDown", "valuesType" : "Enable-Disable"},
			    "docView_AdvanceToolBar": {"fieldType" : "DropDown", "valuesType" : "Enable-Disable"},
			    "docView_DownloadBtn": {"fieldType" : "DropDown", "valuesType" : "Enable-Disable"},
			    "taskspaceView_NewTaskspace" : {"fieldType" : "DropDown", "valuesType" : "Enable-Disable"},
			    "taskspaceView_NewSection" : {"fieldType" : "DropDown", "valuesType" : "Enable-Disable"},
			    "taskspaceView_Allow1PaneOR2Pane" : {"fieldType" : "DropDown", "valuesType" : "Enable-Disable"},
			    "navigation_Dashboard": {"fieldType" : "DropDown", "valuesType" : "Enable-Disable"},
			    "navigation_Taskspace": {"fieldType" : "DropDown", "valuesType" : "Enable-Disable"},
			    "navigation_Digest": {"fieldType" : "DropDown", "valuesType" : "Enable-Disable"},
			    "navigation_ActionItems": {"fieldType" : "DropDown", "valuesType" : "Enable-Disable"},
			    "navigation_Research": {"fieldType" : "DropDown", "valuesType" : "Enable-Disable"},
			    "navigation_Notification": {"fieldType" : "DropDown", "valuesType" : "Enable-Disable"},
			    "navigation_Search": {"fieldType" : "DropDown", "valuesType" : "Enable-Disable"},
			    "navigation_AppMenu": {"fieldType" : "DropDown", "valuesType" : "Enable-Disable"},
			    "navigation_Portfolios": {"fieldType" : "DropDown", "valuesType" : "Enable-Disable"},
			    "navigation_Help": {"fieldType" : "DropDown", "valuesType" : "Enable-Disable"},
			    "navigation_Inbox": {"fieldType" : "DropDown", "valuesType" : "Enable-Disable"},
			    "uploadDocOptions_ClientSystem": {"fieldType" : "DropDown", "valuesType" : "Enable-Disable"},
			    "uploadDocOptions_Evernote": {"fieldType" : "DropDown", "valuesType" : "Enable-Disable"},
			    "uploadDocOptions_DropBox": {"fieldType" : "DropDown", "valuesType" : "Enable-Disable"},
			    "uploadDocOptions_GoogleDrive": {"fieldType" : "DropDown", "valuesType" : "Enable-Disable"},
			    "user_GenerativeAI": {"fieldType" : "DropDown", "valuesType" : "Yes-No"},
			    "user_Quota": {"fieldType" : "FreeText", "valuesType" : "long"},
			    "user_MaxUploadFileSize": {"fieldType" : "FreeText", "valuesType" : "long"},
			    "user_UseGridFS": {"fieldType" : "DropDown", "valuesType" : "UseGridFS-Options"},
			    "user_ShareObjAcrossOrg": {"fieldType" : "DropDown", "valuesType" : "Yes-No"},
			    "user_AllowShareToProvisionalUser": {"fieldType" : "DropDown", "valuesType" : "Yes-No"},
			    "user_MaxWebResources": {"fieldType" : "FreeText", "valuesType" : "long"},
			    "user_UseDbForPdfAnnotation": {"fieldType" : "DropDown", "valuesType" : "Yes-No"},
			    "user_EnableAtMention": {"fieldType" : "DropDown", "valuesType" : "Yes-No"},
			    "user_AllowShareToGuestUser" : {"fieldType" : "DropDown", "valuesType" : "Yes-No"},
			    "org_CreateDefaultTaskspace": {"fieldType" : "DropDown", "valuesType" : "Yes-No"},
			    "org_DefaultTaskspaceName": {"fieldType" : "FreeText", "valuesType" : "string"},
			    "org_ShareWelcomeTaskspace": {"fieldType" : "DropDown", "valuesType" : "Yes-No"},
			    "extension_ShareLinks": {"fieldType" : "DropDown", "valuesType" : "Yes-No"},
			    "extension_EnableWebClip": {"fieldType" : "DropDown", "valuesType" : "Yes-No"},
                "extract_Screenshot_Text": {"fieldType" : "DropDown", "valuesType" : "Yes-No"},
			    "contentAccess_FinancialAnalyst": {"fieldType" : "DropDown", "valuesType" : "Yes-No"},
			    "sharedOrgUser_AllowFolderShare": {"fieldType" : "DropDown", "valuesType" : "Yes-No"},
			    "sharedLink_Expiry_Taskspace" : {"fieldType" : "FreeText", "valuesType" : "long"}
			  };
		
		var service = {
				userSettingsTypes : userSettingsTypes,
				getAppSettings : getAppSettings,
				getOrganizationsList : getOrganizationsList,
				getOrgUsersList : getOrgUsersList,
				saveAppSettings : saveAppSettings,
				updateAppSettings : updateAppSettings,
				deleteAppSettings : deleteAppSettings
		};
		
		return service;
		
		function getAppSettings() {
			return httpService.httpGet("appSetting/get");
		}
		
		function getOrganizationsList() {
			return httpService.httpPost("appSetting/getList/orgnizations");
		}
		
		function getOrgUsersList(orgId) {
			return httpService.httpPost("appSetting/getList/orgUsers",orgId);
		}
		
		function saveAppSettings(postdata) {
			return httpService.httpPost("appSetting/save",postdata);
		}
		
		function updateAppSettings(postdata) {
			return httpService.httpPost("appSetting/update",postdata);
		}
		
		function deleteAppSettings(id) {
			return httpService.httpDelete("appSetting/"+id);
		}
		
	}
	
})();