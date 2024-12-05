/**
 * New node file
 */


var GroupControlContainer = ContainerControl.extend({
	constructor: function(){
		ContainerControl.apply(this,arguments);
		this.controlType = "GroupControl";	
	},
	render:function(){
		ContainerControl.prototype.render.apply(this);
	},
	
	renderLayout : function() {
		ContainerControl.prototype.renderLayout.apply(this);
		var c = this;
	//	var el = c.el;
		$.each(this.controls, function(i, ctrl) {
			c.addCtrlTOGrid(ctrl);
			if ("function" == typeof ctrl.renderLayout) {
				ctrl.renderLayout();
			}
		});
	},
	
});
