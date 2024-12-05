;(function() {
	'use strict';
	
	angular.module("vdvcApp").directive('vdvcAnnotation', ['$document',function($document) {
		return {
			restrict: 'E',
			templateUrl: 'app/components/DocViewer/annotation.tmpl.html'
		};
	}]).directive('commentToHtml', ['$sce','$filter','markdown','Juicify',function($sce,$filter,markdown,Juicify) {
		return {
	      replace: true,
	      restrict: 'E',
	      link: function (scope, element, attrs) {
	    	  scope.$watch('comment', function (newValue) {
	              var showdownHTML;
	              if(scope.annotation) {
	            	  var showdownHTMLTxt =  markdown.makeHtml(newValue || '');
	            	  showdownHTML = Juicify.inlineCss(showdownHTMLTxt,Juicify.cssMap[Juicify.markdownCssUrl]);
	            	  
	  			  } else {
	  				  showdownHTML = $filter('linky')(newValue,'_blank');
	  			  }
	              
	              if(showdownHTML) {
	            	  scope.trustedHtml = $sce.trustAsHtml(showdownHTML);
	              }
	           });
          },
	      scope: {
	        comment: '=',
	        annotation:'='
	      },
	      template: '<div ng-bind-html="trustedHtml "></div>'
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
		}]); ; 
})();