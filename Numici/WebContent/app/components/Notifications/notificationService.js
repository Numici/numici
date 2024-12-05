
;(function(){
	'use strict';
	
	
	angular.module("vdvcApp").factory("notificationService",notificationService);
	notificationService.$inject = ['$rootScope','httpService','appData'];
	function notificationService($rootScope,httpService,appData) {
		var appdata = appData.getAppData();
		var notificationService = {
				ntfGroupSettings : {
						"Action_Items_Mentions" : {"label":"Action Items and @Mentions"},
						"Add_Move" : {"label":"Add / Move"},
						"Comment" : {"label":"Comment"},
						"Share" : {"label":"Share"},
						"Saved_Search" : {"label":"Saved Search Results"},
						"Portfolio_Notification" : {"label":"Portfolio Notification"},
						"Other" : {"label":"Other"}
					 },
					 startFrom : 0,
					 limitSize : appdata.NotificationLimit ? appdata.NotificationLimit : 5,
					 notificationSentToList : [
					                           		{
								        				"label" : "In-App",
								        				"field" : "inAppPrefs",
								        				"selectAll" : false
								        			},
								        			{
								        				"label" : "Email",
								        				"field" : "mailPrefs",
								        				"selectAll" : false
								        			},
								        			{
								        				"label" : "Mob-App",
								        				"field" : "mobilePrefs",
								        				"selectAll" : false
								        			}/*,
								        			{
								        				"label" : "Symphony",
								        				"field" : "symphonyPrefs",
								        				"selectAll" : false
								        			}*/
								        		],
					 notificationEventList : [
								        			{
								        				"label" : "Document Added",
								        				"field" : "fileAdded"
								        			},
								        			{
								        				"label" : "Folder Added",
								        				"field" : "folderAdded"
								        			},
								        			{
								        				"label" : "Document Moved",
								        				"field" : "fileMoved"
								        			},
								        			{
								        				"label" : "Folder Moved",
								        				"field" : "folderMoved"
								        			},
								        			{
								        				"label" : "Comment Added",
								        				"field" : "comment"
								        			},
								        			/*{
								        				"label" : "Show Messages As Threads",
								        				"field" : "docThreads"
								        			},*/
								        			{
								        				"label" : "Document Shared",
								        				"field" : "share"
								        			},
								        			{
								        				"label" : "Portfolio",
								        				"field" : "portfolio"
								        			},
								        			{
								        				"label" : "Saved Search",
								        				"field" : "savedSearch"
								        			},
								        			{
								        				"label" : "Taskspace",
								        				"field" : "taskspace"
								        			},
								        			{
								        				"label" : "Action Items",
								        				"field" : "actionItems"
								        			},
								        			{
								        				"label" : "@Mentions",
								        				"field" : "mentions"
								        			},
								        			{
								        				"label" : "Other",
								        				"field" : "other"
								        			}
								        			
							        		   ]
		};
		
		notificationService.getNtfSettings = function() {
			return httpService.httpGet("user/getNtfSettings");
		};
		
		notificationService.saveNtfSettings = function(postdata) {
			return httpService.httpPost("user/saveNtfSettings", postdata);
		};
		
		notificationService.getMyNotificationsCountByGroup = function() {
			return httpService.httpGet("userNotification/myNotificationsCountByGroup");
		};
		
		notificationService.getMyNotificationsByGroup = function(groupKey,startFrom,limitSize) {
			return httpService.httpGet("userNotification/listMyNotifications/"+groupKey+"/"+startFrom+"/"+limitSize);
		};
		
		notificationService.markAsRead = function(id) {
			return httpService.httpGet("userNotification/markAsRead/"+id);
		};
		
		notificationService.markAsInactive = function(id) {
			return httpService.httpGet("userNotification/markAsInactive/"+id);
		};
		
		notificationService.deleteNotification = function(id) {
			return httpService.httpDelete("userNotification/deleteNotification/"+id);
		};
		
		notificationService.getUserNotificationCount = function() {
			return httpService.httpGet("userNotification/getUserNotificationCount", {ignoreLoadingBar: true});
		};
		
	    return notificationService;
	}
})();

