;(function(){
	'use strict';
	
	angular.module("vdvcApp").directive('typeaheadTrigger', function() {
		  return {
		    require: ["ngModel"],
		    scope: {
		      typeaheadText: '=',
		      triggerFlag: '='
		    },
		    link: function(scope, element, attr, ctrls) {
		    	scope.$watch('triggerFlag', function(value) {
			        if (scope.triggerFlag) {
			          scope.typeaheadText = scope.typeaheadText ? scope.typeaheadText : '[$empty$]';
			          ctrls[0].$setViewValue(scope.typeaheadText);
			          scope.typeaheadText = '';
			          scope.triggerFlag = false;
			        }
		      });
		    }
		  };
		});
	
	angular.module("vdvcApp").controller('NavController',NavController);
	
	NavController.$inject = ['$scope','$rootScope','$location','companyName','$state','$document','$uibModal','navigationService',
	                         'commonService','userService','_','DocFactory','notificationService',"$timeout","appData",
	                         'TaskSpaceService','APIUserMessages','GeneralEventsListner','DocumentEventsListner',
	                         'AdvSearchService','OneDriveService','BoxService','DropBoxService','LinkedInService','AsanaService',
	                         'EvernoteService','SlackService','GoogleService','localStorageService','$window','$deviceInfo','$filter',
	                         'HelpService','MessageService','pendingRequests','DeepLinkService','urlParser','SocketFactory'
	                         ,'ChromeExtensionService','$confirm','AdministrationService','ActionItemsService',
	                         'AnnotationService','NotionService','WebexService','ScheduleMaintenanceNtfService','Flash','$compile'];
	
	function NavController($scope,$rootScope,$location,companyName,$state,$document,$uibModal,navigationService,
			commonService,userService,_,DocFactory,notificationService,$timeout,appData,
			TaskSpaceService,APIUserMessages,GeneralEventsListner,DocumentEventsListner,
			AdvSearchService,OneDriveService,BoxService,DropBoxService,LinkedInService,AsanaService,
			EvernoteService,SlackService,GoogleService,localStorageService,$window,$deviceInfo,$filter,
			HelpService,MessageService,pendingRequests,DeepLinkService,urlParser,SocketFactory,
			ChromeExtensionService,$confirm,AdministrationService,ActionItemsService,
			AnnotationService,NotionService,WebexService,ScheduleMaintenanceNtfService,Flash,$compile) {
			
			var appdata = appData.getAppData();
			var getNotificationTimer;
			var vm = this;
			var orgAdminItms = navigationService.orgAdminItms;
			var navMenuItems = navigationService.navMenuItems;
			var siteAdminItms = $deviceInfo.isMobile ? navigationService.siteAdminMobileItms : navigationService.siteAdminItms;
			var readOnly = true;
			
			var chromeStoreBaseUrlObj;
			var extensionNameObj;
			var extensionIdObj;
			var originalStateHelpTopics;
			var hasZeroTaskspaces = true;
			
			vm.isTablet = $deviceInfo.isTablet;
			vm.additionalMenuItems = [];
			vm.integrationsMenuItems = [];
			vm.isIntegrationsMenuOpen = false;
			vm.sizePrecision = DocFactory.sizePrecision;
			vm.userinfo = $rootScope.currentUser || {};
			vm.Company = companyName;
			vm.UserRole = appdata.UserRole;
			vm.numiciExtension = {};
			vm.isNotficationOpen = false;
			vm.notficationsStartFrom = angular.copy(notificationService.startFrom);
			vm.notficationsLimitSize = angular.copy(notificationService.limitSize);
			vm.isMoreTabsMenuOpen = false;
			vm.notifications = [];
			vm.UserNotifications = {};
			vm.myNotificationsCountByGroup = {};
			vm.UserNotificationsCount = {};
			vm.navMenu = [];
			vm.additionalMenuBtn = {};
			vm.notificationsBtn = {};
			vm.searchBtn = {};
			vm.helpBtn = {};
			vm.rootFolder = appdata.rootFolderId;
			vm.ntfGroupSettings = notificationService.ntfGroupSettings;
			vm.helpTopicSearchTxt = "";
			vm.helpTopics = [];
			vm.stateHelpTopics = {};
			vm.isHelpMenuOpen = false;
			vm.selectedHelpTopic = null;
			vm.content = null;
			vm.instance = null;
			
			vm.editUserNameHeader = angular.copy(userService.editUserNameHeader);
			vm.exceededUserQuotaMsg = MessageService.messages.EXCEEDED_USER_QUOTA;
		    vm.utilized80PercentOfUserQuotaMsg = MessageService.messages.UTILIZED_80_PERCENT_OF_USER_QUOTA;
		    vm.sizeValidation = null;
		    vm.updatedNotificationsCountByGroup = {};
		    vm.isTipsWizardStarted = false;
		    
		    vm.goToHomePage = goToHomePage;
		    vm.goToNumiciExtension = goToNumiciExtension;
		    vm.setAsActiveTab = setAsActiveTab;
			vm.openMenuItem = openMenuItem;
			vm.openAdditionalMenuItem = openAdditionalMenuItem;
			vm.logout = logout;
			vm.editUserName = editUserName;
			vm.changePassword = changePassword;
			vm.upgradeAccount = upgradeAccount;
			vm.showMoreAppMenu = showMoreAppMenu;
			vm.toggleHelp = toggleHelp;
			vm.searchHelpTopic = searchHelpTopic;
			vm.collapsePanel = collapsePanel;
			vm.openHelpTopic = openHelpTopic;
			vm.openRegisterModal = openRegisterModal;
			vm.showTipsWizard = showTipsWizard;
			vm.startTaskSpaceTipTour = startTaskSpaceTipTour;
			//init controller
			 init();
			
			// event listners 
			$scope.$on("EXT_INSTALLED",function(event, msg){
				if(!_.isEmpty(msg.eventData.installed) && msg.eventData.installed == "true") {
					if(vm.numiciExtension.isDeviceSupport && vm.numiciExtension.isChrome && !vm.numiciExtension.isExtensionInstalled) {
						getNumiciExtensionInfo();
					}
				}
			});
			
			 function getHelpTextType() {
				 var helpTextType;
				 /*
					 **** allowed helpTextTypes ****
					 *helpTextPopup
					 *helpTextPopupWithMenu
					 *helpTextSideMenu
				 */
				 var HelpDisplay = appdata.HelpDisplay;
				 var helpTextDisplayTypeInfo = _.findWhere(HelpDisplay,{"key":"helpTextDisplayType"});
				
				 if (helpTextDisplayTypeInfo == null || helpTextDisplayTypeInfo == "" || typeof helpTextDisplayTypeInfo == undefined){
					 helpTextType = "helpTextSideMenu";
				 } else {
					 helpTextType = helpTextDisplayTypeInfo.value;
				 }
				 return helpTextType;
			 }
			 
			 function setDefaultHelpTextSideMenu () {
				destroyCkeditor();
    			vm.selectedHelpTopic = null;
    			vm.content = null;
    			vm.instance = null;
			 }
			 
			
			function updateNotifications () {
				notificationService.getMyNotificationsCountByGroup().then(function(resp){
					if (resp.status == 200 && resp.data.Status) {
						_.each(resp.data.Data,function(count,key){
							if(vm.ntfGroupSettings[key].isOpen) {
								var currentCount = vm.myNotificationsCountByGroup[key];
								if(count > currentCount) {
									var newNtfCount = count - currentCount;
									vm.updatedNotificationsCountByGroup[key] = newNtfCount;
								}
							} else {
								vm.myNotificationsCountByGroup[key] = count;
							}
						});
					}
				});
			}
			
			function showMaintenanceScheduleNtf(maintenanceSchedule) {
				var scheduleMessage = AdministrationService.getMaintenanceNtfMsg(maintenanceSchedule);
				ScheduleMaintenanceNtfService.open({text : scheduleMessage});
			}
			
			function showScheduleShutdownNtf(maintenanceSchedule) {
				$rootScope.maintenanceSchedule = maintenanceSchedule;
				var newLogoutDurationMillis = maintenanceSchedule.shutdownDuration * 1000 * 60;
				var scheduleShutdownMessage = AdministrationService.getInitiatedShutdownNtfMsg(maintenanceSchedule,newLogoutDurationMillis);
				$scope.$emit('schedule-shutdown-flash', {"scheduleShutdownMessage" : scheduleShutdownMessage,"newLogoutDurationMillis" : newLogoutDurationMillis});
			}
			
			function getScheduleById(scheduleId,cb) {
				AdministrationService.getScheduleById(scheduleId).then(function(resp) {
					if(resp.status == 200 && resp.data.Status) {
						var maintenanceSchedule = resp.data.Schedule;
						if(typeof cb == "function") {
							cb(maintenanceSchedule);
						}
					}
				});
			}
			
			$scope.$on("SHEDULED_MAINTENANCE",function(event, msg){
				if(!_.isEmpty(msg.eventData.scheduleId)) {
					getScheduleById(msg.eventData.scheduleId,function(maintenanceSchedule){
						showMaintenanceScheduleNtf(maintenanceSchedule);
					});
				}
			});
			
			$scope.$on("SHEDULED_SHUTDOWN",function(event, msg){
				if(!_.isEmpty(msg.eventData.scheduleId)) {
					getScheduleById(msg.eventData.scheduleId,function(maintenanceSchedule){
						showScheduleShutdownNtf(maintenanceSchedule);
					});
				}
			});
			
			$scope.$on("FORCE_LOGOUT", function(event, data) {
				if(data) {
					if(!_.isEmpty(data.eventData) && data.eventData.Reason == "Guest2Provisional") {
						$confirm({ ok : "OK"},
								{ templateUrl: 'app/components/RegisterProvisionalUser/GuestUserConfirmation.html' })
				        .then(function() {
				        	vm.logout(data.eventData);
					    },function() {
					    	vm.logout(data.eventData);
					    });
					} else {
						vm.logout();
					}
				}
			});
			
			$scope.$on("USER_NOTIFICATION", function(event, data) {
				getUserNotificationCount();
				if(vm.isNotficationOpen) {
					updateNotifications();
				}
			});
			
			$scope.$on("LINKEDIN_AUTH_UPDATE", function(event, data) {
				var appdata = appData.getAppData();
				if(data && data.eventData && data.eventData.HasLinkedInAuth && data.eventData.HasLinkedInAuth == "false"){
					appData.setAppData("hasLinkedInAuth",false);
				} else if(data && data.eventData && data.eventData.HasLinkedInAuth && data.eventData.HasLinkedInAuth == "true"){
					appData.setAppData("hasLinkedInAuth",true);
				}
			});
			
			$scope.$on("MSOFFICE_AUTH_UPDATE", function(event, data) {
				var appdata = appData.getAppData();
				if(data && data.eventData && data.eventData.HasTeamsAuth && data.eventData.HasTeamsAuth == "false"){
					appData.setAppData("hasTeamsAuth",false);
				} else if(data && data.eventData && data.eventData.HasTeamsAuth && data.eventData.HasTeamsAuth == "true"){
					appData.setAppData("hasTeamsAuth",true);
				}
				if(data && data.eventData && data.eventData.HasOneNoteAuth && data.eventData.HasOneNoteAuth == "false"){
					appData.setAppData("hasOneNoteAuth",false);
				} else if(data && data.eventData && data.eventData.HasOneNoteAuth && data.eventData.HasOneNoteAuth == "true"){
					appData.setAppData("hasOneNoteAuth",true);
				}
				if(data && data.eventData && data.eventData.HasEmailSaveAsDraft && data.eventData.HasEmailSaveAsDraft == "false"){
					appData.setAppData("hasEmailSaveAsDraft",false);
				} else if(data && data.eventData && data.eventData.HasEmailSaveAsDraft && data.eventData.HasEmailSaveAsDraft == "true"){
					appData.setAppData("hasEmailSaveAsDraft",true);
				}
			});
			
			$scope.$on("GOOGLE_AUTH_UPDATE", function(event, data) {
				var appdata = appData.getAppData();
				if(data && data.eventData && data.eventData.HasEmailSaveAsDraft && data.eventData.HasEmailSaveAsDraft == "false"){
					appData.setAppData("hasEmailSaveAsDraft",false);
				} else if(data && data.eventData && data.eventData.HasEmailSaveAsDraft && data.eventData.HasEmailSaveAsDraft == "true"){
					appData.setAppData("hasEmailSaveAsDraft",true);
				}
			});
			
			$scope.$on("WEBEX_AUTH_UPDATE", function(event, data) {
				var appdata = appData.getAppData();
				if(data && data.eventData && data.eventData.HasWebexAuth && data.eventData.HasWebexAuth == "false"){
					appData.setAppData("hasWebexAuth",false);
				} else if(data && data.eventData && data.eventData.HasWebexAuth && data.eventData.HasWebexAuth == "true"){
					appData.setAppData("hasWebexAuth",true);
				}
			});
			
			$scope.$on("LOGOUT_NOTIFICATION", function(event, data) {
				logout();
			});
			
			$scope.$on("DROPBOX_SYNC_COMPLETE", function(event, data) {
				APIUserMessages.stickySuccess("DropBox Sync Complete");
			});
			
			$scope.$on("ONEDRIVE_SYNC_COMPLETE", function(event, data) {
				APIUserMessages.stickySuccess("OneDrive Sync Complete");
			});
			
			$scope.$on("BOX_SYNC_COMPLETE", function(event, data) {
				APIUserMessages.stickySuccess("Box Sync Complete");
			});
			
			$scope.$on("BOX_AUTH_REVOKED", function(event, data) {
				$rootScope.$broadcast("BoxRevoke",true);
			});
			
			$scope.$on("DROPBOX_AUTH_REVOKED", function(event, data) {
				$rootScope.$broadcast("DropBoxRevoke",true);
			});

			$scope.$on("ONEDRIVE_AUTH_REVOKED", function(event, data) {
				$rootScope.$broadcast("OneDriveRevoke",true);
			});
			
			
			$scope.$on("StateChanged", function(event, data) {
				var helpTextType = getHelpTextType();
				if (helpTextType == "helpTextSideMenu" || helpTextType == "helpTextPopup") {
	    			setDefaultHelpTextSideMenu();
	    		}
			});
			
			$scope.$on("TSCountToShowTourTipIcon",function(event, msg){
				if(msg.noOfTaskspaces > 0) {
					hasZeroTaskspaces = false;
				}
			});
			
			$scope.$on("ShowTourTipOnlogin",function(event, msg){
				if($state.current.name == 'taskspace.list.task' && msg.showTourTipOnlogin) {
					startTaskSpaceTipTour(msg.showTourTipOnlogin);
				}
			});
			
			$scope.$on("TipsWizardStopped",function(event, msg){
				vm.isTipsWizardStarted = false;
			});
			
			function showAddWebAnnotationHelp() {
				$confirm({ ok : "Get Chrome Extension", cancel : "Cancel"},
						{ templateUrl: 'app/components/navigation/AddWebAnnotationHelp.html' })
		        .then(function() {
		        	var extensionUrl = chromeStoreBaseUrlObj.value+extensionNameObj.value+"/"+extensionIdObj.value;
					//$window.location.href = extensionUrl;
					$window.open(extensionUrl,'_blank');
			    },function() {
			    	//Do Nothing
			    });
			}
			
			function goToHomePage() {
				userService.goToHomePage();
			}
			
			function goToNumiciExtension() {
				if(vm.numiciExtension.isChrome) {
					var extensionUrl = chromeStoreBaseUrlObj.value+extensionNameObj.value+"/"+extensionIdObj.value;
					//$window.location.href = extensionUrl;
					$window.open(extensionUrl,'_blank');
				} else {
					showAddWebAnnotationHelp();
				}
			}
			
			function getExtensionInfo(extensionId) {
				ChromeExtensionService.isExtensionInstalled(extensionId,function(response){
					if(response && response.type === "pong") {
						vm.numiciExtension["isExtensionInstalled"] = true;
					} else {
						vm.numiciExtension["isExtensionInstalled"] = false;
						if(vm.numiciExtension.isDeviceSupport && vm.numiciExtension.isChrome) {
							vm.numiciExtension["label"] = "Get Numici Extension";
						} else if(vm.numiciExtension.isDeviceSupport && !vm.numiciExtension.isChrome) {
							vm.numiciExtension["label"] = "Add Web Annotation";
						}
					}
				});
			}
			
			function getNumiciExtensionInfo() {
				if($deviceInfo.isMobile || $deviceInfo.isTablet) {
					vm.numiciExtension["isDeviceSupport"] = false;
				} else {
					vm.numiciExtension["isDeviceSupport"] = true;
				}
				if($deviceInfo.isChrome) {
					vm.numiciExtension["isChrome"] = true;
				} else {
					vm.numiciExtension["isChrome"] = false;
				}
				if($deviceInfo.isChrome) {
					vm.numiciExtension["isBrowserSupport"] = true;
				} else {
					vm.numiciExtension["isBrowserSupport"] = false;
				}
				commonService.getNavMenuItems({"type":"WebAnnotations"}).then(function(resp){
					if(resp.status == 200 && resp.data.Status) {
						var listAppKeyValues  = resp.data.listAppKeyValues;
						chromeStoreBaseUrlObj = _.findWhere(listAppKeyValues,{"key": "ChromeStoreBaseUrl"});
						extensionNameObj = _.findWhere(listAppKeyValues,{"key": "ExtensionName"});
						extensionIdObj = _.findWhere(listAppKeyValues,{"key": "ExtensionId"});
						
						if(extensionIdObj) {
							getExtensionInfo(extensionIdObj.value);
						}
					}
				});
			}
			
			function init() {
				if(appdata.HelpInfo && appdata.HelpInfo.Help && appdata.HelpInfo.Help.topics) {
					vm.helpTopics = appdata.HelpInfo.Help.topics
				}
				/*if(vm.UserRole == 'OrgAdmin') {
			    	_.each(orgAdminItms,function(item,index){
			    		if(item.show) {
			    			vm.additionalMenuItems.push(item);
			    		}
			    	});
			    }*/
			    if(vm.UserRole == 'VDVCSiteAdmin') {
			    	_.each(siteAdminItms,function(item,index){
			    		if(item.show) {
			    			vm.additionalMenuItems.push(item);
			    		}
			    	});
			    }
			    _.each(navMenuItems,function(item){
		    		switch(item.key) {
					case "navigation_Administration":
			    		if(item.show && (vm.UserRole == 'VDVCSiteAdmin' || vm.UserRole == 'OrgAdmin')) {
			    			vm.navMenu.push(item);
			    		}
		    		}
		    	});
			    getMenuItems();
			    getAdditionalMenuItems();
			    getUserNotificationCount();
			    getUsedSpace();
			    getNumiciExtensionInfo();
			    var OneDriveAuthRequest = localStorageService.get("OneDriveAuthRequest");
			    var queryStrings = $location.search();
			    if(OneDriveAuthRequest && OneDriveAuthRequest.isAuthRequest && queryStrings && queryStrings.oda) {
			    	initOnedrive();
			    	localStorageService.remove("OneDriveAuthRequest");
			    	try {
			    		$window.location.href = OneDriveAuthRequest.currentUrl;
			    	} catch(e) {
			    		
			    	}
			    }
			    if(vm.UserRole == 'Guest') {
			    	var researchState = _.findWhere(vm.navMenu,{key : "navigation_Research"});
			    	var taskspaceState = _.findWhere(vm.navMenu,{key : "navigation_Taskspace"});
			    	if((researchState && !researchState.isEnabled) && 
			    			(taskspaceState && taskspaceState.isEnabled)) {
			    		if(taskspaceState.type == "route") {
			    			goToSelectedState (taskspaceState);
			    		}
			    	}
			    }
			    
			    if(!GeneralEventsListner.isConnected()) {
			    	GeneralEventsListner.reconnect();
	    		}
			    var OpenEverNoteConfig = localStorageService.get("OpenEverNoteConfig");
			    if(OpenEverNoteConfig == "true") {
			    	localStorageService.remove("OpenEverNoteConfig");
			    	initEvernote();
			    }
			}
			
			function setAsActiveTab(tab) {
				var currentRoute = $state.current.name.split(".")[0];
				return userService.isActiveTab(tab,currentRoute,$state.params);
			}
			
			function redirectPage (page) {
				$window.open($window.location.origin+"/"+page.route,'_blank');
			}
			
			function goToSelectedState (state) {
				$state.go(state.route,state.params,{reload: state.reload});
			}
			
			function openInPopupModal (item) {
				switch(item.key) {
					case "additionalNavigation_SyncHelp":
						syncHelp();
						//openManageHelpModal();
						break;
					case "additionalNavigation_OneDrive":
						initOnedrive();
						break;
					case "additionalNavigation_Box":
						initBox();
						break;
					case "additionalNavigation_DropBox":
						initDropBox();
						break;
					case "additionalNavigation_LinkedIn":
						initLinkedIn();
						break;
					case "additionalNavigation_Evernote":
						initEvernote();
						break;
					case "additionalNavigation_Google":
						initGoogle();
						break;
					case "additionalNavigation_Notion":
						initNotion();
						break;
					case "additionalNavigation_TimeLog":
						OpenTimeLogModal();
						break;
					case "additionalNavigation_Webex":
						initWebex();
						break;
				}
			}
			
			function openMenuItem(item) {
				if(item.isEnabled)
				switch(item.type) {
					case "href":
						redirectPage(item);
						break;
					case "route":
						goToSelectedState(item);
						break;
					case "modal":
						openInPopupModal(item);
						break;
				}
			}
			
			function openAdditionalMenuItem (item) {
				if(item.isEnabled)
				vm.isMoreTabsMenuOpen = false;
				vm.isIntegrationsMenuOpen = false;
				switch(item.type) {
					case "href":
						redirectPage(item);
						break;
					case "route":
						goToSelectedState(item);
						break;
					case "modal":
						openInPopupModal(item);
						break;
				}
			}
			
			function getUserNotificationCount() {
				notificationService.getUserNotificationCount().then( function(resp) {
					if(resp.status && resp.data.Status) {
						if(resp.data.Data && resp.data.Data.UnreadCount > 0 ) {
							resp.data.Data.showCount = true;
						} else {
							resp.data.Data.showCount = false;
						}
						vm.UserNotificationsCount = angular.copy(resp.data.Data);
					}
				});
			}
			
			function cacelNotificationPolling() {
				$timeout.cancel(getNotificationTimer);  
			}
			
			function editUserName(size) {
				var modalInstance = $uibModal.open({
				      animation: $scope.animationsEnabled,
				      templateUrl: 'app/components/authentication/EditUserName/EditUserNameModal.html',
				      controller: 'EditUserNameController',
				      controllerAs: 'eunc',
				      appendTo : $('.rootContainer'),
				      backdrop: 'static',
				      size: size,
				      resolve : {
				    	  "userinfo" : function() {
				    		  return vm.userinfo;
				    	  }
				      }
				    });
				
				modalInstance.result.then(function (respData) {
					$rootScope.currentUser["FirstName"] = vm.userinfo["FirstName"] = respData.Users.firstName;
					$rootScope.currentUser["LastName"] = vm.userinfo["LastName"] = respData.Users.lastName
					$rootScope.currentUser["UserName"] = vm.userinfo["UserName"] = respData.Users.firstName+" "+respData.Users.lastName;
					appData.setAppData("FirstName",respData.Users.firstName);
					appData.setAppData("LastName",respData.Users.lastName);
					appData.setAppData("UserName",respData.Users.firstName+" "+respData.Users.lastName);
					APIUserMessages.success(respData.Message);
				}, function () {
					
				});
			}
			
			function changePassword(size) {
				vm.isUserSettingsOpen = false;
				var modalInstance = $uibModal.open({
				      animation: $scope.animationsEnabled,
				      templateUrl: 'app/components/authentication/ChangePassword/changePasswordModal.html',
				      controller: 'ChangePasswordController',
				      controllerAs: 'vm',
				      appendTo : $('.rootContainer'),
				      backdrop: 'static',
				      size: size
				    });
				
				modalInstance.result.then(function (status) {
					if(status) {
						vm.logout();
					}
				}, function () {
				      
				});
			}
			
			function upgradeAccount() {
				userService.upgradeAccount().then(function(resp) {
					if(resp.status == 200 && resp.data.Status){
						APIUserMessages.success(resp.data.Message);
					} else {
						APIUserMessages.error(resp.data.Message);
					}
				});
			}
			
			function showMoreAppMenu () {
				var status = false;
				var displayedAMItems = _.where(vm.additionalMenuItems,{"show":true});
				var displayedIntItems = _.where(vm.integrationsMenuItems,{"show":true});
				if(vm.additionalMenuBtn && vm.additionalMenuBtn.show && (!_.isEmpty(displayedAMItems) || !_.isEmpty(displayedIntItems))) {
					status = true;
				}
				return status;
			}
			
			function dynamicTemplateForOneDrive() {
				var dynamicTemplate = "app/components/OneDrive/oneDrive.html";
				if($deviceInfo.isMobile) {
					dynamicTemplate = "app/components/OneDrive/Mobile/oneDrive.mob.html";
				}
				return dynamicTemplate;
			} 
			
			
			function checkAndSyncHelpFolder(id) {
				pendingRequests.cancel(pendingRequests);
				DocFactory.getDocsUnderFolder(id).then(function (resp) {
					if(resp.status == 200 && resp.data.Status){
						var folders = resp.data.Folders.folders;
						var helpFolder = _.findWhere(folders,{"name":"Help"});
			        	if(!_.isEmpty(helpFolder)) {
			        		HelpService.creatHelpTopics(helpFolder.id).then(function(helpResp){
			        			if(helpResp.status == 200 && helpResp.data.Status) {
			        				MessageService.showSuccessMessage("CREATE_HELP_TOPICS",[helpResp.data.Help.title]);
				   				}
			        		});
			        	} else {
			        		MessageService.showErrorMessage("ERROR_CREATE_HELP_TOPICS");
			        	}
					}
				});
			}
			
			function syncHelp() {
				vm.isMoreTabsMenuOpen = false;
				vm.isIntegrationsMenuOpen = false;
				checkAndSyncHelpFolder(appdata.rootFolderId);
			}
			
			/*function openManageHelpModal() {
				vm.isMoreTabsMenuOpen = false;
				var manageHelpModalInstance = $uibModal.open({
					  animation: true,
					  templateUrl: 'app/components/Help/ManageHelp/ManageHelpModalTemplate.html',
				      controller: 'ManageHelpModalController',
				      appendTo : $('.rootContainer'),
				      size: 'lg',
				      controllerAs: 'mhmc',
				      backdrop: 'static',
				      resolve: {
					      foldersList : function() {
				    		  return DocFactory.getDocsUnderFolder(appdata.rootFolderId);
				    	  }
				      }
				});
				
				manageHelpModalInstance.result.then(function (resp) {
					if(resp.status == 200 && resp.data.Status) {
						MessageService.showSuccessMessage("CREATE_HELP_TOPICS",[resp.data.Help.title]);
					 }
				}, function () {
				      
				});
			}*/
			
			function initOnedrive() {
				vm.isMoreTabsMenuOpen = false;
				vm.isIntegrationsMenuOpen = false;
				/*if(appdata) {
					if(appdata.hasOneDriveAuth) {
						
						var instance = $uibModal.open({
							  animation: true,
							  templateUrl: dynamicTemplateForOneDrive(),
						      controller: 'OneDriveController',
						      appendTo : $('.rootContainer'),
						      size: 'lg',
						      controllerAs: 'odc',
						      backdrop: 'static',
						      resolve : {
						    	  "oneDriveRoot" : function() {
						    		  return OneDriveService.getRoot();
						    	  }
						      }
						});
						
						instance.result.then(function (status) {
							
						}, function () {
						      
						});
					} else {
						OneDriveService.autherize();
					}
				}*/
				
				
				OneDriveService.getConfig().then(function(resp) {
					if(resp.status == 200 && resp.data.Status) {
/*						if(resp.data.OAuthErr && resp.data.OneDriveStatus == "NoAuth") {
							OneDriveService.autherize();
						} else {
							var instance = $uibModal.open({
								  animation: true,
								  templateUrl: "app/components/OneDrive/config/OneDriveConfig.tpl.html",
							      controller: 'OneDriveConfigController',
							      appendTo : $('.rootContainer'),
							      size: 'lg',
							      controllerAs: 'odcc',
							      backdrop: 'static',
							      resolve : {
							    	  "oneDriveConfig" : function() {
							    		  return resp.data.OneDriveConfig;
							    	  }
							      }
							});
							
							instance.result.then(function (status) {
								if(status) {
									APIUserMessages.success("Success");
									$rootScope.$broadcast("OneDriveRevoke",true);
								}
							}, function () {
							      
							});
						}*/
						var instance = $uibModal.open({
							  animation: true,
							  templateUrl: "app/components/OneDrive/config/OneDriveConfig.tpl.html",
						      controller: 'OneDriveConfigController',
						      appendTo : $('.rootContainer'),
						      size: 'lg',
						      controllerAs: 'odcc',
						      backdrop: 'static',
						      resolve : {
						    	  "googleConfig" : ['GoogleService','$q','$state', function resolveAuthentication(GoogleService,$q,$state) {
						    		  var deferred = $q.defer();
						    		  GoogleService.getConfig().then(function(googleAuthDataResp) {
						    			  deferred.resolve(googleAuthDataResp);
						    		  },function(googleAuthDataError) {
						    			  deferred.resolve({"error" : googleAuthDataError});
						    		  });
						    		  return deferred.promise;
						    	  }],
						    	  "oneDriveConfig" : function() {
						    		  if(resp.data.OAuthErr && resp.data.OneDriveStatus == "NoAuth") {
						    			  return null;
						    		  } else {
						    			  return resp.data.OneDriveConfig;
						    		  }
						    	  }
						      }
						});
						
						instance.result.then(function (status) {
							if(status) {
								APIUserMessages.success("Success");
								$rootScope.$broadcast("OneDriveRevoke",true);
							}
						}, function () {
						      
						});
					}
				});
			}
			
			
			function initBox() {
				vm.isMoreTabsMenuOpen = false;
				vm.isIntegrationsMenuOpen = false;
				if(appdata) {
					if(!appdata.hasBoxAuth) {
						BoxService.autherize();
					} else {
						var modalInstance = $uibModal.open({
						      animation: true,
						      templateUrl: 'app/components/Box/BoxConfig/box-config.html',
						      controller: 'BoxConfigController',
						      appendTo : $('.rootContainer'),
						      controllerAs: 'box',
						      backdrop: 'static',
						      size : 'md',
						      resolve: {
						    	  boxConfig :function() {
						    		  return BoxService.getConfig().then(function(resp) {
						    			  if(resp.status == 200 && resp.data.Status) {
						    				var data = resp.data;
											if(data.OAuthErr && (data.BoxStatus == "Invalid" || data.BoxStatus == "NoAuth") ) {
												return BoxService.autherize();
											} else {
												return data.BoxConfig;
											}
						    			  }
						    		  });
						    	  }
						      }
						    });
						
						modalInstance.result.then(function (status) {	
							if(status) {
								APIUserMessages.success("Success");
								$rootScope.$broadcast("BoxRevoke",true);
							}
						});
					}
				}
			}
			
			
			
			function initDropBox() {
				vm.isMoreTabsMenuOpen = false;
				vm.isIntegrationsMenuOpen = false;
				if(appdata) {
					DropBoxService.getConfig().then(function(resp) {
		    			  if(resp.status == 200 && resp.data.Status) {
		    				var data = resp.data;
							if(data.OAuthErr && (data.DropBoxStatus == "Invalid" || data.DropBoxStatus == "NoAuth") ) {
								DropBoxService.autherize();
							} else {
								var modalInstance = $uibModal.open({
								      animation: true,
								      templateUrl: 'app/components/DropBox/Config/drop-box-config.html',
								      controller: 'DropBoxConfigController',
								      appendTo : $('.rootContainer'),
								      controllerAs: 'dropbox',
								      backdrop: 'static',
								      size : 'md',
								      resolve: {
								    	  config : data.DropBoxConfig
								      }
								    });
								
								modalInstance.result.then(function (status) {	
									if(status) {
										APIUserMessages.success("Success");
										$rootScope.$broadcast("DropBoxRevoke",true);
									}
								});
							}
		    			  }
		    		});
				}
			}
			
			function initLinkedIn() {
				vm.isMoreTabsMenuOpen = false;
				vm.isIntegrationsMenuOpen = false;
				if(appdata) {
					LinkedInService.getConfig().then(function(resp) {
		    			  if(resp.status == 200 && resp.data.Status) {
		    				var data = resp.data;
							if(data.OAuthErr && (data.LinkedInStatus == "Invalid" || data.LinkedInStatus == "NoAuth") ) {
								LinkedInService.autherize();
							} else {
								$state.go("linkedinposts",{},{ reload: true });
							}
		    			  }
		    		});
				}
			}
			
			function initEvernote() {
				vm.isMoreTabsMenuOpen = false;
				vm.isIntegrationsMenuOpen = false;
				EvernoteService.getConfig().then(function(resp) {
					if(resp.status == 200 && resp.data.Status) {
						var instance = $uibModal.open({
							  animation: true,
							  templateUrl: "app/components/Evernote/config/EvernoteConfig.tpl.html",
						      controller: 'EvernoteConfigController',
						      appendTo : $('.rootContainer'),
						      size: 'lg',
						      controllerAs: 'ecc',
						      backdrop: 'static',
						      resolve : {
						    	  "evernoteConfig" : function() {
						    		  if(resp.data.OAuthErr && resp.data.EverNoteStatus == "NoAuth") {
						    			  return null;
						    		  } else {
						    			  return resp.data.EvernoteConfig;
						    		  }
						    	  },
						    	  "evernoteConfigStatus" : ['EvernoteService','$q','$state', function resolveAuthentication(EvernoteService,$q,$state) {
						    		  var deferred = $q.defer();
						    		  if(resp && resp.data && resp.data.EvernoteConfig){
							    		  EvernoteService.getConfigStatus().then(function(evernoteConfigStatusResp) {
							    			  var evernoteConfigStatus = "Valid";
							    			  if(evernoteConfigStatusResp.data.OAuthErr && evernoteConfigStatusResp.data.EverNoteStatus) {
							    				  evernoteConfigStatus = evernoteConfigStatusResp.data.EverNoteStatus;
							    			  }
							    			  deferred.resolve(evernoteConfigStatus);
							    		  },function(evernoteConfigStatusError) {
							    			  deferred.resolve({"error" : evernoteConfigStatusError});
							    		  });
						    		  } else {
						    			  deferred.resolve(null);
						    		  }
						    		  return deferred.promise;
						    	  }],
						    	  "userinfo" : function() {
						    		  return vm.userinfo;
						    	  }
						      }
						});
						instance.result.then(function (status) {
							if(status) {
								APIUserMessages.success("Success");
								$rootScope.$broadcast("EvernoteRevoke",true);
							}
						}, function () {
						      
						});
					}
				});
			}
			
			function initGoogle() {
				vm.isMoreTabsMenuOpen = false;
				vm.isIntegrationsMenuOpen = false;
				GoogleService.getConfig().then(function(resp) {
					if(resp.status == 200 && resp.data.Status) {
						var instance = $uibModal.open({
							  animation: true,
							  templateUrl: "app/components/Google/config/GoogleConfig.tpl.html",
						      controller: 'GoogleConfigController',
						      appendTo : $('.rootContainer'),
						      size: 'lg',
						      controllerAs: 'gcc',
						      backdrop: 'static',
						      resolve : {
						    	  "oneDriveConfig" : ['OneDriveService','$q','$state', function resolveAuthentication(OneDriveService,$q,$state) {
						    		  var deferred = $q.defer();
						    		  OneDriveService.getConfig().then(function(oneDriveAuthDataResp) {
						    			  deferred.resolve(oneDriveAuthDataResp);
						    		  },function(oneDriveAuthDataError) {
						    			  deferred.resolve({"error" : oneDriveAuthDataError});
						    		  });
						    		  return deferred.promise;
						    	  }],
						    	  "googleConfig" : function() {
						    		  if(resp.data.OAuthErr && resp.data.GoogleStatus == "NoAuth") {
						    			  return null;
						    		  } else {
						    			  return resp.data.GoogleConfig;
						    		  }
						    	  },
						    	  "userinfo" : function() {
						    		  return vm.userinfo;
						    	  }
						      }
						});
						instance.result.then(function (status) {
							if(status) {
								APIUserMessages.success("Success");
								$rootScope.$broadcast("GoogleRevoke",true);
							}
						}, function () {
						      
						});
					}
				});
			}
			
			function initNotion() {
				vm.isMoreTabsMenuOpen = false;
				vm.isIntegrationsMenuOpen = false;
				if(appdata) {
					NotionService.getConfig().then(function(resp) {
		    			  if(resp.status == 200 && resp.data.Status) {
		    				var data = resp.data;
							if(data.OAuthErr && (data.NotionStatus == "Invalid" || data.NotionStatus == "NoAuth") ) {
								NotionService.autherize();
							} else {
								var modalInstance = $uibModal.open({
								      animation: true,
								      templateUrl: 'app/components/Notion/Config/notion-config.html',
								      controller: 'NotionConfigController',
								      appendTo : $('.rootContainer'),
								      controllerAs: 'notion',
								      backdrop: 'static',
								      size : 'md',
								      resolve: {
								    	  config : data.NotionConfig
								      }
								    });
								
								modalInstance.result.then(function (status) {	
									if(status) {
										APIUserMessages.success("Success");
										$rootScope.$broadcast("NotionRevoke",true);
									}
								});
							}
		    			  }
		    		});
				}
			}
			
			function initWebex() {
				vm.isMoreTabsMenuOpen = false;
				vm.isIntegrationsMenuOpen = false;
				if(appdata) {
					WebexService.getConfig().then(function(resp) {
		    			  if(resp.status == 200 && resp.data.Status) {
		    				var data = resp.data;
							if(data.OAuthErr && (data.WebexStatus == "Invalid" || data.WebexStatus == "NoAuth") ) {
								WebexService.autherize();
							} else {
								var modalInstance = $uibModal.open({
								      animation: true,
								      templateUrl: 'app/components/Webex/Config/webex-config.html',
								      controller: 'WebexConfigController',
								      appendTo : $('.rootContainer'),
								      controllerAs: 'webex',
								      backdrop: 'static',
								      size : 'md',
								      resolve: {
								    	  config : data.WebexConfig
								      }
								    });
								
								modalInstance.result.then(function (status) {	
									if(status) {
										APIUserMessages.success("Success");
										$rootScope.$broadcast("WebexRevoke",true);
									}
								});
							}
		    			  }
		    		});
				}
			}
			
			function logout(data) {
				$rootScope.$broadcast("LogOut",data);
			}
						 
			function openTaskSpaceObject(id,clientId,objectId,cb) {
				 
				 TaskSpaceService.isObjectInTaskSpace(clientId,id,objectId).then(function(isPresentResp) {
					 if(isPresentResp.status == 200 && isPresentResp.data) {
						 if(isPresentResp.data.Status == 1) {
							 if(typeof cb === "function") {
								 cb(isPresentResp.data.Status);
							 } else {
								 openTaskSpace(id,clientId,objectId);
							 }
						 }
						 if(isPresentResp.data.Status == -1) {
							 APIUserMessages.error('Insufficient privileges to open the Document');
						 }
                         if(isPresentResp.data.Status == 0) {
                        	 APIUserMessages.error('The requested Document is removed form the Taskspace');
						 }
					 }
				 });
			 }
			 
			 function openTaskSpace(id,clientId,objectId,cb) {
				 TaskSpaceService.getTaskSpaceById(clientId,id).then(function(TsResp) {
					 if (TsResp.status == 200 && TsResp.data.Status) {
						 TaskSpaceService.setCurrent(clientId,id).then(function(SCresp) {
								if (SCresp.status == 200 && SCresp.data.Status) {
									TaskSpaceService.openTaskSpace(clientId,id).then(function(OPTresp) {
										if(OPTresp.status == 200 && OPTresp.data.Status) {
											if(objectId) {
												TaskSpaceService.getTaskSpaceState(clientId,id).then(function(resp) {
													if (resp.status == 200 && resp.data.Status) {
														var taskSpaceState = resp.data.TaskspaceState;
														taskSpaceState.focusObject1 = objectId;
														taskSpaceState.clientId = clientId;
														TaskSpaceService.saveTaskSpaceState(taskSpaceState).then(function(STSresp) {
															if(STSresp.status == 200 && STSresp.data.Status) {
																if(typeof cb === "function") {
																	cb(STSresp.data.Status);
																} else {
																	$state.go('taskspace.list.task',{"tsId": id,"tsc":clientId,d:null,da:null},{ reload: true });
																}
															}
														});
													}
												});
											} else {
												$state.go('taskspace.list.task',{"tsId": id,"tsc":clientId,d:null,da:null},{ reload: true });
											}
										}
									});
								}
						  });
					 }
				 });
				
			 }
			 
			 function getAnnotationByConvId(actionItem,cb) {
				 AnnotationService.getAnnotationByConvId(actionItem.objClientId,actionItem.objId).then(function(AnnotationResp) {
					 if (AnnotationResp.status == 200 && AnnotationResp.data.Status) {
						 if(typeof cb === "function") {
							 cb(AnnotationResp.data.Annotations);
						 }
					 }
				 });
			 }
			 
			 function openActionItem(actionItemInfo) {
				 ActionItemsService.openfromNotification = true;
				 $state.go('actionitems.actionitem',{"actionItemId": actionItemInfo.TaskId,"clientId":actionItemInfo.ClientId},{ reload: true });
				 
				 /*ActionItemsService.getActionItem(actionItemInfo.ClientId,actionItemInfo.TaskId).then(function(ActionItemResp) {
					 if (ActionItemResp.status == 200 && ActionItemResp.data.Status) {
						 var actionItem = ActionItemResp.data.Task;
						 if(!_.isEmpty(actionItem)) {
							 if(!_.isEmpty(actionItem.taskspaceId) && !_.isEmpty(actionItem.taskspaceClientId) && !_.isEmpty(actionItem.documentId)) {
								 openTaskSpaceObject(actionItem.taskspaceId,actionItem.taskspaceClientId,actionItem.documentId,function(openTSObjResp){
									 if(openTSObjResp == 1) {
										 openTaskSpace(actionItem.taskspaceId,actionItem.taskspaceClientId,actionItem.documentId,function(openTSResp){
											 if(openTSResp) {
												 //if(actionItem.objType === "Annotation") {
													 //$state.go('taskspace.list.task',{"tsId": actionItem.taskspaceId,"tsc":actionItem.taskspaceClientId,d:actionItem.documentId,da:actionItem.objId},{ reload: true });
												 //} else
												  if(actionItem.objType === "Conversation") {
													 getAnnotationByConvId(actionItem,function(annotation){
														 if(!_.isEmpty(annotation)) {
															 $state.go('taskspace.list.task',{"tsId": actionItem.taskspaceId,"tsc":actionItem.taskspaceClientId,d:actionItem.documentId,da:annotation.id},{ reload: true });
														 }
													 });
												 }
											 }
										 });
									 }
								 });
							 } else if(!_.isEmpty(actionItem.documentId) && !_.isEmpty(actionItem.documentClientId)) {
								 //if(actionItem.objType === "Annotation") {
									 //$state.go("docview",{"docId" : actionItem.documentId,"clientId": actionItem.documentClientId,"commentId":actionItem.objId});
								 //} else 
								 if(actionItem.objType === "Conversation") {
									 getAnnotationByConvId(actionItem,function(annotation){
										 if(!_.isEmpty(annotation)) {
											 $state.go("docview",{"docId" : actionItem.documentId,"clientId": actionItem.documentClientId,"commentId":annotation.id});
										 }
									 });
								 }
								 
							 }
						 }
					 }
				 });*/
			 }
			 
			function openNotificationsPopover() {
				vm.isNotficationOpen = true;
			}
			
			function closeNotificationsPopover() {
				vm.isNotficationOpen = false;
			}
			
			vm.getNtfGroupLable = function(group) {
				var label;
				if(vm.ntfGroupSettings && vm.ntfGroupSettings[group] && vm.ntfGroupSettings[group].label) {
					label = vm.ntfGroupSettings[group].label;
				} else if(vm.ntfGroupSettings) {
					vm.ntfGroupSettings[group] = {"label" : group};  //this is for to toggle newly added group 
					label = group;
				}
				return label;
			};
			
			vm.showNtfMsgAsLink = function(notification) {
				var status = true;
				if(notification && (notification.notificationType =='EvernoteError' || 
						notification.notificationType =='EvernoteRateLimitError' || 
						notification.notificationType =='EvernoteTokenExpiredError' || 
						notification.notificationType =='AddToTaskSpaceActionError' || 
						notification.notificationType =='AddToTaskSpaceError' || 
						notification.notificationType =='AddToTaskSpaceWarning' || 
						notification.notificationType =='Utilized80PercentOfUserQuota' || 
						notification.notificationType =='ExceededUserQuota')) {
					status = false;
				}
				return status;
			};
			
			vm.openNotification = function($event,notification) {
				
				switch(notification.notificationType) {
				case "DocumentShare":
				case "DocumentComment":
				case "Mentioned":
				case "SECDocument":
				case "NewDocument":
				case "DocumentMoved":
				case "EvernoteConflict":
				case "DocumentTransferred":
					var docInfo = notification.data;
					if(!_.isEmpty(docInfo) && docInfo.DocumentId) {
						closeNotificationsPopover();
						if(docInfo.context == "taskspace") {
							$state.go('taskspace.list.task',{'tsId' : docInfo.taskspaceId,'tsc' : docInfo.tsClientId,'d' : docInfo.DocumentId,'dc' : docInfo.ClientId,'da': docInfo.AnnotationId},{ reload: true });
						} else {
							$state.go("docview",{"docId" : docInfo.DocumentId,"clientId": docInfo.ClientId,"commentId":docInfo.AnnotationId});
						}
					}
					break;
				case "FolderShare":
				case "NewFolder":
				case "FolderMoved":
				case "FolderTransferred":
					var docInfo = notification.data;
					if(!_.isEmpty(docInfo) && docInfo.FolderId) {
						closeNotificationsPopover();
						$state.go("docs",{"folderId" : docInfo.FolderId});
					}
					break;
				case "IntegrationComplete":
					var repInfo = notification.data;
					if(!_.isEmpty(repInfo) && repInfo.folderId) {
						closeNotificationsPopover();
						$state.go("docs",{"folderId" : repInfo.folderId});
					}
					break;
				case "TaskspaceInvite":
				case "TaskspaceComment":
				case "TaskspaceTransferred": 
					var taskspaceInfo = notification.data;
					if(!_.isEmpty(taskspaceInfo) && taskspaceInfo.TaskspaceId) {
						if(taskspaceInfo.AnnotationId) {
							TaskSpaceService.tsCommentId = taskspaceInfo.AnnotationId;
						}
						closeNotificationsPopover();
						openTaskSpace(taskspaceInfo.TaskspaceId,taskspaceInfo.ClientId,null);
					}
					break;
				case "TaskspaceObjectAdded":
					var taskspaceInfo = notification.data;
					if(!_.isEmpty(taskspaceInfo) && taskspaceInfo.TaskspaceId && taskspaceInfo.ObjectId) {
						closeNotificationsPopover();
						openTaskSpaceObject(taskspaceInfo.TaskspaceId,taskspaceInfo.ClientId,taskspaceInfo.ObjectId);
					}
					break;
				case "ActionItemAssigned":
				case "ActionItemChanged": 
					var actionItemInfo = notification.data;
					if(!_.isEmpty(actionItemInfo) && actionItemInfo.TaskId) {
						closeNotificationsPopover();
						openActionItem(actionItemInfo);
					}
					break;
				case "SavedSearchAlert":
					handleSavedSearchAlertNotification(notification);
					break;
				case "PortfolioAlert":
					handlePortfolioAlertNotification(notification);
					break;
				case "PortfolioShare":
					var portfolioInfo = notification.data;
					if(!_.isEmpty(portfolioInfo) && portfolioInfo.PortfolioId) {
						commonService.portfolioShareNotification = portfolioInfo;
						$state.go("portfolios",{},{ reload: true });
					}
					break;
				case "GuestUserRequest":
					var guestUserRequest = notification.data;
					if(!_.isEmpty(guestUserRequest) && guestUserRequest.guestUserId) {
						AdministrationService.guestUserRequest = guestUserRequest;
						$state.go("administration",{},{ reload: true });
					}
					break;
				}
			};
			
			function handleSavedSearchAlertNotification(notification) {
				var documentMatch = notification.data;
				if(!_.isEmpty(documentMatch) && documentMatch.SavedSearchId && documentMatch.DocumentId) {
					try {
						$state.go("search",{"s" : documentMatch.SavedSearchId, "r": documentMatch.DocumentId, "c": documentMatch.ClientId},{ reload: true });
					} catch(e) {
						
					}
				}
			}
			
			function handlePortfolioAlertNotification(notification) {
				var documentMatch = notification.data;
				if(!_.isEmpty(documentMatch) && documentMatch.SavedSearchId && documentMatch.DocumentId) {
					try {
						$state.go("docview",{"docId": documentMatch.DocumentId, "clientId": documentMatch.ClientId},{ reload: true });
					} catch(e) {
						
					}
				}
			}
			
			vm.getNotificationIcons = function(notification) {
				var icon = '<span class="fa fa-bell-o"  style="color: #999;font-size: 16px;"></span>';
				switch(notification.notificationType) {
				case "DocumentShare":
					icon ='<span class="fa fa-file-text-o"  style="color: #999;font-size: 16px;"></span>\
		     			  <span class="fa fa-user" style="position: absolute;left: 5px;top: 10px;font-size: 10px;color: #999;"></span>';
					break;
				case "FolderShare":
					icon ='<span class="fa fa-folder-o"  style="color: #999;font-size: 16px;"></span>\
	     			  <span class="fa fa-user" style="position: absolute;left: 14px;top: 6px;font-size: 10px;color: #999;"></span>';
					break;
				case "DocumentComment":
					icon ='<span class="fa fa-comment-o"  style="color: #999;font-size: 16px;"></span>';
					break;
				case "SECDocument":
				case "NewDocument":
					icon ='<span class="fa fa-file-text-o"  style="color: #999;font-size: 16px;"></span>';
					break;
				case "NewFolder":
					icon ='<span class="fa fa-folder-o"  style="color: #999;font-size: 16px;"></span>';
					break;
				case "SavedSearchAlert":
					icon ='<span class="fa fa-file-text-o"  style="color: #999;font-size: 16px;"></span>\
		     			  <span class="fa fa-search" style="position: absolute;left: 14px;top: 6px;font-size: 10px;color: #999;"></span>';
					break;
				}
				
				return icon;
			};
			
			
			vm.onClickNotification = function($event,notification) {
				if($event) {
					$event.preventDefault();
				}
				vm.openNotification($event,notification);
			};
			
			vm.NtfMarkAsRead = function(event,notification,group) {
				if(event) {
					event.stopPropagation();
				}
				if(!notification.read) {
					var count = vm.myNotificationsCountByGroup[group];
					notificationService.markAsRead(notification.id).then(function(resp) {
						if(resp.status && resp.data.Status) {
							notification.read = true;
							count = count - 1;
							vm.myNotificationsCountByGroup[group] = count;
							getUserNotificationCount();
						}
					});
				}
			};
			 
			vm.deleteNotification = function(event,notification,group) {
				if(event) {
					event.stopPropagation();
				}
				var count = vm.myNotificationsCountByGroup[group];
				notificationService.deleteNotification(notification.id).then(function(resp) {
					if(resp.status && resp.data.Status) {
						if(!notification.read) {
							count = count - 1;
							vm.myNotificationsCountByGroup[group] = count;
						}
						getUserNotificationCount();
						vm.UserNotifications[group] = _.without(vm.UserNotifications[group], _.findWhere(vm.UserNotifications[group], {
							  id: notification.id
						}));
						if(_.isEmpty(vm.UserNotifications[group])) {
							delete vm.UserNotifications[group];
						}
						
					}
				});
			};
			
			function getMenuItems() {
				var menuItems = userService.getUserSettingsKeyList("navigation_");
				if(!_.isEmpty(menuItems) && vm.userinfo) {	// && !vm.userinfo.isGuestUser
					_.each(menuItems,function(item){
						var menu = {};
						switch(item) {
						case "navigation_Dashboard":
						case "navigation_Portfolios":
							menu = userService.getUiSetting(item,"route");
							if(menu.show) {
								vm.navMenu.push(menu);
							}
							break;
						case "navigation_ActionItems":
							menu = userService.getUiSetting(item,"route");
							menu.reload = true;
							if(menu.show) {
								vm.navMenu.push(menu);
							}
							break;
						case "navigation_Taskspace":
							menu = userService.getUiSetting(item,"route");
							menu.params = {
									digest:false
							};
							menu.reload = true;
							menu.isDigest = false;
							if(menu.show) {
								vm.navMenu.push(menu);
							}
							break;
						case "navigation_Digest":
							menu = userService.getUiSetting(item,"route");
							menu.params = {
									digest:true
							};
							menu.reload = true;
							menu.isDigest = true;
							if(menu.show) {
								vm.navMenu.push(menu);
							}
							break;
						case "navigation_Research":
							menu = userService.getUiSetting(item,"route");
							menu.params = {
									folderId:vm.rootFolder
							};
							if(menu.show) {
								vm.navMenu.push(menu);
							}
							break;
						case "navigation_Inbox":
							menu = userService.getUiSetting(item,"route");
							menu.reload = true;
							if(menu.show) {
								vm.navMenu.push(menu);
							}
							break;
						case "navigation_Notification":
							menu = userService.getUiSetting(item);
							if(menu.show) {
								vm.notificationsBtn = menu;
							}
							break;
						case "navigation_Search":
							menu = userService.getUiSetting(item,"route");
							menu.reload = true;
							if(menu.show) {
								vm.searchBtn = menu;
							}
							break;
						case "navigation_AppMenu":
							menu = userService.getUiSetting(item);
							if(menu.show) {
								vm.additionalMenuBtn = menu;
							}
							break;
						case "navigation_Help":
							menu = userService.getUiSetting(item);
							if(menu.show) {
								vm.helpBtn = menu;
							}
							break;
						}
					});
				}
			}
			
			function getAdditionalMenuItems() {
				var additionalMenuItems = userService.getUserSettingsKeyList("additionalNavigation_");
				if(!_.isEmpty(additionalMenuItems) && vm.userinfo) {	// && !vm.userinfo.isGuestUser
					_.each(additionalMenuItems,function(item){
						var menu = {};
						switch(item) {
							case "additionalNavigation_OneDrive":
							case "additionalNavigation_TimeLog":
							case "additionalNavigation_Box":
							case "additionalNavigation_DropBox":
							case "additionalNavigation_LinkedIn":
							case "additionalNavigation_Evernote":
							case "additionalNavigation_Google":
							case "additionalNavigation_Notion":
							case "additionalNavigation_Webex":
								menu = userService.getUiSetting(item,"modal");
								break;
							case "additionalNavigation_UserPreferences":
							case "additionalNavigation_Slack":
							case "additionalNavigation_Asana":
							case "additionalNavigation_DeleteMe":
							/*case "additionalNavigation_ManageNotifications":*/
								menu = userService.getUiSetting(item,"route");
								break;
						}
						var isIntegraionMenu = false;
						_.each(navigationService.integrations,function(integration){
							var itemArray = item.split("_");
							var itemValue = "";
							if(_.isArray(itemArray) && itemArray.length > 1) {
								itemValue = itemArray[1];
							}
							if(!_.isEmpty(itemValue) && itemValue.toLowerCase() == integration.toLowerCase()) {
								isIntegraionMenu = true;
							}
						});
						if(menu.show) {
							if(isIntegraionMenu) {
								vm.integrationsMenuItems.push(menu);
							} else {
								vm.additionalMenuItems.push(menu);
							}
						}
					});
					
					vm.integrationsMenuItems = commonService.sortSelectedItems(vm.integrationsMenuItems,"label",false);
					var additionalMenu = commonService.sortSelectedItems(vm.additionalMenuItems,"label",false);
					if(!_.isEmpty(additionalMenu)) {
						vm.additionalMenuItems = angular.copy(additionalMenu);
					}
				}
			}
			
			vm.loader = false;
			vm.getMyNotificationsCountByGroup = function() {
				vm.loader = true;
				notificationService.getMyNotificationsCountByGroup().then(function(resp){
					if (resp.status == 200 && resp.data.Status) {
						vm.isNotficationOpen = true;
						_.each(resp.data.Data,function(objects,key){
							if(vm.ntfGroupSettings && vm.ntfGroupSettings[key]) {
								vm.ntfGroupSettings[key].isOpen = false;
							} else {
								vm.ntfGroupSettings[key] = {"label" : key};  //this is for to toggle newly added group
								vm.ntfGroupSettings[key].isOpen = false;
							}
						});
						
						vm.myNotificationsCountByGroup = resp.data.Data;
					}
				})['finally'](function() {
					vm.loader = false;
				});
			};
			
			vm.isNotificationsEmpty = function() {
				var status = false;
				if(_.isEmpty(vm.myNotificationsCountByGroup)) {
					status = true;
				}
				return status;
			};
			
			vm.getNtfsCountByGroupType = function(group){
				var count = vm.myNotificationsCountByGroup[group];
				return count;
			};
			
			vm.getGruopToggleStatus = function(group) {
				return vm.ntfGroupSettings[group].isOpen;
			};	
			
			vm.getUpdatedNotifications = function(event,group) {
				if(event) {
					event.preventDefault();
					event.stopPropagation();
				}
				vm.notficationsStartFrom = angular.copy(notificationService.startFrom);
				vm.UserNotifications[group] = [];
				getMyNotificationsByGroup (group,function(){
					if(!_.isEmpty(vm.updatedNotificationsCountByGroup)) {
						vm.myNotificationsCountByGroup[group] = vm.myNotificationsCountByGroup[group] + vm.updatedNotificationsCountByGroup[group];
						vm.updatedNotificationsCountByGroup = {};
					}
				});
			};
			
			function getMyNotificationsByGroup (group,cb) {
				notificationService.getMyNotificationsByGroup(group,vm.notficationsStartFrom,vm.notficationsLimitSize).then(function(resp){
					if(resp.status == 200 && resp.data.Status && resp.data.Data) {
						_.each(resp.data.Data,function(ntf){
							ntf.data = angular.fromJson(ntf.data);
						});
						if(_.isEmpty(vm.UserNotifications[group])) {
							vm.UserNotifications[group] = [];
						}
						vm.UserNotifications[group] = vm.UserNotifications[group].concat(resp.data.Data);
						if(typeof cb == "function") {
							cb();
						}
					}
				})['finally'](function() {
					vm.showNotificationsloader = false;
				});
			}
			
			vm.showNotificationsloader = false;
			vm.toggleNtfsGroup = function($event,group) {
				if($event) {
					$event.preventDefault();
				    $event.stopPropagation();
				}
				vm.ntfGroupSettings[group].isOpen = !vm.ntfGroupSettings[group].isOpen;
				
				vm.UserNotifications = {};
				vm.notficationsStartFrom = angular.copy(notificationService.startFrom);
				vm.notficationsLimitSize = angular.copy(notificationService.limitSize);
				
				if(vm.ntfGroupSettings[group].isOpen) {
					vm.showNotificationsloader = true;
					getMyNotificationsByGroup (group);
				}
			};
			
			vm.loadMoreNotifications = function(group) {
				if(_.isEmpty(vm.UserNotifications)) {
					//vm.showNotificationsloader = true;
					getMyNotificationsByGroup (group);
				} else {
					if(vm.ntfGroupSettings[group].isOpen) {
						if(vm.UserNotifications[group] && (vm.UserNotifications[group].length == (vm.notficationsStartFrom + vm.notficationsLimitSize))) {
							//vm.showNotificationsloader = true;
							vm.notficationsStartFrom = vm.notficationsStartFrom + vm.notficationsLimitSize;
							if(vm.updatedNotificationsCountByGroup[group] && vm.updatedNotificationsCountByGroup[group] > 0) {
								vm.notficationsStartFrom = vm.notficationsStartFrom + vm.updatedNotificationsCountByGroup[group];
							}
							getMyNotificationsByGroup (group);
						} else if(vm.updatedNotificationsCountByGroup[group] > 0 && (vm.UserNotifications[group].length+vm.updatedNotificationsCountByGroup[group]) == (vm.notficationsStartFrom + vm.notficationsLimitSize)){
							vm.notficationsStartFrom = vm.notficationsStartFrom + vm.notficationsLimitSize;
							getMyNotificationsByGroup (group);
						} else if(vm.updatedNotificationsCountByGroup[group] > 0 && (vm.UserNotifications[group].length+vm.updatedNotificationsCountByGroup[group]) > (vm.notficationsStartFrom + vm.notficationsLimitSize)){
							vm.notficationsStartFrom = vm.notficationsStartFrom + ((vm.UserNotifications[group].length+vm.updatedNotificationsCountByGroup[group]) - (vm.notficationsStartFrom + vm.notficationsLimitSize));
							vm.notficationsStartFrom = vm.notficationsStartFrom + vm.notficationsLimitSize;
							getMyNotificationsByGroup (group);
						}
					}
				}
			}
			
			vm.getNotificationsByGropup = function(group) {
				return vm.UserNotifications[group];
			};
			
			vm.closeMenus = function() {
		    	vm.isNotficationOpen = false;
		    	vm.isMoreTabsMenuOpen = false;
		    	vm.isIntegrationsMenuOpen = false;
		    	vm.isUserSettingsOpen = false;
		    	vm.isHelpMenuOpen = false;
		    }; 
		    
		    function closeOtherMenus(menu) {
		    	switch(menu) {
		    		case "Notifications":
		    			vm.isMoreTabsMenuOpen = false;
						vm.isUserSettingsOpen = false;
				    	vm.isHelpMenuOpen = false;
				    	break;
		    		case "MoreTabsMenu":
		    			vm.isNotficationOpen = false;
				    	vm.isUserSettingsOpen = false;
				    	vm.isHelpMenuOpen = false;
				    	break;
		    		case "UserSettings":
		    			vm.isNotficationOpen = false;
				    	vm.isMoreTabsMenuOpen = false;
				    	vm.isHelpMenuOpen = false;
				    	break;
		    		case "HelpMenu":
		    			vm.isNotficationOpen = false;
		    			vm.isMoreTabsMenuOpen = false;
		    			vm.isUserSettingsOpen = false;
		    	}
		    }
		    
		    vm.toggleMoreTabsMenu = function($event) {
		    	$event.stopPropagation();
		    	closeOtherMenus("MoreTabsMenu");
		    	vm.isMoreTabsMenuOpen = ! vm.isMoreTabsMenuOpen;
		    };
		    
		    vm.toggleIntegrationsMenu = function($event) {
		    	vm.isIntegrationsMenuOpen = ! vm.isIntegrationsMenuOpen;
		    };
		    
		    vm.toggleUserSettings = function($event) {
		    	$event.stopPropagation();
		    	closeOtherMenus("UserSettings");
		    	vm.isUserSettingsOpen = ! vm.isUserSettingsOpen;
		    	if(vm.isUserSettingsOpen) {
		    		getUsedSpace();
		    	}
		    };
		    
		    vm.openNotifications = function($event) {
		    	if(vm.notificationsBtn.isEnabled) {
		    		$event.stopPropagation();
		    		closeOtherMenus("Notifications");
			    	if(!vm.isNotficationOpen) {
			    		vm.getMyNotificationsCountByGroup();
					} else {
						vm.isNotficationOpen = false;
					}
		    	}
		    };
		    
		    /* scope events */
		    
		    $scope.$on('SysPrefChanged',function(evt,msg){
				if(msg && msg.type == "VDVCMenuItems") {
					var menuItem = _.findWhere(vm.navMenu,{"label":msg.key});
					if(menuItem) {
						menuItem.show = (msg.value == "Hidden") ? false : true; 
						menuItem.isEnabled = (msg.value == "Enabled") ? true : false;
					}
				}
				if(msg && msg.type == "VDVCAdditionalMenuItems") {
					var menuItem = _.findWhere(vm.additionalMenuItems,{"value":msg.key});
					if(menuItem) {
						menuItem.show = (msg.value == "Hidden") ? false : true; 
						menuItem.isEnabled = (msg.value == "Enabled") ? true : false;
					}
				}
			});
		    
		    $scope.$on('$routeChangeSuccess', function () {
		        vm.isCollapsed = true;
		    });
		    
		    $scope.$on("$destroy",function handleDestroyEvent() {
		    	cacelNotificationPolling();   
		    	SocketFactory.closeAllSockets();
			});
		    
		    
		    //Temp Implementation 
		    
		    function OpenTimeLogModal() {
		    	
				$uibModal.open({
				      animation: true,
				      templateUrl: 'app/components/common/TimeLog/TimeLog.html',
				      controller: 'TimeLogModalController',
				      appendTo : $('.rootContainer'),
				      size: 'lg',
				      controllerAs: 'vm',
				      backdrop: 'static'
				});
			}
		    
			function getUsedSpace() {
				userService.getUsedSpace().then(function(resp){
					if (resp.status == 200 && resp.data.Status) {
						if(vm.rootFolder == resp.data.RootFolder) {
							var usedSpaceInBytes = resp.data.UserRootFolderSize;
							var userAllocatedSpaceInBytes = resp.data.UserAllocatedSize;
							var usedSpace = $filter('filesize')(usedSpaceInBytes,vm.sizePrecision);
							var UserAllocatedSize = $filter('filesize')(resp.data.UserAllocatedSize,vm.sizePrecision);
							vm.userinfo["UsedSpaceInBytes"] = usedSpaceInBytes;
							vm.userinfo["UserAllocatedSpaceInBytes"] = userAllocatedSpaceInBytes;
							vm.userinfo["UsedSpace"] = usedSpace;
							vm.userinfo["AllocatedSize"] = UserAllocatedSize;
							if(resp.data.SizeValidation) {
								vm.sizeValidation = resp.data.SizeValidation;
							} else {
								vm.sizeValidation = null;
							}
						} else {
							vm.userinfo["UsedSpace"] = "Root folder not matched";
						}
					}
				});
			}
			
			function getHelpTopicsList (stateName) {
				var helpTopicsList = {currentStateHelpTopics:{},otherHelpTopics:[]};
				var helpTopicOrder = {value : "alphaNumericAscending"};
				if(appdata && !_.isEmpty(appdata.HelpDisplay)) {
					helpTopicOrder = _.findWhere(appdata.HelpDisplay,{"key" : "helpTopicOrder"});
				}
				if(!_.isEmpty(helpTopicOrder) && helpTopicOrder.value == "helpInfoMapping") {
					var HelpInfoMap = appdata.HelpInfoMap;
					if(!_.isEmpty(HelpInfoMap)) {
						stateName = stateName.split(".")[0];
						var currentHelpInfoMap = _.findWhere(HelpInfoMap,{"key":stateName});
						var currentHelpInfoValue;
						var currentHelpTopic;
						if(currentHelpInfoMap) {
			    			currentHelpInfoValue = currentHelpInfoMap.value;
			    		} else {
			    			currentHelpInfoMap = _.findWhere(HelpInfoMap,{"key":"default"});
			    			if(currentHelpInfoMap) {
				    			currentHelpInfoValue = currentHelpInfoMap.value;
				    		}
			    		}
						if(!_.isEmpty(currentHelpInfoValue)) {
							currentHelpTopic = _.findWhere(vm.helpTopics,{"title":currentHelpInfoValue.trim()});
						}
						for(var i = 0; i < vm.helpTopics.length; i++) {
							var helpTopic = vm.helpTopics[i];
		    				if(currentHelpTopic && helpTopic && currentHelpTopic == helpTopic) {
		    					helpTopicsList.currentStateHelpTopics = helpTopic
		    				} else if(helpTopic && helpTopic.title !== "HypothesisWelcome") {
		    					helpTopicsList.otherHelpTopics.push(helpTopic);
		    				}
		    			}
					} else {
						helpTopicsList.otherHelpTopics = angular.copy(vm.helpTopics);
					}
				} else if(!_.isEmpty(helpTopicOrder) && helpTopicOrder.value == "alphaNumericAscending") {
					helpTopicsList.otherHelpTopics = angular.copy(vm.helpTopics);
				} else {
					helpTopicsList.otherHelpTopics = angular.copy(vm.helpTopics);
				}
				
				return helpTopicsList;
			}
			
			function toggleHelp ($event) {
				if(vm.helpBtn.isEnabled) {
					if($event) {
						$event.stopPropagation();
					}
			    	closeOtherMenus("HelpMenu");
			    	var stateName = $state.current.name;
			    	var helpTextType = getHelpTextType();
			    	if (helpTextType == "helpTextPopupWithMenu") {
						openHelpTextModalWM(stateName);
					} else {
						vm.isHelpMenuOpen = ! vm.isHelpMenuOpen;
				    	if(vm.isHelpMenuOpen) {
				    		vm.helpTopicSearchTxt = "";
				    		originalStateHelpTopics = getHelpTopicsList(stateName);
				    		vm.stateHelpTopics = angular.copy(originalStateHelpTopics);
				    	}
					}
				}
			}
			
			function searchHelpTopic(event) {
				if(event.which !== 13) {
					if(!_.isEmpty(originalStateHelpTopics)) {
						var stateHelpTopicsTemp = angular.copy(originalStateHelpTopics);
						vm.stateHelpTopics = HelpService.searchHelpTopic(stateHelpTopicsTemp,vm.helpTopicSearchTxt);
					}
				}
			}
			
			function collapsePanel(topic) {
				topic.collapsed = topic.collapsed ? false : true;
			}
			
			var helpTopicModalInstance;
			function openHelpTextModal (topic){
				if(helpTopicModalInstance) {
					helpTopicModalInstance.close();
				}
				helpTopicModalInstance = $uibModal.open({
					  animation: true,
					  templateUrl: 'app/components/Help/HelpTextModal/HelpTextModalTemplate.html',
				      controller: 'HelpTextModalController',
				      aappendTo : $('body'),
				      size: 'lg',
				      controllerAs: 'vm',
				      backdrop: 'static',
				      windowClass: 'help-text-modal-window',
				      backdropClass: "help-text-modal-backdrop",
				      resolve: {
					      topic : topic
				      }
				});
				
				helpTopicModalInstance.result.then(function (resp) {
					
				}, function () {
				      
				});
			}
			
			var helpTopicModalWMInstance;
			function openHelpTextModalWM (stateName){
				if(helpTopicModalWMInstance) {
					helpTopicModalWMInstance.close();
				}
				helpTopicModalWMInstance = $uibModal.open({
					  animation: true,
					  templateUrl: 'app/components/Help/HelpTextWithMenu/HelpTextModalWMTemplate.html',
				      controller: 'HelpTextModalWMController',
				      appendTo : $('body'),
				      size: 'lg',
				      controllerAs: 'vm',
				      backdrop: 'static',
				      windowClass: 'help-text-modal-window',
				      backdropClass: "help-text-modal-backdrop",
				      resolve: {
				    	  stateHelpTopics : getHelpTopicsList(stateName),
					  }
				});
				
				helpTopicModalWMInstance.result.then(function (resp) {
					
				}, function () {
				      
				});
			}
			
			function destroyCkeditor() {
				if(CKEDITOR.instances['help-text-editor']) {
					CKEDITOR.instances['help-text-editor'].destroy();
				}
			}
			
			function ckEditorEvents(body){
				body.find("a[href^=\\#]").off("click").on("click",function(event){
					event.preventDefault();
					var nm = $(this).attr('href').replace(/^.*?(#|$)/,'');
					var  el = body.find($(this).attr("href"));
					if(el.length > 0) {
						el[0].scrollIntoView();
					} else if(body.find('[name="'+nm+'"]').length > 0){
						body.find('[name="'+nm+'"]')[0].scrollIntoView();
					}
				});
				body.find("a").off("mouseenter").on("mouseenter",function(event){
					if(typeof event.currentTarget.href != 'undefined' && this.getAttribute("href").charAt(0) == "#") {
						return false;
					}
					if(typeof event.currentTarget.href != 'undefined' && event.ctrlKey == true) {			
						$(this).css("cursor","pointer");
					}else{
						$(this).css("cursor","auto");
					}
					$('#help-link-meta-info').hide();
					vm.linkCrdInfo = {
							showLoader : true
					};
					
					if((typeof event.currentTarget.href != 'undefined') && event.ctrlKey == false) {
						
						var targetRect = event.currentTarget.getBoundingClientRect();
						
						var elem = event.currentTarget;
						var urlObj = urlParser.parseUrl(elem.href);
						
						if(urlObj.pathname && urlObj.pathname.toLowerCase() == "/vdvc/link") {
							var linkId = urlObj.searchObject.id;
							var target = elem.target;
							if(!_.isEmpty(linkId)) {
								DeepLinkService.openLink(linkId.toString()).then(function(resp) {
									if(resp.status == 200 ) {
							    		if(resp.data.Status) {
							    			processLinkInfo(resp.data.Link);
								    		vm.linkCrdInfo.target = event.currentTarget;
							    		} else {
							    			vm.linkCrdInfo.target = event.currentTarget;
							    			vm.linkCrdInfo.errorMsg = 'Either Link is invalid or deleted';
							    			vm.linkCrdInfo.showError = true;
							    		}
							    		rePositionPopOverCard(targetRect,$('#help-link-meta-info'),1000);
							    	} 
							    })['finally'](function() {
							    	hideLinkLoader();
							    });
							}
						} else{
							
							var postdata = {
								"externalUrl" : elem.href	
							};
							
							DeepLinkService.getExternalMetaTags(postdata).then(function(resp) {
								if(resp.status == 200 ) {
						    		if(resp.data.Status) {
						    			processLinkInfo(resp.data.Link);
							    		vm.linkCrdInfo.target = event.currentTarget;
						    		} else {
						    			vm.linkCrdInfo.target = event.currentTarget;
						    			vm.linkCrdInfo.errorMsg = 'Either Link is invalid or deleted';
						    			vm.linkCrdInfo.showError = true;
						    		}
						    		rePositionPopOverCard(targetRect,$('#help-link-meta-info'),1000);
						    	} 
						    })['finally'](function() {
						    	hideLinkLoader();
						    });
							
							vm.linkCrdInfo.url = elem.href;
							vm.linkCrdInfo.text = elem.href;
							vm.linkCrdInfo.target = event.currentTarget;
							hideLinkLoader();
						}
					}else{
						vm.linkCrdInfo = {};
					}
				});
			}
			
			function hideLinkLoader() {
		        var timer = $timeout(function() {
		        	if(vm.linkCrdInfo) {
		        		vm.linkCrdInfo["showLoader"]  = false;
		        	}
		        	$timeout.cancel(timer);
		        }, 100);
			}
			
			function rePositionPopOverCard(targetRect,popElement,time) {
				
				$timeout.cancel(toolBarTimer);
				var toolBarTimer = $timeout(function() {
					var frame = $("#cke_help-text-editor").find("iframe");
					var frameWidth = frame.innerWidth();
					var frameHeight = frame.outerHeight();
					var framePos = frame.offset();
					//var targetRect =target.getBoundingClientRect();
					
					var link = popElement; //$('#help-link-meta-info');
					var linkWidth = link.outerWidth();
					var linkHeight = link.outerHeight();
					if(linkWidth > frameWidth) {
						link.css({"width":frameWidth+"px"});
					}
					
					var top = framePos.top+targetRect.bottom;
					var left = (framePos.left+targetRect.left)+((targetRect.width/2)-(linkWidth/2));
					
					if(!isNaN(left)) {
						if((left+linkWidth) > (framePos.left+frameWidth)) {
							left = left - linkWidth;
						}
						if(left < framePos.left) {
							left = framePos.left;
						}
					}
					if(!isNaN(top)) {
						if((top+linkHeight) > (framePos.top+frameHeight)) {
							top = top - (targetRect.height+linkHeight);
						}
						if(top < framePos.top) {
							top = framePos.top;
						}
					}
					var elemCss = {
							"display":"block",
							"top" : top+'px',
							'left': left+'px'
					};
					
					link.css(elemCss);
	        	},time);
			}
			
			function processLinkInfo(LinkInfo) {
				if(LinkInfo.metaInfo) {
					var info = LinkInfo.metaInfo; 
					if(info.imageUrl){
						var iw = 60,
							ih = 60,
							aspratio = 0,
							mW = 350,
							mH = 250;
						if(info.imageWidth && info.imageHeight) {
							if(info.imageWidth > mW) {
								aspratio = mW/info.imageWidth;
								iw = mW;
								ih = (aspratio*info.imageHeight);
							} else if(info.imageHeight > mH){
								aspratio = mH/info.imageHeight;
								iw = (aspratio*info.imageWidth);
								ih = mH;
							} else {
								iw = info.imageWidth;
								ih = info.imageHeight;
							}
						}
						info.iw = iw;
						info.ih = ih;
					}	
				}
				
				var showTitile = false;
				vm.linkCrdInfo = LinkInfo.info;
	    		vm.linkCrdInfo.metaInfo = LinkInfo.metaInfo;
	    		vm.linkCrdInfo.url = LinkInfo.url;
	    		if(LinkInfo.metaInfo && LinkInfo.metaInfo.title) {
	    			showTitile = true;
	    		}
	    		vm.linkCrdInfo.showTitle = showTitile;
			}
			
			function CreateNotes(editorId){
				
				var t = $timeout(function() {
					try {
						vm.instance = CKEDITOR.replace( editorId,{
							readOnly: readOnly,
							width: "100%",
							language : "en",
							skin : 'moono-lisa,/resources/js/ckeditor/skins/moono-lisa/' ,
							baseHref : "/",
							removePlugins : "stylesheetparser, elementspath,toolbar",
							resize_enabled : false,
							//allowedContent: true,
							fullPage: true,
							forceEnterMode : true
						});
					} catch(e) {
						
					}

					if (vm.instance) {
						CKEDITOR.on('instanceReady', function(evt) {
							var ckeId = $('.cke.cke_reset').attr("id")
							var h = "100%";
							if(ckeId === "cke_help-text-editor") {
								h = $('.cke.cke_reset').find(".cke_inner").outerHeight();
								$('.cke.cke_reset').find(".cke_contents").height(h);
							}
							if ( evt.editor && evt.editor.status == "ready") {
								evt.editor.resize("100%",h);
							}
							var iframe = $('.cke_wysiwyg_frame');//.contents();
							vm.iframedoc = iframe[0].contentDocument || iframe[0].contentWindow.document;
						});
						vm.instance.on( 'contentDom', function() {
							var body = this.document.getBody();
							ckEditorEvents($(body.$));
							var editable = vm.instance.editable();
							editable.attachListener( editable, 'click', function( event ) {
								$('#help-link-meta-info').hide();
								vm.linkCrdInfo = null;
							});
						});
					}
					$timeout.cancel(t);
				},500);
				
			}
			function selectHelpTopic(topic) {
				destroyCkeditor();
				vm.selectedHelpTopic = topic;
				vm.content = vm.selectedHelpTopic.helpText;
				CreateNotes("help-text-editor");
			}
			
			
			function openHelpTopic (topic) {
				
				var helpTextType = getHelpTextType();
				
				if(helpTextType == "helpTextPopup"){
					vm.isHelpMenuOpen = false;
					openHelpTextModal (topic);
				} else if (helpTextType == "helpTextSideMenu") {
					selectHelpTopic(topic);
				}
				
			}
			
			function openRegisterModal (size) {
				var modalInstance = $uibModal.open({
				      animation: true,
				      templateUrl: 'app/components/RegisterProvisionalUser/Registration/RegisterProUserModal.html',
				      controller: 'RegisterProUserModalController',
				      controllerAs: 'rpmc',
				      backdrop: 'static',
				      size: size,
				      resolve : {
					    	provisionalUser : {},
					  }
				    });
				
				modalInstance.result.then(function (Status) {
					/*if(Status) {
						vm.logout();
					}*/
					vm.logout();
				});
			}
			
			function showTipsWizard() {
				var currentRoute = $state.current.name.split(".")[0];
				if(($state.current.name == "taskspace.list.task" || 
						(currentRoute == "taskspace" && !_.isEmpty($state.current.params) && 
								!$state.current.params.digest)) && !hasZeroTaskspaces) {
					return true;
				}
				return false;
			}
			
			function startTaskSpaceTipTour(showTourTipOnlogin) {
				$rootScope.$broadcast('TipsWizardStarted');
				$rootScope.tipsWizardStarted = true;
				vm.isTipsWizardStarted = true;
				var openTSDigestTimeout = $timeout(function() {
					var divElement = angular.element(document.querySelector('.rootContainer'));
					var childScope = $scope.$new();
					childScope["showTourTipOnlogin"] = showTourTipOnlogin;
					var template = '<taskspace-tip-tour></taskspace-tip-tour>';
					var appendHtml = $compile(template)(childScope);
					divElement.append(appendHtml);
					$timeout.cancel(openTSDigestTimeout);
				}, 10);
			}
		}
	})();

