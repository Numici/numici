;(function(){
	'use strict';
	
	
	angular.module("vdvcApp").factory("httpService",httpService);
	
	httpService.$inject = ['$q','$http','baseUrl'];

	function httpService($q,$http,baseUrl) {
		var requestCounter = 0;
		var httpService = {
				httpGet : httpGet,
				httpDelete : httpDelete,
				httpPost : httpPost
		};
		
		return httpService;
		
		function httpGet(url,uid,getConfig) {
			
			url = baseUrl+url;
			requestCounter++;
			var canceller = $q.defer();
			var config = { timeout: canceller.promise };
			if(getConfig) {
				config = angular.extend({}, config, getConfig);
			}
			
		    //Request gets cancelled if the timeout-promise is resolved
		    var requestPromise = $http.get(url,config);
		    requestPromise._httpCanceller = canceller;
		    return requestPromise;
		}
		
		
		function httpPost(url,postdata,postConfig) {
			
			url = baseUrl+url;
			requestCounter++;
			var canceller = $q.defer();
			var config = { timeout: canceller.promise };
			if(postConfig) {
				config = angular.extend({}, config, postConfig);
			}
		    //Request gets cancelled if the timeout-promise is resolved
		    var requestPromise = $http.post(url,postdata ,config);
	
		    requestPromise._httpCanceller = canceller;
		   
		    return requestPromise;
		}
		
		function httpDelete(url,postdata) {
			
			url = baseUrl+url;
			requestCounter++;
			var canceller = $q.defer();
		   
		    //Request gets cancelled if the timeout-promise is resolved
		    var requestPromise = $http({
				'method': 'DELETE',
	    		'url': url,
	    		'data':postdata ? postdata : {},
	    		"headers": {
	    			   'Content-Type': 'application/json;charset=utf-8'
	    		},
	    		'timeout': canceller.promise
	    	});
		    
		    requestPromise._httpCanceller = canceller;
		    
		    return requestPromise;
		}
	}
})();