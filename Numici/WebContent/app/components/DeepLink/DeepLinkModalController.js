;(function() {
	
	angular.module("vdvcApp").controller('DeepLinkModalController',DeepLinkModalController);
	
	DeepLinkModalController.$inject = ['$scope','$state','$uibModalInstance','DeepLinkService',
		'clipboard','sourceInfo','APIUserMessages','_','$deviceInfo'];
		
	function DeepLinkModalController($scope,$state,$uibModalInstance,DeepLinkService,
			clipboard,sourceInfo,APIUserMessages,_,$deviceInfo) {
		
		var dl = this;
		var linkInfo = {
				objectType : sourceInfo.type,
				linkUniqueId : sourceInfo.uid,
				linkObjectId : sourceInfo.obj.id,
				clientId : sourceInfo.obj.clientId,
				pageNumber : sourceInfo.pageNumber,
				coordinates : sourceInfo.coordinates,
				text : null,
				cellReference : sourceInfo.cellReference,
				workspaceId : sourceInfo.workspaceId,
				annotationId : sourceInfo.annotationId,
				commentId : sourceInfo.commentId,
				linkType : 'Private',
				properties : {
					
				}    
		};
		
		
		// variables 
		
		dl.deviceInfo = $deviceInfo;
		dl.text = sourceInfo.obj.displayName;
		dl.isPublic = false;
		dl.lnkPublicMsg = 'Note that anyone with the public link will be able to\
			read this document but will not be able to write or add comments or \
			access any other information in the system';
		dl.isLinkCreated = false;
		dl.modalTitle = "Create Link";
		dl.focusLink = false;
		dl.linkInfo = {};
		//public methods
		dl.cancel = cancel;
		dl.ok = ok;
		dl.copySuccess = copySuccess;
		dl.copyFail = copyFail;
		
		function createLink() {
			var linkInfo = processLinkInfo();
			DeepLinkService.createLink(linkInfo).then(function(createLinkResp) {
				if(createLinkResp.status == 200 && createLinkResp.data.Status) {
					dl.linkInfo.url = createLinkResp.data.Link.url;
					dl.linkInfo.linkType = linkInfo.linkType;
					dl.linkInfo.id = createLinkResp.data.Link.id;
					dl.linkInfo.text = linkInfo.text;
					dl.modalTitle = "Link";
					dl.isLinkCreated = true;
					dl.focusLink = true;
					
					var cbData = {
							"link" : dl.linkInfo.url,
							"id":dl.linkInfo.id,
							"linkObj":dl.linkInfo ,
							"isCopied" : false
						};
					if(typeof sourceInfo.linkOnCreate == 'function') {
						sourceInfo.linkOnCreate(cbData);
					}
				}
			});
		}
		
		function ok() {
			if(typeof sourceInfo.linkBeforeCreate == 'function') {
				sourceInfo.linkBeforeCreate({
					onDocSaveSuccess : function() {
						createLink();
					},
					onDocSaveFail : function() {
						$($scope.iframedoc.body).find( 'span[link-sourceId="'+uid+'"]' ).contents().unwrap();
						contentChanged = false;
					}
				});
			} else {
				createLink();
			}
			
		}
		
		function cancel() {
			 if(dl.linkInfo.url) {
				 $uibModalInstance.close({"link" : dl.linkInfo.url,"id":dl.linkInfo.id,"linkObj":dl.linkInfo ,"isCopied" : false}); 
			 } else {
				 $uibModalInstance.dismiss('cancel'); 
			 }
		}
		
		function copySuccess() {
			dl.focusLink = false;
			APIUserMessages.info("Link copied to clipboard.");
			dl.focusLink = true;
			//$uibModalInstance.close({"link" : dl.linkInfo.url,"id":dl.linkInfo.id,"linkObj":dl.linkInfo,"isCopied" : true});
		}
		
		function copyFail() {
			
		}
		
		function processLinkInfo() {
			var info = {};
			_.each(linkInfo,function(val,key) {
				if(val && !_.isEmpty(val)) {
					info[key] = val;
				}
				if(key == "pageNumber" && val > -1) {
					info[key] = val;
				}
			});
			
			info["linkType"] = dl.isPublic ? "Public" : "Protected";
			
			if(!_.isEmpty(dl.text)) {
				info["text"] = dl.text;
			} else if(sourceInfo.type == "Document") {
				info["text"] = sourceInfo.obj.displayName;
			}
			info["context"] = sourceInfo.context;
			return info;
		}
	}
		
})();

