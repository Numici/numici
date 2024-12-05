;(function(){
	'use strict';
	
	angular.module("vdvcApp").controller('ManageSlackWorkspaceController',ManageSlackWorkspaceController);
	
	ManageSlackWorkspaceController.$inject = ["$scope","$state","SlackService","_","appData"];
	
	function ManageSlackWorkspaceController($scope,$state,SlackService,_,appData) {
		var mswc = this;
		
		mswc.slackWorkspaces = [];
		mswc.isShareOptionsEdited = false;
		
		//Methods
		mswc.goSlackSettings = goSlackSettings;
		
		function goSlackSettings(teamId) {
			var appdata = appData.getAppData();
			$state.go("manageslack",{"team": teamId,"user": appdata["UserId"]});
		}
		
		function initManageSlackWorkspace() {
			SlackService.getUserSlackWorkSpaces().then(function(resp){
				if(resp.data.Status) {
					if(resp.data.HasSlackAuth) {
						mswc.slackWorkspaces = resp.data.Data;
					}
				}
			});
		}
		
		initManageSlackWorkspace();
	}
})();