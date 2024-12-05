/**
 * New node file
 */


var Button = VidiViciControl.extend({
	

	constructor:function(){
		VidiViciControl.apply(this,arguments);
		
		this.attributes["w"] = 1;
		this.attributes["h"] = 1;
	},
	
	renderLayout:function() {		
		var el=this.renderContainer();
		
		Control.prototype.renderLayout.call(this);
		
		/*$.each(this.attributes,function(key,val){			
			switch(key){		
				case "position":
				case "float":
				case "background":
					el.css(key,val);
					break;
				case "height":
				case "top":
				case "width":
				case "left":
					el.css(key,val+"%");
					break;
					
			}
		});*/
		
		/*var mode=this.getMode();
		if (mode == "design") {
			var id= this.id;
			var parent = this.getParent();
			var exists = parent.el.find("#"+id);
			
			if (exists.length == 0) {
				parent.el.append(el);
			} 	
		} else {
			return el;
		}*/
	},
	
	addEvents : function() {
		var c = this,
		    el = c.renderContainer();
			parent = "#"+$(el).attr("id");
		Control.prototype.addEvents.call(this,parent);
		
		$(document).off("mouseover",parent+ " button").on("mouseover",parent+ " button",function(e) {
			e.stopPropagation();
			var width = $(this).width();
			var wrap = $(this).closest(".ctrl-wrapper");
			$(wrap).find(".config-menu").show().css({"top" : "-18px","left" : (width+18)+"px"});
		});
		
		$(document).off("mouseleave",parent).on("mouseleave",parent,function(e){
			e.stopPropagation();
			$(this).find(".config-menu").hide();
		});
	},
	
	getLayout : function(){

		var c = this,
		 	el = c.renderContainer();;
		$(el).find(".ctrl-wrapper").remove();

		var ctrlMarkup = '<div class="ctrl-wrapper grid-stack-item-content">\
							<div class="config-menu"style="display:none;position: absolute;background-color: rgba(3, 16, 255, 0.48);cursor: pointer;">\
							 <span class="fa fa-gear" style="margin:2px;float:right;color:white;" data-menu="config">\
								<div class="vdvc-flymenu" menu-id="config" style="color:black;">\
									<div class="vdvc-top-arrow"></div>\
									<span menu-item="props" class="vdvc-menu-item">Properties</span>\
								</div>\
							 </span>\
						    </div>\
							<div class="ctrl-content" style="height:100%;"></div>\
					  </div>';
		$(el).append(ctrlMarkup);
	},
	
	render : function() {
		var c = this,
			mode = c.getMode(),
			el = c.renderContainer();
		//c.renderLayout();
		c.getLayout();
		var markup = '';
		if (mode == "design") {
			markup +='<button style="color: white;width:100%;height:100%;" class="customButton btn btn-sm btn-primary" disabled></button>';
		} else {
			markup +='<button style="color: white;width:99%;height:100%;" class="customButton btn btn-sm btn-primary"></button>';
		}
		$(el).find(".ctrl-content").append(markup);
		$.each(this.attributes,function(key,val){
			
			switch(key){
				case "action":
					$(el).find("button").attr(key,val);
					break;
				case "label":
					$(el).find("button").text(val);
					break;
			}
		});
		
		c.addEvents();
	}
});


/*var Button = function(){
	this.attributes={
			"width":"0",
			"height":"0",
			"margin-top":"0",
			"margin-right":"0",
			"margin-bottom":"0",
			"margin-left":"0",
			"position":"absolute",
			"float":"left"
		};
};

Button.prototype = new VidiViciControl();

Button.prototype.renderLayout=function() {
	
	var el=this.renderContainer();
	$.each(this.attributes,function(key,val){
		switch(key){
			case "position":
			case "float":
				el.css(key,val);
				break;
			case "height":
			case "top":
			case "width":
			case "left":
				el.css(key,val+"%");
				break;
		}
	});
	return el;
};
Button.prototype.render=function() {
	var el=this.renderContainer();
	var button = $('<button style="color: white;" class="customButton btn btn-sm btn-primary"></button>');
	//button.attr("onclick","executeAction();");
	//button.on("click",executeAction(event));
	el.append(button);
	$.each(this.attributes,function(key,val){
		
		switch(key){
			case "action":
				button.attr(key,val);
				break;
			case "label":
				button.text(val);
				break;
		}
	});
};*/