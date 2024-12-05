;(function() {
	'use strict'; 
	
	angular.module('vdvcApp').controller('ConfirmRemoveTSObjAnnotContextCtrl',ConfirmRemoveTSObjAnnotContextCtrl);
	
	ConfirmRemoveTSObjAnnotContextCtrl.$inject = ['$scope', '$uibModal', '$uibModalInstance', 'tsObj', '_'];
			
    function ConfirmRemoveTSObjAnnotContextCtrl($scope, $uibModal, $uibModalInstance, tsObj, _) {
			
    	$scope.moveWithAnnotations = {"option" : ""};
    	
    	$scope.showMoveToDocContext = showMoveToDocContext;
    	$scope.disableConfirm = disableConfirm;
    	$scope.ok = ok;
    	$scope.cancel = cancel;
		
    	function showMoveToDocContext() {
    		if(!_.isEmpty(tsObj.objectInfo) && (tsObj.objectInfo.docType === "WebResource" || tsObj.objectInfo.docType === "WebClip")){
    			return false;
    		}
    		return true;
    	}
    	
    	function disableConfirm() {
    		if(!_.isEmpty($scope.moveWithAnnotations.option)){
    			return false;
    		}
    		return true;
    	}
    	
    	function confirmDeleteAnnotations() {
	    	return $uibModal.open({
	    		animation: true,
	    		templateUrl: 'app/components/TaskSpace/AddToTaskSpace/ConfirmMoveTSObjAnnotContext/ConfirmDeleteAnnotations.html',
	    		controller: 'ConfirmDeleteAnnotationsCtrl',
	    		appendTo : $('.rootContainer'),
	    		backdrop: 'static',
	    		size: 'md',
	    		windowClass: 'uploadFileWindow'
		    });
	    }
    	
		function ok() {
			if($scope.moveWithAnnotations.option === "delete") {
				confirmDeleteAnnotations().result.then(function () {
					$uibModalInstance.close($scope.moveWithAnnotations.option);
				}, function () {
					cancel();
				});
			} else {
				$uibModalInstance.close($scope.moveWithAnnotations.option);
			}
		}
		
		function cancel() {
			$uibModalInstance.dismiss('cancel');
		}
	}
	
})();