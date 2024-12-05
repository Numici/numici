;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('DigestLinkController',DigestLinkController);
	DigestLinkController.$inject = ['$scope','$state','$stateParams','TaskSpaceService','_','$timeout',
	                                'appData','$compile','commonService'];
	
	function DigestLinkController($scope,$state,$stateParams,TaskSpaceService,_,$timeout,appData,$compile,
			commonService) {
		var dlc = this;
		var appdata = appData.getAppData();
		var tsCommentTimer;
		var childScopes = {};
		
		dlc.linkId = $stateParams.linkId;
		dlc.linkClientId = $stateParams.linkClientId;
		dlc.linkInfo = !_.isEmpty(commonService.linkInfo) ? commonService.linkInfo : {};
		
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
			dlc.loader = true;
			clearLayout(focused);
			var divElement = angular.element(document.querySelector('.'+focused));
			
			var template = '<digest></digest>';
			childScopes[focused] = $scope.$new();
			if(!_.isEmpty(dlc.linkInfo.properties) && !_.isEmpty(dlc.linkInfo.properties.digestSettings)) {
				childScopes[focused].tsId = dlc.linkInfo.properties.digestSettings.objectId;
				childScopes[focused].tsClientId = dlc.linkInfo.properties.digestSettings.clientId;
			}
			childScopes[focused].linkInfo = dlc.linkInfo;
			var appendHtml = $compile(template)(childScopes[focused]);
			divElement.append(appendHtml);
			status = true;
			
		    return status;
		}
		
		renderDocument("vdst");
	}
})();
