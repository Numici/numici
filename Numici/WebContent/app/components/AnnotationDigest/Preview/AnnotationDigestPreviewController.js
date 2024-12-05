;(function() {
	'use strict';
	angular.module('vdvcApp').directive('annotationDigestContent', function($templateCache) {
		  return {
		    restrict: "E",
		    scope: {
		    	digestData: '=',
		    	digestSettings : "=",
		    },
		    controller : ['$scope','appData','commonService',
		                  'AnnotationDigestService','$templateCache','$compile','$timeout','$element',
				function ($scope,appData,commonService,AnnotationDigestService,
						$templateCache,$compile,$timeout,$element) {
		    	var adcc = this;
		    	var appdata = appData.getAppData();
		    	// Instance variables
				adcc.digestMetaInfoOptions = $scope.digestSettings.digestMetaInfoOptions
				adcc.digestData = $scope.digestData;
				adcc.enableBorder = AnnotationDigestService.enableBorder = $scope.digestSettings.enableBorder;
				adcc.imagePosition = $scope.digestSettings.imagePosition;
				adcc.tableOfContents = $scope.digestSettings.tableOfContents;
		        adcc.tableOfContentsHeading = $scope.digestSettings.tableOfContentsHeading;
				adcc.displayOrder = $scope.digestSettings.displayOrder;
				adcc.displayReplies = $scope.digestSettings.displayReplies;
				adcc.digestName = $scope.digestSettings.digestName;
				adcc.digestDescription = $scope.digestSettings.digestDescription;
				adcc.groupBy = $scope.digestSettings.groupBy;
				adcc.digestFor = $scope.digestSettings.digestFor;
				// Methods
				
				adcc.hasAnnotatedText = AnnotationDigestService.hasAnnotatedText;
				var fileBaseUrl = commonService.getContext();
				adcc.commentIconUrl = fileBaseUrl+"/app/assets/icons/digest_comment.png";
				
				adcc.setDigesMinMaxWidth = AnnotationDigestService.setDigesMinMaxWidth;
				adcc.getTitleStyles = AnnotationDigestService.getTitleStyles;
				adcc.alternateImageStyles = AnnotationDigestService.alternateImageStyles;
				adcc.setRepDigestStyles = AnnotationDigestService.setRepDigestStyles;
				
				var trustedAnnotatedText = {};
				
				adcc.getAnnotatedText = function (annotation) {
					
					if(!trustedAnnotatedText[annotation.annotationId]) {
						trustedAnnotatedText[annotation.annotationId] = AnnotationDigestService.getAnnotatedText(annotation,adcc.digestMetaInfoOptions);
					}
					return trustedAnnotatedText[annotation.annotationId];
					
				};
				
				adcc.formatCreatedDate = AnnotationDigestService.formatCreatedDate;
				adcc.formatComment = AnnotationDigestService.formatComment;
								
				function getDigestContent(saveflag,contenteditable) {
					return $timeout(function() {
						var templateUrl = 'app/components/AnnotationDigest/save/annotaion-digest-template-new.html';
						var roottemplateUrl = 'app/components/AnnotationDigest/save/digest-root.tpl.html';
						
						var tmpl = '';
						var gptmpl = '';
						tmpl = '<annotaion-digest-template digest="adcc.digestData"';
						gptmpl = '<annotaion-digest-group-template digest="adcc.digestData"';
						
						var numiciImage = appdata.numiciImage;
						var numiciLink = appdata.numiciLink;
						var numiciFooterText = appdata.numiciFooterTxt;
						
						tmpl = tmpl+' numici-image="'+numiciImage+'"';
						gptmpl = gptmpl+' numici-image="'+numiciImage+'"';
						
						tmpl = tmpl+' numici-link="'+numiciLink+'"';
						gptmpl = gptmpl+' numici-link="'+numiciLink+'"';
						
						tmpl = tmpl+' numici-footer-text="'+numiciFooterText+'"';
						gptmpl = gptmpl+' numici-footer-text="'+numiciFooterText+'"';
						
						tmpl = tmpl+' show-numici-header="false"';
						gptmpl = gptmpl+' show-numici-header="false"';
						
						if(!_.isEmpty(adcc.digestName)) {
							tmpl = tmpl+' digest-name="'+adcc.digestName+'"';
							gptmpl = gptmpl+' digest-name="'+adcc.digestName+'"';
						}
						
						var digestUrl = "";
						if(!_.isEmpty(adcc.digestData) && adcc.digestFor == "DigestDocument" && adcc.digestMetaInfoOptions.documentLink) {
							digestUrl = AnnotationDigestService.getDigestUrlForDocuDigest(adcc.groupBy,adcc.digestData);
						}
						tmpl = tmpl+' digest-url="'+digestUrl+'"';
						gptmpl = gptmpl+' digest-url="'+digestUrl+'"';
						
						if(!_.isEmpty(adcc.digestDescription)) {
							var digestDescription = angular.copy(adcc.digestDescription);
							digestDescription = digestDescription.replace(/(\r\n|\n|\r)/gm, "<br>").replace(/"/g,"&quot;");
							tmpl = tmpl+' description="'+digestDescription+'"';
							gptmpl = gptmpl+' description="'+digestDescription+'"';
						}
						
/*						tmpl = tmpl+' enable-border="'+adcc.enableBorder+'"';
						gptmpl = gptmpl+' enable-border="'+adcc.enableBorder+'"';*/
						
						/*if(!_.isEmpty(adcc.imagePosition)) {
							tmpl = tmpl+' selected-image-position="'+adcc.imagePosition+'"';
							gptmpl = gptmpl+' selected-image-position="'+adcc.imagePosition+'"';
						}*/
						
						tmpl = tmpl+' template-url="'+templateUrl+'" \
							data-content-editable="'+contenteditable+'"\
							task-space="taskspace"\
							title="true"\
							data-digest-for="adcc.digestFor"\
							data-digest-meta-info-options="adcc.digestMetaInfoOptions"\
							data-image-position="adcc.imagePosition"\
							data-table-of-contents="adcc.tableOfContents"\
							data-table-of-contents-heading="{{adcc.tableOfContentsHeading}}"\
							data-enable-border="adcc.enableBorder"\
							data-group-by="adcc.groupBy"\
							data-display-order="adcc.displayOrder"\
							data-display-replies="adcc.displayReplies"\
							data-set-diges-min-max-width= "adcc.setDigesMinMaxWidth()"\
							data-get-title-styles = "adcc.getTitleStyles()"\
							data-alternate-image-styles = "adcc.alternateImageStyles()"\
							data-set-rep-digest-styles = "adcc.setRepDigestStyles(digest,adcc.digestMetaInfoOptions.image)"\
							data-get-annotated-text = "adcc.getAnnotatedText(annotation)"\
							data-format-created-date = "adcc.formatCreatedDate(dateValue)"\
							data-format-comment="adcc.formatComment(annotation,comment)"\
					    	comment-icon-url = "adcc.commentIconUrl"\
							></annotaion-digest-template>';
						
						gptmpl = gptmpl+' template-url="'+templateUrl+'" \
							data-content-editable="'+contenteditable+'"\
							task-space="taskspace"\
							data-digest-for="adcc.digestFor"\
							data-digest-meta-info-options="adcc.digestMetaInfoOptions"\
							data-image-position="adcc.imagePosition"\
							data-table-of-contents="adcc.tableOfContents"\
							data-table-of-contents-heading="{{adcc.tableOfContentsHeading}}"\
							data-enable-border="adcc.enableBorder"\
							data-group-by="adcc.groupBy"\
							data-display-order="adcc.displayOrder"\
							data-display-replies="adcc.displayReplies"\
							data-set-diges-min-max-width= "adcc.setDigesMinMaxWidth()"\
							data-get-title-styles = "adcc.getTitleStyles()"\
							data-alternate-image-styles = "adcc.alternateImageStyles()"\
							data-set-rep-digest-styles = "adcc.setRepDigestStyles(digest,adcc.digestMetaInfoOptions.image)"\
							data-get-annotated-text = "adcc.getAnnotatedText(annotation)"\
							data-format-created-date = "adcc.formatCreatedDate(dateValue)"\
							data-format-comment="adcc.formatComment(annotation,comment)"\
					    	comment-icon-url = "adcc.commentIconUrl"\
							></annotaion-digest-group-template>';
						
						var template = angular.element(tmpl);
						if(adcc.groupBy == "tag" || adcc.groupBy == "taghierarchical" || adcc.groupBy == "section") {
							template = angular.element(gptmpl);
						} else {
						    template = angular.element(tmpl);
						}
						var linkFunction = $compile(template);
						var result = linkFunction($scope);
						$scope.$digest();
						if(saveflag) {
							var rootTemplate = $templateCache.get(roottemplateUrl);
							if(!_.isEmpty(rootTemplate)) {
								return rootTemplate.replace("<!--digestdata-->",template.html());
							}
							return template.html();
						} else {
							return template.html();
						}
						
					}, 0);
				}
				
				function init() {
					getDigestContent(true,false).then(function(content) {
						//adcc.content = content;
						var divElement = $element.find('.digest-content');
						divElement.empty();
						divElement.append(content);
					});
				}
				init();
		    	
		    }],
		    controllerAs:"adcc",
		    template: '<div class="full digest-content"></div>'
		};
	});
	
	angular.module('vdvcApp').controller('AnnotationDigestPreviewController',AnnotationDigestPreviewController);
	
	AnnotationDigestPreviewController.$inject = ['$scope','$uibModalInstance','appData','DigestData'];

	function AnnotationDigestPreviewController($scope,$uibModalInstance,appData,DigestData) {
		var adpc = this;
		var appdata = appData.getAppData();
		
		// Instance variables
		adpc.digestData = DigestData.digestData;
		adpc.digestSettings = angular.copy(DigestData);
		adpc.numiciImage = appdata.numiciImage;
		adpc.numiciLink = appdata.numiciLink;
		adpc.numiciHeaderText = appdata.numiciHeaderTxt;
		
		// Methods
		adpc.close = close;
				
		function close() {
			$uibModalInstance.close();
		}
		
	}
})();