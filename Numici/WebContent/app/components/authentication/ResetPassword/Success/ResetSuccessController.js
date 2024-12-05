;(function(){
	'use strict';
	
	angular.module("vdvcApp").controller("ResetSuccessController",ResetSuccessController);
	
	ResetSuccessController.$inject = ['_'];
	
	function ResetSuccessController(_){
		var rsc = this;
		rsc.success = "Reset Password Successful";
	}
})();