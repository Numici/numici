;(function(window, angular, undefined){
	'use strict';
	angular.module("vdvcApp").directive('collapsedDocListWidth', ['$document','$window','$timeout',function($document,$window,$timeout) {
		return {
			restrict: 'A',
			link: function(scope, element, attrs) {
				var delta = 25;
				if(attrs.collapsedDocListWidth == "Taskspaces") {
					delta = 45;
				}
				function calHeight(el) {
					var t = $timeout(function () {
						var listHeight = $(el).parent().parent().innerHeight();
						$(el).css("width", (listHeight-delta)+"px");
					},0);
				}
				
				angular.element($window).bind('resize', function() {
					$timeout(function() {
						calHeight(element);
					},1000);
	            });
				$timeout(function() {
					calHeight(element);
				},2000);
	        }
		};
	}]);
	
	angular.module("vdvcApp").directive('setElement', ['$document','$window',function($document,$window) {
		return {
			restrict: 'A',
			link: function(scope, element, attrs) {
				scope.el = $(element);
	        }
		};
	}]).directive('scrollToBookmark', ['$document','$window',function($document,$window) {  
		  return {
			    link: function(scope, element, attrs) {
			      var value = attrs.scrollToBookmark;
			      
			      function scrollTobookMark() {
			    	  scope.$apply(function() {
				          var el = $(element);
				          if(el.length) {
				        	  $window.scrollTo(0, el[0].offsetTop - el[0].offsetHeight);
				          }
				        });
			      }
			      
			      /*element.click(function() {
			    	  scrollTobookMark();
			      });*/
			      
			      scope.$on(value,function(event,msg) {
			    	  scrollTobookMark();
			      });
			    }
			  };
	}]).directive('searchListHeight', ['$document','$window',function($document,$window) {
		return {
			restrict: 'A',
			link: function(scope, element, attrs) {
				
	        	var clientY = element.offset().top;
	        	var viewportHeight = $($window).innerHeight(); 
	    		if(!isNaN(clientY)) {
	    			$(element).css("max-height", (viewportHeight-clientY)+"px");
	    		}
	        }
		};
	}]).directive('orientationChange', ['$document','$window','$rootScope',function($document,$window,$rootScope) {
		function onOrientationChange() {
			if ($window.orientation == 0 || $window.orientation == 180) {
				$rootScope.DEVICE_ORIENT = 'portrait';
			} else if ($window.orientation == 90 || $window.orientation == -90) {
				$rootScope.DEVICE_ORIENT = 'landscape';
			} 
		}
		
		return {
			restrict: 'A',
			scope: {},
			compile: function() {
				onOrientationChange();
				angular.element($window).on('orientationchange',function(event) {
					onOrientationChange();
					$rootScope.$broadcast('orientationChange',$rootScope.DEVICE_ORIENT);
				});
			}
		};
	}]).directive('toggleArrowHeight', ['$document','$window','$timeout',function($document,$window,$timeout) {
		return {
			restrict: 'A',
			link: function(scope, element, attrs) {
				scope.$watch(attrs.toggleArrowHeight, function (newTime) {
					$timeout(function () {
						var clientY = element.offset().top;
			        	var viewportHeight = $($window).innerHeight(); 
			    		if(!isNaN(clientY)) {
			    			$(element).css("height", (viewportHeight-clientY)+"px");
			    			$(element).css("line-height", (viewportHeight-clientY)+"px");
			    		}
					},0);
				});
	        }
		};
	}]).directive('onepaneTsobjectsToggleHeight', ['$document','$window',"$timeout",function($document,$window,$timeout) {
		return {
			restrict: 'A',
			link: function(scope, element, attrs) {
				$timeout(function () {
		        	var clientY = element.offset().top;
		        	var viewportHeight = $($window).innerHeight(); 
		        	if(!isNaN(clientY)) {
		    			$(element).css("height", (viewportHeight-(clientY+10))+"px");
		    			$(element).css("line-height", (viewportHeight-(clientY+10))+"px");
		    		}
				},0);
	        }
		};
	}]).directive('customizeUiSelectGroupLable', ['$document','$window','$timeout',function($document,$window,$timeout) {
		return {
			restrict: 'A',
			link: function(scope, element, attrs) {
				
				scope.$watchGroup(['tickersList','advancedInputs.tickers'],function(oldVal,newVal) {
					if(newVal) {
						$timeout(function() {
							var $gw = element.find('.ui-select-choices-group');
							$.each($gw,function(i,elm) {
								var $gh = $(elm).find('div.ui-select-choices-group-label');
								var template = '<span class="search-tickers-group-lable-toggle"><i class="fa fa-angle-down"></i></span>';
								$gh.append(template);
								$gh.attr("data-collapsed",false);
								
								$gh.off('click').on('click', function(){
									if($gh.attr('data-collapsed') == 'true') {
										$gh.attr("data-collapsed",false);
										$gh.find(".fa").removeClass('fa-angle-right').addClass('fa-angle-down');
										$(elm).find('.ui-select-choices-row').show();
									} else {
										$gh.attr("data-collapsed",true);
										$gh.find(".fa").removeClass('fa-angle-down').addClass('fa-angle-right');
										$(elm).find('.ui-select-choices-row').hide();
									}
						        });
							});
							
		                });
					}
		        });
				
	        }
		};
	}]).directive("ntfSettingsHeight", ["$window", "$timeout", function($window, $timeout) {
		return {
			restrict: 'A',
			link: function(scope, element, attrs) {
				
				scope.calculateParentHeight = function() {
					var viewportHeight = $($window).innerHeight();
					var parent = $(element).parent();
		        	var clientY = parent.offset().top;
		        	var parentH = viewportHeight;
		        	if(clientY < parentH) {
		        		parentH = viewportHeight-clientY;
		        	}
		        	return parentH;
		        };
		        scope.calculateSiblingsHeight = function() {
					var siblingsHeight = 0;
					var siblings = $(element).siblings();
		        	for(var i=0; i < siblings.length;i++) {
		        		siblingsHeight += $(siblings[i]).outerHeight();
		        	}
		        	return siblingsHeight;
		        };
		        
				scope.$watch(attrs.ntfSettingsHeight,function(value) {
					
					$timeout(function () {
						
						var delta = attrs.adjust ? scope.$eval(attrs.adjust) : 0;
						var parentH = scope.calculateParentHeight();
						var sh = 62;
						/*if(!value) {
			        		sh = scope.calculateSiblingsHeight();
			        	} else {
			        		sh = 30;
			        	}
						
						var eleClassName = $(element).attr('class');
						if(eleClassName && (eleClassName.indexOf("obj-viewer") !== -1 && (sh > 197 || sh == 97)) || (eleClassName.indexOf("ts-obj") !== -1 && sh == 100)) {
		    				sh = 30;
		    			}*/	
		    			
			    		if(!isNaN(parentH) && !isNaN(sh)) {
			    			$(element).css("max-height", (parentH-sh+delta)+"px");
			    		}
	                 },0);
	            });
				angular.element($window).bind('resize', function(){
					$timeout(function () {
						var parentH = scope.calculateParentHeight();
						var sh = 62;
						/*if(!scope.toggleTwoPaneObjectList) {
			        		sh = scope.calculateSiblingsHeight();
			        	} else {
			        		sh = 30;
			        	}
						
						var eleClassName = $(element).attr('class');
		    			if(eleClassName && (eleClassName.indexOf("obj-viewer") !== -1 && (sh > 197 || sh == 97)) || (eleClassName.indexOf("ts-obj") !== -1 && sh == 100)) {
		    				sh = 30;
		    			}*/	
		    			if(!isNaN(parentH) && !isNaN(sh)) {
			    			$(element).css("max-height", (parentH-sh)+"px");
			    		}
	
						// manuall $digest required as resize event
						// is outside of angular
						scope.$digest();
					},1000);
		        });
			}
		};
    }]).directive("autoHeight", ["$window", "$timeout", function($window, $timeout) {
		return {
			restrict: 'A',
			link: function(scope, element, attrs) {
				
				scope.calculateParentHeight = function() {
					var viewportHeight = $($window).innerHeight();
					var parent = $(element).parent();
		        	var clientY = parent.offset().top;
		        	var parentH = viewportHeight-clientY;
		        	return parentH;
		        };
		        scope.calculateSiblingsHeight = function() {
					var siblingsHeight = 0;
					var siblings = $(element).siblings();
		        	for(var i=0; i < siblings.length;i++) {
		        		siblingsHeight += $(siblings[i]).outerHeight();
		        	}
		        	return siblingsHeight;
		        };
		        
				scope.$watch(attrs.autoHeight,function(value) {
					
					$timeout(function () {
						
						var delta = attrs.adjust ? scope.$eval(attrs.adjust) : 0;
						var parentH = scope.calculateParentHeight();
						var sh = 0;
						if(!value) {
			        		sh = scope.calculateSiblingsHeight();
			        	} else {
			        		sh = 30;
			        	}
						
						var eleClassName = $(element).attr('class');
						if(eleClassName && (eleClassName.indexOf("obj-viewer") !== -1 && (sh > 197 || sh == 97)) || (eleClassName.indexOf("ts-obj") !== -1 && sh == 100)) {
		    				sh = 30;
		    			}	
		    			
			    		if(!isNaN(parentH) && !isNaN(sh)) {
			    			$(element).css("height", (parentH-sh+delta)+"px");
			    		}
	                 },0);
	            });
				angular.element($window).bind('resize', function(){
					$timeout(function () {
						var parentH = scope.calculateParentHeight();
						var sh = 0;
						if(!scope.toggleTwoPaneObjectList) {
			        		sh = scope.calculateSiblingsHeight();
			        	} else {
			        		sh = 30;
			        	}
						
						var eleClassName = $(element).attr('class');
		    			if(eleClassName && (eleClassName.indexOf("obj-viewer") !== -1 && (sh > 197 || sh == 97)) || (eleClassName.indexOf("ts-obj") !== -1 && sh == 100)) {
		    				sh = 30;
		    			}	
		    			if(!isNaN(parentH) && !isNaN(sh)) {
			    			$(element).css("height", (parentH-sh)+"px");
			    		}
	
						// manuall $digest required as resize event
						// is outside of angular
						scope.$digest();
					},1000);
		        });
			}
		};
    }]).directive('tsCommentsDropdownHeight', ['$document','$window',function($document,$window) {
		return {
			restrict: 'A',
			link: function(scope, element, attrs) {
				
	        	var clientY = element.offset().top;
	        	var viewportHeight = $($window).innerHeight()-110; 
	    		if(!isNaN(clientY)) {
	    			$(element).css("min-height", (viewportHeight-(clientY))+"px");
	    			$(element).css("max-height", ((viewportHeight-100)-(clientY))+"px");
	    			
	    		}
	        }
		};
	}]).directive('tsCommentsInputPosition', ['$document','$window',function($document,$window) {
		return {
			restrict: 'A',
			link: function(scope, element, attrs) {
				
	        	var tsCommentsInputHeight = element.outerHeight();
	        	var tsCommentsHeight = element.parent().outerHeight(); 
	    		if(!isNaN(tsCommentsInputHeight)) {
	    			$(element).css("top", (tsCommentsHeight-tsCommentsInputHeight)+"px");
	    			$(element).css("min-width", ($('.vdvc-ts-comments').innerWidth())+"px");
	    			
	    		}
	        }
		};
	}]).directive('whenScrolled', function() {
	   /* return function(scope, elm, attr) {
	        var raw = elm[0];
	        
	        elm.bind('scroll', function() {
	            if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {
	                scope.$apply(attr.whenScrolled);
	            }
	        });
	    };
	    */
	    
	    var linkFunction = function (scope, elm, attr) {
	    	 var raw = elm[0];
	    	 elm.bind('scroll', function() {
		            if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {
		            	scope.whenScrolled();
		            }
		     });
	    };

	    return {
	        restrict: "A",
	        scope:{
	        	whenScrolled:"&"
			},
	        link: linkFunction
	    };
	    
	}).directive("fmtDdMmYy", function () {

	    var linkFunction = function (scope, element, attrs, ngModelCtrl) {

	        ngModelCtrl.$parsers.push(function (datepickerValue) {
	            return moment(datepickerValue).format("DD-MM-YYYY");
	        });
	    };

	    return {
	        restrict: "A",
	        require: "ngModel",
	        link: linkFunction
	    };
	}).directive("csDateToIso", function () {

	    var linkFunction = function (scope, element, attrs, ngModelCtrl) {

	        ngModelCtrl.$parsers.push(function (datepickerValue) {
	            return moment(datepickerValue).format("MM/DD/YYYY");
	        });
	    };

	    return {
	        restrict: "A",
	        require: "ngModel",
	        link: linkFunction
	    };
	}).directive('focused', ['$timeout','$parse',function ($timeout, $parse) {
	    return {
	        link: function ($scope, element, attributes) {
	            var model = $parse(attributes.focused);
	            $scope.$watch(model, function (value) {
	                if (value === true) {
	                    $timeout(function () {
	                        element[0].focus();
	                    });
	                }
	            });

	            // set attribute value to 'false' on blur event:
	            element.bind('blur', function () {
	                if (model && model.assign) {
	                    $scope.$apply(model.assign($scope, false));
	                }
	            });
	        }
	    };
	}]).directive('selectOnFocus', ['$window','$timeout', function ($window,$timeout) {
	    return {
	        restrict: 'A',
	        link: function (scope, element, attrs) {
	            element.on('focus', function () {
	            	var self = this;
	            	$timeout(function() {
	            		if (!$window.getSelection().toString()) {
		                    // Required for mobile Safari
	            			self.setSelectionRange(0, self.value.length);
		                }
	            	});
	            });
	        }
	    };
	}]).directive('selectOnClick', ['$window','$timeout', function ($window,$timeout) {
	    return {
	        restrict: 'A',
	        link: function (scope, element, attrs) {
	            element.on('click', function () {
	            	var self = this;
	            	$timeout(function() {
	            		self.setSelectionRange(0, self.value.length);
	            	});
	            });
	        }
	    };
	}]).directive('focusOn',['$timeout',function($timeout) {
	    return {
	        restrict : 'A',
	        link : function($scope,$element,$attr) {
	            $scope.$watch($attr.focusOn,function(_focusVal) {
	                $timeout(function() {
	                    _focusVal ? $element.focus() : $element.blur();
	                });
	            });
	        }
	    };
	}]).directive('autoFocus', ['$timeout', function($timeout) {
		  return {
			    restrict: 'A',
			    link : function($scope, $element) {
			      $timeout(function() {
			        $element[0].focus();
			      });
			    }
			  };
	}]).directive('onFinishRender',['$timeout', '$parse', function ($timeout, $parse) {
	    return {
	        restrict: 'A',
	        link: function (scope, element, attr) {
	            if (scope.$last === true) {
	                $timeout(function () {
	                    scope.$emit('ngRepeatFinished');
	                    if(!!attr.onFinishRender){
	                      $parse(attr.onFinishRender)(scope);
	                    }
	                });
	            }
	        }
	    };
	}]).directive('onLastRepeat',['$timeout', function( $timeout) {
        return function(scope, element, attrs) {
        	
        	
        	if (scope.$last) {
                $timeout(function () {
                    scope.$emit('onRepeatLast', element, attrs);
                },0);
            }
        	
    
        };
    }]).directive('ngEnter', function() {
        return function(scope, element, attrs) {
            element.bind("keydown keypress", function(event) {
                if(event.which === 13) {
                        scope.$apply(function(){
                                scope.$eval(attrs.ngEnter);
                        });
                        
                        event.preventDefault();
                }
            });
        };
	}).directive('onOutsideElementClick', ['$document','$timeout',function($document,$timeout) {
		return {
			restrict: 'A',
	        link: function(scope, element, attrs) {
	        	element.on('click', function(e) {
	        		e.stopPropagation();
	        	});
	        	var onClick = function() {
	        		/*scope.$apply(function() {
	                    scope.$eval(attrs.onOutsideElementClick);
	                });*/
	        		 $timeout(function () {
	        			 scope.$eval(attrs.onOutsideElementClick);
	                 },0);
	        	};
	        	$document.on('click', onClick);
	        	
                scope.$on('$destroy', function() {
                  $document.off('click', onClick);
                });
	        }
		};
	}]).directive('checklistModel', ['$parse', '$compile', function($parse, $compile) {
		function contains(arr, item, comparator) {
		    if (angular.isArray(arr)) {
		      for (var i = arr.length; i--;) {
		        if (comparator(arr[i], item)) {
		          return true;
		        }
		      }
		    }
		    return false;
		  }

		  // add
		  function add(arr, item, comparator) {
		    arr = angular.isArray(arr) ? arr : [];
		      if(!contains(arr, item, comparator)) {
		          arr.push(item);
		      }
		    return arr;
		  }

		  // remove
		  function remove(arr, item, comparator) {
		    if (angular.isArray(arr)) {
		      for (var i = arr.length; i--;) {
		        if (comparator(arr[i], item)) {
		          arr.splice(i, 1);
		          break;
		        }
		      }
		    }
		    return arr;
		  }

		  // http://stackoverflow.com/a/19228302/1458162
		  function postLinkFn(scope, elem, attrs) {
		     // exclude recursion, but still keep the model
		    var checklistModel = attrs.checklistModel;
		    attrs.$set("checklistModel", null);
		    // compile with `ng-model` pointing to `checked`
		    $compile(elem)(scope);
		    attrs.$set("checklistModel", checklistModel);

		    // getter for original model
		    var checklistModelGetter = $parse(checklistModel);
		    var checklistChange = $parse(attrs.checklistChange);
		    var checklistBeforeChange = $parse(attrs.checklistBeforeChange);
		    var ngModelGetter = $parse(attrs.ngModel);



		    var comparator = angular.equals;

		    if (attrs.hasOwnProperty('checklistComparator')){
		      if (attrs.checklistComparator[0] == '.') {
		        var comparatorExpression = attrs.checklistComparator.substring(1);
		        comparator = function (a, b) {
		          return a[comparatorExpression] === b[comparatorExpression];
		        };

		      } else {
		        comparator = $parse(attrs.checklistComparator)(scope.$parent);
		      }
		    }

		    // watch UI checked change
		    scope.$watch(attrs.ngModel, function(newValue, oldValue) {
		      if (newValue === oldValue) {
		        return;
		      }

		      if (checklistBeforeChange && (checklistBeforeChange(scope) === false)) {
		        ngModelGetter.assign(scope, contains(checklistModelGetter(scope.$parent), getChecklistValue(), comparator));
		        return;
		      }

		      setValueInChecklistModel(getChecklistValue(), newValue);

		      if (checklistChange) {
		        checklistChange(scope);
		      }
		    });

		    // watches for value change of checklistValue (Credit to @blingerson)
		    scope.$watch(getChecklistValue, function(newValue, oldValue) {
		      if( newValue != oldValue && angular.isDefined(oldValue) && scope[attrs.ngModel] === true ) {
		        var current = checklistModelGetter(scope.$parent);
		        checklistModelGetter.assign(scope.$parent, remove(current, oldValue, comparator));
		        checklistModelGetter.assign(scope.$parent, add(current, newValue, comparator));
		      }
		    }, true);

		    function getChecklistValue() {
		      return attrs.checklistValue ? $parse(attrs.checklistValue)(scope.$parent) : attrs.value;
		    }

		    function setValueInChecklistModel(value, checked) {
		      var current = checklistModelGetter(scope.$parent);
		      if (angular.isFunction(checklistModelGetter.assign)) {
		        if (checked === true) {
		          checklistModelGetter.assign(scope.$parent, add(current, value, comparator));
		        } else {
		          checklistModelGetter.assign(scope.$parent, remove(current, value, comparator));
		        }
		      }

		    }

		    // declare one function to be used for both $watch functions
		    function setChecked(newArr, oldArr) {
		      if (checklistBeforeChange && (checklistBeforeChange(scope) === false)) {
		        setValueInChecklistModel(getChecklistValue(), ngModelGetter(scope));
		        return;
		      }
		      ngModelGetter.assign(scope, contains(newArr, getChecklistValue(), comparator));
		    }

		    // watch original model change
		    // use the faster $watchCollection method if it's available
		    if (angular.isFunction(scope.$parent.$watchCollection)) {
		        scope.$parent.$watchCollection(checklistModel, setChecked);
		    } else {
		        scope.$parent.$watch(checklistModel, setChecked, true);
		    }
		  }

		  return {
		    restrict: 'A',
		    priority: 1000,
		    terminal: true,
		    scope: true,
		    compile: function(tElement, tAttrs) {

		      if (!tAttrs.checklistValue && !tAttrs.value) {
		        throw 'You should provide `value` or `checklist-value`.';
		      }

		      // by default ngModel is 'checked', so we set it if not specified
		      if (!tAttrs.ngModel) {
		        // local scope var storing individual checkbox model
		        tAttrs.$set("ngModel", "checked");
		      }

		      return postLinkFn;
		    }
		  };
		}]).directive('bsBreakpoint', ['$window','$rootScope','$timeout',function($window, $rootScope, $timeout) {
		    return {
		        controller: function() {
		            var getBreakpoint = function() {
		                var windowWidth = $window.innerWidth;

		                if(windowWidth < 768) {
		                    return 'xs';
		                } else if (windowWidth >= 768 && windowWidth < 992) {
		                    return 'sm';
		                } else if (windowWidth >= 992 && windowWidth < 1200) {
		                    return 'md';
		                } else if (windowWidth >= 1200) {
		                    return 'lg';
		                }   
		            };  

		            var currentBreakpoint = getBreakpoint();
		            var previousBreakpoint = null;

		            // Broadcast inital value, so other directives can get themselves setup
		            $timeout(function() {
		                $rootScope.$broadcast('windowResize', currentBreakpoint, previousBreakpoint);
		            }); 

		            angular.element($window).bind('resize', function() {
		                var newBreakpoint = getBreakpoint();

		                if (newBreakpoint != currentBreakpoint) {
		                    previousBreakpoint = currentBreakpoint;
		                    currentBreakpoint = newBreakpoint;
		                }   

		                $rootScope.$broadcast('windowResize', currentBreakpoint, previousBreakpoint);
		            }); 
		        }
		    };
		}]).directive('copyLinkHelpStyle', ['$deviceInfo',function($deviceInfo) {
			return {
				restrict: 'A',
				link: function(scope, element, attrs) {
					$(element).css("color", "rgb(0, 102, 153)");
					$(element).css("font-size", "10px");
					if(!$deviceInfo.isTouch && $deviceInfo.isSafari) {
						$(element).html("Please Use 'Command+C' To Copy The Link.");
					} else {
						$(element).remove();
					}
		        }
			};
		}]).directive('setDocType', ['$document','$window','AdvSearchService',function($document,$window,AdvSearchService) {
			return {
				scope: {
					type: '@',
				},
				template: '<span class="row" data-uib-tooltip="{{displayDocType}}" data-tooltip-append-to-body="true">{{ displayDocType }}</span>',
				link: function(scope, element, attrs) {
					var docTypes = angular.copy(AdvSearchService.docTypes);
					scope.$watch('type', function (neww, old) {
						if(docTypes && docTypes.Documents && docTypes.Documents.length > 0) {
							var resultDocType = _.findWhere(docTypes.Documents,{"type":scope.type});
							if(resultDocType) {
								scope.displayDocType = resultDocType.lable;
							} else {
								scope.displayDocType = scope.type;
							}
						}
		            }, true);
		        }
			};
		}]).directive('setDocSubType', ['$document','$window','DocFactory',function($document,$window,DocFactory) {
			return {
				scope: {
					type: '@',
					subType: '@',
				},
				template: '<span class="row" data-uib-tooltip="{{displayDocType}}" data-tooltip-append-to-body="true">{{ displayDocType }}</span>',
				link: function(scope, element, attrs) {
					var docSubTypes = angular.copy(DocFactory.uploadDocSubTypes);
					scope.$watch('subType', function (neww, old) {
						if(docSubTypes && docSubTypes[scope.type] && docSubTypes[scope.type].length > 0) {
							var resultDocSubType = _.findWhere(docSubTypes[scope.type],{"type":scope.subType});
							if(resultDocSubType) {
								scope.displayDocType = resultDocSubType.label;
							} else {
								scope.displayDocType = scope.subType;
							}
						}
		            }, true);
		        }
			};
		}]).directive('ngIncludeReplace', function() {
	        return {
	            require: 'ngInclude',
	            restrict: 'A',
	            link: function(scope, element, attrs) {
	                element.replaceWith(element.children());
	            }
	        };
	    }).directive('buildVersion', ['$rootScope','appData',function($rootScope,appData) {
			return {
				restrict: 'E',
				template: '<div class="vdvc-build-number-ele">Build{{::buildVersion}}</div>',
				replace: true,
				link: function(scope, element, attrs) {
					var appdata = appData.getAppData();
					$rootScope.buildVersion = appdata.version;
		        }
			};
		}]).directive('fitWindowToPopup', ['$window','$document','$timeout','AnnotationDigestService',function($window,$document,$timeout,AnnotationDigestService) {
			return {
				restrict: 'A',
		        link: function(scope, element, attrs) {
		        	var screenWidth = $window.screen.width;
		        	var screenHeight = $window.screen.availHeight || $window.screen.height;
		        	var parentWidth = 0;
					var parentHeight = 0;
					var diffHeight = 0;
					
		        	var dailogCss = {
		        			"width": "100%",
				            "height": "100%",
				            "margin": "0px"
				        };
		        	var contentCss = {
		        			"height": "100%",
		        			"overflow": "auto"
				        };
		        	
		        	function checkAndCalcDiffHeight(width,height) {
		        		if(parentWidth < width) {
							parentWidth = screenWidth;
						}
						if(parentHeight < (height+70)) {
							parentHeight = screenHeight;
						}
						diffHeight = screenHeight - parentHeight;
						if(diffHeight <= 0) {
							diffHeight = 0;
						}
		        	}
		        	
		        	function moveWindow(width,height) {
		    			var left = parentWidth / 2 - width / 2;
		    		    var top = parentHeight /2 - height / 2;
		    		    $window.moveTo(left,top+diffHeight);
		    		}
		        	
		        	function resizeWindow(popupWindowClass,fitFor) {
		        		var width= AnnotationDigestService.shareLinkPopupSizes[fitFor].width;
		        		var height= AnnotationDigestService.shareLinkPopupSizes[fitFor].height;
		        		
						if(popupWindowClass == "send-digest-as-email-modal-window") {
							height = height+20;
		        	  	}
						checkAndCalcDiffHeight(width,height);
						$('.'+popupWindowClass+' .modal-content').css('min-height', (height-70)+'px');
						$('.'+popupWindowClass+' .modal-dialog').css(dailogCss);
						$('.'+popupWindowClass+' .modal-content').css(contentCss);
						$window.resizeTo(width,height+70);
						moveWindow(width,height+70);
		        	}
		        			        	
		        	scope.$on("fit-to-popup",function(event, data) {
		        		parentWidth = AnnotationDigestService.extParentWidth;
						parentHeight = AnnotationDigestService.extParentHeight;
						if(screenWidth < parentWidth) {
							parentWidth = screenWidth;
						}
						if(screenHeight < parentHeight) {
							parentHeight = screenHeight;
						}
						if(data.status == "opened") {
							var timer1 = $timeout(function() {
		        				resizeWindow(data.windowClass,data.fitFor);
		        				$timeout.cancel(timer1);
		        			}, 0);
		        		} else if(data.status == "closed" && data.parent == "sharelinks") {
		        			var width = angular.copy(AnnotationDigestService.shareLinkPopupSizes[data.fitFor].width);
		        			var height = 0;
		        			if(data.windowClass == "browse-file-or-folder-modal-window") {
		        				height = angular.copy(AnnotationDigestService.shareLinkPopupSizes[data.fitFor].height);
		        				height = height+$(".publish-as-numici-note").outerHeight();
		        			} else {
		        				height = angular.copy(AnnotationDigestService.shareLinkPopupSizes[data.fitFor].height);
		        			}
		        			checkAndCalcDiffHeight(width,height);
		        			$window.resizeTo(width,height+70);
							moveWindow(width,height+70);
		        		}
		        	});
		        }
			};
		}]).filter('to_trusted', ['$sce', function($sce){
	        return function(text) {
	            return $sce.trustAsHtml(text);
	        };
	    }]).filter('sanitize', ['$sanitize', function($sanitize){
	        return function(text) {
	            return $sanitize(text);
	        };
	    }]).filter('CstartsWith', function() {
	    	  return function(items, props) {
	    		    var out = [];
	    		    if (angular.isArray(items)) {
	    		      var keys = Object.keys(props);
	    		        
	    		      items.forEach(function(item) {
	    		        var itemMatches = false;

	    		        for (var i = 0; i < keys.length; i++) {
	    		          var prop = keys[i];
	    		          var text = props[prop].toLowerCase();
	    		          if (item[prop].toString().toLowerCase().indexOf(text) === 0 ) {
	    		            itemMatches = true;
	    		            break;
	    		          }
	    		        }

	    		        if (itemMatches) {
	    		          out.push(item);
	    		        }
	    		      });
	    		    } else {
	    		      // Let the output be the input untouched
	    		      out = items;
	    		    }

	    		    return out;
	    		  };
	    }).filter('startsWithFilter', ["_",function(_) {
	    	  return function(items,search,props) {
	    		    var out = [];
	    		    if (angular.isArray(items)) {
	    		     
	    		      items.forEach(function(item) {
	    		        var itemMatches = false;
	    		        for (var i = 0; i < props.length; i++) {
	    		          var prop = props[i];
	    		          if(!_.isEmpty(search) && !_.isEmpty(item[prop]) && _.startsWith(item[prop].toLowerCase(),search.toLowerCase())) {
	    		            itemMatches = true;
	    		            break;
	    		          }
	    		        }
	    		        if (itemMatches) {
	    		          out.push(item);
	    		        }
	    		      });
	    		    } else {
	    		      // Let the output be the input untouched
	    		      out = items;
	    		    }

	    		    return out;
	    		  };
	    }]).filter('startsWithHighlighter', ["_",function(_) {
		      function escapeRegex(string) {
			    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
			  }
	    	  return function(value,search) {
	    		    if(!_.isEmpty(search) && !_.isEmpty(value) && _.startsWith(value.toLowerCase(),search.toLowerCase())) {
						value = value.replace(new RegExp(escapeRegex(search),"i"),'<span class="ui-select-highlight">$&</span>');
					}

	    		    return value;
	    	  };
	    }]).filter( 'filesize', function () {
			 var units = [
			               'bytes',
			               'KB',
			               'MB',
			               'GB',
			               'TB',
			               'PB'
			             ];

             return function( bytes, precision ) {
            	 if(bytes < 512) {
            		 precision = 0;
            	 }
               if ( isNaN( parseFloat( bytes )) || ! isFinite( bytes ) ) {
                 return '?';
               }

               var unit = 0;

               while ( bytes >= 1024 ) {
                 bytes /= 1024;
                 unit ++;
               }
               
               while ( bytes >= 512 ) {
                   bytes /= 1024;
                   unit ++;
               }

               return bytes.toFixed( + precision ) + ' ' + units[ unit ];
             };
	    });
	angular.module('vdvcApp').directive('setContentContainerHeight',[ '$document', '$window', '$timeout','_',
  	    function($document, $window, $timeout,_) {
  			return {
  				restrict : 'A',
  				link : function(scope, elmt, attr) {
  					var containerFluidHeight = $($window).innerHeight();
  					var viewportWidth = $($window).innerWidth();
  					
  					function setContentContainerHeight() {
  						var navbarHeight = 0;
  						if(viewportWidth >= 750) {
  							navbarHeight = $('.navbar-default').innerHeight();
  						} else {
  							navbarHeight = $('.navbar-header').innerHeight();
  						}
  						var contentWrapHeight = containerFluidHeight;
  						if(attr.setContentContainerHeight == "Documents" || attr.setContentContainerHeight == "Portfolios") {
  							$('.second-navbar-top').css("top", navbarHeight+"px");
  							navbarHeight = navbarHeight+55;
  							contentWrapHeight = contentWrapHeight-navbarHeight;
  							$('#nav-bar-height-div').css("height", navbarHeight+"px");
  	  						$('#vdvc-content-wrap').css("height", (contentWrapHeight)+"px");
  						} else if(attr.setContentContainerHeight == "Search") {
  							contentWrapHeight = contentWrapHeight-navbarHeight;
  							$('#vdvc-search-content-wrap').parent().css("height", (contentWrapHeight-10)+"px");
  							if(contentWrapHeight < 445) {
  								contentWrapHeight = 445;
  							}
  							$('#search-nav-bar-height-div').css("height", (navbarHeight+10)+"px");
  							$('#vdvc-search-content-wrap').css("height", (contentWrapHeight-21)+"px");
  						} else {
  							contentWrapHeight = contentWrapHeight-navbarHeight;
  							$('#vdvc-content-wrap').parent().css("height", (contentWrapHeight)+"px");
  							if(contentWrapHeight < 300) {
  								contentWrapHeight = 300;
  							}
  							$('#nav-bar-height-div').css("height", (navbarHeight)+"px");
  							$('#vdvc-content-wrap').css("height", (contentWrapHeight-7)+"px");
  						}
  					}

  					angular.element($window).bind('resize', function() {
    						$timeout(function() {
    							containerFluidHeight = $($window).innerHeight();
    							viewportWidth = $($window).innerWidth();
    							setContentContainerHeight();
    						},1000);
  		            });
  					$timeout(function() {
  						containerFluidHeight = $($window).innerHeight();
  						setContentContainerHeight();
  		            },1000);
  				}
  			};
        }
    ]);
	
})(window, window.angular, undefined);