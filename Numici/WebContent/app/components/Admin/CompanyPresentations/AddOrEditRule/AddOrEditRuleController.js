;(function(){
	'use strict';
	angular.module("vdvcApp").controller("AddOrEditRuleController",AddOrEditRuleController);
	
	AddOrEditRuleController.$inject = ['$scope','EsRule','CompanyPresentationService','$confirm','$uibModalInstance','_','MessageService'];
	
	function AddOrEditRuleController($scope,EsRule,CompanyPresentationService,$confirm,$uibModalInstance,_,MessageService){
		var AddOrEditRuleCtrl = this;
		var selectedRule = angular.copy(EsRule);
		var ruleId = null;
		
		AddOrEditRuleCtrl.errorMsgs = {
				"showSubTypeError" : false,
				"showSubTypeErrorMsg" :  "Please Select Document type and Sub type",
				"showRuleNameeError" : false,
				"showRuleNameeErrorMsg" : "Rule name is Required"
		};
		
		AddOrEditRuleCtrl.title = "ADD RULE";
		AddOrEditRuleCtrl.isNewRule = true;
		AddOrEditRuleCtrl.ruleAttr = angular.copy(CompanyPresentationService.ruleAttr);
		AddOrEditRuleCtrl.conditions = angular.copy(CompanyPresentationService.ruleConditions);
		AddOrEditRuleCtrl.joins = angular.copy(CompanyPresentationService.ruleJoins);
		AddOrEditRuleCtrl.presentationTypes = angular.copy(CompanyPresentationService.prsntTypes);
		AddOrEditRuleCtrl.docTypes = angular.copy(CompanyPresentationService.CPDocTypes);
		AddOrEditRuleCtrl.subTypes = angular.copy(CompanyPresentationService.CPDocSubTypes);
		AddOrEditRuleCtrl.docTypSelcted = AddOrEditRuleCtrl.docTypes[0].value;
		AddOrEditRuleCtrl.subTypSelcted =  AddOrEditRuleCtrl.subTypes[0].value;
		
		var rule = {
				"attribute": null,
				"condition" : null,
				"keywords" : " ", 
				"join" : AddOrEditRuleCtrl.joins[0]
		};
		
		AddOrEditRuleCtrl.ruleName = null;
		AddOrEditRuleCtrl.ruleClass = null;
		AddOrEditRuleCtrl.when = null;
		AddOrEditRuleCtrl.duringIndex = false;
		AddOrEditRuleCtrl.uirules = [angular.copy(rule)];
		
		AddOrEditRuleCtrl.showSubTypes = false;
		AddOrEditRuleCtrl.addRule = addRule;
		AddOrEditRuleCtrl.removeRule = removeRule;
		AddOrEditRuleCtrl.filterDocsbyRule = filterDocsbyRule;
		AddOrEditRuleCtrl.onPresentationTypeChange = onPresentationTypeChange;
		AddOrEditRuleCtrl.onDocTypeChange = onDocTypeChange;
		AddOrEditRuleCtrl.onDuringIndexChange = onDuringIndexChange;
		
		AddOrEditRuleCtrl.showError = false;
		AddOrEditRuleCtrl.comment;
		AddOrEditRuleCtrl.ok = save;
		AddOrEditRuleCtrl.cancel = cancel;
		AddOrEditRuleCtrl.deleteRule = deleteRule;
		
		function init() {
			if(selectedRule) {
				AddOrEditRuleCtrl.title = "EDIT RULE";
				ruleId = selectedRule.id;
				AddOrEditRuleCtrl.isNewRule = false;
				AddOrEditRuleCtrl.ruleName = selectedRule.ruleName;
				AddOrEditRuleCtrl.ruleClass = selectedRule.ruleClass;
				if(!_.isEmpty(selectedRule.when)) {
					AddOrEditRuleCtrl.when = selectedRule.when;
					AddOrEditRuleCtrl.duringIndex = selectedRule.when === "index" ? true : false;
				} else {
					AddOrEditRuleCtrl.duringIndex = false;
				}
				AddOrEditRuleCtrl.showSubTypes = selectedRule.ruleClass === "yes" ? true : false;
				
				AddOrEditRuleCtrl.docTypSelcted =  _.isEmpty(selectedRule.documentType) ? AddOrEditRuleCtrl.docTypes[0].value :  selectedRule.documentType;
				AddOrEditRuleCtrl.subTypSelcted =  _.isEmpty(selectedRule.subCategory) ?  AddOrEditRuleCtrl.subTypes[0].value :  selectedRule.subCategory;
				AddOrEditRuleCtrl.uirules = selectedRule.ruleParts ? selectedRule.ruleParts : [];
				onDocTypeChange();
			}
		}
		
		function getRulesParts() {
			var ruleParts = [];
			_.each(AddOrEditRuleCtrl.uirules,function(val,indx) {
				
				if(!_.isEmpty(val.condition) && !_.isEmpty(val.attribute)) {
					if(indx == (AddOrEditRuleCtrl.uirules.length-1)) {
						delete val.join;
					}
					ruleParts.push(val);
				}
			});
			return ruleParts;
		}
		
		function addRule() {
			AddOrEditRuleCtrl.uirules.push(angular.copy(rule));
		}
		
		function removeRule(index) {
			AddOrEditRuleCtrl.uirules.splice(index, 1);
		}
		
		function ESRule() {
			
			var ruleParts = getRulesParts();
			var Esrule = {
					"ruleName" : AddOrEditRuleCtrl.ruleName,
					"documentType" : "",
					"subCategory" :  "", 
					"ruleClass" : AddOrEditRuleCtrl.ruleClass,
					"when" : AddOrEditRuleCtrl.when,
					"ruleParts" : ruleParts,
					"ruleOrder" : selectedRule.ruleOrder
			};
			
			if(!_.isEmpty(AddOrEditRuleCtrl.subTypSelcted)) {
				Esrule.subCategory = AddOrEditRuleCtrl.subTypSelcted;
			}
			
			if(!_.isEmpty(AddOrEditRuleCtrl.docTypSelcted)) {
				Esrule.documentType = AddOrEditRuleCtrl.docTypSelcted;
			}
			
			
			if(Esrule.ruleClass != "yes") {
				delete Esrule.documentType;
				delete Esrule.subCategory;
			} else if(!isCompanyDocument()) {
				delete Esrule.subCategory;
			}
			
			if(ruleId) {
				Esrule.id = ruleId;
			}
			
			return Esrule;
		}
		
		function filterDocsbyRule() {
			var ruleParts = getRulesParts();
			var esrule = ESRule();
			$uibModalInstance.close({"rule" : esrule,"type" : "filter"});
		}
		
		function isCompanyDocument() {
			var flag = false;
			if(AddOrEditRuleCtrl.docTypSelcted === "Company Document") {
				flag = true;
			}
			return flag;
		}
		
		function onDocTypeChange() {
			AddOrEditRuleCtrl.showDocSubTypes = isCompanyDocument();
		}
		
		function onPresentationTypeChange(type) {
			if(type === "yes") {
				AddOrEditRuleCtrl.showSubTypes = true;
				onDocTypeChange();
			} else {
				AddOrEditRuleCtrl.showSubTypes = false;
			}
		}
		
		function onDuringIndexChange() {
			if(AddOrEditRuleCtrl.duringIndex) {
				AddOrEditRuleCtrl.when = "index";
			} else {
				AddOrEditRuleCtrl.when = null;
			}
		}
		
		function save() {
			
			var esrule = ESRule();
			
			if(_.isEmpty(esrule.ruleName)) {
				AddOrEditRuleCtrl.errorMsgs.showRuleNameeError = true;
			} else {
				AddOrEditRuleCtrl.errorMsgs.showRuleNameeError = false;
			}
			
			if(!AddOrEditRuleCtrl.errorMsgs.showRuleNameeError) {
				saveRule(esrule);
			}
		}
		
		function cancel() {
			$uibModalInstance.dismiss('cancel');
		}
		
		
		function saveRule(rule) {
			CompanyPresentationService.getRuleEngineStatus().then(function(es) {
				if(es.status == 200 && es.data.Status) {
	  				if(!CompanyPresentationService.isRuleEngineRunning(es.data.RuleEngineTask)) {
	  					CompanyPresentationService.saveRule(rule).then(function(resp) {
	  						if(resp.status == 200 && resp.data.Status) {
	  							$uibModalInstance.close({"rule" : resp.data.Rule,"type" : "save"});
	  						}
	  					});
	  				}
	  			}
			});
		}
		
		function deleteRule () {
			$confirm({text: "Do you want to delete selected rule '"+selectedRule.ruleName+"'?"})
	        .then(function() {
				CompanyPresentationService.deleteRule(selectedRule.id).then(function(resp) {
					if(resp.status == 200 && resp.data.Status) {
						$uibModalInstance.close({"type" : "delete"});
					}
				});
		    });
		}
		
		init();
	}
	
})();