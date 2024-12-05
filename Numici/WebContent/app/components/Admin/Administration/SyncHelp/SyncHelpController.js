;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('SyncHelpController',SyncHelpController);
	
	SyncHelpController.$inject = ['$state','$scope','appData','_','DocFactory','HelpService','MessageService'];

	function SyncHelpController($state,$scope,appData,_,DocFactory,HelpService,MessageService) {
		var shc = this;
		var appdata = appData.getAppData();
							
		//Methods
		shc.syncHelp = syncHelp;
				
		function checkAndSyncHelpFolder(id) {
			DocFactory.getDocsUnderFolder(id).then(function (resp) {
				if(resp.status == 200 && resp.data.Status){
					var folders = resp.data.Folders.folders;
					var helpFolder = _.findWhere(folders,{"name":"Help"});
		        	if(!_.isEmpty(helpFolder)) {
		        		HelpService.creatHelpTopics(helpFolder.id).then(function(helpResp){
		        			if(helpResp.status == 200 && helpResp.data.Status) {
		        				MessageService.showSuccessMessage("CREATE_HELP_TOPICS",[helpResp.data.Help.title]);
			   				}
		        		});
		        	} else {
		        		MessageService.showErrorMessage("ERROR_CREATE_HELP_TOPICS");
		        	}
				}
			});
		}
		
		function syncHelp() {
			checkAndSyncHelpFolder(appdata.rootFolderId);
		}
	}	
	
})();