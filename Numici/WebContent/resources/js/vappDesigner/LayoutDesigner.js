/**
 * New node file
 */

var LayoutDesigner =function(){
	this.blockDef=null;
};

LayoutDesigner.prototype = new CustomDesigner();

LayoutDesigner.prototype.setBlockDefinitions=function(blockdef){
	this.blockDef = blockdef;
};

LayoutDesigner.prototype.getBlockDefinitions=function(){
	return this.blockDef;
};

LayoutDesigner.prototype.showDesigner=function(){
	
	var selector = this.getSelector();
	var model = this.getModel();
	var blocks=this.getBlockDefinitions();
	var designerData = this.getDesignerData();
	var attr = this.getAttributes();
	var options ={};
	options.model=model;
	options.blockDef=blocks;
	options.selector=selector;
	var layoutControl = new LayoutControl(options);
	if(typeof attr !== "undefined" && !jQuery.isEmptyObject(attr)){
		layoutControl.addAttributes(attr);
	}
	if(typeof designerData !== "undefined" && !jQuery.isEmptyObject(designerData)){
		layoutControl.setDesignerData(designerData);
	}
	layoutControl.LaunchControl();
};

LayoutDesigner.prototype.getJson=function(){
	var selector = this.getSelector();
	var model = this.getModel();
	var options ={};
	options.model=model;
	options.selector=selector;
	var layoutControl = new LayoutControl(options);
	var designerData= layoutControl.saveControl();
	console.log(JSON.stringify(designerData,2));
	return designerData;
};