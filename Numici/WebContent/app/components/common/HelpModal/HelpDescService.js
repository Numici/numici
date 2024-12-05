;(function(){
	'use strict';
	
	
	angular.module("vdvcApp").factory("HelpDescService",HelpDescService);
	
	HelpDescService.$inject = ['$rootScope','$resource','$http','baseUrl','$uibModal','commonService'];

	function HelpDescService($rootScope,$resource,$http,baseUrl,$uibModal,commonService) {
		
		var helpTitile = {
				"SearchKeyword" : "Keyword Help",
				"SearchResultSort" : "Sort Help",
				"OrphanedAnnotations" : "Orphaned Annotations"
			};
		
		var HelpDescService = {
				VDVCHelpDesc : null,
				helpTitile : helpTitile,
				showHelp : showHelp
		};
		
		
		
		(function() {
			
			commonService.getNavMenuItems({"type":"VDVCHelpDesc"}).then(function(resp){
				
				if(resp.status == 200 && resp.data.Status) {
					
					HelpDescService.VDVCHelpDesc = resp.data.listAppKeyValues;
					
				}
			});
		})();
		
		return HelpDescService;
		function showHelp(key) {
			if(HelpDescService.VDVCHelpDesc) {
				var helpInfo = _.findWhere(HelpDescService.VDVCHelpDesc,{"key": key}); 
				if(helpInfo) {
					commonService.showInfo({"title" : helpTitile[key],"message" : helpInfo.value});
				}
			}
		}
				
	}
})();