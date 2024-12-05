;(function() {
	
	angular.module("vdvcApp").controller("UserAccountController",UserAccountController);
	
	UserAccountController.$inject = ['$scope','$rootScope','$uibModal','appData','$state','_',
	                                 'LocalStorageService','userService','$deviceInfo',
	                                 'UserRegistrationService','$window','commonService'];
	
	function UserAccountController($scope,$rootScope,$uibModal,appData,$state,_,LocalStorageService,
			userService,$deviceInfo,UserRegistrationService,$window,commonService) {
		var ac = this;
		var appdata = appData.getAppData();
		var chromeStoreBaseUrlObj;
		var extensionNameObj;
		var extensionIdObj;
		
		function goToHome() {
			//$state.go('docs',{"folderId": appdata.rootFolderId});
			userService.goToHomePage();
		}
		
		function isDoNotShowHelpOnLogin() {
			var flag = false;
			try{
				flag = $rootScope.currentUser["doNotShowHelpOnLogin"];
			} catch(e) {
				flag = false;
			}
			return flag;
		}
		
		function isDoNotShowWelcomePageOnMobile() {
			var flag = false;
			try{
				flag = $rootScope.currentUser["doNotShowWelcomePageOnMobile"];
			} catch(e) {
				flag = false;
			}
			return flag;
		}
		
		function handleGetExtensionModalResponse(response) {
			if(response === "skipGetExtension") {
				
			} else if(response === "getExtension") {
				var extensionId = "oojabgademjndedjpcnagfgiglcpolgd";
				if(extensionIdObj) {
					extensionId = extensionIdObj.value;
				}
				var extensionUrl = "https://chrome.google.com/webstore/detail/numici-annotate-converse/"+extensionId;
				//$window.open(extensionUrl);
				$window.location.href=extensionUrl;
			}
		}
		
		var VerifyOTPSuccessModalInstance;
		function openGetExtensionModal(beforeGoToHomePage,getExtensionMessage,cb) {
			VerifyOTPSuccessModalInstance = UserRegistrationService.openVerifyOTPSuccessModal (true,beforeGoToHomePage,getExtensionMessage);
			VerifyOTPSuccessModalInstance.result.then(function (verifyOTPSuccessResponse) {
				handleGetExtensionModalResponse(verifyOTPSuccessResponse);
				if(typeof cb == "function") {
					cb();
				}
			},function() {
		    	
		    });
		}
		
		function openGetExtensionModalBeforeGoToHome(cb) {
			var getExtensionMessage = "";
			if(!_.isEmpty(appdata.ExtensionMsg)) {
				getExtensionMessage = appdata.ExtensionMsg;
			}
			openGetExtensionModal(true,getExtensionMessage,function(){
				if(typeof cb == "function") {
					cb();
				}
			});
		}
		
		function beforeGoToHome() {
			commonService.checkIsExtensionInstalled(extensionIdObj.value,function(status){
				if(!status) {
					openGetExtensionModalBeforeGoToHome(function() {
						userService.redirectPreviousState();
					});
				} else {
					userService.redirectPreviousState();
				}
			});
		}
		
		function goToWelcomePage() {
			var welcomePageSession = LocalStorageService.getLocalStorage(LocalStorageService.WELCOME_PAGE);
			if(!_.isEmpty(welcomePageSession)) {
				welcomePageSession = JSON.parse(welcomePageSession);
			}
			if(!$deviceInfo.isMobile && !isDoNotShowHelpOnLogin() && !_.isEmpty(welcomePageSession) && welcomePageSession.user == appdata["UserId"] && !welcomePageSession.close) {
				$state.go("welcome",{},{reload:true});
			} else if($deviceInfo.isMobile && !isDoNotShowWelcomePageOnMobile() && !_.isEmpty(welcomePageSession) && welcomePageSession.user == appdata["UserId"] && !welcomePageSession.close) {
				$state.go("welcome",{},{reload:true});
			} else if(!$deviceInfo.isMobile && !userService.isDoNotShowGetExtensionPage()){
				commonService.getNumiciExtensionInfo(function(numiciExtension){
					extensionIdObj = numiciExtension.extensionIdObj;
					if(numiciExtension.isDeviceSupport && !numiciExtension.isExtensionInstalled) {
						var getExtensionMessage = "<p class='get-extension-message-info-header' style='text-align: center;'>One last step. We strongly recommend that you do it now...</p>\
							<p class='get-extension-message-info-content'>To get the best experience of highlighting, annotating web pages,\
									you will need to download the Numici extension from the Chrome Web Store.</p>";
						openGetExtensionModal(false,getExtensionMessage,function() {
							beforeGoToHome();
						});
					} else {
						userService.redirectPreviousState();
					}
				});
			} else {
				userService.redirectPreviousState();
			}
		}
		
		function goToLogin() {
			$rootScope.$broadcast("LogOut",true);
		}
		
		function changePassword() {
			 var modalInstance = $uibModal.open({
			      animation: $scope.animationsEnabled,
			      templateUrl: 'app/components/authentication/ChangePassword/changePasswordModal.html',
			      controller: 'ChangePasswordController',
			      controllerAs: 'vm',
			      appendTo : $('#termsContainer'),
			      backdrop: 'static'
			    });
			
			modalInstance.result.then(function (status) {
				if(status) {
					goToLogin();
				}
			}, function () {
				goToLogin();
			});
		}
		
		function licenceAggriment() {
			 var modalInstance = $uibModal.open({
			      animation: $scope.animationsEnabled,
			      templateUrl: 'app/components/authentication/Licence/LicenceModal.html',
			      controller: 'LicenceController',
			      controllerAs: 'la',
			      appendTo : $('#termsContainer'),
			      backdrop: 'static',
			      size: "lg",
			      windowClass: 'lic-modal'
			    });
			
			modalInstance.result.then(function (status) {
				if(status && !appdata["pwdChanged"]){
					changePassword();
				} else if(status && appdata["pwdChanged"]) {
					goToWelcomePage();
				}
			});
		}
		
		function init() {
			if(!_.isEmpty(appdata)) {
				if(!appdata["termsAccepted"]) {
					licenceAggriment();
				} else if(!appdata["pwdChanged"]){
					changePassword();
				} else {
					goToWelcomePage();
				}
			}
		}
		
		init();
	}
	
})();