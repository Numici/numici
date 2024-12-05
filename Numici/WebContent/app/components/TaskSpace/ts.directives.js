;(function() {
	'use strict';
	angular.module('vdvcApp').directive('scrollIf',[ '$document', '$window', '$timeout',
		function($document, $window, $timeout) {
			return {
				restrict : 'A',
				scope: { 
					scrollIf: '@'
				},
				link : function(scope, element, attr) {
	
					/*scope.$watch(attr.scrollIf, function(oldValue,newValue) {
						if(newValue == true || newValue == "true") {
							$timeout(function() {
								element[0].scrollIntoView(true);
							}, 1000);
						}
					});*/
					$timeout(function() {
 						scope.$watch(attr.scrollIf, function(oldValue,newValue) {
 							if(newValue == true || newValue == "true") {
 								$timeout(function() {
 									element[0].scrollIntoView(true);
 								}, 0);
 							}
 						});
 					}, 0);
				}
			};
	  	}
	]);
	angular.module('vdvcApp').directive('scrollIfCurrentTsDoc',[ '$document', '$window', '$timeout',
 		function($document, $window, $timeout) {
 			return {
 				restrict : 'A',
 				scope: { 
 					scrollIf: '@'
 				},
 				link : function(scope, element, attr) {
 					$timeout(function() {
  						scope.$watch(attr.scrollIfCurrentTsDoc, function(oldValue,newValue) {
  							if(newValue == true || newValue == "true") {
  								$timeout(function() {
  									element[0].scrollIntoView(true);
  								}, 0);
  							}
  						});
  					}, 1000);
 				}
 			};
 	  	}
 	]);
	angular.module('vdvcApp').directive('scrollOnHover',[ '$document', '$window', '$timeout',
		function($document, $window, $timeout) {
			return {
				restrict : 'A',
				link : function(scope, element, attr) {
					var timeout;
					$(element).on("mouseover", function(event) {
						$timeout.cancel(timeout);
						timeout = $timeout(function() {
							
							var elRect = element[0].getBoundingClientRect();
							var parentRect = $(element).parent()[0].getBoundingClientRect();

						   /* return (
						    	elRect.top <= parentRect.top &&
						    	elRect.left <= parentRect.left &&
						    	elRect.bottom >= parentRect.bottom &&
						    	elRect.right >= parentRect.right 
						    );*/
							
						    if(elRect.top <= parentRect.top) {
						    	$(element).parent().animate({
								    scrollTop: ($(element).parent().scrollTop()) - (parentRect.top - elRect.top)
								}, 10);
						    }
						    
						    if(elRect.bottom >= parentRect.bottom) {
						    	$(element).parent().animate({
								    scrollTop: ($(element).parent().scrollTop())+(elRect.bottom - parentRect.bottom)
								}, 10);
						    }
						    
						    $timeout.cancel(timeout);
						}, 500);
					});
					
					$(element).on("mouseout", function(event) {
						$timeout.cancel(timeout);
					});
				}
			};
	  	}
	]);
	angular.module('vdvcApp').directive('scrollToTsTab',[ '$document', '$window', '$timeout',
 		function($document, $window, $timeout) {
 			return {
 				restrict : 'A',
 				link : function(scope, element, attr) {
 					scope.$watch(attr.scrollToTsTab, function(value) {
 						if(value) {
 							$timeout(function() {
 								element[0].scrollIntoView(true);
 								var parentEle = $(element).closest(".ts-tabs-list");
 								var curScrollPos = parentEle.scrollLeft();
 								var eleL = $(element).offset().left;
 								var eleW = $(element).outerWidth();
 								var listL = parentEle.offset().left;
 								var listWidth = parentEle.outerWidth();
 								if((listL+listWidth)<(eleL+eleW)) {
 									var delta = (eleL+eleW)-(listL+listWidth);
 									parentEle.scrollLeft(curScrollPos+delta);
 								}
 								if(eleL<listL) {
 									var delta = listL-eleL;
 									parentEle.scrollLeft(curScrollPos-delta);
 								}
 								
 								/*var curScroll = $(element).closest(".ts-tabs-list").scrollLeft();
	 							var sp = curScroll+$(element).offset().left+$(element).outerWidth();
	 							$(element).closest(".ts-tabs-list").scrollLeft(sp);*/
							}, 1000);
 						}
 					});
 				}
 			};
 	  	}
 	]);
	angular.module('vdvcApp').directive('tsObjScroll',[ '$document', '$window', '$timeout',
  		function($document, $window, $timeout) {
  			return {
  				restrict : 'A',
  				link : function(scope, element, attr) {
  					var hmrk = '<span class="fa fa-chevron-left btn btn-xs tsla"></span>\
  						<span class="fa fa-chevron-right btn-xs btn tsra"></span>';
  					var vmrk = '<span class="fa fa-chevron-up btn btn-xs tsua"></span>\
						<span class="fa fa-chevron-down btn-xs btn tsda"></span>';
  					
  					$(element).append(hmrk);
					$(element).append(vmrk);
					 
					$(element).find('.tsua').off('click').on('click',function(event) {
						event.stopPropagation();
						
						var $scrollable = $(element).find('.ts-obj'),
			            curScroll = $scrollable.scrollTop(),
			            delta = $(element).find('.ts-card-wrap').outerHeight();
						
			            var scrollTo = curScroll - delta;
						$scrollable.scrollTop(scrollTo);
						
					});
					
					$(element).find('.tsda').off('click').on('click',function(event) {
						event.stopPropagation();
						
						var $scrollable = $(element).find('.ts-obj'),
			            curScroll = $scrollable.scrollTop(),
			            delta = $(element).find('.ts-card-wrap').outerHeight();
						
			            var scrollTo = curScroll + delta;
						$scrollable.scrollTop(scrollTo);
					});
					
  					$(element).find('.tsla').off('click').on('click',function(event) {
  						event.stopPropagation();
  						
  						var $scrollable = $(element).find('.ts-obj'),
  			            curScroll = $scrollable.scrollLeft(),
  			            delta = $(element).find('.ts-card-wrap').outerWidth();
  						
  			            var scrollTo = curScroll - delta;
  						$scrollable.scrollLeft(scrollTo);
  						
  					});
  					
  					$(element).find('.tsra').off('click').on('click',function(event) {
  						event.stopPropagation();
  						
  						var $scrollable = $(element).find('.ts-obj'),
  			            curScroll = $scrollable.scrollLeft(),
  			            delta = $(element).find('.ts-card-wrap').outerWidth();
  						
  			            var scrollTo = curScroll + delta;
  						$scrollable.scrollLeft(scrollTo);
  					});
  					
  				}
  			};
       	}
  	]);
	angular.module('vdvcApp').directive('hrTsObjScroll',[ '$document', '$window', '$timeout',
		function($document, $window, $timeout) {
			return {
				restrict : 'A',
				link : function(scope, element, attr) {
					var mrk = '<span class="fa fa-chevron-left btn btn-xs tsla"></span>\
						<span class="fa fa-chevron-right btn-xs btn tsra"></span>';
					$(element).append(mrk);
					//ts-card-wrap , 
					$(element).find('.tsla').off('click').on('click',function(event) {
						event.stopPropagation();
						
						var $scrollable = $(element).find('.hz-ts-obj'),
			            curScroll = $scrollable.scrollLeft(),
			            delta = $(element).find('.ts-card-wrap').outerWidth();
						
			            var scrollTo = curScroll - delta;
						$scrollable.scrollLeft(scrollTo);
						
					});
					
					$(element).find('.tsra').off('click').on('click',function(event) {
						event.stopPropagation();
						
						var $scrollable = $(element).find('.hz-ts-obj'),
			            curScroll = $scrollable.scrollLeft(),
			            delta = $(element).find('.ts-card-wrap').outerWidth();
						
			            var scrollTo = curScroll + delta;
						$scrollable.scrollLeft(scrollTo);
					});
					
				}
			};
     	}
	]);
	angular.module('vdvcApp').directive('vrtTsObjScroll',[ '$document', '$window', '$timeout',
       function($document, $window, $timeout) {
			return {
				restrict : 'A',
				link : function(scope, element, attr) {
				
					var mrk = '<span class="fa fa-chevron-up btn btn-xs tsua"></span>\
						<span class="fa fa-chevron-down btn-xs btn tsda"></span>';
					$(element).find('.vrt-ts-obj').append(mrk);
					 
					$(element).find('.tsua').off('click').on('click',function(event) {
						event.stopPropagation();
						
						var $scrollable = $(element).find('.vrt-ts-obj'),
			            curScroll = $scrollable.scrollTop(),
			            delta = $(element).find('.ts-card-wrap').outerHeight();
						
			            var scrollTo = curScroll - delta;
						$scrollable.scrollTop(scrollTo);
						
					});
					
					$(element).find('.tsda').off('click').on('click',function(event) {
						event.stopPropagation();
						
						var $scrollable = $(element).find('.vrt-ts-obj'),
			            curScroll = $scrollable.scrollTop(),
			            delta = $(element).find('.ts-card-wrap').outerHeight();
						
			            var scrollTo = curScroll + delta;
						$scrollable.scrollTop(scrollTo);
					});
					
				}
			};
     	}
	]);
	angular.module('vdvcApp').directive('arrangeTsTabsList',[ '$document', '$window', '$timeout','_',
          function($document, $window, $timeout,_) {
  			return {
  				restrict : 'A',
  				link : function(scope, elmt, attr) {
  					var swapArrayElements = function(arr, indexA, indexB) {
  					  var temp = arr[indexA];
  					  arr[indexA] = arr[indexB];
  					  arr[indexB] = temp;
  					};
  					var getTabLimit = function (tabListRight) {
						var tabRight = 0;
  						var tabLimit = -1;
  						$('.ts-tab').each(function(index){
  							var tabLeft = $(this).offset().left;
  							var tabwidth = $(this).innerWidth();
  							tabRight = tabLeft + tabwidth;
  							if(index > 0 && tabRight > tabListRight) {
  								$(this).hide();
  								if(tabLimit == -1) {
  									tabLimit = index;
  								}
  							}
  						});
  						return tabLimit;
					};
					var getHideenTabCount = function(tabLimit) {
						var hiddenTabCount = 0;
						_.each(scope.vm.taskSpaces,function(tab,index) {
  							 if(tabLimit > 0 && index >= tabLimit) {
  								tab.isVisible = false;
  								hiddenTabCount += 1;
  							 } else {
  								tab.isVisible = true;
  							 }
  						});
						return hiddenTabCount;
  					};
  					function defaultTsTabs() {
  						scope.vm.hiddenTabCount = 0;
  						$('.ts-tab').each(function(index){
  							$(this).show();
  						});
  						_.each(scope.vm.taskSpaces,function(tab,index) {
  							scope.vm.taskSpaces[index]['isVisible'] = true;
 						});
  					}
  					function arrangeTsTabs(ele) {
  						
  						$timeout(function() {
  	  						var searchValue = _.findWhere(scope.vm.taskSpaces,{'current' : true});
  	  	  				    var cTabindex = -1;

  	  	  					_.each(scope.vm.taskSpaces, function(data, idx) { 
  	  		  				   if (_.isEqual(data, searchValue)) {
  	  		  					 cTabindex = idx;
  	  		  				      return;
  	  		  				   }
  	  		  				});
  	  						var tabListWidth = $(ele).innerWidth();
  	  						var tabListRight = tabListWidth + 30;
  	  						var tabLimit = getTabLimit(tabListRight);  	  						
  	  						
  	  						if(tabLimit != -1) {
	  	  						if(cTabindex >= tabLimit) {
	  	  							swapArrayElements(scope.vm.taskSpaces, 0, cTabindex);
	  	  						}
		  	  					scope.vm.hiddenTabCount = getHideenTabCount(tabLimit);
		  	  					
		  	  					$timeout(function() {
		  	  						tabLimit = getTabLimit(tabListRight);
			  	  					if(tabLimit > 0) {
			  	  						scope.vm.taskSpaces[tabLimit].isVisible = false;
			  	  						scope.vm.hiddenTabCount += 1;
			  	  					}
		  	  					},100);
	  	  						
  	  						}/* else if(!searchValue.isVisible){
  	  							scope.vm.taskSpaces[0].current = false;
  	  							swapArrayElements(scope.vm.taskSpaces, 0, cTabindex);
  	  							searchValue.isVisible = true;
  	  						}*/
  	  						
  	  					},0);
  					}
  					angular.element($window).bind('resize', function() {
  						$timeout(function() {
  							defaultTsTabs();
							arrangeTsTabs(elmt);
  						},100);
		            });
  					scope.$watch('vm.activeTaskSpace', function(newValue, oldValue) {
  						if(newValue) {
  							defaultTsTabs();
							arrangeTsTabs(elmt);
						}
					});
  					scope.$watch('vm.taskSpaces.length', function(newValue, oldValue) {
  						if(newValue) {
  							defaultTsTabs();
							arrangeTsTabs(elmt);
						}
					});
  					/*scope.$watchGroup(['vm.activeTaskSpace','vm.taskSpaces'], function (newTime) {
  						defaultTsTabs();
						arrangeTsTabs(elmt);
					},true);*/
  				}
  			};
      	}
  	]);
	angular.module('vdvcApp').directive('searchTsObjects',[ '$document', '$window', '$timeout',
  		function($document, $window, $timeout) {
  			return {
  				restrict : 'E',
  				templateUrl: 'app/components/AdvancedSearch/advSearch.html',
  				controller: 'AdvSearchController',
  			    link: function ($scope, $element, $attrs, $ctrl) {
  			    	//console.log($scope.ctrl);
  			    }
  			};
       	}
  	]);
})();
