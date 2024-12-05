
;(function(){
	'use strict';
	
	angular.module("vdvcApp").controller('ConnectToTSController',SlackConfigController);
	
	SlackConfigController.$inject = ['$scope','$state','$stateParams','orderByFilter','_','MessageService','SlackService','SlackInfo','$uibModalInstance'];
	
	function SlackConfigController($scope,$state,$stateParams,orderByFilter,_,MessageService,SlackService,SlackInfo,$uibModalInstance) {
		var ctc = this;
		
		ctc.showTaskspaceName = false;
		ctc.isTaskspaceNameEditable = false;
		
		ctc.checkAllChannels = {selected : false};
		ctc.connectToTSHeaders = angular.copy(SlackService.connectToTSHeaders);
		ctc.connectToTSField = "channelName";
		ctc.connectToTSFieldDecending = false;
		ctc.slackChannelsConfigInfo = angular.copy(SlackInfo.slackChannelsConfigInfo);
		
		ctc.showSkipBtn = showSkipBtn;
		ctc.selectAllChannels = selectAllChannels;
		ctc.checkSlackChannelConfig = checkSlackChannelConfig;
		ctc.sortByField = sortByField;
		ctc.skip = skip;
		ctc.disableConnect = disableConnect;
		ctc.connect = connect;
		
		function showSkipBtn() {
			var status = true;
			var selectedChannelsConfig = _.findWhere(ctc.slackChannelsConfigInfo,{selected : true});
			if(!_.isEmpty(selectedChannelsConfig)){
				status = false;
			}
			return status;
		}
		function selectAllChannels() {
			_.each(ctc.slackChannelsConfigInfo,function(slackChannelConfig){
				slackChannelConfig["selected"] = ctc.checkAllChannels.selected;
			});
		}
		
		function checkSlackChannelConfig(channelInfo) {
			var selectedChannelsConfig = _.where(ctc.slackChannelsConfigInfo,{selected : true});
			if(selectedChannelsConfig && selectedChannelsConfig.length == ctc.slackChannelsConfigInfo.length) {
				ctc.checkAllChannels.selected = true;
			} else {
				ctc.checkAllChannels.selected = false;
			}
		}

		function sortByField (hdr) {
			if(ctc.connectToTSField == hdr.value) {
				ctc.connectToTSFieldDecending =  !ctc.connectToTSFieldDecending;
    		} else {
    			ctc.connectToTSFieldDecending = false;
    		}
			ctc.connectToTSField =  hdr.value;
			ctc.slackChannelsConfigInfo =  orderByFilter(ctc.slackChannelsConfigInfo, ctc.connectToTSField, ctc.connectToTSFieldDecending);
    	}
		
		function skip() {
			$uibModalInstance.dismiss('cancel');
		}
		
		function disableConnect() {
			var status = true;
			var selectedSlackChannelsConfig = _.findWhere(ctc.slackChannelsConfigInfo, {selected : true});
			if(!_.isEmpty(selectedSlackChannelsConfig)) {
				status = false;
			}
			return status;
		}
		
		function preparePostdata() {
			var postdata = [];
			var tempSlackChannelsConfigInfo = angular.copy(ctc.slackChannelsConfigInfo);
			_.each(tempSlackChannelsConfigInfo,function(slackChannelConfig){
				if(slackChannelConfig.selected) {
					delete slackChannelConfig["selected"];
					delete slackChannelConfig["isConfiguredWithTS"];
					postdata.push(slackChannelConfig);
				}
			});
			return postdata;
		}
		
		function handleConnectCB(connectedInfo) {
			var isConnectedFalse = _.findWhere(connectedInfo,{"isConnected" : false});
			var isConnectedTrue = _.where(connectedInfo,{"isConnected" : true});
			
			if(isConnectedFalse) {
				MessageService.showErrorMessage("BACKEND_ERR_MSG",[isConnectedFalse.reason]);
				$uibModalInstance.close(connectedInfo);
			} else {
				MessageService.showSuccessMessage("SLACK_M_CONNECTS_TS");
				$uibModalInstance.close(connectedInfo);
			}
		}
		
		function connect() {
			var postdata = preparePostdata();
			SlackService.createAndConnectWithTS(SlackInfo.teamId,postdata).then(function(resp) {
				if(resp.data.Status && resp.data.Results) {
					handleConnectCB(resp.data.Results);
				}
			});
		}
		
		function init() {
			_.each(ctc.slackChannelsConfigInfo,function(slackChannelConfig){
				slackChannelConfig["selected"] = false;
				slackChannelConfig["taskspaceName"] = slackChannelConfig.channelName;
			});
		}
		init();
	}
})();

