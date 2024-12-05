;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('PostToSocialMediaController',PostToSocialMediaController);
	
	PostToSocialMediaController.$inject = ['$scope','$confirm','$window','$timeout','$uibModalInstance','appData','DigestLinkinfo','objInfo','shareCommentaryText','AnnotationDigestService','APIUserMessages','VDVCConfirmService','socialMediaAuthInfo','SlackService','NotionService','notionUserObjsTree','MessageService','OneDriveService','LinkedInService','WebexService','webexUserRoomsData'];
	
	function PostToSocialMediaController($scope,$confirm,$window,$timeout,$uibModalInstance,appData,DigestLinkinfo,objInfo,shareCommentaryText,AnnotationDigestService,APIUserMessages,VDVCConfirmService,socialMediaAuthInfo,SlackService,NotionService,notionUserObjsTree,MessageService,OneDriveService,LinkedInService,WebexService,webexUserRoomsData) {
		var ptsmc = this;
		
		// Instance variables
		var digestSettings = {};
		var appdata = appData.getAppData();
		if(!_.isEmpty(DigestLinkinfo.properties)) {
			digestSettings = angular.copy(DigestLinkinfo.properties.digestSettings);
		} else if(!_.isEmpty(DigestLinkinfo.linkObj.properties)) {
			digestSettings = angular.copy(DigestLinkinfo.linkObj.properties.digestSettings);
		}
		ptsmc.DigestInfo = {"title" : digestSettings.digestName,"shareCommentary" : !_.isEmpty(shareCommentaryText.text) ? shareCommentaryText.text : digestSettings.digestDescription,"annotatedImgUrl" : !_.isEmpty(shareCommentaryText.annotatedImgUrl) ? shareCommentaryText.annotatedImgUrl : "","annotationSubType" : !_.isEmpty(shareCommentaryText.annotationSubType) ? shareCommentaryText.annotationSubType : ""};
		
		ptsmc.articleId;
		ptsmc.focusLink = false;
		ptsmc.visibilityOptionList = angular.copy(AnnotationDigestService.getVisibilityOptions());
		ptsmc.visibilityOption = ptsmc.visibilityOptionList[0];
		ptsmc.postToSlackOptionList = angular.copy(AnnotationDigestService.getPostToSlackOptions());
		ptsmc.postToSlackOption = ptsmc.postToSlackOptionList[0];
		ptsmc.slackUserWorkspacesList = [];
		ptsmc.slackUserWorkspaces;
		ptsmc.slackUserWorkspaceChannelsList = [];
		ptsmc.slackUserWorkspaceChannels = [];
		ptsmc.teamsUserTeamsList = [];
		ptsmc.teamsUserTeams;
		ptsmc.teamsUserTeamChannelsList = [];
		ptsmc.teamsUserTeamChannels = [];
		ptsmc.authEnabled = socialMediaAuthInfo.authEnabled;
		ptsmc.mediaChannel = socialMediaAuthInfo.mediaChannel;
		if(ptsmc.mediaChannel == "Notion"){
			ptsmc.notionUserObjsTreeList = notionUserObjsTree;
			ptsmc.notionUserObjTree = ptsmc.notionUserObjsTreeList[0];
		}
		if(ptsmc.mediaChannel == "Webex"){
			ptsmc.postToWebexOptionList = angular.copy(AnnotationDigestService.getPostToWebexOptions());
			ptsmc.postToWebexOption = ptsmc.postToWebexOptionList[1];
			ptsmc.webexUserRoomsData = webexUserRoomsData;
			ptsmc.webexUserRoomsList = [];
			ptsmc.webexUserRooms = [];
			getWebexUserRoomsList();
		}
		ptsmc.openAsJSPopup = false;
		var NumiciMktMsgTxt;
		var ShareCommentaryMaxTextLenLocal = 1250;
		var ShareCommentaryMaxTextLen;
		if(ptsmc.mediaChannel == "LinkedIn" || ptsmc.mediaChannel == "Teams"){
			if(!_.isEmpty(shareCommentaryText.annotatedImgUrl)) {
				var shareCommentaryTxt = "";
				if(!_.isEmpty(shareCommentaryText.text)) {
					shareCommentaryTxt = shareCommentaryText.text;
				} else {
					shareCommentaryTxt = digestSettings.digestDescription;
				}
				if(ptsmc.mediaChannel == "LinkedIn"){
					shareCommentaryTxt = shareCommentaryTxt+"\n\n"+DigestLinkinfo.url;
				}
				ptsmc.DigestInfo["shareCommentary"] = shareCommentaryTxt;
			}
			ShareCommentaryMaxTextLenLocal = 1250;
			ShareCommentaryMaxTextLen = _.findWhere(appdata.ShareLinkInfo,{"key":"LinkedInShareCommentaryMaxTextLen"});
			NumiciMktMsgTxt = _.findWhere(appdata.ShareLinkInfo,{"key":"NumiciMktMsgTxtForLinkedIn"});
		} else if (ptsmc.mediaChannel == "Twitter"){
			ShareCommentaryMaxTextLenLocal = 230;
			ShareCommentaryMaxTextLen = _.findWhere(appdata.ShareLinkInfo,{"key":"TwitterShareCommentaryMaxTextLen"});
			NumiciMktMsgTxt = _.findWhere(appdata.ShareLinkInfo,{"key":"NumiciMktMsgTxtForTwitter"});
		} else if (ptsmc.mediaChannel == "Facebook"){
			ShareCommentaryMaxTextLenLocal = 63000;
			ShareCommentaryMaxTextLen = _.findWhere(appdata.ShareLinkInfo,{"key":"FacebookShareCommentaryMaxTextLen"});
			NumiciMktMsgTxt = _.findWhere(appdata.ShareLinkInfo,{"key":"NumiciMktMsgTxtForFacebook"});
		} else if (ptsmc.mediaChannel == "WhatsApp"){
			ShareCommentaryMaxTextLenLocal = 64000;
			ShareCommentaryMaxTextLen = _.findWhere(appdata.ShareLinkInfo,{"key":"WhatsAppShareCommentaryMaxTextLen"});
			NumiciMktMsgTxt = _.findWhere(appdata.ShareLinkInfo,{"key":"NumiciMktMsgTxtForWhatsApp"});
		} else if (ptsmc.mediaChannel == "Slack"){
			ShareCommentaryMaxTextLenLocal = 64000;
			ShareCommentaryMaxTextLen = _.findWhere(appdata.ShareLinkInfo,{"key":"SlackShareCommentaryMaxTextLen"});
			NumiciMktMsgTxt = _.findWhere(appdata.ShareLinkInfo,{"key":"NumiciMktMsgTxtForSlack"});
		} else if (ptsmc.mediaChannel == "Teams"){
			ShareCommentaryMaxTextLenLocal = 12000;
			ShareCommentaryMaxTextLen = _.findWhere(appdata.ShareLinkInfo,{"key":"TeamsShareCommentaryMaxTextLen"});
			NumiciMktMsgTxt = _.findWhere(appdata.ShareLinkInfo,{"key":"NumiciMktMsgTxtForTeams"});
		} else if (ptsmc.mediaChannel == "Notion"){
			ShareCommentaryMaxTextLenLocal = 9999999999;
		} else if (ptsmc.mediaChannel == "Webex"){
			ShareCommentaryMaxTextLenLocal = 7000;
			ShareCommentaryMaxTextLen = _.findWhere(appdata.ShareLinkInfo,{"key":"WebexShareCommentaryMaxTextLen"});
			NumiciMktMsgTxt = _.findWhere(appdata.ShareLinkInfo,{"key":"NumiciMktMsgTxtForWebex"});
		}
		var slackUserWorkspaceChannelsData = {};
		ptsmc.shareCommentaryMaxTextLen = ShareCommentaryMaxTextLen && ShareCommentaryMaxTextLen.value ? ShareCommentaryMaxTextLen.value : ShareCommentaryMaxTextLenLocal;
		ptsmc.shareCommentaryTextRemaining = angular.copy(ptsmc.shareCommentaryMaxTextLen);
		ptsmc.shareCommentaryNumiciMktMsgTxt = "";
		ptsmc.shareCommentaryNumiciMktMsg = "";
		if(NumiciMktMsgTxt && !_.isEmpty(NumiciMktMsgTxt) && NumiciMktMsgTxt.value && !_.isEmpty(NumiciMktMsgTxt.value)){
			ptsmc.shareCommentaryNumiciMktMsgTxt = "\n\n\u2014\n"+NumiciMktMsgTxt.value;
			ptsmc.shareCommentaryNumiciMktMsg = "\u2014<br>"+NumiciMktMsgTxt.value;
		} else {
			ptsmc.shareCommentaryNumiciMktMsgTxt = "\n\n\u2014\nPost created using www.numici.com";
			ptsmc.shareCommentaryNumiciMktMsg = "\u2014<br>Post created using www.numici.com";
		}
		
		// Methods
		ptsmc.checkShareCommentaryCharLimit = checkShareCommentaryCharLimit;
		ptsmc.postSocialMediaArticle = postSocialMediaArticle;
		ptsmc.getSlackUserWorkSpaceChannels = getSlackUserWorkSpaceChannels;
		ptsmc.getSlackUserPostToChannelsList = getSlackUserPostToChannelsList;
		ptsmc.getTeamsUserTeamChannels = getTeamsUserTeamChannels;
		ptsmc.getWebexUserRoomsList = getWebexUserRoomsList;
		ptsmc.close = close;
		ptsmc.cancel = cancel;
		
		function checkShareCommentaryCharLimit(event) {
			$timeout(function() {
				if(ptsmc.DigestInfo.shareCommentary != null && ptsmc.DigestInfo.shareCommentary != undefined) {
					ptsmc.shareCommentaryTextRemaining = ptsmc.shareCommentaryMaxTextLen - ptsmc.DigestInfo.shareCommentary.length;
				}
			}, 0);
		}
		
		function openJSPopupWindow(mediaChannel,locationUrl) {
		    var width  = 550;
		    var height = 475;
		    var left   = $window.screen.width / 2 - width / 2;
		    var top    = $window.screen.height /2 - height / 2;
		    var JSPopupWindowSettings = "width="+width+",height="+height+",left="+left+",top="+top;
		    var newWindow = $window.open('about:blank', "Share On "+mediaChannel, JSPopupWindowSettings);
		    newWindow.location = locationUrl;
		}
		
		function getSlackUserWorkSpaceChannels() {
			if(!_.isEmpty(ptsmc.slackUserWorkspaces)){
				SlackService.getSlakUserWorkSpaceChannels(ptsmc.slackUserWorkspaces.key).then(function(resp) {
					 if(resp && resp.status == 200 && resp.data && resp.data.Status) {
						if(resp.data.HasSlackAuth) {
							slackUserWorkspaceChannelsData = resp.data.Data;
							getSlackUserPostToChannelsList();
						}
					 }
				});
			}
		}
		
		function getSlackUserPostToChannelsList() {
			if(!_.isEmpty(ptsmc.postToSlackOption)){
				if(!_.isEmpty(slackUserWorkspaceChannelsData)){
					if(ptsmc.postToSlackOption.value ==  "Channel"){
						ptsmc.slackUserWorkspaceChannelsList = slackUserWorkspaceChannelsData.userSlackChannels;
					} else if(ptsmc.postToSlackOption.value ==  "DMToUsers"){
						ptsmc.slackUserWorkspaceChannelsList = slackUserWorkspaceChannelsData.userSlackDMChannels;
					} else if(ptsmc.postToSlackOption.value ==  "DMToGroups"){
						ptsmc.slackUserWorkspaceChannelsList = slackUserWorkspaceChannelsData.userSlackMPIMChannels;
					} else if(ptsmc.postToSlackOption.value ==  "SlackUser"){
						ptsmc.slackUserWorkspaceChannelsList = slackUserWorkspaceChannelsData.slackUsersChanList;
					}
					ptsmc.slackUserWorkspaceChannels = [];
				}
			}
		}
		
		function getSlackUserWorkspaces() {
			SlackService.getUserSlackWorkSpaces().then(function(resp) {
				 if(resp && resp.status == 200 && resp.data && resp.data.Status) {
					if(resp.data.HasSlackAuth) {
						var slackUserWorkspacesKeyValueList = resp.data.Data;
						if(!_.isEmpty(slackUserWorkspacesKeyValueList)){
							for(var firstObjectKey in slackUserWorkspacesKeyValueList){
								var firstObjectValue = slackUserWorkspacesKeyValueList[firstObjectKey];
								var object = {key : firstObjectKey, value : firstObjectValue};
								ptsmc.slackUserWorkspacesList.push(object) 
							};
							if(!_.isEmpty(resp.data.userLastUsedSlackWorkspace)){
								ptsmc.slackUserWorkspaces = resp.data.userLastUsedSlackWorkspace;
							} else {
								ptsmc.slackUserWorkspaces = !_.isEmpty(ptsmc.slackUserWorkspacesList) ? ptsmc.slackUserWorkspacesList[0] : {};
							}
							getSlackUserWorkSpaceChannels();
						}
					}
				 }
			});
		}
		
		function getTeamsUserTeams() {
			OneDriveService.getUserTeams().then(function(resp) {
				 if(resp && resp.status == 200 && resp.data && resp.data.Status) {
					if(resp.data.HasTeamsAuth) {
						var userTeamsData = resp.data.Data;
						if(!_.isEmpty(userTeamsData)){
							ptsmc.teamsUserTeamsList = userTeamsData;
							if(!_.isEmpty(resp.data.userLastUsedTeamsTeam)){
								ptsmc.teamsUserTeams = resp.data.userLastUsedTeamsTeam;
							} else {
								ptsmc.teamsUserTeams = !_.isEmpty(ptsmc.teamsUserTeamsList) ? ptsmc.teamsUserTeamsList[0] : {};
							}
							getTeamsUserTeamChannels();
						}
					}
				 }
			});
		}
		
		function getTeamsUserTeamChannels() {
			if(!_.isEmpty(ptsmc.teamsUserTeams)){
				ptsmc.teamsUserTeamChannelsList = [];
				OneDriveService.getTeamsUserChannels(ptsmc.teamsUserTeams.id).then(function(resp) {
					 if(resp && resp.status == 200 && resp.data && resp.data.Status) {
						if(resp.data.HasTeamsAuth) {
							var userTeamChannelsData = resp.data.Data;
							if(!_.isEmpty(userTeamChannelsData)){
								ptsmc.teamsUserTeamChannelsList = userTeamChannelsData;
								ptsmc.teamsUserTeamChannels = [];
							}
						}
					 }
				});
			}
		}
		
		function getWebexUserRoomsList() {
			if(!_.isEmpty(ptsmc.postToWebexOption)){
				if(!_.isEmpty(webexUserRoomsData)){
					if(ptsmc.postToWebexOption.value == "DMToUsers"){
						ptsmc.webexUserRoomsList = webexUserRoomsData.userWebexDirectUsers;
					} else if(ptsmc.postToWebexOption.value == "Spaces"){
						ptsmc.webexUserRoomsList = webexUserRoomsData.userWebexSpaces;
					}
					ptsmc.webexUserRooms = [];
				}
			}
		}
		
		function postSocialMediaArticle() {
			if(!ptsmc.authEnabled){
				if(ptsmc.mediaChannel == "LinkedIn" || ptsmc.mediaChannel == "Facebook"){
					postArticleOnSocialMediaUrlWithConfMsg(false, ptsmc.mediaChannel);	
				} else if(ptsmc.mediaChannel == "Twitter"){
					var shareCommentaryTxt = ptsmc.DigestInfo.shareCommentary + ptsmc.shareCommentaryNumiciMktMsgTxt;
					var url = "https://twitter.com/intent/tweet?url="+encodeURIComponent(DigestLinkinfo.url) + "&text=" + encodeURIComponent(shareCommentaryTxt);
					if(ptsmc.openAsJSPopup){
						openJSPopupWindow(ptsmc.mediaChannel,url);
					} else {
						$window.open(url, '_blank');
					}
					$uibModalInstance.close();
				} else if(ptsmc.mediaChannel == "WhatsApp"){
					var shareCommentaryTxt = ptsmc.DigestInfo.shareCommentary + ptsmc.shareCommentaryNumiciMktMsgTxt + "\n\n" +DigestLinkinfo.url;
					var url = "https://api.whatsapp.com/send?text="+ encodeURIComponent(shareCommentaryTxt);
					if(ptsmc.openAsJSPopup){
						openJSPopupWindow(ptsmc.mediaChannel,url);
					} else {
						$window.open(url, '_blank');
					}
					$uibModalInstance.close();
				}
			} else {
				if(ptsmc.mediaChannel == "LinkedIn"){
					if((ptsmc.visibilityOption && ptsmc.visibilityOption.value == "CONTAINER") || !ptsmc.authEnabled) {
						postArticleOnSocialMediaUrlWithConfMsg(true, ptsmc.mediaChannel);
					} else {
						postArticleOnLinkedIn();
					}	
				} else if(ptsmc.mediaChannel == "Notion"){
					postArticleOnNotion();
				} else if(ptsmc.mediaChannel == "Slack"){
					postArticleOnSlack();
				} else if(ptsmc.mediaChannel == "Teams"){
					postArticleOnTeams();
				} else if(ptsmc.mediaChannel == "Webex"){
					postArticleOnWebex();
				}
			}
		}
		
		function postArticleOnSocialMediaUrlWithConfMsg(authEnabledForUser, mediaChannel) {
			var confirmationMsgText; 
			if(authEnabledForUser){
				if(mediaChannel == "LinkedIn"){
					var confirmationMsgTextLocal = "<p>Numici cannot post to groups or private messages directly.</p>\
						<ul style='list-style: disc;padding-left: 40px;'>\
							<li>Click on 'Go to LinkedIn'</li>\
							<ul style='list-style: circle;padding-left: 40px;'>\
								<li>Numici will copy share content to the clipboard</li>\
								<li>Numici will take you to share content page on LinkedIn</li>\
								<li>Select Share in a Post or Send as Private Message</li>\
								<li>Copy content from clipboard</li>\
								<li>Select how you want to share the post in the dropdown</li>\
								<li>Click on Post</li>\
							</ul>\
						</ul>";
					var linkedInAuthEnabledForUsrConfMsgText = _.findWhere(appdata.ShareLinkInfo,{"key":"linkedInAuthEnabledForUsrConfMsgText"});
					confirmationMsgText = linkedInAuthEnabledForUsrConfMsgText && linkedInAuthEnabledForUsrConfMsgText.value ? linkedInAuthEnabledForUsrConfMsgText.value : confirmationMsgTextLocal;
				}
			} else {
				var authNotEnabledForUsrConfMsgText;
				var confirmationMsgTextLocal = "";
				if(mediaChannel == "LinkedIn"){
					confirmationMsgTextLocal = "<p>Click on 'Go to LinkedIn'</p>\
						<ul style='list-style: disc;padding-left: 40px;'>\
							<li>Numici will copy share content to the clipboard</li>\
							<li>Numici will take you to share content page on LinkedIn</li>\
							<li>Select Share in a Post or Send as Private Message</li>\
							<li>Copy content from clipboard</li>\
							<li>Select how you want to share the post in the dropdown</li>\
							<li>Click on Post</li>\
						</ul>";
					authNotEnabledForUsrConfMsgText = _.findWhere(appdata.ShareLinkInfo,{"key":"linkedInAuthNotEnabledForUsrConfMsgText"});
				} else if(mediaChannel == "Facebook"){
					confirmationMsgTextLocal = "<p>Click on 'Go to Facebook'</p>\
						<ul style='list-style: disc;padding-left: 40px;'>\
							<li>Numici will copy share content to the clipboard</li>\
							<li>Numici will take you to 'Share on Facebook' page</li>\
							<li>Paste content from clipboard in text area</li>\
							<li>Select how you want to share the post in the dropdown</li>\
							<li>Click on 'Post on Facebook'</li>\
						</ul>";
					authNotEnabledForUsrConfMsgText = _.findWhere(appdata.ShareLinkInfo,{"key":"FacebookAuthNotEnabledForUsrConfMsgText"});
				}
				confirmationMsgText = authNotEnabledForUsrConfMsgText && authNotEnabledForUsrConfMsgText.value ? authNotEnabledForUsrConfMsgText.value : confirmationMsgTextLocal;
			}
			
    		var VDVCConfirmModalInstance;
    		VDVCConfirmModalInstance = VDVCConfirmService.open({text : confirmationMsgText,title : "Post message on "+mediaChannel,actionButtonText : "Go To "+mediaChannel,closeButtonText : "CANCEL"});
    		VDVCConfirmModalInstance.result.then(function() {
	            var copyText = ptsmc.DigestInfo.shareCommentary + ptsmc.shareCommentaryNumiciMktMsgTxt;
	            var dummy = $('<textarea>').val(copyText).appendTo('body').select()
	            document.execCommand("copy");
	            $(dummy).remove();
	            if(mediaChannel == "LinkedIn"){
	            	var url = "https://www.linkedin.com/sharing/share-offsite/?url="+encodeURIComponent(DigestLinkinfo.url);
					if(ptsmc.openAsJSPopup){
						openJSPopupWindow(ptsmc.mediaChannel,url);
					} else {
						$window.open(url, '_blank');
					}
				} else if(mediaChannel == "Facebook"){
	            	var url = "https://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent(DigestLinkinfo.url);
					if(ptsmc.openAsJSPopup){
						openJSPopupWindow(ptsmc.mediaChannel,url);
					} else {
						$window.open(url, '_blank');
					}
				}
	            $uibModalInstance.close();
	        }, function() {
    			
    		});
		}
		
		function confirmAndReAuthToLinkedIn(respData) {
			var confirmationMsgText = respData.message;
			var title = "";
			var actionButtonText = "";
			var closeButtonText = "";
			if(respData.linkedInAuthExpired) {
				title = "Confirm LinkedIn Re-Authorization";
				actionButtonText = "RE-AUTHORIZE";
				closeButtonText = "RE-AUTHORIZE LATER";
			} else if(respData.linkedInAuthRevokedByUser) {
				title = "Confirm LinkedIn Authorization";
				actionButtonText = "AUTHORIZE";
				closeButtonText = "AUTHORIZE LATER"
			}
			var VDVCConfirmModalInstance = VDVCConfirmService.open({text : confirmationMsgText,title : title,actionButtonText : actionButtonText,closeButtonText : closeButtonText});
    		VDVCConfirmModalInstance.result.then(function() {
    			if(respData.linkedInAuthExpired) {
    				LinkedInService.reAutherize(respData.linkedInReAuthUrl);
    			} else if(respData.linkedInAuthRevokedByUser) {
    				LinkedInService.autherize();
    			}
    		},function() {
    			
    		});
		}
		
		function postArticleOnLinkedIn() {
			var postdata = {};
			postdata.title = ptsmc.DigestInfo.title;
			postdata.shareCommentary = ptsmc.DigestInfo.shareCommentary + ptsmc.shareCommentaryNumiciMktMsgTxt;
			postdata.shareUrl = DigestLinkinfo.url;
			postdata.visibilityOption = ptsmc.visibilityOption ? ptsmc.visibilityOption.value : null;
			var object = "";
			var fromSource = "";
			if(!_.isEmpty(objInfo)){
				if(!_.isEmpty(objInfo.object)){
					object = objInfo.object;
				}
				if(!_.isEmpty(objInfo.fromSource)){
					fromSource = objInfo.fromSource;
				}
			}
			postdata.object = object;
			postdata.fromSource = fromSource;
			if(!_.isEmpty(ptsmc.DigestInfo.annotatedImgUrl)) {
				postdata.annotatedImgUrl = ptsmc.DigestInfo.annotatedImgUrl;
			}
			if(!_.isEmpty(ptsmc.DigestInfo.annotationSubType)) {
				postdata.annotationSubType = ptsmc.DigestInfo.annotationSubType;
			}
			AnnotationDigestService.shareArticleOnLinkedIn(postdata).then(function(resp) {
				 if(resp.status == 200 && resp.data.Status && !resp.data.linkedInAuthExpired && !resp.data.linkedInAuthRevokedByUser) {
					 ptsmc.article = resp.data.article;
					 ptsmc.message = resp.data.message;
					 ptsmc.focusLink = true;
				 } else if(resp.data.linkedInAuthExpired || resp.data.linkedInAuthRevokedByUser) {
					 confirmAndReAuthToLinkedIn(resp.data);
				 }
			});
		}
		
		function postArticleOnNotion() {
			var postdata = {};
			postdata.name = ptsmc.DigestInfo.title;
			postdata.link = DigestLinkinfo.url;
			postdata.panetObject = ptsmc.notionUserObjTree ? ptsmc.notionUserObjTree.object : null;
			postdata.iconUrl = "https://app.numici.com/app/assets/icons/Numici_logo-N-in_Blue.jpg";
			postdata.panetId = ptsmc.notionUserObjTree ? ptsmc.notionUserObjTree.id : null;
			var object = "";
			var fromSource = "";
			if(!_.isEmpty(objInfo)){
				if(!_.isEmpty(objInfo.object)){
					object = objInfo.object;
				}
				if(!_.isEmpty(objInfo.fromSource)){
					fromSource = objInfo.fromSource;
				}
			}
			postdata.object = object;
			postdata.fromSource = fromSource;
			NotionService.shareEmbedLink(postdata).then(function(resp) {
				 if(resp.status == 200 && resp.data.Status && resp.data.NotionStatus) {
					 ptsmc.article = resp.data.NotionPage;
					 ptsmc.message = "Page with EmbedLink created in Notion";
					 ptsmc.focusLink = true;
				 }
			});
		}
		
		function postArticleOnSlack() {
			var postdata = {};
			postdata.teamId = ptsmc.slackUserWorkspaces.key;
			postdata.slackUserWorkspaceInfo = ptsmc.slackUserWorkspaces
			postdata.postTo = ptsmc.postToSlackOption.value;
			postdata.toChannels = ptsmc.slackUserWorkspaceChannels;
			if(ptsmc.postToSlackOption.value ==  'SlackUser'){
				postdata.postAsGroup = ptsmc.postAsGroup;
			}
			postdata.title = ptsmc.DigestInfo.title;
			postdata.shareCommentary = ptsmc.DigestInfo.shareCommentary + ptsmc.shareCommentaryNumiciMktMsgTxt;
			postdata.shareUrl = DigestLinkinfo.url;
			var object = "";
			var fromSource = "";
			if(!_.isEmpty(objInfo)){
				if(!_.isEmpty(objInfo.object)){
					object = objInfo.object;
				}
				if(!_.isEmpty(objInfo.fromSource)){
					fromSource = objInfo.fromSource;
				}
			}
			postdata.object = object;
			postdata.fromSource = fromSource;
			SlackService.shareArticleOnSlack(postdata).then(function(resp) {
				 if(resp.status == 200 && resp.data.Status) {
					 MessageService.showSuccessMessage("SLACK_POST_ARTICLE");
					 $uibModalInstance.close();
				 }
			});
		}
		
		function postArticleOnTeams() {
			var postdata = {};
			postdata.teamId = ptsmc.teamsUserTeams.id;
			postdata.teamsUserTeamInfo = ptsmc.teamsUserTeams
			postdata.toChannels = ptsmc.teamsUserTeamChannels;
			postdata.title = ptsmc.DigestInfo.title;
			postdata.shareCommentary = ptsmc.DigestInfo.shareCommentary + ptsmc.shareCommentaryNumiciMktMsgTxt;
			postdata.shareUrl = DigestLinkinfo.url;
			var object = "";
			var fromSource = "";
			if(!_.isEmpty(objInfo)){
				if(!_.isEmpty(objInfo.object)){
					object = objInfo.object;
				}
				if(!_.isEmpty(objInfo.fromSource)){
					fromSource = objInfo.fromSource;
				}
			}
			postdata.object = object;
			postdata.fromSource = fromSource;
			if(!_.isEmpty(ptsmc.DigestInfo.annotatedImgUrl)) {
				postdata.annotatedImgUrl = ptsmc.DigestInfo.annotatedImgUrl;
			}
			if(!_.isEmpty(ptsmc.DigestInfo.annotationSubType)) {
				postdata.annotationSubType = ptsmc.DigestInfo.annotationSubType;
			}
			OneDriveService.shareArticleOnTeams(postdata).then(function(resp) {
				 if(resp.status == 200 && resp.data.Status) {
					 MessageService.showSuccessMessage("TEAMS_POST_ARTICLE");
					 $uibModalInstance.close();
				 }
			});
		}
		
		function postArticleOnWebex() {
			var postdata = {};
			
			postdata.roomId = ptsmc.webexUserRooms.id;
			postdata.roomType = ptsmc.webexUserRooms.type;
			postdata.title = ptsmc.DigestInfo.title;
			postdata.shareCommentary = ptsmc.DigestInfo.shareCommentary;
			postdata.numiciMktMsgTxt = ptsmc.shareCommentaryNumiciMktMsgTxt;
			postdata.shareUrl = DigestLinkinfo.url;
			var object = "";
			var fromSource = "";
			if(!_.isEmpty(objInfo)){
				if(!_.isEmpty(objInfo.object)){
					object = objInfo.object;
				}
				if(!_.isEmpty(objInfo.fromSource)){
					fromSource = objInfo.fromSource;
				}
			}
			postdata.object = object;
			postdata.fromSource = fromSource;
			if(!_.isEmpty(ptsmc.DigestInfo.annotatedImgUrl)) {
				postdata.annotatedImgUrl = ptsmc.DigestInfo.annotatedImgUrl;
			}
			if(!_.isEmpty(ptsmc.DigestInfo.annotationSubType)) {
				postdata.annotationSubType = ptsmc.DigestInfo.annotationSubType;
			}
			WebexService.shareArticleOnWebex(postdata).then(function(resp) {
				 if(resp.status == 200 && resp.data.Status) {
					 MessageService.showSuccessMessage("WEBEX_POST_ARTICLE");
					 $uibModalInstance.close();
				 }
			});
		}
		
		function close() {
			$uibModalInstance.close();
		}
		
		function cancel() {
			$uibModalInstance.dismiss("cancel");
		}
		
		function init() {
			if(ptsmc.mediaChannel != "Notion"){
				checkShareCommentaryCharLimit();
			}
			
			if(ptsmc.mediaChannel == "Slack"){
				getSlackUserWorkspaces();
			}
			if(ptsmc.mediaChannel == "Teams"){
				getTeamsUserTeams();
			}
		}
		
		init();
		
	}
})();