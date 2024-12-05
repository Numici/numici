;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('PortfolioViewCtrl',PortfolioViewCtrl);
	
	PortfolioViewCtrl.$inject = ['$scope', '$uibModalInstance','PortfolioService','$confirm',"_","SecFilingService","portfolio"];
	
	function PortfolioViewCtrl($scope, $uibModalInstance,PortfolioService,$confirm,_,SecFilingService,portfolio) {
		  var vm = this;
		  vm.pfTickersListHeaders = PortfolioService.pfTickersListHeaders;
		  vm.companiesList = [];
		  vm.selectedTickers = [];
		  vm.portfolio = portfolio.PortfolioInfo;
		  
		  vm.cancel = cancel;
		  
		  function refreshTickers (searchKey) {
			   if(!_.isEmpty(searchKey)) {
				   SecFilingService.getCompaniesList({"searchTxt":searchKey}).then(function(resp){
				    	if(resp.status == 200 && resp.data.Status) {
				    		vm.companiesList = resp.data.Company;
				    	}
				    });
			   }
		  }
		  
		  function cancel() {
		    $uibModalInstance.dismiss('cancel');
		  }
	}
})();