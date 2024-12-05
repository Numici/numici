;(function(){
	'use strict';
	angular.module("vdvcApp").factory("LocalStorageService",LocalStorageService);
	
	LocalStorageService.$inject = ['localStorage','sessionStorage'];
	
	function LocalStorageService(localStorage,sessionStorage) {
		var LocalStorageService = {};
		LocalStorageService.WELCOME_PAGE = "welcomePage";
		LocalStorageService.EXTENSION_PAGE = "extensionPage";
		LocalStorageService.SLACK_AUTH = "slackAuth";
		LocalStorageService.INSTALL_SLACK_AUTH = "installSlackAuth"
		LocalStorageService.STATE_INFO = "stateInfo";
		LocalStorageService.SCHEDULE_IN_MAINTENANCE_MODE = "scheduleInMaintenanceMode";
		LocalStorageService.SHOW_TOUR_TIP_ON_LOGIN = "showTourTipOnlogin";
		
		LocalStorageService.setLocalStorage = setLocalStorage;
		LocalStorageService.getLocalStorage = getLocalStorage;
		LocalStorageService.removeLocalStorage = removeLocalStorage;
		
		LocalStorageService.setSessionStorage = setSessionStorage;
		LocalStorageService.getSessionStorage = getSessionStorage;
		LocalStorageService.removeSessionStorage = removeSessionStorage;
		
		function setLocalStorage(key,item) {
			localStorage.setItem(key,item);
		}
		
		function getLocalStorage(key) {
			return localStorage.getItem(key);
		}
		
		function removeLocalStorage(key) {
			localStorage.removeItem(key);
		}
		
		
		
		function setSessionStorage(key,item) {
			sessionStorage.setItem(key,item);
		}
		
		function getSessionStorage(key) {
			return sessionStorage.getItem(key);
		}
		
		function removeSessionStorage(key) {
			sessionStorage.removeItem(key);
		}
		
		return LocalStorageService;
	}
})();