var vdvcDocManager = {};
;(function(docMgr){
	
	docMgr.rootFolder = null;
	docMgr.Folders = null;
	docMgr.Docs = null;
	
	docMgr.extMap = {
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
			"xml" : "fa fa-file-code-o"
			
	};
	
	docMgr.AddEvents = function() {
		$("#myDocs").off("mousedown").on("mousedown",function(e){
			if(e.button == 2) {
				$("#myDocs").contextMenu(true);
			}
		});
		
		$("#myDocs .vdvc-doc").off("mousedown").on("mousedown",function(event){
			
			event.stopPropagation();
			if(event.button == 2) {
				$("#myDocs").contextMenu(false);
			}
		});
		
		$("#myDocs .vdvc-fldr").off("mousedown").on("mousedown",function(event){
			
			event.stopPropagation();
			if(event.button == 2) {
				$("#myDocs").contextMenu(false);
			}
		});
	};
	
	
	docMgr.uploadFile = function(fileUplodUi) {
		var c = this;
		var dlg = $("<div>").dialog({
			width : 400,
			height : 200,
			create : function(event,ui) {
				$(this).append('<input type="text" placeholder="File Name"/>');
			},
			close : function(event,ui) {
				$(this).dialog("destroy");
			},
			buttons :{
				"Cancel" : function() {
					$(this).dialog("close");
				}
			}
		});
		return dlg;
	};
	
	docMgr.RootContextMenu = function() {
		$.contextMenu.types.fileUpload = function(item, opt, root) {
			var c = this;
		    $('<span >' + item.customName + '</span><input type="file" class="file-upload" style="height:100%;width:100%;">').appendTo(this);
		    c.on('click', function(e) {
		    	var userid = Util.userinfo ? Util.userinfo["UserId"] : null;
		    	var postdata = {};
				postdata["parentFolderId"] = docMgr.rootFolder.id;
				postdata["userId"] = userid;
				postdata["ownerId"] = docMgr.rootFolder.ownerId;
				postdata["docType"] = "OtherDoc";
				
				$(c).fileupload({
					  url: 'docUpload',
					  formData :postdata,
					  add: function(e, data) {
						  data.submit();
					  },
					  done: function(e,data){
						  var result = JSON.parse(data.jqXHR.responseText);
				        	if (result.Status) {
				        		docMgr.getAllDocs(docMgr.rootFolder.id,docMgr.ListAllFiles);
				        	} else {
				        		Util.showMessage(result.Message);
				        	}
					  }
				});
		    	 /*$(c).fileupload({
				        dataType: 'json',
				        multipart: false,
				        add: function (e, data) {
				        	
				        	var dlg = docMgr.uploadFile($(c));
				        	data.Ui = dlg;
				        	 data.context = $('<button style="margin-left:10px;"/>').text('Upload').appendTo(dlg).click(function () {
				        		 Util.showSpinner("manual");
				        		 	var fileName = dlg.find("input").val();
				        		 	if (fileName && fileName.trim() != "") {
				        		 		$(c).fileupload("option",'url','api/notes/upload/file/'+encodeURIComponent(fileName));
					                    data.submit();
				        		 	} else {
				        		 		dlg.append("<div style='color:red;'>File Name is required</div>");
				        		 	}
				                });
				        },
				        done: function (e, data) {
				        	var result = JSON.parse(data.jqXHR.responseText);
				        	if (result.Status) {
				        		 data.Ui.dialog("close");
				        		 
				        		 if(result.Notes && result.Notes.id) {
				        			 Util.ajaxPost("notes/upload/record/"+result.Notes.id,postdata,function(fileInfo){
				        				 docMgr.getAllDocs(docMgr.rootFolder.id,docMgr.ListAllFiles);
				        				 Util.hideSpinner("manual");
				        			 });
				        		 }
				        	} else {
				        		Util.showMessage(result.Message);
				        	}
				           
				        }
				    });*/
		    });
		    this.addClass("icon icon-upload");
		    
		   
		};
		
		$.contextMenu({
	        selector: '#myDocs', 
	        trigger:"right",
	        callback: function(key, options) {
	            var m = "clicked: " + key;
	           // window.console && console.log(m) || alert(m); 
	           switch(key) {
	           case "NewFolder":
	        	   docMgr.CreateFolder();
	        	   break;
	           case "Note":
	        	   docMgr.CreateNotes();
	        	   break;   
	           case "SECDownload":
	           	   docMgr.downloadSecFilings.downloadSecDialog();
	        	   break;
	           }
	        },
	        items: {
	        	"NewFolder": {"name": "New Folder", "icon": "open"}, 
	            "Note": {"name": "New Note", "icon": "txt-file"},
	            "Upload": {"type":"fileUpload","customName": "Upload", "icon": "upload"} ,
	            "SECDownload" :{"name":"Download SEC Filing","icon":"download"}
	        }
	    });
	};
	
	docMgr.FolderContextMenu = function() {
		$.contextMenu({
	        selector: '.vdvc-fldr .fa-ellipsis-v', 
	        trigger: 'left',
	        callback: function(key, options) {
	        	  switch(key) {
		           case "Rename":
		        	   var doc = $(".selectedFolder").data();
		        	   if (!$.isEmptyObject(doc)) {
		        		   docMgr.renameDoc(doc);
		        	   }
		        	   break;		          
		           case "Delete":
		        	   var doc = $(".selectedFolder").data();
		        	   if (!$.isEmptyObject(doc)) {
		        		   docMgr.deleteFolder(doc);
		        	   }
		        	   break;
		           }
	        },
	        items: {
	        	"Rename": {"name": "Rename..", "icon": ""}, 
	            "Delete": {"name": "Delete", "icon": "delete"}	            
	        },
	        events : {
	        	 show: function(opt){ 
	 	        	$("#myDocs").contextMenu(false);
	 	        },
	 	        hide: function(opt){ 
	 	        	//$("#myDocs").contextMenu(true);
	 	        }
	        }
	       
	    });
	};
	
	docMgr.DocContextMenu = function() {
		$.contextMenu({
	        selector: '.vdvc-note-dir .fa-ellipsis-v', 
	        trigger: 'left',
	        callback: function(key, options) {	
	        	  var doccument = $(".selectedDoc").data();
	        	  var doc = doccument.doc;
	        	  switch(key) {
		           case "Rename":
		        	   if (!$.isEmptyObject(doc)) {
		        		   docMgr.renameDoc(doc,"doc");
		        	   }
		        	   break;
		           case "Delete":
		        	   
		        	   if (!$.isEmptyObject(doc)) {
		        		   docMgr.deleteDoc(doc);
		        	   }
		        	   break;
		           }
	        },
	        items: {
	        	"Rename": {"name": "Rename..", "icon": ""}, 
	            "Delete": {"name": "Delete", "icon": "delete"}
	            
	        	} ,
	        events : {
	        	 show: function(opt){ 
	 	        	$("#myDocs").contextMenu(false);
	 	        },
	 	        hide: function(opt){ 
	 	        	//$("#myDocs").contextMenu(true);
	 	        }
	        }
	       
	    });
		
	};
	
	
	
	
	docMgr.SecDocContextMenu = function() {
		$.contextMenu({
	        selector: '.vdvc-sec-dir .fa-ellipsis-v', 
	        trigger: 'left',
	        callback: function(key, options) {	
	        	  var doccument = $(".selectedDoc").data();
	        	  var docInfo = doccument.docInfo;
	        	  var doc = doccument.doc;
	        	  switch(key) {
		           case "Rename":
		        	   if (!$.isEmptyObject(doc)) {
		        		   docMgr.renameDoc(doc,"doc");
		        	   }
		        	   break;
		           case "Delete":
		        	   if (!$.isEmptyObject(doc)) {
		        		   docMgr.deleteDoc(doc);
		        	   }
		        	   break;
		           case "Compare":
		        	   
		           	   docMgr.searchSecFilings.searchCompareDialog(doc);
		        	   break;
		           }
	        },
	        items: {
	        	"Rename": {"name": "Rename..", "icon": ""}, 
	        	"Compare": {"name": "Compare..", "icon": ""},
	            "Delete": {"name": "Delete", "icon": "delete"}
	            
	        	} ,
	        events : {
	        	 show: function(opt){ 
	 	        	$("#myDocs").contextMenu(false);
	 	        },
	 	        hide: function(opt){ 
	 	        	//$("#myDocs").contextMenu(true);
	 	        }
	        }
	       
	    });
		
	};
	
	
	
	
	docMgr.initContextMenus = function() {
		docMgr.RootContextMenu();
		docMgr.FolderContextMenu();
		docMgr.DocContextMenu();
		docMgr.SecDocContextMenu();
	};
	
	
	docMgr.deleteFolder = function(fldr) {
		
		Util.promptDialog("Do you want delete the Folder ",function() {
			var userid = Util.userinfo ? Util.userinfo["UserId"] : null;
			if (userid) {
				
				Util.ajaxDelete("folder/delete/"+fldr.id, {"userId":userid}, function (result) {
					if (result.Status) {
						docMgr.getAllDocs(docMgr.rootFolder.id,docMgr.ListAllFiles);
					} else {
						Util.showMessage(result.Message);
					}
				});
			}
		},function(){});
	};
	
	docMgr.deleteDoc = function(doc) {
		Util.promptDialog("Do you want delete the document",function() {
			var userid = Util.userinfo ? Util.userinfo["UserId"] : null;
			if (userid) {
				
				Util.ajaxDelete( "notes/delete/"+doc.id, {"userId":userid}, function (result) {
					if (result.Status) {
						docMgr.getAllDocs(docMgr.rootFolder.id,docMgr.ListAllFiles);
					} else {
						Util.showMessage(result.Message);
					}
				});
			}
		},function(){});
	};
	
	docMgr.renameDoc = function(doc,type) {
		
		docMgr.dlg("Rename",function(ui){
			var name = ui.find("input").val();
			if (name.trim() != "") {
				var url = "folder/rename/"+doc.id+"/"+encodeURIComponent(name);
				if (type == "doc") {
					url = "notes/rename/"+doc.id+"/"+encodeURIComponent(name);
				}
				Util.ajaxPost(url, {}, function (result) {
					if (result.Status) {
						docMgr.getAllDocs(docMgr.rootFolder.id,docMgr.ListAllFiles);
					} else {
						Util.showMessage(result.Message);
					}
				});
			}
		},doc.name);
	};
	
	
	docMgr.getRootFolder = function(cb) {
		var userid = Util.userinfo ? Util.userinfo["UserId"] : null;
		if (userid) {
			Util.ajaxPost("folder/setroot", {"userId":userid}, function (result) {
				if (result.Status) {
					docMgr.rootFolder = result.Folders; 
					docMgr.getAllDocs(docMgr.rootFolder.id,docMgr.ListAllFiles);
				}
			},false,true);
		}
	};
	
	docMgr.getAllDocs = function(folderid,cb) {
	
		var userid = Util.userinfo ? Util.userinfo["UserId"] : null;
		if (userid && docMgr.rootFolder) {
			Util.ajaxGet("folder/list/"+folderid+"/"+encodeURIComponent(userid), function (result) {
				if (result.Status) {
					docMgr.Folders = result.Folders.folders || null;
					docMgr.Docs = result.Folders.documents || null;
					
					if (typeof cb == "function") {
						cb();
					} else {
						docMgr.ListAllFiles();
					}
				} else {
					Util.showMessage(result.Message);
				}
			},false,true);   
		}
	}; 
	
	docMgr.getAllSharedDocs = function(folderid,cb) {
		
		var userid = Util.userinfo ? Util.userinfo["UserId"] : null;
		if (userid ) {
			Util.showSpinner("manual");
			$.when(
					Util.diff_ajaxGet("/folder/shared/"+encodeURIComponent(userid),function(result){
						if (result.Status) {
							docMgr.Folders = result.Folders || null;
						} else {
							Util.showMessage(result.Message);
						}
					}),
					Util.diff_ajaxGet("/notes/shared/"+encodeURIComponent(userid),function(result){
						if (result.Status) {
							docMgr.Docs = result.Notes || null;
						} else {
							Util.showMessage(result.Message);
						}
					})
			).then(function(){
				docMgr.ListAllSharedFiles();
				Util.hideSpinner("manual");
			});
		}
	};
	
	docMgr.ListAllSharedFiles = function() {
		
		$("#page-wrapper").empty();
		$("#page-wrapper").append('<div class="row" style="height: 100%;">\
				<div id="myDocs" class="row" style="min-height: 1000px;"></div>\
			</div>');
		if ($.isArray(docMgr.Folders) && docMgr.Folders.length > 0 ) {
			docMgr.CreateFolderView(docMgr.Folders);
		}
		if ($.isArray(docMgr.Docs) &&  docMgr.Docs.length > 0) {
			docMgr.CreateNotesView(docMgr.Docs);
		}
		
		$(".context-title").html("Documents");
		$(".vdvc-context").attr("vdvc-context","documents");
		
		
		$.contextMenu( 'destroy', "#myDocs" );
		
		docMgr.FolderContextMenu();
		docMgr.DocContextMenu();
		docMgr.AddEvents();
	};
	
	docMgr.ListAllFiles = function() {
		
		$("#page-wrapper").empty();
		$("#page-wrapper").append('<div class="row" style="height: 100%;">\
				<div id="myDocs" class="row" style="min-height: 1000px;"></div>\
			</div>');
		if ($.isArray(docMgr.Folders) && docMgr.Folders.length > 0 ) {
			docMgr.CreateFolderView(docMgr.Folders);
		}
		if ($.isArray(docMgr.Docs) &&  docMgr.Docs.length > 0) {
			docMgr.CreateNotesView(docMgr.Docs);
		}
		
		$(".context-title").html("Documents");
		$(".vdvc-context").attr("vdvc-context","documents");
		
		docMgr.initContextMenus();
		docMgr.AddEvents();
	};
	
	
	docMgr.CreateFolder = function() {
		
		docMgr.dlg("New Folder",function(ui){
			var userid = Util.userinfo ? Util.userinfo["UserId"] : null;
			var name = ui.find("input").val();
			
			if (userid && docMgr.rootFolder && docMgr.rootFolder.id) {
				var postdata = {};
				postdata["userId"] = userid;
				postdata["folderInfo"] = {
						"folderName" : name,
						"parentFolderId" : docMgr.rootFolder.id
				};
				if (name.trim() != "") {
					Util.ajaxPost("folder/create", postdata, function (result) {
						if (result.Status) {
							docMgr.getAllDocs(docMgr.rootFolder.id,docMgr.ListAllFiles);
						} else {
							Util.showMessage(result.Message);
						}
					});
				}
			}
			
		});
	};
	
	docMgr.CreateNotes = function(e) {
		
		docMgr.dlg("New Note",function(ui){
			var userid = Util.userinfo ? Util.userinfo["UserId"] : null;
			var name = ui.find("input").val();

			if (userid && docMgr.rootFolder && docMgr.rootFolder.id) {
				var postdata = {};
				postdata["name"] = name;
				postdata["parentFolderId"] = docMgr.rootFolder.id;
				postdata["content"] = "";
				postdata["userId"] = userid;
				postdata["ownerId"] = userid;
				postdata["docType"] = "VidiViciNotes";
				
				if (name.trim() != "") {
					Util.ajaxPost("notes/add", postdata, function (result) {
						if (result.Status) {
							docMgr.getAllDocs(docMgr.rootFolder.id,docMgr.ListAllFiles);
						}
					});
				}
			}
			
		});
	};
	
	docMgr.CreateFolderView = function(folders) {
		$("#myDocs").append("<div class='row vdvc-fldr-dir'></div>");
		$.each(folders, function(i,folder){
			var wrap = $("<div  class='col-xs-12 col-sm-3' style='margin-bottom:15px;'>");
			var fldr = $("<div class='vdvc-fldr' style='height:66px;box-shadow: 1px 1px 4px 0px gray;' >");
			var lable = '<div class="row" ><div class="col-xs-1 fa fa-folder" style="height:30px;padding:5px;" ></div>\
				<div class="col-xs-11 vdvc-txt-wrap" style="height:30px;padding:3px;" data-toggle="tooltip" title="'+folder.name+'">'+folder.name+'</div></div>\
				<div class="row card-ft" ><div class="col-xs-2" style="height:30px;padding:3px;" >\
				</div><div class="col-xs-10" style="height:30px;padding:3px;" >'+docMgr.createFolderMenu(folder)+'</div></div>';
			fldr.data(folder);
			wrap.append(fldr);
			fldr.append(lable);
			$("#myDocs").find(".vdvc-fldr-dir").append(wrap);
		});
	};
	
	docMgr.createFolderMenu = function(folder) {
		var c = this,mrk="";
		var userid = Util.userinfo ? Util.userinfo["UserId"] : "";
		
		mrk += '<div class="row" style="text-align: center;">';
		if (userid.toLowerCase() == folder.ownerId.toLowerCase()) {
			mrk += '<div class="col-xs-2" >\
					<button class="btn btn-sm btn-primary fa fa-folder-open" data-btn-role="open_folder" data-toggle="tooltip" title="Open Folder"></button>\
				</div>\
				<div class="col-xs-2">\
					<button class="btn btn-sm btn-primary fa fa-share-alt-square" data-btn-role="share_folder" data-toggle="tooltip" title="Share"></button>\
				</div>\
				<div class="col-xs-2">\
					<button class="btn btn-sm btn-primary fa fa-tag" data-btn-role="tagFolder" data-toggle="tooltip" title="Tag"></button>\
				</div>\
				<div class="col-xs-2">\
					<button class="btn btn-sm btn-primary fa fa-comment" data-btn-role="commentFolder" data-toggle="tooltip" title="Comment"></button>\
				</div>\
				<div class="col-xs-2">\
					<button class="btn btn-sm btn-primary fa fa-ellipsis-v" data-btn-role="fldrMenu"></button>\
				</div>';
		} else {
			mrk += '<div class="col-xs-2" >\
				<button class="btn btn-sm btn-primary fa fa-folder-open" data-btn-role="open_folder" data-toggle="tooltip" title="Open Folder"></button>\
			</div>\
			<div class="col-xs-2">\
				<button class="btn btn-sm btn-primary fa fa-share-alt-square" data-btn-role="share_folder" data-toggle="tooltip" title="Share"></button>\
			</div>\
			<div class="col-xs-2">\
				<button class="btn btn-sm btn-primary fa fa-tag" data-btn-role="tagFolder" data-toggle="tooltip" title="Tag"></button>\
			</div>\
			<div class="col-xs-2">\
				<button class="btn btn-sm btn-primary fa fa-comment" data-btn-role="commentFolder" data-toggle="tooltip" title="Comment"></button>\
			</div>\
			<div class="col-xs-2">\
				<button class="btn btn-sm btn-primary fa fa-ellipsis-v" data-btn-role="fldrMenu"></button>\
			</div>';
		}
		mrk += '</div>';
		return mrk;
	};
	
	docMgr.CreateNotesView = function(docs) {
		
		$("#myDocs").append("<div class='row vdvc-doc-dir'></div>");
		$.each(docs, function(i,doccument){
			var doc = doccument.doc;
			
			var wrap = $("<div  class='col-xs-12 col-sm-3' style='margin-bottom:15px;'>");
			var $doc = $("<div class='vdvc-doc' style='height:126px;box-shadow: 1px 1px 4px 0px gray;' >");
			var lable = '<div class="row" >';
			
			var fileType = doc.name.split('.').pop();
			var fileIcon = docMgr.extMap[fileType];
			if (fileIcon) {
				lable +='<div class="col-xs-1 '+fileIcon+'" style="height:30px;padding:5px;font-weight: bolder;" ></div>';
			} else {
				lable +='<div class="col-xs-1 fa fa-file-text" style="height:30px;padding:5px;font-weight: bolder;" ></div>';
			}
			if(doc.docType == "SECFile") {
				
				var obj = docMgr.getDefaultSerachInputs(doc);
				
				lable +='<div class="col-xs-11 vdvc-txt-wrap" style="height:30px;padding:3px;" data-toggle="tooltip" title="'+doc.name+'">'+doc.name+'</div></div>\
				<div class="row v-n-content" style="height:60px;padding:3px;">\
				<div style="font-weight:bold;">Company : '+(obj.CompanyName || "")+'</div>\
				<div >Form Type : '+(obj.FormType || "")+'</div>\
				<div >Filed Date : '+(new Date(obj.FormFiledDate).toLocaleString() || "")+'</div>\
				<div >cik : '+obj.CIK+'</div>\
				</div>\
				<div class="row vdvc-sec-dir card-ft" ><div class="col-xs-1" style="height:30px;padding:3px;" >\
				</div><div class="col-xs-11" style="height:30px;padding:3px;" >'+docMgr.createDocMenu(doc)+'</div></div>';
			} else {
				lable +='<div class="col-xs-11 vdvc-txt-wrap" style="height:30px;padding:3px;" data-toggle="tooltip" title="'+doc.name+'">'+doc.name+'</div></div>\
				<div class="row v-n-content" style="height:60px;padding:3px;">'+(doc.content || "")+'</div>\
				<div class="row vdvc-note-dir card-ft" ><div class="col-xs-1" style="height:30px;padding:3px;" >\
				</div><div class="col-xs-11" style="height:30px;padding:3px;" >'+docMgr.createDocMenu(doc)+'</div></div>';
			}
			
			$doc.data(doccument);
			wrap.append($doc);
			$doc.append(lable);
			$("#myDocs").find(".vdvc-doc-dir").append(wrap);
		});
	};
	
	docMgr.getDefaultSerachInputs = function (inpDoc){
		var inputs = {};
		
		for (var i=0; inpDoc && inpDoc.properties && i <inpDoc.properties.length; i++) {
			var p = inpDoc.properties[i];
			inputs[p.name]=p.value;
		}	 				
		return inputs;		
	};
		
	docMgr.createDocMenu = function(doc) {
		var c = this,mrk="";
		var userid = Util.userinfo ? Util.userinfo["UserId"] : "";
		
		mrk += '<div class="row" style="text-align: center;">';
		if (userid.toLowerCase() == doc.ownerId.toLowerCase()) {
			mrk += '<div class="col-xs-2" >\
					<button class="btn btn-sm btn-primary fa fa-folder-open" data-btn-role="open_notes" data-toggle="tooltip" title="Open Note"></button>\
				</div>\
				<div class="col-xs-2">\
					<button class="btn btn-sm btn-primary fa fa-share-alt-square" data-btn-role="share_doc" data-toggle="tooltip" title="Share"></button>\
				</div>\
				<div class="col-xs-2">\
					<button class="btn btn-sm btn-primary fa fa-tag" data-btn-role="tagDoc" data-toggle="tooltip" title="Tag"></button>\
				</div>\
				<div class="col-xs-2">\
					<button class="btn btn-sm btn-primary fa fa-comment" data-btn-role="commentDoc" data-toggle="tooltip" title="Comment"></button>\
				</div>\
				<div class="col-xs-2">\
					<button class="btn btn-sm btn-primary fa fa-ellipsis-v" data-btn-role="docMenu"></button>\
				</div>';
		} else {
			mrk += '<div class="col-xs-2" >\
				<button class="btn btn-sm btn-primary fa fa-folder-open" data-btn-role="open_notes" data-toggle="tooltip" title="Open Note"></button>\
			</div>\
			<div class="col-xs-2">\
				<button class="btn btn-sm btn-primary fa fa-share-alt-square" data-btn-role="share_doc" data-toggle="tooltip" title="Share"></button>\
			</div>\
			<div class="col-xs-2">\
				<button class="btn btn-sm btn-primary fa fa-tag" data-btn-role="tagDoc" data-toggle="tooltip" title="Tag"></button>\
			</div>\
			<div class="col-xs-2">\
				<button class="btn btn-sm btn-primary fa fa-comment" data-btn-role="commentDoc" data-toggle="tooltip" title="Comment"></button>\
			</div>\
			<div class="col-xs-2">\
				<button class="btn btn-sm btn-primary fa fa-ellipsis-v" data-btn-role="docMenu"></button>\
			</div>';
		}
		mrk += '</div>';
		return mrk;
	};
	
	
	docMgr.dlg = function(title,savecb,filename) {
		if ($(".vdvcDocName").length > 0) {
			$(".vdvcDocName").dialog("destroy");
		}
		
		$("<div class='vdvcDocName' >").dialog({
			width : 400,
			height : 200,
			title : title || "",
			create : function(event,ui) {
				var mrkup = '<input type="text" value="'+(filename || "")+'">';
				$(this).append(mrkup);
			},
			close : function(event,ui) {
				$(this).dialog("destroy");
			},
			buttons : {
				"Save" : function(event,ui) {
					if(typeof savecb == "function") {
						savecb($(this));
					}
					$(this).dialog("close");
				},
				"Cancel" : function(event,ui) {
					$(this).dialog("close");
				}
			}
		});
	};
	
	return docMgr;
})(vdvcDocManager);


