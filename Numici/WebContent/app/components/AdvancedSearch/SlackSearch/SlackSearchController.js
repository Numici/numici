;(function() {
	
	angular.module("vdvcApp").controller('SlackSearchController',SlackSearchController);
	
	SlackSearchController.$inject = ['$scope','$state','$stateParams','SlackSearchService','_','$window'];
		
	function SlackSearchController($scope,$state,$stateParams,SlackSearchService,_,$window) {
		var ssc = this;
		var redirectToTarget = redirectToTarget;
		
		function redirectToTarget() {
			if(!_.isEmpty($stateParams)) {
				var searchInfo = {
						"ctx": $stateParams.ctx,
						"skw": $stateParams.skw, 
						"tkr": $stateParams.tkr, 
						"tag":$stateParams.tag,
						"dtp": $stateParams.dtp, 
						"stp": $stateParams.stp,
						"tmf": $stateParams.tmf, 
						"d":$stateParams.d 
					};
				SlackSearchService.searchInfo = searchInfo;
				switch($stateParams.ctx) {
				case 'tsp':
					var tsStateParam = {};
					if(!_.isEmpty($stateParams.tsid) && !_.isEmpty($stateParams.tsc)) {
						searchInfo.tsid = $stateParams.tsid;
						searchInfo.tsc = $stateParams.tsc;
						SlackSearchService.searchInfo = searchInfo;
						tsStateParam = {
								"tsId": $stateParams.tsid, 
								"tsc": $stateParams.tsc
							};
					}
					$state.go('taskspace.list.task',tsStateParam);
					break;
				case 'all':
					$state.go("search");
					break;
				}
			}
		}
		
		redirectToTarget();
	}
		
})();