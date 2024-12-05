;(function(){
	'use strict';
	angular.module("vdvcApp").controller("MarkCompanyPresentationController",MarkCompanyPresentationController);
	
	MarkCompanyPresentationController.$inject = ['$scope','cpObj','CompanyPresentationService','$uibModalInstance','_','MessageService'];
	
	function MarkCompanyPresentationController($scope,cpObj,CompanyPresentationService,$uibModalInstance,_,MessageService){
		var mrkcp = this;
		mrkcp.saveBtnLable = "YES";
		mrkcp.includeVal = cpObj.type;
		mrkcp.cpDoc = angular.copy(cpObj.obj);
		mrkcp.docTypes = angular.copy(CompanyPresentationService.CPDocTypes);
		mrkcp.subTypes = angular.copy(CompanyPresentationService.CPDocSubTypes);
		mrkcp.showTypes = showTypes;
		mrkcp.showDocSubTypes = false;
		mrkcp.docTypSelcted;
		mrkcp.subTypSelcted;
		mrkcp.comment = " ";
		
		mrkcp.onDocTypeChange = onDocTypeChange;
		mrkcp.ok = save;
		mrkcp.cancel = cancel;
		
		function init() {
			mrkcp.docTypSelcted =  _.isEmpty(mrkcp.cpDoc.docType) ? mrkcp.docTypes[0].value :  mrkcp.cpDoc.docType;
			mrkcp.subTypSelcted =  _.isEmpty(mrkcp.cpDoc.subCategory) ?  mrkcp.subTypes[0].value :  mrkcp.cpDoc.subCategory;
			onDocTypeChange();
		}
		
		function showTypes() {
			if(mrkcp.includeVal == "yes") {
				mrkcp.saveBtnLable = "SAVE";
				return true;
			}
			return false;
		}
		
		function isCompanyDocument() {
			var flag = false;
			if(mrkcp.docTypSelcted === "Company Document") {
				flag = true;
			}
			return flag;
		}
		
		function onDocTypeChange() {
			mrkcp.showDocSubTypes = isCompanyDocument();
		}
		
		function save() {
			
			var changes = {
					"type" : mrkcp.includeVal,
					"comment" : ""
			};
			
			if(!_.isEmpty(mrkcp.docTypSelcted)) {
				changes.docType = mrkcp.docTypSelcted;
			}

			if(!_.isEmpty(mrkcp.subTypSelcted)) {
				changes.subCategory = mrkcp.subTypSelcted;
			}
			
			if(mrkcp.cpDoc.id) {
				changes["id"] = mrkcp.cpDoc.id;
			} else {
				if(mrkcp.cpDoc.attributes && mrkcp.cpDoc.attributes._id) {
					changes["esid"] = mrkcp.cpDoc.attributes._id;
				}
			}
			
			if(mrkcp.includeVal != "yes") {
				delete changes.docType;
				delete changes.subCategory;
			}else if(!isCompanyDocument()) {
				delete changes.subCategory;
			}
			
			$uibModalInstance.close({"changes" : changes});
		}
		
		function cancel() {
			$uibModalInstance.dismiss('cancel');
		}
		
		init();
	}
	
})();