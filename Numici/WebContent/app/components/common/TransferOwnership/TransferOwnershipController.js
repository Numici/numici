;(function() {
	'use strict'; 
	
	angular.module('vdvcApp').controller('TransferOwnershipController',TransferOwnershipController);
	
	TransferOwnershipController.$inject = ['$rootScope','$scope','$uibModalInstance','_','items','transferFor',
	                             'appData','userService','DocFactory','TaskSpaceService','$uibModal','$confirm'];
	
	function TransferOwnershipController($rootScope,$scope,$uibModalInstance,_,items,transferFor,appData,
			userService,DocFactory,TaskSpaceService,$uibModal,$confirm) {
		
		 var toc = this;
		 var appdata = appData.getAppData();
		 toc.transferFor = transferFor;
		 toc.loggedInUser = appdata.UserId;
		 toc.items = items;
		 toc.userPerms = {};
		 toc.userPerms.users = [];
		 toc.Users;
		 toc.isFormSubmiting = false;
		 toc.retainNoPerms = false;
		 toc.noPermsLable = "Retain no permissions";
		 toc.permSet;
		 toc.userPerms.grantedPerms = [];
		 toc.sharePropagateLable = "Sharable";
		 toc.propagateShare = true;
		 toc.disablePropagateShare = true;
		 
		 toc.getSelectedUserName = getSelectedUserName;
		 toc.cancel = cancel;
		 toc.transferOwneship = transferOwneship;
		 toc.selectPerms = selectPerms;
		 
		 userService.getAllUsers().then(function(resp){
			 if(resp.status == 200 && resp.data.Status) {
				 toc.Users = resp.data.Users;
			 }
		 });
		 
		 function getPermissionSet() {
			if(!_.isEmpty($rootScope.permissions)&& !_.isEmpty($rootScope.permissions["Taskspace"])) {
				 toc.permSet = $rootScope.permissions["Taskspace"];
				 toc.userPerms.grantedPerms = [toc.permSet[2].name];
			}
		 }
		 
		 function getSelectedUserName(user) {
			 var userName = "";	
			 if(user) {
				 if(!_.isEmpty(user.firstName) && !_.isEmpty(user.lastName)) {
					 userName = user.firstName+" "+user.lastName;
				 } else if(_.isEmpty(user.firstName) && _.isEmpty(user.firstName)) {
					 userName = user.loginId;
				 } else if(!_.isEmpty(user.firstName)) {
					 userName = user.firstName;
				 } else if(!_.isEmpty(user.lastName)) {
					 userName = user.lastName;
				 }
			 }
			 return userName;
		 }
		 
		 function cancel() {
			 $uibModalInstance.dismiss('cancel');
		 }
		 
		 function transferDocsOwneship(transferOwneshipPostData) {
			 DocFactory.transferOwneship(transferOwneshipPostData).then(function(resp){
				 if(resp && resp.status == 200 && resp.data.Status) {
					 toc.isFormSubmiting = false;
					 $uibModalInstance.close(resp.data.resultList);
				 }
			 },function(error) {
				 toc.isFormSubmiting = false;
			 });
		 }
		 
		 var phase = 1;
		 function prepareForTransferTSOwneshipPhase2(transferOwneshipPostData,docsInfo,slackConnection,slackReason) {
			 var modalInstance = $uibModal.open({
				  animation: true,
			      templateUrl: 'app/components/common/TransferOwnership/ConfirmTransferTSOwnership/ConfirmTransferTSOwnership.html',
			      controller: 'ConfirmTransferTSOwnershipController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'cttsoc',
			      backdrop: 'static',
			      size: 'md',
			      resolve: {
			    	  docsInfo : function() {
			    		  return docsInfo;
			    	  },
					  slackInfo : function() {
						  var slackInfo = {"connection" : slackConnection};
						  if(slackConnection == "CannotTransfer") {
							  slackInfo["reason"] = slackReason;
						  }
			    		  return slackInfo;
			    	  }
			      }
			 });
			 modalInstance.result.then(function (result) {
				 if(!_.isEmpty(result.selectedDocIds)) {
					 transferOwneshipPostData["documents"] = result.selectedDocIds;
				 }
				 transferOwneshipPostData["slackConnection"] = result.slackConnection;
				 phase = 2;
				 transferOwneshipPostData["phase"] = phase;
				 transferTSOwneship(transferOwneshipPostData)
			 }, function () {
				 $uibModalInstance.dismiss('cancel');
			 });
		 }
		 
		 function transferTSOwneship(transferOwneshipPostData) {
			 TaskSpaceService.transferTSOwnership(transferOwneshipPostData).then(function(resp){
				 if(resp && resp.status == 200 && resp.data.Status) {
					 toc.isFormSubmiting = false;
					 if(phase == 1 && _.isEmpty(resp.data.documents) && resp.data.slackConnection == "None") {
						  var text = "Are you sure do you want to transfer ownership to '"+transferOwneshipPostData.newOwner+"'?";
						  $confirm({text: text}).then(function() {
							  phase = 2;
							  transferOwneshipPostData["phase"] = phase;
							  transferTSOwneship(transferOwneshipPostData);
				  		  }, function() {
						    	
						  });
					 } else if(phase == 1 && (!_.isEmpty(resp.data.documents) || (resp.data.slackConnection != "None" && resp.data.slackConnection != ""))) {
						 prepareForTransferTSOwneshipPhase2(transferOwneshipPostData,resp.data.documents,resp.data.slackConnection,resp.data.slackReason);
					 }
					 
					 if(phase == 2) {
						 $uibModalInstance.close(resp.data.Status);
					 }
				 }
			 },function(error) {
				 toc.isFormSubmiting = false;
			 });
		 }
		 
		 function transferOwneship() {
			 if(!_.isEmpty(toc.userPerms.users)) {
				 toc.isFormSubmiting = true;
				 var transferOwneshipPostData = {
						 "newOwner" : toc.userPerms.users[0]
				 };
				 var itemList = [];
				 if(!toc.retainNoPerms) {
					 transferOwneshipPostData["permissions"] = toc.userPerms.grantedPerms[0];
					 transferOwneshipPostData["isPropagateShare"] = toc.propagateShare;
				 }
				 if(toc.transferFor.type == "Documents") {
					 for(var i= 0; i < toc.items.length;i++) {
						 var item = {};
						 item = {
							 "objectType" : toc.items[i]._type
						 };
						 if(toc.items[i]._type == "Folder") {
							 item["folderId"] = toc.items[i].id;
							 item["clientId"] = appdata['OrganizationId'];
						 } else {
							 item["documentId"] = toc.items[i].id;
							 item["clientId"] = toc.items[i].clientId;
						 }
						 itemList.push(item);
					 }
					 transferOwneshipPostData["objectList"] = itemList;
					 transferDocsOwneship(transferOwneshipPostData);
				 } else if(toc.transferFor.type == "Taskspace") {
					 transferOwneshipPostData["taskspaceId"] = toc.items[0].id;
					 transferOwneshipPostData["clientId"] = toc.items[0].clientId;
					 transferOwneshipPostData["phase"] = phase;
					 transferTSOwneship(transferOwneshipPostData);
				 }
			 }
		  }
		 
		 function selectPerms (selected){
			 if(selected.toLowerCase() == "edit") {
				 toc.propagateShare = true;
				 toc.disablePropagateShare = true;
			 } else if(selected.toLowerCase() == "view" || selected.toLowerCase() == "readonly") {
				 toc.propagateShare = false;
				 toc.disablePropagateShare = false;
			 }
		 }
		 
		 getPermissionSet();
	}
})();