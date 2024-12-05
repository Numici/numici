;(function() {
	'use strict';
	
	
	angular.module('vdvcApp').controller('InboxEmailDocController',
			InboxEmailDocController);

	InboxEmailDocController.$inject = ['$rootScope','$scope', '$state', '$stateParams',
			'$uibModal', '$timeout', '$confirm', 'TaskSpaceService', '_', 'DocFactory',
			'AnnotationService', 'commonService','$compile','$deviceInfo' ];

	function InboxEmailDocController($rootScope,$scope, $state, $stateParams, $uibModal,
			$timeout, $confirm, TaskSpaceService, _, DocFactory,
			AnnotationService, commonService,$compile,$deviceInfo) {
		
		var loaderTimeout;
		var vm = this;
		
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
			openObject({type: msg.type,objectId: msg.id,clientId:msg.clientId,objectInfo:{"docType":msg.docType}});
		});
		
		function onObjDrop(event, ui) {
			openObject(vm.droppedObj);
		}

		function clearLayout(focused) {
			var divElement = angular.element(document.querySelector('.'+focused));
			if(childScopes[focused]) {
				childScopes[focused].$destroy();
				divElement.empty();
				delete childScopes[focused];
			}
		}
		
		function renderDocument(type,id,clientId,documentType) {
			var status = false;
			var focused = "One";
			showLoader();
			
			clearLayout(focused);
			
			var divElement = angular.element(document.querySelector('.'+focused));
			childScopes[focused] = $scope.$new();
			childScopes[focused].documentId = id;
			childScopes[focused].clientId = clientId;
			childScopes[focused].tsId = $stateParams.tsId;
			childScopes[focused].tsClientId = $stateParams.tsc;
			childScopes[focused].userinfo = $scope.userinfo;
			var template = '<doc-viewer></doc-viewer>';
			if(documentType == "EMail") {
	    		template = '<email-doc-viewer data-ng-init="docContext=\'FromTaskSpace\';annotationContext=\'taskspace\'"><email-doc-viewer/>';
	    		childScopes[focused].docId = id;
	    	}
			var appendHtml = $compile(template)(childScopes[focused]);
			divElement.append(appendHtml);
			status = true;
			return status;
		}
		
		function notifyObject(type,id,clientId,documentType) {
			if(renderDocument(type,id,clientId,documentType)) {
				// Do nothing
			} else {
				vm.loader = false;
			}
		}
		
		function openObject(object) {
			if (object) {
				notifyObject(object.type,object.objectId,object.clientId,object.objectInfo.docType);
			}
		}
	}
})();