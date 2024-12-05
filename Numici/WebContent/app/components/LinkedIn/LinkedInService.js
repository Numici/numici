;(function() {
	'use strict';
	angular.module("vdvcApp").factory("LinkedInService",LinkedInService);
	LinkedInService.$inject = ['$state','$http','$window','$location','httpService','appData','localStorageService'];
	
	function LinkedInService($state,$http,$window,$location,httpService,appData,localStorageService) {
		
		var postsHeaders = [
							{
								"key" : "articleId",
								"type" : "text",
								"label" : "Article Id",
								"class" : "col-xs-1",
								"show" : true,
								"order" : 7,
							},
							{
								"key" : "shareUrl",
								"type" : "text",
								"label" : "Url",
								"class" : "col-xs-2",
								"show" : true,
								"order" : 6,
							},
							{
                     			"key" : "shareCommentary",
                     			"type" : "text",
                     			"label" : "Share Commentary",
                     			"class" : "col-xs-3",
                     			"show" : true,
                     			"order" : 4,
                     		},
                     		{
								"key" : "title",
								"type" : "text",
								"label" : "Title",
								"class" : "col-xs-2",
								"show" : true,
								"order" : 3,
							},
                     		{
								"key" : "visibilityOption",
								"type" : "date",
								"label" : "Visibility Option",
								"class" : "col-xs-2",
								"show" : true,
								"order" : 2,
							},
							{
                     			"key" : "createdOn",
                     			"type" : "date",
                     			"label" : "Posted On",
                     			"class" : "col-xs-1",
                     			"show" : true,
                     			"order" : 1,
                     		}
                     ];
		
		var LinkedInService = {
				autherize : autherize,
				reAutherize : reAutherize,
				getConfig: getConfig,
				getLinkedInPostsForUser: getLinkedInPostsForUser,
				postsHeaders: postsHeaders,
				revokeAuthPerms: revokeAuthPerms
		};
		
		return LinkedInService;
		
		function autherize(cb) {
			var appdata = appData.getAppData();
			if(appdata["linkedInAuthUrl"]) {
				//$window.location.href = appdata["linkedInAuthUrl"];
				if($state.current.name == "sharelinks") {
					$window.open(appdata["linkedInAuthUrl"], '_blank');
				} else {
					$window.location.href = appdata["linkedInAuthUrl"];
				}
				if(typeof cb == "function") {
					cb();
				}
			}
		}
		
		function reAutherize(reAutherizeUrl,cb) {
			if($state.current.name == "sharelinks") {
				$window.open(reAutherizeUrl, '_blank');
			} else {
				$window.location.href = reAutherizeUrl;
			}
			if(typeof cb == "function") {
				cb();
			}
		}
		
		function getConfig() {
			return httpService.httpGet("linkedin/config");
		}
		
		function revokeAuthPerms() {
			return httpService.httpPost("linkedin/revoke",{});
		}
		
		function getLinkedInPostsForUser(postdata) {
			return httpService.httpGet("linkedin/getLinkedInPostsForUser");
		}
	}
})();