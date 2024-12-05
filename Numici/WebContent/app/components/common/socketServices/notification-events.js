; (function() {
	'use strict';

	angular.module('vdvcApp').factory('notificationEvents', notificationEvents);
	notificationEvents.$inject = ['$rootScope','uuidService'];
	function notificationEvents($rootScope,uuidService) {

        function shouldHandle(data) {
			return !(data.userId == $rootScope.userinfo.UserId && data.sourceTabId == uuidService.getSessionUUID())
		}
        
		return {
			DOCS_ADDED : "tsDocsAdded",
			DOCS_REMOVED : "tsDocsRemoved",
			SHARED : "tsShared",
			UNSHARED : "tsUnshared",
			SECTION_ADDED : "tsSectionAdded",
			SECTION_REMOVED : "tsSectionRemoved",
			SECTION_RENAMED : "tsSectionRenamed",
			DOCUMENT_MOVED : "tsDocumentMoved",
			TS_DELETED : "tsDeleted",
			TS_CREATED : "tsCreated",
			TS_RENAMED : "tsRenamed",
			TS_OWNER_CHANGED : "tsOwnerChanged",
			PERMISSIONS_CHANGED : "tsPermsChanged",
			COMMENT_CREATED_OR_UPDATED : "tsCommentCreatedOrUpdated",
			COMMENT_DELETED : "tsCommentDeleted",
			DOCUMENT_INDEXED : "tsDocumentIndexed",
			DIGEST_CHANGED : "digestChanged",
			shouldHandle: shouldHandle
		};
	}
})();