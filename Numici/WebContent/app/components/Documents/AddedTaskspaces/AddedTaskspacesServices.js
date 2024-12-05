;(function(){
	angular.module("vdvcApp").factory('AddedTaskspacesService',AddedTaskspacesService);
	
	AddedTaskspacesService.$inject = ["$http","httpService","_","$uibModal"];
	
	function AddedTaskspacesService($http,httpService,_,$uibModal) {
		var AddedTaskspacesModalInstance;
		var TaskSpaceListHeaders = [
				  	                  {
				  	                	  "label":"TASKSPACE NAME",
				  	                	  "value":"name",
				  	                	  "checked" : true,
				  		                  "type" : "text",
				  		                  "class" : "col-md-4"
				  	                  },{
				  	                	  "label":"TASKSPACE OWNER",
				  	                	  "value":"tsOwner",
				  	                	  "checked" : false,
				  	                	  "type" : "text",
				  	                	  "class" : "col-md-2"
				  	                  }
				  	               ];
		
		var service = {
				TaskSpaceListHeaders : TaskSpaceListHeaders,
				open : open,
				close : close
		}
		
		return service;
		
		function open(data) {
			var resolveData = {};
			var windowClass = "";
			if(!_.isEmpty(data)) {
				resolveData = {"SelectedDoc" : data.SelectedDoc, "AddedTaskspaces" : data.AddedTaskspaces};
				if(!_.isEmpty(data.windowClass)) {
					windowClass = data.windowClass;
				}
			}
			AddedTaskspacesModalInstance = $uibModal.open({
				  animation: true,
			      templateUrl: 'app/components/Documents/AddedTaskspaces/AddedTaskspaces.html',
			      controller: 'AddedTaskspacesController',
			      windowClass: windowClass,
			      appendTo : $('.rootContainer'),
			      controllerAs: 'atc',
			      backdrop: 'static',
			      resolve: {
			    	  resolveData : resolveData
			      }
			});
			return AddedTaskspacesModalInstance;
		}
		
		function close() {
			if(AddedTaskspacesModalInstance) {
				AddedTaskspacesModalInstance.dismiss();
			}
		}
	}
})();
	