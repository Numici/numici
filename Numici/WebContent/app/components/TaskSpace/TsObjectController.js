;(function() {
	'use strict';
	
	
	angular.module('vdvcApp').directive('docViewer', function() {
		  return {
		    restrict: "E",
		    templateUrl:'app/components/TaskSpace/docViewer.html',
		    controller:'DocViewerController'
		  }
	});
	
	angular.module('vdvcApp').directive('digest', function() {
		  return {
		    restrict: "E",
		    templateUrl:'app/components/AnnotationDigest/templates/ADTViewer.html',
		    controller:'ADTViewerController',
		    controllerAs:'adv'
		  }
	}).directive('htmlDigest', function() {
		  return {
			    restrict: "E",
			    templateUrl:'app/components/AnnotationDigest/templates/ADTHtmlViewer.html',
			    controller:'ADTHtmlViewerController',
			    controllerAs:'adhvc'
			  }
	});
	
	angular.module('vdvcApp').controller('TsObjectController',
			TsObjectController);

	TsObjectController.$inject = ['$rootScope','$scope', '$state', '$stateParams',
			'$uibModal', '$timeout', '$confirm', 'TaskSpaceService', '_', 'DocFactory',
			'AnnotationService', 'commonService','$compile','$deviceInfo' ];

	function TsObjectController($rootScope,$scope, $state, $stateParams, $uibModal,
			$timeout, $confirm, TaskSpaceService, _, DocFactory,
			AnnotationService, commonService,$compile,$deviceInfo) {
		
		var loaderTimeout;
		var vm = this;
		var dummyTSObj = {
			"name" : "Add Document to your Taskspace",
		};
		
		
		
		vm.tsId = $stateParams.tsId;
		vm.clientId = $stateParams.tsc;
		$scope.isolateDoc = false;
		vm.focusedObj = 'One';	
		vm.loader = false;		
		vm.objDropUIOptions = {
			accept : ".ts-card",
			classes : {
				"ui-droppable-active" : "ui-state-default"
			},
		};
		
		vm.onObjDrop = onObjDrop;
		
		vm.showVdvcNavbar = function() {
			if($deviceInfo.isIE || $deviceInfo.isEdge){
				$("."+vm.focusedObj).find('.vdvc-nav-bar').show();
				$("."+vm.focusedObj).find('.doc-container').css("padding-top","40px");
			}
		};
		
		vm.hideVdvcNavbar = function() {
			if($deviceInfo.isIE || $deviceInfo.isEdge){
				$("."+vm.focusedObj).find('.vdvc-nav-bar').hide();
				$("."+vm.focusedObj).find('.doc-container').css("padding-top","0px");
			}
		};
		
		
		var childScopes = {};
		
		$scope.expandDoc = function() {
			$scope.isolateDoc = true;
			$scope.$broadcast('resizeDoc', $scope.isolateDoc);
		};

		$scope.$on("isolateDoc", function(event, msg) {
			$scope.isolateDoc = msg;

		});
		
		$scope.$on("replaceObject",function(event, msg){
			var postdata=angular.copy(msg);
			postdata.id = vm.tsId;
			postdata.newClientId = msg.clientId;
			postdata.clientId = vm.clientId;
			TaskSpaceService.replaceObject(postdata).then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					if(renderDocument("Document",msg.newId,msg.clientId,vm.focusedObj,msg.docType)) {
						$scope.$emit("updateTSObject",{"obj":{objectId : msg.newId,clientId:msg.clientId,curId:msg.curId},"focused":vm.focusedObj});
					}
				}
			});
			
		});
		
		
		function clearLoader(timer) {
			$timeout.cancel(loaderTimeout);
			$timeout(function() {
				vm.loader = false;
			},timer);
		}
		
		function showLoader(timer) {
			vm.loader = true;
			clearLoader(5000);
		}
		
		$scope.$on("objectLoaded",function(event, msg){
			clearLoader(0);
		});
		
		$scope.$on("openObject",function(event, msg){
			openObject({type: msg.type,objectId: msg.id,clientId:msg.clientId,objectInfo:{"docType":msg.docType}},msg.focused);
		});
		
		$scope.$on("RemoveTsObject",function(event, msg){
			clearLayout(msg.focused);
		});
		
		function onObjDrop(event, ui) {
			$scope.$emit("openedObjectByUserOnDrop",{"droppedObj":vm.droppedObj});
			// ui.helper.removeClass("tsk-on-drag");
			if($state.params.d) {
				$state.go('taskspace.list.task',{"tsId": $state.params.tsId,"tsc": $state.params.tsc,d:null,dc:null,da:null},{reload:false});
			}
			openObject(vm.droppedObj,vm.focusedObj);
		}

		function clearLayout(focused) {
			if(focused == vm.focusedObj) {
				var divElement = angular.element(document.querySelector('.'+focused));
				if(childScopes[focused]) {
					childScopes[focused].$destroy();
					divElement.empty();
					delete childScopes[focused];
				}
			}
		}
		
		function renderDocument(type,id,clientId,focused,documentType) {
			if(focused == vm.focusedObj) {
				var status = false;
				
				showLoader();
				
				clearLayout(focused);
				
				var divElement = angular.element(document.querySelector('.'+focused));
				switch(type) {
				case "Document":
					childScopes[focused] = $scope.$new();
					childScopes[focused].documentId = id;
					childScopes[focused].clientId = clientId;
					childScopes[focused].tsId = $stateParams.tsId;
					childScopes[focused].tsClientId = $stateParams.tsc;
					childScopes[focused].userinfo = $scope.userinfo;
					if($state.current.name == "taskspace.list.task" && $state.params.d && $state.params.d == id && $state.params.da){
						childScopes[focused].commentId = $state.params.da;
					}
					var template = '<doc-viewer></doc-viewer>';
					if(documentType == "EMail") {
	    	    		template = '<email-doc-viewer data-ng-init="docContext=\'FromTaskSpace\';annotationContext=\'taskspace\'"><email-doc-viewer/>';
	    	    		childScopes[focused].docId = id;
	    	    	}
					var appendHtml = $compile(template)(childScopes[focused]);
					divElement.append(appendHtml);
					status = true;
					break;
				case "Digest":
					var template = '<html-digest></html-digest>';
					childScopes[focused] = $scope.$new();
					childScopes[focused].tsId = $stateParams.tsId;
					childScopes[focused].tsClientId = $stateParams.tsc;
					childScopes[focused].clientId = clientId;
					childScopes[focused].taskspace = $scope.vm.taskSpace;
					childScopes[focused].taskSpaceState = $scope.vm.taskSpaceState;
					var appendHtml = $compile(template)(childScopes[focused]);
					divElement.append(appendHtml);
					status = true;
					break;
				}
				
			    return status;
			} 
		}
		
		function notifyObject(type,id,clientId,focused,documentType) {
			if(renderDocument(type,id,clientId,focused,documentType)) {
				$scope.$emit("updateTsState",{"obj":{objectId : id},"focused":vm.focusedObj});
			} else {
				vm.loader = false;
			}
		}
		
		function openObject(object,focused) {
			if (object) {
				notifyObject(object.type,object.objectId,object.clientId,focused,object.objectInfo.docType);
			}
		}
	}
})();