;(function(){
	
	'use strict';
	
	angular.module("vdvcApp").controller("StateNotFoundErrorController",StateNotFoundErrorController);
	
	StateNotFoundErrorController.$inject = ['$state','$scope','appData'];
	
	function StateNotFoundErrorController($state,$scope,appData){
		
		var se = this;
		var appdata = appData.getAppData();
		
		$scope.$emit("PageName",{"userName":appdata.UserName,"pageName":$state.current.pageName});
		
	}
})();