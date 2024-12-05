;(function() {
	'use strict';
	angular.module('vdvcApp').controller('AnnotationDigestHtmlPreviewController',AnnotationDigestHtmlPreviewController);
	
	AnnotationDigestHtmlPreviewController.$inject = ['$uibModalInstance','appData','DigestData','AnnotationDigestService','$timeout'];
	
	function AnnotationDigestHtmlPreviewController($uibModalInstance,appData,DigestData,AnnotationDigestService,$timeout) {
		var adhpc = this;
		var appdata = appData.getAppData();
		
		// Instance variables
		adhpc.numiciImage = appdata.numiciImage;
		adhpc.numiciLink = appdata.numiciLink;
		adhpc.numiciHeaderText = appdata.numiciHeaderTxt;
		
		// Methods
		adhpc.close = close;
		
		function close() {
			$uibModalInstance.close();
		}
		
		function getDigestHtml() {
			adhpc.loader = true;
			AnnotationDigestService.getDigestHtmlForTS(DigestData.htmlDigestPostdata).then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
	    			if(!_.isEmpty(resp.data.AnnotationDigest) && !_.isEmpty(resp.data.AnnotationDigest.digestHtml)) {
	    				var htmlDigestContent = resp.data.AnnotationDigest.digestHtml;
	    				var divElement = angular.element(document.querySelector('.digest-content'));
    					divElement.append(htmlDigestContent);
    					divElement[0].style.overflowY = "auto";
    					var timer1 = $timeout(function() {
    						if(divElement) {
    							$(divElement).find('.cke_widget_drag_handler_container').css("display", "none");
    							$(divElement).find('.cke_image_resizer').css("display", "none");
    						}
    						$timeout.cancel(timer1);
    						adhpc.loader = false;
    			        }, 1000);
	    			}
	    		}
			},function(errorResp) {
				
	    	})["finally"](function() {
	    		
			});
		}
		
		getDigestHtml();
	}
})();