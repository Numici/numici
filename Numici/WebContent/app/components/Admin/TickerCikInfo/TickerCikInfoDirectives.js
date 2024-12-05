;(function(window, angular, undefined){
	'use strict';
	
	angular.module("vdvcApp").directive('onOutsideCustomTciDdElementClick', ['$document','$timeout',function($document,$timeout) {
		return {
			restrict: 'A',
	        link: function(scope, element, attrs) {
	        	var isInsideClick = false;
	        	var isClickOnToggleInput = false;
	        	element.on('click', function(e) {
	        		if(e.target.hasAttribute('class') && (e.target.className.contains("ui-select") || (e.target.parentElement.hasAttribute('class') && e.target.parentElement.className.contains("ui-select"))) && e.currentTarget.hasAttribute('class') && e.currentTarget.getAttribute('class').contains("tci-url-criteria-dd")) {
	        			isInsideClick = true;
	        		} else if(e.target.hasAttribute('class') && e.target.className.contains("tci-url-criteria-dd-toggle-input")) {
	        			isClickOnToggleInput = true;
	        		} else {
	        			isInsideClick = false;
	        			e.stopPropagation();
	        		}
	        		
	        	});
	        	var isUnderTciCustomDd = function (e) {
	        		var status = false;
	        		var targetEle = e.target;
	        		for(var i = 0; i <= 9; i++) {
	        			if(targetEle.hasAttribute('class') && targetEle.className.contains("ui-select") && targetEle.className.contains("url-filter")) {
		        			status = true;
		        			break;
		        		} else if(targetEle.parentElement && targetEle.parentElement.hasAttribute('class') && targetEle.parentElement.className.contains("ui-select")){
		        			targetEle = targetEle.parentElement;
		        		}
	        		}
	        		
	        		return status;
	        	}
	        	var onClick = function(e) {
	        		$timeout(function () {
	        			if(isInsideClick && !isUnderTciCustomDd(e)) {
    	        			isInsideClick = false;
    	        		}
        				if(isClickOnToggleInput && e.target.hasAttribute('class') && !e.target.className.contains("tci-url-criteria-dd-toggle-input")) {
        					isClickOnToggleInput = false;
        				}
        				
        				if(!isInsideClick && !isClickOnToggleInput) {
        					scope.$eval(attrs.onOutsideCustomTciDdElementClick);
        				}
	                 },0);
	        	};
	        	
	        	$document.on('click', onClick);
	        	
                scope.$on('$destroy', function() {
                  $document.off('click', onClick);
                });
	        }
		};
	}]);
})(window, window.angular, undefined);