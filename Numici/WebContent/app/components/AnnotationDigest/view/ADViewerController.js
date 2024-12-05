;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('ADViewerController',ADViewerController);
	
	ADViewerController.$inject = ['$scope','commonService','appData','$state','$stateParams','$uibModal',
	                              '$filter','$compile','$timeout','AnnotationDigestService','MessageService',
	                              'defautlDateFormat','DocFactory','uuidService','$window'];

	function ADViewerController($scope,commonService,appData,$state,$stateParams,$uibModal,$filter,$compile,
			$timeout,AnnotationDigestService,MessageService,defautlDateFormat,DocFactory,uuidService,$window) {
		
		var config = angular.copy(AnnotationDigestService.getDigestFilters());
		config.sortOptions = {"documentName" : "desc"};
		var fileBaseUrl = commonService.getContext();
		var tsClientId = $stateParams.tsc;
		var saveFor = "";
		var adv = this;
		
		adv.openInContextIconUrl = fileBaseUrl+"/app/assets/icons/open-in-context.png";
		adv.digestData = [];
		adv.digestMetaInfoOptions = angular.copy(config.digestMetaInfoOptions);
		
		adv.annotationMetaInfo = annotationMetaInfo;
		adv.conversationMetaInfo = conversationMetaInfo;
		adv.annotationMetaInfoForDL = annotationMetaInfoForDL;
		adv.conversationMetaInfoForDL = conversationMetaInfoForDL;
		adv.getUserlabel = getUserlabel;
		adv.saveAsDoc = saveAsDoc;
		adv.saveAsPdf = saveAsPdf;
		adv.annotationsDigest = annotationsDigest;
				
		function formatDate(dateValue) {
			var date = moment(dateValue,moment.defaultFormat).toDate();
			var formatedDate = $filter('date')(date,'yyyy-MM-dd HH:mm:ss');
			return formatedDate;
		}
		
		function annotationMetaInfo(annotation) {
			var tooltipTemplate =  '<div style="color: #666;font-size: 11px;">\
							<div>'+annotation.annotationCreatedBy+'</div>\
							<div>Created On: '+formatDate(annotation.annotationCreatedTime)+'</div>\
							<div>Updated On: '+formatDate(annotation.annotationUpdatedTime)+'</div>\
						</div>';
			return tooltipTemplate;
		}
		
		function conversationMetaInfo(conv) {
			var tooltipTemplate =  '<div style="color: #666;font-size: 11px;">\
							<div>'+conv.commentedBy+'</div>\
							<div>Created On: '+formatDate(conv.createdTime)+'</div>\
							<div>Updated On: '+formatDate(conv.updatedTime)+'</div>\
						</div>';
			return tooltipTemplate;
		}
		
		function annotationMetaInfoForDL(annotation) {
			var tooltipTemplate =  annotation.annotationCreatedBy+'\nCreated On: '+formatDate(annotation.annotationCreatedTime)+'\nUpdated On: '+formatDate(annotation.annotationUpdatedTime);
			return tooltipTemplate;
		}
		
		function conversationMetaInfoForDL(conv) {
			var tooltipTemplate =  conv.commentedBy+'\nCreated On: '+formatDate(conv.createdTime)+'\nUpdated On: '+formatDate(conv.updatedTime);
			return tooltipTemplate;
		}
				
		function getUserlabel(name) {
 			var lbl = "";
 			if(_.isString(name) && name.trim()) {
 				var matches = name.match(/\b(\w)/g);
 				lbl = matches.join('');
 			}
 			return lbl.toUpperCase();
 		}
 		
		function annotationsDigest(event) {
			if(event) {
				event.stopPropagation();
			}
			
			var modalInstance = $uibModal.open({
			      animation: true,
			      templateUrl: 'app/components/AnnotationDigest/create/AnnotationDigest.html',
			      controller: 'AnnotationDigestController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'ad',
			      backdrop: 'static',
			      size: "lg",
			      resolve: {
			    	  filters :function() {
			    		  return config;
			    	  }
			      }
			    });
			
			modalInstance.result.then(function (obj) {	
				config = obj;
				adv.digestMetaInfoOptions = angular.copy(config.digestMetaInfoOptions);
				createAnnotationDigest();
			});
		}
		
		function createAnnotationDigest() {
			var postdata = {
					"objectId": $scope.tsId, 
					"clientId": $scope.tsClientId,
					"context" : "taskspace",
					"filterOptions" : config.filterOptions,
					"sortOptions" : config.sortOptions
			};
			
			if( !moment(postdata.filterOptions.endDate,defautlDateFormat,true).isValid()) {
				postdata.filterOptions.endDate = null;
			}
			
			if( !moment(postdata.filterOptions.startDate,defautlDateFormat,true).isValid()) {
				postdata.filterOptions.startDate = null;
			}
			
			AnnotationDigestService.create(postdata).then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					if(_.isEmpty(resp.data.AnnotationDigest)) {
						MessageService.showInfoMessage("ANNOTATION_DIGEST_NODATA_INFO");
						adv.digestData = [];
					} else {
						var digestList = resp.data.AnnotationDigest;
						_.each(digestList,function(digest,index) {
							if(!_.isEmpty(digest.annotations)) {
								digest.link = contextLink(digest,digest.annotations[0]);
								_.each(digest.annotations,function(annotation,index) {
									annotation.link = contextLink(digest,annotation);
								});
							}
						});
						adv.digestData = digestList;
					}
				}
				$scope.$emit("objectLoaded",false);
			});
		}
		
		function getDigestContent() {
			return $timeout(function() {
				var template = angular.element('<digest-save-template></digest-save-template>');
				if(saveFor === "doc") {
					template = angular.element('<digest-save-doc-template></digest-save-doc-template>');
				}
				var linkFunction = $compile(template);
				var result = linkFunction($scope);
				$scope.$digest();
				console.log(template.html());
				return "<html><body>"+template.html()+"</body></html>";
				
			}, 0);
		}
				
		function saveAsDoc($event){
			saveFor = "doc";
			getDigestContent().then(function(content) {
				var postdata = {};
				postdata.context = "taskspace";
				postdata.objectId = $scope.tsId;
				postdata.clientId = $scope.tsClientId;
				postdata.digestData = adv.digestData;
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
			saveFor = "pdf";
			getDigestContent().then(function(content) {
				var postdata = {};
				postdata.pdfFileName = "Digest-"+uuidService.newUuid()+".pdf";
				postdata.content = content;
				DocFactory.downloadDocumentAsPdf(postdata,{ responseType:'arraybuffer'}).then(function(resp) {
					if(resp.status == 200) {
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
		
		createAnnotationDigest();
	}	
	
})();