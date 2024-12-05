;(function(){
	'use strict';
	angular.module("vdvcApp").factory("DeepLinkService",DeepLinkService );
	
	DeepLinkService.$inject = ['httpService','$deviceInfo'];
	
	function DeepLinkService(httpService,$deviceInfo) {
		var DeepLinkService = {
				createLink : createLink,
				checkLinkExists : checkLinkExists,
				updateLinkType : updateLinkType,
				updateDigestName : updateDigestName,
				updateDigestDescription : updateDigestDescription,
				saveBannerImg : saveBannerImg,
				getLinkById : getLinkById,
				getLinkByUid : getLinkByUid,
				openLink : openLink,
				getAllLinksByTarget : getAllLinksByTarget,
				deleteLink : deleteLink,
				updateLink : updateLink,
				isCpToClipSupported : $deviceInfo.isSafari ? false : true,
				getExternalMetaTags : getExternalMetaTags,
				updateDigestDocAnnot  : updateDigestDocAnnot,
		};
		
		return DeepLinkService;
		
		function createLink(linkInfo) {
			 return httpService.httpPost("link/create",linkInfo);
		}
		
		function checkLinkExists(linkInfo) {
			 return httpService.httpPost("link/checkLinkExists",linkInfo);
		}
		
		function updateLinkType(postData) {
			 return httpService.httpPost("link/updateLinkType",postData);
		}
		
		function updateDigestName(postData) {
			 return httpService.httpPost("link/updateDigestName",postData);
		}
		
		function updateDigestDescription(postData) {
			 return httpService.httpPost("link/updateDigestDescription",postData);
		}
		
		function saveBannerImg(postData) {
			 return httpService.httpPost("link/saveBannerImg",postData);
		}
		
		function getLinkById(id,clientId) {
			 return httpService.httpGet("link/get/"+clientId+"/"+id);
		}
		
		function getLinkByUid(uid,clientId) {
			return httpService.httpGet("link/get/unique/"+clientId+"/"+uid);
		}
		
		function openLink(id) {
			 return httpService.httpPost("link/get/encrypt",{"encryptedId":id});
		}
		
		function getExternalMetaTags(postdata) {
			 return httpService.httpPost("link/getExternalMetaTags",postdata);
		}
		
		function getAllLinksByTarget(postdata) {
			 return httpService.httpPost("link/get/all",postdata);
		}
		
		function deleteLink(link,clientId) {
			return httpService.httpDelete("link/delete/"+clientId,link);
		}
		
		function updateLink(link,clientId) {
			return httpService.httpPost("link/update/"+clientId,link);
		}
		
		function updateDigestDocAnnot(linkInfo) {
			 return httpService.httpPost("link/updateDigestDocAnnot",linkInfo);
		}
	}
	
})();

