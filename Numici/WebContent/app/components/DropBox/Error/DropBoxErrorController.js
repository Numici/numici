;(function(){
	
	'use strict';
	
	angular.module("vdvcApp").controller("DropBoxErrorController",DropBoxErrorController);
	
	DropBoxErrorController.$inject = ['$state','$stateParams','$scope','appData','_'];
	
	function DropBoxErrorController($state,$stateParams,$scope,appData,_){
		var appdata = appData.getAppData();
		
		var self = this;
		$scope.$emit("PageName",{"userName":appdata.UserName,"pageName":$state.current.pageName});
		
		self.error = $stateParams.error ? decodeURIComponent($stateParams.error) : "DropBox user authorization failed";
		
	}
})();