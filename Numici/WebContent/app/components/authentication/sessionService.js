;(function(){
	angular.module("vdvcApp").service('SessionService',SessionService);
	
	function SessionService() {
		
		this.userId = null;
		this.userRole = null;
		
		this.create = function (userId, userRole) {
		    this.userId = userId;
		    this.userRole = userRole;
		};
		
		this.destroy = function () {
		    this.userId = null;
		    this.userRole = null;
		};
	}
})();