;(function() {
	'use strict'; 
	
	angular.module('vdvcApp').controller('MailController',MailController);
	
	MailController.$inject = ['$scope','$state','$uibModal','$uibModalInstance',
	                          'appData','_','digest','userService',
	                          'AnnotationDigestService','$confirm','$timeout'];
	
	function MailController($scope,$state,$uibModal,$uibModalInstance,appData,_,
			digest,userService,AnnotationDigestService,$confirm,$timeout) {
		 
		var self = this;
		var appdata = appData.getAppData();
		var sharedUserList = [];
		var selectedProvisionalUsers = [];
		var sharePostdata = {};
		
		// Instance variables
		 self.user_ShareObjAcrossOrg = (appdata.UserSettings && appdata.UserSettings.user_ShareObjAcrossOrg && appdata.UserSettings.user_ShareObjAcrossOrg == "Yes") ? "Yes" : "No";
		 self.editor;
		 self.mailContent;
		 self.loggedInUser = appdata.UserId;
		 self.userPerms = {};
		 self.userPerms.users = [];
		 self.ccUserPerms = {};
		 self.ccUserPerms.users = [];
		 self.bccUserPerms = {};
		 self.bccUserPerms.users = [];
		 self.Users=[];
		 self.subject = angular.copy(digest.subject);
		 self.showSaveAsDraft = appdata.hasEmailSaveAsDraft;
		 
		// Methods
		 self.getFromMailId = getFromMailId;
		 self.tagTransform = tagTransform;
		 self.getSelectedUserName = getSelectedUserName;
		 self.cancel = cancel;
		 self.ok = ok;
		 self.saveAsDraft = saveAsDraft;
		 
		 function getFromMailId() {
			 var fromMailId = "no-reply@numici.com";
			 if(!_.isEmpty(appdata.sendAsUserEmailId)) {
				 fromMailId = appdata.sendAsUserEmailId;
			 }
			 return fromMailId;
		 }
		 
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
		 		 
		 function cancel() {
			 $uibModalInstance.dismiss('cancel');
		 }
		 
		 function ok() {
			 if (!_.isEmpty(self.userPerms.users)) {
				 var mailBody = self.editor ? self.editor.document.$.body.innerHTML : "";
				 var results = {
						 "action" : "sendAsEMail",
						 "toEmailIds" : self.userPerms.users,
						 "ccEmailIds" : self.ccUserPerms.users,
						 "bccEmailIds" : self.bccUserPerms.users,
						 "emailSubject" : self.subject,
						 "mailBody" : mailBody
				 };
				 $uibModalInstance.close(results);
			 }
		 }
		 
		 function saveAsDraft() {
			 var mailBody = self.editor ? self.editor.document.$.body.innerHTML : "";
			 var results = {
					 "action" : "saveAsDraft",
					 "toEmailIds" : self.userPerms.users,
					 "ccEmailIds" : self.ccUserPerms.users,
					 "bccEmailIds" : self.bccUserPerms.users,
					 "emailSubject" : self.subject,
					 "mailBody" : mailBody
			 };
			 $uibModalInstance.close(results);
		 }
		 
		 function initEditor() {
			 try {
					self.editor = CKEDITOR.replace( 'digestMail',{
						readOnly: false,
						tabSpaces: 4,
						width: "calc(100% - 2px)",
						height: 230,
						uiColor : '#ffffff',
						language : "en",
						skin : 'moono-lisa,/resources/js/ckeditor/skins/moono-lisa/' ,
						resize_enabled : false,
						removePlugins : "stylesheetparser, elementspath, magicline",
						fullPage: true,
						autoParagraph: false,
						toolbarGroups:[
							{ name: 'document', groups: [ 'mode', 'document', 'doctools' ] },
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
							{ name: 'about', groups: [ 'about' ] }
						],
						removeButtons:'Source,Save,NewPage,Templates,Print,Preview,Find,Replace,SelectAll,Scayt,Form,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,CreateDiv,BidiLtr,BidiRtl,Language,Subscript,Superscript,CopyFormatting,Checkbox,Anchor,Image,Flash,Table,HorizontalRule,Smiley,SpecialChar,PageBreak,Iframe,Styles,Maximize,ShowBlocks,About,Font,RemoveFormat,PasteFromWord,PasteText,Format,Blockquote'
					});
				} catch(e) {
					
				}
				$timeout(function() {
					if(self.editor) {
						self.editor.document.$.body.innerHTML = "<br>"+angular.copy(digest.content);
						if($state.current.name == "sharelinks" || $state.current.name == "taskspace.list.task") {
							var mailContentCss = {
				        			"width": "calc(100% - 30px)",
						            "padding": "15px",
						            "margin": "0px"
						        };
							var iframe = $("#cke_digestMail").find("iframe");
							if(iframe && iframe.length>0) {
								$("#cke_digestMail").find('iframe').css({"height": "calc(100% - 2px)"});
							}
							$(self.editor.document.$.body).css(mailContentCss);
						}
						var timer = $timeout(function() {
							if(self.editor.document.$.body) {
								$(self.editor.document.$.body).find('.cke_widget_drag_handler_container').css("display", "none");
								$(self.editor.document.$.body).find('.cke_image_resizer').css("display", "none");
							}
							$timeout.cancel(timer);
				        }, 2000);
					}
				}, 1000);
				
		 }
		 
		 function getAllUsersIncludeOtherOrgSharedUsers() {
			 userService.getAllUsersIncludeOtherOrgSharedUsers().then(function(resp) {
				 if(resp.status == 200 && resp.data.Status) {
					 self.Users = resp.data.Users;
					 self.userPerms.users = !_.isEmpty(digest.emailUsers) ? angular.copy(digest.emailUsers) : [];
				 }
			 });
		 }
		 
		 function init() {
			 getAllUsersIncludeOtherOrgSharedUsers();
			 $uibModalInstance.rendered.then(function() {
				 initEditor();
			 });
		 }
		 
		 init();
	}
})();