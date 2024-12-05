;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('AddUserController',AddUserController);
	
	AddUserController.$inject = ['$scope','appData','user','mode','_','AdministrationService','$uibModalInstance','MessageService','uuidService'];

	function AddUserController($scope,appData,user,mode,_,AdministrationService,$uibModalInstance,MessageService,uuidService) {
		var auc = this;
		var appdata = appData.getAppData();
		var userFields = AdministrationService.newUserFields;
		var userInfo = angular.copy(user);
		var userRoles = [];
		var userStatusList = [];
		
		auc.auto_uid = uuidService.newUuid();
		auc.isInViewMode = false;
		auc.isInEditMode = false;
		auc.userFieldsModel = angular.copy(userFields);
		auc.userFieldsOffset = 7;
		auc.showErrorMessage = false;
		auc.errorMessage = "";
		auc.userAuditTrailHeaders = angular.copy(AdministrationService.userAuditTrailHeaders);
		auc.userAuditTrailField = angular.copy(AdministrationService.userAuditTrailField);
		auc.getDDOptionsForSelect = getDDOptionsForSelect;
		auc.validateUserFields = validateUserFields;
		auc.ok = ok;
		auc.cancel = cancel;
		
		function getUUID() {
			return uuidService.newUuid();
		}
		
		function getDDOptionsForSelect(key) {
			if(key === "role") {
				return userRoles;
			} else if(key === "status") {
				return userStatusList;
			}
		}
		
		function isValidEmail (loginIdValue) {
			var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
			return regex.test(loginIdValue);
		}
		
		function isValidMobile (mobilePhoneValue) {
			var regex = /^[0-9]{10}$/;
			return regex.test(mobilePhoneValue);
		}
		
		function validateUserFields() {
			var status = false;
			auc.showErrorMessage = false;
			auc.errorMessage = "";
			var inValidObj = _.findWhere(auc.userFieldsModel,{required:true,value:""});
			if(!auc.isInViewMode && !auc.isInEditMode && inValidObj) {
				status = true;
			} else if((auc.isInViewMode || auc.isInEditMode) && inValidObj && inValidObj.key != "password" && inValidObj.key != "confirmPassword") {
				status = true;
			}
			if(status) {
				auc.errorMessage = "Please enter valid "+inValidObj.label;
				auc.showErrorMessage = true;
				return status;
			}
			var loginIdObj = _.findWhere(auc.userFieldsModel,{key:"loginId"});
			var loginIdValue = loginIdObj.value;
			if(_.isEmpty(loginIdValue) || (loginIdValue.toLowerCase() !== "vdvc_admin" && !isValidEmail(loginIdValue))) {
				status = true;
				auc.errorMessage = "Please enter valid "+loginIdObj.label;
				auc.showErrorMessage = true;
				return status;
			}
			var mobilePhoneObj = _.findWhere(auc.userFieldsModel,{key:"mobilePhone"});
			var mobilePhoneValue = mobilePhoneObj.value;
			if(!_.isEmpty(mobilePhoneValue) && !isValidMobile(mobilePhoneValue)) {
				status = true;
				auc.errorMessage = "Please enter valid "+mobilePhoneObj.label;
				auc.showErrorMessage = true;
				return status;
			}
			var newPassword = _.findWhere(auc.userFieldsModel,{key:"password"}).value;
			var confirmPassword = _.findWhere(auc.userFieldsModel,{key:"confirmPassword"}).value;
			if(!auc.isInViewMode && !auc.isInEditMode && (_.isEmpty(newPassword) || _.isEmpty(confirmPassword) || newPassword !== confirmPassword)){
				status = true;
				auc.errorMessage = "Password And Confirm Password Should Be Same";
				auc.showErrorMessage = true;
				return status;
			}
			return status;
		}
		
		function prepareNewUsrPostdata() {
			var postdata = {};
			if(auc.isInEditMode && !_.isEmpty(userInfo)) {
				postdata["id"] = userInfo.id;
			}
			_.each(auc.userFieldsModel,function(userField){
				if(userField.key !== "confirmPassword") {
					if(userField.key == "password" && !auc.isInEditMode){
						postdata[userField.key] = userField.value;
					} else if(userField.key == "password" && auc.isInEditMode) {
						//Do nothing
					} else {
						postdata[userField.key] = userField.value;
					}
				}
			});
			return postdata;
		}
		
		function ok() {
			var postdata = prepareNewUsrPostdata();
			AdministrationService.saveUser(postdata).then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					$uibModalInstance.close(resp.data.Users);
				} else {
					MessageService.showErrorMessage("ADMINISTRATION_ERR",[resp.data.Message]);
				}
			});
		}
		
		function cancel() {
			$uibModalInstance.dismiss('cancel');
		}
		
		function processUserInfo() {
			_.each(auc.userFieldsModel,function(userField){
				if(userField.key !== "password" && userField.key !== "confirmPassword") {
					userField.value = userInfo[userField.key];
					userField.show = true;
				} else {
					userField.show = false;
				}
				if(userField.key == "termsAccepted" || userField.key == "pwdChanged" || userField.key == "passwordExpires") {
					if(userField.subField) {
						userField.subField.value = userInfo[userField.subField.key];
						userField.subField.show = true;
					}
				}
				if(userField.key == "loginId" || userField.key == "createdBy" || userField.key == "verified" || userField.key == "termsAccepted" || userField.key == "pwdChanged" || userField.key == "passwordExpires" || userField.key == "localPassword" || userField.key == "doNotShowHelpOnLogin" || userField.key == "doNotShowTipsOnLogin" || userField.key == "creationDate" || userField.key == "modifiedDate") {
					userField.disable = true;
				}
				if(auc.isInViewMode) {
					userField.disable = true;
				}
			});
			if(auc.userAuditTrailField) {
				auc.userAuditTrailField.value = userInfo[auc.userAuditTrailField.key];
			}
		}
		
		function init() {
			userRoles = AdministrationService.getUserRoles(appdata.UserRole);
			userStatusList = AdministrationService.getUserStatusList();
			_.findWhere(auc.userFieldsModel,{"key" : "role"}).value = "User";
			_.findWhere(auc.userFieldsModel,{"key" : "status"}).value = "Active";
			if(mode.type === "view" && !_.isEmpty(userInfo)) {
				auc.isInViewMode = true;
				processUserInfo();
			} else if(mode.type === "edit" && !_.isEmpty(userInfo)) {
				auc.isInEditMode = true;
				processUserInfo();
			} else {
				_.each(auc.userFieldsModel,function(userField){
					if(userField.key == "createdBy" || userField.key == "localPassword") {
						userField.show = false;
					}
				});
			}
		}
		init();
	}	
	
})();