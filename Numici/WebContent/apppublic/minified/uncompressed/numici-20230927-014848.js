;(function(window, angular) {
	'use strict';
	
	CKEDITOR.config.allowedContent = true;
	
	var dependencies =  ['angularMoment','ui.router','ngAnimate','ngSanitize','ngMaterial','angular.filter','ngResource','angular-loading-bar',
	                     'ui.bootstrap','duScroll','angular-inview','underscore','rangy','ngFileUpload','angular-confirm','ngDragDrop',
	                     'angular-pdf-viewer',"xeditable","ui.select","toaster","monospaced.elastic","LocalStorageModule",'colorpicker.module',
	                     'angular-clipboard','ui.sortable','pageslide-directive','ngWebSocket','CanvasViewer','markdown','turndown','ngCookies','ngFlash'];
	
	angular.module('underscore', []);
	
	angular.module('underscore').factory('_', function() {
	  return window._;
	});
	
	
	angular.module('rangy', []);
	angular.module('rangy').factory('rangy', function() {
	  return window.rangy; 
	});
	
	
	
	angular.module("vdvcPublicApp",dependencies);
	
	angular.module("vdvcPublicApp").constant('companyName', 'numici');
	angular.module("vdvcPublicApp").constant('baseUrl', 'api/');
	angular.module("vdvcPublicApp").constant('defautlDateFormat', 'DD-MM-YYYY');
	
	angular.module("vdvcPublicApp").factory("appData", ["$location",function($location) {
		var appdata = {};
		return {
			setAppData : setAppData,
			getAppData : getAppData,
			clearAppData : clearAppData,
			storageKeyForExtension : storageKeyForExtension,
			storageKeyForApp: storageKeyForApp
			
		};
		
		function setAppData(key,value) {
			appdata[key] = value;
		}
		
		function getAppData() {
			return appdata;
		}
		
		function clearAppData() {
			appdata = {}
		}
		
		function storageKeyForExtension() {
			
 		    var apiDomain = $location.host();
 		    apiDomain = apiDomain.replace(/\./g, '%2E');
 		    return `hypothesis.oauth.${apiDomain}.token`;
 		}
 		
 		function storageKeyForApp() {
 			
 		    var apiDomain = $location.host();
 		    apiDomain = apiDomain.replace(/\./g, '%2E');
 		    return apiDomain;
 		}
 		
	}]);
	
	angular.module("vdvcPublicApp").constant('AUTH_EVENTS', {
		loginSuccess: 'auth-login-success',
		loginFailed: 'auth-login-failed',
		logoutSuccess: 'auth-logout-success',
		sessionTimeout: 'auth-session-timeout',
		notAuthenticated: 'auth-not-authenticated',
		notAuthorized: 'auth-not-authorized',
		serverInMaintenanceMode: 'server-in-maintenance-mode'
	});
	
	function isIPad() {
	  return /iPad/i.test(navigator.userAgent);
	}
	
	angular.module("vdvcPublicApp").provider('$deviceInfo', function () {
		
		var ua_parser = new UAParser();
		var deviceInfo = ua_parser.getResult();
		this.deviceInfo = deviceInfo;
		this.isIPad = isIPad();
		this.isMobile = deviceInfo.device && deviceInfo.device.type === 'mobile';
		this.isTablet = ((deviceInfo.device && deviceInfo.device.type === 'tablet') || isIPad);
		this.isTouch = (deviceInfo.device && (deviceInfo.device.type === 'tablet' || deviceInfo.device.type === 'mobile')) 
		|| (deviceInfo.os && deviceInfo.os.name == "Android");
		
		var browserName = deviceInfo.browser ? deviceInfo.browser.name : "";
		
		this.isChrome = browserName && browserName.indexOf("Chrome") !== -1 ? true : false;
		this.isSafari = browserName && browserName.indexOf("Safari") !== -1 ? true : false;
		this.isIE = browserName && browserName.indexOf("IE") !== -1 ? true : false;
		this.isEdge = browserName && browserName.indexOf("Edge") !== -1 ? true : false;
		
		this.setDeviceInfo = function (info) {
			this.deviceInfo = info;
		};

		this.$get = function () {
		    return this;
		};
	});
	
	angular.module("vdvcPublicApp").provider('$userTimeZone', function () {
		this.timeZone = null;
		if(jstz) {
			this.timeZone = jstz.determine().name();
		} else {
			try{
				this.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
			} catch(e) {}
		}
		
		this.$get = function () {
		    return this;
		};
	});
	
})(window,window.angular);

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
/*
 * angular-pdf-viewer v1.2.1
 * https://github.com/jdryg/angular-pdf-viewer
 */
(function (angular, PDFJS, document) {
	"use strict";
	
	let DEFAULT_SCALE_DELTA = 1.1;
	let MAX_SCALE = 10.0;
	let MIN_SCALE = 0.10;
	
	function PDFViewerApplication(options) {
		
		var self = this;
		
		this.CMAP_URL = './angular-libs/libs/pdfjs-dist/cmaps/';
		this.IMG_URL = './angular-libs/libs/pdfjs-dist/web/images/';
		this.CMAP_PACKED = true;
		
		this.scale = 1.0;
		this.pdfUrl = null;
		this.PDFViewer = null;
		this.pdfDocument = null;
		this.pdfLinkService = null;
		this.pdfFindController = null;
		this.hasTextLayer = false;
		this.searchResults = [];
		this.searchTerm = "";
		this.searchHighlightResultID = -1;
		this.element = options.container;
		this.pageMargin = 0;
		this.currentPage = 0;
		this.env = options.env;
		
		this.api = null;
		
		this.annotations = null;
		this.snippets = null;
		this.deepLinks = null;
		

		// Hooks for the client...
		this.onSearch = null;
		this.onPageRendered = null;
		this.onDataDownloaded = null;
		this.onCurrentPageChanged = null;
		this.passwordCallback = null;
		this.annotType = null;
		this.getCommentToolBarToolTip = null;
		
		this.addAnnotation = null;
		
		this.isPublicView = false;
	
		
	}

	PDFViewerApplication.prototype = {
		init: function() {
			var self = this;
			
			this.element.empty();
			this.element.css('width','100%');
			this.element.append('<div class="pdfViewer"></div>');
			const eventBus = new pdfjsViewer.EventBus();
			self.pdfLinkService = new pdfjsViewer.PDFLinkService();

			self.pdfFindController = new pdfjsViewer.PDFFindController({
			  linkService: self.pdfLinkService,
			  eventBus : eventBus
			});

			self.PDFViewer  = new pdfjsViewer.PDFViewer({
			  container: self.element[0],
			  linkService: self.pdfLinkService,
			  findController: self.pdfFindController,
			  imageResourcesPath : self.IMG_URL,
			  eventBus : eventBus
			});
			
			self.pdfLinkService.setViewer(self.PDFViewer);
			self.api = new PDFViewerAPI(self.PDFViewer);
			
			self.bindEvents();
			
		},
		fireDeepLinkClickEvent: function(linkId,originalEvent) {
			var self = this;
			var event = document.createEvent('CustomEvent');
		    event.initCustomEvent("deeplinkonclick", true, true, {
		    	"linkId": linkId,
		    	"url": self.pdfUrl,
		    	"originalEvent": originalEvent
		    });
		    
		    self.element[0].dispatchEvent(event);
		},
		fireAnnotationClickEvent: function(annot,originalEvent) {
			var self = this;
			var event = document.createEvent('CustomEvent');
		    event.initCustomEvent("annotationonclick", true, true, {
		    	"annotation": annot,
		    	"url": self.pdfUrl,
		    	"originalEvent": originalEvent
		    });
		    
		    self.element[0].dispatchEvent(event);
		},
		getRenderedPages: function() {
			var self = this;
			return _.where(self.PDFViewer._pages,{renderingState: 3});
		},
		renderAnnotaions : function(pdfPage) {
			var self = this;
			if(self.annotations) {
				var annotations = _.where(self.annotations, {"pageNum": pdfPage.id});
				if(annotations) {
					for(var i = 0;i < annotations.length;i++) {
						var annot = annotations[i];
						if(annot.type == "Highlight" || annot.type == "Screenshot") {
							self.renderTextHighlight(annot,pdfPage);
						}
						if(annot.type == "Link") {
							self.renderLink(annot,pdfPage);
						}
					}
				}
			}
		},
		checkAndUpdateAnnotVQ: function(anotObj) {
			var hasValidConversation = false;
			var annotEl = $('div[annot-id="'+anotObj.id+'"]');
			
			if(anotObj) {
				if(!_.isEmpty(anotObj.comment)) {
					hasValidConversation = true;
				} else if( anotObj.conversations && anotObj.conversations.length > 0) {
					var nonEmptyConv = _.find(anotObj.conversations, function(conv) {
						return !_.isEmpty(conv.comment);
					});
					
					if(nonEmptyConv)  {
						hasValidConversation = true;
					}
				}
			}
			
			if(hasValidConversation) {
				annotEl.first().addClass("cmt");
			} else {
				annotEl.first().removeClass("cmt");
			}
		
		},
		bindEventToCommentElement: function(elements,annot) {
			var self = this;
			for(var i = 0;elements.length > i;i++) {
				var el = elements[i];
				if(annot.type == "Highlight") {
					$(el).addClass("pdfHighlight");
				} else if(annot.type == "Screenshot") {
					$(el).addClass("pdfScreenshot");
				}
				$(el).attr("annot-id",annot.id);
				
				$(el).off("click").on("click",function(event){
					event.stopPropagation();
					self.fireAnnotationClickEvent(annot,event);
				});
			}
		},
		
		renderTextHighlight: function(annot,pdfPage) {
			var self = this;
			var annotEl = $('div[annot-id="'+annot.id+'"]');
			var isHighlightExists = annotEl.length > 0 ? true : false;
			if(!isHighlightExists) {
				var elements = self.showHighlight({"coords":annot.coordinates,"type" : annot.type},pdfPage);
				self.bindEventToCommentElement(elements,annot);
			}
			
			self.checkAndUpdateAnnotVQ(annot);
		},
		bindClickEventToDeepLinkElement: function(elements,link) {
			var self = this;
			for(var i = 0;elements.length > i;i++) {
				var el = elements[i];
				$(el).addClass("pdf-vdvc-link");
				$(el).attr("link-sourceId",link.uid);
		 		$(el).attr("link-id",link.id);
				$(el).off("click").on("click",function(event){
					self.fireDeepLinkClickEvent(link.id,event);
				});
			}
		},
		
		renderDeepLinks: function(pdfPage) {
			
			var self = this;
			if(self.deepLinks) {
				var links = _.filter(self.deepLinks, function(obj) {
					return obj.info.pageNumber === pdfPage.id;
				});
				for(var i = 0;i < links.length;i++) {
					var link = links[i];
					var linkInfo = link.info;
					var isHighlightExists = $('div[link-sourceId="'+linkInfo.linkUniqueId+'"]').length > 0 ? true : false;
					if(!isHighlightExists) {
						var elements = self.showHighlight({"coords":linkInfo.coordinates},pdfPage);
						self.bindClickEventToDeepLinkElement(elements,{"uid":linkInfo.linkUniqueId,"id":linkInfo.id});
					}
				}
			}
		},
		renderSnippets: function(pdfPage) {
			var self = this;
			if(self.snippets) {
				for(var i=0; i<self.snippets.length;i++) {
					if(self.snippets[i]) {
						var snip = self.snippets[i];
						if(snip.page == pdfPage.id) {
							var isExists = $(".pdfHighlight .snippet_"+i).length > 0 ? true : false;
							if(!isExists) {
								var elements = self.showHighlight(snip,pdfPage);
								if(elements) {
									for(var k = 0;elements.length > k;k++) {
										$(elements[k]).addClass("snippet_"+i);
									}
								}
							}
						}
					}
				}
			}
		},
		dispatchEventToContainer: function(eventName,eventData) {
			var self = this;
			var event = document.createEvent('CustomEvent');
		    event.initCustomEvent(eventName, true, true, eventData);
		    self.element[0].dispatchEvent(event);
		},
		
		bindEvents: function() {
			
			var self = this;
			
			if(self.PDFViewer && self.PDFViewer.eventBus) {
				
				self.PDFViewer.eventBus.on('scalechange', function(evt) {
					if(self.element[0] === evt.source.container) {
						self.scale = evt.scale;
					}
			    });
				
				
				self.PDFViewer.eventBus.on('pagesinit', function (evt) {
					if(self.element[0] === evt.source.container) {
						self.PDFViewer.currentScaleValue = 'page-width';
					}
				});
				
				self.PDFViewer.eventBus.on('pagechanging', function(evt) {
					if(self.element[0] === evt.source.container) {
						self.onCurrentPageChanged(evt.pageNumber);
					}
				});
				
				self.PDFViewer.eventBus.on('textlayerrendered', function (evt) {
					if(self.element[0].contains(evt.source.textLayerDiv)) {
						self.bindSelectionEvent(evt);
						var pageNumber = evt.pageNumber;
						var pageIndex = pageNumber - 1;
						var pageView = self.PDFViewer.getPageView(pageIndex);
						
						if (!pageView) {
						   return;
						}
						if (pageView.error) {
							self.onPageRendered("failed", pageNumber, self.PDFViewer.pdfDocument.numPages, "Failed to render page.");
						} else {
							self.renderAnnotaions(pageView);
							self.renderDeepLinks(pageView);
							self.renderSnippets(pageView);
							self.onPageRendered("success", pageNumber, self.PDFViewer.pdfDocument.numPages, "");
						}
					}
				});
				
			    self.PDFViewer.eventBus.on('resize', function (evt) {
			    	self.updateView();
			    });
				  
				self.PDFViewer.eventBus.on('pagerendered', function (evt) {

				});
			}
		},
		updateView: function() {
			
			 var self = this;
			 let pdfViewer = self.PDFViewer;
			   let pdfDocument = self.pdfDocument;
		   	 
			   if (!pdfDocument) {
				   return;
			   }
			   let currentScaleValue = pdfViewer.currentScaleValue;
			   if (currentScaleValue === 'auto' ||
				   currentScaleValue === 'page-fit' ||
				   currentScaleValue === 'page-width') {
				   
				   // Note: the scale is constant for 'page-actual'.
				   pdfViewer.currentScaleValue = currentScaleValue;
			   }
			   
			   pdfViewer.update();
		},
		setUrl: function (src,initialScale, renderTextLayer) {
			var self = this;
			
			
			self.hasTextLayer = renderTextLayer;
			self.scale = initialScale;
			
			self.pdfUrl = src;
			// Loading document.
			var loadingTask = pdfjsLib.getDocument({
			  url: src,
			  cMapUrl: self.CMAP_URL,
			  cMapPacked: self.CMAP_PACKED,
			});
			
			loadingTask.onProgress = angular.bind(this, this.downloadProgress);
			loadingTask.onPassword = angular.bind(this, this.passwordCallback);
			
			loadingTask.promise.then(function(pdfDocument) {
			  // Document loaded, specifying document for the viewer and
			  // the (optional) linkService.
			  self.PDFViewer.setDocument(pdfDocument);
			  self.pdfLinkService.setDocument(pdfDocument, null);
			  self.pdfDocument = pdfDocument;
			  
			}, function (message) {
				self.onDataDownloaded("failed", 0, 0, "PDF.js: " + message);
			});
		},
		getAPI: function () {
			return this.api;
		},
		downloadProgress: function (progressData) {
			// JD: HACK: Sometimes (depending on the server serving the PDFs) PDF.js doesn't
			// give us the total size of the document (total == undefined). In this case,
			// we guess the total size in order to correctly show a progress bar if needed (even
			// if the actual progress indicator will be incorrect).
			var total = 0;
			if (typeof progressData.total === "undefined") {
				while (total < progressData.loaded) {
					total += 1024 * 1024;
				}
			} else {
				total = progressData.total;
			}

			this.onDataDownloaded("loading", progressData.loaded, total, "");
		},
		bindSelectionEvent: function(evt) {
			var self = this;
			if(self.isPublicView) {
				return;
			}
			evt.source.textLayerDiv.addEventListener('mouseup', function (event) {
				event.stopPropagation();
				self.coordiNates = null;
				$('.comment-tool').css({"display":"none"});
	    		var x = event.clientX; 
				var y = event.clientY;
				var pos = {
						top : y,
						left: x
				};
				if(!self.perms.readonly) {
					if (window.getSelection) {
						  if (!_.isEmpty(window.getSelection().toString())) {
							  self.addTextToolBar(evt,pos);
						  } 
					} else if (document.selection) {  // IE?
						 var textRange = document.selection.createRange();
						 if (!_.isEmpty(textRange.text)) {
							 self.addTextToolBar(evt,pos);
						 } 
					}
				}
			});
		},
		getMinMaxCoordinates: function(crds,ref) {
			var n = [];
			var l = [];
			var r = [];
			var min,max;
			$.each(crds,function(i,v){
				l.push(v[0]);
				r.push(v[2]);
			});
			
			if(l.length > 0) {
				min = _.min(l);
			} else {
				min = ref[0];
			}
			
			if(r.length > 0) {
				max = _.max(r);
			} else {
				max = ref[2];
			}
			
			
			//min = _.min(l);
			//max = _.max(r);
			
			n[0] = min;
			n[1] = ref[1];
			n[2] = max;
			n[3] = ref[1];
			n[4] = min;
			n[5] = ref[3];
			n[6] = max;
			n[7] = ref[3];
			
			return n;
		},
		
	getSelectionCords : function(evt) {
		var self = this;
		
		
		var pageIndex = evt.pageNumber - 1; 
		var page = self.PDFViewer.getPageView(pageIndex);
		var pageRect = page.canvas.getClientRects()[0];
		var range = window.getSelection().getRangeAt(0);
		var selectionRects = range.getClientRects();
		var selectionBoundBox = range.getBoundingClientRect();
		var viewport = page.viewport;
		selectionRects =  _.filter(selectionRects, function (r) {
		    return r.width != 0;
		});
		var selected = _.map(selectionRects, function (r) {
		    return viewport.convertToPdfPoint(r.left - pageRect.left, r.top - pageRect.top)
		    .concat(viewport.convertToPdfPoint(r.right - pageRect.left, r.bottom - pageRect.top));
		});
		
		var text = $(div).text() || range.toString();
		if(text) {
			text = text.replace(/\n\s*\n/g, '\n');
		}
		
		self.coordiNates =  {
			'selectionRects': selected,
			'boundBox' : selectionBoundBox,
			'pageRect' : pageRect,
			"viewportWidth": viewport.width,
			"viewportHeight": viewport.height,
			"pageIndex" : evt.pageNumber,
			"selectedText" : text
		};
		
		return self.coordiNates;
	},
	
	getHightlightCoords: function(evt,type) {
		
		var self = this;
		var pageIndex = evt.pageNumber - 1; 
		var page = self.PDFViewer.getPageView(pageIndex);
		var selected;
		var fa = [];
		if(self.coordiNates) {
			selected = self.coordiNates;//.selectionRects;
		} else {
			selected = self.getSelectionCords(evt);//.selectionRects;
		}
		
		if (selected.selectionRects.length > 0) {
			var ref = selected.selectionRects[0];
			
			var inter = [];
			$.each(selected.selectionRects,function(i,v){
				if(self.env && self.env.isIE) {						
					var temp = self.getMinMaxCoordinates(inter,v);
					fa.push(temp);
				} else {
					//if((v[1] == ref[1] && v[3] == ref[3]) || (Math.abs(v[1] - ref[1]) < 3 && Math.abs(v[3] - ref[3]) < 3 ) ) {
					if(Math.abs(v[1] - ref[1]) < 3 && Math.abs(v[3] - ref[3]) < 3) {
						inter.push(v);
					} else {
						var temp = self.getMinMaxCoordinates(inter,ref);
						inter = [];
						fa.push(temp);
						ref = v;
					}
					if (i == selected.selectionRects.length-1) {
						if(inter.length == 0 ) {
							inter = [ref];
						}
						var temp = self.getMinMaxCoordinates(inter,ref);
						inter = [];
						fa.push(temp);
					}
				}
			});
			
		}
		
		var data = {pageNum: evt.pageNumber, coordinates: _.flatten(fa)};
		if(!_.isEmpty(selected.selectedText)){
			data["text"] = selected.selectedText;
		}
		
		
		var savePromise = self.addAnnotation(data,type);
		
		savePromise.then(function(annot) {
			
			var pdfPage = self.PDFViewer.getPageView(annot.pageNum-1);
			var elements = self.showHighlight({"coords":annot.coordinates},pdfPage);
			if(annot.contextType == "DeepLink") {
				self.bindClickEventToDeepLinkElement(elements,annot);
			} else {
				self.bindEventToCommentElement(elements,annot);
			}
			
		},function(error) {
			
		});
		
		self.coordiNates = null;
	},
	renderLink: function(annot,pdfPage) {
		var self = this;
		var pageElement = pdfPage.div;
		var viewport = pdfPage.viewport;
		 
		 var rect = [];
		 rect[0] = annot.lowerLeftX;
		 rect[1] = annot.lowerLeftY;
		 rect[2] = annot.upperRightX;
		 rect[3] = annot.upperRightY;
		  
		 var bounds = viewport.convertToViewportRectangle(rect);
		 var el = angular.element('<section></section>');
		 var $a = $('<a></a>');
		 $a.css({
			 'position': 'absolute',
			 'top': 0,
			 'left': 0,
			 'width': '100%',
			 'height':'100%'
		 });
		 if(annot.linkType == 'uri') {
			 $a.attr('target','_blank');
			 $a.attr('title',annot.uri);
			 $a.attr('href',annot.uri);
		 }
		 
		 if(annot.linkType == 'name') {
			 $a.css('cursor','pointer');
			 $a.off('click').on('click',function(event) {
				 event.stopPropagation();
				 event.preventDefault();
				 self.pdfLinkService.navigateTo(annot.destinationName);
			 });
		 }
		 
		 if(annot.linkType == 'page') {
			 $a.css('cursor','pointer');
			 $a.off('click').on('click',function(event) {
				 event.stopPropagation();
				 event.preventDefault();
				 self.scope.pdfViewerAPI.goToPage(annot.destinationPageNumber);
			 });
		 }
		 
		 var top = Math.min(bounds[1], bounds[3]);
		 var left = Math.min(bounds[0], bounds[2]);
		 var w = Math.abs(bounds[0] - bounds[2]);
		 var h = Math.abs(bounds[1] - bounds[3])+2;
		 el.attr('style', 'position: absolute;' +
		      'left:' + left + 'px; top:' +top + 'px;'+'width:' + w + 'px; height:' + h + 'px;z-index:20;');
		 el.append($a);
		 $(pageElement).append(el);

	},
	showHighlight: function(selected,pdfPage) {
		var self = this;
		var elements = [];
		var pageElement = pdfPage.div;
		var viewport = pdfPage.viewport;
		if (selected.coords && selected.coords.length > 0) {
			var lines = selected.coords.length/8;
			for (var j=0; j<lines; j++) {
				  var rect = [];
				  rect[0] = selected.coords[j*8+0];
				  rect[1] = selected.coords[j*8+1];
				  rect[2] = selected.coords[j*8+2];
				  if(selected.coords.length > 5) {
					  rect[3] = selected.coords[j*8+5];
				  } else {
					  rect[3] = selected.coords[j*8+3];
				  }
				  var bounds = viewport.convertToViewportRectangle(rect);
				  if(selected.type == "Screenshot") {
					  for (var k=0; k<rect.length; k++) {
						  rect[k] = rect[k]*pdfPage.scale;
					  }
					  bounds = rect;
				  }
				  var top = Math.min(bounds[1], bounds[3]);
				  var left = Math.min(bounds[0], bounds[2]);
				  var w = Math.abs(bounds[0] - bounds[2]);
				  var h = Math.abs(bounds[1] - bounds[3])+2;
				 
				  
				  /*var ctx = pdfPage.canvas.getContext("2d");
				  ctx.globalCompositeOperation='destination-over';
				  ctx.lineWidth = "1";
				  ctx.fillStyle = "rgba(255, 255, 0, 0.5)";
				  ctx.strokeStyle = "red";
				  ctx.rect(left, top, w,h);
				  ctx.stroke();
				  ctx.fill();*/
				  
				  
				  var el = angular.element('<div></div>');
				  el.attr('style', 'position: absolute;' +
				      'left:' + left + 'px; top:' +top + 'px;'+'width:' + w + 'px; height:' + h + 'px;z-index:20;');
				  $(pageElement).append(el);
				  elements.push(el);
			}
			
			//this.scope.annotType = null;
			//this.scope.pdfMenuItems.state = null;
			
			if (window.getSelection) {
				  if (window.getSelection().empty) {  // Chrome
				    window.getSelection().empty();
				  } else if (window.getSelection().removeAllRanges) {  // Firefox
				    window.getSelection().removeAllRanges();
				  }
			} else if (document.selection) {  // IE?
				  document.selection.empty();
			}
		  } 
		
		return elements;
	},
	addTextToolBar : function(evt,evtCords) {
		
		var self = this;
		var txtLayer = evt.source;
		var txtLayerDiv = $(txtLayer.textLayerDiv);
		var highlightToolTip ="" ;
		var commentToolTip = "";
		var deepLinkToolTip ="" ;
		
		var $page = txtLayerDiv.closest('.page');
		var $pageWrap = $page.closest('.vdvc-pdf-viewer');
		var $toolbar = $page.find('.comment-tool');
		
		Promise.all([self.getCommentToolBarToolTip('TxtHilt'), 
		     self.getCommentToolBarToolTip('TxtCmt'), 
	         self.getCommentToolBarToolTip('DpLnkTo')
	    ]).then(function(values) {
	        	highlightToolTip = values[0] ||  "";
	        	commentToolTip = values[1]  ||  "";
	        	deepLinkToolTip = values[2]  ||  "";
	        	var disableDeepLink = "disabled";
	        	if(self.perms.edit && self.perms.share) {
	        		disableDeepLink = "";
	        	}
	        	var mrkUp = '<div class="comment-tool btn-group pdf">\
	    			<button type="button" class="btn txtHilt">\
	    		<div class="fa fa-paint-brush"></div>\
	        	<div style="font-size: 12px;">'+highlightToolTip+'</div>\
	    	</button> \
	    	<button type="button" class="btn addcmt">\
	    			<div class="fa fa-comment-o"></div>\
	        		<div style="font-size: 12px;">'+commentToolTip+'</div>\
	    	</button>\
	    </div>';
	    		
	        	/*\
		    	<button type="button" class="btn crt-link '+disableDeepLink+'">\
		    		<div class="fa fa-bookmark-o"></div>\
		    		<div style="font-size: 12px;">'+deepLinkToolTip+'</div>\
		    	</button>*/
	    		if($toolbar.length == 0) {
	    			$page.append(mrkUp);
	    			$toolbar = $page.find('.comment-tool');
	    			$toolbar.find('span').tooltip();
	    		}
	    		
	    		var selectionBoundaries = self.getSelectionCords(evt);
	    		var coords = selectionBoundaries.selectionRects;
	    		var bondBox = selectionBoundaries.boundBox;
	    		var pageRects = selectionBoundaries.pageRect;
	    		
	    		var H = $toolbar.outerHeight();
	    	    var W = $toolbar.outerWidth();
	    	    var pH = $pageWrap.innerHeight();
	    	    var pW = $pageWrap.innerWidth();
	    	    var pageWrapOffset = $pageWrap.offset();
	    		var vW = selectionBoundaries.viewportWidth;  
	    		var x = evtCords.left; 
	    		var y = evtCords.top-H;
	    		
	    		
	    		var top = bondBox.bottom;
	    		//var left = bondBox.left;
	    		var left = bondBox.left+((bondBox.width/2)-(W/2));
	    		if(!isNaN(left)) {
	    			if((left+W) > (pageWrapOffset.left+pW)) {
	    				left = left - W;
	    			}
	    			if(left < pageWrapOffset.left) {
	    				left = pageWrapOffset.left;
	    			}
	    		}
	    		if(!isNaN(top)) {
	    			if((top+H) > (pageWrapOffset.top+pH)) {
	    				top = top - (bondBox.height+H);
	    			}
	    			if(top < pageWrapOffset.top) {
	    				top = pageWrapOffset.top;
	    			}
	    		}
	    		
	    		$toolbar.css({"display":"block","top":top+'px',"left": left+'px','z-index':100});
	    		
	    		$toolbar.find('.btn').off('mouseup ').on('mouseup ',function(event) {
	    			event.stopPropagation();
	    		});
	    		
	    		$toolbar.find('.btn').off('click').on('click',function(event) {
	    			event.stopPropagation();
	    			if($(this).hasClass('txtHilt')) {
	    				self.getHightlightCoords(evt,'highlight');
	    			}
	    			if($(this).hasClass('addcmt')) {
	    				self.getHightlightCoords(evt,'comment');
	    			}
	    			if($(this).hasClass('crt-link') && !$(this).hasClass('disabled')) {
	    				self.getHightlightCoords(evt,'deepLink');
	    			}
	    			if(!$(this).hasClass('disabled')) {
	    				$toolbar.hide();
	    			}
	    		});
	        	
	    });
	}
 };
	
	
	
	function PDFViewerAPI(viewer) {
		this.viewer = viewer;
	}
	
	PDFViewerAPI.prototype = {
		OnScaleChanged : function(scale) {
			if (!this.viewer) {
				return;
			}
			
			this.viewer.currentScaleValue = scale;
		},
		zoomIn: function (ticks) {
			if (!this.viewer) {
				return;
			}
			var newScale = this.viewer.currentScale;
		    do {
		      newScale = (newScale * DEFAULT_SCALE_DELTA).toFixed(2);
		      newScale = Math.ceil(newScale * 10) / 10;
		      newScale = Math.min(MAX_SCALE, newScale);
		    } while (--ticks > 0 && newScale < MAX_SCALE);
		    this.viewer.currentScaleValue = newScale;
		},
		zoomOut: function (ticks) {
			if (!this.viewer) {
				return;
			}
			var newScale = this.viewer.currentScale;
		    do {
		      newScale = (newScale / DEFAULT_SCALE_DELTA).toFixed(2);
		      newScale = Math.floor(newScale * 10) / 10;
		      newScale = Math.max(MIN_SCALE, newScale);
		    } while (--ticks > 0 && newScale > MIN_SCALE);
		    this.viewer.currentScaleValue = newScale;
		},
		rotatePages: function rotatePages(delta) {
			if (!this.viewer) {
				return;
			}
		    var newRotation = (this.viewer.pagesRotation + 360 + delta) % 360;
		    this.viewer.pagesRotation = newRotation;
		  },
		getZoomLevel: function () {
			return this.viewer.currentScaleValue;
		},
		goToPage: function (pageIndex) {
			if(this.viewer.pdfDocument === null || pageIndex < 1 || pageIndex > this.viewer.pdfDocument.numPages) {
				return;
			}

			this.viewer._pages[pageIndex - 1].div.scrollIntoView();
		},
		getNumPages: function () {
			if(this.viewer.pdfDocument === null) {
				return 0;
			}

			return this.viewer.pdfDocument.numPages;
		},
		findNext: function () {
			if(this.viewer.searchHighlightResultID === -1) {
				return;
			}

			var nextHighlightID = this.viewer.searchHighlightResultID + 1;
			if(nextHighlightID >= this.viewer.searchResults.length) {
				nextHighlightID = 0;
			}

			this.viewer.highlightSearchResult(nextHighlightID);
		},
		findPrev: function () {
			if(this.viewer.searchHighlightResultID === -1) {
				return;
			}

			var prevHighlightID = this.viewer.searchHighlightResultID - 1;
			if(prevHighlightID < 0) {
				prevHighlightID = this.viewer.searchResults.length - 1;
			}

			this.viewer.highlightSearchResult(prevHighlightID);
		}	
	};

	

	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	angular.module("angular-pdf-viewer", []).
	directive("pdfViewer", ['$deviceInfo',function ($deviceInfo) {
		var pageMargin = 10;

		return {
			restrict: "EA",
			scope: {
				src: "@",
				file: "=",
				api: "=",
				pdfApp:"=",
				initialScale: "@",
				renderTextLayer: "@",
				progressCallback: "&",
				passwordCallback: "&",
				saveAnnotation:"&",
				toolBarTooltip:"&",
				searchTerm: "@",
				searchResultId: "=",
				searchNumOccurences: "=",
				currentPage: "=",
				annotType: "=",
				
				annotations: "=",
				snippets: "=",
				deepLinks: "=",
				
				publicView: "@",
				perms: "="
			},
			
			controller: ['$scope', '$element','$q','uuidService','$timeout',
				function ($scope, $element,$q,uuidService,$timeout) {
				
				$element.attr("id",uuidService.newUuid());
				
				$element[0].addEventListener("deeplinkonclick",function(evt) {
					$scope.$emit("deeplinkonclick",evt.detail);
				});
				
				$element[0].addEventListener("annotationonclick",function(evt) {
					$scope.$emit("annotationonclick",evt.detail);
				});

				$scope.onPageRendered = function (status, pageID, numPages, message) {
					this.onProgress("render", status, pageID, numPages, message);
				};

				$scope.onCreateAnnotation = function(data,type) {
					
					let defer = $q.defer();
					if(this.saveAnnotation) {
						var self = this;
						$timeout(function() {
							self.saveAnnotation({ 
								data: data,
								type: type, 
								saveResolve: defer
							});
						}, 0);
					} 
					
					return defer.promise;
				};
				
				$scope.onDataDownloaded = function (status, loaded, total, message) {
					this.onProgress("download", status, loaded, total, message);
				};

				$scope.onCurrentPageChanged = function (pageID) {
					var self = this;
					$timeout(function() {
						self.currentPage = pageID;
					}, 0);
				};

				$scope.getCommentToolBarToolTip = function(key) {
					if(this.toolBarTooltip) {
						var self = this;
						return $timeout(function() {
							return self.toolBarTooltip({ 
								key: key
							});
						}, 0).then(function(resp) {
							return resp;
						});
					} 
					//return ToolTipService.showToolTip(key);
				};
				
				$scope.onSearch = function (status, curResultID, totalResults, message) {
					if(status === "searching") {
					} else if(status === "failed") {
						console.log("Search failed: " + message);
					} else if(status === "done") {
						this.searchResultId = curResultID + 1;
						this.searchNumOccurences = totalResults;
					} else if(status === "reset") {
						this.searchResultId = 0;
						this.searchNumOccurences = 0;
					}
				};

				$scope.getPDFPassword = function (passwordFunc, reason) {
					if(this.passwordCallback) {
						var self = this;
						$timeout(function() {
							var password = self.passwordCallback({reason: reason});

							if(password !== "" && password !== undefined && password !== null) {
								passwordFunc(password);
							} else {
								this.onPageRendered("failed", 1, 0, "A password is required to read this document.");
							}
						}, 0);
					} else {
						this.onPageRendered("failed", 1, 0, "A password is required to read this document.");
					}
				};

				$scope.onProgress = function (operation, state, value, total, message) {
					if (this.progressCallback) {
						var self = this;
						
						$timeout(function() {
							self.progressCallback({ 
								operation: operation,
								state: state, 
								value: value, 
								total: total,
								message: message
							});
						}, 0);
					}
				};

				
				
				$scope.pdfApp = new PDFViewerApplication({env: $deviceInfo,container: $element});
				$scope.pdfApp.onSearch = angular.bind($scope, $scope.onSearch);
				$scope.pdfApp.onPageRendered = angular.bind($scope, $scope.onPageRendered);
				$scope.pdfApp.onDataDownloaded = angular.bind($scope, $scope.onDataDownloaded);
				$scope.pdfApp.onCurrentPageChanged = angular.bind($scope, $scope.onCurrentPageChanged);
				$scope.pdfApp.passwordCallback = angular.bind($scope, $scope.getPDFPassword);
				$scope.pdfApp.getCommentToolBarToolTip = angular.bind($scope, $scope.getCommentToolBarToolTip);
				$scope.pdfApp.isPublicView =  $scope.publicView === "true" ? true : false;
				$scope.pdfApp.addAnnotation = angular.bind($scope, $scope.onCreateAnnotation);
				
				
				$scope.pdfApp.init();
				
				$scope.api = $scope.pdfApp.getAPI();
				$scope.pdfApp.annotations = $scope.annotations;
				$scope.pdfApp.perms = $scope.perms;
				

				$scope.shouldRenderTextLayer = function () {
					if(this.renderTextLayer === "" || this.renderTextLayer === undefined || this.renderTextLayer === null || this.renderTextLayer.toLowerCase() === "false") {
						return false;
					}

					return true;
				};
				
				$scope.onPDFSrcChanged = function () {
					this.pdfApp.setUrl(this.src, this.initialScale, this.shouldRenderTextLayer())
				};

				
				$element.bind("scroll", function (event) {
					$scope.$apply(function () {
						var scrollTop = $element[0].scrollTop;
						var h = $element.outerHeight(true);
						var scrollDir = scrollTop - $scope.lastScrollY;
						$scope.lastScrollY = scrollTop;

						var normalizedScrollDir = scrollDir > 0 ? 1 : (scrollDir < 0 ? -1 : 0);
						
						var scrollInfo = {
								"scrollTop" : scrollTop,
								'scrlRatio':(scrollTop/h),
								'element':$element
								};
						$scope.$emit("pdfOnScroll",scrollInfo);
					});
				});
				
				
				/*$scope.onPDFFileChanged = function () {
					$element.empty();
					this.lastScrollY = 0;
					this.viewer.setFile(this.file, $element, this.initialScale, this.shouldRenderTextLayer(), pageMargin);
				};

				$element.bind("scroll", function (event) {
					$scope.$apply(function () {
						var scrollTop = $element[0].scrollTop;
						var h = $element.outerHeight(true);
						var scrollDir = scrollTop - $scope.lastScrollY;
						$scope.lastScrollY = scrollTop;

						var normalizedScrollDir = scrollDir > 0 ? 1 : (scrollDir < 0 ? -1 : 0);
						$scope.pdfApp.renderAllVisiblePages(normalizedScrollDir);
						
						var scrollInfo = {
								"scrollTop" : scrollTop,
								'scrlRatio':(scrollTop/h),
								'element':$element
								};
						$scope.$emit("pdfOnScroll",scrollInfo);
					});
				});*/
			}],
			
			link: function (scope, element, attrs) {
				attrs.$observe('src', function (src) {
					if (src !== undefined && src !== null && src !== '') {
						scope.onPDFSrcChanged();
					}
				});

				scope.$watch("annotations", function (annotations) {
					try {
						scope.pdfApp.annotations = annotations;
						var pages = scope.pdfApp.getRenderedPages();
						if(pages) {
							_.each(pages,function(page,index) {
								scope.pdfApp.renderAnnotaions(page);
							});
						}
					} catch (e) {
						
					}
					
				});
				
				scope.$watch("snippets", function (snippets) {
					scope.pdfApp.snippets = snippets;
				});
				
				scope.$watch("deepLinks", function (deepLinks) {
					scope.pdfApp.deepLinks = deepLinks;
				});
				
				scope.$watch("perms", function (perms) {
					scope.pdfApp.perms = perms;
				});
				
				/*scope.$watch("file", function (file) {
					if(scope.file !== undefined && scope.file !== null) {
						scope.onPDFFileChanged();
					}
				});

				scope.$watch("annotType", function (annotType) {
					if(scope.annotType !== undefined && scope.annotType !== null) {
						AnnotOptions.type = scope.annotType;
						
						if (scope.annotType == "drawing") {
							AnnotOptions.setFreeDrawingMode(true);
						}
						if (scope.annotType == "highlight" || scope.annotType == "deepLink") {
							$('.canvas-container canvas').css("z-index",0);
						}
						scope.annotType = undefined;
					}
				});
				
				attrs.$observe("searchTerm", function (searchTerm) {
					if (searchTerm !== undefined && searchTerm !== null && searchTerm !== '') {
						scope.viewer.search(searchTerm);
					} else {
						scope.viewer.resetSearch();
					}
				});*/
			}
		};
	}]);
})(angular, pdfjsLib, document);

