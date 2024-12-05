;(function() {
	'use strict';
	angular.module('vdvcApp').directive('taskspaceTipTour',[ '$document', '$window', '$timeout',
		function($document, $window, $timeout) {
			return {
				restrict : 'E',
				templateUrl: 'app/components/TipsTourWizard/TaskSpace/TaskspaceTipsTour.html',
				controller: 'TaskspaceTipsTourController',
				controllerAs: 'tttc'
		   	};
		}
	]);
})();