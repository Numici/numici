/**
 * New node file
 */

var ContainerControl = Control.extend({

	constructor: function(){
		Control.apply(this, arguments);
		
		this.isContainer =true;
		this.jsonTree=[];
		this.controls =[];	
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
	
	render:function(){
		$.each(this.controls, function(i, ctrl) {
			if ("function" == typeof ctrl.render) {
				if(ctrl.mode !== "design"){
					ctrl.mode = "run";
				}
				ctrl.render();
			}
		});
	},
	
	
	renderLayout :function(){
		var el=this.renderContainer();
		el.addClass("vapp-container");
		Control.prototype.renderLayout.call(this);
		
		/*$.each(this.attributes,function(key,val){
			switch(key){
			case "position":
			case "float":
				el.css(key,val);
				break;
			default:
				el.css(key,val+"%");
				break;
			}
		});*/
		
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
		}
	},
	
	initialize: function(options) {
		Control.prototype.initialize.apply(this, [options]);
		var c= this;
		$(this.el).droppable({
			greedy: true,
			/*
			tolerance: "fit",			
			out: function( event, ui ) {
				alert ("Please drop the control with in the canvas boundaries ...!!");
			},
			*/
		
			drop:  function(event,ui){
				console.log ("control dropped on "+ c.getControlType() +" ....!!");		
			//	var tolerance = $(c.el).droppable( "option", "tolerance" );
				var id= ui.draggable.attr("id");
				var scrn = c.getScreen();

				var exists = scrn.el.find("#"+id);
				if (exists.length == 0) {  
					var controlType = ui.draggable.attr("ctrl-name");
					if (controlType) {
						if (!scrn.isControlSupported (controlType)) {
					 		alert ("Control is not yet supported ...!!");
							return;
						} 
					//	var position = {'top':event.pageY, 'left':event.pageX};
						
						var cntrTop = Math.round(c.el.offset().top);
						var cntrLeft = Math.round(c.el.offset().left);
						var position = {'top':Math.round(ui.position.top)-cntrTop, 
											'left':Math.round(ui.position.left)-cntrLeft};
											
						console.log ("Control is dropped at (top, left):"+position.top +", "+ position.left);
						var  ctrl = ControlFactory.createInstance(controlType);	
						ctrl.setMode("design");
						ctrl.initVappControl (c, controlType, position);
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
					var ctrlObj = exists.data('ctrlObj');
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
					var cntrTop = Math.round(c.el.offset().top);
					var cntrLeft = Math.round(c.el.offset().left);
					console.log ("On Redrop Parent Top: "+cntrTop+ " Left: "+cntrLeft);
			//		var ctrlPosition = {'top':Math.round(ui.position.top), 
			//								'left':Math.round(ui.position.left)};
					var ctrlPosition = {'top':Math.round(ctrlObj.el.offset().top-cntrTop), 
							'left':Math.round(ctrlObj.el.offset().left)-cntrLeft};
					console.log ("Control is re-dropped at (top, left):"+ctrlPosition.top +", "+ ctrlPosition.left);
					
					var borderSize = ($(ctrlObj.el).outerWidth()-$(ctrlObj.el).innerWidth());
					borderSize = Math.round(borderSize);
					console.log ("Border size : "+borderSize);
					
					var size = {'width': Math.round(ui.draggable.width())+borderSize, 
									'height':Math.round(ui.draggable.height())+borderSize};
					console.log ("Control is re-dropped with dimensions (width & height):"+size.width +" & "+ size.height);	
					
			 		if (changeCtrlContainer) {
			 			c.controls.push(ctrlObj);
			 			
			 			// In case of filter control, remove from it's container filter list.
			 			ctrlObj.resetFilterControl();
			 			
						var el = ctrlObj.el;
						c.el.append(el);
						ctrlObj.parent.deleteControlById(ctrlObj.getId());
						ctrlObj.parentType = c.getControlType();
						ctrlObj.setParent(c);	
						
						// In case of filter control, add filter to it's new parent.
						ctrlObj.initFilterControl ();
					}
					
			 		if (ctrlObj.parentType == "ScreenControl") {
			 			ctrlObj.setBoundariesToParent ();
			 		}
			 		scrn.setState(scrn.getVappStates().UnderProcess);
			 		scrn.vappgenEngine.setVAppgenState(scrn.getVappStates().UnderProcess);
					ctrlObj.resetAttributes(ctrlPosition, size);
					ctrlObj.renderLayout();		
					ctrlObj.render();
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
		
		for (var i=0; i <this.controls.length; i++) {
			var curCtrl = this.controls[i];
			if (curCtrl.id == id) {
				index=i;
				break;
			}
		}
		
		if (index != -1){
			this.controls.splice(index, 1);
		}
		
		var exists = this.el.find("#"+id);
		if (exists.length > 0) {
			$(exists).remove();
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
	
	getChildControls: function() {
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
	},
	
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
