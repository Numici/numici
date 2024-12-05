;(function() {
	'use strict';
	
	angular.module('vdvcApp').directive('modalDocViewer', function() {
		  return {
		    restrict: "E",
		    templateUrl:'app/components/DocViewer/secCompareDocView.html',
		    controller:'DocViewerController'
		  }
	});
	
	
	angular.module('vdvcApp').controller('ModalDocViewerController',ModalDocViewerController);
	
	ModalDocViewerController.$inject = ['$scope','$rootScope', '$uibModalInstance','docId','clientId','$compile'];
	
	function ModalDocViewerController ($scope,$rootScope, $uibModalInstance,docId,clientId,$compile) {
			  var vm = this;
			  var scope;
			  
			  vm.loader = false;		
			  
			  $uibModalInstance.rendered.then(function(resp) {
				  vm.loader = true;
				  var divElement = angular.element($('[aria-describedby="'+docId+'"]').find('.content'));
				  var template = '<modal-doc-viewer></modal-doc-viewer>';
				  scope = $scope.$new();
				  scope.documentId = docId;
				  scope.clientId = clientId;
				  var appendHtml = $compile(template)(scope);
				  divElement.append(appendHtml);
			  });
			  
			  function clearModal() {
				  $uibModalInstance.dismiss('cancel');
			  }
			  
			  $scope.$on("objectLoaded",function(event, msg){
					vm.loader = false;
			  });
			  
			  $scope.$on('closeDocMdl',function(event,msg) {
				  if(msg) {
					  clearModal();
				  }
			  });
	}
})();