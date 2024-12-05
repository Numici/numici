/**
 * New node file
 */

var MenubarDesigner =function(){
	this.actions=null;
};

MenubarDesigner.prototype = new CustomDesigner();

MenubarDesigner.prototype.setActions= function(actions){
	this.actions= actions;
};

MenubarDesigner.prototype.getActions= function(actions){
	return this.actions;
};

MenubarDesigner.prototype.showDesigner=function(){
	var selector = this.getSelector();
	var model = this.getModel();
	var designerData = this.getDesignerData();
	var attr = this.getAttributes();
	var actions = this.getActions();
	
	var options ={};
	options.model=model;
	options.selector=selector;
	options.actions=actions;
	
	var menubarControl = new MenubarControl(options);
	if(typeof attr !== "undefined" && !jQuery.isEmptyObject(attr)){
		menubarControl.addAttributes(attr);
	}
	if(typeof designerData !== "undefined" && !jQuery.isEmptyObject(designerData)){
		menubarControl.setDesignerData(designerData);
	}
	menubarControl.LaunchControl();
	
};

MenubarDesigner.prototype.getJson=function(){
	var selector = this.getSelector();
	var model = this.getModel();
	var options ={};
	options.model=model;
	options.selector=selector;
 
	var menubarControl = new MenubarControl(options);
	var designerData= menubarControl.saveControl();
	console.log(JSON.stringify(designerData,2));
 
	return designerData;
};