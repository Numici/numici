;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('OrganizationsController',OrganizationsController);
	
	OrganizationsController.$inject = ['$state','$scope','appData','_','$confirm','$compile','AdministrationService','MessageService','$uibModal'];

	function OrganizationsController($state,$scope,appData,_,$confirm,$compile,AdministrationService,MessageService,$uibModal) {
		var oc = this;
		var appdata = appData.getAppData();
		
		oc.searchString = "";
		oc.organizationHeaders = AdministrationService.organizationHeaders;
		oc.organizationsList = [];
		oc.selectedOrgnization = {};				
		//Methods
		oc.searchStringFilter = searchStringFilter;
		oc.createOrganization = createOrganization;
		oc.viewOrganization = viewOrganization;
		oc.editOrganization = editOrganization;
		oc.deleteOrganization = deleteOrganization;
		
		function searchStringFilter(organization) {
			var status = false;
			for(var i=0;i<oc.organizationHeaders.length;i++) {
				var organizationHeader = oc.organizationHeaders[i];
				var fieldValue = organization[organizationHeader.key];
				if(oc.searchString.trim() == "" || (organizationHeader.key != "creationDate" && organizationHeader.key != "modifiedDate" && fieldValue && fieldValue.toLowerCase().indexOf(oc.searchString.toLowerCase()) != -1)) {
					status = true;
					break;
				}
			}
			return status;
		}
		
		function getOrganizationsList() {
			AdministrationService.getOrganizationsList().then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					oc.organizationsList = resp.data.Organization;
				}
			});
		}
				
		function organizationModal(organization,mode) {
			var modalInstance = $uibModal.open({
			      animation: true,
			      templateUrl: 'app/components/Admin/Administration/Organizations/AddOrganizations/AddOrganizationTemplate.html',
			      controller: 'AddOrganizationController',
			      appendTo : $('body'),
			      controllerAs: 'aoc',
			      backdrop: 'static',
			      size: "lg",
			      windowClass: 'organization-modal-window',
			      backdropClass: "organization-modal-backdrop",
			      resolve: {
			    	  organization : function() {
			    		  return organization;
			    	  },
			    	  openModal : {"mode" : mode}
			      }
			});
			return modalInstance;
		}
		
		function createOrganization() {
			var modalInstance = organizationModal(null,"new");
			modalInstance.result.then(function (organization) {
				MessageService.showSuccessMessage("ORGANIZATION_CREATED",[organization.name]);
				getOrganizationsList();
			}, function () {
				
			});
		}
		
		function viewOrganization(organization) {
			var modalInstance = organizationModal(organization,"view");
			modalInstance.result.then(function (result) {
				
			}, function () {
				
			});
		}
		
		function editOrganization(organization) {
			var modalInstance = organizationModal(organization,"edit");
			modalInstance.result.then(function (result) {
				MessageService.showSuccessMessage("ORGANIZATION_UPDATED",[organization.name]);
				getOrganizationsList();
			}, function () {
				
			});
		}
		
		function deleteOrganization(organization) {
			var text = "Are you sure you want to DELETE '"+organization.name+"' Organization";
			$confirm({text: text})
		        .then(function() {
		        	AdministrationService.deleteOrganization(organization.id).then(function(resp) {
						if(resp.status == 200 && resp.data.Status) {
							MessageService.showSuccessMessage("ORGANIZATION_DELETED",[organization.name]);
							getOrganizationsList();
						} else {
							MessageService.showErrorMessage("ADMINISTRATION_ERR",[resp.data.Message]);
						}
					});
		        });
		}
		
		function init() {
			if(appdata.UserRole == 'VDVCSiteAdmin' || appdata.UserRole == 'VDVCAdmin') {
				getOrganizationsList();
			}
		}
		
		init();
	}	
	
})();