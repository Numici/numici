
;(function(){
	'use strict';
	
	angular.module('vdvcApp').directive('odOfficeDocViewer', function() {
		  return {
		    restrict: "E",
		    templateUrl:"app/components/OneDrive/DocViewer/OneDriveOfficeDocViewer/OneDriveOfficeDocViewer.html",
		    controller:'OneDriveOfficeDocViewerController',
		    controllerAs:'OODV'
		  }
	});
	
	
	angular.module("vdvcApp").controller('OneDriveOfficeDocViewerController',OneDriveOfficeDocViewerController);
	
	OneDriveOfficeDocViewerController.$inject = ['$scope','$rootScope','_','APIUserMessages',"$timeout",'OneDriveService','$sce'];
	
	function OneDriveOfficeDocViewerController($scope,$rootScope,_,APIUserMessages,$timeout,OneDriveService,$sce) {
			
			var OODV = this;
			
			OODV.oneDriveDoc = $scope.oneDriveDoc;
			OODV.docUrl = $scope.docUrl;
			OODV.onLoad = onLoad;
			OODV.loader = OODV.oneDriveDoc && OODV.oneDriveDoc.fileType == "text"? true : false;
			
			$scope.trustSrc = function(src) {
			    return $sce.trustAsResourceUrl(src);
			}
			
			function onLoad() {
				OODV.loader = false;
			}
			
			function loadDoc(docUrl) {
				if(OODV.docUrl === docUrl) {
					return;
				}
				OODV.docUrl = $sce.trustAsResourceUrl(docUrl);
			}
			
			function init() {
				if(OODV.oneDriveDoc) {
					loadDoc($scope.docUrl);
				}
			}
			
			init();
	}
})();

