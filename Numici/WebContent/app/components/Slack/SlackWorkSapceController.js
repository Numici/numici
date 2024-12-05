
;(function(){
	'use strict';
	
	angular.module("vdvcApp").controller('SlackWorkSapceController',SlackWorkSapceController);
	
	SlackWorkSapceController.$inject = ['$scope','$rootScope','$state','$stateParams','$confirm','_','MessageService',"$timeout",'SlackService','SlackWorkSpaces','$window','appData'];
	
	function SlackWorkSapceController($scope,$rootScope,$state,$stateParams,$confirm,_,MessageService,$timeout,SlackService,SlackWorkSpaces,$window,appData) {
		var slkwsp = this;
		
		slkwsp.workspaces;
		
		slkwsp.addToSlackWorkspace = addToSlackWorkspace;
		slkwsp.deleteSlackWorkSpace = deleteSlackWorkSpace;
		slkwsp.manageSlackWorkSpace = manageSlackWorkSpace;
		
		function addToSlackWorkspace() {
			SlackService.getSlackOauthUrl().then(function(resp) {
				if(resp.data.Status) {
					$window.location.href = resp.data.Data;
				}
			});
		}
		
		function deleteSlackWorkSpace(teamId,val) {
			var txt = 'Are you sure you want to delete Team "'+val+'" ?';
			$confirm({text: txt})
	        .then(function() {
	        	SlackService.deleteSlackTeam(teamId).then(function(resp) {
					if(resp.data.Status) {
						delete slkwsp.workspaces[teamId];
						MessageService.showSuccessMessage("SLACK_TEAM_DELETE",[val]);
					}
				});
	        });
		}
		
		function manageSlackWorkSpace(teamId) {
			var appdata = appData.getAppData();
			$state.go("manageslack",{"team": teamId,"user": appdata["UserId"]});
		}
		
		function setSlackWorkSpaces(resp) {
			if(resp.data.Status) {
				if(resp.data.HasSlackAuth) {
					slkwsp.workspaces = resp.data.Data;
				} else {
					addToSlackWorkspace();
				}
			}
		}
		
		function init() {
			setSlackWorkSpaces(SlackWorkSpaces);
		}
		
		init();
	}
})();

