
var ctor = function(){};
		  
var extend = function(protoProps, staticProps) {
//	
	var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && protoProps.hasOwnProperty('constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ parent.apply(this, arguments); };
    }

    // Inherit class (static) properties from parent.
    _.extend(child, parent);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Add static properties to the constructor function, if supplied.
    if (staticProps) _.extend(child, staticProps);

    // Correctly set child's `prototype.constructor`.
    child.prototype.constructor = child;

    // Set a convenience property in case the parent's prototype is needed later.
    child.__super__ = parent.prototype;

    return child;
};
			  

var Control = function(options){
 
	if (options && options.el) {
		this.el = options.el;
	} else
		this.el=false;
			
	this.name=null;
	this.designerData=null;
	this.attributes={
		"width":"0",
		"height":"0",
		"top":"0",
		"left":"0",
		"position":"absolute",
		"float":"left",		 
	};
	
	this.mode='run';
	this.controlId = null;
	this.isContainer=false;
	this.screen=null;
	this.parentType=null;
	this.parent=null;
	this.vappgenAttrs=null;
	this.json=null;
	this.customDesigner= null;	 
	this.controlType = null;
	this.isControlUpdated = false;
		
	this.isFilterable = false;
	this.XfilterObjs = {};
	this.aggXfilterObjs = {};
	this.dataSets = {};
	this.aggDataSets = {};
	this.dimensions = {};
	this.virtualDims = {};
	this.aggDimensions = {};
	this.appliedFilters = {};
	this.associatedFilters = [];
	
	this.blockDef = null;
	this.objectId = null;
	
//	this.initialize(options);		 
};


Control.extend = extend;

