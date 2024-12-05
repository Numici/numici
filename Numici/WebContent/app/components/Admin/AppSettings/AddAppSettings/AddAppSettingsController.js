;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('AddAppSettingsController',AddAppSettingsController);
	
	AddAppSettingsController.$inject = ['$scope','settings','_','AppSettingsService','$uibModalInstance'];

	function AddAppSettingsController($scope,settings,_,AppSettingsService,$uibModalInstance) {
		var aaps = this;
		
		var hiddenColoms = ["id","type","typeFor","organizationId","userId","Temp","createdOn","modifiedOn"];
		
		// Instance variables
		aaps.userSettingsTypes = angular.copy(AppSettingsService.userSettingsTypes);
		aaps.configTypes = ["Enabled","Disable","Hidden"];
		aaps.addSettingsFor = angular.copy(settings.settingsFor);
		aaps.appSettings = angular.copy(settings.appSettings);
		aaps.existedOrgsList = angular.copy(settings.existedOrgsList);
		aaps.existedUsersList = angular.copy(settings.existedUsersList);
		aaps.organizationsList = [];
		aaps.selectedOrganization = {};
		aaps.orgUsersList = [];
		aaps.selectedOrgUser = {};
		aaps.showErrorMessage = false;
		aaps.errorMessage = "";
				
		//Methods
		aaps.getSelectedUserName = getSelectedUserName;
		aaps.hasShowPermission = hasShowPermission;
		aaps.ok = ok;
		aaps.cancel = cancel;
		aaps.getUserSettingsTypes = getUserSettingsTypes;
		aaps.validateAppSettingValue = validateAppSettingValue;
		aaps.disableSaveAppSettingsBtn = disableSaveAppSettingsBtn;
		
		function getSelectedUserName(user) {
			 var userName = "";	
			 if(user) {
				 if(!_.isEmpty(user.firstName) && !_.isEmpty(user.lastName)) {
					 userName = user.firstName+" "+user.lastName;
				 } else if(_.isEmpty(user.firstName) && _.isEmpty(user.firstName)) {
					 userName = user.loginId;
				 } else if(!_.isEmpty(user.firstName)) {
					 userName = user.firstName;
				 } else if(!_.isEmpty(user.lastName)) {
					 userName = user.lastName;
				 }
			 }
			 return userName;
		}
		
		function hasShowPermission(key) {
			var status = false;
			if(!_.contains(hiddenColoms, key)) {
				status = true;
			}
			return status;
		}
		
		function processPostData() {
			_.each(hiddenColoms,function(item){
				delete aaps.appSettings[item];
			});
			var postdata = angular.copy(aaps.appSettings);
			postdata.type = aaps.addSettingsFor;
			if(aaps.addSettingsFor == "Organization" && !_.isEmpty(aaps.selectedOrganization)) {
				postdata.typeFor = aaps.selectedOrganization.name;
			} else if(!_.isEmpty(aaps.selectedOrgUser)){
				var typeFor = "";
				if(aaps.selectedOrgUser.firstName) {
					typeFor = aaps.selectedOrgUser.firstName;
				}
				if(aaps.selectedOrgUser.lastName) {
					if(aaps.selectedOrgUser.firstName) {
						typeFor += " ";
					}
					typeFor += aaps.selectedOrgUser.lastName
				}
				postdata.typeFor = typeFor;
				
				postdata.userId = aaps.selectedOrgUser.loginId;
			}
			postdata.organizationId = aaps.selectedOrganization.id;
			return postdata;
		}
		
		function saveAppSettings() {
			var postdata = processPostData();
			AppSettingsService.saveAppSettings(postdata).then(function(resp) {
				if (resp.status ==200 && resp.data.Status) {
					$uibModalInstance.close(resp);
				} else {
					aaps.errorMessage = resp.data.Message;
					aaps.showErrorMessage = true;
				}
			});
		}
		
		function ok() {
			aaps.showErrorMessage = false;
			aaps.errorMessage = "";
			var existedOrgObj = _.findWhere(aaps.existedOrgsList,{"organizationId" : aaps.selectedOrganization.id});
			var existedUserObj = _.findWhere(aaps.existedUsersList,{"userId" : aaps.selectedOrgUser.loginId});
			if(!disableSaveAppSettingsBtn()) {
				if(aaps.addSettingsFor == "Organization") {
					if(_.isEmpty(aaps.selectedOrganization)) {
						aaps.errorMessage = "Please select any organization to add 'App Settings'";
						aaps.showErrorMessage = true;
					} else if(!_.isEmpty(existedOrgObj)) {
						aaps.errorMessage = "Selected organization is already added to 'App Settings'";
						aaps.showErrorMessage = true;
					} else {
						saveAppSettings();
					}
					
				} else if(aaps.addSettingsFor == "User") {
					if(_.isEmpty(aaps.selectedOrgUser)) {
						aaps.errorMessage = "Please select any user to add 'App Settings'";
						aaps.showErrorMessage = true;
					} else if(!_.isEmpty(existedUserObj)) {
						aaps.errorMessage = "Selected user is already added to 'App Settings'";
						aaps.showErrorMessage = true;
					} else {
						saveAppSettings();
					}
				}
			}
		}
		
		function cancel() {
		    $uibModalInstance.dismiss('cancel');
		}
		
		function getUserSettingsTypes(key) {
			var selectedSetting = aaps.userSettingsTypes[key];
			var userSettingsType = {fieldType : "", valuesType:""};
			userSettingsType.fieldType = selectedSetting.fieldType;
			if(selectedSetting.fieldType == "DropDown" && selectedSetting.valuesType == "Enable-Disable") {
				userSettingsType.valuesType = ["Enabled","Disable","Hidden"];
			} else if(selectedSetting.fieldType == "DropDown" && selectedSetting.valuesType == "True-False") {
				userSettingsType.valuesType = [true,false];
			} else if(selectedSetting.fieldType == "DropDown" && selectedSetting.valuesType == "Yes-No") {
				userSettingsType.valuesType = ["Yes","No"];
			} else if(selectedSetting.fieldType == "DropDown" && selectedSetting.valuesType == "UseGridFS-Options") {
				userSettingsType.valuesType = ["Yes","No","Inherited"];
			} else {
				userSettingsType.valuesType = selectedSetting.valuesType;
			}
			
			return userSettingsType;
		}
		
		function validateAppSettingValue(key,value) {
			var status = false;
			if(aaps.userSettingsTypes[key].valuesType == "long") {
				if(isNaN(value)) {
					status = false;
				} else {
					status = Number.isInteger(parseInt(value));
				}
			} else if(aaps.userSettingsTypes[key].valuesType == "email") {
				var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
				status = regex.test(value);
			} else {
				status = true;
			}
			if(status) {
				aaps.userSettingsTypes[key].tooltip = value;
				aaps.userSettingsTypes[key].error = false;
			} else {
				aaps.userSettingsTypes[key].tooltip = "Please enter valid '"+aaps.userSettingsTypes[key].valuesType+"' value.";
				aaps.userSettingsTypes[key].error = true;
			}
			return status;
		}
		
		function disableSaveAppSettingsBtn() {
			var status = false;
			var userSettingValuesList = _.values(aaps.userSettingsTypes);
			var userSettingErrorValueObj = _.findWhere(userSettingValuesList, {"error":true});
			if(userSettingErrorValueObj) {
				status = true;
			}
			return status;
		}
		
		function init() {
			if(aaps.addSettingsFor == "Organization") {
				AppSettingsService.getOrganizationsList().then(function(resp) {
					if(resp.status == 200 && resp.data.Status) {
						aaps.organizationsList = resp.data.Organization;
						//aaps.selectedOrganization = aaps.organizationsList[0];
					}
				});
			} else {
				AppSettingsService.getOrgUsersList(aaps.appSettings.organizationId).then(function(resp) {
					if(resp.status == 200 && resp.data.Status) {
						aaps.orgUsersList = resp.data.Users;
						//aaps.selectedOrgUser = aaps.orgUsersList[0];
						var selectedOrg = {"id":aaps.appSettings.organizationId,"name":aaps.appSettings.typeFor};
						aaps.organizationsList.push(selectedOrg);
						aaps.selectedOrganization = selectedOrg;
					} 
				});
			}
		}
		
		init();
	}	
	
})();