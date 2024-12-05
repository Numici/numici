;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('CPDetailsController',CPDetailsController);
	
	CPDetailsController.$inject = ['$scope', '$uibModalInstance',"cpObj","_"];
	
	function CPDetailsController($scope, $uibModalInstance,cpObj,_) {
		  var cpd = this;
		  cpd.title = cpObj.docName ? cpObj.docName : "Details";
		  cpd.cancel = Close;
		  cpd.cpObj = cpObj;
		  
		  function Close() {
			  $uibModalInstance.close();
		  }
		  
		  function setTypeCommentsMap() {
			  var typ = cpd.cpObj.prevTypes;
			  var cmts = cpd.cpObj.comments;
			  var TypeCommentMap = [];
			  if(_.isArray(typ) && _.isArray(cmts)) {
				  typ.push(cpd.cpObj.type);
				  cmts.splice(0, 0, " ");
			  }
			  
			  _.each(typ,function(val,i) {
				  try {
					  var obj = {};
					  obj.typ = val;
					  obj.cmt = cmts[i];
					  TypeCommentMap.push(obj);
				  } catch(e) {
					  
				  }
			  });
			  
			  cpd.cpObj.TypeCommentMap = TypeCommentMap.reverse();
		  }
		  
		  setTypeCommentsMap();
	}
})();