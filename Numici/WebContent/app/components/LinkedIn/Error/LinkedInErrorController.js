;(function(){
	
	'use strict';
	
	angular.module("vdvcApp").controller("LinkedInErrorController",LinkedInErrorController);
	
	LinkedInErrorController.$inject = ['$state','$stateParams','$scope','appData','_'];
	
	function LinkedInErrorController($state,$stateParams,$scope,appData,_){
		var appdata = appData.getAppData();
		
		var self = this;
		$scope.$emit("PageName",{"userName":appdata.UserName,"pageName":$state.current.pageName});
		
		self.error = $stateParams.error ? decodeURIComponent($stateParams.error) : "LinkedIn user authorization failed";
		
	}
})();