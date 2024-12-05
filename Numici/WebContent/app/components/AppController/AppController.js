;(function(){
	
	angular.module("vdvcApp").controller("AppController",AppController);
	
	AppController.$inject = ['$scope','$rootScope','$window','DocFactory','_',
	                         'userService','$document','companyName','appData',
	                         '$state','AUTH_EVENTS','$timeout','TimeLogService',
	                         'AuthService','$location','LocalStorageService',
	                         '$confirm','$uibModalStack','Flash','AdministrationService',
	                         'localStorage','ShareOptionsService'];
	

	function AppController($scope,$rootScope,$window,DocFactory,_,userService,
			$document,companyName,appData,$state,AUTH_EVENTS,$timeout,
			TimeLogService,AuthService,$location,LocalStorageService,$confirm,
			$uibModalStack,Flash,AdministrationService,localStorage,ShareOptionsService) {
		$scope.currentUser;
		var reloadTimeout;
		var context = "";
		var appdata = appData.getAppData();
		var loggedInUser = localStorage.getItem(appData.storageKeyForApp());
		$scope.PageTitle = companyName;
		$scope.companyName = companyName;
		$rootScope.userinfo = appdata;
		$scope.getUserlabel = function(name) {
 			var lbl = "";
 			if(_.isString(name) && name.trim()) {
 				var matches = name.match(/\b(\w)/g);
 				lbl = matches.join('');
 			}
 			
 			return lbl.toUpperCase();
 		};
 		
 		$scope.setCurrentUser = function (user) {
 		    $scope.currentUser = user;
 		};
 		
 		$scope.$on("USERSTATE_SHAREOPTIONSSETTINGS_UPD",function(event, msg){
			ShareOptionsService.setShareOptionsSettingsInUiUserState(msg);
		});
 		
 		$scope.$on("LogOut", function(event, data) {
			logout(data);
		});
 		
 		$scope.$on('schedule-shutdown-flash', function (event,msg) {
 			if(_.isEmpty($rootScope.flashes)) {
 				Flash.create('warning', msg.scheduleShutdownMessage, msg.newLogoutDurationMillis+100,{
 	 				  class: 'schedule-shutdown-flash',id: 0});
 	 			var timer = $timeout(function() {
 	 				$rootScope.$broadcast('timer-start');
 	 	 			$timeout.cancel(timer);
 		        }, 100);
 				
 				timer = $timeout(function() {
 					$rootScope.$broadcast('timer-stop');
 		 			$timeout.cancel(timer);
 		        }, msg.newLogoutDurationMillis);
 			} else {
 				$scope.onMinimizeFlash($rootScope.flashes[0],true);
 			}
 		});

 		$scope.onScheduleFlashClose = function(flash) {
 			if(!AdministrationService.isUserRoleAllowed($rootScope.userinfo["UserRole"])) {
 				delete $rootScope.maintenanceSchedule;
 	 			logout();
 			}
 		};
 		
 		$scope.onMinimizeFlash = function(flash,donotToggle) {
 			var newLogoutDurationMillis = AdministrationService.getNewLogoutDurationMillis($rootScope.maintenanceSchedule);
 			var scheduleShutdownMessage = "";
 			if(newLogoutDurationMillis > 2000) {
				scheduleShutdownMessage = AdministrationService.getInitiatedShutdownNtfMsg($rootScope.maintenanceSchedule,newLogoutDurationMillis);
			}
 			if(!donotToggle) {
 				flash.isFlashMinimized = !flash.isFlashMinimized;
 			}
 			if(flash.isFlashMinimized) {
				flash.text = "<b><schedule-timer interval='1000' autostart='false' countdown="+(newLogoutDurationMillis/1000)+">{{hhours}}:{{mminutes}}:{{sseconds}}</schedule-timer></b>";
			} else {
				flash.text = scheduleShutdownMessage;
			}
			var timer = $timeout(function() {
 				$rootScope.$broadcast('timer-start');
 	 			$timeout.cancel(timer);
	        }, 0);
			timer = $timeout(function() {
					$rootScope.$broadcast('timer-stop');
		 			$timeout.cancel(timer);
		        }, msg.newLogoutDurationMillis);
 		};
 		
 		function logout(data) {
			 $rootScope.previousState = null;
         	 $rootScope.previousStateParams = null;
         	 TimeLogService.clearLog();
			 AuthService.logout().then(function (resp) {
				 if(resp.status == 200 ) {
					 redirectToLogin(data);
					 $rootScope.$broadcast("CLOSE_STREAMS");
				 }
			 });
		}
 		
 		var appDwatch = $rootScope.$watch("userinfo",function( newValue, oldValue ) {
 			var termsAccpeted = newValue['termsAccepted'];
 			var pwdChanged = newValue['pwdChanged'];
 			if(!_.isEmpty(newValue) && userService.redirectToAccount()) {
 				$state.go("acount",{},{reload:true});
 			}
        },true);
 		
		$scope.$on(AUTH_EVENTS.notAuthenticated, function(event,obj) {
			redirectToLoginWithError(obj);
		});
		
		$scope.$on(AUTH_EVENTS.sessionTimeout, redirectToLogin);
		$scope.$on('PageName', function(event,obj) { 
			
			if(obj.pageName == "root") {
				context = obj.userName +" Home";
			} else {
				context = obj.pageName;
			}
			if(!_.isEmpty(obj.companyName)){
				if(obj.companyName== "Curated using Numici") {
					$scope.PageTitle = context;
				} else {
					$scope.PageTitle = context +" - "+obj.companyName;
				}
			} else {
				$scope.PageTitle = context +" - "+companyName;
			}
			 
		});
		
		/*$rootScope.$on('$stateChangeStart', function (event,toState,toParams,fromState,fromParams) {
			if(toState.name == 'login') {
				return false;
			}
			
			if(toState.data && toState.data.needAdmin && !_.isEmpty(appdata) && !appdata.isSiteAdmin) {
				event.preventDefault();
				$state.go('authError');
			}
			
			if(toState.authRequired) {
				userService.getUserInfo().then(function(usrInfResp) {
	       			if(usrInfResp.status == 200 && usrInfResp.data.Status) {
	       				var result = usrInfResp.data;
	       				if(result.UserRole) {
	       					switch(result.UserRole) {
	       					case "OrgAdmin":
	       						result["isOrgAdmin"] = true;
	       						result["isAuthUser"] = true;
	       						break;
	       					case "VDVCSiteAdmin":
	       						result["isSiteAdmin"] = true;
	       						result["isAuthUser"] = true;
	       						break;
	       					case "User":
	       						result["isAuthUser"] = true;
	       						break;
	       					case "Guest":
	       						result["isAuthUser"] = true;
	       						result["isGuestUser"] = true;
	       						break;
	       					} 
	       					if(_.isEmpty(result)) {
	       						if(toState.name != 'login') {
	       							$state.go('login');
	       						}
	       					} else {
	       						if(toState.name == 'login') {
	       							//event.preventDefault();
	       						} else if((!result["termsAccepted"] || !result["pwdChanged"]) && toState.name != 'acount'){
	       							$state.go("acount",{},{reload:true});
	       						}
	       					}
	       					if(toState.data && toState.data.needAdmin && result && !result.isSiteAdmin) {
	       						$state.go('authError');
	       						return false;
	       					}
	       					if(toState.name != 'login') {
	       						$rootScope.previousState = toState.name;
	       		          	  	$rootScope.previousStateParams = toParams;
	       		          	}
	       				}
	       				
	       			}
	       		});
			}
		});*/
		
 		function redirectToLogin(data) {
 			delete $rootScope.currentUser;
         	appData.clearAppData();
 			appdata = {};
 			
 			localStorage.removeItem(appData.storageKeyForApp());
 			LocalStorageService.removeLocalStorage(LocalStorageService.WELCOME_PAGE);
 			LocalStorageService.removeLocalStorage(LocalStorageService.EXTENSION_PAGE);
 			LocalStorageService.removeLocalStorage(LocalStorageService.SHOW_TOUR_TIP_ON_LOGIN);
 			if(!_.isEmpty(data) && data.url) {
 				$window.open(data.url,'_self');
 			} else {
 				$state.go('login',{"errorCode":true});
 			}
 		}
 		
 		function redirectToLoginWithError(data) {
 			delete $rootScope.currentUser;
         	appData.clearAppData();
 			appdata = {};
 			
 			localStorage.removeItem(appData.storageKeyForApp());
 			LocalStorageService.removeLocalStorage(LocalStorageService.WELCOME_PAGE);
 			LocalStorageService.removeLocalStorage(LocalStorageService.EXTENSION_PAGE);
 			LocalStorageService.removeLocalStorage(LocalStorageService.SHOW_TOUR_TIP_ON_LOGIN);
 			if(!_.isEmpty(data)) {
 			    // TODO send error message based on the data
 				$state.go('login',{"loginError":  "Login to view the document" });
 			} else {
 				$state.go('login');
 			}
 		}
 		
 		
 		 function listenForLoginStorageEvents() {
 		    $window.addEventListener('storage', function (event) {
 		      if (event.key === appData.storageKeyForApp()) {
 		        $window.location.reload();
 		      }
 		      
 		      if (event.key === appData.storageKeyForExtension()) {
  		       
 		      }
 		    });
 		  }
 		
 		 
 		 function listenForWindowFocusEvents() {
 			angular.element($window).on( "focus", function(event) {
 				$timeout.cancel(reloadTimeout);
 				
 				reloadTimeout = $timeout(function() {
 					if(($state.current.authRequired || $state.current.name === "login" || $state.current.name === "signup")) {
 						userService.getLoginInfo().then(function(usrInfResp) {
 	 	 	    			if(usrInfResp.status == 200 && usrInfResp.data.Status) {
 	 	 	    				if(LocalStorageService.getLocalStorage(LocalStorageService.SCHEDULE_IN_MAINTENANCE_MODE)) {
 	 	 							$rootScope.$broadcast("schedule-in-maintenance");
 	 				        	}
 	 	 	    				if(usrInfResp.data.hasLogin) {
 	 	 	    					var result = usrInfResp.data;
 	 	 	 	    				//userService.storeAppdata(usrInfResp.data);
 	 	 	 	    				var appdata = appData.getAppData();
 	 	 	 	    				
 	 	 	 	    				/*if(VERSION !== result.version) {
 		 	 	 	 	    			$rootScope.reload = true;
 		 	 	 	 	    			$window.location.reload();
 		 	 	 	 	    		} */
 	 	 	 	    				
 	 	 	 	    				if(!_.isEmpty(appdata["UserId"]) && appdata["UserId"] !== result.UserId) {
 		 	 	 	 	    			$rootScope.userChanged = true;
 		 	 	 	 	    		} else {
 		 	 	 	 	    			$rootScope.userChanged = false;
 		 	 	 	 	    		}
 	 	 	 	    				
 	 	 	 	    				if($state.current.name === "login" || $state.current.name === "signup" || $rootScope.userChanged) {
 	 	 	 	    					userService.getUserInfo().then(function(usrInfResp) {
 		 	 	 	  	 	    			if(usrInfResp.status == 200 && usrInfResp.data.Status) {
 		 	 	 	  	 	    				if(usrInfResp.data.hasLogin) {
 		 	 	 	  	 	 	    				userService.storeAppdata(usrInfResp.data);
 		 	 	 	  	 	 	    				userService.goToHomePage();
 			 	  	 	 	    					$rootScope.$broadcast("ONLOGIN");
 		 	 	 	  	 	    				} 
 		 	 	 	  	 	    			} 
 		 	 	 	  	 				 });
 	 	 	 	    				}
 	 	 	    				} else {
 	 	 	 	    				if($state.current.name !== "login" && $state.current.name !== "signup") {
 	 	 	 	    					logout();
 	 	 	 	    				}
 	 	 	 	    			}
 	 	 	    			} 
 	 	 				 });
 	 	 			} 
 				},500);
 			});
 		}
 		 
 		function init() {
 			listenForWindowFocusEvents();
 			//listenForLoginStorageEvents();
 		}
 		 
 		init();
	}
})();