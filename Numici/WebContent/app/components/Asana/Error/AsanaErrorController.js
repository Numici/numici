;(function(){
	
	'use strict';
	
	angular.module("vdvcApp").controller("AsanaErrorController",AsanaErrorController);
	
	AsanaErrorController.$inject = ['$state','$stateParams','$scope','appData','_'];
	
	function AsanaErrorController($state,$stateParams,$scope,appData,_){
		var appdata = appData.getAppData();
		
		var self = this;
		$scope.$emit("PageName",{"userName":appdata.UserName,"pageName":$state.current.pageName});
		
		self.error = $stateParams.error ? decodeURIComponent($stateParams.error) : "Asana user authorization failed";
		
	}
})();