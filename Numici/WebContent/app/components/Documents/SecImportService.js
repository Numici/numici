;(function() {
	'use strict';
	
	angular.module("vdvcApp").factory("SECImportFactory",SECImportFactory);
	
	SECImportFactory.$inject = ['httpService'];
	
	function SECImportFactory(httpService) {
		var SECImportFactory = {
				companyNames : [],
				importSECFile : importSECFile,
				openGlobalSECFile : openGlobalSECFile,
				getSECFilings : getSECFilings,
				getCompareDocId : getCompareDocId,
				getSECCikData : getSECCikData
		};
		

		//getSECCikData();
		
		return SECImportFactory;
		
		function importSECFile(postdata) {
			return httpService.httpPost("importSECFiling/downloadSECFileAsNotes",postdata);
		}
		
		function openGlobalSECFile(postdata) {
			return httpService.httpPost("importSECFiling/openGlobalSECFiling",postdata);
		}
		
		function getSECFilings(postdata) {
			return httpService.httpPost("importSECFiling/getSECFilingData",postdata,{'cache':true});
		}
		
		function getCompareDocId(clientId, docId) {
	    	return httpService.httpGet("importSECFiling/getCompareDocId/"+clientId+"/"+docId);
	    }
	    
		function getSECCikData() {
			httpService.httpPost("importSECFiling/getSECCikData",{"formGroup":"10-K"}).then(function(response){
				if (response.status == 200) {
					if (response.data.Status) {
						var Data = response.data.Data;
						for (var i=0; Data && i < Data.length; i++){
							SECImportFactory.companyNames.push( Data[i].companyName);
						}
					} 
				}
			});
		}
		
	}
})();