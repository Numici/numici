
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
		
		this.controlType = "ScreenControl";
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

	render : function(controls) {
		if ( controls && controls.length > 0 ) {


		} else {
			$.each(this.controls, function(i, ctrl) {
				if ("function" == typeof ctrl.render) {
					if(ctrl.mode !== "design"){
						ctrl.mode = "run";
					}
					ctrl.render();
					ctrl.isRendered = true;
				}
			});
		}
	},
	
	getMaxOfArray : function (numArray) {
		  return Math.max.apply(null, numArray);
	},
		
	setIndex: function (index) {
		this.index = index;
	},
	
	getIndex: function () {
		return this.index;
	},
	
	initialize:function(options) {
		var c = this;
		ContainerControl.prototype.initialize.apply(this, [options]);
	
		//c.setMode ("design");
		c.setScreen(c);
		c.setWidth(c.el.width());
		c.setHeight(c.el.height());
		c.setAppData();
		c.el.data ("ctrlObj", c);	
	},


	
	
	removeFromGrid : function(ctrl) {
		var c = this;
		if (c.appGrid && !ctrl.isRendered) {
			c.appGrid.remove_widget(ctrl.el,true);
		}
	},
	
	renderLayout : function() {
		
		var c = this;
		$.each(this.controls, function(i, ctrl) {
			c.addCtrlTOGrid(ctrl);
			if ("function" == typeof ctrl.renderLayout) {
				var attr = ctrl.attributes;
				if(ctrl.controlType == "GroupControl") {
					ctrl.grid_width = attr.w;
					ctrl.isStaticGrid = true;
				}
				ctrl.renderLayout();
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
		var index= -1, c = this;
		var curCtrl=null;
 
		for (var i=0; i <c.controls.length; i++) {
			curCtrl = c.controls[i];
			if (curCtrl.getId() == id) {
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
			//c.el.find(".grid-stack-placeholder").hide();
		}
		
 
		if (index != -1 && curCtrl) {
			var loc = c.uniqueNameList.indexOf(curCtrl.getName());
			c.uniqueNameList.splice (loc, 1);		 
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
