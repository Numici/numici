
;(function(){
	'use strict';
	
	angular.module('vdvcApp').directive('odPdfViewer', function() {
		  return {
		    restrict: "E",
		    templateUrl:"app/components/OneDrive/DocViewer/OneDrivePdfViewer/OneDrivePdfViewer.html",
		    controller:'OneDrivePdfViewerController',
		    controllerAs:'ODPV'
		  }
	});
	
	
	angular.module("vdvcApp").controller('OneDrivePdfViewerController',OneDrivePdfViewerController);
	
	OneDrivePdfViewerController.$inject = ['$scope','$rootScope','_','APIUserMessages',"$timeout",'OneDriveService'];
	
	function OneDrivePdfViewerController($scope,$rootScope,_,APIUserMessages,$timeout,OneDriveService) {
			
			var ODPV = this;
			
			ODPV.oneDriveDoc = $scope.oneDriveDoc;
			ODPV.isLoading = false;
			ODPV.downloadProgress = 0;

			ODPV.pdfZoomLevels = [];
			ODPV.pdfViewerAPI = {};
			ODPV.pdfScale = "fit_width";
			ODPV.pdfURL = "";
			ODPV.pdfFile = null;
			ODPV.pdfTotalPages = 0;
			ODPV.pdfCurrentPage = 0;
			ODPV.pdfSearchTerm = "";
			ODPV.pdfSearchResultID = 0;
			ODPV.pdfSearchNumOccurences = 0;
			ODPV.pdfAnnotations = [];
			
			
			ODPV.zoomIn = function () {
				var nextScale = ODPV.pdfViewerAPI.getNextZoomInScale(ODPV.pdfScale);
				ODPV.pdfViewerAPI.zoomTo(nextScale.value);
				ODPV.pdfScale = nextScale.value;
			};

			ODPV.zoomOut = function () {
				var nextScale = ODPV.pdfViewerAPI.getNextZoomOutScale(ODPV.pdfScale);
				ODPV.pdfViewerAPI.zoomTo(nextScale.value);
				ODPV.pdfScale = nextScale.value;
			};
					
			ODPV.findNext = function () {
				ODPV.pdfViewerAPI.findNext();
			};
			
			ODPV.findPrev = function () {
				ODPV.pdfViewerAPI.findPrev();
			};

			ODPV.fit = function() {
				ODPV.pdfViewerAPI.zoomTo("fit_width");
			};
			
			ODPV.onPDFPageChanged = function (cb) {
				$timeout(function () {
					ODPV.pdfViewerAPI.goToPage(ODPV.pdfCurrentPage,cb);
				},0);
			};

			ODPV.goPrevious = function() {
				if (ODPV.pdfCurrentPage > 1) {
					ODPV.pdfCurrentPage = (ODPV.pdfCurrentPage*1)-1;
					ODPV.pdfViewerAPI.goToPage(ODPV.pdfCurrentPage);
				}
			};
			
			ODPV.goNext = function() {
				if (ODPV.pdfTotalPages > ODPV.pdfCurrentPage) {
					ODPV.pdfCurrentPage = (ODPV.pdfCurrentPage*1)+1;
					ODPV.pdfViewerAPI.goToPage(ODPV.pdfCurrentPage);
				}
			};
			
			
			ODPV.onPDFProgress = function (operation, state, value, total, message) {
				if(operation === "render" && value === 1) {
					if(state === "success") {
						//$('.text-layer').annotator();
						if(ODPV.pdfZoomLevels.length === 0) {
							// Read all the PDF zoom levels in order to populate the combobox...
							var lastScale = 0.1;
							do {
								var curScale = ODPV.pdfViewerAPI.getNextZoomInScale(lastScale);
								if(curScale.value === lastScale) {
									break;
								}

								ODPV.pdfZoomLevels.push(curScale);

								lastScale = curScale.value;
							} while(true);
						}
						
						ODPV.pdfCurrentPage = 1;
						ODPV.pdfTotalPages = ODPV.pdfViewerAPI.getNumPages();
						ODPV.pdfScale = ODPV.pdfViewerAPI.getZoomLevel();
						ODPV.isLoading = false;
						ODPV.isPdfIsRendered = true;
					} else {
						console.log("Failed to render 1st page!\n\n" + message);
						ODPV.isLoading = false;
					}
				} else if(operation === "download" && state === "loading") {
					ODPV.downloadProgress = (value / total) * 100.0;
					
				} else {
					if(state === "failed") {
						console.log("Something went really bad!\n\n" + message);
					}
				}
				
			};
			
			ODPV.onPDFPassword = function (reason) {
				return prompt("The selected PDF is password protected. PDF.js reason: " + reason, "");
			};
			
			function loadPDF(pdfURL) {
				if(ODPV.pdfURL === pdfURL) {
					return;
				}

				ODPV.isLoading = true;
				ODPV.downloadProgress = 0;
				ODPV.pdfZoomLevels = [];
				ODPV.pdfSearchTerm = "";
				ODPV.pdfFile = null;
				ODPV.pdfURL = pdfURL;
			}
			
			function init() {
				if(ODPV.oneDriveDoc) {
					loadPDF(OneDriveService.getFileUrl(ODPV.oneDriveDoc.id));
				}
			}
			
			init();
	}
})();

