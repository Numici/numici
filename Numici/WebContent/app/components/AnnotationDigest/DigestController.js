;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('DigestController',DigestController);
	DigestController.$inject = ['$rootScope','$scope','$state','$stateParams','TaskSpaceService','_',
	                            '$timeout','appData','$compile','commonService',
	                            'notificationEvents','APIUserMessages','pendingRequests',
	                            'TaskSpaceEventListner'];
	
	function DigestController($rootScope,$scope,$state,$stateParams,TaskSpaceService,_,$timeout,appData,
			$compile,commonService,notificationEvents,APIUserMessages,pendingRequests,
			TaskSpaceEventListner) {
		var dc = this;
		var appdata = appData.getAppData();
		var tsCommentTimer;
		var childScopes = {};
		$scope.$emit("PageName",{"userName":appdata.UserName,"pageName":$state.current.pageName});
		var getTaskSpacePromise;
		var getTsStatePromise;
		
		dc.tsId = $stateParams.tsId;
		dc.clientId = $stateParams.tsc;
	    
		var pendingTaskspaceUpdates = [];
		var pendingTsCmtEvents = [];
		var pendingIndextEvents = [];
		
		var loadEvents = [
  			notificationEvents.DOCS_ADDED,
  			notificationEvents.SECTION_ADDED,
  			notificationEvents.SECTION_REMOVED,
  			notificationEvents.SECTION_RENAMED,
  			notificationEvents.DOCUMENT_MOVED,
  			notificationEvents.DOCS_REMOVED,
  			notificationEvents.PERMISSIONS_CHANGED,
  		];
  		
  		var commentEvents = [
  			notificationEvents.COMMENT_CREATED_OR_UPDATED,
  			notificationEvents.COMMENT_DELETED,
  		];
  		
  		$scope.$on("$destroy", function(event, msg) {
			pendingRequests.cancel(getTaskSpacePromise);
			pendingRequests.cancel(getTsStatePromise);
			if($state.current.name == "tsdigestview") {
				debounceHandleTaskspaceUpdates.cancel();
				debounceHandleTaskspaceCmtUpdates.cancel();
				debounceHandleTsDocIndexedUpdates.cancel();
				TaskSpaceEventListner.close();
			}
			
		});
  		
  		if($state.current.name == "tsdigestview") {
  			loadEvents.forEach(function(event) {
  	  			$scope.$on(event, function(evt, msg) {
  	  				if(notificationEvents.shouldHandle(msg)) {
  	  					if (dc.tsId == msg.taskspaceId) {
  	  						pendingTaskspaceUpdates.push(msg);
  	  						debounceHandleTaskspaceUpdates.cancel();
  	  						if(pendingTaskspaceUpdates.length < TaskSpaceService.maxNotifications) {
  	  							debounceHandleTaskspaceUpdates();
  	  						} else {
  	  							handleTaskspaceUpdates();
  	  						}
  	  					}
  	  				}
  	  			});
  	  		});
  	  		
  	  		commentEvents.forEach(function(event) {
  	  			$scope.$on(event, function(evt, msg) {
  	  				if(notificationEvents.shouldHandle(msg)) {
  	  					if (dc.tsId == msg.taskspaceId) {
  	  						pendingTsCmtEvents.push(msg);
  	  						debounceHandleTaskspaceCmtUpdates.cancel();
  	  						if(pendingTsCmtEvents.length < TaskSpaceService.maxNotifications) {
  	  							debounceHandleTaskspaceCmtUpdates();
  	  						} else {
  	  							handleTaskspaceCmtUpdates();
  	  						}
  	  					}
  	  				}
  	  			});
  	  		});
  	  		
  	  		$scope.$on(notificationEvents.DOCUMENT_INDEXED, function(event, msg) {
  	  			if (notificationEvents.shouldHandle(msg) && dc.tsId == msg.taskspaceId) {
  	  				pendingIndextEvents.push(msg);
  	  				debounceHandleTsDocIndexedUpdates.cancel();
  	  				if(pendingIndextEvents.length < TaskSpaceService.maxNotifications) {
  	  					debounceHandleTsDocIndexedUpdates();
  	  				} else {
  	  					handleTsDocIndexedUpdates();
  	  				}
  	  			}
  	  		});
  		}
  		
  		function handleTaskspaceUpdates() {
  			if (pendingTaskspaceUpdates && pendingTaskspaceUpdates.length == 0) {
  				return;
  			}
  			
  			var events = pendingTaskspaceUpdates.splice(0,pendingTaskspaceUpdates.length); //pendingTaskspaceUpdates.concat([]);
  			
  			var text = TaskSpaceService.getTaskspaceUpdateMessage(events,appdata.UserId);
  			getTaskSpaceById(dc.clientId, dc.tsId).then(function(resp) {
  				if (resp.status == 200 && resp.data.Status && !_.isEmpty(text)) {
  					APIUserMessages.notification(text);
  				}
  			})['finally'](function() {
  				$rootScope.$broadcast("updateDigest",{"action" : "DOC_OR_SECTION_UPDATE"});
  			});
  		}
  		
  		function handleTaskspaceCmtUpdates() {
  			if (pendingTsCmtEvents && pendingTsCmtEvents.length == 0) {
  				return;
  			}
  		    var events = pendingTsCmtEvents.splice(0,pendingTsCmtEvents.length); //pendingTsCmtEvents.concat([]);
  			var text = TaskSpaceService.getTaskspaceUpdateMessage(events,appdata.UserId);
  			getTaskSpaceById(dc.clientId, dc.tsId).then(function(resp) {
  				if (resp.status == 200 && resp.data.Status && !_.isEmpty(text)) {
  					APIUserMessages.notification(text);
  				}
  			})['finally'](function() {
				$rootScope.$broadcast("updateDigest");
  			});
  		}
		
  		function handleTsDocIndexedUpdates() {
			$rootScope.$broadcast("updateDigest",{"action" : "DOCUMENT_INDEXED"});
			pendingIndextEvents = [];
		}
		
  		if($state.current.name == "tsdigestview") {
  			var debounceHandleTaskspaceUpdates = _.debounce(handleTaskspaceUpdates, TaskSpaceService.notificationHandledelayTime);
  			var debounceHandleTaskspaceCmtUpdates = _.debounce(handleTaskspaceCmtUpdates, TaskSpaceService.notificationHandledelayTime);
  			var debounceHandleTsDocIndexedUpdates = _.debounce(handleTsDocIndexedUpdates, TaskSpaceService.notificationHandledelayTime);
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
			var status = false;
			dc.loader = true;
			clearLayout(focused);
			var divElement = angular.element(document.querySelector('.'+focused));
			
			var template = '<digest></digest>';
			childScopes[focused] = $scope.$new();
			childScopes[focused].tsId = $stateParams.tsId;
			childScopes[focused].tsClientId = $stateParams.tsc;
			childScopes[focused].taskspace = dc.taskSpace;
			childScopes[focused].taskSpaceState = dc.taskSpaceState;
			var appendHtml = $compile(template)(childScopes[focused]);
			divElement.append(appendHtml);
			status = true;
			
		    return status;
		}
		
		
		function getTaskSpaceState(clientId,id) {
			pendingRequests.cancel(getTsStatePromise);
			getTsStatePromise = TaskSpaceService.getTaskSpaceState(clientId,id);
			getTsStatePromise.then(function(resp) {
				if (resp.status == 200 && resp.data.Status) {
					dc.taskSpaceState = resp.data.TaskspaceState;
					renderDocument("vdst");
				}
			});
		}
		
		function getTaskSpaceById(clientId,id) {
			if (id) {
				pendingRequests.cancel(getTaskSpacePromise);
				getTaskSpacePromise = TaskSpaceService.getTaskSpaceById(clientId,id);
				getTaskSpacePromise.then(function(resp) {
					if (resp.status == 200 && resp.data.Status) {
						dc.taskSpace = resp.data.Taskspace;
						TaskSpaceService.currentTaskspace = dc.taskSpace;
						getTaskSpaceState(clientId,id);
					}
				});
			}
			return getTaskSpacePromise;
		}
		
		if($state.current.name == "tsdigestview") {
			if(!TaskSpaceEventListner.isConnected()) {
				TaskSpaceEventListner.reconnect();
			}
		}
		
		if($stateParams.donotShowNavBar) {
			commonService.hideNaveBar();
		}
		getTaskSpaceById(dc.clientId,dc.tsId);
	    
	}
	
})();
