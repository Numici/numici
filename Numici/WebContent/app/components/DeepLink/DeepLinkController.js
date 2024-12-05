;(function() {
	
	angular.module("vdvcApp").controller('DeepLinkController',DeepLinkController);
	
	DeepLinkController.$inject = ['$scope','$state','$stateParams',
	        'linkInfo','commonService','DeepLinkService','_','$timeout'];
		
	function DeepLinkController($scope,$state,$stateParams,linkInfo,
			commonService,DeepLinkService,_,$timeout) {
		
		var lc = this;
		var redirectToTarget = redirectToTarget;
		
		if($stateParams.donotShowNavBar) {
			commonService.hideNaveBar();
			/*document.querySelector('nav').style.display = "none";
			var timer = $timeout(function() {
				document.querySelector('.container-fluid').style.padding = "0px";
				document.querySelector('.container-fluid').children[0].style.padding = "0px";
 	 			$timeout.cancel(timer);
	        }, 1000);*/
		}
		
		function redirectToTarget() {
			if(linkInfo.status == 200 && linkInfo.data.Status) {
				var info = linkInfo.data.Link.info;
				if(!_.isEmpty(info)) {
					commonService.linkInfo = info;
					switch(info.objectType) {
					case 'Document':
					case 'DocumentObj':
						$state.go("docview",{"docId":info.linkObjectId,"clientId":linkInfo.data.Link.clientId});
						break;
					case 'DocAnnotation':
						if(info.context == "document") {
							$state.go("docview",{
								"docId":info.linkObjectId,
								"clientId":linkInfo.data.Link.clientId,
								"commentId":info.annotationId
							});
						} else if(info.context == "taskspace") {
							$state.go('taskspace.list.task',{
								"tsId": info.tsId, 
								"tsc": info.tscid, 
								"d":info.linkObjectId,
								"dc":linkInfo.data.Link.clientId,
								"da":info.annotationId
							});
						}
						break;
					case 'FolderObj':
						$state.go("docs",{"folderId":info.linkObjectId});
						break;
					case 'Taskspace':
						$state.go('taskspace.list.task',{"tsId": info.linkObjectId,"tsc": linkInfo.data.Link.clientId,d:null,dc:null,da:null});
						break;
					case 'AnnotationDigest':
					case 'DigestDocument' :
						$state.go('digestlink',{"linkId": info.id,"linkClientId": linkInfo.data.Link.clientId});
						break;
					}
				}
			}
		}
		
		redirectToTarget();
	}
		
})();

