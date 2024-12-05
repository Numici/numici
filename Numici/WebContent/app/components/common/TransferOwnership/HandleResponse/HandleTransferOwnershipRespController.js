;(function() {
	'use strict'; 
	
	angular.module('vdvcApp').controller('HandleTransferOwnershipRespController',HandleTransferOwnershipRespController);
	
	HandleTransferOwnershipRespController.$inject = ['$scope','$uibModalInstance','_','items','responseFor'];
	
	function HandleTransferOwnershipRespController($scope,$uibModalInstance,_,items,responseFor) {
		
		 var htorc = this;
		 
		 htorc.responseFor = responseFor;
		 htorc.transferredTrueLog = htorc.responseFor.type == 'Documents' ? items.isTrnasferedTrue : [];
		 htorc.transferredFalseLog = htorc.responseFor.type == 'Documents' ? items.isTrnasferedFalse : [];
		 htorc.TSTransferReport = htorc.responseFor.type == 'Taskspace' ? items.Report : [];		 
		 
		 htorc.cancel = cancel;
		 
		 function cancel() {
			 $uibModalInstance.dismiss('cancel');
		 }
	}
})();