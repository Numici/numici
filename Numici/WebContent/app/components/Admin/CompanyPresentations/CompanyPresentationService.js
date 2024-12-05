;(function(){
	'use strict';
	angular.module("vdvcApp").factory("CompanyPresentationService",CompanyPresentationService);
	
	CompanyPresentationService.$inject = ['httpService'];
	
	function CompanyPresentationService(httpService){
		var headers = {
				"date":{
					"label": "Date",
					"class":"col-xs-1",
					"type": "Date"
				},
				"ticker":{
					"label": "Ticker",
					"class":"col-xs-1",
					"type": "Text"
				},
				"docName":{
					"label": "Name",
					"class":"col-xs-2",
					"type": "Text"
				},
				"companyName":{
					"label": "Company Name",
					"class":"col-xs-2",
					"type": "Text"
				},
				"url":{
					"label": "URL",
					"class":"col-xs-4",
					"type": "Link"
				},
				"type":{
					"label": "Include?",
					"class":"col-xs-1",
					"type": "Select"
				},
				"attributes":{
					"label": "Attributes",
					"class":"col-xs-1",
					"type": "Pop",
					"config" :{
						"templateUrl": "app/components/Admin/CompanyPresentations/CPAttributesPopOver.html",
						"trigger": "none",
						"appendToBody": false
					}
				}
		};
		
		var prsntTypes_U = ["yes","no","maybe","unclassified"];
		var prsntTypes = ["yes","no","maybe"];
		var filters = {
				"query" : "",
				"tickers": [ ],
				"sort": {"date" : false},
				"markedByCurator": false,
				"typeYes": false,
				"typeNo": false,
				"typeMaybe":  false,
				"typeUnclassified":  false,
				"pageSize": 50,
				"pageNo": 0
		};
		
		var rulesPageConfig = {
				"pageSize": 50,
				"pageNo": 1
		};
		
		var docTypes = [
			{
				"label": "Company Documents",
				"value": "Company Document"
			},{
				"label": "Transcript",
				"value": "Transcript"
			}
		];
		
		var subTypes = [
			{
				"label": "Presentation",
				"value": "Presentation"
			},{
				"label": "Press Release",
				"value": "Press Release"
			},{
				"label": "Other",
				"value": "Other"
			}
		];
		
		var ruleAttr = [
		    "Anchors",
		    "Application",
		    "Author",
		    "CIK",
		    "CompanyName",
		    "DocName",
		    "IRURL",
		    "Keywords",
		   " PDFDate",
		   " Page1",
		    "Page2",
		   " PageOrientation",
		    "Producer",
		    "Ticker",
		    "Title",
		    "body"
		    ];
		
		var attrDateFields = [
			'DocNameDate',
			'PDFCreatedDate',
			'PDFModifiedDate',
			'PDFTextDate',
			'PDFCustomDate',
			'PDFTextDate2',
			'CreatedDate',
			'TitleDate'
			];
		
		var ruleConditions = ["contains","not contains"];
		var ruleJoins =  ["OR","AND"];
		var service = {
				headers : headers,
				prsntTypes_U : prsntTypes_U,
				prsntTypes : prsntTypes,
				filters : filters,
				rulesPageConfig : rulesPageConfig,
				CPDocTypes : docTypes,
				CPDocSubTypes : subTypes,
				getCompanyPresentations : getCompanyPresentations,
				getCPByKeyword : getCPByKeyword,
				markCompanyPresentation : markCompanyPresentation,
				getAllRules : getAllRules,
				getRule : getRule,
				saveRule : saveRule,
				deleteRule : deleteRule,
				ruleToquery : ruleToquery,
				applyRule : applyRule,
				ruleAttr : ruleAttr,
				attrDateFields : attrDateFields,
				ruleConditions : ruleConditions,
				ruleJoins : ruleJoins,
				
				getRuleEngineStatus : getRuleEngineStatus,
				getRulesByOrder : getRulesByOrder,
				setRulesOrder : setRulesOrder,
				applySelectedRules : applySelectedRules,
				
				getDocTypes : getDocTypes,
				getDocSubTypes : getDocSubTypes,
				
				isRuleEngineRunning : isRuleEngineRunning,
				markRuleStatusReviewed : markRuleStatusReviewed,
				markUnclassify : markUnclassify
		};
		
		return service;
		
		function getCompanyPresentations(postdata) {
			return httpService.httpPost("presentations/list",postdata);
		}
		
		function getCPByKeyword(postdata) {
			return httpService.httpPost("presentations/search",postdata);
		}
		
		function markCompanyPresentation(postdata) {
			return httpService.httpPost("presentations/mark",postdata);
		}
		
		function getAllRules() {
			return httpService.httpGet("presentations/allrules");
		}
		
		function getRule(id) {
			return httpService.httpGet("presentations/getrule/"+id);
		}
		
		function saveRule(postdata) {
			return httpService.httpPost("presentations/saverule",postdata);
		}
		
		function deleteRule(id) {
			return httpService.httpDelete("presentations/deleterule/"+id,{});
		}
		
		function ruleToquery(postdata) {
			return httpService.httpPost("presentations/rule2query",postdata);
		}
		
		function applyRule(postdata) {
			return httpService.httpPost("presentations/preview",postdata);
		}
		
		function getRuleEngineStatus(id) {
			return httpService.httpGet("presentations/ruleenginestatus");
		}
		
		function getRulesByOrder(id) {
			return httpService.httpGet("presentations/orderedrules");
		}
		
		function setRulesOrder(postdata) {
			return httpService.httpPost("presentations/setruleorder",postdata);
		}
		
		function applySelectedRules(postdata) {
			// { docStates: [ "yes",...], ruleIds:[ "id1", "id2"....]}
			return httpService.httpPost("presentations/applyrules",postdata);
		}		
		
		function getDocTypes() {
			return httpService.httpGet("presentations/doctypes");
		}
		
		function getDocSubTypes() {
			return httpService.httpGet("presentations/subtypes");
		}
		
		function isRuleEngineRunning(data) {
			if(!_.isEmpty(data)) {
				if(data.status === "pending" || data.status === "running") {
					return true;
				} else {
					return false;
				}
			} else {
				return false;
			}
		}
		
		function markRuleStatusReviewed() {
			return httpService.httpPost("presentations/reviewed",{});
		}
		
		function markUnclassify() {
			return httpService.httpPost("presentations/reset",{});
		}
		
	}
	
})();