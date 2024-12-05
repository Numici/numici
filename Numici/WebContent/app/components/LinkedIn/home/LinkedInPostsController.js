;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('LinkedInPostsController',LinkedInPostsController);
	
	LinkedInPostsController.$inject = ['$state','$scope','appData','_','$confirm','LinkedInService','MessageService',
	                           '$uibModal','$timeout','userService','orderByFilter','$window'];
	
	function LinkedInPostsController($state,$scope,appData,_,$confirm,LinkedInService,MessageService,$uibModal,$timeout,userService,orderByFilter,$window) {
		var lipc = this;
		var appdata = appData.getAppData();
		var userFields = LinkedInService.newUserFields;
		var guestUserRequest = LinkedInService.guestUserRequest;
		// Instance variables
		lipc.currentUser = appdata.UserId;
		lipc.linkedInUserName = "";
		lipc.linkedInUserId = "";
		lipc.linkedInUserEmailId = "";
		lipc.postsHeaders = angular.copy(LinkedInService.postsHeaders);
		lipc.searchString = "";
		lipc.linkedInPostsList = [];
		lipc.totalPostsCount = 0;
		lipc.linkedInPostsLimit = 20;
		lipc.linkedInPostsBegin = 0;
		lipc.linkedInAuthCreatedDate = "";
		lipc.linkedInAuthExpiryDate = "";
		lipc.linkedInAuthExpired = false;
		lipc.linkedInReAuthMessage = "";
		lipc.linkedInReAuthUrl = "";
		
		//Methods
		lipc.searchStringFilter = searchStringFilter;
		lipc.reAuthorizeLinkedIn = reAuthorizeLinkedIn;
		lipc.revokeLinkedInAuth = revokeLinkedInAuth;
		lipc.loadMoreLinkedInPosts = loadMoreLinkedInPosts;
		
		var loadTimer;
		var increment = 20;
		function loadMoreLinkedInPosts(inview) {
			 if(inview ) {
				 $timeout.cancel(loadTimer);
				 loadTimer = $timeout(function(){
					 if(lipc.linkedInPostsList && lipc.linkedInPostsList.length > lipc.linkedInPostsLimit) {
						if( (lipc.linkedInPostsList.length-lipc.linkedInPostsLimit) >= increment ) {
							lipc.linkedInPostsLimit += increment;
						} else {
							lipc.linkedInPostsLimit = lipc.linkedInPostsList.length;
						}
					 }
				 }, 500);
		    } 
		}
		
		function searchStringFilter(post) {
			var status = false;
			for(var i=0;i<lipc.postsHeaders.length;i++) {
				var postsHeader = lipc.postsHeaders[i];
				var fieldValue = post[postsHeader.key];
				if(lipc.searchString.trim() == "" || (postsHeader.key != "createdOn" && fieldValue && fieldValue.toLowerCase().indexOf(lipc.searchString.toLowerCase()) != -1)) {
					status = true;
					break
				}
			}
			return status;
		}
		
		function getLinkedInPostsList() {
			LinkedInService.getLinkedInPostsForUser().then(function(resp) {
				if(resp.status == 200 && resp.data.linkedInPostsList) {
					lipc.linkedInPostsList = resp.data.linkedInPostsList;
					lipc.linkedInUserName = resp.data.linkedInUserName;
					lipc.linkedInUserId = resp.data.linkedInUserId;
					lipc.linkedInUserEmailId = resp.data.linkedInUserEmailId;
					
					lipc.linkedInAuthCreatedDate = resp.data.linkedInAuthCreatedDate;
					lipc.linkedInAuthExpiryDate = resp.data.linkedInAuthExpiryDate;
					lipc.linkedInAuthExpired = resp.data.linkedInAuthExpired;
					if(lipc.linkedInAuthExpired) {
						lipc.linkedInReAuthMessage = resp.data.linkedInReAuthMessage;
						lipc.linkedInReAuthUrl = resp.data.linkedInReAuthUrl;
					}
					_.each(lipc.linkedInPostsList,function(post){
						lipc.totalPostsCount = lipc.linkedInPostsList.length;
						var timer = $timeout(function() {
							var elmnt = document.querySelector(".user-details.selected");
							if(elmnt) {
								elmnt.scrollIntoView();
							}
							$timeout.cancel(timer);
				        }, 1000);
					});
				}
			});
		}
		
		function reAuthorizeLinkedIn() {
			$window.location.href = lipc.linkedInReAuthUrl;
		}
		
		function revokeLinkedInAuth() {
			var text = "Are you sure you want to REVOKE Authorization for LinkedIn";
			$confirm({text: text})
		        .then(function() {
		        	LinkedInService.revokeAuthPerms().then(function(resp) {
						if(resp.status == 200 && resp.data.Status) {
							appData.setAppData("hasLinkedInAuth",false);
							userService.goToHomePage();
							MessageService.showSuccessMessage("BACKEND_SUC_MSG",["LinkedIn  Authorization revoked successfully"]);
						} else {
							MessageService.showErrorMessage("ADMINISTRATION_ERR",[resp.data.Message]);
						}
					});
		        });
		}
		
		function init() {
			getLinkedInPostsList();
		}
		
		init();
	}
	
})();