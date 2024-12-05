
;(function(){
	'use strict';
	
	angular.module("vdvcApp").controller('SlackConfigController',SlackConfigController);
	
	SlackConfigController.$inject = ['$scope','$rootScope','$state','$stateParams','$window',
	                                 'orderByFilter','$confirm','_','MessageService',
	                                 "$timeout",'SlackService','SlackConfig','appData',
	                                 'userService','$uibModal','LocalStorageService'];
	
	function SlackConfigController($scope,$rootScope,$state,$stateParams,$window,
			orderByFilter,$confirm,_,MessageService,$timeout,SlackService,SlackConfig,
			appData,userService,$uibModal,LocalStorageService) {
		var scc = this;
		
		var appdata = appData.getAppData();
		var restrictedUrls = ["manageslack"];
		var PreViousState = {
				"name": "taskspace.list",
				"params": {}
		};
		
		scc.channelConfigField = userService.getUiState("channelconfigsort").stateValue ? userService.getUiState("channelconfigsort").stateValue.field : "channelName";
		scc.channelConfigFieldDecending = userService.getUiState("channelconfigsort").stateValue ? userService.getUiState("channelconfigsort").stateValue.decending : false;
		
		scc.config;
		scc.dmConfigView;
		scc.editedDmConfig = {};
		scc.channelConfigHeaders = SlackService.channelConfigHeaders;
		scc.tsConfigView;
		scc.slackChannelConfigs;
		scc.editedTsConfig = {};
		scc.onDmConfigChanged = onDmConfigChanged;
		scc.disableDmConfigSave = true;
		scc.saveDmConfig = saveDmConfig;
		
		scc.teamId = $stateParams.team;
		var slackUserId = $stateParams.user;
		
		scc.tsConfigObj = {};
		scc.showDirectMessageSettings = false;
		
		scc.showUserName = showUserName;
		scc.toggleDirectMessageSettings = toggleDirectMessageSettings;
		scc.sortByField = sortByField;
		scc.openConfiguredWithTSModal = openConfiguredWithTSModal;
		scc.hasEditPermOnTs = hasEditPermOnTs;
		scc.editTsConfig = editTsConfig;
		scc.deleteSlackTSConfig = deleteSlackTSConfig;
		scc.viewTsConfig = viewTsConfig;
		scc.disableTsConfigEditBtn = disableTsConfigEditBtn;
		scc.disableTsConfigShowBtn = disableTsConfigShowBtn;
		scc.disableTsConfigSaveBtn = disableTsConfigSaveBtn;
		scc.cncelSaveTsConfig = cncelSaveTsConfig;
		scc.saveTsConfig = saveTsConfig;
		scc.manageSlackWorkspaces = manageSlackWorkspaces;
		
		$scope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
			if(!_.contains(restrictedUrls,from.name)) {
				PreViousState = {
						"name": (from.name && !_.isEmpty(from.name)) ? from.name : "docs",
						"params": fromParams
				};
			}
		});
		
		function showUserName() {
			return !_.isEmpty(scc.config.slackUserDisplayName) ? scc.config.slackUserDisplayName : scc.config.slackUserName;
		}
		
		function setConfigureStatus() {
			_.each(scc.slackChannelConfigs,function(slackChannelConfig){
				if(!_.isEmpty(slackChannelConfig.taskspaceId)) {
					slackChannelConfig.isConfiguredWithTS = true;
				} else {
					slackChannelConfig.isConfiguredWithTS = false;
				}
			});
		}
		
		function sortByField (hdr) {
			if(scc.channelConfigField == hdr.value) {
				scc.channelConfigFieldDecending =  !scc.channelConfigFieldDecending;
    		} else {
    			scc.channelConfigFieldDecending = false;
    		}
			scc.channelConfigField =  hdr.value;
    	    scc.slackChannelConfigs =  orderByFilter(scc.slackChannelConfigs, hdr.value, scc.channelConfigFieldDecending);
    	    userService.setUiState("channelconfigsort",{field:hdr.value,decending:scc.channelConfigFieldDecending});
    	}
	    
		function configureWithTS(slackConfig,taskspace) {
			SlackService.configureSlackWithTS(scc.teamId,slackConfig).then(function(resp) {
				if(resp.data.Status && resp.data.Data) {
					var newConfiguredTS = resp.data.Data;
					newConfiguredTS["taskspaceName"] = taskspace.name;
					newConfiguredTS["taskspaceOwner"] = taskspace.owner;
					_.extend(_.findWhere(scc.config.taskspaces, { channelId: slackConfig.channelId }), newConfiguredTS);
					scc.slackChannelConfigs = angular.copy(scc.config.taskspaces);
					scc.slackChannelConfigs =  orderByFilter(scc.slackChannelConfigs, scc.channelConfigField, scc.channelConfigFieldDecending);
					setConfigureStatus();
					MessageService.showSuccessMessage("SLACK_CONNECTS_TS",[slackConfig.channelName,taskspace.name]);
				}
			});
		}
		
		function openConfiguredWithTSModal(slackConfig) {
			var modalInstance = $uibModal.open({
			      animation: true,
			      templateUrl: 'app/components/TaskSpace/AddToTaskSpace/addToTaskSpace.html',
			      controller: 'AddToTaskSpaceController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'vm',
			      backdrop: 'static',
			      size: "lg",
			      resolve: {
			    	  selectedChannelInfo : function() {
			    		  return slackConfig;
			    	  },
			    	  slackChannelConfigs : function() {
			    		  return scc.slackChannelConfigs;
			    	  },
			    	  item : {},
			    	  moveObjectInfo : {},
			    	  addObjectsFromDocsInfo : {},
			    	  asanaconfig : {}
			      }
			});
			modalInstance.result.then(function (result) {
				slackConfig["taskspaceId"] = result.selectedTaskspace.id;
				slackConfig["clientId"] = result.selectedTaskspace.clientId;
				slackConfig["autoPostAnns"] = result.autoPostAnns;
				delete slackConfig["isConfiguredWithTS"];
				configureWithTS(slackConfig,result.selectedTaskspace);
			}, function () {
				
			});
		}
		
		function toggleDirectMessageSettings() {
			scc.showDirectMessageSettings = !scc.showDirectMessageSettings;
		}
		
		function setConfig(resp) {
			if(resp.data.Status) {
				if(resp.data.HasSlackAuth) {
					scc.config = resp.data.Data;
					if(!_.isEmpty(scc.config.dmConfig)) {
						scc.dmConfigView = SlackService.getDmConfigView(scc.config.dmConfig);
						scc.editedDmConfig = angular.copy(scc.config.dmConfig);
					}
					if(!_.isEmpty(scc.config.taskspaces)) {
						scc.slackChannelConfigs = angular.copy(scc.config.taskspaces);
						scc.slackChannelConfigs = orderByFilter(scc.slackChannelConfigs, scc.channelConfigField, scc.channelConfigFieldDecending);
						setConfigureStatus();
						scc.tsConfigView = SlackService.getTsConfigView();
					}
				} else {
					$window.location.href = resp.data.Data;
				}
			}
		}
		
		
		function switchUserModal (message) {
			var modalInstance = $uibModal.open({
			      animation: true,
			      templateUrl: 'app/components/Slack/SwitchUser/switchUser.html',
			      controller: 'SwitchUserModalController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'vm',
			      backdrop: 'static',
			      resolve: {
			    	  message : function() {
			    		  return message;
			    	  }
			      }
			});
			modalInstance.result.then(function () {
				$rootScope.$broadcast("LogOut",true);
			}, function () {
				userService.goToHomePage();
			});
		};
		
		function onDmConfigChanged(){
			scc.disableDmConfigSave = true;
			var currentDmConfig = angular.copy(scc.config.dmConfig);
			delete currentDmConfig["$$hashKey"];
			delete scc.editedDmConfig["$$hashKey"];
			if(!angular.equals(currentDmConfig,scc.editedDmConfig)) {
				scc.disableDmConfigSave = false;
			}
		}
		
		function saveDmConfig() {
			SlackService.saveSlackDMConfig(scc.teamId,scc.config.dmConfig).then(function(resp) {
				if(resp.data.Status) {
					scc.disableDmConfigSave = true;
					scc.config.dmConfig = resp.data.Data;
					scc.editedDmConfig = angular.copy(scc.config.dmConfig);
					scc.dmConfigView = SlackService.getDmConfigView(scc.config.dmConfig);
					MessageService.showSuccessMessage("SLACK_SETTINGS_SAVE",["Direct Message"]);
				}
			});
		}
		
		function hasEditPermOnTs(tsconfig) {
			var status = false;
			if(scc.config.userId && tsconfig.taskspaceOwner && scc.config.userId.toLowerCase() == tsconfig.taskspaceOwner.toLowerCase()) {
				status = true;
			}
			return status;
		}
				
		function editTsConfig(tsconfig) {
			if(tsconfig.autoPostAnns == null) {
				tsconfig.autoPostAnns = true;
			}
			scc.tsConfigObj[tsconfig.channelId] = true;
			scc.editedTsConfig = angular.copy(tsconfig);
		}
		
		function deleteSlackTSConfig(tsconfig) {
			var txt = 'Are you sure you want to disconnect Taskspace "'+tsconfig.taskspaceName+'" from Team "'+scc.config.teamName+'" ?';
			$confirm({text: txt})
	        .then(function() {
	        	SlackService.deleteSlackTSConfig(scc.teamId,tsconfig.taskspaceId,tsconfig.channelId).then(function(resp) {
					if(resp.data.Status) {
						scc.config.taskspaces = _.reject(scc.config.taskspaces, function(taskspace){ 
			    			return taskspace.channelId === tsconfig.channelId; 
			    		});
						var deletedConfiguredTaskspace = {channelId : tsconfig.channelId,channelName : tsconfig.channelName,channelType : tsconfig.channelType};
						scc.config.taskspaces.push(deletedConfiguredTaskspace);
						scc.slackChannelConfigs = angular.copy(scc.config.taskspaces);
						scc.slackChannelConfigs =  orderByFilter(scc.slackChannelConfigs, scc.channelConfigField, scc.channelConfigFieldDecending);
						setConfigureStatus();
						MessageService.showSuccessMessage("SLACK_SETTINGS_DELETE",[tsconfig.taskspaceName,scc.config.teamName]);
					}
				});
	        });
		}
		
		function viewTsConfig(tsconfig) {
			if(tsconfig.autoPostAnns == null) {
				tsconfig.autoPostAnns = true;
			}
			scc.tsConfigObj[tsconfig.channelId] = true;
			scc.editedTsConfig = angular.copy(tsconfig);
		}
		
		function disableTsConfigEditBtn() {
			var status = false;
			if(!_.isEmpty(scc.editedTsConfig)) {
				status = true;
			}
			return status;
		}
		
		function disableTsConfigShowBtn() {
			var status = false;
			if(!_.isEmpty(scc.editedTsConfig)) {
				status = true;
			}
			return status;
		}
		
		function disableTsConfigSaveBtn(tsconfig) {
			var currentTsConfig = angular.copy(tsconfig);
			delete currentTsConfig["$$hashKey"];
			delete currentTsConfig["isConfiguredWithTS"];
			delete scc.editedTsConfig["$$hashKey"];
			delete scc.editedTsConfig["isConfiguredWithTS"];
			var status = false;
			if(angular.equals(currentTsConfig,scc.editedTsConfig)) {
				status = true;
			}
			return status;
		}
		
		function cncelSaveTsConfig(tsconfig) {
			scc.editedTsConfig = {};
			scc.tsConfigObj[tsconfig.channelId] = false;
			var tsOrgconfig = _.findWhere(scc.config.taskspaces,{taskspaceId : tsconfig.taskspaceId});
			if(tsOrgconfig) {
				_.extend(_.findWhere(scc.slackChannelConfigs, { channelId: tsconfig.channelId }), tsOrgconfig);
			}
		}
		
		function saveTsConfig(tsconfig) {
			var changedTsConfig = angular.copy(tsconfig);
			delete changedTsConfig["isConfiguredWithTS"];
			SlackService.saveSlackTSConfig(scc.teamId,changedTsConfig).then(function(resp) {
				if(resp.data.Status && resp.data.Data) {
					_.extend(_.findWhere(scc.config.taskspaces, { channelId: tsconfig.channelId }), resp.data.Data);
					scc.slackChannelConfigs = angular.copy(scc.config.taskspaces);
					scc.slackChannelConfigs = orderByFilter(scc.slackChannelConfigs, scc.channelConfigField, scc.channelConfigFieldDecending);
					setConfigureStatus();
					MessageService.showSuccessMessage("SLACK_SETTINGS_SAVE",["Taskspace related events to the Channel"]);
					scc.editedTsConfig = changedTsConfig;
					//scc.tsConfigObj[tsconfig.channelId] = false;
				}
			});
		}
		
		function manageSlackWorkspaces() {
			var stateInfo = LocalStorageService.getSessionStorage(LocalStorageService.STATE_INFO);
			if(!_.isEmpty(stateInfo)) {
				LocalStorageService.removeSessionStorage(LocalStorageService.STATE_INFO);
				stateInfo = JSON.parse(stateInfo);
				$state.go(stateInfo.previousState,stateInfo.previousStateParams);
			} else if (PreViousState && 
					(PreViousState.name === "login" || 
							PreViousState.name === "welcome" || 
							PreViousState.name === "slacksignincb")) {
				userService.goToHomePage();
			} else {
				$state.go(PreViousState.name,PreViousState.params);
			}
		}
		
		function openConnectToTSModal() {
			var modalInstance = $uibModal.open({
			      animation: true,
			      templateUrl: 'app/components/Slack/Settings/ConnectToTS/ConnectToTS.html',
			      controller: 'ConnectToTSController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'ctc',
			      backdrop: 'static',
			      size: "md",
			      resolve: {
			    	  SlackInfo : function() {
			    		  return {teamId : scc.teamId,slackChannelsConfigInfo : scc.slackChannelConfigs};
			    	  }
			      }
			});
			modalInstance.result.then(function (slackChannelConfigs) {
				_.each(slackChannelConfigs,function(slackChannelConfig){
					if(slackChannelConfig.isConnected) {
						delete slackChannelConfig["isConnected"];
						_.extend(_.findWhere(scc.config.taskspaces, { channelId: slackChannelConfig.tsConfig.channelId }), slackChannelConfig.tsConfig);
					}
				});
				scc.slackChannelConfigs = angular.copy(scc.config.taskspaces);
				scc.slackChannelConfigs =  orderByFilter(scc.slackChannelConfigs, scc.channelConfigField, scc.channelConfigFieldDecending);
				setConfigureStatus();
				scc.tsConfigView = SlackService.getTsConfigView();
				$state.go("manageslack",{"team": $stateParams.team,"user": $stateParams.user,"newUser":null},{reload:false});
			}, function () {
				$state.go("manageslack",{"team": $stateParams.team,"user": $stateParams.user,"newUser":null},{reload:false});
			});
		}
		
		function init() {
			if(!_.isEmpty(appdata["UserId"]) && !_.isEmpty(slackUserId)) {
				if(appdata["UserId"].toLowerCase() === slackUserId.toLowerCase()) {
					setConfig(SlackConfig);
					if(!_.isEmpty($stateParams.taskspace)) {
						if(!_.isEmpty(scc.slackChannelConfigs)) {
							editTsConfig(_.findWhere(scc.slackChannelConfigs, { taskspaceId: $stateParams.taskspace }));
						} else {
							editTsConfig({taskspaceId : $stateParams.taskspace});
						}
						var scrollTimer = $timeout(function () {
							$rootScope.$broadcast($stateParams.taskspace,true);
							$timeout.cancel(scrollTimer);
						},0);
					}
					/*var configuredSlackChannelConfig = _.findWhere(scc.slackChannelConfigs, {isConfiguredWithTS : true});
					if(_.isEmpty(configuredSlackChannelConfig)) {
						openConnectToTSModal();
					}*/
					if($stateParams.newUser && $stateParams.newUser === "YES") {
						openConnectToTSModal();
					}
				} else {
					var message = "You are logged in as a different user ("+appdata['UserId']+"), In order to manage the Slack preferences, please login as "+slackUserId;
					switchUserModal(message);
				}
			}
		}
		
		init();
	}
})();

