;(function() {
	'use strict';
	angular.module("vdvcApp").directive('portfolioCard', ['$document',function($document) {
		return {
			restrict: 'A',
			templateUrl: 'app/components/Portfolios/portfolioTemplate.html'
		};
	}]);
	

})();