_.extend(Control.prototype, {
	
	getJson: function (options) {
		this.json = {};
		
		if (this.getObjectId() != null) {
			this.json["id"]=this.getObjectId();
		}
		this.json["name"]=this.name;
		this.json["attributes"]=this.attributes;
		this.json["controlType"] = this.vappgenAttrs.name;
		this.json["controlChanged"] = this.isControlUpdated;
		if (this.customDesigner) {
			this.json["designerData"] = this.designerData;
		}
		return this.json;
	},
	
	
	
	addEvents : function(parent) {
		var c = this;
		if (parent) {
			
			
			$(parent).off("remove").on("remove", function () {
			    //alert(c.getControlType());
			});
			
			$(document).on("click",parent+" .fa-comments",function(e) {
				e.stopPropagation();

				var nodeId = c.objectId;
				if (nodeId) {
					var annotationMgr = new AnnotationManager(nodeId);
					annotationMgr.type = "control";
					annotationMgr.show(nodeId);
				}
			});
			
			
			$(document).off("mouseover",parent+ " .fa-gear").on("mouseover",parent+ " .fa-gear",function(e) {
				e.stopPropagation();
				var pos = $(this).position();
				var menufor = $(this).attr("data-menu");
				var menu = $(parent).find('div[menu-id="'+menufor+'"]');
				var lft = pos.left-80;
				var top = pos.top+14;
				$(menu).css({"left":lft+"px","top" : top+"px"});
				$(menu).show();
			});

			$(document).off("mouseleave",parent+ " .fa-gear").on("mouseleave",parent+ " .fa-gear",function(e) {
				e.stopPropagation();
				var pos = $(this).position();
				var menufor = $(this).attr("data-menu");
				var menu = $(parent).find('div[menu-id="'+menufor+'"]');
				$(menu).hide();
			});
			
			
			$(document).off("click",parent+ " .fa-tag").on("click",parent+ " .fa-tag",function(e) {
				e.stopPropagation();
				
				if (c.mode == "run" && window.vAppController && vAppController.vapp) {
					
					var appid = vAppController.vapp.vappId;
					var tag = {};
					tag["Type"] = c.controlType;
					tag["TopObjectType"] = "Vapp";
					tag["TopObjectId"] = appid;
					tag["FQN"] = c.objectId;
					var tagMngr = new vdvcTagManager(tag); 
					tagMngr.saveCallback = function() {
						var scrn = c.screen;
						if (scrn) {
							var ctrls = scrn.controls;
							if (ctrls) {
								$.each(ctrls,function(i,v){
									if (v.controlType == "TagControl") {
										v.render();
									}
								});
							}
						}
					};
					if(!tagMngr.isBuilderCreated) {
						tagMngr.createTag(tag);
					}
				}
			});
			
			$(document).off("click",parent+ " .vdvc-flymenu .vdvc-menu-item")
			.on("click",parent+ " .vdvc-flymenu .vdvc-menu-item",function(e) {
				e.stopPropagation();
				var menuitem = $(this).attr("menu-item");
				switch(menuitem) {
				case "props" : 
					c.getControlPropertiesFromUser();					 
					break;
				case "config" :
					var customData = c.designerData;
					c.launchConfig (customData);
					break;
				}
				$(this).parent().toggle();
			});
		}
	},
	
	addAttributes:function(attr){
		var current=this;
		if(typeof attr !== "undefined" && !jQuery.isEmptyObject(attr)){
			$.each(attr,function(key,val){
				current.attributes[key]=val;
			});
		}
	},
	
	getMode: function() {
		return this.mode;
	},
	
	setMode: function(mode) {
		this.mode = mode;
	},
	
	getScreen: function() {
		return this.screen;
	},
	
	setScreen: function(scrn) {
		this.screen = scrn;
	},
	
	setControlUpdated: function (status) {
		this.isControlUpdated = status;
	},
	
	getControlUpdated: function () {
		return this.isControlUpdated;
	},
	
	getName: function() {
		return this.name;
	},
	
	setName: function(name) {
		var scrn = this.getScreen();
		if (!this.name) {
			scrn.setCtrlUniqueName (name, this.getControlType());
			this.name = name;			
		} else if (this.name != name) {			
			scrn.updateUniqueNameList (this.name, name);	
			this.name = name;
		} 
	},
	
	getAttrName: function(){
		if (this.attributes && this.attributes.name)
			return this.attributes.name;
		
		return null;
	},
	
	getUniqueName: function() {
 		var scrn = this.getScreen();
		var type = this.getControlType();
		
		return scrn.getCtrlUniqueName(type);
	},
	
	isNameUnique: function(name) {
		var scrn = this.getScreen();
		
		if (name == this.getName())
			return true;
		
		return scrn.isCtrlNameUnique(name);
	},
	
	setAttrName: function(name){
		if (this.attributes){
			this.attributes.name = name;
			return true;
		}
		
		return false;
	},
	
	setCustomDesigner: function(data) {
		this.customDesigner = data;
	},
	
	getCustomDesigner: function() {
		return(this.customDesigner);
	},
	
	setObjectId: function(objectId) {
		this.objectId = objectId;
	},
	
	getObjectId: function() {
		return this.objectId;
	},
	
	getCustomDesignerData: function() {
		return this.designerData;
	},
	
	
	saveUserPrefs : function() {
		
		var c = this,
			dsnrDta = c.designerData,
			props = c.attributes;
			if(c.mode == "run") {
				var vappCtrl = window.vAppController;
				if (vappCtrl) {
					var vapp = vappCtrl.vapp,
					postdata = {},
					ctrlName = c.name,
					url = "workspace/saveconfig/"+vapp.currentWorkspace+"/"+vappCtrl.cscrnIndex+"/"+ctrlName;
					postdata["attributes"] = {};
					if (props) {
						postdata["attributes"]["dimensionProperties"] = c.attributes;
					}
					if (dsnrDta) {
						postdata["attributes"]["designerProperties"] = c.designerData;
					}
					
					Util.ajaxPost(url, postdata, function(result) {
						if (!result.Status) {
							Util.showMessage(result.Message);
						} 
					},false,false);
				}
			}
	},
	
	setCustomDesignerData : function(data) {
		
		var c = this;
		c.designerData = data;
		c.saveUserPrefs();
		c.setControlUpdated (true);
	},
	
	getAttributes:function(){
		return this.attributes;
	},
	
	setAttributes:function(attrs){
		this.attributes = attrs;
	},
	
	getVappgenAttributes:function(){
		return this.vappgenAttrs;
	},
	
	setVapggenAttributes:function(attrs){
		this.vappgenAttrs = attrs;
	},
	
	initialize:function(options) {
		var c = this;
		
		if (c.objectId == null) {
			Util.sync_ajaxGet("uniqueid/get",function(result){
				if (result.Status){
					c.objectId = result.UniqueId;
				} else {
					console.log("Failed to get Unique id");
				}
			});
		}
		
		
		if (c.getControlType() == "ScreenControl") {
			return;
		}
		
		$(this.el).draggable({
			appendTo: "body",
			cursor: "move",
			cancel: false,
			 
		//	helper: "clone", 
			drag:  function (event, ui) {
				 var snapTolerance = $(this).draggable('option', 'snapTolerance');
			        var topRemainder = ui.position.top % 20;
			        var leftRemainder = ui.position.left % 20;
			        
			        if (topRemainder <= snapTolerance) {
			            ui.position.top = ui.position.top - topRemainder;
			        }
			        
			        if (leftRemainder <= snapTolerance) {
			            ui.position.left = ui.position.left - leftRemainder;
			        }
			},
			start: function (event, ui) {
				$(c.el).resizable('disable');
				
				console.log ("control drag started ....!!");
				console.log ("Control drag started at Top :"+Math.round(ui.position.top)+
									" & Left :"+Math.round(ui.position.left));
				var borderSize = ($(c.el).outerWidth()-$(c.el).innerWidth());
				borderSize = Math.round(borderSize);
				console.log ("Border size : "+borderSize);
			},
			stop: function (event, ui) {
				console.log ("control drag stopped ....!!");
				console.log ("Control drag stopped at Top :"+Math.round(ui.position.top)+
						" & Left :"+Math.round(ui.position.left));
				var borderSize = ($(c.el).outerWidth()-$(c.el).innerWidth());
				borderSize = Math.round(borderSize);
				console.log ("Border size : "+borderSize);
				c.setControlUpdated (true);	
				$(c.el).resizable('enable');
			}			
		});
		
		$(this.el).resizable({
			handles: "n, e, s, w, ne, se, sw, nw",
			grid:[20,20],
			containment: ".vappgen-container",
			resize:  function (event, ui) {
			
			},
			start: function (event, ui) {
				
				$(c.el).draggable('disable');
				
				console.log ("control resize started ....!!");
				console.log ("Control resizing started at Top :"+Math.round(ui.position.top)+ 
									" & Left :"+Math.round(ui.position.left));
				console.log ("Control resizing dimensions (Width & Height) are :"+ 
										Math.round(ui.size.width) + " & "+
										Math.round(ui.size.height));
				
				var borderSize = ($(c.el).outerWidth()-$(c.el).innerWidth());
				borderSize = Math.round(borderSize);
				console.log ("Border size : "+borderSize);
				 
			},
			stop: function (event, ui) {
				console.log ("control resize stopped ....!!");
				console.log ("Control resizing stopped at Top :"+ Math.round(ui.position.top)+ 
									" & Left :"+Math.round(ui.position.left));
				console.log ("Control resized dimensions (Width & Height) are :"+
								Math.round(ui.size.width) + " & "+
								Math.round(ui.size.height));
				 
				var borderSize = ($(c.el).outerWidth()-$(c.el).innerWidth());
				borderSize = Math.round(borderSize);
				console.log ("Border size : "+borderSize);
				
				var ctrlPosition = {'top': Math.round(ui.position.top),
										'left': Math.round(ui.position.left)};
				
			/*	var size = {'width':Math.round(ui.size.width)+borderSize, 
								'height':Math.round(ui.size.height)+borderSize};*/
				
				var size = {};
				
				var diff = Math.abs(c.el.outerWidth());
				var rem = diff % 20;
				
				
				var diffH = Math.abs(c.el.outerHeight());
				var remH = diffH % 20;
				
				if (rem < 10) {
					size["width"] = c.el.outerWidth()-rem;
				} else {
					size["width"] = c.el.outerWidth()-rem+20;
				}
				
				if (remH < 10) {
					size["height"] = c.el.outerHeight()-remH;
				} else {
					size["height"] = c.el.outerHeight()-remH+20;
				}
				
				c.setControlUpdated (true);
				c.resetAttributes (ctrlPosition, size);
				c.renderLayout();
				c.render();
				$(c.el).draggable('enable');
			}			
		});
	 
		$(this.el).droppable({
			drop: function( event, ui ) {
				var filterCtrl = Control.prototype._draggingControl;
				if (filterCtrl && filterCtrl.getControlType() == "CompositeFilter") {
					console.log ("control dropped on :"+c.getControlType());
			//		alert ("control dropped on :"+c.getControlType());
					
					filterCtrl.singleControlFilterMode = true;			
					filterCtrl.singleControlFilterName = c.getName();					
				}	
				//	event.stopPropagation(); TODO allow to drop on single control only.
			}
		}); 
		
		
	},
	
	render: function() {
		
	},
	renderContainer:function(){
		return this.el;
	},
	
	renderLayout : function() {
		var c = this,
			attr = c.attributes;
		var el = c.renderContainer();
		var mode=this.getMode();
		
		var w = c.screen.dwidth;
		var h = c.screen.height;
		var sw = $(c.screen.el).width();
		var sh = $(c.screen.el).height();
		var ar = sw/w;
		//var sh = $(window).height();
		
		/*if (mode == "design") {
			var id = c.id;
			var parent = c.getParent();
			var exists = parent.el.find("#"+id);
			
			if (exists.length == 0) {
				parent.el.append(el);
			} 		
			$.each(attr,function(key,val){
				switch(key){
				case "background":
				case "position":
				case "float":
					el.css(key,val);
					break;
				case "title":
					el.find(".title").append(val);
					break;
				case "widthInPixels":
					el.css("width",val+"px");
					break;
				case "heightInPixels":
					el.css("height",val+"px");
					break;
				case "topInPixels":
					el.css("top",val+"px");
					break;
				case "leftInPixels":
					el.css("left",val+"px");
					break;
				}
			});
		}else{
			$.each(attr,function(key,val){
				switch(key){
				case "title":
					el.find(".title").append(val);
					break;
				case "width":
					el.addClass("col-sm-"+(parseInt(val/8.33)));
					break;
				case "heightInPixels":
					el.css("height",(val*ar)+"px");
					break;
				}
			});
		}
		*/
		
		
		
		
		
		
		
		if (mode == "design") {
			var id = c.id;
			var parent = c.getParent();
			var exists = parent.el.find("#"+id);
			
			if (exists.length == 0) {
				parent.el.append(el);
			} 		
			
	 
			if(!(attr["widthInPixels"] && attr["heightInPixels"] && attr["topInPixels"] && attr["leftInPixels"])) {
				$.each(attr,function(key,val){
					switch(key){
					case "background":
					case "position":
					case "float":
						el.css(key,val);
						break;
					case "title":
						el.find(".title").append(val);
						break;
					case "width" :
						el.css(key,((val/100)*sw)+"px");
						break;
					case "height" :
						el.css(key,((val/100)*sh)+"px");
						break;
					case "top" :
						el.css(key,((val/100)*sh)+"px");
						break;
					case "left" :
						el.css(key,((val/100)*sw)+"px");
						break;
					}
				});
			} else {
				$.each(attr,function(key,val){
					switch(key){
					case "background":
					case "position":
					case "float":
						el.css(key,val);
						break;
					case "title":
						el.find(".title").append(val);
						break;
					case "widthInPixels":
						el.css("width",val+"px");
						break;
					case "heightInPixels":
						el.css("height",val+"px");
						break;
					case "topInPixels":
						el.css("top",val+"px");
						break;
					case "leftInPixels":
						el.css("left",val+"px");
						break;
					}
				});
			}
		} else {
			
			if(!(attr["widthInPixels"] && attr["heightInPixels"] && attr["topInPixels"] && attr["leftInPixels"])) {
				$.each(attr,function(key,val){
					switch(key){
					case "background":
					case "position":
					case "float":
						el.css(key,val);
						break;
					case "title":
						el.find(".title").append(val);
						break;
					case "width" :
						el.css(key,((val/100)*sw)+"px");
						break;
					case "height" :
						el.css(key,((val/100)*sh)+"px");
						break;
					case "top" :
						el.css(key,((val/100)*sh)+"px");
						break;
					case "left" :
						el.css(key,((val/100)*sw)+"px");
						break;
					}
				});
			} else {
				$.each(attr,function(key,val){
					switch(key){
					case "background":
					case "position":
					case "float":
						el.css(key,val);
						break;
					case "title":
						el.find(".title").append(val);
						break;
					case "widthInPixels":
						el.css("width",(val*ar)+"px");
						break;
					case "heightInPixels":
						el.css("height",(val*ar)+"px");
						break;
					case "topInPixels":
						el.css("top",(val*ar)+"px");
						break;
					case "leftInPixels":
						el.css("left",(val*ar)+"px");
						break;
					}
				});
			}
		}
		return el;
	},
	
	setModel:function(model){
		this.model=model;
	},

	getModel:function(){
		return this.model;
	},

	setScreen:function(screen){
		this.screen=screen;
	},

	getScreen:function(){
		return this.screen;
	},
	
	_getDimensionInPercentage: function (curVal, MaxVal) {
		var result = curVal/MaxVal*100;
		return (result.toFixed(2));		
	},
	
	resetAttributes: function (pos, dim) {	
		console.log ("control reset attributes invoked ....!!");
		var attrs = this.attributes;
		var c = this;
		
		var size = {};
		var position = {};
		
		position.top = Math.round(pos.top);
		position.left = Math.round(pos.left);
		
		/*size.width = Math.round(dim.width);
		size.height = Math.round(dim.height);*/
		
		size.width = dim.width;
		size.height = dim.height;
		
		var containerWidth =  Math.round(this.parent.el.width());
		var containerHeight = Math.round(this.parent.el.height());
		var top = position.top;
		var left = position.left;
				
		console.log ("Control Position in reset funcion top: "+top+"("+containerWidth+")"+ "Left: "+left+"("+containerHeight+")");
		console.log ("Control Size in reset function width: "+size.width+"("+containerWidth+")"+ "height: "+size.height+"("+containerHeight+")");
	
		$.each(this.attributes,function(key,val){
			switch (key) {
			case 'width':
				c.attributes[key] = c._getDimensionInPercentage(size.width, containerWidth);
				c.attributes['widthInPixels'] = size.width;
				console.log ("Control width in percentage: "+c.attributes[key]);
				break;
			case 'height':
				c.attributes[key] = c._getDimensionInPercentage(size.height, containerHeight);
				c.attributes['heightInPixels'] = size.height;
				console.log ("Control height in percentage: "+c.attributes[key]);
				break;
			case 'top':
				c.attributes[key] = c._getDimensionInPercentage(top, containerHeight);
				c.attributes['topInPixels'] = top; 
				break;
			case 'left':
				c.attributes[key] = c._getDimensionInPercentage(left, containerWidth);
				c.attributes['leftInPixels'] = left; 
				break;
			}
		});
		
		// Read default values. currently reading filterable attribute only
		for (var i=0; i<this.vappgenAttrs.attributes.length; i++){
			var curAttr = this.vappgenAttrs.attributes[i];
			if (curAttr.name == "filterable"){
				this.attributes[curAttr.name] = (curAttr.defaultValue == "true" ? true : false);
			}
		}
		return attrs;
	},
	
	setId: function (id) {
		this.controlId = id;
	},
	
	getId: function () {
		return this.controlId;
	},
	
	setParentType: function (type){
		this.parentType = type;
	},
	
	getParentType: function (){
		return this.parentType;
	},
	
	setParent: function (parent){
		this.parent = parent;
	},
	
	getParent: function (){
		return this.parent;
	},
	
	setControlType: function (type){
		this.controlType = type;
	},
	
	getControlType: function (){
		return this.controlType;
	},
	
	addFilter: function (filter) {
		if (this.associatedFilters.indexOf(filter) == -1)
			this.associatedFilters.push(filter);
	},
	
	getFilters: function () {
		return this.associatedFilters;
	},
	
	removeFilter: function (filter) {
		var index = this.associatedFilters.indexOf(filter);
		if (index != -1)
			this.associatedFilters.splice(index, 1);
	},
	
	
	initVappControl: function (context, type, position) {		
		var scrn = context.getScreen();
		var ctrlAttrs = scrn.getMatchingControlAttrs(type);
		var ctrl = this;
		
		ctrl.blockDef = modelBlocks;
		ctrl.setScreen(scrn);
		ctrl.isContainer = ctrlAttrs.container;
		ctrl.setVapggenAttributes(ctrlAttrs);
		
		ctrl.setParentType(context.getControlType());
		ctrl.setParent(context);
			
		var div=$('<div class="vdvcCtrl">');
	    var id = div.uniqueId();
	    ctrl.el=div;
	    ctrl.initialize();
	    ctrl.setControlType(type);
	    ctrl.setId (id.attr("id"));
	    ctrl.setControlUpdated(false);
	    if (!ctrl.getName())
	    	ctrl.setName(ctrl.getUniqueName());
	
	    div.data ("ctrlObj", ctrl);				    
	    
	    var size;
	    if (ctrl.isContainer) {
	    	size = {'width':200, 'height':200};
	    } else  {
	    	size = {'width':100, 'height':100};
	    }
	    
	    if (type == "Button")
	    	size.height = 40;
	    
	  	// Handle custom _controls.
		if (ctrlAttrs.customDesigner) {
			ctrl.customDesigner = new window[ctrlAttrs.customDesigner] ();
		}
		
		var attrs=null;
		if (position) {
			attrs = ctrl.resetAttributes(position, size);			
		} else {
			attrs = ctrl.getAttributes();		
		}
	
		if (ctrl.parentType == "ScreenControl") {
 			ctrl.setBoundariesToParent ();
 		}
 
	    ctrl.renderLayout();
	    try {
	    ctrl.render();
	    } catch (err) {
	    	console.log ("Failed to render the control: "+ ctrl.getName()+ " & err is : "+err.message);
	    }
	    finally {
	    	context.controls.push(ctrl);
	    }	   
	      
	},
	
	setBoundariesToParent: function () {
		this.el.draggable("option", "containment", "parent");
		this.el.resizable("option", "containment", "parent");
	},
	
	
	getDataSet : function (key) {
		
		var current = this;
		if(key){
			return current.dataSets[key];
		}else {
			return current.dataSets;
		}
		
	},
	
	getAggDataSet : function (key) {
		
		var current = this;
		if(key){
			return current.aggDataSets[key];
		}else {
			return current.aggDataSets;
		}
		
	},
	
	getXfilterObj : function (key) {
		var current = this;
		if(key){
			return current.XfilterObjs[key];
		}else {
			return current.XfilterObjs;
		}
	},
	
	getAggXfilterObj : function (key) {
		var current = this;
		if(key){
			return current.aggXfilterObjs[key];
		}else {
			return current.aggXfilterObjs;
		}
	},
	
	createDimensions : function (dim,isNew) {
		var current = this;
		var dimension = current.dimensions[dim];
		
		if(!dimension || isNew) {
			var blockName = current.getBlockNameFromDim(dim);
			var XfilterObj = current.getXfilterObj(blockName);
			if(typeof XfilterObj != "undefined"){
				dimension = XfilterObj.dimension(function(d){
					if(typeof dim !== "undefined" && typeof d[dim] !== "undefined"){
						return d[dim];
					}
				});
			}
			if(!isNew){
				current.dimensions[dim] = dimension;
			}
		}
		return dimension;
	},
	
	
	createVirtualDim : function (dim,isNew) {
		var current = this;
		var dimension = current.dimensions[dim];
		
		if(!dimension || isNew) {
			var blockName = current.getBlockNameFromDim(dim);
			var XfilterObj = current.getXfilterObj(blockName);
			if(typeof XfilterObj != "undefined"){
				dimension = XfilterObj.dimension(function(d){
					if(typeof dim !== "undefined" && typeof d[dim] !== "undefined"){
						return d[dim];
					}
				});
			}
			if(!isNew){
				current.virtualDims[dim] = dimension;
			}
		}
		return dimension;
	},
	
	createAggDimensions : function (dim,isNew) {
		var current = this;
		var dimension = current.aggDimensions[dim];
		if(!dimension || isNew) {
			var blockName = current.getBlockNameFromDim(dim);
			var XfilterObj = current.getAggXfilterObj(blockName);
			if (typeof XfilterObj != "undefined") {
				dimension = XfilterObj.dimension(function(d){
					if(typeof dim !== "undefined" && typeof d[dim] !== "undefined"){
						return d[dim];
					}
				});
			}
			if(!isNew){
				current.aggDimensions[dim] = dimension;
			}
		}
		return dimension;
	},
	
	disposeDimensions : function () {
		var current = this;
		var dims = current.dimensions;
		var aggDims = current.aggDimensions;
		if ( !$.isEmptyObject(dims) ) {
			$.each(dims,function(key,obj){
				obj.dispose();
			});
			current.dimensions={};
		}
		if ( !$.isEmptyObject(aggDims) ) {
			$.each(aggDims,function(key,obj){
				obj.dispose();
			});
			current.aggDimensions={};
		}
	},
	
	disposeVirtualDims : function () {
		var current = this;
		var dims = current.virtualDims;
		if ( !$.isEmptyObject(dims) ) {
			$.each(dims,function(key,obj){
				obj.dispose();
			});
			current.virtualDims={};
		}
	},
	
	getBlockNameFromDim : function (dim) {
		var val = dim.split(".");
		if(val[0]){
			return val[0].trim();
		}	
	},
	
	getDimNameFromBlockDim : function (dim) {
		var val = dim.split(".");
		if(val[1]){
			return val[1].trim();
		}	
	},
	
	resetControlChangedState : function () {
		this.isControlUpdated = false;
	},
	
	/*setAppliedFilters : function(dim,filters) {
		var current = this;
		current.appliedFilters[dim] = filters;
	},
	
	getAppliedFilters : function(dim) {
		var current = this;
		if(dim) {
			return current.appliedFilters[dim];
		}else {
			return current.appliedFilters;
		}
	},*/
	
	
	/*setAppliedFilters : function(msr,dim,filters) {
		var current = this;
		var dimFilters = current.appliedFilters[msr];
		if (dimFilters) {
			dimFilters[dim] = filters;
		} else {
			current.appliedFilters[msr] = {};
			current.appliedFilters[msr][dim] = filters;
		}
	},
	
	getAppliedFilters : function(msr) {
		var current = this;
		if(msr) {
			return current.appliedFilters[msr];
		}else {
			return current.appliedFilters;
		}
	},
	*/
	
	onFilter : function() {
		var c = this,config = c.designerData;
		if (config && !$.isEmptyObject(c.appliedFilters)) {
			if (!config["appliedFilters"]) {
				config["appliedFilters"] = {};
			}
			config["appliedFilters"] = c.appliedFilters;
		}
		c.setCustomDesignerData(config);
	},
	
	setAppliedFilters : function(msr,dim,filters) {
		var c = this,
			blkName = c.getBlockNameFromDim(msr);
			msrName = c.getDimNameFromBlockDim(msr);
			dimName = c.getDimNameFromBlockDim(dim);
		var dimFilters = c.appliedFilters[msr];
		if (dimFilters) {
			dimFilters[dimName] = filters;
		} else {
			if (!c.appliedFilters[blkName]) {
				c.appliedFilters[blkName] = {};	
			}
			if (!c.appliedFilters[blkName][msrName]) {
				c.appliedFilters[blkName][msrName] = {};
			}
			c.appliedFilters[blkName][msrName][dimName] = filters;
		}
	},
	
	getAppliedFilters : function(msr) {
		var c = this;
		if(msr) {
			var blkName = c.getBlockNameFromDim(msr);
			var msrName = c.getDimNameFromBlockDim(msr);
			if (c.appliedFilters[blkName]) {
				return c.appliedFilters[blkName][msrName];
			}
		}else {
			return c.appliedFilters;
		}
	},
	
	getDimensionInputs : function(model,dimension) {
		var set = [];
		$.each(model, function(index, value) {
			
			if (typeof value[dimension] !== "undefined" &&  value[dimension] !=="*" && $.inArray(value[dimension], set) == -1 ) {
				set.push(value[dimension]);
			}
		});
		//return set.sort();
		return set;
	},
	
	initFilterControl: function () {
		// Set filters to containers or screen
		if (this.getControlType() == "CompositeFilter") {
			this.getParent().addFilter(this.getName());		
		} else {
			if (this.getVappgenAttributes().filterableControl && this.getAttributes().filterable){
			    var parent = this.getParent();
				while (parent){
					var filters = parent.getFilters();
					for (var i=0; filters && i<filters.length; i++){
						var filterCtrl = parent.getChildControlByName(filters[i]);
						if (filterCtrl){
							var data = filterCtrl.getCustomDesignerData();
							for (var j=0; data && data.filters && j<data.filters.length; j++){
								if (!data.filters[j].controls){
									data.filters[j].controls = [];
								} else if (data.filters[j].controls.indexOf(this.getName()) == -1){
									data.filters[j].controls.push(this.getName());								
								}
							}						
						}
					}
					parent = parent.getParent();
				}
			}
		}
	},
	
	resetFilterControl: function () {
		if (this.getControlType() == "CompositeFilter"){
				this.getParent().removeFilter(this.getName());
				if (this.designerData){
					this.designerData = null;
				}
			} else {
				if (this.getVappgenAttributes().filterableControl && this.getAttributes().filterable){
				    var parent = this.getParent();
					while (parent){
						var filters = parent.getFilters();
						for (var i=0; filters && i<filters.length; i++){
							var filterCtrl = parent.getChildControlByName(filters[i]);
							if (filterCtrl){
								var data = filterCtrl.getCustomDesignerData();
								for (var j=0; data && data.filters && j<data.filters.length; j++){
									var index = data.filters[j].controls.indexOf(this.getName());
									if (index != -1){
										data.filters[j].controls.splice(index, 1);
									}
								}						
							}
						}
						parent = parent.getParent();
					}
				}
			}
	},
	
	getAttributeValue : function (key) {
		var attrs = this.getAttributes();
		
		if (key == "name") {
			return this.getName();
		}
		
		return attrs[key];		
	},
	
	cancelControlProperties : function () {
		console.log ("User opted to cancel properties");
		return true;
	},
	
	saveControlProperties : function () {
		var c = this;
		console.log ("User opted to save properties");
		var controlProps = c.readControlProperties();
		console.log(controlProps);
	 
		var valid = c.validateControlAttributes (controlProps);
		if (!valid.status) {
			Util.showMessage(valid.msg);
			return false;
		}
		c.updateControlAttributes (controlProps);
		var scrn = c.getScreen();
		if (c.mode == "design") {
			scrn.setState(scrn.getVappStates().UnderProcess); 
		}
		c.renderLayout();
		c.render();
		c.saveUserPrefs();
		return true;
	},
	
	promptDialogForUserProperties : function (message, title, Yes, Cancel){
		var dialogMarkup = '<div id="promptContrlDialogProps"></div>';
		var dlgButtons = {};
		var title = "Control properties";
		var isExists = $("body").find("#promptContrlDialogProps");
	 
		if (isExists.length > 0){
			return;
		}
		
		var dlg = $(dialogMarkup).dialog({
		      modal: true,
		      width: 500,
		      height:450,
		      resizable: false,
		      title: title,
		      open: function(){
		    	  $(this).empty();
		    	  $(this).append(message);

		      },
		      close:function(){
		    	  $( this ).dialog( "destroy" );
		    //	  enableAllTabButtons ();
		      },
		      buttons: dlgButtons
		    });
		
		addButton($(dlg), dlgButtons, "Save", Yes);
		addButton($(dlg), dlgButtons, "Cancel", Cancel);
				
		$(dlg).dialog({buttons:dlgButtons});
		
		function addButton(dlg, map, key, fn) {
			if ("function" == typeof fn) {
				map[key] = function(arg1, arg2) {
					var status = fn(arg1, arg2);
					if (status)
						$(dlg).dialog("close");
				};
			}
		}
	},
	
	getControlProperty : function (props, key) {
		for (var i=0; i<props.attributes.length; i++){
			if (props.attributes[i].name == key)
				return props.attributes[i];
		}
		return null;
	},

	validateControlAttributes : function (attrs){
		var ctrlAttrs = this.getVappgenAttributes();
		
		var err = {};		
		err.status = true;
		var c = this;
		
		if (attrs.name.length == 0){
			err.msg = "Please enter the valid control name ...!!";
			err.status = false;
			return err;
		} 
		 
		if (!this.isNameUnique(attrs.name)) {
			err.msg = "Please enter unique control name ...!!";
			err.status = false;
			return err;
		}
		
		$.each(attrs, function(key,val){
		 	 	var prop = c.getControlProperty (ctrlAttrs, key);
		 	 	if (prop.mandatory && (val == "NONE" || !val.length)) {
		 	 		err.status = false;
		 	 		err.key = key;
		 	 		err.msg = "Please enter "+ key +" property";		 	 		
		 	 	}		 	 	
			});			
	
		return err;		
	},
	
	updateControlAttributes : function (attrs){
		var props = this.getAttributes();
	
		// Update Filter's designer data based on change in control name
		if (this.isFilterable && this.getName() != attrs.name) {
			var parent = this.getParent();
			while (parent){
				var filters = parent.getFilters();
				for (var i=0; filters && i<filters.length; i++){
					var filterCtrl = parent.getChildControlByName(filters[i]);
					if (filterCtrl){
						if (filterCtrl.singleControlFilterMode){
							filterCtrl.singleControlFilterName = attrs.name; 
						}
						filterCtrl.updateControlNameInDesignerData(this.getName(), attrs.name);
					}					
				}
				parent = parent.getParent();
			}			
		}
		
		// Update Filter's designer data based on change in filterable option.
		var orgAttrs = this.getAttributes();
		if (this.isFilterable && orgAttrs.filterable != attrs.filterable){
			var parent = this.getParent();
			while (parent){
				var filters = parent.getFilters();
				for (var i=0; filters && i<filters.length; i++){
					var filterCtrl = parent.getChildControlByName(filters[i]);					
					if (filterCtrl){
						filterCtrl.removeControlFromDesignerData(this.getName());					
					}
				}
				parent = parent.getParent();
			}
		}
		var c = this;
		$.each(attrs, function(key, val){
	 	 	if (key == "name") {
			 		c.setName(val);
			} else if (val != "NONE"){
		 		props[key] = val;
		 	}	
		});
		
		this.setAttributes(props);	
		this.setControlUpdated (true);
	},
	
	readControlProperties : function () {
		var properties = $(".properties");
		var controlProps={};
		
		if (properties.length == 0)
			return;
		
		if (properties.length > 0) {
		 	$.each(properties,function(i,v){
		 	 	if ($(v).attr("datatype") == "boolean") {
		 			controlProps[$(v).attr("dataattr")] = $(v).prop('checked');		 			
		 		} else {
					controlProps[$(v).attr("dataattr")] = $(v).val();
		 		}
			});
		}	
		
		return controlProps;
	},
	
	filterMeasures : function (div, blockName, val) {
		div.append('<option value="NONE">NONE</option>');
		var modelBlocks = this.getScreen().model.blocks;
		
		for (var l=0; l<modelBlocks.length; l++){
			var blk = modelBlocks[l];
			if (blockName == "NONE" || blk.name == blockName) {
				for (var m=0; blk.measures && m<blk.measures.length; m++){
					var opt = blk.name+"."+blk.measures[m].name;	
					
					if (opt == val)
						div.append('<option selected="selected" value='+opt+'>'+opt+'</option>');
					else 
						div.append('<option value='+opt+'>'+opt+'</option>');
				}
			}
		}		
	},	
		
	filterDimensionsMeasures : function (div, blockName, val) {
	 	div.append('<option value="NONE">NONE</option>');
	 	var modelBlocks = this.getScreen().model.blocks;
 
		for (var l=0; l<modelBlocks.length; l++){
			var blk = modelBlocks[l];
			if (blockName == "NONE" || blk.name == blockName) {
				for (var k=0; blk.dimensions && k<blk.dimensions.length; k++){
					var opt = blk.name+"."+blk.dimensions[k].name;	
					if (opt == val)
						div.append('<option selected="selected" value='+opt+'>'+opt+'</option>');
					else 
						div.append('<option value='+opt+'>'+opt+'</option>');
				}
				for (var m=0; blk.measures && m<blk.measures.length; m++){
					var opt = blk.name+"."+blk.measures[m].name;	
					if (opt == val)
						div.append('<option selected="selected" value='+opt+'>'+opt+'</option>');
					else 
						div.append('<option value='+opt+'>'+opt+'</option>');				
				}
			}
		}		
	},
	
	filterDimensions : function (div, blockName, val, dimension) {
		div.append('<option value="NONE">NONE</option>');
		var modelBlocks = this.getScreen().model.blocks;
	 
		for (var l=0; l<modelBlocks.length; l++){
			var blk = modelBlocks[l];
			if (blockName == "NONE" || blk.name == blockName) {
				for (var k=0; blk.dimensions && k<blk.dimensions.length; k++){
					if (dimension && dimension == blk.dimensions[k].name)
						continue;
					var opt = blk.name+"."+blk.dimensions[k].name;
					if (opt == val)
						div.append('<option selected="selected" value='+opt+'>'+opt+'</option>');
					else
						div.append('<option value='+opt+'>'+opt+'</option>');
				}				
			}
		} 	
	},
	
	getControlPropertiesFromUser: function () {
		var props = this.getVappgenAttributes();
		var modelBlocks = this.getScreen().model.blocks;
		var vappgenActions = this.getScreen().vappgen.actions;
		
		if (!props) {
			Util.showMessage ("Falied to get the control level attributes ...!!");
			return;
		}
		var title = "Control Properties: ";
			 
		var markup = '<table border="1" style="width:100%"> <tr>\
			  <th>Attribute Name</th>\
			  <th>Attribute Value</th>\
			  </tr>';
		
		for (var i=0; props && props.attributes && i<props.attributes.length; i++) {
			var p = props.attributes[i];
 
			var curValue = this.getAttributeValue (p.name);
			var attrName = (p.caption ? p.caption : p.name);					
			var defaultValue = p.defaultValue;		
			var val;
			 
			// Handle the default values.
			if (defaultValue && (curValue == null || typeof curValue === "undefined")) {
				val = defaultValue;
			} else {
				val = curValue;
			}
			 
			markup += '<tr> <td>';
			markup += attrName;				
			markup += '</td>'; 
			markup += '<td>';
			if (val === null && p.values != null && p.values.length > 0) {
				var txt = '<select class="properties" dataAttr="'+p.name+'">';
				for (var j=0; j<p.values.length; j++){
					txt += '<option value='+p.values[j]+'>'+p.values[j]+'</option>';
				}
				txt += '</select>';
				markup += txt;
			} else if (p.type == "DimensionMeasure") {
				// Adding dimensions and measure of each block				
			 	var txt = '<select class="properties" dataAttr="'+p.name+'" typeAttr="'+p.type+'">';
			 	var none = "NONE";
				txt += '<option value='+none+'>'+none+'</option>';
				for (var j=0; j<modelBlocks.length; j++){
					var blk = modelBlocks[j];
					for (var k=0; blk.dimensions && k<blk.dimensions.length; k++){
						var opt = blk.name+"."+blk.dimensions[k].name;	
						if (opt == val)
							txt += '<option selected="selected" value='+opt+'>'+opt+'</option>';
						else
							txt += '<option value='+opt+'>'+opt+'</option>';
					}
					for (var l=0; blk.measures && l<blk.measures.length; l++){
						var opt = blk.name+"."+blk.measures[l].name;		
						if (opt == val)
							txt += '<option selected="selected" value='+opt+'>'+opt+'</option>';
						else
							txt += '<option value='+opt+'>'+opt+'</option>';
					}					
				}				
				txt += '</select>';
				markup += txt;
			} else if(p.type == "boolean") {
			 	if (val == true || val == "true")
					markup += '<input type="checkbox" class="properties" dataAttr="'+p.name +'" checked dataType="'+p.type+'">';
				else
		 			markup += '<input type="checkbox" class="properties" dataAttr="'+p.name +'" dataType="'+p.type+'">';
			} else if (p.type == "StaticValues"){
				var txt = '<select class="properties" dataAttr="'+p.name+'">';
				for (var k=0; k<p.possibleValues.length; k++){
					var opt = p.possibleValues[k];
					if (opt == val)
						txt += '<option selected="selected" value='+opt+'>'+opt+'</option>';
					else
						txt += '<option value='+opt+'>'+opt+'</option>';					
				}
				txt += '</select>';
				markup += txt;
			} else if (p.type == "Measure") {
				var txt = '<select class="properties" dataAttr="'+p.name+'" typeAttr="'+p.type+'">';
				var none = "NONE";
				txt += '<option value='+none+'>'+none+'</option>';
				
				for (var l=0; l<modelBlocks.length; l++){
					var blk = modelBlocks[l];
					for (var m=0; blk.measures && m<blk.measures.length; m++){
						var opt = blk.name+"."+blk.measures[m].name;	
						if (opt == val)
							txt += '<option selected="selected" value='+opt+'>'+opt+'</option>';
						else
							txt += '<option value='+opt+'>'+opt+'</option>';
					}
				}				
				txt += '</select>';
				markup += txt;			
			} else if (p.type == "Dimension") {
				var txt = '<select class="properties" dataAttr="'+p.name+'" typeAttr="'+p.type+'">';
				var none = "NONE";
				txt += '<option value='+none+'>'+none+'</option>';
				
				for (var l=0; l<modelBlocks.length; l++){
					var blk = modelBlocks[l];
					for (var m=0; blk.dimensions && m<blk.dimensions.length; m++){
						var opt = blk.name+"."+blk.dimensions[m].name;	
						if (opt == val)
							txt += '<option selected="selected" value='+opt+'>'+opt+'</option>';
						else
							txt += '<option value='+opt+'>'+opt+'</option>';
					}
				}				
				txt += '</select>';
				markup += txt;			
			} else if (p.type == "Action") {
				var txt = '<select class="properties" dataAttr="'+p.name+'" typeAttr="'+p.type+'">';
				
				for (var m=0; m<vappgenActions.length; m++){
					var opt = vappgenActions[m];
					var caption = opt.caption;
					var code = opt.code;
					
					if (code == val)
						txt += '<option selected="selected" value='+code+'>'+caption+'</option>';
					else
						txt += '<option value='+code+'>'+caption+'</option>';						
				}	
				
				txt += '</select>';
				markup += txt;
			} else {
				if(!p.editable){
					markup += '<input type="text" class="properties" dataAttr="'+p.name+'" style="width:100%" name="inp_value"   value="'+(val == undefined?"":val)+'" disabled>';
				}else{
					markup += '<input type="text" class="properties" dataAttr="'+p.name+'" style="width:100%" name="inp_value"   value="'+(val == undefined?"":val)+'">';
				}			
			}
			markup += '</td> </tr>';				
		}
		
		markup += '</table>';
		var c = this;
		this.promptDialogForUserProperties (markup, title, function(){return(c.saveControlProperties());}, this.cancelControlProperties);
	
		$( document ).off("change","select[typeattr='Action']").on("change","select[typeattr='Action']",function() {
			var element = $(this);
			var val = element.val();
			val=element.find('option[value="'+val+'"]').text();
			$('input[dataattr="label"]').val(val);
		});
		
		$( document ).off("change","select[typeattr='DimensionMeasure']").on("change","select[typeattr='DimensionMeasure']",function() {
			
			var measure = $("select[typeattr='Measure']");
			var msVal = measure.val();
			measure.empty();
			
			var dim = $("select[typeattr='Dimension']");
			var dmVal = dim.val();
			dim.empty();
		
			var element = $(this);
			var val = element.val();
			if (val == "NONE") {
				this.filterMeasures (measure, val, "NONE");
				this.filterDimensions (dim, val, "NONE", "NONE");
				element.empty();
				this.filterDimensionsMeasures (element, val, "NONE");
			} else {
				var index = val.indexOf('.');
				var blk = val.substr(0, index);
				var value = val.substr (index+1);
				
				this.filterMeasures (measure, blk, msVal);
				this.filterDimensions (dim, blk, dmVal, value);
			}	
						
		});
		
		$( document ).off("change","select[typeattr='Measure']").on("change","select[typeattr='Measure']",function() {
			var dimMeasure = $("select[typeattr='DimensionMeasure']");
			var dmVal = dimMeasure.val();
			dimMeasure.empty();
			
			var dimensions = $("select[typeattr='Dimension']");
			var dimensionsVal = dimensions.val();
			dimensions.empty();
		 
			var element = $(this);
			var val = element.val();
			if (val == "NONE") {
				this.filterDimensionsMeasures (dimMeasure, val, "NONE");
				element.empty();
				this.filterMeasures (element, val, "NONE");
				this.filterDimensions (dimensions, val, "NONE", "NONE");
			} else {
				var blk = val.substr(0,val.indexOf('.'));
				this.filterDimensionsMeasures (dimMeasure, blk, dmVal);
				
				var index = dmVal.indexOf('.');
				var value = dmVal.substr (index+1);
				this.filterDimensions (dimensions, blk, dimensionsVal, value);
			}
		}); 
	}
		
});
