;(function(){
	'use strict';
	
	angular.module("vdvcApp").service('browser', ['$window', function($window) {

	     return function() {

	        var userAgent = $window.navigator.userAgent;
	        
	        if (userAgent.indexOf("Safari") != -1) { 
        		  if (userAgent.indexOf("Chrome") > -1) {
        			  if (userAgent.indexOf("Edge") > -1) {
	        			  return "Edge"; // Edge
	        		  } else {
	        			  return "Chrome"; // Chrome
	        		  }
        		  } else {
        			  return "Safari"; // Safari
        		  }
        	} else if (userAgent.indexOf("Firefox") != -1) {
                return "Firefox";
            }
	       
	       return 'unknown';
	    }

	}]);
	
	angular.module("vdvcApp").factory("commonService", ['$rootScope','httpService','$uibModal','$window','$document','$state','$deviceInfo','$timeout','orderByFilter','ChromeExtensionService',
	                                                    function($rootScope,httpService,$uibModal,$window,$document,$state,$deviceInfo,$timeout,orderByFilter,ChromeExtensionService) {
		
		var pathnaemArray = $window.location.pathname.split( '/' );
		var protocol = $window.location.protocol;
		var host = $window.location.host;
		var context = pathnaemArray[1];
		var commonService = {};
		
		commonService.confMap = {
				"pdf" : {
					"icon" : "fa fa-file-pdf-o",
					"enableForIndex" : true
				},
				"image" : {
					"icon" : "fa fa-file-image-o",
					"enableForIndex" : false
				},
				"excel" : {
					"icon" : "fa fa-file-excel-o",
					"enableForIndex" : true
				},
				"word" : {
					"icon" : "fa fa-file-word-o",
					"enableForIndex" : true
				},
				"text" : {
					"icon" : "fa fa-file-text-o",
					"enableForIndex" : true
				},
				"ppt" : {
					"icon" : "fa fa-file-powerpoint-o",
					"enableForIndex" : true
				},
				"default" : {
					"icon" : "fa fa-file-o ",
					"enableForIndex" : false
				}
		};
		
		commonService.mimeMap = {
			
			"text/html" : "text",
			"text/plain" : "text",
			
			"application/pdf" : "pdf",
			
			"video/mpeg": "video",
			
			"image/gif": "image",
			"image/x-icon": "image",
			"image/jpeg": "image",
			"image/png": "image",
			"image/svg+xml": "image",
			"image/tiff": "image",
			"image/webp": "image",
			
			"application/vnd.ms-powerpoint" : "ppt",
			"application/vnd.openxmlformats-officedocument.presentationml.presentation" : "ppt",
			"application/vnd.openxmlformats-officedocument.presentationml.template" : "ppt",
			"application/vnd.openxmlformats-officedocument.presentationml.slideshow" :"ppt",
			"application/vnd.ms-powerpoint.addin.macroEnabled.12" : "ppt",
			"application/vnd.ms-powerpoint.presentation.macroEnabled.12" : "ppt",
			"application/vnd.ms-powerpoint.template.macroEnabled.12" : "ppt",
			"application/vnd.ms-powerpoint.slideshow.macroEnabled.12" : "ppt",
			
			 "application/vnd.ms-excel" : "excel",
			 "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "excel",
			 "application/vnd.openxmlformats-officedocument.spreadsheetml.template" : "excel",
			 "application/vnd.ms-excel.sheet.macroEnabled.12" : "excel",
			 "application/vnd.ms-excel.template.macroEnabled.12" : "excel",
			 "application/vnd.ms-excel.addin.macroEnabled.12" : "excel",
			 "application/vnd.ms-excel.sheet.binary.macroEnabled.12" : "excel",
			 
			 "application/msword" : "word",
			 "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : "word",
			 "application/vnd.openxmlformats-officedocument.wordprocessingml.template" : "word",
			 "application/vnd.ms-word.document.macroEnabled.12" : "word",
			 "application/vnd.ms-word.template.macroEnabled.12" : "word",
			 
			 "default" : "default"
		};
		
		
		commonService.sendUseragentinfo = function() {
			var info = $deviceInfo.deviceInfo;
			return httpService.httpPost("common/useragentinfo",info);
		};
		
		// needs to be removed 
		commonService.getEntities = function(query) {
			return httpService.httpPost("search/text",query);
		};
		
		commonService.getNotifications = function(query) {
			return httpService.httpPost("userNotification/getMyNotification",query);
		};
	
		commonService.getNewsFeed= function(postdata) {
			return httpService.httpPost("newsFeed/getNews",postdata);
		};
		
		commonService.broadcast = function(customEvent,msg) {
			$rootScope.$broadcast(customEvent, msg);
		};
		
		commonService.emit = function(customEvent,msg) {
			$rootScope.$emit(customEvent, msg);
		};
		
		commonService.getNavMenuItems = function(postdata) {
			return httpService.httpPost("appKeyValue/getKeyValuesForType",postdata);
		};
		commonService.updateNavMenuItems = function(postdata) {
			return httpService.httpPost("appKeyValue/save",postdata);
		};
		
		commonService.showInfo = function(info) {
			var modalInstance = $uibModal.open({
			      animation: true,
			      templateUrl: 'app/components/common/HelpModal/HelpDescModal.html',
			      controller: 'HelpDescController',
			      appendTo : $('.rootContainer'),
			      controllerAs : 'vm',
			      backdrop: 'static',
			      resolve: {
			    	  helpDescInputs : function() {
			    		return info;
			    	  }
			      }
			});
		};
		
		commonService.getCurrentContext = function() {
			var currentContext = "";
			if($state.current.name == "taskspace.list.task") {
				currentContext = "FromTaskspace";
			}
		  
			if($state.current.name == "search"){
				currentContext = "FromSearch";
			}
		  
			if($state.current.name == "docs" || $state.current.name == "docview"){
				currentContext = "FromDocument";
			}
			return currentContext;
		}
		
		commonService.getContext = function() {
			return protocol+"//" +host+"/";
		}
		
		commonService.getScrollingElement = function(_document) {
			 var userAgent = $window.navigator.userAgent;
			 
			 if (_document.scrollingElement) {
				 return _document.scrollingElement;
			 }
			 if (userAgent.indexOf('WebKit') != -1) {
				return _document.body;
			 }
			 return _document.documentElement;
		}
		
		function escapeRegExp(string){
	        return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	    }
	     
	    /* Define functin to find and replace specified term with replacement string */
	    commonService.replaceAll = function(str, term, replacement) {
	      return str.replace(new RegExp(escapeRegExp(term), 'g'), replacement);
	    };
	    
	    commonService.hideNaveBar = function() {
	    	document.querySelector('nav').style.display = "none";
			var timer = $timeout(function() {
				var containerFluidEle = document.querySelector('.container-fluid');
				if(containerFluidEle) {
					containerFluidEle.style.padding = "0px";
					containerFluidEle.children[0].style.padding = "0px";
				}
				$timeout.cancel(timer);
	        }, 1000);
	    };
	    
	    commonService.sortSelectedItems = function(Items,SortByField,isDescending) {
			var sortedResults = orderByFilter(Items, SortByField, isDescending);
			if(!_.isEmpty(sortedResults)) {
				return sortedResults;
			} else {
				return [];
			}
		}
	    
	    commonService.getSortedOrderIcon = function(sortOptions, sortBy, sortByDec) {
			 var sortedOrderIcon = "";
			 var selectedSortOption = _.findWhere(sortOptions,{"key": sortBy});
			 if(selectedSortOption && selectedSortOption.type == "text") {
				 sortedOrderIcon = "fa-sort-alpha-";
				 if(sortByDec) {
					 sortedOrderIcon = sortedOrderIcon+"desc";
				 } else {
					 sortedOrderIcon = sortedOrderIcon+"asc"
				 }
			 } else if(selectedSortOption && selectedSortOption.type == "number") {
				 sortedOrderIcon = "fa-sort-numeric-";
				 if(sortByDec) {
					 sortedOrderIcon = sortedOrderIcon+"desc";
				 } else {
					 sortedOrderIcon = sortedOrderIcon+"asc"
				 }
			 }
			 return sortedOrderIcon;
		}
	    
	    commonService.getVDVCConfirmWithRadioButtonsData = function(confirmTitle,confirmText,confirmRadioBtns,actionButtonText,closeButtonText) {
	    	var VDVCConfirmWithRadioButtonsData = {
					"title" : confirmTitle,
					"text" : confirmText,
					"radioBtns" : confirmRadioBtns,
					"actionButtonText" : actionButtonText,
					"closeButtonText" : closeButtonText
			};
			return VDVCConfirmWithRadioButtonsData;
	    }
	    
	    commonService.checkIsExtensionInstalled = function(extensionId,cb) {
			ChromeExtensionService.isExtensionInstalled(extensionId,function(response){
				var isExtensionInstalled = false;
				if(response && response.type === "pong") {
					isExtensionInstalled = true;
				}
				if(typeof cb == "function") {
					cb(isExtensionInstalled);
				}
			});
		}
		
	    commonService.getNumiciExtensionInfo = function(cb) {
	    	var numiciExtension = {};
	    	if($deviceInfo.isMobile || $deviceInfo.isTablet) {
				numiciExtension["isDeviceSupport"] = false;
			} else {
				numiciExtension["isDeviceSupport"] = true;
			}
			if($deviceInfo.isChrome) {
				numiciExtension["isChrome"] = true;
			} else {
				numiciExtension["isChrome"] = false;
			}
			if($deviceInfo.isChrome) {
				numiciExtension["isBrowserSupport"] = true;
			} else {
				numiciExtension["isBrowserSupport"] = false;
			}
			commonService.getNavMenuItems({"type":"WebAnnotations"}).then(function(resp){
				if(resp.status == 200 && resp.data.Status) {
					var listAppKeyValues  = resp.data.listAppKeyValues;
					var chromeStoreBaseUrlObj = _.findWhere(listAppKeyValues,{"key": "ChromeStoreBaseUrl"});
					var extensionNameObj = _.findWhere(listAppKeyValues,{"key": "ExtensionName"});
					var extensionIdObj = _.findWhere(listAppKeyValues,{"key": "ExtensionId"});
					if(extensionIdObj) {
						numiciExtension["chromeStoreBaseUrlObj"] = chromeStoreBaseUrlObj;
						numiciExtension["extensionNameObj"] = extensionNameObj;
						numiciExtension["extensionIdObj"] = extensionIdObj;
						commonService.checkIsExtensionInstalled(extensionIdObj.value,function(status){
							numiciExtension["isExtensionInstalled"] = status;
							if(typeof cb == "function") {
								cb(numiciExtension);
							}
						});
					}
				}
			});
		}
		
	    return commonService;
	}]);
	
})();