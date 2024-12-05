;(function(){
	'use strict';
		
	angular.module("vdvcApp").factory("MailService",MailService);
	
	MailService.$inject = ['$uibModal','_'];

	function MailService($uibModal,_) {
		
		var modalInstance;
		var MailService = {
				open : open,
				close : close
		};
		return MailService;
		
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
			    templateUrl: 'app/components/AnnotationDigest/SendAsMail/mail.html',
			    controller: 'MailController',
			    appendTo : $('.rootContainer'),
			    controllerAs: 'admc',
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