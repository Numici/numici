;(function(){
	angular.module("vdvcApp").factory('AuthService',AuthService);
	
	AuthService.$inject = ["$state","$rootScope","httpService","SessionService",
	                       "GoogleService","userService","appData","LocalStorageService","$q",
	                       "sessionStorage","commonService"];
	
	function AuthService($state,$rootScope,httpService,SessionService,GoogleService,
			userService,appData,LocalStorageService,$q,sessionStorage,commonService) {
		 var authService = {
				 login : login,
				 logout : logout,
				 isAuthenticated: isAuthenticated,
				 getUserInfo : getUserInfo,
				 startApp : startApp
		 };
		 
		 return authService;
		 
		 
		function login(credentials) {
			return httpService.httpPost('user/login', credentials,{ ignoreLoadingBar: true});
		}
		
		function logout(credentials) {
			return httpService.httpGet('user/logout',{ ignoreLoadingBar: true});
		}
		 
		function isAuthenticated() {
			return SessionService.userId  ? true : false;
		}
		
		function getUserInfo(inMaintenanceMode) {
			userService.getUserInfo().then(function(usrInfResp) {
				 if(usrInfResp.status == 200 && usrInfResp.data.Status) {
					 if(usrInfResp.data.hasLogin) {
						 userService.storeAppdata(usrInfResp.data);
						 var appdata = appData.getAppData();
						 sessionStorage.setItem("appdata",JSON.stringify(appdata));
						 if(inMaintenanceMode && (appdata["UserRole"] == "VDVCSiteAdmin" || appdata["UserRole"] == "VDVCAdmin")) {
							 $state.go("administration",{"selectedMenuItem" : "maintenanceSchedule"});
						 } else {
							 userService.redirectPreviousState();
						 }
						 userService.getUsedSpace(); 
						 $rootScope.$broadcast("ONLOGIN");
					 }
				 }
			 });
		}
		
		function decodeJwtCredential(credential) {
			try {
				var base64Url = credential.split('.')[1];
			    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
			    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
			        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
			    }).join(''));
			    return JSON.parse(jsonPayload);
			} catch (e) {
			    return {};
			}
		}
		
		function signInWithGoogle(googleUserResp) {
			var profile = decodeJwtCredential(googleUserResp.credential);
			var id = profile.sub;
			var firstName = profile.given_name;
			var lastName = profile.family_name;
			var name = profile.name;
			var email = profile.email;
			var imageUrl = profile.picture;
			var email_verified = profile.email_verified;
			var postdata = {
					"email": email,
					"name":name,
					"provision":true,
					"signInFrom": "Application"
			};
			if(firstName) {
				postdata.firstName = firstName;
			}
			if(lastName) {
				postdata.lastName = lastName;
			}
			GoogleService.signInWithGoogle(postdata).then(function(response) {
				if(response.status == 200 && response.data.Status) {
					var stateInfo = LocalStorageService.getSessionStorage(LocalStorageService.STATE_INFO);
					if(!_.isEmpty(stateInfo)) {
						LocalStorageService.removeSessionStorage(LocalStorageService.STATE_INFO);
						stateInfo = JSON.parse(stateInfo);
						$state.go(stateInfo.previousState,stateInfo.previousStateParams);
					} else {
						getUserInfo();
					}
					
				}
			});
		}
		
		function startApp() {
			let deferred = $q.defer();
			GoogleService.getGoogleClientId().then(function(response) {
				if(response.status == 200 && response.data.Status) {
					var googleClientId = response.data.Data;
					if(googleClientId) {
						google.accounts.id.initialize({
							client_id: googleClientId, 
							scope: 'profile email',
							callback: signInWithGoogle
						});
						var buttonProperties = {};
						google.accounts.id.renderButton(document.getElementById("customGoogleSignIn"),buttonProperties);
						google.accounts.id.prompt();
						deferred.resolve({"status": true });
					} else {
						console.log("Client Id Not Exists");
						deferred.resolve({"status": false, "error": "Unable to initialize sign in with google , Client Id Not Exists" });
					}
				}
			}).catch(function(e) {
				deferred.resolve({"status": false, "error": "Unable to initialize sign in with google" });
			});
			return deferred.promise;
		}
		
	}
})();