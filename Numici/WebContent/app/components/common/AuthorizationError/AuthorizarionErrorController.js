;(function(){
	
	'use strict';
	
	angular.module("vdvcApp").controller("AuthorizationErrorController",AuthorizationErrorController);
	
	AuthorizationErrorController.$inject = ['$state','$scope','appData','MessageService'];
	
	function AuthorizationErrorController($state,$scope,appData,MessageService){
		
		var ae = this;
		var appdata = appData.getAppData();
		
		$scope.$emit("PageName",{"userName":appdata.UserName,"pageName":$state.current.pageName});
		
	}
})();