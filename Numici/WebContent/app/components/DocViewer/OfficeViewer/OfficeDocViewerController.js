
;(function(){
	'use strict';
	
	angular.module('vdvcApp').directive('officeDocViewer', function() {
		  return {
		    restrict: "E",
		    templateUrl:"app/components/DocViewer/OfficeViewer/OfficeDocViewer.html",
		    controller:'OfficeDocViewerController',
		    controllerAs:'OfficeViewer'
		  }
	});
	
	angular.module('vdvcApp').directive('onFrameLoaded', function() {
		  return {
		    restrict: "A",
		    replace: true,
		    link: function(scope, el, attr){
		    	if(el) {
		    		el[0].onload = function(){
		    			scope.$apply(attr["onFrameLoaded"]);
		    			try {
		    				if(attr["stylesSrc"]) {
			    				var $head = $(el).contents().find("head");                
				    			$head.append($("<link/>",{ 
				    				rel: "stylesheet",
				    				href: attr["stylesSrc"],
				    				type: "text/css"
				    			}));
			    			}
		    			} catch(e) {}
			    	};
		    	}
		    },
		  }
	});
	
	angular.module("vdvcApp").controller('OfficeDocViewerController',OfficeDocViewerController);
	
	OfficeDocViewerController.$inject = ['$scope','$rootScope','_','APIUserMessages',"$timeout",'$sce'];
	
	function OfficeDocViewerController($scope,$rootScope,_,APIUserMessages,$timeout,$sce) {
			
			var OfficeViewer = this;
			
			OfficeViewer.officeDoc = $scope.officeDoc;
			OfficeViewer.docUrl = $scope.docUrl;
			OfficeViewer.onLoad = onLoad;
			OfficeViewer.loader = OfficeViewer.officeDoc && OfficeViewer.officeDoc.fileType == "text"? true : false;
			
			$scope.trustSrc = function(src) {
				    return $sce.trustAsResourceUrl(src);
			};
			
			function onLoad() {
				OfficeViewer.loader = false;
				$scope.$emit("objectLoaded",{'objectId':OfficeViewer.officeDoc.id});
			}
			
			function loadDoc(docUrl) {
				if(OfficeViewer.docUrl === docUrl) {
					return;
				}
				OfficeViewer.docUrl = docUrl;
				//$sce.trustAsResourceUrl(OfficeViewer.docUrl);
			}
			
			function init() {
				if(OfficeViewer.officeDoc && $scope.docUrl) {
					loadDoc($scope.docUrl);
				}
			}
			
			init();
	}
})();

