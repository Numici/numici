;(function() {
	'use strict';
	angular.module("vdvcApp").controller("WelcomePageController",WelcomePageController);
	
	WelcomePageController.$inject = ['$scope','$rootScope','$uibModal','appData','$state',
	                                 '_','userService','$deviceInfo'];
	
	function WelcomePageController($scope,$rootScope,$uibModal,appData,$state,_,userService,
			$deviceInfo) {
		var wp = this;
		var appdata = appData.getAppData();
		$scope.$emit("PageName",{"userName":appdata.UserName,"pageName":$state.current.pageName});
		
		function goToHome() {
			//$state.go('docs',{"folderId": appdata.rootFolderId},{reload:true});
			userService.goToHomePage();
		}
		
		function goToLogin() {
			$rootScope.$broadcast("LogOut",true);
		}
		
		function getMatchedHelpTopicsList (key) {
			var helpTopicsList = {welcomeHelpTopic:{},otherHelpTopics:[]};
			if(appdata.HelpInfo && appdata.HelpInfo.Help && appdata.HelpInfo.Help.topics) {
				var helpTopics = appdata.HelpInfo.Help.topics
				var HelpInfoMap = appdata.HelpInfoMap;
				var welcomeHelpInfoValue;
				var welcomeHelpTopic;
				var welcomeHelpInfoMap = _.findWhere(HelpInfoMap,{"key":key});
				if(welcomeHelpInfoMap) {
					welcomeHelpInfoValue = welcomeHelpInfoMap.value;
	    		} else {
	    			welcomeHelpInfoValue = "Overview";
	    		}
				if(!_.isEmpty(welcomeHelpInfoValue)) {
					welcomeHelpTopic = _.findWhere(helpTopics,{"title":welcomeHelpInfoValue.trim()});
				}
				for(var i = 0; i < helpTopics.length; i++) {
					var helpTopic = helpTopics[i];
					if(welcomeHelpTopic && helpTopic && welcomeHelpTopic == helpTopic) {
						helpTopicsList.welcomeHelpTopic = helpTopic
					} else if(helpTopic) {
						helpTopicsList.otherHelpTopics.push(helpTopic);
					}
				}
			}
			return helpTopicsList;
		}
		
		function openWelcomeHelpModal(welcomeHelpTopic) {
			var modalInstance = $uibModal.open({
			      animation: $scope.animationsEnabled,
			      templateUrl: 'app/components/Welcome/WelcomeHelp/WelcomeHelpModal.html',
			      controller: 'WelcomeHelpController',
			      controllerAs: 'vm',
			      appendTo : $('#welcomeContainer'),
			      backdrop: 'static',
			      size: "lg",
			      windowClass: 'welcome-help-modal',
			      backdropClass: "welcome-help-modal-backdrop",
			      resolve: {
				      topic : welcomeHelpTopic
			      }
			});
			modalInstance.result.then(function (status) {
				//goToHome();
				userService.redirectPreviousState();
			});
		}
		
		function openWelcomeMobileModal(mobileWelcomeTopic) {
			var modalInstance = $uibModal.open({
			      animation: $scope.animationsEnabled,
			      templateUrl: 'app/components/Welcome/Mobile/WelcomeMobileModal.html',
			      controller: 'WelcomeMobileController',
			      controllerAs: 'wmc',
			      appendTo : $('#welcomeContainer'),
			      backdrop: 'static',
			      size: "lg",
			      windowClass: 'welcome-mobile-modal',
			      backdropClass: "welcome-mobile-modal-backdrop",
			      resolve: {
				      topic : mobileWelcomeTopic
			      }
			});
			modalInstance.result.then(function (status) {
				//goToHome();
				userService.redirectPreviousState();
			});
		}
		
		function init() {
			if(!_.isEmpty(appdata)) {
				if(!$deviceInfo.isMobile && !appdata["doNotShowHelpOnLogin"]) {
					var helpTopicsList = getMatchedHelpTopicsList ("welcome");
					if(!_.isEmpty(helpTopicsList)) {
						openWelcomeHelpModal(helpTopicsList.welcomeHelpTopic);
					} 
					/*if(!_.isEmpty(helpTopicsList) && !_.isEmpty(helpTopicsList.welcomeHelpTopic) && helpTopicsList.welcomeHelpTopic.context && !_.isEmpty(helpTopicsList.welcomeHelpTopic.topics)) {
						openWelcomeHelpModal(helpTopicsList.welcomeHelpTopic);
					} else {
						goToHome();
					}*/
				} else if($deviceInfo.isMobile && !appdata["doNotShowWelcomePageOnMobile"]) {
					var helpTopicsList = getMatchedHelpTopicsList ("mobile");
					if(!_.isEmpty(helpTopicsList)) {
						openWelcomeMobileModal(helpTopicsList.welcomeHelpTopic);
					}
				} else {
					//goToHome();
					userService.redirectPreviousState();
				}
			}
		}
		
		init();
	}
	
})();