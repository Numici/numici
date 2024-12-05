;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('AdministrationController',AdministrationController);
	
	AdministrationController.$inject = ['$state','$stateParams','$scope',
	        'appData','$compile','AdministrationService','_',
	        'DocFactory','HelpService','MessageService','$timeout'];

	function AdministrationController($state,$stateParams,$scope,appData,$compile,AdministrationService,_,
			DocFactory,HelpService,MessageService,$timeout) {
		var ac = this;
		var appdata = appData.getAppData();
		$scope.$emit("PageName",{"userName":appdata.UserName,"pageName":$state.current.pageName});
		
		// Instance variables
		var userRole = appdata.UserRole;
		var currentOrganization = {};
		var guestUserRequst = AdministrationService.guestUserRequst;
		
		ac.menuItems = angular.copy(AdministrationService.getMenuItems(userRole));
		ac.selectedMenuItem = {};
						
		//Methods
		ac.openMenuItem = openMenuItem;
		
		function getOrganizationsTemplate() {
			return '<organizations-ui-for-admin></organizations-ui-for-admin>';
		}
		
		function getUsersTemplate() {
			return '<users-ui-for-admin></users-ui-for-admin>';
		}
		
		function getUserMigrationsTemplate() {
			return '<migrate-users-ui-for-admin></migrate-users-ui-for-admin>';
		}
		
		function getCPTemplate() {
			return '<cp-ui-for-admin></cp-ui-for-admin>';
		}
		
		function getTCITemplate() {
			return '<tci-ui-for-admin></tci-ui-for-admin>';
		}
		
		function getSysPreferencesTemplate() {
			return '<sys-preferences-ui-for-admin></sys-preferences-ui-for-admin>';
		}
		
		function getAppSettingsTemplate() {
			return '<app-settings-ui-for-admin></app-settings-ui-for-admin>';
		}
		
		function getSyncHelpTemplate() {
			return '<sync-help-ui-for-admin></sync-help-ui-for-admin>';
		}
		
		function getSessionsTemplate() {
			return '<sessions-ui-for-admin></sessions-ui-for-admin>';
		}
		
		function getMaintenanceScheduleTemplate() {
			return '<maintenance-schedule-ui-for-admin></maintenance-schedule-ui-for-admin>';
		}
		
		function getViewTemplate(menuItem) {
			var template = "";
			switch(menuItem.key) {
				case "organizations":
					template = getOrganizationsTemplate();
					break;
				case "users":
					template = getUsersTemplate();
					break;
				case "migrateUsers":
					template = getUserMigrationsTemplate();
					break;
				case "CP":
					template = getCPTemplate();
					break;
				case "TCI":
					template = getTCITemplate();
					break;
				case "sysPreferences":
					template = getSysPreferencesTemplate();
					break;
				case "appSettings":
					template = getAppSettingsTemplate();
					break;
				case "syncHelp":
					template = getSyncHelpTemplate();
					break;
				case "sessions":
					template = getSessionsTemplate();
					break;
				case "maintenanceSchedule":
					template = getMaintenanceScheduleTemplate();
					break;
			}
			return template; 
		}
		
		function clearView() {
			try{
				var divElement = angular.element(document.querySelector('#selected-menu-viewer'));
				divElement.empty();
			} catch(e) {
				
			}
		}
		
		function renderSelectedMenuView(menuItem) {
			clearView();
			var divElement = angular.element(document.querySelector('#selected-menu-viewer'));
			var template = getViewTemplate(menuItem);
			var childScope = $scope.$new();
		    var appendHtml = $compile(template)(childScope);
		    divElement.append(appendHtml);
		    var timer = $timeout(function() {
		    	if(!_.isEmpty($stateParams.selectedMenuItem)) {
		    		var activeScheduleElement = document.querySelector('.active-schedule');
		    		if(activeScheduleElement) {
		    			activeScheduleElement.scrollIntoView();
					}
				}
 	 			$timeout.cancel(timer);
	        }, 1000);
		    
		}
		
		function openMenuItem(menuItem) {
			ac.selectedMenuItem = menuItem;
			renderSelectedMenuView(menuItem);
		}
		
		function init() {
			if(userRole == 'VDVCSiteAdmin' || userRole == 'VDVCAdmin') {
				if(!_.isEmpty($stateParams.selectedMenuItem)) {
					ac.selectedMenuItem = _.findWhere(ac.menuItems,{key : $stateParams.selectedMenuItem});
				} else {
					ac.selectedMenuItem = _.findWhere(ac.menuItems,{key : "organizations"});
				}
			} else if(userRole == 'OrgAdmin') {
				ac.selectedMenuItem = _.findWhere(ac.menuItems,{key : "users"});
			}
			if(!_.isEmpty(guestUserRequst)) {
				ac.selectedMenuItem = _.findWhere(ac.menuItems,{key : "users"});
			}
			renderSelectedMenuView(ac.selectedMenuItem);
		}
		
		init();
	}	
	
})();