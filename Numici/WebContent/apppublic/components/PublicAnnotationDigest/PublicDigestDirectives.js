;(function(){
	'use strict';
	angular.module('vdvcPublicApp').directive('annotationDigestContent', function($templateCache) {
		  return {
		    restrict: "E",
		    scope: {
		    	digestData: '=',
		    	digestSettings : "=",
		    	digestFor : "=",
		    },
		    controller : ['$scope','CommonService','appData',
		                  'PublicDigestService','$templateCache','$compile','$timeout','$element','_',
				function ($scope,CommonService,appData,PublicDigestService,
						$templateCache,$compile,$timeout,$element,_) {
		    	var adcc = this;
		    	var appdata = appData.getAppData();
		    	// Instance variables
		    	if(_.isEmpty($scope.digestData)) {
		    		$scope.digestData = $scope.$parent.digestData;
		    	}
		    	if(_.isEmpty($scope.digestSettings)) {
		    		$scope.digestSettings = $scope.$parent.digestSettings;
		    	}

				adcc.content="";
		    	adcc.digestMetaInfoOptions = $scope.digestSettings.digestMetaInfoOptions
				adcc.digestData = $scope.digestData;
				adcc.enableBorder = PublicDigestService.enableBorder = $scope.digestSettings.enableBorder;
				adcc.digestFor = $scope.digestFor;
				adcc.imagePosition = $scope.digestSettings.imagePosition;
				adcc.tableOfContents = $scope.digestSettings.tableOfContents;
				adcc.tableOfContentsHeading = $scope.digestSettings.tableOfContentsHeading;
				adcc.displayOrder = $scope.digestSettings.displayOrder;
				adcc.displayReplies = $scope.digestSettings.filterOptions.displayReplies;
				adcc.digestName = $scope.digestSettings.digestName;
				adcc.digestDescription = $scope.digestSettings.digestDescription;
				adcc.groupBy = $scope.digestSettings.groupBy;
				// Methods
				
				var fileBaseUrl = CommonService.getBaseUrl();
				adcc.commentIconUrl = fileBaseUrl+"/app/assets/icons/digest_comment.png";
				
				adcc.setDigesMinMaxWidth = PublicDigestService.setDigesMinMaxWidth;
				adcc.getTitleStyles = PublicDigestService.getTitleStyles;
				adcc.alternateImageStyles = PublicDigestService.alternateImageStyles;
				adcc.setRepDigestStyles = PublicDigestService.setRepDigestStyles;
				
				var trustedAnnotatedText = {};
				
				adcc.getAnnotatedText = function (annotation) {
					if(!trustedAnnotatedText[annotation.annotationId]) {
						trustedAnnotatedText[annotation.annotationId] = PublicDigestService.getAnnotatedText(annotation,adcc.digestMetaInfoOptions);
					}
					return trustedAnnotatedText[annotation.annotationId];
				};
				
				adcc.formatCreatedDate = PublicDigestService.formatCreatedDate;
				adcc.formatComment = PublicDigestService.formatComment;
								
				function getDigestContent(saveflag) {
					return $timeout(function() {
						var templateUrl = 'apppublic/components/PublicAnnotationDigest/annotaion-digest-template.html';
						var roottemplateUrl = 'apppublic/components/PublicAnnotationDigest/digest-root.tpl.html';
												
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
						
						if(!_.isEmpty(adcc.digestName)) {
							tmpl = tmpl+' digest-name="'+adcc.digestName+'"';
							gptmpl = gptmpl+' digest-name="'+adcc.digestName+'"';
						}
						
						var digestUrl = "";
						if(!_.isEmpty(adcc.digestData) && adcc.digestFor == "DigestDocument" && adcc.digestMetaInfoOptions.documentLink) {
							digestUrl = PublicDigestService.getDigestUrlForDocuDigest(adcc.groupBy,adcc.digestData);
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
							task-space="taskspace"\
							title="true"\
							data-digest-for="adcc.digestFor"\
							data-digest-meta-info-options="adcc.digestMetaInfoOptions"\
							data-image-position="adcc.imagePosition"\
							data-table-of-contents="adcc.tableOfContents"\
							data-table-of-contents-heading="{{adcc.tableOfContentsHeading}}"\
							data-display-order="adcc.displayOrder"\
							data-display-replies="adcc.displayReplies"\
							data-enable-border="adcc.enableBorder"\
							data-group-by="adcc.groupBy"\
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
							task-space="taskspace"\
							data-digest-for="adcc.digestFor"\
							data-digest-meta-info-options="adcc.digestMetaInfoOptions"\
							data-image-position="adcc.imagePosition"\
							data-table-of-contents="adcc.tableOfContents"\
							data-table-of-contents-heading="{{adcc.tableOfContentsHeading}}"\
							data-display-order="adcc.displayOrder"\
							data-display-replies="adcc.displayReplies"\
							data-enable-border="adcc.enableBorder"\
							data-group-by="adcc.groupBy"\
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
					getDigestContent(true).then(function(content) {
						adcc.content = content;
						/*var divElement = $element.find('.digest-content');
						divElement.empty();
						divElement.append(content);
*/					}).finally(function() {
						$scope.$emit("digestLoaded");
				    });
				}
				init();
		    	
		    }],
		    controllerAs:"adcc",
		    templateUrl: function() {
				 return 'apppublic/components/PublicAnnotationDigest/annotationDigestContent.tmpl.html';
			}
		};
	});
	angular.module('vdvcPublicApp').directive('annotaionDigestTitle', function($templateCache) {
		  return {
		    restrict: "E",
		    scope: {
		    	taskSpace: "=",
		    	getTitleStyles : "&",
		    },
		    controller : ['$scope', '$element','$q','$timeout',
				function ($scope, $element,$q,$timeout) {
		    	var digestTitleSuffix ="Digest (generated by numici)";
		    	$scope.title = "";
		    	
		    	$scope.titleStyles = function() {
		    		return $scope.getTitleStyles();
		    	};
		    	
		    	function init() {
		    		if($scope.taskSpace) {
		    			$scope.title = $scope.taskSpace.name+" - "+digestTitleSuffix;
		    		} else {
		    			$scope.title =  digestTitleSuffix;
		    		}
		    	}
		    	init();
		    	
		    }],
		    templateUrl: function ($element, $attrs) {
	            return 'apppublic/components/PublicAnnotationDigest/digest-title-tmpl.html';
	        }
		   
		};
	});
	
	angular.module('vdvcPublicApp').directive('annotaionDigestTemplate', function($templateCache) {
		  return {
		    restrict: "E",
		    scope: {
		    	taskSpace: "=",
		    	digestData: '=digest',
		    	title:'=',
		    	numiciImage:"@",
		    	numiciLink:"@",
		    	numiciFooterText:"@",
		    	digestName:"@",
		    	digestUrl:"@",
		    	description:'@',
		    	templateUrl:"@",
		    	digestFor :"=",
		    	digestMetaInfoOptions :"=",
		    	enableBorder :"=",
		    	groupBy :"=",
		    	imagePosition :"=",
				tableOfContents:"=",
				tableOfContentsHeading:"@",
		    	displayOrder : "=",
		    	displayReplies : "=",
		    	
		    	setDigesMinMaxWidth : "&",
		    	getTitleStyles : "&",
		    	alternateImageStyles : "&",
		    	setRepDigestStyles : "&",
		    	getAnnotatedText : "&",
		    	formatCreatedDate : "&",
		    	formatComment : "&",
		    	
		    	commentIconUrl : "=",
		    	groupByIndex : "="
		    },
		    controller : ['$scope', 'PublicDigestService',
				function ($scope,PublicDigestService) {
		    	
		    	$scope.digesMinMaxWidth = function() {
		    		//return $scope.setDigesMinMaxWidth();
		    		return {'max-width': '648px','color': '#333','line-height': '1.5','margin': '0 auto','font-size': '14px'};
		    	};
		    	$scope.titleStyles = function() {
		    		return $scope.getTitleStyles();
		    	};
		    	$scope.altImageStyles = function() {
		    		return $scope.alternateImageStyles();
		    	};
		    	$scope.repDigestStyles= function(digest) {
		    		return $scope.setRepDigestStyles({digest : digest});
		    	};
                $scope.hasAnnotatedText = PublicDigestService.hasAnnotatedText;
		    	$scope.annotatedText = function(annotation) {
		    		return $scope.getAnnotatedText({annotation: annotation});
		    	};
		    	$scope.createdDate = function(dateValue) {
		    		return $scope.formatCreatedDate({dateValue:dateValue});
		    	};
		    	
		    	$scope.convertComment = function(annotation,comment) {
		    		return $scope.formatComment({"annotation":annotation,"comment" : comment});
		    	};
		    	
		    }],
		    link:function(scope){
		        scope.url = scope.templateUrl || 'apppublic/components/PublicAnnotationDigest/annotaion-digest-template.html';
		    },
		    /*templateUrl: function ($element, $attrs) {
	              //return $attrs.templateUrl || 'apppublic/components/PublicAnnotationDigest/annotaion-digest-template.html';
		    	return '<div ng-include="url"></div>';
	        }*/
		    template: '<div ng-include="url" data-ng-style="groupBy == \'document\' && {\'box-shadow\': \'3px 5px 5px 3px #aaaaaa\', \'max-width\': \'850px\', \'width\': \'100%\', \'margin\': \'auto\', \'padding\': \'15px\'}"></div>',
		};
	});
	
	
	angular.module('vdvcPublicApp').directive('annotaionDigestGroupTemplate', function() {
		  return {
		    restrict: "E",
		    scope: {
		    	taskSpace: "=",
		    	groupDigestData: '=digest',
		    	numiciImage:"@",
		    	numiciLink:"@",
		    	numiciFooterText:"@",
		    	digestName:'@',
		    	digestUrl:"@",
		    	description:'@',
		    	templateUrl:"@",
		    	digestFor :"=",
			    digestMetaInfoOptions :"=",
			    enableBorder :"=",
			    groupBy :"=",

		    	imagePosition :"=",
				tableOfContents:"=",
				tableOfContentsHeading:"@",
				
		    	displayOrder :"=",
		    	displayReplies :"=",
		    	
		    	setDigesMinMaxWidth : "&",
		    	getTitleStyles : "&",
		    	alternateImageStyles : "&",
		    	setRepDigestStyles : "&",
		    	getAnnotatedText : "&",
		    	formatCreatedDate : "&",
		    	formatComment : "&",
		    	
		    	commentIconUrl : "="
		    },
		    controller : ['$scope','PublicDigestService',
				function ($scope,PublicDigestService) {
		    	
				$scope.getTagAsID = function(name) {
					return PublicDigestService.getTagAsID(name);
				};

		    	$scope.digesMinMaxWidth = function() {
		    		return $scope.setDigesMinMaxWidth();
		    	};
		    	$scope.titleStyles = function() {
		    		return $scope.getTitleStyles();
		    	};
		    	$scope.altImageStyles = function() {
		    		return $scope.alternateImageStyles();
		    	};
		    	$scope.repDigestStyles= function(digest) {
		    		return $scope.setRepDigestStyles({digest : digest});
		    	};
                $scope.hasAnnotatedText = PublicDigestService.hasAnnotatedText;
		    	$scope.annotatedText = function(annotation) {
		    		return $scope.getAnnotatedText({annotation: annotation});
		    	};
		    	$scope.createdDate = function(dateValue) {
		    		return $scope.formatCreatedDate({dateValue:dateValue});
		    	};
		    	
		    	$scope.convertComment = function(annotation,comment) {
		    		return $scope.formatComment({"annotation":annotation,"comment" : comment});
		    	};
		    	
		    	$scope.getTagLable = function(name) {
		    		if(name == "$$untagged") {
		    			return "Untagged Annotations";
		    		}
		    		
		    		return name;
		    	};
		    	
		    	$scope.getTagStyles = function(name) {
		    		if(name == "$$untagged") {
		    			return {'color': '#069','padding': '0px'};
		    		}
		    		
		    		return {'color': '#069','padding': '0px'};
		    	};
		    	
		    	$scope.getTagValueLable = function(name, groupBy) {
			        return PublicDigestService.getTagValueLable(name, groupBy);
		    	};
		    }],
		    link:function(scope){
		        scope.url = scope.templateUrl || 'apppublic/components/PublicAnnotationDigest/annotaion-digest-template.html';
		        scope.grpUrl = 'apppublic/components/PublicAnnotationDigest/digest-group-template.html';
		    },
		    template: '<div ng-include="grpUrl" style="box-shadow: 3px 5px 5px 3px #aaaaaa; max-width: 850px; width: 100%; margin: auto; padding: 15px;"></div>',
		  };
	});
	angular.module('vdvcPublicApp').directive('commentToHtml', ['$sce','$filter','markdown','Juicify',function($sce,$filter,markdown,Juicify) {
		return {
	      replace: true,
	      restrict: 'E',
	      link: function (scope, element, attrs) {
	    	  scope.$watch('comment', function (newValue) {
	              var showdownHTML;
	              if(scope.annotation) {
	            	  var showdownHTMLTxt =  markdown.makeHtml(newValue || '');
	            	  showdownHTML = Juicify.inlineCss(showdownHTMLTxt,Juicify.cssMap[Juicify.markdownCssUrl]);
	  			  } else {
	  				  showdownHTML = $filter('linky')(newValue,'_blank');
	  			  }
	              
	              if(showdownHTML) {
	            	  scope.trustedHtml = $sce.trustAsHtml(showdownHTML);
	              }
	           });
          },
	      scope: {
	        comment: '=',
	        annotation:'='
	      },
	      template: '<div ng-bind-html="trustedHtml "></div>'
	    };
	}]);
	angular.module('vdvcPublicApp').filter('to_trusted', ['$sce', function($sce){
        return function(text) {
            return $sce.trustAsHtml(text);
        };
    }]);
    

    angular.module('vdvcPublicApp').directive('digestTableOfContents',function() {
		  return {
		    restrict: "E",
		    scope: {
		    	digestData: '=',
		    	digestMetaInfoOptions :"=",
				tableOfContents: "=",
				tableOfContentsHeading:"@",
				groupBy:"=",
				tableId:'@',
				templateFor:"@",
		    },
		    controller : ['$scope',"PublicDigestService",function ($scope,PublicDigestService) {
		    	$scope.title = $scope.tableOfContentsHeading || angular.copy(PublicDigestService.getTableOfContentsHeading());;
				$scope.getTagAsID = function(name) {
					return PublicDigestService.getTagAsID(name);
				};
				$scope.getTagValueLable = function(name, groupBy) {
					return PublicDigestService.getTagValueLable(name, groupBy);
				};
				$scope.getTagStyles = function(name) {
					return PublicDigestService.getTagStyles(name);
				};
				$scope.getTagLable = function(name) {
					return PublicDigestService.getTagLable(name);
				};
				
				$scope.getTblOfContLinkStyles = function() {
					return {
						"text-decoration": "none", 
						"color": "#069",
						"font-size": "18px"};
				};
				
				$scope.getTblOfContListStyles = function() {
					return {
						"display": "table",
						"color": "#069",
						"font-size": "18px"
					};
				};
				
				$scope.getTblOfContIndexStyles = function() {
					return {
						"display": "table-cell",
						"padding-right": "20px",
						"font-size": "0.8em",
						"word-break": "keep-all",
						"text-align": "left"
					};
				};
				
				$scope.getTblOfContLableStyles = function() {
					return {
						"display": "table-cell",
						"word-break": "break-word"
					};
				};
		    }],
		    templateUrl: function ($element, $attrs) {
			    if($attrs.templateFor) {
					if($attrs.templateFor == "tag") {
						return 'apppublic/components/PublicAnnotationDigest/tbc-tag-tmpl.html'; 
					} else if($attrs.templateFor == "document") {
						return 'apppublic/components/PublicAnnotationDigest/tbc-doc-tmpl.html';
					} else if($attrs.templateFor == "section") {
						return 'apppublic/components/PublicAnnotationDigest/tbc-sec-tmpl.html';
					}
				}
				return 'apppublic/components/PublicAnnotationDigest/tbc-default-tmpl.html';
	        }
		  };
/*	}).directive('digestLinkToTableOfContents',function() {
		  return {
		    restrict: "E",
			replace:true,
		    scope: {
		    	tableId:'@',
		    },
		    template: '<span>&nbsp;<a ng-href="#{{tableId}}" style="text-decoration: none;color: #069;">(top)</a></span>'
		  };*/
	}).directive('digestIframe', ['$compile','_','PublicDigestService', function($compile,_,PublicDigestService) {
		  return {
		    restrict: 'E',
		    scope: {
		      content: '='
		    },
		    link: function(scope, element, attrs) {
			    var delta = 20;
		        var iframe = document.createElement('iframe');
				iframe.style.outline = "none";
	    		iframe.style.border = "none";
	    		iframe.style.width = "100%";
	    		iframe.style.height = "calc(100% - 10px)";
			    var element0 = element[0];
			    element0.appendChild(iframe);
			
			    scope.$watch('content', function () {
			      iframe.contentWindow.document.open('text/htmlreplace');
			      iframe.contentWindow.document.write(scope.content);
			      iframe.contentWindow.document.close();
			    });

				iframe.onload = (e) => {
					//iframe.style.height = iframe.contentWindow.document.documentElement.scrollHeight + 'px';
					iframe.style.height = iframe.contentWindow.document.documentElement.scrollHeight + 'px';
					iframe.contentWindow.document.documentElement.style.paddingBottom = "10px";
					iframe.style.maxHeight = $(".vdst").outerHeight()+"px";
					var handleScroll = _.debounce(function() {
						var _document = iframe.contentWindow.document;
						$(_document).find("[data-doc-id]").each(function(i,el) {
							if(isInViewport(el,_document)) {
								PublicDigestService.docInView = $(el).attr("data-doc-id");
								var docInfo = $(el).find("[data-docInfo]");
								//var rect = docEl.getBoundingClientRect();
								if(docInfo && docInfo.length > 0 && !isInViewport(docInfo,_document)) {
									$(el).find("[data-annotId]").each(function(ind,ael) {
										if(isInViewport(ael,_document)) {
											PublicDigestService.annotInView = $(ael).attr("data-annotId");
											return false;
										}
									});
								}
								return false;
							}
						});
					}, 300);
					
					e.target.contentWindow.addEventListener('scroll', evt => {
				      	// Enable handleScroll after Implementing showing new digest entries as diffs	
						
						//handleScroll();
						onScroll(evt);
				    });

                   if(PublicDigestService.docInView) {
	                    var docEl = $(iframe.contentWindow.document).find("[data-doc-id="+PublicDigestService.docInView+"]");
						if(docEl.length > 0) {
							if(PublicDigestService.annotInView) {
								var annotEl = docEl.find("[data-annotId="+PublicDigestService.annotInView+"]");
								if(annotEl.length > 0) {
									annotEl[0].scrollIntoView();
									return;
								}
							} 
							docEl[0].scrollIntoView();
						}
				   } else {
						iframe.contentWindow.scrollTo(0, 0);
				   }
				}
				
				function onScroll(evt) {
					if (evt.currentTarget.scrollY > 200) {
						$(angular.element('.vdvc-scroll-top')[0]).css('display','block');
					} else {
						$(angular.element('.vdvc-scroll-top')[0]).css('display','none');
					}
				}
					
				function isInViewport(el,window) {
					var elementTop = $(el).offset().top+delta;
					var elementBottom = elementTop + $(el).outerHeight()-delta;
					var viewportTop = $(window).scrollTop();
					var viewportBottom = viewportTop + $(window).height();
					return elementBottom > viewportTop && elementTop < viewportBottom;
				};
		    }
		  }
		}
	]);
})();