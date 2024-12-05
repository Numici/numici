;(function() {
	'use strict';

	angular.module("vdvcApp").controller("VdVcModelController",VdVcModelController);
	VdVcModelController.$inject = ['$rootScope','$scope','ModelFactory','$document','$window'];
	function VdVcModelController($rootScope,$scope,modelFactory,$document,$window){
		$scope.status;
	    $scope.models;
	    $scope.modelId;
	    $scope.show = true;
	    $scope.highlightIcn;
	    $scope.deviceWidth = $window.innerWidth;
	    $scope.menuIcons =[ {
		    	"name" :'download',
				"icon" :'download.png'
		    },{
		    	"name" :'share',
	    		"icon" :'share.png'
			},{
				"name" :'notes',
				"icon" :'notes.png'
			}];
	    $scope.options = {
	    		offset: -120
	    };
	   
	    
	    getModels();
	    
	    
	    var getBreakpoint = function() {
	        var windowWidth = $window.innerWidth;

	        if(windowWidth < 768) {
	            return 'xs';
	        } else if (windowWidth >= 768 && windowWidth < 992) {
	            return 'sm';
	        } else if (windowWidth >= 992 && windowWidth < 1200) {
	            return 'md';
	        } else if (windowWidth >= 1200) {
	            return 'lg';
	        }   
	    };  
	    
	    
	    function addEmptyCard() {
	    	if (angular.isArray($scope.models)) {
	    		var brkpoint = getBreakpoint();
	        	
	        	switch( brkpoint ) {
	    		 case 'xs' :
	    			 $scope.models.splice(0,0,{isEmptyCard:true});
	    			 break;
	    		 case 'sm' :
	    		 case 'md' :
	    		 case 'lg' :
	    			 switch($scope.models.length ) {
	    			 case 0 :
	    			 case 1 :
	    			 case 2 :
	    			 case 3 :
	    				 $scope.models.push({isEmptyCard:true});
	    				 break;
	    			default:
	    				 $scope.models.splice(3,0,{isEmptyCard:true});
	    				 break; 
	    			 }
	    			 break; 
	    		 }
	    	} else {
	    		$scope.models = [];
	    		$scope.models.push({isEmptyCard:true});
	    	}
	    }
	    
	    
	    function getModels() {
	    	modelFactory.getModels()
	            .success(function (result) {
	            	if(result.Status){
	            		 $scope.models = result.Models;
	            		 addEmptyCard();
	    			}else{
	    				$scope.status = models.Message;
	    			}
	               
	            })
	            .error(function (error) {
	                $scope.status = 'Unable to load Models : ' + error.message;
	            });
	    	
	    	
	    }
	    
	    $scope.selectedModel = function(id) {
	    	 $scope.modelId = id;
	    };
	    
	    $scope.hoveredIcon = function(icon){
	    	$scope.highlightIcn = icon;
	    };
	    
	    $scope.notifyToButton = function(notification) {
	    	$scope.show = notification;
	    };
	}
})();