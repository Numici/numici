;(function() {
	
	angular.module("vdvcApp").factory("PermissionsService",PermissionsService);
	
	PermissionsService.$inject = ["httpService","$q","$rootScope"];
	
	function PermissionsService(httpService,$q,$rootScope) {
		var permissions = {
				listAllPermissions : listAllPermissions
		};
		
		return permissions;
		
		function listAllPermissions() {
			var deferred = $q.defer();
			httpService.httpGet('uipermissions/listAll').then(function(resp){
				if(resp.status == 200 && resp.data.Status) {
					var permissionsList = resp.data.Permissions;
					$rootScope.permissions = permissionsList;
					deferred.resolve(permissionsList);
				}
			});
			return deferred.promise;
	    }
	}
})();