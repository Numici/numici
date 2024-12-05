;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('SessionsController',SessionsController);
	
	SessionsController.$inject = ['$state','$scope','appData','_','AdministrationService','orderByFilter','$timeout','$filter'];

	function SessionsController($state,$scope,appData,_,AdministrationService,orderByFilter,$timeout,$filter) {
		var sc = this;
		var appdata = appData.getAppData();
		var sessionsList = [];
		sc.sessionLimit = 20;
		sc.sessionBegin = 0;
		sc.includeNonBlankUserIdSessions = true;
		sc.includeBlankUserIdSessions = false;
		sc.totalSessionsCount = 0;
		sc.searchString = "";
		sc.sessionsHeaders = angular.copy(AdministrationService.sessionsHeaders);
		sc.sessions = [];
		sc.sessionField = "createdTime";
		sc.sessionFieldDecending = false;	
		
		//Methods
		sc.loadMoreSessions = loadMoreSessions;
		sc.sessionFilterOnChange = sessionFilterOnChange;
		sc.getListedSessionCount = getListedSessionCount;
		sc.sortByField = sortByField;
		
		var loadTimer;
		var increment = 20;
		function loadMoreSessions(inview) {
			 if(inview ) {
				 $timeout.cancel(loadTimer);
				 loadTimer = $timeout(function(){
					 if(sc.sessions && sc.sessions.length > sc.sessionLimit) {
							if( (sc.sessions.length-sc.sessionLimit) >= increment ) {
								sc.sessionLimit += increment;
							} else {
								sc.sessionLimit = sc.sessions.length;
							}
					 }
				 }, 500);
		    } 
		}
		
		function showSessions() {
			var sessionsListCopy = angular.copy(sessionsList);
			var sessionsTemp;
			if(sc.includeNonBlankUserIdSessions && sc.includeBlankUserIdSessions) {
				sessionsTemp = angular.copy(sessionsList);
			} else if(sc.includeNonBlankUserIdSessions) {
				sessionsTemp = _.filter(sessionsListCopy, function(item){ return !_.isEmpty(item.userId)});
			} else if(sc.includeBlankUserIdSessions) {
				sessionsTemp = _.filter(sessionsListCopy, function(item){ return _.isEmpty(item.userId)});
			} else {
				sessionsTemp = [];
			}
			sessionsTemp =  orderByFilter(sessionsTemp, sc.sessionField, sc.sessionFieldDecending);
			return sessionsTemp;
		}
				
		var searchTimeout;
		function sessionFilterOnChange() {
			$timeout.cancel(searchTimeout);
			searchTimeout = $timeout(function(){
				sc.sessionLimit = 20;
				var sessionsTemp = showSessions();
				if(!_.isEmpty(sc.searchString)) {
					sc.sessions = $filter('filter')(sessionsTemp, function(session) {
						return (session.userId && session.userId.toLowerCase().indexOf(sc.searchString.toLowerCase()) > -1) || (session.ip && session.ip.toLowerCase().indexOf(sc.searchString.toLowerCase()) > -1) || session.id.toLowerCase().indexOf(sc.searchString.toLowerCase()) > -1;
					});
				} else {
					sc.sessions = sessionsTemp;
				}
			},100);
		}
		
		function getListedSessionCount() {
			var matchedSessions = [];
			matchedSessions = _.where(sc.sessions,{matched : true});
			return matchedSessions.length;
		}
		
		function sortByField($event,hdr) {
			if($event) {
				$event.stopPropagation();
			}
			if(sc.sessionField == hdr.key) {
				sc.sessionFieldDecending = !sc.sessionFieldDecending;
    		} else {
    			sc.sessionFieldDecending = false;
    		}
			sc.sessionField =  hdr.key;
			sc.sessions =  orderByFilter(sc.sessions, sc.sessionField, sc.sessionFieldDecending);
			sessionsList =  orderByFilter(sessionsList, sc.sessionField, sc.sessionFieldDecending);
		}
		
		function getAllUserSessions() {
			AdministrationService.getAllUserSessions().then(function (resp) {
				if(resp.status == 200 && resp.data.Status){
					sessionsList = resp.data.getAllUserSessions;
					sc.totalSessionsCount = sessionsList.length;
					sc.sessions = showSessions();
				}
			});
		}
		
		getAllUserSessions();
	}	
	
})();