// Doc permissions module 
;(function(DocPerms){
	
	DocPerms.perms = {};
	
	DocPerms.doc = null;
	
	DocPerms.applyPerms = function() {
		var dlg = this.docPermsDlg;
		var user = dlg.find(".userselect").val();
		if(user != "default"){
			var perms=[];
	   	  	var grantedPerms = dlg.find('input[name="prm_granted"]:checked');
	   	  	$.each(grantedPerms,function(i,v){
	   		  perms.push($(v).val());
	   	  	});
	   	  	
	   	 DocPerms.perms[user] = perms;
		}else{
			 Util.showMessage("Please Select The User");
		}
	};
	
	DocPerms.shareDocument = function(doc){
		DocPerms.doc = doc;
		this.docPermsDlg = $('<div id="doc_permissions"></div>');
		var isExists =  $("body").find("#doc_permissions");
		if(isExists.length == 0){
		   this.docPermsDlg.dialog({
				closeText: false,
				width: 800,
				height: 400,
				buttons: [ { text: "Apply", click: function() {
								DocPerms.applyPerms();
								$(".ui-dialog-buttonpane button:contains('Apply')").button('disable');
							} },
				          { text: "Cancel", click: function() { $(this).dialog( "close" ); } },
				          { text: "Grant", click: function() {
				        	  var current = this;
					          var data={};
					          
				        	  Util.ajaxPost("notes/permissions/assign/"+doc.id,JSON.stringify(DocPerms.perms),function(result){
				        		  if(result.Status){
				        			  $(current).dialog( "close" );
				        				if(result.Notes.length > 0){
				        					Util.showMessage("Successfully Granted the permissions to "+result.Notes.join(", "));
					        			}
				        		  }else{
				        			  Util.showMessage(result.Message);
				        		  }
				        	  },false,true);
				          }
			          }
				],
				close:function(){
					$(this).dialog("destroy");
				},
				create:function(){
					var dlg = $(this);
					
					DocPerms.perms = {};
					
					$(".ui-dialog-buttonpane button:contains('Apply')").button('disable');
					
					Util.ajaxGet("user/list", function(result) {
						if(result.Status){
							var markup ="User: <select class='userselect'><option value='default'>Select</option>";
							if(result.Users){
								for(var i =0 ; i< result.Users.length;i++){
									markup += '<option value='+result.Users[i].loginId+'>'+result.Users[i].loginId+'</option>';
								}
								markup += '</select><br><br>';

								Util.ajaxGet("notes/permissions/", function(perms) {
									if(perms && $.isArray(perms)){
										$.each(perms,function(index,val){
											markup += '<input type="checkbox" class="docperms" name="prm_granted" value="'+val+'">'+val+'<br>';
										});
										dlg.append(markup);
										dlg.find(".docperms").prop("disabled",true);
										
										DocPerms.addEvents();
									}else{
										//Util.showMessage(result.Message);
									}
								});
							}
						}else{
							Util.showMessage(result.Message);
						}
					});
				}
			});
		}
	};
	
	
	DocPerms.addEvents = function() {
		
		var dlg = DocPerms.docPermsDlg;
		dlg.find(".userselect").off("change").on("change",function(e){

			e.stopPropagation();
			var user = $(this).val();
			
			dlg.find('input[name="prm_granted"]').prop("checked",false);
			if(user === "default"){
				
				dlg.find(".docperms").prop("disabled",true);
				
			}else{
				
				dlg.find(".docperms").prop("disabled",false);
				
				var url="/notes/permissions/"+DocPerms.doc.id+"/"+encodeURIComponent(user);

				Util.ajaxGet(url,function(result){
					
					if(result.Status){
						var perms = DocPerms.perms[user];
						if(!$.isEmptyObject(perms)){
							$.each(perms,function(index,val){
								dlg.find('input[value="'+val+'"]').prop("checked",true);
							});
						}else if(result.Notes){
							$.each(result.Notes,function(index,val){
								dlg.find('input[value="'+val+'"]').prop("checked",true);
							});
						}
					}else{
						Util.showMessage(result.Message);
					}
				},false,true);
			}

		});
		
		dlg.find(".docperms").off("click").on("click",function(event){
			event.stopPropagation();
			$(".ui-dialog-buttonpane button:contains('Apply')").button('enable');

		});
	};

})((vdvcDocManager.DocPerms) || (vdvcDocManager.DocPerms = {}));



