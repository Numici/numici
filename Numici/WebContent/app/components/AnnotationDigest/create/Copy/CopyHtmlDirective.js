; (function() {
	'use strict';

	
	angular.module("vdvcApp").directive("copyAsHtml", CopyAsHtml);
	angular.module("vdvcApp").controller("CopyAsHtmlController", CopyAsHtmlController);


	CopyAsHtml.$inject = ['_','$timeout'];
    CopyAsHtmlController.$inject = ['$scope','$element','_','$timeout'];


    function CopyAsHtmlController($scope,$element,_,$timeout) {
		var timeout = $timeout(function() {
				$($element).find("#copyAsHtml").text($scope.copyContentAshtml.content);
				$scope.showLoader = false;
		}, 10);
		
		$scope.$on("$destroy", function handleDestroyEvent() {
			$timeout.cancel(timeout);
		});

	}

	function CopyAsHtml(_,$timeout) {

		var template = '<div id="copyAsHtml" contenteditable=true\
					style="white-space: pre-line;border: 2px solid #ddd; overflow: hidden; overflow-wrap: break-word; resize: none; min-height: 444px; max-height: 445px; overflow-y: auto;">\
				 </div>';
		
		return {
			restrict: 'E',
			scope: {
				copyContentAshtml: "=",
				showLoader: "="
			},
			template: template,
			controller: CopyAsHtmlController,
		};
	}

})();