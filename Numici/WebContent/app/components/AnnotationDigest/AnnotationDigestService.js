;(function(){
	'use strict';
	angular.module("vdvcApp").factory("AnnotationDigestService", ['$rootScope','appData','httpService','$uibModal','$window','markdown','Juicify','_','commonService','$filter','APIUserMessages','MessageService','TaskSpaceService','$timeout',
	                                                    function($rootScope,appData,httpService,$uibModal,$window,markdown,Juicify,_,commonService,$filter,APIUserMessages,MessageService,TaskSpaceService,$timeout) {
		
		const digestUpdateTitle = "Digest content has been updated. Click to refresh.";
		
		var digestMetaInfoDefaultOptions = {
				"description" : true,
				"image" : true,
				"documentName" : true,
				"documentLink" : true,
				"websiteName" : true,
				"websiteLogo" : true,
				"documentTags" : true,
				"annotationLink" : true,
				"annotationUserName" : true,
				"annotationCreatedTime" : true,
				"tags" : true
		};
		
		var digestMetaInfoOptionsForGroupByTag = {
				"description" : false,
				"image" : false,
				"documentName" : true,
				"documentLink" : true,
				"websiteName" : false,
				"websiteLogo" : false,
				"tags" : true,
				"annotationLink" : true,
				"annotationUserName" : true,
				"annotationCreatedTime" : true
		};
		
		var sorUIOptions = [
            {"label" : "Document Name","value" : "documentName"},
            {"label" : "Annotated User","value" : "userName"},
            {"label" : "Annotated Date","value" : "timestamp"},
            {"label" : "Document Order","value" : "documentOrder"}
        ];
		
		var groupByUIOptions = [
            {"label" : "Section / Document","value" : "section"},
            {"label" : "Document","value" : "document"},
            {"label" : "Tag - Flat","value" : "tag"},
            {"label" : "Tag - Hierarchical","value" : "taghierarchical"}
        ];
		
		var sortByUIOptions = [
            {"label" : "Name","value" : "name"},
            {"label" : "Date","value" : "date"},
            {"label" : "Custom","value" : "custom"}
        ];
		
		var sortOrderUIOptions = [
		                       {"label" : "Ascending","value" : "asc"},
		                       {"label" : "Descending","value" : "desc"}
		                   ];
		
		var enableBorderUIOptions = [
		                        {"label" : "No Border HIGHLIGHT BORDE","value" : "rgb(255, 255, 255)"},
								{"label" : "Numici Blue HIGHLIGHT BOR","value" : "rgb(0, 102, 153)"},
								{"label" : "Yellow HIGHLIGHT BORDERRR","value" : "rgb(255, 255, 0)"},
								{"label" : "Light Red HIGHLIGHT BORDE","value" : "rgb(255, 128, 128)"},
								{"label" : "Green HIGHLIGHT BORDERRR","value" : "rgb(0, 128, 0)"},
								{"label" : "Dark Grey HIGHLIGHT BORDE","value" : "rgb(128, 128, 128)"},
								{"label" : "Silver HIGHLIGHT BORDERRR","value" : "rgb(192, 192, 192)"}
							  ];
		
		var imagePositionUIOptions = [
								{"label" : "Left","value" : "left"},
								{"label" : "Full Width","value" : "fullWidth"},
								{"label" : "Right","value" : "right"}
							  ];
					
		var tableOfContentsUIOptions = [
								{"label" : "Not include","value" : "notInclude"},
								{"label" : "Include without index","value" : "withoutIndex"},
								{"label" : "Include with index","value" : "withIndex"}
							  ];
		var tableOfContents = true;
		var tableOfContentsHeading  = "Table of Contents";
		
		var displayOrderUIOptions = [
										{"label" : "Comment below Highlighted Text","value" : "regular"},
										{"label" : "Highlighted Text below Comment","value" : "blockquote"}
									  ];
		var displayRepliesUIOptions = [
				                        {"label" : "Don't Show Replies","value" : "donotshowreplies"},
										//{"label" : "Show Replies Expanded","value" : "showrepliesexpanded"},
										//{"label" : "Show Replies Collapsed","value" : "showrepliescollapsed"},
										{"label" : "Show Replies","value" : "showrepliesexpanded"}
									  ];
		
		var visibilityOptions = [
		                        {"label" : "CONNECTIONS","value" : "CONNECTIONS"},
		                        {"label" : "GROUP OR PRIVATE MESSAGE","value" : "CONTAINER"},
		                        {"label" : "PUBLIC","value" : "PUBLIC"}
		                    ];
		
		var postToSlackOptions = [
			                        {"label" : "CHANNEL","value" : "Channel"},
			                        {"label" : "DIRECT MESSAGE TO USERS","value" : "DMToUsers"},
			                        {"label" : "DIRECT MESSAGE TO GROUP","value" : "DMToGroups"},
			                        {"label" : "SLACK USER","value" : "SlackUser"}
			                    ];
			                    
		var postToWebexOptions = [
									{"label" : "DIRECT","value" : "DMToUsers"},
			                        {"label" : "SPACES","value" : "Spaces"}
			                    ];
		
		var sorUIOptionValues =  ["asc",'desc'];
		var appdata = appData.getAppData();
		var fileBaseUrl = commonService.getContext();
		var protectedDocImage = fileBaseUrl+"/app/assets/images/prtectedDocument.png";
		var imageWrapWidthPercent = 35;
		var trustedAnnotatedText = {};
		var enableBorder = "rgb(0, 102, 153)";
		var groupBy = "document";
		var sortBy = {
			"field": "name",
			"order": "asc"
		};
		var includeDocsWithoutAnn = true;
		var includeDocsWithoutSection = true;
		var imagePosition = "left";
		var displayOrder = "regular";
		var displayReplies = "showrepliesexpanded";
		var taskspaceId = "";
		var taskspaceClientId = ""
		var annotationLink = false;
		var shareLinkPopupSizes = {"shareLinks" : {width : 616,height : 220},
				"digestSettings" : {width : 884,height : 477},
				"changeLinkType" : {width : 616,height : 238},
				"Facebook" : {width : 884,height : 408},
				"LinkedIn" : {width : 884,height : 501},
				"Twitter" : {width : 884,height : 408},
				"WhatsApp" : {width : 884,height : 408},
				"Webex" : {width : 884,height : 550},
				"Notion" : {width : 884,height : 245},
				"Slack" : {width : 884,height : 502},
				"Teams" : {width : 884,height : 550},
				"postToEmail" : {width : 900,height : 545},
				"copy" : {width : 900,height : 526},
				"browseFileOrFolder" : {width : 884,height : 416},
				"onenote" : {width : 900,height : 416},
				"onenoteViewer" : {width : 900,height : 560}};
		
		var service = {
				digestMetaInfoDefaultOptions : digestMetaInfoDefaultOptions,
				digestMetaInfoOptionsForGroupByTag : digestMetaInfoOptionsForGroupByTag,
				create : create,
				createForLink : createForLink,
				getDigestHtmlForTS : getDigestHtmlForTS,
				getDigestHtmlForLink : getDigestHtmlForLink,
				saveAsDocument : saveAsDocument,
				sendAsMail : sendAsMail,
				saveMailAsDraft : saveMailAsDraft,
				shareArticleOnLinkedIn : shareArticleOnLinkedIn,
				getDigestFilters : getDigestFilters,
				getDocuDigetFilters : getDocuDigetFilters,
				getSortUIOptions : getSortUIOptions,
				getSortUIOptionValues: getSortUIOptionValues,
				getGroupByUIOptions : getGroupByUIOptions,
				getSortByUIOptions : getSortByUIOptions,
				getSortOrderUIOptions : getSortOrderUIOptions,
				getEnableBorderUIOptions : getEnableBorderUIOptions,
				getImagePositionUIOptions : getImagePositionUIOptions,
				getTableOfContentsUIOptions: getTableOfContentsUIOptions,
				getTableOfContents: getTableOfContents,
				getTableOfContentsHeading: getTableOfContentsHeading,
				getDisplayOrderUIOptions : getDisplayOrderUIOptions,
				getDisplayRepliesUIOptions : getDisplayRepliesUIOptions,
				getVisibilityOptions : getVisibilityOptions,
				getPostToSlackOptions : getPostToSlackOptions,
				getPostToWebexOptions : getPostToWebexOptions,
				getStateObjects : getStateObjects,
				getDefaultSection : getDefaultSection,
				getDocOrder : getDocOrder,
				getSecOrder : getSecOrder,
				tsHasSections : tsHasSections,
				trustedAnnotatedText : trustedAnnotatedText,
				taskspaceId : taskspaceId,
				taskspaceClientId : taskspaceClientId,
				annotationLink : annotationLink,
				extParentWidth : 0,
				extParentHeight : 0,
				shareLinkPopupSizes : shareLinkPopupSizes,
				enableBorder : enableBorder,
				groupBy : groupBy,
				sortBy : sortBy,
				includeDocsWithoutAnn : includeDocsWithoutAnn,
				includeDocsWithoutSection : includeDocsWithoutSection,
				imagePosition : imagePosition,
				displayOrder : displayOrder,
				displayReplies : displayReplies,
				preProcessAnnotationDigestResp : preProcessAnnotationDigestResp,
				getDigestNameForDoc : getDigestNameForDoc,
				getDefaultDigestSettings : getDefaultDigestSettings,
				processLinkInfo : processLinkInfo,
				processDataForPublish : processDataForPublish,
				SaveAsNote : SaveAsNote,
				SaveAsPdf : SaveAsPdf,
				sendAsEMail : sendAsEMail,
				sendAsEMailDraft : sendAsEMailDraft,
				createLinkAnnotationDigest : createLinkAnnotationDigest,
				getDigestShareCommentaryTxt : getDigestShareCommentaryTxt,
				setDigesMinMaxWidth : setDigesMinMaxWidth,
				getTitleStyles : getTitleStyles,
				alternateImageStyles : alternateImageStyles,
				setRepDigestStyles : setRepDigestStyles,
				hasAnnotatedText : hasAnnotatedText,
				getAnnotatedText : getAnnotatedText,
				formatCreatedDate : formatCreatedDate,
				formatComment : formatComment,
				
				getTagAsID : getTagAsID,
				getTagValueLable: getTagValueLable,
				getTagStyles: getTagStyles,
				getTagLable: getTagLable,
				notificationHandledelayTime: 20000,
                maxNotifications: 5,
	            digestUpdateTitle : digestUpdateTitle,
	            getDigestUrlForDocuDigest : getDigestUrlForDocuDigest,
	            addBoxShadowToDigest : addBoxShadowToDigest,
	            addBoxShadowToHtmlDigest : addBoxShadowToHtmlDigest
		};
		
		function create(postdata) {
			return httpService.httpPost("annotationdigest/create",postdata);
		}
		
		function createForLink(postdata) {
			return httpService.httpPost("annotationdigest/createForLink",postdata);
		}
		
		function getDigestHtmlForTS(postdata) {
			return httpService.httpPost("annotationdigest/createHtml",postdata);
		}
		
		function getDigestHtmlForLink(postdata) {
			return httpService.httpPost("annotationdigest/createHtmlForLink",postdata);
		}
		
		function saveAsDocument(postdata) {
			return httpService.httpPost("annotationdigest/saveAsDoc",postdata);
		}
		
		function sendAsMail(postdata) {
			return httpService.httpPost("annotationdigest/sendAsMail",postdata);
		}
		
		function saveMailAsDraft(postdata) {
			return httpService.httpPost("annotationdigest/saveMailAsDraft",postdata);
		}
		
		function shareArticleOnLinkedIn(postdata) {
			return httpService.httpPost("linkedin/shareArticle",postdata);
		}
		
		function getDigestFilters() {
			var tempGroupByUIOptions = angular.copy(groupByUIOptions);
			if(!tsHasSections(TaskSpaceService.currentTaskspace)) {
				tempGroupByUIOptions = _.reject(tempGroupByUIOptions, function(groupByOption){ 
	    			return groupByOption.value == "section"; 
	    		});
			}
			return {
				"filterOptions" : {
					"startDate" : null,
					"endDate" : null,
					"sections" : [],
					"multiTags" : [],
					"allTagAnnotations" : true,
					"highlights" : {
						"myHighlights" : true, 
						"sharedHighlights" : true
					}, 
					"annotations" : {
						"myAnnotations" : true, 
						"sharedAnnotations" : true
					},
					"displayReplies" : displayReplies
				},
				"sortOptions" : {
					"timestamp" : "desc",
					//"documentName" : "asc",
					//"userName" : "desc"
				},
				"sortBy" : {
					"field": "date",
					"order": "desc"
				},
				"digestMetaInfoOptions" : digestMetaInfoDefaultOptions,
				"selectedTemplate" : null,
				"groupBy" : tempGroupByUIOptions ? tempGroupByUIOptions[0].value : null,
				"enableBorder" : enableBorder,
				"imagePosition" : imagePosition,
				"displayOrder" : displayOrder,
				"tableOfContents": tableOfContentsUIOptions ? tableOfContentsUIOptions[2].value : null,
				"tableOfContentsHeading": tableOfContentsHeading,
				"includeDocsWithoutAnn" : includeDocsWithoutAnn,
				"includeDocsWithoutSection" : includeDocsWithoutSection
			};
		}
		
		function getDocuDigetFilters() {
			
			var settings = getDigestFilters();
			
			settings.digestMetaInfoOptions = angular.merge({}, digestMetaInfoDefaultOptions, {
				"annotationUserName" : false,
				"annotationCreatedTime" : false,
				"tags" : false,
				"documentTags" : false,
			});
			
			return settings;
		}
		
		function getSortUIOptions() {
			return sorUIOptions;
		}
		
		function getSortUIOptionValues() {
			return sorUIOptionValues;
		}
		
		function getGroupByUIOptions() {
			return groupByUIOptions;
		}
		
		function getSortByUIOptions() {
			return sortByUIOptions;
		}
		
		function getSortOrderUIOptions() {
			return sortOrderUIOptions;
		}
		
		function getEnableBorderUIOptions() {
			return enableBorderUIOptions;
		}
		
		function getImagePositionUIOptions() {
			return imagePositionUIOptions;
		}
		function getTableOfContentsUIOptions() {
			return tableOfContentsUIOptions;
		}
		function getTableOfContents() {
			return tableOfContents;
		}
		
		function getTableOfContentsHeading() {
			return tableOfContentsHeading;
		}
		
		function getDisplayOrderUIOptions() {
			return displayOrderUIOptions;
		}
		
		function getDisplayRepliesUIOptions() {
			return displayRepliesUIOptions;
		}
		
		function getVisibilityOptions() {
			return visibilityOptions;
		}
		
		function getPostToSlackOptions() {
			return postToSlackOptions;
		}
		function getPostToWebexOptions() {
			return postToWebexOptions;
		}
		function getStateObjects(taskSpaceStateObjects) {
			var objects = [];
			_.each(taskSpaceStateObjects,function(object,index) {
				var tempObj = {
					"type" : object.type,
					"objectId" : object.objectId,
					"clientId" : object.clientId,
					"name" : object.name,
					"sectionId" : object.sectionId,
					"include" : true
				}
				if(!_.isEmpty(object.objectInfo)) {
					if(object.objectInfo.name) {
						tempObj["name"] = object.objectInfo.name;
					}
					if(object.objectInfo.createdBy) {
						tempObj["createdBy"] = object.objectInfo.createdBy;
					}
					if(object.objectInfo.docType) {
						tempObj["docType"] = object.objectInfo.docType;
					}
					if(object.objectInfo.annotationsCount) {
						tempObj["annotationsCount"] = object.objectInfo.annotationsCount;
					}
					if(object.objectInfo.highlightsCount) {
						tempObj["highlightsCount"] = object.objectInfo.highlightsCount;
					}
					if(object.objectInfo.isShared) {
						tempObj["isShared"] = object.objectInfo.isShared;
					}
					if(object.objectInfo.datePublished) {
						tempObj["datePublished"] = object.objectInfo.datePublished;
					}
				}
				objects.push(tempObj);
			});
			return objects;
		}
		
		function getDefaultSection(currentTaskspace) {
			var defaultSection = {id : null, name: "", descrption : null};
			var nonSectionedDocs = _.where(currentTaskspace.objects,{sectionId : null});
			if(!_.isEmpty(nonSectionedDocs)) {
				nonSectionedDocs = getStateObjects(nonSectionedDocs);
				defaultSection["documents"] = nonSectionedDocs;
			} else {
				defaultSection["documents"] = [];
			}
			return defaultSection;
		}
		
		function getDocOrder(taskspace) {
			var docorder = [];
			if(taskspace && !_.isEmpty(taskspace.objects)) {
  				docorder = getStateObjects(taskspace.objects);
			}
			return docorder;
		}
		
		function getSecOrder(taskspace,includeDocsWithoutSection) {
			var secorder = [];
			var include = true;
			if(taskspace && !_.isEmpty(taskspace.sections)) {
  				var taskspaceSections = angular.copy(taskspace.sections);
  				_.each(taskspaceSections,function(section,index) {
  					taskspaceSections[index].include = include;
  					taskspaceSections[index]["documents"] = [];
  					var tsDocuments = _.where(taskspace.objects,{"sectionId" : section.id});
					if(!_.isEmpty(tsDocuments)) {
						taskspaceSections[index]["documents"] = getStateObjects(tsDocuments);
					}
  				});
  				if(includeDocsWithoutSection) {
	  				var defaultSection = {id : null, name: "", descrption : null, documents : [], include : include};
					var nonSectionedDocs = _.where(taskspace.objects,{sectionId : null});
					if(!_.isEmpty(nonSectionedDocs)) {
						defaultSection["documents"] = getStateObjects(nonSectionedDocs);
					}
					taskspaceSections.push(defaultSection);
				}
  				secorder = taskspaceSections;
			} else {
				var taskspaceSections = [];
				if(includeDocsWithoutSection){
					var defaultSection = {id : null, name: "", descrption : null, documents : [], include : include};
					var nonSectionedDocs = _.where(taskspace.objects,{"sectionId" : null});
					if(!_.isEmpty(nonSectionedDocs)) {
						defaultSection["documents"] = getStateObjects(nonSectionedDocs);
					}
					taskspaceSections.push(defaultSection);
				}
				secorder = taskspaceSections;
			}
			return secorder;
		}
		
		function tsHasSections(taskspace) {
			var status = false;
			if(!_.isEmpty(taskspace) && !_.isEmpty(taskspace.sections)){
				status = true;
			}
			return status;
		}
		
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
			let link = "",tsId,tsClientId;
			
			if(taskspace) {
				tsId = taskspace.tsId;
				tsClientId = taskspace.tsClientId;
			}
			
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
		
		function processDigestData(digestList,deepLinkId,taskspace) {
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
			if(!taskspace.tsId){
				taskspace.tsId = config.objectId;
				taskspace.tsClientId = config.clientId;
			}
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
								digest.entries[ind].digest = processDigestData(entries.digest,deepLinkId,taskspace);
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
				var digestDataTemp = processDigestData(linkAnnotationDigestResp,deepLinkId,taskspace);
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
			var imageStyles = {"background-image": "url("+protectedDocImage+")" ,"background-size": "cover"};
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
		
		function getAnnotatedText(annotation,filters) {
			var annotatedText = annotation.annotatedText || annotation.text;
			var formatedText = annotation.formatedtext || annotation.formatedText;
			
			if(!_.isEmpty(annotatedText)) {
				annotatedText = "<div style='border:none;background:#fff;white-space: pre-wrap;word-break: break-word;'>"+annotatedText+"</div>";
			}
			
			
			if(!_.isEmpty(formatedText)) {
				var mtoHtml = markdown.makeHtml(formatedText);
				var mtoHtmlWithcss = Juicify.inlineCss(mtoHtml,Juicify.cssMap[Juicify.markdownCssUrl]);
				annotatedText = mtoHtmlWithcss;
			}
			
			/*if((annotation.annotationSubType == "Screenshot" || annotation.type == "Screenshot") && annotation.screenshotUrl) {
				annotatedText = "<img src='"+annotation.screenshotUrl+"' style='width:100%;'/>";
			}*/
			
			if(filters.annotationLink || annotation.linkEnabled) {
				annotatedText = annotatedText+"&nbsp;"+"<span style='font-size: 12px;'>\
					<a href='"+annotation.link+"' target='_blank' title='open annotation in context'\
					style='color: #00a2e8; text-decoration: none !important;'>&#8213;&nbsp;View in Article</a>\
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
			if(annotation && (annotation.webAnnotation || annotation.documentType == "WebResource")) {
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
		
		function getDigestNameForDoc(tsObj){
			var digestName = tsObj.name ? tsObj.name : "";
			if(tsObj && tsObj.objectInfo && tsObj.objectInfo.docType && tsObj.objectInfo.docType == "WebResource"){
				  var sourceUrl;
				  if(tsObj.objectInfo.sourceURL && tsObj.objectInfo.sourceURL != null && tsObj.objectInfo.sourceURL != undefined){
					  sourceUrl = tsObj.objectInfo.sourceURL;
				  } else if(tsObj.objectInfo.sourceUrl && tsObj.objectInfo.sourceUrl != null && tsObj.objectInfo.sourceUrl != undefined){
					  sourceUrl = tsObj.objectInfo.sourceUrl;
				  }
				  if(sourceUrl && sourceUrl != null && sourceUrl != undefined){
					  var domainName = sourceUrl.replace('http://','').replace('https://','').replace('www.','').split(/[/?#]/)[0];
					  digestName = digestName + " (from "+domainName+")";
				  }
			}
			return digestName;
		}
		
		function getDefaultDigestSettings(tsId, tscId, tsObj) {
			var config = getDigestFilters();
			var digestName;
			if(tsObj){
				digestName = getDigestNameForDoc(tsObj);
			}
			//var groupBy = groupByUIOptions ? groupByUIOptions[0].value : null;
			
			/*var digestSettings = {
					"digestName": digestName, 
					"digestDescription": "",
					"objectId": tsId, 
					"clientId": tscId,
					"context" : "taskspace",
					"filterOptions" : config.filterOptions,
					"groupBy": groupBy,
					"includeDocsWithoutAnn" : false,
					"digestMetaInfoOptions": config.digestMetaInfoOptions,
					"enableBorder" : config.enableBorder,
					"imagePosition" : config.imagePosition,
					"displayOrder" : config.displayOrder
			};*/
			var digestSettings = angular.copy(config);
			digestSettings.digestName = digestName;
			digestSettings.digestDescription = "";
			digestSettings.objectId = tsId;
			digestSettings.clientId = tscId;
			digestSettings.context = "taskspace";
			digestSettings.digestName = digestName;
			if(tsObj){
				digestSettings.documents = [tsObj.objectId];
			}
			
			return digestSettings;
		}
		
		function processLinkInfo(digestFor, tsId, tscId, digestSettings) {
			var linkType = "Public"; //linkType.type;
			var target = "Document" //linkTarget.target;
			var objectType = "AnnotationDigest";
			if (digestFor.digestFor == "DigestDocument") {
				if (digestFor.documentInfo) {
					digestSettings.documents = [digestFor.documentInfo.objectId];
				}
				objectType = "DigestDocument";
				//Overriding defaults values while creating link for "DigestDocument".
				digestSettings.tableOfContents = "notInclude";
				digestSettings.groupBy = "document";
			}
			var info = {
					  "objectType": objectType,
					  "linkObjectId": tsId,
					  "linkType": linkType,
					  "clientId": tscId,
					  
					  "linkTarget": target,
					  "documentId": (digestFor.documentInfo && digestFor.documentInfo.objectId ) ? digestFor.documentInfo.objectId : null, // new attribute
					  "digestDocAnnotId": (digestFor.documentInfo && digestFor.documentInfo.digestDocAnnotId ) ? digestFor.documentInfo.digestDocAnnotId : null, // new attribute ,
					  
					  "properties": {digestSettings : digestSettings}
					};
			return info;
		}
		
		function processDataForPublish(result,settings,digestMetaInfoOptions){
			var AnnotationDigestResp = result.AnnotationDigestResp;
			if(!_.isEmpty(AnnotationDigestResp.digestSettings)) {
				service.taskspaceId = AnnotationDigestResp.digestSettings.objectId;
				service.taskspaceClientId = AnnotationDigestResp.digestSettings.clientId;
			} else if(!_.isEmpty(settings)) {
				service.taskspaceId = settings.taskspaceId; 
				service.taskspaceClientId = settings.clientId;
			}
			
			service.annotationLink = digestMetaInfoOptions.annotationLink;
		}
		
		function SaveAsNote(result,content,linkInfo,userOrgId,state,cb) {
			var postdata = {};
			postdata.context = "taskspace";
			postdata.objectId = service.taskspaceId;
			postdata.clientId = service.taskspaceClientId;
			postdata.saveToFolderId = result.folderId;
			postdata.name = result.fileName;
			postdata.overwrite = result.isOverWrite;
			if(result.existingDocId) {
				postdata.existingDocId = result.existingDocId;
				postdata.lockId = result.lockId;
				postdata.majorVersion = result.majorVersion;
    			postdata.minorVersion = result.minorVersion;
			}
			postdata.content = content;
			if(!_.isEmpty(linkInfo.linkObj)) {
				postdata["linkId"] = linkInfo.linkObj.id;
				postdata["linkObjectType"] = linkInfo.linkObj.objectType;
				postdata["linkLinkType"] = linkInfo.linkObj.linkType;
			}
			saveAsDocument(postdata).then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					var doc = resp.data.AnnotationDigest;
					if(typeof cb == "function") {
						cb(doc);
					} else if(doc) {
						state.go("docview",{"docId":doc.id,"clientId":userOrgId});
					}
				}
			});
		}
		
		function SaveAsPdf(fileName,content,linkInfo,DocFactory,cb) {
			var postdata = {};
			postdata.context = "taskspace";
			postdata.objectId = service.taskspaceId;
			postdata.clientId = service.taskspaceClientId;
			postdata.pdfFileName = fileName+".pdf";
			postdata.content = content;
			if(!_.isEmpty(linkInfo.linkObj)) {
				postdata["linkId"] = linkInfo.linkObj.id;
				postdata["linkObjectType"] = linkInfo.linkObj.objectType;
				postdata["linkLinkType"] = linkInfo.linkObj.linkType;
			}
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
				     if(typeof cb == "function"){
				    	 cb();
				     }
				}
			}).catch(function (resp){
				var message = String.fromCharCode.apply(null, new Uint8Array(resp.data));
				APIUserMessages.error(message);
				if(typeof cb == "function"){
					cb("error");
			    }
			});
		}
		
		function sendAsEMail(results,content,linkInfo) {
			var postdata = {};
			postdata.toEmailsList = results.toEmailIds;
			postdata.ccEmailsList = results.ccEmailIds;
			postdata.bccEmailsList = results.bccEmailIds;
			postdata.subject = !_.isEmpty(results.emailSubject) ? results.emailSubject : "Annotation Digest";
			postdata.content = results.mailBody.trim();
			postdata.context = "taskspace";
			postdata.objectId = service.taskspaceId;
			postdata.clientId = service.taskspaceClientId;
			if(!_.isEmpty(linkInfo.linkObj)) {
				postdata["linkId"] = linkInfo.linkObj.id;
				postdata["linkObjectType"] = linkInfo.linkObj.objectType;
				postdata["linkLinkType"] = linkInfo.linkObj.linkType;
			}
			return sendAsMail(postdata);
			/*sendAsMail(postdata).then(function(resp) {
				 if(resp.status == 200 && resp.data.Status) {
					 APIUserMessages.success("Mail sent successfully");
				 }
			});*/
		}
		
		function sendAsEMailDraft(results,content,linkInfo) {
			var postdata = {};
			postdata.toEmailsList = results.toEmailIds;
			postdata.ccEmailsList = results.ccEmailIds;
			postdata.bccEmailsList = results.bccEmailIds;
			postdata.subject = !_.isEmpty(results.emailSubject) ? results.emailSubject : "Annotation Digest";
			postdata.content = results.mailBody.trim();
			postdata.context = "taskspace";
			postdata.objectId = service.taskspaceId;
			postdata.clientId = service.taskspaceClientId;
			if(!_.isEmpty(linkInfo.linkObj)) {
				postdata["linkId"] = linkInfo.linkObj.id;
				postdata["linkObjectType"] = linkInfo.linkObj.objectType;
				postdata["linkLinkType"] = linkInfo.linkObj.linkType;
			}
			return saveMailAsDraft(postdata);
			/*saveMailAsDraft(postdata).then(function(resp) {
				 if(resp.status == 200 && resp.data.Status) {
					 APIUserMessages.success("Mail saved as draft successfully");
				 }
			});*/
		}
		
		function createLinkAnnotationDigest(postdata,cb) {
			createForLink(postdata).then(function(resp) {
  				if(resp.status == 200 && resp.data.Status) {
  					if(_.isEmpty(resp.data.AnnotationDigest)) {
  						if(!_.isEmpty(resp.data.Message)) {
  							MessageService.showErrorMessage("BACKEND_ERR_MSG",[resp.data.Message]);
  						} else {
  							MessageService.showInfoMessage("ANNOTATION_DIGEST_NODATA_INFO");
  						}
  					}/* else {
  						if(typeof cb == "function") {
  	  						cb(resp.data);
  	  					}
  					}*/
  					if(typeof cb == "function") {
  						cb(resp.data);
  					}
  				}
  				
			});
		}
		
		function getAnnotatedTxt(annotation,digestMetaInfoOptions){
			//var unicodeUserIcon = "\ud83d\ude42 ";
			//var unicodeTimeIcon = "\ud83d\udd51 ";
			var annotatedText = "";
			annotatedText  = !_.isEmpty(annotation.annotatedText) ? annotation.annotatedText : annotation.text;
			if(!_.isEmpty(annotatedText)){
				annotatedText = annotatedText.replace(/(\r\t|\t|\r)/gm, "").trim();
			}
			
			if(_.isEmpty(annotatedText)) {
				var formatedText  = !_.isEmpty(annotation.formatedtext) ? annotation.formatedtext : annotation.formatedText;
				if(!_.isEmpty(formatedText)) {
					var imageTxt = "<img ";
					var htmlFormatedText = markdown.makeHtml(formatedText);
					if(htmlFormatedText && !_.isEmpty(htmlFormatedText) && htmlFormatedText.includes(imageTxt)){
						// do nothing
					} else {
						annotatedText = formatedText;
					}
				}
			}
			
			if(!_.isEmpty(annotatedText)){
				annotatedText = annotatedText.replace(/(\r\t|\t|\r)/gm, "").trim();
				annotatedText = "\u275D"+annotatedText+"\u275E";
				var displayUserAndTime = "";
				if(digestMetaInfoOptions.annotationUserName) {
					displayUserAndTime = "\n-- by "+annotation.annotatedUserName;
				}
				if(digestMetaInfoOptions.annotationCreatedTime) {
					if(!_.isEmpty(displayUserAndTime)){
						displayUserAndTime = displayUserAndTime+", at "+formatCreatedDate(annotation.annotationCreatedTime);
					} else {
						displayUserAndTime = "\n-- at "+formatCreatedDate(annotation.annotationCreatedTime);
					}
				}
				annotatedText = annotatedText + displayUserAndTime;
			}
			return annotatedText;
		}
		
		function getAnnotatedImg(annotation){
			var annotatedImgUrl = "";
			if (annotation.annotationSubType && annotation.annotationSubType == "Screenshot"){
				var formatedText  = !_.isEmpty(annotation.formatedtext) ? annotation.formatedtext : annotation.formatedText;
				if(!_.isEmpty(formatedText)) {
					var imageTxt = "<img ";
					var htmlFormatedText = markdown.makeHtml(formatedText);
					if(htmlFormatedText && !_.isEmpty(htmlFormatedText) && htmlFormatedText.includes(imageTxt)){
						var imageTag = $(htmlFormatedText).find("img");
						if(imageTag) {
							annotatedImgUrl = imageTag.attr("src");
						}
					}
				}
			} else {
				var formatedText  = !_.isEmpty(annotation.formatedtext) ? annotation.formatedtext : annotation.formatedText;
				if(!_.isEmpty(formatedText)) {
					var imageTxt = "<img ";
					var htmlFormatedText = markdown.makeHtml(formatedText);
					if(htmlFormatedText && !_.isEmpty(htmlFormatedText) && htmlFormatedText.includes(imageTxt)){
						var imageTag = $(htmlFormatedText).find("img");
						if(imageTag) {
							annotatedImgUrl = imageTag.attr("src");
						}
					}
				}
			}
			return annotatedImgUrl;
		}
		
		function getCommentTxt(comments, showReplies, showCommentIcon, pageNote, digestMetaInfoOptions){
			var conversationText  = "";
			var unicodeCommentIcon = "";
			//var unicodeUserIcon = "\ud83d\ude42 ";
			//var unicodeTimeIcon = "\ud83d\udd51 ";
			if(showCommentIcon && !pageNote){
				unicodeCommentIcon = "\uD83D\uDDE8 ";
			}
			if(showReplies){
				_.each(comments,function(comment,index){
					var commentText  = comment.comment
					if(!_.isEmpty(commentText)){
						var displayUserAndTime = "";
						if(digestMetaInfoOptions.annotationUserName) {
							displayUserAndTime = "\n-- by "+comment.commentatorName;
						}
						if(digestMetaInfoOptions.annotationCreatedTime) {
							if(!_.isEmpty(displayUserAndTime)){
								displayUserAndTime = displayUserAndTime+", at "+formatCreatedDate(comment.createdTime);
							} else {
								displayUserAndTime = "\n-- at "+formatCreatedDate(comment.createdTime);
							}
						}
						commentText = commentText + displayUserAndTime;
						if(_.isEmpty(conversationText)) {
							conversationText = 	unicodeCommentIcon+commentText;
						} else {
							conversationText = 	conversationText+"\n"+unicodeCommentIcon+commentText;	
						}
					}
				});
			} else {
				if(!_.isEmpty(comments) && !_.isEmpty(comments[0].comment)) {
					var commentText  = comments[0].comment
					if(!_.isEmpty(commentText)){
						var displayUserAndTime = "";
						if(digestMetaInfoOptions.annotationUserName) {
							displayUserAndTime = "\n-- by "+comments[0].commentatorName;
						}
						if(digestMetaInfoOptions.annotationCreatedTime) {
							if(!_.isEmpty(displayUserAndTime)){
								displayUserAndTime = displayUserAndTime+", at "+formatCreatedDate(comments[0].createdTime);
							} else {
								displayUserAndTime = "\n-- at "+formatCreatedDate(comments[0].createdTime);
							}
						}
						commentText = commentText + displayUserAndTime;
						conversationText = 	unicodeCommentIcon+commentText;	
					}
				}	
			}
			return conversationText;
		}
		
		var annotatedImgUrl;
		var annotationSubType;
		function getDocLevelShareCommentaryTxt(AnnotationDigest,digestFor,digestDescription,filterOptions,displayOrderOption,linkId,clientId,includeAnnotationDigestContent,includeDigestContent,digestSettings,cb) {
			var docLevelShareCommentaryTxt = "";
			var digestMetaInfoOptions = digestSettings.digestMetaInfoOptions;
			_.each(AnnotationDigest,function(document){
				var annotationTxt = "";
				if(includeAnnotationDigestContent){
					var docLevelText = "";
					if(digestFor.digestFor == "AnnotationDigest" && includeAnnotationDigestContent && !_.isEmpty(document.annotations)){
						var digestPlainTextLineSeparator = "____________________________________________________________";
						var GlobalSettings = appdata.GlobalSettings;
						var digestPlainTextLineSeparatorTypeInfo = _.findWhere(GlobalSettings,{"key":"DigestPlainTextLineSeparator"});
						if (digestPlainTextLineSeparatorTypeInfo == null || digestPlainTextLineSeparatorTypeInfo == "" || typeof digestPlainTextLineSeparatorTypeInfo == undefined){
							//do nothing
						} else {
							if(digestPlainTextLineSeparatorTypeInfo.value == null || digestPlainTextLineSeparatorTypeInfo.value == ""){
								//do nothing
							} else {
								digestPlainTextLineSeparator = digestPlainTextLineSeparatorTypeInfo.value;	
							}
						}
						docLevelText = digestPlainTextLineSeparator;
					}
					if(digestMetaInfoOptions.documentLink == null || typeof digestMetaInfoOptions.documentLink == undefined) {
						digestMetaInfoOptions.documentLink = true;
					}
					
					if((digestMetaInfoOptions.documentName && !_.isEmpty(document.displayName)) || 
							(digestMetaInfoOptions.documentLink && !_.isEmpty(document.docLink)) || 
							(digestMetaInfoOptions.description && !_.isEmpty(document.description)) ||
							(digestMetaInfoOptions.websiteName && !_.isEmpty(document.website)) ) {
						docLevelText = docLevelText +"\n";
					}
					
					if(digestMetaInfoOptions.documentName && !_.isEmpty(document.displayName)){
						docLevelText = docLevelText +"\n"+ document.displayName
					}
					if(digestMetaInfoOptions.documentLink && !_.isEmpty(document.docLink)){
						docLevelText = docLevelText +"\n"+ "("+document.docLink+")";
					}
					if(digestMetaInfoOptions.description && !_.isEmpty(document.description)){
						docLevelText = docLevelText +"\n"+document.description;
					}
					if(digestMetaInfoOptions.websiteName && !_.isEmpty(document.website)){
						docLevelText = docLevelText +"\n"+ "("+document.website+")";
					}
					if(_.isEmpty(docLevelShareCommentaryTxt)) {
						docLevelShareCommentaryTxt = docLevelText;
					} else {
						docLevelShareCommentaryTxt = docLevelShareCommentaryTxt+"\n"+docLevelText;
					}	
				}
				var annotations = document.annotations;
				var digestDocumentAnnot = false;
				if(digestFor.digestFor == "DigestDocument" && (digestFor.documentInfo && digestFor.documentInfo.digestDocAnnotId)) {
					annotations = _.where(document.annotations,{"annotationId" : digestFor.documentInfo.digestDocAnnotId});
					digestDocumentAnnot = true;
				}
				_.each(annotations,function(annotation,index){
					var displayReplies = false;
					var displayOrder = "blockquote";
					if(!_.isEmpty(filterOptions) && 
							(filterOptions.displayReplies == "showrepliesexpanded" || filterOptions.displayReplies == "showrepliescollapsed")){
						displayReplies = true;
					}
					if(!_.isEmpty(displayOrderOption)){
						displayOrder = displayOrderOption.value;
					}
					
					var pageNote = annotation.pagenote;
					var comments = annotation.conversation;
					var annotatedText;
					if(pageNote){
						annotatedText = getCommentTxt(comments, displayReplies, false, pageNote, digestMetaInfoOptions);
					} else {
						var AnnotatedTxt = "";
						if (digestDocumentAnnot && annotation.annotationSubType && annotation.annotationSubType == "Screenshot"){
							annotationSubType = annotation.annotationSubType;
							annotatedImgUrl = getAnnotatedImg(annotation);
						} else if(digestDocumentAnnot){
							annotatedImgUrl = getAnnotatedImg(annotation);	//if it is image annotation it will return image url otherwise it will return empty string
							AnnotatedTxt = getAnnotatedTxt(annotation,digestMetaInfoOptions);
						} else {
							AnnotatedTxt = getAnnotatedTxt(annotation,digestMetaInfoOptions);	//if it is not an image annotation it will return Annotated Text otherwise it will return empty string
						}
						if(!_.isEmpty(AnnotatedTxt)) {
							if(displayOrder == "blockquote"){
								//blockquote - "Highlighted Text below Comment"
								var commentText = getCommentTxt(comments, displayReplies, false, pageNote, digestMetaInfoOptions);
								if(!_.isEmpty(commentText)){
									annotatedText = commentText;
								}
								if(_.isEmpty(annotatedText)) {
									annotatedText = AnnotatedTxt;
								} else {
									annotatedText = annotatedText+"\n"+AnnotatedTxt;
								}
							} else {
								//regular - "Comment below Highlighted Text"
								var commentText = getCommentTxt(comments, displayReplies, true, pageNote, digestMetaInfoOptions);
								if(!_.isEmpty(commentText)){
									annotatedText = AnnotatedTxt+"\n"+commentText;
								} else {
									annotatedText = AnnotatedTxt;
								}
							}
						} else {
							if(displayOrder == "blockquote"){
								//blockquote - "Highlighted Text below Comment"
								var commentText = getCommentTxt(comments, displayReplies, false, pageNote, digestMetaInfoOptions);
								if(!_.isEmpty(commentText)){
									annotatedText = commentText;
								}
							} else {
								//regular - "Comment below Highlighted Text"
								var commentText = getCommentTxt(comments, displayReplies, true, pageNote, digestMetaInfoOptions);
								if(!_.isEmpty(commentText)){
									annotatedText = commentText;
								}
							}
						}
					}
					
					if(!_.isEmpty(annotatedText)){
						if(digestMetaInfoOptions.annotationLink && !_.isEmpty(annotation.annotationLink)){
							annotatedText = annotatedText +"\n"+ "-- [View in Article]("+annotation.annotationLink+")";
						}
						if(_.isEmpty(docLevelShareCommentaryTxt)) {
							docLevelShareCommentaryTxt = annotatedText;
						} else {
							docLevelShareCommentaryTxt = docLevelShareCommentaryTxt+"\n\n"+annotatedText;
						}
					}
					
				});
			});
			return docLevelShareCommentaryTxt;
		}
		
		function getDigestShareCommentaryTxt(digestFor,digestDescription,filterOptions,displayOrderOption,linkId,clientId,includeAnnotationDigestContent,includeDigestContent,cb) {
			annotatedImgUrl = "";
			annotationSubType = "";
			var shareCommentaryTxt = "";
			var digestContent = "";
			var transformImageUrls = false;
			if(includeDigestContent){
				transformImageUrls = true;
			}
			var postdata = {linkId : linkId,clientId : clientId,transformImageUrls:transformImageUrls};
			createLinkAnnotationDigest(postdata,function(result) {
				digestContent = result;
				if(digestFor.digestFor == "AnnotationDigest" && !includeAnnotationDigestContent){
					if(digestDescription){
						shareCommentaryTxt = digestDescription;	
					}
				} else if(digestFor.digestFor == "DigestDocument" || (digestFor.digestFor == "AnnotationDigest" && includeAnnotationDigestContent)){
					if(digestDescription){
						shareCommentaryTxt = digestDescription;	
					}
					if(digestFor.digestFor == "AnnotationDigest" && includeAnnotationDigestContent){
						var digestNameContent;
						if(!_.isEmpty(digestContent.digestName)){
							digestNameContent = digestContent.digestName;
							if(!_.isEmpty(digestContent.url)){
								digestNameContent = digestNameContent +"\n("+digestContent.url+")";
							}
							if(_.isEmpty(shareCommentaryTxt)) {
								shareCommentaryTxt = digestNameContent;
							} else {
								shareCommentaryTxt = digestNameContent+"\n\n"+shareCommentaryTxt;
							}
						}
					}
					if(!_.isEmpty(digestContent.AnnotationDigest)) {
						var AnnotationDigestList = digestContent.AnnotationDigest;
						if(!_.isEmpty(AnnotationDigestList)) {
							if(digestContent.digestSettings && digestContent.digestSettings.groupBy == "section") {
								if(digestFor.digestFor == "AnnotationDigest" && !_.isEmpty(digestContent.digestSettings)) {
									_.each(AnnotationDigestList,function(AnnotationDigest){
										var sectionTitle = AnnotationDigest.section;
										if(_.isEmpty(AnnotationDigest.section)) {
											sectionTitle = "Documents without a Section"
										}
										var sectionLineSeparator = "____________________________________________________________";
										if(_.isEmpty(shareCommentaryTxt)) {
											shareCommentaryTxt = sectionLineSeparator+"\n"+sectionTitle+"\n"+sectionLineSeparator;
										} else {
											shareCommentaryTxt = shareCommentaryTxt+"\n"+sectionLineSeparator+"\n"+sectionTitle+"\n"+sectionLineSeparator;
										}
										var docLevelShareCommentaryTxt = getDocLevelShareCommentaryTxt(AnnotationDigest.documents,digestFor,digestDescription,filterOptions,displayOrderOption,linkId,clientId,includeAnnotationDigestContent,includeDigestContent,digestContent.digestSettings);
										shareCommentaryTxt = shareCommentaryTxt +"\n"+ docLevelShareCommentaryTxt;
									});
								} else {
									var docLevelShareCommentaryTxt = getDocLevelShareCommentaryTxt(AnnotationDigestList[0].documents,digestFor,digestDescription,filterOptions,displayOrderOption,linkId,clientId,includeAnnotationDigestContent,includeDigestContent,digestContent.digestSettings);
									shareCommentaryTxt = shareCommentaryTxt +"\n"+ docLevelShareCommentaryTxt;
								}
							} else {
								var docLevelShareCommentaryTxt = getDocLevelShareCommentaryTxt(AnnotationDigestList,digestFor,digestDescription,filterOptions,displayOrderOption,linkId,clientId,includeAnnotationDigestContent,includeDigestContent,digestContent.digestSettings);
								if(!_.isEmpty(shareCommentaryTxt)) {
									shareCommentaryTxt = shareCommentaryTxt +"\n"+ docLevelShareCommentaryTxt;
								} else {
									shareCommentaryTxt = docLevelShareCommentaryTxt;
								}
							}
							
						}
					}	
				}
				if(typeof cb == "function") {
					if(includeDigestContent){
						var digestInfo = {};
						digestInfo.shareCommentaryTxt = shareCommentaryTxt;
						digestInfo.digestContent = digestContent;
						digestInfo.annotatedImgUrl = annotatedImgUrl;
						if(!_.isEmpty(annotationSubType)) {
							digestInfo.annotationSubType = annotationSubType;
						}
						cb(digestInfo);
					} else {
						var digestInfo = {};
						digestInfo.text = shareCommentaryTxt;
						digestInfo.annotatedImgUrl = annotatedImgUrl;
						if(!_.isEmpty(annotationSubType)) {
							digestInfo.annotationSubType = annotationSubType;
						}
						cb(digestInfo);
						//cb(shareCommentaryTxt);
					}
				}
			});
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
		
		function addBoxShadowToDigest(groupBy) {
			var timer1;
			timer1 = $timeout(function() {
				var digestWindowWidth = $(".digest-content-wrap").outerWidth();
				var iframeDoc = (document.getElementsByTagName('iframe')[0]).contentWindow;
				if(digestWindowWidth < 900) {
					if(groupBy == "document") {
						$(iframeDoc.document.body).find("#annotaion-digest-template").css({"box-shadow" : "none","max-width": "none","margin": "unset","padding": "unset"});
					} else {
						$(iframeDoc.document.body).find("#annotaion-digest-group-template").css({"box-shadow" : "none","max-width": "none","margin": "unset","padding": "unset"});
					}
				} else {
					if(groupBy == "document") {
						$(iframeDoc.document.body).find("#annotaion-digest-template").css({"box-shadow" : "3px 5px 5px 3px #aaaaaa","max-width": "850px","margin": "auto","padding": "15px"});
					} else {
						$(iframeDoc.document.body).find("#annotaion-digest-group-template").css({"box-shadow" : "3px 5px 5px 3px #aaaaaa","max-width": "850px","margin": "auto","padding": "15px"});
					}
				}
				$timeout.cancel(timer1);
			},1000);
		}
		
		function addBoxShadowToHtmlDigest(groupBy) {
			var timer1;
			timer1 = $timeout(function() {
				var digestWindowWidth = $(".digest-content-wrap").outerWidth();
				if(digestWindowWidth < 900) {
					if(groupBy == "document") {
						$("#digest-content").find("#annotaion-digest-template").css({"box-shadow" : "none","max-width": "none","margin": "unset","padding": "unset"});
					} else {
						$("#digest-content").find("#annotaion-digest-group-template").css({"box-shadow" : "none","max-width": "none","margin": "unset","padding": "unset"});
					}
				} else {
					if(groupBy == "document") {
						$("#digest-content").find("#annotaion-digest-template").css({"box-shadow" : "3px 5px 5px 3px #aaaaaa","max-width": "850px","margin": "auto","padding": "15px"});
					} else {
						$("#digest-content").find("#annotaion-digest-group-template").css({"box-shadow" : "3px 5px 5px 3px #aaaaaa","max-width": "850px","margin": "auto","padding": "15px"});
					}
				}
				$timeout.cancel(timer1);
			},1000);
		}
		
	    return service;
	}]);
	
})();