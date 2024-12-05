
;(function(){
	'use strict';
	
	angular.module("vdvcApp").controller('UserPreferencesController',UserPreferencesController);
	
	UserPreferencesController.$inject = ['$scope','$rootScope','$stateParams','_','MessageService',"$compile",'UserPreferencesService'];
	
	function UserPreferencesController($scope,$rootScope,$stateParams,_,MessageService,$compile,UserPreferencesService) {
		var self = this;
		
		self.menuItems = angular.copy(UserPreferencesService.getMenuItems());
		self.selectedMenuItem = {};
		
		//Methods
		self.openMenuItem = openMenuItem;
		
		function getManageNotificationsTemplate() {
			return '<manage-notifications-ui-for-up></manage-notifications-ui-for-up>';
		}
		
		function getManageSlackWorkspaceTemplate() {
			return '<manage-slack-workspace-ui-for-up></manage-slack-workspace-ui-for-up>';
		}
		
		function getShareOptionsTemplate() {
			return '<share-options-ui-for-up></share-options-ui-for-up>';
		}
		
		function getViewTemplate(menuItem) {
			var template = "";
			switch(menuItem.key) {
				case "additionalNavigation_ManageNotifications":
					template = getManageNotificationsTemplate();
					break;
				case "additionalNavigation_Slack":
					template = getManageSlackWorkspaceTemplate();
					break;
				case "shareOptions":
					template = getShareOptionsTemplate();
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
		    
		}
		
		function openMenuItem(menuItem) {
			self.selectedMenuItem = menuItem;
			renderSelectedMenuView(menuItem);
		}
		
		function initUserPreferences() {
			var nontDisabledMenuItemIndex = _.findIndex(self.menuItems,{"disable" : false})
			if(!_.isEmpty(self.menuItems) && nontDisabledMenuItemIndex >= 0){
				self.selectedMenuItem = self.menuItems[nontDisabledMenuItemIndex];
				renderSelectedMenuView(self.selectedMenuItem);
			}
		}
		
		initUserPreferences();
	}
})();

