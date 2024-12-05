;(function() {
	'use strict'; 
	
	angular.module('vdvcApp').controller('ConfirmUpdateOrgUserAppSettingsController',ConfirmUpdateOrgUserAppSettingsController);
	
	ConfirmUpdateOrgUserAppSettingsController.$inject = ['$scope', '$uibModal', '$uibModalInstance', '_', 'appSettingInfo'];
			
    function ConfirmUpdateOrgUserAppSettingsController($scope, $uibModal, $uibModalInstance, _, appSettingInfo) {
    	
    	$scope.appSettingType = appSettingInfo.appSettingType;
    	$scope.updateAllOrgs = false;
    	$scope.updateAllOrgUsers = false;
    	
    	$scope.onUpdateAllOrgsChange = onUpdateAllOrgsChange;
    	$scope.disableUpdateAllOrgUsers = disableUpdateAllOrgUsers;
    	$scope.ok = ok;
    	$scope.cancel = cancel;
    	
    	function onUpdateAllOrgsChange() {
    		if(!$scope.updateAllOrgs) {
    			$scope.updateAllOrgUsers = false;
    		}
    	}
    	
    	function disableUpdateAllOrgUsers() {
    		var status = false;
    		if($scope.appSettingType == 'System' && !$scope.updateAllOrgs){
    			status = true;
    		}
    		return status;
    	}
    	
    	function ok() {
    		var updateSettings = {updateAllOrgs : $scope.updateAllOrgs, updateAllOrgUsers : $scope.updateAllOrgUsers}
    		$uibModalInstance.close(updateSettings);
    	}
    	
		function cancel() {
			$uibModalInstance.dismiss('cancel');
		}
	}
	
})();