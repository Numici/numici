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
