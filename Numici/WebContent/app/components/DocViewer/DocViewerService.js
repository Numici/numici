;(function() {
	
	angular.module("vdvcApp").factory("DocViewerService",DocViewerService);
	
	DocViewerService.$inject = ['httpService','$http',"_","$window",'urlParser','$location','localStorageService','commonService'];
	
	function DocViewerService(httpService,$http,_,$window,urlParser,$location,localStorageService,commonService) {
		
		var DocViewerService = {
				docViewModeData : {},
				getDocViewer : getDocViewer,
				getDocUrl : getDocUrl,
		};
		
		
		return DocViewerService;
		
		function getDocViewer(mimeType) {
			var mimeMap = commonService.mimeMap;
			var viewer = "<text-doc-viewer></text-doc-viewer>";
			
			try{
				var fileType = mimeMap[mimeType.toLowerCase()];
				switch(fileType) {
				case "pdf":
					viewer = "<od-pdf-viewer></od-pdf-viewer>";
					break;
				case "word":
				case "excel":
				case "ppt":
					viewer = "<office-doc-viewer></office-doc-viewer>";
					break;
				case "image":
				case "video":
					viewer = "<canvas-viewer></canvas-viewer>";
					break;
				}
			}catch(e){
				
			}
			return viewer;
		}
		
		
		function getDocUrl(mimeType,clientId,fileId) {
			var mimeMap = commonService.mimeMap;
			var context = commonService.getContext();
			var defaultUrl = context+'api/notes/upload/view/'+fileId+"/"+clientId;
			
			try{
				var fileType = mimeMap[mimeType.toLowerCase()];
				switch(fileType) {
				case "word":
				case "excel":
				case "ppt":
					defaultUrl = 'https://docs.google.com/viewer?embedded=true&url='+context+'GoogleDocViewer?fileId='+fileId+"%26clientId="+clientId;
					//defaultUrl = context+'api/onedrive/officeViewer?id='+fileId;
					break;
				case "image":
				case "video":
					defaultUrl = context+'GoogleDocViewer?fileId='+fileId+"&clientId="+clientId;
					//defaultUrl = 'https://docs.google.com/viewer?embedded=true&url='+context+'/GoogleDocViewer?fileId='+fileId+"%26clientId="+clientId;
					//defaultUrl = context+'api/onedrive/officeViewer?id='+fileId;
					break;
				case "text":
					break;
				}
			}catch(e) {
				console.log("mimeType  error");
			}
			
			return defaultUrl;
			
		}
	}

})();