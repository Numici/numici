;(function() {
	
	angular.module("vdvcApp").factory("UserPreferencesService",UserPreferencesService);
	
	UserPreferencesService.$inject = ["httpService","$q","$rootScope","appData","_","SessionService","$document","$window","$timeout","$state"];
	
	function UserPreferencesService(httpService,$q,$rootScope,appData,_,SessionService,$document,$window,$timeout,$state) {
		var notifications = [
			{
				"label" : "Folder Added",
				"field" : "NewFolder",
				"group" : "Add / Move "
			},
			{
				"label" : "Folder Moved",
				"field" : "FolderMoved",
				"group" : "Add / Move "
			},
			{
				"label" : "Document Added",
				"field" : "NewDocument",
				"group" : "Add / Move "
			},
			{
				"label" : "Document Moved",
				"field" : "DocumentMoved",
				"group" : "Add / Move "
			},
			{
				"label" : "Document added to taskspace",
				"field" : "TaskspaceObjectAdded",
				"group" : "Add / Move "
			},
			{
				"label" : "Document removed from taskspace",
				"field" : "TaskspaceObjectRemoved",
				"group" : "Add / Move "
			},
			{
				"label" : "Document Moved",
				"field" : "DocumentMoved",
				"group" : "Add / Move "
			},
			{
				"label" : "Document Commented",
				"field" : "DocumentComment",
				"group" : "Comment"
			},
			{
				"label" : "Taskspace Commented",
				"field" : "TaskspaceComment",
				"group" : "Comment"
			},
			{
				"label" : "Document Comment",
				"field" : "DocumentComment",
				"group" : "Comment"
			},
			{
				"label" : "Folder Shared",
				"field" : "FolderShare",
				"group" : "Share"
			},
			{
				"label" : "Document Shared",
				"field" : "DocumentShare",
				"group" : "Share"
			},
			{
				"label" : "Taskspace Shared",
				"field" : "TaskspaceInvite",
				"group" : "Share"
			},
			{
				"label" : "Portfolio Shared",
				"field" : "PortfolioShare",
				"group" : "Share"
			},
			{
				"label" : "Other",
				"field" : "other",
				"group" : "Other"
			}
		];
		
		var menuItems = [
							{"key" : "additionalNavigation_ManageNotifications","label" : "Manage Notifications","show" : true,"disable" : false,"order" : 1},
							{"key" : "additionalNavigation_Slack","label" : "Manage Slack Notifications","show" : true,"disable" : false,"order" : 2},
							{"key" : "shareOptions","label" : "Share Options","show" : true,"disable" : false,"order" : 3}
		                ];
		
		var service = {
				getNotificationGroupInfo : getNotificationGroupInfo,
				getDefaultNotificationSettings : getDefaultNotificationSettings,  
				getUserPreferencesByKey : getUserPreferencesByKey,
				getMenuItems : getMenuItems
		};
		
		
		return service;
		
		function getNotificationGroupInfo() {
			return angular.copy(_.groupBy(notifications, 'group'));
		}
		
		function getDefaultNotificationSettings() {
			var settings = {};
			_.each(notifications,function(val,index) {
				settings[val.field] = true;
			});
			
			return settings;
		}
		
		function getUserPreferencesByKey(postdata) {
			return httpService.httpPost("userState/get",postdata);
		}
		
		function setMenuUiSettings(menuItem){
			var appdata = appData.getAppData();
			menuItem.show = (appdata.UserSettings[menuItem.key] == "Hidden") ? false : true;
			menuItem.disable = (appdata.UserSettings[menuItem.key] == "Enabled") ? false : true;
		}
		
		function getMenuItems() {
			var manageNtfMenuIndex = _.findIndex(menuItems,{"key" : "additionalNavigation_ManageNotifications"});
			setMenuUiSettings(menuItems[manageNtfMenuIndex]);
			var manageSlackNtfMenuIndex = _.findIndex(menuItems,{"key" : "additionalNavigation_Slack"});
			setMenuUiSettings(menuItems[manageSlackNtfMenuIndex]);
			return menuItems;
		}
	}
})();