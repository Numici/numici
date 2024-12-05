;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('AnnotationDigestController',AnnotationDigestController);
	
	AnnotationDigestController.$inject = ['$state','$stateParams','_','$scope','$q','appData','$uibModalInstance',
	                                      '$uibModal','defautlDateFormat','AnnotationDigestService',
	                                      'settings','digestFor','linkInfo','TagService',
	                                      'DeepLinkService','APIUserMessages','$confirm','MessageService',
	                                      'VDVCConfirmService','$timeout','TemplateService','userService',
	                                      'commonService','DocFactory','$templateCache','$compile','$window',
	                                      'LinkedInService','markdown','systemSttings','taskspaceInfo','MailService',
	                                      'TaskSpaceService','VDVCAlertService','orderByFilter','Upload'];

	function AnnotationDigestController($state,$stateParams,_,$scope,$q,appData,$uibModalInstance,$uibModal,
			defautlDateFormat,AnnotationDigestService,settings,digestFor,linkInfo,TagService,
			DeepLinkService,APIUserMessages,$confirm,MessageService,VDVCConfirmService,$timeout,TemplateService,
			userService,commonService,DocFactory,$templateCache,$compile,$window,LinkedInService,markdown,systemSttings,
			taskspaceInfo,MailService,TaskSpaceService,VDVCAlertService,orderByFilter,Upload) {
		
		var ad = this;
		var appdata = appData.getAppData();
		$scope.$emit("PageName",{"userName":appdata.UserName,"pageName":$state.current.pageName});
		var config = {};
		var originalConfig = {};
		var sharedUserList = [];
		var selectedProvisionalUsers = [];
		var selectedTS = {};
		var selectedTSDoc = {};
		var origin = $stateParams.origin ? decodeURIComponent($stateParams.origin) : "chrome-extension://oojabgademjndedjpcnagfgiglcpolgd";
		var displayFormat = "YYYY-MM-DD";
		//ad.templates = templates;
		ad.digestFor = digestFor.digestFor;
		ad.selectedPublishAsNote = false;
		ad.selectedPublishAsPdf = false;
		ad.selectedPublishAsLink = false;
		ad.showdocLink = false;
		ad.digestName = "";
		ad.noteName = "";
		ad.pdfName = "";
		ad.emailUsers = [];
		ad.emailSubject = "";
		
		ad.digestDescription = "";
		ad.bannerImageMaxSize = "20MB";
		ad.bannerImageExpectedRatio = "2:1";
		ad.bannerImg = "";
		ad.useBannerImg = false;
		ad.linkInfo = angular.copy(linkInfo);
		ad.linkType = {"type" : "Public"};
		ad.linkTarget = {"target" : "Document"};
		ad.focusLink = false;
		ad.filterOptions = {};
		ad.tsSections = [];
		ad.filteredSections = [];
		ad.digestMetaInfoOptions = {};
		ad.groupByOptionList = angular.copy(AnnotationDigestService.getGroupByUIOptions());
		ad.groupByOption = ad.groupByOptionList[0];
		ad.includeDocsWithoutAnn = false;
		ad.showIncludeDocsWithoutAnnField = false;
		if(ad.groupByOption && (ad.groupByOption.value == "document" || ad.groupByOption.value == "tag" 
			|| ad.groupByOption.value == "taghierarchical")){
			ad.showIncludeDocsWithoutAnnField = true;
		}
		ad.includeDocsWithoutSection = false;
		ad.showIncludeDocsWithoutAnySectionField = false;
		if(ad.groupByOption && ad.groupByOption.value == "section"){
			ad.showIncludeDocsWithoutAnySectionField = true;
			ad.showIncludeDocsWithoutAnnField = true;
		}
		
		ad.sortByOptionList = angular.copy(AnnotationDigestService.getSortByUIOptions());
		ad.sortByOption = ad.sortByOptionList[0];
		ad.sortOrderOptionList = angular.copy(AnnotationDigestService.getSortOrderUIOptions());
		ad.sortOrderOption = ad.sortOrderOptionList[0];
		ad.showSortOrderOption = false;
		ad.showEditDocOrder = false;
		if(ad.sortByOption && (ad.sortByOption.value == "name" || ad.sortByOption.value == "date")){
			ad.showSortOrderOption = true;
			ad.showEditDocOrder = false;
		}
		if(ad.sortByOption && ad.sortByOption.value == "custom") {
			ad.showSortOrderOption = false;
			ad.showEditDocOrder = true;
		}
		ad.enableBorderOptionList = angular.copy(AnnotationDigestService.getEnableBorderUIOptions());
		ad.enableBorderOption = ad.enableBorderOptionList[0];
		ad.imagePositionOptionList = angular.copy(AnnotationDigestService.getImagePositionUIOptions());
		ad.tableOfContentsUIOptions = angular.copy(AnnotationDigestService.getTableOfContentsUIOptions());
		ad.imagePositionOption = ad.imagePositionOptionList[0];
		ad.tableOfContents = ad.tableOfContentsUIOptions[0];
		ad.showTableOfContentsHeadingField = true;
		if(ad.tableOfContents && ad.tableOfContents.value == "notInclude"){
			ad.showTableOfContentsHeadingField = false;
		}
		var tableOfContentsHeading = !_.isEmpty(systemSttings) && systemSttings.value ? systemSttings.value : angular.copy(AnnotationDigestService.getTableOfContentsHeading());
		ad.tableOfContentsHeading = angular.copy(tableOfContentsHeading);
		ad.displayOrderOptionList = angular.copy(AnnotationDigestService.getDisplayOrderUIOptions());
		ad.displayOrderOption = ad.displayOrderOptionList[0];
		ad.displayRepliesOptionList = angular.copy(AnnotationDigestService.getDisplayRepliesUIOptions());
		ad.filterOptions.displayRepliesOption = ad.displayRepliesOptionList[0];
		ad.selectedTemplate = {};
		ad.sortOptionList = angular.copy(AnnotationDigestService.getSortUIOptions());
		ad.sortConfig = angular.copy(AnnotationDigestService.getSortUIOptionValues());
		ad.selectedSortOption = ad.sortOptionList[0];
		ad.selectedSortOrder = ad.sortConfig[1];
		
		ad.filterOptions.startDate = null;
		ad.filterOptions.endDate = null;
		//ad.filterOptions.startDate = moment(ad.filterOptions.startDate,defautlDateFormat,true).isValid() ? moment(ad.filterOptions.startDate,defautlDateFormat).toDate() : null;
		//ad.filterOptions.endDate =  moment(ad.filterOptions.endDate,defautlDateFormat,true).isValid() ? moment(ad.filterOptions.endDate,defautlDateFormat).toDate() : new Date();
		//ad.format = 'yyyy-MM-dd';
		
		ad.tags =[];
		
		ad.dateOptions = {
			"startingDay": 1,
			"maxDate":	new Date(),
	    	"start" : null,
	    	"end" : new Date(),
		};

		ad.StartDt = {
				opened: false
		};
				  
	    ad.startDtOpen = function($event) {
		    	ad.StartDt.opened = true;
	    };	
	  
	    ad.EndDt = {
	    		opened: false
	    };
			  
	    ad.endDtOpen = function($event) {
		    	ad.EndDt.opened = true;
	    };	
	    
	    ad.docHierarchy = [];
		
	    ad.digestNameError = false;
		ad.digestNameErrorMessage = "";
		ad.isAnnotationOptionSelected = false;
		
		ad.toggleSettings = toggleSettings;
		ad.cancel = cancel;
		ad.ok = create;
		ad.onSelectSection = onSelectSection;
		ad.onRemoveSection = onRemoveSection;
		ad.refreshTagInfo = refreshTagInfo;
		ad.showTagName = showTagName;
		ad.onGroupSelection= onGroupSelection;
		ad.onSortByOptionSelection = onSortByOptionSelection;
		ad.editDocOrder = editDocOrder;
		ad.onTableOfContentsSelection = onTableOfContentsSelection;
		ad.isDigestLinkExists = isDigestLinkExists;
		ad.addBoderForPublicLink = addBoderForPublicLink;
		ad.copySuccess = copySuccess;
		ad.copyFail = copyFail;
		ad.getShareLink = getShareLink;
		ad.ShareOnSocialMedia = ShareOnSocialMedia;
		ad.deleteDigestLink = deleteDigestLink;
		ad.updateDigestLink = updateDigestLink;
		ad.checkAndPublishAsSelectedType = checkAndPublishAsSelectedType;
		ad.cancelsaveAsSelectedType = cancelsaveAsSelectedType;
		ad.saveAsSelectedType = saveAsSelectedType;
		ad.validateDigestName = validateDigestName;
		ad.isSettingsChanged = isSettingsChanged;
		ad.isDigestSettingsChanged = isDigestSettingsChanged;
		ad.showLinkUi = showLinkUi;
		ad.showPreview = showPreview;
		ad.showPublishAs = showPublishAs;
		ad.showTargetLinkOption = showTargetLinkOption;
		var fileBaseUrl = commonService.getContext();
		ad.commentIconUrl = fileBaseUrl+"/app/assets/icons/digest_comment.png";
		
		ad.setDigesMinMaxWidth = AnnotationDigestService.setDigesMinMaxWidth;
		ad.getTitleStyles = AnnotationDigestService.getTitleStyles;
		ad.alternateImageStyles = AnnotationDigestService.alternateImageStyles;
		ad.setRepDigestStyles = AnnotationDigestService.setRepDigestStyles;
		var trustedAnnotatedText = {};
		ad.hasAnnotatedText = AnnotationDigestService.hasAnnotatedText;
		ad.getAnnotatedText = function (annotation) {
			if(!trustedAnnotatedText[annotation.annotationId]) {
				trustedAnnotatedText[annotation.annotationId] = AnnotationDigestService.getAnnotatedText(annotation,ad.digestMetaInfoOptions);
			}
			return trustedAnnotatedText[annotation.annotationId];
		};
		
		ad.formatCreatedDate = AnnotationDigestService.formatCreatedDate;
		ad.formatComment = AnnotationDigestService.formatComment;
		ad.createDigestLink = createDigestLink;
		ad.createDocSharableLink = createDocSharableLink;
		
		ad.getTitle = getTitle;
		ad.getLinkTypeMsg = getLinkTypeMsg;
		ad.validateAnnotationSelection = validateAnnotationSelection;
		
		if($state.current.name == "digestsettings") {
			commonService.hideNaveBar();
		}
		
		function showTargetLinkOption() {
			if(ad.digestFor == "DigestDocument") {
				if(digestFor.documentInfo && digestFor.documentInfo.digestDocAnnotId ) {
					return false;
				}
				return true;
			}
			
			return false;
		}
		
		function getTitle() {
			// need to Implement
			if (ad.digestFor == "AnnotationDigest") {
				return "PUBLISHED DIGEST SETTINGS - "+ad.digestName;
			}
			
			if(ad.digestFor == "DigestDocument") {
				if(digestFor.documentInfo && digestFor.documentInfo.digestDocAnnotId ) {
					return "Share Annotation in Document";
				}
				return "Share Document With Annotations";
			}
			
			return "ANNOTATION DIGEST SETTINGS";
		}
		
		function getLinkTypeMsg(type) {
			if(type == "Public") {
				if(ad.digestFor == "DigestDocument") {
					if(digestFor.documentInfo && digestFor.documentInfo.digestDocAnnotId ) {
						return "Anyone with Link can view the annotations on this document";
					}
					return "Anyone  with Link can view this document along with annotations";
				}
				
				return "Anyone  with link to the digest or the links in digest can view target content";
			}
			
			if(type == "Private") {
				if(ad.digestFor == "DigestDocument") {
					if(digestFor.documentInfo && digestFor.documentInfo.digestDocAnnotId ) {
						return "Only users with access to the Taskspace can view the annotations on this document";
					}
					return "Only users with access to the Taskspace can view this document along with annotations";
				}
				
				return "Only users with access to the Taskspace can view the digest or the target content for the links in the digest";
			}
		}
		
		
		function showLinkUi() {
			return ad.digestFor == 'AnnotationDigest' || ad.digestFor == 'DigestDocument';
		}
		
		function showPreview() {
			var status = false;
			if(ad.digestFor == 'AnnotationDigest') {
				status = true;
			} else if(ad.digestFor == 'DigestDocument' && ad.linkTarget.target == 'Digest' && (digestFor.documentInfo && !digestFor.documentInfo.digestDocAnnotId)) {
				status = true;
			}
			return status;
		}
		
		function saveDigestBannerImg(bannerImg) {
			var postdata = {
	    			"bannerImg" : bannerImg,
	    			"linkId" : ad.linkInfo.id,
	    			"linkClientId" : settings.clientId
				};
			DeepLinkService.saveBannerImg(postdata).then(function(resp) {
				if (resp.status == 200 && resp.data.Status) {
					originalConfig.bannerImg = angular.copy(bannerImg);
					MessageService.showSuccessMessage("BANNER_IMG_SAVED");
				}
			});
		}
		
		ad.validateRatio = function(file) {
			  var defer = $q.defer();
			  Upload.imageDimensions(file).then(function(d) {
			    if (d.width / d.height === ad.bannerImageExpectedRatio) {
			      return true;
			    } else {
			      return false;
			    }
			  }, function() {return false;});
			  return defer.promise;
		}
		
		ad.uploadBannerImage = function(files, errFiles){
			if(files != null && errFiles.length == 0) {
				var file = files[0];
				var postdata = {};
				postdata["file"] = file;
				   
			    file.upload = Upload.upload({
		            url: '../ImageUploadAsBase64',
		            data: postdata
		        });

		        file.upload.then(function (response) {
		        	ad.bannerImg = response.data.url;
		        	if(!_.isEmpty(ad.linkInfo.url)) {
		        		saveDigestBannerImg(ad.bannerImg);
					} else {
						create(true);
					}
		        }, function (response) {
		            
		        }, function (evt) {
		            file.progress = Math.min(100, parseInt(100.0 * 
		                        evt.loaded / evt.total));
		        });
			} else if(errFiles.length > 0) {
				var text = "";
				if(errFiles[0].$error == "pattern" && errFiles[0].$errorParam == "image/*") {
					text = "Please select valid image file.";
				} else if(errFiles[0].$error == "maxSize" && errFiles[0].$errorParam == "20MB") {
					text = "Selected image file is exceeded the max allowed size '"+ad.bannerImageMaxSize+"'.";
				} else if(errFiles[0].$error == "ratio" && errFiles[0].$errorParam == "2:1") {
					text = "Selected image aspect ratio is not matched with expected ratio '"+ad.bannerImageExpectedRatio+"'.";
				}
				if(!_.isEmpty(text)) {
					var confirm = VDVCAlertService.open({ text: text });
					confirm.result.then(function() {
						
					}, function() {
						
					});
				}
			}
		};
		
		ad.uploadImage = function(){
			angular.element('.uploadBannerImageBtn').triggerHandler('click');
		};
		
		ad.hasBannerImage = function() {
			return !_.isEmpty(ad.bannerImg);
		}
		
		ad.custStartDateErrMsg = "";
		ad.custEndDateErrMsg = "";
		ad.applyDateRange = function() {
	    	var from = "";
	    	var to = "";
	    	if(typeof ad.filterOptions.startDate != "undefined"){
	    		if(new Date(ad.filterOptions.startDate).getTime()<=new Date().getTime()){
	    			from = moment(ad.filterOptions.startDate).isValid() ?  moment(ad.filterOptions.startDate).format(displayFormat) : " ";
		    		ad.custStartDateErrMsg = "";
	    		}else{
	    			ad.custStartDateErrMsg = "'FROM DATE' can't be future date.";
		    		return false;
	    		}
	    	} else{
	    		ad.custStartDateErrMsg = "Please enter valid 'FROM DATE' (YYYY-MM-DD).";
	    		return false;
	    	}
	    	if(typeof ad.filterOptions.endDate != "undefined"){
	    		if(new Date(ad.filterOptions.endDate).getTime()<=new Date().getTime()){
		    		to = moment(ad.filterOptions.endDate).isValid() ? moment(ad.filterOptions.endDate).format(displayFormat) : " ";
		    		ad.custEndDateErrMsg = "";
	    		}else{
	    			ad.custEndDateErrMsg = "'TO DATE' can't be future date.";
		    		return false;
	    		}
	    	}else{
	    		ad.custEndDateErrMsg = "Please enter valid 'TO DATE' (YYYY-MM-DD).";
	    		return false;
	    	}
	    	if(ad.filterOptions.endDate && ad.filterOptions.startDate){
	    		if(new Date(ad.filterOptions.startDate).getTime() > new Date(ad.filterOptions.endDate).getTime()){
	    			ad.custStartDateErrMsg = "'FROM DATE' should not be after 'TO DATE'.";
		    		return false;
	    		}
	    	}
	    };
		
	    ad.isValidDateFilter = function() {
	    	var status = true;
	    	if(!_.isEmpty(ad.custStartDateErrMsg) || !_.isEmpty(ad.custEndDateErrMsg)) {
	    		status = false;
	    	}
	    	return status;
	    }
	    
		function showPublishAs() {
			var status = false;
			if(ad.digestFor == 'AnnotationDigest') {
				status = true;
			} else if(ad.digestFor == 'DigestDocument' && (digestFor.documentInfo && !digestFor.documentInfo.digestDocAnnotId)) {
				status = false;
			}
			return status;
		}
		
		function getShareCommentaryTextForSocialMedia(cb) {
			AnnotationDigestService.getDigestShareCommentaryTxt(digestFor,ad.digestDescription,ad.filterOptions,ad.displayOrderOption,ad.linkInfo.id,$stateParams.tsc,false,false,function(shareCommentaryTxt){
				if(typeof cb == "function") {
					cb(shareCommentaryTxt);
				}
			});
		}
		
		function createDigestLink() {
			checkAndCreateLink(function() {
				ad.selectedPublishAsLink = true;
			});
		}
		
		function createDocSharableLink() {
			checkAndCreateLink(function() {
				ad.showdocLink = true;
			});
		}
		
		function configDigestDataFromTaskspace() {
			var defaultSettings = AnnotationDigestService.getDigestFilters();
			config = _.isEmpty(settings.digestsettings) ? defaultSettings : settings.digestsettings;
			if(!angular.isDefined(config.includeDocsWithoutSection)) {
				config.includeDocsWithoutSection = defaultSettings.includeDocsWithoutSection;
			}
			if(!angular.isDefined(config.sortBy)) {
				config.sortBy = defaultSettings.sortBy;
			}
			if(_.isEmpty(config.digestName)) {
				config.digestName = digestFor.digestName;
			}
			if(!angular.isDefined(config.digestDescription)) {
				config.digestDescription = "";
			}
			originalConfig = angular.copy(config);
			ad.digestName = angular.copy(config.digestName);
			/*if(_.isEmpty(ad.digestName)){
				ad.digestName = digestFor.digestName;
			}*/
			ad.digestDescription = angular.copy(config.digestDescription);
			ad.bannerImg = angular.copy(config.bannerImg);
			ad.useBannerImg = angular.copy(config.useBannerImg);
			/*if(_.isEmpty(ad.digestDescription)){
				ad.digestDescription = "";
			}*/
			ad.filterOptions = angular.copy(config.filterOptions);
			ad.digestMetaInfoOptions = angular.copy(config.digestMetaInfoOptions);
			ad.selectedTemplate = angular.copy(config.selectedTemplate);
			var enableBorderOptionIndex = _.findIndex(ad.enableBorderOptionList,{"value" : config.enableBorder});
			if(enableBorderOptionIndex != -1) {
				ad.enableBorderOption = ad.enableBorderOptionList[enableBorderOptionIndex];
			}
			var imagePositionIndex = _.findIndex(ad.imagePositionOptionList,{"value" : config.imagePosition});
			if(imagePositionIndex != -1) {
				ad.imagePositionOption = ad.imagePositionOptionList[imagePositionIndex];
			}
			
			var tableOfContentsIndex = _.findIndex(ad.tableOfContentsUIOptions,{"value" : config.tableOfContents});
			if(tableOfContentsIndex != -1) {
				ad.tableOfContents = ad.tableOfContentsUIOptions[tableOfContentsIndex];
			}
			
			ad.tableOfContentsHeading = config.tableOfContentsHeading;
			var displayOrderIndex = _.findIndex(ad.displayOrderOptionList,{"value" : config.displayOrder});
			if(displayOrderIndex != -1) {
				ad.displayOrderOption = ad.displayOrderOptionList[displayOrderIndex];
			}
			var displayRepliesIndex = _.findIndex(ad.displayRepliesOptionList,{"value" : config.filterOptions.displayReplies});
			if(displayRepliesIndex != -1) {
				ad.filterOptions.displayRepliesOption = ad.displayRepliesOptionList[displayRepliesIndex];
			}
			ad.selectedTemplate = angular.copy(config.selectedTemplate);
			ad.filterOptions.startDate = moment(ad.filterOptions.startDate,defautlDateFormat,true).isValid() ? moment(ad.filterOptions.startDate,defautlDateFormat).toDate() : null;
			ad.filterOptions.endDate =  moment(ad.filterOptions.endDate,defautlDateFormat,true).isValid() ? moment(ad.filterOptions.endDate,defautlDateFormat).toDate() : null;
			if(ad.digestFor != 'DigestDocument') {
				configSelectedSections();
			}
			//ad.selectedTemplate = _.findWhere(ad.templates,{"id": config.selectedTemplate});
			ad.groupByOption = _.findWhere(ad.groupByOptionList,{value:config.groupBy});
			onGroupSelection(ad.groupByOption);
			ad.includeDocsWithoutAnn = config.includeDocsWithoutAnn == true ? true : false;
			ad.includeDocsWithoutSection = config.includeDocsWithoutSection == true ? true : false;
			if(!_.isEmpty(config.sortBy)) {
				ad.sortByOption = _.findWhere(ad.sortByOptionList,{value:config.sortBy.field});
				onSortByOptionSelection(ad.sortByOption);
				ad.sortOrderOption = _.findWhere(ad.sortOrderOptionList,{value:config.sortBy.order});
			}
		}
		
		function setErrorMsg (field,type,Message) {
			if(field === "digestName" && type === "invalid") {
				ad.digestNameError = true;
				ad.digestNameErrorMessage = "Please Enter Digest Name.";
			}
		}
		
		function validateDigestName() {
			if(_.isEmpty(ad.digestName)) {
				setErrorMsg("digestName","invalid");
			} else {
				ad.digestNameError = false;
				ad.digestNameErrorMessage = "";
			}
		}
		
		function isSectionsMatched() {
			var status = false;
			if(_.isEmpty(ad.filterOptions.sections) 
					&& _.isEmpty(originalConfig.filterOptions.sections)) {
				status = true;
			} else if(!_.isEmpty(ad.filterOptions.sections) 
					&& !_.isEmpty(originalConfig.filterOptions.sections) 
					&& ad.filterOptions.sections.length == originalConfig.filterOptions.sections.length) {
				var matchedCount = 0;
				_.each(ad.filterOptions.sections,function(sectionId){
					_.each(originalConfig.filterOptions.sections,function(originalSectionId){
						if (sectionId == originalSectionId) {
							matchedCount = matchedCount + 1;
				        }
					});
				});
				if(matchedCount == ad.filterOptions.sections.length) {
					status = true;
				}
			}
			return status;
		}
		
		function isTagsMatched() {
			var status = false;
			if(_.isEmpty(ad.filterOptions.multiTags) 
					&& _.isEmpty(originalConfig.filterOptions.multiTags)) {
				status = true;
			} else if(!_.isEmpty(ad.filterOptions.multiTags) 
					&& !_.isEmpty(originalConfig.filterOptions.multiTags) 
					&& ad.filterOptions.multiTags.length == originalConfig.filterOptions.multiTags.length) {
				var matchedCount = 0;
				_.each(ad.filterOptions.multiTags,function(newTag){
					_.each(originalConfig.filterOptions.multiTags,function(originalTag){
						if (newTag.name == originalTag.name && newTag.value == originalTag.value) {
							matchedCount = matchedCount + 1;
				        }
					});
				});
				if(matchedCount == ad.filterOptions.multiTags.length) {
					status = true;
				}
			}
			return status;
		}
				
		function validateAnnotationSelection() {
			if((!_.isEmpty(ad.filterOptions.annotations) && 
					(ad.filterOptions.annotations.myAnnotations || ad.filterOptions.annotations.sharedAnnotations))
				|| (!_.isEmpty(ad.filterOptions.highlights) && 
								(ad.filterOptions.highlights.myHighlights || ad.filterOptions.highlights.sharedHighlights))) {
				ad.isAnnotationOptionSelected = true;
			} else {
				ad.isAnnotationOptionSelected = false;
				var text = "At least one of the four checkboxes (Highlights / Comments) need to be selected; otherwise the digest will be empty";
				var confirm = VDVCAlertService.open({ text: text });
				confirm.result.then(function() {
					
				}, function() {
					
				});
			}
		}
		
		function isSettingsChanged() {
			var status = false;
			if(isDigestLinkExists()) {
				var startDate = null;
				var endDate = null;
				if(ad.filterOptions.startDate) {
					startDate = moment(ad.filterOptions.startDate).format(defautlDateFormat);
				} else {
					startDate = ad.filterOptions.startDate;
				}
				if(ad.filterOptions.endDate) {
					endDate = moment(ad.filterOptions.endDate).format(defautlDateFormat);
				} else {
					endDate = ad.filterOptions.endDate;
				}
				
				if(ad.digestName != originalConfig.digestName 
						|| ad.digestDescription != originalConfig.digestDescription 
						|| ad.bannerImg != originalConfig.bannerImg
						|| ad.useBannerImg != originalConfig.useBannerImg
						|| (ad.linkInfo.linkObj && ad.linkType.type != ad.linkInfo.linkObj.linkType)
						|| (ad.digestFor == "DigestDocument" && ad.linkInfo.linkObj && ad.linkTarget.target != ad.linkInfo.linkObj.linkTarget)) {
					status = true;
				}
				
				if(!isTagsMatched() 
						|| !isSectionsMatched() 
						|| ad.filterOptions.allTagAnnotations != originalConfig.filterOptions.allTagAnnotations 
						|| ad.filterOptions.annotations.myAnnotations != originalConfig.filterOptions.annotations.myAnnotations 
						|| ad.filterOptions.annotations.sharedAnnotations != originalConfig.filterOptions.annotations.sharedAnnotations
						|| ad.filterOptions.highlights.myHighlights != originalConfig.filterOptions.highlights.myHighlights 
						|| ad.filterOptions.highlights.sharedHighlights != originalConfig.filterOptions.highlights.sharedHighlights
						|| startDate != originalConfig.filterOptions.startDate 
						|| endDate != originalConfig.filterOptions.endDate 
						|| ad.digestMetaInfoOptions.annotationCreatedTime != originalConfig.digestMetaInfoOptions.annotationCreatedTime 
						|| ad.digestMetaInfoOptions.annotationLink != originalConfig.digestMetaInfoOptions.annotationLink 
						|| ad.digestMetaInfoOptions.annotationUserName != originalConfig.digestMetaInfoOptions.annotationUserName 
						|| ad.digestMetaInfoOptions.description != originalConfig.digestMetaInfoOptions.description 
						|| ad.digestMetaInfoOptions.documentName != originalConfig.digestMetaInfoOptions.documentName 
						|| ad.digestMetaInfoOptions.documentLink != originalConfig.digestMetaInfoOptions.documentLink 
						|| ad.digestMetaInfoOptions.documentTags != originalConfig.digestMetaInfoOptions.documentTags 
						|| ad.digestMetaInfoOptions.image != originalConfig.digestMetaInfoOptions.image 
						|| ad.digestMetaInfoOptions.tags != originalConfig.digestMetaInfoOptions.tags 
						|| ad.digestMetaInfoOptions.websiteLogo != originalConfig.digestMetaInfoOptions.websiteLogo
						|| ad.digestMetaInfoOptions.websiteName != originalConfig.digestMetaInfoOptions.websiteName
						|| (ad.enableBorderOption && ad.enableBorderOption.value != originalConfig.enableBorder)
						|| (ad.imagePositionOption && ad.imagePositionOption.value != originalConfig.imagePosition)
						|| (ad.tableOfContents && ad.tableOfContents.value != originalConfig.tableOfContents)
						|| (ad.tableOfContentsHeading != originalConfig.tableOfContentsHeading)
						|| (ad.displayOrderOption && ad.displayOrderOption.value != originalConfig.displayOrder)
						|| (ad.filterOptions.displayRepliesOption && ad.filterOptions.displayRepliesOption.value != originalConfig.filterOptions.displayReplies)
						|| (ad.selectedTemplate && ad.selectedTemplate.id != originalConfig.selectedTemplate)
						|| (ad.includeDocsWithoutAnn != originalConfig.includeDocsWithoutAnn)
						|| (ad.includeDocsWithoutSection != originalConfig.includeDocsWithoutSection)
						|| (ad.groupByOption && ad.groupByOption.value != originalConfig.groupBy)
						|| (ad.sortByOption && originalConfig.sortBy && ad.sortByOption.value != originalConfig.sortBy.field)
						|| (ad.sortOrderOption && originalConfig.sortBy && ad.sortOrderOption.value != originalConfig.sortBy.order)) {
					status = true;
				}
			}
			return status;
		}
		
		function isDigestSettingsChanged() {
			var status = false;
			var startDate = null;
			var endDate = null;
			if(ad.filterOptions.startDate) {
				startDate = moment(ad.filterOptions.startDate).format(defautlDateFormat);
			} else {
				startDate = ad.filterOptions.startDate;
			}
			if(ad.filterOptions.endDate) {
				endDate = moment(ad.filterOptions.endDate).format(defautlDateFormat);
			} else {
				endDate = ad.filterOptions.endDate;
			}
			if(ad.digestName != originalConfig.digestName 
					|| ad.digestDescription != originalConfig.digestDescription 
					|| ad.bannerImg != originalConfig.bannerImg 
					|| ad.useBannerImg != originalConfig.useBannerImg) {
				status = true;
			}
			if(!isTagsMatched() 
					|| !isSectionsMatched() 
					|| ad.filterOptions.allTagAnnotations != originalConfig.filterOptions.allTagAnnotations 
					|| ad.filterOptions.annotations.myAnnotations != originalConfig.filterOptions.annotations.myAnnotations 
					|| ad.filterOptions.annotations.sharedAnnotations != originalConfig.filterOptions.annotations.sharedAnnotations
					|| ad.filterOptions.highlights.myHighlights != originalConfig.filterOptions.highlights.myHighlights 
					|| ad.filterOptions.highlights.sharedHighlights != originalConfig.filterOptions.highlights.sharedHighlights
					|| startDate != originalConfig.filterOptions.startDate 
					|| endDate != originalConfig.filterOptions.endDate 
					|| ad.digestMetaInfoOptions.annotationCreatedTime != originalConfig.digestMetaInfoOptions.annotationCreatedTime 
					|| ad.digestMetaInfoOptions.annotationLink != originalConfig.digestMetaInfoOptions.annotationLink 
					|| ad.digestMetaInfoOptions.annotationUserName != originalConfig.digestMetaInfoOptions.annotationUserName 
					|| ad.digestMetaInfoOptions.description != originalConfig.digestMetaInfoOptions.description 
					|| ad.digestMetaInfoOptions.documentName != originalConfig.digestMetaInfoOptions.documentName 
					|| ad.digestMetaInfoOptions.documentLink != originalConfig.digestMetaInfoOptions.documentLink
					|| ad.digestMetaInfoOptions.documentTags != originalConfig.digestMetaInfoOptions.documentTags 
					|| ad.digestMetaInfoOptions.image != originalConfig.digestMetaInfoOptions.image 
					|| ad.digestMetaInfoOptions.tags != originalConfig.digestMetaInfoOptions.tags 
					|| ad.digestMetaInfoOptions.websiteLogo != originalConfig.digestMetaInfoOptions.websiteLogo
					|| ad.digestMetaInfoOptions.websiteName != originalConfig.digestMetaInfoOptions.websiteName
					|| (ad.enableBorderOption && ad.enableBorderOption.value != originalConfig.enableBorder)
					|| (ad.imagePositionOption && ad.imagePositionOption.value != originalConfig.imagePosition)
					|| (ad.tableOfContents && ad.tableOfContents.value != originalConfig.tableOfContents)
					|| (ad.tableOfContentsHeading != originalConfig.tableOfContentsHeading)
					|| (ad.displayOrderOption && ad.displayOrderOption.value != originalConfig.displayOrder)
					|| (ad.filterOptions.displayRepliesOption && ad.filterOptions.displayRepliesOption.value != originalConfig.filterOptions.displayReplies)
					|| (ad.selectedTemplate && ad.selectedTemplate.id != originalConfig.selectedTemplate)
					|| (ad.includeDocsWithoutAnn != originalConfig.includeDocsWithoutAnn) 
					|| (ad.includeDocsWithoutSection != originalConfig.includeDocsWithoutSection) 
					|| (ad.groupByOption && ad.groupByOption.value != originalConfig.groupBy)
					|| (ad.sortByOption && originalConfig.sortBy && ad.sortByOption.value != originalConfig.sortBy.field)
					|| (ad.sortOrderOption && originalConfig.sortBy && ad.sortOrderOption.value != originalConfig.sortBy.order)) {
				status = true;
			}
			return status;
		}
		
		function configSelectedSections() {
			var removedSectionCount = 0;
			if(!_.isEmpty(ad.filterOptions.sections)){
				_.each(ad.filterOptions.sections,function(sectionId,index){
					var matchedSection = _.findWhere(ad.tsSections,{"id" : sectionId});
					if(sectionId != undefined && sectionId != "" && _.isEmpty(matchedSection)) {
						ad.filterOptions.sections.splice(index, 1);
						removedSectionCount = removedSectionCount+1;
					}
					var filteredIndex = _.findIndex(ad.filteredSections,{"id" : sectionId});
					if(filteredIndex == -1 && !_.isEmpty(matchedSection)) {
						ad.filteredSections.push(matchedSection);
					}
				});
			}
			if(removedSectionCount > 0 && ad.digestFor != 'DigestDocument') {
				var text = "One of section got removed from taskspace which is added in filters.<br><br> So that updating the settings automatcally.";
				if(removedSectionCount > 1) {
					text = "Some of the sections got removed from taskspace which is added in filters.<br><br> So that updating the settings automatcally.";
				}
					
				var confirm = VDVCAlertService.open({ text: text });
				confirm.result.then(function() {
					if(ad.digestFor == 'AnnotationDigest') {
						updateDigestLink(null);
					} else if(ad.digestFor == 'settings') {
						create(true);
					}
				}, function() {
					if(ad.digestFor == 'AnnotationDigest') {
						updateDigestLink(null);
					} else if(ad.digestFor == 'settings') {
						create(true);
					}
				});
			}
		}
		
		function configDigestDataFromDigestLink() {
			var defaultSettings = AnnotationDigestService.getDigestFilters();
			if(!_.isEmpty(ad.linkInfo.properties)) {
				config = ad.linkInfo.properties.digestSettings;
			} else if(!_.isEmpty(ad.linkInfo.linkObj.properties)) {
				config = ad.linkInfo.linkObj.properties.digestSettings;
			} else {
				config = _.isEmpty(settings.digestsettings) ? defaultSettings : settings.digestsettings;
			}
			if(!angular.isDefined(config.includeDocsWithoutSection)) {
				config.includeDocsWithoutSection = defaultSettings.includeDocsWithoutSection;
			}
			if(!angular.isDefined(config.sortBy)) {
				config.sortBy = defaultSettings.sortBy;
			}
			originalConfig = angular.copy(config);
			if(!_.isEmpty(ad.linkInfo.linkObj)) {
				ad.digestName = ad.linkInfo.linkObj.properties.digestSettings.digestName;
				ad.noteName = angular.copy(ad.digestName);
				ad.pdfName = angular.copy(ad.digestName);
				ad.emailSubject = angular.copy(ad.digestName);
				ad.digestDescription = ad.linkInfo.linkObj.properties.digestSettings.digestDescription
				ad.bannerImg = ad.linkInfo.linkObj.properties.digestSettings.bannerImg;
				ad.useBannerImg = ad.linkInfo.linkObj.properties.digestSettings.useBannerImg;
				ad.linkType.type = angular.copy(ad.linkInfo.linkObj.linkType);
				if(!_.isEmpty(ad.linkInfo.linkObj.toEmailIds)) {
					ad.emailUsers = angular.copy(ad.linkInfo.linkObj.toEmailIds);
				}
				ad.linkTarget.target = angular.copy(ad.linkInfo.linkObj.linkTarget) || "Digest ";
				ad.selectedPublishAsLink = true;
			}
			ad.filterOptions = angular.copy(config.filterOptions);
			ad.digestMetaInfoOptions = angular.copy(config.digestMetaInfoOptions);
			//ad.selectedTemplate = angular.copy(config.selectedTemplate);
			ad.filterOptions.startDate = moment(ad.filterOptions.startDate,defautlDateFormat,true).isValid() ? moment(ad.filterOptions.startDate,defautlDateFormat).toDate() : null;
			ad.filterOptions.endDate =  moment(ad.filterOptions.endDate,defautlDateFormat,true).isValid() ? moment(ad.filterOptions.endDate,defautlDateFormat).toDate() : null;
			//ad.selectedTemplate = _.findWhere(ad.templates,{"id": config.selectedTemplate});
			if(ad.digestFor != 'DigestDocument') {
				configSelectedSections();
			}
			var enableBorderOptionIndex = _.findIndex(ad.enableBorderOptionList,{"value" : config.enableBorder});
			if(enableBorderOptionIndex != -1) {
				ad.enableBorderOption = ad.enableBorderOptionList[enableBorderOptionIndex];
			}
			var imagePositionIndex = _.findIndex(ad.imagePositionOptionList,{"value" : config.imagePosition});
			if(imagePositionIndex != -1) {
				ad.imagePositionOption = ad.imagePositionOptionList[imagePositionIndex];
			}
			var tableOfContentsIndex = _.findIndex(ad.tableOfContentsUIOptions,{"value" : config.tableOfContents});
			if(tableOfContentsIndex != -1) {
				ad.tableOfContents = ad.tableOfContentsUIOptions[tableOfContentsIndex];
			}
			ad.tableOfContentsHeading = config.tableOfContentsHeading;
			var displayOrderIndex = _.findIndex(ad.displayOrderOptionList,{"value" : config.displayOrder});
			if(displayOrderIndex != -1) {
				ad.displayOrderOption = ad.displayOrderOptionList[displayOrderIndex];
			}
			var displayRepliesIndex = _.findIndex(ad.displayRepliesOptionList,{"value" : config.filterOptions.displayReplies});
			if(displayRepliesIndex != -1) {
				ad.filterOptions.displayRepliesOption = ad.displayRepliesOptionList[displayRepliesIndex];
			}
			
			ad.groupByOption = _.findWhere(ad.groupByOptionList,{value:config.groupBy});
			onGroupSelection(ad.groupByOption);
			ad.includeDocsWithoutAnn = config.includeDocsWithoutAnn == true ? true : false;
			ad.includeDocsWithoutSection = config.includeDocsWithoutSection == true ? true : false;
			if(!_.isEmpty(config.sortBy)) {
				ad.sortByOption = _.findWhere(ad.sortByOptionList,{value:config.sortBy.field});
				onSortByOptionSelection(ad.sortByOption);
				ad.sortOrderOption = _.findWhere(ad.sortOrderOptionList,{value:config.sortBy.order});
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
			    		  return {"confirmFor" : "cancel", "isAnnotationOptionSelected" : ad.isAnnotationOptionSelected};
			    	  }
			      }
			});
			modalInstance.result.then(function (results) {	
				if(!_.isEmpty(results.action) && results.action == "save") {
					if(ad.digestFor != 'settings') {
						updateDigestLink(null,function() {
							if(typeof cb == "function"){
								cb();
							}
						});
					} else {
						create(true);
					}
				}
				if(!_.isEmpty(results.action) && results.action == "ignore") {
					if(typeof cb == "function"){
						cb();
					}
				}
			});
		}	
		
		function toggleSettings() {
			ad.showSettings = !ad.showSettings;
		}
		
		function closeSettings() {
			if(ad.digestFor == 'settings'){
				$uibModalInstance.dismiss('cancel');
			} else {
				$uibModalInstance.close({"action" : "update", "linkInfo" : ad.linkInfo});
			}
		}
		
		function dismissWindow() {
			if($state.current.name == "digestsettings") {
				$window.close();
			} else {
				closeSettings();
			}
		}
		
		function cancel() {
			if(!_.isEmpty(ad.digestName) && ((ad.digestFor != 'settings' && isSettingsChanged()) || (ad.digestFor == 'settings' && isDigestSettingsChanged()))) {
				confirmCancelPublish(function(){
					dismissWindow();
				});
			} else {
				dismissWindow();
			}
		}
		
		function create(save) {
			settings = getTSState(save);
			$uibModalInstance.close(settings);
		}
		
		function checkIncludeDocsWithoutSection() {
			if(ad.filteredSections.length > 0) {
				ad.includeDocsWithoutSection = false;
			} else if(config && config.includeDocsWithoutSection == true){
				ad.includeDocsWithoutSection = true;
			}
		}
		
		function onSelectSection(section) {
			checkIncludeDocsWithoutSection();
			if(ad.filterOptions.sections == undefined) {
				ad.filterOptions.sections = [];
			}
			if(ad.filterOptions.sections.indexOf(section.id) == -1) {
				ad.filterOptions.sections.push(section.id);
			}
		}
		
		function onRemoveSection(section) {
			checkIncludeDocsWithoutSection();
			var index = ad.filterOptions.sections.indexOf(section.id);
			if(index > -1) {
				ad.filterOptions.sections.splice(index, 1);
			}
		}
		
		function refreshTagInfo (searchkey) {
			  if(!_.isEmpty(searchkey)) {
				 TagService.getAllTags(searchkey).then(function(resp) {
					if(resp.status == 200 && resp.data.Status) {
						ad.tags =[];
						var resultTagList = [];
						resultTagList = resp.data.Tag;
						_.each(resultTagList,function(resultTag){
							ad.tags.push({"name" : resultTag.TagName,"value" : resultTag.Value});
						});
					}
				});
			  }
		}
		
		function showTagName(tag) {
	    	var tagName = angular.copy(tag.name);
	    	if(!_.isEmpty(tag.value)) {
	    		tagName = tagName +" : "+ tag.value;
	    	}
	    	return tagName;
	    }
		
		function onGroupSelection(select) {
			if(select && _.isEmpty(settings.digestsettings) ) {
				if(select.value == "document") {
					ad.digestMetaInfoOptions = angular.copy(AnnotationDigestService.digestMetaInfoDefaultOptions);
					ad.showIncludeDocsWithoutAnnField = true;
					ad.showIncludeDocsWithoutAnySectionField = false;
				} else if(select.value == "tag" || select.value == "taghierarchical") {
					ad.digestMetaInfoOptions = angular.copy(AnnotationDigestService.digestMetaInfoOptionsForGroupByTag);
					ad.showIncludeDocsWithoutAnnField = true;
					ad.showIncludeDocsWithoutAnySectionField = false;
				} else if(select.value == "section") {
					ad.showIncludeDocsWithoutAnnField = true;
					ad.showIncludeDocsWithoutAnySectionField = true;
				}
			} else if(select && !_.isEmpty(settings.digestsettings) ) {
				if(select.value == "document") {
					ad.showIncludeDocsWithoutAnnField = true;
					ad.showIncludeDocsWithoutAnySectionField = false;
				} else if(select.value == "tag" || select.value == "taghierarchical") {
					ad.showIncludeDocsWithoutAnnField = true;
					ad.showIncludeDocsWithoutAnySectionField = false;
				} else if(select.value == "section") {
					ad.showIncludeDocsWithoutAnnField = true;
					ad.showIncludeDocsWithoutAnySectionField = true;
				}
			}
		}
		
		function onSortByOptionSelection(select) {
			if(select && (select.value == "name" || select.value == "date")) {
				ad.showSortOrderOption = true;
				ad.showEditDocOrder = false;
				if(!_.isEmpty(config.sortBy) && (config.sortBy.field == select.value) && !_.isEmpty(config.sortBy.order)) {
					var selectedSortOrder = _.findWhere(ad.sortOrderOptionList,{"value" : config.sortBy.order});
					if(selectedSortOrder) {
						ad.sortOrderOption = selectedSortOrder;
					} else {
						ad.sortOrderOption = ad.sortOrderOptionList[0];
					}
				} else {
					ad.sortOrderOption = ad.sortOrderOptionList[0];
				}
			} else {
				ad.showSortOrderOption = false;
				if(select && (select.value == "custom")) {
					ad.showEditDocOrder = true;
					ad.sortOrderOption = null;
				}
			}
		}
		
		function getDigestLinkSettings() {
			var digestSettings = preProcessDigestDataForLink();
			return digestSettings;
		}
		
		function getTSState(save) {
			var filterOptions = angular.copy(ad.filterOptions);
			if(ad.filterOptions.startDate) {
				filterOptions.startDate = moment(ad.filterOptions.startDate).format(defautlDateFormat);
			} else {
				filterOptions.startDate = ad.filterOptions.startDate;
			}
			if(ad.filterOptions.endDate) {
				filterOptions.endDate = moment(ad.filterOptions.endDate).format(defautlDateFormat);
			} else {
				filterOptions.endDate = ad.filterOptions.endDate;
			}
			
			if(_.isEmpty(filterOptions.sections)) {
				delete filterOptions.sections;
			}
			
			var groupby = ad.groupByOption ? ad.groupByOption.value : null;
			
			/* Back end gives fixed sorted order no need to send oder information */
			/*
			var selectedSort = {};
			selectedSort[ad.selectedSortOption.value] = ad.selectedSortOrder;*/
			
			// Setting default values as back end service handles 
			
			filterOptions["allTagAnnotations"] = true;
			filterOptions.displayReplies = filterOptions.displayRepliesOption.value;
			delete filterOptions.displayRepliesOption;
			
			var includeDocsWithoutAnn = ad.includeDocsWithoutAnn;
			if(ad.groupByOption.value != "document" && ad.groupByOption.value != "section" 
				&& ad.groupByOption.value != "tag" && ad.groupByOption.value != "taghierarchical"){
				includeDocsWithoutAnn = false;
			}
			var includeDocsWithoutSection = ad.includeDocsWithoutSection;
			/*if(ad.groupByOption.value != "section"){
				includeDocsWithoutSection = false;
			}*/
			var digestName = ad.digestName;
			var digestDescription = ad.digestDescription;
			if(_.isEmpty(digestDescription)){
				digestDescription = "";
			}
			var bannerImg = ad.bannerImg;
			if(_.isEmpty(bannerImg)){
				bannerImg = "";
			}
			
			var sortBy = {
					"field" : ad.sortByOption ? ad.sortByOption.value : null,
			};
			
			if(ad.sortByOption.value == "name" || ad.sortByOption.value == "date") {
				sortBy["order"] = ad.sortOrderOption ? ad.sortOrderOption.value : null;
			}
			
			settings.digestsettings = {
					"digestName":digestName,
					"digestDescription":digestDescription,
					"bannerImg" : bannerImg,
					"useBannerImg" : ad.useBannerImg,
					"filterOptions":filterOptions,
					//"sortOptions" : selectedSort,  // Back end gives fixed sorted order no need to send oder information
					"includeDocsWithoutAnn" : includeDocsWithoutAnn,
					"includeDocsWithoutSection" : includeDocsWithoutSection,
					"groupBy" : ad.groupByOption.value,
					"digestMetaInfoOptions" : ad.digestMetaInfoOptions,
					"selectedTemplate" : ad.selectedTemplate ? ad.selectedTemplate.id : null,
					"enableBorder" : ad.enableBorderOption.value,
					"imagePosition" : ad.imagePositionOption.value,
					"tableOfContents" : ad.tableOfContents.value,
					"tableOfContentsHeading" : ad.tableOfContentsHeading || tableOfContentsHeading,
					"displayOrder" : ad.displayOrderOption.value,
					"save" : save,
					"sortBy" : sortBy,
					"sortOptions" : sortBy
					
			};
			if(ad.groupByOption.value != "section" && _.isEmpty(config.docorder)) {
				settings.digestsettings["docorder"] = AnnotationDigestService.getDocOrder(TaskSpaceService.currentTaskspace);
			} else if(!_.isEmpty(config.docorder)) {
				settings.digestsettings["docorder"] = config.docorder;
			}
			
			if(ad.groupByOption.value == "section" && _.isEmpty(config.secorder)) {
				settings.digestsettings["secorder"] = AnnotationDigestService.getSecOrder(TaskSpaceService.currentTaskspace,ad.includeDocsWithoutSection);
			} else if(!_.isEmpty(config.secorder)) {
				var defaultSection = _.findWhere(config.secorder,{"id" : null});
				if(includeDocsWithoutSection) {
					if(_.isEmpty(defaultSection)) {
						defaultSection = AnnotationDigestService.getDefaultSection(TaskSpaceService.currentTaskspace);
						config.secorder.push(defaultSection);
					}
				} else if(!_.isEmpty(defaultSection)) {
					config.secorder = _.reject(config.secorder, function(sec){ 
		    			return sec.id == defaultSection.id; 
		    		});
				}
				settings.digestsettings["secorder"] = config.secorder;
				
			}
			
			return settings;
		}

		function editDocOrder() {
			var settingsFor = "";
			var digestSettings = {};
			var lnk = angular.copy(ad.linkInfo);
			var tsState = {};
			if(showLinkUi() && isDigestLinkExists()) {
				settingsFor = "link";
				digestSettings = getDigestLinkSettings();
				lnk.linkObj.properties.digestSettings.digestName = ad.digestName;
				lnk.linkObj.properties.digestSettings.digestDescription = ad.digestDescription;
				lnk.linkObj.properties.digestSettings.bannerImg = ad.bannerImg;
				lnk.linkObj.properties.digestSettings.useBannerImg = ad.useBannerImg;
				lnk.linkObj.linkType = ad.linkType.type;
				lnk.linkObj.linkTarget = ad.linkTarget.target;
				lnk.linkObj.properties.digestSettings = digestSettings;
			} else {
				settingsFor = "state";
				tsState = getTSState(false);
				digestSettings = tsState.digestsettings;
				delete tsState.digestsettings.save;
				tsState.clientId = TaskSpaceService.currentTaskspace.clientId;
				var accessedFrom = "viewDigest";
				var fromSource = "FromNumici";
				if($stateParams.digest) {
					accessedFrom = "liveDigest";
					fromSource = "FromNumici";
				}
				if(!_.isEmpty(accessedFrom)) {
					tsState["accessedFrom"] = accessedFrom;
				}
				if(!_.isEmpty(fromSource)) {
					tsState["fromSource"] = fromSource;
				}
				tsState["action"] = "saveDigestSettings";
			}
			
			var windowClass = "edit-doc-order-content";
			var editSortOrderSize = "md";
			var sortTitle = "Sort Sections / Documents Order";
			if(ad.groupByOption.value != "section" || (ad.groupByOption.value == "section" && !AnnotationDigestService.tsHasSections(TaskSpaceService.currentTaskspace))) {
				editSortOrderSize = "sm"
				sortTitle = "Sort Documents Order";
			}
				
			var modalInstance = $uibModal.open({
			      animation: true,
			      templateUrl: 'app/components/AnnotationDigest/EditDocOrder/EditDocOrder.html',
			      controller: 'EditDocOrderController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'edoc',
			      windowClass: windowClass,
			      backdrop: 'static',
			      size : editSortOrderSize,
			      resolve: {
			    	  currentTaskspace :function() {
			    		  return TaskSpaceService.currentTaskspace;
			    	  },
			    	  resource :function() {
			    		  return {
			    			  "title" : sortTitle,
			    			  "settingsFor" : settingsFor,
			    			  "digestSettings" : digestSettings,
			    			  "tsState" : tsState,
			    			  "linkInfo" : lnk
			    			};
			    	  }
			      }
			});
			modalInstance.result.then(function (results) {
				if(settingsFor == "link") {
					MessageService.showSuccessMessage("DIGEST_LINK_UPDATE");
					if($state.current.name == "digestsettings") {
						sendDigestResp($window,"digest_settings_update_resp",results.linkInfo);
					}
				}
				$uibModalInstance.close(results);
			});
			modalInstance.rendered.then(function(){
				if($state.current.name == "sharelinks") {
					var dailogCss = {
		        			"width": "100%",
				            "height": "100%",
				            "margin": "0px"
				        };
		        	var contentCss = {
		        			"height": "100%"
				        };
					$('.'+windowClass+' .modal-dialog').css(dailogCss);
					$('.'+windowClass+' .modal-content').css(contentCss);
					$('.'+windowClass+' .digest-preview-content').css('max-height', '400px');
				}
	        });
		}
		
		function onTableOfContentsSelection(select) {
			if(select && select.value == "notInclude") {
				ad.showTableOfContentsHeadingField = false;
			} else {
				ad.showTableOfContentsHeadingField = true;
			}
		}
		
		function isDigestLinkExists() {
			return !_.isEmpty(ad.linkInfo.url);
		}
		
		function addBoderForPublicLink() {
			return ad.digestFor == 'AnnotationDigest' && _.isEmpty(ad.linkInfo.url);
		}
		
		function preProcessDigestDataForLink() {
			var filterOptions = angular.copy(ad.filterOptions);
			
			filterOptions.endDate = moment(ad.filterOptions.endDate).format(defautlDateFormat);
			filterOptions.startDate = moment(ad.filterOptions.startDate).format(defautlDateFormat);
						
			if( !moment(filterOptions.startDate,defautlDateFormat,true).isValid()) {
				filterOptions.startDate = null;
			}
			if( !moment(filterOptions.endDate,defautlDateFormat,true).isValid()) {
				filterOptions.endDate = null;
			}
			
			if(_.isEmpty(filterOptions.sections)) {
				delete filterOptions.sections;
			}
			
			filterOptions.displayReplies = filterOptions.displayRepliesOption.value;
			delete filterOptions.displayRepliesOption;
			
			filterOptions["allTagAnnotations"] = true;
			var groupBy = ad.groupByOption ? ad.groupByOption.value : null;
			
			var includeDocsWithoutAnn = ad.includeDocsWithoutAnn;
			if(ad.groupByOption.value != "document" && ad.groupByOption.value != "section" 
				&& ad.groupByOption.value != "tag" && ad.groupByOption.value != "taghierarchical"){
				includeDocsWithoutAnn = false;
			}
			var includeDocsWithoutSection = ad.includeDocsWithoutSection;
			/*if(ad.groupByOption.value != "section"){
				includeDocsWithoutSection = false;
			}*/
			var sortBy = {
					"field" : ad.sortByOption ? ad.sortByOption.value : null,
			};
			
			if(ad.sortByOption.value == "name" || ad.sortByOption.value == "date") {
				sortBy["order"] = ad.sortOrderOption ? ad.sortOrderOption.value : null;
			}
			
			var digestSettings = {
					"digestName": ad.digestName, 
					"digestDescription": ad.digestDescription,
					"bannerImg":ad.bannerImg,
					"useBannerImg" : ad.useBannerImg,
					"objectId": settings.taskspaceId, 
					"clientId": settings.clientId,
					"context" : "taskspace",
					"filterOptions" : filterOptions,
					"includeDocsWithoutAnn" : includeDocsWithoutAnn,
					"includeDocsWithoutSection" : includeDocsWithoutSection,
					"groupBy": ad.groupByOption.value,
					"digestMetaInfoOptions": ad.digestMetaInfoOptions,
					"selectedTemplate": ad.selectedTemplate ? ad.selectedTemplate.id : null,
					"enableBorder" : ad.enableBorderOption.value,
					"imagePosition" : ad.imagePositionOption.value,
					"tableOfContents" : ad.tableOfContents.value,
					"tableOfContentsHeading" :ad.tableOfContentsHeading || tableOfContentsHeading,
					"displayOrder" : ad.displayOrderOption.value,
					"sortBy" : sortBy
			};
			
			if(ad.groupByOption.value != "section" && _.isEmpty(config.docorder)) {
				digestSettings["docorder"] = AnnotationDigestService.getDocOrder(TaskSpaceService.currentTaskspace);
			} else if(!_.isEmpty(config.docorder)) {
				digestSettings["docorder"] = config.docorder;
			}
			
			if(ad.groupByOption.value == "section" && _.isEmpty(config.secorder)) {
				digestSettings["secorder"] = AnnotationDigestService.getSecOrder(TaskSpaceService.currentTaskspace,ad.includeDocsWithoutSection);
			} else if(!_.isEmpty(config.secorder)) {
				if(includeDocsWithoutSection) {
					var defaultSection = _.findWhere(config.secorder,{"id" : null});
					if(_.isEmpty(defaultSection)) {
						defaultSection = AnnotationDigestService.getDefaultSection(TaskSpaceService.currentTaskspace);
						config.secorder.push(defaultSection);
					}
				} else if(!_.isEmpty(defaultSection)) {
					config.secorder = _.reject(config.secorder, function(sec){ 
		    			return sec.id == defaultSection.id; 
		    		});
				}
				digestSettings["secorder"] = config.secorder;
			}
			
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
		
		function deleteDigestLink() {
			var lnk = angular.copy(ad.linkInfo);
			var text = "Are you sure you want to delete the Digest Link?";
			
  			$confirm({text: text}).then(function() {
  				DeepLinkService.deleteLink(lnk.linkObj,settings.clientId).then(function(resp) {
					if(resp.status == 200 && resp.data.Status) {
						ad.linkInfo = {};
						ad.linkType.type = "Private";
						configDigestDataFromTaskspace();
						MessageService.showSuccessMessage("DIGEST_LINK_DELETE");
						if($state.current.name == "digestsettings") {
							sendDigestResp($window,"digest_settings_delete_resp",ad.linkInfo);
						} else if(ad.digestFor == "DigestDocument" || ad.digestFor == "AnnotationDigest") {
							$uibModalInstance.close({"action" : "delete"});
						} else {
							cancel();
						}
					}
				});
		    });
		}
		
		function updateLink(linkObj,clientId) {
			return DeepLinkService.updateLink(linkObj,clientId);
		}
		
		function updateDigestDocAnnot(linkObj,clientId) {
			return DeepLinkService.updateDigestDocAnnot(linkObj);
		}
		
		function sendDigestResp($window,digestRespType,digestRespData) {
			if(!$window.opener) {
				console.log("Parent window closed");
				return;
			}
			var oAuthResponse = {type:digestRespType,code:"Digest Settings",state:"Success",data:digestRespData};
			$window.opener.postMessage(oAuthResponse,origin);
			$window.close();
		}
		
		function updateDigestLink(toEmailIds,cb) {
			var digestSettings = preProcessDigestDataForLink();
			var lnk = angular.copy(ad.linkInfo);
			var updateLinkPromise;
			lnk.linkObj.properties.digestSettings.digestName = ad.digestName;
			lnk.linkObj.properties.digestSettings.digestDescription = ad.digestDescription;
			lnk.linkObj.properties.digestSettings.bannerImg = ad.bannerImg;
			lnk.linkObj.properties.digestSettings.useBannerImg = ad.useBannerImg;
			if(toEmailIds) {
				lnk.linkObj.toEmailIds = toEmailIds;
			}
			lnk.linkObj.linkType = ad.linkType.type;
			lnk.linkObj.linkTarget = ad.linkTarget.target;
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
						ad.linkInfo = resp.data.Link;
						configDigestDataFromDigestLink();
						MessageService.showSuccessMessage("DIGEST_LINK_UPDATE");
						if($state.current.name == "digestsettings") {
							sendDigestResp($window,"digest_settings_update_resp",ad.linkInfo);
						} else if(ad.digestFor == "DigestDocument") {
							$uibModalInstance.close({"action" : "update","linkInfo" : ad.linkInfo});
						}
						if(typeof cb == "function") {
							cb();
						}
					}
				});
			}
		}
		
		function copySuccess() {
			ad.focusLink = false;
			APIUserMessages.info("Link copied to clipboard.");
			ad.focusLink = true;
			$timeout(function() {
				$uibModalInstance.dismiss('cancel');
			}, 100);
		}
		
		function copyFail(err) {
			console.log(err);
		}
		
		function getShareLink(externalApp) {
			if(!_.isEmpty(ad.linkInfo)){
				if(externalApp == "twitter") {
					var url = "https://twitter.com/intent/tweet?url="+encodeURIComponent(ad.linkInfo.url+"&hashtags=annotated");
					$window.open(url,'_blank');
				} else if(externalApp == "facebook") {
					var url = "https://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent(ad.linkInfo.url);
					$window.open(url,'_blank');
				} else if(externalApp == "whatsapp") {
					var baseUrl = "https://api.whatsapp.com/send?text=";
					var digestSettings = {};
					if(!_.isEmpty(ad.linkInfo.properties)) {
						digestSettings = ad.linkInfo.properties.digestSettings;
					} else if(!_.isEmpty(ad.linkInfo.linkObj.properties)) {
						digestSettings = ad.linkInfo.linkObj.properties.digestSettings;
					}
					var uriComponenet = digestSettings.digestName;
					if(digestSettings.digestDescription.length > 0) {
						uriComponenet = uriComponenet+"\n"+digestSettings.digestDescription+"\n"+ad.linkInfo.url
					} else {
						uriComponenet = uriComponenet+"\n"+ad.linkInfo.url
					}
					var url = baseUrl+encodeURIComponent(uriComponenet);
					$window.open(url,'_blank');
				} else if(externalApp == "linkedIn") {
					var url = "https://www.linkedin.com/sharing/share-offsite/?url="+encodeURIComponent(ad.linkInfo.url);
					$window.open(url,'_blank');
				}
			}
			return "";
		}
		
		function ShareOnSocialMedia(mediaChannel) {
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
			} else if(mediaChannel == "Slack") {
				if(appdata.UserSettings.additionalNavigation_Slack && appdata.UserSettings.additionalNavigation_Slack == 'Enabled') {
					if(appdata.hasSlackAuth){
						PostToSocialMedia(true,mediaChannel);
					} else {
						confirmAndShareOnSocialMedia(mediaChannel);
					}
				}
			}
		}
		
		function PostToSocialMedia(authEnabled, mediaChannel) {
			getShareCommentaryTextForSocialMedia(function(shareCommentaryTxt){
				var modalInstance = $uibModal.open({
					  animation: true,
					  templateUrl: 'app/components/AnnotationDigest/create/Post/PostToSocialMedia/PostToSocialMedia.html',
					  controller: 'PostToSocialMediaController',
					  appendTo : $('.rootContainer'),
					  controllerAs: 'ptsmc',
					  backdrop: 'static',
					  size : 'lg',
					  resolve: {
						  DigestLinkinfo :function() {
							  return ad.linkInfo;
						  },
						  shareCommentaryText : function() {
							  return shareCommentaryTxt;
						  }
						  ,
						  socialMediaAuthInfo : function() {
							  return {"authEnabled":authEnabled,"mediaChannel":mediaChannel};
						  }
					  }
				});
			});
		}
		
		function confirmAndShareOnSocialMedia(mediaChannel) {
			var confirmationMsgTextLocal = "Would like to authorize Numici to post messages in "+mediaChannel+"?";
			
			if(mediaChannel == "LinkedIn") {
				var linkedInAuthUsrConfMsgText = _.findWhere(appdata.ShareLinkInfo,{"key":"linkedInAuthUsrConfMsgText"});
				var confirmationMsgText = linkedInAuthUsrConfMsgText && linkedInAuthUsrConfMsgText.value ? linkedInAuthUsrConfMsgText.value : confirmationMsgTextLocal;
			}
			
    		var VDVCConfirmModalInstance = VDVCConfirmService.open({text : confirmationMsgText,title : "Confirm "+mediaChannel+" Authorization",actionButtonText : "AUTHORIZE NOW",closeButtonText : "AUTHORIZE LATER"});
    		VDVCConfirmModalInstance.result.then(function() {
    			if(mediaChannel == "LinkedIn") {
    				LinkedInService.autherize();	
    			}
    		},function() {
    			PostToSocialMedia(false,mediaChannel);
    		});
		}
		
		function checkAndCreateLink(cb) {
			if(!_.isEmpty(ad.digestName) || ad.digestFor == "DigestDocument") {
				if(!_.isEmpty(ad.linkInfo.url)) {
					if(typeof cb == "function") {
						cb();
					}
				} else {
					var digestSettings = preProcessDigestDataForLink();
					var lnk = AnnotationDigestService.processLinkInfo(digestFor, settings.taskspaceId, settings.clientId, digestSettings);
					DeepLinkService.createLink(lnk).then(function(createLinkResp) {
						if(createLinkResp.status == 200 && createLinkResp.data.Status) {
							ad.linkInfo = createLinkResp.data.Link;
							if(!_.isEmpty(ad.linkInfo.properties)) {
								config = ad.linkInfo.properties.digestSettings;
							} else if(!_.isEmpty(ad.linkInfo.linkObj.properties)) {
								config = ad.linkInfo.linkObj.properties.digestSettings;
							} else {
								config = _.isEmpty(settings.digestsettings) ? AnnotationDigestService.getDigestFilters() : settings.digestsettings;
							}
							originalConfig = angular.copy(config);
							if(typeof cb == "function") {
								cb();
							}
						}
					});
				}
			}
		}
		
		function getDigestContent(saveflag,contenteditable) {
			return $timeout(function() {
				var templateUrl = 'app/components/AnnotationDigest/save/annotaion-digest-template-new.html';
				var roottemplateUrl = 'app/components/AnnotationDigest/save/digest-root.tpl.html';
				
				AnnotationDigestService.enableBorder = "";
				AnnotationDigestService.enableBorder = angular.copy(ad.enableBorderOption.value);
				var tmpl = '';
				var gptmpl = '';
				tmpl = '<annotaion-digest-template digest="ad.digestData"';
				gptmpl = '<annotaion-digest-group-template digest="ad.digestData"';
				
				if(!_.isEmpty(ad.digestName)) {
					tmpl = tmpl+' digest-name="'+ad.digestName+'"';
					gptmpl = gptmpl+' digest-name="'+ad.digestName+'"';
				}
				
				if(!_.isEmpty(ad.digestDescription)) {
					var digestDescription = angular.copy(ad.digestDescription);
					digestDescription = digestDescription.replace(/(\r\n|\n|\r)/gm, "<br>");
					tmpl = tmpl+' description="{{\''+digestDescription+'\'}}"';
					gptmpl = gptmpl+' description="{{\''+digestDescription+'\'}}"';
				}
				
/*				tmpl = tmpl+' enable-border="'+ad.enableBorderOption.value+'"';
				gptmpl = gptmpl+' enable-border="'+ad.enableBorderOption.value+'"';*/
				
				tmpl = tmpl+' template-url="'+templateUrl+'" \
					data-content-editable="'+contenteditable+'"\
					task-space="taskspace"\
					title="true"\
					data-digest-meta-info-options="ad.digestMetaInfoOptions"\
					data-image-position="ad.imagePositionOption.value"\
					data-table-of-contents="ad.tableOfContents.value"\
					data-table-of-contents-title="ad.tableOfContentsHeading"\
					data-display-order="ad.displayOrderOption.value"\
					data-display-replies="ad.filterOptions.displayRepliesOption.value"\
					data-enable-border="ad.enableBorderOption.value"\
					data-group-by="ad.groupByOption.value"\
				    data-set-diges-min-max-width= "ad.setDigesMinMaxWidth()"\
					data-get-title-styles = "ad.getTitleStyles()"\
					data-alternate-image-styles = "ad.alternateImageStyles()"\
					data-set-rep-digest-styles = "ad.setRepDigestStyles(digest,ad.digestMetaInfoOptions.image)"\
					data-get-annotated-text = "ad.getAnnotatedText(annotation)"\
					data-format-created-date = "ad.formatCreatedDate(dateValue)"\
					data-format-comment="ad.formatComment(annotation,comment)"\
			    	comment-icon-url = "ad.commentIconUrl"\
					></annotaion-digest-template>';
				
				gptmpl = gptmpl+' template-url="'+templateUrl+'" \
					data-content-editable="'+contenteditable+'"\
					task-space="taskspace"\
					data-digest-meta-info-options="ad.digestMetaInfoOptions"\
					data-image-position="ad.imagePositionOption.value"\
					data-table-of-contents="ad.tableOfContents.value"\
					data-table-of-contents-title ="ad.tableOfContentsHeading"\
					data-display-order="ad.displayOrderOption.value"\
					data-display-replies="ad.filterOptions.displayRepliesOption.value"\
					data-enable-border="ad.enableBorderOption.value"\
					data-group-by="ad.groupByOption.value"\
					data-set-diges-min-max-width= "ad.setDigesMinMaxWidth()"\
					data-get-title-styles = "ad.getTitleStyles()"\
					data-alternate-image-styles = "ad.alternateImageStyles()"\
					data-set-rep-digest-styles = "ad.setRepDigestStyles(digest,ad.digestMetaInfoOptions.image)"\
					data-get-annotated-text = "ad.getAnnotatedText(annotation)"\
					data-format-created-date = "ad.formatCreatedDate(dateValue)"\
					data-format-comment="ad.formatComment(annotation,comment)"\
			    	comment-icon-url = "ad.commentIconUrl"\
					></annotaion-digest-group-template>';
				
				var template = angular.element(tmpl);
				if(ad.groupByOption.value == "tag" || ad.groupByOption.value == "taghierarchical" || ad.groupByOption.value == "section") {
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
		
		function getDigestContentAndSaveAsNote(result){
			getDigestContent(true,false).then(function(content) {
				AnnotationDigestService.SaveAsNote(result,content,ad.linkInfo,appdata["OrganizationId"],$state);
			}); 
		}
				
		function getDigestContentAndSaveAsPdf(fileName) {
			getDigestContent(true,false).then(function(content) {
				AnnotationDigestService.SaveAsPdf(fileName,content,ad.linkInfo,DocFactory);
			});
		}
		
		function sendMail(content) {
			 var mailPopupModalInstance = MailService.open({"emailUsers" : ad.emailUsers,"subject" : ad.emailSubject,"content" : content});
			 mailPopupModalInstance.result.then(function (results) {
				 if(results.action == "saveAsDraft"){
					 AnnotationDigestService.sendAsEMailDraft(results,content,ad.linkInfo).then(function(resp) {
						 if(resp.status == 200 && resp.data.Status) {
							 APIUserMessages.success("Mail saved as draft successfully");
						 }
					 });
				 } else {
					 if(!_.isEmpty(results.toEmailIds)) {
						 AnnotationDigestService.sendAsEMail(results,content,ad.linkInfo).then(function(resp) {
							 if(resp.status == 200 && resp.data.Status) {
								 APIUserMessages.success("Mail sent successfully");
							 }
						});
					 } 
				 }
			 });
		}
		
		function getDigestContentAndSendAsMail(result){
			getDigestContent(true,false).then(function(content) {
				sendMail(content);
			}); 
		}
		
		//## HM : commented the below function as we will not be using this and using a new function 'openPreviewModalPopup'
		/*function getDigestContentAndPreview(result){
			var windowClass = "";
			if($state.current.name == "sharelinks") {
				 windowClass = "digest-preview-modal-window";
			}
			var sortBy = {
					"field" : ad.sortByOption ? ad.sortByOption.value : null,
			};
			
			if(ad.sortByOption.value == "name" || ad.sortByOption.value == "date") {
				sortBy["order"] = ad.sortOrderOption ? ad.sortOrderOption.value : null;
			}
			var modalInstance = $uibModal.open({
			      animation: true,
			      templateUrl: 'app/components/AnnotationDigest/Preview/AnnotationDigestPreview.html',
			      controller: 'AnnotationDigestPreviewController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'adpc',
			      windowClass: windowClass,
			      backdrop: 'static',
			      size : 'lg',
			      resolve: {
			    	  DigestData :function() {
			    		  return {
			    			  "digestData" : ad.digestData,
			    			  "enableBorder" : ad.enableBorderOption.value,
			    			  "imagePosition" : ad.imagePositionOption.value,
                              "tableOfContents" : ad.tableOfContents.value,
							  "tableOfContentsHeading" : ad.tableOfContentsHeading || angular.copy(AnnotationDigestService.getTableOfContentsHeading()),
			    			  "displayOrder" : ad.displayOrderOption.value,
			    			  "displayReplies" : ad.filterOptions.displayRepliesOption ? ad.filterOptions.displayRepliesOption.value : "donotshowreplies",
			    			  "digestName" : ad.digestName,
			    			  "digestDescription" : ad.digestDescription,
			    			  "includeDocsWithoutAnn" : ad.includeDocsWithoutAnn,
			    			  "groupBy" : ad.groupByOption.value,
			    			  "sortBy" : sortBy,
			    			  "digestMetaInfoOptions" : ad.digestMetaInfoOptions,
			    			  "digestFor" : digestFor.digestFor
			    			  
			    		  };
			    	  }
			      }
			});
			modalInstance.result.then(function (results) {	
				
			});
			modalInstance.rendered.then(function(){
				if($state.current.name == "sharelinks") {
					var dailogCss = {
		        			"width": "100%",
				            "height": "100%",
				            "margin": "0px"
				        };
		        	var contentCss = {
		        			"height": "100%"
				        };
					$('.'+windowClass+' .modal-dialog').css(dailogCss);
					$('.'+windowClass+' .modal-content').css(contentCss);
					$('.'+windowClass+' .digest-preview-content').css('max-height', '400px');
				}
	        });
		}*/
		
		function processDataForPublish(result){
			//let taskspace = {};
			var AnnotationDigestResp = result.AnnotationDigestResp;
/*			var digestTemplates = result.digestTemplates;
			if(digestTemplates) {
				_.each(digestTemplates,function(val,index) {
					$templateCache.put(val.id+".html", val.template);
				});
			}*/
			
			/*if(!_.isEmpty(AnnotationDigestResp.digestSettings)) {
				AnnotationDigestService.taskspaceId = AnnotationDigestResp.digestSettings.objectId;
				AnnotationDigestService.taskspaceClientId = AnnotationDigestResp.digestSettings.clientId;
			} else if(!_.isEmpty(settings)) {
				AnnotationDigestService.taskspaceId = settings.taskspaceId; 
				AnnotationDigestService.taskspaceClientId = settings.clientId;
			}*/
			
			AnnotationDigestService.processDataForPublish(result,settings,ad.digestMetaInfoOptions);
			var linkAnnotationDigestResp = AnnotationDigestResp.AnnotationDigest;
			trustedAnnotatedText = {};
			ad.digestData = AnnotationDigestService.preProcessAnnotationDigestResp(linkAnnotationDigestResp,config,AnnotationDigestResp.dlId,taskspaceInfo);
			if(!_.isEmpty(result.publishFor) && result.publishFor == "numicinote") {
				getDigestContentAndSaveAsNote(result);
			} else if(!_.isEmpty(result.publishFor) && result.publishFor == "pdf") {
				getDigestContentAndSaveAsPdf(result.fileName);
			} else if(!_.isEmpty(result.publishFor) && result.publishFor == "email") {
				getDigestContentAndSendAsMail(result);
			}/* else if(!_.isEmpty(result.publishFor) && result.publishFor == "preview") {
				getDigestContentAndPreview(result);
			}*/
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
							  //$uibModalInstance.close(publishedData);
							  processDataForPublish(publishedData);
						  } else {
							  var text = 'Unable to replace document as '+resp.data.LockOwner+' is currently editing the file';
							  VDVCAlertService.open({text:text});
						  }
					});
					
	    		},function() {
	    			
	    		});
	    	} else {
	    		file.isOverWrite = false;
	    		publishedData["folderId"]= fileInfo.fldrId;
	    		publishedData["fileName"]= fileInfo.file[0].name;
	    		publishedData["isOverWrite"]= file.isOverWrite;
				//$uibModalInstance.close(publishedData);
	    		processDataForPublish(publishedData);
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
			}); 
		}
		
		function createAnnotationDigestAndPublish(publishedData,accessedFrom,fromSource) {
			var postdata = {
						"objectId": settings.taskspaceId, 
						"clientId": settings.clientId,
						"context" : "taskspace",
						"filterOptions" : angular.copy(ad.filterOptions),
						"sortOptions" : config.sortOptions,
						"includeDocsWithoutAnn" : ad.includeDocsWithoutAnn,
						"groupBy": ad.groupByOption ? ad.groupByOption.value : null
				};
				if(ad.groupByOption.value != "section" && _.isEmpty(config.docorder)) {
					postdata["docorder"] = AnnotationDigestService.getDocOrder(TaskSpaceService.currentTaskspace);
				} else if(!_.isEmpty(config.docorder)) {
  					postdata["docorder"] = config.docorder;
  				}
				
				if(ad.groupByOption.value == "section" && _.isEmpty(config.secorder)) {
					postdata["secorder"] = AnnotationDigestService.getSecOrder(TaskSpaceService.currentTaskspace,ad.includeDocsWithoutSection);
				} else if(!_.isEmpty(config.secorder)) {
					if(ad.includeDocsWithoutSection) {
						var defaultSection = _.findWhere(config.secorder,{"id" : null});
						if(_.isEmpty(defaultSection)) {
							defaultSection = AnnotationDigestService.getDefaultSection(TaskSpaceService.currentTaskspace);
							config.secorder.push(defaultSection);
						}
					} else if(!_.isEmpty(defaultSection)) {
						config.secorder = _.reject(config.secorder, function(sec){ 
			    			return sec.id == defaultSection.id; 
			    		});
					}
					postdata["secorder"] = config.secorder;
				}
				
				postdata.filterOptions.startDate = moment(postdata.filterOptions.startDate,defautlDateFormat,true).isValid() ? moment(postdata.filterOptions.startDate).format(defautlDateFormat) : null;
				postdata.filterOptions.endDate =  moment(postdata.filterOptions.endDate,defautlDateFormat,true).isValid() ? moment(postdata.filterOptions.endDate).format(defautlDateFormat) : null;
				/*if( !moment(postdata.filterOptions.endDate,defautlDateFormat,true).isValid()) {
					postdata.filterOptions.endDate = null;
				}
				
				if( !moment(postdata.filterOptions.startDate,defautlDateFormat,true).isValid()) {
					postdata.filterOptions.startDate = null;
				}*/
				postdata.filterOptions.displayReplies = postdata.filterOptions.displayRepliesOption.value;
				delete postdata.filterOptions.displayRepliesOption;
				
				if (digestFor.digestFor == "DigestDocument") {
					if (digestFor.documentInfo) {
						postdata.documents = [digestFor.documentInfo.objectId];
					}
				}
				if(!_.isEmpty(accessedFrom)) {
					postdata["accessedFrom"] = accessedFrom;
					
				}
				if(!_.isEmpty(fromSource)) {
					postdata["fromSource"] = fromSource;
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
  							if(!_.isEmpty(ad.noteName)) {
  								fileInfo.file[0]["name"] = ad.noteName;
  								preProcessNoteAndPublish(publishedData);
  							}
  						} else if(publishedData.publishFor == "pdf"){
  							if(!_.isEmpty(ad.pdfName)) {
  								publishedData["fileName"]= ad.pdfName;
  								//$uibModalInstance.close(publishedData);
  								processDataForPublish(publishedData);
  							}
  						} else if(publishedData.publishFor == "email"){
  							processDataForPublish(publishedData);
  						}/* else if(publishedData.publishFor == "preview"){
  							processDataForPublish(publishedData);
  						}*/
  					}
	  			});
		}
		
		function getHtmlDigestAndOpenPreviewModal(accessedFrom,fromSource) {
			var postdata = config;
			postdata["objectId"] = settings.taskspaceId;
			postdata["clientId"] = settings.clientId;
			postdata["context"] = "taskspace";
			postdata["filterOptions"] = angular.copy(ad.filterOptions);
			postdata["includeDocsWithoutAnn"] = ad.includeDocsWithoutAnn;
			postdata["includeDocsWithoutSection"] = ad.includeDocsWithoutSection;
			postdata["digestFor"] = "ViewDigest";
			postdata["transformImageUrls"] = true;
			
			if(ad.groupByOption.value != "section" && _.isEmpty(config.docorder)) {
				postdata["docorder"] = AnnotationDigestService.getDocOrder(TaskSpaceService.currentTaskspace);
			} else if(!_.isEmpty(config.docorder)) {
				postdata["docorder"] = config.docorder;
			}
			
			if(ad.groupByOption.value == "section" && _.isEmpty(config.secorder)) {
				postdata["secorder"] = AnnotationDigestService.getSecOrder(TaskSpaceService.currentTaskspace,ad.includeDocsWithoutSection);
			} else if(!_.isEmpty(config.secorder)) {
				if(ad.includeDocsWithoutSection) {
					var defaultSection = _.findWhere(config.secorder,{"id" : null});
					if(_.isEmpty(defaultSection)) {
						defaultSection = AnnotationDigestService.getDefaultSection(TaskSpaceService.currentTaskspace);
						config.secorder.push(defaultSection);
					}
				} else if(!_.isEmpty(defaultSection)) {
					config.secorder = _.reject(config.secorder, function(sec){ 
		    			return sec.id == defaultSection.id; 
		    		});
				}
				postdata["secorder"] = config.secorder;
			}
			
			postdata.filterOptions.startDate = moment(postdata.filterOptions.startDate,defautlDateFormat,true).isValid() ? moment(postdata.filterOptions.startDate).format(defautlDateFormat) : null;
			postdata.filterOptions.endDate =  moment(postdata.filterOptions.endDate,defautlDateFormat,true).isValid() ? moment(postdata.filterOptions.endDate).format(defautlDateFormat) : null;
			
			postdata.filterOptions.displayReplies = postdata.filterOptions.displayRepliesOption.value;
			delete postdata.filterOptions.displayRepliesOption;
			
			if(!_.isEmpty(accessedFrom)) {
				postdata["accessedFrom"] = accessedFrom;
			}
			if(!_.isEmpty(fromSource)) {
				postdata["fromSource"] = fromSource;
			}
			openPreviewModalPopup(postdata);
		}
		
		function openPreviewModalPopup(htmlDigestPostdata){
			var windowClass = "digest-preview-modal-window";
			var modalInstance = $uibModal.open({
			      animation: true,
			      templateUrl: 'app/components/AnnotationDigest/Preview/AnnotationDigestHtmlPreview.html',
			      controller: 'AnnotationDigestHtmlPreviewController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'adhpc',
			      windowClass: windowClass,
			      backdrop: 'static',
			      size : 'lg',
			      resolve: {
			    	  DigestData :function() {
			    		  return {
			    			  "htmlDigestPostdata" : htmlDigestPostdata
			    		  };
			    	  }
			      }
			});
			modalInstance.result.then(function (results) {	
				
			});
			modalInstance.rendered.then(function(){
				if($state.current.name == "sharelinks") {
					var dailogCss = {
		        			"width": "100%",
				            "height": "100%",
				            "margin": "0px"
				        };
		        	var contentCss = {
		        			"height": "100%"
				        };
					$('.'+windowClass+' .modal-dialog').css(dailogCss);
					$('.'+windowClass+' .modal-content').css(contentCss);
					$('.'+windowClass+' .digest-preview-content').css('max-height', '400px');
				} else {
					var dailogCss = {
		        			"width": "80%",
		        			"min-width" : "950px"
				        };
					$('.'+windowClass+' .modal-dialog').css(dailogCss);
				}
	        });
		}
		
		function isLinkCreated() {
			var status = false;
			if(!_.isEmpty(ad.linkInfo.url)) {
				status = true;
			}
			return status;
		}
		
		function cancelsaveAsSelectedType(SelectedType) {
			if(SelectedType == "numicinote"){
				ad.selectedPublishAsNote = false;
				if(ad.digestFor == 'AnnotationDigest') {
					ad.selectedPublishAsLink = true;
				} else if(ad.digestFor == 'DigestDocument') {
					ad.showdocLink = true;
				}
			} else if(SelectedType == "pdf"){
				ad.selectedPublishAsPdf = false;
				if(ad.digestFor == 'AnnotationDigest') {
					ad.selectedPublishAsLink = true;
				} else if(ad.digestFor == 'DigestDocument') {
					ad.showdocLink = true;
				}
			}
		}
		
		function saveAsSelectedType(SelectedType) {
			var publishedData = {"publishFor" : SelectedType};
			if(SelectedType == "preview"){
				var accessedFrom  = "Preview";
				var fromSource = "FromNumici";
				if($state.current.name == "sharelinks") {
					fromSource = "FromExt";
				}
				//createAnnotationDigestAndPublish(publishedData,accessedFrom,fromSource);
				getHtmlDigestAndOpenPreviewModal(accessedFrom,fromSource);
			} else {
				checkAndCreateLink(function() {
					AnnotationDigestService.createLinkAnnotationDigest({linkId : ad.linkInfo.id,clientId : $stateParams.tsc},function(respData) {
						if(!_.isEmpty(respData.AnnotationDigest)) {
							publishedData["AnnotationDigestResp"]= respData;
	  						if(publishedData.publishFor == "numicinote") {
	  							if(!_.isEmpty(ad.noteName)) {
	  								fileInfo.file[0]["name"] = ad.noteName;
	  								preProcessNoteAndPublish(publishedData);
	  							}
	  						} else if(publishedData.publishFor == "pdf"){
	  							if(!_.isEmpty(ad.pdfName)) {
	  								publishedData["fileName"]= ad.pdfName;
	  								processDataForPublish(publishedData);
	  							}
	  						} else if(publishedData.publishFor == "email"){
	  							processDataForPublish(publishedData);
	  						}/* else if(publishedData.publishFor == "preview"){
	  							processDataForPublish(publishedData);
	  						}*/
						}
					});
					//createLinkAnnotationDigestAndPublish(publishedData);
				});
				
			}
		}
		
		function hideAllPublishOptions() {
			ad.selectedPublishAsNote = false;
			ad.selectedPublishAsPdf = false;
			ad.selectedPublishAsLink = false;
			ad.showdocLink = false;
		}
		function confirmPublishAs(cb) {
			var modalInstance = $uibModal.open({
			      animation: true,
			      templateUrl: 'app/components/AnnotationDigest/create/ConfirmPublishDigest/ConfirmPublishDigest.tmpl.html',
			      controller: 'ConfirmPublishDigestController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'cpdc',
			      backdrop: 'static',
			      size : 'lg',
			      resolve: {
			    	  ConfirmData :function() {
			    		  return {"confirmFor" : "publish"};
			    	  }
			      }
			});
			modalInstance.result.then(function (results) {	
				if(!_.isEmpty(results.action) && results.action == "save") {
					updateDigestLink(null,function() {
						if(typeof cb == "function"){
							cb();
						}
					});
				}
				if(!_.isEmpty(results.action) && results.action == "ignore") {
					if(typeof cb == "function"){
						cb();
					}
				}
			});
		}
		
		function publishAsSelectedType(SelectedType) {
			hideAllPublishOptions();
			if(SelectedType == "numicinote") {
				ad.selectedPublishAsNote = true;
				ad.noteName = angular.copy(ad.digestName);
			} 
			if(SelectedType == "pdf") {
				ad.selectedPublishAsPdf = true;
				ad.pdfName = angular.copy(ad.digestName);
				if(ad.pdfName.endsWith(".pdf")) {
					ad.pdfName = ad.pdfName.replace(".pdf","")
				}
			}
			if(SelectedType == "email") {
				ad.selectedPublishAsLink = true;
				saveAsSelectedType(SelectedType);
			}
			if(SelectedType == "link") {
				checkAndCreateLink(function() {
					ad.selectedPublishAsLink = true;
				});
			}
		}
		
		function checkAndPublishAsSelectedType(SelectedType) {
			if(isSettingsChanged()) {
				confirmPublishAs(function(){
					publishAsSelectedType(SelectedType);
				});
			} else {
				publishAsSelectedType(SelectedType);
			}
		}
		
		var getHierarchy = function(id) {
			DocFactory.getDocHierarchy(id,function(docHierarchy) {
				ad.docHierarchy =  docHierarchy;
			});  
		};
		
		ad.BrowseFolders = function (size) {
			var modalInstance = $uibModal.open({
			      animation: $scope.animationsEnabled,
			      templateUrl: 'app/components/BrowseFileOrFolder/BrowseFileOrFolder.html',
			      controller: 'BrowseFileOrFolderController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'vm',
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
			}, function () {
			      
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
			if(showLinkUi()) {
				if(digestFor.digestFor == "DigestDocument" && (ad.linkInfo && ad.linkInfo.url)) {
					ad.showdocLink = true;
					ad.showSettings = true;
				} else if(digestFor.digestFor == "AnnotationDigest") {
					ad.showSettings = true;
				}
				ad.digestName = angular.copy(digestFor.digestName);
				ad.noteName = angular.copy(digestFor.digestName);
				ad.pdfName = angular.copy(digestFor.digestName);
				ad.emailSubject = angular.copy(digestFor.digestName);
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
			} else if(digestFor.digestFor == "settings") {
				ad.showSettings = true;
			}
			
			if(ad.digestFor != 'DigestDocument' && AnnotationDigestService.tsHasSections(TaskSpaceService.currentTaskspace)){
				var defaultSectionOption = {"id" : "", "name" : "< No Section >"};
				ad.tsSections = angular.copy(TaskSpaceService.currentTaskspace.sections);
				ad.tsSections =  orderByFilter(ad.tsSections, "name", false);
				ad.tsSections.unshift(defaultSectionOption);
			}
			
			if(!_.isEmpty(ad.linkInfo.url)) {
				configDigestDataFromDigestLink();
			} else {
				configDigestDataFromTaskspace();
			}
			
			if(!AnnotationDigestService.tsHasSections(TaskSpaceService.currentTaskspace)){
				ad.groupByOptionList = _.reject(ad.groupByOptionList, function(groupByOption){ 
	    			return groupByOption.value == "section"; 
	    		});
				if(originalConfig.groupBy == "section"){
					var text = "Removed \'Section \/ Document\' option from \'Group By\' field, as you do not have any Sections in the Taskspace.<br><br>Set the \'Group By\' field value to \'"+ad.groupByOptionList[0].label+"\', Please check and save the settings.";
					VDVCAlertService.open({text:text});
				}
				ad.groupByOption = ad.groupByOptionList[0];
				onGroupSelection(ad.groupByOption);
			}
			
			if(!_.isEmpty(config.sortOptions)) {
				_.each(config.sortOptions, function(val,key) {
					ad.selectedSortOption = _.findWhere(ad.sortOptionList,{value: key});
					ad.selectedSortOrder = val;
				});
			}
			
			if(!_.isEmpty(config.groupBy)) {
				var gpby = _.findWhere(ad.groupByOptionList,{value: config.groupBy})
				if(gpby) {
					ad.groupByOption = gpby;
					if(ad.groupByOption.value == "section") {
						ad.showIncludeDocsWithoutAnnField = true;
						ad.showIncludeDocsWithoutAnySectionField = true;
					} else if(ad.groupByOption.value == "document") {
						ad.showIncludeDocsWithoutAnnField = true;
						ad.showIncludeDocsWithoutAnySectionField = false;
					} else if(ad.groupByOption.value == "tag" || ad.groupByOption.value == "taghierarchical") {
						ad.showIncludeDocsWithoutAnnField = true;
						ad.showIncludeDocsWithoutAnySectionField = false;
					} else {
						ad.showIncludeDocsWithoutAnnField = false;
						ad.showIncludeDocsWithoutAnySectionField = false;
					}
				}
			}
			
			if(!_.isEmpty(config.tableOfContents)) {
				if(config.tableOfContents && config.tableOfContents == "notInclude") {
					ad.showTableOfContentsHeadingField = false;
				} else {
					ad.showTableOfContentsHeadingField = true;
				}
			}
			ad.includeDocsWithoutAnn = config.includeDocsWithoutAnn;
			ad.includeDocsWithoutSection = config.includeDocsWithoutSection;
			checkIncludeDocsWithoutSection();
			validateAnnotationSelection();
		}
		
		function init() {
			if($state.current.name == "digestsettings") {
				taskspaceInfo = {
						"tsId" : $stateParams.tsId,
						"tsClientId" : $stateParams.tsc
					};
				settings.taskspaceId = $stateParams.tsId; 
				settings.clientId = $stateParams.tsc;
				getTaskSpaceById($stateParams.tsc,$stateParams.tsId,function(){
					getSystemSttings(function(SystemSttingsResp) {
						systemSttings = SystemSttingsResp;
						tableOfContentsHeading = !_.isEmpty(systemSttings) && systemSttings.value ? systemSttings.value : angular.copy(AnnotationDigestService.getTableOfContentsHeading());
						getDigestFor(function(DigestForResp){
							digestFor = DigestForResp;
							ad.digestFor = digestFor.digestFor;
							getLinkInfo(function(LinkInfoResp){
								linkInfo = LinkInfoResp;
								ad.linkInfo = angular.copy(linkInfo);
								initProcess();
							});
						});
					});
				});
			} else {
				initProcess()
			}
		}
		
		init();
		
	}
	
})();
