
;(function(){
	'use strict';
	
	angular.module("vdvcApp").controller('OneDriveDocViewerController',OneDriveDocViewerController);
	
	OneDriveDocViewerController.$inject = ['$scope','$stateParams','$rootScope','_','APIUserMessages',"$timeout","appData",
		'OneDriveService', 'commonService','$compile'];
	
	function OneDriveDocViewerController($scope,$stateParams,$rootScope,_,APIUserMessages,$timeout,appData,
			OneDriveService,commonService,$compile) {
			
			var appdata = appData.getAppData();
			var ODDV = this;
			var docScope = null;
			ODDV.doc = null;
			
			$scope.$on("$destroy",function() {
				
			});
			
			function returnViewer(mimeType) {
				var viewer;
				switch(mimeType) {
				case "application/pdf":
					viewer = "<od-pdf-viewer></od-pdf-viewer>";
					break;
				default:
					viewer = "<od-office-doc-viewer></od-office-doc-viewer>";
					break;
				}
				
				return viewer;
			}
			
			function clearDocViewer() {
				var divElement = angular.element(document.querySelector('#od_doc_viewer .od-doc-content'));
				if(docScope) {
					docScope.$destroy();
					divElement.empty();
					docScope = null;
				}
			}
			
			function init() {
				
				clearDocViewer();
				OneDriveService.getDriveItem($scope.oneDriveDocId).then(function(resp) {
					if(resp.status == 200 && resp.data.Status) {
						ODDV.doc = resp.data.Item;
						if(ODDV.doc) {
							OneDriveService.setIcon(ODDV.doc);
							var viewer = returnViewer(ODDV.doc.mimeType);
							if(viewer) {
								var context = commonService.getContext();
								var divElement = angular.element(document.querySelector('#od_doc_viewer .od-doc-content'));
								docScope = $scope.$new();
								docScope.oneDriveDoc = angular.copy(ODDV.doc);
								docScope.docUrl = 'https://docs.google.com/viewer?embedded=true&url='+context+'/OneDriveGoogleDocViewer?id='+ODDV.doc.id+"%26userId="+appdata.UserId;
								//docScope.docUrl = context+'/api/onedrive/officeViewer?id='+ODDV.doc.id;
								var appendHtml = $compile(viewer)(docScope);
							    divElement.append(appendHtml);
							}
						}
					}
				});
			}
			
			init();
	}
	
})();

