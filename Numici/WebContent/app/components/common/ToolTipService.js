;(function(){
	'use strict';
	
	
	angular.module("vdvcApp").factory("ToolTipService",ToolTipService);
	
	ToolTipService.$inject = ['$http','baseUrl','commonService'];

	function ToolTipService($http,baseUrl,commonService) {
		
		var ToolTipService = {
				VDVCToolTips : null,
				showToolTip : showToolTip
		};
		
		(function() {
			commonService.getNavMenuItems({"type":"ToolTips"}).then(function(resp){
				if(resp.status == 200 && resp.data.Status) {
					ToolTipService.VDVCToolTips = resp.data.listAppKeyValues;
				}
			});
		})();
		
		return ToolTipService;
		
		function showToolTip(key) {
			if(ToolTipService.VDVCToolTips) {
				var toolTipInfo = _.findWhere(ToolTipService.VDVCToolTips,{"key": key}); 
				if(toolTipInfo) {
					return toolTipInfo.value;
				} else {
					return '';
				}
			}
		}
				
	}
})();