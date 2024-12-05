;(function(){
	'use strict';
	
	angular.module("vdvcPublicApp").controller('PublicNavigationController',PublicNavigationController);
	
	PublicNavigationController.$inject = ['$state','companyName','$uibModal'];
	
	function PublicNavigationController($state,companyName,$uibModal) {
			
			var vm = this;
			
			vm.Company = companyName;
			vm.currentState = $state.$current.name;
			vm.isCollapsed = true;
			vm.hasSession = false;
			
	}
})();