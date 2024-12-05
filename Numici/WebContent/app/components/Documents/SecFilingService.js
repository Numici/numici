;(function() {
	'use strict';
	angular.module("vdvcApp").factory("SecFilingService",SecFilingService);
	SecFilingService.$inject = ['httpService'];
	
	function SecFilingService(httpService) {
		var SecFilingService = {
				getCompaniesList : getCompaniesList,
				isCompareFileExist : isCompareFileExist,
				saveSECfileToFolder : saveSECfileToFolder
		};
		
		return SecFilingService;
		
		function getCompaniesList(postdata) {
			 return httpService.httpPost("importSECFiling/getSECCikInfoBySearchKey",postdata);
		}
		
		function isCompareFileExist(postdata) {
			 return httpService.httpPost("importSECFiling/openGlobalCompareSECFiling",postdata);
		}
		
		function saveSECfileToFolder(postdata) {
			return httpService.httpPost("importSECFiling/copyGlobalDocumentToUserFolder",postdata);
		}
	}
})();