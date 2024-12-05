;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('AddOrganizationController',AddOrganizationController);
	
	AddOrganizationController.$inject = ['$scope','organization','openModal','$compile','_','AdministrationService','$uibModalInstance','MessageService','$timeout'];

	function AddOrganizationController($scope,organization,openModal,$compile,_,AdministrationService,$uibModalInstance,MessageService,$timeout) {
		var aoc = this;
		
		var organizationFields = AdministrationService.newOrganizationFields;
		var organizationInfo = angular.copy(organization);
		
		aoc.isInEditMode = false;
		aoc.organizationFieldsModel = angular.copy(organizationFields);
		aoc.showErrorMessage = false;
		aoc.errorMessage = "";
		
		aoc.getSectionsClass = getSectionsClass;
		aoc.validateOrganizationFields = validateOrganizationFields;
		aoc.ok = ok;
		aoc.cancel = cancel;
		
		function getShownedSectionsCount() {
			var shownedSections = [];
			var shownedSections = _.where(aoc.organizationFieldsModel,{show : true});
			return shownedSections.length;
		}
		
		function getSectionsClass() {
			var sectionsCount = getShownedSectionsCount();
			if(sectionsCount == 0) {
				sectionsCount = 1;
			}
			return "col-sm-"+(12/parseInt(sectionsCount));
		}
		
		function isValidEmail (loginIdValue) {
			var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
			return regex.test(loginIdValue);
		}
		
		function isValidMobile (mobilePhoneValue) {
			var regex = /^[0-9]{10}$/;
			return regex.test(mobilePhoneValue);
		}
		
		function validateOrgInfoFields() {
			var status = false;
			aoc.showErrorMessage = false;
			aoc.errorMessage = "";
			var organizationDetails = _.findWhere(aoc.organizationFieldsModel,{key:"organizationDetails"});
			var inValidObj = _.findWhere(organizationDetails.subFields,{required:true,value:""});
			if(inValidObj) {
				status = true;
				aoc.errorMessage = "Please enter valid "+inValidObj.label;
				aoc.showErrorMessage = true;
			}
			return status;
		}
		
		function validateDbInfoFields() {
			var status = false;
			aoc.showErrorMessage = false;
			aoc.errorMessage = "";
			var databaseDetails = _.findWhere(aoc.organizationFieldsModel,{key:"databaseDetails"});
			var inValidObj = _.findWhere(databaseDetails.subFields,{required:true,value:""});
			if(!aoc.isInEditMode && inValidObj) {
				status = true;
			} else if(aoc.isInEditMode && inValidObj && inValidObj.key != "dbUser" && inValidObj.key != "dbPassword" && inValidObj.key != "dbAdminUsr" && inValidObj.key != "dbAdminPwd") {
				status = true;
			}
			if(status) {
				aoc.errorMessage = "Please enter valid "+inValidObj.label;
				aoc.showErrorMessage = true;
			}
			var dbPortObj = _.findWhere(databaseDetails.subFields,{key:"dbPort"});
			var dbPortValue = dbPortObj.value;
			if(isNaN(dbPortValue)) {
				status = true;
				aoc.errorMessage = "Please enter valid "+dbPortObj.label;
				aoc.showErrorMessage = true;
				return status;
			}
			return status;
		}
		
		function validateAdminUserInfoFields() {
			var status = false;
			aoc.showErrorMessage = false;
			aoc.errorMessage = "";
			var adminUserDetails = _.findWhere(aoc.organizationFieldsModel,{key:"adminUserDetails"});
			var inValidObj = _.findWhere(adminUserDetails.subFields,{required:true,value:""});
			if(!aoc.isInEditMode && inValidObj) {
				status = true;
			} else if(aoc.isInEditMode && inValidObj && inValidObj.key != "password" && inValidObj.key != "confirmPassword") {
				status = true;
			}
			if(status) {
				aoc.errorMessage = "Please enter valid "+inValidObj.label;
				aoc.showErrorMessage = true;
				return status;
			}
			var loginIdObj = _.findWhere(adminUserDetails.subFields,{key:"loginId"});
			var loginIdValue = loginIdObj.value;
			if(_.isEmpty(loginIdValue) || (loginIdValue.toLowerCase() !== "vdvc_admin" && !isValidEmail(loginIdValue))) {
				status = true;
				aoc.errorMessage = "Please enter valid "+loginIdObj.label;
				aoc.showErrorMessage = true;
				return status;
			}
			var mobilePhoneObj = _.findWhere(adminUserDetails.subFields,{key:"mobilePhone"});
			var mobilePhoneValue = mobilePhoneObj.value;
			if(!_.isEmpty(mobilePhoneValue) && !isValidMobile(mobilePhoneValue)) {
				status = true;
				aoc.errorMessage = "Please enter valid "+mobilePhoneObj.label;
				aoc.showErrorMessage = true;
				return status;
			}
			var newPassword = _.findWhere(adminUserDetails.subFields,{key:"password"}).value;
			var confirmPassword = _.findWhere(adminUserDetails.subFields,{key:"confirmPassword"}).value;
			if(!aoc.isInEditMode && (_.isEmpty(newPassword) || _.isEmpty(confirmPassword) || newPassword !== confirmPassword)){
				status = true;
				aoc.errorMessage = "Password And Confirm Password Should Be Same";
				aoc.showErrorMessage = true;
				return status;
			}
			return status;
		}
		
		function validateOrganizationFields() {
			var status = false;
			if(validateOrgInfoFields() || validateDbInfoFields() || (!aoc.isInEditMode && !aoc.isInViewMode && validateAdminUserInfoFields())) {
				status = true;
			}
			return status;
		}
		
		function prepareNewOrgPostdata() {
			var postdata = {};
			postdata["orgInfo"] = {};
			postdata["userInfo"] = {};
			if(aoc.isInEditMode && !_.isEmpty(organizationInfo)) {
				postdata["orgInfo"]["id"] = organizationInfo.id;
			}
			_.each(aoc.organizationFieldsModel,function(organizationFieldModel){
				if(organizationFieldModel.key == "organizationDetails") {
					_.each(organizationFieldModel.subFields,function(subField){
						if(subField.key !== "creationDate" && subField.key !== "modifiedDate") {
							postdata.orgInfo[subField.key] = subField.value;
						}
					});
				}
				if(organizationFieldModel.key == "databaseDetails") {
					_.each(organizationFieldModel.subFields,function(subField){
						if(subField.key !== "dbUser" && subField.key !== "dbPassword" && subField.key !== "dbAdminUsr" && subField.key !== "dbAdminPwd") {
							if(subField.key == "dbPort" && !isNaN(subField.value)) {
								postdata.orgInfo[subField.key] = parseInt(subField.value);
							} else {
								postdata.orgInfo[subField.key] = subField.value;
							}
						} else if (!aoc.isInEditMode && (subField.key == "dbUser" || subField.key == "dbPassword")){
							postdata.orgInfo[subField.key] = subField.value;
						}
						if (!aoc.isInEditMode && (subField.key == "dbAdminUsr" || subField.key == "dbAdminPwd")){
							postdata[subField.key] = subField.value;
						}
					});
				}
				if(!aoc.isInEditMode && organizationFieldModel.key == "adminUserDetails") {
					_.each(organizationFieldModel.subFields,function(subField){
						if(subField.key !== "confirmPassword") {
							postdata.userInfo[subField.key] = subField.value;
						}
					});
				}
			});
			return postdata;
		}
		
		function ok() {
			var postdata = prepareNewOrgPostdata();
			AdministrationService.saveOrganization(postdata).then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					$uibModalInstance.close(resp.data.Organization);
				} else {
					MessageService.showErrorMessage("ADMINISTRATION_ERR",[resp.data.Message]);
				}
			});
		}
		
		function cancel() {
			$uibModalInstance.dismiss('cancel');
		}
		
		function processOrganizationInfo() {
			if(aoc.isInViewMode) {
				_.each(aoc.organizationFieldsModel,function(organizationFieldModel){
					if(organizationFieldModel.key == "organizationDetails") {
						organizationFieldModel.show = true;
						_.each(organizationFieldModel.subFields,function(subField){
							subField.value = organizationInfo[subField.key];
							subField.show = true;
							subField.disable = true;
						});
					}
					if(organizationFieldModel.key == "databaseDetails") {
						organizationFieldModel.show = true;
						_.each(organizationFieldModel.subFields,function(subField){
							if(subField.key !== "dbAdminUsr" && subField.key !== "dbAdminPwd" && subField.key !== "dbPassword") {
								subField.value = organizationInfo[subField.key];
								subField.show = true;
							} else if (subField.key == "dbAdminUsr" || subField.key == "dbAdminPwd" || subField.key == "dbPassword"){
								subField.show = false;
							}
							subField.disable = true;
						});
					}
					if(organizationFieldModel.key == "adminUserDetails") {
						organizationFieldModel.show = false;
						_.each(organizationFieldModel.subFields,function(subField){
							subField.show = false;
						});
					}
				});
			}
			if(aoc.isInEditMode) {
				_.each(aoc.organizationFieldsModel,function(organizationFieldModel){
					if(organizationFieldModel.key == "organizationDetails") {
						organizationFieldModel.show = true;
						_.each(organizationFieldModel.subFields,function(subField){
							subField.value = organizationInfo[subField.key];
							subField.show = true;
							if(subField.key == "name" || subField.key == "sharedOrg" || subField.key == "creationDate" || subField.key == "modifiedDate") {
								subField.disable = true;
							}
						});
					}
					if(organizationFieldModel.key == "databaseDetails") {
						organizationFieldModel.show = true;
						_.each(organizationFieldModel.subFields,function(subField){
							if(subField.key !== "dbAdminUsr" && subField.key !== "dbAdminPwd" && subField.key !== "dbPassword") {
								subField.value = organizationInfo[subField.key];
								subField.show = true;
							} else if (subField.key == "dbAdminUsr" || subField.key == "dbAdminPwd" || subField.key == "dbPassword"){
								subField.show = false;
							}
							if(subField.key == "dbHost" || subField.key == "dbPort" || subField.key == "dbName" || subField.key == "dbUser") {
								subField.disable = true;
							}
						});
					}
					if(organizationFieldModel.key == "adminUserDetails") {
						organizationFieldModel.show = false;
						_.each(organizationFieldModel.subFields,function(subField){
							subField.show = false;
						});
					}
				});
			}
		}
		
		function clearView() {
			try{
				var divElement = angular.element(document.querySelector('#users-list'));
				divElement.empty();
			} catch(e) {
				
			}
		}
		
		function renderSelectedMenuView() {
			clearView();
			var divElement = angular.element(document.querySelector('#users-list'));
			var template = "<users-ui-for-admin></users-ui-for-admin>";
			var childScope = $scope.$new();
			childScope["selectedOrganization"] = {};
			childScope.selectedOrganization["id"] = organizationInfo.id;
			childScope.selectedOrganization["name"] = organizationInfo.name;
		    var appendHtml = $compile(template)(childScope);
		    divElement.append(appendHtml);
		}
		
		function init() {
			if(!_.isEmpty(organizationInfo) && openModal.mode == "edit") {
				aoc.isInEditMode = true;
				processOrganizationInfo();
			} else if(!_.isEmpty(organizationInfo) && openModal.mode == "view") {
				aoc.isInViewMode = true;
				processOrganizationInfo();
				var t = $timeout(function() {
					renderSelectedMenuView();
					$timeout.cancel(t);
				},500);
			}
		}
		init();
	}	
	
})();