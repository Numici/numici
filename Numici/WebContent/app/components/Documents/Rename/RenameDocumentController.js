;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('RenameDocController',RenameDocController);
	RenameDocController.$inject = ['$scope', '$uibModalInstance','doc'];

	function RenameDocController($scope, $uibModalInstance,doc) {
		var vm = this;
		
		vm.isDocNameEmpty = false;
		
		vm.doc = angular.copy(doc);
		vm.ok = ok;
		vm.cancel = cancel;
		  
		function ok() {
			vm.isDocNameEmpty = false;
			if(vm.doc._type == 'Document') {
				vm.isDocNameEmpty = _.isEmpty(vm.doc.displayName);
			} else if(vm.doc._type == 'Folder' || vm.doc._type == 'Taskspace' || vm.doc.type == 'Document') {
				vm.isDocNameEmpty = _.isEmpty(vm.doc.name);
			}
			if(!vm.isDocNameEmpty) {
				$uibModalInstance.close(vm.doc);
			}
		}
		
		function cancel() {
		    $uibModalInstance.dismiss('cancel');
		}
	}
})();
