;(function() {
	angular.module("vdvcApp").config(appConfig); 
	
	const Roles = {
			user : "User",
			guest : "Guest",
			tsguest: "TSGuest",
			orgadmin: "OrgAdmin",
			VDVCAdmin: "VDVCAdmin",
			VDVCSiteAdmin: "VDVCSiteAdmin",
			provisional: "Provisional",
			
	};
	
	var tsGuestResolve = ['userInfo','$q','$state','$stateParams','_','$timeout',function(userInfo,$q,$state,$stateParams,_,$timeout) {
		var deferred = $q.defer();
		var self = this;
		if(self.authRequired && userInfo && userInfo.hasLogin) {
			 
			// Block TSGuest if not allowed
			 if(userInfo.UserRole == Roles.tsguest && !self.allowTSGuest) {
				deferred.reject({"error" : "TsGuest not allowed","goTo" : "login","params": {"fromCode" : true,"dontRedirect" : true}});
			 }
			 
			// Block TSGuest if the taks space link is not direct document link
			 if(userInfo.UserRole == Roles.tsguest && self.allowTSGuest) {
				 if(self.stateName == "task" && _.isEmpty($stateParams.d) && _.isEmpty($stateParams.dc)) {
					 deferred.reject({"error" : "TsGuest not allowed","goTo" : "login","params": {"fromCode" : true,"dontRedirect" : true}});
				 }
			 }
			 
			 deferred.resolve();
		}
		return deferred.promise;
	}];
	
	var getNewLogoutDurationMillis = function(maintenanceSchedule) {
		var newLogoutDurationMillis = 0;
		var shutdownStartedAt = new Date(maintenanceSchedule.shutdownStartedAt);
		var shutdownStartedTime;
		if(shutdownStartedAt) {
			shutdownStartedTime = shutdownStartedAt.getTime();
		}
		var currentTime = new Date().getTime();
		var logoutDurationMillis = (maintenanceSchedule.shutdownDuration*60*1000);
		newLogoutDurationMillis = logoutDurationMillis - (currentTime - shutdownStartedTime);
		return newLogoutDurationMillis;
	};
	appConfig.$inject = [ '$urlRouterProvider', '$stateProvider','$uibTooltipProvider',
			'uiSelectConfig', '$httpProvider','localStorageServiceProvider',
			'cfpLoadingBarProvider','$provide','$locationProvider','$deviceInfoProvider',
			'markdownProvider','AUTH_EVENTS','FlashProvider'];
	
	
	
	
	
	function appConfig($urlRouterProvider,$stateProvider,$uibTooltipProvider,uiSelectConfig,
			$httpProvider,localStorageServiceProvider,cfpLoadingBarProvider,$provide,
			$locationProvider,$deviceInfoProvider,markdownProvider,AUTH_EVENTS,FlashProvider){
		
		$httpProvider.interceptors.push('GlobalErrorHandler');
		$httpProvider.interceptors.push('spinnerHttpInterceptor');
		
		markdownProvider.config({
			"openLinksInNewWindow" : true,
			"simplifiedAutoLink" : true,
			"literalMidWordUnderscores" : true,
			"tables" : true,
			"strikethrough" : true,
			"tasklists" : true
		});
		
		if (!$httpProvider.defaults.headers.get) {
	        $httpProvider.defaults.headers.get = {};    
	    }    

	    // Answer edited to include suggestions from comments
	    // because previous version of code introduced browser-related errors

	    //disable IE ajax request caching
	    $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
	    // extra
	    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
	    $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
		
		cfpLoadingBarProvider.latencyThreshold = 500;
		cfpLoadingBarProvider.parentSelector = '.loading-bar-container';
		
		uiSelectConfig.theme = 'bootstrap';
		uiSelectConfig.resetSearchInput = true;
		
		localStorageServiceProvider.setPrefix('vdvcApp');
		localStorageServiceProvider.setDefaultToCookie(false);
		localStorageServiceProvider.setStorageType('sessionStorage');
		
		$provide.decorator('$exceptionHandler',exceptionHandler);

		var options = {
				popupDelay: 1000,
	        };
		
		if ($deviceInfoProvider.isTouch) {
				options.trigger = 'none';
		}
		
		$uibTooltipProvider.options(options);
		
		$urlRouterProvider.otherwise(function ($injector, $location) {
			var state = $injector.get('$state');
            state.go('404', { url: $location.path() }, { location: true });
		});
		
		$stateProvider.state('login', {
    	  	url: '/login?',
    	  	params: {
    	  		fromCode: false,
    	  		loginError : ""
            },
            views: {
                content: {
                	//templateUrl : 'app/components/authentication/login.html',
                	templateProvider : ['$deviceInfo','iscookiesEnabled','$templateRequest',function($deviceInfo,iscookiesEnabled,$templateRequest) {
                		if(!iscookiesEnabled) {
							return $templateRequest('app/components/authentication/cookieerror.html');
						}
						if($deviceInfo.isMobile){
                			return $templateRequest('app/components/authentication/Mobile/login.html');
                		} else {
                			return $templateRequest('app/components/authentication/login.html');
                		}
                	}],
                 	controller : 'LoginController',
                }
            },
            resolve: {
                userInfo:['$rootScope','$stateParams','$q','userService','AuthService','TimeLogService', function userInfoResolver($rootScope,$stateParams,$q,userService,AuthService,TimeLogService) { 
                	var deferred = $q.defer();
                	userService.getUserInfo().then(function(usrInfResp) {
            			if(usrInfResp.status == 200 && usrInfResp.data.Status) {
            				if(usrInfResp.data.hasLogin) {
            				   var result = usrInfResp.data;
            					
            				   if(result.UserRole == "TSGuest") {
            					   deferred.resolve();
            				   } else {
            					   userService.storeAppdata(result);
            					   deferred.reject({"error": "Active sessions","goTo": "previous"});
            				   }
            					
            				} else {
 	 	    					deferred.resolve();
 	 	 	    			}
            			}
                	});
                	
                	return deferred.promise;
                }]
            },
            pageName:"Login",
            authRequired: false
      }).state('main', {
		            url: '',
		            views: {
		                content: {
		                	templateUrl : 'app/components/Root/root.html',
		                }
		            },
		            resolve: {
		                userInfo:['$rootScope','userService','$q','$state','appData','AdministrationService', function resolveAuthentication($rootScope,userService,$q,$state,appData,AdministrationService) { 
		                	//return  userService.resolve();
		                	var deferred = $q.defer();
		                	userService.getLoginInfo().then(function(usrLogInfResp) {
		 	 	    			if(usrLogInfResp.status == 200 && usrLogInfResp.data.Status) {
		 	 	    				console.log("hasLogin -- "+ usrLogInfResp.data.hasLogin);
		 	 	    				if(usrLogInfResp.data.hasLogin) {
		 	 	    					if(usrLogInfResp.data.inMaintenanceMode) {
		 	 	    						if(!_.isEmpty(usrLogInfResp.data.ActiveSchedule) && !_.isEmpty(usrLogInfResp.data.ActiveSchedule.Schedule)) {
		 	 	    							var maintenanceSchedule = usrLogInfResp.data.ActiveSchedule.Schedule;
		 	 	    							var newLogoutDurationMillis = getNewLogoutDurationMillis(maintenanceSchedule);
		 	 	    							if(newLogoutDurationMillis < 2000) {
		 	 	    								if(!AdministrationService.isUserRoleAllowed(usrLogInfResp.data.UserRole) || usrLogInfResp.data.UserRole == "TSGuest") {
		 	 	    									deferred.reject({"error" : "Server Is In Maintenance Mode","goTo" : AUTH_EVENTS.serverInMaintenanceMode});
		 	 	    								}
		 	 	    							}
		 	 	    						}
		 	 	    					}
		 	 	    					var appdata = appData.getAppData();
		 	 	    					if(_.isEmpty(appdata["UserId"]) && appdata["UserId"] !== usrLogInfResp.data.UserId) {
		 	 	    						userService.getUserInfo().then(function(usrInfResp) {
	 		 	 	 	  	 	    			if(usrInfResp.status == 200 && usrInfResp.data.Status) {
	 		 	 	 	  	 	    				if(usrInfResp.data.hasLogin) {
	 		 	 	 	  	 	 	    				userService.storeAppdata(usrInfResp.data);
	 		 	 	 	  	 	 	    				console.log("name  -- "+ usrLogInfResp.data.UserName+"  role  -- "+ usrLogInfResp.data.UserRole);
	 		 	 	 	  	 	 	    				deferred.resolve(usrLogInfResp.data);
	 		 	 	 	  	 	    				} else {
	 		 	 	 	  	 	    					deferred.reject({"error" : "Login Required","goTo" : AUTH_EVENTS.notAuthenticated});
	 		 	 	 	  	 	    				} 
	 		 	 	 	  	 	    			} 
	 		 	 	 	  	 				 });
	 		 	 	 	 	    		} else {
	 		 	 	 	 	    		    console.log("name  -- "+ usrLogInfResp.data.UserName+"  role  -- "+ usrLogInfResp.data.UserRole);
	 		 	 	 	 	    		    deferred.resolve(usrLogInfResp.data);
	 		 	 	 	 	    		}
		 	 	    				} else {
		 	 	    					deferred.reject({"error" : "Login Required","goTo" : AUTH_EVENTS.notAuthenticated});
		 	 	    				}
		 	 	    			}
		                	},function() {
		                		deferred.reject({"error" : "Login Required","goTo" : AUTH_EVENTS.notAuthenticated});
		                	});
		                	
		                	return deferred.promise;
		                }],
		                Permissions:['PermissionsService', function resolveAuthentication(PermissionsService) { 
		                	return  PermissionsService.listAllPermissions();
		                }],
		                markdownCss:['$q','$http','Juicify', function getMarkdowncss($q,$http,Juicify) { 
		                	var deferred = $q.defer();
		                	var url = Juicify.markdownCssUrl;
		                	$http.get(url).then(function(resp) {
		                		if(resp.status == 200 && resp.data) {
		                			Juicify.cssMap[url] = resp.data;
		                			deferred.resolve(resp.data);
		                		}
		                	}).finally(function(resp) {
		                		deferred.resolve("");
		                	});
		                	
		                	return deferred.promise;
		                }]
		            }
		      }).state('acount', {
		    		parent: 'main',
		            url: '/acount',
		            views: {
		            	"content@main": {
		                	templateUrl : 'app/components/UserAccount/UserAccountView.html',
		                	controller : 'UserAccountController',
				            controllerAs : 'ac'
		                }
		            },
		            resolve : {
               		 	tsGuest : tsGuestResolve
               	 	},
		            authRequired: true
		      }).state('welcome', {
		    		parent: 'main',
		            url: '/welcome',
		            views: {
		            	"content@main": {
		                	templateUrl : 'app/components/Welcome/WelcomePage.html',
		                	controller : 'WelcomePageController',
				            controllerAs : 'wp'
		                }
		            },
		            resolve : {
               		 	tsGuest : tsGuestResolve
               	 	},
		            authRequired: true,
		            pageName:"Welcome"
		      }).state('private', {
		          parent: 'main',  
		    	  url: '',
		            views: {
		            	"nav@main": {
		                  //templateUrl: 'app/components/navigation/navigation.html'
		                	templateProvider : ['$deviceInfo','$templateRequest',function($deviceInfo,$templateRequest) {
		                		if($deviceInfo.isMobile){
		                			return $templateRequest('app/components/navigation/Mobile/navigation.html');
		                		} else {
		                			return $templateRequest('app/components/navigation/navigation.html');
		                		}
		                	}],
		                }
		            }
		      }).state('link', {
		    		parent: 'private',
		            url: '/link?id&donotShowNavBar',
		            views: {
		            	"content@main": {
		                	controller : 'DeepLinkController',
				            controllerAs : 'lc'
		                }
		            },
		            resolve: {
		                linkInfo:['userInfo','DeepLinkService','$stateParams','$state','$rootScope','$q', function getLinkInfo(userInfo,DeepLinkService,$stateParams,$state,$rootScope,$q) { 
		                	$rootScope.previousState = 'link';
		                	$rootScope.previousStateParams = $stateParams;
		                	var deferred = $q.defer();
		                	if(userInfo.hasLogin) {
		                		DeepLinkService.openLink($stateParams.id).then(function(linkResp) {
			                		deferred.resolve(linkResp);
			                	},function(errorResp) {
			                		deferred.resolve(errorResp);
			                	});
		                	} else {
 	 	    					deferred.reject({"error" : "Login Required","goTo" : AUTH_EVENTS.notAuthenticated});
 	 	    				}
		                	
		                	return deferred.promise;
		                }],
		                tsGuest : tsGuestResolve
		            },
		            authRequired: true,
		            allowTSGuest: true
		      }).state('webannotation', {
		    		parent: 'private',
		            url: '/webannotation?target&annotationId&cid&tsId&actualUrl',
		            views: {
		            	"content@main": {
		                	controller : 'WebAnnotationController',
				            controllerAs : 'wc'
		                }
		            },
		            resolve: {
		            	useragent:['commonService', function sendUseragent(commonService) { 
		                	return  commonService.sendUseragentinfo();
		                }],
		                tsGuest : tsGuestResolve
		            },
		            authRequired: true,
		            allowTSGuest: true,
		            pageName:"Web Annotation"
		      }).state('models', {
		    		parent: 'private',
		            url: '/models',
		            views: {
		            	"content@main": {
		                	templateUrl : 'app/components/vdvcModel/VdVcModel.html',
		                	controller : 'VdVcModelController',
		                }
		            },
		            resolve : {
               		 	tsGuest : tsGuestResolve
               	 	},
		            authRequired: true
		      }).state('vApps', {
		    		parent: 'private',
		            url: '/vApps',
		            views: {
		            	"content@main": {
		                	 templateUrl : 'app/components/vapp/vApp.html',
		                }
		            },
		            resolve : {
               		 	tsGuest : tsGuestResolve
               	 	},
		            authRequired: true,
		            pageName:"VApps"
		      }).state('actionitems', {
		    	  	parent: 'private',
		    	  	url: '/actionitems',
		            views: {
		            	"content@main": {
		            		templateUrl : 'app/components/ActionItems/ActionItemsTemplate.html',
		                	controller : 'ActionItemsController',
		                	controllerAs : 'aic'
		                }
		            },
		            resolve : {
               		 	tsGuest : tsGuestResolve
               	 	},
		            authRequired: true,
		            pageName:"ActionItems"
		      }).state('actionitems.actionitem', {
		    	  	url: '/actionitem/:actionItemId/:clientId',
		            views: {
		            	"content": {
		                	templateUrl : 'app/components/ActionItems/View/ViewActionItemTemplate.html',
		                	controller : 'ViewActionItemController',
		                	controllerAs: 'vaic',
		                }
		            },
		            resolve : {
               		 	tsGuest : tsGuestResolve
               	 	},
		            authRequired: true,
		            pageName:"ActionItems"
		      }).state('taskspace', {
		    	  	parent: 'private',
		    	  	url: '',
		            views: {
		            	"content@main": {
		                	template : '<div class="full" data-ui-view data-name="content"></div>',
		                	controller:['$rootScope','$scope','TaskSpaceEventListner',function($rootScope,$scope,TaskSpaceEventListner) {
		                		function init() {
		                			if(!TaskSpaceEventListner.isConnected()) {
		                				TaskSpaceEventListner.reconnect();
			                		}
		                		}
		                		
		                		$scope.$on('$destroy',function() {
		                			TaskSpaceEventListner.close();
		                		});
		                		
		                		init();
		                	}]
		                }
		            },
		            pageName:"TaskSpace"
		      }).state('taskspace.list', {
		    	   	url: '/list',
		    	   	params: {
		                digest: false
		            },
		            resolve:{
		            	digest: ['$stateParams', function($stateParams){
		                    return $stateParams.digest;
		                }]
		            },
		            views: {
		                "content": {
		                	//templateUrl : 'app/components/TaskSpace/taskSpaceList.html',
		                	templateProvider : ['$deviceInfo','$templateRequest','TaskSpaceService','$stateParams',function($deviceInfo,$templateRequest,TaskSpaceService,$stateParams) {
		                		if(TaskSpaceService.view == "3pane" || $stateParams.digest) {
	                				return $templateRequest('app/components/TaskSpace/ts-view-tmpl.html');
                        		}
	                			
	                			return $templateRequest('app/components/TaskSpace/taskSpaceList.html');
		                	}],
		                	controller : 'TaskSpaceListController',
		                	controllerAs : 'vm'
		                }
		            },
		            authRequired: true,
		            pageName:"TaskSpace"
		      }).state('taskspace.list.task', {
		    	   	url: '/task/:tsId?tsc&d&dc&da',
		            views: {
		                "content": {
		                	//templateUrl : 'app/components/TaskSpace/taskSpace.html',
		                	controller : 'TaskSpaceController',
		                	controllerAs : 'vm',
		                	templateProvider : ['TaskSpaceService','$stateParams','$templateRequest','$deviceInfo',function(TaskSpaceService,$stateParams,$templateRequest,$deviceInfo) {
		                		return TaskSpaceService.getTaskSpaceState($stateParams.tsc,$stateParams.tsId).then(function(resp){ 
		                        	if (resp.status == 200 && resp.data.Status) {
		                        		var taskSpaceState = resp.data.TaskspaceState;
		                        		var layout = taskSpaceState.currentLayout ? taskSpaceState.currentLayout : 'Single';
		                        		layout = 'Single';
		                        		return $templateRequest('app/components/TaskSpace/ts-view-'+layout+'-tmpl.html');
		                        	} else {
		                        		return $templateRequest('app/components/TaskSpace/ts-view-Single-tmpl.html');
		                        	}
	                        	});
		                    }]
		                }
		            },
		            resolve : {
               		 	tsGuest : tsGuestResolve
               	 	},
		            authRequired: true,
		            stateName: "task",
		            allowTSGuest: true,
		            pageName:"TaskSpace"
		      }).state('taskspace.list.task.doc', {
		            url: '/doc/:docId',
		            views: {
		            	object1: {
		                	templateUrl : 'app/components/TaskSpace/docViewer.html',
		                	controller : 'DocViewerController',
		                },
		                object2: {
		                	templateUrl : 'app/components/TaskSpace/docViewer.html',
		                	controller : 'DocViewerController',
		                }
		            },
		            resolve : {
               		 	tsGuest : tsGuestResolve
               	 	},
               	    allowTSGuest: true,
		            authRequired: true
		      }).state('taskspace.manage', {
		            url: '/manage/:action',
		            views: {
		                "content": {
		                	//templateUrl : 'app/components/TaskSpace/ManageTaskSpace/manageTaskSpace.html',
		                	templateProvider : ['$deviceInfo','$templateRequest',function($deviceInfo,$templateRequest) {
		                		if($deviceInfo.isMobile){
		                			return $templateRequest('app/components/TaskSpace/ManageTaskSpace/Mobile/manageTaskSpace.mob.html');
		                		} else {
		                			return $templateRequest('app/components/TaskSpace/ManageTaskSpace/manageTaskSpace.html');
		                		}
		                	}],
		                	controller : 'ManageTaskSpaceController',
		                	controllerAs : 'vm'
		                }
		            },
		            resolve : {
               		 	tsGuest : tsGuestResolve
               	 	},
		            authRequired: true,
		            pageName:"Manage"
		      }).state('taskspace.list.digest', {
		            url: '/digest/:tsId?tsc',
		            views: {
		                "content": {
		                	//templateUrl : 'app/components/TaskSpace/ManageTaskSpace/manageTaskSpace.html',
		                	templateProvider : ['$deviceInfo','$templateRequest',function($deviceInfo,$templateRequest) {
		                		return $templateRequest('app/components/AnnotationDigest/digest.tmpl.html');
		                	}],
		                	controller : 'DigestController',
		                	controllerAs : 'dc'
		                }
		            },
		            resolve : {
               		 	tsGuest : tsGuestResolve
               	 	},
		            authRequired: true,
		            pageName:"Digest"
		      }).state('digestsettings', {
		    	  parent: 'private',
		          url: '/digestsettings/:tsId/:tsc?d&da&digestFor&origin',
		          views: {
		                "content@main": {
		                	templateProvider : ['$deviceInfo','$templateRequest',function($deviceInfo,$templateRequest) {
		                		return $templateRequest('app/components/AnnotationDigest/create/AnnotationDigest.html');
		                	}],
		                	controller : 'AnnotationDigestController',
		                	controllerAs : 'ad'
		                }
		            },
		            resolve : {
		            	$uibModalInstance : function() {
		            		return {};
		        		},
		            	systemSttings : function() {
		            		return {};
		        		},
		        		taskspaceInfo : function() {
		        			return {};
		        		},
		        		settings : function() {
		        			return {};
		        		},
		        		digestFor: function() {
		        			return {};
		        		},
		        		linkInfo: function() {
		        			return {};
		        		},
		            	tsGuest : tsGuestResolve
		            },
		            authRequired: true,
		            pageName:"Digest Settings"
		      }).state('digestlinkold', {
		    		parent: 'private',  
		    		url: '/digestlinkold/:linkId/:linkClientId',
		    		views: {
		    			"content@main": {
		    				templateProvider : ['$deviceInfo','$templateRequest',function($deviceInfo,$templateRequest) {
		    					return $templateRequest('app/components/AnnotationDigest/templates/ADLink/DigestLink.tmpl.html');
		    				}],
		    				//templateUrl : 'app/components/AnnotationDigest/templates/ADLink/DigestLink.tmpl.html',
		    				controller : 'DigestLinkController',
		    				controllerAs : 'dlc'
		    			}
		    		},
		    		resolve : {
		    			tsGuest : tsGuestResolve
		    		},
		    		authRequired: true,
		    		allowTSGuest: true,
		    		pageName:"Digest"
		    	}).state('digestlink', {
		    		parent: 'private',  
		    		url: '/digestlink/:linkId/:linkClientId',
		    		views: {
		    			"content@main": {
		    				templateProvider : ['$deviceInfo','$templateRequest',function($deviceInfo,$templateRequest) {
		    					return $templateRequest('app/components/AnnotationDigest/templates/ADLink/DigestLinkHtml.tmpl.html');
		    				}],
		    				controller : 'DigestLinkHtmlController',
		    				controllerAs : 'dlhc'
		    			}
		    		},
		    		resolve : {
		    			tsGuest : tsGuestResolve
		    		},
		    		authRequired: true,
		    		allowTSGuest: true,
		    		pageName:"Digest"
		    	}).state('sharelinks', {
		    	  parent: 'private',
		          url: '/sharelinks/:tsId/:tsc?d&da&digestFor&origin&title&iw&ih',
		          views: {
		                "content@main": {
		                	templateProvider : ['$deviceInfo','$templateRequest',function($deviceInfo,$templateRequest) {
		                		return $templateRequest('app/components/common/ShareLink/ShareLink.html');
		                	}],
		                	controller : 'ShareLinkController',
		                	controllerAs : 'slc'
		                }
		            },
		            resolve : {
		            	$uibModalInstance : function() {
		            		return {};
		        		},
		        		taskspaceInfo : function() {
		            		return {};
		        		},
		        		systemSttings : function() {
		            		return {};
		        		},
		        		settings : function() {
		            		return {};
		        		},
		        		digestFor: function() {
		        			return {};
		        		},
		        		linkInfo: function() {
		        			return {};
		        		},
		        		authUserContext: function() {
		        			return {};
		        		},
		            	tsGuest : tsGuestResolve
		            },
		            authRequired: true,
		            pageName:"SHARE ANNOTATIONS ON WEBPAGE"
		      }).state('tsdigestview', {
		    	  parent: 'private',
		          url: '/tsdigestview/:tsId/:tsc?donotShowNavBar&origin&iw&ih',
		          views: {
		                "content@main": {
		                	templateProvider : ['$deviceInfo','$templateRequest',function($deviceInfo,$templateRequest) {
		                		return $templateRequest('app/components/AnnotationDigest/digest.tmpl.html');
		                	}],
		                	controller : 'DigestController',
		                	controllerAs : 'dc'
		                }
		            },
		            resolve : {
		            	tsGuest : tsGuestResolve
		            },
		            authRequired: true,
		            pageName:"DIGEST"
		      }).state('preferences', {
		    		parent: 'private',
		            url: '/preferences',
		            views: {
		                "content@main": {
		                	templateUrl : 'app/components/SystemPreferences/SystemPreferencesTemplate.html',
		                	controller : 'SysPrefController',
		                	controllerAs: 'vm',
		                }
		            },
		            resolve : {
               		 	tsGuest : tsGuestResolve
               	 	},
		            authRequired: true,
		            pageName:"Preferences",
		            data: {
		                needAdmin: true
		            }
		      }).state('appsettings', {
		    		parent: 'private',
		            url: '/appsettings',
		            views: {
		                "content@main": {
		                	templateUrl : 'app/components/Admin/AppSettings/AppSettingsTemplate.html',
		                	controller : 'AppSettingsController',
		                	controllerAs: 'aps',
		                }
		            },
		            resolve : {
               		 	tsGuest : tsGuestResolve
               	 	},
		            authRequired: true,
		            pageName:"App Settings",
		            data: {
		                needAdmin: true
		            }
		      }).state('administration', {
		    		parent: 'private',
		            url: '/administration',
		            params: {
		            	selectedMenuItem: ""
		            },
		            views: {
		            	"content@main": {
		                	templateUrl : 'app/components/Admin/Administration/AdministrationTemplate.html',
		                	controller : 'AdministrationController',
		                	controllerAs: 'ac',
		                }
		            },
		            resolve : {
               		 	tsGuest : tsGuestResolve
               	 	},
		            authRequired: true,
		            pageName:"Administration",
		            data: {
		            	needOrgOrSiteAdmin: true
		            }
		      }).state('docs', {
		    	  	parent: 'private',
		            url: '/fldr/:folderId',
		            views: {
		                "content@main": {
		                	//templateUrl : 'app/components/Documents/documents.html',
		                	templateProvider : ['$deviceInfo','$templateRequest',function($deviceInfo,$templateRequest) {
		                		if($deviceInfo.isMobile){
		                			return $templateRequest('app/components/Documents/Mobile/documents.mob.html');
		                		} else {
		                			return $templateRequest('app/components/Documents/documents.html');
		                		}
		                	}],
		                	controller : 'DocRootController'
		                }
		            },

		            resolve : {
               		 	tsGuest : tsGuestResolve
               	 	},
		            authRequired: true,
		            pageName:"Home"
		            
		      }).state('docview', {
		    	  	parent: 'private',
		            url: '/docview/:docId/:clientId/:commentId',
		            views: {
		                "content@main": {
		                	templateUrl : 'app/components/DocViewer/vdvcDocViewerTemplete.html',
		                	controller : 'VDVCDocViewerController',
		                }
		            },

		            resolve : {
               		 	tsGuest : tsGuestResolve
               	 	},
		            authRequired: true,
		            pageName:"Doc Viewer"
		      }).state('search', {
		    	  	parent: 'private',
		            url: '/search?s&r&c',
		            views: {
		                "content@main": {
		                	//templateUrl : 'app/components/AdvancedSearch/advSearch.html',
		                	templateProvider : ['$deviceInfo','$templateRequest','$stateParams','commonService',function($deviceInfo,$templateRequest,$stateParams,commonService) {
		                		if($deviceInfo.isMobile){
		                			return $templateRequest('app/components/AdvancedSearch/Mobile/advSearch.mob.html');
		                		} else if($stateParams.id) {
		                			if(commonService.searchNotification && commonService.searchNotification.savedFromPortfolio) {
	        			    			return $templateRequest('app/components/AdvancedSearch/advSearch.pf.html');
	        			    		} else {
			                			return $templateRequest('app/components/AdvancedSearch/advSearch.html');
			                		}
		                		} else {
		                			return $templateRequest('app/components/AdvancedSearch/advSearch.html');
		                		}
		                	}],
		                	controller : 'AdvSearchController',
		                }
		            },
		            resolve : {
		            	tsGuest : tsGuestResolve
		            },
		            authRequired: true,
		            pageName:"Search"
		      }).state('slacksearch', {
		    		parent: 'private',
		            url: '/slacksearch?ctx&skw&tkr&tag&dtp&stp&tmf&d&tsid&tsc',
		            views: {
		            	"content@main": {
		                	controller : 'SlackSearchController',
				            controllerAs : 'ssc'
		                }
		            },
		            resolve : {
		            	tsGuest : tsGuestResolve
		            },
		            authRequired: true
		      }).state('search.doc', {
		            url: '/doc/:docId/:clientId',
		            views: {
		            	"content@search": {
		                	//templateUrl : 'app/components/AdvancedSearch/doc.html',search.doc.mob.html
		                	templateProvider : ['$deviceInfo','$templateRequest',function($deviceInfo,$templateRequest) {
		                		if($deviceInfo.isMobile){
		                			return $templateRequest('app/components/AdvancedSearch//Mobile/search.doc.mob.html');
		                		} else {
		                			return $templateRequest('app/components/AdvancedSearch/doc.html');
		                		}
		                	}],
		                	controller : 'DocViewerController',
		                }
		            },
		            resolve : {
		            	tsGuest : tsGuestResolve
		            },
		            authRequired: true
		      }).state('search.news', {
		    	  	url: '/news/:newsId',
		            views: {
		                "content@search": {
		                	templateUrl : 'app/components/NewsFeed/NewsFeed.html',
		                	controller : 'NewsFeedController'
		                }
		            },
		            resolve : {
		            	tsGuest : tsGuestResolve
		            },
		            authRequired: true
		      }).state('search.oneDrive', {
		            url: '/od/:oneDriveDocId',
		            views: {
		            	"content@search": {
		                	 templateUrl : 'app/components/OneDrive/DocViewer/OneDriveDocViewer.html',
		                	 controller : 'OneDriveDocViewerController',
		                	 controllerAs: 'ODDV'
		                }
		            },
		            resolve : {
		            	tsGuest : tsGuestResolve
		            },
		            authRequired: true,
		            pageName:"One Drive Authorization Error"
		      }).state('trash', {
		    	  	parent: 'private',
		    	  	url: '/trash/:trashId',
		            views: {
		                "content@main": {
		                	//templateUrl : 'app/components/Trash/trash.html',
		                	templateProvider : ['$deviceInfo','$templateRequest',function($deviceInfo,$templateRequest) {
		                		if($deviceInfo.isMobile){
		                			return $templateRequest('app/components/Trash/Mobile/trash.mob.html');
		                		} else {
		                			return $templateRequest('app/components/Trash/trash.html');
		                		}
		                	}],
		                	controller : 'TrashController'
		                }
		            },
		            resolve : {
		            	tsGuest : tsGuestResolve
		            },
		            authRequired: true,
		            pageName:"Trash"
		      }).state('portfolios', {
		    	  	parent: 'private',
		            url: '/portfolios/:portfolioId',
		            views: {
		            	"content@main": {
		                	templateUrl : 'app/components/Portfolios/portfolios.html',
		                	controller : 'portfoliosController',
		                	controllerAs: 'pc'
		                }
		            },
		            resolve : {
		            	tsGuest : tsGuestResolve
		            },
		            authRequired: true,
		            pageName:"Portfolios"
		            
		      }).state('CP', {
		    	  	parent: 'private',
		            url: '/cp',
		            views: {
		            	"content@main": {
		                	templateUrl : 'app/components/Admin/CompanyPresentations/CompanyPresentations.html',
		                	controller : 'CompanyPresentationsController',
		                	controllerAs: 'cp'
		                }
		            },
		            resolve: {
		                ruleEngineStatus:['CompanyPresentationService', function getRuleEngineStatus(CompanyPresentationService) { 
		                	return  CompanyPresentationService.getRuleEngineStatus().then(function(resp) {
		              			return resp;
		              		});
		                }]
		            },

		            resolve : {
               		 	tsGuest : tsGuestResolve
               	 	},
		            authRequired: true,
		            pageName:"Company Presentations",
		            data: {
		                needAdmin: true
		            }
		            
		      }).state('tci', {
		    	  	parent: 'private',
		            url: '/tci',
		            views: {
		            	"content@main": {
		                	templateUrl : 'app/components/Admin/TickerCikInfo/TickerCikInfo.html',
		                	controller : 'TickerCikInfoController',
		                	controllerAs: 'tci'
		                }
		            },
		            resolve : {
		            	tsGuest : tsGuestResolve
		            },
		            authRequired: true,
		            pageName:"Ticker Cik Info",
		            data: {
		                needAdmin: true
		            }
		            
		      }).state('authError', {
		    	  	parent: 'private',
		            url: '/authError',
		            views: {
		            	"content@main": {
		                	 templateUrl : 'app/components/common/AuthorizationError/AuthorizarionErrorTemplate.html',
		                	 controller : 'AuthorizationErrorController',
		                	 controllerAs: 'ae'
		                }
		            },
		            resolve : {
		            	tsGuest : tsGuestResolve
		            },
		            authRequired: true,
		            pageName:"Authorization Error"
		      }).state('urlError', {
		    	  	parent: 'private',
		            url: '/urlError',
		            views: {
		            	"content@main": {
		                	 templateUrl : 'app/components/common/StateNotFoundError/StateNotFoundErrorTemplate.html',
		                	 controller : 'StateNotFoundErrorController',
		                	 controllerAs: 'se'
		                }
		            },
		            resolve : {
		            	tsGuest : tsGuestResolve
		            },
		            authRequired: true,
		            allowTSGuest: true,
		            pageName:"URL Error"
		      }).state('ODAuthErr', {
		    	  	parent: 'private',
		            url: '/ODAuthErr?error',
		            views: {
		            	"content@main": {
		                	 templateUrl : 'app/components/OneDrive/Error/OneDriveErrorTemplate.html',
		                	 controller : 'OneDriveErrorController',
		                	 controllerAs: 'oe',
		                	 resolve : {
		                		 removeOneDriveAuthRequest: ['localStorageService',function(localStorageService) {
		                			 localStorageService.remove("OneDriveAuthRequest"); 
		                			 return true;
		                		 }] 
		                	 }
		                }
		            },
		            resolve : {
		            	tsGuest : tsGuestResolve
		            },
		            authRequired: true,
		            pageName:"One Drive Authorization Error"
		      }).state('WAErrorWOA', {
		    	  	parent: 'public',
		            url: '/WAErrorWOA?error&extensionId&target&annotationId&autoRedirectDuration&chromeStoreBaseUrl&extensionName&cid&tsId',
		            views: {
		            	content: {
		                	 templateUrl : 'app/components/Documents/WebAnnotation/Error/WAErrorTemplate.html',
		                	 controller : 'WAErrorController',
		                	 controllerAs: 'wec'
		                }
		            },
		            authRequired: false,
		            pageName:"Web Annotation Error"
		      }).state('resetpwdsuccess', {
		    	  	parent: 'public',
		            url: '/resetpwdsuccess',
		            views: {
		            	content: {
		                	 templateUrl : 'app/components/authentication/ResetPassword/Success/ResetSuccessTemplate.html',
		                	 controller : 'ResetSuccessController',
		                	 controllerAs: 'rsc'
		                }
		            },
		            authRequired: false,
		            pageName:"Reset Password Success"
		      }).state('error', {
		    	  	parent: 'public',
		            url: '/error?message',
		            views: {
		            	"content": {
		                	 templateUrl : 'app/components/common/GeneralErrors/GeneralError.tmpl.html',
		                	 controller : 'GeneralErrorController',
		                	 controllerAs: 'ge'
		                }
		            },
		            authRequired: false,
		            pageName:"error"
		      }).state('signup', {
		    	  	parent: 'public',
		            url: '/signup',
		            views: {
		            	"content": {
		                	 templateUrl : 'app/components/authentication/signup/signup.tmpl.html',
		                	 controller : 'SignUpController',
		                	 controllerAs: 'vm'
		                }
		            },
		            authRequired: false,
		            pageName:"Sign Up"
		      }).state('publicADWarning', {
		    	  	parent: 'private',
		            url: '/publicADWarning?message&publicLink',
		            views: {
		            	"content@main": {
		                	 templateUrl : 'app/components/common/PublicADWarning/PublicADWarning.tmpl.html',
		                	 controller : 'PublicADWarningController',
		                	 controllerAs: 'padwc'
		                }
		            },
		            resolve : {
		            	tsGuest : tsGuestResolve
		            },
		            authRequired: true,
		            pageName:"Public Annotation Digest Warning"
		      }).state('WAError', {
		    	  	parent: 'private',
		            url: '/WAError?error&extensionId&target&annotationId&autoRedirectDuration&chromeStoreBaseUrl&extensionName&cid&tsId',
		            views: {
		            	"content@main": {
		                	 templateUrl : 'app/components/Documents/WebAnnotation/Error/WAErrorTemplate.html',
		                	 controller : 'WAErrorController',
		                	 controllerAs: 'wec'
		                }
		            },
		            resolve : {
		            	tsGuest : tsGuestResolve
		            },
		            authRequired: true,
		            allowTSGuest: true,
		            pageName:"Web Annotation Error"
		      }).state('slack', {
		    	  	parent: 'private',
		            url: '/slack',
		            views: {
		            	"content@main": {
		                	 templateUrl : 'app/components/Slack/SlackWorkSapces.html',
		                	 controller : 'SlackWorkSapceController',
		                	 controllerAs: 'slkwsp',
		                	 resolve : {
		                		 SlackWorkSpaces: ['SlackService',function(SlackService) {
		                			 return SlackService.getUserSlackWorkSpaces();
		                		 }]
		                	 }
		                }
		            },

		            resolve : {
               		 	tsGuest : tsGuestResolve
               	 	},
		            authRequired: true,
		            pageName:"Slack WorkSpaces"
		      }).state('addslack', {
		    	  	parent: 'private',
		            url: '/addslack',
		            views: {
		            	"content@main": {
		                	 templateUrl : 'app/components/Slack/addslack/AddSlack.tmpl.html',
		                	 controller : 'AddSlackController',
		                	 controllerAs: 'asc'
		                }
		            },
		            resolve : {
               		 	tsGuest : tsGuestResolve
               	 	},
		            authRequired: true,
		            pageName:"Slack WorkSpaces"
		      }).state('manageslack', {
		    	  	parent: 'private',
		            url: '/manageslack?user&team&taskspace&newUser',
		            views: {
		            	"content@main": {
		                	 templateUrl : 'app/components/Slack/Settings/SlackConfig.html',
		                	 controller : 'SlackConfigController',
		                	 controllerAs: 'scc',
		                	 resolve : {
		                		 SlackConfig: ['$q','SlackService','$stateParams',function($q,SlackService,$stateParams) {
		                			 var deferred = $q.defer();
		                			 SlackService.getSlakConfig($stateParams.team).then(function(resp) {
		                				 if(resp.status == 200 && resp.data.Status) {
		                					/* if(resp.data.HasSlackAuth) {
		                						 deferred.resolve(resp);
		                					 } else {
		                						 deferred.reject();
		                					 }*/
		                					 
		                					 deferred.resolve(resp);
			                     		  }
		                			 });
		                			 
		                			 return deferred.promise;
		                		 }]
		                	 }
		                }
		            },
		            resolve : {
               		 	tsGuest : tsGuestResolve
               	 	},
		            authRequired: true,
		            pageName:"Slack Channel Config"
		      }).state('managenotifications', {
		    	  	parent: 'private',
		            url: '/managenotifications',
		            views: {
		            	"content@main": {
		                	 templateUrl : 'app/components/Notifications/ManageNotifications/ManageNotifications.html',
		                	 controller : 'ManageNotificationsController',
		                	 controllerAs: 'mnc'/*,
		                	 resolve : {
		                		 SlackWorkSpaces: ['SlackService',function(SlackService) {
		                			 return SlackService.getUserSlackWorkSpaces();
		                		 }] 
		                	 }*/
		                }
		            },
		            resolve : {
               		 	tsGuest : tsGuestResolve
               	 	},
		            authRequired: true,
		            pageName:"Manage Notifications"
		      }).state('linkedinposts', {
		    	  	parent: 'private',
		            url: '/linkedinposts',
		            views: {
		            	"content@main": {
		                	 templateUrl : 'app/components/LinkedIn/home/LinkedInPosts.tmpl.html',
		                	 controller : 'LinkedInPostsController',
		                	 controllerAs: 'lipc',
		                	 resolve : {
		                		 SlackConfig: ['$q','LinkedInService','$stateParams',function($q,LinkedInService,$stateParams) {
		                			 var deferred = $q.defer();
		                			 LinkedInService.getLinkedInPostsForUser().then(function(resp) {
		                				 if(resp.status == 200 && resp.data && resp.data.linkedInPostsList) {
		                					 deferred.resolve(resp);
			                     		  }
		                			 });
		                			 return deferred.promise;
		                		 }]
		                	 }
		                }
		            },
		            authRequired: true,
		            pageName:"LinkedIn Posts"
		      }).state('deleteme', {
		    	  	parent: 'private',
		            url: '/deleteme',
		            views: {
		            	"content@main": {
		                	 templateUrl : 'app/components/DeleteMe/DeleteMeTemplate.html',
		                	 controller : 'DeleteMeController',
		                	 controllerAs: 'dmc'
		                }
		            },
		            authRequired: true,
		            pageName:"Delete My Account"
		      }).state('userPreferences', {
		    	  	parent: 'private',
		            url: '/user/preferences',
		            views: {
		            	"content@main": {
		                	 templateUrl : 'app/components/UserPreferences/UserPreferences.html',
		                	 controller : 'UserPreferencesController',
		                	 controllerAs: 'usrpref'
		                }
		            },
		            resolve : {
               		 	tsGuest : tsGuestResolve
               	 	},
		            authRequired: true,
		            pageName:"Slack Channel Config"
		      }).state('evernoteAuthError', {
		    	  	parent: 'private',
		            url: '/evernoteAuthError?error&&redirectUrl',
		            views: {
		            	"content@main": {
		                	 controller : 'EvernoteErrorController',
		                	 controllerAs: 'enec'
		                }
		            },
		            resolve : {
               		 	tsGuest : tsGuestResolve
               	 	},
		            authRequired: true,
		            pageName:"Evernote Auth Error"
		      }).state('public', {
		            url: '',
		            views: {
		                nav: {
		                  templateUrl: 'app/components/navigation/public/PblcNavigation.html',
		                  controller : 'PblcNavController',
		                  controllerAs : 'vm'
		                },
		                content: {
		                	templateUrl : 'app/components/Root/root.html',
		                }
		            },
		            resolve: {
		            	usrInfResp:['$q','userService', function getUserInfo($q,userService) { 
		                	return userService.getLoginInfo();
		                }]
		            }
		      }).state('slacksignincb', {
		    	  	parent: 'public',
		            url: '/slacksignincb?ui',
		            views: {
		            	"content": {
		                	 controller : 'SlackSignInCBController'
		                }
		            },
		            resolve : {
		            	userInfo:['userService','$q','$state','appData', function resolveAuthentication(userService,$q,$state,appData) { 
		                	var deferred = $q.defer();
		                	userService.getLoginInfo().then(function(usrLogInfResp) {
		                		deferred.resolve(usrLogInfResp.data);
		                	},function() {
		                		deferred.resolve(null);
		                	});
		                	
		                	return deferred.promise;
		                }],
		                slackAuthData:['SlackService','$q','$state', function resolveAuthentication(SlackService,$q,$state) {
		                	var deferred = $q.defer();
		                	SlackService.getAuthData().then(function(slackAuthDataResp) {
		                		deferred.resolve(slackAuthDataResp);
		                	},function(slackAuthDataError) {
		                		deferred.resolve({"error" : slackAuthDataError});
		                	});
		                	return deferred.promise;
		                }]
		            },
		            authRequired: false,
		            pageName:"Slack Post Authentication"
		      }).state('regprouser', {
		    	  	parent: 'public',
		            url: '/regprouser?proUser&objType&objId&objCId',
		            views: {
		            	content: {
		                	 templateUrl : 'app/components/RegisterProvisionalUser/RegisterProUser.html',
		                	 controller : 'RegisterProUserController',
		                	 controllerAs: 'rpc'
		                }
		            },
		            authRequired: false,
		            pageName:"Register Provisional User"
		      }).state('reguserfromext', {
		    	  	parent: 'public',
		            url: '/reguserfromext?origin&response_mode&response_type&state&version',
		            params: {
		            	donotShowNavBar: true
		            },views: {
		            	content: {
		                	 templateUrl : 'app/components/RegisterProvisionalUser/Registration/RegisterProUserModal.html',
		                	 controller : 'RegisterProUserModalController',
		                	 controllerAs: 'rpmc'
		                }
		            },resolve : {
		            	$uibModalInstance : function() {
		            		return {};
		        		},
		        		provisionalUser : function() {
		            		return {};
		        		}
				    },
		            authRequired: false,
		            pageName:"Register User"
		      }).state('verifyotp', {
		    	  	parent: 'public',
		            url: '/verifyotp?proUser&otp',
		            views: {
		            	content: {
		                	 templateUrl : 'app/components/Register/VerifyOTP/VerifyOTP.html',
		                	 controller : 'VerifyOTPController',
		                	 controllerAs: 'voc'
		                }
		            },
		            authRequired: false,
		            pageName:"Verify OTP"
		      }).state('resetpwd', {
		    	  	parent: 'public',
		            url: '/resetpwd?token',
		            views: {
		                content: {
		                	 templateUrl : 'app/components/authentication/ResetPassword/ResetPassword.html',
		                	 controller : 'ResetPasswordController',
		                	 controllerAs: 'rp'
		                }
		            },
		            authRequired: false,
		            pageName:"Reset Password"
		      }).state('pbDocview', {
		    	  	parent: 'public',
		            url: '/public/view?id',
		            views: {
		                content: {
		                	 templateUrl : 'app/components/DocViewer/public/PblcDocViewer.html',
		                	 controller : 'PblcDocViewerController'
		                }
		            },
		            authRequired: false,
		            pageName:"Doc Viewer"
		      }).state('SlackAuthErr', {
		    	  	parent: 'public',
		            url: '/SlackAuthErr?error&oAuthUrl&isLoggedIn',
		            views: {
		            	content: {
		                	 templateUrl : 'app/components/Slack/Error/SlackErrorTemplate.html',
		                	 controller : 'SlackErrorController',
		                	 controllerAs: 'sec'
		                }
		            },
		            authRequired: false,
		            pageName:"Slack Authorization Error"
		      }).state('slackhome', {
		    	  	parent: 'public',
		            url: '/slackhome',
		            views: {
		            	content: {
		                	 templateUrl : 'app/components/Slack/home/SlackHome.tmpl.html',
		                	 controller : 'SlackHomeController',
		                	 controllerAs: 'shc'
		                }
		            },
		           /* resolve: {
		            	usrInfResp:['$q','userService', function getLinkInfo($q,userService) { 
		                	return userService.getUserInfo();
		                }]
		            },*/
		            authRequired: false,
		            pageName:"Slack Home"
		      }).state('maintenancemode', {
		    	  	parent: 'public',
		            url: '/maintenancemode',
		            params: {
		    	  		message: ""
		            },
		            views: {
		            	content: {
		                	 templateUrl : 'app/components/Admin/Administration/MaintenanceSchedule/MaintenanceMode/MaintenanceMode.tmpl.html',
		                	 controller : 'MaintenanceModeController',
		                	 controllerAs: 'mmc'
		                }
		            },
		            authRequired: false,
		            pageName:"Register Provisional User"
		      }).state('SlackAuthCB', {
		    	  	parent: 'private',
		            url: '/SlackAuthCB?error&oAuthUrl',
		            views: {
		            	"content@main": {
		                	 templateUrl : 'app/components/Slack/Error/SlackErrorTemplate.html',
		                	 controller : 'SlackErrorController',
		                	 controllerAs: 'sec'
		                }
		            },
		            resolve : {
               		 	tsGuest : tsGuestResolve
               	 	},
		            authRequired: true,
		            pageName:"Slack Authorization Call Back"
		      }).state('boxAuthErr', {
		    	  	parent: 'private',
		            url: '/boxAuthErr?error',
		            views: {
		            	"content@main": {
		                	 templateUrl : 'app/components/Box/Error/BoxErrorTemplate.html',
		                	 controller : 'BoxErrorController',
		                	 controllerAs: 'box'
		                }
		            },
		            resolve : {
               		 	tsGuest : tsGuestResolve
               	 	},
		            authRequired: true,
		            pageName:"Box Authorization Call Back"
		      }).state('dropBoxAuthErr', {
		    	  	parent: 'private',
		            url: '/dropBoxAuthErr?error',
		            views: {
		            	"content@main": {
		                	 templateUrl : 'app/components/DropBox/Error/DropBoxErrorTemplate.html',
		                	 controller : 'DropBoxErrorController',
		                	 controllerAs: 'dropbox'
		                }
		            },
		            resolve : {
               		 	tsGuest : tsGuestResolve
               	 	},
		            authRequired: true,
		            pageName:"DropBox Authorization Call Back"
		      }).state('linkedInAuthErr', {
		    	  	parent: 'private',
		            url: '/linkedInAuthErr?error',
		            views: {
		            	"content@main": {
		                	 templateUrl : 'app/components/LinkedIn/Error/LinkedInErrorTemplate.html',
		                	 controller : 'LinkedInErrorController',
		                	 controllerAs: 'linkedIn'
		                }
		            },
		            resolve : {
             		 	tsGuest : tsGuestResolve
             	 	},
		            authRequired: true,
		            pageName:"LinkedIn Authorization Call Back"
		      }).state('linkedInAuthSuccess', {
		    	  	parent: 'private',
		    	  	url: '/linkedInAuthSuccess?success&origin',
		            views: {
		            	"content@main": {
		                	 templateUrl : 'app/components/LinkedIn/Success/LinkedInSuccessTemplate.html',
		                	 controller : 'LinkedInSuccessController',
		                	 controllerAs: 'linkedIn'
		                }
		            },
		            resolve : {
           		 	tsGuest : tsGuestResolve
           	 	},
		            authRequired: true,
		            pageName:"LinkedIn Authorization Call Back"
		      }).state('manageAsana', {
		    	  	parent: 'private',
		            url: '/asana/manage',
		            views: {
		            	"content@main": {
		                	 templateUrl : 'app/components/Asana/Settings/asana-settings.tmpl.html',
		                	 controller : 'AsanaSettingsController',
		                	 controllerAs: 'asc',
		                	 resolve : {
		                		 config: ['$q','AsanaService','$stateParams',function($q,AsanaService,$stateParams) {
		                			 var deferred = $q.defer();
		                			 AsanaService.getConfig().then(function(resp) {
		                				 if(resp.status == 200 && resp.data.Status) {
	              		    				var data = resp.data;
	              		    				if(AsanaService.checkAuthStatus(data)) {
	              		    					deferred.resolve(data.AsanaConfig);
	              		    				} else {
	              								deferred.reject();
	              								AsanaService.autherize();
	              							}
	              		    			  }
		                			 });
		                			 return deferred.promise;
		                		 }]
		                	 }
		                }
		            },
		            resolve : {
               		 	tsGuest : tsGuestResolve
               	 	},
		            authRequired: true,
		            pageName:"Asana Config"
		      }).state('asanaAuthErr', {
		    	  	parent: 'private',
		            url: '/asanaAuthErr?error',
		            views: {
		            	"content@main": {
		                	 templateUrl : 'app/components/Asana/Error/AsanaErrorTemplate.html',
		                	 controller : 'AsanaErrorController',
		                	 controllerAs: 'asana'
		                }
		            },
		            resolve : {
               		 	tsGuest : tsGuestResolve
               	 	},
		            authRequired: true,
		            pageName:"Asana Authorization Call Back"
		      }).state('inbox', {
		    	  	parent: 'private',
		    	  	url: '/inbox',
		            views: {
		            	"content@main": {
		            		templateUrl : 'app/components/EmailInbox/EmailInboxTemplate.html',
		            		controller : 'EmailInboxController',
		                	controllerAs: 'eic'
		                }
		            },
		            resolve : {
               		 	tsGuest : tsGuestResolve
               	 	},
		            authRequired: true,
		            pageName:"Inbox"
		      });
		
		
		$locationProvider.html5Mode(true);
	}
	
	exceptionHandler.$inject = ['$delegate'];
	
	function exceptionHandler($delegate) {
		return function (exception, cause) {
             $delegate(exception, cause);
        };
    }
	
	angular.module("vdvcApp").run(appRun);
	
	appRun.$inject = ['$rootScope','userService','$state',
	        'editableOptions','editableThemes','$uibModalStack','_',
	        'appData','LocalStorageService','AUTH_EVENTS',
	        'AdministrationService','$deviceInfo','uuidService'];
	
	function appRun($rootScope,userService,$state,editableOptions,
			editableThemes,$uibModalStack,_,appData,LocalStorageService,
			AUTH_EVENTS,AdministrationService,$deviceInfo,uuidService){
		 
		  editableThemes.bs3.inputClass = 'input-sm';
		  editableThemes.bs3.buttonsClass = 'btn-sm';
		  editableOptions.theme = 'bs3';
		  
		  userService.getUserInfo().then(function(usrInfResp) {
    			if(usrInfResp.status == 200 && usrInfResp.data.Status && usrInfResp.data.hasLogin) {
    				userService.storeAppdata(usrInfResp.data);
    			}
    	  });
		  
		  
		 /* if(appdata["UserRole"] == "TSGuest") {
			  if(!toState.allowTSGuest) {
				  event.preventDefault();
				  $state.go('login',{"fromCode":true,"dontRedirect" : true});
			  }
		  } else */
		  
		  $rootScope.$on('$stateChangeStart', function (event,toState,toParams,fromState,fromParams) {
			  var appdata = appData.getAppData();
			  var welcomePageSession = LocalStorageService.getLocalStorage(LocalStorageService.WELCOME_PAGE);
			  if(toState.authRequired) {
				 if(toState.data && ((toState.data.needAdmin && userService.isSiteAdmin())
						  || (toState.data.needOrgOrSiteAdmin && userService.isNotSiteAdmin() && userService.isNotOrgAdmin())
						  || (toState.data.needOrgAdmin && userService.isNotOrgAdmin()))) {
					  event.preventDefault();
					  $state.go('authError');
				  }
				  
				  if(userService.redirectToAccount() && toState.name != 'acount'){
					  $state.go("acount",{reload:true});
				  }
				  
				  if(!_.isEmpty(appdata) && !$deviceInfo.isMobile && !appdata["doNotShowHelpOnLogin"] && !_.isEmpty(welcomePageSession) && toState.name != 'acount' && toState.name != 'welcome') {
					  welcomePageSession = JSON.parse(welcomePageSession);
					  if(welcomePageSession.user == appdata["UserId"] && !welcomePageSession.close) {
						  $state.go("welcome",{},{reload:true});
					  }
				  } else if(!_.isEmpty(appdata) && $deviceInfo.isMobile && !appdata["doNotShowWelcomePageOnMobile"] && !_.isEmpty(welcomePageSession) && toState.name != 'acount' && toState.name != 'welcome') {
					  welcomePageSession = JSON.parse(welcomePageSession);
					  if(welcomePageSession.user == appdata["UserId"] && !welcomePageSession.close) {
						  $state.go("welcome",{},{reload:true});
					  }
				  }
				  
				  if(!userService.isAuthenticated() && toState.name != 'acount' && toState.name != 'welcome') {
					  $rootScope.previousState = toState.name;
					  $rootScope.previousStateParams = toParams;
				  }
			  }
			  if(toState.name != "taskspace.list.task") {
				  var taskspaceTipTourEle = $("taskspace-tip-tour");
				  if(taskspaceTipTourEle && taskspaceTipTourEle.length > 0) {
					  $("taskspace-tip-tour").remove();
					  $rootScope.$broadcast('TipsWizardStopped');
				  }
			  }
		  });
		  
		  
		  $rootScope.$on('$stateChangeSuccess', function (event,toState,toParams,fromState,fromParams) {
			  var appdata = appData.getAppData();
			  if(toState.name == "login" && _.isEmpty(appdata)) {
				  LocalStorageService.removeLocalStorage(LocalStorageService.WELCOME_PAGE);
				  LocalStorageService.removeLocalStorage(LocalStorageService.SHOW_TOUR_TIP_ON_LOGIN);
			  }
			  if(toState.name == fromState.name && (toState.name == 'acount' || toState.name == 'welcome')) {
				  //Do Nothing
			  } else {
				  $uibModalStack.dismissAll();
				  $rootScope.$broadcast("StateChanged",{"stateName" : toState.name});
			  }
			  if(toState.name != "login") {
				  userService.getLoginInfo().then(function(usrLogInfResp) {
		    			if(usrLogInfResp.status == 200 && usrLogInfResp.data.Status) {
		    				console.log("hasLogin -- "+ usrLogInfResp.data.hasLogin);
		    				if(usrLogInfResp.data.hasLogin) {
		    					if(usrLogInfResp.data.inMaintenanceMode) {
		    						if(!_.isEmpty(usrLogInfResp.data.ActiveSchedule) && !_.isEmpty(usrLogInfResp.data.ActiveSchedule.Schedule)) {
		    							var maintenanceSchedule = usrLogInfResp.data.ActiveSchedule.Schedule;
		    							$rootScope.maintenanceSchedule = maintenanceSchedule;
		    							var newLogoutDurationMillis = getNewLogoutDurationMillis(maintenanceSchedule);
		    							if(newLogoutDurationMillis > 2000) {
		    								var scheduleShutdownMessage = AdministrationService.getInitiatedShutdownNtfMsg(maintenanceSchedule,newLogoutDurationMillis);
		    								$rootScope.$broadcast('schedule-shutdown-flash', {"scheduleShutdownMessage" : scheduleShutdownMessage,"newLogoutDurationMillis" : newLogoutDurationMillis});
		    							}
		    						}
		    					}
		    				}
		    			}
				  });
			  }
		  });
		  
		  $rootScope.$on('$stateChangeError', function (event,toState,toParams,fromState,fromParams,error) {
			  if(toState.name != 'login') {
				  $rootScope.previousState = toState.name;
	          	  $rootScope.previousStateParams = toParams;
	          	  var stateInfo = {
	          			previousState :  toState.name,
	          			previousStateParams : toParams
	          	  };
	          	  LocalStorageService.setSessionStorage(LocalStorageService.STATE_INFO,JSON.stringify(stateInfo));
			  }
			  
			  if(error) {
				  console.log(error.error);
				  switch(error.goTo) {
				  case "previous":
					  var stateInfo = LocalStorageService.getSessionStorage(LocalStorageService.STATE_INFO);
					  if(!_.isEmpty(stateInfo) && error.error == "Active sessions") {
						  LocalStorageService.removeSessionStorage(LocalStorageService.STATE_INFO);
						  stateInfo = JSON.parse(stateInfo);
						  $state.go(stateInfo.previousState,stateInfo.previousStateParams);
					  } else {
						  userService.redirectPreviousState();
					  }
					  break;
				  case "login":
					  $state.go('login',error.params);
					  break;
				  case AUTH_EVENTS.notAuthenticated:
					  $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated, toState);
					  break;
				  case AUTH_EVENTS.serverInMaintenanceMode:
					  if(!AdministrationService.isUserRoleAllowed($rootScope.userinfo["UserRole"])) {
						  $rootScope.$broadcast("LogOut",true);
					  }
					  break;
				  }
			  }
			  
			  /*$rootScope.$broadcast({
      	        401: AUTH_EVENTS.notAuthenticated,
      	        403: AUTH_EVENTS.notAuthorized,
      	        419: AUTH_EVENTS.sessionTimeout,
      	        440: AUTH_EVENTS.sessionTimeout
      	      }[response.status], response);*/
		  });
		  
		  $rootScope.$on('$stateNotFound', function (event,toState) {
			  if(toState.to === "404") {
				  $state.go('urlError');
			  }
		  });
	}
	
})();