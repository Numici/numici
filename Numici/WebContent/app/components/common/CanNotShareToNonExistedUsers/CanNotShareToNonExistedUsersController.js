;(function() {
	'use strict'; 
	
	angular.module('vdvcApp').controller('CanNotShareToNonExistedUsersController',CanNotShareToNonExistedUsersController);
	
	CanNotShareToNonExistedUsersController.$inject = ['$scope', '$uibModalInstance','NonNumiciUsers','sharedUserList','_','appData'];
			
    function CanNotShareToNonExistedUsersController($scope, $uibModalInstance,NonNumiciUsers,sharedUserList,_,appData) {
			
    	var cnsnc = this;
		var appdata = appData.getAppData();
		
		cnsnc.NonNumiciUsers = angular.copy(NonNumiciUsers);
		cnsnc.sharedUserList = angular.copy(sharedUserList);
		
		cnsnc.getSharedUsers = getSharedUsers;
		cnsnc.ok = ok;
			
		function getSharedUsers() {
			var result = "";
			if(!_.isEmpty(cnsnc.sharedUserList)) {
				_.each(cnsnc.sharedUserList, function(sharedUser,index){
					if(index == 0) {
						result = sharedUser;
					} else {
						result = result+"', '"+sharedUser;
					}
				});
			}
			return result;
		}
		
		
		function ok () {
			$uibModalInstance.close();
		}
		
	}
	
})();