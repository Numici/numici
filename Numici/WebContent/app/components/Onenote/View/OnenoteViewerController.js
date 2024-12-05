;(function() {
	'use strict'; 
	
	angular.module('vdvcApp').controller('OnenoteViewerController',OnenoteViewerController);
	
	OnenoteViewerController.$inject = ['$scope','$state','$uibModal','$uibModalInstance',
	                          'appData','_','PageInfo','DigestContent1','userService','MessageService',
	                          'OnenoteService','VDVCConfirmService','$timeout'];
	
	function OnenoteViewerController($scope,$state,$uibModal,$uibModalInstance,appData,_,
			PageInfo,DigestContent1,userService,MessageService,OnenoteService,VDVCConfirmService,$timeout) {
		 
		var self = this;
		var appdata = appData.getAppData();
		
		
		// Instance variables
		 self.focusContent = false;
		 self.editor;
		 self.pageName = !_.isEmpty(PageInfo.title) ? PageInfo.title : "Page Viewer";
		 self.pageContent = !_.isEmpty(PageInfo.cotentInfo) ? (!_.isEmpty(PageInfo.cotentInfo.content) ? PageInfo.cotentInfo.content : "") : "";
		 if(!_.isEmpty(self.pageContent)) {
			 self.pageContent = self.pageContent.replaceAll('contenteditable="true"', 'contenteditable="false"');
		 }
		 self.showLoader = true;
		 self.isServiceCallInProgress = false;
		// Methods
		 self.tagTransform = tagTransform;
		 self.getSelectedUserName = getSelectedUserName;
		 self.appendToPage = appendToPage;
		 self.overridePage = overridePage;
		 self.cancel = cancel;
		 
		 function tagTransform(tagname) {
			 var item = {}; 	
			 return item = {
			  		"loginId":tagname,
			  		"firstName" : tagname,
			  		"lastName" : "",
			  		"isNew" : true
			  	};
		 }
		 
		 function getSelectedUserName(user) {
			 var userName = "";	
			 if (!_.isEmpty(user) && _.isString(user)) {
				 userName = user;
			 } else if(!_.isEmpty(user.firstName) && !_.isEmpty(user.lastName)) {
				 userName = user.firstName+" "+user.lastName;
			 } else if(_.isEmpty(user.firstName) && _.isEmpty(user.firstName) && !_.isEmpty(user.loginId)) {
				 userName = user.loginId;
			 } else if(!_.isEmpty(user.firstName)) {
				 userName = user.firstName;
			 } else if(!_.isEmpty(user.lastName)) {
				 userName = user.lastName;
			 } 
			 return userName;
		 }
		 
		 function appendToPage() {
			 self.isServiceCallInProgress = true;
			 var postdata = {
					 	"notebookId" : PageInfo.notebookId,
						"sectionId" : PageInfo.sectionId,
						"pageId" : PageInfo.id,
						"htmlContent" : "<br><br>"+DigestContent1.content
					};
				
			 OnenoteService.appendToPage(postdata).then(function(result){
				 if (result.status==200 && result.data.Status) {
					 var page = result.data.Data;
					 cancel();
					 MessageService.showSuccessMessage("APPEND_TO_ONENOTE_PAGE");
				 }
			 }).finally(function() {
				 self.isServiceCallInProgress = false;
			 });
		 }
		 
		 function overridePage() {
			 var onenoteAuthUsrConfMsgText = "Are you sure, do you want to overwrite the page content with digest content ?";
			 var VDVCConfirmModalInstance = VDVCConfirmService.open({text : onenoteAuthUsrConfMsgText,title : "Confirm Override Page"});
	    	 VDVCConfirmModalInstance.result.then(function() {
	    		 self.isServiceCallInProgress = true;
	    		 var postdata = {
	    				"notebookId" : PageInfo.notebookId,
						"sectionId" : PageInfo.sectionId,
 						"pageId" : PageInfo.id,
 						"htmlContent" : DigestContent1.content
 					};
 				
 				 OnenoteService.overridePage(postdata).then(function(result){
 					 if (result.status==200 && result.data.Status) {
 						 var page = result.data.Data;
 						 cancel();
 						 MessageService.showSuccessMessage("OVERWRITE_ONENOTE_PAGE");
 					 }
 				 }).finally(function() {
 					 self.isServiceCallInProgress = false;
				 });
	    	 },function() {
    			
	    	 });
		 }

		 function cancel() {
			 $uibModalInstance.dismiss('cancel');
		 }
		 
		 function initEditor() {
			 try {
					self.editor = CKEDITOR.replace( 'digestMail',{
						readOnly: true,
						tabSpaces: 4,
						width: "100%",
						height: 439,
						uiColor : '#ffffff',
						language : "en",
						skin : 'moono-lisa,/resources/js/ckeditor/skins/moono-lisa/' ,
						resize_enabled : false,
						removePlugins : "stylesheetparser, elementspath, magicline",
						fullPage: true,
						autoParagraph: false,
						toolbarGroups:[
							/*{ name: 'document', groups: [ 'mode', 'document', 'doctools' ] },
							{ name: 'clipboard', groups: [ 'clipboard', 'undo' ] },
							{ name: 'editing', groups: [ 'find', 'selection', 'spellchecker', 'editing' ] },
							{ name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
							{ name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi', 'paragraph' ] },
							{ name: 'forms', groups: [ 'forms' ] },
							{ name: 'links', groups: [ 'links' ] },
							{ name: 'insert', groups: [ 'insert' ] },
							{ name: 'styles', groups: [ 'styles' ] },
							{ name: 'colors', groups: [ 'colors' ] },
							{ name: 'tools', groups: [ 'tools' ] },
							{ name: 'others', groups: [ 'others' ] },
							{ name: 'about', groups: [ 'about' ] }*/
						],
						//removeButtons:'Source,Save,NewPage,Templates,Print,Preview,Find,Replace,SelectAll,Scayt,Form,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,CreateDiv,BidiLtr,BidiRtl,Language,Subscript,Superscript,CopyFormatting,Checkbox,Anchor,Image,Flash,Table,HorizontalRule,Smiley,SpecialChar,PageBreak,Iframe,Styles,Maximize,ShowBlocks,About,Font,RemoveFormat,PasteFromWord,PasteText,Format,Blockquote'
					});
				} catch(e) {
					
				}
				$timeout(function() {
					if(self.editor) {
						self.editor.document.$.body.innerHTML = angular.copy(self.pageContent);
						if($state.current.name == "sharelinks") {
							var pageContentCss = {
				        			"width": "calc(100% - 30px)",
						            "padding": "15px",
						            "margin": "0px"
						        };
							$(self.editor.document.$.body).css(pageContentCss);
						}
						self.showLoader = false;
					}
				}, 1000);
				
		 }
		 
		 function init() {
			 $uibModalInstance.rendered.then(function() {
				 initEditor();
			 });
		 }
		 
		 init();
	}
})();