;(function(){
	'use strict';
	angular.module("vdvcApp").directive("cpCuratorUi",function() {
		return {
		    restrict: "E",
		    templateUrl:'app/components/Admin/CompanyPresentations/CuratorUI/CompanyPresentationsCurator.html',
		    controller:'CompanyPresentationsCuratorController',
		    controllerAs: "curatorCtrl"
		  }
	});
	
	angular.module("vdvcApp").directive("ruleEngineStats",function() {
		return {
		    restrict: "E",
		    templateUrl:'app/components/Admin/CompanyPresentations/RuleEngine/RuleEngine.html',
		    controller:'RuleEngineController',
		    controllerAs: "rc"
		  }
	});
	
})();