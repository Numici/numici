; (function() {
	'use strict';

	angular.module('vdvcApp').controller('CopyController', CopyController);

	CopyController.$inject = ['$scope', '$uibModalInstance', '_', 'digest', 'APIUserMessages'];

	function CopyController($scope, $uibModalInstance,_,digest,APIUserMessages) {

		var self = this;
		
		self.focusContent = false;
		self.copyAs = "formatted";
		var contents = angular.copy(digest || {});
		// Instance variables
		self.copyContent = {};
		self.copyContentTxt = {};
		self.copyContentHtml = {};
		self.editor;
		self.copyContent.content = contents.content || "";
		self.copyContentTxt.content = contents.shareCommentaryTxt || "" ;
		self.copyContentHtml.content = contents.content || "";
		if (!_.isEmpty(self.copyContentHtml.content)) {
			self.copyContentHtml.content = self.copyContentHtml.content.replaceAll('contenteditable="true"', 'contenteditable="false"')
								//.replaceAll(/<!--[\s\S]*?-->/g,"")
								.replace(/<!-[\S\s]*?-->/gm, '');
		}
		self.showLoader = true;

		// Methods

		self.cancel = cancel;
		self.copyToClipboard = copyToClipboard;

		$scope.$watch(angular.bind(this, function() {
			return this.copyAs;
		}), function(newVal) {
			self.showLoader = true;
		});

		function cancel() {
			$uibModalInstance.dismiss('cancel');
		}


		function copyToClipboard() {
			if (self.copyAs == "formatted") {
				self.editor.execCommand('selectAll');
				setTimeout(function() {
					self.editor.execCommand('copy');
					$uibModalInstance.dismiss('cancel');
				}, 0);
				APIUserMessages.info("Digest copied to clipboard.");
			} else if (self.copyAs == "plain") {
				var copyText = self.copyContentTxt.content;
				var dummy = $('<textarea>').val(copyText).appendTo('body').select()
				setTimeout(function() {
					document.execCommand("copy");
					$(dummy).remove();
					$uibModalInstance.dismiss('cancel');
				}, 0);
				APIUserMessages.info("Digest copied to clipboard.");
			} else if (self.copyAs == "html") {
				var copyText =$("#copyAsHtml").text(); //self.copyContentHtml.content;
				var dummy = $('<textarea>').val(copyText).appendTo('body').select()
				setTimeout(function() {
					document.execCommand("copy");
					$(dummy).remove();
					$uibModalInstance.dismiss('cancel');
				}, 0);
				APIUserMessages.info("Digest copied to clipboard.");
			}
		}
	}
})();