;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('MaintenanceScheduleController',MaintenanceScheduleController);
	
	MaintenanceScheduleController.$inject = ['$state','$scope','appData','_',
	          '$confirm','$compile','AdministrationService','MessageService',
	          '$uibModal'];

	function MaintenanceScheduleController($state,$scope,appData,_,$confirm,
			$compile,AdministrationService,MessageService,$uibModal) {
		var msc = this;
		var appdata = appData.getAppData();
		
		msc.searchString = "";
		msc.maintenanceScheduleHeaders = AdministrationService.maintenanceScheduleHeaders;
		msc.maintenanceSchedulesList = [];
		
		//Methods
		msc.disableCreateNewSchedule = disableCreateNewSchedule;
		msc.getFollowupReminders = getFollowupReminders;
		msc.searchStringFilter = searchStringFilter;
		msc.createMaintenanceSchedule = createMaintenanceSchedule;
		msc.viewMaintenanceSchedule = viewMaintenanceSchedule;
		msc.editMaintenanceSchedule = editMaintenanceSchedule;
		msc.disableInitiate = disableInitiate;
		msc.initiateMaintenanceSchedule = initiateMaintenanceSchedule;
		msc.cancelMaintenanceSchedule = cancelMaintenanceSchedule;
		msc.completeMaintenanceSchedule = completeMaintenanceSchedule;
		msc.deleteMaintenanceSchedule = deleteMaintenanceSchedule;
		
		function disableCreateNewSchedule() {
			var status = false;
			var plannedSchedule = _.findWhere(msc.maintenanceSchedulesList,{"status" : "Planned"});
			var startedSchedule = _.findWhere(msc.maintenanceSchedulesList,{"status" : "Started"});
			if(!_.isEmpty(plannedSchedule) || !_.isEmpty(startedSchedule)) {
				status = true;
			}
			return status;
		}
		
		function getFollowupReminders(maintenanceSchedule) {
			if(maintenanceSchedule.followupReminderType == "list") {
				var reminderList = "";
				_.each(maintenanceSchedule.reminderList,function(reminder,index){
					reminderList = reminderList+reminder+"Mins";
					if(index < maintenanceSchedule.reminderList.length-1) {
						reminderList = reminderList+","
					}
				});
				return reminderList;
			} else if(maintenanceSchedule.followupReminderType == "interval") {
				return maintenanceSchedule.reminderInterval+"Mins";
			}
		}
		function searchStringFilter(maintenanceSchedule) {
			var status = false;
			for(var i=0;i<msc.maintenanceScheduleHeaders.length;i++) {
				var maintenanceScheduleHeader = msc.maintenanceScheduleHeaders[i];
				var fieldValue = maintenanceSchedule[maintenanceScheduleHeader.key];
				if(maintenanceScheduleHeader.key == "duration" && maintenanceScheduleHeader.key == "firstReminder") {
					fieldValue = fieldValue.toString();
				}
				if(msc.searchString.trim() == "" || (maintenanceScheduleHeader.key != "scheduleStart" && fieldValue && fieldValue.toLowerCase().indexOf(msc.searchString.toLowerCase()) != -1)) {
					status = true;
					break;
				}
			}
			return status;
		}
		
		function getMaintenanceSchedulesList() {
			AdministrationService.getAllSchedules().then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					msc.maintenanceSchedulesList = resp.data.Schedules;
				}
			});
		}
				
		function maintenanceScheduleModal(maintenanceSchedule,mode) {
			var modalInstance = $uibModal.open({
			      animation: true,
			      templateUrl: 'app/components/Admin/Administration/MaintenanceSchedule/AddMaintenanceSchedule/AddMaintenanceScheduleTemplate.html',
			      controller: 'AddMaintenanceScheduleController',
			      appendTo : $('body'),
			      controllerAs: 'amsc',
			      backdrop: 'static',
			      size: "lg",
			      windowClass: 'maintenance-schedule-modal-window',
			      backdropClass: "maintenance-schedule-modal-backdrop",
			      resolve: {
			    	  MaintenanceSchedule : function() {
			    		  return maintenanceSchedule;
			    	  },
			    	  openModal : {"mode" : mode}
			      }
			});
			return modalInstance;
		}
		
		function createMaintenanceSchedule() {
			var modalInstance = maintenanceScheduleModal(null,"new");
			modalInstance.result.then(function (maintenanceSchedule) {
				MessageService.showSuccessMessage("MAINTENANCE_SCHEDULE_CREATED",[maintenanceSchedule.name]);
				getMaintenanceSchedulesList();
			}, function () {
				
			});
		}
		
		function viewMaintenanceSchedule(maintenanceSchedule) {
			var modalInstance = maintenanceScheduleModal(maintenanceSchedule,"view");
			modalInstance.result.then(function (result) {
				
			}, function () {
				
			});
		}
		
		function editMaintenanceSchedule(maintenanceSchedule) {
			var modalInstance = maintenanceScheduleModal(maintenanceSchedule,"edit");
			modalInstance.result.then(function (result) {
				MessageService.showSuccessMessage("MAINTENANCE_SCHEDULE_UPDATED",[maintenanceSchedule.name]);
				getMaintenanceSchedulesList();
			}, function () {
				
			});
		}
		
		function disableInitiate(maintenanceSchedule) {
			var status = false;
			var currentTime = new Date().getTime();
			var scheduleStartTime = maintenanceSchedule.scheduleStart;
			if(maintenanceSchedule.status == 'Started' || currentTime < scheduleStartTime) {
				status = true;
			}
			return status;
		}
		function initiateMaintenanceSchedule(maintenanceSchedule) {
			var text = "Are you sure you want to INITIATE '"+maintenanceSchedule.name+"' Maintenance Schedule";
			$confirm({text: text})
		        .then(function() {
		        	AdministrationService.initiateMaintenanceSchedule(maintenanceSchedule.id).then(function(resp) {
						if(resp.status == 200 && resp.data.Status) {
							MessageService.showSuccessMessage("MAINTENANCE_SCHEDULE_INITIATED",[maintenanceSchedule.name]);
							getMaintenanceSchedulesList();
						} else {
							MessageService.showErrorMessage("ADMINISTRATION_ERR",[resp.data.Message]);
						}
					});
		        });
		}
		
		function cancelMaintenanceSchedule(maintenanceSchedule) {
			var text = "Are you sure you want to CANCEL '"+maintenanceSchedule.name+"' Maintenance Schedule";
			$confirm({text: text})
		        .then(function() {
		        	AdministrationService.cancelMaintenanceSchedule(maintenanceSchedule.id).then(function(resp) {
						if(resp.status == 200 && resp.data.Status) {
							MessageService.showSuccessMessage("MAINTENANCE_SCHEDULE_CANCELED",[maintenanceSchedule.name]);
							getMaintenanceSchedulesList();
						} else {
							MessageService.showErrorMessage("ADMINISTRATION_ERR",[resp.data.Message]);
						}
					});
		        });
		}
		
		function completeMaintenanceSchedule(maintenanceSchedule) {
			var text = "Are you sure you want to COMPLETE '"+maintenanceSchedule.name+"' Maintenance Schedule";
			$confirm({text: text})
		        .then(function() {
		        	AdministrationService.completeMaintenanceSchedule(maintenanceSchedule.id).then(function(resp) {
						if(resp.status == 200 && resp.data.Status) {
							MessageService.showSuccessMessage("MAINTENANCE_SCHEDULE_COMPLETED",[maintenanceSchedule.name]);
							getMaintenanceSchedulesList();
						} else {
							MessageService.showErrorMessage("ADMINISTRATION_ERR",[resp.data.Message]);
						}
					});
		        });
		}
		
		function deleteMaintenanceSchedule(maintenanceSchedule) {
			var text = "Are you sure you want to DELETE '"+maintenanceSchedule.name+"' Maintenance Schedule";
			$confirm({text: text})
		        .then(function() {
		        	AdministrationService.deleteMaintenanceSchedule(maintenanceSchedule.id).then(function(resp) {
						if(resp.status == 200 && resp.data.Status) {
							MessageService.showSuccessMessage("MAINTENANCE_SCHEDULE_DELETED",[maintenanceSchedule.name]);
							getMaintenanceSchedulesList();
						} else {
							MessageService.showErrorMessage("ADMINISTRATION_ERR",[resp.data.Message]);
						}
					});
		        });
		}
		
		function init() {
			if(appdata.UserRole == 'VDVCSiteAdmin' || appdata.UserRole == 'VDVCAdmin') {
				getMaintenanceSchedulesList();
			}
		}
		
		init();
	}	
	
})();