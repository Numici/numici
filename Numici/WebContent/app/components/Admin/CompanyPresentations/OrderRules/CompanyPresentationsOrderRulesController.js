;(function(){
	'use strict';
	angular.module("vdvcApp").controller("CompanyPresentationsOrderRulesController",CompanyPresentationsOrderRulesController);
	
	CompanyPresentationsOrderRulesController.$inject = ['$scope','cpRules','CompanyPresentationService','$uibModalInstance','_','MessageService'];
	
	function CompanyPresentationsOrderRulesController($scope,cpRules,CompanyPresentationService,$uibModalInstance,_,MessageService){
		var orderRuleCtrl = this;
		
		orderRuleCtrl.cpRules = cpRules;
		orderRuleCtrl.setRulesOrder = setRulesOrder;
		orderRuleCtrl.cancel = cancel;
		
		
		function setRulesOrder() {
			var postdata = _.map(orderRuleCtrl.cpRules,function(rule) {
				return rule.EsRule.id;
			});
			
			CompanyPresentationService.getRuleEngineStatus().then(function(es) {
				if(es.status == 200 && es.data.Status) {
	  				if(!CompanyPresentationService.isRuleEngineRunning(es.data.RuleEngineTask)) {
	  					CompanyPresentationService.setRulesOrder(postdata).then(function(resp) {
	  						if(resp.status == 200 && resp.data.Status) {
	  							$uibModalInstance.close(resp.data.Status);
	  						} 
	  					});
	  				}
	  			}
			});
			
			
		}
		
		function cancel() {
			$uibModalInstance.dismiss('cancel');
		}
	}
	
})();