;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('AppSettingsController',AppSettingsController);
	
	AppSettingsController.$inject = ['$state','$scope','appData','_','$confirm','AppSettingsService','MessageService','$uibModal'];

	function AppSettingsController($state,$scope,appData,_,$confirm,AppSettingsService,MessageService,$uibModal) {
		var aps = this;
		var appdata = appData.getAppData();
		$scope.$emit("PageName",{"userName":appdata.UserName,"pageName":$state.current.pageName});
		
		// Instance variables
		var AllUsersSettings = [];
		var selectedAppSettingsOriginal = {};
		var hiddenColoms = ["id","type","typefor","organizationid","userid","createdon","modifiedon"];
		
		aps.userSettingsTypes = angular.copy(AppSettingsService.userSettingsTypes);
		aps.searchString = "";
		aps.appSettingsList = [];
		aps.selectedOrgUsersList = [];
		aps.selectedAppSettings;
		aps.selectedOrgUser;
		aps.isAppSettingsEdited = false;
		aps.editedUserSettings = {};
				
		//Methods
		aps.getSelectedUserName = getSelectedUserName;
		aps.getSelectedAppSettings = getSelectedAppSettings;
		aps.getSelectedUserAppSettings = getSelectedUserAppSettings;
		aps.hasShowPermission = hasShowPermission;
		aps.showAddSettingsForOrganizationBtn = showAddSettingsForOrganizationBtn;
		aps.addSettingsForOrganization = addSettingsForOrganization;
		aps.showAddSettingsForUserBtn = showAddSettingsForUserBtn;
		aps.addSettingsForUser = addSettingsForUser;
		aps.editAppSettings = editAppSettings;
		aps.saveAppSettings = saveAppSettings;
		aps.deleteAppSettings = deleteAppSettings;
		aps.cancelEditAppSettings = cancelEditAppSettings;
		aps.getUserSettingsTypes = getUserSettingsTypes;
		aps.validateAppSettingValue = validateAppSettingValue;
		aps.disableSaveAppSettingsBtn = disableSaveAppSettingsBtn;
		aps.editSingleAppSetting = editSingleAppSetting;
		aps.cancelEditSingleAppSetting = cancelEditSingleAppSetting;
		aps.saveSingleAppSetting = saveSingleAppSetting;
		
		function getSelectedUserName(user) {
			 var userName = "";
			 if(user) {
				 if(!_.isEmpty(user.typeFor)) {
					 userName = user.typeFor;
				 } else {
					 userName = user.userId;
				 }
			 }
			 return userName;
		 }
		
		function getSelectedAppSettings() {
			aps.selectedOrgUsersList = [];
			aps.editedUserSettings = [];
			if(!_.isEmpty(aps.selectedAppSettings)) {
				selectedAppSettingsOriginal = _.findWhere(AllUsersSettings,{"id":aps.selectedAppSettings.id});
				aps.selectedAppSettingsCopy = angular.copy(selectedAppSettingsOriginal);
				if(aps.selectedAppSettingsCopy && aps.selectedAppSettingsCopy.type == "Organization") {
					aps.selectedOrgUser = {"typeFor" : "Organization Default Settings"};
					aps.selectedOrgUsersList.push(aps.selectedOrgUser);
					var selectedOrgUsersList = angular.copy(_.where(AllUsersSettings,{"organizationId":aps.selectedAppSettingsCopy.organizationId}));
					if(!_.isEmpty(selectedOrgUsersList)) {
						_.each(selectedOrgUsersList,function(OrgUser){
							if(OrgUser.type == "User") {
								aps.selectedOrgUsersList.push(OrgUser);
							}
						});
					}
				}
			}
			
		}
		
		function getSelectedUserAppSettings() {
			aps.editedUserSettings = [];
			if(aps.selectedOrgUser && aps.selectedOrgUser.typeFor == "Organization Default Settings") {
				selectedAppSettingsOriginal = _.findWhere(AllUsersSettings,{"id":aps.selectedAppSettings.id});
				aps.selectedAppSettingsCopy = angular.copy(selectedAppSettingsOriginal);
			} else if(aps.selectedOrgUser) {
				selectedAppSettingsOriginal = _.findWhere(AllUsersSettings,{"id":aps.selectedOrgUser.id});
				aps.selectedAppSettingsCopy = angular.copy(selectedAppSettingsOriginal);
			}
		}
		
		function hasShowPermission(key) {
			var status = false;
			if(!_.contains(hiddenColoms, key.toLowerCase()) && (aps.searchString.trim() == "" || key.toLowerCase().indexOf(aps.searchString.toLowerCase()) != -1)) {
				status = true;
			}
			return status;
		}
		
		function showAddSettingsForOrganizationBtn() {
			var status = false;
			if(aps.selectedAppSettings && aps.selectedAppSettings.type == 'System' && !aps.isAppSettingsEdited) {
				status = true;
			}
			return status;
		}
		
		function openAddAppSettingsModal(settings) {
			var modalInstance = $uibModal.open({
			      animation: true,
			      templateUrl: 'app/components/Admin/AppSettings/AddAppSettings/AddAppSettingsTemplate.html',
			      controller: 'AddAppSettingsController',
			      appendTo : $('body'),
			      controllerAs: 'aaps',
			      backdrop: 'static',
			      size: "lg",
			      windowClass: 'app-settings-modal-window',
			      backdropClass: "app-settings-modal-backdrop",
			      resolve: {
			    	  settings : function() {
			    		  return settings;
			    	  }
			      }
			});
			return modalInstance;
		}
		
		function addSettingsForOrganization() {
			var settings = {
	    			  settingsFor : "Organization",
	    			  appSettings : aps.selectedAppSettings,
	    			  existedOrgsList : aps.appSettingsList,
	    			  existedUsersList : []
	    		  };
			var modalInstance = openAddAppSettingsModal(settings);
			modalInstance.result.then(function (resp) {
				var newOrgSettings = resp.data.UserSettings;
				AllUsersSettings.push(newOrgSettings);
				aps.appSettingsList.push(newOrgSettings);
				aps.selectedAppSettings = newOrgSettings;
				getSelectedAppSettings();
				MessageService.showSuccessMessage("APP_SETTINGS_SAVED");
			}, function () {
				
			});
		}
		
		function showAddSettingsForUserBtn() {
			var status = false;
			if(aps.selectedAppSettings && aps.selectedAppSettings.type == 'Organization' && !aps.isAppSettingsEdited) {
				status = true;
			}
			return status;
		}
		
		function addSettingsForUser() {
			var settings = {
	    			  settingsFor : "User",
	    			  appSettings : aps.selectedAppSettings,
	    			  existedOrgsList : [],
	    			  existedUsersList : aps.selectedOrgUsersList
	    		  };
			var modalInstance = openAddAppSettingsModal(settings);
			modalInstance.result.then(function (resp) {
				var newOrgUser = resp.data.UserSettings;
				aps.selectedOrgUsersList.push(newOrgUser);
				AllUsersSettings.push(newOrgUser);
				aps.selectedOrgUser = newOrgUser;
				getSelectedUserAppSettings();
				MessageService.showSuccessMessage("APP_SETTINGS_SAVED");
			}, function () {
				
			});
		}

 		function editAppSettings() {
			aps.isAppSettingsEdited = true;
		}
		
		function saveAppSettings() {
			if(!disableSaveAppSettingsBtn()) {
				AppSettingsService.saveAppSettings(aps.selectedAppSettingsCopy).then(function(resp) {
					if(resp.status == 200 && resp.data.Status) {
						selectedAppSettingsOriginal = resp.data.UserSettings;
						aps.isAppSettingsEdited = false;
						MessageService.showSuccessMessage("APP_SETTINGS_SAVED");
					} else {
						MessageService.showErrorMessage("APP_SETTINGS_ERR",[resp.data.Message]);
					}
				});
			}
		}
		function deleteAppSettings() {
			var text = "";
			if(aps.selectedAppSettingsCopy.type == "Organization") {
				text = "Are you sure you want to DELETE AppSettings of '"+aps.selectedAppSettingsCopy.typeFor+"' Organization";
			}
			if(aps.selectedAppSettingsCopy.type == "User") {
				text = "Are you sure you want to DELETE AppSettings of '"+aps.selectedAppSettingsCopy.typeFor+"' User";
			}
			$confirm({text: text})
		        .then(function() {
		        	AppSettingsService.deleteAppSettings(aps.selectedAppSettingsCopy.id).then(function(resp) {
						if(resp.status == 200 && resp.data.Status) {
							AllUsersSettings = _.without(AllUsersSettings, _.findWhere(AllUsersSettings, {id: aps.selectedAppSettingsCopy.id}));
							if(aps.selectedAppSettingsCopy.type == "User") {
								getSelectedAppSettings();
							} else if(aps.selectedAppSettingsCopy.type == "Organization") {
								getAppSettingsList();
							}
							MessageService.showSuccessMessage("APP_SETTINGS_DELETED");
						} else {
							MessageService.showErrorMessage("APP_SETTINGS_ERR",[resp.data.Message]);
						}
					});
		        });
		}
		
		function cancelEditAppSettings() {
			aps.isAppSettingsEdited = false;
			aps.selectedAppSettingsCopy = angular.copy(selectedAppSettingsOriginal);
		}
		
		function getUserSettingsTypes(key){
			var selectedSetting = aps.userSettingsTypes[key];
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
			if(aps.userSettingsTypes[key].valuesType == "long") {
				if(isNaN(value)) {
					status = false;
				} else {
					status = Number.isInteger(parseInt(value));
				}
			} else if(aps.userSettingsTypes[key].valuesType == "email") {
				var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
				status = regex.test(value);
			} else {
				status = true;
			}
			
			if(status) {
				aps.userSettingsTypes[key].tooltip = value;
				aps.userSettingsTypes[key].error = false;
			} else {
				aps.userSettingsTypes[key].tooltip = "Please enter valid '"+aps.userSettingsTypes[key].valuesType+"' value.";
				aps.userSettingsTypes[key].error = true;
			}
			return status;
		}
		
		function disableSaveAppSettingsBtn() {
			var status = false;
			var userSettingValuesList = _.values(aps.userSettingsTypes);
			var userSettingErrorValueObj = _.findWhere(userSettingValuesList, {"error":true});
			if(userSettingErrorValueObj) {
				status = true;
			}
			return status;
		}
		
		function editSingleAppSetting(key) {
			if(!aps.editedUserSettings[key]){
				aps.editedUserSettings[key] = {};
			}
			aps.editedUserSettings[key]["editable"] = true;
		}
		
		function cancelEditSingleAppSetting(key) {
			if(!_.isEmpty(aps.editedUserSettings[key]) && aps.editedUserSettings[key].editable){
				aps.editedUserSettings[key].editable = false;
			}
		}
		
		function saveSingleAppSetting(key) {
			var appSettingInfo = {};
			appSettingInfo.orgId = aps.selectedAppSettings.organizationId;
			appSettingInfo.keyName = key;
			appSettingInfo.keyValue = aps.selectedAppSettingsCopy[key];
			appSettingInfo.updateAllOrgs = false;
			appSettingInfo.updateAllOrgUsers = false;
			
			if(aps.selectedAppSettings.type == "System" || (aps.selectedOrgUser && aps.selectedOrgUser.typeFor == "Organization Default Settings")) {
				var modalInstance = confirmUpdateOrgUserAppSettings(aps.selectedAppSettings.type);
				modalInstance.result.then(function (resp) {
					var updateAllOrgs = resp.updateAllOrgs;
					var updateAllOrgUsers = resp.updateAllOrgUsers;
					
					appSettingInfo.updateAllOrgs = updateAllOrgs;
					appSettingInfo.updateAllOrgUsers = updateAllOrgUsers;
					appSettingInfo.appSettingId = aps.selectedAppSettings.id;
					appSettingInfo.type = aps.selectedAppSettings.type;
					
					updateAppSettings (appSettingInfo, key);
				}, function () {
					
				});
			} else {
				appSettingInfo.appSettingId = aps.selectedOrgUser.id;
				appSettingInfo.type = aps.selectedOrgUser.type;
				
				updateAppSettings (appSettingInfo, key)
			}
		}
		
		function updateAppSettings (appSettingInfo, key){
			AppSettingsService.updateAppSettings(appSettingInfo).then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					selectedAppSettingsOriginal = resp.data.UserSettings;
					aps.isAppSettingsEdited = false;
					MessageService.showSuccessMessage("APP_SETTINGS_SAVED");
				} else {
					MessageService.showErrorMessage("APP_SETTINGS_ERR",[resp.data.Message]);
				}
			});
			
			cancelEditSingleAppSetting(key);
		}
		
		function confirmUpdateOrgUserAppSettings(appSettingType) {
	    	return $uibModal.open({
	    		animation: true,
	    		templateUrl: 'app/components/Admin/AppSettings/ConfirmUpdateOrgUserAppSettings/ConfirmUpdateOrgUserAppSettingsTemplate.html',
	    		controller: 'ConfirmUpdateOrgUserAppSettingsController',
	    		appendTo : $('.rootContainer'),
	    		backdrop: 'static',
	    		size: 'md',
	    		windowClass: 'uploadFileWindow',
	    		resolve: {
	    			appSettingInfo : function() {
			    		  return {"appSettingType":appSettingType};
			    	}
	    		}
		    });
	    }
		
		function getAppSettingsList() {
			aps.appSettingsList = [];
			_.each(AllUsersSettings,function(item){
				if(item.type && (item.type == "System" || item.type == "Organization" || item.type == "GuestUser")) {
					aps.appSettingsList.push(item);
				}
			});
			if(!_.isEmpty(aps.appSettingsList)) {
				aps.selectedAppSettings = aps.appSettingsList[0];
				getSelectedAppSettings();
			}
		}
		
		function getAppSettings() {
			AppSettingsService.getAppSettings().then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					AllUsersSettings = resp.data.AllUsersSettings;
					getAppSettingsList();
				}
			})['finally'](function() {
				
			});
		}
		getAppSettings();
	}	
	
})();