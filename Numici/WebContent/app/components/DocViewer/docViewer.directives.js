;(function() {
	'use strict';
	
	angular.module("vdvcApp").directive('vdvcNoteViewer', ['$document',function($document) {
		return {
			restrict: 'E',
			templateUrl: 'app/components/DocViewer/vdvcNoteViewer.html'
		};
	}]).directive('vdvcDocHierarchy', ['$document',function($document) {
		return {
			restrict: 'E',
			templateUrl: 'app/components/Documents/DocHierarchy/DocHierarchyTemplate.html'
		};
	}]).directive('docViewerDirective', ['$document',function($document) {
		return {
			scope: {
				ctrl: '='
		    },
			restrict: 'E',
			templateUrl: 'app/components/DocViewer/DocViewer.html',
			controller: 'DocViewerController',
		    link: function ($scope, $element, $attrs, $ctrl) {
		    	//console.log($scope.ctrl);
		    }
		};
	}])
	.directive('mobileDocViewer', ['$document',function($document) {
		return {
			scope: {
				ctrl: '='
		    },
			restrict: 'E',
			templateUrl: 'app/components/DocViewer/Mobile/DocViewer.html',
			controller: 'DocViewerController',
		    link: function ($scope, $element, $attrs, $ctrl) {
		    	//console.log($scope.ctrl);
		    }
		};
	}])
	.directive('emailDocViewer', ['$document',function($document) {
		return {
			restrict: 'E',
			templateUrl: 'app/components/DocViewer/EmailViewer/EmailDocViewer.html',
			controller: 'EmailDocViewerController',
		    controllerAs: 'EmailDocViewer',
		    link: function ($scope, $element, $attrs, $ctrl) {
		    	//console.log($scope.ctrl);
		    }
		};
	}]).directive('mobileVdvcNoteViewer', ['$document',function($document) {
		return {
			restrict: 'E',
			templateUrl: 'app/components/DocViewer/Mobile/vdvcNoteViewer.html'
		};
	}]).directive('vdvcPdfViewer', ['$document',function($document) {
		return {
			restrict: 'E',
			templateUrl: 'app/components/DocViewer/pdfviewer.html'
		};
	}]).directive('mobileVdvcPdfViewer', ['$document',function($document) {
		return {
			restrict: 'E',
			templateUrl: 'app/components/DocViewer/Mobile/pdfviewer.html'
		};
	}]).directive('docViewerNavbar', ['$document',function($document) {
		return {
			restrict: 'E',
			templateUrl: 'app/components/DocViewer/docViewerNavBar.html'
		};
	}]).directive('mobileDocViewerNavbar', ['$document',function($document) {
		return {
			restrict: 'E',
			templateUrl: 'app/components/DocViewer/Mobile/docViewerNavBar.html'
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

    }]).directive('nvSetRmMxwidth', ['$document','$timeout',"$window",function($document,$timeout,$window) {
		return {
			restrict: 'A',
			link: function(scope, element, attrs) {
				
				var attrVal = scope.$eval(attrs.nvSetRmMxwidth);
				var parent = $(element).parent();
				var childrens = $(parent).find(".vdvc-breadcrumbs");
				var hdnName = "";
				var docHierarchy = (angular.isArray(attrVal) &&  attrVal.length > 0)? attrVal : null;
				
				function isOverFlowed(element) {
					
					var pw = $(element).parent().width();
					var tcw = 0;
					$.each(childrens,function(i,ch) {
						tcw += $(ch).width();
					});
					
					return tcw >= pw ? true : false ;
				}
				
				function setMaxWidth(element,ch,max_width) {
					var pw = $(parent).width();
					var chw = ($(ch).width()*100)/pw;
					if(chw >= max_width) {
						$(ch).css({"max-width": max_width+"%"});
					} else {
						$(ch).css({"max-width": (chw+2)+"%"});
					}
					
				}
				
				function set(scope, element, attrs) {
					parent = $(element).parent();
					childrens = $(parent).find(".vdvc-breadcrumbs");
					var tl = childrens.length;
					if(childrens) {
						var cl = tl;
						$.each(childrens,function(i,child) {
							if(isOverFlowed(element)) {
								if( tl >=5) {
									if(i == 0 || i==1) {
										setMaxWidth(element,child,20);
										return true;
									}
									
									if(i > 1 && i <= tl-4) {
										$(child).css("max-width","0%");
										hdnName +="/ "+docHierarchy[i].name;
										if(docHierarchy && docHierarchy.length > 1) {
											docHierarchy[1].id = docHierarchy[i].id;
										}
									} else if(i == childrens.length-1) {
										var pw = $(parent).width();
										var sibs = $(child).siblings();
										var tsw = 1;
										$.each(sibs,function(i,sib) {
											tsw += ($(sib).width()*100)/pw;
										});
										if(docHierarchy && docHierarchy.length > 1) {
											docHierarchy[1].name = hdnName;
										}
										setMaxWidth(element,child,100-tsw);
									} else {
										setMaxWidth(element,child,20);
									}
								} else {
									if(i == childrens.length-1) {
										var pw = $(parent).width();
										var sibs = $(child).siblings();
										var tsw = 1;
										$.each(sibs,function(i,sib) {
											tsw += ($(sib).width()*100)/pw;
										});
										if(docHierarchy && docHierarchy.length > 1) {
											docHierarchy[1].name = hdnName;
										}
										//docHierarchy[1].id = docHierarchy[i].id;
										setMaxWidth(element,child,100-tsw);
									}else {
										setMaxWidth(element,child,20);
									}
								}
							} else {
								if(i==1 && childrens.length > 4) {
									$(child).css("max-width","0%");
								}
								//return false;
							}
						});
					}
				}
				
				var timer = $timeout(function() {
					set(scope, element, attrs);
					$timeout.cancel(timer);
				},0);
				
				scope.$on('windowResized', function(msg){
					childrens.css("max-width","");
					set(scope, element, attrs);
				});
	        }
		};
	}]); 
})();