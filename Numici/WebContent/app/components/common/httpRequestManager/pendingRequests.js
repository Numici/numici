;(function(){
	'use strict';
	angular.module("vdvcApp").factory("pendingRequests",pendingRequests);
	
	pendingRequests.$inject = ['_'];

	function pendingRequests(_) {
		
		var pending = [];
		
		var pendingRequests = {
				get : get,
				add : add,
				remove : remove,
				cancel : cancel,
				cancelAll : cancelAll
		};
		
		return pendingRequests;
		
		function get() {
			 return pending;
		}
		
		function add(request) {
		    pending.push(request);
		}
		  
		function remove(uid) {
			
			pending = _.filter(pending, function(p) {
				return p.uid !== uid;
			});
		}
		 
		function cancelAll() {
			
			angular.forEach(pending, function(p) {
			      p.canceller.resolve();
			});
			
			pending.length = 0;
		}
		 
		function cancel(promise) {
			if(promise && promise._httpCanceller && promise._httpCanceller.resolve) {
				promise._httpCanceller.resolve();
            }
		}	
	}
})();