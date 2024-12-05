;(function() {
	
	angular.module("vdvcApp").controller('SlackSignInCBController',SlackSignInCBController);
	
	SlackSignInCBController.$inject = ['$scope','$state','$stateParams','$timeout','userInfo',
	                                   'slackAuthData','userService','SlackService','_',
	                                   '$window','$uibModal','VDVCAlertService',
	                                   'LocalStorageService','AuthService'];
		
	function SlackSignInCBController($scope,$state,$stateParams,$timeout,userInfo,slackAuthData,
			userService,SlackService,_,$window,$uibModal,VDVCAlertService,
			LocalStorageService,AuthService) {
		
		var redirectToTarget = redirectToTarget;
		var webClient = $stateParams.ui;
		function clearAuthData(cb) {
			SlackService.clearAuthData({}).then(function(clearAuthDataResp) {
        		if(clearAuthDataResp.status == 200 && clearAuthDataResp.data.Status) {
        			if(typeof cb == "function") {
        				cb();
        			}
        		} 
        	});
		}
		
		function goToSlackConfig(slackAuthInfo,login,newUser) {
			var params = {"team": slackAuthInfo.teamId,"user": slackAuthInfo.slackUserMail};
			if(!login && !_.isEmpty(userInfo.UserId)) {
				params.user = userInfo.UserId;
    		}
			if(!_.isEmpty(slackAuthInfo.authedNumicUser)) {
				params.user = slackAuthInfo.authedNumicUser;
    		}
			if(newUser == "YES") {
				params.newUser = newUser;
			}
			$state.go("manageslack",params);
		}
		
		function connectToNumiciUser(slackAuthInfo,login,newUser) {
			var postdata = {};
			if(login) {
				postdata = {"login" : login};
				postdata["numiciUserId"] = slackAuthInfo.slackUserMail;
			}
			SlackService.connectToNumiciUser(postdata).then(function(slackConnectResp) {
        		if(slackConnectResp.status == 200 && slackConnectResp.data.Status) {
        			clearAuthData();
        			if(webClient && webClient == "ext") {
        				SlackService.extensionOAuthRequest();
        			} else {
        				goToSlackConfig(slackAuthInfo,login,newUser);
        			}
        		} 
        	});
		}
		
		function createNumiciUser(slackAuthInfo,login) {
			var postdata = {"login" : login};
			postdata["markVerified"] = true;
			SlackService.createNumiciUser(postdata).then(function(slackConnectResp) {
        		if(slackConnectResp.status == 200 && slackConnectResp.data.Status) {
        			connectToNumiciUser(slackAuthInfo,false,"YES");
        		} 
        	});
		}
				
		function userConfig(postdata,cb) {
			SlackService.userConfig(postdata).then(function(userConfigResp) {
        		if(userConfigResp.status == 200 && userConfigResp.data.Status) {
        			if(typeof cb == "function") {
        				cb(userConfigResp.data.Data);
        			}
        		} 
        	});
		}
		
		function loginToAuthorizedUser(slackAuthInfo) {
			SlackService.loginAuthedUser({}).then(function (resp) {
				 if(resp.status == 200 && resp.data.Status) {
					 goToSlackConfig(slackAuthInfo,true,"NO");
					 AuthService.getUserInfo();
				 }
			});
		}
		
		function getErrorText(code,cb) {
			SlackService.getErrorText(code).then(function (resp) {
				 if(resp.status == 200 && resp.data.Status) {
					 if(typeof cb == "function") {
						 cb(resp.data.Message);
					 }
				 }
			});
		}
		
		function slackUserConfirm(slackAuthInfo,SlackUserConfirmData) {
			var modalInstance = $uibModal.open({
			      animation: true,
			      templateUrl: 'app/components/Slack/slackuserconfirm/slackuserconfirm.tmpl.html',
			      controller: 'SlackUserConfirmController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'succ',
			      backdrop: 'static',
			      size : 'md',
			      resolve: {
			    	  SlackUserConfirmData : function() {
			    		  return SlackUserConfirmData;
			    	  }
			      }
			});
			modalInstance.result.then(function (results) {
				connectToNumiciUser(slackAuthInfo,false);
			},function () {
				clearAuthData(function(){
					$state.go("login",{"fromCode" : true});
				});
			});
		}
		
		function slackSigninError(SlackSigninErrorData) {
			var modalInstance = $uibModal.open({
			      animation: true,
			      templateUrl: 'app/components/Slack/slacksigninerror/slacksigninerror.tmpl.html',
			      controller: 'SlackSigninErrorController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'ssec',
			      backdrop: 'static',
			      size : 'md',
			      resolve: {
			    	  SlackSigninErrorData : function() {
			    		  return SlackSigninErrorData;
			    	  }
			      }
			});
			modalInstance.result.then(function () {
				clearAuthData(function(){
					$state.go("login",{"fromCode" : true});
				});
			});
		}
		
		function slackSignup(slackAuthInfo) {
			var modalInstance = $uibModal.open({
			      animation: true,
			      templateUrl: 'app/components/Slack/slacksignup/slacksignup.tmpl.html',
			      controller: 'slackSignupController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'ssc',
			      backdrop: 'static',
			      size : 'md',
			      resolve: {
			    	  slackAuthInfo : function() {
			    		  return slackAuthInfo;
			    	  }
			      }
			});
			modalInstance.result.then(function (status) {
				if(status == "signIn") {
					LocalStorageService.setLocalStorage(LocalStorageService.INSTALL_SLACK_AUTH,true);
					$state.go("login",{"fromCode" : true});
				} else if(status == "signUp") {
					createNumiciUser(slackAuthInfo,true);
				}
			},function () {
				clearAuthData(function(){
					var modalInstance = VDVCAlertService.open({"text" : "To use Numici app, you need a Numici account and you must authorize Numici app for Slack to access your Slack Workspace on your behalf."});
					modalInstance.result.then(function () {
						$state.go("login",{"fromCode" : true});
					});
				});
			});
		}
		
		function redirectToTarget() {
			if(slackAuthData.status == 200 && slackAuthData.data.Status) {
				var slackAuthInfo = slackAuthData.data.slackAuthData;
				//It will occur while click on sign in with slack btn
				if(!_.isEmpty(slackAuthInfo) && slackAuthInfo.state == "signinstep1") {
					userService.getSlackStep2SignInUrl(webClient).then(function(step2OAuthResp) {
                		if(step2OAuthResp.status == 200 && step2OAuthResp.data.Status) {
                			$window.location.href = step2OAuthResp.data.Data;
                		} 
                	});
					return false;
				} 
				//It will occur after authorization in signinstep1 and also we may have intermediate screen in between 
				if(!_.isEmpty(slackAuthInfo) && slackAuthInfo.state == "signinstep2") {
					if(!slackAuthInfo.numiciUserBySlackMail) {
						if(!userInfo.hasLogin) {
							createNumiciUser(slackAuthInfo,true);
						} else {
							//here need to ask user logout and proceed and then need to call createNumiciUser(login);
						}
					} else if(slackAuthInfo.numiciUserBySlackMail) {
						if(!userInfo.hasLogin) {
							connectToNumiciUser(slackAuthInfo,true);
						} else {
							connectToNumiciUser(slackAuthInfo,false);
						}
					}
					return false;
				} 
				//It will occur while try to authorize from numici
				if(!_.isEmpty(slackAuthInfo) && slackAuthInfo.state == "numiciauth") {
					if(!_.isEmpty(slackAuthInfo.authedNumicUser)) {
						if(userInfo.UserId == slackAuthInfo.authedNumicUser) {
							var params = {"team": slackAuthInfo.teamId,"user": userInfo.UserId};
		        			$state.go("manageslack",params);
						} else if(userInfo.UserId != slackAuthInfo.authedNumicUser) {
							getErrorText("1003",function(errorMsg){
								slackSigninError({"title":"Slack Authorizaion Error","text" : errorMsg});
							});
						}
					} else {
						if(userInfo.UserId == slackAuthInfo.slackUserMail) {
							connectToNumiciUser(slackAuthInfo,false);
						} else {
							slackUserConfirm(slackAuthInfo,{title:"Confirm","text":"Slack user email id '"+slackAuthInfo.slackUserMail+"' is different from logged in user id '"+userInfo.UserId+"'.<br><br>Still do you want to continue authorize?"});
						}
					}
					return false;
				} 
				//It will occur while try install from slack
				if(!_.isEmpty(slackAuthInfo) && slackAuthInfo.state == "installslack") {
					if(!userInfo.hasLogin) {
						if(!_.isEmpty(slackAuthInfo.authedNumicUser)) {
							var postdata = {"userId" : slackAuthInfo.authedNumicUser,"teamId" : slackAuthInfo.teamId};
							userConfig(postdata,function(userConfigData) {
								if(!_.isEmpty(userConfigData) && userConfigData.slackUserEMail == slackAuthInfo.slackUserMail) {
									loginToAuthorizedUser(slackAuthInfo);
								} else if(!_.isEmpty(userConfigData) && userConfigData.slackUserEMail != slackAuthInfo.slackUserMail){
									getErrorText("1002",function(errorMsg){
										slackSigninError({"title":"Slack Authorizaion Error","text" : errorMsg});
									});
								}
							});
						} else {
							if(slackAuthInfo.numiciUserBySlackMail) {
								connectToNumiciUser(slackAuthInfo,true);
							} else if(!slackAuthInfo.numiciUserBySlackMail) {
								slackSignup(slackAuthInfo);
							}
						}
					} else if(userInfo.hasLogin) {
						if(!_.isEmpty(slackAuthInfo.authedNumicUser)) {
							if(userInfo.UserId != slackAuthInfo.authedNumicUser) {
								getErrorText("1003",function(errorMsg){
									slackSigninError({"title":"Slack Authorizaion Error","text" : errorMsg});
								});
							} else {
								var postdata = {"userId" : slackAuthInfo.authedNumicUser,"teamId" : slackAuthInfo.teamId};
								userConfig(postdata,function(userConfigData) {
									if(!_.isEmpty(userConfigData) && userConfigData.slackUserEMail == slackAuthInfo.slackUserMail) {
										var params = {"team": slackAuthInfo.teamId,"user": userInfo.UserId};
					        			$state.go("manageslack",params);
									} else if(!_.isEmpty(userConfigData) && userConfigData.slackUserEMail != slackAuthInfo.slackUserMail){
										getErrorText("1001",function(errorMsg){
											slackSigninError({"title":"Slack Authorizaion Error","text" : errorMsg});
										});
									} 
								});
							}
						} else {
							var postdata = {"userId" : userInfo.UserId,"teamId" : slackAuthInfo.teamId};
							userConfig(postdata,function(userConfigData) {
								if(!_.isEmpty(userConfigData) && userConfigData.slackUserEMail != slackAuthInfo.slackUserMail){
									getErrorText("1001",function(errorMsg){
										slackSigninError({"title":"Slack Authorizaion Error","text" : errorMsg});
									});
								} else if(_.isEmpty(userConfigData) && userInfo.UserId == slackAuthInfo.slackUserMail) {
									connectToNumiciUser(slackAuthInfo,false);
								} else if(_.isEmpty(userConfigData) && userInfo.UserId != slackAuthInfo.slackUserMail) {
									slackUserConfirm(slackAuthInfo,{title:"Confirm","text":"Slack user email id '"+slackAuthInfo.slackUserMail+"' is different from logged in user id '"+userInfo.UserId+"'.<br><br>Still do you want to continue authorize?"});
								} else if(_.isEmpty(userConfigData) && userInfo.UserId == slackAuthInfo.slackUserMail) {
									connectToNumiciUser(slackAuthInfo,false);
								}
							});
						}
					}
					return false;
				}
			} else {
				$state.go("login",{"fromCode" : true});
			}
		}
		
		redirectToTarget();
	}
})();