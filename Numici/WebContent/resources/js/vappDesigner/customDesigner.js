/**
 * New node file
 */


var CustomDesigner = function(){
	this.attributes={
			"width":0,
			"height":0,
			"margin-top":0,
			"margin-right":0,
			"margin-bottom":0,
			"margin-left":0
	};
	this.designerData={};
	this.selector=false;
	this.model=null;
};


CustomDesigner.prototype.setModel=function(model){
	this.model = model;
};

CustomDesigner.prototype.getModel=function(){
	return this.model;
};

CustomDesigner.prototype.setSelector= function(selector){
	this.selector = selector;
};

CustomDesigner.prototype.getSelector= function(){
	return this.selector;
};

CustomDesigner.prototype.setAttributes=function(attr){
	var current=this;
	if(typeof attr !== "undefined" && !jQuery.isEmptyObject(attr)){
		$.each(attr,function(key,val){
			current.attributes[key]=val;
		});
	}
};

CustomDesigner.prototype.getAttributes= function(){
	return this.attributes;
};

CustomDesigner.prototype.setDesignerData=function(data){
	this.designerData =data;
};

CustomDesigner.prototype.getDesignerData=function(){
	return this.designerData;
};

CustomDesigner.prototype.showDesigner=function(){
	
};

CustomDesigner.prototype.setBlockDefinitions=function(blockdef){
	this.blockDef = blockdef;
};

CustomDesigner.prototype.getBlockDefinitions=function(blockdef){
	return this.blockDef;
};

CustomDesigner.prototype.setActions= function(actions){
	this.actions= actions;
};

CustomDesigner.prototype.getActions= function(actions){
	return this.actions;
};

