
;(function(){
	'use strict';
	angular.module("vdvcApp").factory("APIUserMessages",APIUserMessages);
	
	APIUserMessages.$inject = ['$rootScope','_','toaster'];
	
	function APIUserMessages($rootScope,_,toaster) {
		
		var APIUserMessages = {
				error : error,
				info : info,
				warning : warning,
				success : success,
				stickySuccess : stickySuccess,
				notification : notification,
		};
		
		return APIUserMessages;
		
		function error(message) {
			toaster.pop({
                type: 'error',
                timeout: 0,
                body: message,
                showCloseButton: true,
                toasterId: 'top-full-width',
                clickHandler: function(toaster,isClose) {
             	   if (isClose) {
             		   return true;
             	   }  
             	   return false;
                }
            });
	    }
	    
	    function info(message) {
	    	toaster.clear({
	    		"hideDuration": "0"
	    	});
	    	toaster.pop({
                type: 'info',
                timeout: 5000,
                body: message,
                toasterId: 'top-center'
            });
	    }
	    
		function notification(message) {
	    	return toaster.pop({
                type: 'info',
                timeout: 10000,
                showCloseButton: true,
                body: message,
                toasterId: 'top-center',
				clickHandler: function(toaster,isClose) {
             	   if (isClose) {
             		   return true;
             	   }  
             	   return false;
                }
            });
	    }

	    function warning(message) {
	    	toaster.pop({
                type: 'warning',
                timeout: 5000,
                body: message,
                toasterId: 'top-center'
            });
	    }
	    
	    function success(message) {
	    	toaster.pop({
                type: 'success',
                timeout: 5000,
                body: message,
                toasterId: 'top-right'
            });
	    }
	    
	    function stickySuccess(message) {
			toaster.pop({
                type: 'success',
                timeout: 0,
                body: message,
                showCloseButton: true,
                toasterId: 'top-right',
                clickHandler: function(toaster,isClose) {
             	   if (isClose) {
             		   return true;
             	   }  
             	   return false;
                }
            });
	    }
	}
	
	angular.module("vdvcApp").factory("MessageService",MessageService);
	
	MessageService.$inject = ['$rootScope','_','APIUserMessages'];
	
	function MessageService($rootScope,_,APIUserMessages) {
		
		var MessageService = {
				getFormatedMessage: getFormatedMessage,
				showSuccessMessage : showSuccessMessage,
				showErrorMessage : showErrorMessage,
				showWarningMessage : showWarningMessage,
				showInfoMessage : showInfoMessage
		};
		
		MessageService.confirmMessages = {
				"ADD_EXTERNAL_DOC_CNF_MSG" : "<p class='confirm-signed-in-content'>Please click on 'Copy & Add' button to add documents copy to taskspace <div>OR</div> Click on 'Continue' button to add documents to taskspace without copying</p>",
		};
		MessageService.messages = {
				"BACKEND_ERR_MSG" : "{0}",
				"BACKEND_SUC_MSG" : "{0}",
				"WRK_IN_PROGRESS_ERR" : 'NEEDS TO BE IMPLEMENTED',
				"PDF_SNIPPET_WAR" : "Unable to navigate to the snippet. Use the browser search to find it",
				
				
				"PDF_TXT_SELECTION_ERR" : "Please reselect the text properly",
				"LINK_COPIED_TO_CLIPBOARD" : "Link copied to clipboard.",
				
				"ADV_SEARCH_SAVE" : 'Search Criteria "{0}" is saved Successfully',
				
				"ADV_SEARCH_SAVE_ERR" : 'Search Criteria with the name "{0}" is already Present',
				
				"COMMENT_DELETE" : 'Comment is deleted successfully',
				"DEEPLINK_DELETE" : 'Deep link is deleted successfully',
				
				"DOC_CREATE" : 'Document "{0}" is Created Successfully',
				"DOC_UPLOAD" : 'Document "{0}" is uploaded Successfully',
				"DOC_LOCKED" : 'The Document is locked by user : {0}',
				"DOC_UPDATE" : 'Document "{0}" is Updated Successfully',
				"DOC_SAVE" : 'Document "{0}" is Saved Successfully',
				"DOC_SAVE_LOCK_ERROR" : 'Document "{0}" is Saving Failed, Doc Edit Lock has been acquired by other User',
				"DOC_SAVE_CONFLICT_ERR" : "Could not complete performed action. Please Try Again.",
				"DOC_DELETE" : 'Document "{0}" is Deleted Successfully',
				"DOC_SHARE" : 'Document "{0}" is Shared Successfully',
				"DOC_RENAME" : 'Document Renamed Successfully',
				"COMPARE_DOCID_NOTAVAILABLE_ERR" : "Compare Document ID Not Available",
				"NOT_SECFILE" : "Document is not an SECFile",
				"DOCUMENT_NOT_FOUND" : "SEC Document Not Available",
				"ANNOTATION_NOT_FOUND" : "Annotation with ID : '{0}' is not found in Document.",
				
				"FOLDER_CREATE" : 'Folder "{0}" is Created Successfully',
				"FOLDER_DELETE" : 'Folder "{0}" is Deleted Successfully',
				"FOLDER_SHARE" : 'Folder "{0}" is Shared Successfully',
				"FOLDER_RENAME" : 'Folder Renamed Successfully',
				"SET_FOLDER_SYNC_EVERNOTE" : 'Folder Synced With Evernote Notebook : "{0}" Successfully',
				"FOLDER_CONNECTED_WITH_EVERNOTE" : 'Folder Connected With Evernote Notebook : "{0}" Successfully',
				"FOLDER_SYNC_EVERNOTE" : 'Folder Synced With Evernote Notebook Successfully',
				"REMOVE_FOLDER_SYNC_EVERNOTE" : 'Folder Synchonization with Evernote Removed Successfully',
				"FOLDER_LINK" : 'Folder "{0}" Linked Successfully',
				"DELETE_ITEMS" : 'Selected Items Are Deleted Successfully',
				"ITEMS_NOT_FOUND_DELETE" : 'Selected Items Are Not Found To Delete',
				"ITEMS_ASSOCIATED_WITH_TASKSPACE_DELETE" : "Document Is Associated To A Taskspace, Can't Delete The Document.",
				"DELETE_ITEMS_ERR" : "You dont have permissions to Delete the selected Items",
				"EMPTY_TRASH" : "Trash is emptied Successfully",
				"ITEMS_NOT_FOUND_SHARE" : 'Selected Items Are Not Found To Share',
				"ITEMS_NOT_SHARE" : 'Selected Items Are Not Shared Successfully',
				"SHARE_ITEMS_ERR" : "You dont have permissions to Share the selected Items",
				"SHARE_ITEMS" : 'Selected Items Are Shared Successfully',
				"SHARE_ITEMS_TO_OWNER" : 'Can not share selected item to owner',
				"SHARED_ITEMS_TO_USER" : 'Selected item already shared to {0}',
				"EDIT_PROPERTIES" : 'Properties Updated Successfully',
				"EDIT_PROPERTIES_ERR" : 'You dont have permissions to Properties the selected Items',
				"PROXIMITY_VAL_ERR" : 'Please Check the Syntax for Proximity. Ex: "Hello World"~10',
				
				"TAG_ITEMS" : 'Selected Items Are Tagged Successfully.',
				"TAG_ITEMS_ERR" : "You Dont Have Permissions To Tag The Selected Items",
				"ITEMS_NOT_FOUND_TAG" : "Selected Items Are Not Found To Tag",
				
				"COPY_ITEMS" : 'Selected Items Are Copied Successfully.',
				"COPY_ITEMS_ERR" : "You Dont Have Permissions To Copy The Selected Items",
				"COPY_ANOTHER_DOC_EXISTS" : "Another Document with '{0}' Name Exists",
				"ITEMS_NOT_FOUND_COPY" : "Selected Items Are Not Found To Copy",
				
				"PASSWORD_CHANGE" : "Your Password Changed Successfully",
				
				"TASKSPACE_CREATE" : 'Taskspace "{0}" is Created Successfully',
				"TS_CREATE_N_SHARE" : 'Taskspace "{0}" Is Created And Shared Successfully.',
				"TASKSPACE_RENAME" : "Taskspace Renamed Successfully",
				"ADD_TASKSPACE" : "Document Added To Taskspace Successfully",
				"DOCS_ADDED_TO_TS" : "Documents Added To Taskspace Successfully",
				"TASKSPACE_OBJ_MOVE" : "'{0}' document moved successfully.",
				"DELETE_DOCUMENT_FROM_TS" : "'{0}' document deleted successfully.",
				"OBJECT_NOT_EXISTS" : "Document with ID : '{0}'  no longer associated to Taskspace.",
				"DIGEST_LINK_DELETE" : "Digest link deleted Successfully",
				"DIGEST_LINK_UPDATE" : "Digest link updated Successfully",
				"DIGEST_LINK_TYPE_UPDATE" : "Link type updated Successfully",
				"DIGEST_NAME_UPDATE" : "Digest name updated Successfully",
				"DIGEST_DESCRIPTION_UPDATE" : "Digest description updated Successfully",
				"BANNER_IMG_SAVED" : "Banner image saved Successfully",
				"PORTFOLIO_UPDATE":"Portfolio updated Successfully",
					
				"DEFAULT_ERROR_MSG" : "Something went wrong.Did not get any Error Message",
					
				"MOVE_TO_PERM_ERROR" : "You don't have permissions to move on selected items",
				
				"RULE_DELETE" : 'Rule "{0}" is deleted successfully',
				"RULES_ORDER_SAVE" : 'Rules order saved successfully',
				
				"SLACK_CONNECTS_TS" : "Channel '{0}' connected to taskspace '{1}' successfully.",
				"ASANA_CONNECTS_TS" : "Project '{0}' connected to taskspace '{1}' successfully.",
				"ASANA_DISCONNECT_TS" : "Project '{0}' disconnected successfully.",
				"SLACK_M_CONNECTS_TS" : "Selected Channels are connected to taskspaces successfully.",
				"SLACK_TEAM_DELETE" : "Team '{0}' deleted successfully.",
				"SLACK_SETTINGS_SAVE" : 'Slack {0} settings are saved successfully',
				"SLACK_SETTINGS_DELETE" : "Taskspace '{0}' disconnected successfully from Team '{1}'",
				"SLACK_POST_ARTICLE" : "Successfully posted the Article on Slack",
				"WEBEX_POST_ARTICLE" : "Successfully posted the Article on Webex",
				
				"TEAMS_POST_ARTICLE" : "Successfully posted the Article on Teams",
								
				"ANNOTATION_DIGEST_NODATA_INFO" : 'No Annotations found for any of the documents associated with the Taskspace',
				"CREATE_HELP_TOPICS" : 'Help context "{0}" is created successfully',
				"ERROR_CREATE_HELP_TOPICS" : "Could not find 'Help' folder at root level",
				"APP_SETTINGS_SAVED" : "Settings saved successfully",
				"APP_SETTINGS_DELETED" : "Settings deleted successfully",
				"APP_SETTINGS_ERR" : "{0}",
				"EXCEEDED_USER_QUOTA" : "You have reached the storage quota limit. Please contact sales@numici.com to upgrade your account.",
				"UTILIZED_80_PERCENT_OF_USER_QUOTA" : "You have utilized more than 80% of the allocated size",
				"RESET_PWD_ERR_MSG" : "{0}",
				"NTF_SETTINGS_SAVE" : "Notification settings saved successfully",
				
				"ORGANIZATION_CREATED" : "Organization '{0}' created successfully",
				"ORGANIZATION_UPDATED" : "Organization '{0}' updated successfully",
				"ORGANIZATION_DELETED" : "Organization '{0}' deleted successfully",
				"USER_CREATED" : "User '{0}' created successfully",
				"USER_UPDATED" : "User '{0}' updated successfully",
				"USER_DELETED" : "User '{0}' deleted successfully",
				"CONVERT_GUEST_TO_PROUSER" : "User '{0}' converted guest user to provisional user",
				"MAINTENANCE_SCHEDULE_CREATED" : "Maintenance schedule '{0}' created successfully",
				"MAINTENANCE_SCHEDULE_UPDATED" : "Maintenance schedule '{0}' updated successfully",
				"MAINTENANCE_SCHEDULE_INITIATED" : "Maintenance schedule '{0}' initited successfully",
				"MAINTENANCE_SCHEDULE_CANCELED" : "Maintenance schedule '{0}' cancelled successfully",
				"MAINTENANCE_SCHEDULE_COMPLETED" : "Maintenance schedule '{0}' completed successfully",
				"MAINTENANCE_SCHEDULE_DELETED" : "Maintenance schedule '{0}' deleted successfully",
				"ADMINISTRATION_ERR" : "{0}",
				"ASSIGN_ACTION_ITEMS" : "Assigned action items successfully",
				"UPDATE_ACTION_ITEM" : "Action item updated successfully",
				"MARK_COMPLETE_ACTION_ITEM" : "Action item marked as complete successfully",
				"ACTION_ITEM_SYNC_WITH_TS" : "Action items synced with selected taskspace successfully",
				"ACTION_ITEM_SYNC_RM_WITH_TS" : "Action items sync removed from selected taskspace successfully",
				"SAVE_DIGEST_AS_NOTES" : "Successfully saved digest as numici notes",
				"CREATE_ONENOTE_NOTEBOOK" : "NoteBook '{0}' created successfully",
				"CREATE_ONENOTE_SECTION" : "Section '{0}' created successfully",
				"CREATE_ONENOTE_PAGE" : "Page '{0}' created successfully",
				"APPEND_TO_ONENOTE_PAGE" : "Digest data is successfully appended to selected onenote page",
				"OVERWRITE_ONENOTE_PAGE" : "Selected onenote page is successfully overwriten with digest data",
				"TRANSFER_OWNERSHIP" : "Ownership transferred successfully",
				"POST_ANNOTATION_TO_SLACK" : "Posted annotation successfully to slack channel '{0}'.",
				"TASKSPACE_SECTION_CREATE" : 'Taskspace Section "{0}" is created successfully',
				"REMOVE_SECTION_FROM_TS" : 'Removed Section "{0}" from taskspace successfully',
				"RENAME_TASKSPACE_SECTION" : 'Renamed Section "{0}" successfully',
				"MOVE_DOCUMENT_TO_TS_SECTION" : "'{0}' document moved to selected section successfully."
		};
		
		return MessageService;
		
		function getFormatedMessage(messageKey , args) {
			if( _.isString(MessageService.messages[messageKey]) ) {
				if (args) {
					return MessageService.messages[messageKey].format(args);
				} else {
					return MessageService.messages[messageKey];
				}
				
			} else {
				return "Message Not Found";
			}
		}
		
		function showSuccessMessage(messageKey , args) {
			var msg = MessageService.getFormatedMessage(messageKey , args);
			
			APIUserMessages.success(msg);
			
		}
		
		function showErrorMessage(messageKey , args) {
			var msg = MessageService.getFormatedMessage(messageKey , args);
			
			APIUserMessages.error(msg);
			
		}
		
		function showWarningMessage(messageKey , args) {
			var msg = MessageService.getFormatedMessage(messageKey , args);
			APIUserMessages.warning(msg);
		}
		
		function showInfoMessage(messageKey , args) {
			var msg = MessageService.getFormatedMessage(messageKey , args);
			APIUserMessages.info(msg);
		}
	}
	
})();
