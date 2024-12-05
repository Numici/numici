;(function() {
	'use strict';
	angular.module("vdvcApp").directive('threePaneHeight', ['$document','$window','$timeout',function($document,$window,$timeout) {
			return {
				restrict: 'A',
				link: function(scope, element, attrs) {
					var delta = 15;
					var minHeight = 300;
					if(attrs.threePaneHeight == "SearchResults") {
						delta = 115;
						minHeight = 200;
					} else if(attrs.threePaneHeight == "Snippets") {
						delta = 65;
						minHeight = 250;
					}
					function calHeight(el) {
						var t = $timeout(function () {
							//var clientY = el.offset().top;
							var navHeight = $("#search-nav-bar-height-div").outerHeight();
							var searchFiltersHeight = $("#vdvc-search-filters").outerHeight();
							var clientY = navHeight+searchFiltersHeight;
							var viewportHeight = $($window).innerHeight(); 
				    		if(!isNaN(clientY) && ((viewportHeight-(clientY+delta)) >= minHeight)) {
				    			$(el).css("height", (viewportHeight-(clientY+delta))+"px");
				    		} else {
				    			$(el).css("height", minHeight+"px");
				    		}
						},1000);
					}
					scope.$watchGroup(['toggleSrcBar','searchResults','toggleSideBarChecked','showSnippetsOnMobile','showSeletcedDocOnMobile'], function (newTime) {
						calHeight(element);
					},true);
					
					angular.element($window).bind('resize', function() {
						calHeight(element);
		            });
		        }
			};
	}]);
	angular.module("vdvcApp").directive('addCloseBtnToMCDd', ['$document','$window','$timeout',function($document,$window,$timeout) {
		return {
			restrict: 'A',
			link: function(scope, element, attrs) {
				var expressionHandler = scope.$eval(attrs.addCloseBtnToMCDd);
				var mrk = '<div class="col-xs-12">\
								<div class="col-xs-6"></div>\
								<div class="col-xs-6" style="text-align: right;padding: 0px;">\
			                  		<span class="m-c-dd-close-i">\
										<i class="fa fa-times"></i>\
									</span>\
								</div>\
					    	</div>';
				$(element).append(mrk);
				$(element).find('.m-c-dd-close-i').off('click').on('click',function() {
					if(expressionHandler.isOpen) {
						$timeout(function () {
							expressionHandler.close();
						},0);
					} else {
						expressionHandler();
					}
				});
	        }
		};
	}]);
})();