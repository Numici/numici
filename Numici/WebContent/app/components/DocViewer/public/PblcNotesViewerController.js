
;(function(){
	
	angular.module("vdvcApp").controller("PblcDocViewerController",PblcDocViewerController);
	PblcDocViewerController.$inject = ['$rootScope','$scope','pendingRequests','DocFactory',
	                                   'MessageService','APIUserMessages','_','$stateParams',
	                                   '$location','urlParser','$timeout','commonService'];
	
	function PblcDocViewerController($rootScope,$scope,pendingRequests,DocFactory,
			MessageService,APIUserMessages,_,$stateParams,$location,urlParser,$timeout,commonService){
		
		
		var baseUrl = commonService.getContext()+"api/";
		var getdocPromise;
		var readOnly = true;
		
		$scope.doc = null;
		$scope.documentId = $stateParams.id;
		$scope.instance = null;
		$scope.showPdf = false;
		$scope.isLoading = false;
		$scope.downloadProgress = 0;
		$scope.pdfZoomLevels = [];
		$scope.pdfViewerAPI = {};
		$scope.pdfScale = "fit_width";
		$scope.pdfURL = "";
		$scope.pdfFile = null;
		$scope.pdfTotalPages = 0;
		$scope.pdfCurrentPage = 0;
		$scope.pdfSearchTerm = "";
		$scope.pdfSearchResultID = 0;
		$scope.pdfSearchNumOccurences = 0;
		$scope.pdfAnnotUI = [];
		
		function onDestroy() {
				//CKEDITOR.instances['editor-'+$scope.documentId].destroy();
		}
		
		$scope.$on("$destroy",function handleDestroyEvent() {
			onDestroy();
		});
		
		$scope.$on("windowResized",function(event, msg){
			if($scope.showDoc){
				var t = $timeout(function() {
					var ckeId = $('.cke.cke_reset').attr("id")
					var h = "100%";
					if(ckeId === "cke_editor-"+$scope.documentId) {
						h = $('.cke.cke_reset').find(".cke_inner").outerHeight();
						$('.cke.cke_reset').find(".cke_contents").height(h);
					}
					if (CKEDITOR.instances['editor-'+$scope.documentId]) {
						CKEDITOR.instances['editor-'+$scope.documentId].resize("100%",h);
					}
					$timeout.cancel(t);
				},500);
			}
		});
				
		function CreateNotes(editorId){
			
			var content = $scope.doc ? $scope.doc.content : "";
			var div = $('<div/>');
			div.append(content);
			//div.find("a:empty").append(" ");
			var emptyAnchors = div.find("a[name]");
			$.each(emptyAnchors,function(i,a){
				var name = $(a).attr("name");
				$(a).attr("id",name).append(" ").css({"background": "none","border": "none","padding":"0px"});
			});
			
			$scope.content = div.html();
			$scope.showDoc = true;
			
			try {
				$scope.instance = CKEDITOR.replace( editorId,{
					readOnly: readOnly,
					width: "100%",
					language : "en",
					skin : 'moono-lisa,/resources/js/ckeditor/skins/moono-lisa/' ,
					baseHref : "/",
					removePlugins : "stylesheetparser, elementspath,toolbar",
					resize_enabled : false,
					//allowedContent: true,
					fullPage: true,
					forceEnterMode : true
				});
			} catch(e) {
				
			}

			if ($scope.instance) {
				CKEDITOR.on('instanceCreated', function (ev) {
					CKEDITOR.dtd.$removeEmpty['a'] = 0;
	            });
				CKEDITOR.on('instanceReady', function(evt) {
					var ckeId = $('.cke.cke_reset').attr("id")
					
					var h = "100%";
					if(ckeId === "cke_editor-"+$scope.documentId) {
						h = $('.cke.cke_reset').find(".cke_inner").outerHeight();
						$('.cke.cke_reset').find(".cke_contents").height(h);
					}
					 
					 if ( evt.editor && evt.editor.status == "ready") {
						 evt.editor.resize("100%",h);
					 }
					 var iframe = $('.cke_wysiwyg_frame');//.contents();
					 $scope.iframedoc = iframe[0].contentDocument || iframe[0].contentWindow.document;
				});
			}
		}
		
		function showDocument() {
			if($scope.documentId) {
				pendingRequests.cancel(getdocPromise);
				getdocPromise = DocFactory.getPublicDocById($scope.documentId);
				getdocPromise.then(function(response){
					if (response.status == 200 && response.data.Status) {
						$scope.doc = response.data.Notes;
						if($scope.doc) {
							if ($scope.doc.docName.split('.').pop() == 'pdf') {
								loadPdf();
							} else {
								CreateNotes("editor-"+$scope.documentId);
								if($scope.doc.sourceUrl) {
									var urlObj = urlParser.parseUrl($scope.doc.sourceUrl);
									$scope.doc.sourceHost = urlObj.hostname;
								}
							}
						}
					}
				});
			}	
		}
		
		function loadPdf() {
			$scope.showPdf = true;
			$scope.pdfUrl = baseUrl+'publicAPI/publicpdfview/'+$scope.documentId;
			$scope.loadPDF($scope.pdfUrl);
		}
		
		$scope.onPDFProgress = function (operation, state, value, total, message) {
			if(operation === "render" && value === 1) {
				if(state === "success") {
					
					$scope.pdfCurrentPage = 1;
					$scope.pdfTotalPages = $scope.pdfViewerAPI.getNumPages();
					$scope.isLoading = false;
					
					
					$scope.isPdfIsRendered = true;
				} else {
					console.log("Failed to render 1st page!\n\n" + message);
					$scope.isLoading = false;
				}
			} else if(operation === "download" && state === "loading") {
				$scope.downloadProgress = (value / total) * 100.0;
				
			} else {
				if(state === "failed") {
					console.log("Something went really bad!\n\n" + message);
				}
			}
		};

		$scope.fit = function() {
			$scope.pdfViewerAPI.OnScaleChanged("auto");
		};
		
		$scope.onPDFPageChanged = function () {
			$timeout(function () {
				$scope.pdfViewerAPI.goToPage($scope.pdfCurrentPage,cb);
			},0);
		};

		$scope.goPrevious = function() {
			if ($scope.pdfCurrentPage > 1) {
				$scope.pdfCurrentPage = ($scope.pdfCurrentPage*1)-1;
				$scope.pdfViewerAPI.goToPage($scope.pdfCurrentPage);
			}
		};
		
		$scope.goNext = function() {
			if ($scope.pdfTotalPages > $scope.pdfCurrentPage) {
				$scope.pdfCurrentPage = ($scope.pdfCurrentPage*1)+1;
				$scope.pdfViewerAPI.goToPage($scope.pdfCurrentPage);
			}
		};
				
		$scope.zoomIn = function () {
			$scope.pdfViewerAPI.zoomIn();
		};

		$scope.zoomOut = function () {
			$scope.pdfViewerAPI.zoomOut();
		};
		
		$scope.rotateClockwise = function () {
			$scope.pdfViewerAPI.rotatePages(90);
		};

		$scope.rotateCounterClockwise = function () {
			$scope.pdfViewerAPI.rotatePages(-90);
		};

		$scope.loadPDF = function (pdfURL) {
			if($scope.pdfURL === pdfURL) {
				return;
			}

			$scope.isLoading = true;
			$scope.downloadProgress = 0;
			$scope.pdfZoomLevels = [];
			$scope.pdfSearchTerm = "";
			$scope.pdfFile = null;
			$scope.pdfURL = pdfURL;
		};
				
		$scope.findNext = function () {
			$scope.pdfViewerAPI.findNext();
		};
		
		$scope.findPrev = function () {
			$scope.pdfViewerAPI.findPrev();
		};

		$scope.onPDFFileChanged = function () {
			$scope.isLoading = true;
			$scope.downloadProgress = 0;
			$scope.pdfZoomLevels = [];
			$scope.pdfSearchTerm = "";

			$scope.$apply(function () {
				$scope.pdfURL = "";
				$scope.pdfFile = document.getElementById('file_input').files[0];
			});
		};
		
		$scope.onPDFPassword = function (reason) {
			return prompt("The selected PDF is password protected. PDF.js reason: " + reason, "");
		};   
		
		showDocument();
	}
})();

