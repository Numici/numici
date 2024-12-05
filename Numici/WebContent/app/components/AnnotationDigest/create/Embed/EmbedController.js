;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('EmbedController',EmbedController);
	
	EmbedController.$inject = ['$scope','$confirm','$window','$timeout','$uibModalInstance','DigestLinkinfo','APIUserMessages'];
	
	function EmbedController($scope,$confirm,$window,$timeout,$uibModalInstance,DigestLinkinfo,APIUserMessages) {
		var ec = this;
		
		// Instance variables
		ec.linkUrl = DigestLinkinfo.url;
		ec.embedText = '<iframe id="digestViewer" style="width: 100%; height: 100%; min-height: 1600px; overflow: hidden;" src="'+ec.linkUrl+'" scrolling="no"></iframe>';
		
		// Methods
		ec.cancel = cancel;
		ec.copyFail = copyFail;
		ec.copySuccess = copySuccess;
		
		function copySuccess() {
			APIUserMessages.info("Link copied to clipboard.");
			$timeout(function() {
				cancel();
			}, 100);
		}
		
		function copyFail(err) {
			console.log(err);
		}
		
		function cancel() {
			$uibModalInstance.dismiss("cancel");
		}
		
		function init() {
			
		}
		
		init();
		
	}
})();