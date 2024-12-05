;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('DocPropertiesController',DocPropertiesController);
	
	DocPropertiesController.$inject = ['$scope', '$uibModalInstance','$uibModal','source','DocFactory','_','appData','docTypes','docSubTypes','SecFilingService','MessageService','EvernoteService','$confirm'];

	function DocPropertiesController($scope, $uibModalInstance,$uibModal,source,DocFactory,_,appData,docTypes,docSubTypes,SecFilingService,MessageService,EvernoteService,$confirm) {
		var vm = this;
		var appdata = appData.getAppData();
		// Instance variables
		vm.source = source;
		vm.isSourceOwnr = false;
		vm.sourceCopy = angular.copy(source);
		vm.properTiesForm = {
			$visible: false
		};
		vm.ismultiFormOpen = false;
		vm.VDVCNoteOccured = false;
		vm.companiesList = [];
		vm.docTypes = angular.copy(docTypes);
		vm.docSubTypes = angular.copy(docSubTypes);
		vm.selectedDocSubTypes = [];
		
		vm.selectedTicker = {'tickerObj':{
											"ticker": "Varies"
										 }
							};
		vm.selectedDocType = {'docType':{
											"type": "Varies",
											"label": "Varies",
										}
							 };
		vm.selectedDocSubType = {'docType':{}};
		
		var isFolderExist = _.findWhere(vm.sourceCopy,{"_type":"Folder"});
		var nonEditableDocPropTypes = angular.copy(DocFactory.nonEditableDocPropTypes);
		
		// Methods
		vm.onEdit = onEdit;
		vm.multiPropsEdit = multiPropsEdit;
		vm.showDocPropsOnEdit = showDocPropsOnEdit;
		vm.refreshTickers = refreshTickers;
		vm.onDocTypeSelect = onDocTypeSelect;
		vm.showDocSubType = showDocSubType;
		vm.cancelEdit = cancelEdit;
		vm.ok = ok;
		vm.cancel = cancel;
		vm.clear = clear;
		vm.isDocTypeEditable = isDocTypeEditable;
				
		if(vm.sourceCopy.length > 1){
			vm.multiPropsEdit();
		}
				
		function isNonEditableDocTypeSelected() {
			var status = false;
			_.each(nonEditableDocPropTypes,function(docType){
				var nonEditableDoctypeObj = _.findWhere(vm.sourceCopy,{"docType" : docType})
				if(!_.isEmpty(nonEditableDoctypeObj)) {
					status = true;
				}
			});
			return status;
		}
		function onEdit ($event) {
			
			vm.sourceCopy = angular.copy(source);
			if(vm.sourceCopy && vm.sourceCopy.length == 1) {
				vm.sourceCopy[0].editable = !vm.sourceCopy[0].editable;
			}
			
			vm.selectedTicker.tickerObj = {
				    "id": "1",
				    "ticker": vm.sourceCopy[0].ticker,
				    "companyName" : vm.sourceCopy[0].companyName,
				    "cik" : vm.sourceCopy[0].cik
				  };
			
			if(!isFolderExist) {
				if(!_.contains(nonEditableDocPropTypes, vm.sourceCopy[0].docType)) {
					vm.selectedDocType.docType = _.findWhere(vm.docTypes,{"type":vm.sourceCopy[0].docType});	
					if(vm.sourceCopy[0].docType === "CompanyDoc") {
						onDocTypeSelect();
					}
				} else{
					vm.selectedDocType.docType = {'type':vm.sourceCopy[0].docType};
				}
				
			}
			
			vm.ismultiFormOpen = false;
			vm.properTiesForm.$visible = true;
		}
		
		function getSelectedTicker(){
			var matchedTickersList = _.where(vm.sourceCopy, {"cik": vm.sourceCopy[0].cik});
			if(matchedTickersList.length > 0 && matchedTickersList[0].cik !== null && matchedTickersList[0].cik !== "") {
				if(vm.sourceCopy.length == matchedTickersList.length) {
					return {
					    "id": "1",
					    "ticker": vm.sourceCopy[0].ticker,
					    "companyName" : vm.sourceCopy[0].companyName,
					    "cik" : vm.sourceCopy[0].cik
					  };
				} else{
					return {'ticker':'Varies'};
				}
			} else{
				return {'ticker':'Varies'};
			}
		}
		
		function multiPropsEdit () {
			vm.sourceCopy = angular.copy(source);
						
			vm.selectedTicker.tickerObj = getSelectedTicker();
			
			var docTypeMatchedSource = _.where(vm.sourceCopy,{"docType":vm.sourceCopy[0].docType});
			
			if(!isFolderExist) {
				if(vm.sourceCopy.length == docTypeMatchedSource.length) {
					var selectedDocType = _.findWhere(vm.docTypes,{"type":vm.sourceCopy[0].docType});
					if(!_.contains(nonEditableDocPropTypes, vm.sourceCopy[0].docType) && selectedDocType) {
						vm.selectedDocType.docType = angular.copy(selectedDocType);
						if(vm.sourceCopy[0].docType === "CompanyDoc") {
							onDocTypeSelect();
						}
					}
				}
			}
			
			vm.ismultiFormOpen = true;
			vm.properTiesForm.$visible = true;
			
		}
		
		function showDocPropsOnEdit() {
			var status=false;
			if(!vm.ismultiFormOpen && !isFolderExist) {
				status=true;
			}
			return status;
		}
		
		function showFolderSyncProp() {
			var status=false;
			if(isFolderExist && !vm.ismultiFormOpen) {
				status=true;
			}
			return status;
		}
		
		function showFolderSyncPropOnEdit() {
			var status=false;
			if(isFolderExist && vm.properTiesForm.$visible && !vm.ismultiFormOpen) {
				status=true;
			}
			return status;
		}
		
		function refreshTickers(searchKey) {
		    if(!_.isEmpty(searchKey)) {
				SecFilingService.getCompaniesList({"searchTxt":searchKey}).then(function(resp){
					if(resp.status == 200 && resp.data.Status) {
						vm.companiesList = resp.data.Company;
					}
				});
			}
		}
		
		function onDocTypeSelect () {
			if(vm.selectedDocType.docType.type) {
				var tempSelectedDocSubTypes = vm.docSubTypes[vm.selectedDocType.docType.type];
				if(!_.isEmpty(tempSelectedDocSubTypes)) {
					vm.selectedDocSubTypes = tempSelectedDocSubTypes;
					if(!_.isEmpty(vm.sourceCopy[0].subType)) {
						var selectedDocSubTypeObject = _.findWhere(vm.selectedDocSubTypes,{"type":vm.sourceCopy[0].subType});
						vm.selectedDocSubType.docType = selectedDocSubTypeObject;
					}
				} else {
					vm.selectedDocSubTypes = [];
					vm.selectedDocSubType.docType = {};
				}
			} 
		}
		
		function showDocSubType () {
			var status = false;
			if((vm.selectedDocType.docType.type === "CompanyDoc" && vm.properTiesForm.$visible) || (vm.sourceCopy[0].docType === "CompanyDoc" && !vm.properTiesForm.$visible)) {
				status = true;
			}
			return status;
		}
		
		function cancelEdit() {
			vm.properTiesForm.$visible = false;
		}
		
		function ok() {
			//MessageService.showErrorMessage("WRK_IN_PROGRESS_ERR");
			var postdata = {};
			var objIdList=[];
			
			for(var i= 0; i < vm.sourceCopy.length;i++) {
				var objIdObj = {
						'objectId' :vm.sourceCopy[i].id,
						'objectType' :vm.sourceCopy[i]._type,
						'clientId' : (vm.sourceCopy[i]._type == "Folder") ? appdata["OrganizationId"] : vm.sourceCopy[i].clientId
					};
				objIdList.push(objIdObj);
			}
			postdata.objectList = objIdList;
			
			if(vm.sourceCopy.length == 1) {
				
				postdata.displayName = vm.sourceCopy[0].displayName;
				postdata.isPrivate = vm.sourceCopy[0]["private"].toString();
				postdata.isEditable = (!vm.sourceCopy[0]["editable"]).toString();
			}
			
			if(vm.selectedTicker.tickerObj && vm.selectedTicker.tickerObj.ticker != 'Varies') {
				postdata.ticker = vm.selectedTicker.tickerObj.ticker;
				postdata.companyName = vm.selectedTicker.tickerObj.companyName;
				postdata.cik = vm.selectedTicker.tickerObj.cik;
			} else {
				postdata.ticker = "";
				postdata.companyName = "";
				postdata.cik = "";
			}
			if(vm.selectedDocType.docType.type != "Varies") {
				postdata.docType = vm.selectedDocType.docType.type;
				if(!_.isEmpty(vm.selectedDocSubType.docType.type)) {
					postdata.subType = vm.selectedDocSubType.docType.type;
				} else {
					postdata.subType = "";
				}
			}
			
			
			
/*			if(vm.selectedTicker.tickerObj.ticker != 'Varies' || vm.selectedDocType.docType.type != "Varies") {
				$uibModalInstance.close({"modified":postdata,"original":source});
			} else{
				cancel();
			}*/
			$uibModalInstance.close({"modified":postdata,"original":source});
		}

		function cancel() {
			$uibModalInstance.dismiss('cancel');
		}
		
		function clear($event) {
			if($event) {
				$event.stopPropagation(); 
			}
		    vm.selectedTicker.tickerObj = null;
		}
		
		function isDocTypeEditable(type) {
			var status = false;
			if(isFolderExist) {
				return status;
			}
			switch(type) {
			case "VdVc":
				status = !vm.ismultiFormOpen && _.contains(nonEditableDocPropTypes, vm.selectedDocType.docType.type);
				break;
			case "nonVdVc":
				status = !isNonEditableDocTypeSelected();
				break;
			}
			return status;
		}
	}	
	
})();