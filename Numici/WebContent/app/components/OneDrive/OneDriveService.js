;(function() {
	
	angular.module("vdvcApp").factory("OneDriveService",OneDriveService);
	
	OneDriveService.$inject = ['$state','httpService','$http',"appData","_","$window",'urlParser','$location','localStorageService','commonService'];
	
	function OneDriveService($state,httpService,$http,appData,_,$window,urlParser,$location,localStorageService,commonService) {
		
		var OneDriveService = {
				//createAuthUrl: createAuthUrl,
				autherize: autherize,
				revoke: revoke,
				getRoot: getRoot,
				openFolder: openFolder,
				getDriveItem: getDriveItem,
				getExternalDocumentContent: getExternalDocumentContent,
				testItem: testItem,
				index: index,
				deleteFromIndex: deleteFromIndex,
				indexExternal: indexExternal,
				isIndexed: isIndexed,
				areIndexed: areIndexed,
				deleteExternalDocument: deleteExternalDocument,
				getFileUrl : getFileUrl,
				setIcon: setIcon,
				getOffice: getOffice,
				getConfig: getConfig,
				getUserTeams: getUserTeams,
				getTeamsUserChannels: getTeamsUserChannels,
				shareArticleOnTeams: shareArticleOnTeams,
				checkIsExcelFileExistInOneDrive : checkIsExcelFileExistInOneDrive
		};
		
		
		return OneDriveService;
		
/*		function createAuthUrl() {
			var appdata = appData.getAppData();
			if(appdata && !_.isEmpty(appdata.oneDriveAuthUrl)) {
				//return encodeURI(appdata.oneDriveAuthUrl);
				return appdata.oneDriveAuthUrl;
			}
			return null;
		}*/
		
		function autherize(includeApps,cb) {
			localStorageService.set("OneDriveAuthRequest",{
				"isAuthRequest" : true,
				"currentUrl" : $location.absUrl()
			});
			
/*			var url = createAuthUrl();
			if(url) {
				$window.location.href = url;
			}*/
			
			var postdata = {};
			postdata.apps = includeApps;
			getAuthurl(postdata).then(function(resp) {
				 if(resp.status == 200 && resp.data.Status && resp.data.OneDriveAuthUrl) {
					 var oneDriveAuthUrl = resp.data.OneDriveAuthUrl;
					 //$window.location.href = oneDriveAuthUrl;
					 if($state.current.name == "sharelinks") {
						 $window.open(oneDriveAuthUrl, '_blank');
					 } else {
						 $window.location.href = oneDriveAuthUrl;
					 }
					 if(typeof cb == "function") {
						 cb();
					 }
				 }
			});
		}
		
		function revoke(postdata) {
			return httpService.httpPost('onedrive/revoke',postdata);
		}
		
		function getOffice(postdata) {
			return httpService.httpPost('onedrive/getOfficeDocument',postdata);
		}
		
		function getConfig() {
			return httpService.httpGet('onedrive/config');
		}
		
		function getAuthurl(postdata) {
			return httpService.httpPost('onedrive/authurl',postdata);
		}
		
		function getUserTeams() {
			return httpService.httpGet('onedrive/userTeams');
		}
		
		function getTeamsUserChannels(teamId) {
			return httpService.httpGet("onedrive/userChannels/"+teamId);
		}
		
		function shareArticleOnTeams (postData) {
			return httpService.httpPost("onedrive/postArticle",postData);
		}
		
		function getRoot() {
			return httpService.httpGet('onedrive/listroot');
		}
		
		function openFolder(id) {
			return httpService.httpGet('onedrive/listFolder/'+id);
		}
		
		function getDriveItem(id) {
			return httpService.httpGet('onedrive/item/'+id);
		}
		
		function getExternalDocumentContent(postdata) {
			return httpService.httpPost('onedrive/content/external',postdata);
		}
		
		function testItem(id) {
			return httpService.httpGet('onedrive/test/'+id);
		}
		
		function index(postdata) {
			return httpService.httpPost('onedrive/index',postdata);
		}
		
		function deleteFromIndex(postdata) {
			return httpService.httpPost('onedrive/dropindex',postdata);
		}
		
		function indexExternal(postdata) {
			return httpService.httpPost('onedrive/index/external',postdata);
		}
	
		function isIndexed(postdata) {
			return httpService.httpPost('onedrive/present/external',postdata);
		}
		
		function areIndexed(postdata) {
			return httpService.httpPost('onedrive/present/external/list',postdata);
		}
		
		function deleteExternalDocument(postdata) {
			return httpService.httpDelete('onedrive/delete/external',postdata);
		}
		
		function getFileUrl(id) {
			var context = commonService.getContext();
			return context+"/api/onedrive/getOneDriveDoc/"+id;
		}
		
		function setIcon(doc) {
			doc.isIndexable = false;
			var mimeMap = commonService.mimeMap;
			var confMap = commonService.confMap;
			if(_.isString(doc.mimeType) && mimeMap[doc.mimeType.toLowerCase()]) {
				var fileType = mimeMap[doc.mimeType.toLowerCase()];
				var conf = confMap[fileType];
				doc.fileType = fileType;
				doc.icon = conf.icon;
				doc.isIndexable = conf.enableForIndex;
			} else {
				doc.icon = confMap["default"]["icon"];
			}
		}
		
		//Checks is Excel file exists in selected onedive folder
		function checkIsExcelFileExistInOneDrive(postdata) {
			return httpService.httpPost("onedrive/fileexists/",postdata);
		}
	}

})();