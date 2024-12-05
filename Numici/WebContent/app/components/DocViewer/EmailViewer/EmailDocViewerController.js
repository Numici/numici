
;(function(){
	'use strict';
	
	angular.module("vdvcApp").controller('EmailDocViewerController',EmailDocViewerController);
	
	EmailDocViewerController.$inject = ["$rootScope","$scope","$state","$stateParams","appData","_","$timeout","pendingRequests",
	                                    "AnnotationService","DocFactory","DeepLinkService","TaskSpaceService",
	                                    "commonService","rangy","$document","$window","$deviceInfo","MessageService",
	                                    "urlParser","ToolTipService","$uibModal","$confirm","clipboard","APIUserMessages",
	                                    "$compile","TagService","orderByFilter","ActionItemsService","uuidService",
	                                    "userService","DocumentEventsListner","$filter","AddedTaskspacesService"];
	
	function EmailDocViewerController($rootScope,$scope,$state,$stateParams,appData,_,$timeout,pendingRequests,
			AnnotationService,DocFactory,DeepLinkService,TaskSpaceService,commonService,rangy,$document,$window,
			$deviceInfo,MessageService,urlParser,ToolTipService,$uibModal,$confirm,clipboard,APIUserMessages,
			$compile,TagService,orderBy,ActionItemsService,uuidService,userService,DocumentEventsListner,$filter,
			AddedTaskspacesService) {
			
			var EmailDocViewer = this;
			var appdata = appData.getAppData();
			var tagHighlightTimeOut;
			var getdocPromise;
			var DocsaveTimer;
			var commentChangeTimer;
			
			var cke_content_height = 0;
			var win = null;
			var currentUserId = appdata.UserId;
			var documentId = $stateParams.docId ? $stateParams.docId : $scope.docId ? $scope.docId : undefined;
			var clientId = $stateParams.clientId ? $stateParams.clientId : $scope.clientId ? $scope.clientId : undefined;
			var commentId = $stateParams.commentId ? $stateParams.commentId : $stateParams.da;
			var selectionConfig = {};
			var contentChanged = false;
			var linkHolder = {
					elements : []
			};
			
			var opencomment = false;
				
			EmailDocViewer.mailProperties = {};
			EmailDocViewer.readOnly = true;
			EmailDocViewer.isGlobalDoc = false;
			EmailDocViewer.deviceInfo = angular.copy($deviceInfo);
			EmailDocViewer.document = {};
			EmailDocViewer.saveMsg = {
				"msg" : "",
				"tooltip" : ""
			};
						
			var selectedText;
			var docDeepLinks = [];
			$scope.viewerId = uuidService.newUuid();
			var ckeId = "#cke_"+$scope.viewerId;
			var linkInfoId = '#lnk-meta-info-'+$scope.viewerId;
			$scope.doc = {};
			$scope.docHierarchy = [];
			$scope.docAnnotations = [];
			$scope.docOrphanAnnotations = [];
			$scope.selectedOrphanAnnotations = null;
			$scope.hasSelectedOrphanAnnotations = false;
			$scope.hasSelectedAnnotations = false;
			$scope.isDocInInbox = false;
			$scope.selectedAnnotations = null;
			$scope.annotLimit = 10;
			$scope.orphanAnnotLimit = 10;
			$scope.annotBegin = 0;
			$scope.activeTab = {"index" : 1};
			$scope.documentId = documentId;
			$scope.clientId = clientId;
			$scope.showComments = false;
			$scope.commentHolder = {
					elements : [],
					comment: null,
					commentFor: null,
					commentId: null
			};
			$scope.docCommentReply = {};
			
			$scope.tagLimit = 2;
			$scope.tags = [];
			
			$scope.isTagEdited = false;
			$scope.isAnnotTagEdited = {};
			$scope.isConvTagEdited = {};
			$scope.searchInEditTag = {"enable" : true};
			$scope.allAnnotTagValues = {};
			$scope.allConvTagValues = {};
			$scope.pagenoteInitiated = false;
			$scope.pagenote = {"text" : ""};
			$scope.addNewPageNote = addNewPageNote;
			
			$scope.status = {
					"isopen" : false
			};
			
			$scope.$on("$destroy",function handleDestroyEvent() {
				$timeout.cancel(tagHighlightTimeOut);
				$timeout.cancel(loadTimer);
			});
			
			
			$scope.$on("BoxRevoke", function(event, data) {
				handelRevokeEvent("box",data);
			});
			
			$scope.$on("DropBoxRevoke", function(event, data) {
				handelRevokeEvent("dropBox",data);
			});
			
			$scope.$on("OneDriveRevoke", function(event, data) {
				handelRevokeEvent("oneDrive",data);
			});
			
			
			function handelRevokeEvent(fieldName,data) {
				var externalStorageFolder = _.find($scope.docHierarchy,function(folder) {
	    	        var externalStorageInfo  = folder["externalStorageInfo"];
	    			if(!_.isEmpty(externalStorageInfo)) {
	    				return externalStorageInfo[fieldName];
	    			} 
	    			return false;
				});
				
	    		if(!_.isEmpty(externalStorageFolder)) {
	    			$state.go("docs",{"folderId":appdata.rootFolderId});
	    		}
			 }
			
			
			EmailDocViewer.loader = true;
			EmailDocViewer.isInDocView = false;
			EmailDocViewer.isInTaskspace = false;
			EmailDocViewer.isInSearch = false;
			EmailDocViewer.isInInbox = false;
			EmailDocViewer.isTSContext = isTSContext;
			EmailDocViewer.getUserlabel = getUserlabel;
			EmailDocViewer.getReceivedUsers = getReceivedUsers;
			EmailDocViewer.addToTaskSpace = addToTaskSpace;
			EmailDocViewer.addedTaskspaces = addedTaskspaces;
			EmailDocViewer.toggleComments = toggleComments;
			EmailDocViewer.showShareBtn = showShareBtn;
			EmailDocViewer.openShareDocModal = openShareDocModal;
			EmailDocViewer.closeDocument = closeDocument;
			EmailDocViewer.getToolTip = getToolTip;
			EmailDocViewer.initComment = initComment;
			EmailDocViewer.createLink = createLink;

			
			$scope.formatComment = function(annotation,comment) {
				if(annotation.webAnnotation) {
					return $filter('markdown')(comment);
				} else {
					return $filter('linky')(comment,'_blank');
				}

				return comment;
			};
			
			function updateDocumentOnNotification() {
				var mySelection;
				if($window.getSelection) {
			        mySelection = $window.getSelection();
			    }
				var txt = "";
				var htmltext = rangy.getSelection(EmailDocViewer.iframedoc.body).toHtml();
				/*if(mySelection) {
					txt = mySelection.getSelectedText();
				}*/
				if(_.isEmpty(htmltext)) {
					refreshDocument({
						onDocSaveSuccess : function() {
							getDocAnnotations();
						}
					});
				}
			}
			
			$scope.$on("COMMENTED",function(event, msg){
				if(msg.tsId && msg.tsId != $scope.tsId) {
					return false;
				} 
				
				if(msg.documentId == $scope.documentId) {
					updateDocumentOnNotification();
				}
			});
			
			$scope.$on("UPDATED",function(event, msg){
				if(msg.documentId == $scope.documentId) {
					updateDocumentOnNotification();
				}
			});
			
			
			function notifyAnnotationCount(count) {
				if($scope.annotationContext == "taskspace") {
					var msg = {
							"annotationContext" :  $scope.annotationContext,
							"taskspaceId": $scope.tsId,
							"tsClientId" : $scope.tsClientId,
							"documentId" : $scope.documentId,
							"annotCount" : count
					};
					$rootScope.$broadcast('annotCount', msg);
				}
			}
			
			function setSnippetPosition(index){
				 if(EmailDocViewer.iframedoc && EmailDocViewer.iframedoc.body) {
						var tool_bar_height = $(ckeId).find('.cke_top').outerHeight();
						
						if(!isNaN(tool_bar_height)) {
							tool_bar_height += 55;
							DocFactory.goToHighlightedSnippet(EmailDocViewer.iframedoc.body,index,tool_bar_height); 
						} else {
							DocFactory.goToHighlightedSnippet(EmailDocViewer.iframedoc.body,index,55); 
						}
							
					}
			}
			
			function getDocAnnotationPromise(docId,clientId,data) {
				var getAnnotations = AnnotationService.getAllDocAnnotations(docId,clientId,data,{spinner: 'search_spinner'});
				getAnnotations.then(function() {
					
				})["finally"](function() {
					
				});
				return getAnnotations;
			}
			
			var getDocContextAnnotationPromise;
			function showCommentFromSnippet(snippet){
				if(snippet.context != $scope.annotationContext || snippet.tsId != $scope.tsId) {
					
					pendingRequests.cancel(getDocContextAnnotationPromise);
					
					$scope.tsId = snippet.tsId;
					$scope.tsClientId = snippet.tsClientId;
					$scope.annotationContext = snippet.context ;
					
					var postdata = {
							"annotationContext" : $scope.annotationContext,
							"taskspaceId": $scope.tsId,
							"tsClientId" : $scope.tsClientId
					};
					
					$scope.docAnnotations = null;
					$scope.docOrphanAnnotations = null;
					getDocContextAnnotationPromise = getDocAnnotationPromise($scope.documentId,clientId,postdata);
					
					getDocContextAnnotationPromise.then(function(resp){
						if(resp.status == 200 && resp.data.Status) {
							var annotList = [];
							if(!_.isEmpty(resp.data.Annotations)) {
								annotList = resp.data.Annotations;
							}
							orderComments(annotList);
						}
					})["finally"](function(){
						commentFromSnippet(snippet);
					});
				} else {
					commentFromSnippet(snippet);
				}
			}
			
			
			

			
			
			function commentFromSnippet(snippet) {
				var tim;
				$timeout.cancel(tim);
				if(isPdfDocument()) {
					tim = $timeout(function() {
						$scope.showComments = true;
						var conv = $('div[data-convId="'+snippet.commentId+'"]').find('.comment-conv-txt');
						if($scope.showPdf) {
							$('div[data-convId="'+snippet.annotationId+'"]').closest('.comment-crd').trigger("click");
						} else {
							$('div[data-id="'+snippet.annotationId+'"]').find(".comment-crd").trigger("click");
						}
						
						if(conv && conv.length > 0) {
							DocFactory.highlightTextByRegex(conv[0],[snippet],0);
						}
						$timeout.cancel(tim);
					 }, 0);
					
				} else {
					var annotationId = snippet.annotationId;
					if(annotationId) {
						var anotObj = getAnnotationById(annotationId);
						$scope.activeTab.index = 1;
						$scope.hasSelectedAnnotations = true;
						if(anotObj) {
							var obj = angular.copy(anotObj);
							if(anotObj.isOrphan) {
								$scope.selectedOrphanAnnotations = [];
								$scope.hasSelectedOrphanAnnotations = true;
								$scope.selectedOrphanAnnotations.push(obj);
								$scope.activeTab.index = 2;
							} else {
								$scope.selectedAnnotations = [];
								$scope.selectedAnnotations.push(obj);
							}
							
							tim = $timeout(function() {
								$scope.showComments = true;
								var conv = $('div[data-convId="'+snippet.commentId+'"]').find('.comment-conv-txt');
								if($scope.showPdf) {
									$('div[data-convId="'+annotationId+'"]').closest('.comment-crd').trigger("click");
								} else {
									$('div[data-id="'+annotationId+'"]').find(".comment-crd").trigger("click");
								}
								
								if(conv && conv.length > 0) {
									DocFactory.highlightTextByRegex(conv[0],[snippet],0);
								}
								$timeout.cancel(tim);
							 }, 0);
						}
					}
				}
			}
			
			
			function highlightTag(tagName) {
				
				if(_.isArray($scope.tags)) {
					_.each($scope.tags,function(tag,i) {
						tag.isHighlighted = false;
						if(tag.TagName && tagName) {
							if(tag.TagName.toLowerCase() == tagName.toLowerCase()) {
								tag.isHighlighted = true;
							}
						}
					});
					$scope.tags.sort(function(x, y) {
				        return y.isHighlighted - x.isHighlighted;
				    });
				}
			} 
			
			
			function onSnippetChanged(snippet,index) {
				$('.comment-conv-txt').find("em.key").contents().unwrap();
				$('.comment-conv-txt').find("span.highlighted").contents().unwrap();
				
				switch(snippet.type) {
				case "content":
				case "description":
				case "textcontrol":
					//$scope.showComments = false;
					setSnippetPosition(index);
					break;
				case "annotations":
				case "annotatedText":
					showCommentFromSnippet(snippet);
					break;
				case "tags":
					if(snippet.context == "document") {
						if(snippet.string) {
							var tagname = snippet.string
							 .replace(new RegExp("<em>", 'g'), "")
							 .replace(new RegExp("</em>", 'g'), "");
							$timeout.cancel(tagHighlightTimeOut);
							tagHighlightTimeOut =  $timeout(function() {
								highlightTag(tagname);
							},1000);
						}
					} else {
						showCommentFromSnippet(snippet);
					}
					break;
				}
			}
			
			$scope.$on('snippetChanged', function(event, msg) {
				var snippet = msg.snippet; 
				onSnippetChanged(snippet,msg.index);
			});
			
			
			$scope.showAssignActionItemBtn = function() {
				var status = false;
				if(appdata 
						&& appdata.UserSettings 
						&& appdata.UserSettings.navigation_ActionItems 
						&& appdata.UserSettings.navigation_ActionItems !== "Hidden") {
					status = true;
				}
				return status;
			};
			
			$scope.disableAssignActionItemBtn = function() {
				var status = false;
				if(appdata 
						&& appdata.UserSettings 
						&& appdata.UserSettings.navigation_ActionItems 
						&& appdata.UserSettings.navigation_ActionItems === "Disable") {
					status = true;
				}
				return status;
			};
			
			$scope.copySuccess = function() {
				APIUserMessages.info("Link copied to clipboard.");
			};
			
			$scope.copyFail = function() {
				
			};
			
			$scope.compressDoc = function() {
				$scope.$emit("isolateDoc",false);
				$scope.$broadcast('resizeDoc', true);
			};
			
			$scope.showOpenInTaskspaceBtn = function() {
				return TaskSpaceService.showOpenInTaskspaceBtn;
			};
			
			$scope.openDocumentInTaskspace = function() {
				var currentTaskspace = TaskSpaceService.currentTaskspace;
				$state.go('taskspace.list.task',{'tsId' : currentTaskspace.id,'tsc' : currentTaskspace.clientId,'d' : $scope.doc.id,'dc' : $scope.doc.clientId});
				TaskSpaceService.showOpenInTaskspaceBtn = false;
			};
			
			function scrollToComment() {
				if(!_.isEmpty(commentId) && (($state.current.name == "taskspace.list.task" && $stateParams.d && $scope.documentId == $stateParams.d) || ($state.current.name == "taskspace.list.task" && !$stateParams.d) || $state.current.name != "taskspace.list.task")) {
					var commentChangeTimer1 =  $timeout(function() {
						$scope.showComments = true;
						/*var cmtEl = $('div[data-id="'+commentId+'"]').find(".comment-crd");
						if($scope.el && cmtEl.length > 0 ) {
							cmtEl = $scope.el.find('div[data-id="'+commentId+'"] .comment-crd');
							cmtEl.trigger("click");
							cmtEl.find('.comment-in textarea').focus();
						} else if($scope.element && cmtEl.length > 0 ) {
							cmtEl = $scope.element.find('div[data-id="'+commentId+'"] .comment-crd');
							cmtEl.trigger("click");
							cmtEl.find('.comment-in textarea').focus();
						} else if(cmtEl.length == 0){
							MessageService.showErrorMessage("ANNOTATION_NOT_FOUND",[commentId]);
						}*/
						goToComment(null,$scope.commentId);
						$timeout.cancel(commentChangeTimer1);
						commentId = null;
		        	 },1);
				}
			}
			
			$scope.$on('onSelectComment', function (event,commentId) {
				commentId = commentId;
				scrollToComment();
			});
			
			function calCkeContentHeight() {
				var emailDocViewerContainer = $(".vdvc-email-doc-viewer-container");
				var navBarHeight = 0;
				if(EmailDocViewer.isInDocView) {
					navBarHeight = 75;
				} else {
					emailDocViewerContainer.css({"padding-top":0});
				}
				var firstNavbarHeight = $(".email-doc-viewer-first-navbar").outerHeight();
				var secondNavbarHeight = $(".email-doc-viewer-second-navbar").outerHeight();
				
				var containerHeight = emailDocViewerContainer.outerHeight();
				var cke_comments_height = containerHeight - (navBarHeight+firstNavbarHeight+secondNavbarHeight);
				var commenntsWrapEle = $('div.email-document-wrap[data-id="'+EmailDocViewer.document.id+'"]').find(".comment-wrap");
				if(commenntsWrapEle) {
					commenntsWrapEle.css({"height":cke_comments_height});
				}
				var emailPropertiesHeight = $(".email-properties").outerHeight();
				cke_content_height = containerHeight - (navBarHeight+firstNavbarHeight+secondNavbarHeight+emailPropertiesHeight);
			}
			
			$scope.$on("resizeDoc",function(event, msg){
				var t = $timeout(function() {
					calCkeContentHeight();
					var editor = $('#cke_editor-'+EmailDocViewer.document.id);
					if (CKEDITOR.instances['editor-'+EmailDocViewer.document.id] && editor) {
						editor.find(".cke_contents").height(cke_content_height-10);
						//CKEDITOR.instances['editor-'+EmailDocViewer.document.id].resize("100%",cke_content_height);
					}
					$(".doc-content").children().css({"height": cke_content_height-10});
					$timeout.cancel(t);
				},500);
			});
			
			function processTags() {
				$scope.tags =  orderBy($scope.tags, "TagName");
				$scope.selectedTags.tags = angular.copy($scope.tags);
			}
			
			var itemTagsPromise;
			$scope.getItemTags = function() {
				if($scope.documentId) {
					pendingRequests.cancel(itemTagsPromise);
					itemTagsPromise = TagService.getItemTags('high',$scope.doc);
					itemTagsPromise.then(function(response){
						if (response.status == 200) {
							$scope.tags = response.data.Tag;
							processTags();
						}
					});
				}
			};
			
			$scope.unTag = function(tag) {
				if(tag) {
					var text = "Are you sure you want to delete Tag "+tag.TagName+" ?";
		  			$confirm({text: text})
			        .then(function() {
			        	TagService.unTag(tag,$scope.doc).then(function(response){
							if (response.status == 200) {
								$scope.getItemTags();
							}
						});
				    }, function() {
				    	
				    });
				}
			};
			
			$scope.cancelAddTagToggle = function($event) {
				if($event) {
					$event.preventDefault();
				    $event.stopPropagation();
				}
				$scope.selectedTags.tags = angular.copy($scope.tags);
				$scope.status.isopen = false;
				$scope.cancelEditTag();
			};
						
			$scope.saveEditedTag = function($event,type,typeId) {
				if($event) {
					$event.preventDefault();
				    $event.stopPropagation();
				}
				if(type === "Doc") {
					if($scope.editedTag.TagName && !_.isEmpty($scope.editedTagValues.tagValues)) {
						var editedTagObj = _.findWhere($scope.selectedTags.tags,{"TagName" : $scope.editedTag.TagName});
						if(editedTagObj) {
							editedTagObj.Value = $scope.editedTagValues.tagValues[0].Value;
							$scope.selectedTags.tags = _.reject($scope.selectedTags.tags, function(tag){ 
								return tag.TagName == $scope.editedTag.TagName; 
							});
							$scope.selectedTags.tags.push(editedTagObj);
						}
						//_.findWhere($scope.selectedTags.tags,{"TagName" : $scope.editedTag.TagName}).Value = $scope.editedTagValues.tagValues[0].Value;
					} else if($scope.editedTag.TagId && !_.isEmpty($scope.editedTagValues.tagValues)) {
						_.findWhere($scope.selectedTags.tags,{"TagId" : $scope.editedTag.TagId}).Value = $scope.editedTagValues.tagValues[0].Value;
					}
				}
				if(type === "Annot") {
					if($scope.editedAnnotTags[typeId] && 
							!_.isEmpty($scope.editedAnnotTags[typeId].tags) && 
							$scope.editedAnnotTags[typeId].tags[0].TagName && 
							$scope.editedAnnotTagValues[typeId] && 
							!_.isEmpty($scope.editedAnnotTagValues[typeId].tagValues)) {
						_.findWhere($scope.selectedAnnotTags[typeId],{"TagName" : $scope.editedAnnotTags[typeId].tags[0].TagName}).Value = $scope.editedAnnotTagValues[typeId].tagValues[0].Value;
					}
				}
				if(type === "Conv") {
					if($scope.editedConvTags[typeId] && 
							!_.isEmpty($scope.editedConvTags[typeId].tags) && 
							$scope.editedConvTags[typeId].tags[0].TagName && 
							$scope.editedConvTagValues[typeId] && 
							!_.isEmpty($scope.editedConvTagValues[typeId].tagValues)) {
						_.findWhere($scope.selectedAnnotTags[typeId],{"TagName" : $scope.editedConvTags[typeId].tags[0].TagName}).Value = $scope.editedConvTagValues[typeId].tagValues[0].Value;
					}
				}
				$timeout(function() {
					$scope.$apply();
				},0);
				$scope.cancelEditTag(null,type,typeId);
			};
						
			$scope.cancelEditTag = function($event,type,typeId) {
				if($event) {
					$event.preventDefault();
				    $event.stopPropagation();
				}
				if(type === "Doc") {
					$scope.isTagEdited = false;
					$scope.editedTag = {};
					$scope.editedTagValues.tagValues = [];
				}
				if(type === "Annot") {
					$scope.isAnnotTagEdited[typeId] = false;
					$scope.editedAnnotTags[typeId] = {};
					$scope.editedAnnotTagValues[typeId] = {};
				}
				if(type === "Conv") {
					$scope.isConvTagEdited[typeId] = false;
					$scope.editedConvTags[typeId] = {};
					$scope.editedConvTagValues[typeId] = {};
				}
				removeTagHighlight(type,typeId);
			};
			
			$scope.disableSaveEditTag = function(type,typeId) {
				var status = true;
				if(type === "Doc" && 
						$scope.editedTagValues && 
						!_.isEmpty($scope.editedTagValues.tagValues) && 
						!_.isEmpty($scope.editedTagValues.tagValues[0].Value)) {
					status = false;
				}
				if(type === "Annot" && 
						$scope.editedAnnotTagValues[typeId] && 
						!_.isEmpty($scope.editedAnnotTagValues[typeId].tagValues) && 
						!_.isEmpty($scope.editedAnnotTagValues[typeId].tagValues[0].Value)) {
					status = false;
				}
				if(type === "Conv" && 
						$scope.editedConvTagValues[typeId] && 
						!_.isEmpty($scope.editedConvTagValues[typeId].tagValues) && 
						!_.isEmpty($scope.editedConvTagValues[typeId].tagValues[0].Value)) {
					status = false;
				}
				return status;
			};
			
			$scope.showTagName = function(tag) {
				var tagName = angular.copy(tag.TagName);
				if(!_.isEmpty(tag.Value)) {
					tagName = tagName +" : "+ tag.Value;
				}
				return tagName;
			}
			
			function handleTagCB(taggedInfo) {
				var isTaggedFalse = _.findWhere(taggedInfo,{"isTagged" : false});
				var isTaggedTrue = _.where(taggedInfo,{"isTagged" : true});
				if(isTaggedFalse) {
					var NoPermOnObjectList = _.where(taggedInfo,{"Reason" : "NoPermOnObject"});
					var ObjectNotFoundList = _.where(taggedInfo,{"Reason":"ObjectNotFound"});
					var NoReasonObjectList = _.where(taggedInfo,{"Reason" : null});
					
					if(!_.isEmpty(NoPermOnObjectList)) {
						MessageService.showErrorMessage("TAG_ITEMS_ERR");
					} else if(!_.isEmpty(ObjectNotFoundList)) {
						MessageService.showErrorMessage("ITEMS_NOT_FOUND_TAG");
					} else if(!_.isEmpty(NoReasonObjectList)) {
						MessageService.showErrorMessage("DEFAULT_ERROR_MSG");
					} else {
						MessageService.showErrorMessage("BACKEND_ERR_MSG",[isTaggedFalse.Reason]);
					}
				} else if(!_.isEmpty(isTaggedTrue)) {
					$scope.status.isopen = false;
					MessageService.showSuccessMessage("TAG_ITEMS",[$scope.doc.name]);
				}
			}
			
			function removeTagHighlight(type,typeId) {
				if(type === "Doc") {
					$(".vdvc-add-doc-tag-ui-select .ui-select-match-item.btn-primary").removeClass("btn-primary");
				}
				if(type === "Annot" || type === "Conv") {
					$("#"+typeId+".vdvc-add-doc-annot-tag-ui-select .ui-select-match-item.btn-primary").removeClass("btn-primary");
				}
			}
			
			$scope.editTag = function(tag,$event) {
				$scope.isTagEdited = true;
				$scope.editedTag = angular.copy(tag);
				$scope.editedTagValues.tagValues = [];
				if(!_.isEmpty($scope.editedTag.Value)) {
					$scope.editedTagValues.tagValues.push({"Value" : $scope.editedTag.Value});
					$scope.searchInEditTag.enable = false;
				}
			};
			
			$scope.editAnnotTag = function(tag,annotId,$event) {
				$scope.isAnnotTagEdited[annotId] = true;
				$scope.editedAnnotTags[annotId] = {};
				$scope.editedAnnotTagValues[annotId] = {};
				$scope.editedAnnotTags[annotId]["tags"] = [];
				$scope.editedAnnotTagValues[annotId]["tagValues"] = [];
				if($scope.editedAnnotTags[annotId] && $scope.editedAnnotTags[annotId].tags) {
					$scope.editedAnnotTags[annotId].tags.push(angular.copy(tag));
					if(!_.isEmpty(tag.Value)) {
						$scope.editedAnnotTagValues[annotId].tagValues.push({"Value" : tag.Value});
					}
				}
			};
					
			$scope.editConvTag = function(tag,convId,$event) {
				$scope.isConvTagEdited[convId] = true;
				$scope.editedConvTags[convId] = {};
				$scope.editedConvTagValues[convId] = {};
				$scope.editedConvTags[convId]["tags"] = [];
				$scope.editedConvTagValues[convId]["tagValues"] = [];
				if($scope.editedConvTags[convId] && $scope.editedConvTags[convId].tags) {
					$scope.editedConvTags[convId].tags.push(angular.copy(tag));
					if(!_.isEmpty(tag.Value)) {
						$scope.editedConvTagValues[convId].tagValues.push({"Value" : tag.Value});
					}
				}
			};
			
			$scope.saveTag = function($event) {
				if($event) {
					$event.preventDefault();
				    $event.stopPropagation();
				}
				if ($scope.selectedTags.tags.length > 0) {
					//var tagsToSave = _.pluck(_.where($scope.selectedTags.tags, {isNew: true}), 'TagName');
					var tagsToSave = [];
					_.each($scope.selectedTags.tags,function(selectedTag){
						if(!_.isEmpty(selectedTag.TagName)) {
							tagsToSave.push({"TagName" : selectedTag.TagName,"Value" : selectedTag.Value});
						}
					});
					$scope.status.isopen = true;
					var postdata = {};
					postdata["tags"] = tagsToSave;
					postdata["Items"] = [{
							"Type":"Document",
							"TopObjectId": $scope.doc.id,
							"TopObjectClientId" : $scope.doc.clientId
					}];
					
					TagService.tagItems(postdata).then(function(response) {
						if (response.status == 200) {
							if(response.data.Status) {
								$scope.status.isopen = false;
								$scope.getItemTags();
								handleTagCB(response.data.resultList);
							}
						}
					});
				}
			};
			
			 $scope.onRemoveTag = function(tag) {
				 $scope.status.isopen = false;
			  	 if(tag.TagId) {
			  		 var isCurrentDocTag = _.findWhere($scope.tags,{"TagId":tag.TagId});
			  		 if(isCurrentDocTag) {
			  			 $scope.unTag(tag);
			  		 }
			  	 }
			 };
			 
			 $scope.onRemoveTagValue = function() {
				 $scope.status.isopen = true;
				 $scope.searchInEditTag.enable = true;
				 $scope.refreshTagVlauesInfo($scope.editedTag.TagName,"");
			 };
			 
			 $scope.onRemoveAnnotTagValue = function(tag,annotId) {
				 if($scope.searchInEditTag[annotId]) {
					 $scope.searchInEditTag[annotId].enable = true;
				 }
				 $scope.refreshAnnotTagVlauesInfo(annotId,tag.TagName,"");
			 };
			 
			 $scope.onRemoveConvTagValue = function(tag,convId) {
				 if($scope.searchInEditTag[convId]) {
					 $scope.searchInEditTag[convId].enable = true;
				 }
				 $scope.refreshConvTagVlauesInfo(convId,tag.TagName,"");
			 };
			 
			 $scope.tagFilterSelected = function(tag,selected) {
				 if(_.isEmpty(tag.TagName)){
					 return true;
				 }
				 
				 if( _.isArray(selected)) {
					 var found = _.find(selected, function(term) {
						 var val = term.TagName.trim();
						 var tagText = tag.TagName.trim();
						 return val.toLowerCase() == tagText.toLowerCase(); 
					 });
					 
					 if(found) {
						 return true;
					 }
				 }
				 return false;
			 };
			 
			 $scope.tagValuesFilterSelected = function() {
				 var status = false;
				 if(!_.isEmpty($scope.editedTagValues.tagValues)) {
					 status = true;
				 }
				 return status;
			 };
			 
			 $scope.onSelectTag = function(tag) {
				 tag.isNew = true;
				 var tagArray = tag.TagName.split(":");
				 tag.TagName = tagArray[0].trim();
				 if(!_.isEmpty(tagArray[1])) {
					 tag.Value = tagArray[1].trim();
				 }
				 
				 return tag;
			 };
			 
			 
			 $scope.onSelectDocumentTag = function(tag) {
				 var tag = $scope.onSelectTag(tag);
				 var selectedTags = $scope.selectedTags.tags;
				 if(_.isEmpty(tag.TagName)) {
					 $scope.selectedTags.tags = _.without(selectedTags, _.findWhere(selectedTags, {"TagName" : ""}));
				 } else {
					 if(_.isArray(selectedTags) && !_.isEmpty(tag.TagName)) {
						 var lowerQuery =  tag.TagName.toLowerCase();
						 var matched = _.filter(selectedTags, function(term) {
						    return term.TagName.toLowerCase() == lowerQuery;
						 });
						 if(matched && matched.length > 0) {
							 selectedTags = _.reject(selectedTags, function(term){ 
								 var val = term.TagName.trim();
								 var tagText = tag.TagName.trim();
								 return val.toLowerCase() == tagText.toLowerCase(); 
							 });
							 selectedTags.push(tag);
							 $scope.selectedTags.tags = selectedTags;
						 }
					 }
				 }
				
			 };
			 
			 $scope.onSelectDocumentTagValue = function() {
				 $scope.allTagValues = [];
				 $scope.searchInEditTag.enable = false;
			 };
			 
			 $scope.onSelectAnnotTagValue = function(annotId) {
				 $scope.allAnnotTagValues[annotId] = [];
				 if($scope.searchInEditTag[annotId]) {
					 $scope.searchInEditTag[annotId].enable = false;
				 }
			 };
			 
			 $scope.onSelectConvTagValue = function(convId) {
				 $scope.allConvTagValues[convId] = [];
				 if($scope.searchInEditTag[convId]) {
					 $scope.searchInEditTag[convId].enable = false;
				 }
			 };
			 
			 $scope.onSelectAnnotTag = function(tag,id) {
				 var tag = $scope.onSelectTag(tag);
				 var selectedTags = $scope.selectedAnnotTags[id];
				 if(_.isEmpty(tag.TagName)) {
					 $scope.selectedAnnotTags[id] = _.without(selectedTags, _.findWhere(selectedTags, {"TagName" : ""}));
				 } else {
					 if(_.isArray(selectedTags)) {
						 var lowerQuery =  tag.TagName.toLowerCase();
						 var matched = _.filter(selectedTags, function(term) {
						    return term.TagName.toLowerCase() == lowerQuery;
						 });
						 if(matched && matched.length > 1) {
							 selectedTags = _.reject(selectedTags, function(term){ 
								 var val = term.TagName.trim();
								 var tagText = tag.TagName.trim();
								 return val.toLowerCase() == tagText.toLowerCase(); 
							 });
							 selectedTags.push(tag);
							 $scope.selectedAnnotTags[id] = selectedTags;
						 }
					 }
				 }
			 };
			 
			 $scope.tagTransform = function(tagname) {
				 if(!_.isEmpty(tagname)) {
					 tagname = tagname.trim()
				 }
			  	 return {
			  		"TagId":null,
			  		"TagName" : tagname,
			  		"isNew" : true
			  	};
			 };
			 
			 $scope.tagValueTransform = function(tagValue) {
				 if(!_.isEmpty($scope.editedTagValues.tagValues)) {
					 return false;
				 }
				 if(!_.isEmpty(tagValue)) {
					 tagValue = tagValue.trim()
				 }
			  	 return {
			  		"Value" : tagValue
			  	 };
			 };
			 
			 $scope.annotTagValueTransform = function(tagValue) {
				 if(!_.isEmpty(tagValue)) {
					 tagValue = tagValue.trim()
				 }
			  	 return {
			  		"Value" : tagValue
			  	 };
			 };
			 
			 $scope.convTagValueTransform = function(tagValue) {
				 if(!_.isEmpty(tagValue)) {
					 tagValue = tagValue.trim()
				 }
			  	 return {
			  		"Value" : tagValue
			  	 };
			 };
			
			$scope.refreshTagInfo = function(searchkey) {
				  if(!_.isEmpty(searchkey)) {
					  TagService.getAllTags(searchkey).then(function(resp) {
							if(resp.status == 200 && resp.data.Status) {
								$scope.Alltags = resp.data.Tag; 
							}
						});
				  }
			};
			
			$scope.refreshTagVlauesInfo = function(TagName,searchkey) {
				if(_.isEmpty($scope.editedTagValues.tagValues) && searchkey != null) {
					  TagService.getAllTagValues(TagName,searchkey).then(function(resp) {
							if(resp.status == 200 && resp.data.Status) {
								$scope.allTagValues = resp.data.Tag; 
							}
						});
				} else {
					$scope.allTagValues = [];
					searchkey = "";
				}
			};
			
			$scope.showDocCommentReply = function(doc,annotation) {
				var status = false;
				//var editableEle = $("div[data-id='"+annotation.id+"']").find(".editConvForm.ng-hide");
				var selectedAnnotEle = $("."+annotation.uid+".vdvc_comment_selected");
				if(selectedAnnotEle.length == 0) {
					selectedAnnotEle = $("."+annotation.id+".vdvc_comment_selected");
				}
				var editableEle = $(selectedAnnotEle[selectedAnnotEle.length-1]).find(".editConvForm.ng-hide");
				if($scope.hasSelectedAnnotations) {
					editableEle = $(selectedAnnotEle[selectedAnnotEle.length-2]).find(".editConvForm.ng-hide");
				}
				if(!doc.perms.readonly && annotation.conversations.length == editableEle.length) {
					status = true;
				}
				return status;
			}
			
			$scope.refreshAnnotTagVlauesInfo = function(annotId,TagName,searchkey) {
				if($scope.editedAnnotTagValues[annotId] && _.isEmpty($scope.editedAnnotTagValues[annotId].tagValues) && searchkey != null) {
					  TagService.getAllTagValues(TagName,searchkey).then(function(resp) {
							if(resp.status == 200 && resp.data.Status) {
								$scope.allAnnotTagValues[annotId] = resp.data.Tag; 
							}
					  });
				} else {
					$scope.allAnnotTagValues[annotId] = [];
					searchkey = "";
				}
			};
			
			$scope.refreshConvTagVlauesInfo = function(convId,TagName,searchkey) {
				if($scope.editedConvTagValues[convId] && _.isEmpty($scope.editedConvTagValues[convId].tagValues) && searchkey != null) {
					  TagService.getAllTagValues(TagName,searchkey).then(function(resp) {
							if(resp.status == 200 && resp.data.Status) {
								$scope.allConvTagValues[convId] = resp.data.Tag; 
							}
					  });
				} else {
					$scope.allConvTagValues[convId] = [];
					searchkey = "";
				}
			};
			
			$scope.selectedTags = {
	    			tags : []
	    	};
			$scope.editedTagValues = {
					tagValues : []
	    	};
			
			$scope.selectedAnnotTags ={};
			$scope.editedAnnotTags = {};
			$scope.editedAnnotTagValues = {};
			$scope.editedConvTags = {};
			$scope.editedConvTagValues = {};
			
			$scope.toggleAddTag = function($event) {
				if($event) {
					$event.preventDefault();
				    $event.stopPropagation();
				}
				
			    if ($scope.status.isopen) {
			    	$scope.selectedTags ={
			    			tags : []
			    	};
			    	processTags();
			    } 
			    if (!$scope.status.isopen) {
			    	$scope.status.isopen = true;
				}
			};
			
			function getToolTip (key) {
				return ToolTipService.showToolTip(key);
			}
			
			function getUserlabel(name) {
	 			var lbl = "";
	 			if(_.isString(name) && name.trim()) {
	 				var matches = name.match(/\b(\w)/g);
	 				lbl = matches.join('');
	 			}
	 			return lbl.toUpperCase();
	 		}
			
			function getReceivedUsers(users) {
				var recivedUsers = [];
				if(users.indexOf(",") != -1){
					recivedUsers = users.split(",");
				} else {
					recivedUsers = [users];
				}
				var usersResult = "";
				if(!_.isEmpty(recivedUsers)) {
					_.each(recivedUsers,function(user,index) {
        				if(index == 0) {
        					usersResult = user;
        				} else if(index > 0) {
        					usersResult = usersResult+";"+user;
        				}
	       			});
				}
				return usersResult;
			}
			
			function addToTaskSpace (size) {
				var modalInstance = $uibModal.open({
				      animation: $scope.animationsEnabled,
				      templateUrl: 'app/components/TaskSpace/AddToTaskSpace/addToTaskSpace.html',
				      controller: 'AddToTaskSpaceController',
				      appendTo : $('.rootContainer'),
				      controllerAs: 'vm',
				      backdrop: 'static',
				      size: 'lg',
				      resolve: {
				    	  item : function() {
				    		  return EmailDocViewer.document;
				    	  },
				    	  selectedChannelInfo : {},
				    	  slackChannelConfigs : {},
				    	  moveObjectInfo : {},
				    	  addObjectsFromDocsInfo : {},
				    	  asanaconfig : {}
				      }
				});
				modalInstance.result.then(function (obj) {
					MessageService.showSuccessMessage("ADD_TASKSPACE");
				}, function () {
					
				});
			}
			
			function addedTaskspaces () {
				DocFactory.getDocAssociatedToTaskspace(EmailDocViewer.document.clientId,EmailDocViewer.document.id).then(function(resp) {
					if(resp.status == 200 && resp.data.Status) {
						AddedTaskspacesService.open({"windowClass" : "added-taskspaces-list", "SelectedDoc" : EmailDocViewer.document,"AddedTaskspaces" : resp.data.Taskspaces});
					}
				});
			}
			
			function toggleComments(){
				$scope.showComments = !$scope.showComments;
			}
			
			$scope.canEditdocAnnotation = function(conv) {
				var status = false;
				if(conv) {
					var user = conv.userId ? conv.userId : conv.createdBy;
					var loginUser = _.isString(appdata.UserId) ? appdata.UserId.trim() : "";
					var commentOwner = _.isString(user)  ? user.trim() : "";
					
					var areEqual = loginUser.toUpperCase() === commentOwner.toUpperCase();
					if((areEqual || EmailDocViewer.document.isOwner)) {
						status =  true;
					}
				}
				return status;
			};
			
			$scope.hasRootComment = function(annotation) {
				var status = false;
				if(!_.isEmpty(annotation.conversations)) {
					var rootComment = _.findWhere(annotation.conversations,{"rootComment" : true});
					if(rootComment) {
						status = true;
					}
				}
				return status;
			};
			
			$scope.linkUIProperties = {
		    		templateUrl : 'app/components/DeepLink/AnnotationDeepLinkPopOver.html',
		    		trigger : 'none',
		    		cpToClipBoard : DeepLinkService.isCpToClipSupported,
		    		copySuccess : function() {
		    			APIUserMessages.info("Link copied to clipboard.");
		    		},
		    		copyfail : function(err) {
		    			
		    		},
		    		close: function() {
		    			hideAllAnnotLinkPopup();
		    		}
		    };
		    
			
			 function hideAllAnnotLinkPopup() {
			    	
			    	var annotObj = _.findWhere($scope.docAnnotations,{'showDeepLink': true});
			    	var orphanAnnotObj = _.findWhere($scope.docOrphanAnnotations,{"showDeepLink" : true});
			    	var selAnnotObj = _.findWhere($scope.selectedAnnotations,{"showDeepLink" : true});
			    	var selOrphanAnnotObj = _.findWhere($scope.selectedOrphanAnnotations,{"showDeepLink" : true});
			    	if($scope.showPdf) {
			    		annotObj = _.findWhere($scope.pdfAnnotations,{'showDeepLink': true});
			    	}
			    	
			    	annotObj ? delete annotObj.showDeepLink : false;
			    	orphanAnnotObj ? delete orphanAnnotObj.showDeepLink : false;
			    	selAnnotObj ? delete selAnnotObj.showDeepLink : false;
			    	selOrphanAnnotObj ? delete selOrphanAnnotObj.showDeepLink : false;
			    }
			
			 function isTSContext() {
		    	if($state.current.name == "taskspace.list.task") {
		    		return true;
		    	}
		    	return false;
			 }
			 
		    $scope.isDocSharable = function(doc) {
		    	var status = false;
		    	if($state.current.name == "taskspace.list.task") {
		    		var isTsSharable = TaskSpaceService.isTsSharable($scope.$parent.$parent.vm.taskSpace,currentUserId);
					if(isTsSharable) {
						status = true;
					}
				} else if(doc.isSharable) {
		    		status = true;
		    	}
		    	return status;
		    }
		    
		    $scope.postAnnotDigestToSlack = function(doc,annotation) {
				hideAllAnnotLinkPopup();
				if($scope.isDocSharable(doc)) {
					if(state.current.name == "taskspace.list.task" && $stateParams.tsId &&  $stateParams.tsc) {
						$scope.$emit("postDocuAnnotDigestToSlack",{"doc" : doc, "annotation" : annotation });
		    		}
				}
		    };
		    
		    $scope.annotationLinkInfo = {};
		    $scope.getDocAnnotationLink = function(doc,annotation) {
		    	hideAllAnnotLinkPopup();
				if($scope.isDocSharable(doc)) {
		    		$scope.annotationLinkInfo = {};
		    		var getLinkTimer = $timeout(function() {
			    		var postdata = {
			    				objectType : "DocAnnotation",
			    				linkObjectId : doc.id,
			    				linkType : 'Protected',
			    				clientId : doc.clientId,
			    				annotationId : annotation.id
			    		};
			    		if($state.current.name == "taskspace.list.task") {
			    			postdata.objectType = "TaskspaceDocAnnotation";
			    			postdata.taskspaceId = $stateParams.tsId;
			    			postdata.clientId = $stateParams.tsc;
			    		}
			    		if(!_.isEmpty(annotation.text)) {
			    			postdata["text"] = annotation.text;
						} else if(!_.isEmpty(annotation.highligtedText)) {
			    			postdata["text"] = annotation.highligtedText;
						} else if(doc.type == "Document") {
							postdata["text"] = doc.displayName;
						}
			    		postdata["linkUniqueId"] = annotation.resourceName;
			    		postdata["context"] = $scope.docContext;
			    		DeepLinkService.createLink(postdata).then(function(resp) {
							if(resp.status == 200 && resp.data.Status) {
								$scope.annotationLinkInfo.url = resp.data.Link.url;
								$scope.annotationLinkInfo.link = resp.data.Link.linkObj;
								$scope.annotationLinkInfo.focusLink = true;
								annotation.showDeepLink = true;
							}
						});
			    		$timeout.cancel(getLinkTimer);
		    		},100);
		    	}
		    };
			
		    function insertLineBlock($span) {
				if($span.parent().length > 0) {
					var lastNode = $span.parent()[0].lastChild;
					if(($span.is($(lastNode)) || lastNode.nodeName == "BR") && $span.next(".line-block").length == 0) {
						$("<span class='line-block'>&nbsp;</span>" ).insertAfter($span);
					}
				}
			}
			
		    $scope.deleteAnnotation = function(annotation,event) {
				if(event) {
					 event.stopPropagation();
				}
				$confirm({text: 'Do you want delete "ALL Conversations"'})
		        .then(function() {
		        	var annots = $scope.docAnnotations;
		        	var postdata = {
							"annotationId" : annotation.id,
						    "clientId" : clientId
					};
		        	EmailDocViewer.document.forceWrite = true;
	        		var nodes;
	        		if(EmailDocViewer.iframedoc.body) {
	        			nodes = $(EmailDocViewer.iframedoc.body).find('span.note[comment-id='+annotation.resourceName+']').contents();
	        			nodes.unwrap();
					}
	        		saveNotes({
	        			onDocSaveSuccess : function() {
	        				AnnotationService.deleteAnnotation(postdata).then(function(resp){
	    	        			if(resp.status == 200 && resp.data.Status) {
	    	        				for(var i = 0; i < annots.length; i++) {
	    								if(annots[i].id == annotation.id) {
	    									annots.splice(i, 1);
	    									break;
	    								}
	    							}
	    	        				if(!_.isEmpty($scope.selectedAnnotations) && $scope.selectedAnnotations[0].id == annotation.id) {
	    	        					$scope.ShowAllAnnotations();
	    	        				}
	    	        			}
	    	        		});
	        			},
	        			onDocSaveFail : function() {
	        				
	        				$.each(nodes,function(i,el){
	        					var $span = $('<span class="note"></span>')
	        				    el.wrap($span);
	  	   		 			  	if (i == 0 ) {
	  	   		 			  		$span.addClass("first");
	  	   		 			  	}
	  	   		 			  	
	  	   		 			  	$span.attr("comment-id",commentId);
	  	   		 			 
		  	   		 			if(i== elements.length-1) {
		  	   		 				$span.addClass("last");
		  	   		 				insertLineBlock($span);
		  	   		 			}
	  	   		 			});
	        				
	        				contentChanged = false;
	        			}
	        		});
		        });
			};
			
			$scope.deleteComment = function(commentId,annotation,event) {
				if(event) {
					 event.stopPropagation();
				}
				var annots = $scope.docAnnotations;
				$confirm({text: "Do you want delete conversation"})
		        .then(function() {
		        	var postdata = {
							"annotationId" : annotation.id,
						    "commentId" : commentId,
						    "clientId" : clientId
					};
		        	AnnotationService.deleteComment(postdata).then(function(resp){
						if(resp.status == 200 && resp.data.Status) {
							for(var i = 0; i < annots.length; i++) {
								if(annots[i].id == annotation.id) {
									var convs = annots[i].conversations;
									if(convs) {
										for(var j=0;j<convs.length;j++) {
											if(convs[j].id == commentId) {
												convs.splice(j, 1);
												break;
											}
										}
										break;
									}
								}
							}
							var anotObj = _.findWhere($scope.docAnnotations,{"id" : annotation.id});
							if(anotObj) {
								if(checkAnotObjForVC(anotObj)) {
									addcommentIconToDoc(anotObj);
								} else {
									removecommentIconFromDoc(anotObj);
								}
							}
							MessageService.showSuccessMessage("COMMENT_DELETE");
						}
					});
		        });
			};
						
			$scope.preventClickEventOnEditComment = function(event) {
				var form = this.$form;
				$('.editable-buttons [type=button]').off('click').on('click',function(event){
					//event.preventDefault();
					event.stopPropagation();
					form.$cancel();
				});
				
				$('.editable-buttons [type=submit]').off('click').on('click',function(event){
					//event.preventDefault();
					event.stopPropagation();
					form.$submit();
				});
			};
			
			$scope.unBindClickEventonEditComment = function() {
				$('.vdvc-srch-opt,.editable-buttons [type=button]').off('click');
			};
			
			$scope.editComment = function(editcommentForm,conv,tagsInfo,$event) {
				//$('.comment-conv-wrap').off('click');
				if($event) {
					$event.stopPropagation();
				}
				$scope.selectedAnnotTags[conv.id] = angular.copy(tagsInfo);
				editcommentForm.$show();
			};
			
			$scope.cancelEditComment = function(editcommentForm,conv,$event) {
				//$('.comment-conv-wrap').off('click');
				if($event) {
					$event.stopPropagation();
				}
				$scope.selectedAnnotTags[conv.id] = [];
				editcommentForm.$cancel()
			};
			
			$scope.cancelAddPageNote = function($event) {
				if($event) {
					$event.stopPropagation();
				}
				$scope.selectedAnnotTags['pagenote'] = [];
				$scope.pagenoteInitiated = false;
			};
			
			$scope.updateComment = function(newcomment,conv,annotation,cb) {
				var postdata = {
						"annotationId" : annotation.id,
						"commentId" : conv.id,
						"comment" : newcomment,
						"clientId" : clientId
				};
				var selectedTags = $scope.selectedAnnotTags[conv.id];
				if(_.isArray(selectedTags)) {
					selectedTags = _.without(selectedTags, _.findWhere(selectedTags, {"TagName" : ""}));
					postdata["tags"] = selectedTags;
				}
				return AnnotationService.editComment(postdata).then(function(resp) {
					if(resp.status == 200 && resp.data.Status) {
						if(typeof cb === "function") {
							cb(resp.data.Status);
						}
						var timer = $timeout(function() {
							var anotObj = _.findWhere($scope.docAnnotations,{"id" : annotation.id});
							if(anotObj) {
								if(checkAnotObjForVC(anotObj)) {
									addcommentIconToDoc(anotObj);
								} else {
									removecommentIconFromDoc(anotObj);
								}
								var conversation = _.findWhere(anotObj.conversations,{"id" : conv.id});
								if(conversation) {
									conversation.tagsInfo = selectedTags;
								}
							}
				        }, 1000);
						
						return true;
					}else {
						return resp.data.Message;
					}
				});
			};
			
			function showShareBtn(doc) {
				var status = false;
				var isExternalDocPresent = DocFactory.isExternalDocPresent([doc]);
				if(doc && !doc.deleted && doc.isSharable && (doc.perms && doc.perms.edit && doc.perms.share) && doc.docType != "WebResource" && !isExternalDocPresent && !EmailDocViewer.isGlobalDoc){
					status = true;
				} else {
					status = false;
				}
				return status;
			}
			
			function handleShareCB(sharedInfo) {
				var isSharedFalse = _.findWhere(sharedInfo,{"isShared" : false});
				var isSharedTrue = _.where(sharedInfo,{"isShared" : true});
				if(isSharedFalse) {
					var NoPermOnObjectList = _.where(sharedInfo,{"Reason" : "NoPermOnObject"});
					var ObjectNotFoundList = _.where(sharedInfo,{"Reason":"ObjectNotFound"});
					
					if(!_.isEmpty(NoPermOnObjectList)) {
						MessageService.showErrorMessage("SHARE_ITEMS_ERR");
					} else {
						MessageService.showErrorMessage("DEFAULT_ERROR_MSG");
					}
				} else if(!_.isEmpty(isSharedTrue)) {
					MessageService.showSuccessMessage("DOC_SHARE",[EmailDocViewer.document.name]);
				}
			}
			
			function openShareDocModal(size) {
				if(EmailDocViewer.document) {
					var modalInstance = $uibModal.open({
						 animation: true,
					     templateUrl: 'app/components/Documents/ShareDocuments/shareDocModal.html',
					     controller: 'ShareDocModalCtrl',
					     appendTo : $('.rootContainer'),
					     controllerAs: 'vm',
					     size: size,
					     backdrop: 'static',
					     resolve: {
					    	  items : function() {
					    		  return [EmailDocViewer.document];
					    	  }
					     }
					 });
					 modalInstance.result.then(function (sharedInfo) {
						 if(sharedInfo.respType == "transfer") {
							 showDocument();
						 } else {
							 handleShareCB(sharedInfo);
						 }
					 }, function () {
					      
					 });
				}
			}
			 
			function closeDocument () {
				var idx = _.findIndex($scope.docHierarchy,{"id": EmailDocViewer.document.id});
				if(idx > 0) {
					var parent = $scope.docHierarchy[idx-1];
					if(EmailDocViewer.document.deleted) {
						$state.go('trash',{'trashId': parent.id});
					} else {
						$state.go('docs',{'folderId': parent.id});
					}
				} else {
					$state.go('docs',{'folderId': appdata.rootFolderId});
				}
				
			}
			
			function clearAllPromises() {
				pendingRequests.cancel(getdocPromise);
			}
			
			function clearSelection() {
				try{
					if($document[0].selection && document[0].selection.empty) {
				        document[0].selection.empty();
				    } else if($window.getSelection) {
				        var sel = $window.getSelection();
				        sel.removeAllRanges();
				    }
				}catch(e) {}
			}
			
			function isDocEditable() {
				var status = false;
				if(EmailDocViewer.document.editable && EmailDocViewer.document.perms.edit && !EmailDocViewer.document.deleted) {
					status = true;
				} 
				return status;
			}
			
			function saveDocumentOnCommentMode(postdata,options) {
				DocFactory.saveDocumentOnMultiMode(postdata).then(function (resp) {
					if(resp.status == 200 && resp.data.Status){
			        	contentChanged = false;
			        	
						if (resp.data.majorVersion && (resp.data.minorVersion || resp.data.minorVersion == 0)) {
							EmailDocViewer.document.majorVersion = resp.data.majorVersion;
							EmailDocViewer.document.minorVersion = resp.data.minorVersion;
						}
						
			        	if(_.isString(resp.data.Message) && resp.data.Message.toLowerCase() == 'conflict') {
			        		refreshDocument({
								onDocSaveSuccess : function() {
									getDocAnnotations();
								}
							});
			        		MessageService.showErrorMessage('DOC_SAVE_CONFLICT_ERR');
			        	} else if (CKEDITOR.instances['editor-'+EmailDocViewer.document.id] && resp.data.NewContent) {
			        		updateDocContent(resp.data.NewContent,options);
						} else {
							if(typeof options.onDocSaveSuccess == 'function'){
				        		options.onDocSaveSuccess();
					    	}
						}
			        	MessageService.showSuccessMessage("DOC_UPDATE",[EmailDocViewer.document.name]);
			        } else {
			        	if(typeof options.onDocSaveFail == 'function'){
			        		options.onDocSaveFail();
				    	}
			        }
			    })['finally'](function() {
			    	if(EmailDocViewer.deviceInfo.isMobile) {
			    		setCkeBodyWidth();
					}
			    	if(typeof options.onDocSaveComplete == 'function'){
			    		options.onDocSaveComplete();
			    	} else {
			    		//initiateDocSavePolling();
			    	}
			    });
			}
			
			function setDocScrollPosition(objSettings) {
				if(EmailDocViewer.iframedoc) {
					var scrollingElement = commonService.getScrollingElement(EmailDocViewer.iframedoc);
					scrollingElement.scrollTop = objSettings.position;
				}
			}
			
			function docSaveDefaultSuccessCb() {
				
				renderContentSearchSnippets();
				
		       	if(commonService.selectionConfig && EmailDocViewer.instance) {
		       		var commentEl = commonService.selectionConfig.commentEl;
		       		
		       		if(commentEl && commentEl.length > 0) {
			        		commentEl[0].scrollIntoView(true);
			        	} else {
			        		setDocScrollPosition({"position" : commonService.selectionConfig.scrollPosition});
			        	}
						commonService.selectionConfig = null;
					}
		       		        	
		       	ckEditorEvents($(EmailDocViewer.iframedoc.body));
			}
			
			function updateDocContent(content,options) {
				var bookmarks = EmailDocViewer.instance.getSelection().createBookmarks2();
				CKEDITOR.instances['editor-'+EmailDocViewer.document.id].setData(content,function() {
					onCkeInstanceReady();
					if(EmailDocViewer.instance) {
						EmailDocViewer.instance.focus();
						if(bookmarks) {
							try {
								EmailDocViewer.instance.getSelection().selectBookmarks(bookmarks);
							} catch (e) {
								// TODO: handle exception
							}
						}
					}
					docSaveDefaultSuccessCb();
					getDocAnnotations();
					/*if(!$scope.cmtUpdateReceived) {
						getDocAnnotations();
					}*/
					if(options && typeof options.onDocSaveSuccess == 'function'){
		        		options.onDocSaveSuccess();
			    	}
				});
			}
			
			function refreshDocument(options) {
				var postdata = {
					"documentId" : EmailDocViewer.document.id,
					"clientId" : clientId,
					"majorVersion" : $scope.doc.majorVersion,
					"minorVersion" : $scope.doc.minorVersion
				};
				DocFactory.refreshDocument(postdata).then(function (resp) {
			        if(resp.status == 200 && resp.data.Status){
			        	if (CKEDITOR.instances['editor-'+EmailDocViewer.document.id] && resp.data.NewContent) {
			        		contentChanged = false;
			        		if (resp.data.majorVersion && (resp.data.minorVersion || resp.data.minorVersion == 0)) {
								doc.majorVersion = resp.data.majorVersion;
								doc.minorVersion = resp.data.minorVersion;
			        		}
			        		updateDocContent(resp.data.NewContent,options);
						} else {
							if(options && typeof options.onDocSaveSuccess == 'function'){
				        		options.onDocSaveSuccess();
					    	}
						}
			        }
			    });
			}
						
			function getContentsTosave() {
				var content = EmailDocViewer.document.content;
				if(EmailDocViewer.iframedoc && EmailDocViewer.iframedoc.body) {
					DocFactory.revertHighlights( $(EmailDocViewer.iframedoc.body));
					var tempBody = $(EmailDocViewer.iframedoc.body).clone();
					$(tempBody).find("span.note").removeClass("note");
					content = $(tempBody).html();
				}
				/*if (CKEDITOR.instances['editor-'+EmailDocViewer.document.id]) {
					content = CKEDITOR.instances['editor-'+EmailDocViewer.document.id].getData();
				}*/ 
				return "<html><body>"+content+"</body></html>";
			}
			
			function saveNotes(options) {
				var defaultOptions = {};
				if(options) {
					defaultOptions = options;
				}
				defaultOptions.orgContent = angular.copy(EmailDocViewer.document.content);
				var content = getContentsTosave();
				var postdata = {
						"name" : EmailDocViewer.document.name,
						"parentFolderId" : EmailDocViewer.document.folderId,
						"content" : content,
						"userId" : EmailDocViewer.document.ownerId,
						"ownerId" : EmailDocViewer.document.ownerId,
						"id" :  EmailDocViewer.document.id,
						"clientId" : EmailDocViewer.document.clientId,
						"docType" : EmailDocViewer.document.docType,
						"majorVersion" : EmailDocViewer.document.majorVersion,
						"minorVersion" : EmailDocViewer.document.minorVersion,
						"forceWrite" : EmailDocViewer.document.forceWrite ? EmailDocViewer.document.forceWrite : false
				};
				if(EmailDocViewer.document.commentMode) {
					saveDocumentOnCommentMode(postdata,defaultOptions);
				}
			}
			
			function linkHighlight () {
				var txtHighlighter = rangy.createHighlighter(EmailDocViewer.iframedoc, "TextRange");
				
			    txtHighlighter.addClassApplier(rangy.createClassApplier("unused", {
		    	 	ignoreWhiteSpace: true,
			        useExistingElements: false,
			        onElementCreate: function(el) {
			        	$(el).removeClass("unused");
			        	$(el).addClass("vdvc-link");
			        	linkHolder.elements.push($(el));
			        },
			        elementTagName: "span"
				}));
				
				
				txtHighlighter.highlightSelection("unused");
				
				rangy.getSelection(EmailDocViewer.iframedoc).removeAllRanges();
				$('#comment-tool-'+EmailDocViewer.document.id).css({"display":"none"});
			}
			
			function addLinkAttrToText(uid) {
				if(EmailDocViewer.instance) {
					EmailDocViewer.instance.focus();
				}
				linkHighlight();
				var elements = linkHolder.elements;
				$.each(elements,function(i,el){
					if (i == 0 ) {
		 				$(el).addClass("first");
		 				$(el).prepend("&#8203;");
		 			}
		 			  
		 			$(el).attr("link-sourceId",uid);
		 			if(i== elements.length-1) {
		 				$(el).addClass("last");
		 				insertLineBlock($(el));
		 			}
			 	});
				
				linkHolder = {
						elements : []
					};
				
			}
			
			function createLink () {
				$('#comment-tool-'+EmailDocViewer.document.id).hide();
				if(EmailDocViewer.instance) {
					EmailDocViewer.instance.focus();
				}
				if(EmailDocViewer.document && !EmailDocViewer.document.isSharable) {
					return false;
				}
				AnnotationService.getUID().then(function(response){
					if (response.status == 200 && response.data.Status) {
						var uid = response.data.UniqueId;
						var modalInstance = $uibModal.open({
							  animation: true,
						      templateUrl: 'app/components/DeepLink/DeepLinkModal.html',
						      controller: 'DeepLinkModalController',
						      appendTo : $('.rootContainer'),
						      controllerAs: 'dl',
						      scope: $scope,
						      backdrop: 'static',
						      resolve: {
						    	  sourceInfo : function() {
						    		  return {
						    			"type" : EmailDocViewer.document._type,
						    			"obj" : EmailDocViewer.document,
						    			"uid" : uid,
						    			"context" : $scope.docContext,
						    			"linkBeforeCreate" : function(options) {
						    				addLinkAttrToText(uid);
											saveNotes(options);		
						    			} 
						    		  };
						    	  }
						      }
						 });
						
						 modalInstance.result.then(function (data) {
							if(data.isCopied) {
								MessageService.showSuccessMessage("LINK_COPIED_TO_CLIPBOARD");
							}
						 }, function () {
							
						 });
					}
				});
			};
			
			function ckEditorEvents(body) {
				body.find("a[href^=\\#]").off("click").on("click",function(event){
					event.preventDefault();
					var nm = $(this).attr('href').replace(/^.*?(#|$)/,'');
					var  el = body.find($(this).attr("href"));
					if(el.length > 0) {
						el[0].scrollIntoView();
					} else if(body.find('[name="'+nm+'"]').length > 0){
						body.find('[name="'+nm+'"]')[0].scrollIntoView();
					}
				});
				
				body.find("a").off("mouseenter").on("mouseenter",function(event){
					if((typeof event.currentTarget.href != 'undefined' && this.getAttribute("href").charAt(0) == "#") || (EmailDocViewer.document.webResource && !_.isEmpty(EmailDocViewer.document.Link))) {
						return false;
					}
					if(typeof event.currentTarget.href != 'undefined' && event.ctrlKey == true) {			
						$(this).css("cursor","pointer");
					}else{
						$(this).css("cursor","auto");
					}
					
					$('#lnk-meta-info-'+$scope.viewerId).hide();
					$('[data-id="'+EmailDocViewer.document.id+'"]').find('.link-info').css({"display":"none"});
					
					$scope.linkCrdInfo = {
							showLoader : true
					};
					
					if((typeof event.currentTarget.href != 'undefined') && event.ctrlKey == false) {
						var elem = event.currentTarget;
						handleLinkMouseEnter(elem);
					}else{
						$scope.linkCrdInfo = {};
					}
				});
			}			
			
			function handleLinkMouseEnter(elem) {
				var targetRect = elem.getBoundingClientRect();
				var urlObj = urlParser.parseUrl(elem.href);
				rePositionPopOverCard(targetRect,$('#lnk-meta-info-'+$scope.viewerId),1000);
				var appHost = $window.location.host;
				if((appHost === urlObj.host) && urlObj.pathname && ((urlObj.pathname.toLowerCase() == "/vdvc/link") || (urlObj.pathname.toLowerCase() == "/dlink"))) {
					var linkId = urlObj.searchObject.id;
					if(!_.isEmpty(linkId)) {
						DeepLinkService.openLink(linkId.toString()).then(function(resp) {
							if(resp.status == 200 ) {
					    		if(resp.data.Status) {
					    			processLinkInfo(resp.data.Link);
					    			$scope.linkCrdInfo.target = elem;
					    		} else {
					    			$scope.linkCrdInfo.target = elem;
					    			$scope.linkCrdInfo.errorMsg = 'Either Link is invalid or deleted';
					    			$scope.linkCrdInfo.showError = true;
					    		}
					    	} 
					    })['finally'](function() {
					    	hideLinkLoader();
					    	rePositionPopOverCard(targetRect,$('#lnk-meta-info-'+$scope.viewerId),1000);
					    });
					}
				} else{
					var postdata = {
						"externalUrl" : elem.href	
					};
					DeepLinkService.getExternalMetaTags(postdata).then(function(resp) {
						if(resp.status == 200 ) {
				    		if(resp.data.Status) {
				    			processLinkInfo(resp.data.Link);
					    		$scope.linkCrdInfo.target = elem;
				    		} else {
				    			$scope.linkCrdInfo.target = elem;
				    			$scope.linkCrdInfo.errorMsg = 'Either Link is invalid or deleted';
				    			$scope.linkCrdInfo.showError = true;
				    		}
				    	} 
				    })['finally'](function() {
				    	hideLinkLoader();
				    	rePositionPopOverCard(targetRect,$('#lnk-meta-info-'+$scope.viewerId),1000);
				    });
				}
			}
						
			function hideLinkLoader() {
		        var timer = $timeout(function() {
		        	if($scope.linkCrdInfo) {
		        		$scope.linkCrdInfo["showLoader"]  = false;
		        	}
		        	$timeout.cancel(timer);
		        }, 1000);
			}
			
			function rePositionPopOverCard(targetRect,popElement,time) {
				$timeout.cancel(toolBarTimer);
				var toolBarTimer = $timeout(function() {
					var frame = $("#cke_editor-"+EmailDocViewer.document.id).find("iframe");
					var frameWidth = frame.innerWidth();
					var frameHeight = frame.outerHeight();
					var framePos = frame.offset();
					
					var link = popElement;
					var linkWidth = link.outerWidth();
					var linkHeight = link.outerHeight();
					if(linkWidth > frameWidth) {
						link.css({"width":frameWidth+"px"});
					}
					
					if(framePos) {
						var top = framePos.top+targetRect.bottom;
						var left = (framePos.left+targetRect.left)+((targetRect.width/2)-(linkWidth/2));
						
						if(!isNaN(left)) {
							if((left+linkWidth) > (framePos.left+frameWidth)) {
								left = left - linkWidth;
							}
							if(left < framePos.left) {
								left = framePos.left;
							}
						}
						if(!isNaN(top)) {
							if((top+linkHeight) > (framePos.top+frameHeight)) {
								top = top - (targetRect.height+linkHeight);
							}
							if(top < framePos.top) {
								top = framePos.top;
							}
						}
						var elemCss = {
								"display":"block",
								"top" : top+'px',
								'left': left+'px'
						};
						link.css(elemCss);
					}
				},time);
			}
			
			function processLinkInfo(LinkInfo) {
				if(LinkInfo.metaInfo) {
					var info = LinkInfo.metaInfo; 
					if(info.imageUrl){
						var iw = 60,
							ih = 60,
							aspratio = 0,
							mW = 350,
							mH = 250;
						if(info.imageWidth && info.imageHeight) {
							if(info.imageWidth > mW) {
								aspratio = mW/info.imageWidth;
								iw = mW;
								ih = (aspratio*info.imageHeight);
							} else if(info.imageHeight > mH){
								aspratio = mH/info.imageHeight;
								iw = (aspratio*info.imageWidth);
								ih = mH;
							} else {
								iw = info.imageWidth;
								ih = info.imageHeight;
							}
						}
						info.iw = iw;
						info.ih = ih;
					}	
				}
				
				var showTitile = false;
				$scope.linkCrdInfo = LinkInfo.info;
				$scope.linkCrdInfo.metaInfo = LinkInfo.metaInfo;
				$scope.linkCrdInfo.url = LinkInfo.url;
	    		if(LinkInfo.metaInfo && LinkInfo.metaInfo.title) {
	    			showTitile = true;
	    		}
	    		$scope.linkCrdInfo.showTitle = showTitile;
			}
			
			$scope.isDocOnEditMode = function() {
				var status = false;
				if (EmailDocViewer.document && EmailDocViewer.document.docType == "EMail" && EmailDocViewer.documentLockId != null) {
					status = true;
				}
				return status;
			};
			
			
			function getAnnotationByResourceName(id) {
				return _.findWhere($scope.docAnnotations,{"resourceName" : id}) || _.findWhere($scope.docOrphanAnnotations,{"resourceName" : id});
			}
			
			function getAnnotationById(id) {
				return (_.findWhere($scope.docAnnotations,{"id" : id}) || _.findWhere($scope.docOrphanAnnotations,{"id" : id}));
			}
			
			
			function goToComment(commentid,annotationId,top) {
				$scope.activeTab.index = 1;
				var anotObj;
				if(commentid || annotationId) {
					$scope.hasSelectedAnnotations = true;
					if(commentid) {
						anotObj = getAnnotationByResourceName(commentid);
					}
					
					if(annotationId) {
						anotObj = getAnnotationById(annotationId);
					}
					
					if(anotObj) {
						var obj = angular.copy(anotObj);
						if(anotObj.isOrphan) {
							$scope.selectedOrphanAnnotations = [];
							$scope.hasSelectedOrphanAnnotations = true;
							$scope.selectedOrphanAnnotations.push(obj);
							$scope.activeTab.index = 2;
						} else {
							$scope.selectedAnnotations = [];
							$scope.selectedAnnotations.push(obj);
						}
						
						var tim = $timeout(function() {
							var $docWrap = $('div.email-document-wrap[data-id="'+EmailDocViewer.document.id+'"]');
							if($docWrap.length > 0) {
								$scope.onClickComment(null,null,$docWrap.find('.vdvc_comment_'+anotObj.resourceName),top);
							}
							$timeout.cancel(tim);
						 }, 0);
					}
				}
				
				
				/*if(commentid) {
					// $('.vdvc_comment_'+commentid).trigger("click");
					
					//var index = getAnnotIndex(commentid);
					var tim = $timeout(function() {
						var $docWrap = $('div.doc-viewr[data-id="'+$scope.viewerId+'"]');
						if($docWrap.length > 0) {
							$scope.onClickComment(null,null,$docWrap.find('.vdvc_comment_'+commentid),top);
						}
						$timeout.cancel(tim);
					 }, 0);
				}*/
			}
			
			
			$scope.ShowAllAnnotations = function() {
				$scope.selectedAnnotations = null;
				$scope.hasSelectedAnnotations = false;
				$scope.selectedOrphanAnnotations = null;
				$scope.hasSelectedOrphanAnnotations = false;
				$scope.activeTab.index = 1;
			};
			
			
			$scope.onClickComment = function($event,annotation,element,top) {
				var $docWrap = $('div.email-document-wrap[data-id="'+EmailDocViewer.document.id+'"]');
				if (!$event || ($event && $event.target.tagName !== "INPUT")) {
					$docWrap.find(".vdvc_comment_selected").removeClass('vdvc_comment_selected');
				}
				if ($event && $event.target.tagName !== "INPUT") {
					//$event.preventDefault();
				    $event.stopPropagation(); 
				    var prnt = $($event.currentTarget).closest('.vdvc_comment');
				    var rid = prnt.attr("data-rid");
				    prnt.addClass("vdvc_comment_selected");
				    prnt.find("textarea").focus();
				    prnt[0].scrollIntoView(true);
			    	$docWrap.find(".comment-wrap")[0].scrollTop -= 10;
			    	
			    	var docEl = $( EmailDocViewer.iframedoc.body ).find('span.note.first[comment-id="'+rid+'"]');
			    	if(docEl.length > 0) {
			    		var delta = 0;
			    		var $toolBar = $docWrap.find('.cke_top');
			    		docEl[0].scrollIntoView(true);
			    		var wB = {
			    			tB : $toolBar.outerHeight(),
			    			lB : $docWrap.outerHeight()
			    		};
			    		if($toolBar.offset()) {
			    			wB.tB = wB.tB + $toolBar.offset().top;
			    		}
			    		if($docWrap.offset()) {
			    			wB.lB = wB.lB + $docWrap.offset().top;
			    		}
			    		var mdl = (wB.lB-wB.tB)/2;
			    					    		
			    		if(EmailDocViewer.iframedoc) {
							var scrollingElement = commonService.getScrollingElement(EmailDocViewer.iframedoc);
							scrollingElement.scrollTop -= mdl;
						}
			    		
			    		$(EmailDocViewer.iframedoc.body).find('span.note_slctd').removeClass("note_slctd");
			    		$(EmailDocViewer.iframedoc.body).find('span.note[comment-id="'+rid+'"]').addClass("note_slctd");
			    	}
			    } 
				if (!$event || ($event && $event.target.tagName !== "INPUT")) {
					if(element && element.length > 0) {
						/*element.addClass("vdvc_comment_selected");
						element.find("textarea").focus();
						element[0].scrollIntoView(true);
					    $docWrap.find(".comment-wrap")[0].scrollTop -= 10;*/
						var rid = element.attr("data-rid");
					    var tim = $timeout(function() {
							if(rid) {
								var cmtEle = $('div[data-rid="'+rid+'"]')
								cmtEle.addClass("vdvc_comment_selected");
								cmtEle.find("textarea").focus();
								cmtEle[0].scrollIntoView(true);
								$docWrap.find(".comment-wrap")[0].scrollTop -= 10;
							}
							$timeout.cancel(tim);
						 }, 0);
					}
				}
			};
			
			function showCommentOnCkeClick(body,elem) {
				$(body.$).find('span.note_slctd').removeClass("note_slctd");
				var comment_id = $(elem).attr("comment-id");
				$scope.showComments = true;
				elem.scrollIntoView();
				$(body.$).find('span[comment-id="'+comment_id+'"]').addClass("note_slctd");
				goToComment(comment_id,null,elem.offsetTop);
			}
			
			function showDeepLinkToOnCkeClick(win,elem,event) {
				var H = $('[data-id="'+EmailDocViewer.document.id+'"]').find('.link-info').outerHeight();
			    var W = $('[data-id="'+EmailDocViewer.document.id+'"]').find('.link-info').outerWidth();
	    		var vH = $(win.$).innerHeight(); 
	    		var vW = $(win.$).outerWidth(); 
	    		var x = event.data.$.clientX; 
				var y = event.data.$.clientY-$('[data-id="'+EmailDocViewer.document.id+'"]').find('.link-info').height();
				var navBar = $('[data-id="'+EmailDocViewer.document.id+'"] .vdvc-nav-bar');
				var navBarH = navBar.outerHeight();
				
				if(!isNaN(x) && (x+W) > vW) {
	    			x = (x-W);
	    		} 
				if(x < 0) {
					x = 0;
				}
				if(!isNaN(y)) {
					if(y < 0) {
						y = (event.data.$.clientY + event.data.$.target.offsetHeight);
						if(navBar.css("display") !== "none") {
							y = y + navBarH;
						}
					}
				}
			    var uid = $(elem).attr("link-sourceId");
			    
			    DeepLinkService.getLinkByUid(uid,clientId).then(function(resp) {
			    	if(resp.status == 200 && resp.data.Status) {
			    		$scope.linkInfo = resp.data.Link.info;
			    		$scope.linkInfo.url = resp.data.Link.url;
			    		$('[data-id="'+EmailDocViewer.document.id+'"]').find('.link-info').css({"display":"block","top":y+"px","left":x+"px" });
			    	}
			    });
			}
			
			function updateEmptyAnchorTags(content) {
				var $frame = $('<iframe style="display:none;"/>').appendTo('body');
				var doc = $frame[0].contentWindow.document;
				doc.open();
				doc.write(content);
				doc.close();
				
				var emptyAnchors = $(doc).find("a[name]");
				$.each(emptyAnchors,function(i,a){
					var name = $(a).attr("name");
					$(a).attr("id",name).append(" ").css({"background": "none","border": "none","padding":"0px"});
				});
				var _html = '<html>'+$frame.contents().find("html").html()+'</html>';
				$frame.remove();
				return _html;
			}
			
			function animateBackgroundColor($domelements) {
				$domelements.animate({
					"backgroundColor" : "#006699",
					"color": "#fff"
				},2000,function() {
					$domelements.css({"background-color" :"","color":""});
				});
			}
			
			function openDeeplinkAnnotation(annotationId) {
				var tim = $timeout(function() {
					$scope.showComments = true;
					var el = EmailDocViewer.iframedoc.body;
					var annotationIdEles = $(el).find('span.note[comment-id="'+annotationId+'"]');
					if (annotationIdEles.length > 0) {
						annotationIdEles[0].scrollIntoView(true);
						annotationIdEles.addClass("note_slctd");
						animateBackgroundColor(annotationIdEles);
					}
					goToComment(annotationId);
					$timeout.cancel(tim);
				 }, 500);
			}
			
			function highlightOpenedDeeplink(linkInfo) {
				var el = EmailDocViewer.iframedoc.body;
			 	var tool_bar_height = $('#cke_editor-'+EmailDocViewer.document.id).find('.cke_top').outerHeight();
			 	var highlights = $(el).find('span[link-sourceid="'+linkInfo.linkUniqueId+'"]');
			 	
				if (highlights.length > 0) {
					highlights[0].scrollIntoView(true);
					animateBackgroundColor(highlights);
				}
			}
			
			function commentHolderInit() {
				$scope.commentHolder.elements = [];
				$scope.commentHolder.comment = null;
				$scope.commentHolder.commentFor = null;
				$scope.commentHolder.commentId = null;
			}
			
			var docAnnotationPromise;
			$scope.getAnnotationsById = function(commentId,sort) {
				pendingRequests.cancel(docAnnotationPromise);
				var postdata = {};
				postdata["resourceType"] = "document";
				postdata["resourceId"] = EmailDocViewer.document.id;
				postdata["clientId"] = EmailDocViewer.document.clientId;
				postdata["cellKey"] = commentId;
				
				docAnnotationPromise = AnnotationService.getAnnotationsById(postdata);
				docAnnotationPromise.then(function(response){
					if (response.status == 200 && response.data.Status) {
						var annotations = response.data.Annotations;
						
						_.each(annotations,function(annot,i){
							
							var index = _.findIndex($scope.docAnnotations,{"id" : annot.id});
							if(index > -1) {
								$scope.docAnnotations[index].conversations = annot.conversations;
							} else {
								$scope.docAnnotations.push(annot);
							}
						});
						
						if(sort) {
							orderComments($scope.docAnnotations,commentId);
						} else {
							var anotObj = _.findWhere($scope.docAnnotations,{"resourceName" : commentId});
							if(anotObj) {
								if(checkAnotObjForVC(anotObj)) {
									addcommentIconToDoc(anotObj);
								} else {
									removecommentIconFromDoc(anotObj);
								}
							}
						}
					}
				});
			};
			
			function saveReplyToComment(comment,newCommentTags,annotation,cb) {
				var postdata = {"note":comment,"clientId": clientId};
				postdata["contextType"] = annotation.contextType;
				postdata["context"] = annotation.context;
				postdata["tags"] = newCommentTags;
				AnnotationService.replyToComment(postdata,annotation.id).then(function(response){
					if(response.status == 200 && response.data.Status) {
						if(response.data.LockStatus == false) {
							MessageService.showErrorMessage("DOC_SAVE_LOCK_ERROR", [EmailDocViewer.document.name]);
						} else if(response.data.LockStatus == undefined) {
							$scope.$emit("UPDATE_ANNOTATED_DATE_ON_TS",{"documentId" : EmailDocViewer.document.id,"annotatedDate" : response.data.Annotations.updatedOn });
							commentHolderInit();
							delete $scope.docCommentReply[annotation.id];
							//$scope.getAnnotationsById(annotation.resourceName);
							if(!_.isArray(annotation.conversations)) {
								annotation.conversations =[];
							}
							annotation.conversations.push(response.data.Annotations);
							if(typeof cb === "function") {
								cb(response.data.Annotations);
							}
						}
					}
				});
			}
			
			function addNewComment(comment,annotation) {
				var postdata = {};
				var commentId = annotation.resourceName;
				postdata["docType"] = EmailDocViewer.document.docType;
				postdata["resourceType"] = "document";
				postdata["resourceId"] = EmailDocViewer.document.id;
				postdata["cellKey"] = commentId;
				postdata["clientId"] = EmailDocViewer.document.clientId;
				postdata["note"] =comment;
				postdata["formatedText"] = AnnotationService.turndownHtml(annotation.CommentedtextAsHtml);
				postdata["annotatedText"] = annotation.Commentedtext;
				postdata["contextType"] = annotation.contextType;
				postdata["context"] = annotation.context;
				postdata["annotatedText"] = annotation.Commentedtext;
				
				postdata["annotationContext"] = annotation.annotationContext;
				postdata["taskspaceId"] = annotation.taskspaceId;
				postdata["tsClientId"] =  annotation.tsClientId;
				
				if(!_.isEmpty(annotation.tags)) {
					postdata["tags"] = annotation.tags;
				}
				
				saveNotes({
					onDocSaveSuccess : function() {
						AnnotationService.save(postdata).then(function(cmtresp){
							if(cmtresp.status == 200 && cmtresp.data.Status) {
								if(cmtresp.data.LockStatus == false) {
									MessageService.showErrorMessage("DOC_SAVE_LOCK_ERROR", [EmailDocViewer.document.name]);
								} else if(cmtresp.data.LockStatus == undefined) {
									$scope.$emit("UPDATE_ANNOTATED_DATE_ON_TS",{"documentId" : EmailDocViewer.document.id,"annotatedDate" : cmtresp.data.Annotations.createdOn });
									commentHolderInit();
									$scope.getAnnotationsById(commentId,true);
									EmailDocViewer.document.forceWrite = true;
									$(EmailDocViewer.iframedoc.body).find( 'span.note[comment-id="'+commentId+'"]' ).removeClass("transient");
									var timer = $timeout(function() {
										var newAnnot = cmtresp.data.Annotations;
										var rootComment = _.findWhere(newAnnot.conversations,{"rootComment" : true});
										if(rootComment) {
											$("div[data-convid='"+rootComment.id+"']").find(".fa-pencil").trigger("click");
											if(annotation.share && EmailDocViewer.document.isSharable) {
												$scope.getDocAnnotationLink(EmailDocViewer.document,annotation);
											}
										}
							        	$timeout.cancel(timer);
							        }, 1000);
								}
							}
						});
					},
					onDocSaveFail : function() {
						$(EmailDocViewer.iframedoc.body).find( 'span.note[comment-id="'+commentId+'"]' ).contents().unwrap();
						contentChanged = false;
					}
				});
			}
			
			$scope.addTextComment =	function(annotation) {
				var newComment = angular.copy($scope.docCommentReply[annotation.id]);
				delete $scope.docCommentReply[annotation.id];
				annotation.context = $scope.docContext;
				annotation.annotationContext = $scope.annotationContext;
				annotation.taskspaceId = $scope.tsId;
				annotation.tsClientId = $scope.tsClientId;
				var newCommentTags = [];
				if(!_.isEmpty($scope.selectedAnnotTags[annotation.id])) {
					newCommentTags = $scope.selectedAnnotTags[annotation.id];
					delete $scope.selectedAnnotTags[annotation.id];
				}
				_.each(newCommentTags,function(newCommentTag){
					delete newCommentTag.isNew;
					delete newCommentTag.isTag;
				});
				if(annotation.id && !_.isEmpty(newComment)) {
					annotation.contextType = "Reply";
					saveReplyToComment(newComment,newCommentTags,annotation);
				} else {
					addNewComment(newComment,annotation);
				}
			};
			
			$scope.isAddCmtDisabled = function(id) {
				var status = true;
				if(!_.isEmpty($scope.docCommentReply[id])) {
					status = false;
				}
				return status;
			};
			
			$scope.isUpdateConvDisabled = function(editcommentForm,conv) {
				var status = false;
				if(editcommentForm.$waiting || 
						((!conv.rootComment) && !$scope.doc.perms.readonly && editcommentForm && editcommentForm.$visible)){
					try{
						if(_.isEmpty(editcommentForm.$editables[0].scope.$data)) {
							status = true;
						}
					}catch(e) {
						
					}
				}
				return status;
			};
			
			$scope.isPagenoteConvDisabled = function(editcommentForm) {
				var status = true;
				if(!_.isEmpty($scope.pagenote.text)) {
					status = false;
				}
				return status;
			};
			
			function createActionItem(postdata,editcommentForm) {
				ActionItemsService.createActionItem(postdata).then(function(resp) {
					 if(resp.status == 200 && resp.data.Status) {
						 if(editcommentForm && editcommentForm.$visible){
							 editcommentForm.$cancel();
						 }
						 MessageService.showSuccessMessage("ASSIGN_ACTION_ITEMS");
					 }
				});
			}
			
			$scope.assignActionItems =	function(event,annotation,conv,editcommentForm) {
				if(event) {
					event.stopPropagation(); 
					event.preventDefault();
				}
				if($scope.doc) {
					var modalInstance = $uibModal.open({
						 animation: true,
						 templateUrl: 'app/components/ActionItems/AddActionItems/AddActionItemsModal.html',
					     controller: 'AddActionItemsController',
					     appendTo : $('.rootContainer'),
					     controllerAs: 'aaic',
					     size: "md",
					     backdrop: 'static',
					     resolve: {
					    	 ActionItemsInfo : function() {
					    		 var ActionItemsInfoTemp = {
					    				 "document" : $scope.doc,
					    				 "objType" : "Document"
					    		 }
					    		 if(!_.isEmpty(annotation)) {
				    				 ActionItemsInfoTemp["objType"] = "Conversation";
					    		 }
					    		 if($state.current.name == "taskspace.list.task") {
					    			 if(!_.isEmpty(TaskSpaceService.currentTaskspace)) {
					    				 ActionItemsInfoTemp["tasksapce"] = TaskSpaceService.currentTaskspace;
					    			 }
					 	    	 }
					    		 
					    		 ActionItemsInfoTemp["assignedTo"] = $scope.mentionUserSelect[annotation.id];
					    		 ActionItemsInfoTemp["lDescription"] = $scope.docCommentReply[annotation.id];
					    		 
					    	  return ActionItemsInfoTemp;
					    	}
					     }
					 });
					 modalInstance.result.then(function (assignActionItemsResp) {
						 if(!_.isEmpty(annotation) && !_.isEmpty(assignActionItemsResp)) {
							 assignActionItemsResp["objType"] = "Conversation";
							 assignActionItemsResp["objClientId"] = appdata["OrganizationId"];
							 
							 if(!$scope.doc.perms.readonly && editcommentForm && editcommentForm.$visible){
								 try{
									 if(!_.isEmpty(editcommentForm.$editables[0].scope.$data) || (!_.isEmpty(conv) && conv.rootComment)) {
										 $scope.updateComment(editcommentForm.$editables[0].scope.$data,conv,annotation,function(Status){
											 if(Status) {
												 assignActionItemsResp["objId"] = conv.id;
												 createActionItem(assignActionItemsResp,editcommentForm);
											 }
										 });
									 }
								 }catch(e) {
									
								 }
							 } else {
								 var newComment = angular.copy($scope.docCommentReply[annotation.id]);
								 delete $scope.docCommentReply[annotation.id];
								 annotation.context = $scope.docContext;
								 var newCommentTags = [];
								 if(!_.isEmpty($scope.selectedAnnotTags[annotation.id])) {
									 newCommentTags = $scope.selectedAnnotTags[annotation.id];
									 delete $scope.selectedAnnotTags[annotation.id];
								 }
								 _.each(newCommentTags,function(newCommentTag){
									 delete newCommentTag.isNew;
									 delete newCommentTag.isTag;
								 });
								 annotation.contextType = "Reply";
								 saveReplyToComment(newComment,newCommentTags,annotation,function(newConv){
									 if(newConv) {
										 assignActionItemsResp["objId"] = newConv.id;
										 createActionItem(assignActionItemsResp);
									 }
									 clearMentionedUsers(annotation.id);
								 });
							 }
							 
						 } else {
							 MessageService.showSuccessMessage("ASSIGN_ACTION_ITEMS");
						 }
					 }, function () {
					      
					 });
				}
			};
			
			function textHighlight(type) {
				var htmltext = rangy.getSelection(EmailDocViewer.iframedoc.body).toHtml();
				var cls = (type == "comment") ? "note cmt" : "note hlt";
				var txtHighlighter = rangy.createHighlighter(EmailDocViewer.iframedoc, "TextRange");
				txtHighlighter.addClassApplier(rangy.createClassApplier("unused", {
		    	 	ignoreWhiteSpace: true,
			        useExistingElements: false,
			        onElementCreate: function(el) {
			        	$(el).removeClass("unused");
			        	$(el).addClass("note");
			            $scope.commentHolder.elements.push($(el));
			        },
			        elementTagName: "span"
				}));
				txtHighlighter.highlightSelection("unused");
				rangy.getSelection(EmailDocViewer.iframedoc).removeAllRanges();
				$('#comment-tool-'+EmailDocViewer.document.id).css({"display":"none"});
				return htmltext;
			};
			
			function addcommentIconToDoc(anotObj) {
				var commentEl = $(EmailDocViewer.iframedoc.body).find( 'span[comment-id="'+anotObj.resourceName+'"]' );
				if(commentEl) {
					commentEl.addClass("cmt");
				}
			}
			
			function removecommentIconFromDoc(anotObj) {
				var commentEl = $(EmailDocViewer.iframedoc.body).find( 'span[comment-id="'+anotObj.resourceName+'"]' );
				if(commentEl) {
					commentEl.removeClass("cmt");
				}
			}
			
			function checkAnotObjForVC(anotObj) {
				var hasValidConversation = false;
				if(anotObj && anotObj.conversations && anotObj.conversations.length > 0) {
					var nonEmptyConv = _.find(anotObj.conversations, function(conv) {
						return !_.isEmpty(conv.note);
					});
					
					if(nonEmptyConv)  {
						hasValidConversation = true;
					}
				}
				return hasValidConversation;
			}
			
			$scope.initPagenote = function() {
				$scope.pagenote.text = "";
				$scope.selectedAnnotTags['pagenote'] = [];
				$scope.pagenoteInitiated = true;
				var t = $timeout(function() {
					var pagenoteEle = $("div#page-note-wrap");
					if(pagenoteEle && $(pagenoteEle[pagenoteEle.length-1]).find(".vdvc-txtA") && $(pagenoteEle[pagenoteEle.length-1]).find(".vdvc-txtA").length > 0){
						$(pagenoteEle[pagenoteEle.length-1]).find(".vdvc-txtA")[0].scrollIntoView(true);
						$(pagenoteEle[pagenoteEle.length-1]).find(".vdvc-txtA")[0].focus();
					}
					$timeout.cancel(t);
				},500);
			}
			
			function addNewPageNote() {
				var postdata = {};
				postdata["docType"] = EmailDocViewer.document.docType;
				postdata["resourceType"] = "Document";
				postdata["resourceId"] = EmailDocViewer.document.id;
				postdata["clientId"] = EmailDocViewer.document.clientId;
				postdata["contextType"] = "Pagenote";
				postdata["context"] = $scope.docContext;
				postdata["annotationContext"] = $scope.annotationContext;
				postdata["taskspaceId"] = $scope.tsId;
				postdata["tsClientId"] =  $scope.tsClientId;
				postdata["note"] = $scope.pagenote.text;
				var selectedTags = $scope.selectedAnnotTags["pagenote"];
				if(_.isArray(selectedTags)) {
					selectedTags = _.without(selectedTags, _.findWhere(selectedTags, {"TagName" : ""}));
					postdata["tags"] = selectedTags;
				}
				
				AnnotationService.save(postdata).then(function(cmtresp){
					if(cmtresp.status == 200 && cmtresp.data.Status) {
						$scope.$emit("UPDATE_ANNOTATED_DATE_ON_TS",{"documentId" : EmailDocViewer.document.id,"annotatedDate" : cmtresp.data.Annotations.createdOn });
						$scope.pagenoteInitiated = false;
						$scope.docAnnotations.unshift(cmtresp.data.Annotations);
					}
				});
			}
			
			function getAnnotationUID(type,shareHighlight) {
				opencomment = ((type == 'comment') || shareHighlight ? true : false);
				$scope.showComments = $scope.showComments ? $scope.showComments : opencomment;
				
				commentHolderInit();
				
				AnnotationService.getUID().then(function(response){
					if (response.status == 200 && response.data.Status) {
						var htmltext = textHighlight(type);
						var elements = $scope.commentHolder.elements;
						$.each(elements,function(i,el){
		   		 			 if (i == 0 ) {
		   		 				$(el).addClass("first");
		   		 				$(el).prepend("&#8203;");
		   		 			 }
		   		 			 $(el).attr("comment-id",response.data.UniqueId);
		   		 			 $(el).attr("user-id",appdata.UserId);
		   		 			 
		   		 			/* $(el).attr("context-id",$scope.documentId);
		   		 			 $(el).attr("context-type",$scope.annotationContext);
		   		 			 
		   		 			 if($scope.tsId) {
		   		 				 $(el).attr("context-id",$scope.tsId);
		   		 			 }*/
		   		 			 
		   		 			 if(i== elements.length-1) {
		   		 				$(el).addClass("last");
		   		 				insertLineBlock($(el));
		   		 			 }
		   		 		});
						
						var fakeAnnotation = {
						    "id": null,
						    "resourceName": response.data.UniqueId,
						    "resourceId": EmailDocViewer.document.id,
						    "resourceType": "Document",
						    "conversations": [],
						    "uid":"vdvc_comment_selected vdvc_comment_"+response.data.UniqueId,
						    "transient" : true,
						    "contextType" : "Highlight",
						    "tags" : []
						  };
						
						if(type === 'comment') {
							fakeAnnotation.contextType = "Annoatate";
						}
						var commentEl = $(EmailDocViewer.iframedoc.body).find( 'span[comment-id="'+response.data.UniqueId+'"]' );
						
						
						fakeAnnotation.Commentedtext =  commentEl.map(function() { 
							return $( this ).text(); 
						}).get().join('');
						
						fakeAnnotation.CommentedtextAsHtml = htmltext;
						if(shareHighlight) {
							fakeAnnotation.share = true;
						}
						if(commonService.selectionConfig) {
							commonService.selectionConfig.commentEl = commentEl;
						}
						
						$(EmailDocViewer.iframedoc.body).find( 'span.note_slctd' ).removeClass("note_slctd");
						//commentEl.addClass("transient");
						var comments = angular.copy($scope.docAnnotations);
						commentHolderInit();
						$('#comment-tool-'+EmailDocViewer.document.id).css({"display":"none"});
						$scope.addTextComment(fakeAnnotation);
					}
				});
			}
			
			function initComment (type,shareHighlight) {
				$(EmailDocViewer.iframedoc.body).focus();
				contentChanged = true;
				getAnnotationUID(type,shareHighlight);
			}
			
			$scope.cancelAddComment =  function($event,annot) {
				if($event) {
					$event.stopPropagation(); 
					delete $scope.docCommentReply[annot.id];
					var $docWrap = $('div.email-document-wrap[data-id="'+$scope.documentId+'"]');
					$docWrap.find(".vdvc_comment_selected").removeClass('vdvc_comment_selected');
					if(annot.conversations.length == 0) {
						$scope.docAnnotations = _.without($scope.docAnnotations, _.findWhere($scope.docAnnotations, {"resourceName": annot.resourceName}));
						var element = $(EmailDocViewer.iframedoc.body).find('span.note[comment-id="'+annot.resourceName+'"]');
						$(element).next(".line-block").remove();
						$(element).contents().unwrap();
						
					}
				}
				commentHolderInit();
				clearMentionedUsers(annot.id);
			};
			
			$scope.shareComment = function() {
				$scope.initComment('highlight',true);
			}
			
			function orderNonWebResourceComments(comments) {
				var LatestComments = [];
				var orphanComments = [];
				$(EmailDocViewer.iframedoc.body).find( 'span[comment-id]').removeClass("note");
				
				if(!_.isEmpty(comments)) {
					_.each(comments,function(anotObj,i){
						anotObj.isOrphan = false;
						anotObj.Commentedtext = anotObj.text;
						anotObj.uid = "vdvc_comment_"+anotObj.resourceName;
						var commentEl =  $(EmailDocViewer.iframedoc.body).find( 'span.first[comment-id="'+anotObj.resourceName+'"]');
						if(commentEl.length > 0) {
							var position = $(commentEl).offset();
							anotObj['position'] = {
									"x": position.left,
									"y":  position.top,
							};
							
							if(checkAnotObjForVC(anotObj)) {
								addcommentIconToDoc(anotObj);
							} else {
								removecommentIconFromDoc(anotObj);
							}
							$(EmailDocViewer.iframedoc.body).find( 'span[comment-id="'+anotObj.resourceName+'"]').addClass("note");
							LatestComments.push(anotObj);
						} else if(anotObj.pagenote) {
							LatestComments.push(anotObj);
						} else {
							anotObj.isOrphan = true;
							orphanComments.push(anotObj);
						}
					});
					
					LatestComments.sort(DocFactory.sortAnnotationsByTextPosition);
					orphanComments = _.filter(comments,function(obj){ 
						return _.isUndefined(obj.isOrphan)|| obj.isOrphan; 
					});
					$scope.docAnnotations = LatestComments;
					$scope.docOrphanAnnotations = orphanComments;
				}
				
				
				/*var commentEls;
				if($scope.annotationContext == "taskspace") {
					var commentEls = $(EmailDocViewer.iframedoc.body).find('span.first[comment-id][context-id="'+$scope.tsId+'"]');
				} else {
					var commentEls = $(EmailDocViewer.iframedoc.body).find('span.first[comment-id]:not([context-type="taskspace"])');
				}
				if (commentEls.length > 0) {
					for(var i=0; i< commentEls.length; i++) {
						var cmtId = $(commentEls[i]).attr("comment-id");
						var anotObj = _.find(comments,function(obj){ 
							return obj.resourceName == cmtId; 
						});
						
						if(anotObj) {
							
							anotObj.isOrphan = false;
							
							if(checkAnotObjForVC(anotObj)) {
								addcommentIconToDoc(anotObj);
							} else {
								removecommentIconFromDoc(anotObj);
							}
							var commentEl = $(EmailDocViewer.iframedoc.body).find( 'span[comment-id="'+anotObj.resourceName+'"]').addClass("note");
							anotObj.Commentedtext = anotObj.text;
							
							
							anotObj.uid = "vdvc_comment_"+anotObj.resourceName;
							anotObj.commentPosition = i;
							
							LatestComments.push(anotObj);
						} else {
							var orphanEls = $(EmailDocViewer.iframedoc.body).find( 'span.note[comment-id="'+cmtId+'"]');
							orphanEls.addClass("transient").removeClass("note");
						}
						
					}
				}
				
				orphanComments = _.filter(comments,function(obj){ 
					return _.isUndefined(obj.isOrphan); 
				});
				$scope.docAnnotations = LatestComments;
				$scope.docOrphanAnnotations = orphanComments;*/
			}
			
			function orderComments(comments,uid) {
				orderNonWebResourceComments(comments);
				if(opencomment) {
					goToComment(uid);
				}
				
				if(_.isArray(comments)) {
					var annotCount = comments.length;
					notifyAnnotationCount(annotCount);
				}
			}
			
			function deleteDeepLink(link,cb) {
				var lnk = angular.copy(link);
				var text = "Are you sure you want to delete the Link ?";
				delete lnk.url;
				$confirm({text: text}).then(function() {
	  				DeepLinkService.deleteLink(lnk,clientId).then(function(resp) {
						if(resp.status == 200 && resp.data.Status) {
							if(typeof cb == "function") {
								cb();
							}
						}
					});
			    });
			}
			$scope.deleteLink = function(link) {
				if(link) {
					deleteDeepLink(link,function(){
						$('[data-id="'+EmailDocViewer.document.id+'"]').find(".link-info").hide();
						if($(EmailDocViewer.iframedoc.body).length > 0) {
							var $link = $(EmailDocViewer.iframedoc.body).find('span.vdvc-link[link-sourceid="'+link.linkUniqueId+'"]');
							$link.contents().unwrap();
							link = null;
							saveNotes();
						}
					});
				}
			};
			
			var docAllannotationPromise;
			function getDocAnnotations() {
				pendingRequests.cancel(docAllannotationPromise);
				var postdata = {
						"annotationContext" : $scope.annotationContext,
						"taskspaceId": $scope.tsId,
						"tsClientId" : $scope.tsClientId
				};
				docAllannotationPromise = AnnotationService.getAllDocAnnotations(EmailDocViewer.document.id,clientId,postdata);
				docAllannotationPromise.then(function(resp){
					if(resp.status == 200 && resp.data.Status) {
						orderComments(resp.data.Annotations);
						$scope.$watch('docAnnotations', function (newVal, oldVal) {
							$timeout.cancel(commentChangeTimer);
							if(newVal && oldVal && newVal.length != oldVal.length) {
								 commentChangeTimer =  $timeout(function() {
									$(EmailDocViewer.iframedoc.body).find( 'span.transient' ).trigger("click");
					        	 },1000); 	
							}
							scrollToComment();
							var tim = $timeout(function() {
								if (commonService.DocSnippets &&  commonService.DocSnippets.snippets && commonService.DocSnippets.snippets.length > 0) {
									var snippet = commonService.DocSnippets.snippets[0];
									onSnippetChanged(snippet,0);
									/*if(snippet.type == "annotations" && snippet.commentId) {
										$scope.showComments = true;
										$('div[data-id="'+snippet.annotationId+'"]').find(".comment-crd").trigger("click");
										var conv = $('div[data-convId="'+snippet.commentId+'"]').find('.comment-conv-txt');
										if(conv && conv.length > 0) {
											DocFactory.highlightTextByRegex(conv[0],[snippet],0);
										}	
									}*/
								}
								$timeout.cancel(tim);
							 }, 0);
				        	
						}, false);
					}
				});
			}
			
			function getAllDocDeepLinks(cb) {
				var postdata = {
					"objectType" : "Document",
					"objectId" : EmailDocViewer.document.id,
					"clientId" : clientId
				};
				DeepLinkService.getAllLinksByTarget(postdata).then(function(resp) {
					if(resp.status == 200 && resp.data.Status) {
						docDeepLinks = resp.data.Link;
						if(typeof cb == 'function') {
							cb(docDeepLinks);
						}
					}
				});
			}
			
			function onCkeInstanceReady() {
				var obj = {
						 "objectId":EmailDocViewer.document.id,
						 "type":"Document",
						 "docType" : "EMail"
				};
				
				$scope.$emit("objectLoaded",obj);
								 	 
				if (commonService.DocSnippets) { 
					 var contentSnippets = _.where(commonService.DocSnippets.snippets, {'type': "content"});
					  
					 var tool_bar_height = $('#cke_editor-'+EmailDocViewer.document.id).find('.cke_top').outerHeight();
					 
					 if(!isNaN(tool_bar_height)) {
						tool_bar_height += 55;
						DocFactory.highlightTextByRegex(EmailDocViewer.iframedoc.body,contentSnippets,tool_bar_height); 
					 } else {
						DocFactory.highlightTextByRegex(EmailDocViewer.iframedoc.body,contentSnippets,55); 
					 }
				 }
				 if (commonService.linkInfo && commonService.linkInfo.linkUniqueId) {
					 if(commonService.linkInfo.objectType == "DocAnnotation") {
						 openDeeplinkAnnotation(commonService.linkInfo.linkUniqueId);
					 } else {
						 highlightOpenedDeeplink(commonService.linkInfo);
					 }
				 }
			}
			
			var hideFullToolBar = true;
			function createNotes(editorId){
				var content = EmailDocViewer.document ? EmailDocViewer.document.content : "";
				if(EmailDocViewer.document.webResource && !_.isEmpty(EmailDocViewer.document.Link)) {
					content = createWebResourceContent();
		    	}
				EmailDocViewer.content = updateEmptyAnchorTags(content);
				var plugins = "";
				calCkeContentHeight();
								
				try {
					EmailDocViewer.instance = CKEDITOR.replace( editorId,{
						readOnly: EmailDocViewer.readOnly,
						tabSpaces: 4,
						width: "100%",
						height: cke_content_height,
						uiColor : '#ffffff',
						language : "en",
					    skin : 'moono-lisa,/resources/js/ckeditor/skins/moono-lisa/',
						extraAllowedContent:"vcell[*]",
						filebrowserImageUploadUrl:  "ImageUploadAsBase64",
						imageUploadUrl :'ImageUploadAsBase64',
						vdvcimageUploadUrl : 'ImageUploadAsBase64',
						extraPlugins : plugins,
						removePlugins : "stylesheetparser, elementspath"+ (!(isDocEditable()) ? ",toolbar":""),
						resize_enabled : false,
						fullPage: true,
						autoParagraph: false,
					});
				} catch(e) {
					
				}
				if (EmailDocViewer.instance) {
					$(".doc-content").children().css({"height": cke_content_height});
					EmailDocViewer.loader = false;
					EmailDocViewer.instance.on( 'change', function( evt ) {
						contentChanged = true;
						EmailDocViewer.document.content = evt.editor.getData();
					});
					EmailDocViewer.instance.on( 'key', function( evt ) {
						if ( evt.data.keyCode == 32 && evt.editor.readOnly) {
					        evt.cancel();
					    }
					});
					if(isDocEditable()) {
						EmailDocViewer.instance.on( 'selectionChange', function( evt ) {
							var body = this.document.getBody();
							var el = evt.editor.getSelection().getStartElement();
							$(body.$).find("span.note_slctd").removeClass("note_slctd");
							$('div.email-document-wrap[data-id="'+EmailDocViewer.document.id+'"]').find(".vdvc_comment_selected").removeClass('vdvc_comment_selected');
							if(el && el.$.nodeName == "A") {
								//showClickableLink($(el.$));
							} else {
								$(body.$).find('span.linkHandler').parent().remove();	
							}
							
							if($(el.$).closest('a').length > 0) {
								//showClickableLink($(el.$).closest('a'));
							} else {
								$(body.$).find('span.linkHandler').parent().remove();
							}
							
							if(el && el.$.nodeName == "SPAN") {
								if ($(el.$).hasClass("note")) {
									var commentid = $(el.$).attr("comment-id");
									var element = $('.vdvc_comment_'+commentid);
									if(element && element.length > 0) {
										element.addClass("vdvc_comment_selected");
										element[0].scrollIntoView(true);
									    $('div.email-document-wrap[data-id="'+EmailDocViewer.document.id+'"]').find(".comment-wrap")[0].scrollTop -= 10;
									}
									$(el.$).addClass("note_slctd");
									if( $(el.$).hasClass("first") && $(el.$).text().charCodeAt(0) != "8203") {
										$(el.$).prepend("&#8203;");
									}
									if( $(el.$).hasClass("last")) {
										insertLineBlock($(el.$));
									}
								}
								if($(el.$).hasClass("line-block")) {
									var bookmarks = evt.editor.getSelection().createBookmarks();
									$(el.$).contents().unwrap();
									evt.editor.getSelection().selectBookmarks( bookmarks );
								}
							}
						});
					}
										
					EmailDocViewer.instance.on( 'contentDom', function( evt ) {
						var $toolBar = $('#cke_editor-'+EmailDocViewer.document.id).find(".cke_top");
						if($toolBar.length > 0) {
							$toolBar.css({"position":"absolute","width":"100%"});
							if(EmailDocViewer.readOnly) {
								$toolBar.css({"display":"none"});
							}
						}
						clearSelection();
						win = this.document.getWindow();
						var body = this.document.getBody();
						var h = body.$.offsetHeight;
						var scrollTimer;
					    
						$(body.$).find('span.linkHandler').parent().remove();
						if(!isDocEditable()) {
							$(body.$).find("a").not("a[href^=\\#]").off("click").on("click",function(event){
								event.stopPropagation();
								event.preventDefault();
								$(body.$).find('span.linkHandler').parent().remove();
								if(typeof $(this).attr('href') != 'undefined'  && 
										   !$(this).hasClass('linkToFire')) {
									if(event.ctrlKey == true) {
										window.open(href, 'new' + event.screenX);
									}
								}
							});
						}
						
						ckEditorEvents($(body.$));
						var editable = EmailDocViewer.instance.editable();
						editable.attachListener( editable, 'click', function( event ) {
							var elem = event.data.getTarget();
							var parentElem = $( elem.$ ).parent();
							if(elem.hasClass("deep-link")) {
								window.open(elem.getAttribute("href"),"_blank");
							}
							
							if(elem.hasClass("deep-link-from-info") || $(elem.$).closest('.deep-link-from-info').length !=0) {
								return false;
							} else {
							    $(body.$).find('.deep-link-from-info').hide();
							}
								
							$('[data-id="'+EmailDocViewer.document.id+'"]').find('.link-info').css({"display":"none"});
							$('#lnk-meta-info-'+$scope.viewerId).hide();
							   
							$scope.linkCrdInfo = null;
							$scope.linkInfo = null;
							   
							if(!elem.hasClass("linkToFire")) {
								$(body.$).find('span.linkHandler').hide();
							}
							   
							if (elem.hasClass("note") && elem.getAttribute("comment-id")) {
								showCommentOnCkeClick(body,elem.$);
								if(parentElem.hasClass('vdvc-link')) {
									showDeepLinkToOnCkeClick(win,parentElem[0],event);
								}
							}
							   
							if (elem.hasClass("vdvc-link")) {
								showDeepLinkToOnCkeClick(win,elem,event);
								if(parentElem.hasClass('note')) {
									showCommentOnCkeClick(body,parentElem[0]);
								}
							}
						});
						
						EmailDocViewer.instance.editable().attachListener( this.document, 'scroll', function(event) {
							var scrollElement = commonService.getScrollingElement(EmailDocViewer.iframedoc);
							var scrollPosition = scrollElement.scrollTop;
					        $timeout.cancel(scrollTimer);
					        scrollTimer = $timeout(function() {
					        	 var obj = {
										 "objectId":EmailDocViewer.document.id,
										 "type":"Document",
										 "docType" : "EMail",
										 "position":scrollPosition 
								 };
					        	 
					        	 if(selectionConfig) {
					        		 selectionConfig.scrollPosition = scrollPosition;
					        	 } else {
					        		 scrollPosition = {
					        				 scrollPosition : scrollPosition
					        		 };
					        	 }
					        	 $scope.$emit("objectOnChange",obj);
							}, 1000);
					        
					        if($scope.linkCrdInfo && $scope.linkCrdInfo.target) {
					        	var targetRect = $scope.linkCrdInfo.target.getBoundingClientRect();
					        	rePositionPopOverCard(targetRect,$('#lnk-meta-info-'+$scope.viewerId),1000);
					        }
					    });
						
						if(this.document && this.document.$) {
							$(this.document.$).off('touchend').on('touchend',function(event) {
								if(event) {
									//event.preventDefault();
									//event.stopPropagation();
								}
								var cmtTbar = $('#comment-tool-'+EmailDocViewer.document.id);
								cmtTbar.css({"display":"none"});
								if(!EmailDocViewer.document.perms.readonly && !EmailDocViewer.isInInbox) {
									var H = cmtTbar.outerHeight();
								    var W = cmtTbar.outerWidth();
						    		var vH = $(win.$).innerHeight(); 
						    		var vW = $(win.$).outerWidth(); 
						    		var x = event.clientX; 
									var y = event.clientY;
									
									if(!isNaN(x) && (x+W) > vW) {
						    			x = (x-W);
						    		} 
									
									var mySelection = EmailDocViewer.instance.getSelection();
									if (CKEDITOR.env.ie) {
										if(CKEDITOR.env.version < 11) {
											mySelection.unlock(true);
										    selectedText = mySelection.getNative().createRange().text;
										} else {
											mySelection.unlock(true);
										    selectedText = mySelection.getNative().toString();
										}
									} else {
									    selectedText = mySelection.getNative().toString();
									}
									
									if (selectedText ) {
										if(_.isString(selectedText) && selectedText.length > 0 || selectedText.type == "Range") {
											EmailDocViewer.bookmarks = mySelection.createBookmarks2();
											if(EmailDocViewer.bookmarks && EmailDocViewer.bookmarks.length > 0) {
												selectionConfig = {
														"bookmarks" :EmailDocViewer.bookmarks,
														"scrollPosition" : $(event.sender.$).scrollTop()
												};
											}
											cmtTbar.css({"display":"block","top":y+"px","left":x+"px" });
										} 
									}
								}
							});
						}
						
						EmailDocViewer.instance.editable().attachListener( this.document, 'mouseup', function( event ) {
							if(event && event.data && event.data.$) {
								event.data.$.preventDefault();
								event.data.$.stopPropagation();
							}
							var cmtTbar = $('#comment-tool-'+EmailDocViewer.document.id);
							cmtTbar.css({"display":"none"});
							if(!EmailDocViewer.document.perms.readonly && !EmailDocViewer.isInInbox) {
								var H = cmtTbar.outerHeight();
							    var W = cmtTbar.outerWidth();
					    		var vH = $(win.$).innerHeight(); 
					    		var vW = $(win.$).outerWidth(); 
					    		var x = event.data.$.clientX; 
								var y = event.data.$.clientY;
								
								if(!isNaN(x) && (x+W) > vW) {
					    			x = (x-W);
					    		} 
								
								var mySelection = EmailDocViewer.instance.getSelection();
								var nativeSelection = mySelection.getNative();
								
								if (CKEDITOR.env.ie) {
									if(CKEDITOR.env.version < 11) {
										mySelection.unlock(true);
									    selectedText = nativeSelection.createRange().text;
									} else {
										mySelection.unlock(true);
									    selectedText = nativeSelection.toString();
									}
								} else {
								    selectedText = nativeSelection.toString();
								}
								
								if (selectedText) {
									if(_.isString(selectedText) && selectedText.length > 0 || selectedText.type == "Range") {
										EmailDocViewer.bookmarks = mySelection.createBookmarks2();
										if(EmailDocViewer.bookmarks && EmailDocViewer.bookmarks.length > 0) {
											selectionConfig = {
													"bookmarks" :EmailDocViewer.bookmarks,
													"scrollPosition" : $(event.sender.$).scrollTop()
											};
										}
										var range =nativeSelection.getRangeAt(0);
										var selectionRects = range.getBoundingClientRect();
										rePositionPopOverCard(selectionRects,cmtTbar,0);
										cmtTbar.css({"display":"block","top":y+"px","left":x+"px" });
									} 
								}
							}
						});
					});
					
					CKEDITOR.on('instanceCreated', function (ev) {
						CKEDITOR.dtd.$removeEmpty['a'] = 0;
		            });
					
					EmailDocViewer.instance.on('instanceReady', function(evt) {	
						evt.editor.on('key', function(event) {
							var body = this.document.getBody();
					        if (event.data.keyCode === 13) {
					        	$timeout.cancel(rmCmntdSpanTimer);
					        	var rmCmntdSpanTimer = $timeout(function () {
					                var se = evt.editor.getSelection().getStartElement();
					                if($(se.$).hasClass("note")) {
					                    $(se.$).removeClass("first"); 
					                }
					                if($(se.$).hasClass("last")) {
					                	var id = $(se.$).attr("comment-id");
					                	var els = $(body.$).find('span.last[comment-id="'+id+'"]');
					                	if(els.length > 0) {
					                		$(els[0]).removeClass("last");
					                	}
					                }
					                $timeout.cancel(rmCmntdSpanTimer);
					            }, 10);
					        }
					    });
						 
						 var iframe = $('#cke_editor-'+EmailDocViewer.document.id).find('iframe');//.contents();
						 if(iframe && iframe.length>0) {
							 EmailDocViewer.iframedoc = iframe[0].contentDocument || iframe[0].contentWindow.document;
							 getDocAnnotations();
							 getAllDocDeepLinks(function(deeplinks) {
								if(EmailDocViewer.iframedoc) {
									var linkSpans = $(EmailDocViewer.iframedoc.body).find('span.vdvc-link[link-sourceid]');
									for(var i=0;i<linkSpans.length;i++) {
										var lsid = $(linkSpans[i]).attr("link-sourceid");
										var LinkObj = _.find(deeplinks,function(obj){ 
											return obj.info.linkUniqueId == lsid; 
										});
										if(!LinkObj) {
											$(linkSpans[i]).addClass("transient").removeClass("vdvc-link");
										}
									};
								} 
							 });
							 if(commonService.selectionConfig && commonService.selectionConfig.bookmarks) {
								 var tim = $timeout(function() {
									 //$( EmailDocViewer.iframedoc.body ).scrollTop(commonService.selectionConfig.scrollPosition);
									 var jqDocument = $(CKEDITOR.instances['editor-'+EmailDocViewer.document.id].document.$);
									 var documentHeight = jqDocument.height();
									 jqDocument.scrollTop(commonService.selectionConfig.scrollPosition);
									 EmailDocViewer.instance.getSelection().selectBookmarks( commonService.selectionConfig.bookmarks);
									 if(commonService.selectionConfig.type == "comment" || commonService.selectionConfig.type == "highlight") {
										 initComment(commonService.selectionConfig.type);
									 } else if(commonService.selectionConfig.type == "create-link") {
										 createLink();
									 }
									 commonService.selectionConfig = null;	
									 $timeout.cancel(tim);
								 }, 100);
							 } 
							 if(EmailDocViewer.deviceInfo.isMobile) {
								 setCkeBodyWidth();
							 }
							 onCkeInstanceReady();
						 }
						 //evt.removeListener();
					});
				}
			}
			
			function getDocForComment(doc,cb) {
				var postdata = {
						"documentId": doc.id,
						"clientId": doc.clientId
				};
				DocFactory.getDocForComment(postdata).then(function(response){
					if (response.status == 200 && response.data.Status) {
						doc.commentMode = true;
						var document = response.data.Notes;
						document && document.content ? doc.content = document.content: doc.content = doc.content;
						
						if (response.data.Notes.majorVersion && (response.data.Notes.minorVersion || response.data.Notes.minorVersion == 0)) {
							doc.majorVersion = response.data.Notes.majorVersion;
							doc.minorVersion = response.data.Notes.minorVersion;
						}
						
						if(typeof cb == "function") {
							cb();
						}
					}
				});
			}
			
			function getDocHierarchy() {
				DocFactory.getDocLocation(EmailDocViewer.document.id,EmailDocViewer.document.clientId).then(function(response){
	        		if(response.status == 200 && response.data.Status) {
	        			$scope.docHierarchy = response.data.Notes;
	        		}
	        	});
			}
			
			function preprocessDoc() {
				DocFactory.setDocPermissions(EmailDocViewer.document);
				EmailDocViewer.isGlobalDoc = EmailDocViewer.document.global;
				EmailDocViewer.document["_type"] = "Document";
				
				DocFactory.setDocTypeBooleanFlags(EmailDocViewer.document);
				getDocHierarchy();
				if($state.$current.name == "search"){
					$scope.$emit("PageName",{"userName":appdata.UserName,"pageName":"Search"});
				} else if($state.$current.name == "taskspace.list.task" || $state.$current.name == "inbox") {
					
				} else {
					$scope.$emit("PageName",{"userName":appdata.UserName,"pageName":EmailDocViewer.document.displayName});
				}
			}
			
			function getUsers() {
				userService.getAllUsersIncludeOtherOrgSharedUsers().then(function(resp){
					 if(resp.status == 200 && resp.data.Status) {
						 OrgUsers = resp.data.Users;
					 }
				});
			}
			
			function showDocument() {
				clearAllPromises();
				getdocPromise = DocFactory.getDocById(documentId,clientId);
				getdocPromise.then(function(response){
					if (response.status == 200 && response.data.Status) {
						EmailDocViewer.document = response.data.Notes;
						$scope.doc = EmailDocViewer.document;
						
						if(!EmailDocViewer.isInTaskspace && !EmailDocViewer.isInInbox) {
							var childScope  = $scope.$new();
							childScope.document = EmailDocViewer.document;
							var template = '<vdvc-doc-hierarchy></vdvc-doc-hierarchy>';
							var appendHtml = $compile(template)(childScope);
							$("#vdvc-email-doc-path").html(appendHtml);
						}
												
						if(!_.isEmpty(EmailDocViewer.document)) {
							preprocessDoc();
							if(!_.isEmpty(EmailDocViewer.document.mailProperties)) {
								EmailDocViewer.mailProperties = angular.copy(EmailDocViewer.document.mailProperties);
							}
							if($scope.doc.tags && !_.isEmpty($scope.doc.tags)) {
								$scope.tags = angular.copy($scope.doc.tags);
								processTags();
							}
							getDocForComment(EmailDocViewer.document,function(){
								createNotes("editor-"+EmailDocViewer.document.id);
							});
						}
					}
				})["finally"](function(){
					getUsers();
				});
			}
			
			function init() {
				if($state.current.name == "docview"){
					EmailDocViewer.isInDocView = true;
				}
				if($state.current.name == "taskspace.list.task"){
					EmailDocViewer.isInTaskspace = true;
				}
				if($state.current.name == "search"){
					EmailDocViewer.isInSearch = true;
				}
				if($state.current.name == "inbox"){
					EmailDocViewer.isInInbox = true;
					$scope.isDocInInbox = true;
				}				
				if(!_.isEmpty(documentId) && !_.isEmpty(clientId)) {
					showDocument();
				}
				if(!DocumentEventsListner.isConnected()) {
					DocumentEventsListner.reconnect();
	    		}
			}
			
			
			var OrgUsers = [];
			$scope.typedUser = {};
			$scope.mentionChar = "@";
			$scope.mentionUser = {};
			$scope.mentionUserSelect = {};
			$scope.mentionUserChecked = {};
			$scope.enableAtMention = (appdata.UserSettings && appdata.UserSettings.user_EnableAtMention && appdata.UserSettings.user_EnableAtMention == "Yes") ? true : false;
			
			
			$scope.getUserRaw = function(item) {
				if(item.loginId) {
					return $scope.mentionChar + item.loginId;
				}
				return "";
			};
			
			function validateEmail(email) {
			  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			  return re.test(email);
			}
			
			$scope.searchUser =  function(term) {
				var users = [];
				if(_.isEmpty(term)) {
					return null;
				}
				
				if(_.isArray(OrgUsers)) {
					angular.forEach(OrgUsers, function(user) {
		                 if (_.startsWith(user.loginId.toUpperCase(),term.toUpperCase())) {
		                	 users.push(user);
		                 }
		             });
				}
				
				/*if(_.isEmpty(users) && validateEmail(term)) {
					var usr = {
							loginId : term
					};
					
					users.push(usr);
				}*/
				
				$scope.Users = users;
				return users;
			};
			
			$scope.mentionUserOnSelect = function(usr,id) {
				$scope.mentionUserChecked[id] = true;
			};
			
			$scope.mentionedusers = function(users,id) {
				$scope.mentionUser[id] = users;
				if(_.isArray($scope.mentionUser[id]) && !_.isEmpty($scope.mentionUser[id])) {
					if(_.indexOf($scope.mentionUser[id],$scope.mentionUserSelect[id]) == -1) {
						$scope.mentionUserSelect[id] = $scope.mentionUser[id][0];
					}
				} else {
					$scope.mentionUserSelect[id] = null;
				}
			};
			
			function clearMentionedUsers(id) {
				delete $scope.typedUser[id];
				delete $scope.mentionUser[id];
				delete $scope.mentionUserSelect[id];
				delete $scope.mentionUserChecked[id];
			}
			
			var loadTimer;
			function loadMoreAnnotations(inview) {
				// $scope.annotBegin = 0;
				 if(inview ) {
					 $timeout.cancel(loadTimer);
					 loadTimer = $timeout(function(){
						 
						 if($scope.activeTab.index === 1 && !$scope.hasSelectedAnnotations) {
							 if($scope.docAnnotations && $scope.docAnnotations.length > $scope.annotLimit) {
									if( ($scope.docAnnotations.length-$scope.annotLimit) >= 5 ) {
										$scope.annotLimit += 5;
									} else {
										$scope.annotLimit = $scope.docAnnotations.length;
									}
								}	
						 }
						 if($scope.activeTab.index === 2) {
							 if($scope.docOrphanAnnotations && $scope.docOrphanAnnotations.length > $scope.orphanAnnotLimit) {
									if( ($scope.docOrphanAnnotations.length-$scope.orphanAnnotLimit) >= 5 ) {
										$scope.orphanAnnotLimit += 5;
									} else {
										$scope.orphanAnnotLimit = $scope.docOrphanAnnotations.length;
									}
								}	
						 }
			         }, 500);
			    } 
				
				 /*if($scope.docAnnotations && $scope.docAnnotations.length > $scope.annotLimit) {
					if( ($scope.docAnnotations.length-$scope.annotLimit) >= 10 ) {
						$scope.annotLimit += 10;
					} else {
						$scope.annotLimit = $scope.docAnnotations.length;
					}
				}*/	
			}
			
			
			init();
	}
})();

