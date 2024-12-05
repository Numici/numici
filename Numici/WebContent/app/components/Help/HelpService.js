;(function() {
	'use strict';
	
	angular.module("vdvcApp").factory("HelpService",HelpService);
	
	HelpService.$inject = ['httpService'];
	
	function HelpService(httpService) {
		
		var help = {
				getAllHelpTopics : getAllHelpTopics,
				creatHelpTopics : creatHelpTopics,
				searchHelpTopic : searchHelpTopic
		};
		
		return help;
		
		function getAllHelpTopics() {
			return httpService.httpGet("help/get");
		}
		
		function creatHelpTopics(folderId) {
			return httpService.httpPost("help/create/"+folderId,{});
		}
		
		function searchHelpTopic(stateHelpTopicsTemp,helpTopicSearchTxt) {
	    	var stateHelpTopics = {currentStateHelpTopics : {},otherHelpTopics : []};
	    	if(!_.isEmpty(stateHelpTopicsTemp.currentStateHelpTopics)) {
	    		stateHelpTopics.currentStateHelpTopics = angular.copy(stateHelpTopicsTemp.currentStateHelpTopics);
				stateHelpTopics.currentStateHelpTopics.topics = _.filter(stateHelpTopicsTemp.currentStateHelpTopics.topics,function(subHelpTopic) {
					var subHelpTopicTitle = subHelpTopic.title.toUpperCase();
					if(!subHelpTopic.context && subHelpTopicTitle.indexOf(helpTopicSearchTxt.toUpperCase()) != -1) {
						return true;
					}
					if(subHelpTopic.context && !_.isEmpty(subHelpTopic.topics)) {
						var superSubHelpTopics = _.filter(subHelpTopic.topics,function(superSubHelpTopic) {
							var superSubHelpTopicTitle = superSubHelpTopic.title.toUpperCase();
							if(!superSubHelpTopic.context && superSubHelpTopicTitle.indexOf(helpTopicSearchTxt.toUpperCase()) != -1) {
								return true;
							}
						});
						if(!_.isEmpty(superSubHelpTopics)) {
							subHelpTopic.topics = superSubHelpTopics;
							return true;
						}
					}
				});
				if(stateHelpTopics.currentStateHelpTopics.topics.length == 0) {
					delete stateHelpTopics.currentStateHelpTopics;
				}
			}
			if(!_.isEmpty(stateHelpTopicsTemp.otherHelpTopics)) {
				stateHelpTopics.otherHelpTopics = angular.copy(stateHelpTopicsTemp.otherHelpTopics);
				stateHelpTopics.otherHelpTopics = _.filter(stateHelpTopicsTemp.otherHelpTopics,function(otherHelpTopic) {
					var otherHelpTopicTitle = otherHelpTopic.title.toUpperCase();
					if(!otherHelpTopic.context && otherHelpTopicTitle.indexOf(helpTopicSearchTxt.toUpperCase()) != -1) {
						return true;
					}
					if(otherHelpTopic.context && !_.isEmpty(otherHelpTopic.topics)) {
						var subHelpTopics = _.filter(otherHelpTopic.topics,function(subHelpTopic) {
							var subHelpTopicTitle = subHelpTopic.title.toUpperCase();
							if(!subHelpTopic.context && subHelpTopicTitle.indexOf(helpTopicSearchTxt.toUpperCase()) != -1) {
								return true;
							}
							if(subHelpTopic.context && !_.isEmpty(subHelpTopic.topics)) {
								var superSubHelpTopics = _.filter(subHelpTopic.topics,function(superSubHelpTopic) {
									var superSubHelpTopicTitle = superSubHelpTopic.title.toUpperCase();
									if(!superSubHelpTopic.context && superSubHelpTopicTitle.indexOf(helpTopicSearchTxt.toUpperCase()) != -1) {
										return true;
									}
								});
								if(!_.isEmpty(superSubHelpTopics)) {
									subHelpTopic.topics = superSubHelpTopics;
									return true;
								}
							}
						});
						if(!_.isEmpty(subHelpTopics)) {
							otherHelpTopic.topics = subHelpTopics;
							return true;
						}
					}
				});
			}
			return stateHelpTopics;
	    }
	}
})();