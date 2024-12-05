;(function(){
	'use strict';
	angular.module("vdvcApp").factory("TickerCikInfoService",TickerCikInfoService );
	
	TickerCikInfoService.$inject = ['httpService'];
	
	function TickerCikInfoService(httpService) {
		
		var detailsLables = [ {
								"label" : "COMPANY NAME",
								"value" : "companyName"
							}, {
								"label" : "EXTERNAL NAME",
								"value" : "externalCompanyName"
							}, {
								"label" : "CIK",
								"value" : "cik"
							}, {
								"label" : "PRIMARY TICKER",
								"value" : "ticker"
							}, {
								"label" : "ALL TICKERS",
								"value" : "tickersArray"
							}, {
								"label" : "10K FILING MONTH",
								"value" : "fyPeriodEnd"
							}, {
								"label" : "10Q FILING MONTHS",
								"value" : "fqPeriodEndArray"
							}
						];

		var urlFilterFixedSourceOptions = ["All","Exists","DoesNotExist"];
		var urlFilterFixedStatusOptions = ["All"];
		var urlFilterFixedCuratorOptions = ["All"];
		
		var urlUpdateCuratorOptions = ["Yes","No"];
		var urlFilterCuratorOptions = urlFilterFixedCuratorOptions.concat(urlUpdateCuratorOptions);
		
		var urlUpdateStatusOptions = ["Pending","Accepted","Rejected"];
		var urlFilterStatusOptions = urlFilterFixedStatusOptions.concat(urlUpdateStatusOptions);
		
		var companyUrlsFilterOptions = angular.copy(urlFilterFixedSourceOptions);
		
		var urlUpdateHomeSourceOptions = ["GoogleFinance","YahooFinance","Nasdaq"];
		var urlUpdateIRSourceOptions = ["HomeUrl","Google"];
		var urlUpdateCPSourceOptions = ["HomeUrl","IRPage"];
		var urlUpdatePRSourceOptions = ["HomeUrl","IRPage"];
		
		var UrlUpdateSourceOptions = {	"HomeUrl" : urlUpdateHomeSourceOptions,
									  	"IRUrl" : urlUpdateIRSourceOptions,
									  	"CompanyPresentationUrl" : urlUpdateCPSourceOptions,
									  	"PressReleaseUrl" : urlUpdatePRSourceOptions
									 };
		
		var urlFilterHomeSourceOptions = urlFilterFixedSourceOptions.concat(urlUpdateHomeSourceOptions);
		var urlFilterIRSourceOptions = urlFilterFixedSourceOptions.concat(urlUpdateIRSourceOptions);
		var urlFilterCPSourceOptions = urlFilterFixedSourceOptions.concat(urlUpdateCPSourceOptions);
		var urlFilterPRSourceOptions = urlFilterFixedSourceOptions.concat(urlUpdatePRSourceOptions);
		
		var urlUpdateTypeOptions = [{
									"label" : "HomeUrl",
									"value" : "HomeUrl"
								}, {
									"label" : "IRUrl",
									"value" : "IRUrl"
								}, {
									"label" : "CPUrl",
									"value" : "CompanyPresentationUrl"
								}, {
									"label" : "PRUrl",
									"value" : "PressReleaseUrl"
								}
							  ];
		
		var TickerCikInfoService = {
				urlFilterFixedSourceOptions : urlFilterFixedSourceOptions,
				urlFilterFixedStatusOptions : urlFilterFixedStatusOptions,
				urlFilterFixedCuratorOptions : urlFilterFixedCuratorOptions,
				companyUrlsFilterOptions : companyUrlsFilterOptions,
				urlFilterStatusOptions : urlFilterStatusOptions,
				urlFilterCuratorOptions : urlFilterCuratorOptions,
				urlFilterHomeSourceOptions : urlFilterHomeSourceOptions,
				urlFilterIRSourceOptions : urlFilterIRSourceOptions,
				urlFilterCPSourceOptions : urlFilterCPSourceOptions,
				urlFilterPRSourceOptions : urlFilterPRSourceOptions,
				getAllUrlSourcesList : getAllUrlSourcesList,
				getUrlSourceList : getUrlSourceList,
				getAllTickerCikInfo : getAllTickerCikInfo,
				urlUpdateTypeOptions : urlUpdateTypeOptions,
				UrlUpdateSourceOptions : UrlUpdateSourceOptions,
				urlUpdateStatusOptions : urlUpdateStatusOptions,
				updateCompanyUrl : updateCompanyUrl,
				removeCompanyUrl : removeCompanyUrl,
				detailsLables : detailsLables
		};
		
		return TickerCikInfoService;
		
		function getAllUrlSourcesList() {
			return httpService.httpGet("importSECFiling/getAllUrlSource");
		}
		
		function getUrlSourceList(postdata) {
			return httpService.httpPost("importSECFiling/getUrlSource",postdata);
		}
		
		function getAllTickerCikInfo(query) {
			return httpService.httpPost("importSECFiling/searchSECCikData",query);
		}
		
		function updateCompanyUrl(postdata) {
			return httpService.httpPost("importSECFiling/updateCompanyUrl",postdata);
		}
		
		function removeCompanyUrl(postdata) {
			return httpService.httpPost("importSECFiling/removeCompanyUrl",postdata);
		}
	}
	
})();