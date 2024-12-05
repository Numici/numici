;(function() {
	angular.module("vdvcPublicApp").config(appConfig); 
	
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
		
		localStorageServiceProvider.setPrefix('vdvcPublicApp');
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
		
		$stateProvider.state('public', {
		            url: '',
		            views: {
		                nav: {
		                  templateUrl: 'apppublic/components/PublicNavigation/PublicNavigation.html',
		                  controller : 'PublicNavigationController',
		                  controllerAs : 'vm'
		                },
		                content: {
		                	templateUrl : 'apppublic/components/Root/root.html',
		                }
		            },
		            resolve: {
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
		      }).state('publicdiegestviewOld', {
		    	  	parent: 'public',
		            url: '/p/digestviewold?id&donotShowNavBar',
		            views: {
		            	content: {
		            		templateProvider : ['$deviceInfo','$templateRequest',function($deviceInfo,$templateRequest) {
		                		return $templateRequest('apppublic/components/PublicAnnotationDigest/publicdigest.tmpl.html');
		                	}],
		                	controller : 'PublicDigestviewController',
		                	controllerAs : 'pdc'
		                }
		            },
		            resolve: {
		            	/*digestInfo:['CommonService','$stateParams','$q', function getDigestInfo(CommonService,$stateParams,$q) { 
		                	var deferred = $q.defer();
		                	CommonService.getPublicDigestById($stateParams.id).then(function(publicDigestResp) {
		                		deferred.resolve(publicDigestResp);
		                	},function(errorResp) {
		                		deferred.resolve(errorResp);
		                	});
		                	return deferred.promise;
		                }],*/
						notificationDelay:['CommonService','_','$q', function getKeyValuesForNotificationHandledelayTime(CommonService,_,$q) { 
		                	var deferred = $q.defer();
		                	CommonService.getKeyValuesForNotificationHandledelayTime().then(function(resp) {
		                		if(resp.data.Status && !_.isEmpty(resp.data.listAppKeyValues)) {
									var notificationHandledelayTimeObj = resp.data.listAppKeyValues[0];
									if(!_.isEmpty(notificationHandledelayTimeObj)) {
										deferred.resolve(notificationHandledelayTimeObj.value*1000);
									} else {
										deferred.resolve(null);
									}
								} else {
									deferred.resolve(null);
								}
		                	},function(errorResp) {
		                		deferred.resolve(null);
		                	});
		                	return deferred.promise;
		                }]
		            },
		            pageName:"Public Digest View"
		      }).state('publicdiegestview', {
		    	  	parent: 'public',
		            url: '/p/digestview?id&donotShowNavBar',
		            views: {
		            	content: {
		            		templateProvider : ['$deviceInfo','$templateRequest',function($deviceInfo,$templateRequest) {
		                		return $templateRequest('apppublic/components/PublicAnnotationDigest/publicdigesthtml.tmpl.html');
		                	}],
		                	controller : 'PublicDigestviewHtmlController',
		                	controllerAs : 'pdc'
		                }
		            },
		            resolve : {
		            	notificationDelay:['CommonService','_','$q', function getKeyValuesForNotificationHandledelayTime(CommonService,_,$q) { 
		                	var deferred = $q.defer();
		                	CommonService.getKeyValuesForNotificationHandledelayTime().then(function(resp) {
		                		if(resp.data.Status && !_.isEmpty(resp.data.listAppKeyValues)) {
									var notificationHandledelayTimeObj = resp.data.listAppKeyValues[0];
									if(!_.isEmpty(notificationHandledelayTimeObj)) {
										deferred.resolve(notificationHandledelayTimeObj.value*1000);
									} else {
										deferred.resolve(null);
									}
								} else {
									deferred.resolve(null);
								}
		                	},function(errorResp) {
		                		deferred.resolve(null);
		                	});
		                	return deferred.promise;
		                }]
		            },
		            pageName:"Public Digest View"
		      }).state('publicdocview', {
		    	  	parent: 'public',
		            url: '/p/digestdocview?id&tsId&d&da',
		            views: {
		            	content: {
		            		templateProvider : ['$deviceInfo','$templateRequest',function($deviceInfo,$templateRequest) {
		                		return $templateRequest('apppublic/components/PublicDocViewer/PblcDocViewer.html');
		                	}],
		                	controller : 'PublicDocViewerController',
		                	controllerAs : 'pdc'
		                }
		            },
		            resolve: {
		                initiateEditorCss:['CommonService', function initiateEditorCss(CommonService) { 
		                	return CommonService.loadEditorCss();
		                }]
		            },
		            pageName:"Public Document View"
		      }).state('publicwebannotation', {
		    		parent: 'public',
		            url: '/p/webannotation?target&linkId&annotationId&cid&tsId&actualUrl',
		            views: {
		            	"content": {
		                	controller : 'PublicWebAnnotationController',
				            controllerAs : 'pwc'
		                }
		            },
		            pageName:"Public Web Annotation"
		      }).state('publicwaerror', {
		    	  	parent: 'public',
		            url: '/p/waerror?error&extensionId&target&annotationId&autoRedirectDuration&chromeStoreBaseUrl&extensionName&cid&tsId&linkId',
		            views: {
		            	"content": {
		                	 templateUrl : 'apppublic/components/PublicWebAnnotation/Error/PublicWAErrorTemplate.html',
		                	 controller : 'PublicWAErrorController',
		                	 controllerAs: 'pwec'
		                }
		            },
		            pageName:"Public Web Annotation Error"
		      }).state('publicUrlError', {
		    	  	parent: 'public',
		            url: '/publicUrlError',
		            views: {
		            	content: {
		                	 templateUrl : 'apppublic/components/common/StateNotFoundError/StateNotFoundErrorTemplate.html',
		                	 controller : 'StateNotFoundErrorController',
		                	 controllerAs: 'se'
		                }
		            },
		            pageName:"URL Error"
		      });
		
		
		$locationProvider.html5Mode(true);
	}
	
	exceptionHandler.$inject = ['$delegate'];
	
	function exceptionHandler($delegate) {
		return function (exception, cause) {
             $delegate(exception, cause);
        };
    }
	
	angular.module("vdvcPublicApp").run(appRun);
	
	appRun.$inject = ['$rootScope','$state','CommonService',
	        'editableOptions','editableThemes','$uibModalStack','_',
	        'LocalStorageService','AUTH_EVENTS'];
	
	function appRun($rootScope,$state,CommonService,editableOptions,
			editableThemes,$uibModalStack,_,LocalStorageService,
			AUTH_EVENTS){
		 
		  editableThemes.bs3.inputClass = 'input-sm';
		  editableThemes.bs3.buttonsClass = 'btn-sm';
		  editableOptions.theme = 'bs3';
		  
		  CommonService.getGlobalSettings();
		  
		  $rootScope.$on('$stateChangeStart', function (event,toState,toParams,fromState,fromParams) {
			  console.log('$stateChangeStart');
		  });
		  
		  
		  $rootScope.$on('$stateChangeSuccess', function (event,toState,toParams,fromState,fromParams) {
			  console.log('$stateChangeSuccess');
		  });
		  
		  $rootScope.$on('$stateChangeError', function (event,toState,toParams,fromState,fromParams,error) {
			  console.log('$stateChangeError' + error);
		  });
		  
		  $rootScope.$on('$stateNotFound', function (event,toState) {
			  if(toState.to === "404") {
				  $state.go('urlError');
			  }
		  });
	}
	
})();