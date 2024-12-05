;(function() {
	'use strict'; 
	
	angular.module('vdvcApp').controller('VDVCDocViewerController',VDVCDocViewerController);
	
	VDVCDocViewerController.$inject = ['$scope','$stateParams','$deviceInfo','DocFactory','$compile'];
	
	function VDVCDocViewerController($scope,$stateParams,$deviceInfo,DocFactory,$compile) {
		
		function init () {
			var divElement = angular.element(document.querySelector('.vdvc-doc-viewer'));
			var childScope  = $scope.$new();
			childScope.docId = $stateParams.docId;
			childScope.clientId = $stateParams.clientId;
			childScope.userinfo = $scope.userinfo;
			if($stateParams.commentId) {
				childScope.commentId = $stateParams.commentId;
			}
			DocFactory.getDocById($stateParams.docId,$stateParams.clientId).then(function(response) { 
            	if (response.status == 200 && response.data.Status) {
            		var document = response.data.Notes;
					if(!_.isEmpty(document) && document.docType == "EMail") {
						var template = '<email-doc-viewer data-ng-init="docContext=\'FromDocument\';annotationContext=\'document\'"><email-doc-viewer/>';
						var appendHtml = $compile(template)(childScope);
						divElement.html(appendHtml);
					} else {
						if($deviceInfo.isMobile) {
							var template = '<mobile-doc-viewer></mobile-doc-viewer>';
							var appendHtml = $compile(template)(childScope);
							divElement.html(appendHtml);
			    		} else {
			    			var template = '<doc-viewer-directive></doc-viewer-directive>';
    						var appendHtml = $compile(template)(childScope);
    						divElement.html(appendHtml);
			    		}
					}
            	} else {
            		var template = '<doc-viewer-directive></doc-viewer-directive>';
					var appendHtml = $compile(template)(childScope);
					divElement.html(appendHtml);
            	}
        	});
    		
		}
	  
		init();
		
	}
})();