;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('AsanaSettingsController',AsanaSettingsController);
	
	AsanaSettingsController.$inject = ['_','$scope','appData','AsanaService','config','$confirm','orderByFilter','$uibModal','MessageService','userService'];

	function AsanaSettingsController(_,$scope,appData,AsanaService,config,$confirm,orderByFilter,$uibModal,MessageService,userService) {
		var self = this;
		
		self.projects;
		self.config = config;
		self.settingsHeaders = AsanaService.settingsHeaders;
		self.revokeAuthPerms = revokeAuthPerms;
		self.sortByField = sortByField;
		self.disconnect = disconnect;
		self.connect = connect;
		
		self.projectConfigField = "name";
		self.projectConfigFieldDecending = false;
				
		function init() {
			AsanaService.listProjects().then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					var data = resp.data;
					if(AsanaService.checkAuthStatus(data)) {
						var porjects = orderByFilter(data.AsanaProjects, self.projectConfigField, self.projectConfigFieldDecending);
						self.projects =  setTaskspaceInfo(porjects);
					} else {
						AsanaService.autherize();
					}
	    		}
			});
		}
		
		function setTaskspaceInfo(porjects) {
			if(!_.isEmpty(porjects) && !_.isEmpty(self.config) && !_.isEmpty(self.config.taskspaces)) {
				_.each(porjects,function(project,index) {
					var ts = _.findWhere(self.config.taskspaces,{"asanaProjectId" : project.id});
					if(ts) {
						project.taskspace = ts;
					} else {
						project.taskspace = null;
					}
				});
			}
			
			return porjects;
		}
		
		function revokeAuthPerms() {
			var txt = 'Are you sure you want to revoke Asana Config ?';
			$confirm({text: txt})
	        .then(function() {
	        	AsanaService.revokeAuthPerms().then(function(resp) {
					if(resp.status == 200 && resp.data.Status) {
						var data = resp.data;
						if(AsanaService.checkAuthStatus(data)) {
							userService.goToHomePage();
						}
		    		}
				});
	        });
		}
		
		
		
		function sortByField (hdr) {
			if(self.projectConfigField == hdr.value) {
				self.projectConfigFieldDecending =  !self.projectConfigFieldDecending;
    		} else {
    			self.projectConfigFieldDecending = false;
    		}
			self.projectConfigField =  hdr.value;
    	    self.projects =  orderByFilter(self.projects, hdr.value, self.projectConfigFieldDecending);
    	}
		
		function disconnect(project) {
			if(!_.isEmpty(project.taskspace)) {
				var txt = 'Are you sure you want to disconnect Taskspace "'+project.taskspace.taskspaceName+'" from Asana project "'+project.name+'" ?';
				$confirm({text: txt})
		        .then(function() {
		        	AsanaService.unMapProject({"asanaProjectId": project.id}).then(function(resp) {
		        		if(resp.status == 200 && resp.data.Status) {
							var data = resp.data;
							if(AsanaService.checkAuthStatus(data)) {
								var prj = _.findWhere(self.projects, { id: project.id });
								if(prj) {
									prj.taskspace = null;
								}
								MessageService.showSuccessMessage("ASANA_DISCONNECT_TS",[project.name]);
							}
		        		}
					});
		        });
			}
		}
		
		
		function connect(project) {
			var modalInstance = $uibModal.open({
			      animation: true,
			      templateUrl: 'app/components/TaskSpace/AddToTaskSpace/addToTaskSpace.html',
			      controller: 'AddToTaskSpaceController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'vm',
			      backdrop: 'static',
			      size: "lg",
			      resolve: {
			    	  selectedChannelInfo : {},
			    	  slackChannelConfigs :{},
			    	  item : {},
			    	  moveObjectInfo : {},
			    	  addObjectsFromDocsInfo : {},
			    	  asanaconfig : function() {
			    		  return {
			    			  "taskspaces" : self.config,
			    			  "project" : project
			    		  };
			    	  }
			      }
			});
			modalInstance.result.then(function (taskspace) {
				configureWithTS(project,taskspace);
			}, function () {
				
			});
		}
		
		
		function configureWithTS(project,taskspace) {
			var postdata = {
					taskspaceClientId: taskspace.clientId,
					taskspaceId: taskspace.id, 
					asanaProjectId: project.id
			};
			AsanaService.mapTaskspace(postdata).then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					var data = resp.data;
					if(AsanaService.checkAuthStatus(data)) {
						var prj = _.findWhere(self.projects, { id: project.id });
						if(prj) {
							var ts = {
									clientId : taskspace.clientId,
									taskspaceId: taskspace.id,
									taskspaceName: taskspace.name,
									asanaProjectId: prj.id,
									asanaProjectName: prj.name		
							};
							
							prj.taskspace = ts;
						}
					} else {
						AsanaService.autherize();
					}
					MessageService.showSuccessMessage("ASANA_CONNECTS_TS",[project.name,taskspace.name]);
				}
			});
		}
		
		init();
	}	
	
})();