//Folder permissions 


;(function(FolderPerms){
	
	FolderPerms.perms = {};
	
	FolderPerms.folder = null;
	
	FolderPerms.applyPerms = function() {
		var user = this.folderPermsDlg.find(".userselect").val();
		if(user != "default"){
			var perms=[];
	   	  	var grantedPerms = this.folderPermsDlg.find('input[name="prm_granted"]:checked');
	   	  	$.each(grantedPerms,function(i,v){
	   		  perms.push($(v).val());
	   	  	});
	   	  	
	   	 FolderPerms.perms[user]=perms;
		}else{
			 Util.showMessage("Please Select The User");
		}
	};
	
	FolderPerms.shareFolder = function(folder){
		FolderPerms.folder = folder;
		this.folderPermsDlg = $('<div id="folder_permissions"></div>');
		var isExists =  $("body").find("#folder_permissions");
		if(isExists.length == 0){
		   this.folderPermsDlg.dialog({
				closeText: false,
				width: 800,
				height: 400,
				buttons: [ { text: "Apply", click: function() {
								FolderPerms.applyPerms();
								$(".ui-dialog-buttonpane button:contains('Apply')").button('disable');
							} },
				          { text: "Cancel", click: function() { $(this).dialog( "close" ); } },
				          { text: "Grant", click: function() {
				        	  var current = this;
					          var data={};
				        	  Util.ajaxPost("folder/permissions/assign/"+folder.id,JSON.stringify(FolderPerms.perms),function(result){
				        		  if(result.Status){
				        			  $(current).dialog( "close" );
				        				if(result.Folders.length > 0){
				        					Util.showMessage("Successfully Granted the permissions to "+result.Folders.join(", "));
					        			}
				        		  }else{
				        			  Util.showMessage(result.Message);
				        		  }
				        	  },false,true);

				          }
			          }
				],
				close:function(){
					$(this).dialog("destroy");
				},
				create:function(){
					var dlg = $(this);
					
					FolderPerms.perms = {};
					
					$(".ui-dialog-buttonpane button:contains('Apply')").button('disable');
					
					Util.ajaxGet("user/list", function(result) {
						if(result.Status){
							var markup ="User: <select class='userselect'><option value='default'>Select</option>";
							if(result.Users){
								for(var i =0 ; i< result.Users.length;i++){
									markup += '<option value='+result.Users[i].loginId+'>'+result.Users[i].loginId+'</option>';
								}
								markup += '</select><br><br>';

								Util.ajaxGet("folder/permissions/", function(perms) {
									if(perms && $.isArray(perms)){
										$.each(perms,function(index,val){
											markup += '<input type="checkbox" class="folderperms" name="prm_granted" value="'+val+'">'+val+'<br>';
										});
										dlg.append(markup);
										dlg.find(".folderperms").prop("disabled",true);
										
										FolderPerms.addEvents();
									}else{
										//Util.showMessage(result.Message);
									}
								});
							}
						}else{
							Util.showMessage(result.Message);
						}
					});
				}
			});
		}
	};
	
	
	FolderPerms.addEvents = function() {
		var dlg = FolderPerms.folderPermsDlg;
		dlg.find(".userselect").off("change").on("change",function(e){

			e.stopPropagation();
			var user = $(this).val();
			
			dlg.find('input[name="prm_granted"]').prop("checked",false);
			if(user === "default"){
				
				dlg.find(".folderperms").prop("disabled",true);
				
			}else{
				
				dlg.find(".folderperms").prop("disabled",false);
				
				var url="/folder/permissions/"+FolderPerms.folder.id+"/"+encodeURIComponent(user);

				Util.ajaxGet(url,function(result){
					
					if(result.Status){
						var perms = FolderPerms.perms[user];
						if(!$.isEmptyObject(perms)){
							$.each(perms,function(index,val){
								dlg.find('input[value="'+val+'"]').prop("checked",true);
							});
						}else if(result.Folders){
							$.each(result.Folders,function(index,val){
								dlg.find('input[value="'+val+'"]').prop("checked",true);
							});
						}
					}else{
						Util.showMessage(result.Message);
					}
				},false,true);
			}

		});
		
		
		dlg.find(".folderperms").off("click").on("click",function(event){
			event.stopPropagation();
			$(".ui-dialog-buttonpane button:contains('Apply')").button('enable');

		});
	};

})((vdvcDocManager.FolderPerms) || (vdvcDocManager.FolderPerms = {}));


