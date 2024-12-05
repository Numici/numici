;(function(){
	'use strict';
	angular.module("vdvcApp").factory("SlackSearchService",SlackSearchService );
	
	SlackSearchService.$inject = ['httpService'];
	
	function SlackSearchService(httpService) {
		var docTypeMapping = [{
			    "key" : "notes",
			    "value" : "VidiViciNotes"
		 	},
		 	{
			    "key" : "mynotes",
			    "value" : "VidiViciNotes"
		 	},
		 	{
			    "key" : "companydoc",
			    "value" : "CompanyDoc"
		 	},
		 	{
			    "key" : "reports",
			    "value" : "Sell-SideReport"
		 	},
		 	{
			    "key" : "sellsidereports",
			    "value" : "Sell-SideReport"
		 	},
		 	{
			    "key" : "sell-side-reports",
			    "value" : "Sell-SideReport"
		 	},
		 	{
			    "key" : "transcripts",
			    "value" : "Transcript"
		 	},
		 	{
			    "key" : "webclip",
			    "value" : "WebClip"
		 	},
		 	{
		 		"key" : "webresource",
		 		"value" : "WebResource"
		 	},
		 	{
		 		"key" : "email",
		 		"value" : "EMail"
		 	},
		 	{
		 		"key" : "otherdoc",
		 		"value" : "OtherDoc"
		 	},
		 	{
		 		"key" : "sec",
		 		"value" : "All_SEC"
		 	}
		];
	
		var subTypeMapping = [{
			    "type" : "CompanyDocSubTypeMapping",
			    "key" : "presentation",
			    "value" : "Presentation"
			},
			{
			    "type" : "CompanyDocSubTypeMapping",
			    "key" : "pressrelease",
			    "value" : "Press Release"
			},
			{
			    "type" : "CompanyDocSubTypeMapping",
			    "key" : "other",
			    "value" : "Other"
			},
			{
			    "type" : "SECSubTypeMapping",
			    "key" : "10k",
			    "value" : "Annual-Quarterly"
			},
			{
			    "type" : "SECSubTypeMapping",
			    "key" : "10-k",
			    "value" : "Annual-Quarterly"
			},
			{
			    "type" : "SECSubTypeMapping",
			    "key" : "10K/a",
			    "value" : "Annual-Quarterly"
			},
			{
			    "type" : "SECSubTypeMapping",
			    "key" : "10-k/a",
			    "value" : "Annual-Quarterly"
			},
			{
			    "type" : "SECSubTypeMapping",
			    "key" : "10kt",
			    "value" : "Annual-Quarterly"
			},
			{
			    "type" : "SECSubTypeMapping",
			    "key" : "10-kt",
			    "value" : "Annual-Quarterly"
			},
			{
			    "type" : "SECSubTypeMapping",
			    "key" : "10kt/a",
			    "value" : "Annual-Quarterly"
			},
			{
			    "type" : "SECSubTypeMapping",
			    "key" : "10-kt/a",
			    "value" : "Annual-Quarterly"
			},
			{
			    "type" : "SECSubTypeMapping",
			    "key" : "10q",
			    "value" : "Annual-Quarterly"
			},
			{
			    "type" : "SECSubTypeMapping",
			    "key" : "10-q",
			    "value" : "Annual-Quarterly"
			},
			{
			    "type" : "SECSubTypeMapping",
			    "key" : "10q/a",
			    "value" : "Annual-Quarterly"
			},
			{
			    "type" : "SECSubTypeMapping",
			    "key" : "10-q/a",
			    "value" : "Annual-Quarterly"
			},
			{
			    "type" : "SECSubTypeMapping",
			    "key" : "10qt",
			    "value" : "Annual-Quarterly"
			},
			{
			    "type" : "SECSubTypeMapping",
			    "key" : "10-qt",
			    "value" : "Annual-Quarterly"
			},
			{
			    "type" : "SECSubTypeMapping",
			    "key" : "10qt/a",
			    "value" : "Annual-Quarterly"
			},
			{
			    "type" : "SECSubTypeMapping",
			    "key" : "10-qt/a",
			    "value" : "Annual-Quarterly"
			},
			{
			    "type" : "SECSubTypeMapping",
			    "key" : "8k",
			    "value" : "Annual-Quarterly"
			},
			{
			    "type" : "SECSubTypeMapping",
			    "key" : "8-k",
			    "value" : "Annual-Quarterly"
			},
			{
			    "type" : "SECSubTypeMapping",
			    "key" : "8k/a",
			    "value" : "Annual-Quarterly"
			},
			{
			    "type" : "SECSubTypeMapping",
			    "key" : "8-k/a",
			    "value" : "Annual-Quarterly"
			},
			{
			    "type" : "SECSubTypeMapping",
			    "key" : "20f",
			    "value" : "Annual-Quarterly"
			},
			{
			    "type" : "SECSubTypeMapping",
			    "key" : "20-f",
			    "value" : "Annual-Quarterly"
			},
			{
			    "type" : "SECSubTypeMapping",
			    "key" : "20f/a",
			    "value" : "Annual-Quarterly"
			},
			{
			    "type" : "SECSubTypeMapping",
			    "key" : "20-f/a",
			    "value" : "Annual-Quarterly"
			}
		];
	
		var SlackSearchService = {
				searchInfo : {},
				docTypeMapping : docTypeMapping,
				subTypeMapping : subTypeMapping
		};
				
		return SlackSearchService;
	}
	
})();

