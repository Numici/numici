

var ChartControl = Control.extend({
	renderLayout : function(){
		var el=this.renderContainer();		
		var mode=this.getMode();
		
		Control.prototype.renderLayout.call(this);
		if (mode == "design") {
			var id = this.id;
			var parent = this.getParent();
			var exists = parent.el.find("#"+id);
			
			if (exists.length == 0) {
				parent.el.append(el);
			} 	
			
		} else {
			return el;
		}
	}
});