// Notes Manager 

;(function(nmdr){
	
	nmdr.vdvcNotes = function(doc) {
		var notes = this;
		notes.document = doc;
		notes.doc = (doc && doc.doc) ? doc.doc : {};
		notes.isChanged = false;
		notes.instance = null;
		
		setInterval(function(){
			if(notes.isChanged) {
				notes.saveNotes();
	    	}
		}, 10000);
		
		
		notes.CreateNotes = function(id,readonly){
			
			
			//$("#"+id).val(notes.doc.content);
			$("#"+id).val(notes.document.docInfo.content);
			
			var editor = id;
			var ImageUploadUrl = Util.contextUrl+"ImageUpload";
			var plugins = "";
			
			if (notes.doc.editable) {
				CKEDITOR.plugins.addExternal( 'save', '/resources/js/ckeditor/plugins/save/', 'plugin.js' );
				CKEDITOR.plugins.addExternal( 'fakeobjects', '/resources/js/ckeditor/plugins/fakeobjects/', 'plugin.js' );
				CKEDITOR.plugins.addExternal( 'pagebreak', '/resources/js/ckeditor/plugins/pagebreak/', 'plugin.js' );
				CKEDITOR.plugins.addExternal( 'bootstrapVisibility', '/resources/js/ckeditor/plugins/bootstrapVisibility/', 'plugin.js' );
				//CKEDITOR.plugins.addExternal( 'imagepaste', '/resources/js/ckeditor/plugins/imagepaste/', 'plugin.js' );
				CKEDITOR.plugins.addExternal( 'dialog', '/resources/js/ckeditor/plugins/dialog/', 'plugin.js' );
				CKEDITOR.plugins.addExternal( 'clipboard', '/resources/js/ckeditor/plugins/clipboard/', 'plugin.js' );
				CKEDITOR.plugins.addExternal( 'lineutils', '/resources/js/ckeditor/plugins/lineutils/', 'plugin.js' );
				CKEDITOR.plugins.addExternal( 'widget', '/resources/js/ckeditor/plugins/widget/', 'plugin.js' );
				CKEDITOR.plugins.addExternal( 'image2', '/resources/js/ckeditor/plugins/image2/', 'plugin.js' );
				CKEDITOR.plugins.addExternal( 'annotation', '/resources/js/ckeditor/plugins/annotation/', 'plugin.js' );
				
				plugins += 'save,dialog,clipboard,widget,lineutils,image2,bootstrapVisibility,fakeobjects,pagebreak,annotation';
			} else {
				
				CKEDITOR.plugins.addExternal( 'dialog', '/resources/js/ckeditor/plugins/dialog/', 'plugin.js' );
				CKEDITOR.plugins.addExternal( 'annotation', '/resources/js/ckeditor/plugins/annotation/', 'plugin.js' );
				
				plugins += 'dialog,annotation';
			}
			
			
			
			
			
			
			notes.instance = CKEDITOR.replace( editor,{
				
				readOnly: !notes.doc.editable,
				width: "100%",
			  //  height : $("#"+id).height(),
				skin : 'office2013,/resources/js/ckeditor/skins/office2013/' ,
				baseHref : Util.contextUrl,
				filebrowserImageUploadUrl:  "ImageUpload",
				extraPlugins : plugins,
				removePlugins : "elementspath"+ (!notes.doc.editable ? ",toolbar":""),
				resize_enabled : false,
				allowedContent: true,
				fullPage: true
			});
			if (notes.instance) {
				notes.instance.on( 'change', function( evt ) {
					//notes.doc.content = evt.editor.getData();
					notes.document.docInfo.content = evt.editor.getData();
					notes.isChanged = true;
				});
				
				notes.instance.on( 'save', function( evt ) {
					notes.saveNotes();
					return false;
				});
				
				notes.instance.on( 'contentDom', function() {
					notes.instance.editable().attachListener( this.document, 'click', function( event ) {
						var elem = event.data.getTarget();
						   if (elem.hasClass("note")) {
						      notes.showComments(elem.getAttribute("data-id"),elem.$,event);
						   } else if ($(this.$).find("div.vdvc-notes-comments")) {
							   $("div.vdvc-notes-comments").remove();
						   }
			        });
				} );
				
				 CKEDITOR.on('instanceReady', function(evt) {
					  
					  evt.editor.resize("100%",$(window).height()-60);
						/* var iframe = $('#cke_editable_area iframe').contents ();
						iframe.find ('html').css ({
							'background-color': '#b0b0b0'
						});
						iframe.find ('body').css ({
							'width': '297mm',
							'height': '600mm', //was 210 ****
							'background-color': '#ffffff',
							'margin': '0mm',
							'padding': '5mm'
						});
						iframe.find ('td').css ({
							'padding': '-1px'
						}); */
					});
			}
			
		};
		
		notes.showComments = function(id,elem,event) {
			var nodeId = $(elem).attr("data-id");
			var div = $("<div class='vdvc-notes-comments'/>");
			var header = $('<div class="vdvc-comments-header"/>');
			var commentWrap = $("<div class='vdvc-notes-comments-wrap'/>");
			var footer = '<div class="vdvc-comment-footer">\
				<div > <textarea name="comment" style="width:100%;" rows="3"></textarea></div>\
				<button class="btn btn-default">Add Comment</button>\
				</div>';
			
			var textNode = $(elem).closest('body').find('span[data-id="'+nodeId+'"]');
			var txt = ' ';
			if (textNode) {
				
				$.each(textNode,function(i,v){
					txt += $(v).text()+" ";
				});
			}
			header.append(txt);
			/*$(elem).off("mouseleave").on("mouseleave",function(e){
				$(elem).closest('body').find(".vdvc-notes-comments").remove(); 
			});*/
			
			/*if ($(elem).closest('body').find(".vdvc-notes-comments").length == 0) {
				$(elem).closest('body').append(div);
			} else {
				div = $(elem).closest('body').find(".vdvc-notes-comments");
			}
			
			div.show().position({
				 my: "left bottom",
		         at: "left top",
		         of: $(elem),
		         collision: "flip",
			     within : $(elem).closest('body')
			});*/
			
			if ($('.vdvc-doc-right').find(".vdvc-notes-comments").length == 0) {
				$('.vdvc-doc-right').append(div);
			} else {
				div = $('.vdvc-doc-right').find(".vdvc-notes-comments");
			}
			
			div.empty();
			div.append(header);
			div.append(commentWrap);
			div.append(footer);
			
		     var annotationMgr = new AnnotationManager();
			     annotationMgr.cell = nodeId;
			     annotationMgr.type = "control";
			     annotationMgr.resourceId = notes.doc.id;
				 annotationMgr.getCellAnnotations(function(annotations){
					 if($.isArray(annotations)) {
						 var markup='<table style="width:100%;" class="table table-striped">';
							if($.isArray(annotations) && annotations.length > 0){
								$.each(annotations,function(i,v){
									markup +='<tr>\
										<td style="width: 35%;vertical-align:top;font-size: .8em"><span>'+v.conversations[0].userName+'</span><br>\
										<span style="font-size: .8em;">'+new Date(v.conversations[0].annotatedOn).toLocaleString()+'</span><br>';
										
									markup +='</td>\
										<td style="width: 65%;"><div class="vdvc-note" >'+v.conversations[0].note+'</div></td>\
										</tr>';
								});
							}
							markup +='</table>';
							commentWrap.append(markup);
							div.find(".btn").off("click").on("click",function(event){
								annotationMgr.comment = div.find('textarea[name="comment"]').val();
								annotationMgr.type = "document";
								annotationMgr.resourceId = notes.doc.id;
								annotationMgr.saveComment();
								annotationMgr.saveCallBack = function() {
									$(elem).trigger("click"); 
								};
								
							});
					 }
				 });
			
		};
		
		notes.hideComments = function() {
			
		};
		
		notes.saveNotes = function() {
			var postdata=	{
				    "name" : notes.doc.name,
				    "parentFolderId" : notes.doc.folderId,
				    "content" : notes.document.docInfo.content,
				    "userId" : notes.doc.ownerId,
				    "ownerId" : notes.doc.ownerId,
				    "id" :  notes.doc.id,
				    "docType": "VidiViciNotes"
				 };
			Util.ajaxPost("notes/add",postdata,function(result){
				if(result.Status) {
					notes.isChanged = false;
				}
			});
		};
	};
	
})((vdvcDocManager.notesMgr) || (vdvcDocManager.notesMgr = {}));



