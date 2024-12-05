;(function(){
	'use strict';
	angular.module("vdvcApp").controller("CompanyPresentationsController",CompanyPresentationsController);
	
	CompanyPresentationsController.$inject = ['$rootScope','$scope','$compile','CompanyPresentationService','$timeout','$state'];
	
	function CompanyPresentationsController($rootScope,$scope,$compile,CompanyPresentationService,$timeout,$state) {
		var cp = this;
		var childScope;
		var ruleEngineStatusTimer;
		var currentView;
		cp.ruleEngineStatus = {
			"isRunning" : false,
			"ruleEngineData" : null,
			"isComplete" : false,
			"status" : null
		}; 
		
		cp.renderView = renderView;
		cp.markRuleStatusReviewed = markRuleStatusReviewed;
		
		$scope.$watch('cp.ruleEngineStatus.ruleEngineData',function(newValue,oldValue) {
			
			renderView();
		},true);
		
		function clearView(focused) {
			var divElement = angular.element(document.querySelector('.cp-view'));
			if(childScope) {
				childScope.$destroy();
				divElement.empty();
				childScope = null;
			}
		}
		
		function getCuratorTemplate() {
			return '<cp-curator-ui></cp-curator-ui>';
		}
		
		function getRuleEngineStatusTemplate() {
			return '<rule-engine-stats></rule-engine-stats>';
		}
		
		function getViewTemplate() {
			if(cp.ruleEngineStatus.isRunning) {
				return getRuleEngineStatusTemplate();
			} else {
				return getCuratorTemplate();
			} 
		}
		
		function clearView() {
			try{
				var divElement = angular.element(document.querySelector('.cp-view'));
				divElement.empty();
			} catch(e) {
				
			}
		}
		
		function renderView() {
			clearView();
			var divElement = angular.element(document.querySelector('.cp-view'));
			var template = getViewTemplate();
			childScope = $scope.$new();
		    var appendHtml = $compile(template)(childScope);
		    divElement.append(appendHtml);
		}
		
		function setRuleEngineRunningStatus(data) {
			
			var status = {
					"isRunning" : false,
					"ruleEngineData" : null,
					"isComplete" : false
			};
			
			if(!_.isEmpty(data)) {
				status.ruleEngineData = data;
				if(data.status !== "reviewed") {
					status.isRunning = true;
					status.isComplete = data.status === "complete" ? true : false;
				}
				
				cp.ruleEngineStatus = status;
			}
		}
		
		function ruleEngineDataHandler(resp) {
  			if(resp.status == 200 && resp.data.Status) {
  				setRuleEngineRunningStatus(resp.data.RuleEngineTask);
  			}
		}
		
		function getRuleEngineStatus() {
			CompanyPresentationService.getRuleEngineStatus().then(function(resp) {
				ruleEngineDataHandler(resp);
			})['finally'](function() {
				initiateGetRuleEngineStatusPolling();
			});
		}
		
		function cancelRuleEngineStatusTimer() {
			$timeout.cancel(ruleEngineStatusTimer);
		}
		
		function initiateGetRuleEngineStatusPolling() {
			cancelRuleEngineStatusTimer();
			ruleEngineStatusTimer = $timeout(function(){
				getRuleEngineStatus();
			}, 10000);
		}
		
		function markRuleStatusReviewed() {
			CompanyPresentationService.markRuleStatusReviewed().then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					$state.reload();
				}
			});
		}
		
		
		//ruleEngineDataHandler(ruleEngineStatus);
		initiateGetRuleEngineStatusPolling();
		
		$scope.$on("$destroy",function handleDestroyEvent() {
			cancelRuleEngineStatusTimer();
		});
		
	}
	
})();