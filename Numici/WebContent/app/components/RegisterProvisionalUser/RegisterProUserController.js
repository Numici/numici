;(function() {
	'use strict'; 
	
	angular.module('vdvcApp').controller('RegisterProUserController',RegisterProUserController);
	
	RegisterProUserController.$inject = ['$rootScope','$scope','$state','$stateParams','_','$uibModal','userService',
	                                     '$confirm','AuthService','MessageService','RegisterProUserService',
	                                     'ConfirmSignedInService','TimeLogService'];
	
	function RegisterProUserController($rootScope,$scope,$state,$stateParams,_,$uibModal,userService,$confirm,AuthService,
			MessageService,RegisterProUserService,ConfirmSignedInService,TimeLogService) {
		
		var rpc = this;
		var provisionalUser = {};
		
		function openInContext() {
			if($stateParams.objType === "Taskspace") {
				$state.go('taskspace.list.task',{"tsId": $stateParams.objId,"tsc":$stateParams.objCId,d:$stateParams.d,dc:$stateParams.dc,da:$stateParams.da},{reload : false});
			} else if($stateParams.objType === "Document") {
				$state.go("docview",{"docId": $stateParams.objId,"clientId":$stateParams.objCId},{reload : false});
			} else {
				$state.go('login',{"fromCode":true});
			}
		}
		
		function openRegisterModal(provisionalUser) {
			var modalInstance = $uibModal.open({
				animation: true,  
				templateUrl: 'app/components/RegisterProvisionalUser/Registration/RegisterProUserModal.html',
			    controller: 'RegisterProUserModalController',
			    appendTo : $('.rootContainer'),
			    controllerAs : 'rpmc',
			    backdrop: "static",
			    size: "md",
			    resolve : {
			    	provisionalUser : provisionalUser,
			    }
			});
			modalInstance.result.then(function (status) {
				/*if(status) {
					//$state.go('login');
					openInContext();
				}*/
				openInContext();
			}, function () {
				$state.go('login',{"fromCode":true});
			});
		}
		
		function checkAndOpenRegProUser() {
			if(!_.isEmpty($stateParams.proUser)) {
				var proUser = [];
				proUser = $stateParams.proUser.split("::");
				provisionalUser.email = proUser[0];
				provisionalUser.encId = proUser[1];
			}
			if(!_.isEmpty(provisionalUser)) {
				RegisterProUserService.checkProuser(provisionalUser).then( function(resp) {
					if(resp.status && resp.data.Status) {
						var confirmText = resp.data.Message;
						if(!_.isEmpty(confirmText)) {
							$confirm({text: confirmText},
									{ templateUrl: 'app/components/common/CustomeTemplates/confirmTemplate.html' })
					        .then(function() {
					        	$state.go('login',{"fromCode":true});
						    },function() {
						    	$state.go('login',{"fromCode":true});
						    });
						} else {
							openRegisterModal(provisionalUser);
						}
					}
				});
			} else {
				openRegisterModal(provisionalUser);
			}
		}
		
		
		function logoutAndContinue() {
			$rootScope.previousState = null;
        	$rootScope.previousStateParams = null;
        	TimeLogService.clearLog();
			AuthService.logout().then(function (resp) {
				if(resp.status == 200 ) {
					checkAndOpenRegProUser();
				}
			});
		}
		
		function confirmSignedIn(signedInUserInfo) {
			var confirmSignedInModalInstance = ConfirmSignedInService.openConfirmSignedInModal(signedInUserInfo);
			confirmSignedInModalInstance.result.then(function (status) {
				if(status === "logoutAndContinue") {
					logoutAndContinue();
				} else if(status === "skipAndGotoRoot") {
					$state.go('docs',{"folderId" : signedInUserInfo.RootFolder.id},{reload : true});
				}
			}, function () {
				$state.go('login',{"fromCode":true});
			});
		}
		
		function init() {
			userService.getUserInfo().then(function(usrInfResp) {
				 if(usrInfResp.status == 200 && usrInfResp.data.Status) {
					 if(usrInfResp.data.hasLogin) {
						 confirmSignedIn(usrInfResp.data);
					 } else {
						 checkAndOpenRegProUser();
					 }
				 }
			});
		}
		
		init();
	}
})();