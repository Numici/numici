;(function() {

	'use strict';
	
	angular.module('vdvcApp').controller('RemoveFromTaskSpaceController',RemoveFromTaskSpaceController);
	
	RemoveFromTaskSpaceController.$inject = ['$scope','appData','tsObj','docLinkInfo','_','$uibModalInstance'];
	
	function RemoveFromTaskSpaceController($scope,appData,tsObj,docLinkInfo,_,$uibModalInstance) {
	
		var rftc = this;
		
		rftc.deleteObject = false;
		rftc.docType = !_.isEmpty(tsObj.objectInfo) ? tsObj.objectInfo.docType : null;
		rftc.hasDocLink = docLinkInfo.hasDocLink;
		rftc.remove = remove;
		rftc.cancel = cancel;
		
		function remove() {
			$uibModalInstance.close({"deleteObject" : rftc.deleteObject});
		}

		function cancel() {
			$uibModalInstance.dismiss('cancel');
		}
	}
	
})();
