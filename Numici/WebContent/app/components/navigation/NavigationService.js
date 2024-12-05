
;(function(window, angular) {
	'use strict';
	
	angular.module("vdvcApp").factory("navigationService", navigationService);
	
	navigationService.$inject = ["appData","_"];
	
	function navigationService(appData,_) {
		
		var navMenuItems = [
								{
									label : "ADMINISTRATION",
									key : "navigation_Administration",
									type : "route",
									route : "administration",
									sortOrder : 0,
									isEnabled : true,
									show : true,
									reload : true,
									params : {}
								}
		                  ];
		var orgAdminItms = [
	                    	{
	                    		label : "V1 DashBoard",
	                    		key : "navigation_V1DashBoard",
	                    		type : "href",
	                    		route : "home.jsf",
	                    		isEnabled : true,
	                    		show : true,
	                    		reload : false,
	                    		params : {}
	                    	},
	                    	{
	                    		label : "V2 DashBoard",
	                    		key : "navigation_V2DashBoard",
	                    		type : "href",
	                    		route : "home.html",
	                    		isEnabled : true,
	                    		show : true,
	                    		reload : false,
	                    		params : {}
	                    	}
	                   ];
		
		var siteAdminItms = [
    	                    	{
    	                    		label : "Company Presentations",
    	                    		key : "additionalNavigation_CP",
    	                    		type : "route",
    	                    		route : "CP",
    	                    		isEnabled : true,
    	                    		show : true,
    	                    		reload : true,
    	                    		params : {}
    	                    	},
    	                    	{
    	                    		label : "Ticker Cik Info",
    	                    		key : "additionalNavigation_TCI",
    	                    		type : "route",
    	                    		route : "tci",
    	                    		isEnabled : true,
    	                    		show : true,
    	                    		reload : true,
    	                    		params : {}
    	                    	}
    	                   ];
		var siteAdminMobileItms = [
 	                    	{
 	                    		label : "Company Presentations",
 	                    		key : "additionalNavigation_cp",
 	                    		type : "route",
 	                    		route : "CP",
 	                    		isEnabled : false,
 	                    		show : false,
 	                    		reload : true,
 	                    		params : {}
 	                    	},
 	                    	{
 	                    		label : "Ticker Cik Info",
 	                    		key : "additionalNavigation_TCI",
 	                    		type : "route",
 	                    		route : "tci",
 	                    		isEnabled : false,
 	                    		show : false,
 	                    		reload : true,
 	                    		params : {}
 	                    	}
 	                   ];
		var integrations = ["Asana","Box","DropBox","Evernote","Google","LinkedIn","Notion","OneDrive","Slack","Webex"];
		var navigationService = {
			navMenuItems : navMenuItems,
			orgAdminItms : orgAdminItms,
			siteAdminItms : siteAdminItms,
			siteAdminMobileItms : siteAdminMobileItms,
			integrations : integrations
		};
		
		return navigationService;
	}
})(window,window.angular);