// downloadSecFilings
;(function(docMgr,SEC_DL_Mangr){
	
	SEC_DL_Mangr.dialogs = {};
	
	SEC_DL_Mangr.formTypes = { // "13F" : ["13F-HR","13F-HR/A","13F-NT"],
                       "10-Q": ["10-Q","10-Q/A","10-QT","10-QT/A"],
	                   "10-K": ["10-K","10-K/A","10-KT","10-KT/A"],
	                   "8-K": ["8-K","8-K/A","8-K12B","8-K12G3","8-K12G3/A"]
					};
	
	 
	SEC_DL_Mangr.readUserInputs = function (filter) {
		var properties = $(filter);
		if (!properties.length)
			return null;
		
		var props = {};		
	 	$.each(properties,function(i,v){
	 		var val;
	 	 	if ($(v).attr("datatype") == "boolean") {
	 	 		val = $(v).prop('checked');
	 		} else {
	 			val = $(v).val();
	 		}
	 	 	if ($(v).attr("datamode") == "blocks") {
	 	 		if (!props.blocks) {
	 	 			props.blocks = [];
	 	 		} 
	 	 		if (val) {
	 	 			props.blocks.push($(v).attr("dataattr"));
	 	 		}
	 	 	} else {
	 	 		props[$(v).attr("dataattr")] = val;
	 	 	}
	 	 	
		});		 	
				
		return props;
	};
		
	SEC_DL_Mangr.nextSelectSECDownloadCB = function (dlg) {
		var fileInputs = SEC_DL_Mangr.readUserInputs(".selectedFileInputs .userInputs");
		
		SEC_DL_Mangr.fileInputs = [];
		if (fileInputs != null) {
			$.each(fileInputs, function(key, value) {
				if (value == true) {
					SEC_DL_Mangr.fileInputs.push(key);
				}    		
			});
		}
	
		if (!SEC_DL_Mangr.fileInputs.length) {
			Util.showMessage("Please select atleast one file to import");
			return;
		}
			 
	//	dlg.dialog("close");		
	};
	
	SEC_DL_Mangr.cancelDialogs = function () {	
		// close the select Mappings dialog
		var selectedMap = $('body').find('div[ui-role="downloadSecDlg"]');
		for (var i=0; i<selectedMap.length; i++){
			$(selectedMap[i]).dialog("close");
		}
		
	
	};	 
	 
	SEC_DL_Mangr.downloadSecDialog = function () {
    	var mapDlg = $('<div ui-role="downloadSecDlg" ></div>');
		var isExist = $('body').find('div[ui-role="downloadSecDlg"]');
		if (isExist.length > 0) {
			return;
		}

		var title = "Download Wizard: SEC Filings";
		var name = "searchCompareSecFile";
		
		
		$(mapDlg).dialog({
				width :  800,
				height : 400,
				title : title,
				
				create: function (event, ui){
					var c = this;
					var cikInputs = {
							"formGroup":"10-K"
						};
					// Invoke one time AJAX API's.		 
					Util.showSpinner("manual");
					$.when(						
						Util.diff_ajaxPost ("importSECFiling/getSECFilingData", cikInputs, function(result){
							if (!result.Status) {
								Util.showMessage (result.Message);
							} else {								
								SEC_DL_Mangr.companyNames = [];
								for (var i=0; result.Data && i < result.Data.length; i++){
									var d = result.Data[i];
									SEC_DL_Mangr.companyNames.push(d.companyName);
								}
							}
						}, false, false)
						
					).then(function(){
						Util.hideSpinner("manual");
						var html = SEC_DL_Mangr.createSelectSearchFormHTML();
						$(c).empty();
						$(c).append(html);
						SEC_DL_Mangr.dialogs[name]=$(c);
						
						SEC_DL_Mangr.bindSelectFormSearchEvents ($(c), html);
					});
				},
				open : function (event,ui) {

				},
				close: function(event,ui) {
					$(this).dialog("destroy");
				},
				buttons : {
					"Cancel" : function(event) {
						SEC_DL_Mangr.cancelDialogs ();
					},
					"Download" : function(event) {
						SEC_DL_Mangr.buttonMode = "Next";					 
						SEC_DL_Mangr.nextSelectSECDownloadCB (mapDlg);
		
						var postdata = {};
						var userid = Util.userinfo ? Util.userinfo["UserId"] : null;
						
						postdata.formGroup = SEC_DL_Mangr.formInputs.formGroup;
						postdata.filingId = SEC_DL_Mangr.fileInputs;
						postdata["parentFolderId"] = docMgr.rootFolder.id;
						postdata["userId"] = userid;
						postdata["ownerId"] = docMgr.rootFolder.ownerId;
						postdata["docType"] = "SECFile";
						console.log("Download input JSON structure : "+ JSON.stringify (postdata));
						
						//Util.diff_ajaxPost ("importSECFiling/downloadSECFileToFolder", postdata, function(result){
						Util.diff_ajaxPost ("importSECFiling/downloadSECFileAsNotes", postdata, function(result){	
							if (!result.Status) {
								Util.showMessage (result.Message);
							} else {
								docMgr.getAllDocs(docMgr.rootFolder.id,docMgr.ListAllFiles);
								mapDlg.dialog("close");
							}
						}, false, true);						 					
					}
				}
		});
    };
    
    SEC_DL_Mangr.isValidField = function (value) {
    	if (value == "" || value.length == 0 || value == undefined || value == "NONE") {
    		return false;
    	}
    	
    	return true;
    };
   
    SEC_DL_Mangr.updateFormTypes = function (div, val) {
		div.empty();
		var none = "";
		div.append('<option value='+none+'>'+ none +'</option>');
		var ftypes = SEC_DL_Mangr.formTypes[val];

		for (var l=0; l<ftypes.length; l++){
			var opt = ftypes[l];
			div.append('<option value='+opt+'>'+opt+'</option>');			
		}
	};
	
	SEC_DL_Mangr.bindSelectFormSearchEvents = function (div, html) {   
    	c = this;
    	$( document ).off("change","div[ui-role='downloadSecDlg'] .fillingTypeInput").on("change","div[ui-role='downloadSecDlg'] .fillingTypeInput",function() {
    		var type = $(this).val();
    		console.log ("Selected SEC fillings type: "+type);
    		var formTypeDiv = $('div[ui-role="downloadSecDlg"]').find("select[dataattr='formtype']");
    		if (type == "NONE") {
    			$("#formSearchButton").attr('disabled',true);    			
    		} else {
    			$("#formSearchButton").attr('disabled',false);
    			SEC_DL_Mangr.updateFormTypes (formTypeDiv, type);
    		} 			 
       		
		}); 
    	
       	$( "#companyName" ).autocomplete({
    	      source: SEC_DL_Mangr.companyNames
    	});
    	 
    	$( "#fromDatePicker" ).datepicker({dateFormat: "mm/dd/yy",
					    		onSelect: function(date,evnt) {
										
										var todt = $( "#toDatePicker" ).val();    		 					
						        		if ((todt.length != 0) && (new Date(date) > new Date(todt))) {
						        			Util.showMessage("To date must be greater than from date");
						        			return;
						        		}
									}
    						});
    	
    	$( "#toDatePicker" ).datepicker({dateFormat: "mm/dd/yy",
    		 				onSelect: function(date,evnt) {
      		 					var fmdt = $( "#fromDatePicker" ).val();    		 					
    		 	        		if ((fmdt.length != 0) && (new Date(fmdt) > new Date(date))) {
    		 	        			Util.showMessage("To date must be greater than from date");
    		 	        			return;
    		 	        		}
    		 				}});
        	 
      	$("#formSearchButton").click(function(){     
      		var fillingInputs =  SEC_DL_Mangr.readUserInputs(".listSecFillings .fillingTypeInput");
    		var fileSearchInputs =  SEC_DL_Mangr.readUserInputs(".selectedFormInputs .formInputs");
    		var fromDate = fileSearchInputs.fromdate;
    		var toDate = fileSearchInputs.enddate;
    		if (fromDate && toDate && (new Date(fromDate) > new Date(toDate))) {
    			Util.showMessage("To date must be greater than from date");
    			return false;
    		}
    	 
    		if (fromDate && (toDate == "" || toDate.length == 0)) {
    			Util.showMessage("Please enter the to date ...!!");
    			return false;
    		}
    		
    		if (toDate && (fromDate == "" || fromDate.length == 0)) {
    			Util.showMessage("Please enter the from date ...!!");
    			return false;
    		}
    		
    		var inpObj = {};
    		inpObj["formGroup"]=fillingInputs.fillingtype;
    		if (SEC_DL_Mangr.isValidField (fromDate)) {
    			inpObj["fromDateFiled"]=fromDate;
    		}
    		if (SEC_DL_Mangr.isValidField(toDate)){
    			inpObj["toDateFiled"]=toDate;
    		} 
    		if (SEC_DL_Mangr.isValidField(fileSearchInputs.cik)){
    			inpObj["cik"]=fileSearchInputs.cik;
    		}	
    		if (SEC_DL_Mangr.isValidField(fileSearchInputs.formtype)){
    			inpObj["formType"]=fileSearchInputs.formtype;
    		}
    		if (SEC_DL_Mangr.isValidField(fileSearchInputs.companyname)){
    			inpObj["companyName"]=fileSearchInputs.companyname;
    		}   		

    		SEC_DL_Mangr.formInputs = inpObj;
    	 	Util.ajaxPost ("importSECFiling/getSECFilingData", inpObj, function(result){           	 
        		if (!result.Status) {
    				Util.showMessage ("Failed to get the SECFilingData : "+ result.Message);
    			} else {
    				SEC_DL_Mangr.listData = result.Data;
    				if (SEC_DL_Mangr.listData) {
    					var txt = '<div style="overflow:auto; height:50%;" class="selectedFileInputs" > <table border="1" style="width:100%">\
    			    		<tr> <th> </th> <th> Date </th> <th> CIK </th>  <th> Name </th>  <th  width="10%"> Type </th> <th> Filename </th> </tr>';
    			 
    					for (var i=0; i<SEC_DL_Mangr.listData.length; i++) {
    						var c = SEC_DL_Mangr.listData[i];
    						txt += '<tr>';
    						txt += '<td> <input class="userInputs" type="checkbox" dataattr="'+c.id+'" datatype="boolean"> </td>';
    						var date = new Date(c.dateFiled);      					 
    					//	txt += '<td>'+date.toLocaleDateString()+'</td>';
    						txt += '<td>'+(date.getMonth()+1)+'/'+date.getDate()+'/'+date.getFullYear()+'</td>';
    						txt += '<td>'+c.cik+'</td>';
    						txt += '<td>'+c.companyName+'</td>';
    						txt += '<td>'+c.formType+'</td>';
    						txt += '<td>'+c.fileName+'</td>';
    						txt +=	'</tr>';
    					}    	
    					txt += '</table> </div>';
     		 
    					div.find(".selectedFileInputs").remove();
    					div.append(txt);    					
    				}    				 
    			}    			
    		},false,true);
    	});
     	
    };
    
    SEC_DL_Mangr.getFormTypeMarkup = function (formTypes) {
    	var markup = '<select class="formInputs" dataAttr="formtype" style="width:100%">';
    	var none = "";
		markup += '<option value='+none+'>'+ none +'</option>';	 
    	for (var f=0; formTypes && f<formTypes.length; f++) {
    		var fmType = formTypes[f];
    		markup += '<option value="'+fmType+'">'+fmType+'</option>';
    	}     	 
    	
    	return markup;
    };
    
    SEC_DL_Mangr.getFillingsTypeMarkup = function (fmTypes) {
    	var markup = '<select class="fillingTypeInput" dataAttr="fillingtype" style="width:100%">';
    	var none = "NONE";
		markup += '<option value='+none+'> Select Filing Type </option>';	
    	$.each(fmTypes, function(key, value) {
    		markup += '<option value="'+key+'">'+value+'</option>';  		
		});
    	return markup;
    };
    
    SEC_DL_Mangr.createSelectSearchFormHTML = function (){
       	var markup = '<table border="1" class="listSecFillings" style="width:100%">';
    	    	
    //	var fillingTypes = {"13F": "13-F", "10-Q" : "10-Q", "10-K": "10-K"};
       	var fillingTypes = {"10-Q" : "10-Q", "10-K": "10-K", "8-K" : "8-K"};
    	var ftMarkUp = SEC_DL_Mangr.getFormTypeMarkup ();
    	var fgMarkup = SEC_DL_Mangr.getFillingsTypeMarkup (fillingTypes);
    	markup += '<tr>';    	
    	markup += '<td>';
    	markup += "Select Filings Type";
    	markup += '</td>';
   	
    	markup += '<td>'+ fgMarkup + '</td>';    	
    	markup += '</tr>';    	
    	markup += '</table>';
    	markup += '<br>';
    		
    	
    	markup += '<table border="1" class="selectedFormInputs" style="width:100%">';   
    
    	markup += '<tr>\
    				<td> <table border="1" class="firstColumn" style="width:100%"> \
	    				<tr>\
	    					<td> Start Date </td>\
	    					<td> <input type="text" id="fromDatePicker" dataAttr="fromdate" class="formInputs" style="width:100%"> </td>\
	    				</tr>\
	    				<tr>\
	    					<td> End Date </td>\
	    					<td> <input type="text" id="toDatePicker" dataAttr="enddate" class="formInputs" style="width:100%"> </td>\
	    				</tr>\
	    		         <tr>\
	    					<td> CIK </td>\
	    					<td> <input type="text" dataAttr="cik" class="formInputs" style="width:100%"> </td>\
	    				</tr>\
    				</table> </td>\
			    	<td> <table border="1" class="secondColumn" style="width:100%"> \
						<tr>\
							<td> Company Name </td>\
    						<td> <input type="text" id="companyName" dataAttr="companyname" class="formInputs" style="width:100%"> </td>\
						</tr>\
						<tr>\
							<td> Form Type </td>\
    						<td> '+ftMarkUp+' </td>\
						</tr>\
    					<tr>\
    						<td> </td>\
    						<td> <button type="button" id="formSearchButton" style="width:100%" disabled="disabled"> Search </button> </td>\
    					</tr>\
					</table> </td>\
    		      </tr>';    	
    	markup += '</table>';
    	
       	return markup;
    };
	
})(vdvcDocManager,(vdvcDocManager.downloadSecFilings) || (vdvcDocManager.downloadSecFilings = {}));


