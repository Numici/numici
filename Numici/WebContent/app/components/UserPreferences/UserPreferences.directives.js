;(function(){
	'use strict';
	angular.module("vdvcApp").directive("manageNotificationsUiForUp",['SlackService',function(SlackService) {
		return {
		    restrict: "E",
		    templateUrl : 'app/components/Notifications/ManageNotifications/ManageNotifications.html',
	       	controller : 'ManageNotificationsController',
	       	controllerAs: 'mnc'
		  }
	}]);
	
	angular.module("vdvcApp").directive("manageSlackWorkspaceUiForUp",['SlackService',function(SlackService) {
		return {
		    restrict: "E",
		    templateUrl : 'app/components/UserPreferences/ManageSlackWorkspace/ManageSlackWorkspace.html',
	       	controller : 'ManageSlackWorkspaceController',
	       	controllerAs: 'mswc'
		  }
	}]);
	
	angular.module("vdvcApp").directive("shareOptionsUiForUp",function() {
		return {
		    restrict: "E",
		    templateUrl:'app/components/UserPreferences/ShareOptions/ShareOptions.html',
		    controller:'ShareOptionsController',
		    controllerAs: "soc"
		  }
	});
})();