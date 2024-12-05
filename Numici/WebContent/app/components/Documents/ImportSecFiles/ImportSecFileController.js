;(function() {
	'use strict'; 
	
	angular.module('vdvcApp').controller('ImportSECModalCtrl',ImportSECModalCtrl);
	
	ImportSECModalCtrl.$inject = ['$scope', '$uibModalInstance','SECImportFactory','_','filterFilter','SecFilingService'];
	
	function ImportSECModalCtrl($scope, $uibModalInstance,SECImportFactory,_,filterFilter,SecFilingService) {

		  $scope.folderName = '';
		  
		  $scope.SECFilings = null;
		  
		  $scope.format = 'MM/dd/yyyy';
		  
		  $scope.limit = 50;
		  
		  $scope.dateOptions = {
				  formatYear: 'yy',
				  startingDay: 1
		  };

		  $scope.loadMore = function() {
			  $scope.limit = $scope.limit+50;
		  };
		  
		  $scope.SECSeach = {
				  "formGroup":"",
				  "fromDateFiled":"",
				  "toDateFiled":"",
				  "formType":"10-Q",
				  "companyName":"",
				  "cik" : ''
		  };
		  
		  function getFormGroup(formType) {
			  var group = null;
			  switch(formType) {
				  case '10-Q':
				  case '10-Q/A':
				  case '10-QT':
				  case '10-QT/A':
					  group = '10-Q';
					  break;
				  case '10-K':
				  case '10-K/A':
				  case '10-KT':
				  case '10-KT/A':
					  group = '10-K';
					  break;
				  case '8-K':
				  case '8-K/A':
				  case '8-K12B':
				  case '8-Q12G3':
				  case '8-Q12G3/A':
					  group = '8-K';
					  break;
			  }
			  
			  return group;
		  }
		  
		  $scope.getSecForms = function() {
			  return ["10-Q","10-Q/A","10-QT","10-QT/A","10-K","10-K/A","10-KT","10-KT/A","8-K","8-K/A","8-K12B","8-K12G3","8-K12G3/A"];
		  };
		  
		  $scope.refreshCompanyNames = function(searchKey) {
			   if(!_.isEmpty(searchKey)) {
				   return SecFilingService.getCompaniesList({"searchTxt":searchKey}).then(function(resp){
				    	if(resp.status == 200 && resp.data.Status) {
				    		var cnames = _.map(resp.data.Company, function(obj){ 
				    			return obj.companyName; 
				    		});
				    		return cnames;
				    	}
				    });
			   }
		  } ;
		  
		  $scope.StartDt = {
		    opened: false
		  };
		  
		  $scope.startDtOpen = function($event) {
			    $scope.StartDt.opened = true;
		  };	
		  
		  $scope.EndDt = {
				opened: false
		  };
				  
		  $scope.endDtOpen = function($event) {
			    $scope.EndDt.opened = true;
		  };	
		  
		  
		  $scope.isSearchDisabled = function() {
			  var formType = $scope.SECSeach['formType'];
			  return (formType && formType.trim() !='' ) ? false : true;
		  };
		  
		  $scope.searchForSECFilings = function() {
			  var postdata = {};
			  $.each($scope.SECSeach,function(key,val){
				  if (!_.isEmpty(val) || _.isDate(val) ) {
					  if (key == 'formType') {
						  postdata['formGroup'] = getFormGroup(val);
					  } 
					  postdata[key] = val;
				  } 
			  });
			  if (postdata['formGroup']) {
				  SECImportFactory.getSECFilings(postdata).success(function(result){
					  if (result.Status) {
						  $scope.SECFilings = result.Data;
					  }
				  });
			  }
		  };
		  
		  $scope.ok = function () {
			  var formGroup = getFormGroup($scope.SECSeach['formType']);
			  if (formGroup && $scope.secFileSelected) {
				  $uibModalInstance.close({
					  "formGroup" : formGroup,
					  "filingId" : $scope.secFileSelected.id
				  });
			  }
			  
		  };

		  $scope.cancel = function () {
		    $uibModalInstance.dismiss('cancel');
		  };
		  
		  $scope.setSECfile = function(secFile) {
			  $scope.secFileSelected = secFile;
		  };
		  
		  // selected SECFilings
		  $scope.selection = [];

		  // helper method to get selected SECFiling
		  $scope.selectedFruits = function selectedFilings() {
		    return filterFilter($scope.SECFilings, { selected: true });
		  };

		  // watch SECFiling for changes
		  $scope.$watch('SECFilings|filter:{selected:true}', function (nv) {
			if (nv) {
				$scope.selection = nv.map(function (filing) {
				      return filing.id;
				});
			}
		  }, true);
	}
})();