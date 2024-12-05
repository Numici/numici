;(function(){
	
	angular.module("vdvcPublicApp").controller("PublicAppController",PublicAppController);
	
	PublicAppController.$inject = ['$scope','_','companyName','$state',
	                               '$timeout','LocalStorageService',
	                               '$confirm','Flash'];

	function PublicAppController($scope,_,companyName,$state,$timeout,
			LocalStorageService,$confirm,Flash) {
		var reloadTimeout;
		var context = "";
		$scope.PageTitle = companyName;
		$scope.companyName = companyName;
		
		$scope.getUserlabel = function(name) {
 			var lbl = "";
 			if(_.isString(name) && name.trim()) {
 				var matches = name.match(/\b(\w)/g);
 				lbl = matches.join('');
 			}
 			
 			return lbl.toUpperCase();
 		};
 		 		
 		$scope.$on('schedule-shutdown-flash', function (event,msg) {
 			Flash.create('warning', msg.scheduleShutdownMessage, msg.newLogoutDurationMillis+100,{
 				  class: 'schedule-shutdown-flash'});
 			var timer = $timeout(function() {
 				$scope.$broadcast('timer-start');
 	 			$timeout.cancel(timer);
	        }, 100);
			
			timer = $timeout(function() {
				$scope.$broadcast('timer-stop');
	 			$timeout.cancel(timer);
	        }, msg.newLogoutDurationMillis);
 		});
 		 		
 		$scope.onScheduleFlashClose = function(flash) {
 			//Do nothing
 		};
 		
		$scope.$on('PageName', function(event,obj) { 
			
			if(obj.pageName == "root") {
				context = obj.userName +" Home";
			} else {
				context = obj.pageName;
			}
			if(!_.isEmpty(obj.companyName)){
				if(obj.companyName== "Curated using Numici") {
					$scope.PageTitle = context;
				} else {
					$scope.PageTitle = context +" - "+obj.companyName;
				}
			} else {
				$scope.PageTitle = context +" - "+companyName;
			}
		});
	}
})();