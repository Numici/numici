
'use strict';
(function(){
	
	CKEDITOR.plugins.add( 'annotation',
			{
				init: function( editor )
				{
						var iconPath = this.path + 'images/icon.png';
						var iconPath2 = this.path + 'images/icon2.png';

						var s = [];
						var nodeId;
						
						function addComment(iframe, tagName, comment) {
							
						    var iframedoc = iframe.contentDocument || iframe.contentWindow.document,
						    tag = iframedoc.createElement(tagName),
						    
						    highlighter = rangy.createHighlighter(iframedoc, "TextRange");
						    
						    highlighter.addClassApplier(rangy.createClassApplier("unused", {
						        ignoreWhiteSpace: true,
						        onElementCreate: function(el) {
						        	$(el).removeClass();
						            $(el).addClass('note');
						            s.push(el);
						        },
						        elementTagName: "span",
						        elementProperties: {
						            onclick: function() {
						            	addNote(this);
						            }
						        }
						    }));


						    function addNote(element) {
						   	 var highlight = highlighter.getHighlightForElement(element);
						   	 $('.vdvc-annotator-editor').hide();
						   	 $('.text-menu').show();
						        return false;
						   }

						   function highlightSelectedText() {
						   	var slcted = serializeSelection();
						   	highlighter.highlightSelection("highlight");
						   	$('.text-menu').hide();
						   	
						   	if (slcted && slcted.trim() != "") {
						   		 if (!selections[slcted]) {
						   			 selections[slcted] = {};
						   		 }
						   		 selections[slcted]["type"] = "highlight";
						   	}  
						   }

						   

						   function wrapSelectedNodes (cb) {
						   	if (s && s.length >0 ) {
						   		Util.sync_ajaxGet("uniqueid/get",function(result){
						   			if(result.Status) {
						   		 		nodeId = result.UniqueId;
						   		 		  $.each(s,function(i,el){
						   		 			  if (i == 0 ) {
						   		 				$(el).addClass("first");
						   		 			  }
						   		 			 $(el).attr("data-id",result.UniqueId);
						   		 		  });
						   		 		  
						   		 		  if (typeof cb == "function") {
						   		 			  cb(nodeId,comment);
						   		 		  }
						   		 	  }
						   			
						   	 	}); 
						   	}
						   }

						   function commentSelectedText () {
						   	 highlighter.highlightSelection("unused");
						   }

						   function noteSelectedText() {
							   	s = [];
							   	commentSelectedText();
							   	wrapSelectedNodes(saveComment);   
						   }
						   
						   function saveComment(nodeId,comment) {
							   
							   var annotationMgr = new AnnotationManager();
							   annotationMgr.cell = nodeId;
							   annotationMgr.type = "document";
							   annotationMgr.comment = comment;
							   annotationMgr.resourceId = window.vdvcDoc.doc.id;
							   annotationMgr.saveCallBack = function() {
								  
							   };
								
							   annotationMgr.saveComment();
						   }
						   
						   
						   noteSelectedText();

						}
						CKEDITOR.addCss(
					            '.note {' +
					                'background-color:  yellow' +
					            '}'+'.note.first:before {\
								    content: "";\
								    position: relative;\
								    top: 10px;\
								    right: 0;\
								    width: 0;\
								    height: 0;\
								    border-right: 10px solid transparent;\
								    border-bottom: 10px solid transparent;\
								    border-top: 10px solid red;\
								}'+'.vdvc-notes-comments {\
									width:400px;\
									height:200px;\
									display:none;\
									background-color: #EFE9E9;position:absolute;\
									border-radius : 5px;\
									box-shadow : 0px 0px 5px 2px gray;\
									padding : 5px;\
								}'	
					        );
						
						var annotationDialog = editor.addCommand('annotationDialog',new CKEDITOR.dialogCommand( 'annotationDialog' ) );
						var commentsDialog = editor.addCommand('commentsDialog',new CKEDITOR.dialogCommand( 'commentsDialog' ) );
						
						commentsDialog.readOnly = 1;
				 
						if ( editor.contextMenu ) {
							
							editor.addMenuGroup( 'comment',1 );
							editor.addMenuItem( 'addcomment',
							{
								label : 'Add Comment',
								icon : iconPath2,
								command : 'commentsDialog',
								group : 'comment',
								readOnly : 1,
							});
							
							
							editor.contextMenu.addListener( function( element )
							{
								if(editor.getSelection().getSelectedText() != ""){
			 						return {addcomment:CKEDITOR.TRISTATE_OFF};
			 					}
							});
						}
				 
						CKEDITOR.dialog.add( 'annotationDialog', function( editor )
						{
							return {
								title : 'Annotations',
								minWidth : 600,
								minHeight : 300,
								contents : ["hellow"],
								onShow : function()
								{
								   var sel = editor.getSelection(),
									element = sel.getStartElement();
									if ( element )
										element = element.getAscendant( 'span', true );
									if ( element && element.getAttribute('custom') != null && element.getAttribute('custom') == "ann" && !element.isReadOnly() && !element.data( 'cke-realelement' ) )
				 					{
										this.foreach(function(e){
											if(e.label == element.getAttribute('ann')){
												e.setValue(true);
											}
										});
										var title = element.getAttribute("title");
										var a1 = title.split(";");
										var a2 = a1[3].split(":");
										var advice = a2[1];
										this.getContentElement("annotationbuttons","advice").setValue(advice);
										this.editmode = true;
										this.element = element;
									}else{
										this.editmode = false;
									}
								},
								onOk : function()
								{
								 /*if(this.editmode){
								 	 this.element.innerHTML = "a";
								 }else{*/
									 this.foreach(function(e){
									 	    if(e.getValue()&&e.type == "checkbox"){
									 	    	ann = e.label;
									 	    	style = e.style;
									 	    	title = e.title;
									 	    }
									 });
								     var advice = this.getContentElement("annotationbuttons","advice").getValue();
								     var orginal = editor.getSelection().getSelectedText();
								     var inserthtml = "<span custom='ann' ann="+ann+" title='"+title+";\nadvice:"+advice+"'><i style='"+style+"color:white;'>"+orginal+"</i><sup style='"+style+"font-size:14px;color:white;'>"+ann+"</sup></span>";
								     editor.insertHtml(inserthtml);
							     //}
								}
							};
						} );
						
						
						CKEDITOR.dialog.add( 'commentsDialog', function( editor )
						{
							return {
								title : 'Comments',
								minWidth : 400,
								minHeight : 200,
								contents :
								[
									{
										id : 'comments',
										elements :
										[
											{
												type : 'textarea',
												id : 'comment',
												label : 'Comment:',
											}
										]
									}
								],
								onShow : function()
								{
									
								},
								onOk : function()
								{
									
									var current = this;
									var comment = current.getContentElement("comments","comment").getValue();
									if (typeof comment == "string" && comment.trim() == "") {
										Util.showMessage("Please Enter the comment");
										return false;
									}
									var iframe=$(".cke iframe");
									addComment(iframe[0],"span",comment);
									
								},
								onCancel : function()
								{
									
									
								}
							};
						} );
					//}
				}
			} );
	
})();