;(function(){
	'use strict';
		
	angular.module("vdvcApp").factory("CopyService",CopyService);
	
	CopyService.$inject = ['$uibModal','_'];

	function CopyService($uibModal,_) {
		
		var modalInstance;
		var CopyService = {
				open : open,
				close : close
		};
		return CopyService;
		
		function open(data,windowClass) {
			var resolveData = {};
			if(!_.isEmpty(data)) {
				resolveData = data;
			}
			if(_.isEmpty(windowClass)) {
				windowClass = "";
			}				
			modalInstance = $uibModal.open({
				animation: true,
			    templateUrl: 'app/components/AnnotationDigest/create/Copy/copy.html',
			    controller: 'CopyController',
			    appendTo : $('.rootContainer'),
			    controllerAs: 'adhc',
			    windowClass: windowClass,
			    backdrop: 'static',
			    size : 'lg',
			    resolve: {
			    	digest :function() {
			    		return resolveData;
			    	}
			    }
			});
			return modalInstance;
		}
		
		function close() {
			if(modalInstance) {
				modalInstance.dismiss();
			}
		}
	}
})();