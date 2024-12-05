var CompositeChartDesigner =function(){
	this.blockDef=null;
};

CompositeChartDesigner.prototype = new CustomDesigner();

CompositeChartDesigner.prototype.setBlockDefinitions=function(blockdef){
	this.blockDef = blockdef;
};

CompositeChartDesigner.prototype.getBlockDefinitions=function(){
	return this.blockDef;
};