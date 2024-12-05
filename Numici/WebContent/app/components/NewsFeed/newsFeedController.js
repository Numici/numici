
;(function(){
	'use strict';
	angular.module("vdvcApp").controller('NewsFeedController',NewsFeedController);
	
	NewsFeedController.$inject = ['$scope','$state','$stateParams','$document','commonService','DocFactory','_','$timeout'];
	
	function NewsFeedController($scope,$state,$stateParams,$document,commonService,DocFactory,_,$timeout) {
			
			//$scope.newsId = $scope.newsId;
			$scope.newsFeed;
			
			var snippetWatchTimer;
			
			$scope.$on('snippetChanged', function(event, msg) {
				DocFactory.goToHighlightedSnippet($(".nf-content")[0],msg,0);
			});
			 
			commonService.getNewsFeed({ "newsId": $scope.newsId}).then(function(resp){
				if(resp.status == 200 && resp.data.Status) {
					$scope.newsFeed = _.isArray(resp.data.Data) ? resp.data.Data[0] : {};	
				}
			});
			
			$scope.$on("$destroy", function (event)  {
				$timeout.cancel(snippetWatchTimer); 
			});
			
			$scope.$watch('newsFeed', function () {   
                if (commonService.DocSnippets) { 
                	$timeout.cancel(snippetWatchTimer);
                	snippetWatchTimer =  $timeout(function() {
                		 DocFactory.highlightTextByRegex($(".nf-content")[0],commonService.DocSnippets.snippets,0,commonService.searchString);
                	 },1); 	
				}
            });  
			
	}
})();