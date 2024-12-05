

var VidiViciControl = Control.extend({
	
	constructor:function(){
		Control.apply(this,arguments);
		//this.designerData=null;
	},
	
	setDesignerData: function(data) {
		this.designerData= data;
	},
	getDesignerData: function() {
		return this.designerData;
	}
});


/*var VidiViciControl = function(){
	this.designerData=[];
};

VidiViciControl.prototype = new Control();

VidiViciControl.prototype.setDesignerData= function(data){
	this.designerData= data;
};

VidiViciControl.prototype.getDesignerData= function(){
	return this.designerData;
};

VidiViciControl.prototype.render=function(){
	
};
*/

