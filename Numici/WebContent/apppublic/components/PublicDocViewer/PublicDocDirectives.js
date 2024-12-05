;(function() {
	'use strict';
	
	angular.module("vdvcPublicApp").directive('vdvcAnnotation', ['$document',function($document) {
		return {
			restrict: 'E',
			templateUrl: 'apppublic/components/PublicDocViewer/annotation.tmpl.html'
		};
	}]).directive('markdownToHtml', ['$sce','$filter','markdown','Juicify',function($sce,$filter,markdown,Juicify) {
		return {
			replace: true,
			restrict: 'E',
			link: function (scope, element, attrs) {
				scope.$watch('text', function (newValue) {
					var showdownHTML;
					var showdownHTMLTxt =  markdown.makeHtml(newValue || '');
	            	  showdownHTML = Juicify.inlineCss(showdownHTMLTxt,Juicify.cssMap[Juicify.markdownCssUrl]);
					if(showdownHTML) {
						scope.trustedHtml = $sce.trustAsHtml(showdownHTML);
					}
				});
			},
			scope: {
				text: '=',
				annotation:'='
			},
			template: '<div ng-bind-html="trustedHtml "></div>'
	    };
	}]).directive('windowResize', ['$window','$rootScope', function ($window,$rootScope) {
		return {
			link: link,
			restrict: "A"
		};
		
		function link(scope, element, attr) {
	        angular.element($window).bind('resize', function () {
	        	$rootScope.$broadcast('windowResized', { message: true });
	        	scope.$apply();
	        });
	    };

    }]).directive('ngIncludeReplace', function() {
        return {
            require: 'ngInclude',
            restrict: 'A',
            link: function(scope, element, attrs) {
                element.replaceWith(element.children());
            }
        };
    });
})();