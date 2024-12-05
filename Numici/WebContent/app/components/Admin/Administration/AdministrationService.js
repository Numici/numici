;(function(){
	'use strict';
	angular.module("vdvcApp").factory("AdministrationService",AdministrationService);
	
	AdministrationService.$inject = ['httpService','commonService'];
	
	function AdministrationService(httpService,commonService){
		var organizationHeaders = [
										{
											"key" : "name",
											"type" : "text",
											"label" : "Name",
											"show" : true,
											"order" : 1,
										},
										{
											"key" : "dbName",
											"type" : "text",
											"label" : "DB Name",
											"show" : true,
											"order" : 2,
										},
										{
	                               			"key" : "dbUser",
	                               			"type" : "text",
	                               			"label" : "DB User",
	                               			"show" : true,
	                               			"order" : 3,
	                               		},
	                               		{
											"key" : "creationDate",
											"type" : "date",
											"label" : "Created Date",
											"show" : true,
											"order" : 4,
										},
										{
	                              			"key" : "modifiedDate",
	                              			"type" : "date",
	                              			"label" : "Modified Date",
	                              			"show" : true,
	                              			"order" : 5,
	                              		}
		                          ];
		
		var userHeaders = [
									{
										"key" : "firstName",
										"type" : "text",
										"label" : "First Name",
										"class" : "col-xs-1",
										"show" : true,
										"order" : 1,
									},
									{
										"key" : "lastName",
										"type" : "text",
										"label" : "Last Name",
										"class" : "col-xs-1",
										"show" : true,
										"order" : 2,
									},
									{
                              			"key" : "loginId",
                              			"type" : "text",
                              			"label" : "Login Id",
                              			"class" : "col-xs-2",
                              			"show" : true,
                              			"order" : 3,
                              		},
                              		{
										"key" : "status",
										"type" : "text",
										"label" : "Status",
										"class" : "col-xs-1",
										"show" : true,
										"order" : 4,
									},
									{
										"key" : "role",
										"type" : "text",
										"label" : "Role",
										"class" : "col-xs-1",
										"show" : true,
										"order" : 5,
									},
                              		{
										"key" : "creationDate",
										"type" : "date",
										"label" : "Created Date",
										"class" : "col-xs-2",
										"show" : true,
										"order" : 6,
									},
									{
                              			"key" : "modifiedDate",
                              			"type" : "date",
                              			"label" : "Modified Date",
                              			"class" : "col-xs-2",
                              			"show" : true,
                              			"order" : 7,
                              		}
	                          ];
		
		var migrationUsersListHeaders = [
							{
                     			"key" : "userId",
                     			"type" : "text",
                     			"label" : "User Id",
                     			"class" : "col-xs-3",
                     			"show" : true,
                     			"order" : 1,
                     		},
							{
								"key" : "fromOrgName",
								"type" : "text",
								"label" : "From Org",
								"class" : "col-xs-2",
								"show" : true,
								"order" : 2,
							},
							{
								"key" : "toOrgName",
								"type" : "text",
								"label" : "To Org",
								"class" : "col-xs-2",
								"show" : true,
								"order" : 3,
							},
							{
								"key" : "exportFolder",
								"type" : "text",
								"label" : "Export Folder",
								"class" : "col-xs-2",
								"show" : true,
								"order" : 4,
							},							
                     		{
								"key" : "status",
								"type" : "text",
								"label" : "Status",
								"class" : "col-xs-1",
								"show" : true,
								"order" : 5,
							},
                     		{
								"key" : "createdOn",
								"type" : "date",
								"label" : "Created Date",
								"class" : "col-xs-2",
								"show" : true,
								"order" : 6,
							}
                     ];
		var migrateUserActivityListHeaders = [
									{
		                     			"key" : "activity",
		                     			"type" : "text",
		                     			"label" : "Activity",
		                     			"class" : "col-xs-3",
		                     			"show" : true,
		                     			"order" : 1,
		                     		},
									{
										"key" : "status",
										"type" : "text",
										"label" : "Status",
										"class" : "col-xs-3",
										"show" : true,
										"order" : 2,
									},
		                     		{
										"key" : "createdOn",
										"type" : "date",
										"label" : "Created Date",
										"class" : "col-xs-3",
										"show" : true,
										"order" : 3,
									},
									{
		                     			"key" : "updatedOn",
		                     			"type" : "date",
		                     			"label" : "Modified Date",
		                     			"class" : "col-xs-3",
		                     			"show" : true,
		                     			"order" : 4,
		                     		}
		                     ];
		
		var newOrganizationFields = [
	                               		{
	                               			"key" : "organizationDetails",
	                               			"label" : "Organization Details",
	                               			"show" : true,
	                               			"subFields" : [
																{
																	"key" : "name",
																	"type" : "text",
																	"label" : "Name",
																	"required" : true,
																	"show" : true,
																	"disable" : false,
																	"value" : ""
																},
																{
							                               			"key" : "address1",
							                               			"type" : "text",
							                               			"label" : "Address",
							                               			"required" : false,
							                               			"show" : true,
							                               			"disable" : false,
							                               			"value" : ""
							                               		},
							                               		{
																	"key" : "street",
																	"type" : "text",
																	"label" : "Street",
																	"required" : false,
																	"show" : true,
																	"disable" : false,
																	"value" : ""
																},
																{
							                               			"key" : "city",
							                               			"type" : "text",
							                               			"label" : "City",
							                               			"required" : false,
							                               			"show" : true,
							                               			"disable" : false,
							                               			"value" : ""
							                               		},
							                               		{
																	"key" : "state",
																	"type" : "text",
																	"label" : "State",
																	"required" : false,
																	"show" : true,
																	"disable" : false,
																	"value" : ""
																},
																{
							                               			"key" : "country",
							                               			"type" : "text",
							                               			"label" : "Country",
							                               			"required" : false,
							                               			"show" : true,
							                               			"disable" : false,
							                               			"value" : ""
							                               		},
																{
							                               			"key" : "sharedOrg",
							                               			"type" : "boolean",
							                               			"label" : "Shared Org",
							                               			"required" : false,
							                               			"show" : true,
							                               			"disable" : false,
							                               			"value" : false
							                               		},
							                               		{
							                               			"key" : "creationDate",
							                               			"type" : "date",
							                               			"label" : "Creation Date",
							                               			"required" : false,
							                               			"show" : false,
							                               			"disable" : true,
							                               			"value" : ""
							                               		},
							                               		{
							                               			"key" : "modifiedDate",
							                               			"type" : "date",
							                               			"label" : "Modified Date",
							                               			"required" : false,
							                               			"show" : false,
							                               			"disable" : true,
							                               			"value" : ""
							                               		}
	                               			              ]
	                               		},
	                               		{
	                               			"key" : "databaseDetails",
	                               			"label" : "Database Details",
	                               			"show" : true,
	                               			"subFields" : [
																{
																	"key" : "dbHost",
																	"type" : "text",
																	"label" : "DB Host",
																	"required" : true,
																	"show" : true,
																	"disable" : false,
																	"value" : ""
																},
																{
							                               			"key" : "dbPort",
							                               			"type" : "number",
							                               			"label" : "DB Port",
							                               			"required" : true,
							                               			"show" : true,
							                               			"disable" : false,
							                               			"value" : ""
							                               		},
							                               		{
																	"key" : "dbName",
																	"type" : "text",
																	"label" : "DB Name",
																	"required" : true,
																	"show" : true,
																	"disable" : false,
																	"value" : ""
																},
																{
							                               			"key" : "dbUser",
							                               			"type" : "text",
							                               			"label" : "DB User",
							                               			"required" : false,
							                               			"show" : true,
							                               			"disable" : false,
							                               			"value" : ""
							                               		},
							                               		{
																	"key" : "dbPassword",
																	"type" : "password",
																	"label" : "DB Password",
																	"required" : false,
																	"show" : true,
																	"disable" : false,
																	"value" : ""
																},
																{
							                               			"key" : "dbAdminUsr",
							                               			"type" : "text",
							                               			"label" : "DB Admin User",
							                               			"required" : false,
							                               			"show" : true,
							                               			"disable" : false,
							                               			"value" : ""
							                               		},
																{
							                               			"key" : "dbAdminPwd",
							                               			"type" : "password",
							                               			"label" : "DB Admin Password",
							                               			"required" : false,
							                               			"show" : true,
							                               			"disable" : false,
							                               			"value" : ""
							                               		}
	                               			              ]
	                               		},
	                               		{
	                               			"key" : "adminUserDetails",
	                               			"label" : "Admin User Details",
	                               			"show" : true,
	                               			"subFields" : [
																{
																	"key" : "loginId",
																	"type" : "text",
																	"label" : "Login Id",
																	"required" : true,
																	"show" : true,
																	"disable" : false,
																	"value" : ""
																},
																{
							                               			"key" : "firstName",
							                               			"type" : "text",
							                               			"label" : "First Name",
							                               			"required" : true,
							                               			"show" : true,
							                               			"disable" : false,
							                               			"value" : ""
							                               		},
							                               		{
																	"key" : "lastName",
																	"type" : "text",
																	"label" : "Last Name",
																	"required" : true,
																	"show" : true,
																	"disable" : false,
																	"value" : ""
																},
																{
																	"key" : "mobilePhone",
																	"type" : "text",
																	"label" : "Mobile Phone",
																	"required" : false,
																	"show" : true,
																	"disable" : false,
																	"value" : ""
																},
																{
							                               			"key" : "password",
							                               			"type" : "password",
							                               			"label" : "Password",
							                               			"required" : true,
							                               			"show" : true,
							                               			"disable" : false,
							                               			"value" : ""
							                               		},
							                               		{
																	"key" : "confirmPassword",
																	"type" : "password",
																	"label" : "Confirm Password",
																	"required" : true,
																	"show" : true,
																	"disable" : false,
																	"value" : ""
																}
	                               			              ]
	                               		}
	
                               		];
		var newUserFields = [
								{
									"key" : "loginId",
									"type" : "text",
									"label" : "Login Id",
									"required" : true,
									"show" : true,
									"disable" : false,
									"value" : ""
								},
								{
                           			"key" : "firstName",
                           			"type" : "text",
                           			"label" : "First Name",
                           			"required" : true,
                           			"show" : true,
                           			"disable" : false,
                           			"value" : ""
                           		},
                           		{
									"key" : "lastName",
									"type" : "text",
									"label" : "Last Name",
									"required" : true,
									"show" : true,
									"disable" : false,
									"value" : ""
								},
                           		{
									"key" : "role",
									"type" : "select",
									"label" : "Role",
									"required" : true,
									"show" : true,
									"disable" : false,
									"value" : ""
								},
                           		{
									"key" : "status",
									"type" : "select",
									"label" : "Status",
									"required" : true,
									"show" : true,
									"disable" : true,
									"value" : ""
								},
                           		{
									"key" : "mobilePhone",
									"type" : "text",
									"label" : "Mobile Phone",
									"required" : false,
									"show" : true,
									"disable" : false,
									"value" : ""
								},
                           		{
									"key" : "createdBy",
									"type" : "text",
									"label" : "Created By",
									"required" : false,
									"show" : true,
									"disable" : true,
									"value" : ""
								},
								{
                           			"key" : "password",
                           			"type" : "password",
                           			"label" : "Password",
                           			"required" : true,
                           			"show" : true,
                           			"disable" : false,
                           			"value" : ""
                           		},
                           		{
									"key" : "confirmPassword",
									"type" : "password",
									"label" : "Confirm Password",
									"required" : true,
									"show" : true,
									"disable" : false,
									"value" : ""
								},
								{
                           			"key" : "verified",
                           			"type" : "boolean",
                           			"label" : "Verified",
                           			"required" : false,
                           			"show" : false,
                           			"disable" : true,
                           			"value" : false
                           		},
								{
                           			"key" : "doNotShowHelpOnLogin",
                           			"type" : "boolean",
                           			"label" : "Don't Show Help On Login",
                           			"required" : false,
                           			"show" : false,
                           			"disable" : true,
                           			"value" : false
                           		},
								{
                           			"key" : "doNotShowTipsOnLogin",
                           			"type" : "boolean",
                           			"label" : "Don't Show Tips On Login",
                           			"required" : false,
                           			"show" : false,
                           			"disable" : true,
                           			"value" : false
                           		},
								{
                           			"key" : "termsAccepted",
                           			"type" : "boolean",
                           			"label" : "Terms Accepted",
                           			"required" : false,
                           			"show" : false,
                           			"disable" : true,
                           			"value" : false,
                           			"subField" : {
                           								
														"key" : "termsAcceptedDate",
														"type" : "date",
														"label" : "Terms Accepted Date",
														"required" : false,
														"show" : false,
														"disable" : true,
														"value" : ""
												  }
                           		},
								{
                           			"key" : "pwdChanged",
                           			"type" : "boolean",
                           			"label" : "Password Changed",
                           			"required" : false,
                           			"show" : false,
                           			"disable" : true,
                           			"value" : false,
                           			"subField" : {
           								
														"key" : "pwdChangedDate",
														"type" : "date",
														"label" : "Password Changed Date",
														"required" : false,
														"show" : false,
														"disable" : true,
														"value" : ""
												 }
                           		},
								{
                           			"key" : "passwordExpires",
                           			"type" : "boolean",
                           			"label" : "Password Expires",
                           			"required" : false,
                           			"show" : false,
                           			"disable" : true,
                           			"value" : false,
                           			"subField" : {
           												"key" : "passwordExpiryDate",
														"type" : "date",
														"label" : "Password Expiry Date",
														"required" : false,
														"show" : false,
														"disable" : true,
														"value" : ""
												 }
                           		},
                           		{
									"key" : "localPassword",
									"type" : "boolean",
									"label" : "Local Password",
									"required" : false,
									"show" : true,
									"disable" : true,
									"value" : ""
								},
                           		{
                           			"key" : "creationDate",
                           			"type" : "date",
                           			"label" : "Creation Date",
                           			"required" : false,
                           			"show" : false,
                           			"disable" : true,
                           			"value" : ""
                           		},
                           		{
                           			"key" : "modifiedDate",
                           			"type" : "date",
                           			"label" : "Modified Date",
                           			"required" : false,
                           			"show" : false,
                           			"disable" : true,
                           			"value" : ""
                           		}
   			              ];
		
		var getOrgUsersRole = {"key" : "OrgAdmin", "label" : "Organization Admins"};
		
		var userAuditTrailField = {
       			"key" : "userAuditTrials",
       			"type" : "table",
       			"label" : "User AuditTrials",
       			"show" : true,
       			"info" : ""
       		};
		var userAuditTrailHeaders = [
		                     			  {
			                             	  "label":"Created Date",
			                              	  "value":"createdDate",
			                              	  "DValue":"createdDate",
			                              	  "checked" : true,
			                              	  "type" : "Date",
			                              	  "class" : "col-md-2"
		                                  },{
		                                	  "label":"Request By",
		                                	  "value":"requestBy",
		                                	  "DValue":"requestBy",
		                                	  "checked" : true,
		                                	  "type" : "text",
		                                	  "class" : "col-md-2"
		                                  },{
		                                	  "label":"IpAddress",
		                                	  "value":"ipAddress",
		                                	  "DValue":"ipAddress",
		                                	  "checked" : true,
		                                	  "type" : "text",
		                                	  "class" : "col-md-2"
		                                  },{
		                                	  "label":"Info",
		                                	  "value":"info",
		                                	  "DValue":"info",
		                                	  "checked" : true,
		                                	  "type" : "text",
		                                	  "class" : "col-md-6"
		                                  }
		                                 ];
		var sessionsHeaders = [
		     							{
		                          			"key" : "userId",
		                          			"type" : "text",
		                          			"label" : "User Id",
		                          			"class" : "col-xs-3",
		                          			"show" : true,
		                          			"order" : 1,
		                          		},
		     							{
		     								"key" : "ip",
		     								"type" : "text",
		     								"label" : "IpAddress",
		     								"class" : "col-xs-2",
		     								"show" : true,
		     								"order" : 2,
		     							},
		                          		{
		                          			"key" : "id",
		                          			"type" : "text",
		                          			"label" : "Session Id",
		                          			"class" : "col-xs-3",
		                          			"show" : true,
		                          			"order" : 3,
		                          		},
		     							{
		     								"key" : "createdTime",
		     								"type" : "date",
		     								"label" : "Created Time",
		     								"class" : "col-xs-2",
		     								"show" : true,
		     								"order" : 4,
		     							},
		     							{
		     								"key" : "lastAccessed",
		     								"type" : "date",
		     								"label" : "Last Accessed",
		     								"class" : "col-xs-2",
		     								"show" : true,
		     								"order" : 5,
		     							}
		                          ];
		var maintenanceScheduleHeaders = [
												{
													"key" : "name",
													"type" : "text",
													"label" : "Name",
													"show" : true,
													"order" : 1,
												},
												{
													"key" : "scheduleStart",
													"type" : "date",
													"label" : "Schedule Start",
													"show" : true,
													"order" : 2,
												},
												{
			                               			"key" : "duration",
			                               			"type" : "text",
			                               			"label" : "Duration",
			                               			"show" : true,
			                               			"order" : 3,
			                               		},
			                               		{
													"key" : "firstReminder",
													"type" : "text",
													"label" : "Reminder",
													"show" : true,
													"order" : 4,
												},
												{
			                              			"key" : "followupReminderType",
			                              			"type" : "text",
			                              			"label" : "Follow Up Reminders",
			                              			"show" : true,
			                              			"order" : 5,
			                              		},
												{
			                              			"key" : "status",
			                              			"type" : "text",
			                              			"label" : "Status",
			                              			"show" : true,
			                              			"order" : 6,
			                              		}
		                                  ];
		var allowedUsersInScheduleMaintenance = ["VDVCSiteAdmin","VDVCAdmin"]
		var service = {
				organizationHeaders : organizationHeaders,
				userHeaders : userHeaders,
				newOrganizationFields : newOrganizationFields,
				newUserFields : newUserFields,
				guestUserRequst : null,
				migrationUsersListHeaders : migrationUsersListHeaders,
				migrateUserActivityListHeaders : migrateUserActivityListHeaders,
				getOrgUsersRole : getOrgUsersRole,
				userAuditTrailField : userAuditTrailField,
				userAuditTrailHeaders : userAuditTrailHeaders,
				sessionsHeaders : sessionsHeaders,
				maintenanceScheduleHeaders : maintenanceScheduleHeaders,
				getMenuItems : getMenuItems,
				getUserRoles : getUserRoles,
				getUserStatusList : getUserStatusList,
				getOrganizationsList : getOrganizationsList,
				saveOrganization : saveOrganization,
				deleteOrganization : deleteOrganization,
				getOrgUsersList : getOrgUsersList,
				getUsersList : getUsersList,
				saveUser : saveUser,
				deleteUser : deleteUser,
				convertGuestToProuser : convertGuestToProuser,
				getMigratedUsersList : getMigratedUsersList,
				getMigrateFromOrgList : getMigrateFromOrgList,
				getAllUserSessions : getAllUserSessions,
				getMigrateToOrgList : getMigrateToOrgList,
				migrateUser : migrateUser,
				muExportActivityLog : muExportActivityLog,
				muImportActivityLog : muImportActivityLog,
				allowedUsersInScheduleMaintenance : allowedUsersInScheduleMaintenance,
				isUserRoleAllowed : isUserRoleAllowed,
				getMaintenanceNtfMsg :getMaintenanceNtfMsg,
				getShutdownNtfMsg : getShutdownNtfMsg,
				getNewLogoutDurationMillis : getNewLogoutDurationMillis,
				getInitiatedShutdownNtfMsg : getInitiatedShutdownNtfMsg,
				createNewSchedule : createNewSchedule,
				getAllSchedules : getAllSchedules,
				getScheduleById :getScheduleById,
				getActiveSchedule : getActiveSchedule,
				getMaintenanceScheduleMode : getMaintenanceScheduleMode,
				updateSchedule : updateSchedule,
				initiateMaintenanceSchedule : initiateMaintenanceSchedule,
				cancelMaintenanceSchedule : cancelMaintenanceSchedule,
				completeMaintenanceSchedule : completeMaintenanceSchedule,
				deleteMaintenanceSchedule : deleteMaintenanceSchedule
		};
		
		return service;
		
		function getMenuItems(userRole) {
			var menuItems = [];
			var siteAdminMenuItems = [
			                          	{"key" : "organizations","label" : "Organizations","order" : 1,"disable" : false},
			                          	{"key" : "adminGroups","label" : "Admin Groups","order" : 3,"disable" : true},
						 			    {"key" : "roles","label" : "Roles","order" : 4,"disable" : true},
						 			    {"key" : "SAMLConfiguration","label" : "SAML Configuration","order" : 5,"disable" : true},
			                          	{"key" : "workflows","label" : "Workflows","order" : 6,"disable" : true},
			                          	{"key" : "migrateUsers","label" : "Migrate Users","order" : 7,"disable" : false},
						 			    /*{"key" : "CP","label" : "Company Presentations","order" : 8,"disable" : false},
			                          	{"key" : "TCI","label" : "Ticker Cik Info","order" : 9,"disable" : false},*/
						 			    {"key" : "sysPreferences","label" : "System Preferences","order" : 10,"disable" : false},
			                          	{"key" : "appSettings","label" : "App Settings","order" : 11,"disable" : false},
			                          	{"key" : "syncHelp","label" : "Sync Help","order" : 12,"disable" : false},
			                          	{"key" : "sessions","label" : "Sessions","order" : 13,"disable" : false},
			                          	{"key" : "maintenanceSchedule","label" : "Maintenance Schedule","order" : 14,"disable" : false}
			                         ];
			var OrgAdminMenuItems = [
						 			    {"key" : "users","label" : "Users","order" : 2,"disable" : false},
						 			];
			if(userRole == 'VDVCSiteAdmin' || userRole == 'VDVCAdmin') {
				menuItems = siteAdminMenuItems;
			} 
			if(userRole == 'VDVCSiteAdmin' || userRole == 'OrgAdmin') {
				menuItems = menuItems.concat(OrgAdminMenuItems);
			}
			return menuItems;
		}
		
		function getUserRoles(userRole) {
			var userRoles = [];
			if(userRole == 'VDVCSiteAdmin' || userRole == 'VDVCAdmin') {
				//userRoles = ["VDVCSiteAdmin", "VDVCAdmin", "OrgAdmin", "User", "Guest"];
				userRoles = ["VDVCSiteAdmin", "VDVCAdmin", "OrgAdmin", "User"];
			} else if(userRole == 'OrgAdmin') {
				//userRoles = userRoles.concat(["OrgAdmin", "User", "Guest"]);
				userRoles = userRoles.concat(["OrgAdmin", "User"]);
			}
			return userRoles;
		}
		
		function getUserStatusList() {
			var userStatusList = ["Active", "Inactive", "Locked", "PasswordExipred"];
			return userStatusList;
		}
		
		function getOrganizationsList() {
			return httpService.httpGet("user/getOrgList");
		}
		
		function saveOrganization(postdata) {
			return httpService.httpPost("user/saveOrg",postdata);
		}
		
		function deleteOrganization(postdata) {
			return httpService.httpDelete("user/deleteOrg", postdata);
		}
		
		function getOrgUsersList(postdata) {
			return httpService.httpPost("user/getOrgUser",postdata);
		}
		
		function getUsersList() {
			return httpService.httpGet("user/getOrgUserList");
		}
		
		function saveUser(postdata) {
			return httpService.httpPost("user/saveUser",postdata);
		}
		
		function deleteUser(postdata) {
			return httpService.httpDelete("user/deleteUsr",postdata);
		}
		
		function convertGuestToProuser(postdata) {
			return httpService.httpPost("user/guest2prouser",postdata);
		}
		
		function getMigrateFromOrgList() {
			return httpService.httpGet("user/getMigrateFromOrgList");
		}
		
		function getAllUserSessions() {
			return httpService.httpGet("user/getAllUserSessions");
		}
		
		function getMigrateToOrgList() {
			return httpService.httpGet("user/getMigrateToOrgList");
		}
		
		function getMigratedUsersList() {
			return httpService.httpGet("migrateUser/listMigrateUsers");
		}
		
		function migrateUser(postdata) {
			return httpService.httpPost("migrateUser/create",postdata);
		}
		
		function muExportActivityLog(migrateUserRecordId) {
			return httpService.httpGet("migrateUser/exportlog/"+migrateUserRecordId);
		}
		
		function muImportActivityLog(migrateUserRecordId) {
			return httpService.httpGet("migrateUser/importlog/"+migrateUserRecordId);
		}
		
		function isUserRoleAllowed(UserRole) {
			var status = false;
		    if(UserRole) {
		    	var allowedUserRoles = angular.copy(allowedUsersInScheduleMaintenance);
			    var upperCaseRoles = allowedUserRoles.map(function(value) {
			      return value.toUpperCase();
			    });
			    var pos = upperCaseRoles.indexOf(UserRole.toUpperCase());
			    if(pos !== -1) {
			    	status = true;
			    }
		    }
		    return status;
		}
		
		function getMaintenanceNtfMsg(maintenanceSchedule) {
			var scheduleMessage = maintenanceSchedule.notificationMessage;
			scheduleMessage = commonService.replaceAll(scheduleMessage, '\n', "<br>");
			var startDate = new Date(maintenanceSchedule.scheduleStart);
			scheduleMessage = commonService.replaceAll(scheduleMessage, '${start}', "<b>"+startDate.toString()+"</b>");
			scheduleMessage = commonService.replaceAll(scheduleMessage, '${duration}', "<b>"+maintenanceSchedule.duration+"mins</b>");
			var endTimeStamp = maintenanceSchedule.scheduleStart+(maintenanceSchedule.duration*60*1000);
			var endTime = new Date(endTimeStamp);
			scheduleMessage = commonService.replaceAll(scheduleMessage, '${end}', "<b>"+endTime.toString()+"</b>");
			return scheduleMessage;
		}
		
		function getShutdownNtfMsg(maintenanceSchedule) {
			var scheduleShutdownMessage = maintenanceSchedule.shutdownMessage;
			scheduleShutdownMessage = commonService.replaceAll(scheduleShutdownMessage, '\n', "<br>");
			var endTimeStamp = maintenanceSchedule.scheduleStart+(maintenanceSchedule.duration*60*1000);
			var endTime = new Date(endTimeStamp);
			scheduleShutdownMessage = commonService.replaceAll(scheduleShutdownMessage, '${end}', "<b>"+endTime.toString()+"</b>");
			return scheduleShutdownMessage;
		}
		
		function getNewLogoutDurationMillis(maintenanceSchedule) {
			var newLogoutDurationMillis = 0;
			var shutdownStartedAt = new Date(maintenanceSchedule.shutdownStartedAt);
			var shutdownStartedTime;
			if(shutdownStartedAt) {
				shutdownStartedTime = shutdownStartedAt.getTime();
			}
			var currentTime = new Date().getTime();
			var logoutDurationMillis = (maintenanceSchedule.shutdownDuration*60*1000);
			newLogoutDurationMillis = logoutDurationMillis - (currentTime - shutdownStartedTime);
			return newLogoutDurationMillis;
		}
		
		function getInitiatedShutdownNtfMsg(maintenanceSchedule,newLogoutDurationMillis) {
			var initiatedShutdownMessage = "Scheduled maintenance will start at ${start}.<br>Please save all your changes and logout.<br>You will be automatically logged out in ${countdown}<b> - <schedule-timer interval='1000' autostart='false' countdown="+(newLogoutDurationMillis/1000)+">{{hhours}}:{{mminutes}}:{{sseconds}}</schedule-timer></b>";
			var shutdownStartedAt = new Date(maintenanceSchedule.shutdownStartedAt+(maintenanceSchedule.shutdownDuration*60*1000));
			var startTimeHours = shutdownStartedAt.getHours();
			var startTimeMins = shutdownStartedAt.getMinutes();
			var startTime = startTimeHours +":"+ startTimeMins;
			initiatedShutdownMessage = commonService.replaceAll(initiatedShutdownMessage, '${start}', "<b>"+startTime+"</b>");
			initiatedShutdownMessage = commonService.replaceAll(initiatedShutdownMessage, '${countdown}', "<b>"+maintenanceSchedule.shutdownDuration+"mins</b>");
			return initiatedShutdownMessage;
		}
		
		function createNewSchedule(postdata) {
			return httpService.httpPost("maintenance/schedule/new",postdata);
		}
		
		function getAllSchedules() {
			return httpService.httpGet("maintenance/schedule/listall/");
		}
		
		function getScheduleById(id) {
			return httpService.httpGet("maintenance/schedule/"+id);
		}
		
		function getActiveSchedule() {
			return httpService.httpGet("maintenance/schedule/active");
		}
		
		function getMaintenanceScheduleMode() {
			return httpService.httpGet("maintenance/schedule/maintenancemode");
		}
		
		function updateSchedule(postdata) {
			return httpService.httpPost("maintenance/schedule/update",postdata);
		}
		
		function initiateMaintenanceSchedule() {
			return httpService.httpGet("maintenance/schedule/initshutdown");
		}
		
		function cancelMaintenanceSchedule(id) {
			return httpService.httpGet("maintenance/schedule/cancell/"+id);
		}
		
		function completeMaintenanceSchedule(id) {
			return httpService.httpGet("maintenance/schedule/complete/"+id);
		}
		
		function deleteMaintenanceSchedule(id) {
			return httpService.httpDelete("maintenance/schedule/"+id);
		}
	}
	
})();