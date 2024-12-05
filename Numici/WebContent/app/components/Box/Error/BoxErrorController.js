;(function(){
	
	'use strict';
	
	angular.module("vdvcApp").controller("BoxErrorController",BoxErrorController);
	
	BoxErrorController.$inject = ['$state','$stateParams','$scope','appData','_'];
	
	function BoxErrorController($state,$stateParams,$scope,appData,_){
		var appdata = appData.getAppData();
		
		var self = this;
		$scope.$emit("PageName",{"userName":appdata.UserName,"pageName":$state.current.pageName});
		
		self.error = $stateParams.error ? decodeURIComponent($stateParams.error) : "Box user authorization failed";
		
	}
})();