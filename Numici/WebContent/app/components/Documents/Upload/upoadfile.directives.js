;(function() {
	'use strict';
	angular.module("vdvcApp").directive('uploadFileProgressBar', ['$document',function($document) {
		return {
			restrict: 'E',
			templateUrl: 'app/components/Documents/Upload/ProgressBar.html',
			controller: ['$scope', '$element',
				function ($scope, $element) {
				$scope.showProgress = true;
				$scope.closeProgress = function() {
					$element.remove();
			    };
				
			}]
		};
	}]);
})();