;(function() {
	'use strict';
	
	angular.module('vdvcApp').directive('digestViewer', function() {
		  return {
		    restrict: "E",
		    templateUrl:'app/components/AnnotationDigest/digestViewer.html',
		    controller:'DocViewerController'
		  }
	});
	
	angular.module('vdvcApp').directive('digestSaveTemplate', function() {
		  return {
		    restrict: "E",
		    templateUrl:'app/components/AnnotationDigest/save/DigestTemplate.html'
		  }
	});
	
	angular.module('vdvcApp').directive('digestSaveDocTemplate', function() {
		  return {
		    restrict: "E",
		    templateUrl:'app/components/AnnotationDigest/save/DigestDocTemplate.html'
		  }
	});
	
	angular.module('vdvcApp').controller('AnnotationDigestViewerController',AnnotationDigestViewerController);
	
	AnnotationDigestViewerController.$inject = ['$scope','commonService','appData','$state','$stateParams','$uibModalInstance','digestData','digestFilters','tsClientId','$compile','$timeout','AnnotationDigestService','DocFactory','uuidService','APIUserMessages','$window'];

	function AnnotationDigestViewerController($scope,commonService,appData,$state,$stateParams,$uibModalInstance,digestData,digestFilters,tsClientId,$compile,$timeout,AnnotationDigestService,DocFactory,uuidService,APIUserMessages,$window) {
		var adv = this;
		
		var viewScope;
		var currentDocId;
		
		var fileBaseUrl = commonService.getContext();
		
		adv.loader = false;
		adv.digestData = digestData;
		adv.onSelectDocument = onSelectDocument;
		adv.onSelectComment = onSelectComment;
		adv.close = close;
		adv.saveAsDoc = saveAsDoc;
		adv.saveAsPdf = saveAsPdf;
		adv.contextLink = contextLink;
		
		$scope.$on('objectLoaded',function(event,msg){
			adv.loader = false;
		});
		
		function onSelectDocument($event,digest){
			if(currentDocId === digest.documentId) {
				// Do nothing
			} else {
				openDocument(digest,digest.annotations[0]);
				currentDocId = digest.documentId;
			}
		}
		
		function onSelectComment($event,digest,annotation){
			if(currentDocId === digest.documentId) {
				notifyCommentSelected(annotation.annotationId);
			} else {
				openDocument(digest,annotation);
				currentDocId = digest.documentId;
			}
		}
		
		function notifyCommentSelected(annotationId) {
			$scope.$broadcast("onSelectComment",annotationId);
		}
		
		function openDocument(digest,annotation) {
			
			adv.loader = true;
			
			clearLayout();
			
			var divElement = angular.element(document.querySelector('.digest-content'));
			var template = '<digest-viewer></digest-viewer>';
			viewScope = $scope.$new();
			viewScope.documentId = digest.documentId;
			viewScope.clientId = digest.clientId;
			viewScope.commentId = annotation.annotationId;
		    var appendHtml = $compile(template)(viewScope);
		    divElement.append(appendHtml);
		    
		}
		
		function clearLayout() {
			var divElement = angular.element(document.querySelector('.digest-content'));
			if(viewScope) {
				viewScope.$destroy();
			}
			divElement.empty();
		}
		
		function close() {
			$uibModalInstance.dismiss('cancel');
		}
		
		function getDigestContent() {
			return $timeout(function() {
				
				var template = angular.element('<digest-save-template></digest-save-template>');
				var linkFunction = $compile(template);
				var result = linkFunction($scope);
				$scope.$digest();
				console.log(template.html());
				return "<html><body>"+template.html()+"</body></html>";
				
			}, 0);
		}
		
		function saveAsDoc($event){
			
			getDigestContent().then(function(content) {
				
				var postdata = {};
				postdata.digestData = digestData;
				postdata.clientId = tsClientId;
				postdata.context = digestFilters.context;
				postdata.objectId = digestFilters.objectId;
				postdata.content = content;
				AnnotationDigestService.saveAsDocument(postdata).then(function(resp) {
					if(resp.status == 200 && resp.data.Status) {
						var doc = resp.data.AnnotationDigest;
						if(doc) {
							var appdata = appData.getAppData();
							$state.go("docview",{"docId":doc.id,"clientId":appdata.OrganizationId});
						}
					}
				});
			}); 
		}
		
		function saveAsPdf($event){
			
			getDigestContent().then(function(content) {
				var postdata = {};
				postdata.pdfFileName = "Digest-"+uuidService.newUuid()+".pdf";
				postdata.content = content;
				DocFactory.downloadDocumentAsPdf(postdata,{ responseType:'arraybuffer'}).then(function(resp) {
					if(resp.status == 200 ) {
						 var file = new Blob([resp.data], {type: 'application/pdf'});
					     var fileURL = URL.createObjectURL(file);
					     var link = document.createElement('a');
					     link.href = fileURL;
					     link.download = postdata.pdfFileName;
					     document.body.appendChild(link);
					     link.click();
					     document.body.removeChild(link);
					     $window.open(fileURL);
					}
				});
			}); 
		}
		
		function contextLink(digest,annotation) {
			var link = fileBaseUrl+"list/task/"+$stateParams.tsId+"?tsc="+$stateParams.tsc+"&d="+digest.documentId+"&dc="+digest.clientId;
			if(digest.sourceURL && digest.documentType == "WebResource") {
				link = fileBaseUrl+"webannotation?target="+encodeURIComponent(digest.sourceURL)+"&cid="+digest.clientId+"&tsId="+$stateParams.tsId;
				if(annotation) {
					link = link + "&annotationId="+annotation.annotationId;
				}
				return link;
			}
			if(annotation) {
				link = link +"&da="+annotation.annotationId;
			}
			return link;
		}
	}	
	
})();