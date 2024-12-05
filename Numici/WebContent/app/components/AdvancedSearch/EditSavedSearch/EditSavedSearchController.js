;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('EditSavedSearchController',EditSavedSearchController);
	EditSavedSearchController.$inject = ['$scope', '$uibModalInstance','savedSearch','AdvSearchService','_'];

	function EditSavedSearchController($scope, $uibModalInstance,savedSearch,AdvSearchService,_) {
		var vm = this;
		
		vm.savedSearch = angular.copy(savedSearch);
		vm.savedSearchGroup = vm.savedSearch.group ? [vm.savedSearch.group] : [];
		vm.allGroups = [];
		
		vm.OnchangeNotify = OnchangeNotify;
		vm.ok = ok;
		vm.cancel = cancel;
		  
		function getAllGroups() {
			AdvSearchService.getAllSearchGroups().then(function(resp) {
				
				if(resp.status == 200 && resp.data.Status) {
					vm.allGroups = resp.data.Groups;
				}
			});
		}
		
		function OnchangeNotify() {
			vm.savedSearch.notify = !vm.savedSearch.notify;
		}
		
		function ok() {
			
			var postdata = {};
			postdata.id = vm.savedSearch.id;
			postdata.name = vm.savedSearch.name;
			postdata.isNotify = vm.savedSearch.notify;
			if(!_.isEmpty(vm.savedSearchGroup)) {
				postdata.group = vm.savedSearchGroup[0];
			}
			
			postdata.systemSearch = vm.savedSearch.system.toString();
			
			AdvSearchService.updateSavedSearch(postdata).then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					savedSearch.name = resp.data.Search.name;
					savedSearch.group = resp.data.Search.group;
					savedSearch.notify = resp.data.Search.notify;
					savedSearch.system = resp.data.Search.system;
					$uibModalInstance.close(resp.data.Search);
				}
			});
			
		}
		
		function cancel() {
		    $uibModalInstance.dismiss('cancel');
		}
		
		getAllGroups();
	}
})();
