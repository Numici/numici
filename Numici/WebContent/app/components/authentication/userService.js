;(function() {
	
	angular.module("vdvcApp").factory("userService",userService);
	
	userService.$inject = ["httpService","$q","$rootScope","appData","_","SessionService","$document","$window","$timeout","$state","LocalStorageService","$deviceInfo","localStorage"];
	
	function userService(httpService,$q,$rootScope,appData,_,SessionService,$document,$window,$timeout,$state,LocalStorageService,$deviceInfo,localStorage) {
		var stateTimer;
		
		$rootScope.userChanged = false;
		$rootScope.reload = false;
		var isEditorCssLoaded = false;
		var defaultStateValues ={
				docsview : "List",
				foldersort :  {field:"name",decending:false},
				docsort :  {field:"doc.displayName",decending:false},
				taskspaceview : "List",
				taskspacesort :  {field:"name",decending:false},
				portfoliosview : "List",
				portfoliosort :  {field:"name",decending:false},
		};
		var routeMap = {
				"navigation_Dashboard" : "#/dashboard",
				"navigation_Taskspace" : "taskspace.list",
				"navigation_Digest" : "taskspace.list",
				"navigation_ActionItems" : "actionitems",
				"additionalNavigation_DeleteMe" : "deleteme",
				"navigation_Research" : "docs",
				"navigation_Portfolios" : "portfolios",
				"navigation_Search" : "search",
				"navigation_Inbox" : "inbox",
				"researchView_TrashFolder" : "trash",
				"additionalNavigation_Notion" : "notion",
				"additionalNavigation_Slack" : "slack",
				"additionalNavigation_Webex" : "webex",
				"additionalNavigation_Asana" : "manageAsana",
				"additionalNavigation_ManageNotifications" : "managenotifications",
				"additionalNavigation_UserPreferences" : "userPreferences"
			};
		var userSettingsLabels = {
				"additionalNavigation_TimeLog": "Time Log",
			    "additionalNavigation_OneDrive": "Microsoft Office 365",
			    "additionalNavigation_Box": "Box",
			    "additionalNavigation_DeleteMe": "Delete My Account",
			    "additionalNavigation_DropBox": "DropBox",
			    "additionalNavigation_LinkedIn": "LinkedIn",
			    "additionalNavigation_Slack": "Slack",
			    "additionalNavigation_Asana": "Asana",
			    "additionalNavigation_Evernote": "Evernote",
			    "additionalNavigation_Google": "Gmail",
			    "additionalNavigation_Notion": "Notion",
			    "additionalNavigation_Webex": "Webex",
			    "additionalNavigation_ManageNotifications" : "Manage Notifications",
			    "additionalNavigation_UserPreferences" : "User Preferences",
			    "researchView_AddDocument": "NEW DOCUMENT",
			    "researchView_AddNote": "NEW NOTE",
			    "researchView_AddFolder": "NEW FOLDER",
			    "researchView_AddLinkFolder": "LINK FOLDER",
			    "researchView_Upload": "UPLOAD FILES",
			    "researchView_OpenSEC": "SEC FILING",
			    "researchView_SwitchCardListView": "SWITCH VIEW",
			    "researchView_TrashFolder": "TRASH",
			    "docView_AdvanceToolBar": "ADVANCED TOOLBAR",
			    "taskspaceView_NewTaskspace": "NEW TASKSPACE",
			    "taskspaceView_NewSection": "NEW SECTION",
			    "navigation_Dashboard": "DASHBOARD",
			    "navigation_Taskspace": "TASKSPACE",
			    "navigation_Digest": "LIVE DIGEST",
			    "navigation_ActionItems" : "ACTION ITEMS",
			    "navigation_Inbox" : "INBOX",
			    "navigation_Research": "FILES",
			    "navigation_Notification": "NOTIFICATIONS",
			    "navigation_Search": "SEARCH",
			    "navigation_AppMenu": "ADDITIONAL MENU",
			    "navigation_Portfolios": "PORTFOLIOS",
			    "navigation_Help": "HELP",
			    "uploadDocOptions_ClientSystem": "My Computer",
			    "uploadDocOptions_Evernote": "Evernote",
			    "uploadDocOptions_DropBox": "DropBox",
			    "uploadDocOptions_GoogleDrive": "Google Drive"
			  };
		var userSettingsRoutes = {
				"dashboard" : "navigation_Dashboard",
				"administration" : "navigation_Administration",
				"taskspace" : "navigation_Taskspace",
				"digest" : "navigation_Digest",
				"actionitems" : "navigation_ActionItems",
				"inbox" : "navigation_Inbox",
				"deleteme" : "additionalNavigation_DeleteMe",
				"docs" : "navigation_Research",
				"docview" : "navigation_Research",
				"trash" : "navigation_Research",
				"portfolios" : "navigation_Portfolios",
				"search" : "navigation_Search",
				"slack" : "additionalNavigation_Slack",
				"manageAsana" : "additionalNavigation_Asana",
				"manageslack" : "additionalNavigation_Slack",
				"managenotifications" : "additionalNavigation_ManageNotifications",
				"userPreferences" : "additionalNavigation_UserPreferences",
				"CP" : "additionalNavigation_CP",
				"preferences" : "additionalNavigation_SysPreferences",
				"appsettings" : "additionalNavigation_AppSettings",
				"tci" : "additionalNavigation_TCI",
				"synchelp" : "additionalNavigation_SyncHelp"
			  };
		
		var editUserNameHeader = "Edit User Name";
		var user = {
				editUserNameHeader : editUserNameHeader,
				getUserlabel: getUserlabel,
				getSlackSignInUrl : getSlackSignInUrl,
				getGoogleSignInUrl : getGoogleSignInUrl,
				getSlackStep2SignInUrl : getSlackStep2SignInUrl,
				getUserInfo : getUserInfo,
				getLoginInfo : getLoginInfo,
				getAllUsers : getAllUsers,
				getAllUsersIncludeOtherOrgSharedUsers : getAllUsersIncludeOtherOrgSharedUsers,
				storeAppdata : storeAppdata,
				setUiState : setUiState,
				getUiState : getUiState,
				getUserStateForKey : getUserStateForKey,
				changePassword : changePassword,
				acceptTerms : acceptTerms,
				getUsedSpace : getUsedSpace,
				updateUserName : updateUserName,
				resolve : resolve,
				isSiteAdmin : isSiteAdmin,
				isAuthenticated : isAuthenticated,
				isNotSiteAdmin : isNotSiteAdmin,
				isNotOrgAdmin : isNotOrgAdmin,
				isTermsAccepted : isTermsAccepted,
				isPwdChanged : isPwdChanged,
				goToHomePage : goToHomePage,
				redirectPreviousState : redirectPreviousState,
				getUserSettingsKeyList : getUserSettingsKeyList,
				getUiSetting : getUiSetting,
				isActiveTab : isActiveTab,
				setDoNotShowHelpOnLogin : setDoNotShowHelpOnLogin,
				setDoNotShowWelcomePageOnMobile : setDoNotShowWelcomePageOnMobile,
				setDoNotShowExtensionMsg : setDoNotShowExtensionMsg,
				forgotPassword : forgotPassword,
				getByResetToken : getByResetToken,
				resetPassword : resetPassword,
				getUserRole : getUserRole,
				redirectToAccount : redirectToAccount,
				shareObjectListToGuestUser: shareObjectListToGuestUser,
				upgradeAccount : upgradeAccount,
				setDoNotShowTipsOnLogin : setDoNotShowTipsOnLogin,
				isDoNotShowGetExtensionPage : isDoNotShowGetExtensionPage,
				getOrgAdmin : getOrgAdmin
		};
		
		return user;
		
		function isSiteAdmin() {
			
			if(isAuthenticated() && !$rootScope.currentUser.isSiteAdmin) {
				return true;
			} else {
				return false;
			}
		}
		
		function redirectToAccount() {
			var canredirect = getUserRole() &&
							  getUserRole().toLowerCase() != "guest" &&
							  getUserRole().toLowerCase() != "provisional" &&
							  isAuthenticated() &&
							  (!isTermsAccepted() || !isPwdChanged());
			
			return canredirect;
		}
		
		function isAuthenticated() {
			
			if(!_.isEmpty($rootScope.currentUser)) {
				return true;
			} else {
				return false;
			}
		}
		
		function isNotSiteAdmin() {
			if(isAuthenticated() && !$rootScope.currentUser.isSiteAdmin) {
				return true;
			} else {
				return false;
			}
		}
		
		function isNotOrgAdmin() {
			if(isAuthenticated() && $rootScope.currentUser["UserRole"] !== 'OrgAdmin') {
				return true;
			} else {
				return false;
			}
		}

		function isTermsAccepted() {
			var flag = false;
			try{
				flag = $rootScope.currentUser["termsAccepted"];
			} catch(e) {
				flag = false;
			}
			return flag;
		}
		
		function getUserRole() {
			var appdata = appData.getAppData();
			var role = null;
			try{
				role = appdata["UserRole"];
			} catch(e) {
				role = null;
			}
			return role;
		}
		
		function isDoNotShowHelpOnLogin() {
			var flag = false;
			try{
				flag = $rootScope.currentUser["doNotShowHelpOnLogin"];
			} catch(e) {
				flag = false;
			}
			return flag;
		}
		
		function isDoNotShowWelcomePageOnMobile() {
			var flag = false;
			try{
				flag = $rootScope.currentUser["doNotShowWelcomePageOnMobile"];
			} catch(e) {
				flag = false;
			}
			return flag;
		}
		
		function isDoNotShowGetExtensionPage() {
			var flag = false;
			try{
				flag = $rootScope.currentUser["doNotShowExtensionMsg"];
			} catch(e) {
				flag = false;
			}
			return flag;
		}
		
		function goToHomePage() {
			if(isAuthenticated()) {
				var appdata = appData.getAppData();
				if(LocalStorageService.getLocalStorage(LocalStorageService.SLACK_AUTH)) {
					$state.go('addslack');
				} else if(!_.isEmpty(appdata)) {
					if(!$deviceInfo.isMobile && appdata.UserSettings["navigation_Taskspace"] == "Enabled") {
						$state.go('taskspace.list',{digest: false},{reload:true});
					} else if($deviceInfo.isMobile && !_.isEmpty($rootScope.currentUser["rootFolderId"])) {
						$state.go('docs',{"folderId" : $rootScope.currentUser["rootFolderId"]},{reload:($rootScope.userChanged || $rootScope.reload)});
					}
				} else if(!_.isEmpty($rootScope.currentUser["rootFolderId"])) {
					$state.go('docs',{"folderId" : $rootScope.currentUser["rootFolderId"]},{reload:($rootScope.userChanged || $rootScope.reload)});
				}
			}
		}
		
		function redirectPreviousState() {
			var appdata = appData.getAppData();
			var welcomePageSession = LocalStorageService.getLocalStorage(LocalStorageService.WELCOME_PAGE);
			if(!_.isEmpty(welcomePageSession)) {
				welcomePageSession = JSON.parse(welcomePageSession);
			}
			if( isAuthenticated()){
				if((redirectToAccount() || !isPwdChanged()) && $state.current.name != 'acount') {
					$state.go("acount",{},{reload:true});
				} else if(!$deviceInfo.isMobile && !isDoNotShowHelpOnLogin() && !_.isEmpty(welcomePageSession) && welcomePageSession.user == appdata["UserId"] && !welcomePageSession.close && $state.current.name != 'acount' && $state.current.name != 'welcome') {
					$state.go("welcome",{},{reload:true});
				} else if($deviceInfo.isMobile && !isDoNotShowWelcomePageOnMobile() && !_.isEmpty(welcomePageSession) && welcomePageSession.user == appdata["UserId"] && !welcomePageSession.close && $state.current.name != 'acount' && $state.current.name != 'welcome') {
					$state.go("welcome",{},{reload:true});
				} else if(!$deviceInfo.isMobile && !isDoNotShowGetExtensionPage() && $state.current.name != 'acount') {
					$state.go("acount",{},{reload:true});
				} else if($rootScope.previousState) {
					$state.go($rootScope.previousState,$rootScope.previousStateParams,{reload:($rootScope.userChanged || $rootScope.reload)});
					if($state.current.name != 'acount' && $state.current.name != 'welcome') {
						delete $rootScope.previousState;
						delete $rootScope.previousStateParams;
					}
				} else {
					if(!$deviceInfo.isMobile && 
							!_.isEmpty(appdata) && 
							appdata.UserSettings["navigation_Taskspace"] == "Enabled" && 
							$rootScope.currentUser["doNotShowTipsOnLogin"] == false) {
						LocalStorageService.setLocalStorage(LocalStorageService.SHOW_TOUR_TIP_ON_LOGIN,true);
					}
					goToHomePage();
				}
			}
		}
		
		function isPwdChanged() {
			var flag = false;
			try{
				flag = $rootScope.currentUser["pwdChanged"];
			} catch(e) {
				flag = false;
			}
			return flag;
		}
		
		function resolve() {
			
			var deferred = $q.defer();
			var unwatch = $rootScope.$watch('currentUser', function (currentUser) {
				if (currentUser) {
					 deferred.resolve(currentUser);
				 } else {
					 deferred.reject();
			         $state.go('login',{"fromCode":true});
				 }
				 unwatch(); 
			});
			return deferred.promise;
		}
		
		function getUserlabel(name) {
			var lbl = "";
			if(_.isString(name) && name.trim()) {
				var matches = name.match(/\b(\w)/g);
				lbl = matches.join('');
			}
			
			return lbl.toUpperCase();
		}
		
		function getSlackSignInUrl() {
			return httpService.httpGet("user/slackSignInUrl");
		}
		
		function getGoogleSignInUrl() {
			return httpService.httpGet("user/googleSignInUrl");
		}
		
		function getSlackStep2SignInUrl(webClient) {
			return httpService.httpGet("user/slackStep2SignInUrl?webClient="+webClient);
		}
		
	    function getUserInfo() {
	        return httpService.httpGet('user/current');
	    }
	    
	    function getLoginInfo() {
	        return httpService.httpGet('user/loginInfo');
	    }
	    
	    function getAllUsers() {
	        return httpService.httpGet('user/list');
	    }
	    
	    function getAllUsersIncludeOtherOrgSharedUsers () {
	    	return httpService.httpGet('user/listIncludeOtherOrgSharedUsers');
	    }
	    
	    var sessionTimer;
	    
	    function storeAppdata(result) {
	    	/*$timeout.cancel(sessionTimer);
	    	sessionTimer = $timeout(function(){
	    	
	    	},100);*/
	    	
	    	var appdata = appData.getAppData();
	    	if(!_.isEmpty(result)) {
	    		
	    		
	    		if(VERSION !== result.appversion) {
	    			$rootScope.reload = true;
	    			$window.location.reload();
	    		} 
    			
    			if(!_.isEmpty(appdata["UserId"]) && appdata["UserId"] !== result.UserId) {
	    			$rootScope.userChanged = true;
	    		} else {
	    			$rootScope.userChanged = false;
	    		}
    			
    			appdata["version"] = result.version;
    			appdata["Organization"] = result.Organization;
				appdata["OrganizationId"] = result.OrganizationId;
				appdata["IsSharedOrganization"] = result.IsSharedOrganization;
				appdata["UserId"] = result.UserId;
				
				localStorage.setItem(appData.storageKeyForApp(), result.UserId);
				
				appdata["FirstName"] = result.FirstName;
				appdata["LastName"] = result.LastName;
				appdata["UserName"] = result.UserName;
				appdata["UserRole"] = result.UserRole;
				appdata["termsAccepted"] = result.termsAccepted;
				appdata["localPassword"] = result.localPassword;
				appdata["pwdChanged"] = result.pwdChanged;
				appdata["doNotShowHelpOnLogin"] = result.isDoNotShowHelpOnLogin;
				appdata["doNotShowWelcomePageOnMobile"] = result.isDoNotShowWelcomePageOnMobile;
				appdata["doNotShowExtensionMsg"] = result.isDoNotShowExtensionMsg;
				if(!result.isDoNotShowExtensionMsg) {
					appdata["ExtensionMsg"] = result.ExtensionMsg;
				}
				appdata["doNotShowTipsOnLogin"] = result.isDoNotShowTipsOnLogin;
				
				appdata["isOrgAdmin"] = false;
				appdata["isSiteAdmin"] = false;
				appdata["isAuthUser"] = false;
				
				appdata["hasOneDriveAuth"] = result.HasOneDriveAuth;
				appdata["hasTeamsAuth"] = result.HasTeamsAuth;
				appdata["hasOneNoteAuth"] = result.HasOneNoteAuth;
				appdata["oneDriveConfig"] = result.OneDriveConfig;
				appdata["oneDriveAuthUrl"] = result.OneDriveAuthUrl;
				
				appdata["hasBoxAuth"] = result.HasBoxAuth;
				appdata["boxAuthUrl"] = result.Boxurl;
				appdata["dropboxAuthUrl"] = result.Dropboxurl;
				appdata["linkedInAuthUrl"] = result.LinkedInAuthUrl;
				appdata["hasLinkedInAuth"] = result.HasLinkedInAuth;
				appdata["notionAuthUrl"] = result.NotionInAuthUrl;
				appdata["hasNotionAuth"] = result.HasNotionAuth;
				appdata["webexAuthUrl"] = result.WebexAuthUrl;
				appdata["hasWebexAuth"] = result.HasWebexAuth;
				appdata["hasSlackAuth"] = result.HasSlackAuth;
				appdata["asanaAuthUrl"] = result.AsanaUrl;
				appdata["hasEmailSaveAsDraft"] = result.HasEmailSaveAsDraft;
				
				if(result.UserRole) {
					switch(result.UserRole) {
					case "OrgAdmin":
						appdata["isOrgAdmin"] = true;
						appdata["isAuthUser"] = true;
						break;
					case "VDVCSiteAdmin":
						appdata["isSiteAdmin"] = true;
						appdata["isAuthUser"] = true;
						break;
					case "User":
						appdata["isAuthUser"] = true;
						break;
					case "Guest":
						appdata["isAuthUser"] = true;
						appdata["isGuestUser"] = true;
						break;
					} 
				}
				
				appdata["UserLabel"] = getUserlabel(result.UserName);
				appdata["rootFolder"] = result.RootFolder;
				appdata["rootFolderId"] = result.RootFolder  ? result.RootFolder.id : null;
				
				appdata["TrashFolder"] = result.TrashFolder;
				appdata["TrashFolderId"] = result.TrashFolder  ? result.TrashFolder.id : null;
				
				var UserNotification = _.filter(result.UiConfig, function (order) {
	     		    return (order.type === 'UserNotification');
	     		});
	 			
	 			var notificationLimit = _.findWhere(UserNotification, {key: "NotificationLimit"});
	 			if(!_.isEmpty(notificationLimit)) {
	 				var t = parseInt(notificationLimit.value);
	 				appdata["NotificationLimit"] = isNaN(t) || (!isNaN(t) && t < 5) ? 5 : t;
	 			}
				
				appdata["UiUserState"] = result.UiUserState  ? result.UiUserState : [];			
				
				appdata["encodedUserId"] = encodeURIComponent(result.UserId);
				
				appdata["UserSettings"] = result.UserSettings;
	     		
	     		var VDVCHelpDesc = _.filter(result.UiConfig, function (order) {
	     		    return (order.type === 'VDVCHelpDesc');
	     		});
	     		appdata["VDVCHelpDesc"] = VDVCHelpDesc;
	     		
	     		var TaskspaceTipsWizard = _.filter(result.UiConfig, function (order) {
	     		    return (order.type === 'TaskspaceTipsWizard');
	     		});
	     		appdata["TaskspaceTipsWizard"] = TaskspaceTipsWizard;
	     		
	     		var VDVCColorCodes = _.filter(result.UiConfig, function (order) {
	     		    return (order.type === 'VDVCColorCode');
	     		});
	     		appdata["VDVCColorCodes"] = VDVCColorCodes;
	     		
	     		var HelpInfoMap = _.filter(result.UiConfig, function (order) {
	     		    return (order.type === 'HelpInfoMapping');
	     		});
	     		appdata["HelpInfoMap"] = HelpInfoMap;
	     		
	     		var HelpDisplay = _.filter(result.UiConfig, function (order) {
	     		    return (order.type === 'HelpDisplay');
	     		});
	     		appdata["HelpDisplay"] = HelpDisplay;
	     		
	     		var ShareLinkInfo = _.filter(result.UiConfig, function (order) {
	     		    return (order.type === 'ShareLinkInfo');
	     		});
	     		appdata["ShareLinkInfo"] = ShareLinkInfo;
	     		
	     		var antClrCde = _.findWhere(VDVCColorCodes, {key: "Annotation"});
	     		var pdfAntClrCde = _.findWhere(VDVCColorCodes, {key: "PdfAnnotation"});
	 			var antSlctClrCde = _.findWhere(VDVCColorCodes, {key: "AnnotationSelect"});
	 			var pdfAntSlctClrCde = _.findWhere(VDVCColorCodes, {key: "PdfAnnotationSelect"});
	 			var PdfAnnotationSelectBorder = _.findWhere(VDVCColorCodes, {key: "PdfAnnotationSelectBorder"});
	 			var snippetClrCde = _.findWhere(VDVCColorCodes, {key: "Snippet"});
	 			var snippetSlctClrCde = _.findWhere(VDVCColorCodes, {key: "SnippetSelect"});
	 			var toggleStripClrCde = _.findWhere(VDVCColorCodes, {key: "ToggleStrip"});
	 			

	 			appdata["antClrCde"] = antClrCde && antClrCde.value ? antClrCde.value : "rgba(255, 255, 0, 0.3);";
	 			appdata["pdfAntClrCde"] = pdfAntClrCde && pdfAntClrCde.value ? pdfAntClrCde.value : "rgba(255, 255, 0, 0.3);";
	 			appdata["antSlctClrCde"] = antSlctClrCde && antSlctClrCde.value ? antSlctClrCde.value : "rgba(255, 255, 0, 0.6);";
	 			appdata["pdfAntSlctClrCde"] = pdfAntSlctClrCde && pdfAntSlctClrCde.value ? pdfAntSlctClrCde.value : "rgba(255, 255, 0, 0.6);";
	 			appdata["PdfAnnotationSelectBorder"] = PdfAnnotationSelectBorder && PdfAnnotationSelectBorder.value ? PdfAnnotationSelectBorder.value : "rgba(255, 0, 0,1);";
	 			appdata["snippetClrCde"] = snippetClrCde && snippetClrCde.value ? snippetClrCde.value : "#cfe2f3";
	 			appdata["snippetSlctClrCde"] = snippetSlctClrCde && snippetSlctClrCde.value ? snippetSlctClrCde.value : "#cfe2f3";
	 			appdata["toggleStripClrCde"] = toggleStripClrCde && toggleStripClrCde.value ? toggleStripClrCde.value : "rgba(0, 102, 153, 1);";
	 			appdata["HelpInfo"] = result.HelpInfo;
	 			appdata["version"] = result.version;
	 			appdata["AutoSaveIdleFrequency"] = 5000;
	 			appdata["AutoSaveFrequency"] = 20000;
	 			appdata["sendAsUserEmailId"] = result.sendAsUserEmailId;
	 			
	 			var ObjLocking = _.filter(result.UiConfig, function (order) {
	     		    return (order.type === 'ObjLocking');
	     		});
	 			
	 			var GlobalSettings = _.filter(result.UiConfig, function (order) {
	     		    return (order.type === 'GlobalSettings');
	     		});
	 			appdata["GlobalSettings"] = GlobalSettings;
	 			
	 			var numiciImage = _.findWhere(GlobalSettings, {key: "NumiciImage"});
	 			var numiciLink = _.findWhere(GlobalSettings, {key: "NumiciLink"});
	 			var numiciHeaderTxt = _.findWhere(GlobalSettings, {key: "NumiciHeaderText"});
	 			var numiciFooterTxt = _.findWhere(GlobalSettings, {key: "NumiciFooterText"});
	 			appdata["numiciImage"] = numiciImage && numiciImage.value ? numiciImage.value : "https://app.numici.com/app/assets/icons/Numici_logo-N-in_Blue.jpg";
	 			appdata["numiciLink"] = numiciLink && numiciLink.value ? numiciLink.value : "https://www.numici.com";
	 			appdata["numiciHeaderTxt"] = numiciHeaderTxt && numiciHeaderTxt.value ? numiciHeaderTxt.value : "Powered by Numici";
	 			appdata["numiciFooterTxt"] = numiciFooterTxt && numiciFooterTxt.value ? numiciFooterTxt.value : "Workspace designed for Research";
	 			
	 			var autoSaveIdleFrequency = _.findWhere(ObjLocking, {key: "AutoSaveIdleFrequency"});
	 			var autoSaveFrequency = _.findWhere(ObjLocking, {key: "AutoSaveFrequency"});
	 			
	 			if(!_.isEmpty(autoSaveFrequency)) {
	 				var t = parseInt(autoSaveFrequency.value);
	 				appdata["AutoSaveFrequency"] = isNaN(t) ? 20000 : t;
	 			}
	 			
	 			
	 			if(!_.isEmpty(autoSaveIdleFrequency)) {
	 				var t = parseInt(autoSaveIdleFrequency.value);
	 				appdata["AutoSaveIdleFrequency"] = isNaN(t) ? 5000 : t;
	 			}
	 			
	 			var welcomePageSession = LocalStorageService.getLocalStorage(LocalStorageService.WELCOME_PAGE);
	 			if(_.isEmpty(welcomePageSession)) {
	 				welcomePageSession = {};
	 				welcomePageSession["user"] = appdata["UserId"];
	 				welcomePageSession["close"] = false;
	 				welcomePageSession = JSON.stringify(welcomePageSession);
					LocalStorageService.setLocalStorage(LocalStorageService.WELCOME_PAGE,welcomePageSession);
				}
	 			
	 			var getExtensionPageSession = LocalStorageService.getLocalStorage(LocalStorageService.EXTENSION_PAGE);
	 			if(_.isEmpty(getExtensionPageSession)) {
	 				getExtensionPageSession = {};
	 				getExtensionPageSession["user"] = appdata["UserId"];
	 				getExtensionPageSession["close"] = false;
	 				getExtensionPageSession = JSON.stringify(getExtensionPageSession);
					LocalStorageService.setLocalStorage(LocalStorageService.EXTENSION_PAGE,getExtensionPageSession);
				}
	 			
	 			$rootScope.currentUser = appdata;
	 			$rootScope.userinfo = appdata;
	 			SessionService.create(result.UserId,null);
	 			
	 			//temp code needs to update
	 			if(!isEditorCssLoaded) {
	 				CKEDITOR.addCss(
		 			        'body {' +
					            'word-wrap: break-word;'+
					            'padding-top: 10px;'+
					            'width: calc(100% - 67px);'+
					            'max-width: 210mm;'+
						    	'margin: 15px auto 15px auto;'+
						    	'padding: 5mm;'+
						    	'background: #fff;'+
						    	'min-height: 297mm;'+
						    	'box-shadow: rgb(170, 170, 170) 2px 2px 6px 3px;'+
					        '}'+'.cke_editable p {' +
			 			    	'line-height: 1.5;'+
			 			    	'-webkit-margin-before: 0;'+
			 			    	'-webkit-margin-after: 0;'+
			 			    '}'+'.note {' +
		 			            'background-color: '+appdata.antClrCde+';'+
		 			            'position:relative;'+
		 			        '}'+'body img {' +
		 			            'max-width: 100% !important;'+
		 			            'height:auto !important;'+
		 			        '}'+'.note.first.cmt:before {'+
		 			        	'position: absolute;top: -14px;'+
		 			        	'left: 0px;'+
		 			        	'width: 14px;'+
		 			        	'height: 14px;'+
		 			        	'text-align: center;'+
		 			        	'line-height: 14px;'+
		 			        	'pointer-events: none;'+
		 			        	'cursor: none !important;'+
		 			        	'content: "";'+
		 			        	'background: url(/app/assets/icons/bl-comment.png);'+
		 			        	'background-repeat: no-repeat;'+
		 			        	'background-size: contain;'+
		 			        '}'+'.note_slctd {'+
		 			        	'background-color:  '+appdata.antSlctClrCde+';'+
		 					'}'+'.note.first.cmt.note_slctd:before {'+
		 	 			        'background-color:  '+appdata.antSlctClrCde+';'+
		 	 	 			'}'+'.vdvc-notes-comments {\
		 						width:400px;\
		 						height:200px;\
		 						display:none;\
		 						background-color: #EFE9E9;position:absolute;\
		 						border-radius : 5px;\
		 						box-shadow : 0px 0px 5px 2px gray;\
		 						padding : 5px;\
		 					}'+'.highlighted.slct_snippet {\
		 						background: '+appdata.snippetSlctClrCde+' !important;'+
		 					'}'+'.highlighted {\
		 						background: '+appdata.snippetClrCde+';'+
		 					'}'+'.vdvc-link{\
		 						background: rgba(0,0,0,0.12);\
		 						position: relative;\
		 					}'+'a {\
								position: relative;\
							}\
							a .deep-link-from-info {\
							    width: 400px;\
							    background-color: #fff;\
							    color: #272727;\
							    text-align: left;\
		 						box-shadow: 0px 0px 5px 2px #999999;\
							    padding: 15px;\
							    position: absolute;\
							    z-index: 1;\
							    top: 100%;\
		 						font-weight:normal;\
		 						font-size: 14px;\
							    left: inherit;\
							    margin-left: -5px;\
							    transition: all 1s ease;\
		 						-moz-user-select: none; -webkit-user-select: none; -ms-user-select:none; user-select:none;-o-user-select:none;\
							}\a:hover .deep-link-from-info {\
		 						cursor: default;\
							}\
		 					.deep-link {\
								color: #337ab7;\
			 				    cursor: pointer;\
			 				    white-space: nowrap;\
			 				    text-overflow: ellipsis;\
			 				    overflow: hidden;\
			 				    display: block;\
		 						text-decoration: none;\
		 				    	font-weight: bold;\
			    			}\
			    			.deep-link-from-info span{\
		 						display: inline-block;\
		 						width:100%;\
		 						white-space: normal;\
		 				    }\
		 				   .deep-link-from-info .action-bar{\
		 						position: absolute;\
		 						right: 0px;\
		 						top: 0px;\
		 						width: 50px;\
		 						padding: 5px;\
		 						color: #777;\
		 						font-size: 12px;\
		 					}\
		 					.deep-link-from-info .action-bar:hover {\
		 						color: #006699;\
		 						font-weight: bold;\
		 					}\
		 					a.cke-digest-annotate-open-in-context .cke_widget_image .cke_widget_drag_handler_container,\
		 					a.cke-digest-annotate-open-in-context .cke_widget_image .cke_image_resizer {\
		 						display: none !important;\
		 					}\
		 					a.cke-digest-doc-open-in-context {\
			 					position: absolute;\
			 					width: 15px;\
					 		    height: 15px;\
					 		    margin-left: 10px;\
					 		    margin-top: 3px;\
					 		    line-height: 16px;\
					 			text-align: center;\
					 			cursor: auto;\
					 		    content: "";\
					 		    background: url(/app/assets/icons/open-in-context.png) 0% 0% / contain no-repeat;\
		    				}\
		 					.welcome-help-topic-title {\
		 						padding: 10px 0px;\
		 						margin-left: -15px;\
					 		    margin-bottom: 5px;\
					 		    font-size: 16px;\
					 		    font-weight: bold;\
					 		    color: #069;\
					 		    border-bottom: 1px solid #069;\
		 					}\
		 					.welcome-help-body {\
		 						min-height: 100px;\
		 					}\
		 					.welcome-mobile-topic-body {\
		 						width: calc(100% - 50px);\
		 				    	padding: 15px 15px;\
		 						min-height: 1px;\
		 					}\
		 					.welcome-mobile-topic-title {\
		 						padding: 10px 0px;\
		 						margin: 0px -10px;\
					 		    font-size: 16px;\
					 		    font-weight: bold;\
					 		    color: #069;\
					 		    border-bottom: 1px solid #069;\
		 					}\
		 					.cke_widget_oembed img.cke_widget_mask {\
		 						pointer-events: none;\
		 					}'
		 					
						);
	 				
	 				isEditorCssLoaded = true;
	 			}
	 			 
	 		  
	 			  var styles = '.pdfHighlight {\
	 				    background: '+appdata.pdfAntClrCde+';\
	 				}\
	 				[class*="snippet_"] {\
	 					background: '+appdata.snippetClrCde+' !important;\
	 				}\
	 				[class*="snippet_"].selected {\
	 				  background: '+appdata.snippetSlctClrCde+' !important;\
	 				}\
	 			    .pdfHighlight.cmtActive,.pdfHighlight.cmtActive.cmt:before {\
	 			    	background-color: '+appdata.pdfAntSlctClrCde+' !important;\
	 			    	border: 1px solid '+appdata.PdfAnnotationSelectBorder+' !important;\
	 				}';
	 			  
	 			  var colorCodesStyle = $($document).find('head').find("#vdvc-color-codes");
	 			  
	 			  if(colorCodesStyle.length == 0) {
	 				 colorCodesStyle = $('<style type="text/css" id="vdvc-color-codes">');
	 				 $($document).find('head').append(colorCodesStyle);
	 			  } 
	 			  
	 			  colorCodesStyle.html(styles);

	    	}
	    	
		}
	    
	   	    
	    function changePassword(postdata) {
	        return httpService.httpPost('user/changepwd',postdata);
	    }
	    
	    function getUserStateForKey(postdata) {
	        return httpService.httpPost('userState/get',postdata);
	    }
	    
	    function getUiState(stateKey) {
	    	var appdata = appData.getAppData();
	    	if(appdata.UiUserState && !_.isEmpty(appdata.UiUserState)) {
	    		var stateObject = _.findWhere(appdata.UiUserState,{stateKey: stateKey});
	    		if(stateObject) {
	    			return stateObject;
	    		} else {
	    			var newStateObj = {
			    			stateKey: stateKey,
			    			stateValue : defaultStateValues[stateKey]
			    		};
		    		appdata.UiUserState.push(newStateObj);
		    		return newStateObj;
	    		}
	    		
	    	} else {
	    		var newStateObj = {
		    			stateKey: stateKey,
		    			stateValue : defaultStateValues[stateKey]
		    		};
	    		appdata.UiUserState.push(newStateObj);
	    		return newStateObj;
	    	}
	    }
	    
	    function setUiState(stateKey,stateValue) {
	    	var appdata = appData.getAppData();
	    	var stateObj = _.findWhere(appdata.UiUserState,{stateKey:stateKey});
	    	if(stateObj) {
	    		stateObj.stateValue = stateValue;
	    	} else {
	    		appdata.UiUserState.push({stateKey: stateKey,stateValue: stateValue});
	    	}
	    	saveUistate(stateKey);
	    }
	    
	    function saveUistate(stateKey) {
	    	$timeout.cancel(stateTimer);
	    	stateTimer = $timeout(function() {
	    		var stateObj = getUiState(stateKey);
	    		if(stateObj) {
	    			httpService.httpPost('userState/save',stateObj).then(function(resp){
	    				if(stateObj && _.isEmpty(stateObj.id)) {
	    					stateObj = resp.data.UserState;
	    					var appdata = appData.getAppData();
	    					if(_.findWhere(appdata.UiUserState,{stateKey:stateKey})) {
	    						_.findWhere(appdata.UiUserState,{stateKey:stateKey})["id"] = stateObj.id;
	    					}
	    				}
	    			});
	    		}
	    		$timeout.cancel(stateTimer);
	    	},0);
	    }
	    
	    function setDoNotShowHelpOnLogin(postdata) {
	    	return httpService.httpPost('user/doNotShowHelpOnLogin',postdata);
	    }
	    function setDoNotShowWelcomePageOnMobile(postdata) {
	    	return httpService.httpPost('user/doNotShowWelcomePageOnMobile',postdata);
	    }
	    function setDoNotShowExtensionMsg(postdata) {
	    	return httpService.httpPost('user/doNotShowExtensionMsg',postdata);
	    }
	    function acceptTerms(postdata) {
	    	return httpService.httpPost('user/acceptterms',postdata);
	    }
	    function getUsedSpace() {
	    	return httpService.httpGet('user/utilisedData');
	    }
	    function updateUserName(postdata) {
	    	return httpService.httpPost('user/updateUserName ',postdata);
	    }
	    function getUserSettingsKeyList(type) {
	    	var appdata = appData.getAppData();
	    	var keys = [];
	    	for(var key in appdata.UserSettings) {
	    		if(key.startsWith(type)) {
	    			keys.push(key);
	    		}
	    	}
	    	return keys;
	    }
	    
	    function getUiSetting(key,type) {
	    	var appdata = appData.getAppData();
			var menu = {};
			menu.key = key;
			menu.type = type;
			menu.label = userSettingsLabels[key];
			menu.show = (appdata.UserSettings[key] == "Hidden" || appdata.UserSettings[key] == null) ? false : true; 
			menu.isEnabled = (appdata.UserSettings[key] == "Enabled") ? true : false;
			menu.reload = false;
			menu.route = routeMap[key];
			menu.params = {};
			
			return menu;
		}
	    
	    function isActiveTab(tab,currentRoute,params) {
	    	var status = false;
	    	var routeValue = userSettingsRoutes[currentRoute];
	    	if(tab.key === routeValue) {
	    		status = true;
	    	}
	    	
	    	if("taskspace" == currentRoute && params.digest) {
	    		status = false;
	    		if(!_.isEmpty(tab.params) && tab.params.digest == params.digest) {
	    			status = true;
	    		}
	    		/*if(tab.label == "TASKSPACE" && !tab.isDigest) {
	    			status = true;
	    		}
	    		if(tab.label == "DIGEST" && tab.isDigest) {
	    			status = true;
	    		}*/
	    	}
	    	return status;
	    }
	    
	    function forgotPassword(postdata) {
	    	return httpService.httpPost('user/forgotpassword', postdata);
	    }
	    function getByResetToken(postdata) {
	    	return httpService.httpPost('user/getbyresettoken', postdata);
	    }
	    function resetPassword(postdata) {
	    	return httpService.httpPost('user/resetpassword', postdata);
	    }
	    
	    function shareObjectListToGuestUser(postdata) {
	    	return httpService.httpPost('user/shareObjectListToGuestUser', postdata);
	    }
	    
	    function upgradeAccount() {
	    	return httpService.httpGet("user/guestrequest");
	    }
	    
	    function setDoNotShowTipsOnLogin(postdata) {
	    	return httpService.httpPost('user/doNotShowTipsOnLogin',postdata);
	    }
	    function getOrgAdmin() {
	        return httpService.httpGet('user/getOrgAdmin');
	    }
	}

})();
