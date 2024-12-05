;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('DigestLinkHtmlController',DigestLinkHtmlController);
	DigestLinkHtmlController.$inject = ['$scope','$state','$stateParams','AnnotationDigestService','_','$timeout',
	                                'appData','$compile','commonService','notificationEvents','DigestEventListner',
	                                '$window','TaskSpaceService'];
	
	function DigestLinkHtmlController($scope,$state,$stateParams,AnnotationDigestService,_,$timeout,appData,$compile,
			commonService,notificationEvents,DigestEventListner,$window,TaskSpaceService) {
		var dlhc = this;
		var appdata = appData.getAppData();
		var childScopes = {};
		
		var notificationHandledelayTime = AnnotationDigestService.notificationHandledelayTime;
		var pendingDigestChangedUpdates = [];
		var debounceHandleDigestChangedUpdates = _.debounce(handleDigestChangedUpdates, parseInt(notificationHandledelayTime));
		var loadEvents = [notificationEvents.DIGEST_CHANGED];
		
		dlhc.linkId = $stateParams.linkId;
		dlhc.linkClientId = $stateParams.linkClientId;
		dlhc.linkInfo = !_.isEmpty(commonService.linkInfo) ? commonService.linkInfo : {};
		dlhc.numiciImage = appdata.numiciImage;
		dlhc.numiciLink = appdata.numiciLink;
		dlhc.numiciHeaderText = appdata.numiciHeaderTxt;
		dlhc.numiciFooterText = appdata.numiciFooterTxt;
		dlhc.htmlDigestContent = "";
		
		dlhc.topFunction = topFunction;
		dlhc.showCloseDigestBtn = showCloseDigestBtn;
		dlhc.closeDigestView = closeDigestView;
		
		if(appdata && !_.isEmpty(appdata.GlobalSettings)) {
			var notificationHandledelayTimeObj = _.findWhere(appdata.GlobalSettings,{key : "NotificationHandledelayTime"});
			if(!_.isEmpty(notificationHandledelayTimeObj)) {
				notificationHandledelayTime = notificationHandledelayTimeObj.value*1000;
				debounceHandleDigestChangedUpdates = _.debounce(handleDigestChangedUpdates, parseInt(notificationHandledelayTime));
			}
		}
		
		angular.element(document.querySelector('.vdst')).bind('scroll', function(evt){
			if (evt.currentTarget.scrollTop > 200) {
				$(angular.element('.vdvc-scroll-top')[0]).css('display','block');
			} else {
				$(angular.element('.vdvc-scroll-top')[0]).css('display','none');
			}
	    });
		
		$scope.$on('$destroy',function() {
			DigestEventListner.close();
			debounceHandleDigestChangedUpdates.cancel();
		});
		
		function handleDigestChangedUpdates() {
			if(pendingDigestChangedUpdates && pendingDigestChangedUpdates.length == 0) {
				return;
			}
			pendingDigestChangedUpdates.splice(0,pendingDigestChangedUpdates.length);
			dlhc.hasDigestUpdates = true;
			$scope.$digest();
		}
		
		dlhc.updateDigest = function() {
			dlhc.hasDigestUpdates = false;
			getDigestHtmlForLink();
		};
		
		loadEvents.forEach(function (event) {
		   	$scope.$on(event, function (evt, msg) {
		   		processDigestEvent(msg);
		    });
		});
		
		function processDigestEvent(msg){
			pendingDigestChangedUpdates.push(msg);
			if(pendingDigestChangedUpdates && pendingDigestChangedUpdates.length == 1) {
				debounceHandleDigestChangedUpdates();
			}
		}
		
		$scope.$on("updateDigest",function(event, msg){
			var handleActionEvents = ["DOCUMENT_INDEXED","DOCS_REMOVED","DOC_OR_SECTION_UPDATE"];
			if(msg && _.contains(handleActionEvents,msg.action)) {
				$scope.taskspace = TaskSpaceService.currentTaskspace;
				processDigestEvent(msg);
			} else {
				processDigestEvent({});
			}
		});
		
		function topFunction() {
			angular.element('.vdst')[0].scrollTo(0,0);
		}
		
		function showCloseDigestBtn() {
			if($state.current.name == "tsdigestview" && $window.opener && !adv.createDigestForLink) {
				return true;
			}
			return false;
		}
		
		function closeDigestView() {
			if(!$window.opener) {
				console.log("Parent window closed");
				return;
			}
			var oAuthResponse = {type:"view_ts_digest",code:"ViewTaskSpaceDigest",state:"Success",data:{}};
			$window.opener.postMessage(oAuthResponse,origin);
			$window.close();
		}
		
	    function clearLayout(focused) {
	    	var divElement = angular.element(document.querySelector('.'+focused));
			if(childScopes[focused]) {
				childScopes[focused].$destroy();
				divElement.empty();
				delete childScopes[focused];
			}
		}
	    
		function renderDocument(focused) {
			clearLayout(focused);
			var timer = $timeout(function() {
				var divElement = angular.element(document.querySelector('.'+focused));
				divElement.append(dlhc.htmlDigestContent);
				divElement[0].style.overflowY = "auto";
				var timer1 = $timeout(function() {
					if(divElement) {
						$(divElement).find('.cke_widget_drag_handler_container').css("display", "none");
						$(divElement).find('.cke_image_resizer').css("display", "none");
					}
					$timeout.cancel(timer1);
		        }, 1000);
				$timeout.cancel(timer);
				dlhc.loader = false;
	        }, 1000);
		}
		
		function getDigestHtmlForLink(cb) {
			dlhc.loader = true;
			var postdata = {linkId : dlhc.linkId,clientId : dlhc.linkClientId,transformImageUrls : true,htmlFor : "privatedigest"};
			AnnotationDigestService.getDigestHtmlForLink(postdata).then(function(resp) {
	    		if(resp.status == 200 && resp.data.Status) {
	    			if(!_.isEmpty(resp.data.AnnotationDigest) && !_.isEmpty(resp.data.AnnotationDigest.digestHtml)) {
	    				dlhc.htmlDigestContent = resp.data.AnnotationDigest.digestHtml;
	    				var taskspaceId = resp.data.tsId;
	    				var digestFor = resp.data.objectType;
	    				var documentId = "";
	    				if(digestFor == "DigestDocument") {
	    					documentId = resp.data.docId;
	    				}
		    			if(typeof cb == "function") {
		    				cb(taskspaceId,documentId);
		    			}
	    			}
	    		}
			},function(errorResp) {
				dlhc.htmlDigestContent = errorResp;
	    	})["finally"](function() {
	    		renderDocument('vdst');
			});
		}
		
		function connectDigestEventSocket(taskspaceId,documentId) {
			if(!_.isEmpty(taskspaceId) && DigestEventListner.isConnected()) {
				var socketMessage = {"taskspaceId":taskspaceId};
				if(!_.isEmpty(documentId)) {
					socketMessage["documentId"] = documentId;
    			}
				DigestEventListner.sendMessage(socketMessage);
    		} else if(!_.isEmpty(taskspaceId) && !DigestEventListner.isConnected()) {
    			DigestEventListner.taskspaceId = taskspaceId;
    			if(!_.isEmpty(documentId)) {
    				DigestEventListner.documentId = documentId;
    			}
    			DigestEventListner.reconnect();
			}
		}
		
		function init() {
			getDigestHtmlForLink(function(taskspaceId,documentId) {
				connectDigestEventSocket(taskspaceId,documentId);
			});
		}
		
		init();
	}
})();