;(function(){
	'use strict';
	
	angular.module("vdvcPublicApp").factory("CommonService", ['$rootScope','httpService','$uibModal','$window','$document','$state','$deviceInfo','appData',
	                                                    function($rootScope,httpService,$uibModal,$window,$document,$state,$deviceInfo,appData) {
		
		var pathnaemArray = $window.location.pathname.split( '/' );
		var protocol = $window.location.protocol;
		var host = $window.location.host;
		var context = pathnaemArray[1];
		
		var isEditorCssLoaded = false;
		var CommonService = {
				sortAnnotationsByTextPosition : sortAnnotationsByTextPosition,
				getPublicDigestById : getPublicDigestById,
				getPublicDocById : getPublicDocById,
				getGlobalSettings : getGlobalSettings,
				loadEditorCss : loadEditorCss
		};
		
		CommonService.getBaseUrl = function() {
			return protocol+"//" +host+"/";
		}
		
		CommonService.sendUseragentinfo = function() {
			var info = $deviceInfo.deviceInfo;
			return httpService.httpPost("common/useragentinfo",info);
		};
		
		CommonService.getKeyValuesForVDVCColorCodeType = function() {
			return httpService.httpGet("publicAPI/getKeyValuesForVDVCColorCodeType");
		};
		
		CommonService.getKeyValuesForWebAnnotationsType = function() {
			return httpService.httpGet("publicAPI/getKeyValuesForWebAnnotationsType");
		};
		
		CommonService.getKeyValuesForNotificationHandledelayTime = function() {
			return httpService.httpGet("publicAPI/getKeyValuesForNotificationHandledelayTime");
		};
		
		CommonService.getDigestHtml = function(id) {
			return httpService.httpGet("publicAPI/getDigestHtml/"+id);
		};
		
	    /* Define functin to find and replace specified term with replacement string */
	    CommonService.replaceAll = function(str, term, replacement) {
	      return str.replace(new RegExp(escapeRegExp(term), 'g'), replacement);
	    };
	    
	    CommonService.getScrollingElement = function(_document) {
			 var userAgent = $window.navigator.userAgent;
			 
			 if (_document.scrollingElement) {
				 return _document.scrollingElement;
			 }
			 if (userAgent.indexOf('WebKit') != -1) {
				return _document.body;
			 }
			 return _document.documentElement;
		}
	    
	    function sortAnnotationsByTextPosition(a,b) {
			if(!_.isEmpty(a['position']) && !_.isEmpty(b['position']) ) {
				return a['position'].y - b['position'].y || a['position'].x - b['position'].x;
			}
			return 0;
		}
	    
	    function getPublicDigestById(id) {
	    	return httpService.httpGet("publicAPI/getDigest/"+id);
	    }
	    
	    function getPublicDocById(id,tsId,dId,aId) {
	    	var servideUrl = "publicAPI/getDigestDoc/"+id+"/"+tsId+"/"+dId;
	    	if(aId) {
	    		servideUrl = servideUrl+"/"+aId;
	    	}
	    	return httpService.httpGet(servideUrl);
	    }
	    
	    function getGlobalSettings() {
	    	CommonService.getKeyValuesForVDVCColorCodeType().then(function(resp){
	    		var appdata = appData.getAppData();
	    		var numiciImage, numiciLink, numiciHeaderTxt, numiciFooterTxt;
				if(resp.status == 200 && resp.data.Status) {
					var VDVCColorCodes  = resp.data.listAppKeyValues;
		 			numiciImage = _.findWhere(VDVCColorCodes, {key: "NumiciImage"});
		 			numiciLink = _.findWhere(VDVCColorCodes, {key: "NumiciLink"});
		 			numiciHeaderTxt = _.findWhere(VDVCColorCodes, {key: "NumiciHeaderText"});
		 			numiciFooterTxt = _.findWhere(VDVCColorCodes, {key: "NumiciFooterText"});
 			  	}
	 			appdata["numiciImage"] = numiciImage && numiciImage.value ? numiciImage.value : "https://app.numici.com/app/assets/icons/Numici_logo-N-in_Blue.jpg";
	 			appdata["numiciLink"] = numiciLink && numiciLink.value ? numiciLink.value : "https://www.numici.com";
	 			appdata["numiciHeaderTxt"] = numiciHeaderTxt && numiciHeaderTxt.value ? numiciHeaderTxt.value : "Powered by Numici";
	 			appdata["numiciFooterTxt"] = numiciFooterTxt && numiciFooterTxt.value ? numiciFooterTxt.value : "Workspace designed for Research";
        	});
	    }
	    
	    function loadEditorCss() {
	    	CommonService.getKeyValuesForVDVCColorCodeType().then(function(resp){
				if(resp.status == 200 && resp.data.Status) {
					var VDVCColorCodes  = resp.data.listAppKeyValues;
			    	var antClrCde = _.findWhere(VDVCColorCodes, {key: "Annotation"});
		     		var pdfAntClrCde = _.findWhere(VDVCColorCodes, {key: "PdfAnnotation"});
		 			var antSlctClrCde = _.findWhere(VDVCColorCodes, {key: "AnnotationSelect"});
		 			var pdfAntSlctClrCde = _.findWhere(VDVCColorCodes, {key: "PdfAnnotationSelect"});
		 			var PdfAnnotationSelectBorder = _.findWhere(VDVCColorCodes, {key: "PdfAnnotationSelectBorder"});
		 			var snippetClrCde = _.findWhere(VDVCColorCodes, {key: "Snippet"});
		 			var snippetSlctClrCde = _.findWhere(VDVCColorCodes, {key: "SnippetSelect"});
		 			var toggleStripClrCde = _.findWhere(VDVCColorCodes, {key: "ToggleStrip"});
		 			
		 			var appdata = {};
		 			appdata["antClrCde"] = antClrCde && antClrCde.value ? antClrCde.value : "rgba(255, 255, 0, 0.3);";
		 			appdata["pdfAntClrCde"] = pdfAntClrCde && pdfAntClrCde.value ? pdfAntClrCde.value : "rgba(255, 255, 0, 0.3);";
		 			appdata["antSlctClrCde"] = antSlctClrCde && antSlctClrCde.value ? antSlctClrCde.value : "rgba(255, 255, 0, 0.6);";
		 			appdata["pdfAntSlctClrCde"] = pdfAntSlctClrCde && pdfAntSlctClrCde.value ? pdfAntSlctClrCde.value : "rgba(255, 255, 0, 0.6);";
		 			appdata["PdfAnnotationSelectBorder"] = PdfAnnotationSelectBorder && PdfAnnotationSelectBorder.value ? PdfAnnotationSelectBorder.value : "rgba(255, 0, 0,1);";
		 			appdata["snippetClrCde"] = snippetClrCde && snippetClrCde.value ? snippetClrCde.value : "#cfe2f3";
		 			appdata["snippetSlctClrCde"] = snippetSlctClrCde && snippetSlctClrCde.value ? snippetSlctClrCde.value : "#cfe2f3";
		 			appdata["toggleStripClrCde"] = toggleStripClrCde && toggleStripClrCde.value ? toggleStripClrCde.value : "rgba(0, 102, 153, 1);";
			    	
			    	//temp code needs to update
		 			if(!isEditorCssLoaded) {
		 				CKEDITOR.addCss(
			 			        'body {' +
						            'word-wrap: break-word;'+
						            'padding-top: 10px;'+
						            'width: 210mm;'+
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
	    	});
 			  
	    }
	    return CommonService;
	}]);
	
})();
;(function() {
	'use strict';
	
	// This is the function.
	String.prototype.format = function (args) {
		var str = this;
		return str.replace(String.prototype.format.regex, function(item) {
			var intVal = parseInt(item.substring(1, item.length - 1));
			var replace;
			if (intVal >= 0) {
				replace = args[intVal];
			} else {
				replace = "";
			} 
			return replace;
		});
	};
	
	String.prototype.format.regex = new RegExp("{-?[0-9]+}", "g");
	
})();
; (function() {
	'use strict';

	/**
 * Fallback in-memory store if `localStorage` is not read/writable.
 */
	class InMemoryStorage {
		constructor() {
			this._store = {};
		}

		getItem(key) {
			return (key in this._store) ? this._store[key] : null;
		}

		setItem(key, value) {
			this._store[key] = value;
		}

		removeItem(key) {
			delete this._store[key];
		}
	}


	angular.module("vdvcPublicApp").factory("localStorage", localStorage);
	localStorage.$inject = ['$window'];


	angular.module("vdvcPublicApp").factory("sessionStorage", sessionStorage);
	localStorage.$inject = ['$window'];

	function localStorage($window) {
		let storage;
		let testKey = 'numici.testKey';

		try {
			// Test whether we can read/write localStorage.
			storage = $window.localStorage;
			$window.localStorage.setItem(testKey, testKey);
			$window.localStorage.getItem(testKey);
			$window.localStorage.removeItem(testKey);
		} catch (e) {
			storage = new InMemoryStorage();
		}

		return {
			getItem(key) {
				return storage.getItem(key);
			},

			getObject(key) {
				var item = storage.getItem(key);
				return item ? JSON.parse(item) : null;
			},

			setItem(key, value) {
				storage.setItem(key, value);
			},

			setObject(key, value) {
				var repr = JSON.stringify(value);
				storage.setItem(key, repr);
			},

			removeItem(key) {
				storage.removeItem(key);
			},
		};
	}


	function sessionStorage($window) {
		let storage;
		let testKey = 'numici.testKey';

		try {
			// Test whether we can read/write localStorage.
			storage = $window.sessionStorage;
			$window.sessionStorage.setItem(testKey, testKey);
			$window.sessionStorage.getItem(testKey);
			$window.sessionStorage.removeItem(testKey);
		} catch (e) {
			storage = new InMemoryStorage();
		}

		return {
			getItem(key) {
				return storage.getItem(key);
			},

			getObject(key) {
				var item = storage.getItem(key);
				return item ? JSON.parse(item) : null;
			},

			setItem(key, value) {
				storage.setItem(key, value);
			},

			setObject(key, value) {
				var repr = JSON.stringify(value);
				storage.setItem(key, repr);
			},

			removeItem(key) {
				storage.removeItem(key);
			},
		};
	}
})();
;(function(){
	'use strict';
	angular.module("vdvcPublicApp").factory("LocalStorageService",LocalStorageService);	
	
	LocalStorageService.$inject = ['localStorage','sessionStorage'];
	
	function LocalStorageService(localStorage,sessionStorage) {
		var LocalStorageService = {};
		LocalStorageService.WELCOME_PAGE = "welcomePage";
		LocalStorageService.SLACK_AUTH = "slackAuth";
		LocalStorageService.INSTALL_SLACK_AUTH = "installSlackAuth"
		LocalStorageService.STATE_INFO = "stateInfo";
		LocalStorageService.SCHEDULE_IN_MAINTENANCE_MODE = "scheduleInMaintenanceMode";
		
		LocalStorageService.setLocalStorage = setLocalStorage;
		LocalStorageService.getLocalStorage = getLocalStorage;
		LocalStorageService.removeLocalStorage = removeLocalStorage;
		
		LocalStorageService.setSessionStorage = setSessionStorage;
		LocalStorageService.getSessionStorage = getSessionStorage;
		LocalStorageService.removeSessionStorage = removeSessionStorage;
		
		function setLocalStorage(key,item) {
			localStorage.setItem(key,item);
		}
		
		function getLocalStorage(key) {
			return localStorage.getItem(key);
		}
		
		function removeLocalStorage(key) {
			localStorage.removeItem(key);
		}
		
		
		
		function setSessionStorage(key,item) {
			sessionStorage.setItem(key,item);
		}
		
		function getSessionStorage(key) {
			return sessionStorage.getItem(key);
		}
		
		function removeSessionStorage(key) {
			sessionStorage.removeItem(key);
		}
		
		return LocalStorageService;
	}
})();

;(function(){
	'use strict';
	angular.module("vdvcPublicApp").factory("APIUserMessages",APIUserMessages);
	
	APIUserMessages.$inject = ['$rootScope','_','toaster'];
	
	function APIUserMessages($rootScope,_,toaster) {
		
		var APIUserMessages = {
				error : error,
				info : info,
				warning : warning,
				success : success,
				stickySuccess : stickySuccess
		};
		
		return APIUserMessages;
		
		function error(message) {
			toaster.pop({
                type: 'error',
                timeout: 0,
                body: message,
                showCloseButton: true,
                toasterId: 'top-full-width',
                clickHandler: function(toaster,isClose) {
             	   if (isClose) {
             		   return true;
             	   }  
             	   return false;
                }
            });
	    }
	    
	    function info(message) {
	    	toaster.clear({
	    		"hideDuration": "0"
	    	});
	    	toaster.pop({
                type: 'info',
                timeout: 5000,
                body: message,
                toasterId: 'top-center'
            });
	    }
	    
	    function warning(message) {
	    	toaster.pop({
                type: 'warning',
                timeout: 5000,
                body: message,
                toasterId: 'top-center'
            });
	    }
	    
	    function success(message) {
	    	toaster.pop({
                type: 'success',
                timeout: 5000,
                body: message,
                toasterId: 'top-right'
            });
	    }
	    
	    function stickySuccess(message) {
			toaster.pop({
                type: 'success',
                timeout: 0,
                body: message,
                showCloseButton: true,
                toasterId: 'top-right',
                clickHandler: function(toaster,isClose) {
             	   if (isClose) {
             		   return true;
             	   }  
             	   return false;
                }
            });
	    }
	}
	
	angular.module("vdvcPublicApp").factory("MessageService",MessageService);
	
	MessageService.$inject = ['$rootScope','_','APIUserMessages'];
	
	function MessageService($rootScope,_,APIUserMessages) {
		
		var MessageService = {
				getFormatedMessage: getFormatedMessage,
				showSuccessMessage : showSuccessMessage,
				showErrorMessage : showErrorMessage,
				showWarningMessage : showWarningMessage,
				showInfoMessage : showInfoMessage
		};
		
		MessageService.confirmMessages = {
				"ADD_EXTERNAL_DOC_CNF_MSG" : "<p class='confirm-signed-in-content'>Please click on 'Copy & Add' button to add documents copy to taskspace <div>OR</div> Click on 'Continue' button to add documents to taskspace without copying</p>",
		};
		MessageService.messages = {
				"BACKEND_ERR_MSG" : "{0}",
				"BACKEND_SUC_MSG" : "{0}",
				"WRK_IN_PROGRESS_ERR" : 'NEEDS TO BE IMPLEMENTED',
				"PDF_SNIPPET_WAR" : "Unable to navigate to the snippet. Use the browser search to find it",
				
				
				"PDF_TXT_SELECTION_ERR" : "Please reselect the text properly",
				"LINK_COPIED_TO_CLIPBOARD" : "Link copied to clipboard.",
				
				"ADV_SEARCH_SAVE" : 'Search Criteria "{0}" is saved Successfully',
				
				"ADV_SEARCH_SAVE_ERR" : 'Search Criteria with the name "{0}" is already Present',
				
				"COMMENT_DELETE" : 'Comment is deleted successfully',
				"DEEPLINK_DELETE" : 'Deep link is deleted successfully',
				
				"DOC_CREATE" : 'Document "{0}" is Created Successfully',
				"DOC_UPLOAD" : 'Document "{0}" is uploaded Successfully',
				"DOC_LOCKED" : 'The Document is locked by user : {0}',
				"DOC_UPDATE" : 'Document "{0}" is Updated Successfully',
				"DOC_SAVE" : 'Document "{0}" is Saved Successfully',
				"DOC_SAVE_LOCK_ERROR" : 'Document "{0}" is Saving Failed, Doc Edit Lock has been acquired by other User',
				"DOC_SAVE_CONFLICT_ERR" : "Could not complete performed action. Please Try Again.",
				"DOC_DELETE" : 'Document "{0}" is Deleted Successfully',
				"DOC_SHARE" : 'Document "{0}" is Shared Successfully',
				"DOC_RENAME" : 'Document Renamed Successfully',
				"COMPARE_DOCID_NOTAVAILABLE_ERR" : "Compare Document ID Not Available",
				"NOT_SECFILE" : "Document is not an SECFile",
				"DOCUMENT_NOT_FOUND" : "SEC Document Not Available",
				"ANNOTATION_NOT_FOUND" : "Annotation with ID : '{0}' is not found in Document.",
				
				"FOLDER_CREATE" : 'Folder "{0}" is Created Successfully',
				"FOLDER_DELETE" : 'Folder "{0}" is Deleted Successfully',
				"FOLDER_SHARE" : 'Folder "{0}" is Shared Successfully',
				"FOLDER_RENAME" : 'Folder Renamed Successfully',
				"SET_FOLDER_SYNC_EVERNOTE" : 'Folder Synced With Evernote Notebook : "{0}" Successfully',
				"FOLDER_SYNC_EVERNOTE" : 'Folder Synced With Evernote Notebook Successfully',
				"REMOVE_FOLDER_SYNC_EVERNOTE" : 'Folder Synchonization with Evernote Removed Successfully',
				"FOLDER_LINK" : 'Folder "{0}" Linked Successfully',
				"DELETE_ITEMS" : 'Selected Items Are Deleted Successfully',
				"ITEMS_NOT_FOUND_DELETE" : 'Selected Items Are Not Found To Delete',
				"ITEMS_ASSOCIATED_WITH_TASKSPACE_DELETE" : "Document Is Associated To A Taskspace, Can't Delete The Document.",
				"DELETE_ITEMS_ERR" : "You dont have permissions to Delete the selected Items",
				"EMPTY_TRASH" : "Trash is emptied Successfully",
				"ITEMS_NOT_FOUND_SHARE" : 'Selected Items Are Not Found To Share',
				"ITEMS_NOT_SHARE" : 'Selected Items Are Not Shared Successfully',
				"SHARE_ITEMS_ERR" : "You dont have permissions to Share the selected Items",
				"SHARE_ITEMS" : 'Selected Items Are Shared Successfully',
				"SHARE_ITEMS_TO_OWNER" : 'Can not share selected item to owner',
				"SHARED_ITEMS_TO_USER" : 'Selected item already shared to {0}',
				"EDIT_PROPERTIES" : 'Properties Updated Successfully',
				"EDIT_PROPERTIES_ERR" : 'You dont have permissions to Properties the selected Items',
				"PROXIMITY_VAL_ERR" : 'Please Check the Syntax for Proximity. Ex: "Hello World"~10',
				
				"TAG_ITEMS" : 'Selected Items Are Tagged Successfully.',
				"TAG_ITEMS_ERR" : "You Dont Have Permissions To Tag The Selected Items",
				"ITEMS_NOT_FOUND_TAG" : "Selected Items Are Not Found To Tag",
				
				"COPY_ITEMS" : 'Selected Items Are Copied Successfully.',
				"COPY_ITEMS_ERR" : "You Dont Have Permissions To Copy The Selected Items",
				"COPY_ANOTHER_DOC_EXISTS" : "Another Document with '{0}' Name Exists",
				"ITEMS_NOT_FOUND_COPY" : "Selected Items Are Not Found To Copy",
				
				"PASSWORD_CHANGE" : "Your Password Changed Successfully",
				
				"TASKSPACE_CREATE" : 'Taskspace "{0}" is Created Successfully',
				"TS_CREATE_N_SHARE" : 'Taskspace "{0}" Is Created And Shared Successfully.',
				"TASKSPACE_RENAME" : "Taskspace Renamed Successfully",
				"ADD_TASKSPACE" : "Document Added To Taskspace Successfully",
				"DOCS_ADDED_TO_TS" : "Documents Added To Taskspace Successfully",
				"TASKSPACE_OBJ_MOVE" : "'{0}' document moved successfully.",
				"DELETE_DOCUMENT_FROM_TS" : "'{0}' document deleted successfully.",
				"OBJECT_NOT_EXISTS" : "Documnet with ID : '{0}'  no longer associated to Taskspace.",
				"DIGEST_LINK_DELETE" : "Digest link deleted Successfully",
				"DIGEST_LINK_UPDATE" : "Digest link updated Successfully",
				"PORTFOLIO_UPDATE":"Portfolio updated Successfully",
					
				"DEFAULT_ERROR_MSG" : "Something went wrong.Did not get any Error Message",
					
				"MOVE_TO_PERM_ERROR" : "You don't have permissions to move on selected items",
				
				"RULE_DELETE" : 'Rule "{0}" is deleted successfully',
				"RULES_ORDER_SAVE" : 'Rules order saved successfully',
				
				"SLACK_CONNECTS_TS" : "Channel '{0}' connected to taskspace '{1}' successfully.",
				"ASANA_CONNECTS_TS" : "Project '{0}' connected to taskspace '{1}' successfully.",
				"ASANA_DISCONNECT_TS" : "Project '{0}' disconnected successfully.",
				"SLACK_M_CONNECTS_TS" : "Selected Channels are connected to taskspaces successfully.",
				"SLACK_TEAM_DELETE" : "Team '{0}' deleted successfully.",
				"SLACK_SETTINGS_SAVE" : 'Slack {0} settings are saved successfully',
				"SLACK_SETTINGS_DELETE" : "Taskspace '{0}' disconnected successfully from Team '{1}'",
								
				"ANNOTATION_DIGEST_NODATA_INFO" : 'No Annotations found for any of the documents associated with the Taskspace',
				"CREATE_HELP_TOPICS" : 'Help context "{0}" is created successfully',
				"ERROR_CREATE_HELP_TOPICS" : "Could not find 'Help' folder at root level",
				"APP_SETTINGS_SAVED" : "Settings saved successfully",
				"APP_SETTINGS_DELETED" : "Settings deleted successfully",
				"APP_SETTINGS_ERR" : "{0}",
				"EXCEEDED_USER_QUOTA" : "You have reached the storage quota limit. Please contact sales@numici.com to upgrade your account.",
				"UTILIZED_80_PERCENT_OF_USER_QUOTA" : "You have utilized more than 80% of the allocated size",
				"RESET_PWD_ERR_MSG" : "{0}",
				"NTF_SETTINGS_SAVE" : "Notification settings saved successfully",
				
				"ORGANIZATION_CREATED" : "Organization '{0}' created successfully",
				"ORGANIZATION_UPDATED" : "Organization '{0}' updated successfully",
				"ORGANIZATION_DELETED" : "Organization '{0}' deleted successfully",
				"USER_CREATED" : "User '{0}' created successfully",
				"USER_UPDATED" : "User '{0}' updated successfully",
				"USER_DELETED" : "User '{0}' deleted successfully",
				"CONVERT_GUEST_TO_PROUSER" : "User '{0}' converted guest user to provisional user",
				"MAINTENANCE_SCHEDULE_CREATED" : "Maintenance schedule '{0}' created successfully",
				"MAINTENANCE_SCHEDULE_UPDATED" : "Maintenance schedule '{0}' updated successfully",
				"MAINTENANCE_SCHEDULE_INITIATED" : "Maintenance schedule '{0}' initited successfully",
				"MAINTENANCE_SCHEDULE_CANCELED" : "Maintenance schedule '{0}' cancelled successfully",
				"MAINTENANCE_SCHEDULE_COMPLETED" : "Maintenance schedule '{0}' completed successfully",
				"MAINTENANCE_SCHEDULE_DELETED" : "Maintenance schedule '{0}' deleted successfully",
				"ADMINISTRATION_ERR" : "{0}",
				"ASSIGN_ACTION_ITEMS" : "Assigned action items successfully",
				"UPDATE_ACTION_ITEM" : "Action item updated successfully",
				"MARK_COMPLETE_ACTION_ITEM" : "Action item marked as complete successfully",
				"ACTION_ITEM_SYNC_WITH_TS" : "Action items synced with selected taskspace successfully",
				"ACTION_ITEM_SYNC_RM_WITH_TS" : "Action items sync removed from selected taskspace successfully"
				
		};
		
		return MessageService;
		
		function getFormatedMessage(messageKey , args) {
			if( _.isString(MessageService.messages[messageKey]) ) {
				if (args) {
					return MessageService.messages[messageKey].format(args);
				} else {
					return MessageService.messages[messageKey];
				}
				
			} else {
				return "Message Not Found";
			}
		}
		
		function showSuccessMessage(messageKey , args) {
			var msg = MessageService.getFormatedMessage(messageKey , args);
			
			APIUserMessages.success(msg);
			
		}
		
		function showErrorMessage(messageKey , args) {
			var msg = MessageService.getFormatedMessage(messageKey , args);
			
			APIUserMessages.error(msg);
			
		}
		
		function showWarningMessage(messageKey , args) {
			var msg = MessageService.getFormatedMessage(messageKey , args);
			APIUserMessages.warning(msg);
		}
		
		function showInfoMessage(messageKey , args) {
			var msg = MessageService.getFormatedMessage(messageKey , args);
			APIUserMessages.info(msg);
		}
	}
	
})();

;(function() {
	'use strict';

	angular.module('vdvcPublicApp').factory('urlParser', urlParser);
	
	urlParser.$inject = ['_'];

	function urlParser(_) {

		var parser = {
			parseUrl : parseUrl
		};
		
		return parser;
		
		function parseUrl(url) {
			var parser = document.createElement('a'), searchObject = {}, queries, split, i;
			parser.href = url;
			queries = parser.search.replace(/^\?/, '').split('&');

			var pathname = parser.pathname;
			if(_.isString(pathname) && pathname.trim().charAt(0) !== "/") {
				pathname = "/"+pathname;
			}
			
			for (i = 0; i < queries.length; i++) {
				split = queries[i].split('=');
				searchObject[split[0]] = split[1];
			}

			return {
				protocol : parser.protocol, // ex: http:
				host : parser.host, // ex: localhost:3000
				hostname : parser.hostname, // ex: localhost
				port : parser.port, // ex: 3000
				pathname : pathname, // ex: /models
				search : parser.search,
				searchObject : searchObject,
				hash : parser.hash
			};

		}
	}
})();
(function(){
    'use strict';
    
    angular.module('vdvcPublicApp').service('uuidService', uuidService);

    function uuidService() {
        var service = this;

        service.newUuid = newUuid;

        /**
         * Returns a string that is unique a high percentage of the time.
         * @return {string} - UUID. Example: f81d4fae-7dec-11d0-a765-00a0c91e6bf6
         * @see <a href="http://www.ietf.org/rfc/rfc4122.txt">A Universally Unique IDentifier (UUID) URN Namespace</a>
         */
        function newUuid() {

            var s = [];
            var hexDigits = '0123456789abcdef';
            for (var i = 0; i < 36; i++) {
                s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
            }
            s[14] = '4'; // bits 12-15 of the time_hi_and_version field to 0010
            s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
            s[8] = s[13] = s[18] = s[23] = '-';
            return s.join('');
        }
    }
})();
;(function() {
	'use strict';
	angular.module("vdvcPublicApp").factory("GlobalErrorHandler", GlobalErrorHandler);
	
	GlobalErrorHandler.$inject = ['$q','_','APIUserMessages',"$rootScope","AUTH_EVENTS",'$userTimeZone','$deviceInfo'];
	
	function GlobalErrorHandler($q,_,APIUserMessages,$rootScope,AUTH_EVENTS,$userTimeZone,$deviceInfo) {
		var GlobalErrorHandler = {
				response : responseHandler,
				responseError : responseErrorHandler,
				request : request
		};
		
		return GlobalErrorHandler;
		
		function responseHandler(response) {
           if(_.isObject(response.data) && response.data && _.isBoolean(response.data.Status) && !response.data.Status) {
        	   var msg = response.data.Message ? response.data.Message : "Something went wrong.Did not get any Error Message "+"URL is "+response.config.url;
        	   APIUserMessages.error(msg);
        	   var err = new Error(msg);
        	   console.error(err);
           }
           
           setRespomnseTimeStamp(response);
           return response;
        }
        
        function responseErrorHandler(response) {
        	
        	if(response.status === 404) {
        		APIUserMessages.error('There was some problem. Please try again.');
            }
        	
        	if(response.status === 401) {
        		//$state.go("login");
        		$rootScope.$broadcast({
        	        401: AUTH_EVENTS.notAuthenticated,
        	        403: AUTH_EVENTS.notAuthorized,
        	        419: AUTH_EVENTS.sessionTimeout,
        	        440: AUTH_EVENTS.sessionTimeout
        	      }[response.status], response.data);
            }
        	
        	if(response.status === -1) {
        		//alert("either the server is down or the client is not connected to the internet");
        	}
        	
        	setRespomnseTimeStamp(response);
        	return  $q.reject(response);
        }
        
        function request(config) {
        	if(config.url && (config.url.indexOf("api/") >= 0 || config.url.indexOf("annotateWebApi/") >= 0)) {
            	config.requestTimestamp = new Date().getTime();
            	config.headers.USER_TIMEZONE= $userTimeZone.timeZone;
            	
            	config.headers.USER_BROWSER = "unknown";
            	config.headers.USER_OS = "unknown";
            	config.headers.USER_DEVICE_TYPE = "unknown";
            	config.headers.USER_DEVICE_MODEL = "unknown";
            	config.headers.USER_DEVICE_VENDOR = "unknown";
            	
            	if(!_.isEmpty($deviceInfo.deviceInfo)) {
            		var info = $deviceInfo.deviceInfo;
            		if(!_.isEmpty(info.browser) && !_.isEmpty(info.browser.name)) {
            			config.headers.USER_BROWSER = info.browser.name;
            		}
            		
            		if(!_.isEmpty(info.os) && !_.isEmpty(info.os.name)) {
            			config.headers.USER_OS = info.os.name;
            		}
            		
            		if(!_.isEmpty(info.device) && !_.isEmpty(info.device.type)) {
            			config.headers.USER_DEVICE_TYPE = info.device.type;
            		}
            		
            		if(!_.isEmpty(info.device) && !_.isEmpty(info.device.model)) {
            			config.headers.USER_DEVICE_MODEL = info.device.model;
            		}
            		
            		if(!_.isEmpty(info.device) && !_.isEmpty(info.device.vendor)) {
            			config.headers.USER_DEVICE_VENDOR = info.device.vendor;
            		}
            	}
        	}
        	
            return config;
        }
        
        function setRespomnseTimeStamp(response) {
        	 if(response.config.url && response.config.url.indexOf("api/") >= 0) {
        		  response.config.responseTimestamp = new Date().getTime();
            	  var time = response.config.responseTimestamp - response.config.requestTimestamp;
            	  time = (time/1000);
            	  if(time >= 0 && !response.config.url.indexOf("getUserNotificationCount") >= 0) {
            		  var timeLog = {
            			   'timeStamp': response.config.requestTimestamp,
            			   'requestedUrl' : response.config.url,
            			   'httpStatus' : response.status,
            			   'responseTime' : time
            		  };
            		  //TimeLogService.setTimeLogInfo(timeLog);
            	  }
        	 }
        }
	}
	
})();

;(function () {
    angular
        .module('vdvcPublicApp')
        .directive('vdvcSpinner', vdvcSpinner)
        .service('spinnerService', spinnerService)
        .factory('spinnerHttpInterceptor', spinnerHttpInterceptor);

    vdvcSpinner.$inject = ['spinnerService'];
    function vdvcSpinner(spinnerService) {
        return {
            restrict: 'E',
            scope: {
                name: '@'
            },
            transclude: true,
            template: [
                '<div class="vdvc-spinner-container" ng-if="active">',
                '<div class="vdvc-spinner">',
                '<div ng-transclude>',
                '<div class="spinner">',
                '<div class="rect1"></div>',
                '<div class="rect2"></div>',
                '<div class="rect3"></div>',
                '<div class="rect4"></div>',
                '<div class="rect5"></div>',
                '</div>',
                '</div>',
                '</div>',
                '</div>'
            ].join(" "),
            link: function (scope, elm, attrs) {
                scope.active = false;

                var parent = elm.parent();
                var parentPosition = parent.position;

                var spinnerContext = {
                    show: show,
                    close: close
                }

                if (!parentPosition || parentPosition === 'static' || parentPosition === '')
                    parent.css('position', 'relative');

                function show() {
                    scope.active = true;
                }

                function close() {
                    scope.active = false;
                }

                spinnerService.register(scope.name, spinnerContext);
            }
        }
    }

    function spinnerService() {
        var service = this;
        var spinners = {};

        service.show = show;
        service.close = close;
        service.showAll = showAll;
        service.closeAll = closeAll;
        service.register = register;
        service.unregister = unregister;

        return service;

        function show(name) {
            if (spinners[name]) {
            	 spinners[name].show();
            }
        }

        function close(name) {
            if (spinners[name]) {
            	spinners[name].close();
            } 
        }

        function showAll() {
            for (var name in spinners) {
                if (spinners[name]) {
                	 spinners[name].show();
                } 
            }
        }

        function closeAll() {
            for (var name in spinners) {
                if (spinners[name]) {
                	spinners[name].close();
                } 
            }
        }

        function register(name, spinnerContext) {
            spinners[name] = spinnerContext;
        }

        function unregister(name) {
            spinners[name] = null;
        }
    }

    spinnerHttpInterceptor.$inject = ['spinnerService', '$q'];
    function spinnerHttpInterceptor(spinnerService, $q) {

        var activeSpinners = {};

        return {
            'request': function (config) {
                handleRequest(config);
                return config;
            },
            'requestError': function (rejection) {
                handleResponse(rejection.config);
                return $q.reject(rejection);
            },
            'response': function (response) {
                handleResponse(response.config);
                return response;
            },
            'responseError': function (rejection) {
                handleResponse(rejection.config);
                return $q.reject(rejection);
            }
        }

        function handleRequest(config) {
            var spinner = config.spinner,
                url = config.url;

            if (!spinner) {
                activeSpinners[url] = 'all';
                spinnerService.showAll();
                return;
            }

            activeSpinners[url] = spinner;

            if (Array.isArray(spinner)) {
                spinner.forEach(function (name) {
                    spinnerService.show(name);
                })
            } else {
                spinnerService.show(spinner);
            }

        }

        function handleResponse(config) {
            var url = config.url;
            var spinner = activeSpinners[url];

            if (spinner === 'all') {
                spinnerService.closeAll();
            } else if (Array.isArray(spinner)) {
                spinner.forEach(function (name) {
                    spinnerService.close(name);
                })
            } else {
                spinnerService.close(spinner);
            }

            activeSpinners[url] = null;
        }
    }
})();
;(function(){
	'use strict';
	angular.module('vdvcPublicApp').directive('annotationDigestContent', function($templateCache) {
		  return {
		    restrict: "E",
		    scope: {
		    	digestData: '=',
		    	digestSettings : "=",
		    	digestFor : "=",
		    },
		    controller : ['$scope','CommonService','appData',
		                  'PublicDigestService','$templateCache','$compile','$timeout','$element','_',
				function ($scope,CommonService,appData,PublicDigestService,
						$templateCache,$compile,$timeout,$element,_) {
		    	var adcc = this;
		    	var appdata = appData.getAppData();
		    	// Instance variables
		    	if(_.isEmpty($scope.digestData)) {
		    		$scope.digestData = $scope.$parent.digestData;
		    	}
		    	if(_.isEmpty($scope.digestSettings)) {
		    		$scope.digestSettings = $scope.$parent.digestSettings;
		    	}

				adcc.content="";
		    	adcc.digestMetaInfoOptions = $scope.digestSettings.digestMetaInfoOptions
				adcc.digestData = $scope.digestData;
				adcc.enableBorder = PublicDigestService.enableBorder = $scope.digestSettings.enableBorder;
				adcc.digestFor = $scope.digestFor;
				adcc.imagePosition = $scope.digestSettings.imagePosition;
				adcc.tableOfContents = $scope.digestSettings.tableOfContents;
				adcc.tableOfContentsHeading = $scope.digestSettings.tableOfContentsHeading;
				adcc.displayOrder = $scope.digestSettings.displayOrder;
				adcc.displayReplies = $scope.digestSettings.filterOptions.displayReplies;
				adcc.digestName = $scope.digestSettings.digestName;
				adcc.digestDescription = $scope.digestSettings.digestDescription;
				adcc.groupBy = $scope.digestSettings.groupBy;
				// Methods
				
				var fileBaseUrl = CommonService.getBaseUrl();
				adcc.commentIconUrl = fileBaseUrl+"/app/assets/icons/digest_comment.png";
				
				adcc.setDigesMinMaxWidth = PublicDigestService.setDigesMinMaxWidth;
				adcc.getTitleStyles = PublicDigestService.getTitleStyles;
				adcc.alternateImageStyles = PublicDigestService.alternateImageStyles;
				adcc.setRepDigestStyles = PublicDigestService.setRepDigestStyles;
				
				var trustedAnnotatedText = {};
				
				adcc.getAnnotatedText = function (annotation) {
					if(!trustedAnnotatedText[annotation.annotationId]) {
						trustedAnnotatedText[annotation.annotationId] = PublicDigestService.getAnnotatedText(annotation,adcc.digestMetaInfoOptions);
					}
					return trustedAnnotatedText[annotation.annotationId];
				};
				
				adcc.formatCreatedDate = PublicDigestService.formatCreatedDate;
				adcc.formatComment = PublicDigestService.formatComment;
								
				function getDigestContent(saveflag) {
					return $timeout(function() {
						var templateUrl = 'apppublic/components/PublicAnnotationDigest/annotaion-digest-template.html';
						var roottemplateUrl = 'apppublic/components/PublicAnnotationDigest/digest-root.tpl.html';
												
						var tmpl = '';
						var gptmpl = '';
						tmpl = '<annotaion-digest-template digest="adcc.digestData"';
						gptmpl = '<annotaion-digest-group-template digest="adcc.digestData"';
						
						var numiciImage = appdata.numiciImage;
						var numiciLink = appdata.numiciLink;
						var numiciFooterText = appdata.numiciFooterTxt;
						tmpl = tmpl+' numici-image="'+numiciImage+'"';
						gptmpl = gptmpl+' numici-image="'+numiciImage+'"';
						
						tmpl = tmpl+' numici-link="'+numiciLink+'"';
						gptmpl = gptmpl+' numici-link="'+numiciLink+'"';
						
						tmpl = tmpl+' numici-footer-text="'+numiciFooterText+'"';
						gptmpl = gptmpl+' numici-footer-text="'+numiciFooterText+'"';
						
						if(!_.isEmpty(adcc.digestName)) {
							tmpl = tmpl+' digest-name="'+adcc.digestName+'"';
							gptmpl = gptmpl+' digest-name="'+adcc.digestName+'"';
						}
						
						var digestUrl = "";
						if(!_.isEmpty(adcc.digestData) && adcc.digestFor == "DigestDocument" && adcc.digestMetaInfoOptions.documentLink) {
							digestUrl = PublicDigestService.getDigestUrlForDocuDigest(adcc.groupBy,adcc.digestData);
						}
						tmpl = tmpl+' digest-url="'+digestUrl+'"';
						gptmpl = gptmpl+' digest-url="'+digestUrl+'"';
						
						if(!_.isEmpty(adcc.digestDescription)) {
							var digestDescription = angular.copy(adcc.digestDescription);
							digestDescription = digestDescription.replace(/(\r\n|\n|\r)/gm, "<br>").replace(/"/g,"&quot;");
							tmpl = tmpl+' description="'+digestDescription+'"';
							gptmpl = gptmpl+' description="'+digestDescription+'"';
						}
						
/*						tmpl = tmpl+' enable-border="'+adcc.enableBorder+'"';
						gptmpl = gptmpl+' enable-border="'+adcc.enableBorder+'"';*/
						
						/*if(!_.isEmpty(adcc.imagePosition)) {
							tmpl = tmpl+' selected-image-position="'+adcc.imagePosition+'"';
							gptmpl = gptmpl+' selected-image-position="'+adcc.imagePosition+'"';
						}*/
						
						tmpl = tmpl+' template-url="'+templateUrl+'" \
							task-space="taskspace"\
							title="true"\
							data-digest-for="adcc.digestFor"\
							data-digest-meta-info-options="adcc.digestMetaInfoOptions"\
							data-image-position="adcc.imagePosition"\
							data-table-of-contents="adcc.tableOfContents"\
							data-table-of-contents-heading="{{adcc.tableOfContentsHeading}}"\
							data-display-order="adcc.displayOrder"\
							data-display-replies="adcc.displayReplies"\
							data-enable-border="adcc.enableBorder"\
							data-group-by="adcc.groupBy"\
							data-set-diges-min-max-width= "adcc.setDigesMinMaxWidth()"\
							data-get-title-styles = "adcc.getTitleStyles()"\
							data-alternate-image-styles = "adcc.alternateImageStyles()"\
							data-set-rep-digest-styles = "adcc.setRepDigestStyles(digest,adcc.digestMetaInfoOptions.image)"\
							data-get-annotated-text = "adcc.getAnnotatedText(annotation)"\
							data-format-created-date = "adcc.formatCreatedDate(dateValue)"\
							data-format-comment="adcc.formatComment(annotation,comment)"\
					    	comment-icon-url = "adcc.commentIconUrl"\
							></annotaion-digest-template>';
						
						gptmpl = gptmpl+' template-url="'+templateUrl+'" \
							task-space="taskspace"\
							data-digest-for="adcc.digestFor"\
							data-digest-meta-info-options="adcc.digestMetaInfoOptions"\
							data-image-position="adcc.imagePosition"\
							data-table-of-contents="adcc.tableOfContents"\
							data-table-of-contents-heading="{{adcc.tableOfContentsHeading}}"\
							data-display-order="adcc.displayOrder"\
							data-display-replies="adcc.displayReplies"\
							data-enable-border="adcc.enableBorder"\
							data-group-by="adcc.groupBy"\
							data-set-diges-min-max-width= "adcc.setDigesMinMaxWidth()"\
							data-get-title-styles = "adcc.getTitleStyles()"\
							data-alternate-image-styles = "adcc.alternateImageStyles()"\
							data-set-rep-digest-styles = "adcc.setRepDigestStyles(digest,adcc.digestMetaInfoOptions.image)"\
							data-get-annotated-text = "adcc.getAnnotatedText(annotation)"\
							data-format-created-date = "adcc.formatCreatedDate(dateValue)"\
							data-format-comment="adcc.formatComment(annotation,comment)"\
					    	comment-icon-url = "adcc.commentIconUrl"\
							></annotaion-digest-group-template>';
						
						var template = angular.element(tmpl);
						if(adcc.groupBy == "tag" || adcc.groupBy == "taghierarchical" || adcc.groupBy == "section") {
							template = angular.element(gptmpl);
						} else {
						    template = angular.element(tmpl);
						}
						var linkFunction = $compile(template);
						var result = linkFunction($scope);
						$scope.$digest();
						if(saveflag) {
							var rootTemplate = $templateCache.get(roottemplateUrl);
							if(!_.isEmpty(rootTemplate)) {
								return rootTemplate.replace("<!--digestdata-->",template.html());
							}
							return template.html();
						} else {
							return template.html();
						}
						
					}, 0);
				}
				
				function init() {
					getDigestContent(true).then(function(content) {
						adcc.content = content;
						/*var divElement = $element.find('.digest-content');
						divElement.empty();
						divElement.append(content);
*/					}).finally(function() {
						$scope.$emit("digestLoaded");
				    });
				}
				init();
		    	
		    }],
		    controllerAs:"adcc",
		    templateUrl: function() {
				 return 'apppublic/components/PublicAnnotationDigest/annotationDigestContent.tmpl.html';
			}
		};
	});
	angular.module('vdvcPublicApp').directive('annotaionDigestTitle', function($templateCache) {
		  return {
		    restrict: "E",
		    scope: {
		    	taskSpace: "=",
		    	getTitleStyles : "&",
		    },
		    controller : ['$scope', '$element','$q','$timeout',
				function ($scope, $element,$q,$timeout) {
		    	var digestTitleSuffix ="Digest (generated by numici)";
		    	$scope.title = "";
		    	
		    	$scope.titleStyles = function() {
		    		return $scope.getTitleStyles();
		    	};
		    	
		    	function init() {
		    		if($scope.taskSpace) {
		    			$scope.title = $scope.taskSpace.name+" - "+digestTitleSuffix;
		    		} else {
		    			$scope.title =  digestTitleSuffix;
		    		}
		    	}
		    	init();
		    	
		    }],
		    templateUrl: function ($element, $attrs) {
	            return 'apppublic/components/PublicAnnotationDigest/digest-title-tmpl.html';
	        }
		   
		};
	});
	
	angular.module('vdvcPublicApp').directive('annotaionDigestTemplate', function($templateCache) {
		  return {
		    restrict: "E",
		    scope: {
		    	taskSpace: "=",
		    	digestData: '=digest',
		    	title:'=',
		    	numiciImage:"@",
		    	numiciLink:"@",
		    	numiciFooterText:"@",
		    	digestName:"@",
		    	digestUrl:"@",
		    	description:'@',
		    	templateUrl:"@",
		    	digestFor :"=",
		    	digestMetaInfoOptions :"=",
		    	enableBorder :"=",
		    	groupBy :"=",
		    	imagePosition :"=",
				tableOfContents:"=",
				tableOfContentsHeading:"@",
		    	displayOrder : "=",
		    	displayReplies : "=",
		    	
		    	setDigesMinMaxWidth : "&",
		    	getTitleStyles : "&",
		    	alternateImageStyles : "&",
		    	setRepDigestStyles : "&",
		    	getAnnotatedText : "&",
		    	formatCreatedDate : "&",
		    	formatComment : "&",
		    	
		    	commentIconUrl : "=",
		    	groupByIndex : "="
		    },
		    controller : ['$scope', 'PublicDigestService',
				function ($scope,PublicDigestService) {
		    	
		    	$scope.digesMinMaxWidth = function() {
		    		//return $scope.setDigesMinMaxWidth();
		    		return {'max-width': '648px','color': '#333','line-height': '1.5','margin': '0 auto','font-size': '14px'};
		    	};
		    	$scope.titleStyles = function() {
		    		return $scope.getTitleStyles();
		    	};
		    	$scope.altImageStyles = function() {
		    		return $scope.alternateImageStyles();
		    	};
		    	$scope.repDigestStyles= function(digest) {
		    		return $scope.setRepDigestStyles({digest : digest});
		    	};
                $scope.hasAnnotatedText = PublicDigestService.hasAnnotatedText;
		    	$scope.annotatedText = function(annotation) {
		    		return $scope.getAnnotatedText({annotation: annotation});
		    	};
		    	$scope.createdDate = function(dateValue) {
		    		return $scope.formatCreatedDate({dateValue:dateValue});
		    	};
		    	
		    	$scope.convertComment = function(annotation,comment) {
		    		return $scope.formatComment({"annotation":annotation,"comment" : comment});
		    	};
		    	
		    }],
		    link:function(scope){
		        scope.url = scope.templateUrl || 'apppublic/components/PublicAnnotationDigest/annotaion-digest-template.html';
		    },
		    /*templateUrl: function ($element, $attrs) {
	              //return $attrs.templateUrl || 'apppublic/components/PublicAnnotationDigest/annotaion-digest-template.html';
		    	return '<div ng-include="url"></div>';
	        }*/
		    template: '<div ng-include="url" data-ng-style="groupBy == \'document\' && {\'box-shadow\': \'3px 5px 5px 3px #aaaaaa\', \'max-width\': \'850px\', \'width\': \'100%\', \'margin\': \'auto\', \'padding\': \'15px\'}"></div>',
		};
	});
	
	
	angular.module('vdvcPublicApp').directive('annotaionDigestGroupTemplate', function() {
		  return {
		    restrict: "E",
		    scope: {
		    	taskSpace: "=",
		    	groupDigestData: '=digest',
		    	numiciImage:"@",
		    	numiciLink:"@",
		    	numiciFooterText:"@",
		    	digestName:'@',
		    	digestUrl:"@",
		    	description:'@',
		    	templateUrl:"@",
		    	digestFor :"=",
			    digestMetaInfoOptions :"=",
			    enableBorder :"=",
			    groupBy :"=",

		    	imagePosition :"=",
				tableOfContents:"=",
				tableOfContentsHeading:"@",
				
		    	displayOrder :"=",
		    	displayReplies :"=",
		    	
		    	setDigesMinMaxWidth : "&",
		    	getTitleStyles : "&",
		    	alternateImageStyles : "&",
		    	setRepDigestStyles : "&",
		    	getAnnotatedText : "&",
		    	formatCreatedDate : "&",
		    	formatComment : "&",
		    	
		    	commentIconUrl : "="
		    },
		    controller : ['$scope','PublicDigestService',
				function ($scope,PublicDigestService) {
		    	
				$scope.getTagAsID = function(name) {
					return PublicDigestService.getTagAsID(name);
				};

		    	$scope.digesMinMaxWidth = function() {
		    		return $scope.setDigesMinMaxWidth();
		    	};
		    	$scope.titleStyles = function() {
		    		return $scope.getTitleStyles();
		    	};
		    	$scope.altImageStyles = function() {
		    		return $scope.alternateImageStyles();
		    	};
		    	$scope.repDigestStyles= function(digest) {
		    		return $scope.setRepDigestStyles({digest : digest});
		    	};
                $scope.hasAnnotatedText = PublicDigestService.hasAnnotatedText;
		    	$scope.annotatedText = function(annotation) {
		    		return $scope.getAnnotatedText({annotation: annotation});
		    	};
		    	$scope.createdDate = function(dateValue) {
		    		return $scope.formatCreatedDate({dateValue:dateValue});
		    	};
		    	
		    	$scope.convertComment = function(annotation,comment) {
		    		return $scope.formatComment({"annotation":annotation,"comment" : comment});
		    	};
		    	
		    	$scope.getTagLable = function(name) {
		    		if(name == "$$untagged") {
		    			return "Untagged Annotations";
		    		}
		    		
		    		return name;
		    	};
		    	
		    	$scope.getTagStyles = function(name) {
		    		if(name == "$$untagged") {
		    			return {'color': '#069','padding': '0px'};
		    		}
		    		
		    		return {'color': '#069','padding': '0px'};
		    	};
		    	
		    	$scope.getTagValueLable = function(name, groupBy) {
			        return PublicDigestService.getTagValueLable(name, groupBy);
		    	};
		    }],
		    link:function(scope){
		        scope.url = scope.templateUrl || 'apppublic/components/PublicAnnotationDigest/annotaion-digest-template.html';
		        scope.grpUrl = 'apppublic/components/PublicAnnotationDigest/digest-group-template.html';
		    },
		    template: '<div ng-include="grpUrl" style="box-shadow: 3px 5px 5px 3px #aaaaaa; max-width: 850px; width: 100%; margin: auto; padding: 15px;"></div>',
		  };
	});
	angular.module('vdvcPublicApp').directive('commentToHtml', ['$sce','$filter','markdown','Juicify',function($sce,$filter,markdown,Juicify) {
		return {
	      replace: true,
	      restrict: 'E',
	      link: function (scope, element, attrs) {
	    	  scope.$watch('comment', function (newValue) {
	              var showdownHTML;
	              if(scope.annotation) {
	            	  var showdownHTMLTxt =  markdown.makeHtml(newValue || '');
	            	  showdownHTML = Juicify.inlineCss(showdownHTMLTxt,Juicify.cssMap[Juicify.markdownCssUrl]);
	  			  } else {
	  				  showdownHTML = $filter('linky')(newValue,'_blank');
	  			  }
	              
	              if(showdownHTML) {
	            	  scope.trustedHtml = $sce.trustAsHtml(showdownHTML);
	              }
	           });
          },
	      scope: {
	        comment: '=',
	        annotation:'='
	      },
	      template: '<div ng-bind-html="trustedHtml "></div>'
	    };
	}]);
	angular.module('vdvcPublicApp').filter('to_trusted', ['$sce', function($sce){
        return function(text) {
            return $sce.trustAsHtml(text);
        };
    }]);
    

    angular.module('vdvcPublicApp').directive('digestTableOfContents',function() {
		  return {
		    restrict: "E",
		    scope: {
		    	digestData: '=',
		    	digestMetaInfoOptions :"=",
				tableOfContents: "=",
				tableOfContentsHeading:"@",
				groupBy:"=",
				tableId:'@',
				templateFor:"@",
		    },
		    controller : ['$scope',"PublicDigestService",function ($scope,PublicDigestService) {
		    	$scope.title = $scope.tableOfContentsHeading || angular.copy(PublicDigestService.getTableOfContentsHeading());;
				$scope.getTagAsID = function(name) {
					return PublicDigestService.getTagAsID(name);
				};
				$scope.getTagValueLable = function(name, groupBy) {
					return PublicDigestService.getTagValueLable(name, groupBy);
				};
				$scope.getTagStyles = function(name) {
					return PublicDigestService.getTagStyles(name);
				};
				$scope.getTagLable = function(name) {
					return PublicDigestService.getTagLable(name);
				};
				
				$scope.getTblOfContLinkStyles = function() {
					return {
						"text-decoration": "none", 
						"color": "#069",
						"font-size": "18px"};
				};
				
				$scope.getTblOfContListStyles = function() {
					return {
						"display": "table",
						"color": "#069",
						"font-size": "18px"
					};
				};
				
				$scope.getTblOfContIndexStyles = function() {
					return {
						"display": "table-cell",
						"padding-right": "20px",
						"font-size": "0.8em",
						"word-break": "keep-all",
						"text-align": "left"
					};
				};
				
				$scope.getTblOfContLableStyles = function() {
					return {
						"display": "table-cell",
						"word-break": "break-word"
					};
				};
		    }],
		    templateUrl: function ($element, $attrs) {
			    if($attrs.templateFor) {
					if($attrs.templateFor == "tag") {
						return 'apppublic/components/PublicAnnotationDigest/tbc-tag-tmpl.html'; 
					} else if($attrs.templateFor == "document") {
						return 'apppublic/components/PublicAnnotationDigest/tbc-doc-tmpl.html';
					} else if($attrs.templateFor == "section") {
						return 'apppublic/components/PublicAnnotationDigest/tbc-sec-tmpl.html';
					}
				}
				return 'apppublic/components/PublicAnnotationDigest/tbc-default-tmpl.html';
	        }
		  };
/*	}).directive('digestLinkToTableOfContents',function() {
		  return {
		    restrict: "E",
			replace:true,
		    scope: {
		    	tableId:'@',
		    },
		    template: '<span>&nbsp;<a ng-href="#{{tableId}}" style="text-decoration: none;color: #069;">(top)</a></span>'
		  };*/
	}).directive('digestIframe', ['$compile','_','PublicDigestService', function($compile,_,PublicDigestService) {
		  return {
		    restrict: 'E',
		    scope: {
		      content: '='
		    },
		    link: function(scope, element, attrs) {
			    var delta = 20;
		        var iframe = document.createElement('iframe');
				iframe.style.outline = "none";
	    		iframe.style.border = "none";
	    		iframe.style.width = "100%";
	    		iframe.style.height = "calc(100% - 10px)";
			    var element0 = element[0];
			    element0.appendChild(iframe);
			
			    scope.$watch('content', function () {
			      iframe.contentWindow.document.open('text/htmlreplace');
			      iframe.contentWindow.document.write(scope.content);
			      iframe.contentWindow.document.close();
			    });

				iframe.onload = (e) => {
					//iframe.style.height = iframe.contentWindow.document.documentElement.scrollHeight + 'px';
					iframe.style.height = iframe.contentWindow.document.documentElement.scrollHeight + 'px';
					iframe.contentWindow.document.documentElement.style.paddingBottom = "10px";
					iframe.style.maxHeight = $(".vdst").outerHeight()+"px";
					var handleScroll = _.debounce(function() {
						var _document = iframe.contentWindow.document;
						$(_document).find("[data-doc-id]").each(function(i,el) {
							if(isInViewport(el,_document)) {
								PublicDigestService.docInView = $(el).attr("data-doc-id");
								var docInfo = $(el).find("[data-docInfo]");
								//var rect = docEl.getBoundingClientRect();
								if(docInfo && docInfo.length > 0 && !isInViewport(docInfo,_document)) {
									$(el).find("[data-annotId]").each(function(ind,ael) {
										if(isInViewport(ael,_document)) {
											PublicDigestService.annotInView = $(ael).attr("data-annotId");
											return false;
										}
									});
								}
								return false;
							}
						});
					}, 300);
					
					e.target.contentWindow.addEventListener('scroll', evt => {
				      	// Enable handleScroll after Implementing showing new digest entries as diffs	
						
						//handleScroll();
						onScroll(evt);
				    });

                   if(PublicDigestService.docInView) {
	                    var docEl = $(iframe.contentWindow.document).find("[data-doc-id="+PublicDigestService.docInView+"]");
						if(docEl.length > 0) {
							if(PublicDigestService.annotInView) {
								var annotEl = docEl.find("[data-annotId="+PublicDigestService.annotInView+"]");
								if(annotEl.length > 0) {
									annotEl[0].scrollIntoView();
									return;
								}
							} 
							docEl[0].scrollIntoView();
						}
				   } else {
						iframe.contentWindow.scrollTo(0, 0);
				   }
				}
				
				function onScroll(evt) {
					if (evt.currentTarget.scrollY > 200) {
						$(angular.element('.vdvc-scroll-top')[0]).css('display','block');
					} else {
						$(angular.element('.vdvc-scroll-top')[0]).css('display','none');
					}
				}
					
				function isInViewport(el,window) {
					var elementTop = $(el).offset().top+delta;
					var elementBottom = elementTop + $(el).outerHeight()-delta;
					var viewportTop = $(window).scrollTop();
					var viewportBottom = viewportTop + $(window).height();
					return elementBottom > viewportTop && elementTop < viewportBottom;
				};
		    }
		  }
		}
	]);
})();
;(function(){
	'use strict';
	angular.module("vdvcPublicApp").factory("PublicDigestService", ['$rootScope','httpService','$uibModal','$window','markdown','Juicify','_','CommonService','$filter',
	                                                    function($rootScope,httpService,$uibModal,$window,markdown,Juicify,_,CommonService,$filter) {
		
		const digestUpdateTitle = "Digest content has been updated. Click to refresh.";
		var fileBaseUrl = CommonService.getBaseUrl();
		var protectedDocImage = fileBaseUrl+"/app/assets/images/prtectedDocument.png";
		var imageWrapWidthPercent = 35;
		var trustedAnnotatedText = {};
		var enableBorder = "";
		var groupBy = "";
		var imagePosition = "left";
		var displayOrder = "regular";
		var displayReplies = "donotshowreplies";
		var taskspaceId = "";
		var taskspaceClientId = ""
		var annotationLink = false;
		var tableOfContentsHeading = "Table of Contents";
		var service = {
				trustedAnnotatedText : trustedAnnotatedText,
				taskspaceId : taskspaceId,
				taskspaceClientId : taskspaceClientId,
				annotationLink : annotationLink,
				enableBorder : enableBorder,
				groupBy : groupBy,
				imagePosition : imagePosition,
				displayOrder : displayOrder,
				displayReplies : displayReplies,
				preProcessAnnotationDigestResp : preProcessAnnotationDigestResp,
				setDigesMinMaxWidth : setDigesMinMaxWidth,
				getTitleStyles : getTitleStyles,
				alternateImageStyles : alternateImageStyles,
				setRepDigestStyles : setRepDigestStyles,
				hasAnnotatedText: hasAnnotatedText,
				getAnnotatedText : getAnnotatedText,
				formatCreatedDate : formatCreatedDate,
				formatComment : formatComment,
				
				getTagAsID : getTagAsID,
				getTagValueLable: getTagValueLable,
				getTagStyles: getTagStyles,
				getTagLable: getTagLable,
				
				getTableOfContentsHeading: getTableOfContentsHeading,
				notificationHandledelayTime: 20000,
                maxNotifications: 5,
				digestUpdateTitle: digestUpdateTitle,
				getDigestUrlForDocuDigest : getDigestUrlForDocuDigest
		};
		
		function stringifyTags(tags) {
			var tgs = [];
			if(_.isArray(tags)) {
				_.each(tags,function(tag,ind) {
					 var tagString = tag.name;
					 if(_.isArray(tag.values)) {
						 _.each(tag.values,function(val,i) {
							 tagString = tag.name;
							 if(val) {
								 tagString = tagString+":"+val;
							 } 
							 tgs.push(tagString);
						 });
					 } else {
						 tgs.push(tagString);
					 }
				});
			}
			
			return tgs;
		}
		
		function contextLink(digest,annotation,deepLinkId,taskspace) {
			var link = "",
			    tsId= taskspace ? taskspace.tsId : null,
	            tsClientId = taskspace ? taskspace.tsClientId : null;
			if(!annotation && !_.isEmpty(digest.docLink)) {
				link = digest.docLink;
			} else if(annotation && !_.isEmpty(annotation.annotationLink)) {
				link = annotation.annotationLink;
			} else {
				if(!_.isEmpty(deepLinkId)) {
					link = fileBaseUrl+"linkrouter?dlid="+deepLinkId+"&t="+tsId+"&d="+digest.documentId;
					if(annotation) {
						link = link + "&a="+annotation.annotationId;
					}
				} else {
					link = fileBaseUrl+"list/task/"+tsId+"?tsc="+tsClientId+"&d="+digest.documentId+"&dc="+digest.clientId;
					if(digest.sourceURL && digest.documentType == "WebResource") {
						link = fileBaseUrl+"webannotation?target="+encodeURIComponent(digest.sourceURL)+"&cid="+digest.clientId+"&tsId="+tsId;
						if(annotation) {
							link = link + "&annotationId="+annotation.annotationId;
						}
						return link;
					}
					if(annotation) {
						link = link +"&da="+annotation.annotationId;
					}
				}
			}
			return link;
		}
		
		function processDigestData(digestList,groupBy,deepLinkId,taskspace) {
			_.each(digestList,function(digest,index) {
				digest.diIndex = index+1;
				digest.link = contextLink(digest,null,deepLinkId,taskspace);
				if(!_.isEmpty(digest.annotations)) {
					_.each(digest.annotations,function(annotation,index) {
						annotation.link = contextLink(digest,annotation,deepLinkId,taskspace);
						annotation.tags = stringifyTags(annotation.multiTags) || [];
					});
				}
				
				if(!_.isEmpty(digest.multiTags)) {
					digest.tags = stringifyTags(digest.multiTags) || [];
				}
				
				if(digest.documentType && digest.documentType == 'Notes') {
					if(digest.content) {
						var notesContent = Juicify.inlineCss(digest.content,Juicify.cssMap[Juicify.markdownCssUrl]);
						digest.content = notesContent;
					}
				}
			});
			
			return digestList;
		}
		
		function preProcessAnnotationDigestResp(linkAnnotationDigestResp,config,deepLinkId,taskspace) {
			var digestData = [];
			var tagIndex = 0;
			if(config.groupBy == "tag" || config.groupBy == "taghierarchical") {
				_.each(linkAnnotationDigestResp,function(digest,index) {
					digest.diIndex = index+1;
					digest.tagValLable = getTagLable(digest.tagName);
					if(_.isArray(digest.entries)) {
						var taghierarchicalIndex = 0;
						_.each(digest.entries,function(entries,ind) {
							let tagValLable = getTagValueLable(entries.tagValue,config.groupBy);
							entries.tagValLable = tagValLable;
							if(!_.isEmpty(tagValLable)) {
								if(config.groupBy == "tag") {
									tagIndex += 1;
									entries.diIndex = tagIndex;
								} else {
									taghierarchicalIndex++;
									entries.diIndex = taghierarchicalIndex;
								}
							}
							if(_.isArray(entries.digest)) {
								digest.entries[ind].digest = processDigestData(entries.digest,config.groupBy,deepLinkId,taskspace);
							}
						});
						linkAnnotationDigestResp[index].entries = digest.entries;
					}
				});
				digestData = angular.copy(linkAnnotationDigestResp);
			} else if(config.groupBy == "section"){
				_.each(linkAnnotationDigestResp,function(section,index) { 
					section.diIndex = index+1;
					if(_.isEmpty(section.section)) {
						section.section = "Documents without a Section"
					}
					if(_.isArray(section.documents)) {
						 _.each(section.documents,function(document,ind) {
							tagIndex += 1;
							document.diIndex = tagIndex;
						 });
						 if(_.isArray(section.documents)) {
							 linkAnnotationDigestResp[index].documents = processDigestData(section.documents,deepLinkId,taskspace);
						 }
					}
				});
				digestData = angular.copy(linkAnnotationDigestResp);
			} else {
				var digestDataTemp = processDigestData(linkAnnotationDigestResp,config.groupBy,deepLinkId,taskspace);
				digestData = angular.copy(digestDataTemp);
			}
			return digestData;
		}
		
		function setDigesMinMaxWidth() {
			return {'max-width': '648px','color': '#333','line-height': '1.5','margin': '0 auto','font-size': '14px'};
		}
		
		function getTitleStyles() {
			return {'cursor': 'pointer', 'font-weight': '700','margin': '1em 0em','font-size': '16px','margin-block-start':' 1em','margin-block-end': '1em'};
		}
		
		function alternateImageStyles() {
			var imageStyles = {};
			if(!_.isEmpty(service.enableBorder)) {
				imageStyles["border-width"] = "2px";
				imageStyles["border-color"] = "#000000";
				imageStyles["border-style"] = "solid";
			}
			return imageStyles;
		} 
		
		function setRepDigestStyles(digest,digestMetaInfoImageOption) {
			if(!_.isEmpty(digest.imageUrl) && digestMetaInfoImageOption) {
				var width = 100 - imageWrapWidthPercent;
				return {'width': 'calc('+width+'% - 1em)','float': 'left'};
			} else {
				return {'width': '100%'};
			}
		}
		
		function hasAnnotatedText(annotation) {
			return annotation.annotatedText || annotation.text || annotation.formatedText || annotation.formatedtext;// || annotation.screenshotUrl;
		};
		
		function getAnnotatedText(annotation,filter) {
			
			var annotatedText = annotation.annotatedText || annotation.text;
			var formatedText = annotation.formatedtext || annotation.formatedText;
			
			if(!_.isEmpty(annotatedText)) {
				annotatedText = "<div style='border:none;background:#fff;white-space: pre-wrap;word-break: break-word;'>"+annotation.annotatedText+"</div>";
			}
			
			if(!_.isEmpty(formatedText)) {
				var mtoHtml = markdown.makeHtml(formatedText);
				var mtoHtmlWithcss = Juicify.inlineCss(mtoHtml,Juicify.cssMap[Juicify.markdownCssUrl]);
				annotatedText = mtoHtmlWithcss;
			}
			
			/*if((annotation.annotationSubType == "Screenshot" || annotation.type == "Screenshot") && annotation.screenshotUrl) {
				annotatedText = "<img src='"+annotation.screenshotUrl+"' style='width:100%;'/>";
			}*/
			
			
			if(filter.annotationLink || annotation.linkEnabled ) {
				annotatedText = annotatedText+"&nbsp;"+"<span style='font-size: 12px;'>\
											<a href='"+annotation.link+"' target='_blank' title='open annotation in context'\
											style='color: #00a2e8; text-decoration: none !important;'>&mdash;&nbsp;View in Article</a>\
									</span>";
			}
			return annotatedText || "";
		}
		
		function formatCreatedDate(dateValue) {
			var date = moment(dateValue,moment.defaultFormat).toDate();
			var formatedDate = $filter('date')(date,'MMM d, y h:mm a');
			return formatedDate;
		}
		
		function formatComment(annotation,comment) {
			if(annotation) {
				return $filter('markdown')(comment);
			} else {
				return $filter('linky')(comment,'_blank');
			}

			return comment;
		}
		
		
	    function getTagAsID(name) {
			if(name) {
				if(name == "$$untagged") {
	    			return "UntaggedAnnotations";
	    		}
				return "tag_"+name.replace(/ /g, "_"); 
			}
	    }
		
		function getTagValueLable(name, groupBy) {
		    		if(name == "$$annotations") {
		    			if(groupBy == "tag") {
		    				return "Untagged Annotations";
		    			} else {
			    			return false;
		    			}
		    		}
		    		
		    		if(name) {
			    		if(groupBy == "taghierarchical") {
			    			var tagArray = name.split(":");
			    			if(tagArray.length > 1) {
				    	    	if(_.isEmpty(tagArray[1])) {
				    	    		return "";
				    			} else {
				    				return tagArray[1];
				    			}
				    	    }
			    		} else if(groupBy == "tag"){
			    			var tagArray = name.split(":");
			    			if(tagArray.length > 1) {
				    	    	if(_.isEmpty(tagArray[1])) {
				    	    		return tagArray[0];
				    			}
				    	    }
			    		}
		    		}
		    		
		    		return name;
		}
		
		function getTagStyles(name) {
			if(name == "$$untagged") {
    			return {'color': '#069','padding': '0px'};
    		}
    		
    		return {'color': '#069','padding': '0px'};
		}
		
		function getTagLable(name) {
			if(name == "$$untagged") {
    			return "Untagged Annotations";
    		}
    		
    		return name;
		}
		
		function getTableOfContentsHeading() {
			return tableOfContentsHeading;
		}
		
		function getDigestUrlForDocuDigest(groupBy,digestData) {
			var digestUrl = "";
			if(groupBy == "document") {
				digestUrl = digestData[0].link;
			} else if(groupBy == "section"){
				digestUrl = digestData[0].documents[0].link;
			} else if(groupBy == "tag" || groupBy == "taghierarchical"){
				digestUrl = digestData[0].entries[0].digest[0].link;
			}
			return digestUrl;
		}
		
	    return service;
	}]);
	
})();
;(function() {
	'use strict';
	
	angular.module('vdvcPublicApp').controller('PublicDigestviewController',PublicDigestviewController);
	PublicDigestviewController.$inject = ['$scope','$state','$stateParams','_','$timeout','$compile','appData','MessageService',
	        'PublicDigestService','PublicDigestEventListner','notificationEvents',
	        '$window','CommonService','notificationDelay'];
	
	function PublicDigestviewController($scope,$state,$stateParams,_,$timeout,$compile,appData,MessageService,PublicDigestService,
			PublicDigestEventListner,notificationEvents,$window,CommonService,notificationDelay) {
		var pdc = this;
		var appdata = appData.getAppData();
		var childScopes = {};
		var taskspace = {};
		
		pdc.digestUpdateTitle = angular.copy(PublicDigestService.digestUpdateTitle);
		pdc.digestInfo = null;
		pdc.digestData = [];
		pdc.digestSettings = {};
		pdc.digestFor = "";
		pdc.loader = false;
		pdc.hasDigestUpdates = false;
		
		pdc.numiciImage = appdata.numiciImage;
		pdc.numiciLink = appdata.numiciLink;
		pdc.numiciHeaderText = appdata.numiciHeaderTxt;
		
		pdc.topFunction = topFunction;
		
		function hideLoader() {
			$timeout(function() {
				pdc.loader = false;
			},100);
		}
		
		var notificationHandledelayTime = notificationDelay ? notificationDelay : PublicDigestService.notificationHandledelayTime;
		var pendingDigestChangedUpdates = [];
		var debounceHandleDigestChangedUpdates = _.debounce(handleDigestChangedUpdates, parseInt(notificationHandledelayTime));
		var loadEvents = [notificationEvents.DIGEST_CHANGED];
		
		// Moved the code to app.config
		/*CommonService.getKeyValuesForNotificationHandledelayTime().then(function(resp) {
			if(resp.data.Status && !_.isEmpty(resp.data.listAppKeyValues)) {
				var notificationHandledelayTimeObj = resp.data.listAppKeyValues[0];
				if(!_.isEmpty(notificationHandledelayTimeObj)) {
					notificationHandledelayTime = notificationHandledelayTimeObj.value;
					debounceHandleDigestChangedUpdates = _.debounce(handleDigestChangedUpdates, notificationHandledelayTime*1000);
				}
			}
		});*/
		
		$scope.$on('$destroy',function() {
			PublicDigestEventListner.close();
			debounceHandleDigestChangedUpdates.cancel();
		});
		
		function handleDigestChangedUpdates() {
			if(pendingDigestChangedUpdates && pendingDigestChangedUpdates.length == 0) {
				return;
			}
			pendingDigestChangedUpdates.splice(0,pendingDigestChangedUpdates.length);
			//$window.location.reload();
			//getDigest();
			pdc.hasDigestUpdates = true;
			$scope.$digest();
		}
		
		loadEvents.forEach(function (event) {
		   	$scope.$on(event, function (evt, msg) {
		   		pendingDigestChangedUpdates.push(msg);
/*		   		debounceHandleDigestChangedUpdates.cancel();
				if(pendingDigestChangedUpdates.length < PublicDigestService.maxNotifications) {
					//debounceHandleDigestChangedUpdates();
				} else {
					//handleDigestChangedUpdates();
				}*/
		   		if(pendingDigestChangedUpdates && pendingDigestChangedUpdates.length == 1) {
					debounceHandleDigestChangedUpdates();
				}
		    });
		});
		
		pdc.udpdateDigest = function() {
			//handleDigestChangedUpdates();
			getDigest();
			pdc.hasDigestUpdates = false;
		};
		
/*		pdc.hasDigestUdpdates = function() {
			return pendingDigestChangedUpdates && pendingDigestChangedUpdates.length > 0;
		};*/
		
/*		if($stateParams.donotShowNavBar) {
			document.querySelector('nav').style.display = "none";
			var timer = $timeout(function() {
				document.querySelector('body').style.height = "100%";
				document.querySelector('body').style.paddingBottom = "0px";
				document.querySelector('.container-fluid').style.padding = "0px";
				document.querySelector('.container-fluid').children[0].style.padding = "15px";
				document.querySelector('.container-fluid').children[0].style.height = "100%";
 	 			$timeout.cancel(timer);
	        }, 1000);
		}*/
		
		function clearLayout(focused) {
	    	var divElement = angular.element(document.querySelector('.'+focused));
	    	if(childScopes[focused]) {
				childScopes[focused].$destroy();
				divElement.empty();
				delete childScopes[focused];
			}
		}
	    
		function renderDocument(focused) {
			//vm.loader = true;
			clearLayout(focused);
			var divElement = angular.element(document.querySelector('.'+focused));
			
			var template = '<annotation-digest-content digest-data="pdc.digestData" digest-settings="pdc.digestSettings" digest-for="pdc.digestFor"></annotation-digest-content>';
			childScopes[focused] = $scope.$new();
			childScopes[focused].digestData = pdc.digestData;
			childScopes[focused].digestSettings = pdc.digestSettings;
			childScopes[focused].digestFor = pdc.digestFor;
			var appendHtml = $compile(template)(childScopes[focused]);
			divElement.append(appendHtml);
			var timer = $timeout(function() {
				var iframeDoc = (document.getElementsByTagName('iframe')[0]).contentWindow;
				if(iframeDoc && iframeDoc.document && iframeDoc.document.body) {
					$(iframeDoc.document.body).find('.cke_widget_drag_handler_container').css("display", "none");
					$(iframeDoc.document.body).find('.cke_image_resizer').css("display", "none");
				}
				$timeout.cancel(timer);
	        }, 2000);
		}
		
		function connectPublicDigestEventSocket() {
			if(!_.isEmpty(taskspace.tsId) && PublicDigestEventListner.isConnected()) {
				PublicDigestEventListner.sendMessage({"taskspaceId":taskspace.tsId,"documentId":null});
    		} else if(!_.isEmpty(taskspace.tsId) && !PublicDigestEventListner.isConnected()) {
    			PublicDigestEventListner.taskspaceId = taskspace.tsId;
    			PublicDigestEventListner.documentId = null;
    			PublicDigestEventListner.reconnect();
			}
		}
		
		function processDigestSettings() {
			if(!_.isEmpty(pdc.digestInfo.data.digestSettings)) {
				pdc.digestSettings = pdc.digestInfo.data.digestSettings;
				pdc.digestFor = pdc.digestInfo.data.digestFor;
				taskspace.tsId = pdc.digestSettings.objectId;
				taskspace.tsClientId = pdc.digestSettings.clientId;
				PublicDigestService.annotationLink = pdc.digestSettings.digestMetaInfoOptions.annotationLink;
				connectPublicDigestEventSocket();
			}
		}
		
		function topFunction() {
			(document.getElementsByTagName('iframe')[0]).contentWindow.scrollTo(0,0);
		}
		
		function init() {
			if(!_.isEmpty(pdc.digestInfo.data.AnnotationDigest)) {
				pdc.digestData = pdc.digestInfo.data.AnnotationDigest;
				PublicDigestService.trustedAnnotatedText = {};
				processDigestSettings();
				pdc.digestData = PublicDigestService.preProcessAnnotationDigestResp(pdc.digestData,pdc.digestSettings,$stateParams.id,taskspace);
				renderDocument('vdst');
			} else if(_.isEmpty(pdc.digestInfo.data.AnnotationDigest)) {
				if(!_.isEmpty(pdc.digestInfo.data.Message)) {
					var timer = $timeout(function() {
						MessageService.showErrorMessage("BACKEND_ERR_MSG",[pdc.digestInfo.data.Message]);
						$timeout.cancel(timer);
			        }, 1000);
				} else {
					MessageService.showInfoMessage("ANNOTATION_DIGEST_NODATA_INFO");
				}
				PublicDigestService.trustedAnnotatedText = {};
				processDigestSettings();
				pdc.digestData = [];
				renderDocument('vdst');
			} 
		}
		
		$scope.$on("digestLoaded",function() {
			hideLoader();
		});
		
		function getDigest() {
			pdc.loader = true;
			
			document.querySelector('nav').style.display = "none";
			var timer = $timeout(function() {
				document.querySelector('body').style.height = "100%";
				document.querySelector('body').style.paddingBottom = "0px";
				document.querySelector('.container-fluid').style.padding = "0px";
				document.querySelector('.container-fluid').children[0].style.padding = "15px";
				document.querySelector('.container-fluid').children[0].style.height = "100%";
 	 			$timeout.cancel(timer);
	        }, 1000);
			
			CommonService.getPublicDigestById($stateParams.id).then(function(publicDigestResp) {
	    		pdc.digestInfo = publicDigestResp;
	    	},function(errorResp) {
	    		pdc.digestInfo = errorResp;
	    	}).finally(function() {
				init();
			});
		}
		
		getDigest();
	}
})();

;(function() {
	'use strict';
	
	angular.module('vdvcPublicApp').controller('PublicDigestviewHtmlController',PublicDigestviewHtmlController);
	PublicDigestviewHtmlController.$inject = ['$scope','$state','$stateParams','_','$timeout','$compile','appData','MessageService',
	        'PublicDigestService','PublicDigestEventListner','notificationEvents',
	        '$window','CommonService','notificationDelay'];
	
	function PublicDigestviewHtmlController($scope,$state,$stateParams,_,$timeout,$compile,appData,MessageService,PublicDigestService,
			PublicDigestEventListner,notificationEvents,$window,CommonService,notificationDelay) {
		var pdc = this;
		var appdata = appData.getAppData();
		var notificationHandledelayTime = notificationDelay ? notificationDelay : PublicDigestService.notificationHandledelayTime;
		var pendingDigestChangedUpdates = [];
		var debounceHandleDigestChangedUpdates = _.debounce(handleDigestChangedUpdates, parseInt(notificationHandledelayTime));
		var loadEvents = [notificationEvents.DIGEST_CHANGED];
		
		pdc.digestUpdateTitle = angular.copy(PublicDigestService.digestUpdateTitle);
		pdc.digestHtml = null;
		pdc.digestData = [];
		pdc.digestSettings = {};
		pdc.digestFor = "";
		pdc.loader = false;
		
		pdc.hasDigestUpdates = false;
		
		pdc.numiciImage = appdata.numiciImage;
		pdc.numiciLink = appdata.numiciLink;
		pdc.numiciHeaderText = appdata.numiciHeaderTxt;
		
		pdc.udpdateDigest = udpdateDigest;
		pdc.topFunction = topFunction;
		
		$scope.$on('$destroy',function() {
			PublicDigestEventListner.close();
			debounceHandleDigestChangedUpdates.cancel();
		});
		
		angular.element(document.querySelector('.vdst')).bind('scroll', function(evt){
			if (evt.currentTarget.scrollTop > 200) {
				$(angular.element('.vdvc-scroll-top')[0]).css('display','block');
			} else {
				$(angular.element('.vdvc-scroll-top')[0]).css('display','none');
			}
	    });
		    
		function handleDigestChangedUpdates() {
			if(pendingDigestChangedUpdates && pendingDigestChangedUpdates.length == 0) {
				return;
			}
			pendingDigestChangedUpdates.splice(0,pendingDigestChangedUpdates.length);
			pdc.hasDigestUpdates = true;
			$scope.$digest();
		}
		
		loadEvents.forEach(function (event) {
		   	$scope.$on(event, function (evt, msg) {
		   		pendingDigestChangedUpdates.push(msg);
		   		if(pendingDigestChangedUpdates && pendingDigestChangedUpdates.length == 1) {
					debounceHandleDigestChangedUpdates();
				}
		    });
		});
		
		function udpdateDigest() {
			getDigest();
			pdc.hasDigestUpdates = false;
		}
		
		function hideLoader() {
			$timeout(function() {
				pdc.loader = false;
			},100);
		}
		
		function clearLayout(focused) {
	    	var divElement = angular.element(document.querySelector('.'+focused));
	    	divElement.empty();
		}
	    
		function renderDocument(focused) {
			//vm.loader = true;
			var timer = $timeout(function() {
				clearLayout(focused);
				var divElement = angular.element(document.querySelector('.'+focused));
				divElement.append(pdc.digestHtml);
				divElement[0].style.overflowY = "auto";
				var timer1 = $timeout(function() {
					if(divElement) {
						$(divElement).find('.cke_widget_drag_handler_container').css("display", "none");
						$(divElement).find('.cke_image_resizer').css("display", "none");
					}
					$timeout.cancel(timer1);
		        }, 1000);
				$timeout.cancel(timer);
	        }, 0);
			hideLoader();
		}
		
		function topFunction() {
			angular.element('.vdst')[0].scrollTo(0,0);
		}
		
		function getDigest(cb) {
			pdc.loader = true;
			
			document.querySelector('nav').style.display = "none";
			var timer = $timeout(function() {
				document.querySelector('body').style.height = "100%";
				document.querySelector('body').style.paddingBottom = "0px";
				document.querySelector('.container-fluid').style.padding = "0px";
				document.querySelector('.container-fluid').children[0].style.padding = "15px";
				document.querySelector('.container-fluid').children[0].style.height = "100%";
 	 			$timeout.cancel(timer);
	        }, 1000);
			
			CommonService.getDigestHtml($stateParams.id).then(function(publicDigestResp) {
	    		if(publicDigestResp.status == 200) {
	    			pdc.digestHtml = publicDigestResp.data.digestHtml;
	    			var taskspaceId = publicDigestResp.data.tsId;
	    			if(typeof cb == "function") {
	    				cb(taskspaceId);
	    			}
	    		}
			},function(errorResp) {
	    		pdc.digestHtml = errorResp;
	    	}).finally(function() {
	    		renderDocument('vdst');
			});
		}
		
		function connectPublicDigestEventSocket(taskspaceId) {
			if(!_.isEmpty(taskspaceId) && PublicDigestEventListner.isConnected()) {
				PublicDigestEventListner.sendMessage({"taskspaceId":taskspaceId});
    		} else if(!_.isEmpty(taskspaceId) && !PublicDigestEventListner.isConnected()) {
    			PublicDigestEventListner.reconnect();
			}
		}
		
		function init() {
			getDigest(function(taskspaceId) {
				connectPublicDigestEventSocket(taskspaceId);
			});
		}
		
		init();
	}
})();

;(function(){
	
	angular.module("vdvcPublicApp").controller("PublicAppController",PublicAppController);
	
	PublicAppController.$inject = ['$scope','_','companyName','$state',
	                               '$timeout','LocalStorageService',
	                               '$confirm','Flash'];

	function PublicAppController($scope,_,companyName,$state,$timeout,
			LocalStorageService,$confirm,Flash) {
		var reloadTimeout;
		var context = "";
		$scope.PageTitle = companyName;
		$scope.companyName = companyName;
		
		$scope.getUserlabel = function(name) {
 			var lbl = "";
 			if(_.isString(name) && name.trim()) {
 				var matches = name.match(/\b(\w)/g);
 				lbl = matches.join('');
 			}
 			
 			return lbl.toUpperCase();
 		};
 		 		
 		$scope.$on('schedule-shutdown-flash', function (event,msg) {
 			Flash.create('warning', msg.scheduleShutdownMessage, msg.newLogoutDurationMillis+100,{
 				  class: 'schedule-shutdown-flash'});
 			var timer = $timeout(function() {
 				$scope.$broadcast('timer-start');
 	 			$timeout.cancel(timer);
	        }, 100);
			
			timer = $timeout(function() {
				$scope.$broadcast('timer-stop');
	 			$timeout.cancel(timer);
	        }, msg.newLogoutDurationMillis);
 		});
 		 		
 		$scope.onScheduleFlashClose = function(flash) {
 			//Do nothing
 		};
 		
		$scope.$on('PageName', function(event,obj) { 
			
			if(obj.pageName == "root") {
				context = obj.userName +" Home";
			} else {
				context = obj.pageName;
			}
			if(!_.isEmpty(obj.companyName)){
				if(obj.companyName== "Curated using Numici") {
					$scope.PageTitle = context;
				} else {
					$scope.PageTitle = context +" - "+obj.companyName;
				}
			} else {
				$scope.PageTitle = context +" - "+companyName;
			}
		});
	}
})();
;(function() {
	'use strict';
	
	angular.module("vdvcPublicApp").directive('vdvcAnnotation', ['$document',function($document) {
		return {
			restrict: 'E',
			templateUrl: 'apppublic/components/PublicDocViewer/annotation.tmpl.html'
		};
	}]).directive('markdownToHtml', ['$sce','$filter','markdown','Juicify',function($sce,$filter,markdown,Juicify) {
		return {
			replace: true,
			restrict: 'E',
			link: function (scope, element, attrs) {
				scope.$watch('text', function (newValue) {
					var showdownHTML;
					var showdownHTMLTxt =  markdown.makeHtml(newValue || '');
	            	  showdownHTML = Juicify.inlineCss(showdownHTMLTxt,Juicify.cssMap[Juicify.markdownCssUrl]);
					if(showdownHTML) {
						scope.trustedHtml = $sce.trustAsHtml(showdownHTML);
					}
				});
			},
			scope: {
				text: '=',
				annotation:'='
			},
			template: '<div ng-bind-html="trustedHtml "></div>'
	    };
	}]).directive('windowResize', ['$window','$rootScope', function ($window,$rootScope) {
		return {
			link: link,
			restrict: "A"
		};
		
		function link(scope, element, attr) {
	        angular.element($window).bind('resize', function () {
	        	$rootScope.$broadcast('windowResized', { message: true });
	        	scope.$apply();
	        });
	    };

    }]).directive('ngIncludeReplace', function() {
        return {
            require: 'ngInclude',
            restrict: 'A',
            link: function(scope, element, attrs) {
                element.replaceWith(element.children());
            }
        };
    });
})();
;(function(){
	
	angular.module("vdvcPublicApp").controller("PublicDocViewerController",PublicDocViewerController);
	PublicDocViewerController.$inject = ['$rootScope','$scope',
	        'pendingRequests','MessageService','APIUserMessages','_',
	        '$stateParams','$location','urlParser','$timeout',
	        'CommonService','$filter','uuidService','PublicDigestEventListner',
	        'notificationEvents','$window','PublicDigestService'];
	
	function PublicDocViewerController($rootScope,$scope,pendingRequests,
			MessageService,APIUserMessages,_,$stateParams,$location,
			urlParser,$timeout,CommonService,$filter,uuidService,
			PublicDigestEventListner,notificationEvents,$window,PublicDigestService){
		
		
		var baseUrl = CommonService.getBaseUrl()+"api/";
		var getdocPromise;
		var readOnly = true;
		var annotList = [];
		var loadTimer;
		
		$scope.doc = null;
		$scope.linkId = $stateParams.id;
		$scope.taskspaceId = $stateParams.tsId;
		$scope.documentId = $stateParams.d;
		$scope.annotationId = $stateParams.da;
		
		$scope.tagLimit = 2;
		$scope.viewerId = uuidService.newUuid();
		$scope.docAnnotations = [];
		$scope.docTags = [];
		$scope.selectedAnnotations = null;
		$scope.hasSelectedAnnotations = false;
		$scope.selectedOrphanAnnotations = null;
		$scope.hasSelectedOrphanAnnotations = false;
		$scope.docOrphanAnnotations = [];
		$scope.annotLimit = 10;
		$scope.orphanAnnotLimit = 10;
		$scope.annotBegin = 0;
		$scope.activeTab = {"index" : 1};
		$scope.selectedAnnotTags ={};
		
		
		$scope.instance = null;
		$scope.showComments = false;
		$scope.showTags = false;
		$scope.showPdf = false;
		$scope.isLoading = false;
		$scope.downloadProgress = 0;
		$scope.pdfZoomLevels = [];
		$scope.pdfViewerAPI = {};
		$scope.pdfViewer;
		$scope.pdfScale = "fit_width";
		$scope.pdfURL = "";
		$scope.pdfFile = null;
		$scope.pdfTotalPages = 0;
		$scope.pdfCurrentPage = 0;
		$scope.pdfSearchTerm = "";
		$scope.pdfSearchResultID = 0;
		$scope.pdfSearchNumOccurences = 0;
		$scope.pdfAnnotUI = [];
		$scope.loadMoreAnnotations = loadMoreAnnotations;
		
		var notificationHandledelayTime = PublicDigestService.notificationHandledelayTime;
		var pendingDigestChangedUpdates = [];
		var debounceHandleDigestChangedUpdates = _.debounce(handleDigestChangedUpdates, notificationHandledelayTime);
		var loadEvents = [notificationEvents.DIGEST_CHANGED];
		
		CommonService.getKeyValuesForNotificationHandledelayTime().then(function(resp) {
			if(resp.data.Status && !_.isEmpty(resp.data.listAppKeyValues)) {
				var notificationHandledelayTimeObj = resp.data.listAppKeyValues[0];
				if(!_.isEmpty(notificationHandledelayTimeObj)) {
					notificationHandledelayTime = notificationHandledelayTimeObj.value;
					debounceHandleDigestChangedUpdates = _.debounce(handleDigestChangedUpdates, notificationHandledelayTime*1000);
				}
			}
		});
		
		function onDestroy() {
				//CKEDITOR.instances['editor-'+$scope.documentId].destroy();
		}
		
		$scope.$on("$destroy",function handleDestroyEvent() {
			onDestroy();
			PublicDigestEventListner.close();
			debounceHandleDigestChangedUpdates.cancel();
		});
		
		function handleDigestChangedUpdates() {
			if(pendingDigestChangedUpdates && pendingDigestChangedUpdates.length == 0) {
				return;
			}
			var events = pendingDigestChangedUpdates.splice(0,pendingDigestChangedUpdates.length);
			$window.location.reload();
		}
		
		loadEvents.forEach(function (event) {
		   	$scope.$on(event, function (evt, msg) {
		   		pendingDigestChangedUpdates.push(msg);
		   		debounceHandleDigestChangedUpdates.cancel();
				if(pendingDigestChangedUpdates.length < PublicDigestService.maxNotifications) {
					debounceHandleDigestChangedUpdates();
				} else {
					handleDigestChangedUpdates();
				}
		    });
		});
		
		$scope.$on("windowResized",function(event, msg){
			if($scope.showDoc){
				var t = $timeout(function() {
					var ckeId = $('.cke.cke_reset').attr("id")
					var h = "100%";
					if(ckeId === "cke_editor-"+$scope.viewerId) {
						h = $('.cke.cke_reset').find(".cke_inner").outerHeight();
						$('.cke.cke_reset').find(".cke_contents").height(h);
					}
					if (CKEDITOR.instances['editor-'+$scope.viewerId]) {
						CKEDITOR.instances['editor-'+$scope.viewerId].resize("100%",h);
					}
					$timeout.cancel(t);
				},500);
			}
		});
		
		$scope.$on("annotationonclick",function(event, data) {
			
			$timeout(function() {
				$scope.$apply(function () {
					$scope.showComments = true;
					//$scope.$emit("isolateDoc",true);
					
					$('.pdfHighlight.cmtActive').removeClass("cmtActive");
					var id = data.annotation.id;
					$('div[annot-id="'+id+'"]').addClass("cmtActive");
					if(id) {
						$(".vdvc_comment_selected").removeClass("vdvc_comment_selected");
						$('div[data-id="'+id+'"]').addClass("vdvc_comment_selected");
						if($('div[data-id="'+id+'"]').length > 0) {
							$('div[data-id="'+id+'"]')[0].scrollIntoView(true);
						}
					}
				});
			}, 0);
		});
		
		$scope.editorReinitialize = function() {
			$timeout(function () {
				var editor = CKEDITOR.instances[$scope.viewerId];
				if ( editor && editor.status == "ready") {
					try{
						editor.resize( '100%', '100%' );
					} catch(err) {
						
					}
				}
			},100);
		};
		
		function onResize() {
			if(!$scope.showPdf) {
				$scope.editorReinitialize();
			}
			var t1 = $timeout(function () {
				if($scope.showPdf && $scope.pdfViewer) {
					$scope.pdfViewer.updateView();
				}
				$timeout.cancel(t1);
			},0);
		}
		
		$scope.$on('windowResized', function(msg){
			onResize();
		});
		
		$scope.$watch('showComments', function (newVal, oldVal) {
			if(newVal !== oldVal) {
				onResize();
			}
		});
		
		$scope.toggleComments = function(){
			$scope.showComments = !$scope.showComments;
		};
		
		$scope.showTagName = function(tag) {
			var tagName = angular.copy(tag.TagName);
			if(!_.isEmpty(tag.Value)) {
				tagName = tagName +" : "+ tag.Value;
			}
			return tagName;
		}
		
		$scope.hasRootComment = function(annotation) {
			var status = false;
			if(!_.isEmpty(annotation.conversations)) {
				var rootComment = _.findWhere(annotation.conversations,{"rootComment" : true});
				if(rootComment) {
					status = true;
				}
			}
			return status;
		};
		
		$scope.getUserlabel = function(name) {
 			var lbl = "";
 			if(_.isString(name) && name.trim()) {
 				var matches = name.match(/\b(\w)/g);
 				lbl = matches.join('');
 			}
 			return lbl.toUpperCase();
 		};
 		
		function addcommentIconToDoc(anotObj) {
			var commentEl = $($scope.iframedoc.body).find( 'span[comment-id="'+anotObj.resourceName+'"]' );
			if(commentEl) {
				commentEl.addClass("cmt");
			}
		}
		
		function removecommentIconFromDoc(anotObj) {
			var commentEl = $($scope.iframedoc.body).find( 'span[comment-id="'+anotObj.resourceName+'"]' );
			if(commentEl) {
				commentEl.removeClass("cmt");
			}
		}
		
		function checkAnotObjForVC(anotObj) {
			var hasValidConversation = false;
			if(anotObj && anotObj.conversations && anotObj.conversations.length > 0) {
				var nonEmptyConv = _.find(anotObj.conversations, function(conv) {
					return !_.isEmpty(conv.note);
				});
				
				if(nonEmptyConv)  {
					hasValidConversation = true;
				}
			}
			return hasValidConversation;
		}
		
		$scope.pdfAnnotationsTypeFilter = function(annotation) {
			return (annotation.type === "Highlight" || annotation.type === "Pagenote" || annotation.type === "Screenshot");
		};
		
		$scope.formatCreatedDate = function(dateValue) {
			var date = moment(dateValue).toDate();
			var formatedDate = $filter('date')(date,'MMM d, y h:mm a');
			return formatedDate;
		};
		
		$scope.formatComment = function(annotation,comment) {
			if(annotation.webAnnotation) {
				return $filter('markdown')(comment);
			} else {
				return $filter('linky')(comment,'_blank');
			}
			return comment;
		};
		
		$scope.hasFormatedText = function(annotation) {
			if(_.isEmpty(annotation.formatedText)) {
				return false;
			}
			return true;
		};
		
		function orderWebResourceComments(comments) {
			var LatestComments = [];
			if(comments) {
				for(var i=0; i< comments.length; i++) {
					var anotObj = comments[i];
					anotObj.Commentedtext = anotObj.text;
					anotObj.uid = "vdvc_comment_"+anotObj.resourceName;
					LatestComments.push(anotObj);
				}
				LatestComments =  orderBy(LatestComments, "textposition", false);
				$scope.docAnnotations = LatestComments;
			}
		} 
		
		function orderNonWebResourceComments(comments) {
			var commentEls;
			$($scope.iframedoc.body).find( 'span[comment-id]').removeClass("note");
			var LatestComments = [];
			var orphanComments = [];
			
			if(!_.isEmpty(comments)) {
				_.each(comments,function(anotObj,i){
					anotObj.isOrphan = false;
					anotObj.Commentedtext = anotObj.text;
					anotObj.uid = "vdvc_comment_"+anotObj.resourceName;
					var commentEl =  $($scope.iframedoc.body).find( 'span.first[comment-id="'+anotObj.resourceName+'"]');
					if(commentEl.length > 0) {
						var position = $(commentEl).offset();
						anotObj['position'] = {
								"x": position.left,
								"y":  position.top,
						};
						
						if(checkAnotObjForVC(anotObj)) {
							addcommentIconToDoc(anotObj);
						} else {
							removecommentIconFromDoc(anotObj);
						}
						$($scope.iframedoc.body).find( 'span[comment-id="'+anotObj.resourceName+'"]').addClass("note");
						LatestComments.push(anotObj);
					} else {
						anotObj.isOrphan = true;
						orphanComments.push(anotObj);
					}
				});
				LatestComments.sort(CommonService.sortAnnotationsByTextPosition);
				orphanComments = _.filter(comments,function(obj){ 
					return _.isUndefined(obj.isOrphan) || obj.isOrphan; 
				});
				
				$scope.docAnnotations = LatestComments;
				$scope.docOrphanAnnotations = orphanComments;
			}
			
		}
		
		function processSelectedConvTags(annot) {
			if(_.isArray(annot.conversations)) {
				_.each(annot.conversations,function(conv,i){
					if(conv.tagsInfo) {
						$scope.selectedAnnotTags[conv.id] = conv.tagsInfo;
					} else {
						$scope.selectedAnnotTags[conv.id] = [];
					}
				});
			}
		}
		
		function orderComments(comments,commentId) {
			$scope.showComments = true;
			_.each(comments,function(comment,i){
				processSelectedConvTags(comment);
			});
			if($scope.doc && $scope.doc.webResource) {
				orderWebResourceComments(comments);
			} else {
				orderNonWebResourceComments(comments);
			}
			
			if(commentId) {
				goToComment(commentId);
			}
		}
		
		
		function getAnnotIndex(id) {
			var index = -1;
			if(!_.isEmpty($scope.docAnnotations)) {
				index = _.findIndex($scope.docAnnotations,{"id" : id});
				return index;
			}
			return index;
		}
		
		function getAnnotationByResourceName(id) {
			return _.findWhere($scope.docAnnotations,{"resourceName" : id}) || _.findWhere($scope.docOrphanAnnotations,{"resourceName" : id});
		}
		
		function getAnnotationById(id) {
			return (_.findWhere($scope.docAnnotations,{"id" : id}) || _.findWhere($scope.docOrphanAnnotations,{"id" : id}));
		}
		
		function goToComment(commentid,top) {
			$scope.activeTab.index = 1;
			var anotObj;
			if(commentid) {
				$scope.hasSelectedAnnotations = true;
				if(commentid) {
					anotObj = getAnnotationById(commentid);
				}
				if(!anotObj) {
					anotObj = getAnnotationByResourceName(commentid);
				}
				
				if(anotObj) {
					var obj = angular.copy(anotObj);
					if(anotObj.isOrphan) {
						$scope.selectedOrphanAnnotations = [];
						$scope.hasSelectedOrphanAnnotations = true;
						$scope.selectedOrphanAnnotations.push(obj);
						$scope.activeTab.index = 2;
					} else {
						$scope.selectedAnnotations = [];
						$scope.selectedAnnotations.push(obj);
					}
					
					var tim = $timeout(function() {
						var $docWrap = $('div.doc-viewr[data-id="'+$scope.viewerId+'"]');
						if($docWrap.length > 0) {
							$scope.onClickComment(null,null,$docWrap.find('.vdvc_comment_'+anotObj.resourceName),top);
						}
						$timeout.cancel(tim);
					 }, 1000);
				}
			}
		}
		
		$scope.ShowAllAnnotations = function() {
			$scope.selectedAnnotations = null;
			$scope.hasSelectedAnnotations = false;
			$scope.selectedOrphanAnnotations = null;
			$scope.hasSelectedOrphanAnnotations = false;
			$scope.activeTab.index = 1;
		};
		
		$scope.onClickComment = function($event,annotation,element,top) {
			var $docWrap = $('div.doc-viewr[data-id="'+$scope.viewerId+'"]');
			if (!$event || ($event && $event.target.tagName !== "INPUT")) {
				$docWrap.find(".vdvc_comment_selected").removeClass('vdvc_comment_selected');
			}
			if ($event && $event.target.tagName !== "INPUT") {
				//$event.preventDefault();
			    $event.stopPropagation(); 
			    var prnt = $($event.currentTarget).closest('.vdvc_comment');
			    var rid = prnt.attr("data-rid");
			    prnt.addClass("vdvc_comment_selected");
			    prnt.find("textarea").focus();
			    prnt[0].scrollIntoView(true);
		    	$docWrap.find(".comment-wrap")[0].scrollTop -= 10;
		    	
		    	var docEl = $( $scope.iframedoc.body ).find('span.note.first[comment-id="'+rid+'"]');
		    	if(docEl.length > 0) {
		    		var delta = 0;
		    		var $toolBar = $docWrap.find('.cke_top');
		    		docEl[0].scrollIntoView(true);
		    		var wB = {
		    			tB : $toolBar.outerHeight(),
		    			lB : $docWrap.outerHeight()
		    		};
		    		if($toolBar.offset()) {
		    			wB.tB = wB.tB + $toolBar.offset().top;
		    		}
		    		if($docWrap.offset()) {
		    			wB.lB = wB.lB + $docWrap.offset().top;
		    		}
		    		var mdl = (wB.lB-wB.tB)/2;
		    		
		    		
		    		if($scope.iframedoc) {
						var scrollingElement = CommonService.getScrollingElement($scope.iframedoc);
						scrollingElement.scrollTop -= mdl;
					}
		    		
		    		$($scope.iframedoc.body).find('span.note_slctd').removeClass("note_slctd");
		    		$( $scope.iframedoc.body ).find('span.note[comment-id="'+rid+'"]').addClass("note_slctd");
		    	}
		    } 
			if (!$event || ($event && $event.target.tagName !== "INPUT")) {
				if(element && element.length > 0) {
					var rid = element.attr("data-rid");
					if(rid && $scope.iframedoc && $scope.iframedoc.body) {
						/*var slctdCmtEle = $( $scope.iframedoc.body ).find('span.note_slctd');
						if(slctdCmtEle) {
							slctdCmtEle.removeClass("note_slctd");
						}*/
						var slctdCmtEle = $( $scope.iframedoc.body ).find('span.note[comment-id="'+rid+'"]');
						if(slctdCmtEle) {
							slctdCmtEle.addClass("note_slctd");
						}
						//$( $scope.iframedoc.body ).find('span.note_slctd').removeClass("note_slctd");
						//$( $scope.iframedoc.body ).find('span.note[comment-id="'+rid+'"]').addClass("note_slctd");
						var docEle = $( $scope.iframedoc.body ).find('span.note.first[comment-id="'+rid+'"]');
						if(docEle && docEle.length > 0) {
							docEle[0].scrollIntoView(true);
						}
					}
					element.addClass("vdvc_comment_selected");
					//element.addClass("vdvc_comment_selected");
					//element.find("textarea").focus();
					element[0].scrollIntoView(true);
				    $docWrap.find(".comment-wrap")[0].scrollTop -= 10;
				}
			}
		};
		
		function showCommentOnCkeClick(body,elem) {
			$(body.$).find('span.note_slctd').removeClass("note_slctd");
			   var comment_id = $(elem).attr("comment-id");
			   $scope.showComments = true;
			   
			   elem.scrollIntoView();
			   //body.$.scrollTop -= ($(ckeId).find('.cke_top').outerHeight()+55);
			   
			   $(body.$).find('span[comment-id="'+comment_id+'"]').addClass("note_slctd");
			   goToComment(comment_id,elem.offsetTop);
			 //  $scope.$emit("isolateDoc",true);
		}
		
		function CreateNotes(editorId){
			
			var content = $scope.doc ? $scope.doc.content : "";
			var div = $('<div/>');
			div.append(content);
			//div.find("a:empty").append(" ");
			var emptyAnchors = div.find("a[name]");
			$.each(emptyAnchors,function(i,a){
				var name = $(a).attr("name");
				$(a).attr("id",name).append(" ").css({"background": "none","border": "none","padding":"0px"});
			});
			//$scope.showComments = true;
			$scope.content = div.html();
			$scope.showDoc = true;
			
			try {
				$scope.instance = CKEDITOR.replace( editorId,{
					readOnly: readOnly,
					width: "100%",
					language : "en",
					skin : 'office2013,/resources/js/ckeditor/skins/office2013/' ,
					baseHref : "/",
					removePlugins : "stylesheetparser, elementspath,toolbar",
					resize_enabled : false,
					//allowedContent: true,
					fullPage: true,
					forceEnterMode : true
				});
			} catch(e) {
				
			}

			if ($scope.instance) {
				CKEDITOR.on('instanceCreated', function (ev) {
					CKEDITOR.dtd.$removeEmpty['a'] = 0;
	            });
				CKEDITOR.on('instanceReady', function(evt) {
					var ckeId = $('.cke.cke_reset').attr("id")
					
					var h = "100%";
					if(ckeId === "cke_editor-"+$scope.viewerId) {
						h = $('.cke.cke_reset').find(".cke_inner").outerHeight();
						$('.cke.cke_reset').find(".cke_contents").height(h);
					}
					 
					 if ( evt.editor && evt.editor.status == "ready") {
						 evt.editor.resize("100%",h);
					 }
					 var iframe = $('.cke_wysiwyg_frame');//.contents();
					 if(iframe && iframe.length>0) {
						 $scope.iframedoc = iframe[0].contentDocument || iframe[0].contentWindow.document;
						 if(!_.isEmpty(annotList) && !_.isEmpty($scope.annotationId)) {
							 orderComments(annotList,$scope.annotationId);
						 } else if(!_.isEmpty(annotList)) {
							 orderComments(annotList);
						 }
					 }
				});
				$scope.instance.on( 'contentDom', function( evt ) {
					var body = this.document.getBody();
					var editable = $scope.instance.editable();
					editable.attachListener( editable, 'click', function( event ) {
						//event.stopPropagation();   
						var elem = event.data.getTarget();
						var parentElem = $( elem.$ ).parent();
						if (elem.hasClass("note") && elem.getAttribute("comment-id")) {
							showCommentOnCkeClick(body,elem.$);
						}
					});
					var tim = $timeout(function() {
						if(!_.isEmpty($scope.annotationId)) {
							anotObj = getAnnotationById($scope.annotationId);
							if(!anotObj) {
								anotObj = getAnnotationByResourceName($scope.annotationId);
							}
							var $docWrap = $('div.doc-viewr[data-id="'+$scope.viewerId+'"]');
							if($docWrap.length > 0 && anotObj) {
								$scope.onClickComment(null,null,$docWrap.find('.vdvc_comment_'+anotObj.resourceName),top);
							}
						}
						$timeout.cancel(tim);
					 }, 100);
					 editable.attachListener( this.document, 'mouseover', function( event ) {
						$(body.$).find(".cke_image_resizer").css("display", "none");
						$(body.$).find(".cke_widget_drag_handler_container").css("display", "none");
					 });
				});
			}
		}
		
		function showDocument() {
			if($scope.documentId) {
				pendingRequests.cancel(getdocPromise);
				getdocPromise = CommonService.getPublicDocById($scope.linkId,$scope.taskspaceId,$scope.documentId,$scope.annotationId);
				getdocPromise.then(function(response){
					if (response.status == 200 && response.data.Status) {
						$scope.doc = response.data.Notes;
						
						if($scope.doc) {
							if(!_.isEmpty(response.data.Annotations)) {
								annotList = response.data.Annotations;
							}
							if(!_.isEmpty($scope.doc.tags)) {
								$scope.docTags = angular.copy($scope.doc.tags);
							}
							$scope.showTags = response.data.Tag; 
							if(_.isString($scope.doc.contentType) && $scope.doc.contentType.toLowerCase() == 'application/pdf') {
								loadPdf();
							} else {
								CreateNotes("editor-"+$scope.viewerId);
								if($scope.doc.sourceUrl) {
									var urlObj = urlParser.parseUrl($scope.doc.sourceUrl);
									$scope.doc.sourceHost = urlObj.hostname;
								}
							}
						}
					}
				});
			}	
		}
		
		function loadPdf() {
			$scope.showPdf = true;
			$scope.pdfUrl = baseUrl+'publicAPI/getDigestPdfDoc/'+$scope.linkId+"/"+$scope.taskspaceId+"/"+$scope.documentId;
			$scope.loadPDF($scope.pdfUrl);
			var t = $timeout(function() {
				//$scope.showComments = true;
				$scope.pdfAnnotations = annotList;
				_.each($scope.pdfAnnotations,function(pdfAnnotation,i){
					processSelectedConvTags(pdfAnnotation);
				});
				$timeout.cancel(t);
			},100);
		}
		
		$scope.showTagsInfo = function(conv) {
			if(conv.tagsInfo && conv.tagsInfo.length > 0) {
				return true;
			}
			return false;
		};
		
		$scope.pdfCommentOnclick = function($event,annot) {
			if ($event) {
				//$event.preventDefault();
			    $event.stopPropagation();
			}
			
			var pdfPage = $scope.pdfViewerAPI.viewer._pages[annot.pageNum-1];
			if(pdfPage) {
				pdfPage.CustomRenderCB = function() {
					var $pdfWrap = $('div.pdf-wrap[data-id="'+$scope.viewerId+'"]');
					$pdfWrap.find('.pdfHighlight.cmtActive').removeClass("cmtActive");
					$pdfWrap.find('.pdfScreenshot.screenshotActive').removeClass("screenshotActive");
					var cmt = $('div[annot-id="'+annot.id+'"]');
					$pdfWrap.find(".vdvc_comment_selected").removeClass("vdvc_comment_selected");
					$('div[data-id="'+annot.id+'"]').addClass("vdvc_comment_selected");
					if(cmt.length > 0){
						if(annot.type == "Screenshot") {
							cmt.addClass("screenshotActive");
						} else {
							cmt.addClass("cmtActive");
						}
						cmt[0].scrollIntoView(true);
						
						$pdfWrap[0].scrollTop -= 20;
					}
				};
				
				if(pdfPage.renderingState == 3 || ($scope.pdfCurrentPage == annot.pageNum && $scope.isPdfIsRendered)) {
					pdfPage.CustomRenderCB();
				} else {
					$scope.pdfCurrentPage = annot.pageNum;
					$scope.pdfViewerAPI.goToPage($scope.pdfCurrentPage);
				}
			} else if(annot.type == "Pagenote") {
				var $pdfWrap = $('div.pdf-wrap[data-id="'+$scope.viewerId+'"]');
				$pdfWrap.find(".vdvc_comment_selected").removeClass("vdvc_comment_selected");
				$('div[data-id="'+annot.id+'"]').addClass("vdvc_comment_selected");
			}
			
		};
		
		function triggerPdfCmtEle() {
			$scope.showComments = true;
			var pdfCmtEl = $('div[data-convId="'+$stateParams.da+'"]').closest('.comment-crd');
			if(pdfCmtEl) {
				if(pdfCmtEl) {
					pdfCmtEl[0].scrollIntoView();
				}
				pdfCmtEl.trigger("click");
			}
		}
		
		$scope.isPdfIsRendered = false;
		
		$scope.onPDFProgress = function (operation, state, value, total, message) {
			if(operation === "render" && value === 1) {
				if(state === "success") {
					
					$scope.pdfCurrentPage = 1;
					$scope.pdfTotalPages = $scope.pdfViewerAPI.getNumPages();
					$scope.isLoading = false;
					$scope.showComments = true;
					if(!$scope.isPdfIsRendered) {
						var tim = $timeout(function() {
							if($stateParams.d && $scope.documentId == $stateParams.d && $stateParams.da) {
								triggerPdfCmtEle();
							}
							$scope.isPdfIsRendered = true;
							$timeout.cancel(tim);
						}, 1000);
					}
				} else {
					console.log("Failed to render 1st page!\n\n" + message);
					$scope.isLoading = false;
				}
			} else if(operation === "download" && state === "loading") {
				$scope.downloadProgress = (value / total) * 100.0;
			} else {
				if(state === "failed") {
					console.log("Something went really bad!\n\n" + message);
				} else if(state === "success") {
					if(!$scope.isPdfIsRendered) {
						var tim = $timeout(function() {
							if($stateParams.d && $scope.documentId == $stateParams.d && $stateParams.da) {
								triggerPdfCmtEle();
							}
							$scope.isPdfIsRendered = true;
							$timeout.cancel(tim);
						}, 0);
					}
				}
			}
			
			if(operation === "render" && state === "success") {
				var pdfPage = $scope.pdfViewerAPI.viewer._pages[value-1];
				if(typeof pdfPage.CustomRenderCB == "function") {
					pdfPage.CustomRenderCB();
				}
			}
		};
		
		$scope.getPdfAnnotationText = function(annot) {
			if(!_.isEmpty(annot.highligtedText)) {
				return annot.highligtedText;
			} else {
				return annot.annotatedText;
			}
		};
		
		$scope.fit = function() {
			$scope.pdfViewerAPI.OnScaleChanged("auto");
		};
		
		$scope.onPDFPageChanged = function () {
			$timeout(function () {
				$scope.pdfViewerAPI.goToPage($scope.pdfCurrentPage,cb);
			},0);
		};

		$scope.goPrevious = function() {
			if ($scope.pdfCurrentPage > 1) {
				$scope.pdfCurrentPage = ($scope.pdfCurrentPage*1)-1;
				$scope.pdfViewerAPI.goToPage($scope.pdfCurrentPage);
			}
		};
		
		$scope.goNext = function() {
			if ($scope.pdfTotalPages > $scope.pdfCurrentPage) {
				$scope.pdfCurrentPage = ($scope.pdfCurrentPage*1)+1;
				$scope.pdfViewerAPI.goToPage($scope.pdfCurrentPage);
			}
		};
				
		$scope.zoomIn = function () {
			$scope.pdfViewerAPI.zoomIn();
		};

		$scope.zoomOut = function () {
			$scope.pdfViewerAPI.zoomOut();
		};
		
		$scope.rotateClockwise = function () {
			$scope.pdfViewerAPI.rotatePages(90);
		};

		$scope.rotateCounterClockwise = function () {
			$scope.pdfViewerAPI.rotatePages(-90);
		};

		$scope.loadPDF = function (pdfURL) {
			if($scope.pdfURL === pdfURL) {
				return;
			}

			$scope.isLoading = true;
			$scope.downloadProgress = 0;
			$scope.pdfZoomLevels = [];
			$scope.pdfSearchTerm = "";
			$scope.pdfFile = null;
			$scope.pdfURL = pdfURL;
		};
				
		$scope.findNext = function () {
			$scope.pdfViewerAPI.findNext();
		};
		
		$scope.findPrev = function () {
			$scope.pdfViewerAPI.findPrev();
		};

		$scope.onPDFFileChanged = function () {
			$scope.isLoading = true;
			$scope.downloadProgress = 0;
			$scope.pdfZoomLevels = [];
			$scope.pdfSearchTerm = "";

			$scope.$apply(function () {
				$scope.pdfURL = "";
				$scope.pdfFile = document.getElementById('file_input').files[0];
			});
		};
		
		$scope.onPDFPassword = function (reason) {
			return prompt("The selected PDF is password protected. PDF.js reason: " + reason, "");
		};  
			
		function loadMoreAnnotations(inview) {
			
			 if(inview ) {
				 $timeout.cancel(loadTimer);
				 loadTimer = $timeout(function(){
					 
					 if($scope.activeTab.index === 1 && !$scope.hasSelectedAnnotations) {
						 if($scope.docAnnotations && $scope.docAnnotations.length > $scope.annotLimit) {
								if( ($scope.docAnnotations.length-$scope.annotLimit) >= 5 ) {
									$scope.annotLimit += 5;
								} else {
									$scope.annotLimit = $scope.docAnnotations.length;
								}
							}	
					 }
					 if($scope.activeTab.index === 2) {
						 if($scope.docOrphanAnnotations && $scope.docOrphanAnnotations.length > $scope.orphanAnnotLimit) {
								if( ($scope.docOrphanAnnotations.length-$scope.orphanAnnotLimit) >= 5 ) {
									$scope.orphanAnnotLimit += 5;
								} else {
									$scope.orphanAnnotLimit = $scope.docOrphanAnnotations.length;
								}
							}	
					 }
		         }, 500);
		    }
		}
		$scope.taskspaceId = $stateParams.tsId;
		$scope.documentId = $stateParams.d;
		function connectPublicDigestEventSocket() {
			if(!_.isEmpty($scope.taskspaceId) && PublicDigestEventListner.isConnected()) {
				PublicDigestEventListner.sendMessage({"taskspaceId":$scope.taskspaceId,"documentId":$scope.documentId});
    		} else if(!_.isEmpty($scope.taskspaceId) && !PublicDigestEventListner.isConnected()) {
    			PublicDigestEventListner.taskspaceId = $scope.taskspaceId;
    			PublicDigestEventListner.documentId = $scope.documentId;
    			PublicDigestEventListner.reconnect();
			}
		}
		
		function init() {
			connectPublicDigestEventSocket();
			showDocument();
		}
		init();
	}
})();


;(function(){
	'use strict';
	
	angular.module("vdvcPublicApp").controller('PublicNavigationController',PublicNavigationController);
	
	PublicNavigationController.$inject = ['$state','companyName','$uibModal'];
	
	function PublicNavigationController($state,companyName,$uibModal) {
			
			var vm = this;
			
			vm.Company = companyName;
			vm.currentState = $state.$current.name;
			vm.isCollapsed = true;
			vm.hasSession = false;
			
	}
})();
;(function(){
	'use strict';
	
	angular.module("vdvcPublicApp").controller('PublicWebAnnotationController',PublicWebAnnotationController);
	
	PublicWebAnnotationController.$inject = ['$scope','$rootScope','$state',
	                                   '$stateParams','$window','$timeout',
	                                   '$deviceInfo','ChromeExtensionService',
	                                   '$cookies','CommonService','localStorage'];
	
	function PublicWebAnnotationController($scope,$rootScope,$state,$stateParams,$window,
			$timeout,$deviceInfo,ChromeExtensionService,$cookies,CommonService,localStorage) {
		var pwc = this;
		
		var disableRenderWAErrorPage = false;
		var getExtensionInfoTimeout;
		
		function redirectToErrorPage(errorCode,extensionId,autoRedirectDuration,chromeStoreBaseUrl,extensionName) {
			var params = {
					"error" : errorCode,
					"extensionId" : extensionId,
					"target" : $stateParams.target,
					"tsId": $stateParams.tsId,
					"cid": $stateParams.cid,
					"linkId": $stateParams.linkId,
					"autoRedirectDuration" : autoRedirectDuration
				};
			
			if($stateParams.annotationId) {
				params.annotationId = $stateParams.annotationId;
			}
			if(chromeStoreBaseUrl) {
				params.chromeStoreBaseUrl = chromeStoreBaseUrl;
			}
			if(extensionName) {
				params.extensionName = extensionName;
			}
			$state.go("publicwaerror",params);
		}
		
		function goToWebannotation() {
			var targetUrl = $stateParams.target;
			if(!_.isEmpty($stateParams.annotationId)) {
				targetUrl = targetUrl+"#webannotations:"+$stateParams.annotationId;
	    	}
			if(!_.isEmpty($stateParams.cid)) {
				targetUrl = targetUrl+"#client:"+$stateParams.cid;
	    	}
			if(!_.isEmpty($stateParams.tsId)) {
				targetUrl = targetUrl+"#group:"+$stateParams.tsId;
	    	}
			if(!_.isEmpty($stateParams.linkId)) {
				targetUrl = targetUrl+"#linkId:"+$stateParams.linkId;
	    	}
			return targetUrl;
		}
		
		function getExtensionInfo(extensionId,autoRedirectDuration,chromeStoreBaseUrl,extensionName) {
			var targetUrl = goToWebannotation();
			ChromeExtensionService.isExtensionInstalled(extensionId,function(response){
				if(response && response.type === "pong") {
					$window.location.href = targetUrl;
				} else {
					if(!_.isEmpty($stateParams.actualUrl)) {
						targetUrl = $stateParams.actualUrl;
					}
					localStorage.setItem("webAnnotationUrl",targetUrl);
					redirectToErrorPage("extension_not_installed",extensionId,autoRedirectDuration,chromeStoreBaseUrl,extensionName);
				}
			});
		}
		
		function checkforDeviceSupport() {
			if($deviceInfo.isMobile || $deviceInfo.isTablet) {
				return false;
			} else {
				return true;
			}
		}
		
		function init() {
			if($stateParams.target) {
				
				if(!checkforDeviceSupport()) {
					var targetUrl = goToWebannotation();
					$window.location.href = targetUrl;
					return false;
				}
				
				var storedCookie = $cookies.getObject("publicwebannotate");
				if(storedCookie && storedCookie.disableRenderWAErrorPage) {
					var targetUrl = goToWebannotation();
					$window.location.href = targetUrl;
					return false;
				}
				CommonService.getKeyValuesForWebAnnotationsType().then(function(resp){
					if(resp.status == 200 && resp.data.Status) {
						var listAppKeyValues  = resp.data.listAppKeyValues;
						var chromeStoreBaseUrlObj = _.findWhere(listAppKeyValues,{"key": "ChromeStoreBaseUrl"});
						var extensionNameObj = _.findWhere(listAppKeyValues,{"key": "ExtensionName"});
						var extensionIdObj = _.findWhere(listAppKeyValues,{"key": "ExtensionId"});
						var autoRedirectDurationObj = _.findWhere(listAppKeyValues,{"key": "AutoRedirectDuration"});
						var autoRedirectDuration = 5000;
						if(autoRedirectDurationObj) {
							autoRedirectDuration = autoRedirectDurationObj.value;
						}
						
						if(extensionIdObj) {
							if($deviceInfo.isChrome) {
								if(chromeStoreBaseUrlObj && extensionNameObj) {
									getExtensionInfo(extensionIdObj.value,autoRedirectDuration,chromeStoreBaseUrlObj.value,extensionNameObj.value);
								} else {
									getExtensionInfo(extensionIdObj.value,autoRedirectDuration);
								}
							} else {
								if(chromeStoreBaseUrlObj && extensionNameObj) {
									redirectToErrorPage("browser_is_not_chrome",extensionIdObj.value,autoRedirectDuration,chromeStoreBaseUrlObj.value,extensionNameObj.value);
								} else {
									redirectToErrorPage("browser_is_not_chrome",extensionIdObj.value,autoRedirectDuration);
								}
							}
						}
						
					}
				});
				/*var listAppKeyValues  = [{
				    "type" : "WebAnnotations",
				    "key" : "ExtensionId",
				    "value" : "iahhmhdkmkifclacffbofcnmgkpalpoj",
				    "description" : "WebAnnotations ExtensionId",
				    "active" : true
				},{
				    "type" : "WebAnnotations",
				    "key" : "AutoRedirectDuration",
				    "value" : "5000",
				    "description" : "Time delay for redirecting the URL in milliseconds",
				    "active" : true
				},{
				    "type" : "WebAnnotations",
				    "key" : "ChromeStoreBaseUrl",
				    "value" : "https://chrome.google.com/webstore/detail/",
				    "description" : "ChromeStoreBaseUrl for downloading the chrome extension",
				    "active" : true
				},{
				    "type" : "WebAnnotations",
				    "key" : "ExtensionName",
				    "Value" : "numici-web-ext",
				    "description" : "Numici Web extension name",
				    "active" : true
				}];*/
				
			}
		}
		
		init();
	}
})();
; (function() {
	'use strict';

	angular.module('vdvcPublicApp').factory('notificationEvents', notificationEvents);
	notificationEvents.$inject = ['$rootScope','uuidService'];
	function notificationEvents($rootScope,uuidService) {

        return {
			DIGEST_CHANGED : "digestChanged"
		};
	}
})();
;(function(){
	'use strict';
	
	angular.module("vdvcPublicApp").factory("PublicDigestEventListner",PublicDigestEventListner);
	
	PublicDigestEventListner.$inject = ['$rootScope','SocketFactory','uuidService','notificationEvents'];

	function PublicDigestEventListner($rootScope,SocketFactory,uuidService,notificationEvents) {
		
		var socket = SocketFactory.getConnection('digestevents',{
			reconnectIfNotNormalClose: true
		});
		
		var digestEvent = {
				taskspaceId : null,
				documentId : null,
				sendMessage: sendMessage,
				reconnect:reconnect,
				close: close,
				isConnected: isConnected
		};
		
		function handleDigestNotifications(message) {
			var data = JSON.parse(message.data);
			if(data) {
				console.log(data.action);
				console.log(data);
				switch(data.action) {
					case "DIGEST_CHANGED" :
						$rootScope.$broadcast(notificationEvents[data.action],data);
						break;
				}
			}
		}
		
		socket.onMessage(function(message){
			handleDigestNotifications(message);
		});
		
		socket.onOpen(function(){
			sendMessage({"taskspaceId":digestEvent.taskspaceId,"documentId":digestEvent.documentId});
		});
		
		return digestEvent;
		
		function sendMessage(message) {
			return socket.send(message);
		}
		
		function reconnect() {
			socket.reconnect();
		}
		
		function close() {
			socket.close();
		}
		
		function isConnected() {
			if(socket && socket.readyState == 1) {
				return true;
			}
			return false;
		}
		
	}
	
})();
;(function(){
	'use strict';
	
	angular.module("vdvcPublicApp").factory("SocketFactory",SocketFactory);
	
	SocketFactory.$inject = ['$rootScope','$websocket','$location','urlParser','_'];

	function SocketFactory($rootScope,$websocket,$location,urlParser,_) {
		
		var connections = {};
		var socket = {
				getConnection : getConnection,
				closeAllSockets : closeAllSockets 
		};
		
		$rootScope.$on("ONLOGIN", function(event, data) {
			reconnectAllSockets();
		});
		
		return socket;
		
		function createEndPointUrl(endpoint) {
			
			var absUrl = $location.absUrl();
			var urlObj = urlParser.parseUrl(absUrl);
			
			try {
				var protocol = urlObj.protocol;
				var host = urlObj.host;
				var context = urlObj.pathname.split('/')[1];
				
				if(protocol == 'https:') {
					return 'wss://'+host+'/'+endpoint;
				} else {
					return 'ws://'+host+'/'+endpoint;
				}
			} catch(e) {
				
			}
			
		}
		
		function closeAllSockets() {
			_.each(connections,function(socket,url) {
				socket.close();
			});
		}
		
		function reconnectAllSockets() {
			_.each(connections,function(socket,url) {
				socket.reconnect();
			});
		}
		
		function getConnection(endpoint,options) {
			var url = createEndPointUrl(endpoint);
			if(url) {
				var connection = $websocket(url,false,options);
				connections[url] = connection;
				return connection;
			}
		}
		
	}
})();
;(function(){
	'use strict';
	
	
	angular.module("vdvcPublicApp").factory("httpService",httpService);
	
	httpService.$inject = ['$q','$http','baseUrl'];

	function httpService($q,$http,baseUrl) {
		var requestCounter = 0;
		var httpService = {
				httpGet : httpGet,
				httpDelete : httpDelete,
				httpPost : httpPost
		};
		
		return httpService;
		
		function httpGet(url,uid,getConfig) {
			
			url = baseUrl+url;
			requestCounter++;
			var canceller = $q.defer();
			var config = { timeout: canceller.promise };
			if(getConfig) {
				config = angular.extend({}, config, getConfig);
			}
			
		    //Request gets cancelled if the timeout-promise is resolved
		    var requestPromise = $http.get(url,config);
		    requestPromise._httpCanceller = canceller;
		    return requestPromise;
		}
		
		
		function httpPost(url,postdata,postConfig) {
			
			url = baseUrl+url;
			requestCounter++;
			var canceller = $q.defer();
			var config = { timeout: canceller.promise };
			if(postConfig) {
				config = angular.extend({}, config, postConfig);
			}
		    //Request gets cancelled if the timeout-promise is resolved
		    var requestPromise = $http.post(url,postdata ,config);
	
		    requestPromise._httpCanceller = canceller;
		   
		    return requestPromise;
		}
		
		function httpDelete(url,postdata) {
			
			url = baseUrl+url;
			requestCounter++;
			var canceller = $q.defer();
		   
		    //Request gets cancelled if the timeout-promise is resolved
		    var requestPromise = $http({
				'method': 'DELETE',
	    		'url': url,
	    		'data':postdata ? postdata : {},
	    		"headers": {
	    			   'Content-Type': 'application/json;charset=utf-8'
	    		},
	    		'timeout': canceller.promise
	    	});
		    
		    requestPromise._httpCanceller = canceller;
		    
		    return requestPromise;
		}
	}
})();
;(function(){
	'use strict';
	angular.module("vdvcPublicApp").factory("pendingRequests",pendingRequests);
	
	pendingRequests.$inject = ['_'];

	function pendingRequests(_) {
		
		var pending = [];
		
		var pendingRequests = {
				get : get,
				add : add,
				remove : remove,
				cancel : cancel,
				cancelAll : cancelAll
		};
		
		return pendingRequests;
		
		function get() {
			 return pending;
		}
		
		function add(request) {
		    pending.push(request);
		}
		  
		function remove(uid) {
			
			pending = _.filter(pending, function(p) {
				return p.uid !== uid;
			});
		}
		 
		function cancelAll() {
			
			angular.forEach(pending, function(p) {
			      p.canceller.resolve();
			});
			
			pending.length = 0;
		}
		 
		function cancel(promise) {
			if(promise && promise._httpCanceller && promise._httpCanceller.resolve) {
				promise._httpCanceller.resolve();
            }
		}	
	}
})();
;(function(){
	'use strict';
	angular.module("vdvcPublicApp").factory("Juicify",Juicify );
	
	Juicify.$inject = ['$q','$http','uuidService'];
	
	function Juicify($q,$http,uuidService) {
		var randomId = uuidService.newUuid();
		var markdownCssUrl = 'app/assets/css/markdown.css?id='+randomId;
		var Juicify = {
				getCssContent : getCssContent,
				inlineCss : inlineCss,
				markdownCssUrl: markdownCssUrl,
				cssMap : {}
		};
		
		return Juicify;
		
		
		function getCssContent(cssurl) {
			return $http.get(url,config).then(function(resp) {
			}).finally(function(resp) {
				if(resp) {
					cssMap[cssurl] = resp;
				}
			});
		}
		
		function inlineCss(html,css) {
			var html = '<div class="markdown-body">'+html+'</div>';
			if(css) {
				return juice.inlineContent(html, css);
			} else {
				return html;
			}
		}
	}
	
})();


;(function(){
	
	'use strict';
	
	angular.module("vdvcPublicApp").controller("StateNotFoundErrorController",StateNotFoundErrorController);
	
	StateNotFoundErrorController.$inject = ['$state','$scope','appData'];
	
	function StateNotFoundErrorController($state,$scope,appData){
		
		var se = this;
		var appdata = appData.getAppData();
		
		$scope.$emit("PageName",{"userName":appdata.UserName,"pageName":$state.current.pageName});
		
	}
})();
;(function(){
	'use strict';
	
	angular.module("vdvcPublicApp").controller("PublicWAErrorController",PublicWAErrorController);
	
	PublicWAErrorController.$inject = ['$state','$stateParams','$scope','_',
	                             '$timeout','$window','$cookies','localStorage'];
	
	function PublicWAErrorController($state,$stateParams,$scope,_,$timeout,
			$window,$cookies,localStorage){
		var errorCodeMap = {
				"browser_is_not_chrome" : "If you are viewing this on a computer, use Chrome browser with Numici extension to<br> <b>see the highlights and associated comments on the original web page.</b> Learn more<br><br> You will be taken to the target web page in 5 seconds or<br>you can click here to go there immediately.",
				"extension_not_installed" : "Get Numici extension for Chrome to <br> <b>see the highlights and associated comments on the original web page.</b><br><br> You will be taken to the target web page in 5 seconds or<br>you can click here to go there immediately.",
				"extension_not_enabled" : "Get Numici extension for Chrome to <br> <b>see the highlights and associated comments on the original web page.</b><br><br> You will be taken to the target web page in 5 seconds or<br>you can click here to go there immediately.",
				"default" : "Please try after some time.The server encountered an unexpected error. "
		};
		
		var pwec = this;
		
		var goToTargetTimeout;
		
		//$scope.$emit("PageName",{"userName":(appdata ? appdata.UserName : ""),"pageName":$state.current.pageName});
		
		pwec.showLoginUrl = false;
		pwec.errorCode = $stateParams.error;
		pwec.chromeStoreBaseUrl = $stateParams.chromeStoreBaseUrl;
		pwec.extensionName = $stateParams.extensionName;
		pwec.extensionId = $stateParams.extensionId;
		pwec.error = "";
		pwec.ExtensionUrl = "";
		pwec.targetUrl = "";
		pwec.autoRedirectDuration = $stateParams.autoRedirectDuration;
		pwec.doNotShow = false;
		
		pwec.setCookieForDonnotShowWAError = setCookieForDonnotShowWAError;
		pwec.clearWebAnnotUrlFromLocalStorage = clearWebAnnotUrlFromLocalStorage;
		function setCookieForDonnotShowWAError() {
			if(pwec.doNotShow) {
				var expireDate = new Date();
				expireDate.setDate(expireDate.getDate() + 1);
				$cookies.putObject("publicwebannotate", {"disableRenderWAErrorPage" : pwec.doNotShow}, {'expires': expireDate});
			}
		}
		
		function clearWebAnnotUrlFromLocalStorage() {
			localStorage.removeItem("webAnnotationUrl");
			$window.location.href = pwec.targetUrl;
		}
		
		function init() {
			if(!_.isEmpty(pwec.errorCode)) {
				pwec.error = errorCodeMap[pwec.errorCode];
				if(pwec.errorCode == "extension_not_installed" || pwec.errorCode == "extension_not_enabled" || pwec.errorCode == "browser_is_not_chrome") {
					pwec.error = pwec.error.replace("5", ""+(pwec.autoRedirectDuration/1000));
					if(pwec.error && pwec.chromeStoreBaseUrl && pwec.extensionName && pwec.extensionId) {
						pwec.ExtensionUrl = pwec.chromeStoreBaseUrl+pwec.extensionName+"/"+pwec.extensionId;
						pwec.error = pwec.error.replace("Get Numici extension", "<a href='"+pwec.ExtensionUrl+"'>Get Numici extension</a>");
						if(pwec.errorCode != "browser_is_not_chrome") {
							pwec.error = pwec.error.replace("Get Numici extension", "<a href='"+pwec.ExtensionUrl+"'>Get Numici extension</a>");
						} else {
							pwec.error = pwec.error.replace("Learn more", "<a href='"+pwec.ExtensionUrl+"'>Learn more</a>");
						}
					}
					if($stateParams.target) {
						pwec.targetUrl = $stateParams.target;
						if($stateParams.annotationId && $stateParams.cid) {
							pwec.targetUrl = pwec.targetUrl +"#webannotations:"+ $stateParams.annotationId+"#client:"+$stateParams.cid;
							if($stateParams.tsId) {
								pwec.targetUrl +="#group:"+$stateParams.tsId;
							}
							if($stateParams.linkId) {
								pwec.targetUrl +="#linkId:"+$stateParams.linkId;
							}
						}
						pwec.error = pwec.error.replace("here", "<a href='"+pwec.targetUrl+"'>here</a>");
					}
				}
				
				if(!pwec.error){
					pwec.error = pwec.errorCode;
				}
			} else {
				pwec.error = errorCodeMap["default"];
			}
			/*if(_.isEmpty(appdata["UserId"])) {
				pwec.showLoginUrl = true;
			}*/
			
			$timeout.cancel(goToTargetTimeout);
			goToTargetTimeout = $timeout(function() {
				if(pwec.targetUrl) {
					clearWebAnnotUrlFromLocalStorage();
				}
				$timeout.cancel(goToTargetTimeout);
            },pwec.autoRedirectDuration);
		}
		init();
	}
})();
;(function() {
	
	angular.module("vdvcPublicApp").factory("ChromeExtensionService",ChromeExtensionService);
	
	ChromeExtensionService.$inject = ['$deviceInfo','$window'];
	
	function ChromeExtensionService($deviceInfo,$window) {
		
		var ChromeExtensionService = {
			isExtensionInstalled : isExtensionInstalled,
		};
		return ChromeExtensionService;
		
		function isExtensionInstalled(extensionId,success) {
			try {
				chrome.runtime.sendMessage(extensionId, {"type" : "ping"},
						function(response) {
							if(typeof success == "function"){
								success(response);
							}
						});
			} catch (e) {
				console.log("exception : " + e.message);
				if(typeof success == "function"){
					success(null);
				}
			}
		}
	}

})();
angular.module('vdvcPublicApp').run(['$templateCache', function($templateCache) {$templateCache.put('apppublic/components/PublicAnnotationDigest/annotaion-digest-template.html','<div class="drc" data-ng-style="::digesMinMaxWidth()">\r\n\t<div class="row" contenteditable="false" data-ng-if="groupBy == \'document\'">\r\n       \t<div class="row digest-name" \r\n        \tdata-ng-if="digestName.length>0" \r\n        \tstyle="color: #069;text-align: center;padding: 10px 0px; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol;">\r\n\t\t\t<h2 data-ng-if="digestFor != \'DigestDocument\' || digestUrl.length == 0">\r\n\t\t\t\t{{digestName}}\r\n\t\t\t</h2>\r\n\t\t\t<h2 data-ng-if="digestFor == \'DigestDocument\' && digestUrl.length > 0" >\r\n\t\t\t\t<a data-ng-href="{{digestUrl}}" \r\n\t\t\t\t\ttarget="_blank" \r\n\t\t\t\t\trole="button"\r\n\t\t\t\t\tstyle="color: #069; text-decoration: none !important;">\r\n\t\t\t\t\t{{digestName}} \r\n\t\t\t\t</a>\r\n\t\t\t</h2>\r\n\t\t</div>\r\n\t\t<div class="row digest-description" \r\n\t\t\tdata-ng-bind-html="description| to_trusted" \r\n\t\t\tdata-ng-if="description.length>0" \r\n\t\t\tstyle="padding: 10px 0px;color: #24292e;font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol;border-bottom: 1px solid #aaa;padding-bottom: 20px;">\r\n\t\t\t<!-- {{description}} -->\r\n\t\t</div>\r\n\t\t<section data-ng-if="digestFor != \'DigestDocument\'">\r\n\t\t\t<div class="row">\r\n\t\t\t\t <digest-table-of-contents\r\n\t\t\t\t      digest-data="digestData" \r\n\t\t\t\t\t  data-digest-meta-info-options="digestMetaInfoOptions" \r\n\t\t\t\t\t  data-table-of-contents="tableOfContents" \r\n\t\t\t\t\t  data-table-of-contents-heading="{{tableOfContentsHeading}}"\r\n\t\t\t\t\t  data-table-id="digest_table_of_contents"\r\n\t\t\t\t\t  group-by="groupBy"\r\n\t\t\t\t\t  template-for="document">\r\n\t\t\t\t </digest-table-of-contents>\r\n\t\t \t</div>\r\n\t\t </section>\r\n\t\t <br>\r\n    </div>\r\n    <div class="row" \r\n    data-ng-style="{\'border-bottom-width\': \'1px\', \'border-bottom-color\': \'#aaa\', \'border-bottom-style\': \'solid\'}" \r\n\t\tstyle="width: 100%;padding: 10px 0px;"\r\n\t\tdata-ng-repeat="digest in ::digestData track by $index" \r\n\t\tdata-ng-attr-id="{{ \'index_\'+(groupByIndex ? (groupByIndex+\'_\') : \'\')+$index }}"\r\n\t\tdata-ng-attr-data-doc-id="{{digest.documentId}}">\r\n\t\t<div data-ng-attr-data-obj-id="{{digest.documentId}}"\r\n\t\t\t data-ng-attr-data-annot-id="{{digest.annotationId}}"></div>\r\n\t\t<div class="row" contenteditable="false">\r\n\t\t\t<div data-ng-if="imagePosition == \'left\'" style="width: 100%;">\r\n\t\t\t\t<div data-ng-include="\'apppublic/components/PublicAnnotationDigest/image-left-tmpl.html\'"></div>\r\n\t\t\t</div>\r\n\t\t\t<div data-ng-if="imagePosition == \'fullWidth\'" style="width: 100%;">\r\n\t\t\t\t<div data-ng-include="\'apppublic/components/PublicAnnotationDigest/image-full-tmpl.html\'"></div>\r\n\t\t\t</div>\r\n\t\t\t<div data-ng-if="imagePosition == \'right\'" style="width: 100%;">\r\n\t\t\t\t<div data-ng-include="\'apppublic/components/PublicAnnotationDigest/image-right-tmpl.html\'"></div>\r\n\t\t\t</div>\r\n\t\t\t\r\n\t\t\t<div class="row" \r\n\t\t\t\tdata-ng-repeat="annotation in ::digest.annotations track by $index"\r\n\t\t\t\tdata-ng-attr-data-annotId="{{annotation.annotationId}}"\r\n\t\t\t\tstyle="clear: both;">\r\n\t\t\t\t<div data-ng-if="displayOrder == \'regular\'">\r\n\t\t\t\t<div data-ng-if="!annotation.pagenote">\r\n\t\t\t\t<div class="row">\r\n\t\t\t\t\t<div data-ng-style="{\'border-left-width\': \'4px\', \'border-left-color\': enableBorder, \'border-left-style\': \'solid\'}" style="padding-left: 10px; position: relative;">\r\n\t\t\t\t\t\t<div data-ng-if="::hasAnnotatedText(annotation)"\r\n\t\t\t\t\t\t\t\t data-ng-bind-html="::annotatedText(annotation)| to_trusted"></div>\r\n\t\t\t\t\t\t<div data-ng-if="digestMetaInfoOptions.annotationUserName || digestMetaInfoOptions.annotationCreatedTime"  \r\n\t\t\t\t\t\t\tstyle="font-size: 12px; color: #aaa;">\r\n\t\t\t\t\t\t\t<span data-ng-if="digestMetaInfoOptions.annotationUserName"> \r\n\t\t\t\t\t\t\t\t{{::annotation.annotatedUserName}} \r\n\t\t\t\t\t\t\t</span> \r\n\t\t\t\t\t\t\t&nbsp; \r\n\t\t\t\t\t\t\t<span data-ng-if="digestMetaInfoOptions.annotationCreatedTime"> \r\n\t\t\t\t\t\t\t\t{{::createdDate(annotation.annotationUpdatedTime ? annotation.annotationUpdatedTime : (annotation.annotationCreatedTime ? annotation.annotationCreatedTime : \'\'))}} \r\n\t\t\t\t\t\t\t</span> \r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t<div class="row" data-ng-if="annotation.tags && digestMetaInfoOptions.tags">\r\n\t\t\t\t\t\t\t<span data-ng-repeat="tag in ::annotation.tags track by $index" style="display:inline-block; height: 25px;line-height: 25px;background: #069;padding:0px 10px;margin: 5px;color: #fff;">\r\n\t\t\t\t\t\t\t\t{{tag}}\r\n\t\t\t\t\t\t\t</span>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class="row" data-ng-style="{\'padding\' : !annotation.pagenote ? \'0px 15px 0px 30px\' : \'0px\'}">\r\n\t\t\t\t\t<div data-ng-if="conv.comment && conv.comment.length > 0"\r\n\t\t\t\t\t\tclass="row digest-conversation"\r\n\t\t\t\t\t\tdata-ng-repeat="conv in ::annotation.conversation track by $index">\r\n\t\t\t\t\t\t<div class="row" style="margin: 10px 0px;">\r\n\t\t\t\t\t\t\t<table border="0"\r\n\t\t\t\t\t\t\t\twidth="650" style="width: 648px;max-width: 100%;min-width: 100%;">\r\n\t\t\t\t\t\t\t\t<tr>\r\n\t\t\t\t\t\t\t\t\t<td width="30" style="width: 30px;">\r\n\t\t\t\t\t\t\t\t\t\t<img data-ng-src="{{::commentIconUrl}}" \r\n\t\t\t\t\t\t\t\t\t\t\t data-cke-real-node-type="1"\r\n\t\t\t\t\t\t\t\t\t\t\t data-track-changes-ignore="true" \r\n\t\t\t\t\t\t\t\t\t\t\t data-cke-editable="false"\r\n\t\t\t\t\t\t\t\t\t\t\t contenteditable="false"\r\n\t\t\t\t\t\t\t\t\t\t\t align="left"\r\n\t\t\t\t\t\t\t\t\t\t\t style=" width: 20px; position:relative;top:5px;margin-right: 10px;">\r\n\t\t\t\t\t\t\t\t \t</td>\r\n\t\t\t\t\t\t\t\t \t<td width="620" style="width: calc(100% - 30px);">\r\n\t\t\t\t\t\t\t\t \t\t<comment-to-html data-comment="::conv.comment" data-annotation="::digest"></comment-to-html>\r\n\t\t\t\t\t\t\t\t \t</td>\t\r\n\t\t\t\t\t\t\t\t </tr>\r\n\t\t\t\t\t\t\t</table>\t\t\r\n\t\t\t\t\t\t\t\t \r\n\t\t\t\t\t\t\t<div data-ng-if="digestMetaInfoOptions.annotationUserName || digestMetaInfoOptions.annotationCreatedTime" \r\n\t\t\t\t\t\t\t\tstyle="font-size: 12px; color: #aaa; clear: both;">\r\n\t\t\t\t\t\t\t\t<span data-ng-if="digestMetaInfoOptions.annotationUserName"> \r\n\t\t\t\t\t\t\t\t\t{{::conv.commentatorName}}\r\n\t\t\t\t\t\t\t\t</span> \r\n\t\t\t\t\t\t\t\t&nbsp; \r\n\t\t\t\t\t\t\t\t<span data-ng-if="digestMetaInfoOptions.annotationCreatedTime"> \r\n\t\t\t\t\t\t\t\t\t{{::createdDate(conv.updatedTime ? conv.updatedTime : (conv.createdTime ? conv.createdTime : \'\'))}} \r\n\t\t\t\t\t\t\t\t</span> \r\n\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div data-ng-if="displayOrder == \'blockquote\'">\r\n\t\t\t\t<div class="row">\r\n\t\t\t\t\t<div data-ng-if="conv.comment && conv.comment.length > 0"\r\n\t\t\t\t\t\tclass="row digest-conversation"\r\n\t\t\t\t\t\tdata-ng-repeat="conv in ::annotation.conversation track by $index">\r\n\t\t\t\t\t\t<div class="row" style="margin: 10px 0px;">\r\n\t\t\t\t\t\t\t<table border="0"\r\n\t\t\t\t\t\t\t\twidth="650" style="width: 648px;max-width: 100%;min-width: 100%;">\r\n\t\t\t\t\t\t\t\t<tr>\r\n\t\t\t\t\t\t\t\t\t<td width="30" style="width: 30px;">\r\n\t\t\t\t\t\t\t\t\t\t<img data-ng-src="{{::commentIconUrl}}" \r\n\t\t\t\t\t\t\t\t\t\t\t data-cke-real-node-type="1"\r\n\t\t\t\t\t\t\t\t\t\t\t data-track-changes-ignore="true" \r\n\t\t\t\t\t\t\t\t\t\t\t data-cke-editable="false"\r\n\t\t\t\t\t\t\t\t\t\t\t contenteditable="false"\r\n\t\t\t\t\t\t\t\t\t\t\t align="left"\r\n\t\t\t\t\t\t\t\t\t\t\t style=" width: 20px; position:relative;top:5px;margin-right: 10px;">\r\n\t\t\t\t\t\t\t\t\t</td>\r\n\t\t\t\t\t\t\t\t \t<td width="620" style="width: calc(100% - 30px);">\r\n\t\t\t\t\t\t\t\t \t\t<comment-to-html data-comment="::conv.comment" data-annotation="::digest"></comment-to-html>\r\n\t\t\t\t\t\t\t\t \t</td>\r\n\t\t\t\t\t\t\t\t</tr>\r\n\t\t\t\t\t\t\t</table>\t\r\n\t\t\t\t\t\t\t<div data-ng-if="digestMetaInfoOptions.annotationUserName || digestMetaInfoOptions.annotationCreatedTime" \r\n\t\t\t\t\t\t\t\tstyle="font-size: 12px; color: #aaa; clear: both;">\r\n\t\t\t\t\t\t\t\t<span data-ng-if="digestMetaInfoOptions.annotationUserName"> \r\n\t\t\t\t\t\t\t\t\t{{::conv.commentatorName}}\r\n\t\t\t\t\t\t\t\t</span> \r\n\t\t\t\t\t\t\t\t&nbsp; \r\n\t\t\t\t\t\t\t\t<span data-ng-if="digestMetaInfoOptions.annotationCreatedTime"> \r\n\t\t\t\t\t\t\t\t\t{{::createdDate(conv.updatedTime ? conv.updatedTime : (conv.createdTime ? conv.createdTime : \'\'))}} \r\n\t\t\t\t\t\t\t\t</span> \r\n\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div data-ng-if="!annotation.pagenote">\r\n\t\t\t\t<div class="row" data-ng-style="{\'padding\' : annotation.conversation.length > 0 ? \'0px 15px 0px 30px\' : \'0px\'}">\r\n\t\t\t\t\t<div data-ng-style="{\'border-left-width\': \'4px\', \'border-left-color\': enableBorder, \'border-left-style\': \'solid\'}" style="padding-left: 10px; position: relative;">\r\n\t\t\t\t\t\t<div data-ng-if="::hasAnnotatedText(annotation)"\r\n\t\t\t\t\t\t\t\t data-ng-bind-html="::annotatedText(annotation)| to_trusted" style="text-align: justify; font-style: italic;"></div>\r\n\t\t\t\t\t\t<div data-ng-if="digestMetaInfoOptions.annotationUserName || digestMetaInfoOptions.annotationCreatedTime"  \r\n\t\t\t\t\t\t\tstyle="font-size: 12px; color: #aaa;">\r\n\t\t\t\t\t\t\t<span data-ng-if="digestMetaInfoOptions.annotationUserName"> \r\n\t\t\t\t\t\t\t\t{{::annotation.annotatedUserName}} \r\n\t\t\t\t\t\t\t</span> \r\n\t\t\t\t\t\t\t&nbsp; \r\n\t\t\t\t\t\t\t<span data-ng-if="digestMetaInfoOptions.annotationCreatedTime"> \r\n\t\t\t\t\t\t\t\t{{::createdDate(annotation.annotationUpdatedTime ? annotation.annotationUpdatedTime : (annotation.annotationCreatedTime ? annotation.annotationCreatedTime : \'\'))}}  \r\n\t\t\t\t\t\t\t</span> \r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t<div class="row" data-ng-if="annotation.tags && digestMetaInfoOptions.tags">\r\n\t\t\t\t\t\t\t<span data-ng-repeat="tag in ::annotation.tags track by $index" style="display:inline-block; height: 25px;line-height: 25px;background: #069;padding:0px 10px;margin: 5px;color: #fff;">\r\n\t\t\t\t\t\t\t\t{{tag}}\r\n\t\t\t\t\t\t\t</span>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</div>\r\n\t\t\t\t</div>\r\n\t\t\t\t</div>\r\n\t\t\t</div>\r\n\t\r\n\t\r\n\t\t</div>\r\n\t\r\n\t\t<div data-ng-attr-data-obj-id="digest.documentId"\r\n\t\t\t data-ng-attr-data-annot-id="digest.annotationId">\r\n\t\t</div>\r\n\t</div>\r\n\t\r\n\t<div style="border-top: 3px solid #069; width: 100%; float: left;margin-top: -3px;"></div>\r\n\t<div data-ng-if="numiciImage.length>0 && numiciFooterText.length>0" contenteditable="false"\r\n  \t\tstyle="width: 100%; height: 30px; line-height: 30px; justify-content: center; display: flex; padding-top: 15px;">\r\n\t\t<a data-ng-href="{{numiciLink}}" target="_blank" style="text-decoration: none !important;">\r\n\t\t\t<img data-ng-src="{{numiciImage}}"\r\n\t\t\t     style="width: 30px;">\r\n\t\t</a>\r\n\t\t<a data-ng-href="{{numiciLink}}" target="_blank" role="button"\r\n\t\t\tstyle="color: #069; font-size: 20px; font-weight: 500; margin-left: 6px; text-decoration: none !important;">\r\n\t\t\t{{numiciFooterText}}</a>\r\n\t</div>\r\n\t\r\n</div>');
$templateCache.put('apppublic/components/PublicAnnotationDigest/annotationDigestContent.tmpl.html','<div class="full digest-content">\r\n\t<digest-iframe content="adcc.content"></digest-iframe>\r\n</div>');
$templateCache.put('apppublic/components/PublicAnnotationDigest/digest-group-template.html','<div class="drc" data-ng-style="::setDigesMinMaxWidth()">\r\n<!-- <annotaion-digest-title data-get-title-styles = "::titleStyles()" data-task-space="taskSpace" ></annotaion-digest-title> -->\r\n\t<div class="row" contenteditable="false">\r\n      \t<div class="row digest-name" \r\n\t       \tdata-ng-if="digestName.length>0" \r\n\t       \tstyle="color: #069;text-align: center;padding: 10px 0px;font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol;">\r\n\t\t\t<h2 data-ng-if="digestFor != \'DigestDocument\' || digestUrl.length == 0">{{digestName}}</h2>\r\n\t\t\t<h2 data-ng-if="digestFor == \'DigestDocument\' && digestUrl.length > 0">\r\n\t\t\t\t<a data-ng-href="{{digestUrl}}" \r\n\t\t\t\t\ttarget="_blank" \r\n\t\t\t\t\trole="button" \r\n\t\t\t\t\tstyle="color: #069; text-decoration: none !important;">\r\n\t\t\t\t\t{{digestName}} \r\n\t\t\t\t</a>\r\n\t\t\t</h2>\r\n\t\t</div>\r\n\t\t<div class="row digest-description" \r\n\t\t\tdata-ng-if="description.length>0" \r\n\t\t\tdata-ng-bind-html="description| to_trusted" \r\n\t\t\tstyle="padding: 10px 0px;color: #24292e;font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol;border-bottom: 1px solid #aaa;padding-bottom: 20px;">\r\n\t\t\t<!-- {{description}} -->\r\n\t\t</div>\r\n\t\t<section data-ng-if="digestFor != \'DigestDocument\'">\r\n\t\t\t<div class="row" data-ng-if="groupBy == \'section\'">\r\n\t\t \t\t<digest-table-of-contents\r\n\t\t\t\t\tdigest-data="groupDigestData" \r\n\t\t\t\t\tdata-digest-meta-info-options="digestMetaInfoOptions" \r\n\t\t\t\t\tdata-table-of-contents="tableOfContents"\r\n\t\t\t\t\tdata-table-of-contents-heading="{{tableOfContentsHeading}}"\r\n\t\t\t\t\tdata-table-id="digest_table_of_contents"\r\n\t\t\t\t\tgroup-by="groupBy"\r\n\t\t\t\t\ttemplate-for="section">\r\n\t\t\t\t</digest-table-of-contents>\r\n\t\t\t</div>\r\n\t\t\t<div class="row" data-ng-if="groupBy == \'tag\' || groupBy == \'taghierarchical\'">\r\n\t\t\t\t<digest-table-of-contents\r\n\t\t\t\t\tdigest-data="groupDigestData" \r\n\t\t\t\t\tdata-digest-meta-info-options="digestMetaInfoOptions" \r\n\t\t\t\t\tdata-table-of-contents="tableOfContents"\r\n\t\t\t\t\tdata-table-of-contents-heading="{{tableOfContentsHeading}}"\r\n\t\t\t\t\tdata-table-id="digest_table_of_contents"\r\n\t\t\t\t\tgroup-by="groupBy"\r\n\t\t\t\t\ttemplate-for="tag">\r\n\t\t\t\t</digest-table-of-contents>\r\n\t\t\t</div>\r\n\t\t</section>\r\n\t\t<br>\r\n      </div>\r\n  <div data-ng-repeat="gpDigest in ::groupDigestData" contenteditable="false" style="width: 100%;float: left;">\r\n  \t<div data-ng-if="digestFor != \'DigestDocument\' && groupBy == \'taghierarchical\'" ng-attr-id="{{getTagAsID(gpDigest.tagName)}}">\r\n\t    <div data-ng-style="::getTagStyles(gpDigest.tagName)" style="display: inline-block;height: 25px;line-height: 25px;margin: 5px;"> \r\n\t\t\t<h2 style="display: table;">\r\n\t\t\t    <span data-ng-if="tableOfContents == \'withIndex\'"\r\n\t\t\t          style="display: table-cell;padding-right: 20px;font-size: 0.8em;word-break:keep-all;">\r\n\t\t\t    \t{{gpDigest.diIndex}}\r\n\t\t\t    </span>\r\n\t\t\t\t<span style="display: table-cell;word-break:break-word;">\r\n\t\t\t\t\t{{::gpDigest.tagValLable}} \r\n<!-- \t\t\t\t\t <digest-link-to-table-of-contents \r\n\t\t\t\t  \t\tdata-ng-if="tableOfContents && tableOfContents != \'notInclude\'"\r\n\t\t\t\t  \t\ttable-id="digest_table_of_contents">\r\n\t\t\t\t     </digest-link-to-table-of-contents> -->\r\n\t\t\t\t</span>\r\n\t\t\t</h2>\r\n\t\t\t\r\n\t\t</div>\r\n\t</div>\r\n    <div data-ng-if="groupBy == \'tag\' || groupBy == \'taghierarchical\'" class="row" style="margin-left: 20px;">\r\n    \t<div data-ng-repeat="entries in ::gpDigest.entries track by $index">\r\n    \t <div data-ng-if="digestFor != \'DigestDocument\'" data-ng-attr-id="{{getTagAsID(entries.tagValue)}}">\r\n    \t\t<div data-ng-if="groupBy == \'taghierarchical\'">\r\n    \t\t<div data-ng-if="::entries.tagValLable"   style="display: inline-block;padding: 0px;margin: 0px 5px;color: #069;margin-left: 15px;">\r\n\t\t\t\t<h3 style="display: table;">\r\n\t\t\t\t  <span data-ng-if="tableOfContents == \'withIndex\'"\r\n\t\t\t\t        style="display: table-cell;padding-right: 20px;font-size: 0.8em;word-break:keep-all;">\r\n\t\t\t\t    {{gpDigest.diIndex}}.{{entries.diIndex}}\r\n\t\t\t\t  </span>\r\n\t\t\t\t  <span style="display: table-cell;word-break:break-word;">\r\n\t\t\t\t  \t{{::entries.tagValLable}}\r\n<!-- \t\t\t\t\t  <digest-link-to-table-of-contents \r\n\t\t\t\t\t  \t\tdata-ng-if="tableOfContents && tableOfContents != \'notInclude\'"\r\n\t\t\t\t\t  \t\ttable-id="digest_table_of_contents">\r\n\t\t\t\t\t  </digest-link-to-table-of-contents> -->\r\n\t\t\t\t  </span>\r\n\t\t\t\t</h3>\r\n    \t\t</div>\r\n    \t\t</div>\r\n    \t\t<div data-ng-if="groupBy == \'tag\'">\r\n    \t\t<div data-ng-if="::entries.tagValLable"  style="display: inline-block;\r\n\t\t\t\t\t    padding: 0px;\r\n\t\t\t\t\t    margin: 0px 5px;\r\n\t\t\t\t\t    color: #069;">\r\n\t\t\t\t<h2>\r\n\t\t\t\t  <span data-ng-if="tableOfContents == \'withIndex\'"\r\n\t\t\t\t        style="display: table-cell;padding-right: 20px;font-size: 0.8em;word-break:keep-all;">\r\n\t\t\t\t  \t{{entries.diIndex}}\r\n\t\t\t\t  </span>\r\n\t\t\t\t  <span style="display: table-cell;word-break:break-word;">\r\n\t\t\t\t  \t{{::entries.tagValLable}}\r\n\t\t\t\t\t\r\n<!-- \t\t\t\t\t <digest-link-to-table-of-contents \r\n\t\t\t\t  \t\tdata-ng-if="tableOfContents && tableOfContents != \'notInclude\'"\r\n\t\t\t\t  \t\ttable-id="digest_table_of_contents">\r\n\t\t\t\t  \t</digest-link-to-table-of-contents> -->\r\n\t\t\t\t  </span>\r\n\t\t\t\t</h2>\r\n    \t\t</div>\r\n    \t\t</div>\r\n    \t\t</div>\r\n    \t\t<div style="padding-left: 15px;">\r\n    \t\t\t <annotaion-digest-template \r\n\t\t\t    \tdata-digest="entries.digest" \r\n\t\t\t    \ttemplate-url="{{url}}" \r\n\t\t\t    \ttitle="false"\r\n\t\t\t    \tdata-digest-for="digestFor"\r\n\t\t\t    \tdata-digest-meta-info-options="digestMetaInfoOptions" \r\n\t\t\t    \tdata-enable-border="enableBorder" \r\n\t\t\t    \tdata-image-position="imagePosition" \r\n\t\t\t    \tdata-display-order="displayOrder"\r\n\t\t\t    \tdata-display-replies="displayReplies"\r\n\t\t\t    \tdata-set-diges-min-max-width= "digesMinMaxWidth()"\r\n\t\t\t\t\tdata-get-title-styles = "titleStyles()"\r\n\t\t\t\t\tdata-alternate-image-styles = "altImageStyles()"\r\n\t\t\t\t\tdata-set-rep-digest-styles = "repDigestStyles(digest)"\r\n\t\t\t\t\tdata-get-annotated-text = "annotatedText(annotation)"\r\n\t\t\t\t\tdata-format-created-date = "createdDate(dateValue)"\r\n\t\t\t\t\tdata-format-comment="convertComment(annotation,comment)"\r\n\t\t\t\t\tdata-comment-icon-url = "commentIconUrl">\r\n\t\t\t    </annotaion-digest-template>\r\n    \t\t</div>\r\n    \t\t\r\n    \t</div>\r\n    </div>\r\n                                             \r\n    <div data-ng-if="groupBy == \'section\'" data-ng-attr-id="{{getTagAsID(gpDigest.section)}}">\r\n\t    <div data-ng-if="digestFor != \'DigestDocument\'" class="col-xs-12" style="padding: 0px;">\r\n\t    \t<div class="col-xs-12" \r\n\t\t    \tdata-ng-style="::getTagStyles(gpDigest.section)" \r\n\t\t        style="padding: 0px;display: inline-block;height: 25px;line-height: 25px;margin: 5px;"> \r\n\t\t\t\t<h2 style="display: table;margin: 0px;">\r\n\t\t\t\t    <span data-ng-if="tableOfContents == \'withIndex\'"\r\n\t\t\t\t          style="display: table-cell;padding-right: 20px;font-size: 0.8em;word-break:keep-all;">\r\n\t\t\t\t    \t{{gpDigest.diIndex}}\r\n\t\t\t\t    </span>\r\n\t\t\t\t\t<span style="display: table-cell;word-break:break-word;">\r\n\t\t\t\t\t\t{{::gpDigest.section}} \r\n<!-- \t\t\t\t\t\t <digest-link-to-table-of-contents \r\n\t\t\t\t\t  \t\tdata-ng-if="tableOfContents && tableOfContents != \'notInclude\'"\r\n\t\t\t\t\t  \t\ttable-id="digest_table_of_contents">\r\n\t\t\t\t\t     </digest-link-to-table-of-contents> -->\r\n\t\t\t\t\t</span>\r\n\t\t\t\t</h2>\r\n\t\t\t</div>\r\n\t\t\t<div data-ng-if="gpDigest.description.length > 0" class="col-xs-12" style="padding: 0px;margin: 5px;">\r\n\t\t\t\t<span style="display: table-cell;word-break:break-word;">\r\n\t\t\t    \t{{gpDigest.description}}\r\n\t\t\t    </span>\r\n\t\t\t</div>\r\n\t    </div>\r\n\t\t<div class="row" style="margin-left: 20px;">\r\n\t    \t<div style="padding-left: 15px;">\r\n\t   \t\t\t <annotaion-digest-template \r\n\t\t\t    \tdata-digest="gpDigest.documents" \r\n\t\t\t    \ttemplate-url="{{url}}" \r\n\t\t\t    \ttitle="false"\r\n\t\t\t    \tdata-digest-for="digestFor"\r\n\t\t\t    \tdata-digest-meta-info-options="digestMetaInfoOptions" \r\n\t\t\t    \tdata-enable-border="enableBorder" \r\n\t\t\t    \tdata-image-position="imagePosition" \r\n\t\t\t    \tdata-display-order="displayOrder"\r\n\t\t\t    \tdata-display-replies="displayReplies"\r\n\t\t\t    \tdata-set-diges-min-max-width= "digesMinMaxWidth()"\r\n\t\t\t\t\tdata-get-title-styles = "titleStyles()"\r\n\t\t\t\t\tdata-alternate-image-styles = "altImageStyles()"\r\n\t\t\t\t\tdata-set-rep-digest-styles = "repDigestStyles(digest)"\r\n\t\t\t\t\tdata-get-annotated-text = "annotatedText(annotation)"\r\n\t\t\t\t\tdata-format-created-date = "createdDate(dateValue)"\r\n\t\t\t\t\tdata-format-comment="convertComment(annotation,comment)"\r\n\t\t\t\t\tdata-comment-icon-url = "commentIconUrl" \r\n\t\t\t\t\tdata-group-by-index = "gpDigest.diIndex">\r\n\t\t\t    </annotaion-digest-template>\r\n\t   \t\t</div>\r\n\t    </div>\r\n    </div>\r\n  </div>\r\n\t\r\n\t<div style="border-top: 3px solid #069; width: 100%; float: left;margin-top: -3px;"></div>\r\n\t<div data-ng-if="numiciImage.length>0 && numiciFooterText.length>0" contenteditable="false"\r\n  \t\tstyle="width: 100%; height: 30px; line-height: 30px; justify-content: center; display: flex; padding-top: 15px;">\r\n\t\t<a data-ng-href="{{numiciLink}}" target="_blank" style="text-decoration: none !important;">\r\n\t\t\t<img data-ng-src="{{numiciImage}}"\r\n\t\t\t     style="width: 30px;">\r\n\t\t</a>\r\n\t\t<a data-ng-href="{{numiciLink}}" target="_blank" role="button"\r\n\t\t\tstyle="color: #069; font-size: 20px; font-weight: 500; margin-left: 6px; text-decoration: none !important;">\r\n\t\t\t{{numiciFooterText}}</a>\r\n\t</div>\r\n\t\r\n</div>');
$templateCache.put('apppublic/components/PublicAnnotationDigest/digest-root.tpl.html','<!DOCTYPE html>\r\n<html>\r\n<head>\r\n<!-- <base href="/"> -->\r\n<meta http-equiv="Content-Type" content="text/html;charset=UTF-8" />\r\n<style>\r\n@media print {\r\n    @page {\r\n\t margin: 10mm 0mm;\r\n\t size : A4 portrait;\r\n\t }\r\n\t \r\n\t.drc {\r\n\t    width: 100%;\r\n\t    max-width : 100%;\r\n\t\tfont-family: sans-serif;\r\n\t\tcolor: #333;\r\n\t\tword-break: break-word;\r\n\t\tline-height: 1.5;\r\n\t\tfont-size: 16px;\r\n\t}\r\n}\r\n</style>\r\n</head>\r\n<body class="body">\r\n\t<!--maildata-->\r\n\t<!--digestdata-->\r\n</body>\r\n</html>\r\n');
$templateCache.put('apppublic/components/PublicAnnotationDigest/digest-title-tmpl.html','<div class="row" contenteditable="false" style="text-align: center;">\r\n\t<h4 data-ng-style="titleStyles()">\r\n   \t\t{{title}}\r\n\t</h4>\r\n</div>');
$templateCache.put('apppublic/components/PublicAnnotationDigest/image-full-tmpl.html','<div data-docInfo="" class="row">\r\n\t<h4 data-ng-style="::titleStyles()"\r\n\t\tdata-ng-if="digestFor != \'DigestDocument\' && digestMetaInfoOptions.documentName">\r\n\t\t<a data-ng-href="{{::digest.link}}" target="_blank"\r\n\t\t\tdata-tooltip-append-to-body="true"\r\n\t\t\tdata-uib-tooltip="{{::digest.displayName}}" role="button"\r\n\t\t\tstyle="color: #069; text-decoration: none !important;">\r\n\t\t\t{{::digest.displayName}} </a>\r\n\t</h4>\r\n\r\n\t<div class="row meta-info-description" \r\n\t\tdata-ng-if="digest.description && digestMetaInfoOptions.description"\r\n\t\tdata-ng-bind-html="digest.description | to_trusted" \r\n\t\tdata-ng-style="{\'margin\': digestFor == \'DigestDocument\' ? \'1em 0em 0em\' : \'0em\'}">\r\n\t</div>\r\n\t<div class="markdown-body row meta-info-note-content"\r\n\t\tdata-ng-if="digest.documentType == \'Notes\' && digest.content" \r\n\t\tdata-ng-bind-html="digest.content | to_trusted" \r\n\t\tdata-ng-style="{\'margin\': digestFor == \'DigestDocument\' ? \'1em 0em 0em\' : \'0em\'}">\r\n\t</div>\r\n\t<div class="row meta-info-publisher" data-ng-if="digest.website">\r\n\t\t<span class="meta-info-publisher-name"\r\n\t\t\tdata-ng-if="digestMetaInfoOptions.websiteName"> <span\r\n\t\t\tclass="name" data-ng-if="!digest.url"> {{::digest.website}} </span> <a\r\n\t\t\tdata-ng-if="digest.url" class="name" data-ng-href="{{::digest.url}}"\r\n\t\t\ttarget="_blank" data-tooltip-append-to-body="true"\r\n\t\t\tdata-uib-tooltip="{{::digest.url}}"\r\n\t\t\tstyle="color: #069; text-decoration: none !important;">\r\n\t\t\t\t{{::digest.website}} </a>\r\n\t\t</span>\r\n\t</div>\r\n\t<div class="row"\r\n\t\tdata-ng-if="digest.tags && digestMetaInfoOptions.documentTags">\r\n\t\t<span data-ng-repeat="tag in ::digest.tags track by $index"\r\n\t\t\tstyle="display: inline-block; height: 25px; line-height: 25px; background: #069; padding: 0px 10px; margin: 5px; color: #fff;">\r\n\t\t\t{{tag}} </span>\r\n\t</div>\r\n</div>\r\n<div class="row" style="margin: 10px 0px;">\r\n\t<a data-ng-href="{{::digest.link}}" target="_blank"> <img\r\n\t\tclass="image" data-ng-src="{{::digest.imageUrl}}"\r\n\t\tonerror="this.parentElement.parentElement.style.display=\'none\';"\r\n\t\talt="Image not found..." align="middle"\r\n\t\tdata-ng-if="digest.imageUrl && digestMetaInfoOptions.image"\r\n\t\tstyle="width: 100%; position: relative; display: block; max-height: 339px; object-fit: cover; object-position: center top;"\r\n\t\tdata-ng-style="::altImageStyles(digest)" data-cke-real-node-type="1"\r\n\t\tdata-track-changes-ignore="true" data-cke-editable="false"\r\n\t\tcontenteditable="false" />\r\n\t</a>\r\n</div>');
$templateCache.put('apppublic/components/PublicAnnotationDigest/image-left-tmpl.html','\r\n<table data-docInfo="" border="0" width="610" style="width: 610px;max-width: 100%;min-width: 100%;">\r\n\t<tr>\r\n\t\t<td data-ng-if="digest.imageUrl && digestMetaInfoOptions.image"\r\n\t\t\twidth="210" style="width: 210px;">\r\n\t\t\t<div>\r\n\t\t\t\t<a data-ng-href="{{::digest.link}}" target="_blank"> <img\r\n\t\t\t\t\tdata-ng-src="{{digest.imageUrl}}"\r\n\t\t\t\t\tonerror="this.parentElement.parentElement.parentElement.style.display=\'none\';"\r\n\t\t\t\t\talt="Image not found..." align="left"\r\n\t\t\t\t\tstyle="width: 100%; display: block; max-height: 139px; object-fit: cover; object-position: center top;"\r\n\t\t\t\t\tdata-ng-style="::altImageStyles(digest)"\r\n\t\t\t\t\tdata-cke-real-node-type="1" data-track-changes-ignore="true"\r\n\t\t\t\t\tdata-cke-editable="false" contenteditable="false" width="200"\r\n\t\t\t\t\theight="139" />\r\n\t\t\t\t</a>\r\n\t\t\t</div>\r\n\t\t</td>\r\n\t\t<td\r\n\t\t\tdata-ng-attr-width="{{digest.imageUrl && digestMetaInfoOptions.image ? \'400\' : \'610\'}}"\r\n\t\t\tdata-ng-style="{width: digest.imageUrl && digestMetaInfoOptions.image ? \'400px\' : \'610px\'}">\r\n\t\t\t<div class="content" style="width: calc(100% - 1em);" data-ng-style="{margin: digest.imageUrl && digestMetaInfoOptions.image ? \'1em\' : \'1em 0em\'}">\r\n\t\t\t\t<h4 data-ng-style="::titleStyles()"\r\n\t\t\t\t\tstyle="display: table; color: #069;"\r\n\t\t\t\t\tdata-ng-if="digestFor != \'DigestDocument\' && digestMetaInfoOptions.documentName">\r\n\r\n\t\t\t\t\t<span data-ng-if="tableOfContents == \'withIndex\'"\r\n\t\t\t\t\t\tstyle="display: table-cell; padding-right: 15px; font-size: 0.8em; word-break: keep-all;">\r\n\t\t\t\t\t\t{{digest.diIndex}} </span> <span\r\n\t\t\t\t\t\tstyle="display: table-cell; word-break: break-word;"> <a\r\n\t\t\t\t\t\tdata-ng-href="{{::digest.link}}" target="_blank"\r\n\t\t\t\t\t\tdata-tooltip-append-to-body="true"\r\n\t\t\t\t\t\tdata-uib-tooltip="{{::digest.displayName}}" role="button"\r\n\t\t\t\t\t\tstyle="color: #069; text-decoration: none !important;">\r\n\t\t\t\t\t\t\t{{::digest.displayName}} </a> <!-- <digest-link-to-table-of-contents\r\n\t\t\t\t\t\t\tdata-ng-if="tableOfContents && tableOfContents != \'notInclude\'"\r\n\t\t\t\t\t\t\ttable-id="digest_table_of_contents">\r\n\t\t\t\t\t\t</digest-link-to-table-of-contents> -->\r\n\t\t\t\t\t</span>\r\n\t\t\t\t</h4>\r\n\r\n\t\t\t\t<div class="row meta-info-description"\r\n\t\t\t\t\tdata-ng-if="digest.description && digestMetaInfoOptions.description" \r\n\t\t\t\t\tdata-ng-bind-html="digest.description | to_trusted" \r\n\t\t\t\t\tdata-ng-style="{\'margin\': digestFor == \'DigestDocument\' ? \'1em 0em 0em\' : \'0em\'}">\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class="markdown-body row meta-info-note-content"\r\n\t\t\t\t\tdata-ng-if="digest.documentType == \'Notes\' && digest.content" \r\n\t\t\t\t\tdata-ng-bind-html="digest.content | to_trusted" \r\n\t\t\t\t\tdata-ng-style="{\'margin\': digestFor == \'DigestDocument\' ? \'1em 0em 0em\' : \'0em\'}">\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class="row meta-info-publisher" data-ng-if="digest.website">\r\n\t\t\t\t\t<span class="meta-info-publisher-name"\r\n\t\t\t\t\t\tdata-ng-if="digestMetaInfoOptions.websiteName"> <span\r\n\t\t\t\t\t\tclass="name" data-ng-if="!digest.url"> {{::digest.website}}\r\n\t\t\t\t\t</span> <a data-ng-if="digest.url" class="name"\r\n\t\t\t\t\t\tdata-ng-href="{{::digest.url}}" target="_blank"\r\n\t\t\t\t\t\tdata-tooltip-append-to-body="true"\r\n\t\t\t\t\t\tdata-uib-tooltip="{{::digest.url}}"\r\n\t\t\t\t\t\tstyle="color: #069; text-decoration: none !important;">\r\n\t\t\t\t\t\t\t{{::digest.website}} </a>\r\n\t\t\t\t\t</span>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class="row"\r\n\t\t\t\t\tdata-ng-if="digest.tags && digestMetaInfoOptions.documentTags">\r\n\t\t\t\t\t<span data-ng-repeat="tag in ::digest.tags track by $index"\r\n\t\t\t\t\t\tstyle="display: inline-block; height: 25px; line-height: 25px; background: #069; padding: 0px 10px; margin: 5px; color: #fff;">\r\n\t\t\t\t\t\t{{tag}} </span>\r\n\t\t\t\t</div>\r\n\t\t\t</div>\r\n\t\t</td>\r\n\t</tr>\r\n</table>\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n');
$templateCache.put('apppublic/components/PublicAnnotationDigest/image-right-tmpl.html','\r\n<table data-docInfo="" border="0" width="610" style="width: 610px;max-width: 100%;min-width: 100%;">\r\n\t<tr>\r\n\t\t<td\r\n\t\t\tdata-ng-attr-width="{{digest.imageUrl && digestMetaInfoOptions.image ? \'400\' : \'610\'}}"\r\n\t\t\tdata-ng-style="{width: digest.imageUrl && digestMetaInfoOptions.image ? \'400px\' : \'610px\'}">\r\n\t\t\t<div style="width: calc(100% - 1em);" data-ng-style="{margin: digest.imageUrl && digestMetaInfoOptions.image ? \'1em 1em 1em 0em\' : \'1em 0em\'}">\r\n\t\t\t\t<h4 data-ng-style="::titleStyles()"\r\n\t\t\t\t\tdata-ng-if="digestFor != \'DigestDocument\' && digestMetaInfoOptions.documentName">\r\n\t\t\t\t\t<a data-ng-href="{{::digest.link}}" target="_blank"\r\n\t\t\t\t\t\tdata-tooltip-append-to-body="true"\r\n\t\t\t\t\t\tdata-uib-tooltip="{{::digest.displayName}}" role="button"\r\n\t\t\t\t\t\tstyle="color: #069; text-decoration: none !important;">\r\n\t\t\t\t\t\t{{::digest.displayName}} </a>\r\n\t\t\t\t</h4>\r\n\r\n\t\t\t\t<div class="row meta-info-description"\r\n\t\t\t\t\tdata-ng-if="digest.description && digestMetaInfoOptions.description"\r\n\t\t\t\t\tdata-ng-bind-html="digest.description | to_trusted" \r\n\t\t\t\t\tdata-ng-style="{\'margin\': digestFor == \'DigestDocument\' ? \'1em 0em 0em\' : \'0em\'}">\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class="markdown-body row meta-info-note-content"\r\n\t\t\t\t\tdata-ng-if="digest.documentType == \'Notes\' && digest.content" \r\n\t\t\t\t\tdata-ng-bind-html="digest.content | to_trusted" \r\n\t\t\t\t\tdata-ng-style="{\'margin\': digestFor == \'DigestDocument\' ? \'1em 0em 0em\' : \'0em\'}">\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class="row meta-info-publisher" data-ng-if="digest.website">\r\n\t\t\t\t\t<span class="meta-info-publisher-name"\r\n\t\t\t\t\t\tdata-ng-if="digestMetaInfoOptions.websiteName"> <span\r\n\t\t\t\t\t\tclass="name" data-ng-if="!digest.url"> {{::digest.website}}\r\n\t\t\t\t\t</span> <a data-ng-if="digest.url" class="name"\r\n\t\t\t\t\t\tdata-ng-href="{{::digest.url}}" target="_blank"\r\n\t\t\t\t\t\tdata-tooltip-append-to-body="true"\r\n\t\t\t\t\t\tdata-uib-tooltip="{{::digest.url}}"\r\n\t\t\t\t\t\tstyle="color: #069; text-decoration: none !important;">\r\n\t\t\t\t\t\t\t{{::digest.website}} </a>\r\n\t\t\t\t\t</span>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class="row"\r\n\t\t\t\t\tdata-ng-if="digest.tags && digestMetaInfoOptions.documentTags">\r\n\t\t\t\t\t<span data-ng-repeat="tag in ::digest.tags track by $index"\r\n\t\t\t\t\t\tstyle="display: inline-block; height: 25px; line-height: 25px; background: #069; padding: 0px 10px; margin: 5px; color: #fff;">\r\n\t\t\t\t\t\t{{tag}} </span>\r\n\t\t\t\t</div>\r\n\t\t\t</div>\r\n\t\t</td>\r\n\t\t<td data-ng-if="digest.imageUrl && digestMetaInfoOptions.image"\r\n\t\t\twidth="210" style="width: 210px;">\r\n\t\t\t<div>\r\n\t\t\t\t<a data-ng-href="{{::digest.link}}" target="_blank"> <img\r\n\t\t\t\t\tdata-ng-src="{{::digest.imageUrl}}"\r\n\t\t\t\t\tonerror="this.parentElement.parentElement.parentElement.style.display=\'none\';"\r\n\t\t\t\t\talt="Image not found..." align="{{::imagePosition}}"\r\n\t\t\t\t\tstyle="width: 100%; display: block; max-height: 139px; object-fit: cover; object-position: center top;"\r\n\t\t\t\t\tdata-ng-style="::altImageStyles(digest)"\r\n\t\t\t\t\tdata-cke-real-node-type="1" data-track-changes-ignore="true"\r\n\t\t\t\t\tdata-cke-editable="false" contenteditable="false" width="200"\r\n\t\t\t\t\theight="139" />\r\n\t\t\t\t</a>\r\n\t\t\t</div>\r\n\t\t</td>\r\n\t</tr>\r\n</table>\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n');
$templateCache.put('apppublic/components/PublicAnnotationDigest/publicdigest.tmpl.html','<div class="container-fluid full">\r\n\t<div class="full public-digest-viewer">\r\n\t    <div class="full" \r\n\t\t data-ng-if="pdc.loader"\r\n\t\t style="position: absolute;width: 100%;z-index: 1;background: #777777a1;">\r\n\t\t\t <div style="position: relative;height: 45px;line-height: 45px;text-align: center;color: #fff;background: #069;">\r\n\t\t\t \tLoading ...\r\n\t\t\t </div>\r\n\t\t</div>\r\n\t\t<div class="col-xs-12 digest-content-wrap" \r\n\t\t\tstyle="height: 100%;background: #fff;overflow:hidden;">\r\n\t\t\t<div class="col-xs-12" style="background: #fff;height: 50px; line-height: 50px; padding: 0px 100px;">\r\n\t\t\t\t<div class="col-xs-8" style="font-size: 20px; color: #aaa;float: left;margin: 0px;">\r\n\t\t\t\t\t<div style="width: 100%; height: 50px; line-height: 50px; float: left; contenteditable="false">\r\n\t\t\t\t\t\t<a data-ng-href="{{pdc.numiciLink}}" target="_blank" style="float: left; text-decoration: none !important;">\r\n\t\t\t\t\t\t\t<img data-ng-src="{{pdc.numiciImage}}"\r\n\t\t\t\t\t\t\t     style="width: 30px; max-height: 30px; margin: 0px !important;">\r\n\t\t\t\t\t\t</a>\r\n\t\t\t\t\t\t<a data-ng-href="{{pdc.numiciLink}}" target="_blank" role="button"\r\n\t\t\t\t\t\t\tstyle="color: #069; font-size: 16px; font-weight: 500; margin-left: 6px; text-decoration: none !important;">\r\n\t\t\t\t\t\t\t{{pdc.numiciHeaderText}}</a>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class="col-xs-4" style="display: inline-block;float: right;height: 50px; line-height: 50px;">\r\n\t\t\t\t\t <i class="fa fa-refresh" \r\n\t\t\t\t    aria-hidden="true" \r\n\t\t\t\t    data-ng-click="pdc.udpdateDigest()"\r\n\t\t\t\t    data-ng-if="pdc.hasDigestUpdates"\r\n\t\t\t\t    data-tooltip-append-to-body="true" \r\n\t\t\t\t\tdata-tooltip-placement="left"\r\n\t\t\t\t    data-uib-tooltip="{{pdc.digestUpdateTitle}}" \r\n\t\t\t\t    style="color: red;font-size: 23px; float: right; height: 50px; line-height: 50px;"></i>\r\n\t\t\t\t</div>\r\n\t\t\t</div>\r\n\t\t\t<div class="col-xs-12 vdst" style="padding:0px; background: #fff;height: calc(100% - 50px)"></div>\r\n\t\t</div>\r\n\t</div>\r\n\t<button data-ng-click="pdc.topFunction()" class="vdvc-scroll-top"\r\n\t\tdata-tooltip-append-to-body="true" \r\n\t\tdata-tooltip-placement="top"\r\n\t\tdata-uib-tooltip="Go to top of the Digest">\r\n\t\t<i class="fa fa-chevron-up" aria-hidden="true"></i>\r\n\t</button>\r\n</div>');
$templateCache.put('apppublic/components/PublicAnnotationDigest/publicdigesthtml.tmpl.html','<div class="container-fluid full">\r\n\t<div class="full public-digest-viewer">\r\n\t\t<div class="full" data-ng-if="pdc.loader"\r\n\t\t\tstyle="position: absolute; width: 100%; z-index: 1; background: #777777a1;">\r\n\t\t\t<div\r\n\t\t\t\tstyle="position: relative; height: 45px; line-height: 45px; text-align: center; color: #fff; background: #069;">\r\n\t\t\t\tLoading ...</div>\r\n\t\t</div>\r\n\t\t<div class="col-xs-12 digest-content-wrap"\r\n\t\t\tstyle="height: 100%; background: #fff; overflow: hidden; padding-bottom: 10px;">\r\n\t\t\t<div class="col-xs-12"\r\n\t\t\t\tstyle="background: #fff; height: 50px; line-height: 50px; padding: 0px 10px;">\r\n\t\t\t\t<div class="col-xs-8"\r\n\t\t\t\t\tstyle="font-size: 20px; color: #aaa; float: left; margin: 0px;">\r\n\t\t\t\t\t<div\r\n\t\t\t\t\t\tstyle="width: 100%; height: 50px; line-height: 50px; float: left;"false">\r\n\t\t\t\t\t\t<a data-ng-href="{{pdc.numiciLink}}" target="_blank"\r\n\t\t\t\t\t\t\tstyle="float: left; text-decoration: none !important;"> <img\r\n\t\t\t\t\t\t\tdata-ng-src="{{pdc.numiciImage}}"\r\n\t\t\t\t\t\t\tstyle="width: 30px; max-height: 30px; margin: 0px !important;">\r\n\t\t\t\t\t\t</a> <a data-ng-href="{{pdc.numiciLink}}" target="_blank"\r\n\t\t\t\t\t\t\trole="button"\r\n\t\t\t\t\t\t\tstyle="color: #069; font-size: 16px; font-weight: 500; margin-left: 6px; text-decoration: none !important;">\r\n\t\t\t\t\t\t\t{{pdc.numiciHeaderText}}</a>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class="col-xs-4"\r\n\t\t\t\t\tstyle="display: inline-block; float: right; height: 50px; line-height: 50px;">\r\n\t\t\t\t\t<i class="fa fa-refresh" aria-hidden="true"\r\n\t\t\t\t\t\tdata-ng-click="pdc.udpdateDigest()"\r\n\t\t\t\t\t\tdata-ng-if="pdc.hasDigestUpdates"\r\n\t\t\t\t\t\tdata-tooltip-append-to-body="true" data-tooltip-placement="left"\r\n\t\t\t\t\t\tdata-uib-tooltip="{{pdc.digestUpdateTitle}}"\r\n\t\t\t\t\t\tstyle="color: red; font-size: 23px; float: right; height: 50px; line-height: 50px;"></i>\r\n\t\t\t\t</div>\r\n\t\t\t</div>\r\n\t\t\t<div class="col-xs-12 vdst"\r\n\t\t\t\tstyle="padding: 8px 0px; background: rgb(255, 255, 255); height: calc(100% - 50px); overflow-y: auto;"></div>\r\n\t\t</div>\r\n\t</div>\r\n\t<button data-ng-click="pdc.topFunction()" class="vdvc-scroll-top"\r\n\t\tdata-tooltip-append-to-body="true" data-tooltip-placement="top"\r\n\t\tdata-uib-tooltip="Go to top of the Digest">\r\n\t\t<i class="fa fa-chevron-up" aria-hidden="true"></i>\r\n\t</button>\r\n</div>');
$templateCache.put('apppublic/components/PublicAnnotationDigest/tbc-default-tmpl.html','<div></div>');
$templateCache.put('apppublic/components/PublicAnnotationDigest/tbc-doc-tmpl.html','<div class="row" data-ng-if="tableOfContents && tableOfContents != \'notInclude\'" data-ng-attr-id="{{tableId}}" style="border-bottom: 1px solid #aaa;padding-bottom: 20px;">\r\n  <div style="font-size: 18px;color: #069;padding: 10px 0px;font-weight: bold;font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol;">\r\n\t{{title}}\r\n  </div>\r\n  <div  data-ng-repeat="digest in digestData track by $index"\r\n        data-ng-style="::getTblOfContListStyles()">\r\n     <span data-ng-if="tableOfContents == \'withIndex\'"\r\n           data-ng-style="::getTblOfContIndexStyles()">\r\n\t\t {{digest.diIndex}}.\r\n\t </span>\r\n  \t <span data-ng-style="::getTblOfContLableStyles()">\r\n\t\t <a data-ng-href="#index_{{$index}}" data-ng-style="::getTblOfContLinkStyles()">{{::digest.displayName}}</a>\r\n\t</span>\r\n  </div>\r\n</div>');
$templateCache.put('apppublic/components/PublicAnnotationDigest/tbc-sec-tmpl.html','<div class="row" data-ng-if="tableOfContents && tableOfContents != \'notInclude\'"\r\n\tdata-ng-attr-id="{{tableId}}"\r\n\tstyle="border-bottom: 1px solid #aaa;padding-bottom: 20px;">\r\n\t<div style="font-size: 18px; color: #069; padding: 10px 0px; font-weight: bold; font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol;">\r\n\t\t{{title}}\r\n\t</div>\r\n\t\r\n\t\r\n\t<div style="margin-left: 30px;">\r\n\t\t<div data-ng-repeat="gpDigest in ::digestData track by $index"\r\n\t\t     contenteditable="false" style="color: #069; font-size: 18px;display:table;">\r\n\t\t\t<div class="row">\r\n\t\t\t\t<span data-ng-if="tableOfContents == \'withIndex\'" \r\n\t\t\t        data-ng-style="::getTblOfContIndexStyles()">\r\n\t\t\t    \t{{gpDigest.diIndex}}\r\n\t\t\t    </span>\r\n\t\t\t\t<span data-ng-style="::getTblOfContLableStyles()">\r\n\t\t\t\t\t<a data-ng-href="#{{getTagAsID(gpDigest.section)}}"\r\n\t\t\t\t\t   data-ng-style="::getTblOfContLinkStyles()">\r\n\t\t\t\t\t\t{{::gpDigest.section}}\r\n\t\t\t\t\t</a>\r\n\t\t\t\t</span>\r\n\t\t\t</div>\r\n\t\t\t<div class="row" style="margin-left: 45px;">\r\n\t\t\t\t<div data-ng-repeat="document in ::gpDigest.documents track by $index"\r\n\t\t\t\t    data-ng-if="::document.displayName"\r\n\t\t\t\t    style="display: table;">\r\n\t\t\t\t    <span data-ng-if="tableOfContents == \'withIndex\'" \r\n\t\t\t\t          data-ng-style="::getTblOfContIndexStyles()">\r\n\t\t\t\t    \t{{gpDigest.diIndex}}.{{document.diIndex}}\r\n\t\t\t\t    </span>\r\n\t\t\t\t\t<span data-ng-style="::getTblOfContLableStyles()" style="cursor: default;">\r\n\t\t\t\t\t\t<a data-ng-href="#index_{{gpDigest.diIndex}}_{{$index}}"\r\n\t\t\t\t\t\t   data-ng-style="::getTblOfContLinkStyles()">\r\n\t\t\t\t\t\t\t{{::document.displayName}} \r\n\t\t\t\t\t\t</a>\r\n\t\t\t\t\t\t<!-- {{::document.displayName}} -->\r\n\t\t\t\t\t</span>\r\n\t\t\t\t</div>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t</div>\r\n\t\r\n\r\n</div>');
$templateCache.put('apppublic/components/PublicAnnotationDigest/tbc-tag-tmpl.html','\r\n<div class="row" data-ng-if="tableOfContents && tableOfContents != \'notInclude\'"\r\n\tdata-ng-attr-id="{{tableId}}"\r\n\tstyle="border-bottom: 1px solid #aaa;padding-bottom: 20px;">\r\n\t<div style="font-size: 18px; color: #069; padding: 10px 0px; font-weight: bold; font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol;">\r\n\t\t{{title}}\r\n\t</div>\r\n\r\n\t<div data-ng-if="groupBy == \'taghierarchical\'">\r\n\t\t<div style="margin-left: 30px;">\r\n\t\t\t<div data-ng-repeat="gpDigest in ::digestData track by $index"\r\n\t\t\t\t contenteditable="false"\r\n\t\t\t\t style="color: #069; font-size: 18px;">\r\n\t\t\t\t<div data-ng-style="::getTblOfContListStyles()">\r\n\t\t\t\t\t<span data-ng-if="tableOfContents == \'withIndex\'"\r\n\t\t\t\t\t      data-ng-style="::getTblOfContIndexStyles()">\r\n\t\t\t\t\t\t{{gpDigest.diIndex}}\r\n\t\t\t\t\t</span>\r\n\t\t\t\t\t<span data-ng-style="::getTblOfContLableStyles()">\r\n\t\t\t\t\t\t<a data-ng-href="#{{getTagAsID(gpDigest.tagName)}}"\r\n\t\t\t\t\t\t   data-ng-style="::getTblOfContLinkStyles()">{{::gpDigest.tagValLable}}</a>\r\n\t\t\t\t\t</span>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div  style="margin-left: 30px;">\r\n\t\t\t\t\t<div data-ng-repeat="entries in ::gpDigest.entries track by $index"\r\n\t\t\t\t\t    data-ng-if="::entries.tagValLable"\r\n\t\t\t\t\t    data-ng-style="::getTblOfContListStyles()">\r\n\t\t\t\t\t    <span data-ng-if="tableOfContents == \'withIndex\'" \r\n\t\t\t\t\t          data-ng-style="::getTblOfContIndexStyles()">\r\n\t\t\t\t\t    \t{{gpDigest.diIndex}}.{{entries.diIndex}}\r\n\t\t\t\t\t    </span>\r\n\t\t\t\t\t\t<span data-ng-style="::getTblOfContLableStyles()">\r\n\t\t\t\t\t\t\t<a data-ng-href="#{{getTagAsID(entries.tagValue)}}"\r\n\t\t\t\t\t\t\t   data-ng-style="::getTblOfContLinkStyles()">\r\n\t\t\t\t\t\t\t\t{{::entries.tagValLable}} \r\n\t\t\t\t\t\t\t</a>\r\n\t\t\t\t\t\t</span>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</div>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t</div>\r\n\r\n\t<div data-ng-if="groupBy == \'tag\'">\r\n\t\t<div style="margin-left: 30px;">\r\n\t\t\t<div data-ng-repeat="gpDigest in ::digestData track by $index"\r\n\t\t\t     contenteditable="false">\r\n\t\t\t\t<div data-ng-repeat="entries in ::gpDigest.entries track by $index" \r\n\t\t\t\t    data-ng-if="::entries.tagValLable"\r\n\t\t\t\t    style="color: #069; font-size: 18px;display:table;">\r\n\t\t\t\t    <span  data-ng-if="tableOfContents == \'withIndex\'" \r\n\t\t\t\t           data-ng-style="::getTblOfContIndexStyles()">\r\n\t\t\t\t    \t{{entries.diIndex}}\r\n\t\t\t\t    </span>\r\n\t\t\t\t\t<span data-ng-style="::getTblOfContLableStyles()">\r\n\t\t\t\t\t\t<a data-ng-href="#{{getTagAsID(entries.tagValue)}}"\r\n\t\t\t\t\t\t   data-ng-style="::getTblOfContLinkStyles()">\r\n\t\t\t\t\t\t\t{{::entries.tagValLable}}\r\n\t\t\t\t\t\t</a>\r\n\t\t\t\t\t</span>\r\n\t\t\t\t</div>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t</div>\r\n\r\n</div>');
$templateCache.put('apppublic/components/PublicDocViewer/annotation.tmpl.html','\t<div class="row vdvc_comment" \r\n\t\t\tdata-ng-class="annotation.uid" \r\n\t\t\tdata-ng-attr-data-id="{{annotation.id}}" \r\n\t\t\tdata-ng-attr-data-rid="{{annotation.resourceName}}" \r\n\t\t \tdata-on-outside-element-click="onOutClickComment()"   \r\n\t\t \tdata-ng-style="{\'top\': annotation.top}" \r\n\t\t \tdata-uib-popover-template="linkUIProperties.templateUrl"\r\n\t\t\tdata-popover-is-open="annotation.showDeepLink"\r\n\t\t\tdata-popover-placement="auto"\r\n\t\t\tdata-popover-trigger="linkUIProperties.trigger"\r\n\t\t\tdata-popover-class="annotation-deep-link-info"\r\n\t\t\tdata-popover-append-to-body=\'true\'>\r\n\t\t\t<!-- <div class="ellipsis comment-hdr col-xs-12" data-ng-click="onClickComment($event,annotation)"> -->\r\n\t\t \t<div class="col-xs-12" data-ng-click="onClickComment($event,annotation)" style="padding: 25px 10px;">\r\n\t\t\t\t<div class="row">\r\n\t\t\t\t\t<div class="row"\r\n\t\t\t\t\t\t data-ng-if="!hasFormatedText(annotation)"\r\n\t\t\t\t\t     data-ng-bind-html="::annotation.Commentedtext | to_trusted" \r\n\t\t\t\t\t     data-tooltip-append-to-body="true" \r\n\t\t\t\t\t\t data-uib-tooltip-html ="::annotation.Commentedtext | to_trusted" \r\n\t\t\t\t\t     style="width: calc(100% - 75px);float: left;">\r\n\t\t\t\t\t</div>\r\n\t\t\t\t\t\r\n\t\t\t\t\t<markdown-to-html class="markdown-body" data-ng-if="hasFormatedText(annotation)" data-text="annotation.formatedText" data-annotation="annotation"></markdown-to-html>\r\n\t\t\t\t\t\r\n\t\t\t\t\t<div class="row" style="position: absolute;top: 5px;right: 5px;height: 20px;">\r\n\t\t\t\t\t\t<span class="annot-deep-link btn" \r\n\t\t\t\t\t\t\tdata-ng-show="isDocSharable(doc)" \r\n\t\t\t\t\t\t\tdata-ng-class="{\'disabled\': !isDocSharable(doc),\'active\': annotation.showDeepLink}" \r\n\t\t\t\t\t\t\tdata-ng-click="isDocSharable(doc) && getDocAnnotationLink(doc,annotation)" \r\n\t\t\t\t\t\t\tdata-tooltip-append-to-body=\'true\'\r\n\t\t\t\t\t\t\tdata-uib-tooltip="Share Annotation">\r\n\t\t\t\t\t\t\t<i class="fa fa-link fa-fw"></i>\r\n\t\t\t\t\t    </span>\r\n\t\t\t\t\t    <span class="btn annot-deep-link" \r\n\t\t\t\t\t\t\tdata-ng-if="doc.webResource"\r\n\t\t\t\t\t\t\tdata-ng-click="openCommentIncontext($event,annotation)"\r\n\t\t\t\t\t\t\tdata-tooltip-append-to-body=\'true\'\r\n\t\t\t\t\t\t\tdata-uib-tooltip="open comment in context">\r\n\t\t\t\t\t\t\t<i class="fa fa-long-arrow-up fa-fw" style="transform: rotate(45deg);"></i>\r\n\t\t\t\t\t    </span>\r\n\t\t\t\t\t    <span data-ng-if="canEditdocAnnotation(annotation)" \r\n\t\t\t\t\t    \tclass="annot-deep-link btn" \r\n\t\t\t\t\t\t\tdata-ng-click="deleteAnnotation(annotation,$event)" \r\n\t\t\t\t\t\t\tdata-tooltip-append-to-body=\'true\' \r\n\t\t\t\t\t\t\tdata-uib-tooltip="delete annotation">\r\n\t\t\t\t\t\t\t<i class="fa fa-trash-o fa-fw"></i>\r\n\t\t\t\t\t    </span>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</div>\r\n\t\t\t</div>\r\n\t\t \t<div class=\'comment-crd\' data-ng-click="onClickComment($event)">\r\n\t\t\t\t<div class=\'comment-conv\'>\r\n\t\t\t\t\t<div class="row comment-conv-wrap" \r\n\t\t\t\t\t\tdata-ng-attr-data-convId="{{annotation.id}}"\r\n\t\t\t\t\t\tdata-ng-show="!hasRootComment(annotation) && annotation.userName">\r\n\t\t\t\t\t\t<div class="col-xs-2">\r\n\t\t\t\t\t\t\t<div class=\'vdvc-circle\' data-tooltip-append-to-body=\'true\'\r\n\t\t\t\t\t\t\t\tdata-uib-tooltip="{{::annotation.userName}}">{{::getUserlabel(annotation.userName) | truncate: 2}}</div>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t<div class="col-xs-10">\r\n\t\t\t\t\t\t\t<div class="col-xs-12 text-muted" style="width: calc(100% - 20px);padding: 0px;margin-top: 5px;font-size: 10px;"> \r\n\t\t\t\t\t\t\t\t<span>{{::annotation.userName}} | </span> <span data-am-time-ago=\'annotation.createdOn\'></span>\r\n\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t<div class="col-xs-12" style="border-bottom: 1px solid #ccc;margin-top: 10px;"></div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t\t<div class="row comment-conv-wrap" data-ng-repeat="conv in annotation.conversations | orderBy:\'createdOn\':false track by conv.id"\r\n\t\t\t\t\t\tdata-ng-attr-data-convId="{{conv.id}}">\r\n\t\t\t\t\t\t<div class="col-xs-2" data-ng-show="conv.userName">\r\n\t\t\t\t\t\t\t<div class=\'vdvc-circle\' data-tooltip-append-to-body=\'true\'\r\n\t\t\t\t\t\t\t\tdata-uib-tooltip="{{::conv.userName}}">{{::getUserlabel(conv.userName) | truncate: 2 }}</div>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t<div class="col-xs-10" >\r\n\t\t\t\t\t\t\t<form data-editable-form name="editcommentForm">\r\n\t\t\t\t\t\t\t\t<div class="comment-conv-txt" \r\n\t\t\t\t\t\t\t\t\tdata-e-class="vdvc-txtA" \r\n\t\t\t\t\t\t\t\t\tdata-e-data-msd-elastic\r\n\t\t\t\t\t\t\t\t\tdata-e-form="editcommentForm"\r\n\t\t\t\t\t\t\t\t\tdata-e-data-ng-keypress="$event.stopPropagation();"\r\n\t\t\t\t\t\t\t\t\tdata-e-ng-click="$event.stopPropagation();" \r\n\t\t\t\t\t\t\t\t\tdata-e-placeholder="Reply" \r\n\t\t\t\t\t\t\t\t\tdata-editable-textarea="conv.note" \r\n\t\t\t\t\t\t\t\t\tdata-e-rows="1" \r\n\t\t\t\t\t\t\t\t\tdata-onbeforesave="updateComment($data,conv,annotation)">\r\n\t\t\t\t\t\t\t\t\t<!-- <span data-ng-bind-html="formatComment(annotation,conv.note) | to_trusted"></span> -->\r\n\t\t\t\t\t\t\t\t\t<comment-to-html data-comment="conv.note" data-annotation="annotation"></comment-to-html>\r\n\t\t\t\t\t\t\t\t\t<div data-ng-if="showTagsInfo(conv)" class="col-xs-12" style="margin-top: 5px;padding: 0;">\r\n\t\t\t\t\t\t\t\t\t\t<span data-ng-repeat="tag in conv.tagsInfo"\r\n\t\t\t\t\t\t\t\t\t\t\tclass="vdvc-annot-conv-tag"> \r\n\t\t\t\t\t\t\t\t\t\t\t<span class="ellipsis" \r\n\t\t\t\t\t\t\t\t\t\t\t\tdata-tooltip-placement="auto"\r\n\t\t\t\t\t\t\t\t\t\t  \t\tdata-uib-tooltip="{{showTagName(tag)}}"\r\n\t\t\t\t\t\t\t\t\t\t  \t\tdata-tooltip-append-to-body=\'true\'\r\n\t\t\t\t\t\t\t\t \t\t\t\tstyle="display: block;">\r\n\t\t\t\t\t\t\t\t \t\t\t\t{{showTagName(tag)}}\r\n\t\t\t\t\t\t\t\t \t\t\t</span>\r\n\t\t\t\t\t\t\t\t\t\t</span>\r\n\t\t\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t</form>\r\n\t\t\t\t\t\t\t<div class="col-xs-12 text-muted" style="width: calc(100% - 20px);height: 15px;margin-top: 5px;font-size: 10px;padding: 0px;"> \r\n\t\t\t\t\t\t\t\t<span data-ng-show="conv.userName">{{::conv.userName}} </span><span data-ng-show="conv.userName && conv.createdOn"> | </span> <span data-ng-show="conv.createdOn" data-am-time-ago=\'conv.createdOn\'></span>\r\n\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t<div class="col-xs-12" style="border-bottom: 1px solid #ccc;margin-top: 10px;"></div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</div>\r\n\t\t\t</div>\r\n\t\t</div>');
$templateCache.put('apppublic/components/PublicDocViewer/docViewerComments.html','<div class="col-xs-3 comment-wrap" data-ng-show="showComments" style="padding: 0px 0px 0px 5px;">\r\n\t<data-uib-tabset active="activeTab.index" justified="true" class="full">\r\n\t<data-uib-tab index=1 heading="Annotations ({{docAnnotations.length}})" classes="full">\r\n\t<div class="full" style="overflow-y: auto; overflow-x: hidden;"\r\n\t\tdata-in-view-container>\r\n\t\t<div class="comment-in-wrp full" data-ng-show="hasSelectedAnnotations">\r\n\t\t\t<div\r\n\t\t\t\tstyle="text-align: center; background: #aaa; color: #000; margin: 10px 20px; box-shadow: 0px 0px 10px 2px #aaa;font-weight: 700;padding: 10px 5px;"\r\n\t\t\t\tdata-ng-click="ShowAllAnnotations()">Show All Annotations</div>\r\n\t\t\t<div data-ng-if="!selectedAnnotations || selectedAnnotations.length == 0" style="padding: 40px 15px;\r\n    color: #ff0018;\r\n    background: #fff;\r\n    text-align: center;\r\n    margin: auto 3px;">\r\n\t\t\t\tAnnotation is not found\r\n\t\t\t</div>\r\n\t\t\t<div class="row"\r\n\t\t\t\tdata-ng-repeat="annotation in selectedAnnotations track by annotation.id">\r\n\t\t\t\t<vdvc-annotation></vdvc-annotation>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t\t<div class="comment-in-wrp full" data-ng-hide="hasSelectedAnnotations">\r\n\t\t\t<!-- data-ng-repeat="annotation in docAnnotations  | limitTo : annotLimit : annotBegin track by $index"   -->\r\n\t\t\t<div class="row"\r\n\t\t\t\tdata-ng-repeat="annotation in docAnnotations | limitTo : annotLimit : annotBegin track by annotation.id">\r\n\t\t\t\t<vdvc-annotation></vdvc-annotation>\r\n\t\t\t</div>\r\n\t\t\t<div class="row"\r\n\t\t\t     data-ng-show="docAnnotations.length > annotLimit"\r\n\t\t\t     data-in-view="$inview && loadMoreAnnotations($inview)"\r\n\t\t\t     style="padding: 15px;text-align: center;font-weight: 700;">\r\n\t\t\t\t<div>Loading</div>\r\n\t\t\t\t<div class="vdvc-loader"></div>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t</div>\r\n\r\n\t</data-uib-tab> \r\n\t<data-uib-tab index=2 data-ng-show="docOrphanAnnotations.length > 0">\r\n\t\t<data-uib-tab-heading>\r\n\t      \t<span>Orphans ({{docOrphanAnnotations.length}})</span>\r\n\t      \t<!-- <span data-ng-click="showHelp(\'OrphanedAnnotations\')" \r\n\t\t\t\tdata-uib-tooltip="{{helpTitile}}" \r\n\t\t\t\tdata-tooltip-placement="bottom" \r\n\t\t\t\tstyle="float: right;">\r\n\t\t\t\t<i class="fa fa-info-circle fa-fw" \r\n\t\t\t\t\taria-hidden="true" \r\n\t\t\t\t\tstyle="color: #999 !important;cursor: pointer;">\r\n\t\t\t\t</i>\r\n\t\t\t</span> -->\r\n\t    </data-uib-tab-heading>\r\n\t\t<div class="full" style="overflow-y: auto; overflow-x: hidden;"\r\n\t\t\tdata-in-view-container>\r\n\t\t\t<div class="comment-in-wrp full" data-ng-show="hasSelectedOrphanAnnotations">\r\n\t\t\t\t<div\r\n\t\t\t\t\tstyle="text-align: center; background: #aaa; color: #000; margin: 10px 20px; box-shadow: 0px 0px 10px 2px #aaa;font-weight: 700;padding: 10px 5px;"\r\n\t\t\t\t\tdata-ng-click="ShowAllAnnotations()">Show All Annotations</div>\r\n\t\t\t\t<div data-ng-if="!selectedOrphanAnnotations || selectedOrphanAnnotations.length == 0" style="padding: 40px 15px;\r\n\t    color: #ff0018;\r\n\t    background: #fff;\r\n\t    text-align: center;\r\n\t    margin: auto 3px;">\r\n\t\t\t\t\tAnnotation is not found\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class="row"\r\n\t\t\t\t\tdata-ng-repeat="annotation in selectedOrphanAnnotations track by annotation.id">\r\n\t\t\t\t\t<vdvc-annotation></vdvc-annotation>\r\n\t\t\t\t</div>\r\n\t\t\t</div>\r\n\t\t\t<div class="comment-in-wrp full" data-ng-hide="hasSelectedOrphanAnnotations">\r\n\t\t\t\t<div class="row"\r\n\t\t\t\t\tdata-ng-repeat="annotation in docOrphanAnnotations  | limitTo : orphanAnnotLimit track by annotation.id">\r\n\t\t\t\t\t<vdvc-annotation></vdvc-annotation>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class="row"\r\n\t\t\t\t     data-ng-show ="docOrphanAnnotations.length > orphanAnnotLimit"\r\n\t\t\t\t     data-in-view="$inview && loadMoreAnnotations($inview)"\r\n\t\t\t\t     style="padding: 15px;text-align: center;font-weight: 700;">\r\n\t\t\t\t\t<div>Loading</div>\r\n\t\t\t\t\t<div class="vdvc-loader"></div>\r\n\t\t\t\t</div>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t</data-uib-tab> </data-uib-tabset>\r\n</div>');
$templateCache.put('apppublic/components/PublicDocViewer/PblcDocViewer.html','<div class="container-fluid full" style="padding-top:110px;overflow: hidden;" id=\'vdvc_doc_viewer\'>\t\r\n\t\r\n\t<div class="row" >\r\n\t\t<div class=" navbar-fixed-top second-navbar" \r\n\t\t\t style="top:55px;background-color: #EEEEEE;line-height: 50px;padding: 0px;">\r\n\t\t\t<div class=" col-xs-7" style="padding-left: 30px;">\r\n\t\t\t\t<div class="doc-path ellipsis" style="font-size: 25px; color: rgba(51, 51, 51, 0.74);">\r\n\t\t\t\t\t<span>{{::doc.docDisplayName}}</span>\r\n\t\t\t\t</div>\r\n\t\t\t</div>\r\n\t\t\t<div class="col-xs-5" style="padding-right: 30px;text-align: right;">\r\n\t\t\t\t<span data-ng-repeat="tag in docTags | limitTo:tagLimit"\r\n\t\t\t\t\tclass="vdvc-tag"\r\n\t\t\t\t\tdata-ng-class= "{ \'highlight\': tag.isHighlighted }"> \r\n\t\t\t\t\t\t<span class="tag-cls" data-ng-show="!doc.perms.readonly"></span> \r\n\t\t\t\t\t\t<span class="ellipsis" \r\n\t\t\t\t\t\t\tdata-tooltip-placement="auto"\r\n\t\t\t\t\t  \t\tdata-uib-tooltip="{{showTagName(tag)}}"\r\n\t\t\t\t\t  \t\tdata-tooltip-append-to-body=\'true\'\r\n\t\t\t \t\t\t\tstyle="display: block;">\r\n\t\t\t \t\t\t\t{{showTagName(tag)}}\r\n\t\t\t \t\t\t</span>\r\n\t\t\t\t</span> \r\n\t\t\t\t<span class="dropdown" \r\n\t\t\t\t\tdata-uib-dropdown\r\n\t\t\t\t\tdata-auto-close="outsideClick"\r\n\t\t\t\t\tdata-ng-show="docTags.length > tagLimit" style="margin-right: 10px;margin-left: -12px;">\r\n\t\t        \t<span data-uib-dropdown-toggle \r\n\t\t        \t\t  data-ng-disabled="disabled"\r\n\t\t        \t\t  style="vertical-align: middle;">\r\n\t\t\t\t\t\t<i class="fa fa-ellipsis-h fa-fw"></i>\r\n\t\t\t\t\t</span>\r\n\t\t\t      \t<ul class="dropdown-menu dropdown-menu-right vdvc-tag-list-drop-down" data-uib-dropdown-menu role="menu" style="top: 25px;">\r\n\t\t\t\t        <li class="vdvc-drop-down-item" \r\n\t\t\t\t        \trole="menuitem">\r\n\t\t\t\t        \t<span class="vdvc-tag"\r\n\t\t\t\t        \t\tdata-ng-repeat=\'tag in docTags | after:tagLimit\'  \r\n\t\t\t\t\t\t\t\tstyle="margin-top: 4px;">\r\n\t\t\t\t\t\t\t\t<span style=\'width: 100%;display: inline-block;\'>\r\n\t\t\t\t\t\t\t\t\t<span class="tag-cls" data-ng-show="!doc.perms.readonly"></span>\r\n\t\t\t\t\t\t\t\t\t<span class="ellipsis" \r\n\t\t\t\t\t\t\t\t\t\tdata-tooltip-placement="auto"\r\n\t\t\t\t\t\t\t\t  \t\tdata-uib-tooltip="{{showTagName(tag)}}"\r\n\t\t\t\t\t\t\t\t  \t\tdata-tooltip-append-to-body=\'true\'\r\n\t\t\t\t\t\t \t\t\t\tstyle="display: block;">\r\n\t\t\t\t\t\t \t\t\t\t{{showTagName(tag)}}\r\n\t\t\t\t\t\t \t\t\t</span>\r\n\t\t\t\t\t\t\t\t</span>\r\n\t\t\t\t\t\t\t</span>\r\n\t\t\t\t        </li>\r\n\t\t\t\t    </ul>\r\n\t\t\t\t</span>\r\n\t\t\t\t<a data-ng-href="{{::doc.sourceUrl}}"\r\n\t\t\t\t   target="_blank"\r\n\t\t\t\t   data-uib-tooltip="{{::doc.sourceUrl}}" \r\n\t\t\t\t   data-tooltip-placement="left"\r\n\t\t\t\t   style="text-decoration: none;">\r\n\t\t\t\t   \t{{::doc.sourceHost}}\r\n\t\t\t\t</a>\r\n\t\t\t\t<span class="btn btn-xs vdvc-nav-btn fa fa-comment-o" \r\n\t\t\t\t\tdata-ng-click="toggleComments()" \r\n\t\t\t\t\tdata-uib-tooltip="Show comments" \r\n\t\t\t\t\tdata-tooltip-placement="bottom" \r\n\t\t\t\t\tdata-ng-style="showComments && {\'background-color\':\'#069\',\'color\':\'#fff\'}"\r\n\t\t\t\t\tstyle="font-size: 1.3em;margin-left: 5px;" \r\n\t\t\t\t\trole="button" \r\n\t\t\t\t\ttabindex="0">\r\n\t\t\t\t</span>\r\n\t\t\t</div>\t\r\n\t\t\t\r\n\t\t</div>\r\n\t</div>\r\n\t\r\n\t\r\n\t\r\n\t<div class="col-xs-12" data-ng-show=\'showDoc\' style="height: calc(100% - 10px);">\r\n\t\t<div class="doc-viewr col-xs-12 full" \r\n\t\t\tdata-ng-show=\'!showPdf\' \r\n\t\t\tdata-ng-attr-data-id="{{viewerId}}" \r\n\t\t\tstyle="padding: 0px 0px 0px 15px;">\r\n\t\t\t<div class=\'row full\'>\r\n\t\t\t\t<div class="row full doc-container" style="padding-top: 0px;">\r\n\t\t\t\t\t<div class="cke-wrap full"\r\n\t\t\t\t\t\t data-ng-class="showComments ? \'col-xs-9\' : \'col-xs-12\'" >\r\n\t\t\t\t\t\t<form>\r\n\t\t\t\t\t\t\t<textarea data-ng-attr-id="{{ \'editor-\'+ viewerId }}"\r\n\t\t\t\t\t\t\t\tstyle="display: none; width: 0px; overflow: auto;"\r\n\t\t\t\t\t\t\t\tdata-ng-model="content"></textarea>\r\n\t\t\t\t\t\t</form>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t\t<div data-ng-include-replace data-ng-include="\'apppublic/components/PublicDocViewer/docViewerComments.html\'"></div>\r\n\t\t\t\t</div>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t</div>\r\n\t\r\n\t<div class="col-xs-12 full" data-ng-show=\'showPdf\'>\r\n\t\t<div class="row full pdf-wrap" data-ng-attr-data-id="{{viewerId}}">\r\n\t\t\t<div id="loader" data-ng-show="isLoading">\r\n\t\t\t\t<div class="pdf-progress-bar">\r\n\t\t\t\t\t<span class=\'bar\' data-ng-style=\'{width: downloadProgress + "%"}\'>Loading...</span>\r\n\t\t\t\t</div>\r\n\t\t\t</div> \r\n\t\t\t<div class="row full">\r\n\t\t\t\t<div class=\'row pdf-navbar\'>\r\n\t\t\t\t\t<div class="col-xs-12">\r\n\t\t\t\t\t\t<div class="pdf-tools">\r\n\t\t\t\t\t\t\t  <button data-ng-click="zoomIn()" class="btn btn-xs vdvc-icon-btn"><i class="fa fa-search-plus"></i></button>\r\n\t\t\t\t\t\t\t  <button data-ng-click="fit()" class="btn btn-xs vdvc-icon-btn fa fa-arrows-alt"></button>\r\n\t\t\t\t\t\t\t  <button data-ng-click="zoomOut()" class="btn btn-xs vdvc-icon-btn"><i class="fa fa-search-minus"></i></button>\r\n\t\t\t\t\t\t\t  \r\n\t\t\t\t\t\t\t  <button data-ng-click="goPrevious()" class="btn btn-xs vdvc-icon-btn"><i class="fa fa-arrow-left"></i></button>\r\n\t\t\t\t\t\t\t  <span style="display: inline-block;    margin: 0px 30px 0px 0px;">\r\n\t\t\t\t\t\t\t  \t<input type="text" min=1 data-ng-model="pdfCurrentPage" data-ng-change="onPDFPageChanged()" class="vdvc-input-txt" \r\n\t\t\t\t\t\t\t\t  style="padding: 0px;border: none;width: 50px;text-align: end;line-height: 35px;" >\r\n\t\t\t\t\t\t\t\t  <span style="display: inline-block;width: 50px;"> / {{pdfTotalPages}}</span>\r\n\t\t\t\t\t\t\t  </span>\r\n\t\t\t\t\t\t\t  <button data-ng-click="goNext()" class="btn btn-xs vdvc-icon-btn">\r\n\t\t\t\t\t\t\t  \t<i class="fa fa-arrow-right"></i>\r\n\t\t\t\t\t\t\t  </button>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class="row full pdf-container" style="height: calc(100% - 50px) !important;">\r\n\t\t\t\t\t<div data-ng-class="showComments ? \'col-xs-9\' : \'col-xs-12\'" class="full">\r\n\t\t\t\t\t\t<div pdf-viewer\r\n\t\t\t\t\t\t\tdata-src="{{pdfURL}}"\r\n\t\t\t\t\t\t\tdata-current-page="pdfCurrentPage"\r\n\t\t\t\t\t\t\tdata-initial-scale="fit_width"\r\n\t\t\t\t\t\t\tdata-api="pdfViewerAPI"\r\n\t\t\t\t\t\t\tdata-pdf-app="pdfViewer"\r\n\t\t\t\t\t\t\tdata-render-text-layer="true"\r\n\t\t\t\t\t\t\tdata-progress-callback="onPDFProgress(operation, state, value, total, message)"\r\n\t\t\t\t\t\t\tdata-password-callback="onPDFPassword(reason)"\r\n\t\t\t\t\t\t\tdata-search-term="{{pdfSearchTerm}}"\r\n\t\t\t\t\t\t\tdata-annotations="pdfAnnotations" \r\n\t\t\t\t\t\t\tdata-search-result-id="pdfSearchResultID"\r\n\t\t\t\t\t\t\tdata-search-num-occurences="pdfSearchNumOccurences"\r\n\t\t\t\t\t\t\tdata-annot-type="annotType" \r\n\t\t\t\t\t\t\tpublic-view="true"\r\n\t\t\t\t\t\t\tid="content"\r\n\t\t\t\t\t\t\tclass="vdvc-pdf-viewer">\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t\t<div data-ng-include-replace data-ng-include="\'apppublic/components/PublicDocViewer/pdfComments.tmpl.html\'"></div>\r\n\t\t\t\t</div>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t</div>\r\n\t\r\n</div>\r\n\r\n');
$templateCache.put('apppublic/components/PublicDocViewer/pdfComments.tmpl.html','<div class="col-xs-3 comment-wrap full" data-ng-show="showComments">\r\n\t<div class="comment-in-wrp full">\r\n\t\t<div class="row vdvc_comment" \r\n\t\t\tdata-ng-class="annotation.id" \r\n\t\t\tdata-ng-attr-data-id="{{annotation.id}}" \r\n\t\t\tdata-ng-attr-data-page="{{annotation.pageNum}}"\r\n\t\t \tdata-on-outside-element-click="onOutClickComment()"\r\n\t\t \tdata-ng-repeat="annotation in pdfAnnotations |  filter:pdfAnnotationsTypeFilter track by $index"\r\n\t\t \tdata-uib-popover-template="linkUIProperties.templateUrl"\r\n\t\t\tdata-popover-is-open="annotation.showDeepLink"\r\n\t\t\tdata-popover-placement="auto"\r\n\t\t\tdata-popover-trigger="linkUIProperties.trigger"\r\n\t\t\tdata-popover-class="annotation-deep-link-info"\r\n\t\t\tdata-popover-append-to-body=\'true\'>\r\n\t\t \t<div class="ellipsis comment-hdr col-xs-12" \r\n\t\t \t\tdata-ng-click="pdfCommentOnclick($event,annotation)" \r\n\t\t \t\tstyle="padding: 5px;">\r\n\t\t\t\t<div class="row" \r\n\t\t\t\t\tdata-ng-if="annotation.type != \'Pagenote\' && annotation.type != \'Screenshot\'" \r\n\t\t\t\t    data-ng-bind-html="getPdfAnnotationText(annotation) | to_trusted"\r\n\t\t\t\t\tdata-tooltip-append-to-body="true" \r\n\t\t\t\t\tdata-uib-tooltip-html="getPdfAnnotationText(annotation) | to_trusted">\r\n\t\t\t\t</div>\r\n\t\t\t\t<markdown-to-html class="markdown-body" \r\n\t\t\t\t\tdata-ng-if="hasFormatedText(annotation)" \r\n\t\t\t\t\tdata-text="annotation.formatedText" \r\n\t\t\t\t\tdata-annotation="annotation">\r\n\t\t\t\t</markdown-to-html>\r\n\t\t\t</div>\r\n\t\t \t<div class=\'comment-crd\' data-ng-click="pdfCommentOnclick($event,annotation)">\r\n\t\t\t\t<div class=\'comment-conv\'>\r\n\t\t\t\t\t<div class="row comment-conv-wrap" \r\n\t\t\t\t\t\tdata-ng-attr-data-convId="{{annotation.id}}"\r\n\t\t\t\t\t\tdata-ng-show="!hasRootComment(annotation) && annotation.userName">\r\n\t\t\t\t\t\t<div class="col-xs-2">\r\n\t\t\t\t\t\t\t<div class=\'vdvc-circle\' data-tooltip-append-to-body=\'true\'\r\n\t\t\t\t\t\t\t\tdata-uib-tooltip="{{annotation.userName}}">{{getUserlabel(annotation.userName) | truncate: 2}}</div>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t<div class="col-xs-10">\r\n\t\t\t\t\t\t\t<div class="col-xs-12 text-muted" style="width: calc(100% - 20px);padding: 0px;margin-top: 5px;font-size: 10px;"> \r\n\t\t\t\t\t\t\t\t<span>{{annotation.userName}} | </span> <span data-am-time-ago=\'annotation.createdOn\'></span>\r\n\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t<div class="col-xs-12" style="border-bottom: 1px solid #ccc;margin-top: 10px;"></div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t\t<div class="row comment-conv-wrap" data-ng-repeat="conv in annotation.conversations | orderBy:\'createdOn\':false track by $index"\r\n\t\t\t\t\t\tdata-ng-attr-data-convId="{{conv.id}}">\r\n\t\t\t\t\t\t<div class="col-xs-2" data-ng-show="conv.userName">\r\n\t\t\t\t\t\t\t<div class=\'vdvc-circle\' data-tooltip-append-to-body=\'true\'\r\n\t\t\t\t\t\t\t\tdata-uib-tooltip="{{::conv.userName}}">{{::getUserlabel(conv.userName) | truncate: 2 }}</div>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t<div class="col-xs-10">\r\n\t\t\t\t\t\t\t<form data-editable-form name="editcommentForm">\r\n\t\t\t\t\t\t\t\t<div class="comment-conv-txt" \r\n\t\t\t\t\t\t\t\t\tdata-e-class="vdvc-txtA" \r\n\t\t\t\t\t\t\t\t\tdata-e-data-msd-elastic\r\n\t\t\t\t\t\t\t\t\tdata-e-form="editcommentForm"\r\n\t\t\t\t\t\t\t\t\tdata-e-data-ng-keypress="$event.stopPropagation();"\r\n\t\t\t\t\t\t\t\t\tdata-e-ng-click="$event.stopPropagation();" \r\n\t\t\t\t\t\t\t\t\tdata-e-placeholder="Reply" \r\n\t\t\t\t\t\t\t\t\tdata-editable-textarea="conv.note" \r\n\t\t\t\t\t\t\t\t\tdata-e-rows="1" \r\n\t\t\t\t\t\t\t\t\tdata-onbeforesave="updatePdfComment($data,conv,annotation)">\r\n\t\t\t\t\t\t\t\t\t<span data-ng-bind-html="formatComment(annotation,conv.note) | to_trusted"></span>\r\n\t\t\t\t\t\t\t\t\t<div data-ng-if="::showTagsInfo(conv)" class="col-xs-12" style="margin-top: 5px;padding: 0;">\r\n\t\t\t\t\t\t\t\t\t\t<span data-ng-repeat="tag in conv.tagsInfo"\r\n\t\t\t\t\t\t\t\t\t\t\tclass="vdvc-annot-conv-tag"> \r\n\t\t\t\t\t\t\t\t\t\t\t<span class="ellipsis" \r\n\t\t\t\t\t\t\t\t\t\t\t\tdata-tooltip-placement="auto"\r\n\t\t\t\t\t\t\t\t\t\t  \t\tdata-uib-tooltip="{{showTagName(tag)}}"\r\n\t\t\t\t\t\t\t\t\t\t  \t\tdata-tooltip-append-to-body=\'true\'\r\n\t\t\t\t\t\t\t\t \t\t\t\tstyle="display: block;">\r\n\t\t\t\t\t\t\t\t \t\t\t\t{{showTagName(tag)}}\r\n\t\t\t\t\t\t\t\t \t\t\t</span>\r\n\t\t\t\t\t\t\t\t\t\t</span>\r\n\t\t\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t</form>\r\n\t\t\t\t\t\t\t<div class="col-xs-12 text-muted" style="width: calc(100% - 20px);height: 15px;margin-top: 5px;font-size: 10px;padding: 0px;"> \r\n\t\t\t\t\t\t\t\t<span data-ng-show="conv.userName">{{::conv.userName}} </span><span data-ng-show="conv.userName && conv.createdOn"> | </span> <span data-ng-show="conv.createdOn" data-am-time-ago=\'conv.createdOn\'></span>\r\n\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t<!-- <div data-ng-show="conv.userName" class="col-xs-12 text-muted" style="width: calc(100% - 20px);height: 15px;margin-top: 5px;font-size: 10px;padding: 0px;"> \r\n\t\t\t\t\t\t\t\t<span>{{::conv.userName}} | </span> <span data-am-time-ago=\'conv.createdOn\'></span>\r\n\t\t\t\t\t\t\t</div> -->\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t<div class="col-xs-12" style="border-bottom: 1px solid #ccc;margin-top: 10px;"></div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</div>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t</div>\r\n</div>');
$templateCache.put('apppublic/components/PublicNavigation/PublicNavigation.html','<div class="container">\r\n\t<nav class="navbar navbar-default navbar-fixed-top" role="navigation">\r\n\t\t<div class="navbar-header col-sm-6">\r\n\t\t\t<button type="button" class="navbar-toggle" data-ng-click="vm.isCollapsed = !vm.isCollapsed">\r\n\t\t\t\t<span class="sr-only">Toggle navigation</span> \r\n\t\t\t\t<span class="icon-bar"></span>\r\n\t\t\t\t<span class="icon-bar"></span>\r\n\t\t\t\t<span class="icon-bar"></span>\r\n\t\t\t</button>\r\n\t\t\t<span class="navbar-brand">\r\n\t\t\t\t<!-- {{vm.Company}} -->\r\n\t\t\t\t<img src="/app/assets/icons/Numici-Logo-Long-In-Blue.png" alt="numici">\r\n\t\t\t</span>\r\n\t\t</div>\r\n\t\t<div class="navbar-right col-sm-6" data-ng-if="!vm.hasSession && vm.currentState != \'slacksignincb\'" style="padding: 8px;">\r\n\t\t\t\r\n\t\t\t<!-- <a class="btn btn-primary" \r\n\t\t\t\tdata-ui-sref="login" \r\n\t\t\t\tstyle="float: right;font-size: 15px !important;margin-right: 40px;">\r\n\t\t\t\tGO TO LOGIN\r\n\t\t\t</a>\r\n\t\t\t\r\n\t\t\t<a class="btn btn-primary" \r\n\t\t\t\tdata-ng-click="vm.openRegisterModal()"\r\n\t\t\t\tstyle="float: right;font-size: 15px !important;margin-right: 10px;">\r\n\t\t\t\tGet free Numici account\r\n\t\t\t</a> -->\r\n\t\t</div>\r\n\t</nav>\t\r\n</div>');
$templateCache.put('apppublic/components/Root/root.html','<div class="full rootContainer">\r\n\t<div data-ui-view data-name="nav"></div>\r\n\t<div class="full" data-ui-view data-name="content"></div>\r\n\t\r\n\t<toaster-container data-toaster-options="{\'toaster-id\': \'top-full-width\',\'animation-class\': \'toast-top-full-width toast-top-center\',\'prevent-duplicates\':true}"></toaster-container>\r\n\t<toaster-container data-toaster-options="{\'toaster-id\': \'top-center\',\'animation-class\':\'toast-top-center\',\'prevent-duplicates\':true}"></toaster-container>\r\n\t<toaster-container data-toaster-options="{\'toaster-id\': \'top-right\',\'animation-class\':\'toast-cust-top\',\'prevent-duplicates\':true}"></toaster-container>\r\n\t\r\n\t<flash-message duration="5000" show-close="false" data-on-dismiss="onScheduleFlashClose(flash);"></flash-message>\r\n</div>');
$templateCache.put('apppublic/components/common/StateNotFoundError/StateNotFoundErrorTemplate.html','<div class="container-fluid full">\r\n\t<div style="height: 60px"></div>\r\n\t<div class="row">\r\n\t\t<div class="col-xs-12">\r\n\t\t\tURL seems to be invalid.\r\n\t\t</div>\r\n\t</div>\r\n</div>\r\n');
$templateCache.put('apppublic/components/PublicWebAnnotation/Error/PublicWAErrorTemplate.html','<div class="container-fluid full">\r\n\t<div class="row full" style="position: relative;">\r\n\t\t<div class="row" style="width: 70%;\r\n\t\t    height: 300px;\r\n\t\t    background: #fff;\r\n\t\t    position: absolute;\r\n\t\t    top: 50%;\r\n\t\t    left: 50%;\r\n\t\t    transform: translate(-50%,-50%);\r\n\t\t    text-align: center;\r\n\t\t    font-size: 18px;">\r\n\t\t\t<div style="position: fixed;\r\n\t\t\t    width: 100%;\r\n\t\t\t    top: 50%;\r\n\t\t\t    left: 0px;\r\n\t\t\t    transform: translate(0%,-50%);">\r\n\t\t\t    <div style="padding-bottom: 15px;" \r\n\t\t\t    \tdata-ng-bind-html ="pwec.error | to_trusted">\r\n\t\t\t    \t<!-- {{::pwec.error}} -->\r\n\t\t\t    </div>\r\n\t\t\t    <div class="col-xs-12" data-ng-if="!pwec.showLoginUrl">\r\n\t\t\t\t\t<div class ="wa-error checkbox col-top-mrgn-5">\r\n\t\t\t\t\t\t<input type="checkbox" \r\n\t\t\t\t\t\t\tdata-ng-model="pwec.doNotShow" data-ng-change="pwec.setCookieForDonnotShowWAError()">\r\n\t\t\t\t\t\t<label>Don\'t show this message again on this computer</label>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</div>\r\n\t\t\t    <div data-ng-if="pwec.showLoginUrl" style="word-break: break-all;">\r\n\t\t\t    \tTo Go To Login Page - <a data-ui-sref="login">click here</a>\r\n\t\t\t    </div>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t</div>\r\n</div>');}]);