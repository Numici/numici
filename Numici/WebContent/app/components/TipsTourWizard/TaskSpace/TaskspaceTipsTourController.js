;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('TaskspaceTipsTourController',TaskspaceTipsTourController);
	
	TaskspaceTipsTourController.$inject = ['$state','$scope','$rootScope','appData','_','TaskSpaceService',
	                                       '$timeout','$window','userService','LocalStorageService',
	                                       'VDVCAlertService'];

	function TaskspaceTipsTourController($state,$scope,$rootScope,appData,_,TaskSpaceService,$timeout,
			$window,userService,LocalStorageService,VDVCAlertService) {
		
		var appdata = appData.getAppData();
		var tttc = this;
		
		var closeMessage = 'You can bring up the tips anytime by clicking on the "bulb" icon in the navigation bar.';
		
		tttc.tipTourList = [{
				"key" : "CreateTaskspace",
				"arrow_placement" : "right",
				"element_id" : "new-taskspace",
				"value" : "1. Create a new Taskspace (collaborative workspace)."
			},
			{
				"key" : "ListOfTaskspaces",
				"arrow_placement" : "right",
				"element_id" : "taskspace-pane",
				"value" : "2. List of Taskspaces created by you OR you have been invited to collaborate in."
			},
			{
				"key" : "ListOfDocuments",
				"arrow_placement" : "right",
				"element_id" : "taskspace-document-pane",
				"value" : "3. Web pages and PDF documents in the selected Taskspace."
			},
			{
				"key" : "ViewDigest",
				"arrow_placement" : "right",
				"element_id" : "ts-digest-card-wrap",
				"value" : "4. Clicking 'View Digest' displays a digest of highlights, notes and conversations in the Taskspace in the third pane."
			},
			{
				"key" : "ConfigureUserDigest",
				"arrow_placement" : "bottom",
				"element_id" : "digets-configuration-settings",
				"value" : "5. Click on gear icon to configure the digest as seen in the Taskspace."
			},
			{
				"key" : "PublishDigest",
				"arrow_placement" : "bottom",
				"element_id" : "publish-digest",
				"value" : "6. Click on 'Publish' to configure the digest and share it."
			},
			{
				"key" : "ViewHelp",
				"arrow_placement" : "bottom",
				"element_id" : "vdvc-help-btn",
				"value" : "7. Click on ? icon to view Help."
			}
		];
		tttc.tipTour = {};
		tttc.ttPrevLabel = "Prev";
		tttc.ttNextLabel = "Next";
		tttc.ttDoneLabel = "Done";
		
		tttc.showPrevBtn = showPrevBtn;
		tttc.showNextBtn = showNextBtn;
		tttc.previousTourTip = previousTourTip;
		tttc.nextTourTip = nextTourTip;
		tttc.closeTour = closeTour;
		
		$scope.$on('windowResized', function(msg){
			$timeout(function() {
				setTourTipPosition();
			}, 2000);
		});
		
		var changeArrowPosotion = false;
		function moveTipArrowPosotion(context,element,tipPosition) {
			var arrowPosition;
			var tourTipEle = $(".tour-tip")
			var tourTipArrowEle = $(".tour-tip .tour-arrow");
			if(context == "top"){
				arrowPosition = (tourTipEle.outerHeight()/2) - (tourTipArrowEle.outerHeight()/2);
				$(".tour-tip .tour-arrow").css({"top" : arrowPosition+"px"});
			}
			if(context == "left"){
				arrowPosition = ((element.offset().left-tipPosition)+(element.outerWidth()/2)) - (tourTipArrowEle.outerWidth()/2);
				$(".tour-tip .tour-arrow").css({"left" : arrowPosition+"px"});
			}
		}
		
		function validateTourTipPosition(leftPosition) {
			var windowWidth = $window.innerWidth;
			var tourTipEle = $(".tour-tip");
			if(windowWidth > tourTipEle.outerWidth()) {
				if(leftPosition < 30) {
					leftPosition = 30;
					changeArrowPosotion = true;
				} else if((leftPosition+tourTipEle.outerWidth()) > windowWidth) {
					leftPosition = windowWidth - (tourTipEle.outerWidth());
					changeArrowPosotion = true;
				}
			}
			return leftPosition;
		}
		
		function setTourTipPosition() {
			$(".tour-tip .tour-arrow").css({left : "", top : ""});
			$(".tour-element-selection").css({width : 0, height : 0,top : "",left : ""});
			var element = $("#"+tttc.tipTour.element_id);
			if(element && element.length > 0) {
				var elementOffset = element.offset();
				var tourTipEle = $(".tour-tip");
				var tourTipArrowEle = $(".tour-tip .tour-arrow");
				var topPosition = elementOffset.top;
				var leftPosition = elementOffset.left;
				$(".tour-element-selection").css({width : (element.outerWidth()+4)+"px", height : (element.outerHeight()+4)+"px", top : (elementOffset.top-2)+"px", left : (elementOffset.left-2)+"px"});
				if(tttc.tipTour.arrow_placement == "top" || tttc.tipTour.arrow_placement == "bottom") {
					if(tttc.tipTour.arrow_placement == "top") {
						topPosition = topPosition - (tourTipEle.outerHeight()+(tourTipArrowEle.outerHeight()/2));
					} else if(tttc.tipTour.arrow_placement == "bottom") {
						topPosition = topPosition+element.outerHeight()+(tourTipArrowEle.outerHeight()/2);
					}
					topPosition = topPosition+2;
					$timeout(function() {
						leftPosition = validateTourTipPosition(leftPosition);
						moveTipArrowPosotion("left",element,leftPosition);
						$(".tour-tip").css({ top: topPosition+'px', left: leftPosition+'px'});
					}, 10);
				} else if(tttc.tipTour.arrow_placement == "left" || tttc.tipTour.arrow_placement == "right" ) {
					if(tttc.tipTour.key == "ListOfTaskspaces") {
						topPosition = topPosition+($("#ts-filters-wrap").outerHeight());
						topPosition = topPosition+($(".ts-li.active").outerHeight()/2)+5;
					} else if(tttc.tipTour.key == "ListOfDocuments") {
						topPosition = topPosition+($("#ts-doc-filters-wrap").outerHeight()+$("#ts-digest-card-wrap").outerHeight());
						topPosition = topPosition+($(".ts-card-wrap").outerHeight()/2)+10;
					} else {
						topPosition = topPosition+(element.outerHeight()/2);
					}
					$timeout(function() {
						topPosition = topPosition-(tourTipEle.outerHeight()/2);
						if(tttc.tipTour.arrow_placement == "left") {
							leftPosition = leftPosition+(tourTipEle.outerWidth()/2);
						} else if(tttc.tipTour.arrow_placement == "right") {
							leftPosition = leftPosition+element.outerWidth()+(tourTipArrowEle.outerWidth()/2);
						}
						leftPosition = leftPosition+2;
						moveTipArrowPosotion("top",element,topPosition);
						$(".tour-tip").css({ top: topPosition+'px', left: leftPosition+'px'});
					}, 10);
				}
			}
		}
		
		function showPrevBtn() {
			var currentTipIndex = _.findIndex(tttc.tipTourList,{"key" : tttc.tipTour.key});
			if(currentTipIndex > 0) {
				return true
			}
			return false;
		}
		
		function showNextBtn() {
			var currentTipIndex = _.findIndex(tttc.tipTourList,{"key" : tttc.tipTour.key});
			if((currentTipIndex+1) < tttc.tipTourList.length) {
				return true
			}
			return false;
		}
		
		function previousTourTip() {
			var currentTipIndex = _.findIndex(tttc.tipTourList,{"key" : tttc.tipTour.key});
			if(currentTipIndex > 0) {
				tttc.tipTour = angular.copy(tttc.tipTourList[currentTipIndex-1]);
			}
			setTourTipPosition();
		}
		
		function nextTourTip() {
			var currentTipIndex = _.findIndex(tttc.tipTourList,{"key" : tttc.tipTour.key});
			if((currentTipIndex+1) < tttc.tipTourList.length) {
				tttc.tipTour = angular.copy(tttc.tipTourList[currentTipIndex+1]);
			}
			setTourTipPosition();
		}
		
		function closeTour() {
			if($scope.showTourTipOnlogin) {
				var confirm = VDVCAlertService.open({ text: closeMessage });
				confirm.result.then(function() {
					var postdata = {"doNotShowTipsOnLogin" : true};
					userService.setDoNotShowTipsOnLogin(postdata).then(function(resp) {
						if(resp.status == 200 && resp.data.Status) {
							LocalStorageService.removeLocalStorage(LocalStorageService.SHOW_TOUR_TIP_ON_LOGIN);
							$("taskspace-tip-tour").remove();
							$rootScope.$broadcast('TipsWizardStopped');
						}
					});
				}, function() {
					LocalStorageService.removeLocalStorage(LocalStorageService.SHOW_TOUR_TIP_ON_LOGIN);
					$("taskspace-tip-tour").remove();
					$rootScope.$broadcast('TipsWizardStopped');
				});
			} else {
				$("taskspace-tip-tour").remove();
				$rootScope.$broadcast('TipsWizardStopped');
			}
		}
		
		function init() {
			if(appdata && !_.isEmpty(appdata.TaskspaceTipsWizard)){
				_.each(appdata.TaskspaceTipsWizard,function(taskspaceTipWizard) {
					var matchedTipObjIndex = _.findIndex(tttc.tipTourList,{"key" : taskspaceTipWizard.key});
					if(matchedTipObjIndex != -1) {
						tttc.tipTourList[matchedTipObjIndex].value = taskspaceTipWizard.value;
					}
				});
			}
			if(appdata && !_.isEmpty(appdata.GlobalSettings)){
				var closeMessageObj = _.findWhere(appdata.GlobalSettings,{"key" : "CloseTipsWizardMsg"});
				if(!_.isEmpty(closeMessageObj)) {
					closeMessage = closeMessageObj.value;
				}
			}
			tttc.tipTour = angular.copy(tttc.tipTourList[0]);
			setTourTipPosition();
			var t1 = $timeout(function() {
				$(".tour-tip").show();
				$timeout.cancel(t1);
			}, 0);
		}
		
		init();
	}
})();