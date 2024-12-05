;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('MigrateUsersListController',MigrateUsersListController);
	
	MigrateUsersListController.$inject = ['$state','$scope','appData','_','orderByFilter','AdministrationService','MessageService','$uibModal'];

	function MigrateUsersListController($state,$scope,appData,_,orderByFilter,AdministrationService,MessageService,$uibModal) {
		var mulc = this;
		var appdata = appData.getAppData();
		// Instance variables
		mulc.totalUsersCount = 0;
		mulc.searchString = "";
		mulc.migrationUsersListHeaders = angular.copy(AdministrationService.migrationUsersListHeaders);
		mulc.migrateUserActivityListHeaders = angular.copy(AdministrationService.migrateUserActivityListHeaders);
		mulc.migrateUserField = "createdOn";
		mulc.migrateUserFieldDecending = false;
		mulc.migratedUsersList = [];
		
		//Methods
		mulc.searchStringFilter = searchStringFilter;
		mulc.migrateUser = migrateUser;
		mulc.sortByField = sortByField;
		mulc.showMigrateActivityList = showMigrateActivityList;
		mulc.hasActivityList = hasActivityList;
		mulc.showMigrateUserAdditionalInfo = showMigrateUserAdditionalInfo;
		mulc.showMigrateUserActivityAdditionalInfo = showMigrateUserActivityAdditionalInfo;
		mulc.showMigrateUserActivityLog = showMigrateUserActivityLog;
		
		function searchStringFilter(migratedUser) {
			var status = false;
			for(var i=0;i<mulc.migrationUsersListHeaders.length;i++) {
				var migrationUsersListHeader = mulc.migrationUsersListHeaders[i];
				var fieldValue = migratedUser[migrationUsersListHeader.key];
				if(mulc.searchString.trim() == "" || (migrationUsersListHeader.key != "createdOn" && migrationUsersListHeader.key != "updatedOn" && fieldValue && fieldValue.toLowerCase().indexOf(mulc.searchString.toLowerCase()) != -1)) {
					status = true;
					break;
				}
			}
			return status;
		}
		
		function migrateUserModal() {
			var templateUrl = "app/components/Admin/Administration/MigrateUser/MigrateUserCreation/MigrateUserCreationTemplate.html";
			var windowClass = "migrate-user-modal-window";
			var backdropClass = "migrate-user-modal-backdrop";
			
			var modalInstance = $uibModal.open({
			      animation: true,
			      templateUrl: templateUrl,
			      controller: 'MigrateUserCreationController',
			      appendTo : $('body'),
			      controllerAs: 'mucc',
			      backdrop: 'static',
			      size: "md",
			      windowClass: windowClass, 
			      backdropClass: backdropClass,
			});
			return modalInstance;
		}
		
		function migrateUser() {
			var modalInstance = migrateUserModal();
			modalInstance.result.then(function (result) {
				MessageService.showSuccessMessage("BACKEND_SUC_MSG",[result.Message]);
				getMigratedUsersList();
			}, function () {
				
			});
		}
		
		function sortByField($event,hdr,sortFor,activitiesList) {
			if($event) {
				$event.stopPropagation();
			}
			if(sortFor === "migrateUser") {
				if(mulc.migrateUserField == hdr.key) {
	    			mulc.migrateUserFieldDecending = !mulc.migrateUserFieldDecending;
	    		} else {
	    			mulc.migrateUserFieldDecending = false;
	    		}
	    		mulc.migrateUserField =  hdr.key;
	    		mulc.migratedUsersList =  orderByFilter(mulc.migratedUsersList, mulc.migrateUserField, mulc.migrateUserFieldDecending);
			}
		}
		
		function showMigrateActivityList(migratedUser) {
			if(migratedUser.showActivityList) {
				migratedUser.showActivityList = false;
				migratedUser.selected = false;
			} else {
				migratedUser.showActivityList = true;
				migratedUser.selected = true;
			}
			_.each(mulc.migratedUsersList,function(usr){
				if(migratedUser.id != usr.id) {
					usr.showActivityList = false;
					usr.selected = false;
				}
			});
		}
		
		function hasActivityList(migratedUser) {
			var status = false;
			if(migratedUser.activitiesList && !_.isEmpty(migratedUser.activitiesList)) {
				status = true;
			}
			return status;
		}
		
		function showMigrateUserAdditionalInfo($event,additionalInfo,infoFor,elementValue) {
			if($event) {
				$event.stopPropagation();
			}
			var templateUrl = "app/components/Admin/Administration/MigrateUser/MigrateUserAdditionalInfo/MigrateUserAdditionalInfoTemplate.html";
			var windowClass = "migrate-user-additional-info-modal-window";
			var backdropClass = "migrate-user-additional-info-modal-backdrop";
			
			var modalInstance = $uibModal.open({
			      animation: true,
			      templateUrl: templateUrl,
			      controller: 'MigrateUserAdditionalInfoController',
			      appendTo : $('body'),
			      controllerAs: 'muaic',
			      backdrop: 'static',
			      size: "md",
			      windowClass: windowClass, 
			      backdropClass: backdropClass,
			      resolve: {
			    	  additionalInfo : function() {
			    		  var result = {info : "",infoFor : infoFor,elementValue : elementValue};
			    		  if(additionalInfo && !_.isEmpty(additionalInfo)) {
			    			  result.info = additionalInfo;
				  		  }
			    		  return result;
			    	  }
			      }
			});
		}
		
		function showMigrateUserActivityAdditionalInfo($event,additionalInfo,infoFor,elementValue) {
			showMigrateUserAdditionalInfo($event,additionalInfo,infoFor,elementValue);
		}
		
		function showMigrateUserActivityLogInfo(logInfo,infoFor) {
			var templateUrl = "app/components/Admin/Administration/MigrateUser/MigrateUserActivityLogInfo/MigrateUserActivityLogInfoTemplate.html";
			var windowClass = "migrate-user-activity-log-info-modal-window";
			var backdropClass = "migrate-user-activity-log-info-modal-backdrop";
			
			var modalInstance = $uibModal.open({
			      animation: true,
			      templateUrl: templateUrl,
			      controller: 'MigrateUserActivityLogInfoController',
			      appendTo : $('body'),
			      controllerAs: 'mualic',
			      backdrop: 'static',
			      size: "lg",
			      windowClass: windowClass, 
			      backdropClass: backdropClass,
			      resolve: {
			    	  logInfo : function() {
			    		  var result = {info : "",infoFor : infoFor};
			    		  if(logInfo && !_.isEmpty(logInfo)) {
			    			  result.info = logInfo;
				  		  }
			    		  return result;
			    	  }
			      }
			});
		}
		
		function getExportActivityLog(migrateUserRecordId,cb) {
			AdministrationService.muExportActivityLog(migrateUserRecordId).then(function(resp) {
				if(resp.status == 200 && resp.data) {
					if(typeof cb == "function") {
						cb(resp.data);
					}
				}
			});
		}
		
		function getImportActivityLog(migrateUserRecordId,cb) {
			AdministrationService.muImportActivityLog(migrateUserRecordId).then(function(resp) {
				if(resp.status == 200 && resp.data) {
					if(typeof cb == "function") {
						cb(resp.data);
					}
				}
			});
		}
		
		function showMigrateUserActivityLog($event,activity,migrateUserRecordId) {
			if($event) {
				$event.stopPropagation();
			}
			switch(activity) {
				case "Export":
					getExportActivityLog(migrateUserRecordId,function(activityLogInfo) {
						showMigrateUserActivityLogInfo(activityLogInfo,activity);
					});
				break;
				case "Import":
					getImportActivityLog(migrateUserRecordId,function(activityLogInfo) {
						showMigrateUserActivityLogInfo(activityLogInfo,activity);
					});
				break;
			}
		}
		
		function getMigratedUsersList() {
			AdministrationService.getMigratedUsersList().then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					mulc.migratedUsersList = resp.data.Data;
					mulc.migratedUsersList =  orderByFilter(mulc.migratedUsersList, mulc.migrateUserField, mulc.migrateUserFieldDecending);
					_.each(mulc.migratedUsersList,function(usr){
						usr.showActivityList = false;
					});
					mulc.totalUsersCount = mulc.migratedUsersList.length;
				}
			});
		}
				
		function init() {
			if(appdata.UserRole == 'VDVCSiteAdmin') {
				getMigratedUsersList();
			}
		}
		
		init();
	}	
	
})();