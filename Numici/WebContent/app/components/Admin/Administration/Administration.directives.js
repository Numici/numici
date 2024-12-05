;(function(){
	'use strict';
	angular.module("vdvcApp").directive("organizationsUiForAdmin",function() {
		return {
		    restrict: "E",
		    templateUrl:'app/components/Admin/Administration/Organizations/OrganizationsTemplate.html',
		    controller:'OrganizationsController',
		    controllerAs: "oc"
		  }
	});
	
	angular.module("vdvcApp").directive("usersUiForAdmin",function() {
		return {
		    restrict: "E",
		    templateUrl:'app/components/Admin/Administration/Users/UsersTemplate.html',
		    controller:'UsersController',
		    controllerAs: "uc"
		  }
	});
	
	angular.module("vdvcApp").directive("migrateUsersUiForAdmin",function() {
		return {
		    restrict: "E",
		    templateUrl:'app/components/Admin/Administration/MigrateUser/MigrateUsersListTemplate.html',
		    controller:'MigrateUsersListController',
		    controllerAs: "mulc"
		  }
	});
	
	angular.module("vdvcApp").directive("cpUiForAdmin",function(CompanyPresentationService) {
		return {
		    restrict: "E",
		    templateUrl : 'app/components/Admin/CompanyPresentations/CompanyPresentations.html',
		    controller : 'CompanyPresentationsController',
        	controllerAs: 'cp'
		  }
	});
	
	angular.module("vdvcApp").directive("tciUiForAdmin",function() {
		return {
		    restrict: "E",
		    templateUrl : 'app/components/Admin/TickerCikInfo/TickerCikInfo.html',
        	controller : 'TickerCikInfoController',
        	controllerAs: 'tci'
		  }
	});
	
	angular.module("vdvcApp").directive("sysPreferencesUiForAdmin",function() {
		return {
		    restrict: "E",
		    templateUrl : 'app/components/SystemPreferences/SystemPreferencesTemplate.html',
        	controller : 'SysPrefController',
        	controllerAs: 'vm'
		  }
	});
	
	angular.module("vdvcApp").directive("appSettingsUiForAdmin",function() {
		return {
		    restrict: "E",
		    templateUrl : 'app/components/Admin/AppSettings/AppSettingsTemplate.html',
        	controller : 'AppSettingsController',
        	controllerAs: 'aps'
		  }
	});
	
	angular.module("vdvcApp").directive("syncHelpUiForAdmin",function() {
		return {
		    restrict: "E",
		    templateUrl : 'app/components/Admin/Administration/SyncHelp/SyncHelpTemplate.html',
        	controller : 'SyncHelpController',
        	controllerAs: 'shc'
		  }
	});
	
	angular.module("vdvcApp").directive("sessionsUiForAdmin",function() {
		return {
		    restrict: "E",
		    templateUrl : 'app/components/Admin/Administration/Sessions/SessionsTemplate.html',
        	controller : 'SessionsController',
        	controllerAs: 'sc'
		  }
	});
	
	angular.module("vdvcApp").directive("maintenanceScheduleUiForAdmin",function() {
		return {
		    restrict: "E",
		    templateUrl : 'app/components/Admin/Administration/MaintenanceSchedule/MaintenanceScheduleTemplate.html',
        	controller : 'MaintenanceScheduleController',
        	controllerAs: 'msc'
		  }
	});
	
	angular.module("vdvcApp").directive('autoComplete', function($timeout) {
	    return function(scope, iElement, iAttrs) {
	        iElement.autocomplete({});
	    };
	});
})();