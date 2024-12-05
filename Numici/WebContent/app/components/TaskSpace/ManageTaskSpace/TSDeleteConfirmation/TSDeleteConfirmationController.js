;(function() {
	'use strict'; 
	
	angular.module('vdvcApp').controller('TSDeleteConfirmationController',TSDeleteConfirmationController);
	
	TSDeleteConfirmationController.$inject = ['$scope', '$uibModalInstance','_','existedTaskspaces','selectedTaskspaces'];
			
    function TSDeleteConfirmationController($scope, $uibModalInstance,_,existedTaskspaces,selectedTaskspaces) {
    	var tsdcc = this;
    	
    	tsdcc.selectedConnectedTSList = [];
    	
    	tsdcc.bothConnectedTSList = [];
		tsdcc.searchConnectedTSList = [];
		tsdcc.slackConnectedTSList = [];
		
    	tsdcc.existedTaskspaces = angular.copy(existedTaskspaces);
    	tsdcc.selectedTaskspaces = selectedTaskspaces;
    	
    	tsdcc.disableRemoveAndDelete = disableRemoveAndDelete;
    	tsdcc.removeAndDeleteTaskspaces = removeAndDeleteTaskspaces;
    	tsdcc.skipTaskspaces = skipTaskspaces;
    	tsdcc.cancel = cancel;
    	
    	function disableRemoveAndDelete() {
    		var selectedBothConnectedTS = _.findWhere(tsdcc.bothConnectedTSList,{forceDelete : true});
    		var selectedSearchConnectedTS = _.findWhere(tsdcc.searchConnectedTSList,{forceDelete : true});
    		var selectedSlackConnectedTS = _.findWhere(tsdcc.slackConnectedTSList,{forceDelete : true});
    		if(selectedBothConnectedTS || selectedSearchConnectedTS || selectedSlackConnectedTS) {
    			return false;
    		}
    		return true;
    	}
    	
    	function removeAndDeleteTaskspaces () {
    		$uibModalInstance.close({"action" : "remove"});
		}
    	
    	function skipTaskspaces () {
    		$uibModalInstance.close({"action" : "skip"});
		}
		    	
		function cancel () {
			$uibModalInstance.dismiss('cancel');
		}
		
		function init() {
			_.each(tsdcc.existedTaskspaces,function(existedTaskspace) {
				if(!_.isEmpty(existedTaskspace.savedSearches) && !_.isEmpty(existedTaskspace.slackConfig)) {
					var selectedTaskspace = _.findWhere(tsdcc.selectedTaskspaces,{id : existedTaskspace.taskspaceId});
					tsdcc.bothConnectedTSList.push(selectedTaskspace);
				}
				if(!_.isEmpty(existedTaskspace.savedSearches) && _.isEmpty(existedTaskspace.slackConfig)) {
					var selectedTaskspace = _.findWhere(tsdcc.selectedTaskspaces,{id : existedTaskspace.taskspaceId});
					tsdcc.searchConnectedTSList.push(selectedTaskspace);
				}
				if(_.isEmpty(existedTaskspace.savedSearches) && !_.isEmpty(existedTaskspace.slackConfig)) {
					var selectedTaskspace = _.findWhere(tsdcc.selectedTaskspaces,{id : existedTaskspace.taskspaceId});
					tsdcc.slackConnectedTSList.push(selectedTaskspace);
				}
        	});
		}
		
		init();
	}
	
})();