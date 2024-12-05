;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('ShareLinkController',ShareLinkController);
	
	ShareLinkController.$inject = ['$state','$stateParams','_','$rootScope','$scope','appData','$uibModalInstance',
	                                      '$uibModal','defautlDateFormat','AnnotationDigestService',
	                                      'systemSttings','settings','digestFor','linkInfo','TagService',
	                                      'DeepLinkService','APIUserMessages','$confirm','MessageService',
	                                      'VDVCConfirmService','$timeout','userService',
	                                      'commonService','DocFactory','$templateCache','$compile','$window',
	                                      'LinkedInService','markdown','TaskSpaceService','MailService',
	                                      'CopyService','taskspaceInfo','SlackService','OneDriveService',
	                                      'NotionService','ShareOptionsService','WebexService'];

	function ShareLinkController($state,$stateParams,_,$rootScope,$scope,appData,$uibModalInstance,$uibModal,
			defautlDateFormat,AnnotationDigestService,systemSttings,settings,digestFor,linkInfo,TagService,
			DeepLinkService,APIUserMessages,$confirm,MessageService,VDVCConfirmService,$timeout,
			userService,commonService,DocFactory,$templateCache,$compile,$window,LinkedInService,markdown,TaskSpaceService,MailService,
			CopyService,taskspaceInfo,SlackService,OneDriveService,NotionService,ShareOptionsService,WebexService) {
		
		var slc = this;
		var appdata = appData.getAppData();
		$scope.$emit("PageName",{"userName":appdata.UserName,"pageName":$state.current.pageName});
		var config = {};
		var sharedUserList = [];
		var selectedProvisionalUsers = [];
		var selectedTS = {};
		var selectedTSDoc = {};
		var origin = $stateParams.origin ? decodeURIComponent($stateParams.origin) : "chrome-extension://oojabgademjndedjpcnagfgiglcpolgd";
		var windowClass = "";
			
		slc.enabledShareOptionsList = ShareOptionsService.getEnabledShareOptionsList(false);
		slc.importantShareOptionsList = [];
		slc.unImportantShareOptionsList = [];
		slc.showLoader = true;
		slc.tsId = $stateParams.tsId;
		slc.clientId = $stateParams.tsc;
		slc.digestFor = digestFor.digestFor;
		slc.isDigestNameEdited = false;
		slc.isDigestDescriptionEdited = false;
		slc.selectedPublishAsNote = false;
		slc.selectedPublishAsPdf = false;
		slc.selectedPublishAsLink = false;
		slc.showdocLink = false;
		slc.digestName = digestFor.digestName;
		slc.digestNameCopy = angular.copy(digestFor.digestName);
		slc.noteName = "";
		slc.pdfName = "";
		slc.emailUsers = [];
		slc.emailSubject = "";
		
		slc.digestDescription = "";
		slc.digestDescriptionCopy = "";
		slc.linkInfo = angular.copy(linkInfo);
		slc.linkType = {"type" : "Public"};
		slc.linkTarget = {"target" : "Document"};
		slc.getChangeToLinkType = getChangeToLinkType;
		slc.focusLink = false;
		slc.filterOptions = {};
		slc.digestMetaInfoOptions = {};
		slc.groupByOptionList = angular.copy(AnnotationDigestService.getGroupByUIOptions());
		slc.groupByOption = slc.groupByOptionList[0];
		slc.enableBorderOptionList = angular.copy(AnnotationDigestService.getEnableBorderUIOptions());
		slc.enableBorderOption = slc.enableBorderOptionList[0];
		slc.imagePositionOptionList = angular.copy(AnnotationDigestService.getImagePositionUIOptions());
		slc.imagePositionOption = slc.imagePositionOptionList[0];
		slc.displayOrderOptionList = angular.copy(AnnotationDigestService.getDisplayOrderUIOptions());
		slc.displayOrderOption = slc.displayOrderOptionList[0];
		slc.displayRepliesOptionList = angular.copy(AnnotationDigestService.getDisplayRepliesUIOptions());
		slc.filterOptions.displayRepliesOption = slc.displayRepliesOptionList[0];
		slc.selectedTemplate = {};
		slc.sortOptionList = angular.copy(AnnotationDigestService.getSortUIOptions());
		slc.sortConfig = angular.copy(AnnotationDigestService.getSortUIOptionValues());
		slc.selectedSortOption = slc.sortOptionList[0];
		slc.selectedSortOrder = slc.sortConfig[1];
		slc.tableOfContentsUIOptions = angular.copy(AnnotationDigestService.getTableOfContentsUIOptions());
		slc.tableOfContents = slc.tableOfContentsUIOptions[0];
		slc.tableOfContentsHeading = !_.isEmpty(systemSttings) && systemSttings.value ? systemSttings.value : angular.copy(AnnotationDigestService.getTableOfContentsHeading());
		slc.filterOptions.startDate = null;
		slc.filterOptions.endDate = null;
		slc.tags =[];	    
	    slc.docHierarchy = [];
		
	    slc.digestNameError = false;
		slc.digestNameErrorMessage = "";
		slc.closeShareLinkPopup = true;
		
		slc.validateDigestName = validateDigestName;
		slc.validateDigestDescription = validateDigestDescription;
		slc.toggleEditDigestName = toggleEditDigestName;
		slc.cancelEditDigestName = cancelEditDigestName;
		slc.disableSaveEditedDigestName = disableSaveEditedDigestName;
		slc.saveEditedDigestName = saveEditedDigestName;
		slc.toggleEditDigestDescription = toggleEditDigestDescription;
		slc.cancelEditDigestDescription = cancelEditDigestDescription;
		slc.disableSaveEditedDigestDescription = disableSaveEditedDigestDescription;
		slc.saveEditedDigestDescription = saveEditedDigestDescription;
		slc.cancel = cancel;
		slc.ok = create;
		slc.copySuccess = copySuccess;
		slc.copyFail = copyFail;
		slc.ShareAsEmbed = ShareAsEmbed;
		slc.ShareOnSocialMedia = ShareOnSocialMedia;
		slc.updateDigestLink = updateDigestLink;
		slc.checkAndPublishAsSelectedType = checkAndPublishAsSelectedType;
		slc.cancelsaveAsSelectedType = cancelsaveAsSelectedType;
		slc.saveAsSelectedType = saveAsSelectedType;
		slc.saveHtmlAsSelectedType = saveHtmlAsSelectedType;
		slc.ShowShareOnNotion = ShowShareOnNotion;
		slc.ShowShareOnSlack = ShowShareOnSlack;
		slc.ShowShareOnTeams = ShowShareOnTeams;
		slc.ShowShareOnWebex = ShowShareOnWebex;
		slc.ShowShareOnOnenote = ShowShareOnOnenote;
		var fileBaseUrl = commonService.getContext();
		slc.commentIconUrl = fileBaseUrl+"/app/assets/icons/digest_comment.png";
		
		slc.setDigesMinMaxWidth = AnnotationDigestService.setDigesMinMaxWidth;
		slc.getTitleStyles = AnnotationDigestService.getTitleStyles;
		slc.alternateImageStyles = AnnotationDigestService.alternateImageStyles;
		slc.setRepDigestStyles = AnnotationDigestService.setRepDigestStyles;
		var trustedAnnotatedText = {};
		
		$scope.$on("USERSTATE_SHAREOPTIONSSETTINGS_UPD",function(event, msg){
			$timeout(function() {
				slc.enabledShareOptionsList = ShareOptionsService.getEnabledShareOptionsList(false);
				slc.importantShareOptionsList = _.where(slc.enabledShareOptionsList,{"important" : true});
				slc.unImportantShareOptionsList = _.where(slc.enabledShareOptionsList,{"important" : false});
			}, 100);
		});
		
		if($state.current.name == "sharelinks") {
			commonService.hideNaveBar();
		}
		
		slc.getAnnotatedText = function (annotation) {
			if(!trustedAnnotatedText[annotation.annotationId]) {
				trustedAnnotatedText[annotation.annotationId] = AnnotationDigestService.getAnnotatedText(annotation,slc.digestMetaInfoOptions);
			}
			return trustedAnnotatedText[annotation.annotationId];
		};
		
		slc.formatCreatedDate = AnnotationDigestService.formatCreatedDate;
		slc.formatComment = AnnotationDigestService.formatComment;
		
		slc.getTitle = getTitle;
		slc.annotationsDigestSettings = annotationsDigestSettings;
		slc.changeLinkType = changeLinkType;
		slc.getLinkTypeMsg = getLinkTypeMsg;
		slc.showPublishAs = showPublishAs;
		
		slc.showMoreShareOptionsList = showMoreShareOptionsList;
		slc.showShareOption = showShareOption;
		slc.showMoreShareOption = showMoreShareOption;
		slc.toggleMoreShareOptionsMenu = toggleMoreShareOptionsMenu;
		slc.showArrow = showArrow;
		slc.isMoreShareOptionsListOpen = false;
		slc.showDrpArrow = false;
		function validateDigestName(event) {
			if(_.isEmpty(slc.digestName)) {
				setErrorMsg("digestName","invalid");
			} else {
				slc.digestNameError = false;
				slc.digestNameErrorMessage = "";
				if((event.relatedTarget && !$(event.relatedTarget).hasClass( "update-digest-name-btn" ) && !$(event.relatedTarget).hasClass( "cancel-update-digest-name-btn" )) && !disableSaveEditedDigestName()) {
					cancelEditDigestName();
				} else if($(event.relatedTarget).hasClass( "update-digest-name-btn" )){
					event.preventDefault();
				    event.stopPropagation();
					saveEditedDigestName();
				} else {
					slc.isDigestNameEdited = false;
					slc.digestName = angular.copy(slc.digestNameCopy);
				}
			}
		}
		
		function validateDigestDescription(event) {
			if((event.relatedTarget && !$(event.relatedTarget).hasClass( "update-digest-description-btn" ) && !$(event.relatedTarget).hasClass( "cancel-update-digest-description-btn" )) && !disableSaveEditedDigestDescription()) {
				cancelEditDigestDescription();
			} else if($(event.relatedTarget).hasClass( "update-digest-description-btn" )){
				event.preventDefault();
			    event.stopPropagation();
				saveEditedDigestDescription();
			} else {
				slc.isDigestDescriptionEdited = false;
				slc.digestDescription = angular.copy(slc.digestDescriptionCopy);
			}
		}
		
		function confirmCancelPublish(cb) {
			var modalInstance = $uibModal.open({
			      animation: true,
			      templateUrl: 'app/components/AnnotationDigest/create/ConfirmPublishDigest/ConfirmPublishDigest.tmpl.html',
			      controller: 'ConfirmPublishDigestController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'cpdc',
			      backdrop: 'static',
			      size : 'md',
			      resolve: {
			    	  ConfirmData :function() {
			    		  return {"confirmFor" : "cancel", "isAnnotationOptionSelected" : true};
			    	  }
			      }
			});
			modalInstance.result.then(function (results) {	
				if(typeof cb == "function"){
					cb(results);
				}
			});
		}
		
		function focusDigestName() {
			$timeout(function() {
				$("#digest-name-textbox").focus();
			}, 100);
		}
		
		function toggleEditDigestName() {
			if(!slc.isDigestDescriptionEdited) {
				slc.isDigestNameEdited = !slc.isDigestNameEdited;
				focusDigestName();
			} else if(!disableSaveEditedDigestDescription()) {
				cancelEditDigestDescription();
			} else {
				slc.isDigestDescriptionEdited = false;
				slc.isDigestNameEdited = !slc.isDigestNameEdited;
				focusDigestName();
			}
		}
		
		function saveEditedDigestName() {
			var postdata = {
	    			"digestName" : slc.digestName,
	    			"linkId" : slc.linkInfo.id,
	    			"linkClientId" : $stateParams.tsc
				};
			DeepLinkService.updateDigestName(postdata).then(function(resp) {
				if (resp.status == 200 && resp.data.Status) {
					slc.isDigestNameEdited = false;
					slc.digestNameCopy = angular.copy(slc.digestName);
					MessageService.showSuccessMessage("DIGEST_NAME_UPDATE");
				}
			});
		}
		
		function cancelEditDigestName() {
			if(!disableSaveEditedDigestName()) {
				confirmCancelPublish(function(results) {
					if(!_.isEmpty(results.action) && results.action == "save") {
						saveEditedDigestName();
					}
					if(!_.isEmpty(results.action) && results.action == "ignore") {
						slc.digestName = angular.copy(slc.digestNameCopy);
						slc.isDigestNameEdited = false;
					}
				});
			} else {
				slc.digestName = angular.copy(slc.digestNameCopy);
				slc.isDigestNameEdited = false;
			}
		}
		
		function disableSaveEditedDigestName() {
			var status = false;
			if(!_.isEmpty(slc.digestName) && !_.isEmpty(slc.digestNameCopy) && slc.digestName.trim() == slc.digestNameCopy.trim()) {
				status = true;
			} else if(_.isEmpty(slc.digestName)) {
				status = true;
			}
			return status;
		}
		
		function focusDigestDescription() {
			$timeout(function() {
				$("#digest-description-textarea").focus();
			}, 100);
		}
		
		function toggleEditDigestDescription() {
			if(!slc.isDigestNameEdited) {
				slc.isDigestDescriptionEdited = !slc.isDigestDescriptionEdited;
				focusDigestDescription();
			} else if(!disableSaveEditedDigestName()) {
				cancelEditDigestName();
			} else {
				slc.digestName = angular.copy(slc.digestNameCopy);
				slc.isDigestNameEdited = false;
				slc.digestNameError = false;
				slc.digestNameErrorMessage = "";
				slc.isDigestDescriptionEdited = !slc.isDigestDescriptionEdited;
				focusDigestDescription();
			}
		}
		
		function saveEditedDigestDescription() {
			var postdata = {
	    			"digestDescription" : slc.digestDescription,
	    			"linkId" : slc.linkInfo.id,
	    			"linkClientId" : $stateParams.tsc
				};
			DeepLinkService.updateDigestDescription(postdata).then(function(resp) {
				if (resp.status == 200 && resp.data.Status) {
					slc.isDigestDescriptionEdited = false;
					slc.digestDescriptionCopy = angular.copy(slc.digestDescription);
					MessageService.showSuccessMessage("DIGEST_DESCRIPTION_UPDATE");
				}
			});
		}
		
		function cancelEditDigestDescription() {
			if(!disableSaveEditedDigestDescription()) {
				confirmCancelPublish(function(results) {
					if(!_.isEmpty(results.action) && results.action == "save") {
						saveEditedDigestDescription();
					}
					if(!_.isEmpty(results.action) && results.action == "ignore") {
						slc.digestDescription = angular.copy(slc.digestDescriptionCopy);
						slc.isDigestDescriptionEdited = false;
					}
				});
			} else {
				slc.digestDescription = angular.copy(slc.digestDescriptionCopy);
				slc.isDigestDescriptionEdited = false;
			}
		}
		
		function disableSaveEditedDigestDescription() {
			var status = false;
			if(!_.isEmpty(slc.digestDescription) && !_.isEmpty(slc.digestDescriptionCopy) && slc.digestDescription.trim() == slc.digestDescriptionCopy.trim()) {
				status = true;
			} else if(_.isEmpty(slc.digestDescription) && _.isEmpty(slc.digestDescriptionCopy)) {
				status = true;
			}
			return status;
		}
		
		function getTitle() {
		    if(!_.isEmpty($stateParams.title)) {
				return $stateParams.title;
			}
			if(slc.digestFor == "DigestDocument") {
				var objectType = "DOCUMENT";
				if(digestFor.documentInfo && digestFor.documentInfo.objectInfo && digestFor.documentInfo.objectInfo.docType == "WebResource"){
					objectType = "WEBPAGE";
				}
				if(digestFor.documentInfo && digestFor.documentInfo.digestDocAnnotId ) {
					return "SHARE ANNOTATION ON " + objectType;
				}
				return "SHARE ANNOTATIONS ON " + objectType;
			} else if(slc.digestFor == "AnnotationDigest"){
				return "SHARE DIGEST";
			}
			
			return "ANNOTATION DIGEST SETTINGS";
		}
		
		function handleDigestSettingsResp(digestSettingsRespData) {
			if(!_.isEmpty(digestSettingsRespData)) {
				if (digestSettingsRespData.action === 'update') {
					slc.linkInfo = digestSettingsRespData.linkInfo;
					init();
			    }
				if (digestSettingsRespData.action === 'delete') {
					cancel();
			    }
			}
		}
		
		function moveWindow(width,height,parentWidth,parentHeight,diffHeight) {
			var left = parentWidth / 2 - width / 2;
		    var top = parentHeight /2 - height / 2;
		    $window.moveTo(left,top+diffHeight);
		}
		var screenWidth = 0;
		var screenHeight = 0;
		function checkAndCalcDiffHeight(width,height,parentWidth,parentHeight) {
			var diffHeight = 0;
			if(parentWidth < width) {
				parentWidth = screenWidth;
			}
			if(parentHeight < (height+70)) {
				parentHeight = screenHeight;
			}
			diffHeight = screenHeight - parentHeight;
			if(diffHeight <= 0) {
				diffHeight = 0;
			}
			return diffHeight;
    	}
		
		function resizeWindow(status,resizeFor) {
			if(!_.isEmpty(status)) {
				var parentWidth = 0;
				var parentHeight = 0;
				parentWidth = AnnotationDigestService.extParentWidth;
				parentHeight = AnnotationDigestService.extParentHeight;
				screenWidth = $window.screen.width;
				screenHeight = $window.screen.availHeight || $window.screen.height;
				
				if(screenWidth < parentWidth) {
					parentWidth = screenWidth;
				}
				if(screenHeight < parentHeight) {
					parentHeight = screenHeight;
				}
				
				var width = 0;
				var height = 0;
				if(status == "closed") {
					width = angular.copy(AnnotationDigestService.shareLinkPopupSizes["shareLinks"].width);
					height = angular.copy(AnnotationDigestService.shareLinkPopupSizes["shareLinks"].height);
					if(parentWidth < width) {
						parentWidth = screenWidth;
					}
					if(parentHeight < (height+70)) {
						parentHeight = screenHeight;
					}
					var diffHeight = checkAndCalcDiffHeight(width,height,parentWidth,parentHeight);
					$window.resizeTo(width,height+70);
					moveWindow(width,height+70,parentWidth,parentHeight,diffHeight);
				} else if(status == "opened") {
					width = angular.copy(AnnotationDigestService.shareLinkPopupSizes["shareLinks"].width);
					height = angular.copy(AnnotationDigestService.shareLinkPopupSizes["shareLinks"].height);
					var timer1 = $timeout(function() {
						if(resizeFor == "pdf") {
							height = height+$(".publish-as-pdf").parent().outerHeight();
						} else if(resizeFor == "numicinote") {
							height = height+$(".publish-as-numici-note").parent().outerHeight();
						}
						if(parentWidth < width) {
							width = parentWidth;
						}
						if(parentHeight < (height+70)) {
							height = parentHeight-70;
						}
						var diffHeight = checkAndCalcDiffHeight(width,height,parentWidth,parentHeight);
						$window.resizeTo(width,height+70);
						moveWindow(width,height+70,parentWidth,parentHeight,diffHeight);
						$timeout.cancel(timer1);
					}, 100);
					
				}  
			}
		}
		
		function changeLinkType(type) {
			hideAllPublishOptions();
			var changeToLinkType = getChangeToLinkType(type);
			var linkTypeMsg = getLinkTypeMsg(changeToLinkType);
			var confirmationMsgText = linkTypeMsg + "<br/><br/>Would like to change the Link type?"
			if($state.current.name == "sharelinks") {
				 windowClass = "change-link-type-modal";
			}
			var VDVCConfirmModalInstance = VDVCConfirmService.open({text : confirmationMsgText,title : "Change Link Type to "+changeToLinkType,actionButtonText : "CHANGE",closeButtonText : "CANCEL",windowClass : windowClass});
    		VDVCConfirmModalInstance.result.then(function() {
    			if($state.current.name == "sharelinks") {
					$rootScope.$broadcast("fit-to-popup",{"status" : "closed", "parent" : "sharelinks","fitFor" : "shareLinks"});
				}
    			var postdata = {
	    			"linkType" : changeToLinkType,
	    			"linkId" : slc.linkInfo.id,
	    			"linkClientId" : $stateParams.tsc
				};
				return DeepLinkService.updateLinkType(postdata).then(function(resp) {
					if (resp.status == 200 && resp.data.Status) {
						if(!_.isEmpty(resp.data.Link)) {
							if(!_.isEmpty(resp.data.Link.linkObj) && !_.isEmpty(resp.data.Link.linkObj.linkType)){
								slc.linkType.type = resp.data.Link.linkObj.linkType	
							}
							MessageService.showSuccessMessage("DIGEST_LINK_TYPE_UPDATE");
							return resp.data.Link;
	    				} else {
	    					return {};
	    				}
					}
				});
    		},function() {
    			if($state.current.name == "sharelinks") {
					$rootScope.$broadcast("fit-to-popup",{"status" : "closed", "parent" : "sharelinks","fitFor" : "shareLinks"});
				}
    		});
    		VDVCConfirmModalInstance.rendered.then(function(){
				if($state.current.name == "sharelinks") {
					$rootScope.$broadcast("fit-to-popup",{"status" : "opened", "windowClass" : windowClass,"fitFor" : "changeLinkType"});
				}
	        });
		}
		
		function annotationsDigestSettings() {
			hideAllPublishOptions();
			if($state.current.name == "sharelinks") {
				 windowClass = "digest-settings-modal-window";
			}
			var modalInstance = $uibModal.open({
			      animation: true,
			      templateUrl: 'app/components/AnnotationDigest/create/AnnotationDigest.html',
			      controller: 'AnnotationDigestController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'ad',
			      windowClass: windowClass,
			      backdrop: 'static',
			      size: "lg",
			      resolve: {
				      taskspaceInfo: function() {
						    return {
								"tsId" : slc.tsId,
								"tsClientId" : slc.clientId
							}
						  },
				      systemSttings: function() {
						     return commonService.getNavMenuItems({type: "GlobalSettings",key:"DigestTableOfContents"}).then(function(resp) {
								if(resp.data.Status && !_.isEmpty(resp.data.listAppKeyValues)) {
									return resp.data.listAppKeyValues[0];
								} else {
									return {};
								}
							 });
						  },
			    	  settings : function() {
			    		  return TaskSpaceService.getTaskSpaceState(slc.clientId , slc.tsId).then(function(resp) {
			    			  if (resp.status == 200 && resp.data.Status) {
			    				var settings = resp.data.TaskspaceState;
			    				settings.digestsettings = AnnotationDigestService.getDocuDigetFilters();
			  					return settings;
			    			  }
			    		  });
			    	  },
			    	  digestFor: function() {
			    		  return digestFor;
			    	  },
			    	  linkInfo: function() {
			    		  var postdata;
			    		  if(digestFor.digestFor == "AnnotationDigest") {
			    			  postdata = {
			    					  "objectType" : "AnnotationDigest",
			    					  "linkObjectId" : slc.tsId,
			    					  "clientId" : slc.clientId,
			    			  };
			    		  } else {
			    			  postdata = {
			    					  "objectType" : "DigestDocument",
			    					  "linkObjectId" : slc.tsId,
			    					  "clientId" : slc.clientId,
			    					  "documentId" : digestFor.documentInfo.objectId,
			    					  "digestDocAnnotId" : digestFor.documentInfo.digestDocAnnotId
			    			  };
			    		  }
		    			  return DeepLinkService.checkLinkExists(postdata).then(function(resp) {
			    			  if (resp.status == 200 && resp.data.Status) {
			    				  if(!_.isEmpty(resp.data.Link)) {
			    					  return resp.data.Link;
			    				  } else {
			    					  return {};
			    				  }
			    			  } 
			    		  }); 
			    	  }
			      }
			    });
			
			modalInstance.result.then(function (result) {	
				handleDigestSettingsResp(result);
				if($state.current.name == "sharelinks") {
					$rootScope.$broadcast("fit-to-popup",{"status" : "closed", "parent" : "sharelinks","fitFor" : "shareLinks"});
				}
			},function () {	
				if($state.current.name == "sharelinks") {
					$rootScope.$broadcast("fit-to-popup",{"status" : "closed", "parent" : "sharelinks","fitFor" : "shareLinks"});
				}
			});
			modalInstance.rendered.then(function(){
				if($state.current.name == "sharelinks") {
					$rootScope.$broadcast("fit-to-popup",{"status" : "opened", "windowClass" : windowClass,"fitFor" : "digestSettings"});
				}
	        });
		}
		
		function getLinkTypeMsg(type) {
			var objectType = "document";
			if(digestFor.documentInfo && digestFor.documentInfo.objectInfo && digestFor.documentInfo.objectInfo.docType == "WebResource"){
				objectType = "webpage";
			}
			if(type == "Public") {
				return "Public Link: Anyone with the Link can view the annotations on the "+objectType;
			} else if(type == "Private") {
				return "Private Link: Only users with access to the Taskspace can view the annotations on the "+objectType;
			}
		}
		
		function getChangeToLinkType(type) {
			if(type == "Public") {
				return "Private";
			} else if(type == "Private") {
				return "Public";
			}
		}
		
		function showPublishAs() {
			var status = false;
			if(slc.digestFor == 'DigestDocument') {
				status = true;
			}
			return status;
		}
		
		function showMoreShareOptionsList() {
			var status = false;
			if(slc.importantShareOptionsList.length < slc.enabledShareOptionsList.length && slc.unImportantShareOptionsList.length > 0) {
				status = true;
			}
			return status;
		}
		
		function showShareOption(ShareOption) {
			var status = false;
			var importantShareOption = _.findWhere(slc.importantShareOptionsList,{"field" : ShareOption});
			if(importantShareOption && importantShareOption.important) {
				status = true;
			}
			return status;
		}
		
		function toggleMoreShareOptionsMenu($event){
			slc.showDrpArrow = !slc.showDrpArrow;
			slc.isMoreShareOptionsListOpen = !slc.isMoreShareOptionsListOpen;
		}
		function showArrow() {
			return slc.showDrpArrow;
		}
		function showMoreShareOption(ShareOption) {
			var status = false;
			var unImportantShareOption = _.findWhere(slc.unImportantShareOptionsList,{"label" : ShareOption});
			if(unImportantShareOption && !unImportantShareOption.important) {
				status = true;
			}
			return status;
		}

		function getShareCommentaryTextForSocialMedia(includeAnnotationDigestContent,includeDigestContent,cb) {
			AnnotationDigestService.getDigestShareCommentaryTxt(digestFor,slc.digestDescription,slc.filterOptions,slc.displayOrderOption,slc.linkInfo.id,$stateParams.tsc,includeAnnotationDigestContent,includeDigestContent,function(shareCommentaryTxt){
				if(typeof cb == "function") {
					cb(shareCommentaryTxt);
				}
			});
		}
		
		function setErrorMsg (field,type,Message) {
			if(field === "digestName" && type === "invalid") {
				slc.digestNameError = true;
				slc.digestNameErrorMessage = "Please Enter Digest Name.";
			}
		}
		
		function configDigestDataFromDigestLink() {
			if(!_.isEmpty(slc.linkInfo.properties)) {
				config = slc.linkInfo.properties.digestSettings;
			} else if(!_.isEmpty(slc.linkInfo.linkObj.properties)) {
				config = slc.linkInfo.linkObj.properties.digestSettings;
			} else {
				config = _.isEmpty(settings.digestsettings) ? AnnotationDigestService.getDigestFilters() : settings.digestsettings;
			}
			if(!_.isEmpty(slc.linkInfo.linkObj)) {
				slc.digestName = slc.linkInfo.linkObj.properties.digestSettings.digestName;
				slc.digestNameCopy = angular.copy(slc.digestName);
				slc.noteName = angular.copy(slc.digestName);
				slc.pdfName = angular.copy(slc.digestName);
				slc.emailSubject = angular.copy(slc.digestName);
				slc.digestDescription = slc.linkInfo.linkObj.properties.digestSettings.digestDescription
				slc.digestDescriptionCopy = angular.copy(slc.digestDescription);
				slc.linkType.type = angular.copy(slc.linkInfo.linkObj.linkType);
				if(!_.isEmpty(slc.linkInfo.linkObj.toEmailIds)) {
					slc.emailUsers = angular.copy(slc.linkInfo.linkObj.toEmailIds);
				}
				slc.linkTarget.target = angular.copy(slc.linkInfo.linkObj.linkTarget) || "Digest ";
				slc.selectedPublishAsLink = true;
			}
			slc.filterOptions = angular.copy(config.filterOptions);
			slc.digestMetaInfoOptions = angular.copy(config.digestMetaInfoOptions);
			slc.filterOptions.startDate = moment(slc.filterOptions.startDate,defautlDateFormat,true).isValid() ? moment(slc.filterOptions.startDate,defautlDateFormat).toDate() : null;
			slc.filterOptions.endDate =  moment(slc.filterOptions.endDate,defautlDateFormat,true).isValid() ? moment(slc.filterOptions.endDate,defautlDateFormat).toDate() : null;
			var enableBorderOptionIndex = _.findIndex(slc.enableBorderOptionList,{"value" : config.enableBorder});
			if(enableBorderOptionIndex != -1) {
				slc.enableBorderOption = slc.enableBorderOptionList[enableBorderOptionIndex];
			}
			var imagePositionIndex = _.findIndex(slc.imagePositionOptionList,{"value" : config.imagePosition});
			if(imagePositionIndex != -1) {
				slc.imagePositionOption = slc.imagePositionOptionList[imagePositionIndex];
			}
			var displayOrderIndex = _.findIndex(slc.displayOrderOptionList,{"value" : config.displayOrder});
			if(displayOrderIndex != -1) {
				slc.displayOrderOption = slc.displayOrderOptionList[displayOrderIndex];
			}
			var displayRepliesIndex = _.findIndex(slc.displayRepliesOptionList,{"value" : config.filterOptions.displayReplies});
			if(displayRepliesIndex != -1) {
				slc.filterOptions.displayRepliesOption = slc.displayRepliesOptionList[displayRepliesIndex];
			}
			slc.tableOfContents = config.tableOfContents;
			slc.tableOfContentsHeading = config.tableOfContentsHeading;
		}
		
		function sendDigestResp() {
			if(!$window.opener) {
				console.log("Parent window closed");
				return;
			}
			var oAuthResponse = {type:"share_links",code:"Share Links",state:"Success",data:{}};
			$window.opener.postMessage(oAuthResponse,origin);
			$window.close();
		}
		
		function cancel() {
			if($state.current.name == "sharelinks") {
				sendDigestResp();
			} else {
				$uibModalInstance.dismiss('cancel');
			}
		}
		
		function create(save) {
			var filterOptions = angular.copy(slc.filterOptions);
			if(slc.filterOptions.startDate) {
				filterOptions.startDate = moment(slc.filterOptions.startDate).format(defautlDateFormat);
			} else {
				filterOptions.startDate = slc.filterOptions.startDate;
			}
			if(slc.filterOptions.endDate) {
				filterOptions.endDate = moment(slc.filterOptions.endDate).format(defautlDateFormat);
			} else {
				filterOptions.endDate = slc.filterOptions.endDate;
			}
			
			var groupby = slc.groupByOption ? slc.groupByOption.value : null;
			
			filterOptions["allTagAnnotations"] = true;
			filterOptions.displayReplies = filterOptions.displayRepliesOption.value;
			delete filterOptions.displayRepliesOption;
			
			settings.digestsettings = {
					"filterOptions":filterOptions,
					"groupBy" : slc.groupByOption.value,
					"digestMetaInfoOptions" : slc.digestMetaInfoOptions,
					"selectedTemplate" : slc.selectedTemplate ? slc.selectedTemplate.id : null,
					"enableBorder" : slc.enableBorderOption.value,
					"imagePosition" : slc.imagePositionOption.value,
					"displayOrder" : slc.displayOrderOption.value,
					"save" : save	
			};
			$uibModalInstance.close(settings);
		}
		
		function preProcessDigestDataForLink() {
			var filterOptions = angular.copy(slc.filterOptions);
			
			filterOptions.endDate = moment(slc.filterOptions.endDate).format(defautlDateFormat);
			filterOptions.startDate = moment(slc.filterOptions.startDate).format(defautlDateFormat);
						
			if( !moment(filterOptions.startDate,defautlDateFormat,true).isValid()) {
				filterOptions.startDate = null;
			}
			if( !moment(filterOptions.endDate,defautlDateFormat,true).isValid()) {
				filterOptions.endDate = null;
			}
			filterOptions.displayReplies = filterOptions.displayRepliesOption.value;
			delete filterOptions.displayRepliesOption;
			
			filterOptions["allTagAnnotations"] = true;
			var groupBy = slc.groupByOption ? slc.groupByOption.value : null;
			
			var digestSettings = {
					"digestName": slc.digestName, 
					"digestDescription": slc.digestDescription,
					"objectId": settings.taskspaceId, 
					"clientId": settings.clientId,
					"context" : "taskspace",
					"filterOptions" : filterOptions,
					"groupBy": slc.groupByOption.value,
					"digestMetaInfoOptions": slc.digestMetaInfoOptions,
					"selectedTemplate": slc.selectedTemplate ? slc.selectedTemplate.id : null,
					"enableBorder" : slc.enableBorderOption.value,
					"imagePosition" : slc.imagePositionOption.value,
					"displayOrder" : slc.displayOrderOption.value
			};
			
			if (digestFor.digestFor == "DigestDocument") {
				if (digestFor.documentInfo) {
					digestSettings.documents = [digestFor.documentInfo.objectId];
				}
				// To update existing settings while update.
				digestSettings.tableOfContents = "notInclude";
				digestSettings.groupBy = "document";
			}
			
			return digestSettings;
		}
		
		function updateLink(linkObj,clientId) {
			return DeepLinkService.updateLink(linkObj,clientId);
		}
		
		function updateDigestDocAnnot(linkObj,clientId) {
			return DeepLinkService.updateDigestDocAnnot(linkObj);
		}
		
		function updateDigestLink(toEmailIds,cb) {
			var digestSettings = preProcessDigestDataForLink();
			var lnk = angular.copy(slc.linkInfo);
			var updateLinkPromise;
			lnk.linkObj.properties.digestSettings.digestName = slc.digestName;
			lnk.linkObj.properties.digestSettings.digestDescription = slc.digestDescription;
			if(toEmailIds) {
				lnk.linkObj.toEmailIds = toEmailIds;
			}
			lnk.linkObj.linkType = slc.linkType.type;
			lnk.linkObj.linkTarget = slc.linkTarget.target;
			lnk.linkObj.properties.digestSettings = digestSettings;
			
			if(digestFor.documentInfo && digestFor.documentInfo.digestDocAnnotId) {
				var postdata = {
						clientId : settings.clientId,
						digestDocAnnotId : digestFor.documentInfo.digestDocAnnotId,
						link : lnk.linkObj
				};
				updateLinkPromise = updateDigestDocAnnot(postdata);
			} else {
				updateLinkPromise = updateLink(lnk.linkObj,settings.clientId); 
			}
			
			if(updateLinkPromise) {
				updateLinkPromise.then(function(resp) {
					if(resp.status == 200 && resp.data.Status) {
						slc.linkInfo = resp.data.Link;
						configDigestDataFromDigestLink();
						MessageService.showSuccessMessage("DIGEST_LINK_UPDATE");
						if(typeof cb == "function") {
							cb();
						}
					}
				});
			}
		}
		
		function copySuccess() {
			slc.focusLink = false;
			APIUserMessages.info("Link copied to clipboard.");
			slc.focusLink = true;
			$timeout(function() {
				$uibModalInstance.dismiss('cancel');
			}, 100);
		}
		
		function copyFail(err) {
			console.log(err);
		}
		
		function ShowShareOnNotion(mediaChannel){
			var status = false;
			if(mediaChannel == "Notion") {
				if(appdata.UserSettings.additionalNavigation_Notion && appdata.UserSettings.additionalNavigation_Notion == 'Enabled') {
					status = true;
				}
			}
			return status;
		}
		
		function ShowShareOnSlack(mediaChannel){
			var status = false;
			if(mediaChannel == "Slack") {
				if(appdata.UserSettings.additionalNavigation_Slack && appdata.UserSettings.additionalNavigation_Slack == 'Enabled') {
					status = true;
				}
			}
			return status;
		}
		
		function ShowShareOnTeams(mediaChannel){
			var status = false;
			if(mediaChannel == "Teams") {
				var isImportantShareOption = _.findWhere(slc.importantShareOptionsList,{"label" : mediaChannel})
				if(isImportantShareOption && appdata.UserSettings.additionalNavigation_OneDrive && appdata.UserSettings.additionalNavigation_OneDrive == 'Enabled') {
					status = true;
				}
			}
			return status;
		}
		
		function ShowShareOnWebex(mediaChannel){
			var status = false;
			if(mediaChannel == "Webex") {
				if(appdata.UserSettings.additionalNavigation_Webex && appdata.UserSettings.additionalNavigation_Webex == 'Enabled') {
					status = true;
				}
			}
			return status;
		}
		
		function ShowShareOnOnenote(mediaChannel){
			var status = false;
			if(mediaChannel == "onenote") {
				var isImportantShareOption = _.findWhere(slc.importantShareOptionsList,{"label" : "Onenote"})
				if(isImportantShareOption && appdata.UserSettings.additionalNavigation_OneDrive && appdata.UserSettings.additionalNavigation_OneDrive == 'Enabled') {
					status = true;
				}
			}
			return status;
		}
		
		function ShareAsEmbed() {
			slc.showLoader = true;
			hideAllPublishOptions();
			
			var fromSource = "FromNumici";
			if($state.current.name == "sharelinks") {
				 windowClass = "share-as-embed-modal-window";
				 fromSource = "FromExt";
			}
			var modalInstance = $uibModal.open({
				  animation: true,
				  templateUrl: 'app/components/AnnotationDigest/create/Embed/Embed.html',
				  controller: 'EmbedController',
				  appendTo : $('.rootContainer'),
				  controllerAs: 'ec',
				  windowClass: windowClass,
				  backdrop: 'static',
				  size : 'md',
				  resolve: {
					  DigestLinkinfo :function() {
						  return slc.linkInfo;
					  }
				  }
			});
			modalInstance.result.then(function (result) {
				if(slc.closeShareLinkPopup) {
					cancel();
				} else if($state.current.name == "sharelinks") {
					$rootScope.$broadcast("fit-to-popup",{"status" : "closed", "parent" : "sharelinks","fitFor" : "shareLinks"});
				}
			},function () {	
				if($state.current.name == "sharelinks") {
					$rootScope.$broadcast("fit-to-popup",{"status" : "closed", "parent" : "sharelinks","fitFor" : "shareLinks"});
				}
			});
			modalInstance.rendered.then(function(){
				slc.showLoader = false;
				if($state.current.name == "sharelinks") {
					$rootScope.$broadcast("fit-to-popup",{"status" : "opened", "windowClass" : windowClass, "fitFor" : "ShareAsEmbed"});
				}
	        });
		}
		
		function ShareOnSocialMedia(mediaChannel) {
			slc.showLoader = true;
			hideAllPublishOptions();
			if(mediaChannel == "Twitter" || mediaChannel == "Facebook" || mediaChannel == "WhatsApp") {
				PostToSocialMedia(false,mediaChannel);
			} else if(mediaChannel == "LinkedIn") {
				if(appdata.UserSettings.additionalNavigation_LinkedIn && appdata.UserSettings.additionalNavigation_LinkedIn == 'Enabled') {
					if(appdata.hasLinkedInAuth){
						PostToSocialMedia(true,mediaChannel);
					} else {
						confirmAndShareOnSocialMedia(mediaChannel);
					}
				} else {
					PostToSocialMedia(false,mediaChannel);
				}	
			} else if(mediaChannel == "Notion") {
				if(appdata.UserSettings.additionalNavigation_Notion && appdata.UserSettings.additionalNavigation_Notion == 'Enabled') {
					if(appdata.hasNotionAuth){
						PostToSocialMedia(true,mediaChannel);
					} else {
						confirmAndShareOnSocialMedia(mediaChannel);
					}
				}
			} else if(mediaChannel == "Slack") {
				if(appdata.UserSettings.additionalNavigation_Slack && appdata.UserSettings.additionalNavigation_Slack == 'Enabled') {
					if(appdata.hasSlackAuth){
						PostToSocialMedia(true,mediaChannel);
					} else {
						confirmAndShareOnSocialMedia(mediaChannel);
					}
				}
			} else if(mediaChannel == "Teams") {
				if(appdata.UserSettings.additionalNavigation_OneDrive && appdata.UserSettings.additionalNavigation_OneDrive == 'Enabled') {
					if(appdata.hasTeamsAuth){
						PostToSocialMedia(true,mediaChannel);
					} else {
						confirmAndShareOnSocialMedia(mediaChannel);
					}
				}
			} else if(mediaChannel == "Webex") {
				if(appdata.UserSettings.additionalNavigation_Webex && appdata.UserSettings.additionalNavigation_Webex == 'Enabled') {
					if(appdata.hasWebexAuth){
						PostToSocialMedia(true,mediaChannel);
					} else {
						confirmAndShareOnSocialMedia(mediaChannel);
					}
				}
			}
		}
		
		function SaveToOnenote(content,publishedData) {
			if($state.current.name == "sharelinks") {
				 windowClass = "browse-onenote-modal-window";
			}
			var modalInstance = $uibModal.open({
				  animation: true,
				  templateUrl: 'app/components/Onenote/BrowseOnenotes/BrowseOnenote.html',
				  controller: 'BrowseOnenoteController',
				  appendTo : $('.rootContainer'),
				  controllerAs: 'bonc',
				  windowClass: windowClass,
				  backdrop: 'static',
				  size : 'lg',
				  resolve: {
					  DigestLinkinfo :function() {
						  return slc.linkInfo;
					  },
					  noteBookList : ['$q','OnenoteService',function($q,OnenoteService) {
						  var deferred = $q.defer();
						  OnenoteService.getNotebookList().then(function(resp){
								if(resp.status == 200 && resp.data.Status) {
									var noteBookList = {"noteBooks" : resp.data.Data,"userLastUsedNotebookSection" : resp.data.userLastUsedNotebookSection};
									deferred.resolve(noteBookList);
								} else {
									slc.showLoader = false;
									deferred.resolve("");
								}
						  }, function error(errorResp) {
							  slc.showLoader = false;
							  deferred.resolve("");
						  });
						  return deferred.promise;
					  }],
					  DigestContent : function() {
                          var object = slc.digestFor;
                          if(slc.digestFor == "DigestDocument" && digestFor.documentInfo && digestFor.documentInfo.digestDocAnnotId) {
                        	  object = "TSDocAnnotation";
                          } else if (slc.digestFor == "DigestDocument"){
                        	  object = "TSDocument";
                          }
                          var fromSource = "FromNumici";
                          if($state.current.name == "sharelinks") {
							 windowClass = "post-to-socialmedia-modal-window";
							 fromSource = "FromExt";
                          }
						  return {"content" : content, "fromSource":fromSource,"object":object};
					  }
				  }
			});
			modalInstance.result.then(function (result) {	
				handleDigestSettingsResp(result);
				if(slc.closeShareLinkPopup) {
					cancel();
				} else if($state.current.name == "sharelinks") {
					$rootScope.$broadcast("fit-to-popup",{"status" : "closed", "parent" : "sharelinks","fitFor" : "shareLinks"});
				}
			},function () {	
				if($state.current.name == "sharelinks") {
					$rootScope.$broadcast("fit-to-popup",{"status" : "closed", "parent" : "sharelinks","fitFor" : "shareLinks"});
				}
			});
			modalInstance.rendered.then(function(){
				slc.showLoader = false;
				if($state.current.name == "sharelinks") {
					$rootScope.$broadcast("fit-to-popup",{"status" : "opened", "windowClass" : windowClass, "fitFor" : publishedData.publishFor});
				}
	        });
		}
		
		function PostToSocialMedia(authEnabled, mediaChannel) {
			slc.showLoader = true;
			var includeAnnotationDigestContent = false;
			var includeDigestContent = false;
			getShareCommentaryTextForSocialMedia(includeAnnotationDigestContent,includeDigestContent,function(shareCommentaryTxt){
				slc.showLoader = true;
				var fromSource = "FromNumici";
				if($state.current.name == "sharelinks") {
					 windowClass = "post-to-socialmedia-modal-window";
					 fromSource = "FromExt";
				}
				var modalInstance = $uibModal.open({
					  animation: true,
					  templateUrl: 'app/components/AnnotationDigest/create/Post/PostToSocialMedia/PostToSocialMedia.html',
					  controller: 'PostToSocialMediaController',
					  appendTo : $('.rootContainer'),
					  controllerAs: 'ptsmc',
					  windowClass: windowClass,
					  backdrop: 'static',
					  size : 'lg',
					  resolve: {
						  DigestLinkinfo :function() {
							  return slc.linkInfo;
						  },
						  shareCommentaryText : function() {
							  return shareCommentaryTxt;
						  },
				    	  notionUserObjsTree : ['NotionService','$q',function(NotionService,$q) {
				    		  var deferred = $q.defer();
                              if(mediaChannel == "Notion") {
				    			  NotionService.getNotionUserObjTree().then(function(resp) {
					    			  if (resp.status == 200 && resp.data.Status) {
					    				  if(!_.isEmpty(resp.data.NotionObjects)) {
					    					  deferred.resolve(resp.data.NotionObjects);
					    				  }
					    			  } 
					    		  });
                              } else {
				    			  deferred.resolve([]);
                              }
			    			  return deferred.promise;
				    	  }],
				    	  webexUserRoomsData : ['WebexService','$q',function(WebexService,$q) {
				    		  var deferred = $q.defer();
                              if(mediaChannel == "Webex") {
				    			  WebexService.getWebexUserRooms().then(function(resp) {
					    			  if (resp.status == 200 && resp.data.Status) {
					    				  if(!_.isEmpty(resp.data.Rooms)) {
					    					  deferred.resolve(resp.data.Rooms);
					    				  }
					    			  }
					    		  });
                              } else {
				    			  deferred.resolve([]);
                              }
			    			  return deferred.promise;
				    	  }],
						  objInfo : function() {
                              var object = slc.digestFor;
                              if(slc.digestFor == "DigestDocument" && digestFor.documentInfo && digestFor.documentInfo.digestDocAnnotId) {
                            	  object = "TSDocAnnotation";
                              } else if (slc.digestFor == "DigestDocument"){
                            	  object = "TSDocument";
                              }
                              return {"fromSource":fromSource,"object":object};
                          },
						  socialMediaAuthInfo : function() {
							  return {"authEnabled":authEnabled,"mediaChannel":mediaChannel};
						  }
					  }
				});
				modalInstance.result.then(function (result) {	
					handleDigestSettingsResp(result);
					if(slc.closeShareLinkPopup) {
						cancel();
					} else if($state.current.name == "sharelinks") {
						$rootScope.$broadcast("fit-to-popup",{"status" : "closed", "parent" : "sharelinks","fitFor" : "shareLinks"});
					}
				},function () {	
					if($state.current.name == "sharelinks") {
						$rootScope.$broadcast("fit-to-popup",{"status" : "closed", "parent" : "sharelinks","fitFor" : "shareLinks"});
					}
				});
				modalInstance.rendered.then(function(){
					slc.showLoader = false;
					if($state.current.name == "sharelinks") {
						$rootScope.$broadcast("fit-to-popup",{"status" : "opened", "windowClass" : windowClass, "fitFor" : mediaChannel});
					}
		        });
			});
		}
		
		function confirmAndShareOnSocialMedia(mediaChannel) {
			slc.showLoader = false;
			var confirmationMsgTextLocal = "Would like to authorize Numici to post messages in "+mediaChannel+"?";
			var confirmationMsgText;
			if(mediaChannel == "LinkedIn") {
				var linkedInAuthUsrConfMsgText = _.findWhere(appdata.ShareLinkInfo,{"key":"linkedInAuthUsrConfMsgText"});
				confirmationMsgText = linkedInAuthUsrConfMsgText && linkedInAuthUsrConfMsgText.value ? linkedInAuthUsrConfMsgText.value : confirmationMsgTextLocal;
			} else if(mediaChannel == "Notion") {
				var notionAuthUsrConfMsgText = _.findWhere(appdata.ShareLinkInfo,{"key":"notionAuthUsrConfMsgText"});
				confirmationMsgText = notionAuthUsrConfMsgText && notionAuthUsrConfMsgText.value ? notionAuthUsrConfMsgText.value : confirmationMsgTextLocal;
			} else if(mediaChannel == "Slack") {
				var slackAuthUsrConfMsgText = _.findWhere(appdata.ShareLinkInfo,{"key":"slackAuthUsrConfMsgText"});
				confirmationMsgText = slackAuthUsrConfMsgText && slackAuthUsrConfMsgText.value ? slackAuthUsrConfMsgText.value : confirmationMsgTextLocal;
			} else if(mediaChannel == "Teams") {
				var teamsAuthUsrConfMsgText = _.findWhere(appdata.ShareLinkInfo,{"key":"teamsAuthUsrConfMsgText"});
				confirmationMsgText = teamsAuthUsrConfMsgText && teamsAuthUsrConfMsgText.value ? teamsAuthUsrConfMsgText.value : confirmationMsgTextLocal;
			} else if(mediaChannel == "onenote") {
				var onenoteAuthUsrConfMsgText = _.findWhere(appdata.ShareLinkInfo,{"key":"onenoteAuthUsrConfMsgText"});
				confirmationMsgText = onenoteAuthUsrConfMsgText && onenoteAuthUsrConfMsgText.value ? onenoteAuthUsrConfMsgText.value : confirmationMsgTextLocal;
			} else if(mediaChannel == "Webex") {
				var webexAuthUsrConfMsgText = _.findWhere(appdata.ShareLinkInfo,{"key":"webexAuthUsrConfMsgText"});
				confirmationMsgText = webexAuthUsrConfMsgText && webexAuthUsrConfMsgText.value ? webexAuthUsrConfMsgText.value : confirmationMsgTextLocal;
			}
			
    		var VDVCConfirmModalInstance = VDVCConfirmService.open({text : confirmationMsgText,title : "Confirm "+mediaChannel+" Authorization",actionButtonText : "AUTHORIZE NOW",closeButtonText : "AUTHORIZE LATER"});
    		VDVCConfirmModalInstance.result.then(function() {
				if(mediaChannel == "LinkedIn") {
    				LinkedInService.autherize(function(){
    					if(slc.closeShareLinkPopup) {
    						cancel();
    					}
    				});	
    			} else if(mediaChannel == "Notion") {
    				NotionService.autherize(function(){
    					if(slc.closeShareLinkPopup) {
    						cancel();
    					}
    				});
    			} else if(mediaChannel == "Slack") {
    				addToSlackWorkspace();
    			} else if(mediaChannel == "Teams") {
    				authorizeTeamsApp();
    			} else if(mediaChannel == "onenote") {
     				authorizeOnenoteApp();
     			} else if(mediaChannel == "Webex") {
    				WebexService.autherize(function(){
    					if(slc.closeShareLinkPopup) {
    						cancel();
    					}
    				});
    			}
    		},function() {
    			if(mediaChannel == "LinkedIn") {
    				PostToSocialMedia(false,mediaChannel);	
    			} else if(mediaChannel == "Slack" || mediaChannel == "Teams" || mediaChannel == "onenote") {
    				//do nothing
    			}
    		});
		}
		
		function addToSlackWorkspace() {
			SlackService.getSlackOauthUrl().then(function(resp) {
				if(resp.data.Status) {
					if($state.current.name == "sharelinks") {
						$window.open(resp.data.Data, '_blank');
					} else {
						$window.location.href = resp.data.Data;
					}
					if(slc.closeShareLinkPopup) {
						cancel();
					}
				}
			});
		}
		
		function authorizeTeamsApp() {
			var includeApps = [];
			includeApps.push("Teams");
			OneDriveService.autherize(includeApps,function(){
				if(slc.closeShareLinkPopup) {
					cancel();
				}
			});
		}
		
		function authorizeOnenoteApp() {
			var includeApps = [];
			includeApps.push("onenote");
			OneDriveService.autherize(includeApps,function(){
				if(slc.closeShareLinkPopup) {
					cancel();
				}
			});
		}
		
		function checkAndCreateLink(cb) {
			if(!_.isEmpty(slc.digestName) || slc.digestFor == "DigestDocument") {
				if(!_.isEmpty(slc.linkInfo.url)) {
					if(typeof cb == "function") {
						cb();
					}
				} else {
					var digestSettings = preProcessDigestDataForLink();
					var lnk = AnnotationDigestService.processLinkInfo(digestFor, settings.taskspaceId, settings.clientId, digestSettings);
					DeepLinkService.createLink(lnk).then(function(createLinkResp) {
						if(createLinkResp.status == 200 && createLinkResp.data.Status) {
							slc.linkInfo = createLinkResp.data.Link;
							if(!_.isEmpty(slc.linkInfo.properties)) {
								config = slc.linkInfo.properties.digestSettings;
							} else if(!_.isEmpty(slc.linkInfo.linkObj.properties)) {
								config = slc.linkInfo.linkObj.properties.digestSettings;
							} else {
								config = _.isEmpty(settings.digestsettings) ? AnnotationDigestService.getDigestFilters() : settings.digestsettings;
							}
							if(typeof cb == "function") {
								cb();
							}
						}
					});
				}
			}
		}
		
		function getDigestContent(saveflag, contenteditable) {
			return $timeout(function() {
				var templateUrl = 'app/components/AnnotationDigest/save/annotaion-digest-template-new.html';
				if(contenteditable){
					templateUrl = 'app/components/AnnotationDigest/save/annotaion-digest-template-contenteditable.html';
				}
				var roottemplateUrl = 'app/components/AnnotationDigest/save/digest-root.tpl.html';
				
				AnnotationDigestService.enableBorder = "";
				AnnotationDigestService.enableBorder = angular.copy(slc.enableBorderOption.value);
				var tmpl = '';
				var gptmpl = '';
				tmpl = '<annotaion-digest-template digest="slc.digestData"';
				gptmpl = '<annotaion-digest-group-template digest="slc.digestData"';
				var isDigestForAnnotation = false; 
				var numiciImage = appdata.numiciImage;
				var numiciLink = appdata.numiciLink;
				var numiciHeaderText = appdata.numiciHeaderTxt;
				var numiciFooterText = appdata.numiciFooterTxt;
				
				tmpl = tmpl+' numici-image="'+numiciImage+'"';
				gptmpl = gptmpl+' numici-image="'+numiciImage+'"';
				
				tmpl = tmpl+' numici-link="'+numiciLink+'"';
				gptmpl = gptmpl+' numici-link="'+numiciLink+'"';
				
				tmpl = tmpl+' numici-header-text="'+numiciHeaderText+'"';
				gptmpl = gptmpl+' numici-header-text="'+numiciHeaderText+'"';
				
				tmpl = tmpl+' numici-footer-text="'+numiciFooterText+'"';
				gptmpl = gptmpl+' numici-footer-text="'+numiciFooterText+'"';
				
				tmpl = tmpl+' show-numici-header="true"';
				gptmpl = gptmpl+' show-numici-header="true"';
				
				if(slc.digestFor == "DigestDocument") {
					if(digestFor.documentInfo && digestFor.documentInfo.digestDocAnnotId ) {
						isDigestForAnnotation = true;
					}
				}
				if(!isDigestForAnnotation && !_.isEmpty(slc.digestName)) {
					tmpl = tmpl+' digest-name="'+slc.digestName+'"';
					gptmpl = gptmpl+' digest-name="'+slc.digestName+'"';
				}
				
				var digestUrl = "";
				if(!_.isEmpty(slc.digestData) && slc.digestFor == "DigestDocument" && slc.digestMetaInfoOptions.documentLink) {
					digestUrl = AnnotationDigestService.getDigestUrlForDocuDigest(slc.groupByOption.value,slc.digestData);
				}
				tmpl = tmpl+' digest-url="'+digestUrl+'"';
				gptmpl = gptmpl+' digest-url="'+digestUrl+'"';
				
				if(!isDigestForAnnotation && !_.isEmpty(slc.digestDescription)) {
					var digestDescription = angular.copy(slc.digestDescription);
					digestDescription = digestDescription.replace(/(\r\n|\n|\r)/gm, "<br>").replace(/"/g,"&quot;");;
					tmpl = tmpl+' description="'+digestDescription+'"';
					gptmpl = gptmpl+' description="'+digestDescription+'"';
				}
				
				var displayReplies = slc.filterOptions.displayRepliesOption.value;
				if(!displayReplies) {
					displayReplies = slc.filterOptions.displayReplies;
				}
				if(!isDigestForAnnotation) {
					tmpl = tmpl+' data-digest-meta-info-options="slc.digestMetaInfoOptions"';
					gptmpl = gptmpl+' data-digest-meta-info-options="slc.digestMetaInfoOptions"';
				}
				
				tmpl = tmpl+' template-url="'+templateUrl+'" \
					data-content-editable="'+contenteditable+'"\
					task-space="taskspace"\
					title="true"\
					data-digest-for="slc.digestFor"\
					data-image-position="slc.imagePositionOption.value"\
					data-table-of-contents="slc.tableOfContents"\
					data-table-of-contents-heading="{{slc.tableOfContentsHeading}}"\
					data-display-order="slc.displayOrderOption.value"\
					data-display-replies="displayReplies"\
					data-enable-border="slc.enableBorderOption.value"\
					data-group-by="slc.groupByOption.value"\
				    data-set-diges-min-max-width= "slc.setDigesMinMaxWidth()"\
					data-get-title-styles = "slc.getTitleStyles()"\
					data-alternate-image-styles = "slc.alternateImageStyles()"\
					data-set-rep-digest-styles = "slc.setRepDigestStyles(digest,slc.digestMetaInfoOptions.image)"\
					data-get-annotated-text = "slc.getAnnotatedText(annotation)"\
					data-format-created-date = "slc.formatCreatedDate(dateValue)"\
					data-format-comment="slc.formatComment(annotation,comment)"\
			    	comment-icon-url = "slc.commentIconUrl"\
					></annotaion-digest-template>';
				
				gptmpl = gptmpl+' template-url="'+templateUrl+'" \
					data-content-editable="'+contenteditable+'"\
					task-space="taskspace"\
					data-digest-for="slc.digestFor"\
					data-image-position="slc.imagePositionOption.value"\
					data-table-of-contents="slc.tableOfContents"\
					data-table-of-contents-heading="{{slc.tableOfContentsHeading}}"\
					data-display-order="slc.displayOrderOption.value"\
					data-display-replies="displayReplies"\
					data-enable-border="slc.enableBorderOption.value"\
					data-group-by="slc.groupByOption.value"\
					data-set-diges-min-max-width= "slc.setDigesMinMaxWidth()"\
					data-get-title-styles = "slc.getTitleStyles()"\
					data-alternate-image-styles = "slc.alternateImageStyles()"\
					data-set-rep-digest-styles = "slc.setRepDigestStyles(digest,slc.digestMetaInfoOptions.image)"\
					data-get-annotated-text = "slc.getAnnotatedText(annotation)"\
					data-format-created-date = "slc.formatCreatedDate(dateValue)"\
					data-format-comment="slc.formatComment(annotation,comment)"\
			    	comment-icon-url = "slc.commentIconUrl"\
					></annotaion-digest-group-template>';
				
				var template = angular.element(tmpl);
				if(slc.groupByOption.value == "tag" || slc.groupByOption.value == "taghierarchical" || slc.groupByOption.value == "section") {
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
						rootTemplate = rootTemplate.replace("<!--title-->","<title>"+slc.digestName+"</title>");
						return rootTemplate.replace("<!--digestdata-->",template.html());
					}
					return template.html();
				} else {
					return template.html();
				}
				
			}, 0);
		}
		
		function getDigestContentAndSaveAsNote(result){
			getDigestContent(true, false).then(function(content) {
				AnnotationDigestService.SaveAsNote(result,content,slc.linkInfo,appdata["OrganizationId"],$state,function(doc){
					MessageService.showSuccessMessage("SAVE_DIGEST_AS_NOTES");
					$window.open(fileBaseUrl+"docview/"+doc.id+"/"+appdata["OrganizationId"]+"/", "_blank");
					if(slc.closeShareLinkPopup) {
						cancel();
					}
				}, function error(response) {
					slc.showLoader = false;
				});
			}); 
		}
		
		function getDigestContentAndSaveAsPdf(fileName) {
			getDigestContent(true, false).then(function(content) {
				AnnotationDigestService.SaveAsPdf(fileName,content,slc.linkInfo,DocFactory,function(resp){
					if(resp != "error" && slc.closeShareLinkPopup) {
						cancel();
					}
					if(resp == "error") {
						slc.showLoader = false;
					}
				}, function error(response) {
					slc.showLoader = false;
				});
			});
		}
		
		function sendMail(content) {
			if($state.current.name == "sharelinks") {
				 windowClass = "send-digest-as-email-modal-window";
			 }
			 var mailPopupModalInstance = MailService.open({"emailUsers" : slc.emailUsers,"subject" : slc.emailSubject,"content" : content},windowClass);
			 mailPopupModalInstance.result.then(function (results) {
				 if(results.action == "saveAsDraft"){
					 slc.showLoader = true;
					 AnnotationDigestService.sendAsEMailDraft(results,content,slc.linkInfo).then(function(resp) {
						 if(resp.status == 200 && resp.data.Status) {
							 slc.showLoader = false;
							 APIUserMessages.success("Mail saved as draft successfully");
							 var timer1 = $timeout(function() {
								 if(slc.closeShareLinkPopup) {
									 cancel();
								 }
								 $timeout.cancel(timer1);
							 }, 1000);
						 } else {
							 slc.showLoader = false;
						 }
					 }, function error(response) {
						 slc.showLoader = false;
					 });
				 } else {
					 if(!_.isEmpty(results.toEmailIds)) {
						 slc.showLoader = true;
						 AnnotationDigestService.sendAsEMail(results,content,slc.linkInfo).then(function(resp) {
							 if(resp.status == 200 && resp.data.Status) {
								 slc.showLoader = false;
								 APIUserMessages.success("Mail sent successfully");
								 var timer1 = $timeout(function() {
									 if(slc.closeShareLinkPopup) {
										 cancel();
									 }
									 $timeout.cancel(timer1);
								 }, 1000);
							 } else {
							 	slc.showLoader = false;
							 }
						 }, function error(response) {
								slc.showLoader = false;
						 });
					} 
				 }
				 if($state.current.name == "sharelinks") {
					 $rootScope.$broadcast("fit-to-popup",{"status" : "closed", "parent" : "sharelinks","fitFor" : "shareLinks"});
				 }
			 },function () {	
					if($state.current.name == "sharelinks") {
						$rootScope.$broadcast("fit-to-popup",{"status" : "closed", "parent" : "sharelinks","fitFor" : "shareLinks"});
					}
			 });
			 
			 mailPopupModalInstance.rendered.then(function(){
				 slc.showLoader = false;
				 if($state.current.name == "sharelinks") {
					$rootScope.$broadcast("fit-to-popup",{"status" : "opened", "windowClass" : windowClass,"fitFor" : "postToEmail"});
				 }
			 });
		}
		
		function copyContent(content,shareCommentaryTxt) {
			if($state.current.name == "sharelinks") {
				 windowClass = "send-digest-as-email-modal-window";
			 }
			 var copyPopupModalInstance = CopyService.open({"content" : content, "shareCommentaryTxt" : shareCommentaryTxt },windowClass);
			 copyPopupModalInstance.result.then(function (results) {
				 if($state.current.name == "sharelinks") {
					 $rootScope.$broadcast("fit-to-popup",{"status" : "closed", "parent" : "sharelinks","fitFor" : "shareLinks"});
				 }
			 },function () {	
					if($state.current.name == "sharelinks") {
						$rootScope.$broadcast("fit-to-popup",{"status" : "closed", "parent" : "sharelinks","fitFor" : "shareLinks"});
					}
			 });
			 copyPopupModalInstance.rendered.then(function(){
				 slc.showLoader = false;
				 if($state.current.name == "sharelinks") {
					$rootScope.$broadcast("fit-to-popup",{"status" : "opened", "windowClass" : windowClass,"fitFor" : "copy"});
				 }
			 });
		}
		
		function getDigestContentAndSendAsMail(result){
			getDigestContent(true, false).then(function(content) {
				sendMail(content);
			}); 
		}
		
		function getDigestContentForOnenote(result) {
			getDigestContent(true, false).then(function(content) {
				SaveToOnenote(content,result);
			});
		}
				
		function processDataForCopy(){
			var includeAnnotationDigestContent = true;
			var includeDigestContent = true;
			getShareCommentaryTextForSocialMedia(includeAnnotationDigestContent,includeDigestContent,function(digestInfo){
				var publishedData = {};
				publishedData = {"publishFor" : "copy"};
				publishedData["AnnotationDigestResp"]= digestInfo.digestContent;
				
				var AnnotationDigestResp = publishedData.AnnotationDigestResp;
				AnnotationDigestService.processDataForPublish(publishedData,settings,slc.digestMetaInfoOptions);
				var linkAnnotationDigestResp = AnnotationDigestResp.AnnotationDigest;
				if(linkAnnotationDigestResp && linkAnnotationDigestResp.length ==1 && digestFor.digestFor && digestFor.digestFor == "DigestDocument" && digestFor.documentInfo && digestFor.documentInfo.digestDocAnnotId ) {
					if(!_.isEmpty(AnnotationDigestResp.digestSettings) && AnnotationDigestResp.digestSettings.groupBy == "section") {
						var Section = linkAnnotationDigestResp[0];
						var Document = Section.documents[0];
						var annotations = Document.annotations;
						annotations = _.where(annotations,{"annotationId" : digestFor.documentInfo.digestDocAnnotId});
						linkAnnotationDigestResp[0].documents[0].annotations = annotations;
					} else {
						var AnnotationDigest = linkAnnotationDigestResp[0];
						var annotations = AnnotationDigest.annotations;
						annotations = _.where(annotations,{"annotationId" : digestFor.documentInfo.digestDocAnnotId});
						linkAnnotationDigestResp[0].annotations = annotations;
					}
				}
				trustedAnnotatedText = {};
				slc.digestData = AnnotationDigestService.preProcessAnnotationDigestResp(linkAnnotationDigestResp,config,AnnotationDigestResp.dlId,taskspaceInfo);
				getDigestContentForCopy(publishedData, digestInfo.shareCommentaryTxt);
			});
		}
		
		function getDigestContentForCopy(result, shareCommentaryTxt){
			getDigestContent(true, true).then(function(content) {
				copyContent(content,shareCommentaryTxt);
			}); 
		}
		
		function processDataForPublish(result){
			var AnnotationDigestResp = result.AnnotationDigestResp;
			AnnotationDigestService.processDataForPublish(result,settings,slc.digestMetaInfoOptions);
			var linkAnnotationDigestResp = AnnotationDigestResp.AnnotationDigest;
			if(linkAnnotationDigestResp && linkAnnotationDigestResp.length ==1 && digestFor.digestFor && digestFor.digestFor == "DigestDocument" && digestFor.documentInfo && digestFor.documentInfo.digestDocAnnotId ) {
				if(!_.isEmpty(AnnotationDigestResp.digestSettings) && AnnotationDigestResp.digestSettings.groupBy == "section") {
					var Section = linkAnnotationDigestResp[0];
					var Document = Section.documents[0];
					var annotations = Document.annotations;
					annotations = _.where(annotations,{"annotationId" : digestFor.documentInfo.digestDocAnnotId});
					linkAnnotationDigestResp[0].documents[0].annotations = annotations;
				} else {
					var AnnotationDigest = linkAnnotationDigestResp[0];
					var annotations = AnnotationDigest.annotations;
					annotations = _.where(annotations,{"annotationId" : digestFor.documentInfo.digestDocAnnotId});
					linkAnnotationDigestResp[0].annotations = annotations;
				}
			}
			trustedAnnotatedText = {};
			slc.digestData = AnnotationDigestService.preProcessAnnotationDigestResp(linkAnnotationDigestResp,config,AnnotationDigestResp.dlId,taskspaceInfo);
			if(!_.isEmpty(result.publishFor) && result.publishFor == "numicinote") {
				getDigestContentAndSaveAsNote(result);
			} else if(!_.isEmpty(result.publishFor) && result.publishFor == "pdf") {
				getDigestContentAndSaveAsPdf(result.fileName);
			} else if(!_.isEmpty(result.publishFor) && result.publishFor == "email") {
				getDigestContentAndSendAsMail(result);
			} else if(!_.isEmpty(result.publishFor) && result.publishFor == "onenote") {
				getDigestContentForOnenote(result);
			}
		}
		
		var fileInfo = {
				"file" : [{"name" : ""}],
				"isGlobal" : false,
				"docType" : "VidiViciNotes"
		};
		var docLockDuration;
		function getDocLockDuration() {
			  commonService.getNavMenuItems({"type":"ObjLocking","isActive":true}).then(function(resp){
				  if(resp.status == 200 && resp.data.Status) {
					  var ObjLockingList = resp.data.listAppKeyValues;
					  var docLockDurationObj = _.findWhere(ObjLockingList,{'key':'DocLockDuration'});
					  if(docLockDurationObj) {
						  docLockDuration = docLockDurationObj.value
					  }
				  }
			  });  
		}
		  
		getDocLockDuration();
		  
		function getObjectLock(existingDocId,cb) {
			  DocFactory.getDocLock(existingDocId,appdata["OrganizationId"],docLockDuration).then(function(resp){
				  if(resp.status == 200 && resp.data.Status) {
					  if(typeof cb == "function") {
						  cb(resp);
					  }
				  }
			  }, function error(response) {
				  slc.showLoader = false;
			  });
		}
		
		function saveAsNote(publishedData) {
			AnnotationDigestService.SaveAsNote(publishedData,publishedData.content,slc.linkInfo,appdata["OrganizationId"],$state,function(doc){
				MessageService.showSuccessMessage("SAVE_DIGEST_AS_NOTES");
				$window.open(fileBaseUrl+"docview/"+doc.id+"/"+appdata["OrganizationId"]+"/", "_blank");
				if(slc.closeShareLinkPopup) {
					cancel();
				}
			}, function error(response) {
				slc.showLoader = false;
			});
		}
		
		function saveAsPdf(publishedData) {
			AnnotationDigestService.SaveAsPdf(publishedData.fileName,publishedData.content,slc.linkInfo,DocFactory,function(resp){
				if(resp != "error" && slc.closeShareLinkPopup) {
					cancel();
				}
				if(resp == "error") {
					slc.showLoader = false;
				}
			}, function error(response) {
				slc.showLoader = false;
			});
		}
		
		function checkIsExistAndPublish(file,publishedData) {
			if(file.isExist){
	    		var docPresentCnfMessage = "The folder already has a file named '"+fileInfo.file[0].name+"'.<br/><br/>Click 'OK' to replace the file.";
	    		var VDVCConfirmModalInstance;
	    		VDVCConfirmModalInstance = VDVCConfirmService.open({text : docPresentCnfMessage,title : "CONFIRM"});
	    		VDVCConfirmModalInstance.result.then(function() {
	    			file.isExist = false;
	    			file.isOverWrite = true;
					publishedData["folderId"]= fileInfo.fldrId;
					publishedData["fileName"]= fileInfo.file[0].name;
		    		publishedData["isOverWrite"]= file.isOverWrite;
		    		publishedData["existingDocId"]= file.existingDocId;
		    		getObjectLock(file.existingDocId,function(resp){
						  var docLockId = resp.data.LockId;
						  if(docLockId != null) {
							  publishedData["lockId"] = docLockId;
							  publishedData["majorVersion"] = resp.data.majorVersion;
							  publishedData["minorVersion"] = resp.data.minorVersion;
							  saveAsNote(publishedData);
						  } else {
							  var text = 'Unable to replace document as '+resp.data.LockOwner+' is currently editing the file';
							  VDVCAlertService.open({text:text});
						  }
					});
					
	    		},function() {
	    			slc.showLoader = false;
	    		});
	    	} else {
	    		file.isOverWrite = false;
	    		publishedData["folderId"]= fileInfo.fldrId;
	    		publishedData["fileName"]= fileInfo.file[0].name;
	    		publishedData["isOverWrite"]= file.isOverWrite;
				saveAsNote(publishedData);
	    	}
		}
		
		function preProcessNoteAndPublish(publishedData) {
	    	var filesData = [];
	    	var data = {
    				"isSecDocument" : false,
    				"documentName" : fileInfo.file[0].name,
    				"folderId" : fileInfo.fldrId,
    				"isGlobal" : fileInfo.isGlobal,
    				"docType" : fileInfo.docType
    		};
    		
    		filesData.push(data);
    		DocFactory.isDocPresentList(filesData).then(function(response){
        		if(response.status == 200 && response.data.Status) {
        			checkIsExistAndPublish(response.data.Notes[0],publishedData);
				}
			}, function error(response) {
				slc.showLoader = false;
			}); 
		}
		
		function createAnnotationDigestAndPublish(publishedData) {
			var postdata = {
						"objectId": settings.taskspaceId, 
						"clientId": settings.clientId,
						"context" : "taskspace",
						"filterOptions" : angular.copy(slc.filterOptions),
						"sortOptions" : config.sortOptions,
						"groupBy": slc.groupByOption ? slc.groupByOption.value : null
				};
			postdata.filterOptions.startDate = moment(postdata.filterOptions.startDate,defautlDateFormat,true).isValid() ? moment(postdata.filterOptions.startDate).format(defautlDateFormat) : null;
			postdata.filterOptions.endDate =  moment(postdata.filterOptions.endDate,defautlDateFormat,true).isValid() ? moment(postdata.filterOptions.endDate).format(defautlDateFormat) : null;
			postdata.filterOptions.displayReplies = postdata.filterOptions.displayRepliesOption.value;
			delete postdata.filterOptions.displayRepliesOption;
			
			if (digestFor.digestFor == "DigestDocument") {
				if (digestFor.documentInfo) {
					postdata.documents = [digestFor.documentInfo.objectId];
				}
			}
			AnnotationDigestService.create(postdata).then(function(resp) {
  				if(_.isEmpty(resp.data.AnnotationDigest)) {
					if(!_.isEmpty(resp.data.Message)) {
						MessageService.showErrorMessage("BACKEND_ERR_MSG",[resp.data.Message]);
					} else {
						MessageService.showInfoMessage("ANNOTATION_DIGEST_NODATA_INFO");
					}
				} else {
					publishedData["AnnotationDigestResp"]= resp.data;
					if(publishedData.publishFor == "numicinote") {
						if(!_.isEmpty(slc.noteName)) {
							fileInfo.file[0]["name"] = slc.digestName;
							preProcessNoteAndPublish(publishedData);
						}
					} else if(publishedData.publishFor == "pdf"){
						if(!_.isEmpty(slc.pdfName)) {
							publishedData["fileName"]= slc.digestName;
							processDataForPublish(publishedData);
						}
					} else if(publishedData.publishFor == "email"){
						processDataForPublish(publishedData);
					}
				}
  			});
		}
		
		function cancelsaveAsSelectedType(SelectedType) {
			if(SelectedType == "numicinote"){
				slc.selectedPublishAsNote = false;
				if(slc.digestFor == 'AnnotationDigest') {
					slc.selectedPublishAsLink = true;
				} else if(slc.digestFor == 'DigestDocument') {
					slc.showdocLink = true;
				}
			} else if(SelectedType == "pdf"){
				slc.selectedPublishAsPdf = false;
				if(slc.digestFor == 'AnnotationDigest') {
					slc.selectedPublishAsLink = true;
				} else if(slc.digestFor == 'DigestDocument') {
					slc.showdocLink = true;
				}
			}
			if($state.current.name == "sharelinks") {
				resizeWindow("closed");
			}
		}
		
		function saveAsSelectedType(SelectedType) {
			var publishedData = {"publishFor" : SelectedType};
			checkAndCreateLink(function() {
				var transformImageUrls = (SelectedType == "onenote" || SelectedType == "pdf" || SelectedType == "email");
				AnnotationDigestService.createLinkAnnotationDigest({linkId : slc.linkInfo.id,clientId : $stateParams.tsc,transformImageUrls : transformImageUrls},function(respData) {
					if(!_.isEmpty(respData.AnnotationDigest)) {
						slc.showLoader = true;
						publishedData["AnnotationDigestResp"]= respData;
						if(publishedData.publishFor == "numicinote") {
							if(!_.isEmpty(slc.noteName)) {
								fileInfo.file[0]["name"] = slc.noteName;
								preProcessNoteAndPublish(publishedData);
							}
						} else if(publishedData.publishFor == "pdf"){
							if(!_.isEmpty(slc.pdfName)) {
								publishedData["fileName"]= slc.pdfName;
								processDataForPublish(publishedData);
							}
						} else if(publishedData.publishFor == "email"){
							processDataForPublish(publishedData);
						} else if(publishedData.publishFor == "onenote") {
							processDataForPublish(publishedData);
						}
					} else {
						slc.showLoader = false;
					}
				}, function error(response) {
					slc.showLoader = false;
				});
			});
		}
		
		function saveHtmlAsSelectedType(SelectedType) {
			var publishedData = {"publishFor" : SelectedType};
			checkAndCreateLink(function() {
				getDigestHtmlForLink(SelectedType, function(htmlDigestContent) {
					if(SelectedType == "numicinote") {
						if(!_.isEmpty(slc.noteName)) {
							fileInfo.file[0]["name"] = slc.noteName;
							AnnotationDigestService.taskspaceId = settings.taskspaceId;
							AnnotationDigestService.taskspaceClientId = settings.clientId;
							publishedData["content"] = htmlDigestContent;
							preProcessNoteAndPublish(publishedData);
						}
					} else if(SelectedType == "pdf" && !_.isEmpty(slc.pdfName)){
						publishedData["fileName"]= slc.pdfName;
						publishedData["content"] = htmlDigestContent;
						AnnotationDigestService.taskspaceId = settings.taskspaceId;
						AnnotationDigestService.taskspaceClientId = settings.clientId;
						saveAsPdf(publishedData);
					} else if(SelectedType == "email"){
						AnnotationDigestService.taskspaceId = settings.taskspaceId;
						AnnotationDigestService.taskspaceClientId = settings.clientId;
						sendMail(htmlDigestContent);
					} else if(SelectedType == "onenote") {
						AnnotationDigestService.taskspaceId = settings.taskspaceId;
						AnnotationDigestService.taskspaceClientId = settings.clientId;
						SaveToOnenote(htmlDigestContent,publishedData);
					} else if(SelectedType == "copy") {
						AnnotationDigestService.taskspaceId = settings.taskspaceId;
						AnnotationDigestService.taskspaceClientId = settings.clientId;
						getShareCommentaryTextForSocialMedia(true,true,function(digestInfo){
							copyContent(htmlDigestContent,digestInfo.shareCommentaryTxt);
						});
					}
				});
			});
		}
		
		function hideAllPublishOptions() {
			slc.selectedPublishAsNote = false;
			slc.selectedPublishAsPdf = false;
			slc.selectedPublishAsLink = false;
		}
		
		function getDigestHtmlForLink(SelectedType,cb) {
			var transformImageUrls = true;
			var postdata = {linkId : slc.linkInfo.id,clientId : $stateParams.tsc,transformImageUrls : true,htmlFor : SelectedType};
			AnnotationDigestService.getDigestHtmlForLink(postdata).then(function(resp) {
	    		if(resp.status == 200 && resp.data.Status) {
	    			if(!_.isEmpty(resp.data.AnnotationDigest) && !_.isEmpty(resp.data.AnnotationDigest.digestHtml)) {
	    				var htmlDigestContent = resp.data.AnnotationDigest.digestHtml;
	    				if(typeof cb == "function") {
	    					cb(htmlDigestContent);
	    				}
	    			}
	    		}
			},function(errorResp) {
				
	    	})["finally"](function() {
	    		
			});
		}
		
		function publishAsSelectedType(SelectedType) {
			hideAllPublishOptions();
			if(SelectedType == "numicinote") {
				slc.selectedPublishAsNote = true;
				slc.noteName = angular.copy(slc.digestName);
				slc.showLoader = false;
			}
			if(SelectedType == "pdf") {
				slc.selectedPublishAsPdf = true;
				slc.pdfName = angular.copy(slc.digestName);
				if(slc.pdfName.endsWith(".pdf")) {
					slc.pdfName = slc.pdfName.replace(".pdf","")
				}
				slc.showLoader = false;
			}
			if(SelectedType == "email") {
				slc.selectedPublishAsLink = true;
				saveHtmlAsSelectedType(SelectedType);
			}
			if(SelectedType == "onenote") {
				if(appdata.UserSettings.additionalNavigation_OneDrive && appdata.UserSettings.additionalNavigation_OneDrive == 'Enabled') {
					if(appdata.hasOneNoteAuth){
						slc.selectedPublishAsLink = true;
						saveHtmlAsSelectedType(SelectedType);
					} else {
						confirmAndShareOnSocialMedia(SelectedType);
					}
				}
			}
			if(SelectedType == "copy") {
				slc.selectedPublishAsLink = true;
				saveHtmlAsSelectedType(SelectedType);
			}
			if(SelectedType == "link") {
				checkAndCreateLink(function() {
					slc.selectedPublishAsLink = true;
					slc.showLoader = false;
				});
			}
			if($state.current.name == "sharelinks") {
				if(SelectedType == "numicinote" || SelectedType == "pdf") {
					resizeWindow("opened",SelectedType);
				} else {
					resizeWindow("closed");
				}
				slc.showLoader = false;
			}
		}
		
		function checkAndPublishAsSelectedType(SelectedType) {
			slc.showLoader = true;
			publishAsSelectedType(SelectedType);
		}
		
		var getHierarchy = function(id) {
			DocFactory.getDocHierarchy(id,function(docHierarchy) {
				slc.docHierarchy =  docHierarchy;
			});  
		};
		
		slc.BrowseFolders = function (size) {
			if($state.current.name == "sharelinks") {
				 windowClass = "browse-file-or-folder-modal-window";
			}
			var modalInstance = $uibModal.open({
			      animation: $scope.animationsEnabled,
			      templateUrl: 'app/components/BrowseFileOrFolder/BrowseFileOrFolder.html',
			      controller: 'BrowseFileOrFolderController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'vm',
			      windowClass: windowClass,
			      backdrop: 'static',
			      size: size,
			      resolve: {
			    	  resources : function () {
			    		  return {
			    			  "source" : undefined,
			    			  "folderId" :  fileInfo.fldrId,
			    			  "btnLable" : "SELECT",
			    			  "action" : "Browse",
			    			  "enableAction" : "Folder",
			    			  "disableDocuments" : true,
			    			  "validateFolderPerms" : true,
			    			  "supportMultiSelectDoc" : false,
			    			  "supportMultiSelectFolder" : false,
			    			  "showAddFolder" : true,
			    			  "showNewDoc" : false,
			    			  "showUploadDoc" : false
			    		  };
			    	  },
			    	  foldersList : function() {
			    		  return DocFactory.getDocsUnderFolder(fileInfo.fldrId);
			    	  }
			      }
			    });
			
			modalInstance.result.then(function (data) {
				fileInfo.fldrId = data.moveTo.id;
				if(data.moveTo.isLink) {
					fileInfo.fldrId = data.moveTo.linkSourceFolderId;
				}
				getHierarchy(fileInfo.fldrId);
				$rootScope.$broadcast("fit-to-popup",{"status" : "closed", "parent" : "sharelinks", "windowClass" : windowClass,"fitFor" : "shareLinks"});
			}, function () {
				$rootScope.$broadcast("fit-to-popup",{"status" : "closed", "parent" : "sharelinks", "windowClass" : windowClass,"fitFor" : "shareLinks"});
			});
			modalInstance.rendered.then(function(){
				if($state.current.name == "sharelinks") {
					$rootScope.$broadcast("fit-to-popup",{"status" : "opened", "windowClass" : windowClass,"fitFor" : "browseFileOrFolder"});
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
		
		function getTaskSpaceById(clientId,id,cb) {
			TaskSpaceService.getTaskSpaceById(clientId,id).then(function(resp) {
				if (resp.status == 200 && resp.data.Status) {
					selectedTS = resp.data.Taskspace;
					var taskSpaceDocsList = angular.copy(selectedTS.objects);
					selectedTSDoc = _.findWhere(taskSpaceDocsList,{objectId : $stateParams.d});
					if(!_.isEmpty($stateParams.da)) {
	  		  			selectedTSDoc["digestDocAnnotId"] = $stateParams.da;
	  		  		}
					if(typeof cb == "function") {
						cb();
					}
				}
			});
		}
		
		function getSystemSttings(cb) {
			commonService.getNavMenuItems({type: "GlobalSettings",key:"DigestTableOfContents"}).then(function(resp) {
				if(resp.data.Status && !_.isEmpty(resp.data.listAppKeyValues)) {
					if(typeof cb == "function") {
						cb(resp.data.listAppKeyValues[0]);
					}
				} else {
					if(typeof cb == "function") {
						cb({});
					}
				}
			});
		}
		
		function getSettings(tsClientId,tsId,cb) {
			TaskSpaceService.getTaskSpaceState(tsClientId, tsId).then(function(resp) {
  			  	if (resp.status == 200 && resp.data.Status) {
  			  		if(typeof cb == "function") {
  			  			cb(resp.data.TaskspaceState);
  			  		}
  			  	}
  		    });
		}
		function getDigestFor(cb) {
			var data = {"digestFor" : $stateParams.digestFor};
  		  	if($stateParams.digestFor == "AnnotationDigest") {
  		  		data["digestName"] = selectedTS.name+ " Digest";
  		  		var appdata = appData.getAppData();
  		  		if(appdata.UserId == selectedTS.owner) {
  		  			data["tsDefaultFolderId"] = selectedTS.defaultFolderId;
  		  		}
  		  	}
  		  
  		  	if($stateParams.digestFor == "DigestDocument") {
  		  		if(selectedTSDoc && selectedTSDoc.objectInfo && selectedTSDoc.objectInfo.docType && selectedTSDoc.objectInfo.docType == "WebResource"){
					  var digestName = selectedTSDoc.name ? selectedTSDoc.name : "";
	  				  var sourceUrl;
	  				  if(selectedTSDoc.objectInfo.sourceURL && selectedTSDoc.objectInfo.sourceURL != null && selectedTSDoc.objectInfo.sourceURL != undefined){
	  					  sourceUrl = selectedTSDoc.objectInfo.sourceURL;
	  				  } else if(selectedTSDoc.objectInfo.sourceUrl && selectedTSDoc.objectInfo.sourceUrl != null && selectedTSDoc.objectInfo.sourceUrl != undefined){
	  					  sourceUrl = selectedTSDoc.objectInfo.sourceUrl;
	  				  }
	  				  if(sourceUrl && sourceUrl != null && sourceUrl != undefined){
	  					  var domainName = sourceUrl.replace('http://','').replace('https://','').replace('www.','').split(/[/?#]/)[0];
	  					  digestName = digestName + " (from "+domainName+")";
	  				  }
		    			  data["digestName"] = digestName;
	  			  } else {
		    			  data["digestName"] = selectedTSDoc.name ? selectedTSDoc.name : "";  
	  			  }
  		  		  data.documentInfo = selectedTSDoc;
	  		}
	  		if(typeof cb == "function") {
				cb(data);
			}
		}
		
		function getLinkInfo(cb) {
			var postdata = {
				  "objectType" : $stateParams.digestFor,
				  "linkObjectId" : $stateParams.tsId,
				  "clientId" : $stateParams.tsc
			};
			if($stateParams.digestFor == "DigestDocument") {
				postdata["documentId"] = $stateParams.d;
				if(!_.isEmpty($stateParams.da)) {
					postdata["digestDocAnnotId"] = $stateParams.da;
				}
			}
			DeepLinkService.checkLinkExists(postdata).then(function(resp) {
				if (resp.status == 200 && resp.data.Status) {
					if(!_.isEmpty(resp.data.Link)) {
						if(typeof cb == "function") {
							cb(resp.data.Link);
						}
					} else {
						var digestSettings = AnnotationDigestService.getDefaultDigestSettings($stateParams.tsId, $stateParams.tsc, selectedTSDoc);
						var lnk = AnnotationDigestService.processLinkInfo(digestFor, $stateParams.tsId, $stateParams.tsc, digestSettings);
						DeepLinkService.createLink(lnk).then(function(createLinkResp) {
							if(createLinkResp.status == 200 && createLinkResp.data.Status) {
								if(typeof cb == "function") {
									cb(createLinkResp.data.Link);
								}
							}
						});
					}
				} 
			}); 
		}
		
		function initProcess() {
			if(!_.isEmpty(digestFor.tsDefaultFolderId)) {
				fileInfo.fldrId = angular.copy(digestFor.tsDefaultFolderId);
				getHierarchy(fileInfo.fldrId);
			} else {
				getDefaultDownloadFolder(function(defaultDownloadFolder){
					if(!_.isEmpty(defaultDownloadFolder)) {
						fileInfo.fldrId = defaultDownloadFolder.id;
						getHierarchy(fileInfo.fldrId);
					} else {
						fileInfo.fldrId = appdata.rootFolderId;
						getHierarchy(fileInfo.fldrId);
					}
				});
			}
			
			configDigestDataFromDigestLink();
			
			if(!_.isEmpty(config.groupBy)) {
				
				var gpby = _.findWhere(slc.groupByOptionList,{value: config.groupBy})
				if(gpby) {
					slc.groupByOption = gpby;
				}
			}
			slc.showLoader = false;
		}
		
		function init() {
			slc.importantShareOptionsList = _.where(slc.enabledShareOptionsList,{"important" : true});
			slc.unImportantShareOptionsList = _.where(slc.enabledShareOptionsList,{"important" : false});
			if($state.current.name == "sharelinks") {
				taskspaceInfo = {
						"tsId" : $stateParams.tsId,
						"tsClientId" : $stateParams.tsc
					};
				settings.taskspaceId = $stateParams.tsId; 
				settings.clientId = $stateParams.tsc;
				getTaskSpaceById($stateParams.tsc,$stateParams.tsId,function(){
					getSystemSttings(function(SystemSttingsResp) {
						systemSttings = SystemSttingsResp;
						getSettings($stateParams.tsc,$stateParams.tsId,function(TaskspaceState){
							settings = TaskspaceState;
		  			  		settings.digestsettings = AnnotationDigestService.getDocuDigetFilters();
							getDigestFor(function(DigestForResp){
								digestFor = DigestForResp;
								slc.digestFor = digestFor.digestFor;
								getLinkInfo(function(LinkInfoResp){
									linkInfo = LinkInfoResp;
									slc.linkInfo = angular.copy(linkInfo);
									var timer1 = $timeout(function() {
										AnnotationDigestService.extParentWidth = $stateParams.iw;
										AnnotationDigestService.extParentHeight = $stateParams.ih;
										$(".share-link-modal-content").parent().css("background","rgb(255, 255, 255)");
										$timeout.cancel(timer1);
									}, 0);
									initProcess();
								});
							});
						});
					});
				});
			} else {
				initProcess();
			}
		}
		init();
	}
})();