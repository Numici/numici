
;(function(){
	'use strict';
	
	angular.module("vdvcApp").controller('AddSlackController',AddSlackController);
	
	AddSlackController.$inject = ['$scope','$rootScope','$state','$stateParams','_','MessageService',"$timeout",'SlackService','$window','appData','LocalStorageService'];
	
	function AddSlackController($scope,$rootScope,$state,$stateParams,_,MessageService,$timeout,SlackService,$window,appData,LocalStorageService) {
		var asc = this;
		asc.addSlack = addSlack;
		function addSlack() {
			SlackService.installUrl().then(function(resp) {
				if(resp.data.Status) {
					$window.location.href = resp.data.Data;
				}
			});
		}
		
		function init() {
			LocalStorageService.removeLocalStorage(LocalStorageService.SLACK_AUTH);
		}
		
		init();
		
	}
})();

