/*
 * JS functions to manipulate the VAppgen Draw area to model a view for VApp process.
 */

var VAppgenState = {"ReadyToInit":0, "Initialized":1, "UnderProcess":2, "ReadyToSave":3, "Saved":4};

var VAppgenEngine = function() {
	this.ActiveScreen;
	this.Screens = [];
	this.index=0;
	this.ScrnNames = [];
		
	var _diagnostics = function (obj) {
        var json = obj.toJSON();
        console.log(json);
    };    
    
    this.getUserInfoFromVApp = function (vapp) {
    	var usrInfo = {};
    	
    	usrInfo.Organization = vapp["organizationName"];
		usrInfo.UserId = vapp["analystId"];
		usrInfo.UserName = vapp["analystName"];
		
    	return usrInfo;
    };
    
	this.createScreen = function(containerDiv, modelId, usrInfo, vappName, model, vappgen) {
		var scrnType = "Regular";
	 
		var options={};
	
		options.el=$(containerDiv);
		options.model = model;
		options.vappgen = vappgen;
	
		var screen = ScreenFactory.createInstance(scrnType, options);
		screen.mode = "design";
		screen.initialize();
		screen.setVappStates (VAppgenState);
		screen.setState(VAppgenState.Initialized);
		screen.setDefaultWidth(containerDiv.width());
		screen.setDefaultHeight(containerDiv.height());
		var scrnName = containerDiv.attr('id');
		screen.setId(scrnName);
		screen.setName(scrnName);
	//	this.ScrnNames.push(scrnName);
		$("#vAppScreenName").val(scrnName);
		this.index++;
		screen.setIndex(this.index);
		screen.vappgenEngine = this;
		
		// Assign default parameters to screen definition
		this.AppName = vappName;
		this.ModelID = modelId;
				
		this.organizationName = usrInfo.Organization;
		this.UserId = usrInfo.UserId;
		this.UserName = usrInfo.UserName;
				 
		this.Screens.push(screen);
		this.VAppState = VAppgenState.UnderProcess;			   
		
		return screen;
	};
	
	this.activateScreen = function(index){
		this.ActiveScreen = index;
	};	
	
	this.clearScreen = function () {
		var scrn = this.Screens[this.ActiveScreen];

		scrn.deleteScreen();		
	};
	
	this.getControlName = function (control) {
		var ctrlObj = control.data('ctrlObj');
		
		return ctrlObj.getName();
	};
	
	this.getTaggedObject = function (control) {
		var ctrlObj = control.data('ctrlObj');
		if (ctrlObj == null || ctrlObj === "undefined"){
			return null;
		}
		
		var taggedObject = {};
		
		taggedObject["TopObjectType"] = "Vapp";
		taggedObject["FQN"] = ctrlObj.getObjectId();
		taggedObject["Type"] = ctrlObj.getControlType();
		taggedObject["TopObjectId"] = this.vappID;
		
		return taggedObject;		
	};
	
	this.deleteControl = function (control) {
		var ctrlObj = control.data('ctrlObj');
		
		// In case of filter control, remove from it's container filter list.
		if (ctrlObj.getControlType() == "CompositeFilter"){
			ctrlObj.removeFilter(ctrlObj.getName());
		} else {
			ctrlObj.resetFilterControl();
		}
	
		var screen = ctrlObj.screen;		
		if (screen && screen.appGrid) {
			screen.appGrid.remove_widget(ctrlObj.el,true);
		}
		//ctrlObj.el.remove();
		ctrlObj.parent.deleteControlById (ctrlObj.getId());		
	};
	
	this.getControlAttributes = function (div) {		
		var ctrlObj = div.data('ctrlObj');
		var ctrlAttrs = ctrlObj.getVappgenAttributes();
		
		return ctrlAttrs;		
	};
	 
	this.showControlProperties = function (div) {
		var ctrlObj = div.data('ctrlObj');
		ctrlObj.getControlPropertiesFromUser();
		
		return;
	};
	
	this.getControlAttributeValue = function (div, key) {		
		var ctrl = div.data('ctrlObj');
		var attrs = ctrl.getAttributes();
	
		if (key == "name") {
			return ctrl.getName();
		}
		
		return attrs[key];		
	};
	 
	this.updateControlAttributes = function (div, attrs){
		var ctrl = div.data('ctrlObj');
		var props = ctrl.getAttributes();
	
		// Update Filter's designer data based on change in control name
		if (ctrl.isFilterable && ctrl.getName() != attrs.name) {
			var parent = ctrl.getParent();
			while (parent){
				var filters = parent.getFilters();
				for (var i=0; filters && i<filters.length; i++){
					var filterCtrl = parent.getChildControlByName(filters[i]);
					if (filterCtrl){
						if (filterCtrl.singleControlFilterMode){
							filterCtrl.singleControlFilterName = attrs.name; 
						}
						filterCtrl.updateControlNameInDesignerData(ctrl.getName(), attrs.name);
					}					
				}
				parent = parent.getParent();
			}			
		}
		
		// Update Filter's designer data based on change in filterable option.
		var orgAttrs = ctrl.getAttributes();
		if (ctrl.isFilterable && orgAttrs.filterable != attrs.filterable){
			var parent = ctrl.getParent();
			while (parent){
				var filters = parent.getFilters();
				for (var i=0; filters && i<filters.length; i++){
					var filterCtrl = parent.getChildControlByName(filters[i]);					
					if (filterCtrl){
						filterCtrl.removeControlFromDesignerData(ctrl.getName());					
					}
				}
				parent = parent.getParent();
			}
		}
		
		$.each(attrs, function(key, val){
	 	 	if (key == "name") {
			 		ctrl.setName(val);
			} else if (val != "NONE"){
		 		props[key] = val;
		 	}	
		});
		
		ctrl.setAttributes(props);	
		ctrl.setControlUpdated (true);
	};
	 
	
	var  _getControlProperty = function (props, key) {
		for (var i=0; i<props.attributes.length; i++){
			if (props.attributes[i].name == key)
				return props.attributes[i];
		}
		return null;
	};
	
	this.refreshControl = function (div) {
	 	var ctrl = div.data('ctrlObj');
 
		ctrl.renderLayout();
		ctrl.render();
	};
	
	var  _getMenuBarItems = function () {
		var div = $("#vappgen-scrn-toolBar");
		var btns = div.find('input[type="checkbox"]');
		var list = [];
		
		for (var i=0; btns && i<btns.length; i++){
			var obj={};
			var role=$(btns[i]).attr('role');
			var status=$(btns[i]).is(':checked');
			obj["role"]=role;
			obj["required"]=status;
			list.push(obj);
		}
		
		return list;
	};
	
	var  _setMenuBarItems = function (items, scrnName) {		
		var div = $("#vappgen-scrn-toolBar");
		var btns = div.find('input[type="checkbox"]');
		
		for (var i=0; items && i<items.length; i++){
			var role = items[i].role;
			var status = items[i].required;
			var str = "input[role="+role+"]";
			
			div.find(str).prop('checked', status);					
		}
		
		$("#vAppScreenName").val(scrnName);
		 
	};	
		
	this.createJSONObject = function (vAppName) {		
		 var json = {};
		 
		 json["organizationName"] = this.organizationName;
		 json["analystId"] = this.UserId;
		 json["analystName"] = this.UserName;
		 json["appName"] = vAppName;
		 json["modelId"] = this.ModelID;
		 json["id"] = this.vappID;
		 json["createdOn"] = this.createdOn;
		 
		 json.screens = [];

		 for (var i=0; i<this.Screens.length; i++){
			 var curScrn = this.Screens[i];
			 var scrnJson = curScrn.getJson();
						 
			 scrnJson["menuItems"] = _getMenuBarItems ();
			 json.screens.push(scrnJson);
			 curScrn.setState(VAppgenState.ReadyToSave);	 
		 }
		
		 return json;		 
	 };
	 
	 this.createVAppJSON = function (vAppName) {		
		 var json = {};
		 
		 json["organizationName"] = this.organizationName;
		 json["analystId"] = this.UserId;
		 json["analystName"] = this.UserName;
		 json["appName"] = vAppName;
		 json["modelId"] = this.ModelID;
		 json["id"] = this.vappID;
		 json["createdOn"] = this.createdOn;
		 
		 json.screens = [];

		 for (var i=0; i<this.Screens.length; i++){
			 var curScrn = this.Screens[i];
			 var scrnJson = curScrn.getFinalJson();						 
			 scrnJson["index"]=i+1;
			 json.screens.push(scrnJson);
			 curScrn.setState(VAppgenState.ReadyToSave);	 
		 }
		
		 this.VAppState = VAppgenState.ReadyToSave;		 
		 return json;		 
	 };
	 
	 this.createEmptyJSONObject = function () {		
		 var json = {};
	
		 json["organizationName"] = this.organizationName;
		 json["analystId"] = this.UserId;
		 json["analystName"] = this.UserName;
		 json["appName"] = null;
		 json["modelId"] = this.ModelID;
		 json["id"] = null;
		 json["createdOn"] = this.createdOn;
		 
		 json.screens = [];

	 	 return json;		 
	 };
	 
	 this.createScreenJSON = function (scrnIndex, screenName) {
		 var curScrn = this.Screens[scrnIndex];
		 curScrn.setName(screenName); // set the screen name
	 	 var scrnJson = curScrn.getJson();
	 	 
	 	 var location = this.ScrnNames.indexOf(screenName);
	 	 if (location == -1) {
	 		 this.ScrnNames.splice (location, 1);
	 		 this.ScrnNames.push(screenName); 		 
	 	 }
 	 
		 scrnJson["menuItems"] = _getMenuBarItems ();
		 curScrn.setFinalJson(scrnJson);
		 curScrn.setState(VAppgenState.ReadyToSave);	
		 
		 var state=false;
		 for (var i=0; i<this.Screens.length; i++) {
			 status = false;
			 var scrn=this.Screens[i];
			 if (scrn.getState() == VAppgenState.ReadyToSave) {
				 state=true;				 
		 	} else {		 		
		 		break;
		 	}			
		 }
		 
		 if (state) {
			 this.VAppState =  VAppgenState.ReadyToSave;
		 }
		 
		 return scrnJson;
	 };
	 
	 this.validateJSONObject = function (json) {		 
		var err = {};
	
		err.status = true;
	 
		/*
		 * TODO 
		 * update the more logic for validation 
		 * Currently validates single screen controls.
		 *	Need to add the multi screen control validations
		 * based on requirments.
		 */
		if (json.screens.length == 0) {
			err.status = false;
			err.msg = "No screens in Vapp";
			return err;
		} 
		
		return err;
	 };
	 
	 this.setVAppgenState = function (state){		 		 
		this.VAppState = state;		 
	 };
	 
	 this.getVAppgenState = function () {		 
		 return this.VAppState;
	 };
	 
	 var createControls=function(controls, parent){
		var ctrlObj=[];
		if (parent.getControlType() == "ScreenControl"){
			this.curScreen = parent;
		}
		var c = this;	
		$.each(controls,function(key,val){
			var ctrl = ControlFactory.createInstance(val.controlType);
			ctrl.setMode("design");
			ctrl.setControlType(val.controlType);
			ctrl.setScreen(c.curScreen);
			ctrl.setControlUpdated (false);
			ctrl.setObjectId(val.id);
		 
			if (val.name){
				ctrl.setName(val.name);
			}
			ctrl.addAttributes(val.attributes);
		 	if (val.designerData) {
				ctrl.setCustomDesignerData(val.designerData);
			}
		 	if (val.controlType == "GroupControl") {
		 		ctrl.grid_width = val.attributes.w;
		 		ctrl.isStaticGrid = true;
		 	}
			ctrl.initVappControl (parent, val.controlType, null);
			ctrl.initFilterControl(parent, val.controlType);
				
			if(val.controls){			
				var children=createControls(val.controls, ctrl);
				ctrl.addControl(children);
			}
			ctrlObj.push(ctrl);
		});
		return ctrlObj;
	};
		
	this.renderVApp = function (vapp) {		 
		for (var i=0; vapp.screens && i<vapp.screens.length; i++){
			var scrn =  vapp.screens[i];
 
			var scrnObj = this.Screens[i];
			scrnObj.setObjectId (scrn.id);
			var scrnName;
			if (scrn.name == null) {
				scrnName = "Screen-"+(i+1);				 
			} else {
				scrnName = scrn.name;
			}
			scrnObj.setName(scrnName);
			this.ScrnNames.push(scrnName);
		 
			if (scrn.controls && scrn.controls.length) {
				var ctrls = createControls(scrn.controls,scrnObj); 
	 
				_setMenuBarItems(scrn.menuItems, scrn.name);
				scrnObj.addControl(ctrls);				
			}	
			var json = scrnObj.getJson();				 
			json["menuItems"] = scrn.menuItems;
			scrnObj.setFinalJson(json);
		 }		 
		
	};
	 
	this.renderCurentScreen = function () {
		 var curScrn = this.Screens[this.ActiveScreen];
		 var scrn =  curScrn.getFinalJson();			
		
		 if (scrn && scrn.controls && scrn.controls.length) {
			var ctrls = createControls(scrn.controls, curScrn); 
	 
			_setMenuBarItems(scrn.menuItems, scrn.name);
			curScrn.addControl(ctrls);
		 }		
	 };
	 
	 this.setVAppID = function (vapp_id) {
		 this.vappID = vapp_id;
	 };
	 
	 this.getVAppID = function () {
		 return this.vappID;
	 };
	 
	 this.setVAppCreatedDate = function (date) {
		 this.createdOn = date;
	 };
	 
	 this.getVAppCreatedDate = function () {
		 return this.createdOn;
	 };
	 
	 this.getCustomDesigner = function (div){
		 var ctrl = div.data('ctrlObj');
		 
		 return (ctrl.getCustomDesigner());		
	 };
	 
	 this.setCustomDesignerData = function (div, designerData){
		 var ctrl = div.data('ctrlObj');
		 
		 return (ctrl.setCustomDesignerData(designerData));		
	 };
	 
	 this.getCustomDesignerData = function (div){
		 var ctrl = div.data('ctrlObj');
		 
		 return (ctrl.getCustomDesignerData());		 
	 };
	 
	 this.setBlockDefinitions = function (div, blockDef) {
		 var ctrl = div.data('ctrlObj');
		 
		 ctrl.setBlockDef (blockDef);
	 };
	 
	 this.getBlockDefinitions = function (div) {
		 return (ctrl.getBlockDef());
	 };
	 
	 this.refreshAllControls = function (ctrls) {
		 for (var i=0; i<ctrls.length; i++){
			 this.refreshControl(ctrls[i]);
		 }
	 };
	 
	 this.alignControls = function (ctrls, action){
		 if (ctrls.length == 0)
			 return;
		 
		 var refObj = ctrls[0].data('ctrlObj');
	
		 for (var i=1; i<ctrls.length; i++){
			 var obj = ctrls[i].data('ctrlObj');
			 var val = null;
			 
			 switch (action) {
			 case "hTop":
				 obj.attributes.top = refObj.attributes.top;
				 break;
			 case "hMiddle":
				 val = parseFloat(refObj.attributes.top) + parseFloat(refObj.attributes.height/2) - parseFloat(obj.attributes.height/2);
				 obj.attributes.top = val.toString();				  
				 break;
			 case "hBottom":
				 val = parseFloat(refObj.attributes.top) + parseFloat(refObj.attributes.height) - parseFloat(obj.attributes.height);
				 obj.attributes.top = val.toString();				  
				 break;			
			 case "vLeft":				 
				 obj.attributes.left = refObj.attributes.left;			 
				 break;
			 case "vCenter":
				 val = parseFloat(refObj.attributes.left) + parseFloat(refObj.attributes.width/2) - parseFloat(obj.attributes.width/2);
				 obj.attributes.left = val.toString();
				 break;
			 case "vRight":
				 val = parseFloat(refObj.attributes.left) + parseFloat(refObj.attributes.width) - parseFloat(obj.attributes.width);
				 obj.attributes.left = val.toString();
				 break;				 
			 }			 		
		 }		 
		 this.refreshAllControls (ctrls);		 
	 };
	 
	 this.getUniqueName = function (div) {
		 var ctrl = div.data('ctrlObj');
	 
		 return (ctrl.getUniqueName());		
	 };
	 
	 this.resetControlChangedState = function () {
		 var scrn = this.Screens[this.ActiveScreen];
		 scrn.resetControlChangedState ();		 
	 };
	
	 this.setScreenDimensions = function (vapp, containerDiv) {
		 if (!vapp.screens)
			 return;
		 
		 var screen = vapp.screens[this.ActiveScreen];
		 
		 if (screen.width == 0 && screen.height == 0) {
			 var s = this.Screens[this.ActiveScreen];
			 containerDiv.width(s.getDefaultWidth());
			 containerDiv.height(s.getDefaultHeight());
		 } else {
			 var s = this.Screens[this.ActiveScreen];
			 s.setWidth(screen.width);
			 s.setHeight(screen.height);
			 containerDiv.width(screen.width);
			 containerDiv.height(screen.height);
		 }
		 
	 };
	 
	 this.getTotalScreens = function () {		 
		 return this.Screens.length;
	 };
	 
	 this.getCurScreenState = function (scrnIndex) {
		 var index = this.ActiveScreen;
		 
		 return this.Screens[index].getState();
	 };
	 
	 this.setCurScreenState = function (state) {
		 var index = this.ActiveScreen;
		 
		 this.Screens[index].setState(state);
	 };
	 
	 this.setScreenState = function (index, state) {
		 this.Screens[index].setState(state); 
	 };
	 
	 this.getScreenState = function (index) {
		 return this.Screens[index].getState();
	 };
	 
	 this.getCurrentScreenIndex = function () {
	 	 var index = this.ActiveScreen;
		 var curScrnId = this.Screens[index].getId();
		 var scrnIndex = -1;
		 
		 for (var i=0; i<this.Screens.length; i++){
			 var id = this.Screens[i].getId();
			 if (id == curScrnId) {
				scrnIndex = i; 
				break;  
			 }
		 }
		 
		 return scrnIndex;
	 };
	 	 
	 this.getScreenIndexById = function (curScrnId) {
	 	  var scrnIndex = -1;
		 
		 for (var i=0; i<this.Screens.length; i++){
			 var id = this.Screens[i].getId();
			 if (id == curScrnId) {
				scrnIndex = i; 
				break;  
			 }
		 }
		 
		 return scrnIndex;
	 };
	 this.removeCurrentScreen = function () {
		 var index = this.ActiveScreen;
		 var curScrn = this.Screens[index];
		 		 
		 var name = curScrn.getName();
		 var delScrnIndex = this.ScrnNames.indexOf(name);
		 this.ScrnNames.splice (delScrnIndex, 1);
		 
		 this.Screens.splice (index, 1);		 
		 return true;
	 };
	 
	 this.getScreenId = function (index) {
		return this.Screens[index].getId(); 
	 };
	 
	 this.getScreenSeqNumber = function (index) {
		var scrn = this.Screens[index];
		return scrn.getIndex();
	 };
	 
	 this.getNewSequenceNumber = function () {
		 var index = this.index+1;
		 var scrnName = "screen-"+(index);
		 
		 while (this.ScrnNames.indexOf(scrnName) != -1) {
			 index++;
			 scrnName = "screen-"+(index);
		 }
		 
		 return index;
	 };
	 
	 this.reorderScreens = function (scrnsOrder) {
		var newScreens = [];
	
		for (var i=0; i<scrnsOrder.length; i++) {
			newScreens.push(this.Screens[scrnsOrder[i]]);
		}
		
		this.Screens = newScreens;
	 };
	 
	 this.getScreenName = function (index) {
		 return this.Screens[index].getName();
	 };
	 
	 this.renderScreenMebuBar = function (scrnIndex) {
 		 var curScrn = this.Screens[scrnIndex];
		 var scrn =  curScrn.getFinalJson();	

		 _setMenuBarItems(scrn.menuItems, scrn.name);		 
	 };
	 
	 this.isUniqueScreenName = function (scrnIndex, screenName) {
		 var curScrn = this.Screens[scrnIndex];
		 var name = curScrn.getName();
		 var status = false;
		 
		 if (name == screenName) {
			 status = true; 
		 } else if ((this.ScrnNames.indexOf(screenName) == -1)) {
			 status =  true;			 		
		 }
		 
		 return status;		
	 };
	 
	 this.updateScreenName = function (scrnIndex, screenName) {
		 var curScrn = this.Screens[scrnIndex];
		 var curName = curScrn.getName();
	 
		 if (curName == screenName)
			 return;
		 
		 curScrn.setName(screenName);
		 var index = this.ScrnNames.indexOf(curName);
		 if (index != -1) {
			 this.ScrnNames.splice(index, 1, screenName);
		 }
	 };
	 
	 this.cloneVAppScreen = function (fromScrnIndex, toScrn) {
		 var toScrnIndex = this.getScreenIndexById(toScrn.getId());
		 var fromScrn = this.Screens[fromScrnIndex];
				 
		 var toScrnName = "CopyOf_"+fromScrn.getName();		 
		 toScrn.setName(toScrnName);
		 this.ScrnNames.push(toScrnName);
	 
		 if (fromScrn.controls && fromScrn.controls.length) {
			 var ctrls = createControls(fromScrn.controls, toScrn); 
			 
			_setMenuBarItems(fromScrn.menuItems, toScrnName);
			toScrn.addControl(ctrls);
		 }
				
		 var json = toScrn.getJson();				 
		 json["menuItems"] = fromScrn.menuItems;
		 toScrn.setFinalJson(json);
		 
		 // Swap from from and two screens.
		 this.Screens.splice(toScrnIndex, 1);
		 this.Screens.splice(fromScrnIndex+1, 0, toScrn);
		
	 };
	 
	 
	 this.getBoundaries = function(controls) {
		 var boundary = {};
		 var x = [], y = [],xw=[],yh=[];
		 $.each(controls,function(i,ctrl){
			
			 var ctrlObj = $(ctrl).data("ctrlObj"); 
			 if (ctrlObj) {
				 var attr = ctrlObj.attributes;
				 x.push(attr.x);
				 y.push(attr.y);
				 xw.push(attr.x+attr.w);
				 yh.push(attr.y+attr.h);
				 ctrlObj._OrgCords = {"x":ctrlObj.attributes.x,"y":ctrlObj.attributes.y};
			 }
			 
		 });
		 
		 var minX = _.min(x);
		 var maxXW = _.max(xw);
		 var minY = _.min(y);
		 var maxYH = _.max(yh);
		 boundary.position = {"x":minX,"y":minY};
		 boundary.dimensions = {"w":maxXW-minX,"h":maxYH-minY};
		
		 return boundary; 
	 };
	 
	 this.groupControls = function (controls) {
		 var bound = this.getBoundaries(controls);
		 var index = this.ActiveScreen;
		 var curScrn = this.Screens[index];
		 var parent = $(controls[0]).parent();
		 var parentType = parent.data("ctrlObj").getControlType();
		 if (parentType != "ScreenControl") {
			 console.log ("Invalid parent type in grouping: "+parentType);
			 return;
		 }
		 
		 var controlType = "GroupControl";
		 var groupCtrl = ControlFactory.createInstance(controlType);	
		 groupCtrl.setMode("design");
		 groupCtrl.grid_width = bound.dimensions.w;
		 groupCtrl.isStaticGrid = true;
		 groupCtrl.initVappControl (curScrn, controlType, bound.position, bound.dimensions);
		 groupCtrl.initFilterControl(curScrn, controlType);
		
		 $.each(controls,function(i,ctrlData){ // ctrlData is div
			 var ctrl = $(ctrlData).data("ctrlObj");			
			 var div = $('<div class="vdvcCtrl grid-stack-item"></div>');
			 div.attr("id",ctrl.getId());
			 ctrl.el = div;
			 ctrl.isRendered = false;
			 div.data("ctrlObj",ctrl);
			 groupCtrl.controls.push(ctrl);
			 
			 ctrl.parent.deleteControlById(ctrl.getId());
			 ctrl.parentType = groupCtrl.getControlType();
		     ctrl.setParent(groupCtrl); 
			 var nx = ctrl._OrgCords.x - bound.position.x;
			 var ny = ctrl._OrgCords.y - bound.position.y;
			 var position = {"x":nx, "y":ny};
			 var dimensions = {"w":ctrl.attributes.w, "h":ctrl.attributes.h};
			 var ctrlGrid = groupCtrl.appGrid;
			
			 ctrlGrid.add_widget(div, position.x, position.y, dimensions.w, dimensions.h);
			 
						 
		/* 
			 var ctrlObj = $(ctrl).data("ctrlObj");
			 ctrlObj.isRendered = false;
			 var id = $(ctrl).attr("id");
			 var ctrlDiv = $('<div class="vdvcCtrl grid-stack-item"></div>');
			 ctrlDiv.attr("id",id);
		//	 ctrlDiv.setId (id);
			 ctrlDiv.data("ctrlObj",ctrlObj);
			 ctrlObj.el = ctrlDiv;
			 groupCtrl.controls.push(ctrlObj);
			 
		    // ctrlObj.resetFilterControl();
		     ctrlObj.parent.deleteControlById(ctrlObj.getId());
		     ctrlObj.parentType = groupCtrl.getControlType();
		     ctrlObj.setParent(groupCtrl); 
		     ctrlObj.initFilterControl ();
		
		     var ctrlGrid = groupCtrl.appGrid;
		     
			 var nx = ctrlObj._OrgCords.x - bound.position.x;
			 var ny = ctrlObj._OrgCords.y - bound.position.y;
			 ctrlGrid.add_widget(ctrlDiv,nx, ny, ctrlObj.attributes.w, ctrlObj.attributes.h);
		  */
			 
		 });		
		
	 };
	 
	 this.ungroupControls = function (grpControl) {		 
		 var index = this.ActiveScreen;
		 var curScrn = this.Screens[index];
	 	 var grid = curScrn.appGrid;
		 var grpObj =  grpControl.data("ctrlObj");
		 if (grpObj.getControlType() != "GroupControl") {
			 console.log ("Invalid control selected to ungroup: "+grpObj.getControlType());
			 return;
		 }
		 var controls = grpObj.controls;
		 
		 curScrn.deleteControlById(grpObj.getId()); 
		 grpObj.appGrid.destroy();
		 
		 $.each(controls, function(i, ctrlData){ // ctrlData is the actual data, not div
			 var ctrl = ctrlData;
			 var div = $('<div class="vdvcCtrl grid-stack-item"></div>');
			 div.attr("id",ctrl.getId());
			 ctrl.el = div;
			 ctrl.isRendered = false;
			 div.data("ctrlObj",ctrl);
			 curScrn.controls.push(ctrl);
			 
			 ctrl.parent.deleteControlById(ctrl.getId());
			 ctrl.parentType = curScrn.getControlType();
		     ctrl.setParent(curScrn); 
			 
			 var position = {"x":grpObj.attributes.x+ctrl.attributes.x,"y":grpObj.attributes.y+ctrl.attributes.y};
			 var dimensions = {"w":ctrl.attributes.w,"h":ctrl.attributes.h};
			
			 grid.add_widget(div, position.x, position.y, dimensions.w, dimensions.h);
			 
		/* 
			 
			// var ctrlObj = $(ctrl).data("ctrlObj");
			 var ctrlObj = ctrl;
			 ctrlObj.isRendered = false;
			 var id = ctrlObj.el.attr("id");
			 var ctrlDiv = $('<div class="vdvcCtrl grid-stack-item"></div>');
			 ctrlDiv.attr("id",id);
			 ctrlDiv.data("ctrlObj",ctrlObj);
			 ctrlObj.el = ctrlDiv;
			 
			 
			 curScrn.controls.push(ctrlObj);
			 
		    // ctrlObj.resetFilterControl();
		     ctrlObj.parent.deleteControlById(ctrlObj.getId());
		     ctrlObj.parentType = curScrn.getControlType();
		     ctrlObj.setParent(curScrn); 
		     ctrlObj.initFilterControl ();
			
		     grid.add_widget(ctrlDiv,ctrlObj._OrgCords.x, ctrlObj._OrgCords.y, ctrlObj.attributes.w, ctrlObj.attributes.h); 
		   */   
			 
		 });
		 
		
	
		
	 };
	 return this;
};
