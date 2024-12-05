;(function(){
	
	angular.module("vdvcPublicApp").controller("PublicDocViewerController",PublicDocViewerController);
	PublicDocViewerController.$inject = ['$rootScope','$scope',
	        'pendingRequests','MessageService','APIUserMessages','_',
	        '$stateParams','$location','urlParser','$timeout',
	        'CommonService','$filter','uuidService','PublicDigestEventListner',
	        'notificationEvents','$window','PublicDigestService'];
	
	function PublicDocViewerController($rootScope,$scope,pendingRequests,
			MessageService,APIUserMessages,_,$stateParams,$location,
			urlParser,$timeout,CommonService,$filter,uuidService,
			PublicDigestEventListner,notificationEvents,$window,PublicDigestService){
		
		
		var baseUrl = CommonService.getBaseUrl()+"api/";
		var getdocPromise;
		var readOnly = true;
		var annotList = [];
		var loadTimer;
		
		$scope.doc = null;
		$scope.linkId = $stateParams.id;
		$scope.taskspaceId = $stateParams.tsId;
		$scope.documentId = $stateParams.d;
		$scope.annotationId = $stateParams.da;
		
		$scope.tagLimit = 2;
		$scope.viewerId = uuidService.newUuid();
		$scope.docAnnotations = [];
		$scope.docTags = [];
		$scope.selectedAnnotations = null;
		$scope.hasSelectedAnnotations = false;
		$scope.selectedOrphanAnnotations = null;
		$scope.hasSelectedOrphanAnnotations = false;
		$scope.docOrphanAnnotations = [];
		$scope.annotLimit = 10;
		$scope.orphanAnnotLimit = 10;
		$scope.annotBegin = 0;
		$scope.activeTab = {"index" : 1};
		$scope.selectedAnnotTags ={};
		
		
		$scope.instance = null;
		$scope.showComments = false;
		$scope.showTags = false;
		$scope.showPdf = false;
		$scope.isLoading = false;
		$scope.downloadProgress = 0;
		$scope.pdfZoomLevels = [];
		$scope.pdfViewerAPI = {};
		$scope.pdfViewer;
		$scope.pdfScale = "fit_width";
		$scope.pdfURL = "";
		$scope.pdfFile = null;
		$scope.pdfTotalPages = 0;
		$scope.pdfCurrentPage = 0;
		$scope.pdfSearchTerm = "";
		$scope.pdfSearchResultID = 0;
		$scope.pdfSearchNumOccurences = 0;
		$scope.pdfAnnotUI = [];
		$scope.loadMoreAnnotations = loadMoreAnnotations;
		
		var notificationHandledelayTime = PublicDigestService.notificationHandledelayTime;
		var pendingDigestChangedUpdates = [];
		var debounceHandleDigestChangedUpdates = _.debounce(handleDigestChangedUpdates, notificationHandledelayTime);
		var loadEvents = [notificationEvents.DIGEST_CHANGED];
		
		CommonService.getKeyValuesForNotificationHandledelayTime().then(function(resp) {
			if(resp.data.Status && !_.isEmpty(resp.data.listAppKeyValues)) {
				var notificationHandledelayTimeObj = resp.data.listAppKeyValues[0];
				if(!_.isEmpty(notificationHandledelayTimeObj)) {
					notificationHandledelayTime = notificationHandledelayTimeObj.value;
					debounceHandleDigestChangedUpdates = _.debounce(handleDigestChangedUpdates, notificationHandledelayTime*1000);
				}
			}
		});
		
		function onDestroy() {
				//CKEDITOR.instances['editor-'+$scope.documentId].destroy();
		}
		
		$scope.$on("$destroy",function handleDestroyEvent() {
			onDestroy();
			PublicDigestEventListner.close();
			debounceHandleDigestChangedUpdates.cancel();
		});
		
		function handleDigestChangedUpdates() {
			if(pendingDigestChangedUpdates && pendingDigestChangedUpdates.length == 0) {
				return;
			}
			var events = pendingDigestChangedUpdates.splice(0,pendingDigestChangedUpdates.length);
			$window.location.reload();
		}
		
		loadEvents.forEach(function (event) {
		   	$scope.$on(event, function (evt, msg) {
		   		pendingDigestChangedUpdates.push(msg);
		   		debounceHandleDigestChangedUpdates.cancel();
				if(pendingDigestChangedUpdates.length < PublicDigestService.maxNotifications) {
					debounceHandleDigestChangedUpdates();
				} else {
					handleDigestChangedUpdates();
				}
		    });
		});
		
		$scope.$on("windowResized",function(event, msg){
			if($scope.showDoc){
				var t = $timeout(function() {
					var ckeId = $('.cke.cke_reset').attr("id")
					var h = "100%";
					if(ckeId === "cke_editor-"+$scope.viewerId) {
						h = $('.cke.cke_reset').find(".cke_inner").outerHeight();
						$('.cke.cke_reset').find(".cke_contents").height(h);
					}
					if (CKEDITOR.instances['editor-'+$scope.viewerId]) {
						CKEDITOR.instances['editor-'+$scope.viewerId].resize("100%",h);
					}
					$timeout.cancel(t);
				},500);
			}
		});
		
		$scope.$on("annotationonclick",function(event, data) {
			
			$timeout(function() {
				$scope.$apply(function () {
					$scope.showComments = true;
					//$scope.$emit("isolateDoc",true);
					
					$('.pdfHighlight.cmtActive').removeClass("cmtActive");
					var id = data.annotation.id;
					$('div[annot-id="'+id+'"]').addClass("cmtActive");
					if(id) {
						$(".vdvc_comment_selected").removeClass("vdvc_comment_selected");
						$('div[data-id="'+id+'"]').addClass("vdvc_comment_selected");
						if($('div[data-id="'+id+'"]').length > 0) {
							$('div[data-id="'+id+'"]')[0].scrollIntoView(true);
						}
					}
				});
			}, 0);
		});
		
		$scope.editorReinitialize = function() {
			$timeout(function () {
				var editor = CKEDITOR.instances[$scope.viewerId];
				if ( editor && editor.status == "ready") {
					try{
						editor.resize( '100%', '100%' );
					} catch(err) {
						
					}
				}
			},100);
		};
		
		function onResize() {
			if(!$scope.showPdf) {
				$scope.editorReinitialize();
			}
			var t1 = $timeout(function () {
				if($scope.showPdf && $scope.pdfViewer) {
					$scope.pdfViewer.updateView();
				}
				$timeout.cancel(t1);
			},0);
		}
		
		$scope.$on('windowResized', function(msg){
			onResize();
		});
		
		$scope.$watch('showComments', function (newVal, oldVal) {
			if(newVal !== oldVal) {
				onResize();
			}
		});
		
		$scope.toggleComments = function(){
			$scope.showComments = !$scope.showComments;
		};
		
		$scope.showTagName = function(tag) {
			var tagName = angular.copy(tag.TagName);
			if(!_.isEmpty(tag.Value)) {
				tagName = tagName +" : "+ tag.Value;
			}
			return tagName;
		}
		
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
		
		$scope.getUserlabel = function(name) {
 			var lbl = "";
 			if(_.isString(name) && name.trim()) {
 				var matches = name.match(/\b(\w)/g);
 				lbl = matches.join('');
 			}
 			return lbl.toUpperCase();
 		};
 		
		function addcommentIconToDoc(anotObj) {
			var commentEl = $($scope.iframedoc.body).find( 'span[comment-id="'+anotObj.resourceName+'"]' );
			if(commentEl) {
				commentEl.addClass("cmt");
			}
		}
		
		function removecommentIconFromDoc(anotObj) {
			var commentEl = $($scope.iframedoc.body).find( 'span[comment-id="'+anotObj.resourceName+'"]' );
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
		
		$scope.pdfAnnotationsTypeFilter = function(annotation) {
			return (annotation.type === "Highlight" || annotation.type === "Pagenote" || annotation.type === "Screenshot");
		};
		
		$scope.formatCreatedDate = function(dateValue) {
			var date = moment(dateValue).toDate();
			var formatedDate = $filter('date')(date,'MMM d, y h:mm a');
			return formatedDate;
		};
		
		$scope.formatComment = function(annotation,comment) {
			if(annotation.webAnnotation) {
				return $filter('markdown')(comment);
			} else {
				return $filter('linky')(comment,'_blank');
			}
			return comment;
		};
		
		$scope.hasFormatedText = function(annotation) {
			if(_.isEmpty(annotation.formatedText)) {
				return false;
			}
			return true;
		};
		
		function orderWebResourceComments(comments) {
			var LatestComments = [];
			if(comments) {
				for(var i=0; i< comments.length; i++) {
					var anotObj = comments[i];
					anotObj.Commentedtext = anotObj.text;
					anotObj.uid = "vdvc_comment_"+anotObj.resourceName;
					LatestComments.push(anotObj);
				}
				LatestComments =  orderBy(LatestComments, "textposition", false);
				$scope.docAnnotations = LatestComments;
			}
		} 
		
		function orderNonWebResourceComments(comments) {
			var commentEls;
			$($scope.iframedoc.body).find( 'span[comment-id]').removeClass("note");
			var LatestComments = [];
			var orphanComments = [];
			
			if(!_.isEmpty(comments)) {
				_.each(comments,function(anotObj,i){
					anotObj.isOrphan = false;
					anotObj.Commentedtext = anotObj.text;
					anotObj.uid = "vdvc_comment_"+anotObj.resourceName;
					var commentEl =  $($scope.iframedoc.body).find( 'span.first[comment-id="'+anotObj.resourceName+'"]');
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
						$($scope.iframedoc.body).find( 'span[comment-id="'+anotObj.resourceName+'"]').addClass("note");
						LatestComments.push(anotObj);
					} else {
						anotObj.isOrphan = true;
						orphanComments.push(anotObj);
					}
				});
				LatestComments.sort(CommonService.sortAnnotationsByTextPosition);
				orphanComments = _.filter(comments,function(obj){ 
					return _.isUndefined(obj.isOrphan) || obj.isOrphan; 
				});
				
				$scope.docAnnotations = LatestComments;
				$scope.docOrphanAnnotations = orphanComments;
			}
			
		}
		
		function processSelectedConvTags(annot) {
			if(_.isArray(annot.conversations)) {
				_.each(annot.conversations,function(conv,i){
					if(conv.tagsInfo) {
						$scope.selectedAnnotTags[conv.id] = conv.tagsInfo;
					} else {
						$scope.selectedAnnotTags[conv.id] = [];
					}
				});
			}
		}
		
		function orderComments(comments,commentId) {
			$scope.showComments = true;
			_.each(comments,function(comment,i){
				processSelectedConvTags(comment);
			});
			if($scope.doc && $scope.doc.webResource) {
				orderWebResourceComments(comments);
			} else {
				orderNonWebResourceComments(comments);
			}
			
			if(commentId) {
				goToComment(commentId);
			}
		}
		
		
		function getAnnotIndex(id) {
			var index = -1;
			if(!_.isEmpty($scope.docAnnotations)) {
				index = _.findIndex($scope.docAnnotations,{"id" : id});
				return index;
			}
			return index;
		}
		
		function getAnnotationByResourceName(id) {
			return _.findWhere($scope.docAnnotations,{"resourceName" : id}) || _.findWhere($scope.docOrphanAnnotations,{"resourceName" : id});
		}
		
		function getAnnotationById(id) {
			return (_.findWhere($scope.docAnnotations,{"id" : id}) || _.findWhere($scope.docOrphanAnnotations,{"id" : id}));
		}
		
		function goToComment(commentid,top) {
			$scope.activeTab.index = 1;
			var anotObj;
			if(commentid) {
				$scope.hasSelectedAnnotations = true;
				if(commentid) {
					anotObj = getAnnotationById(commentid);
				}
				if(!anotObj) {
					anotObj = getAnnotationByResourceName(commentid);
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
						var $docWrap = $('div.doc-viewr[data-id="'+$scope.viewerId+'"]');
						if($docWrap.length > 0) {
							$scope.onClickComment(null,null,$docWrap.find('.vdvc_comment_'+anotObj.resourceName),top);
						}
						$timeout.cancel(tim);
					 }, 1000);
				}
			}
		}
		
		$scope.ShowAllAnnotations = function() {
			$scope.selectedAnnotations = null;
			$scope.hasSelectedAnnotations = false;
			$scope.selectedOrphanAnnotations = null;
			$scope.hasSelectedOrphanAnnotations = false;
			$scope.activeTab.index = 1;
		};
		
		$scope.onClickComment = function($event,annotation,element,top) {
			var $docWrap = $('div.doc-viewr[data-id="'+$scope.viewerId+'"]');
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
		    	
		    	var docEl = $( $scope.iframedoc.body ).find('span.note.first[comment-id="'+rid+'"]');
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
		    		
		    		
		    		if($scope.iframedoc) {
						var scrollingElement = CommonService.getScrollingElement($scope.iframedoc);
						scrollingElement.scrollTop -= mdl;
					}
		    		
		    		$($scope.iframedoc.body).find('span.note_slctd').removeClass("note_slctd");
		    		$( $scope.iframedoc.body ).find('span.note[comment-id="'+rid+'"]').addClass("note_slctd");
		    	}
		    } 
			if (!$event || ($event && $event.target.tagName !== "INPUT")) {
				if(element && element.length > 0) {
					var rid = element.attr("data-rid");
					if(rid && $scope.iframedoc && $scope.iframedoc.body) {
						/*var slctdCmtEle = $( $scope.iframedoc.body ).find('span.note_slctd');
						if(slctdCmtEle) {
							slctdCmtEle.removeClass("note_slctd");
						}*/
						var slctdCmtEle = $( $scope.iframedoc.body ).find('span.note[comment-id="'+rid+'"]');
						if(slctdCmtEle) {
							slctdCmtEle.addClass("note_slctd");
						}
						//$( $scope.iframedoc.body ).find('span.note_slctd').removeClass("note_slctd");
						//$( $scope.iframedoc.body ).find('span.note[comment-id="'+rid+'"]').addClass("note_slctd");
						var docEle = $( $scope.iframedoc.body ).find('span.note.first[comment-id="'+rid+'"]');
						if(docEle && docEle.length > 0) {
							docEle[0].scrollIntoView(true);
						}
					}
					element.addClass("vdvc_comment_selected");
					//element.addClass("vdvc_comment_selected");
					//element.find("textarea").focus();
					element[0].scrollIntoView(true);
				    $docWrap.find(".comment-wrap")[0].scrollTop -= 10;
				}
			}
		};
		
		function showCommentOnCkeClick(body,elem) {
			$(body.$).find('span.note_slctd').removeClass("note_slctd");
			   var comment_id = $(elem).attr("comment-id");
			   $scope.showComments = true;
			   
			   elem.scrollIntoView();
			   //body.$.scrollTop -= ($(ckeId).find('.cke_top').outerHeight()+55);
			   
			   $(body.$).find('span[comment-id="'+comment_id+'"]').addClass("note_slctd");
			   goToComment(comment_id,elem.offsetTop);
			 //  $scope.$emit("isolateDoc",true);
		}
		
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
			//$scope.showComments = true;
			$scope.content = div.html();
			$scope.showDoc = true;
			
			try {
				$scope.instance = CKEDITOR.replace( editorId,{
					readOnly: readOnly,
					width: "100%",
					language : "en",
					skin : 'office2013,/resources/js/ckeditor/skins/office2013/' ,
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
					if(ckeId === "cke_editor-"+$scope.viewerId) {
						h = $('.cke.cke_reset').find(".cke_inner").outerHeight();
						$('.cke.cke_reset').find(".cke_contents").height(h);
					}
					 
					 if ( evt.editor && evt.editor.status == "ready") {
						 evt.editor.resize("100%",h);
					 }
					 var iframe = $('.cke_wysiwyg_frame');//.contents();
					 if(iframe && iframe.length>0) {
						 $scope.iframedoc = iframe[0].contentDocument || iframe[0].contentWindow.document;
						 if(!_.isEmpty(annotList) && !_.isEmpty($scope.annotationId)) {
							 orderComments(annotList,$scope.annotationId);
						 } else if(!_.isEmpty(annotList)) {
							 orderComments(annotList);
						 }
					 }
				});
				$scope.instance.on( 'contentDom', function( evt ) {
					var body = this.document.getBody();
					var editable = $scope.instance.editable();
					editable.attachListener( editable, 'click', function( event ) {
						//event.stopPropagation();   
						var elem = event.data.getTarget();
						var parentElem = $( elem.$ ).parent();
						if (elem.hasClass("note") && elem.getAttribute("comment-id")) {
							showCommentOnCkeClick(body,elem.$);
						}
					});
					var tim = $timeout(function() {
						if(!_.isEmpty($scope.annotationId)) {
							anotObj = getAnnotationById($scope.annotationId);
							if(!anotObj) {
								anotObj = getAnnotationByResourceName($scope.annotationId);
							}
							var $docWrap = $('div.doc-viewr[data-id="'+$scope.viewerId+'"]');
							if($docWrap.length > 0 && anotObj) {
								$scope.onClickComment(null,null,$docWrap.find('.vdvc_comment_'+anotObj.resourceName),top);
							}
						}
						$timeout.cancel(tim);
					 }, 100);
					 editable.attachListener( this.document, 'mouseover', function( event ) {
						$(body.$).find(".cke_image_resizer").css("display", "none");
						$(body.$).find(".cke_widget_drag_handler_container").css("display", "none");
					 });
				});
			}
		}
		
		function showDocument() {
			if($scope.documentId) {
				pendingRequests.cancel(getdocPromise);
				getdocPromise = CommonService.getPublicDocById($scope.linkId,$scope.taskspaceId,$scope.documentId,$scope.annotationId);
				getdocPromise.then(function(response){
					if (response.status == 200 && response.data.Status) {
						$scope.doc = response.data.Notes;
						
						if($scope.doc) {
							if(!_.isEmpty(response.data.Annotations)) {
								annotList = response.data.Annotations;
							}
							if(!_.isEmpty($scope.doc.tags)) {
								$scope.docTags = angular.copy($scope.doc.tags);
							}
							$scope.showTags = response.data.Tag; 
							if(_.isString($scope.doc.contentType) && $scope.doc.contentType.toLowerCase() == 'application/pdf') {
								loadPdf();
							} else {
								CreateNotes("editor-"+$scope.viewerId);
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
			$scope.pdfUrl = baseUrl+'publicAPI/getDigestPdfDoc/'+$scope.linkId+"/"+$scope.taskspaceId+"/"+$scope.documentId;
			$scope.loadPDF($scope.pdfUrl);
			var t = $timeout(function() {
				//$scope.showComments = true;
				$scope.pdfAnnotations = annotList;
				_.each($scope.pdfAnnotations,function(pdfAnnotation,i){
					processSelectedConvTags(pdfAnnotation);
				});
				$timeout.cancel(t);
			},100);
		}
		
		$scope.showTagsInfo = function(conv) {
			if(conv.tagsInfo && conv.tagsInfo.length > 0) {
				return true;
			}
			return false;
		};
		
		$scope.pdfCommentOnclick = function($event,annot) {
			if ($event) {
				//$event.preventDefault();
			    $event.stopPropagation();
			}
			
			var pdfPage = $scope.pdfViewerAPI.viewer._pages[annot.pageNum-1];
			if(pdfPage) {
				pdfPage.CustomRenderCB = function() {
					var $pdfWrap = $('div.pdf-wrap[data-id="'+$scope.viewerId+'"]');
					$pdfWrap.find('.pdfHighlight.cmtActive').removeClass("cmtActive");
					$pdfWrap.find('.pdfScreenshot.screenshotActive').removeClass("screenshotActive");
					var cmt = $('div[annot-id="'+annot.id+'"]');
					$pdfWrap.find(".vdvc_comment_selected").removeClass("vdvc_comment_selected");
					$('div[data-id="'+annot.id+'"]').addClass("vdvc_comment_selected");
					if(cmt.length > 0){
						if(annot.type == "Screenshot") {
							cmt.addClass("screenshotActive");
						} else {
							cmt.addClass("cmtActive");
						}
						cmt[0].scrollIntoView(true);
						
						$pdfWrap[0].scrollTop -= 20;
					}
				};
				
				if(pdfPage.renderingState == 3 || ($scope.pdfCurrentPage == annot.pageNum && $scope.isPdfIsRendered)) {
					pdfPage.CustomRenderCB();
				} else {
					$scope.pdfCurrentPage = annot.pageNum;
					$scope.pdfViewerAPI.goToPage($scope.pdfCurrentPage);
				}
			} else if(annot.type == "Pagenote") {
				var $pdfWrap = $('div.pdf-wrap[data-id="'+$scope.viewerId+'"]');
				$pdfWrap.find(".vdvc_comment_selected").removeClass("vdvc_comment_selected");
				$('div[data-id="'+annot.id+'"]').addClass("vdvc_comment_selected");
			}
			
		};
		
		function triggerPdfCmtEle() {
			$scope.showComments = true;
			var pdfCmtEl = $('div[data-convId="'+$stateParams.da+'"]').closest('.comment-crd');
			if(pdfCmtEl) {
				if(pdfCmtEl) {
					pdfCmtEl[0].scrollIntoView();
				}
				pdfCmtEl.trigger("click");
			}
		}
		
		$scope.isPdfIsRendered = false;
		
		$scope.onPDFProgress = function (operation, state, value, total, message) {
			if(operation === "render" && value === 1) {
				if(state === "success") {
					
					$scope.pdfCurrentPage = 1;
					$scope.pdfTotalPages = $scope.pdfViewerAPI.getNumPages();
					$scope.isLoading = false;
					$scope.showComments = true;
					if(!$scope.isPdfIsRendered) {
						var tim = $timeout(function() {
							if($stateParams.d && $scope.documentId == $stateParams.d && $stateParams.da) {
								triggerPdfCmtEle();
							}
							$scope.isPdfIsRendered = true;
							$timeout.cancel(tim);
						}, 1000);
					}
				} else {
					console.log("Failed to render 1st page!\n\n" + message);
					$scope.isLoading = false;
				}
			} else if(operation === "download" && state === "loading") {
				$scope.downloadProgress = (value / total) * 100.0;
			} else {
				if(state === "failed") {
					console.log("Something went really bad!\n\n" + message);
				} else if(state === "success") {
					if(!$scope.isPdfIsRendered) {
						var tim = $timeout(function() {
							if($stateParams.d && $scope.documentId == $stateParams.d && $stateParams.da) {
								triggerPdfCmtEle();
							}
							$scope.isPdfIsRendered = true;
							$timeout.cancel(tim);
						}, 0);
					}
				}
			}
			
			if(operation === "render" && state === "success") {
				var pdfPage = $scope.pdfViewerAPI.viewer._pages[value-1];
				if(typeof pdfPage.CustomRenderCB == "function") {
					pdfPage.CustomRenderCB();
				}
			}
		};
		
		$scope.getPdfAnnotationText = function(annot) {
			if(!_.isEmpty(annot.highligtedText)) {
				return annot.highligtedText;
			} else {
				return annot.annotatedText;
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
			
		function loadMoreAnnotations(inview) {
			
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
		}
		$scope.taskspaceId = $stateParams.tsId;
		$scope.documentId = $stateParams.d;
		function connectPublicDigestEventSocket() {
			if(!_.isEmpty($scope.taskspaceId) && PublicDigestEventListner.isConnected()) {
				PublicDigestEventListner.sendMessage({"taskspaceId":$scope.taskspaceId,"documentId":$scope.documentId});
    		} else if(!_.isEmpty($scope.taskspaceId) && !PublicDigestEventListner.isConnected()) {
    			PublicDigestEventListner.taskspaceId = $scope.taskspaceId;
    			PublicDigestEventListner.documentId = $scope.documentId;
    			PublicDigestEventListner.reconnect();
			}
		}
		
		function init() {
			connectPublicDigestEventSocket();
			showDocument();
		}
		init();
	}
})();

