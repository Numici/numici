;(function(){
		angular.module("vdvcApp").factory('AuthResolverService',AuthResolverService);
		
		function AuthResolverService($q, $rootScope, $state) {
			
			var AuthResolver = {
					resolve : resolve
			};
			
			return AuthResolver;
			
			function resolve() {
				
				var deferred = $q.defer();
				var unwatch = $rootScope.$watch('currentUser', function (currentUser) {
					if (angular.isDefined(currentUser)) {
			        	if (currentUser) {
			        		deferred.resolve(currentUser);
			        	} else {
			        		deferred.reject();
			        		$state.go('login',{"fromCode":true});
			        	}
			        	unwatch();
		        	}
				});
				return deferred.promise;
			}
		}
})();