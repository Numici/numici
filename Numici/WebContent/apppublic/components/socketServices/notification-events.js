; (function() {
	'use strict';

	angular.module('vdvcPublicApp').factory('notificationEvents', notificationEvents);
	notificationEvents.$inject = ['$rootScope','uuidService'];
	function notificationEvents($rootScope,uuidService) {

        return {
			DIGEST_CHANGED : "digestChanged"
		};
	}
})();