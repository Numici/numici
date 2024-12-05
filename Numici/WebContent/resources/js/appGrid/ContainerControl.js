/**
 * New node file
 */

var ContainerControl = Control.extend({

	constructor: function(){
		Control.apply(this, arguments);
		this.isContainer =true;
		this.jsonTree=[];
		this.controls =[];	
		this.attributes["w"] = 12;
		this.attributes["h"] = 4;
		this.min_height = 4;
		this.grid_width = 12;
		this.isStaticGrid = false;
	} ,
	
	addControl:function(ctrl){
		this.controls=ctrl;
	},
	
	compare : function() {
		$.each(this.controls, function(i, ctrl) {
			if ("function" == typeof ctrl.compare) {
				if(ctrl.mode !== "design"){
					ctrl.mode = "compare";
				}
				ctrl.compare();
			}
		});
	},
	
	render: function(){ 
		var c = this;
		$.each(this.controls, function(i, ctrl) {
			if ("function" == typeof ctrl.render) {
				if(ctrl.mode !== "design"){
					ctrl.mode = "run";
				}
				ctrl.render();
				ctrl.isRendered = true;
			}
		});
	},
	
	addCtrlTOGrid : function(ctrl) {
		var c = this;
		if (c.appGrid && !ctrl.isRendered) {
			var attr = ctrl.attributes;
			console.log(JSON.stringify(ctrl.attributes));
			//c.removeFromGrid(ctrl);
			c.appGrid.add_widget(ctrl.el,attr.x, attr.y, attr.w, attr.h);
		}
	},
	
	
	renderLayout :function(){
		var c = this;
		var el=this.renderContainer();
		
		el.attr("data-gs-locked",true);
		if (el.find(".ctrl-wrapper").length == 0 && !this.isRendered) {
			el.addClass("groupControl");
			el.append("<div class='ctrl-wrapper grid-stack-item-content' > <div class='grid-stack' id='contGrid' style='height:100%;min-height:100%;max-height:100%;'></div></div>");
		}
		
		if (c.mode == "run") {
			c.initialize();
		}
		
		/*Control.prototype.renderLayout.call(this);
		
		$.each(this.attributes,function(key,val){
			switch(key){
			case "position":
			case "float":
				el.css(key,val);
				break;
			default:
				el.css(key,val+"%");
				break;
			}
		});
		
		var mode=this.getMode();
		if (mode == "design") {
			var id= this.id;
			var parent = this.getParent();
			var exists = parent.el.find("#"+id);
			
			if (exists.length == 0) {
				parent.el.append(el);
			} 	
		} else {			
			$.each(this.controls, function(i, ctrl) {
				if ("function" == typeof ctrl.render) {
					el.append(ctrl.renderLayout());
				}
			});
			
			return el;
		}*/
	},
	
	initialize: function(options) {
		
		var c = this;	
		var el = c.el;
		var mode = c.mode;
		if (c.controlType == "GroupControl"){
			el = el.find("#contGrid");
			el.addClass("grid-stack-"+c.grid_width);
		}
		c.initGrid(el);
       
        if (mode == "design") {
        	c.initDroppable(el);
        }
        
		
	},	
	
	initGrid : function(el) {
		var c = this;
		var options = {
				width: c.grid_width,
				static_grid: c.isStaticGrid,
				float: true,
		        cell_height: 60,
		        vertical_margin: 10,
		      //  always_show_resize_handle: true,
		        resizable : {
		        	handles : " e, s, w, se, sw"
		        },
		        draggable : {
		        	 zIndex: 10000,
		        }
		    };
		 
	    $(el).gridstack(options).on('change', function (e, items) {	
	    	if (items && items.length > 0) {
	    		$.each(items,function(i,v){
	    			var ctrl = v.el.data("ctrlObj");
	    			if(ctrl && !$.isEmptyObject(ctrl)) {
		    			ctrl.attributes["x"] = v.x;
		    			ctrl.attributes["y"] = v.y;
		    			ctrl.attributes["width"] = v.width;
		    			ctrl.attributes["height"] = v.height;
		    			ctrl.attributes["w"] = v.width;
		    			ctrl.attributes["h"] = v.height;
		    			ctrl.setControlUpdated (true);
		    			if (ctrl.isResized || !ctrl.isRendered) {
		    				try {
			    				 ctrl.renderLayout();
			    			     ctrl.render();
			    			     ctrl.isResized = false;
			    			     ctrl.isRendered = true;
			    			     ctrl.isReposioned = false;
			    			 } catch (err) {
			    			    console.log ("Failed to render the control: "+ ctrl.getName()+ " & err is : "+err.message);
			    			 }
		    			}
		    			
		    			/* if (ctrl.parent && ctrl.parent.parent && ctrl.parent.controlType == "GroupControl") {
			    			 
			    			 var parent = ctrl.parent.parent;
			    			 var h = ctrl.parent.el.find(".grid-stack").height();
			    			 var h1 = Math.round(h/70); 
			    			 if (ctrl.parent.attributes["h"] != h1){
			    				 parent.appGrid.resize(ctrl.parent.el,null,h1);
			    			 }
			    			 
			    		 }*/
		    			 
	    			}	    		 
	    		});
	    	}
	    }).on("resizestart",function(event,ui){
	    	/*var ctrlObj = ui.element.data("ctrlObj");
	    	if (ctrlObj && ctrlObj.controlType == "GroupControl") {
	    		var grid = ctrlObj.appGrid;
	    		ctrlObj.min_height = 1;
	    		if (grid && grid.grid) {
	    			var nodes = grid.grid.nodes;
	    			if ($.isArray(nodes)) {
	    				$.each(nodes,function(i,node){
	    					if (ctrlObj.min_height < parseInt(node.height+node.y)) {
	    						ctrlObj.min_height = parseInt(node.height+node.y);
	    					}
	    				});
	    			}
	    		}
	    		if (typeof ctrlObj.min_height != 1) {
	    			grid.min_height(ctrlObj.el,ctrlObj.min_height);
	    		}
	    	}*/
	    }).on("resizestop",function(event,ui){
	    	 var grid = this;
	    	 var element = event.target;
	    	 var ctrl = $(element).data("ctrlObj");
	    	 if(ctrl && !$.isEmptyObject(ctrl)) {
	    		 ctrl.isResized = true;
	    	 }
	    }).on("dragstop",function(event,ui){
	    	
	    	 c.el.removeClass("freez");
	    	 var element = event.target;
	    	 var ctrl = $(element).data("ctrlObj");
	    	 if(ctrl && !$.isEmptyObject(ctrl)) {
	    		 ctrl.isReposioned = true;
	    	 }
	    });/*.on("dragstart",function(event,ui){
	    	 c.el.addClass("freez");
	    });  */
	    
	    this.appGrid =  $(el).data('gridstack');
	},
	
	initDroppable : function(el) {
		var c = this;	
		
		 var placeholder = $('<div class="grid-stack-placeholder grid-stack-item">\
 		<div class="placeholder-content"></div></div>').hide();
		
		$(el).droppable({
			greedy: true,
			drop:  function(event,ui){
				
				console.log ("control dropped on "+ c.getControlType() +" ....!!");		

				var id= ui.draggable.attr("id");
	
				var scrn = c.getScreen();
				var grid = c.appGrid || $(c.el).find("grid-stack").data('gridstack');
				
				var exists = scrn.el.find("#"+id);
				if (exists.length == 0) {  
					
					var cntrTop = Math.round(c.el.offset().top);
					var cntrLeft = Math.round(c.el.offset().left);
					var position = {'top':Math.round(ui.position.top)-cntrTop, 
										'left':Math.round(ui.position.left)-cntrLeft};
		
					var obj = grid.get_cell_from_pixel(position);		
					 
					console.log ("Control is dropped at (top, left):"+position.top +", "+ position.left);
					
					var controlType = ui.draggable.attr("ctrl-name");
					if (controlType) {
						if (!scrn.isControlSupported (controlType)) {
					 		alert ("Control is not yet supported ...!!");
							return;
						} 
					
						
						var  ctrl = ControlFactory.createInstance(controlType);	
						ctrl.setMode("design");
						ctrl.initVappControl (c, controlType, obj);
						ctrl.initFilterControl(c, controlType);
						Control.prototype._draggingControl = ctrl;				
						scrn.setState(scrn.getVappStates().UnderProcess);
						scrn.vappgenEngine.setVAppgenState(scrn.getVappStates().UnderProcess);
						$(ctrl.el).mousedown(); // select the dropped element
						$(ctrl.el).trigger("showproperties");
					} else {
						console.log ("Control type is undefined ..........!!");
					}
				} else {
					
					
					var cntrTop = Math.round(c.el.offset().top);
					var cntrLeft = Math.round(c.el.offset().left);
					var position = {'top':Math.round(ui.offset.top)-cntrTop, 
										'left':Math.round(ui.offset.left-cntrLeft)};
		
					var obj = grid.get_cell_from_pixel(position);		
					 
					console.log ("Control is dropped at (top, left):"+position.top +", "+ position.left);
					
					
					
					var ctrlObj = exists.data('ctrlObj');
					var el = ctrlObj.el;
					var changeCtrlContainer = false;
					
					if (c.getControlType() == "ScreenControl") {
						if (ctrlObj.parentType == "ScreenControl") {
							console.log ("Controls is dragged around the screen or canvas ....!!");
						} else {
							console.log ("Controls is dragged from a group container to screen or canvas ....!!");
							changeCtrlContainer = true;
						}
					 
					} else if (c.getControlType() == "GroupControl") {
						if (ctrlObj.parentType == "ScreenControl") {
							console.log ("Controls is dragged from the screen/canvas to group container ....!!");
							changeCtrlContainer = true;
						} else {
							if (c.id == ctrlObj.parent.id) {
								console.log ("Controls is dragged around the same group container ....!!");
							} else {							
								console.log ("Controls is dragged from a group container to a new group container ....!!");
								changeCtrlContainer = true;
							}
						}
						 
					}			 
					
					
			 		if (changeCtrlContainer) {
			 			ctrlObj.isRendered = false;
			 			var div=$('<div class="vdvcCtrl grid-stack-item"></div>');
						div.attr("id",id);
						ctrlObj.el = div;
						div.data("ctrlObj",ctrlObj); 
			 			c.controls.push(ctrlObj);
			 			// In case of filter control, remove from it's container filter list.
			 			ctrlObj.resetFilterControl();
						ctrlObj.parent.deleteControlById(ctrlObj.getId());
						ctrlObj.parentType = c.getControlType();
						ctrlObj.setParent(c);	
						// In case of filter control, add filter to it's new parent.
						ctrlObj.initFilterControl ();
						grid.add_widget(div, obj.x, obj.y, ctrlObj.attributes.w, ctrlObj.attributes.h);
						
					}
					
			 		scrn.setState(scrn.getVappStates().UnderProcess);
			 		scrn.vappgenEngine.setVAppgenState(scrn.getVappStates().UnderProcess);
				}
			}
			
		});
	},
	
	getControlById: function (id) {
		for (var i=0; i <this.controls.length; i++) {
			var curCtrl = this.controls[i];
			if (curCtrl.id == id) {
				return curCtrl;
			}
		}
		
		return null;
	},
	
	deleteControlById: function (id) {
		var index= -1;
		var c = this;
		for (var i=0; i <c.controls.length; i++) {
			var curCtrl = c.controls[i];
			if (curCtrl.id == id) {
				index=i;
				break;
			}
		}
		
		if (index != -1){
			c.controls.splice(index, 1);
		}
		
		var exists = c.el.find("#"+id);
		if (exists.length > 0) {
			c.appGrid.remove_widget(exists,true);
			c.el.find(".grid-stack-placeholder").hide();
		}		
		
	},
	
	getJson: function () {
		var children=null;
		var js = Control.prototype.getJson.apply(this);
		this.jsonTree = js;
		
		
		if (this.controls.length > 0)
			children = [];
		
		for (var i=0; i<this.controls.length; i++) {
			var ctrl = this.controls[i];
			var ctrlJson = ctrl.getJson();
			children.push(ctrlJson);			
		}
		
		if (this.controls.length > 0) {
			this.jsonTree["controls"]=children;		
		}
		
		return this.jsonTree;
	},
	
	
	deleteControl: function() {
		var cc = [];
		
		for (var k=0; k<this.controls.length; k++)
			cc[k]=this.controls[k];
		
		for (var i=0; i<cc.length; i++) {
			var ctrl = cc[i];
			
			if (ctrl.getControlType() == "GroupControl")
				this.deleteControl(ctrl);
			else
				this.deleteControlById(ctrl.getId());
		}
	},
	
	/*getChildControls: function() {
		var list = [];
	
		for (var i=0; i<this.controls.length; i++){
			var ctrl = this.controls[i];
			
			if (ctrl.getControlType() == "GroupControl"){
				var ccList = ctrl.getChildControls();
				if (ccList.length){
					list = list.concat(ccList);
				}
			} else {
				if (ctrl.getControlType() != "CompositeFilter")
					list.push(ctrl.getName ());
			}
		}
		
		return list;
	},*/
	
	getChildControlByName: function(ctrlName) {
		
		for (var i=0; i<this.controls.length; i++){
			var ctrl = this.controls[i];
			
			if (ctrl.getControlType() == "GroupControl"){
				var rc = ctrl.getChildControlByName(ctrlName);
				if (rc)
					return rc;
			} else {
				if (ctrl.getName() == ctrlName) {
					return ctrl;
				}
			}
		}
		
		return null;
	},
	
	getChildControlIds: function() {
		var list = [];
	
		for (var i=0; i<this.controls.length; i++){
			var ctrl = this.controls[i];
			
			if (ctrl.getControlType() == "GroupControl"){
				var ccList = ctrl.getChildControlIds();
				if (ccList.length){
					list = list.concat(ccList);
				}
			} else {
				if (ctrl.getControlType() != "CompositeFilter"){
					list.push(ctrl.objectId);
				}	
			}
		}
		
		return list;
	},
	
	getChildControlById : function(ctrlId) {
		
		for (var i=0; i<this.controls.length; i++){
			var ctrl = this.controls[i];
			
			if (ctrl.getControlType() == "GroupControl"){
				var rc = ctrl.getChildControlById(ctrlId);
				if (rc)
					return rc;
			} else {
				if (ctrl.objectId == ctrlId) {
					return ctrl;
				}
			}
		}
		
		return null;
	}
	
	
	
});


/*var ContainerControl =function(){
	
	this.isContainer=true;
    this._controls= [];
};

ContainerControl.prototype=new Control();

ContainerControl.prototype.addControl=function(ctrl){
	this._controls=ctrl;
};

ContainerControl.prototype.renderContainer=function() {
	return this.el;
};

ContainerControl.prototype.render=function(){
	$.each(this._controls, function(i, ctrl) {
		if ("function" == typeof ctrl.render) {
			ctrl.render();
		}
	});
};

ContainerControl.prototype.renderLayout=function(){
	
	var el=this.renderContainer();
	$.each(this.attributes,function(key,val){
		switch(key){
		case "position":
		case "float":
			el.css(key,val);
			break;
		default:
			el.css(key,val+"%");
			break;
		}
	});
	// TODO: Loop _controls and invoke render on each of them
	$.each(this._controls, function(i, ctrl) {
		if ("function" == typeof ctrl.render) {
			el.append(ctrl.renderLayout());
		}
	});
	return el;
};*/
