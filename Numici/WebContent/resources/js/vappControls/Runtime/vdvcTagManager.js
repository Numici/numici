var vdvcTagManager = function(tagObj) {
	
	var self = this;
	
	this.tag = tagObj;
	this.isBuilderCreated = false;
	this.availableTags = [ ];
	this.ui = '<table style="width:100%;"><tbody>\
		<tr><td>Tag </td><td><input class="vdvc-tag-input" type ="text" name="tagname" style="width:100%;"></td></tr>\
		<tr><td>Applied Tags </td><td><div class="vdvc-tag-list"></div></td></tr>\
		</tbody></table>';
	this.saveCallback = false;
	this.saveTag = function(dlg) {
		
		var c = this;
		var tagName = dlg.find(".vdvc-tag-input").val();
		var usrInfo = Util.getUserInfo();
		if (typeof tagName == "string" && tagName.trim() != "" && c.tag) {
			var postdata = {};
			postdata["OrganisationId"] = usrInfo["OrganizationId"];
			postdata["Tag"] = tagName;
			postdata["Item"] = c.tag;
			var url = "tags/save/";
			Util.ajaxPost(url,postdata,function(result){
				if (result.Status) {
					dlg.dialog("close");
					if (typeof c.saveCallback == "function") {
						c.saveCallback();
					}
				} else {
					Util.showMessage(result.Message);
				}
			});
		}
	};
	
	this.getAvailableTags = function(type,serchKey) {
		var c = this;
		var usrinfo = Util.getUserInfo();
		var url = "tags/list/"+usrinfo["OrganizationId"];
		if (type == "strict") {
			url = "tags/list/"+usrinfo["OrganizationId"]+"/"+serchKey;
		}
		Util.sync_ajaxGet(url,function(result){
			if (result.Status) {
				c.availableTags = result.Tag;
			}
		});
	};
	
	this.bindEvents = function(ui) {
		var c = this;
		ui.find(".vdvc-tag-input").off("keyup").on("keyup",function(){
			c.getAvailableTags("strict",$(this).val());
		});
	};
	
	this.createTag = function() {
		var c = this;
		
		if($(".vdvc-tag-dlg").length > 0) {
			$(".vdvc-tag-dlg").dialog("destroy");
		}
		
		c.dlg = $("<div class='vdvc-tag-dlg'></div>").dialog({
			//autoOpen : false,
			resizable: false,
			appendTo: "body",
			draggable: false ,
			//title : "Model Builder - New Model",
			minHeight: 200,
			width : 400,
			height : 250,
			show : { effect : "blind", duration : 500 },
			hide : { effect : "blind", duration : 500 },
			buttons : {
				"Cancel": function() {
					$(this).dialog("close");
				},
				"Save": function() {
					c.saveTag($(this));
				}
			},
			create : function(event,ui) {
				c.getAvailableTags();
				$(this).append(self.ui);
				c.isBuilderCreated = true;
				if (c.tag ) {
				    var id = c.tag.TopObjectId;
					if (c.tag.TopObjectType == "Vapp") {
						id = c.tag.FQN;
						c.getCurrentItemTags(id,"low",$(this));
					} else {
						c.getCurrentItemTags(id,"high",$(this));
					}
					
				}
				
			
				//c.bindEvents($(this));
				$(this).find(".vdvc-tag-input").autocomplete({
				      source: self.availableTags
			    });
				
				$.ui.autocomplete.filter = function (array, term) {
			        var matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex(term), "i");
			        return $.grep(array, function (value) {
			            return matcher.test(value.label || value.value || value);
			        });
			    };
			},
			close: function(){
				$(this).dialog("destroy");
				c.isBuilderCreated = false;
			}
		});
	};
	
	
	this.getCurrentItemTags = function(id,type,dlg) {
	
		var c = this;
		var usrinfo = Util.getUserInfo();
		var url = "/tags/gettags/"+type+"/"+id;
		var list = dlg.find(".vdvc-tag-list");
		Util.sync_ajaxGet(url,function(result){
			if (result.Status) {
				c.CurrentitemTags = result.Tag;
				if ($.isArray(result.Tag) && result.Tag.length > 0 ) {
					var style = {
						"background": "rgba(125, 148, 7, 0.2)",
				  	    "border-radius": "5px",
					    "padding": "5px",
					    "float": "left",
					    "margin": "3px",
					    "box-shadow": "inset 0 1px 0 rgba(255, 255, 255, .15), 0 1px 5px rgba(0, 0, 0, .075)",
					    "border": "2px solid rgba(125, 148, 7, 0.2)"
					};
					
					
					$.each(result.Tag,function(i,v){
						var tag = $("<span class='vdvc-tags'>");
						tag.append(v.TagName);
						tag.data("tag",v);
						tag.css(style);
						list.append(tag);
					});
				} else {
					list.append("NONE");
				}
			}
		});
	};
	
	
	
	this.getLayout = function(){

		var c = this;
		var el = c.el;
		var attributes = c.attributes;
		$(el).find(".ctrl-wrapper").remove();

		var ctrlMarkup = '<div class="ctrl-wrapper grid-stack-item-content">\
							<div class="ctrl-toolbar" style="height:25px;">\
								 <div class="ctrl-titlebar"  style="width:50%;float:left;">\
								  <span class="ctrl-name"></span>\
								 </div>\
								<div class="ctrl-tools"  style="width:40%;float:left;">\
								  <button class="btn btn-xs btn-primary fa fa-arrow-left" style="margin:2px;float:left;">\
								  </button>\
								  <button class="btn btn-xs btn-primary fa fa-times" style="margin:2px;float:left;">\
								  </button>\
								</div>\
							</div>\
							<div class="ctrl-content" style="overflow:auto;">\
								<div class="vdvc-taglist"></div>\
								<div class="vdvc-selected-tag" style="display:hidden;height:100%;ovrerflow:auto;">\
								</div>\
							</div>\
					  </div>';
		$(el).append(ctrlMarkup);
		$(el).find(".ctrl-name").append(c.name);
		var controlHeight = $(el).height();
		var contentHeight = controlHeight-($(el).find(".ctrl-title").height()+$(el).find(".ctrl-toolbar").height());
		$(el).find(".ctrl-content").height(contentHeight);
	};

	
	this.getTags =  function() {
		var c = this,
		el = c.el;
		
		var usrinfo = Util.getUserInfo();
		var url = "tags/list/"+usrinfo["OrganizationId"];
		Util.sync_ajaxGet(url,function(result){
			if (result.Status) {
				c.tags = result.Tag;
				c.renderUi();
			}
		});
	};
	
	
	
	this.renderTagItems = function(items) {
		
		
		var c = this;
		$(c.el).find(".vdvc-taglist").hide();
		$(c.el).find(".vdvc-selected-tag").empty().show();
		if ($.isArray(items)) {
			$.each(items,function(i,v){
				
				var div = $('<div  class="vdvc-tag-item">');
				div.data("item",v);
				var mrkup = '<div class="vdvc-tag-actions"></div>';
				
				if (v.topObjectType) {
					div.append('<div class="vdvc-tag-item-h" data-type="'+v.topObjectType+'">'+v.topObjectType+'</div>');
				}
				
				if (v.type) {
					div.append('<div class="vdvc-tag-item-h" data-type="'+v.type+'">'+v.type+'</div>');	
				} 
				if (v.fqn) {
					//div.append("<div>Control : "+v.fqn+"</div>");
					div.append("<div>Vapp : "+v.vappName+"</div>");
					div.append("<div>Model : "+v.modelName+"</div>");
				} else if(v.type == "Vapp") {
					div.append("<div>Vapp : "+v.vappName+"</div>");
					div.append("<div>Model : "+v.modelName+"</div>");
				} else if (v.type == "Model") {
					div.append("<div>Name : "+v.modelName+"</div>");
				} else if (v.type == "Folder") {
					div.append("<div>Name : "+v.folderName+"</div>");
				} else if(v.type == "Document") {
					div.append("<div>Name : "+v.documentName+"</div>");
				}
				var mk = '<div style="height:25px;">\
					<button class="btn btn-xs btn-info fa fa-tag" style="color:red;float:right;margin-right:3px;height:20px;width:20px;"></button>\
					<button class="btn btn-xs btn-info fa fa-external-link" style="float:right;margin-right:3px;height:20px;width:20px;"></button>\
					</div>';
				div.append(mk);
				$(c.el).find(".vdvc-selected-tag").append(div);
				
				div.append(mrkup);
			});
			
			$(c.el).find(".vdvc-selected-tag").off("scroll").on("scroll",function(e){
				//alert("Hie");
			});
			
			$(c.el).find(".fa-tag").off("click").on("click",function(e){
				Util.showMessage("Not yet Implemented");
			});
			
			$(c.el).find(".fa-external-link").off("click").on("click",function(e){
				
				var tag_item = $(this).closest(".vdvc-tag-item");
				var item = tag_item.data("item");
				if (!$.isEmptyObject(item)) {
					var pathnaemArray=window.location.pathname.split( '/' );
					var _context="/" + pathnaemArray[1];
					if (item.type == "Vapp") {
						var modelId = item.modelId;
						var vappId = item.topObjectId;
						var wid = item.workspaceId;
						if(wid && modelId && vappId){
							_windowController.openWindow(_context + "/vAppDefault.jsp?vappId="+vappId+"&modelId="+modelId+"&scenarioId="+wid+"&flag=true",vappId);
						}else{
							
						}
					} else if (item.type == "Model") {
						var modelId = item.topObjectId;
						if(modelId){
							_windowController.openWindow(_context+"/vidivicibuilder.html?modelId="+modelId,"vdvcBuilder"+modelId);
						}
					} else if(item.fqn){
						var modelId = item.modelId;
						var vappId = item.topObjectId;
						var wid = item.workspaceId;
						var ctrlId = item.fqn;
						if(wid && modelId && vappId && ctrlId){
							_windowController.openWindow(_context + "/vAppDefault.jsp?vappId="+vappId+"&modelId="+modelId+"&scenarioId="+wid+"&ctrlId="+ctrlId+"&flag=true",vappId);
						}else{
							
						}
					}
				}
			});
		}
	};
	
	this.handleTagActions = function(action) {
		
		var action_type = action.attr("data-action");
		if (action_type == "delete") {
			var item = action.closest(".vdvc-tag-item").data("item");
			
		}
	};
	
	
	this.addEvents = function() {
		var c = this;
		$(c.el).find(".vdvc-tags").off("click").on("click",function(e){
			var tag = $(this).attr("tag");
			var userInfo = Util.getUserInfo();
			if (tag && userInfo) {
				
				var url = "tags/get/"+userInfo["OrganizationId"]+"/"+encodeURIComponent(tag)+"/user";
				Util.ajaxSyncGet(url,function(result){
					if (result.Status) {
						var items = result.Tag.items;
						c.renderTagItems(items);
					} else {
						Util.showMessage(result.Message);
					}
				});
			}
		});
		
		
		$(c.el).find(".fa-arrow-left").off("click").on("click",function(e){
			$(c.el).find(".vdvc-taglist").show();
			$(c.el).find(".vdvc-selected-tag").hide();
		});
		
		$(c.el).find(".fa-times").off("click").on("click",function(e){
			if (c.el.hasClass("active")) {
				c.el.removeClass("active");
			}
			$(c.el).slideToggle();
		});
	};
	
	this.renderUi = function() {
		
		var c = this,
			el = c.el;
		var markup = "";
		var tags = c.tags;
		
		if($.isArray(tags) && tags.length > 0) {
			$.each(tags,function(i,v){
				markup +='<span class="vdvc-tags" tag="'+v+'">'+v+'</span>' ;
			});
		}
		
		$(el).find(".ctrl-content .vdvc-taglist").append(markup);
		c.addEvents();
	};
	
	this.render = function () {
		var c = this;
		//c.renderLayout();		
		c.getLayout();
		c.getTags();
	};
	
	
};