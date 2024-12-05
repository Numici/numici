var CompositeFilterDesigner =function(){
	this.blockDef=null;
};

CompositeFilterDesigner.prototype = new CustomDesigner();

CompositeFilterDesigner.prototype.setBlockDefinitions=function(blockdef){
	this.blockDef = blockdef;
};

CompositeFilterDesigner.prototype.getBlockDefinitions=function(){
	return this.blockDef;
};