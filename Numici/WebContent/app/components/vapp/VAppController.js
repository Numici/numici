;(function() {
	'use strict';

	angular.module("vdvcApp").controller("VAppController",VAppController);
	VAppController.$inject = ['$scope','VAppFactory','$state','appData'];
	function VAppController($scope,vAppFactory,$state,appData){
		var appdata = appData.getAppData();
		$scope.$emit("PageName",{"userName":appdata.UserName,"pageName":$state.current.pageName});
		$scope.status;
	    $scope.vapps;
	    $scope.vappId;
	    getVApps();

	    function getVApps() {
	    	vAppFactory.getVApps()
	            .success(function (result) {
	            	if(result.Status){
	            		 $scope.vapps = result.Vapps;
	    			}else{
	    				$scope.status = models.Message;
	    			}
	               
	            })
	            .error(function (error) {
	                $scope.status = 'Unable to load Models : ' + error.message;
	            });
	    }
	    
	    
	    $scope.setAppId = function(id) {
	    	$scope.vappId = id;
	    };
	    
	}
})();
