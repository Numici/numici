;(function(){
	'use strict';
	angular.module("vdvcPublicApp").factory("PublicDigestService", ['$rootScope','httpService','$uibModal','$window','markdown','Juicify','_','CommonService','$filter',
	                                                    function($rootScope,httpService,$uibModal,$window,markdown,Juicify,_,CommonService,$filter) {
		
		const digestUpdateTitle = "Digest content has been updated. Click to refresh.";
		var fileBaseUrl = CommonService.getBaseUrl();
		var protectedDocImage = fileBaseUrl+"/app/assets/images/prtectedDocument.png";
		var imageWrapWidthPercent = 35;
		var trustedAnnotatedText = {};
		var enableBorder = "";
		var groupBy = "";
		var imagePosition = "left";
		var displayOrder = "regular";
		var displayReplies = "donotshowreplies";
		var taskspaceId = "";
		var taskspaceClientId = ""
		var annotationLink = false;
		var tableOfContentsHeading = "Table of Contents";
		var service = {
				trustedAnnotatedText : trustedAnnotatedText,
				taskspaceId : taskspaceId,
				taskspaceClientId : taskspaceClientId,
				annotationLink : annotationLink,
				enableBorder : enableBorder,
				groupBy : groupBy,
				imagePosition : imagePosition,
				displayOrder : displayOrder,
				displayReplies : displayReplies,
				preProcessAnnotationDigestResp : preProcessAnnotationDigestResp,
				setDigesMinMaxWidth : setDigesMinMaxWidth,
				getTitleStyles : getTitleStyles,
				alternateImageStyles : alternateImageStyles,
				setRepDigestStyles : setRepDigestStyles,
				hasAnnotatedText: hasAnnotatedText,
				getAnnotatedText : getAnnotatedText,
				formatCreatedDate : formatCreatedDate,
				formatComment : formatComment,
				
				getTagAsID : getTagAsID,
				getTagValueLable: getTagValueLable,
				getTagStyles: getTagStyles,
				getTagLable: getTagLable,
				
				getTableOfContentsHeading: getTableOfContentsHeading,
				notificationHandledelayTime: 20000,
                maxNotifications: 5,
				digestUpdateTitle: digestUpdateTitle,
				getDigestUrlForDocuDigest : getDigestUrlForDocuDigest
		};
		
		function stringifyTags(tags) {
			var tgs = [];
			if(_.isArray(tags)) {
				_.each(tags,function(tag,ind) {
					 var tagString = tag.name;
					 if(_.isArray(tag.values)) {
						 _.each(tag.values,function(val,i) {
							 tagString = tag.name;
							 if(val) {
								 tagString = tagString+":"+val;
							 } 
							 tgs.push(tagString);
						 });
					 } else {
						 tgs.push(tagString);
					 }
				});
			}
			
			return tgs;
		}
		
		function contextLink(digest,annotation,deepLinkId,taskspace) {
			var link = "",
			    tsId= taskspace ? taskspace.tsId : null,
	            tsClientId = taskspace ? taskspace.tsClientId : null;
			if(!annotation && !_.isEmpty(digest.docLink)) {
				link = digest.docLink;
			} else if(annotation && !_.isEmpty(annotation.annotationLink)) {
				link = annotation.annotationLink;
			} else {
				if(!_.isEmpty(deepLinkId)) {
					link = fileBaseUrl+"linkrouter?dlid="+deepLinkId+"&t="+tsId+"&d="+digest.documentId;
					if(annotation) {
						link = link + "&a="+annotation.annotationId;
					}
				} else {
					link = fileBaseUrl+"list/task/"+tsId+"?tsc="+tsClientId+"&d="+digest.documentId+"&dc="+digest.clientId;
					if(digest.sourceURL && digest.documentType == "WebResource") {
						link = fileBaseUrl+"webannotation?target="+encodeURIComponent(digest.sourceURL)+"&cid="+digest.clientId+"&tsId="+tsId;
						if(annotation) {
							link = link + "&annotationId="+annotation.annotationId;
						}
						return link;
					}
					if(annotation) {
						link = link +"&da="+annotation.annotationId;
					}
				}
			}
			return link;
		}
		
		function processDigestData(digestList,groupBy,deepLinkId,taskspace) {
			_.each(digestList,function(digest,index) {
				digest.diIndex = index+1;
				digest.link = contextLink(digest,null,deepLinkId,taskspace);
				if(!_.isEmpty(digest.annotations)) {
					_.each(digest.annotations,function(annotation,index) {
						annotation.link = contextLink(digest,annotation,deepLinkId,taskspace);
						annotation.tags = stringifyTags(annotation.multiTags) || [];
					});
				}
				
				if(!_.isEmpty(digest.multiTags)) {
					digest.tags = stringifyTags(digest.multiTags) || [];
				}
				
				if(digest.documentType && digest.documentType == 'Notes') {
					if(digest.content) {
						var notesContent = Juicify.inlineCss(digest.content,Juicify.cssMap[Juicify.markdownCssUrl]);
						digest.content = notesContent;
					}
				}
			});
			
			return digestList;
		}
		
		function preProcessAnnotationDigestResp(linkAnnotationDigestResp,config,deepLinkId,taskspace) {
			var digestData = [];
			var tagIndex = 0;
			if(config.groupBy == "tag" || config.groupBy == "taghierarchical") {
				_.each(linkAnnotationDigestResp,function(digest,index) {
					digest.diIndex = index+1;
					digest.tagValLable = getTagLable(digest.tagName);
					if(_.isArray(digest.entries)) {
						var taghierarchicalIndex = 0;
						_.each(digest.entries,function(entries,ind) {
							let tagValLable = getTagValueLable(entries.tagValue,config.groupBy);
							entries.tagValLable = tagValLable;
							if(!_.isEmpty(tagValLable)) {
								if(config.groupBy == "tag") {
									tagIndex += 1;
									entries.diIndex = tagIndex;
								} else {
									taghierarchicalIndex++;
									entries.diIndex = taghierarchicalIndex;
								}
							}
							if(_.isArray(entries.digest)) {
								digest.entries[ind].digest = processDigestData(entries.digest,config.groupBy,deepLinkId,taskspace);
							}
						});
						linkAnnotationDigestResp[index].entries = digest.entries;
					}
				});
				digestData = angular.copy(linkAnnotationDigestResp);
			} else if(config.groupBy == "section"){
				_.each(linkAnnotationDigestResp,function(section,index) { 
					section.diIndex = index+1;
					if(_.isEmpty(section.section)) {
						section.section = "Documents without a Section"
					}
					if(_.isArray(section.documents)) {
						 _.each(section.documents,function(document,ind) {
							tagIndex += 1;
							document.diIndex = tagIndex;
						 });
						 if(_.isArray(section.documents)) {
							 linkAnnotationDigestResp[index].documents = processDigestData(section.documents,deepLinkId,taskspace);
						 }
					}
				});
				digestData = angular.copy(linkAnnotationDigestResp);
			} else {
				var digestDataTemp = processDigestData(linkAnnotationDigestResp,config.groupBy,deepLinkId,taskspace);
				digestData = angular.copy(digestDataTemp);
			}
			return digestData;
		}
		
		function setDigesMinMaxWidth() {
			return {'max-width': '648px','color': '#333','line-height': '1.5','margin': '0 auto','font-size': '14px'};
		}
		
		function getTitleStyles() {
			return {'cursor': 'pointer', 'font-weight': '700','margin': '1em 0em','font-size': '16px','margin-block-start':' 1em','margin-block-end': '1em'};
		}
		
		function alternateImageStyles() {
			var imageStyles = {};
			if(!_.isEmpty(service.enableBorder)) {
				imageStyles["border-width"] = "2px";
				imageStyles["border-color"] = "#000000";
				imageStyles["border-style"] = "solid";
			}
			return imageStyles;
		} 
		
		function setRepDigestStyles(digest,digestMetaInfoImageOption) {
			if(!_.isEmpty(digest.imageUrl) && digestMetaInfoImageOption) {
				var width = 100 - imageWrapWidthPercent;
				return {'width': 'calc('+width+'% - 1em)','float': 'left'};
			} else {
				return {'width': '100%'};
			}
		}
		
		function hasAnnotatedText(annotation) {
			return annotation.annotatedText || annotation.text || annotation.formatedText || annotation.formatedtext;// || annotation.screenshotUrl;
		};
		
		function getAnnotatedText(annotation,filter) {
			
			var annotatedText = annotation.annotatedText || annotation.text;
			var formatedText = annotation.formatedtext || annotation.formatedText;
			
			if(!_.isEmpty(annotatedText)) {
				annotatedText = "<div style='border:none;background:#fff;white-space: pre-wrap;word-break: break-word;'>"+annotation.annotatedText+"</div>";
			}
			
			if(!_.isEmpty(formatedText)) {
				var mtoHtml = markdown.makeHtml(formatedText);
				var mtoHtmlWithcss = Juicify.inlineCss(mtoHtml,Juicify.cssMap[Juicify.markdownCssUrl]);
				annotatedText = mtoHtmlWithcss;
			}
			
			/*if((annotation.annotationSubType == "Screenshot" || annotation.type == "Screenshot") && annotation.screenshotUrl) {
				annotatedText = "<img src='"+annotation.screenshotUrl+"' style='width:100%;'/>";
			}*/
			
			
			if(filter.annotationLink || annotation.linkEnabled ) {
				annotatedText = annotatedText+"&nbsp;"+"<span style='font-size: 12px;'>\
											<a href='"+annotation.link+"' target='_blank' title='open annotation in context'\
											style='color: #00a2e8; text-decoration: none !important;'>&mdash;&nbsp;View in Article</a>\
									</span>";
			}
			return annotatedText || "";
		}
		
		function formatCreatedDate(dateValue) {
			var date = moment(dateValue,moment.defaultFormat).toDate();
			var formatedDate = $filter('date')(date,'MMM d, y h:mm a');
			return formatedDate;
		}
		
		function formatComment(annotation,comment) {
			if(annotation) {
				return $filter('markdown')(comment);
			} else {
				return $filter('linky')(comment,'_blank');
			}

			return comment;
		}
		
		
	    function getTagAsID(name) {
			if(name) {
				if(name == "$$untagged") {
	    			return "UntaggedAnnotations";
	    		}
				return "tag_"+name.replace(/ /g, "_"); 
			}
	    }
		
		function getTagValueLable(name, groupBy) {
		    		if(name == "$$annotations") {
		    			if(groupBy == "tag") {
		    				return "Untagged Annotations";
		    			} else {
			    			return false;
		    			}
		    		}
		    		
		    		if(name) {
			    		if(groupBy == "taghierarchical") {
			    			var tagArray = name.split(":");
			    			if(tagArray.length > 1) {
				    	    	if(_.isEmpty(tagArray[1])) {
				    	    		return "";
				    			} else {
				    				return tagArray[1];
				    			}
				    	    }
			    		} else if(groupBy == "tag"){
			    			var tagArray = name.split(":");
			    			if(tagArray.length > 1) {
				    	    	if(_.isEmpty(tagArray[1])) {
				    	    		return tagArray[0];
				    			}
				    	    }
			    		}
		    		}
		    		
		    		return name;
		}
		
		function getTagStyles(name) {
			if(name == "$$untagged") {
    			return {'color': '#069','padding': '0px'};
    		}
    		
    		return {'color': '#069','padding': '0px'};
		}
		
		function getTagLable(name) {
			if(name == "$$untagged") {
    			return "Untagged Annotations";
    		}
    		
    		return name;
		}
		
		function getTableOfContentsHeading() {
			return tableOfContentsHeading;
		}
		
		function getDigestUrlForDocuDigest(groupBy,digestData) {
			var digestUrl = "";
			if(groupBy == "document") {
				digestUrl = digestData[0].link;
			} else if(groupBy == "section"){
				digestUrl = digestData[0].documents[0].link;
			} else if(groupBy == "tag" || groupBy == "taghierarchical"){
				digestUrl = digestData[0].entries[0].digest[0].link;
			}
			return digestUrl;
		}
		
	    return service;
	}]);
	
})();