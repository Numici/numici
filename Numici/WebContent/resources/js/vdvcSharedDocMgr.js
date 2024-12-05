// Shared Documents 

;(function(sharedMgr){
	
	sharedMgr.rootFolder = null;
	sharedMgr.Folders = null;
	sharedMgr.Docs = null;
	
	sharedMgr.FldrPerms = null;
	sharedMgr.currentDocPerms = null;
	
	sharedMgr.AddEvents = function() {
		$("#sh_Docs").off("mousedown").on("mousedown",function(e){
			if(e.button == 2) {
				$("#sh_Docs").contextMenu(true);
			}
		});
		
		$("#sh_Docs .vdvc-doc").off("mousedown").on("mousedown",function(event){
			event.stopPropagation();
			if(event.button == 2) {
				$("#sh_Docs").contextMenu(false);
			}
		});
		
		$("#sh_Docs .vdvc-fldr").off("mousedown").on("mousedown",function(event){
			event.stopPropagation();
			if(event.button == 2) {
				$("#sh_Docs").contextMenu(false);
			}
		});
		
		$("#sh_Docs .vdvc-fldr").off("mouseenter").on("mouseenter",function(event){
			
			var menu = $(this).find(".actions");
			var user = Util.userinfo ? Util.userinfo["UserId"] : null;
			sharedMgr.FldrPerms = null;
			var folder = $(this).data();
			var url="/folder/permissions/"+folder.id+"/"+encodeURIComponent(user);
			Util.sync_ajaxGet(url,function(result){
				if(result.Status){
					var perms = result.Folders;
					if($.isArray(perms)) {
						sharedMgr.FldrPerms = perms;
						menu.html(sharedMgr.createFolderMenu(folder));
						sharedMgr.FolderContextMenu();
						sharedMgr.addFolderMenuEvents(menu);
					}
				}else{
					Util.showMessage(result.Message);
				}
			});
		});
		
		$("#sh_Docs .vdvc-doc").off("mouseenter").on("mouseenter",function(event){
			
			
			var user = Util.userinfo ? Util.userinfo["UserId"] : null;
			sharedMgr.currentDocPerms = null;
			var folder = $(this).data();
			var url="/notes/permissions/"+folder.id+"/"+encodeURIComponent(user);
			Util.sync_ajaxGet(url,function(result){
				if(result.Status){
					var perms = result.Folders;
					if($.isArray(perms)) {
						sharedMgr.currentDocPerms = perms;
					}
				}else{
					Util.showMessage(result.Message);
				}
			});
		});
	};
	
	
	
	sharedMgr.addFolderMenuEvents = function(menu) {
		
		menu.find(".btn").on("click",function(event){
			event.stopPropagation();
			var btn_role=$(this).attr("data-btn-role");
			var current=this;

			switch(btn_role){
				
				case "open_folder":
					
					$(".selectedFolder").removeClass("selectedFolder");
					$(this).closest(".vdvc-fldr").addClass("selectedFolder");
					var folder = $(".selectedFolder").data();
					vdvcDocManager.rootFolder = folder;
					vdvcDocManager.getAllDocs(folder.id);
					break;
				case "fldrMenu":
					$(".selectedFolder").removeClass("selectedFolder");
					$(this).closest(".vdvc-fldr").addClass("selectedFolder");
					break;
					
				case "share_folder":
					$(".selectedFolder").removeClass("selectedFolder");
					$(this).closest(".vdvc-fldr").addClass("selectedFolder");
					var folder = $(".selectedFolder").data();
					vdvcDocManager.FolderPerms.shareFolder(folder);
					break;
					
				case "tagFolder":
					$(".selectedFolder").removeClass("selectedFolder");
					$(this).closest(".vdvc-fldr").addClass("selectedFolder");
					var folder = $(".selectedFolder").data();
					
					if("undefined" !== typeof folder){
						var tag = {};
						tag["Type"] = "Folder";
						tag["TopObjectId"] = folder.id;
						var tagMgr = new vdvcTagManager(tag);
						tagMgr.createTag();
					}
					break;
					
				
				case "commentFolder":
					$(".selectedFolder").removeClass("selectedFolder");
					$(this).closest(".vdvc-fldr").addClass("selectedFolder");
					var folder = $(".selectedFolder").data();
					
					if("undefined" !== typeof folder){
						var nodeId = folder.id;
						if (nodeId) {
							var annotationMgr = new AnnotationManager(nodeId);
							annotationMgr.type = "control";
							annotationMgr.show(nodeId);
						}
					}
					break;
					
				default:
					break; 
			}
		});
	};
	
	sharedMgr.RootContextMenu = function() {
		
		$.contextMenu.types.fileUpload = function(item, opt, root) {
			var c = this;
		    $('<span >' + item.customName + '</span><input type="file" class="file-upload" style="height:100%;width:100%;">').appendTo(this);
		    c.on('click', function(e) {
		    	var userid = Util.userinfo ? Util.userinfo["UserId"] : null;
		    	var postdata = {};
				postdata["parentFolderId"] = sharedMgr.rootFolder.id;
				postdata["userId"] = userid;
				postdata["ownerId"] = sharedMgr.rootFolder.ownerId;
				postdata["docType"] = "OtherDoc";

		    	 $(c).find("input").fileupload({
		    		 	url : "api/notes/upload",
				        dataType: 'json',
				        formData :postdata,
				        done: function (e, data) {
				            data.context.text('Upload finished.');
				        }
				    });
		    });
		    this.addClass("icon icon-upload");
		    
		   
		};
		
		$.contextMenu({
	        selector: '#sh_Docs', 
	        trigger:"right",
	        callback: function(key, options) {
	            var m = "clicked: " + key;
	           // window.console && console.log(m) || alert(m); 
	           switch(key) {
	           case "NewFolder":
	        	   sharedMgr.CreateFolder();
	        	   break;
	           case "Note":
	        	   sharedMgr.CreateNotes();
	        	   break;
	           }
	        },
	        items: {
	        	"NewFolder": {"name": "New Folder", "icon": "open"}, 
	            "Note": {"name": "New Note", "icon": "txt-file"},
	            "Upload": {"type":"fileUpload","customName": "Upload", "icon": "upload"}  
	        }
	    });
	};
	
	
	sharedMgr.FolderContextMenu = function() {
		$.contextMenu({
	        selector: '.vdvc-fldr .fa-ellipsis-v', 
	        trigger: 'left',
	        callback: function(key, options) {
	        	  switch(key) {
		           case "Rename":
		        	   var doc = $(".selectedFolder").data();
		        	   if (!$.isEmptyObject(doc)) {
		        		   sharedMgr.renameDoc(doc);
		        	   }
		        	   break;
		           case "Delete":
		        	   var doc = $(".selectedFolder").data();
		        	   if (!$.isEmptyObject(doc)) {
		        		   sharedMgr.deleteFolder(doc);
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
	 	        	$("#sh_Docs").contextMenu(false);
	 	        },
	 	        hide: function(opt){ 
	 	        	
	 	        }
	        }
	       
	    });
	};
	
	sharedMgr.DocContextMenu = function() {
		$.contextMenu({
	        selector: '.vdvc-doc .fa-ellipsis-v', 
	        trigger: 'left',
	        callback: function(key, options) {
	        	
	        	  switch(key) {
		           case "Rename":
		        	   var doc = $(".selectedDoc").data();
		        	   if (!$.isEmptyObject(doc)) {
		        		   sharedMgr.renameDoc(doc,"doc");
		        	   }
		        	   break;
		           case "Delete":
		        	   var doc = $(".selectedDoc").data();
		        	   if (!$.isEmptyObject(doc)) {
		        		   sharedMgr.deleteDoc(doc);
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
	 	        	$("#sh_Docs").contextMenu(false);
	 	        },
	 	        hide: function(opt){ 
	 	        	
	 	        }
	        }
	       
	    });
		
	};
	
	sharedMgr.initContextMenus = function() {
		sharedMgr.RootContextMenu();
		sharedMgr.FolderContextMenu();
		sharedMgr.DocContextMenu();
	};
	
	
	sharedMgr.deleteFolder = function(fldr) {
		
		Util.promptDialog("Do you want delete the Folder ",function() {
			var userid = Util.userinfo ? Util.userinfo["UserId"] : null;
			if (userid) {
				Util.ajaxDelete("folder/delete/"+fldr.id, {"userId":userid}, function (result) {
					if (result.Status) {
						sharedMgr.getAllDocs(sharedMgr.rootFolder.id,sharedMgr.ListAllFiles);
					} else {
						Util.showMessage(result.Message)
					}
				});
			}
		},function(){});
	};
	
	sharedMgr.deleteDoc = function(doc) {
		Util.promptDialog("Do you want delete the document",function() {
			var userid = Util.userinfo ? Util.userinfo["UserId"] : null;
			if (userid) {
				Util.ajaxDelete("notes/delete/"+doc.id, {"userId":userid}, function (result) {
					if (result.Status) {
						sharedMgr.getAllDocs(sharedMgr.rootFolder.id,sharedMgr.ListAllFiles);
					} else {
						Util.showMessage(result.Message)
					}
				});
			}
		},function(){});
	};
	
	sharedMgr.renameDoc = function(doc,type) {
		
		sharedMgr.dlg("Rename",function(ui){
			var name = ui.find("input").val();
			if (name.trim() != "") {
				var url = "folder/rename/"+doc.id+"/"+encodeURIComponent(name);
				if (type == "doc") {
					url = "notes/rename/"+doc.id+"/"+encodeURIComponent(name);
				}
				Util.ajaxPost(url, {}, function (result) {
					if (result.Status) {
						sharedMgr.getAllDocs(sharedMgr.rootFolder.id,sharedMgr.ListAllFiles);
					} else {
						Util.showMessage(result.Message)
					}
				});
			}
		},doc.name);
	};
	
	
	sharedMgr.getAllDocs = function(folderid,cb) {
		
		var userid = Util.userinfo ? Util.userinfo["UserId"] : null;
		if (userid && sharedMgr.rootFolder) {
			Util.ajaxGet("folder/list/"+folderid+"/"+encodeURIComponent(userid), function (result) {
				if (result.Status) {
					sharedMgr.Folders = result.Folders.folders || null;
					sharedMgr.Docs = result.Folders.documents || null;
					if (typeof cb == "function") {
						cb();
					} else {
						sharedMgr.ListAllFiles();
					}
				} else {
					Util.showMessage(result.Message);
				}
			},false,true);   
		}
	};
	
	sharedMgr.getAllSharedDocs = function(folderid,cb) {
		
		var userid = Util.userinfo ? Util.userinfo["UserId"] : null;
		if (userid ) {
			Util.showSpinner("manual");
			$.when(
					Util.diff_ajaxGet("/folder/shared/"+encodeURIComponent(userid),function(result){
						if (result.Status) {
							sharedMgr.Folders = result.Folders || null;
						} else {
							Util.showMessage(result.Message);
						}
					}),
					Util.diff_ajaxGet("/notes/shared/"+encodeURIComponent(userid),function(result){
						if (result.Status) {
							sharedMgr.Docs = result.Notes || null;
						} else {
							Util.showMessage(result.Message);
						}
					})
			).then(function(){
				sharedMgr.ListAllSharedFiles();
				Util.hideSpinner("manual");
			});
		}
	};
	
	sharedMgr.ListAllSharedFiles = function() {
		
		$("#page-wrapper").empty();
		$("#page-wrapper").append('<div class="row" style="height: 100%;">\
				<div id="sh_Docs" class="row" style="min-height: 1000px;"></div>\
			</div>');
		if ($.isArray(sharedMgr.Folders) && sharedMgr.Folders.length > 0 ) {
			sharedMgr.CreateFolderView(sharedMgr.Folders);
		}
		if ($.isArray(sharedMgr.Docs) &&  sharedMgr.Docs.length > 0) {
			sharedMgr.CreateNotesView(sharedMgr.Docs);
		}
		
		$(".context-title").html("Documents");
		$(".vdvc-context").attr("vdvc-context","documents");
		
		
		$.contextMenu( 'destroy', "#sh_Docs" );
		
		sharedMgr.FolderContextMenu();
		sharedMgr.DocContextMenu();
		sharedMgr.AddEvents();
	};
	
	sharedMgr.ListAllFiles = function() {
		
		$("#page-wrapper").empty();
		$("#page-wrapper").append('<div class="row" style="height: 100%;">\
				<div id="sh_Docs" class="row" style="min-height: 1000px;"></div>\
			</div>');
		if ($.isArray(sharedMgr.Folders) && sharedMgr.Folders.length > 0 ) {
			sharedMgr.CreateFolderView(sharedMgr.Folders);
		}
		if ($.isArray(sharedMgr.Docs) &&  sharedMgr.Docs.length > 0) {
			sharedMgr.CreateNotesView(sharedMgr.Docs);
		}
		
		$(".context-title").html("Documents");
		$(".vdvc-context").attr("vdvc-context","documents");
		
		sharedMgr.initContextMenus();
		sharedMgr.AddEvents();
	};
	
	
	sharedMgr.CreateFolder = function() {
		
		sharedMgr.dlg("New Folder",function(ui){
			var userid = Util.userinfo ? Util.userinfo["UserId"] : null;
			var name = ui.find("input").val();
			
			if (userid && sharedMgr.rootFolder && sharedMgr.rootFolder.id) {
				var postdata = {};
				postdata["userId"] = userid;
				postdata["folderInfo"] = {
						"folderName" : name,
						"parentFolderId" : sharedMgr.rootFolder.id
				};
				if (name.trim() != "") {
					Util.ajaxPost("folder/create", postdata, function (result) {
						if (result.Status) {
							sharedMgr.getAllDocs(sharedMgr.rootFolder.id,sharedMgr.ListAllFiles);
						} else {
							Util.showMessage(result.Message)
						}
					});
				}
			}
			
		});
	};
	
	sharedMgr.CreateNotes = function(e) {
		
		sharedMgr.dlg("New Note",function(ui){
			var userid = Util.userinfo ? Util.userinfo["UserId"] : null;
			var name = ui.find("input").val();

			if (userid && sharedMgr.rootFolder && sharedMgr.rootFolder.id) {
				var postdata = {};
				postdata["name"] = name;
				postdata["parentFolderId"] = sharedMgr.rootFolder.id;
				postdata["content"] = "";
				postdata["userId"] = userid;
				postdata["ownerId"] = sharedMgr.rootFolder.ownerId;
				postdata["docType"] = "VidiViciNotes";
				
				if (name.trim() != "") {
					Util.ajaxPost("notes/add", postdata, function (result) {
						if (result.Status) {
							sharedMgr.getAllDocs(sharedMgr.rootFolder.id,sharedMgr.ListAllFiles);
						}
					});
				}
			}
			
		});
	};
	
	sharedMgr.CreateFolderView = function(folders) {
		$("#sh_Docs").append("<div class='row vdvc-fldr-dir'></div>");
		$.each(folders, function(i,folder){
			var wrap = $("<div  class='col-xs-12 col-sm-3' style='margin-bottom:15px;'>");
			var fldr = $("<div class='vdvc-fldr' style='height:66px;box-shadow: 1px 1px 4px 0px gray;' >");
			var lable = '<div class="row" ><div class="col-xs-1 fa fa-folder" style="height:30px;padding:5px;" ></div>\
				<div class="col-xs-11 vdvc-txt-wrap" style="height:30px;padding:3px;" data-toggle="tooltip" title="'+folder.name+'">'+folder.name+'</div></div>\
				<div class="row card-ft" ><div class="col-xs-2" style="height:30px;padding:3px;" >\
				</div><div class="col-xs-10 actions" style="height:30px;padding:3px;" ></div></div>';
			fldr.data(folder);
			wrap.append(fldr);
			fldr.append(lable);
			$("#sh_Docs").find(".vdvc-fldr-dir").append(wrap);
		});
	};
	
	sharedMgr.createFolderMenu = function(folder,menu) {
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
		} else if(sharedMgr.FldrPerms){
			var perms = sharedMgr.FldrPerms;
			
			if(_.contains(perms,"Create") || _.contains(perms,"Edit")) {
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
			} else if(_.contains(perms,"View")) {
				mrk += '<div class="col-xs-2" >\
					<button class="btn btn-sm btn-primary fa fa-folder-open" data-btn-role="open_folder" data-toggle="tooltip" title="Open Folder"></button>\
				</div>';
			}
			
		}
		mrk += '</div>';
		return mrk;
	};
	
	sharedMgr.CreateNotesView = function(docs) {
		$("#sh_Docs").append("<div class='row vdvc-doc-dir'></div>");
		
		$.each(docs, function(i,document){
			var doc = document.doc;
			
			var wrap = $("<div  class='col-xs-12 col-sm-3' style='margin-bottom:15px;'>");
			var $doc = $("<div class='vdvc-doc' style='height:126px;box-shadow: 1px 1px 4px 0px gray;' >");
			var lable = '<div class="row" ><div class="col-xs-1 fa fa-file-text" style="height:30px;padding:5px;" ></div>\
				<div class="col-xs-11 vdvc-txt-wrap" style="height:30px;padding:3px;" data-toggle="tooltip" title="'+doc.name+'">'+doc.name+'</div></div>\
				<div class="row v-n-content" style="height:60px;padding:3px;">'+document.docInfo.content+'</div>\
				<div class="row card-ft" ><div class="col-xs-1" style="height:30px;padding:3px;" >\
				</div><div class="col-xs-11" style="height:30px;padding:3px;" >'+sharedMgr.createDocMenu(doc)+'</div></div>';
			$doc.data(doc);
			wrap.append($doc);
			$doc.append(lable);
			$("#sh_Docs").find(".vdvc-doc-dir").append(wrap);
		});
	};
	
	
	sharedMgr.createDocMenu = function(doc) {
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
	
	
	sharedMgr.dlg = function(title,savecb,filename) {
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
	}
	
	return sharedMgr;
})(vdvcDocManager.shared || (vdvcDocManager.shared = {}));