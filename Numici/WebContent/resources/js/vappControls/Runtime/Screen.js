
/*
var Screen =function(){

	this.index=1,
	this.name;
	this.type;
	this.el;
	this.controls=[];
	this.Xfilter=null;
	this.vappData=null;
	this.width;
	this.height;
	this.json={};
//	this.vappInfo={};
};
*/


//Screen.extend = extend;
var Screen = ContainerControl.extend({

	constructor:function(options){

		console.log("Options are: "+ options);

		ContainerControl.apply(this,arguments);

		if (options && options.model) {
			this.model = options.model;
		} else {
			this.model = null;
		}

		if (options && options.vappgen) {
			this.vappgen = options.vappgen;
		} else {
			this.vappgen = null;
		}

		if (options && options.funcs) {
			this.funcs = options.funcs;
		} else {
			this.funcs = null;
		}
		
		this.XfilterObjs = {};
		this.index= 1;
		this.name= null;
		this.type= null;
		this.Xfilter=null;
		this.vappData=null;
		this.width=null;
		this.height=null;
		this.defaultWidth=null;
		this.defaultHeight=null;
		this.json={};
		this.finalJson={};
		this.state=null;
		this.vappStates=null;
		this.uniqueNameMap={};
		this.uniqueNameList=[];	
		this.id=null;
	},
	
	getControlByObjectId : function(id) {
		var c = this,ctrl;
		if($.isArray(c.controls)) {
			$.each(c.controls,function(i,v){
				if (id == v.objectId) {
					ctrl = v;
					return false;
				}
			});
		}
		return ctrl;
	},
	
	focusControl : function(id) {
		var c = this;
		var ctrl = c.getControlByObjectId(id);
		if (ctrl) {
			ctrl.el.css("border","solid 2px #4285f4");
			$(window).scrollTop(ctrl.el.position().top);
		}
	},
	
	setId : function (id) {
		this.id = id;
	},
	
	getId : function () {
		return this.id;
	},
	
	setAppData : function () {

		var current = this;
		var mode= current.mode;
		var Data =null;
		if(mode == "design" && current.model.data) {
			Data =current.model.data ;
		} else {
			Data = current.getVappData();
		}
		if (Data) {
			$.each(Data,function (i,obj) {

				var key = obj["BlockName"];
				current.dataSets[key] = obj["BlockData"];
				current.XfilterObjs[key] = crossfilter(obj["BlockData"]);

				current.aggDataSets[key] = obj["BlockAggr"];
				current.aggXfilterObjs[key] = crossfilter(obj["BlockAggr"]);
			});
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

	addControl:function(ctrl) {
		this.controls=ctrl;
	},

	renderContainer:function(ctrl) {
		return this.el;
	},

	compare : function() {
		$.each(this.controls, function(i, ctrl) {
			if ("function" == typeof ctrl.compare) {
				if(ctrl.mode !== "design"){
					ctrl.mode = "compare";
				}
				ctrl.compare();
			} else {
				ctrl.render();
			}
		});
	},

	resetDimensions: function () {
		var c = this;
		var scrnChange = false;
		var prevScrnHeight = c.getHeight();
		var newScrnHeight = c.el.height();
		
		if (prevScrnHeight != newScrnHeight) {
			scrnChange = true;
			c.setHeight(newScrnHeight);			
		}
		
		$.each(this.controls, function(i, ctrl) {
			if(ctrl.mode == "design"){
				if (scrnChange) {
					var attrs = ctrl.getAttributes();			 
					var heightInPixels = Math.round((attrs.height*prevScrnHeight)/100);
					var topInPixels = Math.round((attrs.top*prevScrnHeight)/100);
					console.log ("Control:"+ctrl.name + " HeightinPixels: "+heightInPixels
										+" TopInPixels: "+topInPixels);
					console.log ("Prev Height: "+prevScrnHeight+ " New Height: "+newScrnHeight);
					
					attrs.height = (heightInPixels/newScrnHeight*100).toFixed(2);
					attrs.top = (topInPixels/newScrnHeight*100).toFixed(2);
				
					ctrl.setAttributes(attrs);	
					ctrl.setControlUpdated (true);
				}
			}			
		});
	},
	
	render : function(controls) {
		if ( controls && controls.length > 0 ) {


		} else {
			$.each(this.controls, function(i, ctrl) {
				if ("function" == typeof ctrl.render) {
					if(ctrl.mode !== "design"){
						ctrl.mode = "run";
					}
					ctrl.render();
				}
			});
		}
	},
	
	getMaxOfArray : function (numArray) {
		  return Math.max.apply(null, numArray);
	},
	
	getMinimimScreenHeight: function(scrn) {
		var msHeight = scrn.getDefaultHeight();
		var defaultHeight = scrn.getDefaultHeight();
		var ctrlHeights=[];
		var scrnHeight = scrn.getHeight();
		
		$.each(scrn.controls, function(i, ctrl) {			
			var attrs = ctrl.getAttributes();
			/*
			var height = Math.round((attrs.height*scrnHeight)/100)
								+ Math.round((attrs.top*scrnHeight)/100);
			*/
			var height = Math.round(attrs.heightInPixels)+ Math.round(attrs.topInPixels);			
			ctrlHeights.push(height);
		});
		
		if (ctrlHeights.length > 0) {
			msHeight =  Math.max.apply(null, ctrlHeights);
			if (msHeight < defaultHeight){
				msHeight = defaultHeight;
			} else {
				msHeight += 10;
			}
		} 
		
		return msHeight;
	},
	
	setIndex: function (index) {
		this.index = index;
	},
	
	getIndex: function () {
		return this.index;
	},
	
	initialize:function(options) {
		this.setControlType("ScreenControl");
		
		ContainerControl.prototype.initialize.apply(this, [options]);
	
		var c = this;
		var minHeight = this.el.height();
		$(this.el).resizable({
			handles: "s",
			aspectRatio: false,
			minHeight: minHeight,
			resize:  function (event, ui) {
			window.scrollTo(0,document.body.scrollHeight);				
			},
			start: function (event, ui) {
				console.log ("Screen resize started ....!!");	
				var ms = c.getMinimimScreenHeight(c);
				console.log ("Minimum screen height (based on controls) : "+ ms);
				c.minScreenHeight = ms;
				c.el.resizable( "option", "minHeight", ms );
				
			},
			stop: function (event, ui) {
				console.log ("Screen resize stopped ....!!");
			//	c.resetDimensions();				 
				c.setHeight(c.el.height());
			//	c.renderLayout();
			//	c.render();
			}			
		});
	//	this.setControlType("ScreenControl");
		this.setMode ("design");
		this.setScreen(this);
		this.setWidth(this.el.width());
		this.setHeight(this.el.height());
		this.setAppData();
	},


	renderLayout : function() {
		
		var c = this;
		var el = c.el;
		$.each(this.controls, function(i, ctrl) {
			if ("function" == typeof ctrl.renderLayout) {
				var mrk = ctrl.renderLayout();
				$(el).append(mrk);
			}
		});
	},


	setXfilter:function(Xfilter) {
		this.Xfilter=Xfilter;
	},

	getXfilter:function() {
		return this.Xfilter;
	},

	setVappData:function(vappData) {
		this.vappData=vappData;
		this.setAppData();
	},

	getVappData:function() {
		return this.vappData;
	},

	setWidth: function(width) {
		this.width = width;
	},

	getWidth: function () {
		return this.width;
	},

	setHeight: function(height) {
		this.height = height;
	},

	getHeight: function () {
		return this.height;
	},


	setDefaultHeight: function(height) {
		this.defaultHeight = height;
	},

	getDefaultHeight: function () {
		return this.defaultHeight;
	},
	
	setDefaultWidth: function(width) {
		this.defaultWidth = width;
	},

	getDefaultWidth: function () {
		return this.defaultWidth;
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
		var curCtrl=null;
 
		for (var i=0; i <this.controls.length; i++) {
			curCtrl = this.controls[i];
			if (curCtrl.getId() == id) {
				index=i;
				break;
			}
		}

		if (index != -1){
			this.controls.splice(index, 1);
		}

		var exists = this.el.find("#"+id);
		if (exists.length > 0) {
	//		$(exists).remove();
		}
		
 
		if (index != -1 && curCtrl) {
			var loc = this.uniqueNameList.indexOf(curCtrl.getName());
			this.uniqueNameList.splice (loc, 1);		 
		}
	},

	removeControl: function(id) {
		var exists = this.el.find("#"+id);
		if (exists.length > 0) {
			$(exists).remove();
		}
	},

	getJson: function () {
 		if (this.getObjectId() != null) {
			this.json["id"]=this.getObjectId();
		}
		this.json["index"]=this.index;
		this.json["width"] = this.getWidth();
		this.json["height"] = this.getHeight();
		this.json["defaultWidth"] = this.getDefaultWidth();
		this.json["defaultHeight"] = this.getDefaultHeight();
		this.json["name"]=this.name;
		
		var ctrls=[];

		for (var i=0; i<this.controls.length; i++) {
			var cnt = this.controls[i];
			ctrls.push(cnt.getJson());
		}

		this.json["controls"]=ctrls;
		this.state =  this.vappStates.ReadyToSave;
		return this.json;
	},

	getFinalJson: function () {
		return this.finalJson;
	},
	
	setFinalJson: function (json) {
		this.finalJson = json;
	},
	
	getModel: function () {
		return this.model;
	},

	setModel: function (model) {
		this.model = model;
	},

	deleteScreen: function () {
		var cc = [];

		for (var k=0; k<this.controls.length; k++)
			cc[k]=this.controls[k];

		for (var i=0; i<cc.length; i++) {
			var ctrl = cc[i];

			if (ctrl.getControlType() == "GroupControl"){
				ctrl.deleteControl();
			}
			var id = ctrl.getId();
			this.deleteControlById(id);
			this.removeControl(id);
		}
	},

	setState: function (state) {
		this.state = state;
	},

	getState: function () {
		return this.state;
	},

	setName: function (name) {
		this.name = name;
	},
	
	getName: function () {
		return this.name;
	},
	
	setVappStates: function (states) {
		this.vappStates = states;
	},

	getVappStates: function () {
		return (this.vappStates);
	},

	getCtrlUniqueName: function (ctrlType) {
		var name = null;
		var index = null;
	 
		if (!this.uniqueNameMap[ctrlType]) {
			index = 1;
		} else {
			index = this.uniqueNameMap[ctrlType];
		}

		name = ctrlType +'_' + index;		 	 
		while (this.uniqueNameList.indexOf(name) != -1) {
			index++;
			name = ctrlType +'_' + index;
		}
		
		console.log ("Unique name returned as: "+ name);
		return name;
	},

	setCtrlUniqueName: function (name, type){
		var index = null;

		if (!this.uniqueNameMap[type]) {
			index = 1;
		} else {
			index = this.uniqueNameMap[type];
		}

		this.uniqueNameList.push(name);
		this.uniqueNameMap[type]=index+1;
	},

	isCtrlNameUnique: function (name) {
		if (this.uniqueNameList.indexOf(name) == -1)
			return true;
		else
			return false;
	},

	updateUniqueNameList : function (src, dst) {
		var index = this.uniqueNameList.indexOf(src);
		if (index == -1) {
			this.uniqueNameList.push (dst);
		} else {
			this.uniqueNameList.splice (index, 1, dst);
		}
	},

	getMatchingControlAttrs : function(ctrlName){
	 	for (var i=0; this.vappgen.completeControls && i < this.vappgen.completeControls.length; i++){
	   		   if (ctrlName == this.vappgen.completeControls[i].name) {
	   			   return this.vappgen.completeControls[i];
	   		   }
  	   	}
  	   	return null;
	},

	isControlSupported : function (controlType) {
		var supported = false;

		for (var i=0; this.vappgen.supportedControls && i<this.vappgen.supportedControls.length; i++){
			var val = this.vappgen.supportedControls[i];
			if (controlType == val) {
				supported = true;
				break;
			}
		}

		return supported;
	},

	resetControlCache : function() {
		var c = this;
		$.each(c.controls, function(i, ctrl) {
			if ("function" == typeof ctrl.resetControlCache) {
				ctrl.resetControlCache();
			}
		});
	},
	
	resetControlChangedState : function() {
		var c = this;
		$.each(c.controls, function(i, ctrl) {
			if ("function" == typeof ctrl.resetControlChangedState) {
				ctrl.resetControlChangedState();
			}
		});
	}
	
});


/*Screen.prototype.addControl=function(ctrl) {
	this.controls=ctrl;
};

Screen.prototype.renderContainer=function(ctrl) {
	return this.el;
};
Screen.prototype.render=function() {
	$.each(this.controls, function(i, ctrl) {
		if ("function" == typeof ctrl.render) {
			ctrl.render();
		}
	});
};

Screen.prototype.renderLayout=function() {

	var el=this.renderContainer();
	$.each(this.controls, function(i, ctrl) {
		if ("function" == typeof ctrl.renderLayout) {
			el.append(ctrl.renderLayout());
		}
	});
};


Screen.prototype.setXfilter=function(Xfilter) {
	this.Xfilter=Xfilter;
};

Screen.prototype.getXfilter=function() {
	return this.Xfilter;
};

Screen.prototype.setVappData=function(vappData) {
	this.vappData=vappData;
};

Screen.prototype.getVappData=function() {
	return this.vappData;
};*/



var RegularScreen = Screen.extend({
	setDesignerData: function(data) {
		this.designerData= data;
	},
	getDesignerData: function() {
		return this.designerData;
	}
});

/*var RegularScreen=function(){

};

RegularScreen.prototype= new Screen();
*/
