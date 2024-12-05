;(function() {
	
	angular.module("vdvcApp").factory("SlackService",SlackService);
	
	SlackService.$inject = ['httpService','$http',"appData","_","$window",'urlParser','$location','localStorageService','commonService'];
	
	function SlackService(httpService,$http,appData,_,$window,urlParser,$location,localStorageService,commonService) {
		var dmconfigObj = [
			{
				"label" : "File added",
				"field" : "fileAdded"
			},
			{
				"label" : "Folder added",
				"field" : "folderAdded"
			},
			{
				"label" : "File Moved",
				"field" : "fileMoved"
			},
			{
				"label" : "Folder moved",
				"field" : "folderMoved"
			},
			{
				"label" : "Comment",
				"field" : "comment"
			},
			{
				"label" : "Show messages as threads",
				"field" : "docThreads"
			},
			{
				"label" : "Share",
				"field" : "share"
			},
			{
				"label" : "Saved Search",
				"field" : "savedSearch"
			},
			{
				"label" : "Other",
				"field" : "other"
			}
		];
		
		var channelConfigHeaders = [
	 		                  {
	 		                	  "label":"CHANNEL",
	 		                	  "value":"channelName",
	 		                	  "DValue":"channelName",
	 		                	  "checked" : true,
	 		                	  "type" : "text",
	 		                	  "class" : "col-sm-3"
	 		                  },{
	 		                	  "label":"TASKSPACE",
	 		                	  "value":"taskspaceName",
	 		                	  "DValue":"taskspaceName",
	 		                	  "checked" : true,
	 		                	  "type" : "text",
	 		                	  "class" : "col-sm-4"
	 		                  },{
	 		                	  "label":"OWNER",
	 		                	  "value":"taskspaceOwner",
	 		                	  "DValue":"taskspaceOwner",
	 		                	  "checked" : true,
	 		                	  "type" : "text",
	 		                	  "class" : "col-sm-3"
	 		                  }
	 		            ];
		
		var connectToTSHeaders = [
			 		                  {
			 		                	  "label":"CHANNEL",
			 		                	  "value":"channelName",
			 		                	  "DValue":"channelName",
			 		                	  "checked" : true,
			 		                	  "type" : "text",
			 		                	  "class" : "col-sm-3"
			 		                  },{
			 		                	  "label":"TASKSPACE",
			 		                	  "value":"taskspaceName",
			 		                	  "DValue":"taskspaceName",
			 		                	  "checked" : true,
			 		                	  "type" : "text",
			 		                	  "class" : "col-sm-4"
			 		                  }
			 		            ];
		
		var tsconfigObj = [
			{
				"label" : "Document added to taskspace",
				"field" : "documentAdded"
			},
			{
				"label" : "Document removed from taskspace",
				"field" : "documentRemoved"
			},
			{
				"label" : "User added to taskspace",
				"field" : "userAdded"
			},
			{
				"label" : "User removed from taskspace",
				"field" : "userRemoved"
			},
			{
				"label" : "Comment added to document in taskspace",
				"field" : "documentCommented"
			},
			{
				"label" : "Show messages as threads",
				"field" : "docThreads"
			},
			{
				"label" : "Taskspace deleted",
				"field" : "taskspaceDeleted"
			},
			{
				"label" : "Post reply also to channel",
				"field" : "replyBroadcast"
			},
			{
				"label" : "Post conversations to Slack automatically",
				"field" : "autoPostAnns"
			}
		];
		
		
		var SlackService = {
				channelConfigHeaders : channelConfigHeaders,
				connectToTSHeaders : connectToTSHeaders,
				getSlackOauthUrl: getSlackOauthUrl,
				getstep2OAuthUrl : getstep2OAuthUrl,
				getUserSlackWorkSpaces: getUserSlackWorkSpaces,
				getSlakUserWorkSpaceChannels: getSlakUserWorkSpaceChannels,
				shareArticleOnSlack  : shareArticleOnSlack ,
				getSlakConfig : getSlakConfig,
				configureSlackWithTS : configureSlackWithTS,
				createAndConnectWithTS : createAndConnectWithTS,
				saveSlackTSConfig : saveSlackTSConfig,
				deleteSlackTSConfig : deleteSlackTSConfig,
				saveSlackDMConfig : saveSlackDMConfig,
				deleteSlackTeam : deleteSlackTeam,
				getDmConfigView : getDmConfigView,
				getTsConfigView : getTsConfigView,
				TSConfig : TSConfig,
				DMConfig : DMConfig,
				getAuthData : getAuthData,
				createNumiciUser : createNumiciUser,
				connectToNumiciUser : connectToNumiciUser,
				clearAuthData : clearAuthData,
				userConfig : userConfig,
				loginAuthedUser : loginAuthedUser,
				installUrl : installUrl,
				getErrorText : getErrorText,
				extensionOAuthRequest: extensionOAuthRequest
		};
		
		
		return SlackService;
		
		function getSlackOauthUrl() {
			return httpService.httpGet("slack/authUrl");
		}
		
		function getstep2OAuthUrl() {
			return httpService.httpGet("slack/step2AuthUrl");
		}
		
		function getUserSlackWorkSpaces() {
			return httpService.httpGet("slack/workspaces");
		}
		
		function getSlakUserWorkSpaceChannels(teamId) {
			return httpService.httpGet("slack/userChannels/"+teamId);
		}
		
		function shareArticleOnSlack (postData) {
			return httpService.httpPost("slack/postArticle",postData);
		}
		
		function getSlakConfig(teamId) {
			return httpService.httpGet("slack/config/"+teamId);
		}
		
		function configureSlackWithTS(teamId,slackConfig) {
			return httpService.httpPost("slack/connect/tschannel/"+teamId,slackConfig);
		}
		
		function createAndConnectWithTS(teamId,slackConfigsInfo) {
			return httpService.httpPost("slack/createts/connectchannel/"+teamId,slackConfigsInfo);
		}
		
		function saveSlackTSConfig(teamId,tsConfig) {
			return httpService.httpPost("slack/save/tsconfig/"+teamId,tsConfig);
		}
		
		function deleteSlackTSConfig(teamId,tsId,channelId) {
			return httpService.httpDelete("/slack/removeSlackTaskspaceConfig/"+teamId+"/"+tsId+"/"+channelId);
		}
		
		function saveSlackDMConfig(teamId,dmConfig) {
			return httpService.httpPost("slack/save/dmconfig/"+teamId,dmConfig);
		}
		
		function deleteSlackTeam(teamId) {
			return httpService.httpDelete("/slack/removeUserSlackConfig/"+teamId);
		}
		
		function setdmconfigObjvalues(config,settings) {
			if(config.children) {
				for(var i=0;i<config.children.length;i++) {
					setdmconfigObjvalues(config.children[i],settings);
				}
				
				var obj = _.findWhere(config.children,{checked : false});
				if(obj) {
					config.checked = false;
				} else {
					config.checked = true;
				}
				
			} else {
				config.checked = settings[config.field];
			}
		}
		
		function getDmConfigView(settings) {
			return angular.copy(dmconfigObj);
		}
		
		function getTsConfigView() {
			return angular.copy(tsconfigObj);
		}
		
		function TSConfig(options) {
			this.taskspaceId = options.taskspaceId;
			this.channelId = options.channelId;
			this.documentAdded = options.documentAdded;
			this.documentRemoved = options.documentRemoved;
			this.userAdded = options.userAdded;
			this.userRemoved = options.userRemoved;
			this.documentCommented = options.documentCommented;
			this.taskspaceDeleted = options.taskspaceDeleted;
		}
		
		function DMConfig(options) {
			this.fileAdded = options.fileAdded;
			this.folderAdded = options.folderAdded;
			this.fileMoved = options.fileMoved;
			this.folderMoved = options.folderMoved;
			this.comment = options.comment;
			this.share = options.share;
			this.savedSearch = options.savedSearch;
			this.other = options.other;
		}
		
		function getAuthData() {
			return httpService.httpGet("slack/getauthdata");
		}
		
		function createNumiciUser(postdata) {
			return httpService.httpPost("slack/createnumiciuser",postdata);
		}
		
		function connectToNumiciUser(postdata) {
			return httpService.httpPost("slack/connectuser",postdata);
		}
		
		function clearAuthData(postdata) {
			return httpService.httpPost("slack/clearauthdata",postdata);
		}
		
		function userConfig(postdata) {
			return httpService.httpPost("slack/userconfig",postdata);
		}
		
		function loginAuthedUser(postdata) {
			return httpService.httpPost("slack/loginautheduser",postdata);
		}
		
		function installUrl(postdata) {
			return httpService.httpGet("slack/installUrl");
		}
		
		function getErrorText(code) {
			return httpService.httpGet("slack/errortext/?code="+code);
		}
		
		function extensionOAuthRequest() {
			$window.location.href = commonService.getContext()+"webMessageOauth/authorize";
		}
		
	}

})();