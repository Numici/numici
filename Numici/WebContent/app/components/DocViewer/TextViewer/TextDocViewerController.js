
;(function(){
	'use strict';
	
	angular.module('vdvcApp').directive('textDocViewer', function() {
		  return {
		    restrict: "E",
		    templateUrl:"app/components/DocViewer/TextViewer/TextDocViewer.html",
		    controller:'TextDocViewerController',
		    controllerAs:'TextViewer'
		  }
	});
	
	angular.module("vdvcApp").controller('TextDocViewerController',TextDocViewerController);
	
	TextDocViewerController.$inject = ['$scope','$rootScope','_','APIUserMessages',"$timeout",'$sce'];
	
	function TextDocViewerController($scope,$rootScope,_,APIUserMessages,$timeout,$sce) {
			
			var TextViewer = this;
			
			TextViewer.officeDoc = $scope.officeDoc;
			TextViewer.docUrl = $scope.docUrl;
			TextViewer.onLoad = onLoad;
			TextViewer.loader = TextViewer.officeDoc && TextViewer.officeDoc.fileType == "text"? true : false;
			
			$scope.trustSrc = function(src) {
				    return $sce.trustAsResourceUrl(src);
			}
			
			function onLoad() {
				TextViewer.loader = false;
				$scope.$emit("objectLoaded",{'objectId':TextViewer.officeDoc.id});
			}
			
			function loadDoc(docUrl) {
				if(TextViewer.docUrl === docUrl) {
					return;
				}
				TextViewer.docUrl = docUrl;
				//$sce.trustAsResourceUrl(TextViewer.docUrl);
			}
			
			function init() {
				if(TextViewer.officeDoc && $scope.docUrl) {
					loadDoc($scope.docUrl);
				}
			}
			
			init();
	}
})();

