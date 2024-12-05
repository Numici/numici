;(function() {
	
	angular.module("vdvcApp").controller('LoginController',LoginController);
	LoginController.$inject = ['$rootScope','$scope','$state','$stateParams',
	     '$uibModal','$location','companyName','AuthService','userService',
	     'GoogleService','appData','_','$q','LocalStorageService',
	     'AdministrationService','TimeLogService','$interval','$deviceInfo'];
		
	function LoginController($rootScope,$scope,$state,$stateParams,$uibModal,
			$location,companyName,AuthService,userService,GoogleService,
			appData,_,$q,LocalStorageService,AdministrationService,
			TimeLogService,$interval,$deviceInfo) {
		
		var appdata = appData.getAppData();
		$scope.host = $location.host();
		$scope.$emit("PageName",{"userName":appdata.UserName,"pageName":$state.current.pageName});
		$scope.loginError = $stateParams.loginError;
		$scope.showLoginError = !_.isEmpty($stateParams.loginError) ? true : false;
		$scope.googleInitError = false;
		$scope.googleIniterrMsg = "";
		$scope.showOriginalUriMsg = !_.isEmpty($stateParams.loginError) ? true : false;
		$scope.Company = companyName;
		$scope.form = {};
		$scope.tagline = {
				"tag1" : "Analyze Numbers,",
				"tag2" : "Communicate Insights"
		};
		$scope.credentials = {
				    username: '',
				    password: ''
		};
		$scope.signInUrl = "";
		$scope.googleSignInUrl = "";
		$scope.mobileLoginErrorMessage = "";
		$scope.login = login;
		$scope.hideTextBoxIcon = hideTextBoxIcon;
		$scope.hideUserIdTextBoxIcon = hideUserIdTextBoxIcon;
		$scope.hidePwdTextBoxIcon = hidePwdTextBoxIcon;
		$scope.openRegisterModal = openRegisterModal;
		$scope.openFPModal = openFPModal;
		
		$scope.$on("schedule-in-maintenance", function(event, data) {
			getActiveSchedule();
		});
		
		function hideUserIdTextBoxIcon() {
			var username = $("#username").val();
        	if(username.length>0) {
        		$("#username").css("background-image","url()");
        	} else {
        		$("#username").css("background-image","url(app/assets/icons/user.png)");
        	}
		}
		
		function hidePwdTextBoxIcon() {
			var password = $("#password").val();
        	if(password.length>0) {
        		$("#password").css("background-image","url()");
        	} else {
        		$("#password").css("background-image","url(app/assets/icons/lock.png)");
        	}
		}
		
		function hideTextBoxIcon(event) {
			if(event && event.which !== 13) {
                if(event.target.id === "username") {
                	hideUserIdTextBoxIcon();
                }
                else if(event.target.id === "password") {
                	hidePwdTextBoxIcon();
                }
            }
		}
		
		function logout() {
			return AuthService.logout();
		}
		
		function hasGuestUserLogin() {
			var deferred = $q.defer();
			var status = false;
			userService.getLoginInfo().then(function(usrInfResp) {
    			if(usrInfResp.status == 200 && usrInfResp.data.Status) {
    				status = (usrInfResp.data.hasLogin && usrInfResp.data.UserRole == "TSGuest");
    			}
    	    }).finally(function() {
    	    	deferred.resolve(status);
    	    });
			
			return deferred.promise;
		}
		
		function userLogin() {
			AuthService.login($scope.credentials).then(function (resp) {
				 if(resp.status == 200 && resp.data.Status) {
					 var result = resp.data;
					 if(result.inMaintenanceMode){
							 if(AdministrationService.isUserRoleAllowed(result.UserRole)) {
								if(LocalStorageService.getLocalStorage(LocalStorageService.INSTALL_SLACK_AUTH)) {
									 LocalStorageService.removeLocalStorage(LocalStorageService.INSTALL_SLACK_AUTH)
									 $state.go("slacksignincb");
								 } else {
									 AuthService.getUserInfo(result.inMaintenanceMode);
								 }
							 } else {
								 if(!_.isEmpty(result.ActiveSchedule) && !_.isEmpty(result.ActiveSchedule.Schedule)) {
									 var maintenanceSchedule = result.ActiveSchedule.Schedule;
									 var maintenanceScheduleMsg = AdministrationService.getShutdownNtfMsg(maintenanceSchedule);
									 TimeLogService.clearLog();
									 $rootScope.previousState = null;
									 $rootScope.previousStateParams = null;
									 var logOut = logout();
									 logOut.finally(function() {
										 $rootScope.$broadcast("CLOSE_STREAMS");
										 $state.go("maintenancemode",{"message" : maintenanceScheduleMsg})
									 }); 
								 }
							 }
						} else {
							if(LocalStorageService.getLocalStorage(LocalStorageService.INSTALL_SLACK_AUTH)) {
								 LocalStorageService.removeLocalStorage(LocalStorageService.INSTALL_SLACK_AUTH)
								 $state.go("slacksignincb");
							 } else {
								 AuthService.getUserInfo();
							 }
						}
				 } else {
					 $scope.loginError = resp.data.Message ;
					 $scope.showLoginError = true;
				 }
			 });
		}
		
		function login() {
			hasGuestUserLogin().then(function(status) {
				if(status) {
					$rootScope.previousState = null;
		        	$rootScope.previousStateParams = null;
					var logOut = logout();
					logOut.finally(function() {
						userLogin();
					});
				} else {
					userLogin();
				}
			});
		}
		
		function openRegisterModal (size) {
			var modalInstance = $uibModal.open({
			      animation: $scope.animationsEnabled,
			      templateUrl: 'app/components/RegisterProvisionalUser/Registration/RegisterProUserModal.html',
			      controller: 'RegisterProUserModalController',
			      controllerAs: 'rpmc',
			      backdrop: 'static',
			      size: size,
			      resolve : {
				    	provisionalUser : {},
				  }
			    });
			
			modalInstance.result.then(function (Status) {
				
			});
			/*var modalInstance = $uibModal.open({
				animation: $scope.animationsEnabled,  
				templateUrl: 'app/components/RegisterProvisionalUser/Registration/RegisterProUserModal.html',
			    controller: 'RegisterProUserModalController',
			    controllerAs : 'rpmc',
			    backdrop: "static",
			    size: "md",
			    resolve : {
			    	provisionalUser : {},
			    }
			});
			modalInstance.result.then(function (status) {
				
			});*/
		}
		
		function openFPModal(size) {
			var modalInstance = $uibModal.open({
		      animation: $scope.animationsEnabled,
		      templateUrl: 'app/components/authentication/ForgotPassword/ForgotPasswordModal.html',
		      controller: 'ForgotPasswordController',
		      controllerAs: 'fp',
		      windowClass : "forgotPwdModal",
		      backdrop: 'static',
		      size: size
		    });
			modalInstance.result.then(function (obj) {
				
			});
		}
		
		var scheduleMaintenanceInterval;
		$scope.maintenanceScheduleMsg = "";
		$scope.showMaintenanceScheduleMsg = false;
		function getActiveSchedule() {
			AdministrationService.getActiveSchedule().then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					var maintenanceSchedule = resp.data.Schedule;
					if(!_.isEmpty(maintenanceSchedule)) {
						if(maintenanceSchedule.notificationPeriod) {
							if(maintenanceSchedule.status == "Planned") {
								$scope.maintenanceScheduleMsg = AdministrationService.getMaintenanceNtfMsg(maintenanceSchedule);
								$scope.showMaintenanceScheduleMsg = true;
							} else if(maintenanceSchedule.status == "Started") {
								$scope.maintenanceScheduleMsg = AdministrationService.getShutdownNtfMsg(maintenanceSchedule);
								$scope.showMaintenanceScheduleMsg = true;
							}
						} else if(maintenanceSchedule.status == "Started") {
							$scope.maintenanceScheduleMsg = AdministrationService.getShutdownNtfMsg(maintenanceSchedule);
							$scope.showMaintenanceScheduleMsg = true;
						}
						if(!LocalStorageService.getLocalStorage(LocalStorageService.SCHEDULE_IN_MAINTENANCE_MODE)) {
							LocalStorageService.setLocalStorage(LocalStorageService.SCHEDULE_IN_MAINTENANCE_MODE,true);
							$scope.startScheduleMaintenanceInterval();
			        	}
					} else {
						if(LocalStorageService.getLocalStorage(LocalStorageService.SCHEDULE_IN_MAINTENANCE_MODE)) {
							LocalStorageService.removeLocalStorage(LocalStorageService.SCHEDULE_IN_MAINTENANCE_MODE);
							$scope.stopScheduleMaintenanceInterval();
			        	}
						$scope.maintenanceScheduleMsg = "";
						$scope.showMaintenanceScheduleMsg = false;
					}
				} else {
					if(LocalStorageService.getLocalStorage(LocalStorageService.SCHEDULE_IN_MAINTENANCE_MODE)) {
						LocalStorageService.removeLocalStorage(LocalStorageService.SCHEDULE_IN_MAINTENANCE_MODE);
						$scope.stopScheduleMaintenanceInterval();
		        	}
					$scope.maintenanceScheduleMsg = "";
					$scope.showMaintenanceScheduleMsg = false;
				}
			});
		}
		
		var scheduleMaintenanceIntervalDuration = 1*60*1000;
		$scope.startScheduleMaintenanceInterval = function() {
          // Don't start a new fight if we are already fighting
          if ( angular.isDefined(scheduleMaintenanceInterval) ) return;
          scheduleMaintenanceInterval = $interval(function() {
        	  if(LocalStorageService.getLocalStorage(LocalStorageService.SCHEDULE_IN_MAINTENANCE_MODE)) {
        		  getActiveSchedule();
        	  }
          }, scheduleMaintenanceIntervalDuration);
        };

        $scope.stopScheduleMaintenanceInterval = function() {
          if (angular.isDefined(scheduleMaintenanceInterval)) {
            $interval.cancel(scheduleMaintenanceInterval);
            scheduleMaintenanceInterval = undefined;
          }
        };

        $scope.$on('$destroy', function() {
          // Make sure that the interval is destroyed too
          $scope.stopScheduleMaintenanceInterval();
        });
        
		function init() {
			if(!$deviceInfo.isMobile) {
				userService.getSlackSignInUrl().then(function(resp) {
					if(resp.data.Status) {
						$scope.signInUrl = resp.data.Data;
					}
				});
				userService.getGoogleSignInUrl().then(function(resp) {
					if(resp.data.Status) {
						$scope.googleSignInUrl = resp.data.Data;
					}
				});
				getActiveSchedule();
			} else {
				$scope.mobileLoginErrorMessage = "Numici Application is not supported on Mobile devices<br><br>Please access Numici Application from Desktop / Laptop / Tablet";
			}
		}
		 
		init();
	}
		
})();

