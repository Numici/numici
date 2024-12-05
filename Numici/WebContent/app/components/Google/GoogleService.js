;(function() {
	
	angular.module("vdvcApp").factory("GoogleService",GoogleService);
	
	GoogleService.$inject = ['httpService','$http','$window'];
	
	function GoogleService(httpService,$http,$window) {
		
		var GoogleService = {
			autherize: autherize,
			revoke: revoke,
			getConfig: getConfig,
			getGoogleClientId: getGoogleClientId,
			signInWithGoogle: signInWithGoogle
		};
				
		return GoogleService;
		
		function autherize(includeApps) {
			var postdata = {};
			postdata.apps = includeApps;
			getAuthurl(postdata).then(function(resp) {
				 if(resp.status == 200 && resp.data.Status && resp.data.GoogleAuthUrl) {
					 var googleAuthUrl = resp.data.GoogleAuthUrl;
					 $window.location.href = googleAuthUrl;
				 }
			});
		}
		
		function revoke(postdata) {
			return httpService.httpPost('google/revoke',postdata);
		}
		
		function getConfig() {
			return httpService.httpGet('google/config');
		}
		
		function getAuthurl(postdata) {
			return httpService.httpPost('google/authurl',postdata);
		}
		
		function getGoogleClientId() {
			return httpService.httpGet("google/clientid");
		}
		
		function signInWithGoogle(postdata) {
			return httpService.httpPost("google/login",postdata);
		}
	}

})();