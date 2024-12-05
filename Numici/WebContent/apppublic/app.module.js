;(function(window, angular) {
	'use strict';
	
	CKEDITOR.config.allowedContent = true;
	
	var dependencies =  ['angularMoment','ui.router','ngAnimate','ngSanitize','ngMaterial','angular.filter','ngResource','angular-loading-bar',
	                     'ui.bootstrap','duScroll','angular-inview','underscore','rangy','ngFileUpload','angular-confirm','ngDragDrop',
	                     'angular-pdf-viewer',"xeditable","ui.select","toaster","monospaced.elastic","LocalStorageModule",'colorpicker.module',
	                     'angular-clipboard','ui.sortable','pageslide-directive','ngWebSocket','CanvasViewer','markdown','turndown','ngCookies','ngFlash'];
	
	angular.module('underscore', []);
	
	angular.module('underscore').factory('_', function() {
	  return window._;
	});
	
	
	angular.module('rangy', []);
	angular.module('rangy').factory('rangy', function() {
	  return window.rangy; 
	});
	
	
	
	angular.module("vdvcPublicApp",dependencies);
	
	angular.module("vdvcPublicApp").constant('companyName', 'numici');
	angular.module("vdvcPublicApp").constant('baseUrl', 'api/');
	angular.module("vdvcPublicApp").constant('defautlDateFormat', 'DD-MM-YYYY');
	
	angular.module("vdvcPublicApp").factory("appData", ["$location",function($location) {
		var appdata = {};
		return {
			setAppData : setAppData,
			getAppData : getAppData,
			clearAppData : clearAppData,
			storageKeyForExtension : storageKeyForExtension,
			storageKeyForApp: storageKeyForApp
			
		};
		
		function setAppData(key,value) {
			appdata[key] = value;
		}
		
		function getAppData() {
			return appdata;
		}
		
		function clearAppData() {
			appdata = {}
		}
		
		function storageKeyForExtension() {
			
 		    var apiDomain = $location.host();
 		    apiDomain = apiDomain.replace(/\./g, '%2E');
 		    return `hypothesis.oauth.${apiDomain}.token`;
 		}
 		
 		function storageKeyForApp() {
 			
 		    var apiDomain = $location.host();
 		    apiDomain = apiDomain.replace(/\./g, '%2E');
 		    return apiDomain;
 		}
 		
	}]);
	
	angular.module("vdvcPublicApp").constant('AUTH_EVENTS', {
		loginSuccess: 'auth-login-success',
		loginFailed: 'auth-login-failed',
		logoutSuccess: 'auth-logout-success',
		sessionTimeout: 'auth-session-timeout',
		notAuthenticated: 'auth-not-authenticated',
		notAuthorized: 'auth-not-authorized',
		serverInMaintenanceMode: 'server-in-maintenance-mode'
	});
	
	function isIPad() {
	  return /iPad/i.test(navigator.userAgent);
	}
	
	angular.module("vdvcPublicApp").provider('$deviceInfo', function () {
		
		var ua_parser = new UAParser();
		var deviceInfo = ua_parser.getResult();
		this.deviceInfo = deviceInfo;
		this.isIPad = isIPad();
		this.isMobile = deviceInfo.device && deviceInfo.device.type === 'mobile';
		this.isTablet = ((deviceInfo.device && deviceInfo.device.type === 'tablet') || isIPad);
		this.isTouch = (deviceInfo.device && (deviceInfo.device.type === 'tablet' || deviceInfo.device.type === 'mobile')) 
		|| (deviceInfo.os && deviceInfo.os.name == "Android");
		
		var browserName = deviceInfo.browser ? deviceInfo.browser.name : "";
		
		this.isChrome = browserName && browserName.indexOf("Chrome") !== -1 ? true : false;
		this.isSafari = browserName && browserName.indexOf("Safari") !== -1 ? true : false;
		this.isIE = browserName && browserName.indexOf("IE") !== -1 ? true : false;
		this.isEdge = browserName && browserName.indexOf("Edge") !== -1 ? true : false;
		
		this.setDeviceInfo = function (info) {
			this.deviceInfo = info;
		};

		this.$get = function () {
		    return this;
		};
	});
	
	angular.module("vdvcPublicApp").provider('$userTimeZone', function () {
		this.timeZone = null;
		if(jstz) {
			this.timeZone = jstz.determine().name();
		} else {
			try{
				this.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
			} catch(e) {}
		}
		
		this.$get = function () {
		    return this;
		};
	});
	
})(window,window.angular);
