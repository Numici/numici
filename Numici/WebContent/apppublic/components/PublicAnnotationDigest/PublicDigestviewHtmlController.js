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
