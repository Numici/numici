;(function(){
		
	angular.module('vdvcApp').directive('docContent', function() {
		  return {
		    restrict: "C",
		    link: function(scope, element, attrs){
		    	scope.element = element;
		    }
		  }
	});
	angular.module('vdvcApp').directive('webResourceLinkInfo', function() {
		  return {
		    restrict: "E",
		    templateUrl:'app/components/DocViewer/WebResourceLinkInfo.html'
		  }
	});
	
	angular.module("vdvcApp").controller("DocViewerController",DocViewerController);
	DocViewerController.$inject = ['$rootScope','$scope','pendingRequests','userService','DocFactory',
	                               'SecFilingService','TaskSpaceService','commonService','MessageService',
	                               'APIUserMessages','_','rangy','$state','$stateParams','$confirm','TagService',
	                               "AnnotationService","$sce",'$uibModal','$timeout','appData','clipboard',
	                               'DeepLinkService','orderByFilter','SECImportFactory','ToolTipService',
	                               'urlParser','$window','$document','DocumentEventsListner','moment',
	                               '$deviceInfo','$compile','$sce','DocViewerService','$filter','uuidService',
	                               'ActionItemsService','$q','Juicify','markdown','HelpDescService',
	                               'AnnotationDigestService','AddedTaskspacesService'];
	
	function DocViewerController($rootScope,$scope,pendingRequests,userService,DocFactory,
			SecFilingService,TaskSpaceService,commonService,MessageService,APIUserMessages,
			_,rangy,$state,$stateParams,$confirm,TagService,
			AnnotationService,$sce,$uibModal,$timeout,appData,clipboard,
			DeepLinkService,orderBy,SECImportFactory,ToolTipService,
			urlParser,$window,$document,DocumentEventsListner,moment,$deviceInfo,
			$compile,$sce,DocViewerService,$filter,uuidService,ActionItemsService,$q,Juicify,markdown,
			HelpDescService,AnnotationDigestService,AddedTaskspacesService){
		
		
		var appdata = appData.getAppData();
		var markdownCss = "";
		var tagHighlightTimeOut;
		var state = $state;
		var currentUserId = appdata.UserId;
		var contentChanged = false;
		var docNotification = null;
		var win = null;
		var commentChangeTimer;
		var commentChangeTimer1;
		var scrollTimer;
		var DocsaveTimer;
		var lastSaveTime;
		var selectionConfig = {};
		var pdfSelectionConfig = {};
		var textNodes = [];
		
		var docScope =  null;
		var opencomment = false;
		$scope.helpTitile = HelpDescService.helpTitile["OrphanedAnnotations"];	
		$scope.viewerId = "doc"+uuidService.newUuid();
		$scope.annotWrapId = "annot"+uuidService.newUuid();
		var ckeId = "#cke_"+$scope.viewerId;
		var linkInfoId = '#lnk-meta-info-'+$scope.viewerId;
		var toolBarId = '#comment-tool-'+$scope.viewerId;
		$scope.userinfo = $scope.userinfo ? $scope.userinfo : $scope.$parent.userinfo;
		$scope.userWithLock;
		$scope.saveMsg = {
			"msg" : "",
			"tooltip" : ""
		};
		
		$scope.el;
		
		$scope.currentStateName = state.current.name;
		$scope.deviceInfo = $deviceInfo;
		$scope.tagLimit = 2;
		var baseUrl = commonService.getContext()+"api/";
		var fileBaseUrl = commonService.getContext();
		$scope.commentIconUrl = fileBaseUrl+"/app/assets/icons/digest_comment.png";
		
		$scope.AdvanceToolBarBtn = {};
		$scope.DownloadBtn = {};
		$scope.ownedFolders = [];
		$scope.doc = null;
		$scope.tags = [];
		$scope.isTagEdited = false;
		$scope.isAnnotTagEdited = {};
		$scope.isConvTagEdited = {};
		$scope.searchInEditTag = {"enable" : true};
		$scope.allAnnotTagValues = {};
		$scope.allConvTagValues = {};
		
		$scope.documentId = $scope.documentId ? $scope.documentId :$stateParams.docId;
		var clientId = $scope.clientId ? $scope.clientId :$stateParams.clientId;
		
		$scope.webResourceLinkInfo = {};
		
		$scope.commentId = $scope.commentId ? $scope.commentId : $stateParams.commentId ? $stateParams.commentId : $stateParams.da;
		$scope.docAnnotations = [];
		$scope.selectedAnnotations = null;
		$scope.hasSelectedAnnotations = false;
		$scope.selectedOrphanAnnotations = null;
		$scope.hasSelectedOrphanAnnotations = false;
		$scope.docOrphanAnnotations = [];
		//$scope.pageNotes = [];
		$scope.annotLimit = 10;
		$scope.orphanAnnotLimit = 10;
		$scope.annotBegin = 0;
		$scope.activeTab = {"index" : 1};
		$scope.showDoc = false;
		$scope.instance = null;
		
		$scope.isGlobalDoc = false;
		$scope.isComparedSec = false;
		
		$scope.showEditButton = false;
		$scope.showExpButton = false;
		$scope.isAddToTSEnable = true;
		$scope.annotations = null;
		
		$scope.docHierarchy = [];
		
		$scope.status = {
				"isopen" : false
		};
		
		$scope.commentHolder = {
				elements : [],
				comment: null,
				commentFor: null,
				commentId: null
		};
		$scope.docCommentReply = {};
		$scope.loadMoreAnnotations = loadMoreAnnotations;
		$scope.downLoad = downLoad;
		
		
		$scope.showPdf = false;
		$scope.isLoading = false;
		$scope.downloadProgress = 0;

		$scope.pdfZoomLevels = [];
		$scope.pdfViewerAPI = {};
		$scope.pdfViewer;
		$scope.pdfScale = "auto";
		$scope.pdfURL = "";
		$scope.pdfFile = null;
		$scope.pdfTotalPages = 0;
		$scope.pdfCurrentPage = 0;
		$scope.pdfSearchTerm = "";
		$scope.pdfSearchResultID = 0;
		$scope.pdfSearchNumOccurences = 0;
		$scope.pdfAnnotations = [];
		
		$scope.docDeepLinks = [];
		$scope.showComments = false;
		$scope.readOnly = true;
		$scope.Users = [];
		
		$scope.taskSpaceState = commonService.taskSpaceState;
		
		var config = ($scope.taskSpaceState && !_.isEmpty($scope.taskSpaceState.digestsettings) ? 
				angular.copy($scope.taskSpaceState.digestsettings) : 
					angular.copy(AnnotationDigestService.getDigestFilters()));
		
		$scope.groupBy = _.isEmpty(config.groupBy) ? "document" : config.groupBy;
		
		$scope.digestMetaInfoOptions = angular.copy(config.digestMetaInfoOptions);
		$scope.enableBorder = angular.copy(config.enableBorder);
		$scope.imagePosition = angular.copy(config.imagePosition);
		$scope.displayOrder = angular.copy(config.displayOrder);
		$scope.displayReplies = angular.copy(config.filterOptions.displayReplies);
		$scope.pagenoteInitiated = false;
		$scope.pagenote = {"text" : ""};
		$scope.addNewPageNote = addNewPageNote;
		$scope.isDocInInbox = false;
		
		function unloadMessage() {
		    return "You have unsaved changes";
		}
		
		function setConfirmUnload(on) {
		    window.onbeforeunload = (on) ? unloadMessage : null;
		}
		
		function getUsers() {
			userService.getAllUsersIncludeOtherOrgSharedUsers().then(function(resp){
				 if(resp.status == 200 && resp.data.Status) {
					 var allUsers = resp.data.Users;
					 OrgUsers = [{"loginId": appdata["UserId"],"firstName": appdata["UserName"]}];
					 if(_.isArray(allUsers)) {
						 OrgUsers = OrgUsers.concat(allUsers);
					 }
				 }
			});
		}
		
		function registerDocNotifications() {
			DocumentEventsListner.sendMessage({"userId":$scope.userinfo.UserId,"filter":null});
		}
		
		function onInitController() {
			if(state.current.name == "search" || state.current.name == "taskspace.list.task" || state.current.name == "docview"){
				$scope.showEditButton = true;
			}
			if(state.current.name == "search" || state.current.name == "taskspace.list.task"){
				$scope.showExpButton = true;
			}
			if(state.current.name == "taskspace.list.task"){
				$scope.isAddToTSEnable = false;
			}
			if(!DocumentEventsListner.isConnected()) {
				DocumentEventsListner.reconnect();
    		}
			//registerDocNotifications();
		}
		
		$scope.showHelp = function(key) {
			HelpDescService.showHelp(key);
		};
		
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
		
		var trustedAnnotatedText = {};
		
		$scope.hasAnnotatedText = AnnotationDigestService.hasAnnotatedText;
		
		$scope.getAnnotatedText = function(annotation) {
			
			if(!trustedAnnotatedText[annotation.id]) {
				var annot = angular.copy(annotation);
				annot.link = getAnnotationContextUrl(annotation);
				annot.linkEnabled = true;
				trustedAnnotatedText[annotation.id] = AnnotationDigestService.getAnnotatedText(annot,{"annotationLink" : true});
			}
			return trustedAnnotatedText[annotation.id];
			
		};
		
		$scope.isWebResourceDoc = function() {
			var status = false;
			if($scope.doc && $scope.doc.docType == "WebResource") {
				status = true;
			}
			return status;
		};
		
		$scope.isExtensionWebClipDoc = function() {
			var status = false;
			if($scope.doc && $scope.doc.extensionWebClip) {
				status = true;
			}
			return status;
		};
		
		$scope.isCompressOrCloseDoc = function(doc) {
			var status = true;
			if(doc && doc.secCompareFile && !$scope.isolateDoc) {
				status = false;
			}
			return status;
		};

		onInitController();
		
		function setCkeBodyWidth() {
			$timeout(function () {
				if($scope.iframedoc && $scope.iframedoc.body) {
					var ckeContentWidth = $(ckeId).find('.cke_contents').innerWidth();
					$(ckeId).find('iframe').attr("width",(ckeContentWidth)+"px");
					$($scope.iframedoc.body).css("width",(ckeContentWidth-16)+"px");
				}
			},0);
		}
		
		var getDocLockDuration = function(editorId,cb) {
			commonService.getNavMenuItems({"type":"ObjLocking","isActive":true}).then(function(resp){
				if(resp.status == 200 && resp.data.Status) {
					var ObjLockingList = resp.data.listAppKeyValues;
					$scope.docLockDuration = _.findWhere(ObjLockingList,{'key':'DocLockDuration'});
				}
			})['finally'](function() {
				if(typeof cb == "function") {
					cb(editorId);
				}
			});  
		};
		
		$scope.isVDVCDocViewBtnEnabled = function(btn) {
	    	var status = false;
	    	if(appdata["VDVCDocViewButtons"]) {
	    		var btnConfig = _.findWhere(appdata["VDVCDocViewButtons"],{"key": btn});
	    		if(btnConfig && btnConfig.value == "Enabled") {
	    			status = true;
	    		}
	    	}
	    	return status;
	    };
		
		$scope.showShareBtn = function(doc) {
			var status = false;
			var isExternalDocPresent = DocFactory.isExternalDocPresent([doc]);
			if(doc && !doc.deleted && doc.isSharable && (doc.perms && doc.perms.edit && doc.perms.share) && !$scope.isGlobalDoc && doc.docType != "WebResource" && !isExternalDocPresent){
				status = true;
			} else {
				status = false;
			}
			return status;
		};
		
		$scope.getDocViewerSecondaryNavBar = function() {
			if($scope.deviceInfo.isTouch) {
				return "app/components/DocViewer/Tablet/docViewerSecondaryNavBar.tab.html";
			} else {
				return "app/components/DocViewer/docViewerSecondaryNavBar.html";
			}
		};
		
		$scope.getPdfViewerSecondaryNavBar = function() {
			if($scope.deviceInfo.isTouch) {
				return "app/components/DocViewer/Tablet/pdfViewerSecondaryNavBar.tab.html";
			} else {
				return "app/components/DocViewer/pdfViewerSecondaryNavBar.html";
			}
		};
		
		$scope.getToolTip = function(key) {
			return ToolTipService.showToolTip(key);
		};
		
		$scope.getUserlabel = function(name) {
 			var lbl = "";
 			if(_.isString(name) && name.trim()) {
 				var matches = name.match(/\b(\w)/g);
 				lbl = matches.join('');
 			}
 			return lbl.toUpperCase();
 		};
 		
		$scope.getPDFToolTip = function(key) {
			return ToolTipService.showToolTip(key);
		};
		
		$scope.$on("deeplinkonclick",function(event, data) {
			$scope.showPdfLinkInfo(data.originalEvent,data.linkId);
		});
		
		$scope.$on("annotationonclick",function(event, data) {
			
			$timeout(function() {
				$scope.$apply(function () {
					$scope.showComments = true;
					$scope.$emit("isolateDoc",true);
					
					$('.pdfHighlight.cmtActive').removeClass("cmtActive");
					$('.pdfScreenshot.screenshotActive').removeClass("screenshotActive");
					var id = data.annotation.id;
					if(id) {
						if(data.annotation.type == "Screenshot") {
							$('div[annot-id="'+id+'"]').addClass("screenshotActive");
						} else {
							$('div[annot-id="'+id+'"]').addClass("cmtActive");
						}
						$(".vdvc_comment_selected").removeClass("vdvc_comment_selected");
						$('div[data-id="'+id+'"]').addClass("vdvc_comment_selected");
						if($('div[data-id="'+id+'"]').length > 0) {
							$('div[data-id="'+id+'"]')[0].scrollIntoView(true);
						}
					}
				});
			}, 0);
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
		
		
		$scope.$on('onSelectComment', function (event,commentId) {
			$scope.commentId = commentId;
			scrollToComment();
		});
		
		$scope.$on('orientationChange', function (event,orientation) {
			if($scope.deviceInfo.isMobile) {
				setCkeBodyWidth();
			}
		});
		
		$scope.$on("resizeDoc",function(event, msg){
			onResize();
		});
		
		
		$scope.$on("LOCKED",function(event, msg){
			if(msg.documentId == $scope.documentId) {
				$scope.userWithLock = msg;
				if($scope.docLockId && msg.userId && $scope.userinfo && $scope.userinfo.UserId && 
						msg.userId.toLowerCase() != $scope.userinfo.UserId.toLowerCase()) {
					$scope.docLockId = null;
					setReadOnly();
				}
			}
		});
		
		$scope.$on("UNLOCKED",function(event, msg){
			if(msg.documentId == $scope.documentId) {
				$scope.userWithLock = false;
			}
		});
		
		
		function updateDocumentOnNotification() {
			if($scope.doc && !$scope.doc.webResource && $scope.instance) {
				var mySelection = $scope.instance.getSelection();
				var txt = "";
				if(mySelection) {
					txt = mySelection.getSelectedText();
				}
				if($scope.readOnly && _.isEmpty(txt)) {
					refreshDocument({
						onDocSaveSuccess : function() {
							getDocAnnotations();
							//$scope.cmtUpdateReceived = true;
						}
					});
				}
			} else if($scope.doc && $scope.doc.webResource) {
				getDocAnnotations();
			}
		}
		
		$scope.cmtUpdateReceived = false;
		$scope.getUpdates = function() {
			if($scope.showPdf) {
				getPdfAnnotations();
			} else {
				getDocAnnotations();
			}
			$scope.cmtUpdateReceived = false;
		}
		
		$scope.$on("COMMENTED",function(event, msg){
			if(msg.tsId && msg.tsId != $scope.tsId) {
				return false;
			} 
			
			if(msg.documentId == $scope.documentId) {
				if($scope.showPdf) {
					//$scope.cmtUpdateReceived = true;
					getPdfAnnotations();
				} else {
					updateDocumentOnNotification();
				}
			}
		});
		
		$scope.$on("UPDATED",function(event, msg){
			if(msg.documentId == $scope.documentId) {
				/*if($scope.doc && $scope.doc.commentMode && !$scope.docLockId) {
					refreshDocument($scope.documentId);
				}*/
				if($scope.showPdf) {
					$scope.cmtUpdateReceived = true;
					//getPdfAnnotations();
				} else {
					updateDocumentOnNotification();
				}
			}
		});
		
		
		$scope.$on("objectSettings",function(event, msg){
			if(msg) {
				switch(msg.docType) {
				case "vdvcNote":
					setDocScrollPosition(msg);
					break;
				case "pdf":
					setPdfScrollPosition(msg);
					break;
				}
			}
		});
		
		var pdfScrollInfo;
		$scope.$on("pdfOnScroll",function(event,msg) {
			pdfScrollInfo = msg;
			$timeout.cancel(scrollTimer);
	        scrollTimer = $timeout(function() {
	        	 var obj = {
						 "objectId":$scope.documentId,
						 "type":"Document",
						 "docType" : "pdf",
						 "position":msg.scrollTop 
				 };
				 $scope.$emit("objectOnChange",obj);
	        }, 1000);
		});
		
		
		
		
		function commentHolderInit() {
			$scope.commentHolder.elements = [];
			$scope.commentHolder.comment = null;
			$scope.commentHolder.commentFor = null;
			$scope.commentHolder.commentId = null;
		}
		
		
		$scope.toggleComments = function(){
			$scope.showComments = !$scope.showComments;
			if($scope.showPdf && !$scope.showComments) {
				var $pdfWrap = $('div.pdf-viewr[data-id="'+$scope.viewerId+'"]');
				$pdfWrap.find('.pdfHighlight').removeClass("cmtActive");
				$pdfWrap.find('.pdfScreenshot').removeClass("screenshotActive");
			}
		};
		
		function setDocScrollPosition(objSettings) {
			if($scope.iframedoc) {
				var scrollingElement = commonService.getScrollingElement($scope.iframedoc);
				scrollingElement.scrollTop = objSettings.position;
			}
		}
		
		function setPdfScrollPosition(objSettings) {
			if($('.vdvc-pdf-viewer').length > 0) {
				$('.vdvc-pdf-viewer').scrollTop(objSettings.position);
			}
		}
		
		$scope.addToTaskSpace = function (size) {
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
			    		  return $scope.doc;
			    	  },
			    	  selectedChannelInfo : {},
			    	  slackChannelConfigs : {},
			    	  moveObjectInfo : {},
			    	  addObjectsFromDocsInfo : {},
			    	  asanaconfig : {}
			      }
			});
			modalInstance.result.then(function (downloadResp) {
				MessageService.showSuccessMessage("ADD_TASKSPACE");
				if(!_.isEmpty(downloadResp)) {
					handleDownloadGlobalDocCB(downloadResp);
				}
			}, function () {
				
			});
		};
		
		$scope.addedTaskspaces = function () {
			var docClientId = $scope.doc.clientId;
			if(!docClientId) {
				docClientId = "g";
			}
			DocFactory.getDocAssociatedToTaskspace(docClientId,$scope.doc.id).then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					AddedTaskspacesService.open({"windowClass" : "added-taskspaces-list", "SelectedDoc" : $scope.doc,"AddedTaskspaces" : resp.data.Taskspaces});
				}
			});
		}
		
		function handleDownloadGlobalDocCB(resp) {
			MessageService.showSuccessMessage("DOC_SAVE",[$scope.doc.displayName]);
			if($state.$current.name == "taskspace.list.task") {
				if(selectionConfig.bookmarks) {
					 commonService.selectionConfig = selectionConfig;
				}
				$scope.$emit('replaceObject', {curId:$scope.documentId, newId:resp.data.Notes.id,clientId:appdata["OrganizationId"], docType : resp.data.Notes.docType});
			}
			if($state.$current.name == "search") {
				$scope.doc = resp.data.Notes;
				var newDoc = {
						 "id" : $scope.doc.id,
						 "gdId" : $scope.documentId,
						 "clientId" : appdata["OrganizationId"],
						 "docType" : $scope.doc.docType,
				};
				
				$scope.documentId = $scope.doc.id;
				$stateParams.docId = $scope.doc.id;
				if(!$scope.showPdf && selectionConfig.bookmarks) {
					 commonService.selectionConfig = selectionConfig;
				}
				if($scope.showPdf && !_.isEmpty(pdfSelectionConfig)) {
					 commonService.pdfSelectionConfig = pdfSelectionConfig;
				}
				preprocessDoc();
				$scope.$emit("objectLoaded",{'objectId':$scope.documentId});
				$scope.$emit("replaceObject",newDoc);
				
			}
		}
		
		$scope.SaveToDownloadsModal = function (folder,size) {
			var modalInstance = $uibModal.open({
			      animation: $scope.animationsEnabled,
			      templateUrl: 'app/components/Documents/DefaultDownloadFolder/DefaultDownloadFolderModal.html',
			      controller: 'DefaultDownloadFolderController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'vm',
			      size: size,
			      resolve: {
			    	  sourceInfo : function() {
			    		  return {
			    			  folderId:  folder.id,
			    			  folderName:folder.name,
			    			  docId: $scope.documentId
			    		  };
			    	  }
			      }
			    });
			
			modalInstance.result.then(function (resp) {
				handleDownloadGlobalDocCB(resp);
			}, function () {
			      
			});
		};
		
		var hideFullToolBar = true;
		$scope.toggleToolBarTitle = "Show Full Toolbar";
		CKEDITOR.config.toolbar_Basic =
			[
			 	{ name: 'styles', items : [ 'Format','lineheight' ] },
			 	{ name: 'basicstyles', items : [ 'Bold','Italic','Underline','Strike','-','RemoveFormat' ] },
				{ name: 'clipboard', items : [ 'Cut','Copy','Paste','PasteText','PasteFromWord','-','Undo','Redo' ] },
				{ name: 'links', items : [ 'Link','Unlink'] },
				{ name: 'insert', items : [ 'Image','oembed','Table','HorizontalRule'] },
				{ name: 'paragraph', items : [ 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-','NumberedList','BulletedList','-','Outdent','Indent','-','Blockquote' ] },
				{ name: 'tools', items : [ 'Maximize'] }
			];
		CKEDITOR.config.toolbar_Full =
			[
				{ name: 'styles', items: [ 'Styles', 'Format', 'Font', 'FontSize' ] },
				{ name: 'basicstyles', items: [ 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'RemoveFormat' ] },
				{ name: 'clipboard', items: [ 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo' ] },
				{ name: 'links', items: [ 'Link', 'Unlink', 'Anchor' ] },
				{ name: 'insert', items: [ 'Image','oembed'/*, 'Flash'*/, 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe' ] },
				{ name: 'paragraph', items: [ 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl', 'Language' ] },
				{ name: 'tools', items: [ 'Maximize', 'ShowBlocks' ] },
				{ name: 'document', items: [ 'Save', 'NewPage', 'Preview', 'Print', '-', 'Templates' ] },
				{ name: 'editing', items: [ 'Find', 'Replace', '-', 'SelectAll', '-', 'Scayt' ] },
				{ name: 'forms', items: [ 'Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'ImageButton', 'HiddenField' ] },
				{ name: 'colors', items: [ 'TextColor', 'BGColor' ] },
				{ name: 'about', items: [ 'About' ] }
			];
		CKEDITOR.config.toolbar_Notes =
			[
			 	{ name: 'styles', items : [ 'Format'] },
			 	{ name: 'basicstyles', items : [ 'Bold','Italic','Underline','Strike'] },
				{ name: 'paragraph', items : [ 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-','NumberedList','BulletedList','-','Outdent','Indent' ] },
				{ name: 'insert', items : [ 'Link','Image','oembed','Blockquote'] },
			];
		
		$scope.editorReinitialize = function() {
			$timeout(function () {
				var editor = CKEDITOR.instances[$scope.viewerId];
				if ( editor && editor.status == "ready") {
					try{
						editor.resize( '100%', '100%' );
					} catch(err) {
						
					}
				}
				if(commonService.selectedSnippet > -1) {
					setSnippetPosition(commonService.selectedSnippet);
				}
			},100);
		};
		
		function onResize() {
			var timer = $scope.currentStateName != "docview" ? 1100 :500;
			$scope.editorReinitialize();
			var t1 = $timeout(function () {
				if($scope.showPdf && $scope.pdfViewer) {
					$scope.pdfViewer.updateView();
				}
				$timeout.cancel(t1);
			},0);
			var t2 = $timeout(function () {
				if(!$scope.showPdf) {
					setCkeToolBar();
				}
				$timeout.cancel(t2);
			},1500);
			
		}
		
		$scope.$on('windowResized', function(msg){
			onResize();
		});
		
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
				var tagsToSave = [];
				_.each($scope.selectedTags.tags,function(selectedTag){
					if(!_.isEmpty(selectedTag.TagName)) {	//selectedTag.isNew && 
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
					if (response.status == 200 && response.data.Status) {
						$scope.cancelEditTag();
						$scope.getItemTags();
						handleTagCB(response.data.resultList);
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
		 
		 $scope.onRemoveTagValue = function(tag) {
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
							var isTagExist = _.findWhere($scope.Alltags,{"TagName":searchkey});
							if(!isTagExist && !_.isEmpty(searchkey) && searchkey.indexOf(":") == -1) {
								if(!_.isEmpty(searchkey)) {
									searchkey = searchkey.trim()
								}
								$scope.Alltags.unshift({
							  		"TagId":null,
							  		"TagName" : searchkey,
							  		"isTag" : true
							  	});
							}
						}
					});
			  }
		};
		
		$scope.refreshTagVlauesInfo = function(TagName,searchkey) {
			if(_.isEmpty($scope.editedTagValues.tagValues) && searchkey != null) {
				  TagService.getAllTagValues(TagName,searchkey).then(function(resp) {
						if(resp.status == 200 && resp.data.Status) {
							$scope.allTagValues = resp.data.Tag;
							var isTagExist = _.findWhere($scope.allTagValues,{"Value":searchkey});
							if(!isTagExist && !_.isEmpty(searchkey) && searchkey.indexOf(":") == -1) {
								if(!_.isEmpty(searchkey)) {
									searchkey = searchkey.trim()
								}
								$scope.allTagValues.unshift({
							  		"TagId":null,
							  		"TagName" : TagName,
							  		"Value" : searchkey,
							  		"isTag" : true
							  	});
							}
							
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
			if($scope.hasSelectedAnnotations && selectedAnnotEle.length > 1) {
				editableEle = $(selectedAnnotEle[selectedAnnotEle.length-2]).find(".editConvForm.ng-hide");
			}
			if(!doc.perms.readonly && annotation.conversations && annotation.conversations.length == editableEle.length) {
				status = true;
			}
			return status;
		}
		$scope.refreshAnnotTagVlauesInfo = function(annotId,TagName,searchkey) {
			if($scope.editedAnnotTagValues[annotId] && _.isEmpty($scope.editedAnnotTagValues[annotId].tagValues) && searchkey != null) {
				  TagService.getAllTagValues(TagName,searchkey).then(function(resp) {
						if(resp.status == 200 && resp.data.Status) {
							$scope.allAnnotTagValues[annotId] = resp.data.Tag; 
							var isTagExist = _.findWhere($scope.allAnnotTagValues[annotId],{"Value":searchkey});
							if(!isTagExist && !_.isEmpty(searchkey) && searchkey.indexOf(":") == -1) {
								if(!_.isEmpty(searchkey)) {
									searchkey = searchkey.trim()
								}
								$scope.allAnnotTagValues[annotId].unshift({
							  		"TagId":null,
							  		"TagName" : TagName,
							  		"Value" : searchkey,
							  		"isTag" : true
							  	});
							}
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
							var isTagExist = _.findWhere($scope.allConvTagValues[convId],{"TagName":searchkey});
							if(!isTagExist && !_.isEmpty(searchkey) && searchkey.indexOf(":") == -1) {
								if(!_.isEmpty(searchkey)) {
									searchkey = searchkey.trim()
								}
								$scope.allConvTagValues[convId].unshift({
									"TagId":null,
							  		"TagName" : TagName,
							  		"Value" : searchkey,
							  		"isTag" : true
							  	});
							}
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
			if (!$scope.status.isopen && $scope.isGlobalDoc) {
		    	$timeout(function () {
		    		$scope.status.isopen = true;
		        },10);
		    	globlaDocSaveConfirmation("Documents in the Common Repository cannot be annotated or tagged. Choose the folder where a local copy of the document will be saved");
				return false;
			}
		    if ($scope.status.isopen) {
		    	$scope.selectedTags ={
		    			tags : []
		    	};
		    	processTags();
		    } 
		};
		
		$scope.cancelAddTagToggle = function($event) {
			if($event) {
				$event.preventDefault();
			    $event.stopPropagation();
			}
			$scope.selectedTags.tags = angular.copy($scope.tags);
			$scope.status.isopen = true;
			$scope.cancelEditTag();
		};
		
		$scope.saveEditedTag = function($event,type,typeId) {
			if($event) {
				$event.preventDefault();
			    $event.stopPropagation();
			}
			if(type === "Doc") {
				if($scope.editedTag.TagName && !_.isEmpty($scope.editedTagValues.tagValues)) {
					_.findWhere($scope.selectedTags.tags,{"TagName" : $scope.editedTag.TagName}).Value = $scope.editedTagValues.tagValues[0].Value;
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
		
		function hasUncommittedComments() {
			var status = false;
			var index = _.findIndex($scope.docAnnotations,{"transient" : true});
			if(index > 0) {
				status = true;
			}
			return status;
		}
		
		function initiateDocSavePolling() {
			
			var autoSaveFrequency = appdata["AutoSaveIdleFrequency"];
			var duration = moment.duration(moment().diff(lastSaveTime));
			var ms = duration.asMilliseconds();
			if(ms >= appdata["AutoSaveFrequency"]) {
				autoSaveFrequency = 0;
			}
			
			
			$timeout(function() {
				$scope.$apply(function () {
					$scope.saveMsg.msg = 'Saving...';
			    });
			}, 0);
			
			cancelDocsaveTimer();
			DocsaveTimer = $timeout(function(){
				if($scope.isDocOnEditMode()) {
					$scope.saveNotes({
						onDocSaveComplete : function(){
							setConfirmUnload(false);
						}
					});
		    	} else {
					//initiateDocSavePolling();
				}
			}, autoSaveFrequency);
		}
		
		
		function cancelDocsaveTimer() {
			$timeout.cancel(DocsaveTimer);
		}
		
		
		
		function removeObjectLock(cb) {
			if($scope.docLockId != null) {
				DocFactory.removeDocLock($scope.documentId,clientId).then(function(resp){
					if(resp.status == 200 && resp.data.Status) {
						$scope.docLockId = null;
						if(typeof cb == 'function') {
							cb(resp);
						}
					}
				});
			}
		}
		
		

		function clearAllPromises() {
			pendingRequests.cancel(docAnnotationPromise);
			pendingRequests.cancel(pdfAllannotationPromisePoll);
			pendingRequests.cancel(itemTagsPromise);
			pendingRequests.cancel(pdfAllannotationPromise);
			pendingRequests.cancel(getdocPromise);
			pendingRequests.cancel(docAllannotationPromise);
			
			cancelDocsaveTimer();
			
			/* removeObjectLock();
			
			if( $scope.doc && $scope.doc.commentMode) {
				DocFactory.clearDocument($scope.documentId).then(function(resp) {});
			}
			
			if($scope.documentId && CKEDITOR.instances[$scope.viewerId]) {
				try{
					CKEDITOR.instances[$scope.viewerId].destroy();
					delete CKEDITOR.instances[$scope.viewerId];
					$(linkInfoId).hide();
				} catch(e) {
					
				}
			}*/
		}
		
		function documentOnClose(docContent) {
			
			var postdata = {
					content : docContent,
					clientId : $scope.doc.clientId,
					lockId : $scope.docLockId
			};
			
			DocFactory.closeDocument($scope.documentId,postdata).then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					
				}
			})['finally'](function() {
				clearAllPromises();
			});
		}
		
		function removeDocViewModeData() {
			DocViewerService.docViewModeData = {};
		}
		
		function openOnEditMode() {
			var status = false;
			//Check for newly created document or user has edit lock on this document
			if((!_.isEmpty(DocViewerService.docViewModeData) 
					&& DocViewerService.docViewModeData.docId === $scope.doc.id && 
					DocViewerService.docViewModeData.viewMode === "Edit") 
					|| $scope.doc.editLockId) {
				status = true;
				DocViewerService.docViewModeData = {};
			}
			return status;
		}
		
		function onDestroy() {
			if($scope.currentStateName == "taskspace.list.task" && $rootScope.tipsWizardStarted) {
				$rootScope.showComments = angular.copy($scope.showComments);
				delete $rootScope.tipsWizardStarted;
			}
			var content = null;
			$timeout.cancel(tagHighlightTimeOut);
			$timeout.cancel(loadTimer);
			if(state.current.name !== "taskspace.list.task") {
				removeDocViewModeData();
			}
			setConfirmUnload(false);
			if(contentChanged && $scope.doc && $scope.doc.perms.edit) {
				
				content = getContentsTosave();
				
				if($scope.doc && $scope.doc.commentMode) {
					$scope.saveNotes({
						onDocSaveComplete : function() {
							clearAllPromises();
							DocFactory.clearDocument($scope.documentId).then(function(resp) {});
						}
					});
				}
				
				if($scope.isDocOnEditMode() && !$scope.doc.global) {
					documentOnClose(content);
				}
				
				return true;
	    	}
			
	    	if($scope.doc && !$scope.doc.global && !$scope.showPdf) {
				documentOnClose(content);
				DocFactory.clearDocument($scope.documentId).then(function(resp) {});
			} else {
				clearAllPromises();
			}
	    	$timeout.cancel(webResourceContentTimer);
		}
		
		$scope.$on("$destroy",function handleDestroyEvent() {
			onDestroy();
			$timeout.cancel(initTimer);
		});
		
		
		$scope.renameDocument = function(doc) {
			var postdata = {};
			postdata.id = doc.id;
			postdata.newDisplayName = doc.displayName;
			postdata.clientId = doc.clientId;
			
			DocFactory.renameDocument(postdata).then(function(response){
				if(response.status == '200') {
					
				}
			});
		};
		
		function getDefaultDownloadFolder(cb) {
			DocFactory.getDownloadFolder().then(function(response){
				if(response.status == '200' && response.data.Status) {
					if(typeof cb == "function") {
						cb(response.data.Folders);
					}
				}
			});
		}
		
		function saveSECfileToFolder(postdata) {
			SecFilingService.saveSECfileToFolder(postdata).then(function(resp){
				 if(resp.status == 200 && resp.data.Status && resp.data.Notes) {
					 handleDownloadGlobalDocCB(resp);
				 }
			});
		}
		
		$scope.SaveToDownloadFolder  = function() {
			if(state.current.name == "taskspace.list.task" && !_.isEmpty($stateParams.tsId) && !_.isEmpty($stateParams.tsc)){
				TaskSpaceService.getTaskSpaceById($stateParams.tsc,$stateParams.tsId).then(function(resp) {
					if(resp.status == 200 && resp.data.Status) {
						var taskspace = resp.data.Taskspace;
						if(taskspace && taskspace.owner === currentUserId && !_.isEmpty(taskspace.defaultFolderId)) {
							var postdata = {
					    		"docId":$scope.documentId,
					    		"folderId": taskspace.defaultFolderId
						    };
							saveSECfileToFolder(postdata);
						} else {
							getDefaultDownloadFolder(function(defaultDownloadFolder) {
								//$scope.SaveToDownloadsModal(defaultDownloadFolder);
								var postdata = {
							    		"docId":$scope.documentId,
							    		"folderId": defaultDownloadFolder.id
								    };
								saveSECfileToFolder(postdata);
							});
						}
					}
				});
			} else {
				getDefaultDownloadFolder(function(defaultDownloadFolder) {
					$scope.SaveToDownloadsModal(defaultDownloadFolder);
				});
			}
		};
		
		function globlaDocSaveConfirmation(text) {
			$confirm({text: text})
	        .then(function() {
	        	$scope.SaveToDownloadFolder();
		    });
		}
		
		
		
		$scope.deleteDocument = function(doc) {
			
			if ($scope.isGlobalDoc) {
				console.log("You can not Delete Global Document");
				return false;
			}
			
			$confirm({text: 'Are you sure you want to delete '+doc.name+'?'})
	        .then(function() {
	        	var postdata = {};
				postdata["userId"] = $scope.userinfo["UserId"];
				DocFactory.deleteDocument(doc.id,postdata).then(function(response){
					if(response.status == '200') {
						$state.go('docs',{'folderId': doc.folderId});
					}
				});
	        });
		};
		
		function isShared(doc) {
			return (doc.ownerId !== $scope.userinfo["UserId"]) ? true : false;
		}
		
		var closeDoc = function(doc) {
			var idx = _.findIndex($scope.docHierarchy,{"id": doc.id});
			if(idx > 0) {
				var parent = $scope.docHierarchy[idx-1];
				if(doc.deleted) {
					$state.go('trash',{'trashId': parent.id});
				} else {
					$state.go('docs',{'folderId': parent.id});
				}
			} else if(doc.global) {
				$state.go('docs',{'folderId': appdata.rootFolderId});
			}
		};
		
		$scope.closeDocument = function(doc) {
			if (doc) {
				closeDoc(doc);
			} else {
				$scope.$emit("closeDocMdl",true);
			}
		};
		
		$scope.compressDoc = function() {
			$scope.$emit("isolateDoc",false);
			$scope.$broadcast('resizeDoc', true);
		};
						
		var linkHolder = {
				elements : []
		};
		
		$scope.copySuccess = function() {
			APIUserMessages.info("Link copied to clipboard.");
		};
		
		$scope.copyFail = function() {
			
		};
		
		$scope.linkHighlight = function() {
			var txtHighlighter = rangy.createHighlighter($scope.iframedoc, "TextRange");
			
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
			
			rangy.getSelection($scope.iframedoc).removeAllRanges();
			$(toolBarId).css({"display":"none"});
		}
		
		$scope.textHighlight = function(type) {
			
			if ($scope.isGlobalDoc) {
				globlaDocSaveConfirmation("Documents in the Common Repository cannot be annotated or tagged. Choose the folder where a local copy of the document will be saved");
				return false;
			}
			
			var htmltext = rangy.getSelection($scope.iframedoc).toHtml();
			var cls = (type == "comment") ? "note cmt" : "note hlt";
			var txtHighlighter = rangy.createHighlighter($scope.iframedoc, "TextRange");
			
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
			rangy.getSelection($scope.iframedoc).removeAllRanges();
			$(toolBarId).css({"display":"none"});
			
			return htmltext;
			/*if (notify) {
				// Temp implementation for saving read only document
				$scope.doc.forceWrite = true;
				$scope.saveNotes();
				//$scope.instance.fire( 'change' );
			}*/
		};
		
		function setLinkDefautToBlank() {
			CKEDITOR.on('dialogDefinition', function(e) {
				
			    if (e.data.name === 'link') {
			    	var ddef = e.data.definition;
			        var target = ddef.getContents('target');
			        var options = target.get('linkTargetType').items;
			        for (var i = options.length-1; i >= 0; i--) {
			            var label = options[i][0];
			            if (!label.match(/new window/i)) {
			                options.splice(i, 1);
			            }
			        }
			        var targetField = target.get( 'linkTargetType' );
			        targetField['default'] = '_blank';
			        var onOk = ddef.onOk;
			        ddef.onOk = function() {
			        	angular.bind(ddef.dialog,onOk, null)();
			        	$scope.saveNotes({
							onDocSaveComplete : function(){
								ckEditorEvents($($scope.iframedoc.body));
							}
						}); 
			        }
			    }
			    
			   e.removeListener('dialogDefinition',false);
			});
		}
		
		$scope.attachLink = function() {
			if($scope.instance) {
				$scope.instance.focus();
			}
			if($scope.isDocOnEditMode()) {
				if($scope.doc && !$scope.doc.editable) {
					return false; 
				}
				
				setLinkDefautToBlank();
				
				if ($scope.isGlobalDoc) {
					selectionConfig.type = "attach-link";
					var msg = "Documents in the Common Repository cannot be annotated or tagged or linked. Choose the folder where a local copy of the document will be saved";
					globlaDocSaveConfirmation(msg);
					return false;
				}
				if($scope.instance) {
					$(toolBarId).hide();
					$scope.instance.execCommand('link');
				}
			}
		};
		
		
		function addLinkAttrToText(uid) {
			if($scope.instance) {
				$scope.instance.focus();
			}
			$scope.linkHighlight();
			var elements = linkHolder.elements;
			$.each(elements,function(i,el){
				if (i == 0 ) {
	 				$(el).addClass("first");
	 				$(el).prepend("&#8203;");
	 			}
	 			  
	 			$(el).attr("link-sourceId",uid);
	 			//$(el).attr("link-id",linkInfo.id);
	 			 
	 			if(i== elements.length-1) {
	 				$(el).addClass("last");
	 				insertLineBlock($(el));
	 			}
		 	});
			
			linkHolder = {
					elements : []
				};
			
		}
		
		$scope.createLink = function() {
			$(toolBarId).hide();
			if($scope.instance) {
				$scope.instance.focus();
			}
			if($scope.doc) {
				if ($scope.isGlobalDoc) {
					selectionConfig.type = "create-link";
					var msg = "Documents in the Common Repository cannot be annotated or tagged or linked. Choose the folder where a local copy of the document will be saved";
					globlaDocSaveConfirmation(msg);
					return false;
				} else if(!$scope.doc.isSharable) {
					return false; 
				}
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
					    		  return info = {
					    			"type" : $scope.doc._type,
					    			"obj" : $scope.doc,
					    			"uid" : uid,
					    			"context" : $scope.docContext,
					    			"linkBeforeCreate" : function(options) {
					    				addLinkAttrToText(uid);
										$scope.saveNotes(options);		
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
		
		$scope.showOpenInTaskspaceBtn = function() {
			return TaskSpaceService.showOpenInTaskspaceBtn;
		};
		
		$scope.openDocumentInTaskspace = function() {
			var currentTaskspace = TaskSpaceService.currentTaskspace;
			$state.go('taskspace.list.task',{'tsId' : currentTaskspace.id,'tsc' : currentTaskspace.clientId,'d' : $scope.doc.id,'dc' : $scope.doc.clientId});
			TaskSpaceService.showOpenInTaskspaceBtn = false;
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
		
		$scope.initPagenote = function() {
			$scope.pagenote.text = "";
			$scope.selectedAnnotTags['pagenote'] = [];
			$scope.pagenoteInitiated = true;
			var t = $timeout(function() {
				var docTypePagenoteEle;
				if(!$scope.showPdf) {
					docTypePagenoteEle = $("div#doc-viewer-pagenote-wrap");
				} else if($scope.showPdf) {
					docTypePagenoteEle = $("div#pdf-viewer-pagenote-wrap");
				}
				if(docTypePagenoteEle) {
					var pagenoteEle = $(docTypePagenoteEle).find("div#page-note-wrap");
					if(pagenoteEle && $(pagenoteEle[pagenoteEle.length-1]).find(".vdvc-txtA") && $(pagenoteEle[pagenoteEle.length-1]).find(".vdvc-txtA").length > 0){
						$(pagenoteEle[pagenoteEle.length-1]).find(".vdvc-txtA")[0].scrollIntoView(true);
						$(pagenoteEle[pagenoteEle.length-1]).find(".vdvc-txtA")[0].focus();
					}
				}
				$timeout.cancel(t);
			},500);
		}
		
		function addNewPageNote() {
			var postdata = {};
			postdata["docType"] = $scope.doc.docType;
			postdata["resourceType"] = "Document";
			postdata["resourceId"] = $scope.documentId;
			postdata["clientId"] = $scope.doc.clientId;
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
					$scope.$emit("UPDATE_ANNOTATED_DATE_ON_TS",{"documentId" : $scope.doc.id,"annotatedDate" : cmtresp.data.Annotations.createdOn });
					$scope.pagenoteInitiated = false;
					if(!$scope.showPdf) {
						$scope.docAnnotations.unshift(cmtresp.data.Annotations);
					} else if($scope.showPdf) {
						$scope.pdfAnnotations.unshift(cmtresp.data.Annotations);
					}
				}
			});
		}
		
		function getAnnotationUID(type,shareHighlight) {
			opencomment = ((type == 'comment') || shareHighlight ? true : false);
			$scope.showComments = $scope.showComments ? $scope.showComments : opencomment;
			
			commentHolderInit();
			
			AnnotationService.getUID().then(function(response){
				if (response.status == 200 && response.data.Status) {
					var htmltext = $scope.textHighlight(type);
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
					    "resourceId": $scope.documentId,
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
					
					var commentEl = $($scope.iframedoc.body).find( 'span[comment-id="'+response.data.UniqueId+'"]' );
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
					
					$($scope.iframedoc.body).find( 'span.note_slctd' ).removeClass("note_slctd");
					//commentEl.addClass("transient");
					var comments = angular.copy($scope.docAnnotations);
					commentHolderInit();
					$(toolBarId).css({"display":"none"});
					$scope.addTextComment(fakeAnnotation);
				}
			});
		}
		
		$scope.initComment = function(type,shareHighlight) {
			$($scope.iframedoc.body).focus();
			if ($scope.isGlobalDoc) {
				selectionConfig.type = type;
				globlaDocSaveConfirmation("Documents in the Common Repository cannot be annotated or tagged. Choose the folder where a local copy of the document will be saved");
				return false;
			}
			
			cancelDocsaveTimer();
			contentChanged = true;
			var t = $timeout(function() {
				setCkeToolBar();
				$timeout.cancel(t);
			},500);
			getAnnotationUID(type,shareHighlight);
		};
		
		
		$scope.cancelAddComment =  function($event,annot) {
			if($event) {
				$event.stopPropagation(); 
				delete $scope.docCommentReply[annot.id];
				delete $scope.selectedAnnotTags[annot.id];
				var $docWrap = $('div.doc-viewr[data-id="'+$scope.viewerId+'"]');
				$docWrap.find(".vdvc_comment_selected").removeClass('vdvc_comment_selected');
				if(annot.conversations.length == 0) {
					$scope.docAnnotations = _.without($scope.docAnnotations, _.findWhere($scope.docAnnotations, {"resourceName": annot.resourceName}));
					var element = $($scope.iframedoc.body).find('span.note[comment-id="'+annot.resourceName+'"]');
					$(element).next(".line-block").remove();
					$(element).contents().unwrap();
				}
			}
			commentHolderInit();
			clearMentionedUsers(annot.id);
		};
				
		$scope.shareComment = function() {
			if(!$scope.showPdf) {
				$scope.initComment('highlight',true);
			}
		};
		
		$scope.formatCreatedDate = function(dateValue) {
			//var date = moment(dateValue,moment.defaultFormat).toDate();
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
		var trustedPlainAnnotatedText = {};
		$scope.getPlainAnnotatedTxt = function(annotation) {
			if(!trustedPlainAnnotatedText[annotation.id]) {
				var annot = angular.copy(annotation);
				annot.linkEnabled = false;
				trustedPlainAnnotatedText[annotation.id] = AnnotationDigestService.getAnnotatedText(annot,{"annotationLink" : false});
			}
			return trustedPlainAnnotatedText[annotation.id];
		};
		
		function orderWebResourceComments(comments) {
			//var commentEls = $($scope.iframedoc.body).find( 'span.note.first[comment-id]');
			var LatestComments = [];
			if(comments) {
				for(var i=0; i< comments.length; i++) {
					var anotObj = comments[i];
					anotObj.Commentedtext = anotObj.text;
					anotObj.uid = "vdvc_comment_"+anotObj.resourceName;
					//anotObj.commentPosition = anotObj.textposition ? anotObj.textposition : Number.POSITIVE_INFINITY;
					LatestComments.push(anotObj);
				}
				LatestComments =  orderBy(LatestComments, "textposition", false);
				$scope.docAnnotations = LatestComments;
			}
		} 
		
		function orderNonWebResourceComments(comments) {
			var commentEls;
			$($scope.iframedoc.body).find( 'span[comment-id]').removeClass("note");
			/*
			if($scope.annotationContext == "taskspace") {
				var commentEls = $($scope.iframedoc.body).find( 'span.first[comment-id][context-id="'+$scope.tsId+'"]');
			} else {
				var commentEls = $($scope.iframedoc.body).find( 'span.first[comment-id]:not([context-type="taskspace"])');
			}*/
			
			var LatestComments = [];
			//var allPageNotes = [];
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
					} else if(anotObj.pagenote) {
						LatestComments.push(anotObj);
					} else {
						anotObj.isOrphan = true;
						orphanComments.push(anotObj);
					}
				});
				LatestComments.sort(DocFactory.sortAnnotationsByTextPosition);
				orphanComments = _.filter(comments,function(obj){ 
					return _.isUndefined(obj.isOrphan) || obj.isOrphan; 
				});
				
				$scope.docAnnotations = LatestComments;
				$scope.docOrphanAnnotations = orphanComments;
				//$scope.pageNotes = allPageNotes;
			}
			
			/*if (commentEls.length > 0) {
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
						var commentEl = $($scope.iframedoc.body).find( 'span[comment-id="'+anotObj.resourceName+'"]').addClass("note");
						
						
						anotObj.Commentedtext = anotObj.text;
						
						anotObj.uid = "vdvc_comment_"+anotObj.resourceName;
						anotObj.commentPosition = i;
						
						LatestComments.push(anotObj);
					} else {
						var orphanEls = $($scope.iframedoc.body).find( 'span.note[comment-id="'+cmtId+'"]');
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
		
		function orderComments(comments,uid) {
			_.each(comments,function(comment,i){
				processSelectedConvTags(comment);
			});
			if($scope.doc && $scope.doc.webResource) {
				orderWebResourceComments(comments);
			} else {
				orderNonWebResourceComments(comments);
			}
			if(opencomment) {
				goToComment(uid);
			}
			if(_.isArray(comments)) {
				var annotCount = comments.length;
				notifyAnnotationCount(annotCount);
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
						var $docWrap = $('div.doc-viewr[data-id="'+$scope.viewerId+'"]');
						if($docWrap.length > 0) {
							$scope.onClickComment(null,null,$docWrap.find('.vdvc_comment_'+anotObj.resourceName),top);
						}
						$timeout.cancel(tim);
					 }, 100);
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
		
		function getAnnotationContextUrl(annotation) {
			var url;
			if($scope.doc && $scope.doc.webResource) {
				url = fileBaseUrl+"webannotation?target="+encodeURIComponent($scope.doc.sourceUrl)+"&annotationId="+annotation.id+"&cid="+$scope.doc.clientId;
	    		if(!_.isEmpty($stateParams.tsId)) {
	    			url = url+"&tsId="+$stateParams.tsId;
	    		} 
			}
			
			return url;
		}
		
		$scope.openCommentIncontext =  function($event,annotation) {
			
			if ($event) {
			    $event.stopPropagation(); 
			}
			
			var url = getAnnotationContextUrl(annotation);
			if(url) {
				$window.open(url,$scope.documentId);
			}
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
						var scrollingElement = commonService.getScrollingElement($scope.iframedoc);
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
					/*element.addClass("vdvc_comment_selected");
					element.addClass("vdvc_comment_selected");
					element.find("textarea").focus();
					element[0].scrollIntoView(true);
					$docWrap.find(".comment-wrap")[0].scrollTop -= 10;*/
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
				
		$scope.onOutClickComment = function() {
			//adjustPositions($(".vdvc_comment_selected"));
		  // $(".vdvc_comment_selected").removeClass('vdvc_comment_selected');
		};
		
		
		
		var docAnnotationPromise;
		$scope.getAnnotationsById = function(commentId,sort) {
			pendingRequests.cancel(docAnnotationPromise);
			var postdata = {};
			postdata["resourceType"] = "document";
			postdata["resourceId"] = $scope.documentId;
			postdata["clientId"] = clientId;
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
							/*$scope.selectedAnnotations = [];
							$scope.hasSelectedAnnotations = true;
							$scope.selectedAnnotations.push(annot);*/
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
					
					
				/*	_.each(annotations,function(annot,index){
						_.every($scope.docAnnotations, function(obj,ind) {
							if(obj.resourceName == annot.resourceName) {
								annot.Commentedtext = obj.Commentedtext;
								annot.top = obj.top;
								annot.focused = obj.focused;
								annot.uid = obj.uid;
								
								$scope.docAnnotations[ind]= annot;
								return false;
							} else {
								return true;
							}			
						});
					});*/
				}
			});
		};
		
		function addNewComment(comment,annotation) {
			var postdata = {};
			var commentId = annotation.resourceName;
			postdata["docType"] = $scope.doc.docType;
			postdata["resourceType"] = "document";
			postdata["resourceId"] = $scope.documentId;
			postdata["cellKey"] = commentId;
			postdata["clientId"] = $scope.doc.clientId;
			postdata["note"] =comment;
			postdata["contextType"] = annotation.contextType;
			postdata["context"] = annotation.context;
			postdata["formatedText"] = AnnotationService.turndownHtml(annotation.CommentedtextAsHtml);
			postdata["annotatedText"] = annotation.Commentedtext;
			
			postdata["annotationContext"] = annotation.annotationContext;
			postdata["taskspaceId"] = annotation.taskspaceId;
			postdata["tsClientId"] =  annotation.tsClientId;
						
			if(!_.isEmpty(annotation.tags)) {
				postdata["tags"] = annotation.tags;
			}
			
			if($scope.docLockId != null) {
				postdata.lockId = $scope.docLockId;
			}
			
			$scope.saveNotes({
				onDocSaveSuccess : function() {
					AnnotationService.save(postdata).then(function(cmtresp){
						if(cmtresp.status == 200 && cmtresp.data.Status) {
							if(cmtresp.data.LockStatus == false) {
								MessageService.showErrorMessage("DOC_SAVE_LOCK_ERROR", [$scope.doc.name]);
							} else if(cmtresp.data.LockStatus == undefined) {
								$scope.$emit("UPDATE_ANNOTATED_DATE_ON_TS",{"documentId" : $scope.doc.id,"annotatedDate" : cmtresp.data.Annotations.createdOn });
								commentHolderInit();
								$scope.getAnnotationsById(commentId,true);
								$scope.doc.forceWrite = true;
								$($scope.iframedoc.body).find( 'span.note[comment-id="'+commentId+'"]' ).removeClass("transient");
								//$("div[data-convid='5f32b2c1ae31902ec4346293']").find(".fa-pencil").trigger("click");
								var timer = $timeout(function() {
									var newAnnot = cmtresp.data.Annotations;
									var rootComment = _.findWhere(newAnnot.conversations,{"rootComment" : true});
									if(rootComment) {
										$("div[data-convid='"+rootComment.id+"']").find(".fa-pencil").trigger("click");
										if($("div[data-convid='"+rootComment.id+"']").find(".vdvc-txtA") && $("div[data-convid='"+rootComment.id+"']").find(".vdvc-txtA").length > 0){
											$("div[data-convid='"+rootComment.id+"']").find(".vdvc-txtA")[0].scrollIntoView(true);
											$("div[data-convid='"+rootComment.id+"']").find(".vdvc-txtA")[0].focus();
										}
										if(annotation.share && $scope.isDocSharable($scope.doc)) {
											$scope.getDocAnnotationLink($scope.doc,newAnnot);
										}
									}
						        	$timeout.cancel(timer);
						        }, 1000);
								
							}
						}
					});
				},
				onDocSaveFail : function() {
					$($scope.iframedoc.body).find( 'span.note[comment-id="'+commentId+'"]' ).contents().unwrap();
					contentChanged = false;
				}
			});
		}
		
		function saveReplyToComment(comment,newCommentTags,annotation,cb) {
			var postdata = {"note":comment,"clientId": clientId};
			postdata["contextType"] = annotation.contextType;
			postdata["context"] = annotation.context;
			postdata["tags"] = newCommentTags;
			
			if($scope.enableAtMention && !_.isEmpty($scope.mentionUser[annotation.id])) {
				postdata['mentions'] = $scope.mentionUser[annotation.id].join(",");
			}
			
			AnnotationService.replyToComment(postdata,annotation.id).then(function(response){
				if(response.status == 200 && response.data.Status) {
					if(response.data.LockStatus == false) {
						MessageService.showErrorMessage("DOC_SAVE_LOCK_ERROR", [$scope.doc.name]);
					} else if(response.data.LockStatus == undefined) {
						$scope.$emit("UPDATE_ANNOTATED_DATE_ON_TS",{"documentId" : $scope.doc.id,"annotatedDate" : response.data.Annotations.updatedOn });
						commentHolderInit();
						delete $scope.docCommentReply[annotation.id];
						clearMentionedUsers(annotation.id);
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
		
		function PromptActionItemsError(errorMessage,postdata,editcommentForm) {
			var modalInstance = $uibModal.open({
				 animation: true,
			     templateUrl: 'app/components/ActionItems/ActionItemsError/ActionItemsErrorModal.html',
			     controller: 'ActionItemsErrorController',
			     appendTo : $('.rootContainer'),
			     controllerAs: 'aiec',
			     size: "md",
			     backdrop: 'static',
			     resolve: {
			    	 ActionItemsError : function() {
			    		 return {
			    				 "message" : errorMessage
			    		 }
			    	 }
			     }
			 });
			 modalInstance.result.then(function (ActionItemsErrorResp) {
				 if(ActionItemsErrorResp) {
					 postdata["checkAsana"] = false;
					 createActionItem(postdata,editcommentForm);
				 }
			 });
		}
		
		function createActionItem(postdata,editcommentForm) {
			ActionItemsService.createActionItem(postdata).then(function(resp) {
				 if(resp.status == 200 && resp.data.Status) {
					 if(resp.data.AsanaError) {
						 PromptActionItemsError(resp.data.Message,postdata,editcommentForm);
					 } else {
						 if(editcommentForm && editcommentForm.$visible){
							 //editcommentForm.$visible = false;
							 editcommentForm.$cancel();
						 }
						 MessageService.showSuccessMessage("ASSIGN_ACTION_ITEMS");
					 }
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
				    		 if(state.current.name == "taskspace.list.task") {
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
						 if(!$scope.showPdf) {
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
										 clearMentionedUsers(annotation.id);
									 }
								 });
							 }
						 } else if($scope.showPdf) {
							 if(!$scope.doc.perms.readonly && editcommentForm && editcommentForm.$visible){
								 try{
									 if(!_.isEmpty(editcommentForm.$editables[0].scope.$data)) {
										 $scope.updatePdfComment(editcommentForm.$editables[0].scope.$data,conv,annotation,function(Status){
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
								 addPdfConversation(annotation,newComment,newCommentTags,function(newConv){
									 if(newConv) {
										 assignActionItemsResp["objId"] = newConv.id;
										 createActionItem(assignActionItemsResp);
										 clearMentionedUsers(annotation.id);
									 }
								 });
							 }
						 }
						 
					 } else {
						 MessageService.showSuccessMessage("ASSIGN_ACTION_ITEMS");
					 }
				 }, function () {
				      
				 });
			}
		};
		
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
			} else if(_.isEmpty(annotation.id)) {
				addNewComment(newComment,annotation);
			}
		};
		
		$scope.isAddCmtDisabled = function(id) {
			var status = true;
			if(!_.isEmpty($scope.docCommentReply[id]) && !$scope.doc.perms.readonly) {
				status = false;
			}
			return status;
		};
		
		$scope.isUpdateConvDisabled = function(editcommentForm,conv) {
			var status = false;
			if(conv){
				if(editcommentForm.$waiting || 
						((!conv.rootComment) && !$scope.doc.perms.readonly && editcommentForm && editcommentForm.$visible)){
					try{
						if(_.isEmpty(editcommentForm.$editables[0].scope.$data)) {
							status = true;
						}
					}catch(e) {
						
					}
				}
			}
			return status;
		};
		
		$scope.isPagenoteConvDisabled = function() {
			var status = true;
			if(!_.isEmpty($scope.pagenote.text)) {
				status = false;
			}
			return status;
		};
		
		function isDocEditable() {
			var status = false;
			if($scope.doc.editable && $scope.doc.perms.edit && !$scope.doc.deleted) {
				status = true;
			} 
			return status;
		}
		
		$scope.canEditdocAnnotation = function(conv) {
			var status = false;
			if(conv) {
				var user = conv.userId ? conv.userId : conv.createdBy;
				var loginUser = _.isString(appdata.UserId) ? appdata.UserId.trim() : "";
				var commentOwner = _.isString(user)  ? user.trim() : "";
				
				var areEqual = loginUser.toUpperCase() === commentOwner.toUpperCase();
				if((areEqual || $scope.doc.isOwner)) {
					status =  true;
				}
			}
			return status;
		};
				
		
		$scope.canEditPdfAnnotation = function(conv) {
			var status = false;
			if(conv) {
				var user = conv.userId;
				var loginUser = _.isString(appdata.UserName) ? appdata.UserName.trim() : "";
				if(user && user.indexOf('@') > -1) {
					loginUser = _.isString(appdata.UserId) ? appdata.UserId.trim() : "";
				}
				var commentOwner = _.isString(user)  ? user.trim() : "";
				
				var areEqual = loginUser.toUpperCase() === commentOwner.toUpperCase();
				if(areEqual || $scope.doc.isOwner) {
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
		
		$scope.annotationLinkInfo = {};
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
	    
	    $scope.isTSContext = function() {
	    	if(state.current.name == "taskspace.list.task") {
	    		return true;
	    	}
	    	return false;
	    };
	    
	    $scope.showPostAnnotDigestToSlack = function() {
	    	var status = false;
	    	if(state.current.name == "taskspace.list.task") {
	    		if(!_.isEmpty(TaskSpaceService.currentTaskspace)) {
	    			var isTsSharable = TaskSpaceService.isTsSharable(TaskSpaceService.currentTaskspace,currentUserId);
					if(isTsSharable && (TaskSpaceService.currentTaskspace.slackChannelType == 'C' || TaskSpaceService.currentTaskspace.slackChannelType == 'G') && !TaskSpaceService.currentTaskspace.slackAutoPostAnns) {
						status = true;
					}
	    		}
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
				
	    $scope.isDocSharable = function(doc) {
	    	var status = false;
	    	if(state.current.name == "taskspace.list.task") {
	    		if(!_.isEmpty(TaskSpaceService.currentTaskspace)) {
	    			var isTsSharable = TaskSpaceService.isTsSharable(TaskSpaceService.currentTaskspace,currentUserId);
					if(isTsSharable) {
						status = true;
					}
	    		}
	    	} else if(doc && doc.isSharable) {
	    		status = true;
	    	}
	    	return status;
	    }
	    
		$scope.getDocAnnotationLink = function(doc,annotation) {
			
			hideAllAnnotLinkPopup();
			if($scope.isDocSharable(doc)) {
				if(state.current.name == "taskspace.list.task" && $stateParams.tsId &&  $stateParams.tsc) {
					$scope.$emit("shareDocuAnnotation",{"doc" : doc, "annotation" : annotation });
	    		} else {
	    			$scope.annotationLinkInfo = {};
		    		var getLinkTimer = $timeout(function() {
			    		var postdata = {
			    				objectType : "DocAnnotation",
			    				linkObjectId : doc.id,
			    				linkType : 'Protected',
			    				clientId : doc.clientId,
			    				annotationId : annotation.id
			    		};
			    		if(state.current.name == "taskspace.list.task") {
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
			    		
			    		if(!$scope.showPdf) {
			    			postdata["linkUniqueId"] = annotation.resourceName;
			    		}
			    		if($scope.showPdf) {
			    			postdata["pageNumber"] = annotation.pageNum;
			    			postdata["coordinates"] = annotation.coordinates;
			    		}
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
		
		function deleteAnnotationOnCofirm(annotation,postdata) {
			var annots = $scope.docAnnotations;
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
    		}).finally(function() {
    			if(_.isArray(annots)) {
					var annotCount = annots.length;
					notifyAnnotationCount(annotCount);
				}
			});
		}
		
		$scope.deleteAnnotation = function(annotation,event) {
			if(event) {
				 event.stopPropagation();
			}
			
			$confirm({text: 'Do you want delete "ALL Conversations"'})
	        .then(function() {
	        	
	        	var postdata = {
						"annotationId" : annotation.id,
					    "clientId" : clientId
				};
	        	if(annotation.pagenote) {
	        		deleteAnnotationOnCofirm(annotation,postdata);
	        	} else {
	        		$scope.doc.forceWrite = true;
	        		var nodes;
	        		if($scope.iframedoc.body) {
	        			nodes = $($scope.iframedoc.body).find('span.note[comment-id='+annotation.resourceName+']').contents();
	        			nodes.unwrap();
					}
	        		$scope.saveNotes({
	        			onDocSaveSuccess : function() {
	        				deleteAnnotationOnCofirm(annotation,postdata);
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
	        	}
	        });
		};
		
		$scope.deleteComment = function(commentId,annotation,event) {
			if(event) {
				 event.stopPropagation();
			}
			
			$confirm({text: "Do you want delete conversation"})
	        .then(function() {
	        	var annots = $scope.docAnnotations;
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
			
			/*$('.comment-conv-wrap').off('click').on('click',function(event){
				event.stopPropagation();
			});*/
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
			editcommentForm.$cancel();
		};
		
		$scope.cancelAddPageNote = function($event) {
			if($event) {
				$event.stopPropagation();
			}
			$scope.selectedAnnotTags['pagenote'] = [];
			$scope.pagenoteInitiated = false;
		};
		
		$scope.updateComment = function(newcomment,conv,annotation,cb) {
			/*if(!_.isEmpty(newcomment)) {
			
			}*/
			
			var postdata = {
					"annotationId" : annotation.id,
					"commentId" : conv.id,
					"comment" : newcomment,
					"clientId" : clientId
			};
			
			if($scope.enableAtMention && !_.isEmpty($scope.mentionUser[annotation.id])) {
				postdata['mentions'] = $scope.mentionUser[annotation.id].join(",");
			}
			
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
					clearMentionedUsers(annotation.id);
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
		
		function renderPdfCommentVQ(annotation) {
			try{
				if($scope.pdfViewer) {
					$scope.pdfViewer.checkAndUpdateAnnotVQ(annotation);
				}
			} finally {
				
			}
		} 
		
		$scope.updatePdfComment = function(newcomment,conv,annotation,cb) {
			/*if(!_.isEmpty(newcomment)) {
				
			}*/
			var postdata = {
					"annotationId" : annotation.id,
					"commentId" : conv.id,
					"comment" : newcomment,
					"pageNumber" : annotation.pageNum,
		        	"documentId" : $scope.documentId,
		        	"clientId" : clientId

			};
			
			if($scope.enableAtMention && !_.isEmpty($scope.mentionUser[annotation.id])) {
				postdata['mentions'] = $scope.mentionUser[annotation.id].join(",");
			}
			
			var selectedTags = $scope.selectedAnnotTags[conv.id];
			if(_.isArray(selectedTags)) {
				selectedTags = _.without(selectedTags, _.findWhere(selectedTags, {"TagName" : ""}));
				postdata["tags"] = selectedTags;
			}
			return AnnotationService.editPdfComment(postdata).then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					if(typeof cb === "function") {
						cb(resp.data.Status);
					}
					if(_.isArray(selectedTags)) {
						conv["tagsInfo"] = selectedTags;
					}
					renderPdfCommentVQ(annotation);
					clearMentionedUsers(annotation.id);
					return true;
				}else {
					return resp.data.Message;
				}
			});
		};

		$scope.deletePdfAnnotation = function(annotation,$event) {
			if($event) {
				$event.stopPropagation();
			}
			$confirm({text: 'Do you want delete "ALL Conversations" '})
	        .then(function() {
	        	var postdata = {
						"annotationId" : annotation.id,
					    "pageNumber" : annotation.pageNum,
		        		"documentId" : $scope.documentId,
		        		"clientId" : clientId,
		        		"webAnnotation" : annotation.webAnnotation
				};
	        	AnnotationService.deletePdfAnnotation(postdata).then(function(resp){
	        		if(resp.status == 200 && resp.data.Status) {
	        			var annots = $scope.pdfAnnotations;
						for(var i = 0; i < annots.length; i++) {
							if(annots[i].id == annotation.id) {
								annots.splice(i, 1);
								break;
							}
						}
						$('div[annot-id="'+annotation.id+'"]').remove();
						MessageService.showSuccessMessage("COMMENT_DELETE");
					}
				}).finally(function() {
					if(_.isArray($scope.pdfAnnotations)) {
						var annotCount = $scope.pdfAnnotations.length;
						notifyAnnotationCount(annotCount);
					}
	    		});
	        });
		}
		
		$scope.deletePdfComment = function(conv,annotation,$event) {
			if($event) {
				$event.stopPropagation();
			}
			$confirm({text: "Do you want delete this conversation"})
	        .then(function() {
	        	var postdata = {
						"annotationId" : annotation.id,
					    "commentId" : conv.id,
					    "pageNumber" : annotation.pageNum,
		        		"documentId" : $scope.documentId,
		        		"clientId" : clientId,
		        		"webAnnotation" : annotation.webAnnotation
				};
	        	
	        	AnnotationService.deletePdfComment(postdata).then(function(resp){
					if(resp.status == 200 && resp.data.Status) {
						var annots = $scope.pdfAnnotations;
						for(var i = 0; i < annots.length; i++) {
							if(annots[i].id == annotation.id) {
								var convs = annots[i].conversations;
								if(convs) {
									for(var j=0;j<convs.length;j++) {
										if(convs[j].id == conv.id) {
											convs.splice(j, 1);
											break;
										}
									}
									break;
								}
							}
						}
						renderPdfCommentVQ(annotation);
						MessageService.showSuccessMessage("COMMENT_DELETE");
					}
				});
	        });
		};
		
		$scope.deletePdfLink = function(link) {
			if(link) {
				deleteDeepLink(link,function(){
					$('[data-id="'+$scope.viewerId+'"]').find("pdf-link-info").hide();
					$('[data-id="'+$scope.viewerId+'"]').find('div.pdf-vdvc-link[link-sourceid="'+link.linkUniqueId+'"]').remove();
					link = null;
					MessageService.showSuccessMessage("DEEPLINK_DELETE");
				});
			}
		};
		
		function  showClickableLink(anchor) {
			var newLink;
			var lh = $(anchor).parent().find('span.linkHandler');
			if(!lh.is(':visible') && typeof $(anchor).attr('href') != 'undefined' && 
			   !$(anchor).hasClass('linkToFire')) {
				
				var href = $(anchor).attr('href');
				
				var vW = $(ckeId).outerWidth();
				var lft = $(anchor).position().left;
				
				
				var wrapStyle = {
						'background': "#fff",
						'padding' : '15px',
						'box-shadow' :'0px 0px 5px 1px #999',
						'display' : 'block',
						'max-width' : '500px',
						'position':'absolute',
						'left' : '0',
						'top' : ($(anchor).position().top+$(anchor).height()+10)+'px',
						'overflow' : 'hidden',
						'text-overflow':'ellipsis',
						'white-space': 'nowrap'
				  };
				
				if(lh.length > 0) {
					var w = lh.outerWidth();
					if((lft+w) > vW) {
						lft -= (w+lft+10)-vW;
					}
					
					wrapStyle.left = lft;
					
					$(lh).show();
					newLink = $(lh).find('a');
					newLink.attr("href",href)
						 .html(href);
					$(lh).css(wrapStyle).attr('contenteditable',false);
						 
				} else {
					var dummyWrap = $('<span>');
					var linkWrap = $('<span>');
					newLink = $('<a>');
					newLink.attr("href",href)
						   .attr('target','_blank')
						   .html(href);
					newLink.addClass("linkToFire");
					linkWrap.css(wrapStyle).attr('contenteditable',false);
					linkWrap.append(newLink);
					linkWrap.addClass("linkHandler");
					
					dummyWrap.css({
						'height' : "0px",
						'overflow' : "visible",
						'display' : 'block'
					});
					
					linkWrap.css(wrapStyle).attr('contenteditable',false);
					dummyWrap.append(linkWrap);
					$(anchor).parent().append(dummyWrap);
					
					var w = linkWrap.outerWidth();
					
					if((lft+w) > vW) {
						lft -= (w+lft+10)-vW;
					}
					linkWrap.css('left',lft);
				}
			}
			
			if(newLink && newLink.length > 0) {
				$(newLink).off('click').on('click',function(event) {
					event.stopPropagation();
				});
			}
		}
		
		function setlinkCardPos(dl,elem) {
			var elemLeft = elem.position().left;
			var editorWidth = $(ckeId).outerWidth()-10;
			var dw = dl.outerWidth();
			var dLeft = dl.position().left;
			if(((dLeft+dw) > editorWidth) || ((elemLeft+dw) > editorWidth)) {
				dl.css("right","0%");
			} else {
				dl.css("left","0%");
			}
			dl.show();
		}
		
		function linkMrkUpWithMetaInfo() {
			
			var tooltip = '<span class="row">'+$scope.linkInfo.linkType+'</span>\
			<span class="row">\
				<span class="ellipsis" data-uib-tooltip="'+$scope.linkInfo.text+'" >\
					<a class="deep-link" href="'+$scope.linkInfo.url+'" target="'+$scope.linkInfo.target+'">\
				      '+$scope.linkInfo.text+'\
				    </a>\
				</span>\
			</span>';
			
			if($scope.linkInfo && $scope.linkInfo.metaInfo) {
				var info = $scope.linkInfo.metaInfo;
				if(info.title){
					tooltip +='<span class="row">\
						<span class="ellipsis" data-uib-tooltip="'+info.title+'" >\
							<a class="deep-link" href="'+$scope.linkInfo.url+'" target="'+$scope.linkInfo.target+'" >\
						      '+info.title+'\
						    </a>\
						</span>\
						</span>';
				}
				
				if(info.description){
					tooltip +='<span class="row">\
						<span class="ellipsis" data-uib-tooltip="'+info.description+'" >'+info.description+'</span>\
						</span>';
				}
				
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
					
					tooltip +='<span class="row">\
						<span>\
								<img src="'+info.imageUrl+'"  height="'+ih+'" width="'+iw+'">\
						</span>\
					</span>';
				}
			}
			
			return tooltip;
		}
		
		function insertLinkCardView(elem,$tooltip) {
    		$(elem).append($tooltip);
    		setlinkCardPos($tooltip,$(elem));
    		$(elem).find('.action-bar').off('click').on('click',function(event) {
    			event.stopPropagation();
    			event.preventDefault();
    			$tooltip.remove();
    			$(elem).contents().unwrap();
    			$scope.saveNotes();
    		});
		}
		
		$scope.Unlink = function() {
			if($scope.isDocOnEditMode() && $scope.linkCrdInfo && $scope.linkCrdInfo.target) {
				$(linkInfoId).hide();
				$($scope.linkCrdInfo.target).contents().unwrap();
				$scope.saveNotes();
			}
		};
		
		function ckEditorEvents(body){
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
			
			//body.find("a").not("a[href*=\\#]").off("mouseenter").on("mouseenter",function(event){
			body.find("a").off("mouseenter").on("mouseenter",function(event){
				
				if((typeof event.currentTarget.href != 'undefined' && this.getAttribute("href").charAt(0) == "#") || ($scope.doc.webResource && !_.isEmpty($scope.doc.Link))) {
					return false;
				}
				
				if(typeof event.currentTarget.href != 'undefined' && event.ctrlKey == true) {			
					$(this).css("cursor","pointer");
				}else{
					$(this).css("cursor","auto");
				}
				
				/*$(linkInfoId).hide();
				$('[data-id="'+$scope.viewerId+'"]').find('.link-info').css({"display":"none"});
				
				$scope.linkCrdInfo = {
						showLoader : true
				};
				
				if((typeof event.currentTarget.href != 'undefined') && event.ctrlKey == false) {
					var elem = event.currentTarget;
					handleLinkMouseEnter(elem);
					
				}else{
					$scope.linkCrdInfo = {};
				}*/
			});
		}
		
		function handleLinkMouseEnter(elem) {
			var targetRect = elem.getBoundingClientRect();
			var urlObj = urlParser.parseUrl(elem.href);
			
			rePositionPopOverCard(targetRect,$(linkInfoId),0);
			
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
				    	rePositionPopOverCard(targetRect,$(linkInfoId),1000);
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
			    	rePositionPopOverCard(targetRect,$(linkInfoId),1000);
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
				var frame = $(ckeId).find("iframe");
				var frameWidth = frame.innerWidth();
				var frameHeight = frame.outerHeight();
				var framePos = frame.offset();
				//var targetRect =target.getBoundingClientRect();
				
				var link = popElement; //$(linkInfoId);
				var linkWidth = link.outerWidth();
				var linkHeight = link.outerHeight();
				if(linkWidth > frameWidth) {
					link.css({"width":frameWidth+"px"});
				}
				
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
			if ($scope.doc && ($scope.doc.docType == "VidiViciNotes" || $scope.doc.docType == "Notes") && $scope.docLockId != null) {
				status = true;
			}
			return status;
		};
		
		function showCommentOnCkeClick(body,elem) {
			$(body.$).find('span.note_slctd').removeClass("note_slctd");
			   var comment_id = $(elem).attr("comment-id");
			   $scope.showComments = true;
			   
			   elem.scrollIntoView();
			   //body.$.scrollTop -= ($(ckeId).find('.cke_top').outerHeight()+55);
			   
			   $(body.$).find('span[comment-id="'+comment_id+'"]').addClass("note_slctd");
			   goToComment(comment_id,null,elem.offsetTop);
			 //  $scope.$emit("isolateDoc",true);
		}
		
		function showDeepLinkToOnCkeClick(win,elem,event) {
			var H = $('[data-id="'+$scope.viewerId+'"]').find('.link-info').outerHeight();
		    var W = $('[data-id="'+$scope.viewerId+'"]').find('.link-info').outerWidth();
    		var vH = $(win.$).innerHeight(); 
    		var vW = $(win.$).outerWidth(); 
    		var x = event.data.$.clientX; 
			var y = event.data.$.clientY-$('[data-id="'+$scope.viewerId+'"]').find('.link-info').height();
			var navBar = $('[data-id="'+$scope.viewerId+'"] .vdvc-nav-bar');
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
		    		$('[data-id="'+$scope.viewerId+'"]').find('.link-info').css({"display":"block","top":y+"px","left":x+"px" });
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
		
		function processWebResourceLinkInfo(doc) {
			var LinkInfo = doc.Link;
			var metaInfo = LinkInfo.metaInfo;
			var citations = LinkInfo.citations;
			$scope.webResourceLinkInfo = LinkInfo.info;
    		$scope.webResourceLinkInfo.metaInfo = metaInfo;
    		$scope.webResourceLinkInfo.citations = citations;
    		$scope.webResourceLinkInfo.url = LinkInfo.url;
    		$scope.webResourceLinkInfo.target = "_blank";
    		if(metaInfo && _.isEmpty(metaInfo.title)) {
    			LinkInfo.metaInfo.title = doc.displayName;
    		}
			
			if(doc.docSource && doc.docSource == "fromGoogleScholar" && metaInfo) {
				$scope.webResourceLinkInfo.isGSResource = true;
				$scope.webResourceLinkInfo.url = metaInfo["GS_url"];
				$scope.webResourceLinkInfo.metaInfo.title = metaInfo["GS_title"];
				$scope.webResourceLinkInfo.metaInfo.description = metaInfo["GS_description"];
			}
			
		}
		
		var webResourceContentTimer;
		
		function location(annotation) {
			  if (annotation) {
			    var targets = annotation.webAnnotationTarget || [];
			    for (var i = 0; i < targets.length; i++) {
			      var selectors = targets[i].selector || [];
			      for (var k = 0; k < selectors.length; k++) {
			        if (selectors[k].type === 'TextPositionSelector') {
			          return selectors[k].start;
			        }
			      }
			    }
			  }
			  return Number.POSITIVE_INFINITY;
		}
		
		function createWebResourceContent () {
			
			if(_.isArray($scope.docAnnotations)) {
				$scope.docAnnotations = $scope.docAnnotations.sort(function(a,b) {
					if(_.isArray(a.coordinates) && _.isArray(b.coordinates)) {
						let rect1 = a.coordinates;
						let rect2 = b.coordinates;
						try {
							if (rect1[1] == rect2[1]) {
								return rect1[0] - rect2[0];
							}
							return rect1[1] - rect2[1]; 
						} catch(e) {
							return location(a) < location(b);
						} 
					} 
				  return location(a) < location(b);
				});
			}
			
			$timeout.cancel(webResourceContentTimer);
			webResourceContentTimer = $timeout(function() {
				var content = "";
				var template = angular.element('<web-resource-link-info></web-resource-link-info>');
				
				
				var linkFunction = $compile(template);
				var result = linkFunction($scope);
				$scope.$digest();
				content = '<!DOCTYPE html><html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head><body>'+template.html()+'</body></html>';
				
				if(CKEDITOR.instances[$scope.viewerId]) {
					CKEDITOR.instances[$scope.viewerId].setData(content,function() {
						var obj = {
								 "objectId":$scope.doc.id,
								 "type":$scope.doc._type,
								 "docType" : $scope.doc.docType
						};
						$scope.$emit("objectLoaded",obj);
						contentChanged = false;
						setConfirmUnload(false);
					});
				}	
					
			}, 0);
		}
		
		function CreateNotes(editorId){
			$scope.showDoc = true;
			getDocLockDuration(editorId,function (editorId) {
				var content = $scope.doc ? $scope.doc.content : "";
				
				$scope.content = updateEmptyAnchorTags(content);
				var plugins = "";
				if (isDocEditable()) {
					CKEDITOR.plugins.addExternal( 'save', '/resources/js/ckeditor/plugins/save/', 'plugin.js' );
					CKEDITOR.plugins.addExternal( 'lineheight', '/resources/js/ckeditor/plugins/lineheight/', 'plugin.js' );
					CKEDITOR.plugins.addExternal( 'fakeobjects', '/resources/js/ckeditor/plugins/fakeobjects/', 'plugin.js' );
					CKEDITOR.plugins.addExternal( 'pagebreak', '/resources/js/ckeditor/plugins/pagebreak/', 'plugin.js' );
					CKEDITOR.plugins.addExternal( 'bootstrapVisibility', '/resources/js/ckeditor/plugins/bootstrapVisibility/', 'plugin.js' );
					//CKEDITOR.plugins.addExternal( 'imagepaste', '/resources/js/ckeditor/plugins/imagepaste/', 'plugin.js' );
					//CKEDITOR.plugins.addExternal( 'dialog', '/resources/js/ckeditor/plugins/dialog/', 'plugin.js' );
					CKEDITOR.plugins.addExternal( 'clipboard', '/resources/js/ckeditor/plugins/clipboard/', 'plugin.js' );
					CKEDITOR.plugins.addExternal( 'lineutils', '/resources/js/ckeditor/plugins/lineutils/', 'plugin.js' );
					CKEDITOR.plugins.addExternal( 'widget', '/resources/js/ckeditor/plugins/widget/', 'plugin.js' );
					//CKEDITOR.plugins.addExternal( 'image2', '/resources/js/ckeditor/plugins/image2/', 'plugin.js' );
					CKEDITOR.plugins.addExternal( 'image2', '/resources/js/ckeditor/plugins/insertimage/', 'plugin.js' );
					CKEDITOR.plugins.addExternal( 'vdvcImagePaste', '/resources/js/ckeditor/plugins/vdvcImagePaste/', 'plugin.js' );
					CKEDITOR.plugins.addExternal( 'notification', '/resources/js/ckeditor/plugins/notification/', 'plugin.js' );
					CKEDITOR.plugins.addExternal( 'notificationaggregator', '/resources/js/ckeditor/plugins/notificationaggregator/', 'plugin.js' );
					CKEDITOR.plugins.addExternal( 'uploadimage', '/resources/js/ckeditor/plugins/uploadimage/', 'plugin.js' );
					//CKEDITOR.plugins.addExternal( 'vdvcUploadimage', '/resources/js/ckeditor/plugins/vdvcUploadimage/', 'plugin.js' );
					CKEDITOR.plugins.addExternal( 'uploadwidget', '/resources/js/ckeditor/plugins/uploadwidget/', 'plugin.js' );
					CKEDITOR.plugins.addExternal( 'widgetselection', '/resources/js/ckeditor/plugins/widgetselection/', 'plugin.js' );
					CKEDITOR.plugins.addExternal( 'filetools', '/resources/js/ckeditor/plugins/filetools/', 'plugin.js' );
					CKEDITOR.plugins.addExternal( 'vdvcdatalink', '/resources/js/ckeditor/plugins/vdvcdatalink/', 'plugin.js' );
					CKEDITOR.plugins.addExternal( 'vdvcAutoClean', '/resources/js/ckeditor/plugins/autoclean/', 'plugin.js' );
					CKEDITOR.plugins.addExternal( 'tabletools', '/resources/js/ckeditor/plugins/tabletools/', 'plugin.js' );
					CKEDITOR.plugins.addExternal( 'tableresize', '/resources/js/ckeditor/plugins/tableresize/', 'plugin.js' );
					CKEDITOR.plugins.addExternal( 'oembed', '/resources/js/ckeditor/plugins/oembed/', 'plugin.js' );
					//plugins += 'save,dialog,clipboard,widget,lineutils,image2,bootstrapVisibility,fakeobjects,pagebreak,vdvcdatalink';
					plugins += 'save,clipboard,widget,lineutils,image2,bootstrapVisibility,'+
						'fakeobjects,pagebreak,vdvcdatalink,vdvcImagePaste,notification,notificationaggregator,uploadimage,'+
						'uploadwidget,widgetselection,filetools,lineheight,vdvcAutoClean,tabletools,tableresize,oembed';
				} else {
					//CKEDITOR.plugins.addExternal( 'dialog', '/resources/js/ckeditor/plugins/dialog/', 'plugin.js' );
					//CKEDITOR.plugins.addExternal( 'annotation', '/resources/js/ckeditor/plugins/annotation/', 'plugin.js' );
					
					//plugins += 'dialog';	//,'annotation'
				}
				if($scope.doc.docType == "VidiViciNotes") {
					if(hideFullToolBar) {
						hideFullToolBar = false;
						CKEDITOR.config.toolbar = "Basic";
						$scope.toggleToolBarTitle = "Show Full Toolbar";
					} else {
						hideFullToolBar = true;
						CKEDITOR.config.toolbar = "Full";
						$scope.toggleToolBarTitle = "Hide Full Toolbar";
					}
				} else if($scope.doc.docType == "Notes") {
					hideFullToolBar = false;
					CKEDITOR.config.toolbar = "Notes";
				}
				//CKEDITOR.config.line_height = "1px;1.15px;1.5px;2px;2.5px;3px";
				var cke_content_height = $(".doc-container").outerHeight() - 55;
				try {
					var ckeConfig = {
							readOnly: $scope.readOnly,
							tabSpaces: 4,
							width: "100%",
							height: cke_content_height,
							uiColor : '#ffffff',
							language : "en",
							skin : 'moono-lisa,/resources/js/ckeditor/skins/moono-lisa/' ,
							extraAllowedContent:"vcell[*]",
							filebrowserImageUploadUrl: fileBaseUrl+"ImageUploadAsBase64",
							imageUploadUrl : fileBaseUrl+'ImageUploadAsBase64',
							vdvcimageUploadUrl : fileBaseUrl+'ImageUploadAsBase64',
							extraPlugins : plugins,
							removePlugins : "stylesheetparser, elementspath"+ (!(isDocEditable()) ? ",toolbar":""),
							resize_enabled : false,
							//allowedContent: true,
							fullPage: true,
							autoParagraph: false,
							//forceEnterMode : true,
						};
					if($scope.doc.docType == "Notes") {
						ckeConfig.format_tags = 'h1;h2;h3;p';
						ckeConfig.format_h1={element:"h1", name: "Heading 1"};
						ckeConfig.format_h2={element:"h2", name: "Heading"};
						ckeConfig.format_h3={element:"h3", name: "Subheading"};
						ckeConfig.format_p={element:"p", name: "Body"};
					}
					$scope.instance = CKEDITOR.replace( editorId,ckeConfig);
				} catch(e) {
					
				}
				if ($scope.instance) {
					$scope.instance.on( 'change', function( evt ) {
						if(!$scope.doc.webResource) {
							contentChanged = true;
							$scope.doc.content = evt.editor.getData();
							setConfirmUnload(true);
							initiateDocSavePolling();
						}
					});
					$scope.instance.on( 'key', function( evt ) {
						if ( evt.data.keyCode == 32 && evt.editor.readOnly) {
					        evt.cancel();
					    }
					});
					if(isDocEditable()) {
						$scope.instance.on( 'selectionChange', function( evt ) {
							var body = this.document.getBody();
							var el = evt.editor.getSelection().getStartElement();
							$(body.$).find("span.note_slctd").removeClass("note_slctd");
							$('div.doc-viewr[data-id="'+$scope.viewerId+'"]').find(".vdvc_comment_selected").removeClass('vdvc_comment_selected');
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
									    $('div.doc-viewr[data-id="'+$scope.viewerId+'"]').find(".comment-wrap")[0].scrollTop -= 10;
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
					
					$scope.instance.on( 'save', function( evt ) {
						$scope.saveNotes();
						return false;
					});
					
					var formatElementArray = ["STRONG", "EM", "U", "S", "SUB", "SUP"];
					
					function getAnchorElement(currentElement) {
						var anchorElement = currentElement;
						for(var i=0; i < formatElementArray.length; i++) {
							var parentEle = anchorElement.getParent();
							if(parentEle) {
								anchorElement = parentEle;
								if(formatElementArray.indexOf(parentEle.$.nodeName) == -1 && parentEle.$.nodeName == "A") {
									break;
								}
							}
						}
						return anchorElement;
					}
					
					$scope.instance.on( 'contentDom', function( evt ) {
						/*var cke_inner_height = $(ckeId).find(".cke_inner").outerHeight();
						$(ckeId).find(".cke_contents").height(cke_inner_height);
						 
						if ( evt.editor && evt.editor.status == "loaded") {
							evt.editor.resize("100%",cke_inner_height);
						}
						var $toolBar = $(ckeId).find(".cke_top");
						if($toolBar.length > 0) {
							$toolBar.css({"position":"absolute","width":"100%"});
							if($scope.readOnly) {
								$toolBar.css({"display":"none"});
							}
						}*/		
						var $toolBar = $(ckeId).find(".cke_top");
						if($toolBar.length > 0) {
							$toolBar.css({"position":"absolute","width":"100%"});
							if($scope.readOnly) {
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
								$(body.$).find('span.linkHandler').parent().remove();
								if(typeof $(this).attr('href') != 'undefined'  && 
										   !$(this).hasClass('linkToFire')) {
									//showClickableLink($(this));
									if(event.ctrlKey == true) {
										window.open(href, 'new' + event.screenX);
									}
								}
							});
						}
						
						ckEditorEvents($(body.$));
						var editable = $scope.instance.editable();
						editable.attachListener( editable, 'click', function( event ) {
							//event.stopPropagation();   
							var elem = event.data.getTarget();
							var parentElem = $( elem.$ ).parent();
							//temp code needs to be deleted ( 2 lines)
							// $('.table-export-tool').css({"display":"none"});	
							//$scope.tableToExport = null;
							if(elem.hasClass("cke-digest-annotate-open-in-context-icon")) {
								event.data.preventDefault();
								event.data.stopPropagation();
								return false;
							}
							if($(elem.$.parentElement) && $(elem.$.parentElement).attr("data-uib-tooltip") === "open annotation in context") {
								event.data.preventDefault();
								event.data.stopPropagation();
								return false;
							}
							if(elem.hasClass("deep-link")) {
								window.open(elem.getAttribute("href"),"_blank");
							}
							
							if(elem.hasClass("deep-link-from-info") || $(elem.$).closest('.deep-link-from-info').length !=0) {
								return false;
							} else {
							    $(body.$).find('.deep-link-from-info').hide();
							}
								
							$('[data-id="'+$scope.viewerId+'"]').find('.link-info').css({"display":"none"});
							
							   
							if(!elem.hasClass("linkToFire")) {
								$(body.$).find('span.linkHandler').hide();
							}
							   
							if (elem.hasClass("note") && elem.getAttribute("comment-id")) {
								$(linkInfoId).hide();
								   
								$scope.linkCrdInfo = null;
								$scope.linkInfo = null;
								showCommentOnCkeClick(body,elem.$);
								if(parentElem.hasClass('vdvc-link')) {
									showDeepLinkToOnCkeClick(win,parentElem[0],event);
								}
							}
							   
							if (elem.hasClass("vdvc-link")) {
								$(linkInfoId).hide();
								   
								$scope.linkCrdInfo = null;
								$scope.linkInfo = null;
								showDeepLinkToOnCkeClick(win,elem,event);
								if(parentElem.hasClass('note')) {
									showCommentOnCkeClick(body,parentElem[0]);
								}
							}
							if(formatElementArray.indexOf(elem.$.nodeName) != -1) {
								elem = getAnchorElement(elem);
							}
							if (elem.$.nodeName == "A") {
								$('[data-id="'+$scope.viewerId+'"]').find('.link-info').css({"display":"none"});
								if(typeof elem.$.href != 'undefined') {
									//var elem = event.currentTarget;
									var linkInfoDisplay = $(linkInfoId).css("display");
									if(linkInfoDisplay == "block") {
										if(elem.$.href == $scope.linkCrdInfo.url) {
											//Do nothing
										} else {
											$(linkInfoId).hide();
											$scope.linkInfo = null;
											$scope.linkCrdInfo = {
													showLoader : true
											};
											handleLinkMouseEnter(elem.$);
										}
									} else {
										$(linkInfoId).hide();
										$scope.linkInfo = null;
										$scope.linkCrdInfo = {
												showLoader : true
										};
										handleLinkMouseEnter(elem.$);
									}
								} else{
									$(linkInfoId).hide();
									$scope.linkCrdInfo = {};
									$scope.linkInfo = null;
								}
							} else{
								$(linkInfoId).hide();
								$scope.linkCrdInfo = {};
								$scope.linkInfo = null;
							}
						});
						
						$scope.instance.editable().attachListener( this.document, 'scroll', function(event) {
							var scrollElement = commonService.getScrollingElement($scope.iframedoc);
							var scrollPosition = scrollElement.scrollTop;
					        $timeout.cancel(scrollTimer);
					        scrollTimer = $timeout(function() {
					        	 var obj = {
										 "objectId":$scope.documentId,
										 "type":"Document",
										 "docType" : "vdvcNote",
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
					        	rePositionPopOverCard(targetRect,$(linkInfoId),1000);
					        }
					    });
						
						if(this.document && this.document.$) {
							$(this.document.$).off('touchend').on('touchend',function(event) {
								if(event) {
									//event.preventDefault();
									//event.stopPropagation();
								}
								var cmtTbar = $(toolBarId);
								cmtTbar.css({"display":"none"});
								if($scope.doc.docType != "Notes" && !$scope.doc.webResource && !$scope.doc.perms.readonly) {
									var H = cmtTbar.outerHeight();
								    var W = cmtTbar.outerWidth();
						    		var vH = $(win.$).innerHeight(); 
						    		var vW = $(win.$).outerWidth(); 
						    		var x = event.clientX; 
									var y = event.clientY;
									
									if(!isNaN(x) && (x+W) > vW) {
						    			x = (x-W);
						    		} 
									
									var mySelection = $scope.instance.getSelection();
									if (CKEDITOR.env.ie) {
										if(CKEDITOR.env.version < 11) {
											mySelection.unlock(true);
										    selectedText = mySelection.getNative().createRange().text;
										} else {
											mySelection.unlock(true);
										    selectedText = mySelection.getNative().toString();
										}
									} else {
									    selectedText = mySelection.getNative();
									}
									
									if (selectedText) {
										if(_.isString(selectedText) && selectedText.length > 0 || selectedText.type == "Range") {
											$scope.bookmarks = mySelection.createBookmarks2();
											if($scope.bookmarks && $scope.bookmarks.length > 0) {
												selectionConfig = {
														"bookmarks" :$scope.bookmarks,
														"scrollPosition" : $(event.sender.$).scrollTop()
												};
											}
											cmtTbar.css({"display":"block","top":y+"px","left":x+"px" });
										} 
									}
								}
							});
						}
						
						/*$scope.instance.editable().attachListener( this.document, 'mouseover', function( event ) {
							if($scope.readOnly) {
								$(body.$).find(".cke_image_resizer").css("display", "none");
								$(body.$).find(".cke_widget_drag_handler_container").css("display", "none");
							} else {
								$(body.$).find(".cke_image_resizer").css("display", "block");
								$(body.$).find(".cke_widget_drag_handler_container").css("display", "block");
							}
						});*/
						
						$scope.instance.editable().attachListener( this.document, 'mouseup', function( event ) {
							if(event && event.data && event.data.$) {
								event.data.$.preventDefault();
								event.data.$.stopPropagation();
							}
							var cmtTbar = $(toolBarId);
							cmtTbar.css({"display":"none"});
							
							if($scope.doc.docType != "Notes" && !$scope.doc.webResource && !$scope.doc.perms.readonly) {
								var H = cmtTbar.outerHeight();
							    var W = cmtTbar.outerWidth();
					    		var vH = $(win.$).innerHeight(); 
					    		var vW = $(win.$).outerWidth(); 
					    		var x = event.data.$.clientX; 
								var y = event.data.$.clientY;
								
								if(!isNaN(x) && (x+W) > vW) {
					    			x = (x-W);
					    		} 
								
								var mySelection = $scope.instance.getSelection();
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
								    selectedText = nativeSelection;
								}
								
								if (selectedText ) {
									if(_.isString(selectedText) && selectedText.length > 0 || selectedText.type == "Range") {
										$scope.bookmarks = mySelection.createBookmarks2();
										if($scope.bookmarks && $scope.bookmarks.length > 0) {
											selectionConfig = {
													"bookmarks" :$scope.bookmarks,
													"scrollPosition" : $(event.sender.$).scrollTop()
											};
										}
										var range =nativeSelection.getRangeAt(0);
										var selectionRects = range.getBoundingClientRect();
										rePositionPopOverCard(selectionRects,cmtTbar,0);
										//cmtTbar.css({"display":"block","top":y+"px","left":x+"px" });
									} 
								}
							}
						});
					});
					
					CKEDITOR.on('instanceCreated', function (ev) {
						CKEDITOR.dtd.$removeEmpty['a'] = 0;
		            });
					
					$scope.instance.on('instanceReady', function(evt) {	
						CKEDITOR.instances[$scope.viewerId] = evt.editor;
						this.document.appendStyleSheet(fileBaseUrl+'/resources/js/ckeditor/plugins/customstyles/styles/contents.css?'+$scope.viewerId);
						var dt = moment($scope.doc.modifiedOn).fromNow();
						if($scope.doc && $scope.doc.editable && $scope.doc.perms.edit) {
							if(openOnEditMode()) {
								var editTimeout = $timeout(function () {
									$scope.editVDVCNote();
									$timeout.cancel(editTimeout);
								}, 100);
							}
						}
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
						 
						 var iframe = $(ckeId).find('iframe');//.contents();
						 if(iframe && iframe.length>0) {
							 $scope.iframedoc = iframe[0].contentDocument || iframe[0].contentWindow.document;
							 if(!$scope.isGlobalDoc) {
								// initiateDocSavePolling();
								 getDocAnnotations();
								 getAllDocDeepLinks(function(deeplinks) {
									if($scope.iframedoc) {
										var linkSpans = $($scope.iframedoc.body).find('span.vdvc-link[link-sourceid]');
										for(var i=0;i<linkSpans.length;i++) {
											var lsid = $(linkSpans[i]).attr("link-sourceid");
											var LinkObj = _.find(deeplinks,function(obj){ 
												return obj.info.linkUniqueId == lsid; 
											});
											if(!LinkObj) {
												$(linkSpans[i]).addClass("transient").removeClass("vdvc-link");
											}
										}
									} 
								 });
								 if(commonService.selectionConfig && commonService.selectionConfig.bookmarks) {
									 var tim = $timeout(function() {
										 //$( $scope.iframedoc.body ).scrollTop(commonService.selectionConfig.scrollPosition);
										 var jqDocument = $(CKEDITOR.instances[$scope.viewerId].document.$);
										 var documentHeight = jqDocument.height();
										 jqDocument.scrollTop(commonService.selectionConfig.scrollPosition);
										 $scope.instance.getSelection().selectBookmarks( commonService.selectionConfig.bookmarks);
										 if(commonService.selectionConfig.type == "comment" || commonService.selectionConfig.type == "highlight") {
											 $scope.initComment(commonService.selectionConfig.type);
										 } else if(commonService.selectionConfig.type == "create-link") {
											 $scope.createLink();
										 } else if(commonService.selectionConfig.type == "attach-link") {
											 $scope.attachLink();
										 }
										 commonService.selectionConfig = null;	
										 $timeout.cancel(tim);
									 }, 100);
								 } 
							 }
							 if($scope.deviceInfo.isMobile) {
								 setCkeBodyWidth();
							 }
							 onCkeInstanceReady();
							 CKEDITOR.on( 'dialogDefinition', function( evt ) {
								    // Take the dialog name and its definition from the event data.
								    var dialogName = evt.data.name;
								    var dialogDefinition = evt.data.definition;

								    // Check if the definition is from the dialog window you are interested in (the "Link" dialog window).
								    if ( dialogName == 'image' ) {
								        // Get a reference to the "Link Info" tab.
								    	var element = evt && evt.data && evt.data.element;
										var parentElem = $( element.$ ).parent();
										if (element && 
												element.is('img') && 
												(element.getAttribute('class').indexOf('cke-digest-annotate-open-in-context-icon') >= 0 || 
														(parentElem && $(parentElem).attr("data-uib-tooltip") === "open annotation in context"))) {
											evt.data.dialog = null;
									    }
								    }
								    evt.removeListener('dialogDefinition',false);
								});
						 }
						 //evt.removeListener();
					});
				}
			});
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
					$('[data-id="'+$scope.viewerId+'"]').find(".link-info").hide();
					if($($scope.iframedoc.body).length > 0) {
						var $link = $($scope.iframedoc.body).find('span.vdvc-link[link-sourceid="'+link.linkUniqueId+'"]');
						$link.contents().unwrap();
						link = null;
						$scope.saveNotes();
					}
				});
			}
		};
		
		function showCommentsOnCloseTipTour() {
			var showCommentsTimeout;
			showCommentsTimeout = $timeout(function() {
				if($scope.currentStateName == "taskspace.list.task" && $rootScope.showComments) {
					$scope.showComments = true;
					delete $rootScope.showComments;
				}
				$timeout.cancel(showCommentsTimeout);
			},100);
		}
		
		var docAllannotationPromise;
		function getDocAnnotations() {
			pendingRequests.cancel(docAllannotationPromise);
			
			var postdata = {
					"annotationContext" : $scope.annotationContext,
					"taskspaceId": $scope.tsId,
					"tsClientId" : $scope.tsClientId
			};
			docAllannotationPromise = AnnotationService.getAllDocAnnotations($scope.documentId,clientId,postdata);
			docAllannotationPromise.then(function(resp){
				if(resp.status == 200 && resp.data.Status) {
					var annotList = [];
					if(!_.isEmpty(resp.data.Annotations)) {
						annotList = resp.data.Annotations;
					}
					orderComments(annotList);
					$scope.$watch('docAnnotations', function (newVal, oldVal) {
						
						$timeout.cancel(commentChangeTimer);
						
						if(newVal && oldVal && newVal.length != oldVal.length) {
							 commentChangeTimer =  $timeout(function() {
								$($scope.iframedoc.body).find( 'span.transient' ).trigger("click");
				        	 },1000); 	
						}
						scrollToComment();
						var tim = $timeout(function() {
							if (commonService.DocSnippets &&  commonService.DocSnippets.snippets && commonService.DocSnippets.snippets.length > 0 && commonService.selectedSnippet) {
								try{
									var snippet = commonService.DocSnippets.snippets[commonService.selectedSnippet];
									onSnippetChanged(snippet,commonService.selectedSnippet);
								}catch (e) {
									// TODO: handle exception
								}
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
			}).finally(function() {
				if($scope.doc.webResource && !_.isEmpty($scope.doc.Link)) {
					$scope.taskSpaceState = commonService.taskSpaceState
					createWebResourceContent();
					$scope.$watch('docAnnotations', function (newVal, oldVal) {
						if(!_.isEqual(newVal,oldVal)) {
							createWebResourceContent();
						}
					}, true);
		    	}
				showCommentsOnCloseTipTour();
			});
		}
		
		function setCkeToolBar() {
			var editor = $(ckeId);
			var $toolBar = editor.find(".cke_top");
			var h = editor.find(".cke_inner").outerHeight();
			if($toolBar.length > 0) {
				$toolBar.css({"position":"absolute","width":"100%"});
				if((state.current.name == "search"  || state.current.name == "taskspace.list.task" || state.current.name == "docview") && isDocEditable()) {
					if($scope.readOnly) {
						$toolBar.css({"display":"none"});
					} else {
						var th = $toolBar.outerHeight()
						h = h - th;
						editor.find(".cke_contents").css({"padding-top":th+"px"});
					}
				}
			}
			if (CKEDITOR.instances[$scope.viewerId] && editor) {
				//CKEDITOR.instances[$scope.viewerId].setReadOnly($scope.readOnly);
				editor.find(".cke_contents").height(h);
				CKEDITOR.instances[$scope.viewerId].resize("100%",h);
			}
			var t = $timeout(function() {
				if( $scope.iframedoc) {
					if ($( $scope.iframedoc.body )) {
						$( $scope.iframedoc.body ).css({"min-height":(h-68)+"px"});
					}
				}
				$timeout.cancel(t);
			},100);
			
		}
		
		function animateBackgroundColor($domelements) {
			$domelements.animate({
				"backgroundColor" : "#006699",
				"color": "#fff"
			},2000,function() {
				$domelements.css({"background-color" :"","color":""});
			});
		}
		
		function highlightOpenedDeeplink(linkInfo) {
			var el = $scope.iframedoc.body;
		 	//var h = $('.cke').height();
		 	var tool_bar_height = $(ckeId).find('.cke_top').outerHeight();
		 	var highlights = $(el).find('span[link-sourceid="'+linkInfo.linkUniqueId+'"]');
		 	
			if (highlights.length > 0) {
				highlights[0].scrollIntoView(true);
				animateBackgroundColor(highlights);
				/*for(var initialHighlight = 0; initialHighlight < highlights.length; initialHighlight++) {
					highlights[initialHighlight].scrollIntoView(true);
					
					//$(el).scrollTop($(el).scrollTop()-(h/2));
					var top = $(el).scrollTop();
					var bh = $(el).height();
					var off = highlights.offset();
					if((off.top+tool_bar_height) < bh) {
						$(el).scrollTop($(el).scrollTop()-(tool_bar_height+30));
					} else {
						//$(el).scrollTop(bh);
					}
				}*/
			}
			
			
		}
		
		function openDeeplinkAnnotation(annotationId) {
			var tim = $timeout(function() {
				$scope.showComments = true;
				var el = $scope.iframedoc.body;
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
		
		function onCkeInstanceReady() {
			var obj = {
					 "objectId":$scope.documentId,
					 "type":"Document",
					 "docType" : "vdvcNote"
			};
			
			$scope.$emit("objectLoaded",obj);
			setCkeToolBar();
			
			$( $scope.iframedoc.body ).bind("DOMNodeRemoved",function( objEvent ){});

			renderContentSearchSnippets();
			
			if (commonService.linkInfo && commonService.linkInfo.linkUniqueId) {
				 if(commonService.linkInfo.objectType == "DocAnnotation") {
					 openDeeplinkAnnotation(commonService.linkInfo.linkUniqueId);
				 } else {
					 highlightOpenedDeeplink(commonService.linkInfo);
				 }
			}
			 
			 if($scope.doc.webResource) {
				 var timer;
				 try{
					 timer = $timeout(function() {
						 var elem = $($scope.iframedoc.body).find('a[href="'+$scope.doc.sourceUrl+'"]');
						 if($state.$current.name != "taskspace.list.task") {
							 $scope.showComments = true;
						 }
						 //handleLinkMouseEnter(elem[0]);
				         $timeout.cancel(timer);
					 }, 1000);
				 } catch(e) {
					 $timeout.cancel(timer);
				 }
			}
		}
		
		
		$scope.exportTableToModel = function(){
			
			if ($scope.tableToExport) {
				DocFactory.exportTable({"tableContent": $scope.tableToExport}).then(function(resp){
					if(resp.status == 200) {
						if (resp.data.Status) {
							//alert(resp.data.Data);
						} else {
							//alert("Status "+ resp.data.Status +"  Unable to Parse");
						}	
					}
				});
			}
			 
		};
		
		
		function renderContentSearchSnippets() {
			if (commonService.DocSnippets && $scope.iframedoc.body) { 
				 var contentSnippets = _.where(commonService.DocSnippets.snippets, {'type': "content"});
				  
				 var tool_bar_height = $(ckeId).find('.cke_top').outerHeight();
				 
				 if(!isNaN(tool_bar_height)) {
					tool_bar_height += 55;
					DocFactory.highlightTextByRegex($scope.iframedoc.body,contentSnippets,tool_bar_height); 
				 } else {
					DocFactory.highlightTextByRegex($scope.iframedoc.body,contentSnippets,55); 
				 }
			}
		}
		
		function docSaveDefaultSuccessCb() {
			
			renderContentSearchSnippets();
			
	       	if(commonService.selectionConfig && $scope.instance) {
	       		var commentEl = commonService.selectionConfig.commentEl;
	       		
	       		if(commentEl && commentEl.length > 0) {
		        		commentEl[0].scrollIntoView(true);
		        	} else {
		        		setDocScrollPosition({"position" : commonService.selectionConfig.scrollPosition});
		        	}
					commonService.selectionConfig = null;
				}
	       		        	
	       	ckEditorEvents($($scope.iframedoc.body));
		}
		
		
		function updateDocContent(content,options) {
			var bookmarks = $scope.instance.getSelection().createBookmarks2();
			CKEDITOR.instances[$scope.viewerId].setData(content,function() {
				onCkeInstanceReady();
				if($scope.instance) {
					$scope.instance.focus();
					if(bookmarks) {
						try {
							$scope.instance.getSelection().selectBookmarks(bookmarks);
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
		
		
		function autoSaveDocument(postdata,options) {
			if($scope.docLockId != null) {
				postdata.lockId = $scope.docLockId;
			}
			
			/*if(docNotification) {
				docNotification.update({message: 'Saving...',important : true });
			}*/
			
			$scope.saveMsg.msg = 'Saving...';
			
			/*try{
				$scope.instance.setReadOnly(true);
				$scope.instance.focusManager.blur();
			}catch (e) {
				// TODO: handle exception
			}*/
			
			DocFactory.autoSaveDocument(postdata).then(function (resp) {
		        if(resp.status == 200 && resp.data.Status){
		        	lastSaveTime = moment();
		        	if(resp.data.LockStatus == false) {
		        		MessageService.showErrorMessage("DOC_SAVE_LOCK_ERROR", [$scope.doc.name]);
		        		if(typeof options.onDocSaveFail == 'function'){
			        		options.onDocSaveFail();
				    	}
					} else if(resp.data.LockStatus == undefined) {
						var dt = moment(resp.data.Notes.modifiedOn).fromNow();
		        		contentChanged = false;
		        		/*if(docNotification) {
			        		docNotification.update({ message: 'All Changes Saved '+dt,important : true});
						}*/
		        		
		        		$scope.saveMsg.msg = "All Changes Saved";
						$scope.saveMsg.tooltip = 'All Changes Saved '+dt;
		        		
						if (resp.data.Notes.majorVersion && (resp.data.Notes.minorVersion || resp.data.Notes.minorVersion == 0)) {
							$scope.doc.majorVersion = resp.data.Notes.majorVersion;
							$scope.doc.minorVersion = resp.data.Notes.minorVersion;
						}
						
			        	if (CKEDITOR.instances[$scope.viewerId] && resp.data.NewContent) {
			        		/*if(options.orgContent === $scope.doc.content) {
			        			updateDocContent(resp.data.NewContent,options);
			        			MessageService.showSuccessMessage("DOC_UPDATE",[$scope.doc.name]);
			        		} else {
			        			contentChanged = true;
			        		}*/
			        		updateDocContent(resp.data.NewContent,options);
			        		//docNotification.update({ message: 'All Changes Saved'});
		        			//MessageService.showSuccessMessage("DOC_UPDATE",[$scope.doc.name]);
						} else {
							//MessageService.showSuccessMessage("DOC_UPDATE",[$scope.doc.name]);
							//docSaveDefaultSuccessCb();
							if(typeof options.onDocSaveSuccess == 'function'){
				        		options.onDocSaveSuccess();
					    	}
						}
		        	}
		        	
		        }
		    })['finally'](function() {
		    	try{
		    		if($scope.deviceInfo.isMobile) {
		    			setCkeBodyWidth();
					}
		    		$scope.instance.setReadOnly(false);
		    		$scope.instance.focus();
				}catch (e) {
					// TODO: handle exception
				}
		    	if(typeof options.onDocSaveComplete == 'function'){
		    		options.onDocSaveComplete();
		    	} else {
		    		//initiateDocSavePolling();
		    	}
		    	//20220425 - HM : commented as this was added to fix the issue WEBAPP-267 (Image insertion in Notes documents), but however it is causing issue with auto save 
		    	/*if($scope.docLockId != null) {
		    		var editor = CKEDITOR.instances[$scope.viewerId];
		    		var range = editor.createRange();
			    	range.moveToElementEditablePosition( editor.editable(), true ); // bar.^</p>
			    	editor.getSelection().selectRanges( [ range ] );
				}*/
		    });
		}
		
		
		function saveDocument(postdata,options) {
			if($scope.docLockId != null) {
				postdata.lockId = $scope.docLockId;
			}
			DocFactory.saveDocument(postdata).then(function (resp) {
		        if(resp.status == 200 && resp.data.Status){
		        	
		        	if(resp.data.LockStatus == false) {
		        		MessageService.showErrorMessage("DOC_SAVE_LOCK_ERROR", [$scope.doc.name]);
		        		if(typeof options.onDocSaveFail == 'function'){
			        		options.onDocSaveFail();
				    	}
		        	} else if(resp.data.LockStatus == undefined){
		        		contentChanged = false;
		        		docSaveDefaultSuccessCb();
						if(typeof options.onDocSaveSuccess == 'function'){
			        		options.onDocSaveSuccess();
				    	}
			        	MessageService.showSuccessMessage("DOC_UPDATE",[$scope.doc.name]);
		        	}
		        	
		        }
		    })['finally'](function() {
		    	if(typeof options.onDocSaveComplete == 'function'){
		    		options.onDocSaveComplete();
		    	} else {
		    		//initiateDocSavePolling();
		    	}
		    });
		}
		
		function saveDocumentOnCommentMode(postdata,options) {
			
			DocFactory.saveDocumentOnMultiMode(postdata).then(function (resp) {
				
		        if(resp.status == 200 && resp.data.Status){
		        	contentChanged = false;
		        	
					if (resp.data.majorVersion && (resp.data.minorVersion || resp.data.minorVersion == 0)) {
						$scope.doc.majorVersion = resp.data.majorVersion;
						$scope.doc.minorVersion = resp.data.minorVersion;
					}
		        	if(_.isString(resp.data.Message) && resp.data.Message.toLowerCase() == 'conflict') {
		        		refreshDocument({
							onDocSaveSuccess : function() {
								getDocAnnotations();
							}
						});
		        		MessageService.showErrorMessage('DOC_SAVE_CONFLICT_ERR');
		        	} else if (CKEDITOR.instances[$scope.viewerId] && resp.data.NewContent) {
		        		updateDocContent(resp.data.NewContent,options);
					} else {
						//docSaveDefaultSuccessCb();
						if(typeof options.onDocSaveSuccess == 'function'){
			        		options.onDocSaveSuccess();
				    	}
					}
		        	
		        	MessageService.showSuccessMessage("DOC_UPDATE",[$scope.doc.name]);
		        } else {
		        	if(typeof options.onDocSaveFail == 'function'){
		        		options.onDocSaveFail();
			    	}
		        }
		    })['finally'](function() {
		    	if($scope.deviceInfo.isMobile) {
		    		setCkeBodyWidth();
				}
		    	if(typeof options.onDocSaveComplete == 'function'){
		    		options.onDocSaveComplete();
		    	} else {
		    		//initiateDocSavePolling();
		    	}
		    });
		}
		
		function refreshDocument(options) {
			var postdata = {
				"documentId" : $scope.documentId,
				"clientId" : clientId,
				"majorVersion" : $scope.doc.majorVersion,
				"minorVersion" : $scope.doc.minorVersion
			};
			DocFactory.refreshDocument(postdata).then(function (resp) {
		        if(resp.status == 200 && resp.data.Status){
		        	if (CKEDITOR.instances[$scope.viewerId] && resp.data.NewContent) {
		        		contentChanged = false;
		        		if (resp.data.majorVersion && (resp.data.minorVersion || resp.data.minorVersion == 0)) {
							$scope.doc.majorVersion = resp.data.majorVersion;
							$scope.doc.minorVersion = resp.data.minorVersion;
		        		}
		        		updateDocContent(resp.data.NewContent,options);
					} 
		        	if(options && typeof options.onDocSaveSuccess == 'function'){
		        		options.onDocSaveSuccess();
			    	}
		        }
		    });
		}
		
		
		function getContentsTosave() {
			var content = $scope.doc.content;
			if($scope.iframedoc && $scope.iframedoc.body) {
				DocFactory.revertHighlights( $($scope.iframedoc.body));
				//var docViewer = $('div[data-id="'+$scope.viewerId+'"]');
				var tempBody = $($scope.iframedoc.body).clone();
				$(tempBody).find("span.note").removeClass("note");
				content = $(tempBody).html();
			}
			/*if (CKEDITOR.instances[$scope.viewerId]) {
				content = CKEDITOR.instances[$scope.viewerId].getData();
			}*/ 
			return "<html><body>"+content+"</body></html>";
		}
		
		$scope.saveNotes = function(options) {
			var defaultOptions = {};
			
			if(options) {
				defaultOptions = options;
			}
			
			defaultOptions.orgContent = angular.copy($scope.doc.content);
			
			var content = getContentsTosave();
			
			var postdata = {
					"name" : $scope.doc.name,
					"parentFolderId" : $scope.doc.folderId,
					"content" : content,
					"userId" : $scope.doc.ownerId,
					"ownerId" : $scope.doc.ownerId,
					"id" :  $scope.documentId,
					"clientId" : $scope.doc.clientId,
					"docType" : $scope.doc.docType,
					"majorVersion" : $scope.doc.majorVersion,
					"minorVersion" : $scope.doc.minorVersion,
					"forceWrite" : $scope.doc.forceWrite ? $scope.doc.forceWrite : false
			};
			
			if($scope.docLockId) {
				autoSaveDocument(postdata,defaultOptions);
			} else if($scope.doc.commentMode) {
				saveDocumentOnCommentMode(postdata,defaultOptions);
			}
			
		};
		
		function handleShareCB(sharedInfo) {
			var isSharedFalse = _.findWhere(sharedInfo,{"isShared" : false});
			var isSharedTrue = _.where(sharedInfo,{"isShared" : true});
			
			if(isSharedFalse) {
				var NoPermOnObjectList = _.where(sharedInfo,{"Reason" : "NoPermOnObject"});
				var ObjectNotFoundList = _.where(sharedInfo,{"Reason":"ObjectNotFound"});
				var NoReasonObjectList = _.where(sharedInfo,{"Reason" : null});
				
				if(!_.isEmpty(NoPermOnObjectList)) {
					MessageService.showErrorMessage("SHARE_ITEMS_ERR");
				} else if(!_.isEmpty(NoReasonObjectList)) {
					MessageService.showErrorMessage("DEFAULT_ERROR_MSG");
				} else {
					MessageService.showErrorMessage("BACKEND_ERR_MSG",[isSharedFalse.Reason]);
				}
				
			} else if(!_.isEmpty(isSharedTrue)) {
				MessageService.showSuccessMessage("DOC_SHARE",[$scope.doc.name]);
			}
		}
		
		$scope.OpenShareDocModal = function (size) {
			if($scope.doc) {
				var modalInstance = $uibModal.open({
					 animation: $scope.animationsEnabled,
				      templateUrl: 'app/components/Documents/ShareDocuments/shareDocModal.html',
				      controller: 'ShareDocModalCtrl',
				      appendTo : $('.rootContainer'),
				      controllerAs: 'vm',
				      size: size,
				      backdrop: 'static',
				      resolve: {
				    	  items : function() {
				    		  return [$scope.doc];
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
		 };
		 
		 
		function loadPdf() {
			var clientId = $scope.doc.clientId ? $scope.doc.clientId : "g";
			$scope.showPdf = true;
			$scope.pdfUrl = 'api/notes/upload/view/'+$scope.doc.fileId+"/"+clientId;
			$scope.loadPDF(baseUrl+'notes/upload/view/'+$scope.doc.fileId+"/"+clientId);
			
			if(!$scope.isGlobalDoc) {
				if($scope.showPdf && !_.isEmpty(commonService.pdfSelectionConfig)) {
					var t = $timeout(function() {
						$scope.addAnnotation(commonService.pdfSelectionConfig.data,commonService.pdfSelectionConfig.type,commonService.pdfSelectionConfig.saveResolve);
						commonService.pdfSelectionConfig = null;
						$timeout.cancel(t);
					},100);
					
				}
				var t = $timeout(function() {
					getPdfAnnotations();
					$timeout.cancel(t);
				},100);
			}
		}
		
		
		function preprocessDoc() {
			DocFactory.setDocPermissions($scope.doc);
			$scope.isGlobalDoc = $scope.doc.global;
			$scope.doc["_type"] = "Document";
			
			DocFactory.setDocTypeBooleanFlags($scope.doc);
			
			if($state.$current.name == "search"){
				$scope.$emit("PageName",{"userName":appdata.UserName,"pageName":"Search"});
			} else if($state.$current.name == "taskspace.list.task" || $state.$current.name == "inbox") {
				
			} else{
				$scope.$emit("PageName",{"userName":appdata.UserName,"pageName":$scope.doc.displayName});
			} 
			
			if(!$scope.isGlobalDoc) {
				getDocHierarchy($scope.documentId);
			} else {
				var docHierarchy = [];
    			docHierarchy.push($scope.doc);
    			$scope.docHierarchy =  docHierarchy;
			}
		}
		
		function processTags() {
			$scope.tags =  orderBy($scope.tags, "TagName");
			$scope.selectedTags.tags = angular.copy($scope.tags);
		}
		
		var getdocPromise;
		function showDocument() {
			
			if($scope.documentId) {
				pendingRequests.cancel(getdocPromise);
				
				getdocPromise = DocFactory.getDocById($scope.documentId,clientId);
				getdocPromise.then(function(response){
					if (response.status == 200 && response.data.Status) {
						$scope.doc = response.data.Notes;
						if($scope.doc) {
							
							preprocessDoc();
							
							if($scope.doc.sourceUrl) {
								var urlObj = urlParser.parseUrl($scope.doc.sourceUrl);
								$scope.doc.sourceHost = urlObj.hostname;
							}
							if($scope.doc.docType == "WebResource" || $scope.doc.extensionWebClip) {
								$scope.isAddToTSEnable = false;
							}
							if ($scope.doc.vidiviciNotes || $scope.doc.webResource || $scope.doc.docType == "Notes") {
								if($scope.doc.webResource && !_.isEmpty($scope.doc.Link)) {
									processWebResourceLinkInfo($scope.doc);
						    	}
								if($scope.doc.secFile) {
									$scope.isComparedSec = $scope.doc.compareDocId ? true : false;
									$scope.comparedSecId = $scope.doc.compareDocId; 
								}
								
								if($scope.doc.extensionWebClip) {
									if($scope.element) {
										var divElement = $scope.element.find('.cke-wrap');
										divElement.empty();
										//#webannotations:5d922204229dc22bd51bb9c1#client:5d79e4b9229dc2469fa67462#group:5d8f1c0e229dc233ea10a99b
										var src = baseUrl+"notes/webClipContent?documentId="+$scope.doc.id+"&clientId="+$scope.doc.clientId;
										if($scope.annotationContext == "taskspace") {
											if($scope.commentId) {
												src = src+"#webannotations:"+$scope.commentId;
											}
											
											if($scope.doc.clientId) {
												src = src+"#client:"+$scope.doc.clientId;
											}
											
											if($scope.tsId) {
												src = src+"#group:"+$scope.tsId;
											}
										}
										divElement.append("<iframe src='"+src+"' style='height:100%;width:100%;border:none;'></iframe>");
										$scope.showDoc = true;
										var obj = {
												 "objectId":$scope.doc.id,
												 "type":$scope.doc._type,
												 "docType" : $scope.doc.docType
										};
										$scope.$emit("objectLoaded",obj);
									}
								} else if($scope.isGlobalDoc) {
									CreateNotes($scope.viewerId);
								} else if($scope.doc.docType == "Notes") {
									CreateNotes($scope.viewerId);
								} else {
									getDocForComment($scope.doc,function(doc){
										CreateNotes($scope.viewerId);
									});	
								}
								if(!$scope.isGlobalDoc && $scope.doc.tags && !_.isEmpty($scope.doc.tags)) {
									$scope.tags = angular.copy($scope.doc.tags);
									processTags();
								}
								
								/*else if($scope.doc.secFile || ($scope.doc.docType && $scope.doc.docType.toLowerCase() == "webclip")) {
									$scope.getItemTags();
									getDocForComment($scope.doc,function(doc){
										CreateNotes($scope.viewerId);
									});	
								} else {
									$scope.getItemTags();
									CreateNotes($scope.viewerId);
								}*/
								
								
							}else {
								if (_.isString($scope.doc.contentType)) {
									if($scope.doc.contentType.toLowerCase() == 'application/pdf') {
										if($scope.isGlobalDoc) {
											openPdfDocumentWithSnippets();
										} else {
											if($scope.doc.tags && !_.isEmpty($scope.doc.tags)) {
												$scope.tags = angular.copy($scope.doc.tags);
												processTags();
											}
											openPdfDocument();
										}
									} else {
										
										var clientId = $scope.doc.clientId ? $scope.doc.clientId : "g";
										clearDocViewer();
										var viewer = DocViewerService.getDocViewer($scope.doc.contentType);
										if(viewer) {
											var divElement = $scope.element;
											docScope = $scope.$new();
											docScope.officeDoc = angular.copy($scope.doc);
											docScope.docUrl = DocViewerService.getDocUrl($scope.doc.contentType,clientId,$scope.doc.fileId);
										    if($scope.doc.contentType.indexOf("image") !== -1 || $scope.doc.contentType.indexOf("video") !== -1) {
										    	viewer = $(viewer).attr("src","docUrl");
										    }
											var appendHtml = $compile(viewer)(docScope);
										    divElement.append(appendHtml);
										    var obj = {
													 "objectId":$scope.doc.id,
													 "type":$scope.doc._type,
													 "docType" : $scope.doc.docType
											};
											$scope.$emit("objectLoaded",obj);
										}
									}
								}
							}
						}
					}
				}).finally(function() {
					getDocViewButtons();
					getUsers();
				});
			}	
		}
		
		function returnViewer(mimeType) {
			var viewer;
			switch(mimeType) {
			case "text/html":
			case "text/plain":
				viewer = "<text-doc-viewer></text-doc-viewer>";
				break;
			case "text/pdf":
				viewer = "<od-pdf-viewer></od-pdf-viewer>";
				break;
			default:
				viewer = "<office-doc-viewer></office-doc-viewer>";
				break;
			}
			
			return viewer;
		}
		
		function clearDocViewer() {
			try {
				var divElement = $scope.element;
				//var divElement = angular.element(document.querySelector('.doc-content'));
				divElement.empty();
				if(docScope) {
					docScope.$destroy();
					docScope = null;
				}
			} catch(e) {
				
			}
			
		}
		
		function openDocInAModal(clientId,docId) {
			var modalInstance = $uibModal.open({
				  animation: true,
			      templateUrl: 'app/components/DocViewer/ModalDocViewer/ModalDocViewer.html',
			      controller: 'ModalDocViewerController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'dv',
			      ariaDescribedBy:docId,
			      backdrop: 'static',
			      windowClass: 'mdl-doc-view',
			      resolve: {
			    	  docId : function() {
			    		  return docId;
			    	  },
			    	  clientId : function() {
			    		  return clientId;
			    	  }
			      }
			 });
		}
		
		$scope.openSECCompareFile = function() {
			if($scope.isGlobalDoc) {
				openDocInAModal("g",$scope.comparedSecId);
			} else {
				if($scope.doc.userSavedCompareDocId) {
					SECImportFactory.getCompareDocId($scope.doc.clientId,$scope.documentId).then(function(response){
						if (response.status == 200 && response.data.Status && response.data.CompareDocIdFound) {
							openDocInAModal(response.data.CompareDocClientId, response.data.CompareDocId);
					    } else if(response.data.Status && !response.data.CompareDocIdFound && response.data.Reason == "CompareDocIdNotAvailable"){
					       MessageService.showErrorMessage("COMPARE_DOCID_NOTAVAILABLE_ERR");
					    } else if(response.data.Status && !response.data.CompareDocIdFound && response.data.Reason == "NotSECFile"){
					       MessageService.showErrorMessage("NOT_SECFILE");
					    } else if(response.data.Status && !response.data.CompareDocIdFound && response.data.Reason == "DocumentNotFound"){
					       MessageService.showErrorMessage("DOCUMENT_NOT_FOUND");
					    }
					});
					
				} else if($scope.comparedSecId) {
					openDocInAModal("g",$scope.comparedSecId);
				}
			}
		};
		
		function getDocForComment(doc,cb) {
			var postdata = {
					"documentId": doc.id,
					"clientId": doc.clientId
			};
			
			DocFactory.getDocForComment(postdata).then(function(response){
				if (response.status == 200 && response.data.Status) {
					doc.commentMode = true;
					var document = response.data.Notes;
					document && document.content ? $scope.doc.content = document.content: $scope.doc.content = "";
					
					if (response.data.Notes.majorVersion && (response.data.Notes.minorVersion || response.data.Notes.minorVersion == 0)) {
						$scope.doc.majorVersion = response.data.Notes.majorVersion;
						$scope.doc.minorVersion = response.data.Notes.minorVersion;
					}
					
					if(typeof cb == "function") {
						cb(doc);
					}
				}
			});
		}
		
		/*var getUserPermsOnDoc = function(doc) {
			DocFactory.getUserPermsOnDoc(doc.id,doc.clientId).then(function(resp){
				if(resp.status == 200 && resp.data.Status) {
					$scope.doc.permissions = resp.data.Notes;
					DocFactory.setDocPermissions($scope.doc);
					if(doc.secFile) {
						$scope.isComparedSec = doc.compareDocId ? true : false;
						$scope.comparedSecId = doc.compareDocId; 
						getDocForComment(doc);
					} else {
						CreateNotes($scope.viewerId);
					}
				}
			});
		};*/
		
		function getDocHierarchy(docId) {
			if(!$scope.isGlobalDoc) {
				DocFactory.getDocLocation(docId,$scope.doc.clientId).then(function(response){
	        		if(response.status == 200 && response.data.Status) {
	        			var docHierarchy = response.data.Notes;
	        			_.each(docHierarchy,function(doc,index) {
	        				
	        				if(_.has(doc, 'root') ) {
	        					doc._type = "Folder";
	        				} else {
	        					doc._type = "Document";
	        				}
		       				
		       			});
	        			if(docHierarchy.length > 4) {
	        				var dummyFoldr = {
	        					    "id" : null,
	        					    "name" : "...",
	        					    "isDummy" : true,
	        					    "ownerId" : null,
	        					    "root" : false,
	        					    "trash" : false,
	        					    "parentFolderId" : null
	        					};
	        				docHierarchy.splice(1, 0, dummyFoldr); 
	        			}
	        			$scope.docHierarchy =  docHierarchy;
	        		}
	        	});
			} else {
				var docHierarchy = [];
    			docHierarchy.push($scope.doc);
    			$scope.docHierarchy =  docHierarchy;
			}
		}
		
		function openPdfDocumentWithSnippets() {
			showCommentsOnCloseTipTour();
			if(commonService.DocSnippets && commonService.DocSnippets.snippets){
				var contentSnippets = _.pluck(_.where(commonService.DocSnippets.snippets, {'type': "content"}), 'string');
				if(contentSnippets && contentSnippets.length > 0){
					getSnippetCoords(contentSnippets,function(){
						loadPdf();
					});
				} else {
					loadPdf();
				}
			} else {
				loadPdf();
			}
		}
		
		var pdfAllannotationPromise;
		
		function openPdfDocument() {
			pendingRequests.cancel(pdfAllannotationPromise);
			var postdata = {
				"clientId" : clientId,
				"annotationContext" :  $scope.annotationContext,
				"taskspaceId": $scope.tsId,
				"tsClientId" : $scope.tsClientId
			};
			
			pdfAllannotationPromise = AnnotationService.getAllPdfAnnotations($scope.documentId,postdata);
			pdfAllannotationPromise.then(function(pdfComments){
				if(pdfComments.status == 200 && pdfComments.data.Status) {
					var annotList = [];
					if(!_.isEmpty(pdfComments.data.Annotations)) {
						annotList = pdfComments.data.Annotations;
					}
					$scope.pdfAnnotations = annotList;
				}
				
				getAllDocDeepLinks();
				openPdfDocumentWithSnippets();
				
		   }).finally(function() {
			   if(_.isArray($scope.pdfAnnotations)) {
				   var annotCount = $scope.pdfAnnotations.length;
   					notifyAnnotationCount(annotCount);
   			   }
		   });
			
		}
		
		function getObjectLock(cb) {
			var duration = 0;
			try{
				duration = $scope.docLockDuration.value;
			}catch(e) {}
			DocFactory.getDocLock($scope.documentId,clientId,duration).then(function(resp){
				if(resp.status == 200 && resp.data.Status) {
					$scope.userWithLock = false;
					if(typeof cb == "function") {
						cb(resp);
					}
				}
			});
		}
		
		function switchEditMode() {
			$scope.readOnly = false;
			var editor = CKEDITOR.instances[$scope.viewerId];
			if (editor && editor.status == "ready") {
				$(ckeId).find('.cke_top').css("display","block");
				try {
					editor.setReadOnly($scope.readOnly);
				} catch(e) {
					console.log(e);
				}
			} 
			if($scope.iframedoc.body) {
				$($scope.iframedoc.body).focus();
			}
			var t = $timeout(function() {
				setCkeToolBar();
				$timeout.cancel(t);
			},500);
		}
		
		function setReadOnly() {
			$scope.readOnly = true;
			var editor = CKEDITOR.instances[$scope.viewerId];
			if (editor && editor.status == "ready") {
				editor.setReadOnly($scope.readOnly);
			} 
			
			$(ckeId).find('.cke_top').css("display","none");

			$(ckeId).height("100%");
			$(ckeId).find(".cke_contents").height("100%");
			$(ckeId).find(".cke_contents").css({"padding-top":"0px"});
			
			
			if(editor) {
				editor.resize("100%","100%");
			}
			var h = $(ckeId).find(".cke_inner").outerHeight();
			if ($( $scope.iframedoc.body )) {
				$( $scope.iframedoc.body ).css({"min-height":(h-68)+"px"});
			}
		}
		
		$scope.editVDVCNote = function() {
			
			if(isDocEditable()) {
				$(linkInfoId).hide();
				if($scope.readOnly) {
					getObjectLock(function(resp){
						$scope.docLockId = resp.data.LockId;
	        			if($scope.docLockId != null) {
	        				refreshDocument({
	        					onDocSaveSuccess : function() {
	        						switchEditMode();
	        					}
	        				});
	        			} else {
	        				var text = 'Unable to open for editing as '+resp.data.LockOwner+' is currently editing the file';
	        				$confirm({text:text}, { templateUrl: 'app/components/common/CustomeTemplates/confirmTemplate.html' });
	        			}
					});
				} else {
					if(contentChanged && $scope.isDocOnEditMode()) {
						cancelDocsaveTimer();
						$scope.saveNotes({
							onDocSaveComplete : function(){
								setReadOnly();
								removeObjectLock();
							}
						}); 
			    	} else {
			    		setReadOnly();
						removeObjectLock();
			    	}
				} 
			}
		};
		
		$scope.toggleToolBar = function() {
			
			var scrollPosition = $( $scope.iframedoc.body ).scrollTop();
			if (CKEDITOR.instances[$scope.viewerId]) {
				
				/*if(contentChanged) {
					$scope.saveNotes();
				}*/
				
				CKEDITOR.instances[$scope.viewerId].destroy(true);
			}
			
			$(linkInfoId).hide();
			CreateNotes($scope.viewerId);
			
			var t = $timeout(function() {
				if( $scope.iframedoc) {
					$(ckeId).find(".cke_contents").css({"padding-top":$(ckeId).find('.cke_top').outerHeight()+"px"});
					setDocScrollPosition({"position" : scrollPosition});
				}
				$timeout.cancel(t);
			},500);
			
		};
		
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
							$scope.cancelEditTag();
							$scope.getItemTags();
						}
					});
			    }, function() {
			    	
			    });
			}
		};
		
		$scope.openDocument = function(doc,event) {
			if(event) {
	    		event.stopPropagation();
	    		event.preventDefault();
	    	}
	    	
	    	if(doc.trash || doc.deleted) {
	    		$state.go("trash",{"trashId":doc.id});
	    	} else {
	    		$state.go("docs",{"folderId":doc.id});
	    	}
		};
		   
		function getSnippetCoords(snippet,cb) {
			$scope.snippetMatches = [];
			var postdata = {};
			
			postdata["documentId"] = $scope.documentId;
			postdata["searchString"] = snippet;
			
			if(clientId) {
				postdata["clientId"] = clientId;
			} else {
				postdata["clientId"] = 'g';
			}
			
			DocFactory.searchPdf(postdata).then(function(resp){
				 if(resp.status == 200 && resp.data.Status ) {
					 
					var matches = resp.data.Notes; 
					if(matches) {
						_.each(matches,function(data,index) {
							if(data.found) {
								var matchConfig = {};
									matchConfig.page = data.info[0].page;
									matchConfig.coords = data.info[0].matches[0].coordinates;
									matchConfig.noOfLines =  data.info[0].matches[0].noOfQuads;
								$scope.snippetMatches.push(matchConfig);
							} else {
								$scope.snippetMatches.push(null);
							}
						});
					}
				 }
				 if(typeof cb == "function") {
					 cb();
				 }
			});			
			
		}
		
		function setSnippetPosition(index){
			if($scope.showPdf) {
				scrollToPdfSelectedSnippet(index);
			} else if($scope.iframedoc && $scope.iframedoc.body) {
				var tool_bar_height = $(ckeId).find('.cke_top').outerHeight();
				
				if(!isNaN(tool_bar_height)) {
					tool_bar_height += 55;
					DocFactory.goToHighlightedSnippet($scope.iframedoc.body,index,tool_bar_height); 
				} else {
					DocFactory.goToHighlightedSnippet($scope.iframedoc.body,index,55); 
				}
					
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
			
			/*
			if($scope.doc && $scope.doc.webResource) {
				$scope.openCommentIncontext(null,{"id" : snippet.annotationId});
			} else {
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
			}*/
		}
		
		function isPdfDocument() {
			if($scope.doc && $scope.doc.contentType && $scope.doc.contentType.toLowerCase() == 'application/pdf') {
				return true;
			}
			return false;
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
				
				if(isPdfDocument()) {
					$scope.pdfAnnotations = [];
					pdfAllannotationPromisePoll = getPdfAnnotations({spinner: 'search_spinner'});
					pdfAllannotationPromisePoll.finally(function() {
						commentFromSnippet(snippet);
					});
				} else {
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
					}).finally(function() {
						if($scope.doc.webResource && !_.isEmpty($scope.doc.Link)) {
							createWebResourceContent();
							$scope.$watch('docAnnotations', function (newVal, oldVal) {
								if(!_.isEqual(newVal,oldVal)) {
									createWebResourceContent();
								}
							}, true);
				    	}
						
						commentFromSnippet(snippet);
					});
				}
			} else {
				commentFromSnippet(snippet);
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
		
		
		function scrollToPdfDeepLink(info) {
			// check here
			var page = info.pageNumber;
			var pdfPage = $scope.pdfViewerAPI.viewer._pages[page-1];
			
			if(pdfPage) {
				pdfPage.linkId = info.id;
				pdfPage.goToDeepLinkCB = function() {
					var index = this.linkId;
					//$(".pdfHighlight.selected").removeClass("selected");
					var linkEl = "";
					var openHighlightAnnotation = false;
					if(info.objectType && info.objectType == "DocAnnotation") {
						linkEl = $('div[annot-id="'+info.annotationId+'"]');
						openHighlightAnnotation = true;
					} else {
						linkEl = $('div[link-sourceId="'+info.linkUniqueId+'"]');
					}
					if(linkEl.length > 0) {
						//selectedSnippet.addClass("selected");
						linkEl[0].scrollIntoView();
						if(openHighlightAnnotation) {
							$( linkEl[0] ).trigger( "click" );
						}
					} 
					
					delete pdfPage.linkId;
					delete pdfPage.goToDeepLinkCB;
				};
				
				if(pdfPage.renderingState == 3) {
					if(typeof pdfPage.goToDeepLinkCB == "function") {
						pdfPage.goToDeepLinkCB();
					}} else {
						$scope.pdfCurrentPage = page;
						$scope.pdfViewerAPI.goToPage($scope.pdfCurrentPage);
					}
				}
		}
		
		function scrollToPdfSelectedSnippet(index) {
			
			if($scope.snippetMatches) {
				if($scope.snippetMatches[index]) {
					var matchConfig = $scope.snippetMatches[index];
					var pdfPage = $scope.pdfViewerAPI.viewer._pages[matchConfig.page-1];
					
					pdfPage.snippetIndex = index;
					pdfPage.selectSnippetCB = function() {
						var index = this.snippetIndex;
						$(".pdfHighlight.selected").removeClass("selected");
						var selectedSnippet = $(".snippet_"+index);
						if(selectedSnippet.length > 0) {
							selectedSnippet.addClass("selected");
							selectedSnippet[0].scrollIntoView();
						} 
						
						delete pdfPage.snippetIndex;
						delete pdfPage.selectSnippetCB;
					};
					
					if (pdfPage && pdfPage.renderingState == 3) {
						if(typeof pdfPage.selectSnippetCB == "function") {
							pdfPage.selectSnippetCB();
						}
					} else {
						$scope.pdfCurrentPage = matchConfig.page;
						$scope.pdfViewerAPI.goToPage($scope.pdfCurrentPage);
					}
				}  else {
					MessageService.showWarningMessage("PDF_SNIPPET_WAR",[]);
				}
			}
		}
		
		var pdfAllannotationPromisePoll;
		
		function getAllPdfAnnotations(postdata,options) {
			return AnnotationService.getAllPdfAnnotations($scope.documentId,postdata,options);
		}
		
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
		
		function getPdfAnnotations(options) {
			pendingRequests.cancel(pdfAllannotationPromisePoll);
			var postdata = {
					"clientId" : clientId,
					"annotationContext" :  $scope.annotationContext,
					"taskspaceId": $scope.tsId,
					"tsClientId" : $scope.tsClientId
			};
			
			pdfAllannotationPromisePoll = getAllPdfAnnotations(postdata,options);
			pdfAllannotationPromisePoll.then(function(pdfComments){
				if(pdfComments.status == 200 && pdfComments.data.Status) {
					$scope.pdfAnnotations = pdfComments.data.Annotations;
					_.each($scope.pdfAnnotations,function(pdfAnnotation,i){
						processSelectedConvTags(pdfAnnotation);
					});
					/*if($scope.pdfViewerAPI && $scope.pdfViewerAPI.viewer) {
						var pdfPage = $scope.pdfViewerAPI.viewer._pages[$scope.pdfCurrentPage-1];
						if($scope.pdfAnnotations && pdfPage && pdfPage.renderingState == 3) {
							var annotions = _.where($scope.pdfAnnotations, {"pageNum": $scope.pdfCurrentPage});
							pdfPage.annotationService.annotations = annotions;
							pdfPage.annotationService.renderAnnotaions();
						}
					}*/
				}
			}).finally(function() {
				if(_.isArray($scope.pdfAnnotations)) {
					var annotCount = $scope.pdfAnnotations.length;
					notifyAnnotationCount(annotCount);
 				}
	 		});			
			return pdfAllannotationPromisePoll;
		}
		
		function getAllDocDeepLinks(cb) {
			
			var postdata = {
				"objectType" : "Document",
				"objectId" : $scope.documentId,
				"clientId" : clientId
			};
			
			DeepLinkService.getAllLinksByTarget(postdata).then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					$scope.docDeepLinks = resp.data.Link;
					
					if(typeof cb == 'function') {
						cb($scope.docDeepLinks);
					}
				}
			});
		}
		
		$scope.pdfCommentOnclick = function($event,annot) {
			if ($event) {
				//$event.preventDefault();
			    $event.stopPropagation();
			}
			
			var pdfPage = $scope.pdfViewerAPI.viewer._pages[annot.pageNum-1];
			if(pdfPage) {
				pdfPage.CustomRenderCB = function() {
					var $pdfWrap = $('div.pdf-viewr[data-id="'+$scope.viewerId+'"]');
					$pdfWrap.find('.pdfHighlight.cmtActive').removeClass("cmtActive");
					$pdfWrap.find('.pdfScreenshot.screenshotActive').removeClass("screenshotActive");
					$pdfWrap.find(".vdvc_comment_selected").removeClass("vdvc_comment_selected");
					$('div[data-id="'+annot.id+'"]').addClass("vdvc_comment_selected");
					var cmt = $('div[annot-id="'+annot.id+'"]');
					if(cmt.length > 0){
						if($event && annot.type == "Screenshot") {
							cmt.addClass("screenshotActive");
						} else if(annot.type != "Screenshot") {
							cmt.addClass("cmtActive");
						}
						cmt[0].scrollIntoView(true);
						
						$pdfWrap[0].scrollTop -= 20;
					}
				};
				
				if(pdfPage.renderingState == 3) {
					pdfPage.CustomRenderCB();
				} else {
					$scope.pdfCurrentPage = annot.pageNum;
					$scope.pdfViewerAPI.goToPage($scope.pdfCurrentPage);
				}
			} else if(annot.type == "Pagenote") {
				var $pdfWrap = $('div.pdf-viewr[data-id="'+$scope.viewerId+'"]');
				$pdfWrap.find(".vdvc_comment_selected").removeClass("vdvc_comment_selected");
				$('div[data-id="'+annot.id+'"]').addClass("vdvc_comment_selected");
			}
			
		};
		
		
		$scope.isPdfIsRendered = false;
		
		
		function scrollToComment() {
			if(!_.isEmpty($scope.commentId) && ((state.current.name == "taskspace.list.task" && $stateParams.d && $scope.documentId == $stateParams.d) || (state.current.name == "taskspace.list.task" && !$stateParams.d) || state.current.name != "taskspace.list.task")) {
				var commentChangeTimer1 =  $timeout(function() {
					$scope.showComments = true;
				/*	var cmtEl = $('div[data-id="'+$scope.commentId+'"]').find(".comment-crd");
					if($scope.element && cmtEl.length > 0 ) {
						cmtEl = $scope.element.find('div[data-id="'+$scope.commentId+'"] .comment-crd');
						cmtEl.trigger("click");
						cmtEl.find('.comment-in textarea').focus();
					} else if($scope.el && cmtEl.length > 0 ) {
						cmtEl = $scope.el.find('div[data-id="'+$scope.commentId+'"] .comment-crd');
						cmtEl.trigger("click");
						cmtEl.find('.comment-in textarea').focus();
					} else if(cmtEl.length == 0){
						MessageService.showErrorMessage("ANNOTATION_NOT_FOUND",[$scope.commentId]);
					}*/
					goToComment(null,$scope.commentId);
					$timeout.cancel(commentChangeTimer1);
					$scope.commentId = null;
	        	 },1);
			}
		}
		
		$scope.$watch('pdfAnnotations', function (newVal, oldVal) {
			
			if(newVal.length > 0) {
				scrollToComment();
				var annot = newVal[newVal.length-1];
				if(annot && annot.isNew) {
					$('div[data-id="'+annot.id+'"]').find(".comment-crd").trigger("click");
				}
			}
        	
		}, false);
		
		
		$scope.$watch('showComments', function (newVal, oldVal) {
			
			if(newVal !== oldVal) {
				onResize();
			}
		});
		
		$scope.$watch("isPdfIsRendered", function (newValue, oldValue) {
			if(newValue) {
				 var obj = {
						 "objectId":$scope.documentId,
						 "type":"Document",
						 "docType" : "pdf"
				 };
				$scope.$emit("objectLoaded",obj);
			}
		});
		
		$scope.onPDFProgress = function (operation, state, value, total, message) {
			if(operation === "render" && value === 1) {
				if(state === "success") {
					
					$scope.pdfCurrentPage = 1;
					$scope.pdfTotalPages = $scope.pdfViewerAPI.getNumPages();
					$scope.isLoading = false;
					
					if(!$scope.isPdfIsRendered) {
						var tim = $timeout(function() {
							
							if (commonService.DocSnippets &&  commonService.DocSnippets.snippets
								&& commonService.DocSnippets.snippets.length > 0 && commonService.selectedSnippet) {
								try{
									var snippet = commonService.DocSnippets.snippets[commonService.selectedSnippet];
									onSnippetChanged(snippet,commonService.selectedSnippet);
								}catch (e) {
									// TODO: handle exception
								}
								/*if(snippet.type == "annotations" && snippet.commentId) {
									$scope.showComments = true;
									var conv = $('div[data-convId="'+snippet.commentId+'"]').find('.comment-conv-txt');
									$('div[data-convId="'+snippet.commentId+'"]').closest('.comment-crd').trigger("click");
									if(conv && conv.length > 0) {
										DocFactory.highlightTextByRegex(conv[0],[snippet],0);
									}	
								} 
								
								if(snippet.type == "content") {
									scrollToPdfSelectedSnippet(0);
								}*/
							}
							
							if($stateParams.commentId) {
								$scope.showComments = true;
								var pdfCmtEl = $('div[data-convId="'+$stateParams.commentId+'"]').closest('.comment-crd');
								if(pdfCmtEl) {
									pdfCmtEl.trigger("click");
									pdfCmtEl.find('.comment-in textarea').focus();
								}
							}
							
							if($stateParams.d && $scope.documentId == $stateParams.d && $stateParams.da) {
								$scope.showComments = true;
								//var pdfCmtEl = $('div[data-convId="'+$stateParams.da+'"]').closest('.comment-crd');
								var pdfCmtEl = $('div[data-id="'+$stateParams.da+'"]');
								if(pdfCmtEl) {
									pdfCmtEl.addClass("vdvc_comment_selected");
								    pdfCmtEl[0].scrollIntoView(true);
								    var timer1 = $timeout(function() {
								    	$(pdfCmtEl).find(".comment-hdr").trigger("click");
								    	var timer2 = $timeout(function() {
									    	pdfCmtEl.find('.comment-in textarea').focus();
									    	$timeout.cancel(timer2);
									    }, 100);
								    	$timeout.cancel(timer1);
								    }, 0);
								}
							}
							
							if(commonService.linkInfo && (commonService.linkInfo.linkUniqueId || commonService.linkInfo.annotationId)) {
								scrollToPdfDeepLink(commonService.linkInfo);
							}
							$scope.isPdfIsRendered = true;
							$scope.pdfViewer["isScreenshotEnabled"] = false;
							$timeout.cancel(tim);
						 }, 100);
					}
				} else {
					//alert("Failed to render 1st page!\n\n" + message);
					$scope.isLoading = false;
				}
			} else if(operation === "download" && state === "loading") {
				$scope.downloadProgress = (value / total) * 100.0;
				
			} else {
				if(state === "failed") {
					//alert("Something went really bad!\n\n" + message);
				}
			}
			
			if(operation === "render" && state === "success" && !$scope.isLoading) {
				var pdfPage = $scope.pdfViewerAPI.viewer.getPageView(value-1);
				
				if(typeof pdfPage.CustomRenderCB == "function") {
					pdfPage.CustomRenderCB();
				}
				
				if(typeof pdfPage.selectSnippetCB == "function") {
					pdfPage.selectSnippetCB();
				}
				
				if(typeof pdfPage.goToDeepLinkCB == "function") {
					pdfPage.goToDeepLinkCB();
				}
			}
		};

		$scope.fit = function() {
			$scope.pdfViewerAPI.OnScaleChanged("auto");
		};
		
		$scope.onPDFPageChanged = function (cb) {
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
		
		
		function pdfTextHighlightCB(data,type,saveResolve) {
			opencomment = ((type == 'comment') || (type == 'sharehighlight') || (type == 'screenshot') ? true : false);
			var isExists = _.where($scope.pdfAnnotations, {id: data.uid});
			if(_.isArray(isExists) && isExists.length == 0) {
				var annot = {};
				
				annot.comment = "";
				annot.conversations = [];
				annot.pageNum = data.pageNum;
				annot.creationDate = moment.utc();
				annot.id = data.uid;
				annot.type = "Highlight";
				annot.contextType = "Highlight";
				if(type === 'comment') {
					annot.contextType = "Annoatate";
				}
				if(type === 'screenshot') {
					annot.type = "Screenshot";
					annot.contextType = "Screenshot";
					annot.screenshotUrl = data.screenShotSrc;
					annot.screenshotInfo = data.screenshotInfo;
				}
				annot.coordinates = data.coordinates;
				annot.isNew = true;
				annot.user = $scope.userinfo["UserName"] ? $scope.userinfo["UserName"] : "";
				if(!_.isEmpty(data.text)){
					annot["annotatedText"] = data.text;
				}
				
				if(!_.isEmpty(data.htmlTxt)){
					annot["formatedText"] = AnnotationService.turndownHtml(data.htmlTxt);
					
					console.log(annot["formatedText"] );
				}
				
				
				/*var rootCmnt = {};
				rootCmnt.comment = "";
				rootCmnt.id = data.uid;
				rootCmnt.type = "Text";
				rootCmnt.creationDate = moment.utc();
				rootCmnt.user = $scope.userinfo["UserName"] ? $scope.userinfo["UserName"] : "";*/
				/*$scope.pdfAnnotations.push(annot);*/
				
				$scope.addPdfTextComment(annot).then(function(result){
					if (result.status == 200 && result.data.Status) {
						if(type == "sharehighlight") {
							$scope.getDocAnnotationLink($scope.doc,annot);
							$scope.pdfViewer.isScreenshotEnabled = false;
						}
						saveResolve.resolve(annot);
					} else {
						saveResolve.reject(null);
					}
				},function(error) {
					saveResolve.reject(error);
				});
				
				$scope.showComments = $scope.showComments ? $scope.showComments : opencomment;
			}
		}
		
		function pdfTextDeepLinkCB(data,saveResolve) {
			var modalInstance = $uibModal.open({
				  animation: true,
			      templateUrl: 'app/components/DeepLink/DeepLinkModal.html',
			      controller: 'DeepLinkModalController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'dl',
			      scope: $scope,
			      backdrop: false,
			      resolve: {
			    	  sourceInfo : function() {
			    		  var info = {
			    			"type" : angular.copy($scope.doc._type),
			    			"obj" : angular.copy($scope.doc),
			    			"uid" : data.uid,
			    			"context" : $scope.docContext,
			    			"pageNumber" : data.pageNum,
			    			"coordinates" : data.coordinates,
			    			"linkOnCreate" : function(linkInfo) {
			    				
			    				data.id = linkInfo.id;
			    				data.contextType ="DeepLink";
			    				saveResolve.resolve(data);
			    				getAllDocDeepLinks();
			    			}
			    		  };
			    		  return info;
			    	  }
			      }
			 });
			
			 modalInstance.result.then(function (linkInfo) {
				 
			 }, function () {
				 saveResolve.reject(null);
			 });
		}
		
		$scope.hidePdfLinkInfo = function() {
			$('[data-id="'+$scope.viewerId+'"]').find('.pdf-link-info').hide();
		};
		
		$scope.showPdfLinkInfo = function(event,linkId) {
			
			if(event) {
				event.stopPropagation();
				var H = $('[data-id="'+$scope.viewerId+'"]').find('.pdf-link-info').outerHeight();
			    var W = $('[data-id="'+$scope.viewerId+'"]').find('.pdf-link-info').outerWidth();
	    		var pdfH = $('.pdf-viewr[data-id="'+$scope.viewerId+'"] pdf-viewer').innerHeight(); 
	    		var pdfW = $('.pdf-viewr[data-id="'+$scope.viewerId+'"] pdf-viewer').innerWidth(); 
	    		var x = event.clientX - $('.pdf-viewr[data-id="'+$scope.viewerId+'"]').offset().left; 
	    		var y = (event.clientY - $('.pdf-viewr[data-id="'+$scope.viewerId+'"]').offset().top) - (H+$(event.target).outerHeight());
				if(!isNaN(x)) {
					if(W > pdfW) {
						$('[data-id="'+$scope.viewerId+'"]').find('.pdf-link-info').css({"width":pdfW+"px"});
					}
					if((x+W) > pdfW) {
						x = (x-W);
					}
					if(x < 0) {
						x = 0;
					}
				} 
				if(!isNaN(y)) {
					if(y < 0) {
						y = (event.clientY - $('.pdf-viewr[data-id="'+$scope.viewerId+'"]').offset().top) + $(event.target).outerHeight();
					}
				}
				
			    $('[data-id="'+$scope.viewerId+'"]').find('.pdf-link-info').css({"display":"block","top":y+"px","left":x+"px" });
			    
			    DeepLinkService.getLinkById(linkId,clientId).then(function(resp) {
			    	
			    	if(resp.status == 200 && resp.data.Status) {
			    		$scope.linkInfo = resp.data.Link.info;
			    		$scope.linkInfo.url = resp.data.Link.url;
			    	}
			    });
			}
		};
		
		$scope.addAnnotation = function(data,type,saveResolve) {
			
			if(data && data.coordinates && 
			   (_.indexOf(data.coordinates,null) == -1 || 
				_.indexOf(data.coordinates,Infinity) == -1 || 
				_.indexOf(data.coordinates,-Infinity) == -1 )) {
				
				if ($scope.isGlobalDoc) {
					pdfSelectionConfig = {
							"data" : data,
							"type" : type,
							"saveResolve" : saveResolve
					};
					
					globlaDocSaveConfirmation("Documents in the Common Repository cannot be annotated or tagged or linked. Choose the folder where a local copy of the document will be saved");
					
					if(saveResolve) {
						saveResolve.reject("Documents in the Common Repository cannot be annotated");
					}
					return false;
				}
				
				var postdata = {
						"documentId": $scope.documentId,
						"clientId": clientId
				};
				
				switch(type) {
				case "highlight":
				case "comment":
				case "sharehighlight":
				case "screenshot":
					AnnotationService.getUidforPdfAnnotation(postdata).then(function(uid){  
						if (uid.status == 200 && uid.data.Status) {
							data.uid = uid.data.Annotations;
							pdfTextHighlightCB(data,type,saveResolve);
						}
					},function() {
						
					});
					
					break;
				case "deepLink":
					AnnotationService.getUID().then(function(response){
						if (response.status == 200 && response.data.Status) {
							data.uid = response.data.UniqueId;
							pdfTextDeepLinkCB(data,saveResolve);
						}
					});
					break;
				}
				
				
			} else {
				MessageService.showErrorMessage("PDF_TXT_SELECTION_ERR");
			}
		};
		
		$scope.cancelPdfAddComment = function($event,annot) {
			if($event) {
				$event.stopPropagation(); 
				delete $scope.docCommentReply[annot.id];
				delete $scope.selectedAnnotTags[annot.id];
				var $docWrap = $('div.pdf-viewr[data-id="'+$scope.viewerId+'"]');
				$docWrap.find(".vdvc_comment_selected").removeClass('vdvc_comment_selected');
			}
			if(annot.conversations && annot.conversations.length == 1 && annot.isNew) {
				$('.pdfHighlight[annot-id="'+annot.id+'"]').remove();
				$('.vdvc_comment[data-id="'+annot.id+'"]').remove();
				$scope.pdfAnnotations.splice($scope.pdfAnnotations.length-1,1);
			}
			clearMentionedUsers(annot.id);
		};
		
		function addPdfAnnotation(annot,newComment) {
			var savePromise;
			var postdata = {
					"docType" : $scope.doc.docType,
					"resourceType" : "document",
					"resourceId" : $scope.documentId,
					"resourceSubType" : "pdf",
					"cellKey" : annot.pageNum,
					"clientId" : $scope.doc.clientId,
					"note" : newComment,
					"annotationContext": annot.annotationContext,
					"taskspaceId": annot.taskspaceId,
					"tsClientId" : annot.tsClientId,
					"annotationDictionary" : {
						"type" : "texthighlight",
						"coordinates" : annot.coordinates,
						"uniqueId" : annot.id
					}

				};
			if(!_.isEmpty(annot.annotatedText)){
				postdata["annotatedText"] = annot.annotatedText;
			}
			if(!_.isEmpty(annot.screenshotInfo)){
				postdata["screenshotInfo"] = annot.screenshotInfo;
			}
			if(!_.isEmpty(annot.screenshotUrl)){
				postdata["screenshotUrl"] = annot.screenshotUrl;
			}
			postdata["contextType"] = annot.contextType;
			postdata["context"] = annot.context;
			postdata["webAnnotation"] = false;
			
			savePromise = AnnotationService.save(JSON.stringify(postdata));
			
			savePromise.then(function(response){
				if (response.status == 200 && response.data.Status) {
					delete annot.isNew ;
					delete $scope.docCommentReply[annot.id];
					$scope.$emit("UPDATE_ANNOTATED_DATE_ON_TS",{"documentId" : $scope.doc.id,"annotatedDate" : response.data.Annotations.createdOn });
					if($scope.doc.isPdfDBAnnotation) {
						annot = response.data.Annotations;
					}
					$scope.pdfAnnotations.push(annot);
					if(_.isArray($scope.pdfAnnotations)) {
						var annotCount = $scope.pdfAnnotations.length;
						notifyAnnotationCount(annotCount);
					}
					if(annot.id) {
						$timeout(function() {
							var annotEl =  $('div[data-id="'+annot.id+'"]');
							$('div.pdf-viewr[data-id="'+$scope.viewerId+'"]').find(".vdvc_comment_selected").removeClass("vdvc_comment_selected");
							if(annotEl.length > 0 && opencomment) {
								annotEl.addClass("vdvc_comment_selected");
								annotEl[0].scrollIntoView(true);
								$('div[data-id="'+annot.id+'"]').find(".comment-hdr").trigger("click");
								//annotEl.find('.comment-in textarea').focus();
								var rootComment = _.findWhere(annot.conversations,{"rootComment" : true});
								if(rootComment) {
									$timeout(function() {
										$("div[data-convid='"+rootComment.id+"']").find(".fa-pencil").trigger("click");
									}, 10);
								}
							}
						}, 1000);
						
					}
				}
			});
			
			return savePromise;
		}
		
		function addPdfConversation(annot,newComment,newCommentTags,cb) {
			var postdata = {};
			var saveReplyPromise;
			postdata.pageNumber = annot.pageNum;
			postdata.annotationId = annot.id;
			postdata.comment = newComment;
			postdata.clientId = clientId;
			postdata["contextType"] = annot.contextType;
			postdata["context"] = annot.context;
			postdata["webAnnotation"] = false;
			postdata["tags"] = newCommentTags;
			
			if($scope.enableAtMention && !_.isEmpty($scope.mentionUser[annot.id])) {
				postdata['mentions'] = $scope.mentionUser[annot.id].join(",");
			}
			
			saveReplyPromise = AnnotationService.addPdfComment($scope.documentId,postdata);
			saveReplyPromise.then(function(resp) {
				 if(resp.status == 200 && resp.data.Status) {
					 $scope.$emit("UPDATE_ANNOTATED_DATE_ON_TS",{"documentId" : $scope.doc.id,"annotatedDate" : resp.data.Annotations.modifiedOn });
					 var respAnnot = resp.data.Annotations;
					 if(respAnnot && !_.isEmpty(respAnnot.conversations)) {
						 if(!annot.conversations) {
							 annot.conversations = [];
						 }
						 var newConv = _.findWhere(respAnnot.conversations,{"note":newComment});
						 annot.conversations.push(newConv);
						 
						 if(typeof cb === "function") {
							 cb(newConv);
						 }
					 }
					 delete $scope.docCommentReply[annot.id];
					 clearMentionedUsers(annot.id);
					 renderPdfCommentVQ(annot);
				 }
			});
			
			return saveReplyPromise;
		}
		
		$scope.addPdfTextComment = function(annot) {
			var newComment  = angular.copy($scope.docCommentReply[annot.id]);
			delete $scope.docCommentReply[annot.id];
			annot.context = $scope.docContext;
			annot.annotationContext = $scope.annotationContext;
			annot.taskspaceId = $scope.tsId;
			annot.tsClientId = $scope.tsClientId;
			var newCommentTags = [];
			if(!_.isEmpty($scope.selectedAnnotTags[annot.id])) {
				newCommentTags = $scope.selectedAnnotTags[annot.id];
				delete $scope.selectedAnnotTags[annot.id];
			}
			_.each(newCommentTags,function(newCommentTag){
				delete newCommentTag.isNew;
				delete newCommentTag.isTag;
			});
			if(annot.isNew) {
				return addPdfAnnotation(annot,newComment);
			} else {
				if(!_.isEmpty(newComment)){
					annot.contextType = "Reply";
					return addPdfConversation(annot,newComment,newCommentTags);
				}
			}
		};
		
		var pdfCommentFormatedText = {};
		
		$scope.getPdfAnnotationText = function(annot) {
			
			if(pdfCommentFormatedText[annot.id]) {
				return pdfCommentFormatedText[annot.id];
			}
			
			var annotText = "<div style='border:none;background:#fff;white-space: pre-wrap;word-break: break-word;'>"+(annot.highligtedText || annot.annotatedText || ' ')+"</div><div style='height:1px;background:#000;margin:15px;'></div>";
			
			/*if(!annot.formatedText) {
				if(!_.isEmpty(annot.highligtedText)) {
					annotText = "<div style='border:none;background:#fff;white-space: pre-wrap;word-break: break-word;'>"+annot.highligtedText+"</div><div style='height:1px;background:#000;margin:15px;'></div>";
				} else {
					annotText = "<div style='border:none;background:#fff;white-space: pre-wrap;word-break: break-word;'>"+annot.annotatedText+"</div><div style='height:1px;background:#000;margin:15px;'></div>";
				}
			}
			
			var mtoHtml = '<div class="markdown-body">'+markdown.makeHtml(annot.formatedText  || annot.highligtedText || annot.annotatedText)+'</div>';
			var mtoHtmlWithcss = Juicify.inlineCss(mtoHtml,Juicify.cssMap[Juicify.markdownCssUrl]);
			annotText += mtoHtmlWithcss;*/
			
			pdfCommentFormatedText[annot.id] = "<div class='markdown-body'>"+annotText+"</div>";
			return pdfCommentFormatedText[annot.id];
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
			clearSelection();
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
			
			$timeout(function() {
				$scope.$apply(function () {
					$scope.pdfURL = "";
					$scope.pdfFile = document.getElementById('file_input').files[0];
				});
			}, 0);
		};
		
		$scope.onPDFPassword = function (reason) {
			return prompt("The selected PDF is password protected. PDF.js reason: " + reason, "");
		};


		$scope.trustSrc = function(src) {
			return $sce.trustAsResourceUrl(src);
		};
		
		
		$scope.pdfMenuItems = {
			state : false
		};
		
		$scope.addComment = function(type) {
			if ($scope.isGlobalDoc) {
				selectionConfig.type = "comment";
				globlaDocSaveConfirmation("Documents in the Common Repository cannot be annotated or tagged or linked. Choose the folder where a local copy of the document will be saved");
				return false;
			}
			$scope.annotType = type;
			$scope.pdfMenuItems.state = type;
		};
		
		$scope.enableScreenshot = function(type) {
			$scope.pdfViewer.isScreenshotEnabled = true;
			var $pdfWrap = $('div.pdf-viewr[data-id="'+$scope.viewerId+'"]');
			$pdfWrap.find('.pdfHighlight.cmtActive').removeClass("cmtActive");
			$pdfWrap.find('.pdfScreenshot.screenshotActive').removeClass("screenshotActive");
			$pdfWrap.find(".vdvc_comment_selected").removeClass("vdvc_comment_selected");
			$timeout(function () {
				$(".cancel-edit-comment").trigger("click");
				$scope.pdfViewer.startScreenshot($scope.pdfCurrentPage);
			},500);
		};
		
		$scope.createScreenshot = function(data,type,saveResolve) {
			$scope.addAnnotation(data, type, saveResolve);
		};
	    
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
		
		function getDocViewButtons() {
	    	var docViewButtons = userService.getUserSettingsKeyList("docView_");
			if(!_.isEmpty(docViewButtons) && $scope.userinfo && !$scope.userinfo.isGuestUser) {
				_.each(docViewButtons,function(item){
					var docViewButton = {};
					switch(item) {
					case "docView_AdvanceToolBar":
						docViewButton = userService.getUiSetting(item);
						$scope.AdvanceToolBarBtn = docViewButton;
						break;
					case "docView_DownloadBtn":
						docViewButton = userService.getUiSetting(item);
						$scope.DownloadBtn = docViewButton;
						if(!_.isEmpty($scope.doc) && $scope.doc.docType === "WebResource") {
							$scope.DownloadBtn.show = false;
							$scope.DownloadBtn.isEnabled = false;
						}
						break;
					}
				});
				
			}
	    }

		if($state.current.name == "inbox"){
			$scope.isDocInInbox = true;
		}

		var initTimer;
		initTimer = $timeout(function() {
			showDocument();
		},100); 
		
		
		
		
		
		
		// Mention changes
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
		
		function downLoad() {
			if($scope.DownloadBtn.isEnabled) {
				var clientId = $scope.doc.clientId ? $scope.doc.clientId : "g";
				if($scope.documentId && clientId) {
					DocFactory.download($scope.documentId,clientId);
				}
			}
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
	}
})();