//searchSecFilingDocuments
;(function(docMgr,SEC_SF_Mangr){
	
	SEC_SF_Mangr.dialogs = {};
	
	SEC_SF_Mangr.formTypes = { // "13F" : ["13F-HR","13F-HR/A","13F-NT"],
                       "10-Q": ["10-Q","10-Q/A","10-QT","10-QT/A"],
	                   "10-K": ["10-K","10-K/A","10-KT","10-KT/A"],
	                   "8-K": ["8-K","8-K/A","8-K12B","8-K12G3","8-K12G3/A"]
					};
	
	 
	SEC_SF_Mangr.readUserInputs = function (filter) {
		var properties = $(filter);
		if (!properties.length)
			return null;
		
		var props = {};		
	 	$.each(properties,function(i,v){
	 		var val;
	 	 	if ($(v).attr("datatype") == "boolean") {
	 	 		val = $(v).prop('checked');
	 		} else {
	 			val = $(v).val();
	 		}
	 	 	if ($(v).attr("datamode") == "blocks") {
	 	 		if (!props.blocks) {
	 	 			props.blocks = [];
	 	 		} 
	 	 		if (val) {
	 	 			props.blocks.push($(v).attr("dataattr"));
	 	 		}
	 	 	} else {
	 	 		props[$(v).attr("dataattr")] = val;
	 	 	}
	 	 	
		});		 	
				
		return props;
	};
		
	SEC_SF_Mangr.cancelDialogs = function () {	
		// close the select Mappings dialog
		var selectedMap = $('body').find('div[ui-role="searchCompareSecDlg"]');
		for (var i=0; i<selectedMap.length; i++){
			$(selectedMap[i]).dialog("close");
		}
		
	
	};	 
	 
	SEC_SF_Mangr.compareSelectSECDocumentCB = function (dlg) {
		
				
		var fileInputs = SEC_SF_Mangr.readUserInputs(".listSecSearchData .userInputs");
		
		SEC_SF_Mangr.fileInputs = [];
		if (fileInputs != null) {
			$.each(fileInputs, function(key, value) {
				if (value == true) {
					SEC_SF_Mangr.fileInputs.push(key);
				}    		
			});
		}
	
		if (!SEC_SF_Mangr.fileInputs.length) {
			Util.showMessage("Please select atleast one file to compare");
			return;
		}
		var sourceId = SEC_SF_Mangr.inputDocument.id;
		var targetId = SEC_SF_Mangr.fileInputs[0];
		console.log ("Source file ID: "+ sourceId);
		console.log ("Target file ID: "+ targetId);
		
		
		Util.ajaxGet ("secFilingDocument/compare/"+sourceId+"/"+targetId, function(result) {
			
    		if (!result.Status) {
				Util.showMessage ("Failed to get the SECFilingDocument information : "+ result.Message);
			} else {
				 if (result.Data) {
					 var pathnaemArray=window.location.pathname.split( '/' );
					 var _context="/" + pathnaemArray[1];
					 var wnd = _windowController.openWindow(_context+"/compareSEC.html","_blank");
					 //var wnd = window.open("/compareSEC.html", "compare");
					// wnd.document.write(result.Data);
					 window["secCompareData"] = result.Data;
					 if(wnd) {
						 wnd.focus();
					 }
				 }  				   				 
			}    			
		}, false, true);
			 
	/*	dlg.dialog("close");*/		
	};
	
	SEC_SF_Mangr.getDefaultSerachInputs = function (inpDoc){
		var inputs = {};
		
		for (var i=0; inpDoc && inpDoc.properties && i <inpDoc.properties.length; i++) {
			var p = inpDoc.properties[i];
			if (p.name && p.value) {
				inputs[p.name]=p.value;
			} else if (p.Name && p.Value) {
				inputs[p.Name] = p.Value;
			}
		}
			 				
		return inputs;		
	};
	
	SEC_SF_Mangr.searchCompareDialog = function (inpDoc) {
    	var mapDlg = $('<div ui-role="searchCompareSecDlg" ></div>');
		var isExist = $('body').find('div[ui-role="searchCompareSecDlg"]');
		if (isExist.length > 0) {
			return;
		}

		var title = "Compare Wizard: SEC Filing Documents";
		var name = "dowloadSecFile";
		
		$(mapDlg).dialog({
				width :  800,
				height : 400,
				title : title,
				
				create: function (event, ui){
					var c = this;
					var cikInputs = {
							"formGroup":"10-K"
						};
					
					/*
					var searchInputs = {};
					searchInputs["FormType"] = inpDoc.formType;
					searchInputs["CIK"] = inpDoc.cik;
					searchInputs["CompanyName"] = inpDoc.companyName;
					*/
					searchInputs = SEC_SF_Mangr.getDefaultSerachInputs (inpDoc);
					if (searchInputs.FormFiledDate) {
						delete searchInputs.FormFiledDate;
					}
					SEC_SF_Mangr.inputDocument = inpDoc;
				
					// Invoke one time AJAX API's.		 
					Util.showSpinner("manual");
					$.when(						
						Util.diff_ajaxPost ("importSECFiling/getSECCikData", cikInputs, function(result){
							if (!result.Status) {
								Util.showMessage (result.Message);
							} else {								
								SEC_SF_Mangr.companyNames = [];
								for (var i=0; result.Data && i < result.Data.length; i++){
									var d = result.Data[i];
									SEC_SF_Mangr.companyNames.push(d.companyName);
								}
							}
						}, false, false),
						
						Util.diff_ajaxPost ("secFilingDocument/search", searchInputs, function(result){
							if (!result.Status) {
								Util.showMessage (result.Message);				
							} else {
								SEC_SF_Mangr.searchResult = result.SecFilingDocument;
							}
						}, false, false)
						
					).then(function(){
						Util.hideSpinner("manual");
						var html = SEC_SF_Mangr.createSearchCompareFormHTML(inpDoc, searchInputs);
						$(c).empty();
						$(c).append(html);
						SEC_SF_Mangr.dialogs[name]=$(c);
						
						// Set default values from input document.
						$( "#cik" ).val(searchInputs.CIK);
						$( "#companyName" ).val(searchInputs.CompanyName);
					//	$(".ui-dialog-buttonpane button:contains('Compare')").button("disable");
						SEC_SF_Mangr.bindSearchCompareEvents ($(c), html);
					});
				},
				open : function (event,ui) {

				},
				close: function(event,ui) {
					$(this).dialog("destroy");
				},
				buttons : {
					"Cancel" : function(event) {
						SEC_SF_Mangr.cancelDialogs ();
					},
					"Compare" : function(event) {					
						SEC_SF_Mangr.compareSelectSECDocumentCB ();
							 					
					}
				}
		});
    };
    
    SEC_SF_Mangr.isValidField = function (value) {
    	if (value == "" || value.length == 0 || value == undefined || value == "NONE") {
    		return false;
    	}
    	
    	return true;
    };
   
   	SEC_SF_Mangr.bindSearchCompareEvents = function (div, html) {   
    	c = this;
    	 
    	$( "#companyName" ).autocomplete({
    	      source: SEC_SF_Mangr.companyNames
    	});
    	 
    	$( "#fromDatePicker" ).datepicker({dateFormat: "mm/dd/yy",
					    		onSelect: function(date,evnt) {
										
										var todt = $( "#toDatePicker" ).val();    		 					
						        		if ((todt.length != 0) && (new Date(date) > new Date(todt))) {
						        			Util.showMessage("To date must be greater than from date");
						        			return;
						        		}
									}
    						});
    	
    	$( "#toDatePicker" ).datepicker({dateFormat: "mm/dd/yy",
    		 				onSelect: function(date,evnt) {
      		 					var fmdt = $( "#fromDatePicker" ).val();    		 					
    		 	        		if ((fmdt.length != 0) && (new Date(fmdt) > new Date(date))) {
    		 	        			Util.showMessage("To date must be greater than from date");
    		 	        			return;
    		 	        		}
    		 				}});
        	 
      	$("#formSearchButton").click(function(){     
       		var fileSearchInputs =  SEC_SF_Mangr.readUserInputs(".selectedFormInputs .formInputs");
    		var fromDate = fileSearchInputs.fromdate;
    		var toDate = fileSearchInputs.enddate;
    		if (fromDate && toDate && (new Date(fromDate) > new Date(toDate))) {
    			Util.showMessage("To date must be greater than from date");
    			return false;
    		}
    	 
    		if (fromDate && (toDate == "" || toDate.length == 0)) {
    			Util.showMessage("Please enter the to date ...!!");
    			return false;
    		}
    		
    		if (toDate && (fromDate == "" || fromDate.length == 0)) {
    			Util.showMessage("Please enter the from date ...!!");
    			return false;
    		}
    		
    		var searchInputs = {};
			if (SEC_SF_Mangr.isValidField (fromDate)) {
    			searchInputs["StartFilingDate"]=fromDate;
    		}
    		if (SEC_SF_Mangr.isValidField(toDate)){
    			searchInputs["EndFilingDate"]=toDate;
    		} 
    		if (SEC_SF_Mangr.isValidField(fileSearchInputs.cik)){
    			searchInputs["CIK"]=fileSearchInputs.cik;
    		}	
    		if (SEC_SF_Mangr.isValidField(fileSearchInputs.formtype)){
    			searchInputs["FormType"]=fileSearchInputs.formtype;
    		}
    		if (SEC_SF_Mangr.isValidField(fileSearchInputs.companyname)){
    			searchInputs["CompanyName"]=fileSearchInputs.companyname;
    		}   		
    		 
    		Util.ajaxPost ("secFilingDocument/search", searchInputs, function(result) {
        		if (!result.Status) {
    				Util.showMessage ("Failed to get the SECFilingDocument information : "+ result.Message);
    			} else {
    				SEC_SF_Mangr.searchResult = result.SecFilingDocument;
    				var txt = SEC_SF_Mangr.getListSearchDataMarkup (SEC_SF_Mangr.searchResult, SEC_SF_Mangr.inputDocument);
    				div.find(".listSecSearchData").remove();
					div.append(txt);     				   				 
    			}    			
    		}, false, true);
    	});
     	
    };
       
    SEC_SF_Mangr.getListSearchDataMarkup = function (data, inpDoc) {
    	var txt = '<div style="overflow:auto; height:50%;" class="listSecSearchData" > <table border="1" style="width:100%">\
    		<tr> <th> </th> <th> Date </th> <th> CIK </th>  <th> Name </th>  <th  width="10%"> Type </th> <th> Base Path </th> <th> Folder Name </th> </tr>';
 
		for (var i=0; data && i < data.length; i++) {
			var c = data[i];
			var props = SEC_SF_Mangr.getDefaultSerachInputs (c);
			if (inpDoc.id == c.id) { // Skip the input document to be compared.
				continue;
			} 
			txt += '<tr>';
			txt += '<td> <input class="userInputs" name="selectSecFilingDocs" type="radio" dataattr="'+c.id+'" datatype="boolean"> </td>';
			var date = new Date(props.FormFiledDate);      					 
		//	txt += '<td>'+date.toLocaleDateString()+'</td>';
			txt += '<td>'+(date.getMonth()+1)+'/'+date.getDate()+'/'+date.getFullYear()+'</td>';
			txt += '<td>'+props.CIK+'</td>';
			txt += '<td>'+props.CompanyName+'</td>';
			txt += '<td>'+props.FormType+'</td>';
			txt += '<td>'+c.basePath+'</td>';
			txt += '<td>'+c.folderName+'</td>';
			txt +=	'</tr>';
		}    	
		txt += '</table> </div>';
		return txt;
    };
    
    SEC_SF_Mangr.getFormTypeMarkup = function (inpFormType) {
    	var formTypes = SEC_SF_Mangr.formTypes[inpFormType];
    	var markup = '<select class="formInputs" dataAttr="formtype" style="width:100%">';
    	var none = "";
		markup += '<option value='+none+'>'+ none +'</option>';	 
    	for (var f=0; formTypes && f<formTypes.length; f++) {
    		var fmType = formTypes[f];
    		if (fmType == inpFormType) {
    			markup += '<option value="'+fmType+'" selected>'+fmType+'</option>';
    		} else {
    			markup += '<option value="'+fmType+'">'+fmType+'</option>';
    		}    		
    	}     	 
    	
    	return markup;
    };
    
   SEC_SF_Mangr.createSearchCompareFormHTML = function (inpDoc, inpObj){
	   var ftMarkUp = SEC_SF_Mangr.getFormTypeMarkup (inpObj.FormType);
	   var markup = '<table border="1" class="selectedFormInputs" style="width:100%">';   
       markup += '<tr>\
    				<td> <table border="1" class="firstColumn" style="width:100%"> \
	    				<tr>\
	    					<td> Start Date </td>\
	    					<td> <input type="text" id="fromDatePicker" dataAttr="fromdate" class="formInputs" style="width:100%"> </td>\
	    				</tr>\
	    				<tr>\
	    					<td> End Date </td>\
	    					<td> <input type="text" id="toDatePicker" dataAttr="enddate" class="formInputs" style="width:100%"> </td>\
	    				</tr>\
	    		         <tr>\
	    					<td> CIK </td>\
	    					<td> <input type="text" id="cik" dataAttr="cik" class="formInputs" style="width:100%"> </td>\
	    				</tr>\
    				</table> </td>\
			    	<td> <table border="1" class="secondColumn" style="width:100%"> \
						<tr>\
							<td> Company Name </td> \
    	   					<td> <input type="text" id="companyName" dataAttr="companyname" class="formInputs" style="width:100%"> </td>\
						</tr>\
						<tr>\
							<td> Form Type </td>\
    						<td> '+ftMarkUp+' </td>\
						</tr>\
    					<tr>\
    						<td> </td>\
    						<td> <button type="button" id="formSearchButton" style="width:100%" > Search </button> </td>\
    					</tr>\
					</table> </td>\
    		      </tr>';    	
    	markup += '</table>';   
    	markup += SEC_SF_Mangr.getListSearchDataMarkup (SEC_SF_Mangr.searchResult, SEC_SF_Mangr.inputDocument);
       	return markup;
    };	
   
})(vdvcDocManager,(vdvcDocManager.searchSecFilings) || (vdvcDocManager.searchSecFilings = {}));

