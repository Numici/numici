; (function() {
	'use strict';
	angular.module("vdvcApp").directive("copyAsPlain", CopyAsPlain);
	CopyAsPlain.$inject = ['_', '$timeout'];
	function CopyAsPlain(_, $timeout) {
		var template = '<textarea  class="vdvc-txtA" rows="2"\
					data-ng-model="copyContentTxt.content"\
					style="border: 2px solid #ddd; overflow: hidden; overflow-wrap: break-word; resize: none; min-height: 444px; max-height: 445px; overflow-y: auto;">\
				 </textarea>';
		var link = function(scope, element, attrs) {
			var timeout = $timeout(function() {
				scope.showLoader = false;
			}, 10);

			scope.$on("$destroy", function handleDestroyEvent() {
				$timeout.cancel(timeout);
			});
		};
		return {
			restrict: 'E',
			scope: {
				copyContentTxt: "=",
				showLoader: "=",
			},
			template: template,
			link: link,
		};
	}

})();