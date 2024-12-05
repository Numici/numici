;(function(){
	'use strict';
	
	angular.module("vdvcApp").factory("AdvSearchService",AdvSearchService);
	
	AdvSearchService.$inject = ['httpService'];
	
	function AdvSearchService(httpService) {
		var AdvSearchService = {};
		
		
		AdvSearchService.tsInfoList = {};
		AdvSearchService.fileIconMap = {
				"doc" :"fa fa-file-word-o",
				"docx" :"fa fa-file-word-o",
				"pdf" :"fa fa-file-pdf-o",
				"xls" :"fa fa-file-excel-o",
				"xlsx" :"fa fa-file-excel-o",
				"pptx" :"fa fa-file-powerpoint-o",
				"ppt" :"fa fa-file-powerpoint-o",
				"jpeg" :"fa fa-file-image-o",
				"jpg" :"fa fa-file-image-o",
				"png" :"fa fa-file-image-o",
				"gif" :"fa fa-file-image-o",
				"xml" : "fa fa-file-code-o",
				"txt" : "fa fa-file-text-o",
				"zip" : "fa  fa-file-zip-o",
				"rar" : "fa  fa-file-zip-o"
				
		};
		
		AdvSearchService.getFileIcon = function(name){
			var fileType = name.split('.').pop();
			var fileIcon = DocFactory.fileIconMap[fileType];
			if (!fileIcon) {
				fileIcon = DocFactory.fileIconMap['txt'];
			}
			return fileIcon;
		};
		
		
		
		
		AdvSearchService.getEntities = function(query) {
			return httpService.httpPost("search/text",query);
		};
		
		AdvSearchService.saveSearchCriteria = function(criteria) {
			return httpService.httpPost("search/save",criteria);
		};
		
		AdvSearchService.getSavedSercheCriteria = function() {
			return httpService.httpGet("search/list");
		};
		
		AdvSearchService.getSavedSearchCriteriaById = function(postdata) {
			return httpService.httpPost("search/saved/getById",postdata);
		};
		
		AdvSearchService.getAllSystemSerches = function() {
			return httpService.httpGet("search/system/list");
		};
		
		AdvSearchService.getAllSearchGroups = function() {
			return httpService.httpGet("search/system/groups");
		};
		
		AdvSearchService.isSearchPresentByName = function(postdata) {
			return httpService.httpPost("search/unique",postdata);
		};
		
		AdvSearchService.deleteSavedSeach = function(searchId) {
			return httpService.httpDelete("search/delete/"+searchId);
		};
		
		AdvSearchService.renameSavedSearch = function(searchId,postdata) {
			return httpService.httpPost("search/rename/"+searchId,postdata);
		};
		
		AdvSearchService.updateSavedSearch = function(postdata) {
			return httpService.httpPost("search/edit", postdata);
		};
		
		AdvSearchService.getSaveSearchesWithActionsByTaskspaceId = function(postdata) {
			return httpService.httpPost("search/savesearch/actions/taskspace/getById", postdata);
		};
		
		AdvSearchService.docTypes = {
					"Documents" : [/*{
						"type": "All_Docs",
						"lable": "All",
						"group": "Document",
						"isHeader" : true,
						"show": true,
						"disable": false
					},*/{
						"type": "VidiViciNotes",
						"lable": "My Notes",
						"order": 1,
						"group": "Document",
						"checked": true,
						"show": true,
						"disable": false
					},/*{
						"type": "News",
						"lable": "News",
						"order": 3,
						"group": "Document",
						"checked": true,
						"show": true,
						"disable": false
					},*/{
						"type": "CompanyDoc",
						"lable": "Company Documents",
						"order": 2,
						"group": "Document",
						"subGroup" : "CompanyDoc",
						"hasSubType": true,
						"isHeader" : true,
						"checked": true,
						"show": true,
						"disable": false
					},{
						"type": "Presentation",
						"lable": "Presentations",
						"order": 3,
						"group": "Document",
						"subGroup" : "CompanyDoc",
						"isSubType": true,
						"checked": true,
						"show": true,
						"disable": false
					},{
						"type": "Press Release",
						"lable": "Press Releases",
						"order": 4,
						"group": "Document",
						"subGroup" : "CompanyDoc",
						"isSubType": true,
						"checked": true,
						"show": true,
						"disable": false
					},{
						"type": "Other",
						"lable": "Other",
						"order": 5,
						"group": "Document",
						"subGroup" : "CompanyDoc",
						"isSubType": true,
						"checked": true,
						"show": true,
						"disable": false
					},{
						"type": "Sell-SideReport",
						"lable": "Sell-Side Reports",
						"order": 6,
						"group": "Document",
						"checked": true,
						"show": true,
						"disable": false
					},{
						"type": "Transcript",
						"lable": "Transcripts",
						"order": 7,
						"group": "Document",
						"checked": true,
						"show": true,
						"disable": false
					},{
						"type": "WebClip",
						"lable": "Web Clip",
						"order": 8,
						"group": "Document",
						"checked": true,
						"show": true,
						"disable": false
					},{
						"type": "WebResource",
						"lable": "Web Resource",
						"order": 9,
						"group": "Document",
						"checked": true,
						"show": true,
						"disable": false
					},{
						"type": "EMail",
						"lable": "E-Mail",
						"order": 10,
						"group": "Document",
						"checked": true,
						"show": true,
						"disable": false
					},{
						"type": "OtherDoc",
						"lable": "Other Documents",
						"order": 11,
						"group": "Document",
						"checked": true,
						"show": true,
						"disable": false
					},{
						"type": "All_SEC",
						"lable": "SEC Filings",
						"order": 1,
						"group": "SECFile",
						"hasSubType": true,
						"isHeader" : true,
						"checked": true,
						"show": true,
						"disable": false
					},{
						"type": "Annual-Quarterly",
						"lable": "Annual & Quarterly",
						"order": 2,
						"group": "SECFile",
						"isSubType": true,
						"checked": true,
						"show": true,
						"disable": false
					},{
						"type": "Proxy",
						"lable": "Proxy Filings",
						"order": 4,
						"group": "SECFile",
						"isSubType": true,
						"checked": true,
						"show": true,
						"disable": false
					},{
						"type": "Ownerships",
						"lable": "Ownerships",
						"order": 3,
						"group": "SECFile",
						"isSubType": true,
						"checked": true,
						"show": true,
						"disable": false
					},{
						"type": "Registration",
						"lable": "Registration",
						"order": 5,
						"group": "SECFile",
						"isSubType": true,
						"checked": true,
						"show": true,
						"disable": false
					},{
						"type": "Other",
						"lable": "Other Filings",
						"order": 6,
						"group": "SECFile",
						"isSubType": true,
						"checked": true,
						"show": true,
						"disable": false
					}],
					"ownerShip":[{
						"type": "isGlobal",
						"lable": "Global",
						"order": 1,
						"group": "ownerShip",
						"checked": true,
						"show": true,
						"disable": false
					},{
						"type": "sharedWithMe",
						"lable": "Shared By Others",
						"order": 3,
						"group": "ownerShip",
						"checked": true,
						"show": true,
						"disable": false
					},{
						"type": "myDocuments",
						"lable": "My Docs",
						"order": 2,
						"group": "ownerShip",
						"checked": true,
						"show": true,
						"disable": false
					}],
					"optional":[{
						"type": "annotatedDocs",
						"lable": "Show Annotated Documents Only",
						"order": 1,
						"group": "optional",
						"show": true,
						"disable": false
					},{
						"type": "searchInAnnotation",
						"lable": "Search In Annotations Only",
						"order": 2,
						"group": "optional",
						"checked": true,
						"show": true,
						"disable": false
					}],
					'selectAllDocs': true
			
			};
		 
		AdvSearchService.ModifiedDtModel = {
					"datePublished":{
						"fromDate" : null,
						"toDate": null,
						"timeframe" : null
					}
		};
		
		AdvSearchService.SearchQuery = {
				    "searchString" : "",
				    "userId":'',
				    "enterprises" : [],
				    "entityTypes":[],
				    "advancedInputs" : {
				    	"multiTags" :[],
						"subtypes": {},
						'documentName': null,
						"documentType":[],
						'dates' :[],
						'tickers' : [],
						'isGlobal': false,
						'myDocuments':false,
						'sharedWithMe':false,
						'annotatedDocs':false,
						'searchInAnnotation':false,
						'sort' : {}
						
				    },
				    'pageSize':50,
					'pageNumber':1
			};
		
	    return AdvSearchService;
	}

})();