;(function(){
	
	'use strict';
	
	angular.module("vdvcApp").controller("GeneralErrorController",GeneralErrorController);
	
	GeneralErrorController.$inject = ['$state','$stateParams','$scope','appData'];
	
	function GeneralErrorController($state,$stateParams,$scope,appData){
		
		var ge = this;
		var appdata = appData.getAppData();
		ge.error = $stateParams.message ? $stateParams.message : "Something went wrong";
	}
})();