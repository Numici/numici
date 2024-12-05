;(function() {
angular.module('vdvcApp').controller('EditUserNameController',EditUserNameController);
	
	EditUserNameController.$inject = ['$scope','$uibModalInstance','_','userService','MessageService','appData','userinfo'];
	
	function EditUserNameController($scope,$uibModalInstance,_,userService,MessageService,appData,userinfo) {
		
		var eunc = this;
		var appdata = appData.getAppData();
		//variables
		eunc.showErrorMessage = false;
		eunc.errorMessage = "";
		eunc.firstNameError = false;
		eunc.firstNameErrorMessage = "";
		eunc.lastNameError = false;
		eunc.lastNameErrorMessage = "";
		eunc.editUserNameHeader = angular.copy(userService.editUserNameHeader);
		eunc.firstName = !_.isEmpty(userinfo["FirstName"]) ? userinfo["FirstName"] : null;
		eunc.lastName = !_.isEmpty(userinfo["LastName"]) ? userinfo["LastName"] : null;
		
		//methods
		eunc.validateFirstName = validateFirstName;
		eunc.validateLastName = validateLastName;
		eunc.enableUpdate = enableUpdate;
		eunc.ok = ok;
		eunc.cancel = cancel;
				
		function hideErrorMessage() {
			eunc.showErrorMessage = false;
			eunc.errorMessage = "";
		}
		
		function validateFirstName() {
			hideErrorMessage();
			if(_.isEmpty(eunc.firstName)) {
				eunc.firstNameErrorMessage = "Please Enter Valid First Name.";
				eunc.firstNameError = true;
			} else {
				eunc.firstNameError = false;
				eunc.firstNameErrorMessage = "";
			}
		}
		
		function validateLastName() {
			hideErrorMessage();
			if(_.isEmpty(eunc.lastName)) {
				eunc.lastNameErrorMessage = "Please Enter Valid Last Name.";
				eunc.lastNameError = true;
			} else {
				eunc.lastNameError = false;
				eunc.lastNameErrorMessage = "";
			}
		}
		
		function enableUpdate() {
			var status = true;
			if((!_.isEmpty(eunc.firstName)) && (!_.isEmpty(eunc.lastName))) {
				status = false;
			} else {
				status = true;
			}
			return status;
		}
		
		function ok () {
			hideErrorMessage();
			var postdata = {};
			postdata['firstName'] = eunc.firstName;
			postdata['lastName'] = eunc.lastName;
			userService.updateUserName(postdata).then( function(resp) {
				if(resp.status && resp.data.Status) {
					$uibModalInstance.close(resp.data);	
				}
			});
		}
	  
		function cancel () {
			$uibModalInstance.dismiss('cancel');
	    }
		
	}
})();