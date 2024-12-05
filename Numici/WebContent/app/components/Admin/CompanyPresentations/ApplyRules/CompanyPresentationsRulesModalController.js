;(function(){
	'use strict';
	angular.module("vdvcApp").controller("CompanyPresentationsRulesModalController",CompanyPresentationsRulesModalController);
	
	CompanyPresentationsRulesModalController.$inject = ['$scope','cpRules','CompanyPresentationService','$uibModalInstance','_','MessageService'];
	
	function CompanyPresentationsRulesModalController($scope,cpRules,CompanyPresentationService,$uibModalInstance,_,MessageService){
		var applyRuleCtrl = this;
		
		
		applyRuleCtrl.cpRules = cpRules;
		applyRuleCtrl.docStates = [
			{
				"label" : "Unclassified",
				"checked" : false,
				"value" : "Unclassified"
			},{
				"label" : "Maybe",
				"checked" : false,
				"value" : "Maybe"
			},{
				"label" : "Yes",
				"checked" : false,
				"value" : "Yes"
			},{
				"label" : "No",
				"checked" : false,
				"value" : "No"
			}
		];
		
		applyRuleCtrl.errorMsgs = {
				"ruleError" : false,
				"ruleErrorMsg" :  "Please Select Rule",
				"docStateError" : false,
				"docStateErrorMsg" : "Please Select Doc State"
		};
		
		applyRuleCtrl.applyEnabled = applyEnabled;
		applyRuleCtrl.saveRulesOrder = saveRulesOrder;
		applyRuleCtrl.applySelectedRules = applySelectedRules;
		applyRuleCtrl.cancel = cancel;
		
		
		function applyEnabled() {
			var selectedRules = _.where(applyRuleCtrl.cpRules,{"checked" : true});
			var selectedDocStatus = _.where(applyRuleCtrl.docStates,{"checked" : true});
			var isDataValid = true;
			if(_.isEmpty(selectedRules)) {
				isDataValid = false;
			}
			
			if(_.isEmpty(selectedRules)) {
				isDataValid = false;
			}
		}
		
		function applyRule(ruleEngineTask) {
			CompanyPresentationService.applySelectedRules(ruleEngineTask).then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					$uibModalInstance.close(resp.data.Status);
				} 
			});
		}
		
		function saveRulesOrder(callback,ruleEngineTask) {
			var orderedRuleIds = _.map(applyRuleCtrl.cpRules,function(rule) {
				return rule.EsRule.id;
			});
			
			CompanyPresentationService.getRuleEngineStatus().then(function(es) {
				if(es.status == 200 && es.data.Status) {
	  				if(!CompanyPresentationService.isRuleEngineRunning(es.data.RuleEngineTask)) {
	  					CompanyPresentationService.setRulesOrder(orderedRuleIds).then(function(orderResp) {
	  						if(orderResp.status == 200 && orderResp.data.Status) {
	  							if(typeof callback == "function") {
	  								callback(ruleEngineTask);
	  							} else {
	  								MessageService.showSuccessMessage("RULES_ORDER_SAVE");
	  							}
	  						} 
	  					});
	  				}
	  			}
			});
		}
		
		function applySelectedRules() {
			
			var selectedRules = _.where(applyRuleCtrl.cpRules,{"checked" : true});
			var selectedDocStatus = _.where(applyRuleCtrl.docStates,{"checked" : true});
			var isDataValid = true;
			if(_.isEmpty(selectedRules)) {
				isDataValid = false;
				applyRuleCtrl.errorMsgs.ruleError = true;
			}
			
			if(_.isEmpty(selectedRules)) {
				isDataValid = false;
				applyRuleCtrl.errorMsgs.docStateError = true;
			}
			
			if(isDataValid) {
				var ruleEngineTask = {
					"ruleIds" : selectedRules.map(function(item) { 
					    return item.EsRule.id; 
					}),
					"docStates" : selectedDocStatus.map(function(item) { 
					    return item.value; 
					})
				}; 
				
				saveRulesOrder(applyRule,ruleEngineTask)
			}
		}
		
		function cancel() {
			$uibModalInstance.dismiss('cancel');
		}
		
		/*function getRuleQueryAsString() {
			if(!_.isEmpty(applyRuleCtrl.cpRules)) {
				CompanyPresentationService.ruleToquery(curatorCtrl.selectedRule).then(function(resp) {
					if(resp.status == 200 && resp.data.Status) {
						curatorCtrl.ruleQueryString = resp.data.Query;
					}
				});
			}
		}*/
	}
	
})();