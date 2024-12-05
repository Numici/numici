;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('AddMaintenanceScheduleController',AddMaintenanceScheduleController);
	
	AddMaintenanceScheduleController.$inject = ['$scope','MaintenanceSchedule',
	                                            'openModal','$compile','_',
	                                            'AdministrationService','$uibModalInstance',
	                                            'MessageService','$timeout','defautlDateFormat'];

	function AddMaintenanceScheduleController($scope,MaintenanceSchedule,
			openModal,$compile,_,AdministrationService,$uibModalInstance,
			MessageService,$timeout,defautlDateFormat) {
		var amsc = this;
		
		var maintenanceScheduleInfo = angular.copy(MaintenanceSchedule);
		
		amsc.isInViewMode = false;
		amsc.isInEditMode = false;
		amsc.mSchedule = {
				Name : "",
				startDate : null,
				startTime : null,
				Duration : 10,
				FirstReminder : {
					ReminderDays : 0,
					ReminderHours : 0,
					ReminderMins : 0
				},
				FollowUpReminder : "",
				FollowUpReminders : [{
						ReminderDays : 0,
						ReminderHours : 0,
						ReminderMins : 0
					}],
				FollowUpReminderInterval : 0,
				NotificationMessage : "Numici will be shutdown for maintenance from ${start} to ${end} (for a duration of ${duration})",
				ShutdownMessage : "Numici maintenance is in progress, it will be completed by ${end} \n \n You will not be able to login / access application during this period.",
				ShutdownDuration : 5
		};
		amsc.showErrorMessage = false;
		amsc.errorMessage = "";
		
		amsc.dateOptions = {
			"startingDay": 1,
			"minDate":	new Date(),
	    	"start" : new Date(),
	    	"end" : null,
		};

		amsc.StartDt = {
				opened: false
		};
				  
		amsc.startDtOpen = function($event) {
			amsc.StartDt.opened = true;
	    };
		
	    amsc.mSchedule.startTime = null;
	    amsc.hstep = 1;
	    amsc.mstep = 1;
	    amsc.ismeridian = true;
	    
	    amsc.getPDTScheduleStartDate = getPDTScheduleStartDate;
	    amsc.disableAddFollowupReminder = disableAddFollowupReminder;
	    amsc.addFollowUpReminder = addFollowUpReminder;
	    amsc.removeFollowUpReminder = removeFollowUpReminder;
		amsc.validateScheduleFields = validateScheduleFields;
		amsc.ok = ok;
		amsc.cancel = cancel;
				
		function getStartDateTime() {
			var startDateTime = null;
			var dateFormat = "YYYY-MM-DD";
			if(amsc.mSchedule.startDate && amsc.mSchedule.startTime) {
				var startDate = moment(amsc.mSchedule.startDate).format(dateFormat);
				var startTime = amsc.mSchedule.startTime.toLocaleTimeString();
				var startDateTimeString = startDate +" "+ startTime;
				startDateTime = new Date(startDateTimeString);
			}
			return startDateTime;
		}
		
		function getPDTScheduleStartDate() {
			var pdtStartDateTime = null;
			var startDateTime = getStartDateTime();
			var dateFormat = "YYYY-MM-DD";
			if(startDateTime) {
				var localTime = startDateTime.getTime();
				var localOffset = startDateTime.getTimezoneOffset() * 60000;
				var utc = localTime + localOffset;
				var target_offset = -7;//PST from UTC 7 hours behind right now, will need to fix for daylight
				var los_angles = utc+(3600000*target_offset);
				var nd = new Date(los_angles);
				pdtStartDateTime = nd.toLocaleString();
				var startDate = moment(nd).format(dateFormat);
				var startTime = nd.toLocaleTimeString();
				pdtStartDateTime = startDate +" "+ startTime;
			}
			return pdtStartDateTime;
		}
		
		function disableAddFollowupReminder() {
			var status = false;
			var reminderList = [];
			_.each(amsc.mSchedule.FollowUpReminders,function(FollowUpReminder){
				var reminder = getReminderValue(FollowUpReminder);
				if(reminder > 0) {
					reminderList.push(reminder);
				}
			});
			if(reminderList.length < amsc.mSchedule.FollowUpReminders.length) {
				status = true;
			}
			return status;
		}
		
		//var followupReminderRowCount = 1;
		function addFollowUpReminder() {
			if(!disableAddFollowupReminder()) {
				amsc.errorMessage = "";
				amsc.showErrorMessage = false;
				var followupReminder = {
						ReminderDays : 0,
						ReminderHours : 0,
						ReminderMins : 0
				};
				amsc.mSchedule.FollowUpReminders.push(followupReminder);
			} else {
				amsc.errorMessage = "Please fill the all follow up reminders.";
				amsc.showErrorMessage = true;
			}
			/*var divElement = angular.element(document.querySelector('#followupReminderList'));
			var template = followupReminderTemplate;
			var appendHtml = $compile(template)($scope);
		    divElement.append(appendHtml);
			followupReminderRowCount++;*/
		}
		
		function removeFollowUpReminder(index) {
			amsc.mSchedule.FollowUpReminders.splice(index, 1);
			if(!disableAddFollowupReminder()) {
				amsc.errorMessage = "";
				amsc.showErrorMessage = false;
			} else {
				amsc.errorMessage = "Please fill the all follow up reminders.";
				amsc.showErrorMessage = true;
			}
		}
		
		function validateScheduleFields() {
			var status = false;
			var firstReminder = getReminderValue(amsc.mSchedule.FirstReminder);
			if(_.isEmpty(amsc.mSchedule.Name) 
					|| (amsc.mSchedule.startDate == null)
					|| (amsc.mSchedule.startTime == null)
					|| (amsc.mSchedule.Duration < 10)
					|| (firstReminder <= 0) 
					|| _.isEmpty(amsc.mSchedule.NotificationMessage) 
					|| _.isEmpty(amsc.mSchedule.ShutdownMessage)
					|| (amsc.mSchedule.ShutdownDuration <= 0)) {
				status = true;
			}
			return status;
		}
		
		function getReminderValue(reminderObj) {
			var reminderValue = 0;
			reminderValue = reminderObj.ReminderDays*24*60+reminderObj.ReminderHours*60+reminderObj.ReminderMins;
			return reminderValue;
		}
		
		function prepareNewSchedulePostdata() {
			if(!validateScheduleFields()) {
				var postdata = {};
				postdata["name"] = amsc.mSchedule.Name;
				
				if(amsc.mSchedule.startDate && amsc.mSchedule.startTime) {
					var startDateTime = getStartDateTime();
					postdata["scheduleStart"] = startDateTime;
				}
				postdata["duration"] = amsc.mSchedule.Duration;
				var firstReminder = getReminderValue(amsc.mSchedule.FirstReminder);
				postdata["firstReminder"] = firstReminder;
				postdata["followupReminderType"] = amsc.mSchedule.FollowUpReminder;
				if(amsc.mSchedule.FollowUpReminder == "list") {
					var reminderList = [];
					_.each(amsc.mSchedule.FollowUpReminders,function(FollowUpReminder){
						var reminder = getReminderValue(FollowUpReminder);
						reminderList.push(reminder);
					});
					postdata["reminderList"] = reminderList;
				}
				if(amsc.mSchedule.FollowUpReminder == "interval") {
					postdata["reminderInterval"] = amsc.mSchedule.FollowUpReminderInterval;
				}
				postdata["notificationMessage"] = amsc.mSchedule.NotificationMessage;
				postdata["shutdownMessage"] = amsc.mSchedule.ShutdownMessage;
				postdata["shutdownDuration"] = amsc.mSchedule.ShutdownDuration;
				return postdata;
			} else {
				amsc.errorMessage = "Please fill all the required fields.";
				amsc.showErrorMessage = true;
				return false;
			}
		}
		
		function ok() {
			var postdata = prepareNewSchedulePostdata();
			if(amsc.isInEditMode && !_.isEmpty(maintenanceScheduleInfo.id)) {
				postdata["id"] = maintenanceScheduleInfo.id;
			}
			if(openModal.mode == "edit") {
				AdministrationService.updateSchedule(postdata).then(function(resp) {
					if(resp.status == 200 && resp.data.Status) {
						$uibModalInstance.close(resp.data.Schedule);
					} else {
						MessageService.showErrorMessage("ADMINISTRATION_ERR",[resp.data.Message]);
					}
				});
			} else {
				AdministrationService.createNewSchedule(postdata).then(function(resp) {
					if(resp.status == 200 && resp.data.Status) {
						$uibModalInstance.close(resp.data.Schedule);
					} else {
						MessageService.showErrorMessage("ADMINISTRATION_ERR",[resp.data.Message]);
					}
				});
			}
		}
		
		function cancel() {
			$uibModalInstance.dismiss('cancel');
		}
		
		function processMaintenanceScheduleInfo() {
			amsc.mSchedule.Name = maintenanceScheduleInfo.name;
			amsc.mSchedule.startDate = new Date(maintenanceScheduleInfo.scheduleStart);
			amsc.mSchedule.startTime = new Date(maintenanceScheduleInfo.scheduleStart);
			amsc.mSchedule.Duration = maintenanceScheduleInfo.duration;
			if(maintenanceScheduleInfo.firstReminder > 0) {
				if(maintenanceScheduleInfo.firstReminder < 60) {
					amsc.mSchedule.FirstReminder.ReminderMins = maintenanceScheduleInfo.firstReminder;
				} else if(maintenanceScheduleInfo.firstReminder >= 60) {
					amsc.mSchedule.FirstReminder.ReminderMins = maintenanceScheduleInfo.firstReminder%60;
					var reminderHours = (maintenanceScheduleInfo.firstReminder - amsc.mSchedule.FirstReminder.ReminderMins)/60;
					if(reminderHours < 24) {
						amsc.mSchedule.FirstReminder.ReminderHours = reminderHours;
					} else if(reminderHours >= 24) {
						amsc.mSchedule.FirstReminder.ReminderHours = reminderHours%24;
						amsc.mSchedule.FirstReminder.ReminderDays = (reminderHours - amsc.mSchedule.FirstReminder.ReminderHours)/24;
					}
				}
			}
			amsc.mSchedule.FollowUpReminder = maintenanceScheduleInfo.followupReminderType;
			if(amsc.mSchedule.FollowUpReminder == "list") {
				amsc.mSchedule.FollowUpReminders = [];
				for(var i=0; i< maintenanceScheduleInfo.reminderList.length; i++) {
					var reminderObj = {ReminderDays: 0, ReminderHours: 0, ReminderMins: 0};
					var reminder = maintenanceScheduleInfo.reminderList[i];
					if(reminder > 0) {
						if(reminder < 60) {
							reminderObj.ReminderMins = reminder;
						} else if(reminder >= 60) {
							reminderObj.ReminderMins = reminder%60;
							var reminderHours = (reminder - reminderObj.ReminderMins)/60;
							if(reminderHours < 24) {
								reminderObj.ReminderHours = reminderHours;
							} else if(reminderHours >= 24) {
								reminderObj.ReminderHours = reminderHours%24;
								reminderObj.ReminderDays = (reminderHours - reminderObj.ReminderHours)/24;
							}
						}
						amsc.mSchedule.FollowUpReminders.push(reminderObj);
					}
				}
			} else if(amsc.mSchedule.FollowUpReminder == "interval") {
				amsc.mSchedule.FollowUpReminderInterval = angular.copy(maintenanceScheduleInfo.reminderInterval);
			}
			amsc.mSchedule.NotificationMessage = maintenanceScheduleInfo.notificationMessage;
			amsc.mSchedule.ShutdownMessage = maintenanceScheduleInfo.shutdownMessage;
			amsc.mSchedule.ShutdownDuration = maintenanceScheduleInfo.shutdownDuration;
		}
		
		function init() {
			if(openModal.mode != "edit" && openModal.mode != "view") {
				var startTime = new Date();
				//startTime = moment(startTime).format("YYYY-MM-DD HH:MM");
				startTime = startTime.getFullYear()  + "-" + (startTime.getMonth()+1) + "-" + startTime.getDate() + " " +
				startTime.getHours() + ":" + startTime.getMinutes();
				amsc.mSchedule.startTime = new Date(startTime);
			}
			if(!_.isEmpty(maintenanceScheduleInfo) && openModal.mode == "edit") {
				amsc.isInEditMode = true;
				processMaintenanceScheduleInfo();
			} else if(!_.isEmpty(maintenanceScheduleInfo) && openModal.mode == "view") {
				amsc.isInViewMode = true;
				processMaintenanceScheduleInfo();
			}
		}
		init();
	}	
	
})();