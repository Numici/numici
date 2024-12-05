;(function() {
	'use strict'; 
	
	angular.module('vdvcApp').controller('SharePortfolioCtrl',SharePortfolioCtrl);
	
	SharePortfolioCtrl.$inject = ['$rootScope','$scope','$q','$uibModalInstance','_','portfolios','userService','PortfolioService','MessageService','appData','$confirm'];
	
	function SharePortfolioCtrl($rootScope,$scope,$q, $uibModalInstance,_,portfolios,userService,PortfolioService,MessageService,appData,$confirm) {
		 
		var sp = this;
		var appdata = appData.getAppData();
		// Instance variables
		 sp.loggedInUser = appdata.UserId;
		 sp.items = portfolios;
		 sp.permSet;
		 sp.userPerms = {};
		 sp.userPerms.users = [];
		 sp.userPerms.grantedPerms = [];
		 sp.isPropagateShare = false;
		 sp.sharePropagateLable = "Sharable";
		 sp.sharedWith = [];
		 sp.sharedWithModel = [];
		 sp.Users=[];
		 sp.selecteditems;
		 sp.permChanged = false;
		 sp.isFormSubmiting = false;
		 
		// Methods
		 sp.ok = ok;
		 sp.cancel = cancel;
		 sp.selectPerms = selectPerms;
		 sp.revokePermissions = revokePermissions;
		 sp.checkUserType = checkUserType;
		 sp.updatePerms = updatePerms;
		 sp.changeSharedWithModel = changeSharedWithModel;
		 sp.disableSharableForManaged = disableSharableForManaged;
		 sp.cancelChangePermissions = cancelChangePermissions;
		 /*if(sp.items && sp.items.length == 1) {
			 sp.sharedWith = sp.items[0].collaborators;
			 sp.sharedWithModel = angular.copy(sp.items[0].collaborators);
		 }*/
		 		  
		function getPermissionSet() {
			/*var postdata = {};
			PortfolioService.getPortfolioPermissionSet().then(function(resp){
				 if(resp.status == 200 && resp.data.Status) {
					 sp.permSet = resp.data.Portfolio;
					 sp.userPerms.grantedPerms = [sp.permSet[0]];
				 }
			});*/
			if(!_.isEmpty($rootScope.permissions)&& !_.isEmpty($rootScope.permissions["Portfolio"])) {
				sp.permSet = $rootScope.permissions["Portfolio"];
				sp.userPerms.grantedPerms = [sp.permSet[0].name];
			}
		}
		
		function removeSharedUsers() {
			for(var i=0;i<sp.Users.length;i++) {
				 _.each(sp.items, function(item,index){
					 if( sp.items.length == 1) {
						 sp.Users = _.reject(sp.Users, function(user){ 
							 return user.loginId == sp.items[0].createdBy; 
				    	 });
					 }	
					 if( sp.sharedWith && sp.sharedWith[sp.Users[i].loginId]) {
						 sp.Users[i].hasPermission = true;
					 } else {
						 sp.Users[i].hasPermission = false;
					 }	
				  }); 
				 
			}
		}
		
		function getUsersSharedWith(cb) {
			PortfolioService.getPortfolioSharedUsers(sp.items[0].id).then(function(resp){
				 if(resp.status == 200 && resp.data.Status) {
					 sp.sharedWith = resp.data.Portfolio;
					 sp.sharedWithModel = angular.copy(resp.data.Portfolio);
					 if(typeof cb == "function") {
						 cb();
					 }
				 }
			 });			 
		 }		
		  
		 userService.getAllUsers().then(function(resp){
			 if(resp.status == 200 && resp.data.Status) {
				 sp.Users = resp.data.Users;
				 if(sp.items && sp.items.length == 1) {
					 getUsersSharedWith(removeSharedUsers);
				 } else {
					for(var i=0;i<sp.Users.length;i++) {
						 sp.Users[i].hasPermission = false;
					}
				 }
				 
			 }
		 });
		 
		 function revokePermissions(colbrtr){
			
			 if(sp.items && sp.items.length == 1) {
				 
				 var text = "Are you sure you want to revoke permission ?";
		  			$confirm({text: text})
			        .then(function() {
			        	var postdata = {
								 "portfolioId" : sp.items[0].id,
								 "userId" : colbrtr
						 };
			        	PortfolioService.unsharePortfolio(postdata).then(function(resp ) {
							if(resp.status == 200 && resp.data.Status) {
								getUsersSharedWith(removeSharedUsers);
							}
						 });
				    }, function() {
				    	
				    });
			 } 
		 }
		 
		 function cancel() {
			 $uibModalInstance.dismiss('cancel');
		 }
			  
		 function ok() {
			 if (sp.userPerms.users.length > 0 || !_.isEmpty(sp.sharedWithModel)) {
				 sp.isFormSubmiting = true;
				 var postdata = {};
				 var portfolioList = [];
				 _.each(sp.items,function(item,index) {
					 var portfolio = {};
					 portfolio["portfolioId"] = item.id;
					 var permsInfo = [];
					 for(var i=0;i<sp.userPerms.users.length;i++) {
						 var data = {};
						 data.userId = sp.userPerms.users[i];
						 data.perms = sp.userPerms.grantedPerms;
						 if(sp.isPropagateShare){
							 data.perms.push("Share");
						 }
						 permsInfo.push(data);
					 }
					 if(!_.isEmpty(sp.sharedWithModel)){
						 _.each( sp.sharedWithModel, function( val, key ) {
							 var data = {};
							 data.userId = key;
							 data.perms = val.perms;
							 if(val.isSharable){
								 data.perms.push("Share");
							 }
							 permsInfo.push(data);
						 });
					 }
					 
					 portfolio["permsInfo"] = permsInfo;
					 portfolioList.push(portfolio);
				 });
				 postdata["portfolioList"] = portfolioList;
				 if (portfolioList.length > 0) { 
					 PortfolioService.sharePortfolio(postdata).then(function(resp){
						  if(resp.status == 200 && resp.data.Status) {
							  $uibModalInstance.close(resp.data.Portfolio);
						  }
					 }).finally(function() {
						 sp.isFormSubmiting = false;
					 });
				 }
			 }
			 
		  }
		  
		 function selectPerms (selected){
			 if(!_.isEmpty(selected) && selected.toLowerCase() == "edit") {
				 sp.isPropagateShare = true;
				 sp.disablePropagateShare = true;
			 } else if(!_.isEmpty(selected) && (selected.toLowerCase() == "view" || selected.toLowerCase() == "readonly")) {
				 sp.isPropagateShare = false;
				 sp.disablePropagateShare = false;
			 }
		 }
		  
		  function checkUserType (userId) {
			  if(!_.isEmpty(sp.items[0].createdBy) && sp.items[0].createdBy.toLowerCase() == userId.toLowerCase()) {
				  return "Owner";
			  } else if(!_.isEmpty(sp.loggedInUser) && sp.loggedInUser.toLowerCase() == userId.toLowerCase()) {
				  return "LoggedInUser";
			  } else if(!_.isEmpty(sp.items[0].createdBy) && !_.isEmpty(sp.loggedInUser) && sp.items[0].createdBy.toLowerCase() != userId.toLowerCase() && sp.loggedInUser.toLowerCase() != userId.toLowerCase()) {
				  return "Shared";
			  }
		  }
		  
		  function updatePerms(user,perms) {
			  if(sp.sharedWithModel) {
				  sp.permChanged = false;
				  _.each(sp.sharedWithModel, function(element,key){
					  if(!_.isEqual(element, sp.sharedWith[key])) {
						  sp.permChanged = true;
						  return;
					  } 
				  }); 
			  }
			  
			  //var isSharable = sp.sharedWithModel[user].isSharable;
			  //sp.sharedWithModel[user] = {permissions:[perms],"isSharable":isSharable};
		  }
		  
		  function changeSharedWithModel (user,perms) {
			  if(sp.sharedWithModel) {
				  sp.permChanged = false;
				  _.each(sp.sharedWithModel, function(element,key){
					  if(!_.isEqual(element, sp.sharedWith[key])) {
						  sp.permChanged = true;
						  return;
					  }
				  }); 
			  }
		  }
		  
		  function disableSharableForManaged (userId) {
			  var status = false;
			  if(!_.isEmpty(sp.sharedWithModel[userId].perms[0]) && (sp.sharedWithModel[userId].perms[0].toLowerCase() == "view" || sp.sharedWithModel[userId].perms[0].toLowerCase() == "readonly")) {
				  sp.sharedWithModel[userId].isSharable = false;
				  status = true;
			  } else if(!_.isEmpty(sp.loggedInUser) && sp.loggedInUser.toLowerCase() == userId.toLowerCase()) {
				  status = true;
			  }
			  return status;
		  }
		  
		  function cancelChangePermissions () {
			 if(sp.sharedWithModel) {
				  sp.permChanged = false;			  
				  _.each(sp.sharedWithModel, function(element,key){
					  if(!_.isEqual(element, sp.sharedWith[key])) {
						  sp.sharedWithModel[key] = angular.copy(sp.sharedWith[key]);
					  } 
				  }); 
			  }
		  }
			 
		  getPermissionSet();
		  
	}
	
})();