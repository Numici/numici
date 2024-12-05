
var TagControl = VidiViciControl.extend({
	constructor : function(options){
		VidiViciControl.apply(this,arguments);
		this.controlType = "TagControl";
		this.tM = new vdvcTagManager();
		this.tags = [];
	},
	
	
	renderLayout : function() {
		var c = this;
		var el = c.renderContainer();
		el.addClass("vapp-control");
		el = Control.prototype.renderLayout.call(this);
		return el;
	},
	
	getLayout : function(){

		var c = this;
		var el = c.el;
		var attributes = c.attributes;
		$(el).find(".ctrl-wrapper").remove();

		var ctrlMarkup = '<div class="ctrl-wrapper grid-stack-item-content">\
							<div class="ctrl-toolbar">\
								 <div class="ctrl-titlebar"  style="width:50%;float:left;">\
								  <span class="ctrl-name"></span>\
								 </div>\
							</div>\
							<div class="ctrl-content" style="overflow:auto;">\
								<div class="vdvc-taglist"></div>\
								<div class="vdvc-selected-tag" style="display:hidden;height:100%;padding:5px;">\
								</div>\
							</div>\
					  </div>';
		$(el).append(ctrlMarkup);
		$(el).find(".ctrl-name").append(c.name);
		var controlHeight = $(el).height();
		var contentHeight = controlHeight-($(el).find(".ctrl-title").height()+$(el).find(".ctrl-toolbar").height());
		$(el).find(".ctrl-content").height(contentHeight);
	},

	
	getTags : function() {
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
	},
	
	
	
	renderTagItems : function(items) {
		var c = this;
		$(c.el).find(".vdvc-taglist").hide();
		$(c.el).find(".vdvc-selected-tag").show();
		$(c.el).find(".vdvc-selected-tag").empty().append("<button class='btn btn-sm btn-primary'>Back</button>");
		$(c.el).find(".vdvc-selected-tag .btn").off("click").on("click",function(e){
			$(c.el).find(".vdvc-taglist").show();
			$(c.el).find(".vdvc-selected-tag").hide();
		});
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
					div.append("<div>"+v.fqn+"</div>");
				} else {
					div.append("<div>"+v.topObjectId+"</div>");
				}
				$(c.el).find(".vdvc-selected-tag").append(div);
				
				div.append(mrkup);
			});
			
			$(c.el).find(".vdvc-tag-item").off("mouseover").on("mouseover",function(e){
				e.stopPropagation();
				var type = $(this).attr("data-type");
				var pos = $(this).position();
				var actions = $(this).find(".vdvc-tag-actions");
				if (actions.find(".btn").length == 0 ) {
					actions.show().css({"top" :pos.top+"px","left" :"10px","width": $(this).width()});
					if (type == "Model") {
						actions.append("<button class='btn btn-xs btn-warning' data-action='open'>Open</button>");
					} else {
						actions.append("<button class='btn btn-xs btn-warning' data-action='run'>Run</button>");
					}
					//actions.append("<button class='btn btn-xs btn-warning' data-action='delete'>Delete</button>");
				}
				
				$(this).find(".btn").off("click").on("click",function(e){
					c.handleTagActions($(this));
				});
			});
			
			$(c.el).find(".vdvc-tag-item").off("mouseleave").on("mouseleave",function(e){
				var type = $(this).attr("type");
				$(this).find(".vdvc-tag-actions").hide().empty();
			});
			
			
		}
	},
	
	handleTagActions : function(action) {
		
		var action_type = action.attr("data-action");
		if (action_type == "delete") {
			var item = action.closest(".vdvc-tag-item").data("item");	
		}
	},
	
	
	addEvents : function() {
		var c = this;
		$(c.el).find(".vdvc-tags").off("click").on("click",function(e){
			var tag = $(this).attr("tag");
			var userInfo = Util.getUserInfo();
			if (tag && userInfo) {
				var url = encodeURI("tags/get/"+userInfo["OrganizationId"]+"/"+tag+"/user");
				Util.ajaxSyncGet(url,function(result){
					if (result.Status) {
						var items = result.Tag.items;
						c.renderTagItems(items);
					}
				});
			}
			
			
		});
	},
	
	renderUi : function() {
		
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
	},
	
	render : function () {
		var c = this;
		c.renderLayout();		
		c.getLayout();
		c.getTags();
	}

});
