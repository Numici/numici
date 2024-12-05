;(function() {
	
	angular.module("vdvcApp").factory("ChromeExtensionService",ChromeExtensionService);
	
	ChromeExtensionService.$inject = ['$deviceInfo','$window'];
	
	function ChromeExtensionService($deviceInfo,$window) {
		
		var ChromeExtensionService = {
			isExtensionInstalled : isExtensionInstalled,
		};
		return ChromeExtensionService;
		
		function isExtensionInstalled(extensionId,success) {
			try {
				chrome.runtime.sendMessage(extensionId, {"type" : "ping"},
						function(response) {
							if(typeof success == "function"){
								success(response);
							}
						});
			} catch (e) {
				console.log("exception : " + e.message);
				if(typeof success == "function"){
					success(null);
				}
			}
		}
	}

})();