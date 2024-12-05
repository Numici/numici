;(function(){
	'use strict';
	
	angular.module("vdvcApp").factory("DocFactory",DocFactory);
	
	DocFactory.$inject = ['httpService','appData','_','commonService',"userService","$window","$uibModal"];
	
	function DocFactory(httpService,appData,_,commonService,userService,$window,$uibModal) {
		
		var docActionProps = {
				"Share": {type:"DocActionProps",action:"share",title:"Share",show:false,class:"fa-users"},
				"Index": {type:"DocActionProps",action:"index",title:"Index Docs",show:false,class:"fa-list-ol"},
				"UnIndex": {type:"DocActionProps",action:"unindex",title:"Unindex docs",show:false,class:"fa-list-ol text-danger"},
		        "Tag" : {type:"DocActionProps",action:"tag",title:"Tag",show:false,class:"fa-tag fa-flip-horizontal"},
		        "AddToTaskspace" : {type:"DocActionProps",action:"addToTaskspace",title:"Add To Taskspace",show:false,class:"fa-tasks"},
		        "AssociatedTaskspace" : {type:"DocActionProps",action:"associatedTaskspaces",title:"Associated Taskspace",show:false,class:"fa-tasks"},
		        "Rename" : {type:"DocActionProps",action:"rename",title:"Rename",show:false,class:"fa-pencil"},
		        "Delete" : {type:"DocActionProps",action:"delete",title:"Delete",show:false,class:"fa-trash-o"},
		        "MoveTo" : {type:"DocActionProps",action:"move to",title:"Move to...",show:false,class:"fa-share"},
		        "Properties" : {type:"DocActionProps",action:"properties",title:"Properties",show:false,class:"fa-info"},
		        "Copy" : {type:"DocActionProps",action:"copy",title:"Copy",show:false,class:"fa-copy"},
		        "Sync" : {type:"DocActionProps",action:"sync",title:"Connect with Evernote Notebook",show:false,class:"fl fl-evernote"},
		        "evernoteSync" : {type:"DocActionProps",action:"evernotesync",title:"Sync with Evernote Notebook",show:false,class:"fa-refresh"},
		        "boxSync" : {type:"DocActionProps",action:"boxsync",title:"Sync with Box",show:false,class:"fa-dropbox"}
		    };
		 
		var trashActionProps = {
				"Delete" : {type:"DocActionProps",action:'delete',title:"Delete",show:false,class:"fa-trash-o"},
		        "MoveTo" : {type:"DocActionProps",action:"move to",title:"Move to...",show:false,class:"fa-share"},
		       // "Properties" : {type:"DocActionProps",action:"properties",title:"Properties",show:false,class:"fa-info"}
		    };
        
        

		
	var fileIconMap = {
			"doc" :"fa fa-file-word-o",
			"docx" :"fa fa-file-word-o",
			"pdf" :"fa fa-file-pdf-o",
			"xls" :"fa fa-file-excel-o",
			"xlsx" :"fa fa-file-excel-o",
			"pptx" :"fa fa-file-powerpoint-o",
			"ppt" :"fa fa-file-powerpoint-o",
			"jpeg" :"fa fa-file-image-o",
			"jpg" :"fa fa-file-image-o",
			"png" :"fa fa-file-image-o",
			"gif" :"fa fa-file-image-o",
			"xml" : "fa fa-file-code-o",
			"txt" : "fa fa-file-text-o",
			"zip" : "fa  fa-file-zip-o",
			"rar" : "fa  fa-file-zip-o"
			
	};
	
	var extFileIconMap = {
			"box" :"fl fl-box",
			"dropbox" :"fl fl-dropbox",
			"evernote" :"fl fl-evernote",
			"onedrive" :"fl fl-onedrive"
	};
	  
	 var uploadDocTypes = [{
			"type": "CompanyDoc",
			"label": "Company Documents"
		},{
			"type": "Sell-SideReport",
			"label": "Sell-Side Reports"
		},{
			"type": "Transcript",
			"label": "Transcripts"
		},{
			"type": "WebClip",
			"label": "Web Clip"
		},{
			"type": "OtherDoc",
			"label": "Other Documents"
		}];
	 
	 var uploadDocSubTypes = {
	    "CompanyDoc":[
		{
			"type": "Presentation",
			"label": "Presentations"
		},{
			"type": "PressRelease",
			"label": "Press Releases"
		},{
			"type": "Other",
			"label": "Other"
		}]};
	 
	 var ModifiedDtModel = {
				"datePublished":{
					"fromDate" : null,
					"toDate": null
				}
		};
	
	 var SearchQuery = {
			    "searchString" : "",
			    "userId":'',
			    "enterprises" : [],
			    "entityTypes":[],
			    "advancedInputs" : {
					"tags" :[],
					"subtypes": [],
					'documentName': null,
					"documentType":[],
					'dates' :[],
					'tickers' : [],
					'isGlobal': false,
					'myDocuments':false,
					'sharedWithMe':false,
					'annotatedDocs':false,
					'sort' : {}
					
			}   
		};
	 
	 
	 
	 var fldrlistHeaders = [
	                  {
	                	  "label":"Name",
	                	  "value":"name",
	                	  "DValue":"name",
	                	  "checked" : true,
		                  "type" : "text",
		                  "class" : "col-md-4"
	                  },{
	                	  "label":"Created By",
	                	  "value":"createdBy",
	                	  "DValue":"createdBy",
	                	  "checked" : true,
		                  "type" : "text",
		                  "class" : "col-md-3"
	                  },{
	                	  "label":"Type",
	                	  "value":"_type",
	                	  "DValue":"_type",
	                	  "checked" : true,
	                	  "type" : "text",
	                	  "class" : "col-md-2"
	                  },/*{
	                	  "label":"Size",
	                	  "value":"contentLength",
	                	  "DValue":"displaySize",
	                	  "checked" : true,
	                	  "type" : "text",
	                	  "class" : "col-md-3"
	                  }    */
	            ];
				
	 var doclistHeaders = [
	 		                  {
	 		                	  "label":"Name",
	 		                	  "value":"displayName",
	 		                	  "DValue":"displayName",
	 		                	  "checked" : true,
	 		                	  "type" : "text",
	 		                	  "class" : "col-md-3"
	 		                  },{
	 		                	  "label":"Created By",
	 		                	  "value":"createdBy",
	 		                	  "DValue":"createdBy",
	 		                	  "checked" : true,
	 		                	  "type" : "text",
	 		                	  "class" : "col-md-2"
	 		                  },{
	 		                	  "label":"DocType",
	 		                	  "value":"docType",
	 		                	  "DValue":"docType",
	 		                	  "checked" : true,
	 		                	  "type" : "text",
	 		                	  "class" : "col-md-1"
	 		                  },{
	 		                	  "label":"Ticker",
	 		                	  "value":"ticker",
	 		                	  "DValue":"ticker",
	 		                	  "checked" : true,
	 		                	  "type" : "text",
	 		                	  "class" : "col-md-1"
	 		                  },{
	 		                	  "label":"Date Created",
	 		                	  "value":"createdOn",
	 		                	  "DValue":"createdOn",
	 		                	  "checked" : true,
	 		                	  "type" : "Date",
	 		                	  "class" : "col-md-2"
	 		                  },{
	 		                	  "label":"Last Modified",
	 		                	  "value":"modifiedOn",
	 		                	  "DValue":"modifiedOn",
	 		                	  "checked" : true,
	 		                	  "type" : "Date",
	 		                	  "class" : "col-md-2"
	 		                  },{
	 		                	  "label":"Size",
	 		                	  "value":"contentLength",
	 		                	  "DValue":"displaySize",
	 		                	  "checked" : true,
	 		                	  "type" : "text",
	 		                	  "class" : "col-md-1"
	 		                  }
	 		            ];
	 	var nonEditableDocPropTypes = ["VidiViciNotes","EvernoteNotes","SECFile","SECCompareFile","WebResource","EMail"];
	 	
	 	
	    var fileImgIconMap = {
				"doc" :"fl fl-docx",
				"docx" :"fl fl-docx",
				"pdf" :"fl fl-pdf",
				"xls" :"fl fl-xlx",
				"xlsx" :"fl fl-xlx",
				"pptx" :"fl fl-ppt",
				"ppt" :"fl fl-ppt",
				"jpeg" :"fl fl-img",
				"jpg" :"fl fl-img",
				"png" :"fl fl-img",
				"gif" :"fl fl-img",
				"xml" : "fl fl-txt",
				"txt" : "fl fl-txt"
		};
	    
		var DocFactory = {
				sizePrecision : 2,
				highlighter : null,
				fileIconMap : fileIconMap,
				docViweStyle : "Grid",
				uploadDocTypes : uploadDocTypes,
				uploadDocSubTypes : uploadDocSubTypes,
				ModifiedDtModel : ModifiedDtModel,
				SearchQuery : SearchQuery,
				fldrlistHeaders : fldrlistHeaders,
				doclistHeaders : doclistHeaders,
				nonEditableDocPropTypes : nonEditableDocPropTypes,
				
				docActionProps : docActionProps,
				trashActionProps :trashActionProps,
				
				getDocButtons : getDocButtons,
				
				getFileIcon : getFileIcon,
				getFileImgIcon : getFileImgIcon,
				getExtFileIcon : getExtFileIcon,
				getRootFolder : getRootFolder,
				CreateFolder : CreateFolder,
				CreateNote: CreateNote,
				
				getAllDocs : getAllDocs,
				
				getDocsUnderFolderWithInfo : getDocsUnderFolderWithInfo,
				getDocsUnderFolder : getDocsUnderFolder,
				
				getDocLocation: getDocLocation,
				
				getAllOwnedFolders : getAllOwnedFolders,
				getDocHierarchy : getDocHierarchy,
				getDocById : getDocById,
				download : download,
				
				getPublicDocById : getPublicDocById,
				
				getDocLock : getDocLock,
				removeDocLock : removeDocLock,
				closeDocument : closeDocument,
				getDocForComment : getDocForComment,
				saveDocumentOnMultiMode : saveDocumentOnMultiMode,
				clearDocument : clearDocument,
				refreshDocument : refreshDocument,
				
				indexOrUnIndexDocs : indexOrUnIndexDocs,
				saveDocument : saveDocument,
				saveDocumentAsPdf : saveDocumentAsPdf,
				downloadDocumentAsPdf : downloadDocumentAsPdf,
				autoSaveDocument : autoSaveDocument,
				updateDocProperties : updateDocProperties,
				isDocPresent : isDocPresent,
				isDocPresentList : isDocPresentList,
				renameFolder : renameFolder,
				createDownLoadFolder : createDownLoadFolder,
				getDownloadFolder : getDownloadFolder,
				moveToFolder : moveToFolder,
				
				renameDocument : renameDocument,
				shareItems :shareItems,
				shareItemsToProvisionalUsers : shareItemsToProvisionalUsers,
				shareDocument : shareDocument,
				shareFolder : shareFolder,
				unShareDocument : unShareDocument,
				unShareFolder : unShareFolder,
				getUserPermsOnFolder : getUserPermsOnFolder,
				getUserPermsOnDoc : getUserPermsOnDoc,
				getSharedUsersForDoc : getSharedUsersForDoc,
				getSharedUsersForFolder : getSharedUsersForFolder,
				deleteFolder : deleteFolder,
				getDocPermissionSet : getDocPermissionSet,
				getFolderPermissionSet : getFolderPermissionSet,
				toggleFolderPrivate : toggleFolderPrivate,
				deleteDocument : deleteDocument,
				deleteItems : deleteItems,
				deleteItemsPermanently : deleteItemsPermanently,
				searchPdf : searchPdf ,
				getFolderbyId : getFolderbyId,
				createHighlighter : createHighlighter,
				removeHighlights : removeHighlights,
				highlightTextByRegex : highlightTextByRegex,
				goToHighlightedSnippet : goToHighlightedSnippet,
				revertHighlights : revertHighlights,
				setDocTypeBooleanFlags : setDocTypeBooleanFlags,
				setDocPermissions : setDocPermissions,
				exportTable : exportTable,
				copyDocList : copyDocList,
				transferOwneship : transferOwneship,
				
				isNumiciFolder : isNumiciFolder,
				isDropBoxFolder : isDropBoxFolder,
				isBoxFolder : isBoxFolder,
				isoneDriveFolder: isoneDriveFolder,
				
				isExternalDocPresent : isExternalDocPresent,
				sortAnnotationsByTextPosition : sortAnnotationsByTextPosition,
				getDocAssociatedToTaskspace : getDocAssociatedToTaskspace
		};
		
		return DocFactory;
		
		
		
		function getDocButtons() {
	    	var docButtonsList = [];
			var docButtons = userService.getUserSettingsKeyList("researchView_");
			if(!_.isEmpty(docButtons)) {
				_.each(docButtons,function(item){
					var docButton = {};
					switch(item) {
						case "researchView_AddDocument":	
						case "researchView_AddNote":
						case "researchView_AddFolder":
						case "researchView_AddLinkFolder":
						case "researchView_Upload":
						case "researchView_OpenSEC":
							docButton = userService.getUiSetting(item,"modal");
							if(docButton.show) {
								docButtonsList.push(docButton);
							}
							break;
						case "researchView_SwitchCardListView":
							docButton = userService.getUiSetting(item);
							if(docButton.show) {
								docButtonsList.push(docButton);
							}
							break;
						case "researchView_TrashFolder":
							docButton = userService.getUiSetting(item,"route");
							if(docButton.show) {
								docButtonsList.push(docButton);
							}
							break;
					}
					
				});
			}
			return docButtonsList;
	    }
		
		function getFileIcon(name){
			var fileType = name.split('.').pop();
			var fileIcon = DocFactory.fileIconMap[fileType];
			if (!fileIcon) {
				fileIcon = DocFactory.fileIconMap['txt'];
			}
			return fileIcon;
		}
		
		function getFileImgIcon(name,docType) {
			var fileIcon = fileImgIconMap["txt"];
			if(docType && docType.toLowerCase() == "vidivicinotes") {
				//do nothing
			} else if(docType && docType.toLowerCase() == "notes") {
				fileIcon = "fl fl-notes";
			} else if(docType && docType.toLowerCase() == "webresource") {
				fileIcon = "fl fl-chrome";
			} else if(docType && docType.toLowerCase() == "webclip") {
				fileIcon = "fl fl-webclip";
			} else if(docType && docType.toLowerCase() == "email") {
				fileIcon = "fl fl-email";
			} else if(docType && docType.toLowerCase() == "secfile") {
				fileIcon = "fl fl-sec";
			} else {
				if(name && name.indexOf(".") != -1){
					var fileType = name.split('.').pop();
					fileIcon = fileImgIconMap[fileType.toLowerCase()];
				}
			}
			return fileIcon;
		}
		
		function getExtFileIcon(type){
			return extFileIconMap[type];
		}
		
		function getRootFolder(userId) {
	        return httpService.httpPost("folder/setroot",userId);
	    }
	    
		function CreateFolder(postdata) {
	        return httpService.httpPost("folder/create",postdata);
	    }
	    
	    function CreateNote(postdata) {
	        return httpService.httpPost("notes/add",postdata);
	    }
	    
	    function getAllDocs(folderId) {
	    	//return httpService.httpGet("folder/list/"+folderId+"/"+userId);
	    	return httpService.httpGet("folder/list/all/"+folderId);
	    }
	    
	    function getDocsUnderFolderWithInfo(folderId) {
	    	var fldrWithallInfo = {
			 		"isTagsRequired" : true,
			 		"isAnnotationStatusRequired" : true,
			 		"isSharableStatusRequired" : true,
			 		"isEvernoteSyncInfoRequired" : true
			 };
	    	return httpService.httpPost("folder/list/"+folderId,fldrWithallInfo);
	    }
	    
	    function getDocsUnderFolder(folderId) {
	    	var fldrWithSharableStatus = {
			 		"isTagsReqired" : false,
			 		"isAnnotationStatusRequired" : false,
			 		"isSharableStatusRequired" : true
			 };
	    	return httpService.httpPost("folder/list/"+folderId,fldrWithSharableStatus);
	    }
	    
	    function getDocLocation(docId,clientId) {
	    	return httpService.httpGet("notes/folderpath/"+docId+"/"+clientId);
	    }
	    
	    function getAllOwnedFolders() {
	    	return httpService.httpGet("folder/list/ownedFolders");
	    	
	    }
	    
	    function getDocHierarchy(folderId,cb) {
	    	httpService.httpGet("folder/parents/"+folderId).then(function(response) {
	    		var hierarchy;
	    		if(response.status == 200 && response.data.Status) {
	       			
	       			hierarchy = response.data.Folders;
	       			_.each(hierarchy,function(fldr,index) {
	       				fldr._type = "Folder";
	       			});
	       			if(hierarchy.length > 4) {
	       				var dummyFoldr = {
	       					    "id" : null,
	       					    "name" : "...",
	       					    "isDummy" : true,
	       					    "ownerId" : null,
	       					    "root" : false,
	       					    "trash" : false,
	       					    "parentFolderId" : null
	       					};
	       				hierarchy.splice(1, 0, dummyFoldr); 
	       			}
	       		}
	    		
	    		if(typeof cb == "function") {
	    			cb(hierarchy);
	    		}
	    	});
	    }
	    
	    function getDocById(docId,clientId) {
	    	if(!clientId) {
	    		clientId = 'g';
	    	}
	    	return httpService.httpGet("notes/get/"+docId+"/"+clientId);
	    }
	    
	    function getPublicDocById(id) {
	    	return httpService.httpGet("publicAPI/getPublicDoc/"+id);
	    }
	    
	    function getDocLock(docId,clientId,duration) {
	    	return httpService.httpGet("notes/lock/"+docId+"/"+clientId+"?duration="+duration);
	    }
	    
	    function removeDocLock(docId,clientId) {
	    	return httpService.httpGet("notes/unlock/"+docId+"/"+clientId);
	    }
	    
	    function closeDocument(docId,postdata) {
	    	return httpService.httpPost("notes/close/"+docId,postdata);
	    }
	    
	    function getDocForComment(postdata) {
	    	return httpService.httpPost("notes/getforcomment",postdata);
	    }
	    
	    function saveDocumentOnMultiMode(postdata) {
	    	return httpService.httpPost("notes/savecomment/"+postdata.id,postdata,{ ignoreLoadingBar: true});
	    }
	    
	    function clearDocument(docId) {
	    	return httpService.httpPost("notes/cleardocument/"+docId);
	    }
	    
	    function refreshDocument(postdata) {
	    	return httpService.httpPost("notes/refresh/",postdata,{ ignoreLoadingBar: true});
	    }
	    
	    function indexOrUnIndexDocs(data ) {
	    	return httpService.httpPost("folder/changeindexdocs",data);
	    }
	    
	    function saveDocument(document ) {
	    	return httpService.httpPost("notes/add",document,{ ignoreLoadingBar: true});
	    }
	    
	    function saveDocumentAsPdf(postdata ) {
	    	return httpService.httpPost("notes/htmltopdf",postdata);
	    }
	    
	    function downloadDocumentAsPdf(postdata ,options) {
	    	return httpService.httpPost("notes/htmltopdf/stream",postdata,options);
	    }
	    
	    function autoSaveDocument(document) {
	    	return httpService.httpPost("notes/save",document,{ ignoreLoadingBar: true});
	    }
	    
	    function updateDocProperties(document ) {
	    	return httpService.httpPost("notes/updListOfDocProperties",document);
	    }
	    
	    function isDocPresent(postdata ) {
	    	return httpService.httpPost("notes/present",postdata);
	    }
	    
	    function isDocPresentList(postdata ) {
	    	return httpService.httpPost("notes/presentList",postdata);
	    }
	    
	    function renameFolder(postdata ) {
	    	return httpService.httpPost("folder/rename",postdata);
	    }
	    
	    function createDownLoadFolder(cb) {
	    	  var appdata = appData.getAppData();
	    	  var postdata = {
					 "folderName" : "Downloads",
					 "parentFolderId" : appdata.rootFolderId,
					 "isPrivate" : false,
					 "isEditable" : true
			  };
			  DocFactory.CreateFolder(postdata).then(function(resp){
				  if (resp.status == 200 && resp.data.Status) {
					  
					  if(typeof cb == 'function') {
						  cb(resp);
					  }
				  }
			  });
		}
	    
	    function getDownloadFolder() {
	    	return httpService.httpGet("folder/getDownloadFolder");
	    }
	    
	   /* function moveToFolder(item,newParent,type) {
	    	if(type == "Folder") {
	    		return httpService.httpPost("folder/move/"+item.id+"/"+newParent.id,{});
	    	} else if(type == "Document") {
	    		return httpService.httpPost("notes/move/"+item.id+"/"+newParent.id,{});
	    	}
	    	
	    }*/
	    
	    function moveToFolder(postdata) {
	    	return httpService.httpPost("notes/moveObjectList",postdata);
	    }
	    
	    function renameDocument(postdata ) {
	    	return httpService.httpPost("notes/rename",postdata);
	    }
	    
	    function shareItems(postdata) {
	    	return httpService.httpPost("notes/shareObjectList", postdata);
	    }
	    
	    function shareItemsToProvisionalUsers(postdata) {
	    	return httpService.httpPost("user/shareObjectListToProvisionalUser", postdata);
	    }
	    
	    function shareDocument(docId,postdata ) {
	    	return httpService.httpPost("notes/permissions/assign/"+docId,JSON.stringify(postdata));
	    }
	    
	    function shareFolder(fldrId,postdata ) {
	    	return httpService.httpPost("folder/permissions/assign/"+fldrId,JSON.stringify(postdata));
	    }
	    
	    
	    function unShareDocument(docId,clientId,postdata ) {
	    	return httpService.httpPost("notes/permissions/remove/"+docId+"/"+clientId,JSON.stringify(postdata));
	    }
	    
	    function unShareFolder(fldrId,postdata ) {
	    	return httpService.httpPost("folder/permissions/remove/"+fldrId,JSON.stringify(postdata));
	    }
	    
	    function getUserPermsOnFolder(fldrId ) {
	    	return httpService.httpGet("folder/permissions/"+fldrId);
	    }
	    
	    function toggleFolderPrivate(postdata) {
			return httpService.httpPost("folder/toggle/private",postdata);
		}
	    
	    function getUserPermsOnDoc(docId,clientId) {
	    	return httpService.httpGet("notes/permissions/"+docId+"/"+clientId);
	    }
	    
	    function getSharedUsersForDoc(docId,clientId) {
	    	return httpService.httpGet("notes/shared/users/"+docId+"/"+clientId);
	    }
	    
	    function getSharedUsersForFolder(fldrId) {
	    	return httpService.httpGet("folder/shared/users/"+fldrId);
	    }
	    
	    
	    function getDocPermissionSet() {
	    	return httpService.httpGet("notes/permissions");
	    }
	    
	    function getFolderPermissionSet() {
	    	return httpService.httpGet("folder/permissions");
	    }
	    
	    function deleteFolder(id,data ) {
	    	return httpService.httpDelete( "folder/delete/"+id,data);
	    }
	    
	    function deleteDocument(id,data ) {
	    	return httpService.httpDelete("notes/delete/"+id,data);
	    }
	    function deleteItemsPermanently(postdata) {
	    	return httpService.httpPost("notes/deleteObjectList",postdata);
	    }
	    function deleteItems(postdata) {
	    	return httpService.httpPost("notes/trashObjectList",postdata);
	    }
	    
	    
	    function searchPdf(postdata ) {
	    	return httpService.httpPost("notes/pdf/search",postdata);
	    }
	    
	    function getFolderbyId(Folders,id) {
			var folder;
			if( _.isArray(Folders)) {
				_.each(Folders,function(val,i){
					if (val.id == id) {
						folder = val;
						return false;
					}
				});
			}
			return folder;
		}
		
		
		function createHighlighter(el) {
			if (DocFactory.highlighter) {
				DocFactory.highlighter.destroy();
			}
			DocFactory.highlighter = new TextHighlighter(el);
			return DocFactory.highlighter;
		}
		
		function removeHighlights() {
			if (DocFactory.highlighter) {
				DocFactory.highlighter.removeHighlights();
			}
		}
		
		function highlightTextByRegex(el,snippets,Scrolloffset) {
			
			/*var highlights = $(el).find('span.highlighted');
			$(highlights).contents().unwrap();*/
			
			var keysInSnippets = {};
			
			if (_.isArray(snippets)) {
				_.each(snippets,function(snippet,index) {
					
					var div = $('<div/>');
					div.html(snippet.string);
					//var text = div.text();
					
					var text = snippet.string;
					
					var keys = div.find('em');
					keysInSnippets[index] = keys;
					
					text = text.replace(new RegExp("<em>", 'g'), "")
					 .replace(new RegExp("</em>", 'g'), "")
					 .replace("(\\r|\\n|\\r\\n)+", "\\n")
					 .replace(/\r\n|\r|\n/g," ");
					
					var finder = findAndReplaceDOMText(el, {
						 // preset: 'prose',
						  find: text,
						  wrap: 'span',
						  className : "highlighted snippet_"+index,
						  id: index,
						  styles : {
							 // background : "rgba(255, 255, 0, 0.4)"
						  },
						  processMatchCallBack : function(node,matches) {
							  var m=[];
							  if(matches && matches.length > 0) {
								  for(var i =0; i < matches.length; i++) {
									  var match = matches[i];
									  var uId = "st_"+match.startIndex+"end_"+match.endIndex;
									  var isExists = node.getElementsByClassName(uId);
									  
									  if(isExists.length == 0) {
										 m.push(match);
										 break;
									  } 
								  }
							  }
							  
							  return m;
						  }
					});
				});
				
				if(commonService.selectedSnippet && snippets.length > commonService.selectedSnippet) {
					DocFactory.goToHighlightedSnippet(el,commonService.selectedSnippet,Scrolloffset);
				} else {
					DocFactory.goToHighlightedSnippet(el,0,Scrolloffset);
				}
				
			}
			
			var highlights = $(el).find('span.highlighted');
			_.each(keysInSnippets,function(keys,i){
				_.each(highlights,function(node,index) {
					_.each(keys,function(key,ind){
						var finder = findAndReplaceDOMText(node, {
							 // preset: 'prose',
							  find: new RegExp("\\b"+$(key).text()+"\\b", 'g'),
							  wrap: 'em',
							  className : "key key_"+ind,
							  id: index,
							  styles : {
								  color: 'rgb(4, 34, 244)',
							      fontWeight: 'bold'
							  },
							  processMatchCallBack : function(node,matches) {
								  var m=[];
								  if(matches && matches.length > 0) {
									  for(var i =0; i < matches.length; i++) {
										  var match = matches[i];
										  var uId = "st_"+match.startIndex+"end_"+match.endIndex;
										  var isExists = node.getElementsByClassName(uId);
										  
										  if(isExists.length == 0) {
											 m.push(match);
											 break;
										  } 
									  }
								  }
								  return m;
							  }
							  
						});
					});
				});
			});	
		}
		
		
		function goToHighlightedSnippet(el,index,Scrolloffset) {
			
			$(el).find(".slct_snippet").removeClass("slct_snippet");
			var highlights = $(el).find('span.snippet_'+index);
			if (highlights.length > 0) {
				/*$(el).scrollTop(0);
				highlights.addClass("slct_snippet");
				$(el).scrollTop( $(highlights[0]).offset().top-Scrolloffset );*/
				highlights.addClass("slct_snippet");
				highlights[0].scrollIntoView(true);
				$(el).scrollTop($(el).scrollTop()-Scrolloffset);
			}
		}
		
		function revertHighlights(el) {
			
			$(el).find("span.highlighted").contents().unwrap();
			$(el).find("em.key").contents().unwrap();
			$(el).find("span.transient").contents().unwrap();
			$(el).find("span.note.note_slctd").removeClass("note_slctd");
			$(el).css("width","");
			/*$(el).find(".deep-link-from-info").remove();
			$(el).find(".row").remove();
			$(el).find(".deep-link-label").remove();
			$(el).find(".deep-link-colon").remove();
			$(el).find(".deep-link-content").remove();
			$(el).find('span.linkHandler').parent().remove();*/
			
			//temp fix for empty p and tilte nodes
			//$(el).find("> p:empty").remove();
			$(el).find("> title:empty").remove();
			return $(el).html();
		}
		
		function setDocTypeBooleanFlags(doc) {
			if(doc.docType) {
				
				doc.vidiviciNotes = false;
				doc.secFile = false;
				doc.secCompareFile = false;
				doc.webResource = false;
				
				switch(doc.docType) {
				case "VidiViciNotes":
				case "EvernoteNotes":
					doc.vidiviciNotes = true;
					break;
				case "WebResource":
					doc.webResource = true;
					break;
				case "SECFile":
					doc.vidiviciNotes = true;
					doc.secFile = true;
					break;
				case "SECCompareFile":
					doc.vidiviciNotes = true;
					doc.secCompareFile = true;
					doc.secFile = true;
					break;
				case "WebClip":
					if (_.isString(doc.contentType) && doc.contentType.toLowerCase() == 'application/pdf') {
						doc.vidiviciNotes = false;
					} else {
						doc.vidiviciNotes = true;
						doc.webClip = true;
						if(!_.isEmpty(doc.evernoteGuid)) {
							doc.evernoteWebClip = true;
						} else {
							doc.extensionWebClip = true;
						}
					}
					break;
				case "OtherDoc" :
					break;
				}
			}
		}
		
		function setDocPermissions(doc) {
			var appdata = appData.getAppData();
			var perms = {
					'owner' : false,
					'edit' : false,
					'view' : false,
					'delete' : false,
				};
			var loginUser = _.isString(appdata.UserId) ? appdata.UserId.trim() : "";
			var docOwner = _.isString(doc.createdBy)  ? doc.createdBy.trim() : "";
			var areEqual = loginUser.toUpperCase() === docOwner.toUpperCase();
			   
/*			if(areEqual) {
			    doc.isOwner = true;
			} else {
			    doc.isOwner = false;
			}
			*/
			
			if(doc.permissions) {
				perms.share = false;
				if(doc.isSharable) {
					perms.share = true;
				}
				if(_.indexOf(doc.permissions, "Owner") != -1) {
					perms.owner = true;
					perms.edit = true;
					perms.view = true;
					perms['delete'] = true;
					doc.isOwner = true;
				} else if(_.indexOf(doc.permissions, "Edit") != -1) {
					perms.owner = false;
					perms.edit = true;
					perms.view = true;
					perms['delete'] = false;
				} else if(_.indexOf(doc.permissions, "View") != -1) {
					perms.owner = false;
					perms.edit = false;
					perms.view = true;
					perms['delete'] = false;
				} else if(_.indexOf(doc.permissions, "ReadOnly") != -1) {
					perms.owner = false;
					perms.edit = false;
					perms.view = false;
					perms['delete'] = false;
					perms.readonly = true;
				}
			} 
			
			doc.perms = perms;
		}
		
		function isDropBoxFolder(folder) {
			return (!angular.isUndefined(folder.dropBoxPath) && folder.dropBoxPath !== null);
		}
		
		function isBoxFolder(folder) {
			return (!angular.isUndefined(folder.boxId) && folder.boxId !== null);
		}
		
		function isoneDriveFolder(folder) {
			return (!angular.isUndefined(folder.oneDriveId) && folder.oneDriveId !== null);
		}
		
		function isNumiciFolder(folder) {
			var status = true;
			if(isDropBoxFolder(folder) || isBoxFolder(folder) || isoneDriveFolder(folder)) {
				status = false;
			}
			return status;
		}
		
		function isDropBoxDocPresent(selectedObjects) {
			var status = false;
			var dropBoxDoc = _.findWhere(selectedObjects,{"docSource" : "DropBox"});
			if(dropBoxDoc) {
				status = true;
			}
			return status;
		}
		
		function isBoxDocPresent(selectedObjects) {
			var status = false;
			var boxDoc = _.findWhere(selectedObjects,{"docSource" : "Box"});
			if(boxDoc) {
				status = true;
			}
			return status;
		}
		
		function isOnedriveDocPresent(selectedObjects) {
			var status = false;
			var onedriveDoc = _.findWhere(selectedObjects,{"docSource" : "OneDrive"});
			if(onedriveDoc) {
				status = true;
			}
			return status;
		}
		
		function isExternalDocPresent(selectedObjects) {
			var status = false;
			if(isDropBoxDocPresent(selectedObjects) || isBoxDocPresent(selectedObjects) || isOnedriveDocPresent(selectedObjects)) {
				status = true;
			}
			return status;
		}
		
		
		function download(docId,clientId) {
			$window.open(commonService.getContext()+"api/notes/download?documentId="+docId+"&clientId="+clientId);
		}
		
		function sortAnnotationsByTextPosition(a,b) {
			if(!_.isEmpty(a['position']) && !_.isEmpty(b['position']) ) {
				return a['position'].y - b['position'].y || a['position'].x - b['position'].x;
			}
			return 0;
		}
		
		function getDocAssociatedToTaskspace(clientId,documentId) {
			return httpService.httpGet("notes/docAssociatedToTaskspace/"+clientId+"/"+documentId);
		}
		//temp code
		
		function exportTable(postdata ) {
		    return httpService.httpPost("notes/getmodel",postdata);
		}

	    function copyDocList(postdata) {
	    	return httpService.httpPost("notes/copyDocList",postdata);
	    }
	    
	    function handleTransferOwnershipCB(trnasferedInfo,items) {
			var isTrnasferedTrue = _.where(trnasferedInfo,{"isTrnasfered" : true});
			var isTrnasferedFalse = _.where(trnasferedInfo,{"isTrnasfered" : false});
			var isTrnasferedTrueParsed = [];
			var isTrnasferedFalseParsed = [];
			if(!_.isEmpty(isTrnasferedTrue)) {
				_.each(isTrnasferedTrue,function(source,index) {
					var item = angular.copy(source);
					delete item.Report;
					if(!_.isEmpty(source.Report)) {
						_.each(source.Report,function(Report,index) {
							item.Reason = Report;
							isTrnasferedTrueParsed.push(item);
						});
					} else {
						isTrnasferedTrueParsed.push(item);
					}
				});
			}
			if(!_.isEmpty(isTrnasferedFalse)) {
				_.each(isTrnasferedFalse,function(source,index) {
					var item = angular.copy(source);
					delete item.Report;
					if(!_.isEmpty(source.Report)) {
						_.each(source.Report,function(Report,index) {
							item.Reason = Report;
							isTrnasferedFalseParsed.push(item);
						});
					} else {
						isTrnasferedFalseParsed.push(item);
					}
				});
			}
			
			var items = {
						"isTrnasferedFalse" : isTrnasferedFalseParsed,
						"isTrnasferedTrue" : isTrnasferedTrueParsed
					};
			var modalInstance = $uibModal.open({
				  animation: true,
			      templateUrl: 'app/components/common/TransferOwnership/HandleResponse/HandleTransferOwnershipResp.html',
			      controller: 'HandleTransferOwnershipRespController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'htorc',
			      backdrop: 'static',
			      size: 'lg',
			      resolve: {
			    	  items : function() {
			    		  return items;
			    	  },
			    	  responseFor :  function() {
			    		  return {"type" : "Documents"};
			    	  }
			      }
			 });
		}
	    
	    function transferOwneship(postdata) {
	    	return httpService.httpPost("notes/transfer",postdata).then(function(resp){
				 if(resp && resp.status == 200 && resp.data.Status) {
					 handleTransferOwnershipCB(resp.data.resultList,postdata.objectList);
					 return resp;
				 }
				 return resp;
			});
	    }
	    
	}
})();